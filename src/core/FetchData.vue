<template>
	<div class="fetch-data" />
</template>

<script>
export default {
	props: [],
	data() {
		return {}
	},
	beforeMount() {
		this.fetchDataSource();
	},
	mounted() {},
	beforeDestroy() {},
	components: {},
	methods: {
		findHead(totalObj) {
			for (let i=0; i<totalObj.length; i++) {
				let bondString = JSON.stringify(totalObj[i]);
				if (bondString.indexOf('發行人') !== -1 && bondString.indexOf('證券名稱') !== -1) {
					return totalObj[i];
				}
			};
		},
		analysisColumn(totalObj) {
			let headObj = this.findHead(totalObj);
			let reverseHeadObj = {};
			for (let key in headObj) {
				reverseHeadObj[headObj[key]] = key;
			}
			for (let key in vuex.csMap) {
				let csObj = vuex.csMap[key];
				let headKey = csObj.head;
				if (headKey) {
					csObj.column = reverseHeadObj[headKey];
				}
			}
			console.log('csMap: ', vuex.csMap);
		},
		convertToDateObject(input) {
			try {
				// 提取日期部分
				const datePart = input.match(/\d+\/\d+\/\d+/)[0];
				// 分割日期為月、日、年
				let [month, day, year] = datePart.split('/');
				// 將年份從兩位數轉換為四位數
				year = parseInt(year, 10) + 2000;
				// 建立一個Date物件
				const date = new Date(year, month - 1, day); // 月份從0開始計算，所以要減1
				return date;
			}catch(err){}
		},
		formatDate(date) {
			if (!date) return;
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份從0開始，所以要加1
			const day = date.getDate().toString().padStart(2, '0');
			return `${year}/${month}/${day}`;
		},
		// 更新填入 bond 資料
		updateBond(bondObj) {
			if (!bondObj || !bondObj.Column11)
				return;
			let csMap = vuex.csMap;
			let bond = {};
			// 將所有資料欄位填入 bond 物件
			for (let key in csMap) {
				if (csMap[key].column) {
					let val = bondObj[csMap[key].column];
					this.setValue({bond, key, val});
				}
			}
			let isin = bondObj[csMap.isin.column];
			if (!bond.isin || bond.isin==='產品代碼')
				return;
			vuex.bondMap[isin] = bond;
			// 到期日 date 物件
			bond.endDate = this.convertToDateObject(bond.name);
			// 到期日 "2024/04/14" 格式
			bond.endDateStr = this.formatDate(bond.endDate);
			// 解析出來的剩餘年
			bond.remainingYears = (bond.endDate - new Date()) / (1000 * 60 * 60 * 24 * 365);
			// 距到期年
			bond.endYear = bond.endYear || bond.remainingYears;
			// 順位
			bond.repaymentOrder = '' + bond.repaymentOrder;
			if (bond.repaymentOrder.indexOf('主順位非優先受償無擔保')!==-1)
				bond.repaymentOrder = '主順位';
			// 用來往下算的剩餘年
			bond.useYear = bond.redemptionYear || bond.endYear;
			// 不往下算
			if (!bond.buyPrice || bond.sellPrice < 20 || bond.buyPrice < 20 || !bond.useYear)
				return;
			// 年折溢價
			bond.plInOneYear = vuex.fn.$safeFloat((bond.buyPrice - 100) / bond.useYear * 2000);
			// 年收益
			bond.incomeInOneYear = vuex.fn.$safeFloat(Number(bond.couponRate)*2000 - bond.buyPrice*2000*vuex.lendingRates/100 - bond.plInOneYear);
			// 年收益負值不往下算
			if (bond.incomeInOneYear < 0) {bond.incomeInOneYear = ''; return;}
			// 年收益率
			bond.incomeInOneYearRate =  vuex.fn.$safeFloat(bond.incomeInOneYear / (bond.buyPrice * 2000) * 100);
			// 最大收益
			bond.maxIncome =  vuex.fn.$safeFloat(bond.incomeInOneYear * bond.useYear);
			// 最大收益%
			bond.maxIncomeRate =  vuex.fn.$safeFloat(bond.incomeInOneYearRate * bond.useYear);
		},
		fetchDataSource() {
			fetch(`./${vuex.isDvm?'dist/':''}data/${vuex.dataSource}.json`).then(res=>res.json()).then(res=>{
				let totalObj = res['熱門債券'];
				console.log('totalObj.length: ', Object.keys(totalObj).length);
				this.analysisColumn(totalObj);
				totalObj.forEach(bondObj=>{
					this.updateBond(bondObj);
				});
				console.log('vuex.bondMap.length: ', Object.keys(vuex.bondMap).length);
				this.fetchDataSource2();
			});
		},
		fetchDataSource2() {
			fetch(`./${vuex.isDvm?'dist/':''}data/${vuex.dataSource2}.txt`).then(res=>res.text()).then(res=>{
				res.split('\n').forEach(line=>{
					let cols = line.split(' ');
					if (cols.length > 10) {
						let bond = vuex.bondMap[cols[0]];
						if (bond) {
							// 可貸成數
							bond.loanRatio = parseFloat(cols.find(o=>o.indexOf('%')!==-1));
							// 可貸成數百分比 (錯幣九折)
							let availableLoadRatio = parseFloat(bond.loanRatio) * 0.9;
							// 可貸金額
							let loadAmount = bond.sellPrice * 2000 * (availableLoadRatio / 100);
							// 本金總金額 = 購買金額 - 可貸金額
							bond.principalTotal = bond.buyPrice * 2000 - loadAmount;
							// 年本金收益%
							bond.capitalIncomeRate = vuex.fn.$safeFloat(bond.incomeInOneYear / bond.principalTotal * 100);
							// 最大本金收益%
							bond.maxCapitalIncomeRate = vuex.fn.$safeFloat(bond.maxIncome / bond.principalTotal * 100);
							// 10年本金收益%
							bond.capitalIncomeRate10Y = vuex.fn.$safeFloat(bond.capitalIncomeRate * Math.min(10, bond.useYear));
							// 15年本金收益%
							bond.capitalIncomeRate15Y = vuex.fn.$safeFloat(bond.capitalIncomeRate * Math.min(15, bond.useYear));
							// 20年本金收益%
							bond.capitalIncomeRate20Y = vuex.fn.$safeFloat(bond.capitalIncomeRate * Math.min(20, bond.useYear));
						}
					}
				});
			});
		},
		setValue({bond, key, val}) {
			bond[key] = val;
			let cso = vuex.csMap[key];
			if (val && cso.isNumber)
				bond[key] = vuex.fn.parseNumberWithParentheses(val);
		},
	},
	watch: {},
	computed: {},
}
</script>

<style scoped>
</style>
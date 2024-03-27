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
			for (let key1 in totalObj) {
				let bigObj = totalObj[key1];
				for (let i=0; i<bigObj.length; i++) {
					let bondString = JSON.stringify(bigObj[i]);
					if (bondString.indexOf('發行人') !== -1 && bondString.indexOf('證券名稱') !== -1) {
						return bigObj[i];
					}
				};
			}
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
		},
		// 更新填入 bond 資料
		updateBond(bondObj) {
			if (!bondObj || !bondObj.Column9)
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
			// 順位
			bond.repaymentOrder = '' + bond.repaymentOrder;
			if (bond.repaymentOrder.indexOf('主順位非優先受償無擔保')!==-1)
				bond.repaymentOrder = '主順位';
			// 無正常買賣價不往下算
			if (bond.sellPrice < 0 || bond.buyPrice < 0)
				return;
			// 年折溢價
			bond.plInOneYear = vuex.fn.$safeFloat((bond.buyPrice - 100) / bond.endYear * 2000);
			// 年收益
			bond.incomeInOneYear = vuex.fn.$safeFloat(Number(bond.couponRate)*2000 - bond.buyPrice*2000*vuex.lendingRates/100 - bond.plInOneYear);
			// 年收益負值不往下算
			if (bond.incomeInOneYear < 0) {bond.incomeInOneYear = ''; return;}
			// 年收益率
			bond.incomeInOneYearRate =  vuex.fn.$safeFloat(bond.incomeInOneYear / (bond.buyPrice * 2000) * 100);
			// 最大收益
			bond.maxIncome =  vuex.fn.$safeFloat(bond.incomeInOneYear * bond.endYear);
			// 最大收益%
			bond.maxIncomeRate =  vuex.fn.$safeFloat(bond.incomeInOneYearRate * bond.endYear);
			let isin = bondObj[csMap.isin.column];
			vuex.bondMap[isin] = bond;
		},
		fetchDataSource() {
			fetch(`./data/金交債0325原.json`).then(res=>res.json()).then(totalObj=>{
				this.analysisColumn(totalObj);
				for (let key1 in totalObj) {
					let bigObj = totalObj[key1];
					bigObj.forEach(bondObj=>{
						this.updateBond(bondObj);
					});
				};
				this.fetchDataSource2();
			});
		},
		fetchDataSource2() {
			fetch(`./data/${vuex.dataSource2}.txt`).then(res=>res.text()).then(res=>{
				res.split('\n').forEach(line=>{
					let cols = line.split(' ');
					if (cols.length > 10) {
						let bond = vuex.bondMap[cols[0]];
						if (bond) {
							// 可貸成數
							bond.loanRatio = cols.find(o=>o.indexOf('%')!==-1);
							// 可貸成數百分比 (錯幣九折)
							let availableLoadRatio = parseFloat(bond.loanRatio) * 0.9;
							// 本金成數百分比
							let principalRatio = 100 - availableLoadRatio;
							// 本金總金額
							bond.principalTotal = bond.buyPrice * 2000 * principalRatio / 100;
							// 年本金收益%
							bond.capitalIncomeRate = vuex.fn.$safeFloat(bond.incomeInOneYear / bond.principalTotal * 100);
							// 最大本金收益%
							bond.maxCapitalIncomeRate = vuex.fn.$safeFloat(bond.maxIncome / bond.principalTotal * 100);
							// 10年本金收益%
							bond.capitalIncomeRate10Y = vuex.fn.$safeFloat(bond.capitalIncomeRate * Math.min(10, bond.endYear));
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
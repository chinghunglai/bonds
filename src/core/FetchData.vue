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
		fetchDataSource() {
			fetch(`./data/${vuex.dataSource}.txt`).then(res=>res.text()).then(res=>{
				res.split('[NEW-LINE]').forEach(line=>{
					let cols = line.split('\t');
					if (cols[1] && cols[2]) {
						let isin = cols[1].trim();
						let bond = {isin};
						this.setValue({bond, key: 'comp', val: cols[2]});
						this.setValue({bond, key: 'name', val: cols[3]});
						this.setValue({bond, key: 'currency', val: cols[4]});
						this.setValue({bond, key: 'sellPrice', val: cols[5]});
						this.setValue({bond, key: 'buyPrice', val: cols[7]});
						this.setValue({bond, key: 'yield', val: cols[16]});
						this.setValue({bond, key: 'redemptionYear', val: cols[17]});
						this.setValue({bond, key: 'endYear', val: cols[18]});
						this.setValue({bond, key: 'rating1', val: cols[19]});
						this.setValue({bond, key: 'rating2', val: cols[21]});
						this.setValue({bond, key: 'rating3', val: cols[23]});
						this.setValue({bond, key: 'couponRate', val: cols[25]});
						this.setValue({bond, key: 'couponCount', val: cols[26]});
						this.setValue({bond, key: 'nextPaymentDate', val: cols[27]});
						this.setValue({bond, key: 'riskLevel', val: cols[54]});
						this.setValue({bond, key: 'repaymentOrder', val: cols[56]});
						if (bond.sellPrice < 0 || bond.buyPrice < 0)
							return;
						if (bond.repaymentOrder.indexOf('主順位非優先受償無擔保')!==-1)
							bond.repaymentOrder = '主順位';
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
						vuex.bondMap[isin] = bond;
					}
				});
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
				bond[key] = vuex.fn.parseNumberWithParentheses(val.trim());
		},
	},
	watch: {},
	computed: {},
}
</script>

<style scoped>
</style>
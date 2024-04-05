<template>
	<table class="bond-table">
		<thead>
			<tr>
				<th>庫存<br><input type="checkbox" v-model="$store.state.filter.position" /></th>
				<th>關注<br><input type="checkbox" v-model="$store.state.filter.favorite" /></th>
				<th v-for="cso in csList" :key="cso.label" @click="onClick(cso.key)" :title="cso.title">
					<div v-html="cso.label" />
					<span v-if="$store.state.sortKey===cso.key">{{$store.state.sortDesc?'▲':'▼'}}</span>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="bond in sortedList" :isin="bond.isin" :class="{'favorite': !$store.state.filter.favorite && $store.state.favorite[bond.isin], 'position': !$store.state.filter.position && $store.state.position[bond.isin]}">
				<!-- 加入庫存 -->
				<td class="pointer" @click="onPosition({bond})">
					<span class="material-icons eee position" :class="{selected: $store.state.position[bond.isin]}">favorite</span>
				</td>
				<!-- 加入關注 -->
				<td class="pointer" @click="onFocus({bond})">
					<span class="material-icons eee focus" :class="{selected: $store.state.favorite[bond.isin]}">done</span>
				</td>
				<!-- 所有欄位 -->
				<td v-for="cso in csList" :class="[cso.key, cso.class]" :key="cso.key" v-html="getValue({bond, cso, key: cso.key})"/>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	props: [],
	data() {
		return {}
	},
	beforeMount() {
	},
	mounted() {},
	beforeDestroy() {},
	components: {},
	methods: {
		onClick(key) {
			if (key === vuex.sortKey)
				vuex.sortDesc = !vuex.sortDesc;
			vuex.sortKey = key;
		},
		getValue({bond, cso, key}) {
			let val = bond[cso.key];
			if (cso.isNumber && isNaN(val))
				val = '';
			if (val!=null && cso.isNumber && cso.toFixed != null)
				val = Number(val).toFixed(cso.toFixed);
			switch(key) {
				case 'comp':
					val = `<div class="flex-1" title="${bond.name}">${val}</div>`;
					break;
				case 'name':
					val = val.split(' ')[0];
					break;
				case 'maxIncome':
					val = '$'+val;
					break;
				case 'repaymentOrder':
					if (val.indexOf('次順位')!==-1) val = '次順位';
					else if (val.indexOf('優先無擔保')!==-1) val = '優先無擔保';
					break;
			}			
			return val;
		},
		onFocus({bond}) {
			vuex.favorite[bond.isin] = !vuex.favorite[bond.isin];
			if (!vuex.favorite[bond.isin])
				delete vuex.favorite[bond.isin];
		},
		onPosition({bond}) {
			vuex.position[bond.isin] = !vuex.position[bond.isin];
		},
		
	},
	watch: {},
	computed: {
		csList() {
			return vuex.csList;
		},
		bondList() {
			let list = [];
			for (let key in vuex.bondMap) {
				list.push(vuex.bondMap[key]);
			}
			return list;
		},
		// 依條件過濾
		filteredList() {
			return this.bondList.filter(bond=>{
				let result = true;
				// 買價大於
				if (result && vuex.filter.minBP)
					result = bond.buyPrice >= vuex.filter.minBP;
				// 買價小於
				if (result && vuex.filter.maxBP)
					result = bond.buyPrice <= vuex.filter.maxBP;
				// 到期年大於
				if (result && vuex.filter.minYear)
					result = bond.endYear >= vuex.filter.minYear;
				// 到期年小於
				if (result && vuex.filter.maxYear)
					result = bond.endYear <= vuex.filter.maxYear;
				// 庫存
				if (result && vuex.filter.position)
					result = vuex.position[bond.isin];
				// 最愛
				if (result && vuex.filter.favorite)
					result = vuex.favorite[bond.isin];
				// 票息大於
				if (result && vuex.filter.couponRate)
					result = bond.couponRate >= vuex.filter.couponRate;
				// A評級
				if (result && vuex.filter.levelA)
					result = (''+bond.rating1+bond.rating2+bond.rating3).indexOf('A') !== -1;
				// 要有買價
				if (result && vuex.filter.hasBuyPrice)
					result = !!bond.buyPrice;
				// 僅限USD
				if (result && vuex.filter.onlyUSD)
					result = bond.currency==='USD';
				return result;
			});
		},
		// 依條件排序
		sortedList() {
			let sortKey = vuex.sortKey;
			let sortDesc = vuex.sortDesc;
			let isNumber = vuex.csMap[sortKey].isNumber;
			return this.filteredList.sort((a, b)=>{
				if (isNumber) {
					let vala = a[sortKey] || 0;
					let valb = b[sortKey] || 0;
					return vala > valb ? (sortDesc?1:-1) : (sortDesc?-1:1);
				}
				else
					return a[sortKey] > b[sortKey] ? (sortDesc?1:-1) : (sortDesc?-1:1);
			});
		},
	},
}
</script>

<style scoped>
thead {
	position: sticky;
	top: 0;
}
th {
	white-space: nowrap;
	text-align: center;
	background-color: #999;
	color: white;
	padding: 0.2em 0.5em;
	cursor: pointer;
}
tr:hover {
	background-color: #EEE;
}
tr.favorite {
	background-color: yellow;
}
tr.position {
	background-color: aqua;
}
td {
	white-space: nowrap;
}
td.comp {
	max-width: 156px;
    text-overflow: ellipsis;
    overflow: hidden;	
}
td.pointer {
	cursor: pointer;
}
.material-icons.eee {
	color: #CCC;
}
.material-icons.position.selected {
	color: green;
}
.material-icons.focus.selected {
	color: green;
}
</style>
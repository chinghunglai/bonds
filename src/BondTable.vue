<template>
	<table class="bond-table">
		<thead>
			<th>庫存<br><input type="checkbox" v-model="$store.state.filter.position" /></th>
			<th>關注<br><input type="checkbox" v-model="$store.state.filter.favorite" /></th>
			<th v-for="cso in csList" :key="cso.label" @click="onClick(cso.key)" :title="cso.title">
				<div v-html="cso.label" />
				<span v-if="$store.state.sortKey===cso.key">{{$store.state.sortDesc?'▲':'▼'}}</span>
			</th>
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
				<td v-for="cso in csList" :class="[cso.class]" :key="cso.key" v-html="getValue({bond, cso, key: cso.key})"/>
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
			if (val!=null && cso.isNumber && cso.toFixed != null)
				val = Number(val).toFixed(cso.toFixed);
			if (key === 'maxIncome')
				val = '$'+val;
			if (key === 'isin')
				val = `<a href="https://www.boerse-frankfurt.de/bond/${bond.isin}" target="_blank">${bond.isin}</a>`;
			return val;
		},
		onFocus({bond}) {
			vuex.favorite[bond.isin] = !vuex.favorite[bond.isin];
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
				// 到期年大於
				if (result && vuex.filter.minYear)
					result = bond.endYear >= vuex.filter.minYear;
				// 到期年小於
				if (result && vuex.filter.maxYear)
					result = bond.endYear <= vuex.filter.maxYear;
				// 最愛
				if (result && vuex.filter.favorite)
					result = vuex.favorite[bond.isin];
				// 票息大於
				if (result && vuex.filter.couponRate)
					result = bond.couponRate >= vuex.filter.couponRate;
				// A評級
				if (result && vuex.filter.levelA) {
					result = (bond.rating1+bond.rating2+bond.rating3).indexOf('A') !== -1;
				}
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
td.pointer {
	cursor: pointer;
}
.material-icons.eee {
	color: #EEE;
}
.material-icons.position.selected {
	color: green;
}
.material-icons.focus.selected {
	color: green;
}
</style>
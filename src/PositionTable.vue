<template>
	<table class="bond-table">
		<thead>
			<tr>
				<th v-for="cso in positionCSList" :key="cso.label" @click="onClick(cso.key)" :title="cso.title">
					<div v-html="cso.label" />
					<span v-if="$store.state.sortKey===cso.key">{{$store.state.sortDesc?'▲':'▼'}}</span>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="bond in filteredList" :isin="bond.isin" :key="`position-${bond.isin}`">
				<!-- 所有欄位 -->
				<td v-for="cso in positionCSList" :class="[cso.key, cso.class]" :key="cso.key" v-html="getValue({bond, cso, key: cso.key})"/>
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
		positionCSList() {
			return vuex.positionCSList;
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
                return vuex.position[bond.isin];
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
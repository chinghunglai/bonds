<template>
	<div class="flex-col FULL" :class="{'mobile': $store.state.isMobile}">
		<div class="tool-bar flex-row" v-show="displayToolbar">
			<div class="flex-col mg0d5">
				<div class="flex-row data-source">{{$store.state.dataSource}}</div>
				<div class="flex-row data-source">{{$store.state.dataSource2}}</div>
			</div>
			<div class="mg0d5">
				<div>參考買價</div>
				<input type="text" v-model="$store.state.filter.minBP" class="w30px"/>
				<span>～</span>
				<input type="text" v-model="$store.state.filter.maxBP" class="w30px"/>
			</div>
			<div class="mg0d5">
				<div>距到期年</div>
				<input type="text" v-model="$store.state.filter.minYear" class="w30px"/>
				<span>～</span>
				<input type="text" v-model="$store.state.filter.maxYear" class="w30px"/>
			</div>
			<div class="mg0d5">
				<div>票息</div>
				大於<input type="text" v-model="$store.state.filter.couponRate" class="w30px"/>
			</div>
			<div class="mg0d5 flex-col">
				<div>信評</div>
				<div class="flex-center"><span>包含Ａ</span><input type="checkbox" v-model="$store.state.filter.levelA" class=""/></div>
			</div>
			<div class="mg0d5 flex-col">
				<div>必須</div>
				<div class="flex-center"><span>有買價</span><input type="checkbox" v-model="$store.state.filter.hasBuyPrice" class=""/></div>
			</div>
			<div class="mg0d5 flex-col">
				<div>幣別</div>
				<div class="flex-center"><span>限USD</span><input type="checkbox" v-model="$store.state.filter.onlyUSD" class=""/></div>
			</div>
			<!-- 庫存模式 -->
			<!-- <el-switch v-model="$store.state.positionMode" size="large" active-text="庫存" inactive-text="全部" /> -->
			<div class="mg0d5 flex-col">
				<div>欄位顯示</div>
				<el-switch class="switch" v-model="$store.state.ezColumn" size="large" active-text="完整" inactive-text="精簡" />
			</div>
		</div>
		<div class="toggleToolBar flex-start" @click="displayToolbar=!displayToolbar"><span>{{(displayToolbar?'　隱藏工具列':'')}}</span><span class="material-icons eee position">{{displayToolbar?'expand_less':'expand_more'}}</span></div>
		<div class="flex-1 posr">
			<div class="FULL scrolling-y">
				<BondTable v-if="!$store.state.positionMode"/>
				<PositionTable v-if="$store.state.positionMode" />
			</div>
		</div>
		<div class="hidden">{{csList}}</div>
	</div>
	<FetchData/>
</template>

<script>
import packageObj from '/package.json';
import FetchData from './core/FetchData.vue';
import BondTable from './BondTable.vue';
import PositionTable from './PositionTable.vue';

export default {
	components: {FetchData, BondTable, PositionTable},
	data() {
		return {
			displayToolbar: true,
		};
	},
	beforeMount() {
		window.vuex = this.$store.state;
		vuex.component.app = this;
		vuex.version = packageObj.version;
		// positionCSMap -> positionCSList
		for (let key in vuex.positionCSMap) {
			let obj = vuex.positionCSMap[key];
			obj.key = key;
			vuex.positionCSList.push(obj);
		}
	},
	mounted() {
	},
	methods: {

	},
	computed: {
		csList() {
			vuex.csList = [];
			// csMap -> csList
			for (let key in vuex.csMap) {
				let obj = vuex.csMap[key];
				// 精簡欄位模式 -> 沒有設定精簡欄位 都 return 掉
				if (!vuex.ezColumn && !obj.ezColumn)
					continue;
				obj.key = key;
				vuex.csList.push(obj);
			}
			return vuex.csList;
		},
	},
	watch: {
	},
};
</script>

<style scoped>
.data-source {
	font-size: 1em;
	margin-right: 1em;
}
input[type="checkbox"] {
	width: 20px;
	height: 20px;
	margin: 0;
}
.tool-bar {
	color: white;
	background-color: orange;
}
.switch {
	margin: -10px 0;
}
.toggleToolBar {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 1;
	cursor: pointer;
	color: white;
	background-color: orange;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
}
</style>

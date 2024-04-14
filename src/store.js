import { createStore } from 'vuex'
import { syncWithLocalStorage } from './syncWithLocalStorage';
// 定义用于设置嵌套属性值的函数
function setNestedProperty(obj, path, value) {
	const parts = path.split('.');
	const last = parts.pop();
	const lastObj = parts.reduce((acc, part) => (acc[part] = acc[part] || {}), obj);
	lastObj[last] = value;
}

export const store = createStore({
	state: {
		dataSource: '金交債0412',
		dataSource2: '可質押債券清單202403',
		// 在開發機
		isDvm: location.hostname === '127.0.0.1',
		// 元件容器
		component: {},
		// 債券資料
		bondMap: {},
		// 貸款利率
		lendingRates: 2.02,
		// 排序欄位
		sortKey: 'yield',
		// 排序方向
		sortDesc: false,
		// 欄位設定表
		csMap: {
			'isin': {label: 'ISIN', head: '產品代碼', class: ''},
			'comp': {label: '發行者', head: '發行人', class: ''},
			'name': {label: '代號', head: '證券名稱', class: ''},
			'currency': {label: '幣別', head: '幣別', class: ''},
			'sellPrice': {label: '參考<br>賣價', head: '參考賣出價\n', isNumber: true, class: 'text-align-right'},
			'buyPrice': {label: '參考<br>買價', head: '參考買入價\n', isNumber: true, class: 'text-align-right'},
			'yield': {label: '到期<br>殖利率', head: '參考到期殖利率', isNumber: true, class: 'text-align-right'},
			'endDateStr': {label: '到期日', head: '到期日', class: ''},
			'redemptionYear': {label: '距買<br>回年', head: '距買\n回年', isNumber: true, class: 'text-align-right'},
			'endYear': {label: '距到<br>期年', head: '距到\n期年', isNumber: true, class: 'text-align-right'},
			'remainingYears': {label: '$距到<br>期年', head: '$距到\n期年', isNumber: true, class: 'text-align-right'},
			'rating1': {label: '穆迪', head: '穆迪', class: 'text-align-center'},
			'rating2': {label: '標普', head: '標普', class: 'text-align-center'},
			'rating3': {label: '惠譽', head: '惠譽', class: 'text-align-center'},
			'couponRate': {label: '票息', head: '票息', isNumber: true, class: 'text-align-right'},
			'couponCount': {label: '配息<br>頻率', head: '配息頻率', isNumber: true, class: 'text-align-center'},
			'nextPaymentDate': {label: '下一配息日', head: '下一配息日', class: ''},
			// 'riskLevel': {label: '風險等級', head: '風險等級', class: ''},
			'repaymentOrder': {label: '償債順位', head: '償債順位', class: ''},
			'loanRatio': {label: '可貸<br>成數%', isNumber: true, class: 'text-align-center'},
			'incomeInOneYear': {label: '年<br>收益', isNumber: true, class: 'text-align-right', title: '票息x2000 - 買價x2000x借款利率 - 折溢價損益', toFixed: 0},
			'incomeInOneYearRate': {label: '年<br>收益%', isNumber: true, class: 'text-align-right', title: '年收益 / (買價x2000) (%)', toFixed: 2},
			'maxIncome': {label: '最大<br>收益', isNumber: true, class: 'text-align-right', title: '年收益 x 到期年', toFixed: 0},
			'maxIncomeRate': {label: '最大<br>收益%', isNumber: true, class: 'text-align-right', title: '年收益% x 到期年', toFixed: 1},
			'principalTotal': {label: '本金<br>金額', isNumber: true, class: 'text-align-right', title: '買價 x 2000 x (100-(可貸成數x錯幣0.9))', toFixed: 0},
			'capitalIncomeRate': {label: '每年本金<br>收益%', isNumber: true, class: 'text-align-right', title: '年收益 / 本金總金額 (%)', toFixed: 1},
			'capitalIncomeRate10Y': {label: '10年本金<br>收益%', isNumber: true, class: 'text-align-right', title: '年本金收益% x 取小值(10,到期年)', toFixed: 1},
			'capitalIncomeRate15Y': {label: '15年本金<br>收益%', isNumber: true, class: 'text-align-right', title: '年本金收益% x 取小值(15,到期年)', toFixed: 1},
			'capitalIncomeRate20Y': {label: '20年本金<br>收益%', isNumber: true, class: 'text-align-right', title: '年本金收益% x 取小值(20,到期年)', toFixed: 1},
			'maxCapitalIncomeRate': {label: '最大本金<br>收益%', isNumber: true, class: 'text-align-right', title: '最大收益 / 本金總金額 (%)', toFixed: 1},
		},
		// 欄位設定陣列
		csList: [],
		
		// 欄位設定表
		positionCSMap: {
			'isin': {label: 'ISIN', head: '產品代碼', class: ''},
			'comp': {label: '發行者', head: '發行人', class: ''},
			'name': {label: '代號', head: '證券名稱', class: ''},
			'sellPrice': {label: '參考<br>賣價', head: '參考賣出價\n', isNumber: true, class: 'text-align-right'},
			'redemptionYear': {label: '距買<br>回年', head: '距買\n回年', isNumber: true, class: 'text-align-right'},
			'endYear': {label: '距到<br>期年', head: '距到\n期年', isNumber: true, class: 'text-align-right'},
			'rating1': {label: '穆迪', head: '穆迪', class: 'text-align-center'},
			'rating2': {label: '標普', head: '標普', class: 'text-align-center'},
			'rating3': {label: '惠譽', head: '惠譽', class: 'text-align-center'},
			'couponRate': {label: '票息', head: '票息', isNumber: true, class: 'text-align-right'},
			'nextPaymentDate': {label: '下一配息日', head: '下一配息日', class: ''},
			'repaymentOrder': {label: '償債順位', head: '償債順位', class: ''},
			'loanRatio': {label: '可貸<br>成數%', isNumber: true, class: 'text-align-center'},
			'incomeInOneYear': {label: '年<br>收益', isNumber: true, class: 'text-align-right', title: '票息x2000 - 買價x2000x借款利率 - 折溢價損益', toFixed: 0},
			'incomeInOneYearRate': {label: '年<br>收益%', isNumber: true, class: 'text-align-right', title: '年收益 / (買價x2000) (%)', toFixed: 2},
			'maxIncome': {label: '最大<br>收益', isNumber: true, class: 'text-align-right', title: '年收益 x 到期年', toFixed: 0},
			'maxIncomeRate': {label: '最大<br>收益%', isNumber: true, class: 'text-align-right', title: '年收益% x 到期年', toFixed: 1},
		},
		positionCSList: [],
		
		fn: {
			$safeFloat: (val, precision)=>{
				if (typeof precision !== 'number' || isNaN(precision))
					precision = 8;
				let len = Math.pow(10, precision);
				return Math.round(val * len) / len;
			},
			parseNumberWithParentheses(str) {
				if (!str) return;
				str = ''+str;
				// 使用正則表達式檢查字串是否以"("開頭和")"結尾
				const hasParentheses = /^\(.*\)$/.test(str);
				// 提取數字部分
				const num = parseFloat(str.replace(/[()]/g, ''));
				// 限制小數位數最多為3位
				const roundedNum = Math.round(num * 1000) / 1000;
				// 如果字串有括號,返回負數,否則返回正數
				return hasParentheses ? -roundedNum : roundedNum;
			},
		},
		// 過濾條件
		filter: {
			minBP: null,
			maxBP: null,
			minYear: 5,
			maxYear: null,
			position: false,
			favorite: false,
			couponRate: null,
			levelA: false,
			hasBuyPrice: true,
			onlyUSD: true,
		},
		// 我的最愛
		favorite: {},
		// 庫存
		position: {},
		// 要隱藏的欄位
		hiddenColumn: {},
		// 庫存模式
		positionMode: false,
		// 庫存明細
		positionDetail: {},
	},
	getters:{
	},	
	mutations: {
		updateNestedState(state, { path, value }) {
			setNestedProperty(state, path, value);
		},
	}
})

// 排序欄
syncWithLocalStorage(store, 'sortKey');
// 排序方向
syncWithLocalStorage(store, 'sortDesc');
// 過濾條件
syncWithLocalStorage(store, 'filter');
// 我的最愛
syncWithLocalStorage(store, 'favorite');
// 庫存
syncWithLocalStorage(store, 'position');
// 隱藏欄位
syncWithLocalStorage(store, 'hiddenColumn');
export default store;
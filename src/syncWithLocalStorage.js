// 定义用于获取嵌套属性值的函数
function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// 定义用于设置嵌套属性值的函数
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const lastObj = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
  lastObj[last] = value;
}

// 更新的同步函数，支持嵌套路径
export function syncWithLocalStorage(store, path) {
  // 从 localStorage 读取并初始化 Vuex 状态
  const storedValue = localStorage.getItem(path);
  if (storedValue) {
    const value = JSON.parse(storedValue);
    store.commit('updateNestedState', { path, value });
  }

  // 观察 Vuex 状态变化，并更新 localStorage
  store.watch(
    (state) => getNestedProperty(state, path),
    (newValue) => {
      localStorage.setItem(path, JSON.stringify(newValue));
    },
    { deep: true }
  );
}

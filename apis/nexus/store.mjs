const store = {};

export function setStore(key, value) {
  store[key] = value;
}

export function getStore(key) {
  return store[key];
}

export function appendStore(key, value) {
  const arr = store[key] || [];
  store[key] = [...arr, value];
}

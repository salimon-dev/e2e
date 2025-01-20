const store = {};

export function setStore(key, value) {
  store[key] = value;
}

export function getStore(key) {
  return store[key];
}

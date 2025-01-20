export function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function handleAxios(promise) {
  return promise.then((response) => response).catch((error) => error.response);
}

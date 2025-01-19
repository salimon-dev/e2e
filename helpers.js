function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function handleAxios(promise) {
  return promise.then((response) => response).catch((error) => error.response);
}
module.exports = {
  wait,
  handleAxios,
};

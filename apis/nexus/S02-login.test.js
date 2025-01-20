const axios = require("axios");
const configs = require("../../configs.mjs");
const { wait, handleAxios } = require("../../helpers");
describe("login user", () => {
  let user;
  let verification;
  let access_token;
  it("fails login with empty data", async () => {
    const response = await handleAxios(
      axios.post("/auth/login", undefined, { baseURL: configs.nexusBaseUrl })
    );
    expect(response.status).toEqual(400);
    expect(response.data.email).toEqual("email is required");
    expect(response.data.email).toEqual("email is required");
  });
});

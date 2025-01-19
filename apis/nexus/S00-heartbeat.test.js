const axios = require("axios");
const configs = require("../../configs");
describe("heartbeat api", () => {
  it("returns 200", async () => {
    const response = await axios.get("/", { baseURL: configs.nexusBaseUrl });
    expect(response.status).toEqual(200);
  });
  it("has info", async () => {
    const response = await axios.get("/", { baseURL: configs.nexusBaseUrl });
    expect(response.status).toEqual(200);
    expect(typeof response.data.name).toBe("string");
    expect(typeof response.data.environment).toBe("string");
    expect(typeof response.data.time).toBe("number");
  });
});

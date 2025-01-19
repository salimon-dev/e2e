const axios = require("axios");
const configs = require("../../configs");
const { wait, handleAxios } = require("../../helpers");
describe("register user", () => {
  let user;
  let verification;
  let access_token;
  it("resets e2e data", async () => {
    const response = await axios.post("/e2e/reset", undefined, { baseURL: configs.nexusBaseUrl });
    expect(response.status).toEqual(200);
  });
  it("fails with empty payload", async () => {
    try {
      await axios.post("/auth/register", undefined, { baseURL: configs.nexusBaseUrl });
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.response.data.username).toEqual("username is required");
      expect(error.response.data.password).toEqual("password is required");
      expect(error.response.data.email).toEqual("email is required");
    }
  });
  it("fails with invalid email", async () => {
    try {
      await axios.post("/auth/register", { email: "invalid email" }, { baseURL: configs.nexusBaseUrl });
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.response.data.username).toEqual("username is required");
      expect(error.response.data.password).toEqual("password is required");
      expect(error.response.data.email).toEqual("email must be a valid email");
    }
  });
  it("fails with short password", async () => {
    try {
      await axios.post(
        "/auth/register",
        { email: "invalid email", password: "some" },
        { baseURL: configs.nexusBaseUrl }
      );
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.response.data.username).toEqual("username is required");
      expect(error.response.data.password).toEqual("password must be more or equal than 5 charachters");
      expect(error.response.data.email).toEqual("email must be a valid email");
    }
  });
  it("registers", async () => {
    const response = await axios.post(
      "/auth/register",
      { email: "user@e2e-test.com", password: "userpassword", username: "e2e-user" },
      { baseURL: configs.nexusBaseUrl }
    );
    expect(response.status).toEqual(200);
  });
  it("gets e2e data", async () => {
    await wait(1500);
    const response = await axios.get("/e2e/info", { baseURL: configs.nexusBaseUrl });
    expect(response.status).toEqual(200);
    expect(response.data.users).toBeTruthy();
    expect(response.data.verifications).toBeTruthy();

    expect(Array.isArray(response.data.users)).toEqual(true);
    expect(Array.isArray(response.data.verifications)).toEqual(true);
    expect(response.data.users).toHaveLength(1);
    expect(response.data.verifications).toHaveLength(1);

    user = response.data.users[0];
    verification = response.data.verifications[0];
  });
  it("verifies the user", async () => {
    const response = await axios.post(
      "/auth/register/verify",
      {
        email: user.email,
        token: verification.token,
      },
      { baseURL: configs.nexusBaseUrl }
    );
    expect(response.status).toEqual(200);
    expect(response.data.access_token).toBeTruthy();
    expect(response.data.refresh_token).toBeTruthy();
    expect(typeof response.data.access_token).toEqual("string");
    expect(typeof response.data.refresh_token).toEqual("string");

    expect(response.data.data).toBeTruthy();
    expect(response.data.data.id).toEqual(user.id);
    expect(response.data.data.username).toEqual(user.username);
    expect(response.data.data.email).toEqual(user.email);
    expect(response.data.data.credit).toEqual(user.credit);

    access_token = response.data.access_token;
  });
  it("gets profile with access token", async () => {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL: configs.nexusBaseUrl,
        headers: { Authorization: "Bearer " + access_token },
      })
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(user.id);
    expect(response.data.username).toEqual(user.username);
    expect(response.data.email).toEqual(user.email);
    expect(response.data.credit).toEqual(user.credit);
    expect(response.data.usage).toEqual(user.usage);
  });
  it("resets e2e data", async () => {
    const response = await axios.post("/e2e/reset", undefined, { baseURL: configs.nexusBaseUrl });
    expect(response.status).toEqual(200);
  });
});

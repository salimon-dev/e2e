import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL, keymakerPassword, keymakerUsername } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC01]\t\t\u001b[34mkeymaker logins and creates first invitation code\u001b[0m");
  for (let i = 0; i < tests.length; i++) {
    await tests[i]();
    await wait(50);
  }
}

const tests = [
  // fails to login with empty payload
  async function () {
    const response = await handleAxios(axios.post("/auth/login", undefined, { baseURL }));
    assert.equal(response.status, 400);
    assert.equal(response.data.username, "username is required");
    assert.equal(response.data.password, "password is required");
    console.log("\t\tfails to login with empty payload");
  },
  // password required
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", { username: keymakerUsername }, { baseURL })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password is required");
    console.log("\t\tpassword required");
  },
  // username required
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", { password: keymakerPassword }, { baseURL })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.username, "username is required");
    console.log("\t\tusername required");
  },
  // password is short
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", { password: "pass", username: keymakerUsername }, { baseURL })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password must be more or equal than 5 charachters");
    console.log("\t\tpassword is short");
  },
  // fails to login with wrong creds
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", { password: "wrongpassword", username: keymakerUsername }, { baseURL })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to login with wrong creds");
  },
  // logs in as the keymaker
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", { password: keymakerPassword, username: keymakerUsername }, { baseURL })
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.access_token);
    assert.isString(response.data.refresh_token);
    assert.isObject(response.data.data);
    assert.isString(response.data.data.id);
    assert.isString(response.data.data.username);

    setStore("keymaker_access_token", response.data.access_token);
    setStore("keymaker_refresh_token", response.data.refresh_token);
    console.log("\t\tlogs in as the keymaker");
  },
  // fails to get profile without token in header
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get profile without token in header");
  },
  // fails to get profile with invalid header
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
        headers: { Authorization: "someinvalidvalue" },
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get profile with invalid header");
  },
  // fails to get profile with refresh token
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_refresh_token") },
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get profile with refresh token");
  },
  // fails to get profile with wrong token
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
        headers: { Authorization: "Bearer " + "invalidtoken" },
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get profile with wrong token");
  },
  // gets profile
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);
    console.log("\t\tgets profile");
  },
];

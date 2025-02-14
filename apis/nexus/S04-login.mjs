import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore, appendStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC03]\t\t\u001b[34musers can login, rotate tokens and fetch their profile\u001b[0m");
  for (let i = 0; i < tests.length; i++) {
    await tests[i]();
    await wait(50);
  }
}

const tests = [
  // login fails with empty payload
  async function () {
    const response = await handleAxios(
      axios.post("/auth/login", undefined, {
        baseURL,
      })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password is required");
    assert.equal(response.data.username, "username is required");
    console.log("\t\tlogin fails with empty payload");
  },
  // login fails with no password
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { username: "someuser" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password is required");
    console.log("\t\tlogin fails with no password");
  },
  // login fails with no username
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { password: "somepassword" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.username, "username is required");
    console.log("\t\tlogin fails with no username");
  },
  // login fails with short password
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { username: "user1", password: "us" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password must be more or equal than 5 charachters");
    console.log("\t\tlogin fails with short password");
  },
  // login fails with wrong username and password
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { username: "username", password: "password" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 401);
    console.log("\t\tlogin fails with wrong username and password");
  },
  // user1 logins
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { username: "user1", password: "user1password" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.access_token);
    assert.isString(response.data.refresh_token);
    assert.isObject(response.data.data);
    assert.isString(response.data.data.id);
    assert.isString(response.data.data.username);
    setStore("user1", response.data.data);
    setStore("user1_access_token", response.data.access_token);
    setStore("user1_refresh_token", response.data.refresh_token);
    console.log("\t\tuser1 logins");
  },
  // user2 logins
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/login",
        { username: "user2", password: "user2password" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.access_token);
    assert.isString(response.data.refresh_token);
    assert.isObject(response.data.data);
    assert.isString(response.data.data.id);
    assert.isString(response.data.data.username);
    setStore("user2", response.data.data);
    setStore("user2_access_token", response.data.access_token);
    setStore("user2_refresh_token", response.data.refresh_token);
    console.log("\t\tuser2 logins");
  },
  // fails to get the profile without token
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get the profile without token");
  },
  // fails to get the profile with wrong token
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,

        headers: { Authorization: "Bearer " + "wrong token" },
      })
    );
    assert.equal(response.status, 401);
    console.log("\t\tfails to get the profile with wrong token");
  },
  // user2 gets profile
  async function () {
    const response = await handleAxios(
      axios.get("/profile", {
        baseURL,

        headers: { Authorization: "Bearer " + getStore("user2_access_token") },
      })
    );
    assert.equal(response.status, 200);
    assert.isObject(response.data);
    assert.isString(response.data.id);
    assert.isString(response.data.username);
    console.log("\t\tuser2 gets profile");
  },
  // throws 403 when requesting admin levels
  async function () {
    const response = await handleAxios(
      axios.get("/invitations/search", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("user2_access_token") },
      })
    );
    assert.equal(response.status, 403);
    console.log("\t\tthrows 403 when requesting admin levels");
  },
  // user2 fails to rotate with wrong token
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/rotate",
        { token: "sometoken" },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 401);
    console.log("\t\tuser2 fails to rotate with wrong token");
  },
  // user2 fails to rotate with access token
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/rotate",
        { token: getStore("user2_access_token") },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 401);
    console.log("\t\tuser2 fails to rotate with wrong token");
  },
  // user2 rotates access token
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/rotate",
        { token: getStore("user2_refresh_token") },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.access_token);
    assert.isString(response.data.refresh_token);
    assert.isObject(response.data.data);
    assert.isString(response.data.data.id);
    assert.isString(response.data.data.username);
    setStore("user2", response.data.data);
    setStore("user2_access_token", response.data.access_token);
    setStore("user2_refresh_token", response.data.refresh_token);
    console.log("\t\tuser2 rotates access token");
  },
];

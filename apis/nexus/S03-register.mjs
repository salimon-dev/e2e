import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore, appendStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC03]\t\t\u001b[34mnew user registers with invitation records\u001b[0m");
  for (let i = 0; i < tests.length; i++) {
    await tests[i]();
    await wait(50);
  }
}

const tests = [
  // register fails with empty payload
  async function () {
    const response = await handleAxios(
      axios.post("/auth/register", undefined, {
        baseURL,
      })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.invitation_code, "invitation_code is required");
    assert.equal(response.data.password, "password is required");
    assert.equal(response.data.username, "username is required");
    console.log("\t\tregister fails with empty payload");
  },
  // register fails with no password
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "somecode",
          username: "user1",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password is required");
    console.log("\t\tregister fails with no password");
  },
  // fails with short password
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "somecode",
          username: "user1",
          password: "12",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.password, "password must be more or equal than 5 charachters");
    console.log("\t\tfails with short password");
  },
  // register fails with no username
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "somecode",
          password: "user1password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.username, "username is required");
    console.log("\t\tregister fails with no username");
  },
  // register fails with no invitation code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          username: "user1",
          password: "user1password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.invitation_code, "invitation_code is required");
    console.log("\t\tregister fails with no invitation code");
  },
  // register fails with expired invitation code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-expired",
          username: "user1",
          password: "user1password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.invitation_code, "invitation_code is invalid");
    console.log("\t\tregister fails with expired invitation code");
  },
  // register fails with inactive invitation code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-inactive",
          username: "user1",
          password: "user1password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.invitation_code, "invitation_code is invalid");
    console.log("\t\tregister fails with inactive invitation code");
  },
  // user1 registers
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-active",
          username: "user1",
          password: "user1password",
        },
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
    appendStore("users", response.data.data);
    console.log("\t\tuser1 registers");
  },
  // user2 registers
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-active",
          username: "user2",
          password: "user2password",
        },
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
    appendStore("users", response.data.data);
    console.log("\t\tuser2 registers");
  },
  // register fails with same username
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-active",
          username: "user2",
          password: "user2password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.action, "a user with same username already exists");
    console.log("\t\tregister fails with same username");
  },
  // active invitation usage is depleted and can not register again
  async function () {
    const response = await handleAxios(
      axios.post(
        "/auth/register",
        {
          invitation_code: "e2e-inactive",
          username: "user3",
          password: "user3password",
        },
        {
          baseURL,
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.invitation_code, "invitation_code is invalid");
    console.log("\t\tactive invitation usage is depleted and can not register again");
  },
];

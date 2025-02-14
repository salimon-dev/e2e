import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL, keymakerPassword, keymakerUsername } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore, appendStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC06]\t\t\u001b[34mkeymaker can manage users\u001b[0m");
  for (let i = 0; i < tests.length; i++) {
    await tests[i]();
    await wait(50);
  }
}

function getDate(offset = 0) {
  const d = Date.now();
  return new Date(d + offset);
}

const tests = [
  // searches for users in system
  async function () {
    const response = await handleAxios(
      axios.get("/users/search", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.page, 1);
    assert.equal(response.data.page_size, 10);
    assert.isNumber(response.data.total);
    assert.isArray(response.data.data);
    console.log("\t\tsearches for users in system");
  },
  // search params are working
  async function () {
    const response = await handleAxios(
      axios.get("/users/search", {
        baseURL,
        params: { page: 2, page_size: 8 },
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.page, 2);
    assert.equal(response.data.page_size, 8);
    assert.isNumber(response.data.total);
    assert.isArray(response.data.data);
    console.log("\t\tsearch params are working");
  },
  // fails with empty payload
  async function () {
    const response = await handleAxios(
      axios.post("/users/create", undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.username, "username is required");
    assert.equal(response.data.password, "password is required");
    assert.equal(response.data.credit, "credit is required");
    assert.equal(response.data.balance, "balance is required");
    assert.equal(response.data.status, "status is required");
    assert.equal(response.data.usage, "usage is required");
    console.log("\t\tfails with empty payload");
  },
  // creates an users
  async function () {
    const invitation = getStore("active_invitation");
    const response = await handleAxios(
      axios.post(
        "/users/create",
        {
          invitation_id: invitation.id,
          username: "random_user",
          password: "random_password",
          role: 3,
          credit: 0,
          usage: 0,
          balance: 15000,
          status: 1,
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);

    assert.isString(response.data.id);
    assert.isString(response.data.username);
    assert.isString(response.data.password);
    assert.isString(response.data.invitation_id);
    assert.isNumber(response.data.role);
    assert.isNumber(response.data.credit);
    assert.isNumber(response.data.balance);
    assert.isNumber(response.data.usage);
    assert.isNumber(response.data.status);
    assert.isString(response.data.registered_at);
    assert.isString(response.data.updated_at);

    appendStore("users", response.data);
    setStore("random_user", response.data);

    console.log("\t\tcreates a users");
  },
  // updates the created users
  async function () {
    const user = getStore("random_user");
    const response = await handleAxios(
      axios.post(
        "/users/update/" + user.id,
        {
          invitation_id: user.invitation_id,
          username: user.username,
          password: user.password,
          role: user.role,
          credit: user.credit,
          usage: user.usage,
          balance: 2000,
          status: 2,
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);

    assert.isString(response.data.id);
    assert.isString(response.data.username);
    assert.isString(response.data.password);
    assert.isString(response.data.invitation_id);
    assert.isNumber(response.data.role);
    assert.isNumber(response.data.credit);
    assert.isNumber(response.data.balance);
    assert.isNumber(response.data.usage);
    assert.isString(response.data.registered_at);
    assert.isString(response.data.updated_at);

    assert.equal(response.data.balance, 2000);
    assert.equal(response.data.status, 2);

    setStore("random_user", response.data);

    console.log("\t\tupdates the created user");
  },
  // deletes the same users
  async function () {
    const id = getStore("random_user").id;
    const response = await handleAxios(
      axios.post("/users/delete/" + id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);

    const users = getStore("users") || [];
    setStore(
      "users",
      users.filter((item) => item.id !== id)
    );
    setStore("random_user", undefined);

    console.log("\t\tdeletes the same users");
  },
];

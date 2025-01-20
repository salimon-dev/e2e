import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";
import { setStore, getStore } from "./store.mjs";

export default async function main() {
  console.log("[SC01]\t\tuser can regsiter");
  await test0();
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  await test6();
  await test7();
  await test8();
  await test9();
}

// fails with empty payload
async function test0() {
  const response = await handleAxios(axios.post("/auth/register", undefined, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email is required");
  assert.equal(response.data.username, "username is required");
  assert.equal(response.data.password, "password is required");
}

// fails with invalid email
async function test1() {
  const response = await handleAxios(axios.post("/auth/register", { email: "inavlid" }, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email must be a valid email");
  assert.equal(response.data.username, "username is required");
  assert.equal(response.data.password, "password is required");
}

// fails with short password
async function test2() {
  const response = await handleAxios(
    axios.post("/auth/register", { email: "inavlid", password: "1" }, { baseURL })
  );
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email must be a valid email");
  assert.equal(response.data.username, "username is required");
  assert.equal(response.data.password, "password must be more or equal than 5 charachters");
}

// registers
async function test3() {
  const response = await handleAxios(
    axios.post(
      "/auth/register",
      { email: "user1@e2e-test.com", password: "user1", username: "user1" },
      { baseURL }
    )
  );
  assert.equal(response.status, 200);
}

// gets data
async function test4() {
  const response = await handleAxios(axios.get("/e2e/info", { baseURL }));
  assert.equal(response.status, 200);
  assert.isArray(response.data.users);
  assert.isArray(response.data.verifications);
  assert.lengthOf(response.data.users, 1);
  assert.lengthOf(response.data.verifications, 1);
  setStore("user1", response.data.users[0]);
  setStore("verification1", response.data.verifications[0]);
}

// fails verification with empty
async function test5() {
  const response = await handleAxios(axios.post("/auth/register/verify", undefined, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email is required");
  assert.equal(response.data.token, "token is required");
}

// fails with wrong token
async function test6() {
  const user = getStore("user1");
  const response = await handleAxios(
    axios.post("/auth/register/verify", { email: user.email, token: "invalid token" }, { baseURL })
  );
  assert.equal(response.status, 401);
}

// verifies with data
async function test7() {
  const user = getStore("user1");
  const verification = getStore("verification1");
  const response = await handleAxios(
    axios.post("/auth/register/verify", { email: user.email, token: verification.token }, { baseURL })
  );
  assert.equal(response.status, 200);
  assert.isString(response.data.access_token);
  assert.isString(response.data.refresh_token);
  assert.isObject(response.data.data);
  assert.isString(response.data.data.id);
  assert.isString(response.data.data.username);

  setStore("user1_access_token", response.data.access_token);
  setStore("user1_refresh_token", response.data.refresh_token);
}

// gets profile
async function test8() {
  const response = await handleAxios(
    axios.get("/profile", { baseURL, headers: { Authorization: "Bearer " + getStore("user1_access_token") } })
  );
  assert.equal(response.status, 200);
}

// auth token throws error when it's wrong
async function test9() {
  const response = await handleAxios(
    axios.get("/profile", { baseURL, headers: { Authorization: "Bearer false token" } })
  );
  assert.equal(response.status, 401);
}

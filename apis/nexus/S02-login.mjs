import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";
import { setStore, getStore } from "./store.mjs";

export default async function main() {
  console.log("[SC01]\t\tuser logs in and rotates token");
  await test0();
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  await test6();
  await test7();
}

// fails with empty payload
async function test0() {
  const response = await handleAxios(axios.post("/auth/login", undefined, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email is required");
  assert.equal(response.data.password, "password is required");
}

// fails with invalid email
async function test1() {
  const response = await handleAxios(axios.post("/auth/login", { email: "inavlid" }, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email must be a valid email");
  assert.equal(response.data.password, "password is required");
}

// fails with short password
async function test2() {
  const response = await handleAxios(
    axios.post("/auth/login", { email: "inavlid", password: "1" }, { baseURL })
  );
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email must be a valid email");
  assert.equal(response.data.password, "password must be more or equal than 5 charachters");
}

// fails with wrong info
async function test3() {
  const user = getStore("user1");
  const response = await handleAxios(
    axios.post("/auth/login", { email: user.email, password: "wrongpassword" }, { baseURL })
  );
  assert.equal(response.status, 401);
}

// logs in
async function test4() {
  const user = getStore("user1");
  const response = await handleAxios(
    axios.post("/auth/login", { email: user.email, password: "testpassword" }, { baseURL })
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

// fails verification with empty
async function test5() {
  const response = await handleAxios(axios.post("/auth/register/verify", undefined, { baseURL }));
  assert.equal(response.status, 400);
  assert.equal(response.data.email, "email is required");
  assert.equal(response.data.token, "token is required");
}

// gets profile
async function test6() {
  const response = await handleAxios(
    axios.get("/profile", { baseURL, headers: { Authorization: "Bearer " + getStore("user1_access_token") } })
  );
  assert.equal(response.status, 200);
}

// auth token throws error when it's wrong
async function test7() {
  const response = await handleAxios(
    axios.get("/profile", { baseURL, headers: { Authorization: "Bearer false token" } })
  );
  assert.equal(response.status, 401);
}

import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";

export default async function main() {
  console.log("\n[SC00]\t\t\u001b[34mheartbeat works fine\u001b[0m");
  await test0();
  await test1();
}

async function test0() {
  const response = await handleAxios(axios.get("/", { baseURL }));
  assert.equal(response.status, 200);
  console.log("\t\theart beat responds");
}

async function test1() {
  const response = await handleAxios(axios.get("/", { baseURL }));
  assert.equal(response.status, 200);
  assert.isString(response.data.name);
  assert.isString(response.data.environment);
  assert.isNumber(response.data.time);
  console.log("\t\theartbeat has data");
}

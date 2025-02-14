import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL, keymakerPassword, keymakerUsername } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore, appendStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC05]\t\t\u001b[34mkeymaker can manage entities\u001b[0m");
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
  // searches for entities in system
  async function () {
    const response = await handleAxios(
      axios.get("/entities/search", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.page, 1);
    assert.equal(response.data.page_size, 10);
    assert.isNumber(response.data.total);
    assert.isArray(response.data.data);
    console.log("\t\tsearches for entities in system");
  },
  // search params are working
  async function () {
    const response = await handleAxios(
      axios.get("/entities/search", {
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
      axios.post("/entities/create", undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.base_url, "base_url is required");
    assert.equal(response.data.credit, "credit is required");
    assert.equal(response.data.description, "description is required");
    assert.equal(response.data.name, "name is required");
    assert.equal(response.data.status, "status is required");
    assert.equal(response.data.permission, "permission is required");
    console.log("\t\tfails with empty payload");
  },
  // creates an entity
  async function () {
    const response = await handleAxios(
      axios.post(
        "/entities/create",
        {
          name: "e2e-sc",
          base_url: baseURL + "/e2e/entity/interact",
          credit: 0,
          description: "some description for it",
          status: 1,
          permission: 1,
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);

    assert.isString(response.data.id);
    assert.isString(response.data.name);
    assert.isString(response.data.description);
    assert.isNumber(response.data.status);
    assert.isNumber(response.data.permission);
    assert.isString(response.data.base_url);
    assert.isNumber(response.data.credit);
    assert.isString(response.data.created_at);
    assert.isString(response.data.updated_at);

    appendStore("entities", response.data);
    setStore("random_entity", response.data);

    console.log("\t\tcreates an entity");
  },
  // updates the created entity
  async function () {
    const entity = getStore("random_entity");
    const response = await handleAxios(
      axios.post(
        "/entities/update/" + entity.id,
        {
          name: entity.name,
          base_url: entity.base_url,
          credit: 1050,
          description: entity.description,
          status: entity.status,
          permission: 2,
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);

    assert.isString(response.data.id);
    assert.isString(response.data.name);
    assert.isString(response.data.description);
    assert.isNumber(response.data.status);
    assert.isNumber(response.data.permission);
    assert.isString(response.data.base_url);
    assert.isNumber(response.data.credit);
    assert.isString(response.data.created_at);
    assert.isString(response.data.updated_at);

    assert.equal(response.data.credit, 1050);
    assert.equal(response.data.permission, 2);

    appendStore("entities", response.data);
    setStore("random_entity", response.data);

    console.log("\t\tcreates an entity");
  },
  // deletes the same entity
  async function () {
    const id = getStore("random_entity").id;
    const response = await handleAxios(
      axios.post("/entities/delete/" + id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);

    const entities = getStore("entities") || [];
    setStore(
      "entities",
      entities.filter((item) => item.id !== id)
    );
    setStore("random_entity", undefined);

    console.log("\t\tdeletes the same entity");
  },
];

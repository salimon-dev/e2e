import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL, keymakerPassword, keymakerUsername } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore } from "./store.mjs";

export default async function main() {
  console.log("\n[SC02]\t\t\u001b[34mkeymaker creates an invitation code for first users to login\u001b[0m");
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
  // searches for invitations in system
  async function () {
    const response = await handleAxios(
      axios.get("/invitations/search", {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.page, 1);
    assert.equal(response.data.page_size, 10);
    assert.isNumber(response.data.total);
    assert.isArray(response.data.data);
    console.log("\t\tsearches for invitations in system");
  },
  // search params are working
  async function () {
    const response = await handleAxios(
      axios.get("/invitations/search", {
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
      axios.post("/invitations/create", undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.usage_remaining, "usage_remaining is required");
    console.log("\t\tfails with empty payload");
  },
  // fails with no expires at
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          usage_remaining: 2,
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.expires_at, "expires_at is required");
    console.log("\t\tfails with no expires at");
  },
  // fails with no usage remaining
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          expires_at: new Date(),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.usage_remaining, "usage_remaining is required");
    console.log("\t\tfails with no usage remaining");
  },
  // fails with usage remaining minus 1
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          usage_remaining: -1,
          expires_at: new Date(),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.usage_remaining, "usage_remaining must be more or equal than 1 charachters");
    console.log("\t\tfails with usage remaining minus 0");
  },
  // fails with usage remaining minus 1
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          usage_remaining: -1,
          expires_at: new Date(),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.usage_remaining, "usage_remaining must be more or equal than 1 charachters");
    console.log("\t\tfails with usage remaining minus 1");
  },
  // creates an invitation
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          status: 1,
          usage_remaining: 3,
          expires_at: getDate(1000 * 3600 * 24),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.isString(response.data.code);
    assert.isNumber(response.data.usage_remaining);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("invitations", [...invitations, response.data]);
    setStore("random_invitation", response.data);

    console.log("\t\tcreates an invitation");
  },
  // deletes the same invitation
  async function () {
    const id = getStore("random_invitation").id;
    const response = await handleAxios(
      axios.post("/invitations/delete/" + id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      })
    );
    assert.equal(response.status, 200);

    const invitations = getStore("invitations") || [];
    setStore(
      "invitations",
      invitations.filter((item) => item.id !== id)
    );
    setStore("random_invitation", undefined);

    console.log("\t\tdeletes the same invitation");
  },
  // creates an active invitation with predefined code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          status: 1,
          code: "e2e-active",
          usage_remaining: 2,
          expires_at: getDate(1000 * 3600 * 24),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.isString(response.data.code);
    assert.isNumber(response.data.usage_remaining);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("invitations", [...invitations, response.data]);
    setStore("active_invitation", response.data);
    console.log("\t\tcreates an invitation with predefined code");
  },
  // fails to create same code for invitation
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          status: 2,
          code: "e2e-active",
          usage_remaining: 4,
          expires_at: getDate(1000 * 3600 * 24),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 400);
    assert.equal(response.data.code, "an invitation with the same code already exists");
    console.log("\t\tfails to create same code for invitation");
  },
  // creates an inactive invitation with predefined code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          status: 2,
          code: "e2e-invactive",
          usage_remaining: 4,
          expires_at: getDate(1000 * 3600 * 24),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.isString(response.data.code);
    assert.isNumber(response.data.usage_remaining);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("invitations", [...invitations, response.data]);
    console.log("\t\tcreates an inactive invitation with predefined code");
  },
  // creates an expired invitation with predefined code
  async function () {
    const response = await handleAxios(
      axios.post(
        "/invitations/create",
        {
          status: 1,
          code: "e2e-expired",
          usage_remaining: 4,
          expires_at: getDate(1000 * 3600 * 24 * -1),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.isString(response.data.code);
    assert.isNumber(response.data.usage_remaining);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("invitations", [...invitations, response.data]);
    setStore("expired_invitation", response.data);
    console.log("\t\tcreates an expired invitation with predefined code");
  },
  // updates the expired invitation record to inactive
  async function () {
    const invitation = getStore("expired_invitation");
    const response = await handleAxios(
      axios.post(
        "/invitations/update/" + invitation.id,
        {
          status: 2,
          usage_remaining: 2,
          expires_at: getDate(1000 * 3600 * 22 * -1),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.equal(response.data.status, 2);
    assert.equal(response.data.usage_remaining, 2);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("expired_invitation", response.data);
    console.log("\t\tupdates the expired invitation record to inactive");
  },
  // updates the expired invitation record back to active
  async function () {
    const invitation = getStore("expired_invitation");
    const response = await handleAxios(
      axios.post(
        "/invitations/update/" + invitation.id,
        {
          status: 2,
          usage_remaining: 2,
          expires_at: getDate(1000 * 3600 * 22 * -1),
        },
        {
          baseURL,
          headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
        }
      )
    );
    assert.equal(response.status, 200);
    assert.isString(response.data.id);
    assert.isString(response.data.created_by);
    assert.equal(response.data.status, 2);
    assert.equal(response.data.usage_remaining, 2);
    assert.isString(response.data.created_by);
    assert.isString(response.data.updated_at);

    const invitations = getStore("invitations") || [];
    setStore("expired_invitation", response.data);
    console.log("\t\tupdates the expired invitation record back to active");
  },
];

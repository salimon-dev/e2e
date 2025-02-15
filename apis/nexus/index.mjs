import { assert, AssertionError } from "chai";
import axios from "axios";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";
import { getStore } from "./store.mjs";

// http scenarios
import heartbeat from "./S00-heatbeat.mjs";
import admin from "./S01-admin.mjs";
import invitations from "./S02-invitations.mjs";
import register from "./S03-register.mjs";
import login from "./S04-login.mjs";
import entities from "./S05-entities.mjs";
import users from "./S06-users.mjs";
// websocket scenarios
import wsBasic from "./S41-ws-basic.mjs";
import { cleanUp } from "./cleanup.mjs";

// async function resetData() {
//   console.log("\x1b[32m[CORE]\x1b[0m\t\treseting data");
//   const response = await handleAxios(axios.post("/e2e/reset", undefined, { baseURL }));
//   assert.equal(response.status, 200);
//   console.log("\x1b[32m[CORE]\x1b[0m\t\tdata reset");
// }

async function main() {
  try {
    // await resetData();

    await heartbeat();
    await admin();
    await invitations();
    await register();
    await login();
    await entities();
    await users();
    await wsBasic();

    console.log("\n\x1b[32m[CORE]\x1b[0m\t\tall tests finished");
    // await resetData();
  } catch (error) {
    if (error instanceof AssertionError) {
      const [message, ...stackTrace] = error.stack.split("\n");
      const location = stackTrace[0]?.trim(); // First stack trace line
      console.log("\n\t\t\x1b[31mError\x1b[0m");
      console.log(`\t\texpected:\t\x1b[32m${error.expected}\x1b[0m but got \x1b[32m${error.actual}\x1b[0m`);
      // console.log(`Error message: ${error.message}`);
      console.log(`\t\tat:\t\t${location}`);
    } else {
      console.log(error);
    }
  } finally {
    try {
      await cleanUp();
    } catch (error) {
      // console.log(error);
      console.log("\t\tcleanup failed");
    }
  }
}

main();

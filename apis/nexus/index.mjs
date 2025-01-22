import { assert, AssertionError } from "chai";
import axios from "axios";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";

// scenarios
import heartbeat from "./S00-heatbeat.mjs";
import register from "./S01-register.mjs";
import login from "./S02-login.mjs";

async function resetData() {
  const response = await handleAxios(axios.post("/e2e/reset", undefined, { baseURL }));
  assert.equal(response.status, 200);
}

async function main() {
  try {
    console.log("\x1b[32m[CORE]\x1b[0m\t\treseting data");
    await resetData();
    console.log("\x1b[32m[CORE]\x1b[0m\t\tdata reset");

    await heartbeat();
    await register();
    await login();

    console.log("\x1b[32m[CORE]\x1b[0m\t\tall tests finished");
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
  }
}

main();

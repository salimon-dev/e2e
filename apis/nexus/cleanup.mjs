import { setStore, getStore } from "./store.mjs";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import axios from "axios";

export async function cleanUp() {
  console.log("\n\x1b[32m[CORE]\x1b[0m\t\t\u001b[34mclean up progress\u001b[0m");
  const accessToken = getStore("keymaker_access_token");
  const invitations = getStore("invitations") || [];
  console.log("\t\tdeleting invitation records");
  for (let i = 0; i < invitations.length; i++) {
    try {
      await axios.post("/invitations/delete/" + invitations[i].id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      });
    } catch {
      console.log(`\t\tfailed to delete invitation ${invitations[i].id}`);
      console.log(invitations[i]);
    }
  }
  console.log("\t\tinvitation records deleted");

  const users = getStore("users") || [];
  console.log("\t\tdeleting user records");
  for (let i = 0; i < users.length; i++) {
    try {
      await axios.post("/users/delete/" + users[i].id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      });
    } catch {
      console.log(`\t\tfailed to delete user ${users[i].id}`);
      console.log(users[i]);
    }
  }
  console.log("\t\tuser records deleted");

  const entities = getStore("entities") || [];
  console.log("\t\tdeleting entity records");
  for (let i = 0; i < entities.length; i++) {
    try {
      await axios.post("/entities/delete/" + entities[i].id, undefined, {
        baseURL,
        headers: { Authorization: "Bearer " + getStore("keymaker_access_token") },
      });
    } catch {
      console.log(`\t\tfailed to delete entity ${entities[i].id}`);
      console.log(entities[i]);
    }
  }
  console.log("\t\tentity records deleted");

  console.log("\n\x1b[32m[CORE]\x1b[0m\t\t\u001b[34mclean up progress completed\u001b[0m");
}

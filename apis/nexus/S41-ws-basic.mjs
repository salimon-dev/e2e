import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios, wait } from "../helpers.mjs";
import { setStore, getStore } from "./store.mjs";
import WebSocket from "ws";

async function createConnection() {
  return new Promise((resolve) => {
    const ws = new WebSocket(baseURL + "/sck");
    ws.on("open", () => {
      resolve(ws);
    });
  });
}

export default async function main() {
  console.log("\n[SC41]\t\t\u001b[34mconnects to websocket connection and logs in\u001b[0m");
  const ws = await createConnection();
  for (let i = 0; i < tests.length; i++) {
    await tests[i](ws);
    await wait(50);
  }
  ws.close();
}

const tests = [
  // pings
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = data.toString();
          assert.equal(msg, "pong");
          resolve();
          console.log("\t\tping works");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send("ping");
    });
  },
  // fails to authenticate with no access token
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "ERROR");
          assert.equal(msg.message, "invalid payload");
          resolve();
          console.log("\t\tfails auth with no access token");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "AUTH" }));
    });
  },
  // fails to authenticate with invalid access token
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "AUTH");
          assert.equal(msg.result, false);
          resolve();
          console.log("\t\tfails auth with invalid access token");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "AUTH", access_token: "invalidtoken" }));
    });
  },
  // fails to authenticate with refresh token
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "AUTH");
          assert.equal(msg.result, false);
          resolve();
          console.log("\t\tfails auth with invalid refresh token");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "AUTH", access_token: getStore("user1_refresh_token") }));
    });
  },
  // authenticates with access token
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "AUTH");
          assert.equal(msg.result, true);
          resolve();
          console.log("\t\tsuccess auth with access token");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "AUTH", access_token: getStore("user1_access_token") }));
    });
  },
  // fails to send message when no entity connected
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "ERROR");
          assert.equal(msg.message, "no entity connected");
          resolve();
          console.log("\t\tfails to send message when no entity connected");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "MESSAGE", body: "test body" }));
    });
  },
  // fails to connect with no entity id
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "ERROR");
          assert.equal(msg.message, "invalid payload");
          resolve();
          console.log("\t\tfails to connect with no entity id");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "CONNECT" }));
    });
  },
  // connects to e2e entity
  function (ws) {
    return new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          assert.equal(msg.action, "CONNECT");
          assert.equal(msg.result, true);
          resolve();
          console.log("\t\tconnects to e2e entity");
        } catch (err) {
          reject(err);
          ws.close();
        }
      });
      ws.send(JSON.stringify({ action: "CONNECT", entity: "e2e" }));
    });
  },
  // sends message to entity
  async function (ws) {
    return new Promise((resolve, reject) => {
      const message = "this is a new message";
      const tokens = message.split(" ");
      const packets = [];
      let pos = 0;
      packets.push({
        action: "TOKEN_START",
      });
      for (let i = 0; i < tokens.length; i++) {
        packets.push({
          action: "TOKEN",
          token: tokens[i],
        });
      }
      packets.push({
        action: "TOKEN_END",
      });

      function expectPacket(data) {
        const msg = JSON.parse(data.toString());
        try {
          assert.deepEqual(msg, packets[pos]);
        } catch (error) {
          ws.close();
          reject(error);
        }
        pos++;
        if (pos === packets.length) {
          ws.removeListener("message", expectPacket);
          console.log("\t\t- received all packets");
          resolve();
        }
      }
      ws.on("message", expectPacket);

      console.log("\t\tsending message to entity");
      ws.send(JSON.stringify({ action: "MESSAGE", body: message }));
    });
  },
];

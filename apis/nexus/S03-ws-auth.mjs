import axios from "axios";
import { assert } from "chai";
import { nexusBaseUrl as baseURL } from "../configs.mjs";
import { handleAxios } from "../helpers.mjs";
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
  console.log("\n[SC03]\t\t\u001b[34mconnects to websocket connection and logs in\u001b[0m");
  const ws = await createConnection();
  for (let i = 0; i < tests.length; i++) {
    await tests[i](ws);
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
    const tokens = ["this", "is", "a", "new", "message"];
    function expectToken(index) {
      return new Promise((resolve, reject) => {
        ws.once("message", (data) => {
          try {
            const msg = JSON.parse(data.toString());
            assert.equal(msg.action, "TOKEN");
            assert.equal(msg.token, tokens[index]);
            resolve();
          } catch (err) {
            reject(err);
            ws.close();
          }
        });
      });
    }
    console.log("\t\tsending message to entity");
    ws.send(JSON.stringify({ action: "MESSAGE", body: "test body" }));
    for (let i = 0; i < tokens.length; i++) {
      await expectToken(i);
      console.log(`\t\treceived token ${i + 1}/${tokens.length}`);
    }
  },
];

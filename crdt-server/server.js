import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const PORT = process.env.PORT || 1234;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

console.log(`y-websocket listening on ws://localhost:${PORT}`);

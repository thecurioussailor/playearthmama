import { WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({port: 3001});

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
    ws.send("You are connected to websocket server");
}) 
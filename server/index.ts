import Fastify from "fastify";
import path from "node:path";
import statc from "@fastify/static";
import { Server, type Socket } from "socket.io";

const server = Fastify({
	logger: {
		name: "static",
	},
});
server.register(statc, {
	root: path.join(import.meta.dirname, "..", "public"),
});

server.get("/getIP", (req, res) => {
	return { ip: "localhost", region: "...", port: "1119" };
});

server.listen({ port: 1118 });

const io = new Server({});

io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);
	socket.conn.on("packet", ({ type, data }) => {
        if (data.includes("ping1") || data.includes("hdt")) return;
        console.log("packet");
        console.log(type);
        console.log(data);
    });
    socket.on("ping1", () => {
        socket.emit("pong1");
    });
    socket.on("create", () => {
        socket.emit("cSrvRes", "DEV", true);
        socket.emit("gameSetup", JSON.stringify({ width: 50, height: 50, mapData: { gameMode: 0, clutter: [], genData: { width: 50, height: 50, data: {} } }, usersInRoom: [], you: {}}), true)
    })
});

io.listen(1119);

import Fastify from "fastify";
import path from "node:path";
import statc from "@fastify/static";
import cors from "@fastify/cors";
import { Server, type Socket } from "socket.io";

const server = Fastify({
	logger: {
		name: "static",
		level: "warn",
	},
});
server.register(cors, {
	origin: /localhost:1118|localhost:1119/
})
server.register(statc, {
	root: path.join(import.meta.dirname, "..", "public"),
});

server.get("/getIP", (req, res) => {
	return { ip: "localhost", region: "...", port: "1119" };
});

server.listen({ port: 1118 });

const io = new Server({
	cors: {
		origin: "http://localhost:1118",
		methods: ["GET"]
	}
});
io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);
	socket.emit("welcome", { id: 0, room: "DEV" }, {});
	socket.on("create", () => {
		
	})

	socket.conn.on("packet", ({ type, data }) => {
		if (data?.includes("ping1") || data?.includes("hdt") || data?.includes('2["0",')) return;
		console.log(data);
	});

	socket.on("cht", (msg, type) => {
		socket.emit("cht", [-1, "blehhhhh"]);
		socket.emit("5", "woah!!!");
	});
	socket.on("ping1", () => {
		socket.emit("pong1");
	});
	socket.on("gotit", (...args) => {
		console.log("got it");
		console.log(JSON.stringify(args));
	});
	socket.on("disconnect", (e) => {
		console.log("disconnected");
	});
	socket.on("respawn", () => {
		socket.emit(
			"gameSetup",
			JSON.stringify({
				width: 10,
				height: 10,
				mapData: {
					gameMode: 0,
					clutter: [],
					genData: { width: 1, height: 1, data: [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], ] },
					pickups: [],
				},
				maxScreenWidth: 10000,
				maxScreenHeight: 10000,
				viewMult: 100,
				tileScale: 1,
				usersInRoom: [],
				you: { index: 0, weapons: [{}, {}, {}], currentWeapon: 0, x: 0, y: 0, dead: false, speed: 0 },
			}),
			true,
			true,
		);
		socket.emit("rsd", [4, 0, 0, 0]);
		socket.emit("tprt", { indx: 0, newX: 0, newY: 0 })
	})
});

io.listen(1119);

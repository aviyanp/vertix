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

let players = [];
let gameMap = { "width": 16, "height": 16, "data": [255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255] };
let tileScale = 256;

io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);

	let smg = {
		weaponIndex: 0,
		ammo: 30,
		maxAmmo: 30,
		fireRate: 20,
		reloadTime: 10,
		width: 30,
		length: 90,
		yOffset: 55,
		holdDist: 5,
		lastShot: 0,
	}

	let grenades = {
		weaponIndex: 5,
		ammo: 30,
		maxAmmo: 30,
		fireRate: 20,
		reloadTime: 10,
		width: 30,
		length: 90,
		yOffset: 55,
		holdDist: 5,
		lastShot: 0,
	}

	let player = {
		index: players.length,
		name: "Guest_" + JSON.stringify(players.length),
		account: false,
		classIndex: 0,
		currentWeapon: 0,
		weapons: [ smg, grenades ],
		health: 0,
		height: 100,
		width: 50,
		speed: 0.5,
		jumpY: 0,
		jumpDelta: 0,
		jumpStrength: 0.72,
		gravityStrength: 0.0058,
		jumpCountdown: 0,
		frameCountdown: 0,
		score: 0,
		angle: 0,
		x: 0,
		y: 0,
		nameYOffset: 0,
		dead: true,
		type: "player",
		team: "blue",
	};
	players.push(player)

	socket.emit("welcome", { id: 0, room: "DEV" }, {});
	socket.on("create", (room, servPass, lgKey, userName) => {

	})

	socket.conn.on("packet", ({ type, data }) => {
		if (data?.includes("ping1") || data?.includes("hdt") || data?.includes('2["0",')) return;
		console.log(type, data);
	});

	socket.on("cht", (msg, type) => {
		socket.emit("cht", [-1, "blehhhhh"]);
		socket.emit("5", "woah!!!");
	});
	socket.on("ping1", () => {
		socket.emit("pong1");
	});
	socket.on("gotit", (lobby, unknown, currentTime) => {
		console.log("gotit", lobby, unknown, currentTime);
	});
	socket.on("ftc", (playerIdx) => {
		socket.emit("add", JSON.stringify(players[playerIdx]));
	});
	socket.on("disconnect", () => {
		io.emit("rem", player.index);
		players.splice(players.indexOf(player), 1);
		console.log("disconnected");
	});
	socket.on("respawn", () => {
		player.dead = false;
		player.health = 100;
		player.angle = 0;
		player.x = 128;
		player.y = 128;

		const gameSetup = {
			mapData: {
				gameMode: {
					name: "Team Deathmatch",
					score: 50,
					desc1: "you are team RED",
					desc2: "you are team BLUE"
				},
				clutter: [],
				genData: gameMap,
				pickups: [],
				width: (gameMap.width - 4) * tileScale,
				height: (gameMap.height - 4) * tileScale,
			},

			maxScreenWidth: 1920,
			maxScreenHeight: 1080,
			viewMult: 1,
			tileScale: tileScale,

			usersInRoom: players,
			you: player
		};

		socket.emit("gameSetup", JSON.stringify(gameSetup), true, true,);
		socket.emit("rsd", [
			5,
			player.index,
			player.x,
			player.y,
			player.angle,
		]);
		socket.emit("add", JSON.stringify(player));
	});

	//TODO: socket.emit stuff
	//socket.emit("upd", {})  //updateUserValue
	//socket.emit("2", {})   //someoneShot
	//socket.emit("r", {})   //currentWeapon
	//socket.emit("jum", {}) //otherJump
	//socket.emit("tprt", { indx: 0, newX: 0, newY: 0 })

	//TODO: socket.on stuff
	socket.on("0", (targetF) => { //mouse pos
		//console.log(targetF)
	});
	socket.on("1", (x, y, jumpY, targetF, targetD, currentTime) => { //mouse inputs
		//console.log("1", x, y, jumpY, targetF, targetD, currentTime);
	});
	socket.on("4", (data) => { //keyboard inputs
		let horizontalDT = data.hdt
		let verticalDT = data.vdt
		let currentTime = data.ts
		let inputNumber = data.isn
		let space = data.s
		//console.log("4", horizontalDT, verticalDT, currentTime, inputNumber, space);
	});
	socket.on("sw", (currentWeapon) => { //switch weapon
		//console.log(currentWeapon)
	});
	socket.on("r", () => { //reload

	});
});

io.listen(1119);

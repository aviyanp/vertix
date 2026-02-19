import path from "node:path";
import cors from "@fastify/cors";
import statc from "@fastify/static";
import Fastify from "fastify";
import { Server, type Socket } from "socket.io";
//import { wallCol } from "core/src/app.ts";

const server = Fastify({
	logger: {
		name: "static",
		level: "warn",
	},
});
server.register(cors, {
	origin: /localhost:1118|localhost:1119/,
});
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
		methods: ["GET"],
	},
});

let players = [];
let tileScale = 256;
// biome-ignore format: temp map data
let genData = { "width": 16, "height": 16, "data": [255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255] };
// TODO: generate tiles from genData through setupMap()
let tiles = [];
// TODO: auto generate clutter
let clutter = [
	{
		i: 0,
		x: 128 + tileScale,
		y: 128,
		w: 64,
		h: 64,
		active: true,
	},
]

io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);

	let smg = {
		weaponIndex: 0,
		dmg: 20,
		ammo: 24,
		maxAmmo: 24,
		reloadTime: 0,
		reloadSpeed: 800,
		fireRate: 143,
		spread: [0, 0, 0],
		spreadIndex: 0,
		width: 30,
		length: 90,
		yOffset: 55,
		holdDist: 5,

		bSpeed: 6,
		bWidth: 8,
		bHeight: 18,
		bRandScale: [0, 0],
		cAcc: 12,
		maxLife: 500,
		bulletsPerShot: 1,
		pierceCount: 1,
		bounce: false,
		distBased: false,
		explodeOnDeath: false,
		bDist: 48,
		bTrail: 2,
		bSprite: 0,
		glowWidth: 50,
		glowHeight: 100,
		shake: 0.4,
		lastShot: 0,
	};

	let grenades = {
		weaponIndex: 5,
		dmg: 110,
		ammo: 1,
		maxAmmo: 1,
		reloadTime: 0,
		reloadSpeed: 7500,
		fireRate: 92,
		spread: [0, 0, 0],
		spreadIndex: 0,
		width: 30,
		length: 90,
		yOffset: 55,
		holdDist: 5,

		bSpeed: 2,
		bWidth: 24,
		bHeight: 24,
		bRandScale: [0, 0],
		cAcc: 12,
		maxLife: 800,
		bulletsPerShot: 1,
		pierceCount: 1,
		bounce: true,
		distBased: false,
		explodeOnDeath: true,
		bDist: 48,
		bTrail: 0,
		bSprite: 0,
		glowWidth: 50,
		glowHeight: 100,
		shake: 0.4,
		lastShot: 0,
	};

	let player = {
		id: 0,
		room: "DEV",
		index: players.length,
		name: "Guest_" + JSON.stringify(players.length),
		account: { clan: "" },
		classIndex: 0,
		currentWeapon: 0,
		weapons: [smg, grenades],
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
		oldX: 0,
		oldY: 0,
		spawnProtection: 0,
		nameYOffset: 0,
		dead: true,
		type: "player",
		targetF: 0,
		//team: "blue/red",
	};
	players.push(player);

	socket.emit(
		"welcome",
		{
			id: player.id,
			room: player.room,
			name: player.name,
			classIndex: player.classIndex,
		},
		true,
	);

	socket.conn.on("packet", ({ type, data }) => {
		//if (data?.includes("ping1") || data?.includes("hdt") || data?.includes('2["0",')) return;
		//console.log(type, data);
	});

	socket.on("cht", (msg, type) => {
		if (msg.includes("!sync")) {
			io.emit(
				"rsd",
				players
					.map((player) => [5, player.index, player.x, player.y, player.angle])
					.flat(),
			);
			socket.emit("cht", [-1, "synced"]);
			return;
		}
		io.emit("cht", ([ player.index, msg ]))
	});
	socket.on("ping1", () => {
		socket.emit("pong1");
	});
	socket.on("gotit", (client, init, currentTime) => {
		console.log("gotit", client, init, currentTime);
		player.name = client.name ? client.name : player.name;
		player.classIndex = client.classIndex
			? client.classIndex
			: player.classIndex;
		if (init) return;

		player.dead = false;
		player.health = 100;
		player.angle = 0;
		player.x = 128;
		player.y = 128;

		const gameSetup = {
			mapData: {
				gameMode: {
					code: "ffa",
					name: "Free For All",
					score: 1500,
					desc1: "Free For All",
					desc2: "",
					teams: false,
				},
				clutter: clutter,
				genData: genData,
				pickups: [
					{
						i: 0,
						x: 128,
						y: 128 + tileScale,
						scale: 64,
						active: true,
					},
				],
				width: (genData.width - 4) * tileScale,
				height: (genData.height - 4) * tileScale,
			},

			maxScreenWidth: 1920,
			maxScreenHeight: 1080,
			viewMult: 1,
			tileScale: tileScale,

			usersInRoom: players,
			you: player,
		};

		socket.emit("gameSetup", JSON.stringify(gameSetup), true, true);

		io.emit("add", JSON.stringify(player));
		io.emit(
			"rsd",
			players
				.map((player) => [5, player.index, player.x, player.y, player.angle])
				.flat(),
		);
	});
	// socket.on("ftc", (playerIdx) => {
	// 	io.emit("rsd", [
	// 		5,
	// 		players[playerIdx].index,
	// 		players[playerIdx].x,
	// 		players[playerIdx].y,
	// 		players[playerIdx].angle,
	// 	]);
	// });
	socket.on("disconnect", () => {
		io.emit("rem", player.index);
		players.splice(players.indexOf(player), 1);
		console.log("disconnected");
	});
	socket.on("respawn", () => {
		socket.emit(
			"welcome",
			{
				id: player.id,
				room: player.room,
				name: player.name,
				classIndex: player.classIndex,
			},
			false,
		);
	});
	socket.on("sw", (currentWeapon) => {
		player.currentWeapon = currentWeapon;
	});
	socket.on("r", () => {
		socket.emit("r", player.currentWeapon);
	});
	socket.on("0", (targetF) => {
		player.targetF = targetF;
	});

	//TODO: socket.emit stuff
	//socket.emit("upd", {})  //updateUserValue
	//socket.emit("2", {})   //someoneShot
	//socket.emit("jum", {}) //otherJump
	//socket.emit("tprt", { indx: 0, newX: 0, newY: 0 })

	//TODO: socket.on stuff
	socket.on("1", (x, y, jumpY, targetF, targetD, currentTime) => {
		//bullet info
		//console.log("1", x, y, jumpY, targetF, targetD, currentTime);
	});
	// example
	/*
[
    {
        "hdt": 0,
        "vdt": 0,
        "ts": 1771275940411,
        "isn": 391,
        "s": 0,
        "delta": 33
    }
]
	*/
	socket.on("4", (data) => {
		//keyboard inputs
		let horizontalDT = data.hdt;
		let verticalDT = data.vdt;
		let currentTime = data.ts;
		let inputNumber = data.isn;
		let space = data.s;
		let delta = data.delta;
		//var e = Math.sqrt(horizontalDT * horizontalDT + verticalDT * verticalDT);
		//if (e != 0) {
		//	horizontalDT /= e;
		//	verticalDT /= e;
		//}
		player.oldX = player.x;
		player.oldY = player.y;
		player.x += horizontalDT * player.speed * delta;
		player.y += verticalDT * player.speed * delta;
		player.angle =
			((player.targetF + Math.PI * 2) % (Math.PI * 2)) * (180 / Math.PI) + 90;
		//wallCol(player, {tiles}, {clutter});
		player.x = Math.round(player.x);
		player.y = Math.round(player.y);
		io.emit(
			"rsd",
			players
				.map((pl) => [6, pl.index, pl.x, pl.y, pl.angle, inputNumber])
				.flat(),
		);
		//console.log("4", horizontalDT, verticalDT, currentTime, inputNumber, space, delta);
	});
	socket.on("create", (lobby) => {});
});

io.listen(1119);

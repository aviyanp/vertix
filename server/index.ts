import path from "node:path";
import cors from "@fastify/cors";
import statc from "@fastify/static";
import Fastify from "fastify";
import { Server, type Socket } from "socket.io";
import {
	setupMap,
	wallCol,
	getCurrentWeapon,
	roundNumber,
} from "core/src/utils.ts";
import { characterClasses, weapons } from "core/src/loadouts.ts";

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
let mapTileScale = 256;
// biome-ignore format: temp map data
let genData = { "width": 16, "height": 16, "data": [255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255] };
let tiles: any[] = [];
// TODO: auto generate clutter
let clutter = [
	{
		i: 0,
		x: 128 + mapTileScale,
		y: 128,
		w: 64,
		h: 64,
		active: true,
	},
];
let mapData = {
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
			y: 128 + mapTileScale,
			scale: 64,
			active: true,
		},
	],
	tiles: tiles,
	width: (genData.width - 4) * mapTileScale,
	height: (genData.height - 4) * mapTileScale,
};
setupMap(mapData, mapTileScale);

io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);

	let player = {
		id: 0,
		room: "DEV",
		index: players.length,
		name: `Guest_${JSON.stringify(players.length)}`,
		account: { clan: "" },
		classIndex: 0,
		currentWeapon: 0,
		weapons: [weapons[0], weapons[5]],
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
		animIndex: 0,
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
					.flatMap((player) => [5, player.index, player.x, player.y, player.angle]),
			);
			socket.emit("cht", [-1, "synced"]);
			return;
		}
		io.emit("cht", [player.index, msg]);
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
		const currentClass = characterClasses[player.classIndex];
		player.currentWeapon = 0 //currentClass.weaponIndexes[0];
		player.weapons = [weapons[0], weapons[5]] //currentClass.weaponIndexes.map(i => weapons[i]);
		player.health = currentClass.health;
		player.height = currentClass.height;
		player.width = currentClass.width;
		player.speed = currentClass.speed;
		if (init) return;

		player.dead = false;
		player.angle = 0;
		player.x = 128;
		player.y = 128;

		const gameSetup = {
			mapData: mapData,

			maxScreenWidth: 1920,
			maxScreenHeight: 1080,
			viewMult: 1,
			tileScale: mapTileScale,

			usersInRoom: players,
			you: player,
		};

		socket.emit("gameSetup", JSON.stringify(gameSetup), true, true);

		io.emit("add", JSON.stringify(player));
		io.emit(
			"rsd",
			players
				.flatMap((player) => [5, player.index, player.x, player.y, player.angle]),
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
	//socket.emit("tprt", { indx: 0, newX: 0, newY: 0 })

	//TODO: socket.on stuff
	socket.on("1", (x, y, jumpY, targetF, targetD, currentTime) => {
		getCurrentWeapon(player).spreadIndex++;
		if (
			getCurrentWeapon(player).spreadIndex >=
			getCurrentWeapon(player).spread.length
		) {
			getCurrentWeapon(player).spreadIndex = 0;
		}
		var d =
			getCurrentWeapon(player).spread[getCurrentWeapon(player).spreadIndex];
		d = roundNumber(targetF + Math.PI + d, 2);
		var e = getCurrentWeapon(player).holdDist + getCurrentWeapon(player).bDist;
		var f = Math.round(x + e * Math.cos(d));
		e = Math.round(
			y - getCurrentWeapon(player).yOffset - jumpY + e * Math.sin(d),
		);
		io.emit("2", {
			i: player.index,
			x: f,
			y: e,
			d: d,
			si: -1,
		});
		//console.log("1", x, y, jumpY, targetF, targetD, currentTime);
	});
	socket.on("4", (data) => {
		let horizontalDT = data.hdt;
		let verticalDT = data.vdt;
		//let currentTime = data.ts;
		let inputNumber = data.isn;
		let space = data.s;
		let delta = data.delta;
		var e = Math.sqrt(horizontalDT * horizontalDT + verticalDT * verticalDT);
		if (e !== 0) {
			horizontalDT /= e;
			verticalDT /= e;
		}
		player.oldX = player.x;
		player.oldY = player.y;
		player.x += horizontalDT * player.speed * delta;
		player.y += verticalDT * player.speed * delta;
		player.angle =
			((player.targetF + Math.PI * 2) % (Math.PI * 2)) * (180 / Math.PI) + 90;
		if (player.jumpCountdown > 0) {
			player.jumpCountdown -= delta;
		} else if (space === 1) {
			io.emit("jum", player.index);
			player.jumpDelta -= player.gravityStrength * delta;
			player.jumpY += player.jumpDelta * delta;
		}
		if (player.jumpY !== 0) {
			player.jumpDelta -= player.gravityStrength * delta;
			player.jumpY += player.jumpDelta * delta;
			if (player.jumpY > 0) {
				player.animIndex = 1;
			} else {
				player.jumpY = 0;
				player.jumpDelta = 0;
				player.jumpCountdown = 250;
			}
			player.jumpY = Math.round(player.jumpY);
		}
		wallCol(player, { tiles }, { clutter });
		player.x = Math.round(player.x);
		player.y = Math.round(player.y);
		io.emit(
			"rsd",
			players
				.flatMap((pl) => [6, pl.index, pl.x, pl.y, pl.angle, inputNumber]),
		);
		//console.log("4", horizontalDT, verticalDT, currentTime, inputNumber, space, delta);
	});
	socket.on("create", (lobby) => {});
});

io.listen(1119);

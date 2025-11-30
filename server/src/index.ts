// Entry point for Vertix.io modular server
// This is the main server setup file

import Fastify from "fastify";
import path from "node:path";
import statc from "@fastify/static";
import cors from "@fastify/cors";
import { Server } from "socket.io";

// Import modular components
import { SocketHandler } from "./network/SocketHandler.ts";
import { SERVER_CONFIG } from "./config/gameConfig.ts";

// Re-export types (excluding Tile interface to avoid conflict)
export type {
	Team,
	ChatType,
	GameModeType,
	Vector2D,
	Position,
	Tile as TileInterface,
	MapGenData,
	MapData,
	GameModeConfig,
	WeaponStats,
	WeaponInstance,
	CharacterClass,
	ProjectileData,
	PlayerInput,
	PlayerState,
	PlayerAccount,
	BaseGameObject,
	ClutterObject,
	FlagObject,
	PickupObject,
	GameObject,
	GameRoomConfig,
	GameRoomState,
	LeaderboardEntry,
	ChatMessage,
	MovementInput,
	ShootInput,
	CreateRoomInput,
	DamageEvent,
	DeathEvent,
	WelcomeData,
	GameSetupData,
	StateUpdateArray,
	TeleportEvent,
} from "./types/index.ts";

// Export configuration
export * from "./config/gameConfig.ts";

// Export map module
export { Tile } from "./map/Tile.ts";
export { MapParser } from "./map/MapParser.ts";
export { GameMap } from "./map/GameMap.ts";

// Export physics module
export { Movement } from "./physics/Movement.ts";
export { CollisionDetection } from "./physics/CollisionDetection.ts";
export { PhysicsEngine } from "./physics/PhysicsEngine.ts";

// Export weapons module
export {
	WEAPON_INDICES,
	WEAPON_NAMES,
	WEAPON_DATA,
	getWeaponStats,
	getWeaponStatsByName,
	getAllWeaponNames,
} from "./weapons/weaponData.ts";
export { Weapon } from "./weapons/Weapon.ts";
export { Projectile } from "./weapons/Projectile.ts";
export { WeaponManager } from "./weapons/WeaponManager.ts";

// Export classes module
export {
	CHARACTER_CLASSES,
	SPECIAL_CLASSES,
	getCharacterClass,
	getCharacterClassByName,
	getAllCharacterClasses,
	getPlayableClassCount,
	isValidClassIndex,
	getClassWeaponIndexes,
	getClassFolderName,
	classHasDownAnimation,
} from "./classes/CharacterClasses.ts";

// Export entities module
export { Player } from "./entities/Player.ts";
export {
	createClutterObject,
	createFlagObject,
	createHealthPickup,
	createLootCrate,
	Clutter,
	Flag,
	Pickup,
} from "./entities/GameObjects.ts";
export { EntityManager } from "./entities/EntityManager.ts";

// Export game module
export { TeamManager } from "./game/TeamManager.ts";
export { GameMode } from "./game/GameMode.ts";
export { Leaderboard } from "./game/Leaderboard.ts";
export { GameLoop } from "./game/GameLoop.ts";
export type { TickCallback } from "./game/GameLoop.ts";
export { GameRoom } from "./game/GameRoom.ts";

// Export chat module
export { ChatManager } from "./chat/ChatManager.ts";

// Export network module
export { InputHandler } from "./network/InputHandler.ts";
export { StateSync } from "./network/StateSync.ts";
export { SocketHandler } from "./network/SocketHandler.ts";

/**
 * Get port from environment or use default
 */
function getPort(envVar: string, defaultPort: number): number {
	const envPort = process.env[envVar];
	if (envPort) {
		const parsed = parseInt(envPort, 10);
		if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
			return parsed;
		}
	}
	return defaultPort;
}

/**
 * Start the Vertix.io server
 */
async function startServer(): Promise<void> {
	const httpPort = getPort("HTTP_PORT", SERVER_CONFIG.DEFAULT_HTTP_PORT);
	const gamePort = getPort("PORT", SERVER_CONFIG.DEFAULT_PORT);

	// =========================================
	// HTTP Server Setup (Fastify)
	// =========================================
	const httpServer = Fastify({
		logger: {
			level: process.env.LOG_LEVEL || "info",
		},
	});

	// Register CORS
	await httpServer.register(cors, {
		origin: new RegExp(`localhost:${httpPort}|localhost:${gamePort}`),
	});

	// Serve static files
	await httpServer.register(statc, {
		root: path.join(import.meta.dirname, "..", "..", "public"),
	});

	// API endpoint for server discovery
	httpServer.get("/getIP", () => {
		return {
			ip: "localhost",
			region: process.env.REGION || "local",
			port: gamePort.toString(),
		};
	});

	// Health check endpoint
	httpServer.get("/health", () => {
		return { status: "ok", timestamp: Date.now() };
	});

	// Server info endpoint
	httpServer.get("/info", () => {
		return {
			name: "Vertix.io Server",
			version: "1.0.0",
			tickRate: SERVER_CONFIG.TICK_RATE,
			maxPlayersPerRoom: SERVER_CONFIG.MAX_PLAYERS_PER_ROOM,
		};
	});

	// Start HTTP server
	await httpServer.listen({ port: httpPort, host: "0.0.0.0" });
	console.log(`HTTP server listening on port ${httpPort}`);

	// =========================================
	// Game Server Setup (Socket.IO)
	// =========================================
	const io = new Server({
		cors: {
			origin: `http://localhost:${httpPort}`,
			methods: ["GET", "POST"],
		},
	});

	// Initialize socket handler with modular components
	const socketHandler = new SocketHandler(io);

	// Start Socket.IO server
	io.listen(gamePort);
	console.log(`Game server listening on port ${gamePort}`);
	console.log(`Server tick rate: ${SERVER_CONFIG.TICK_RATE} ticks/second`);

	// =========================================
	// Graceful Shutdown
	// =========================================
	const shutdown = async (): Promise<void> => {
		console.log("\nShutting down server...");

		// Stop all rooms
		for (const room of socketHandler.getAllRooms()) {
			room.stop();
		}

		// Close Socket.IO
		io.close();

		// Close HTTP server
		await httpServer.close();

		console.log("Server shut down successfully");
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	console.log("\nVertix.io server started successfully!");
	console.log("Press Ctrl+C to stop the server\n");
}

// Start the server
startServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});

// Socket Handler - Socket.IO event handlers

import type { Server, Socket } from "socket.io";
import { GameRoom } from "../game/GameRoom.ts";
import { ChatManager } from "../chat/ChatManager.ts";
import { InputHandler } from "./InputHandler.ts";
import { StateSync } from "./StateSync.ts";
import { Player } from "../entities/Player.ts";
import type {
	MovementInput,
	ShootInput,
	CreateRoomInput,
	ChatType,
	WelcomeData,
	GameSetupData,
} from "../types/index.ts";

/**
 * SocketHandler - Manages Socket.IO event handlers
 * Based on setupSocket in app.js (lines 1316-1803)
 */
export class SocketHandler {
	private io: Server;
	private rooms: Map<string, GameRoom>;
	private playerRooms: Map<string, string>;
	private chatManagers: Map<string, ChatManager>;
	private inputHandler: InputHandler;

	constructor(io: Server) {
		this.io = io;
		this.rooms = new Map();
		this.playerRooms = new Map();
		this.chatManagers = new Map();
		this.inputHandler = new InputHandler();

		this.setupConnectionHandler();
	}

	/**
	 * Setup connection handler
	 */
	private setupConnectionHandler(): void {
		this.io.on("connection", (socket: Socket) => {
			console.log("Player connected:", socket.id);

			// Send welcome message
			this.handleWelcome(socket);

			// Setup event handlers
			this.setupEventHandlers(socket);

			// Handle disconnect
			socket.on("disconnect", () => {
				this.handleDisconnect(socket);
			});
		});
	}

	/**
	 * Setup event handlers for a socket
	 */
	private setupEventHandlers(socket: Socket): void {
		// Ping/Pong
		socket.on("ping1", () => {
			socket.emit("pong1");
		});

		// Create/Join room
		socket.on("create", (data: CreateRoomInput) => {
			this.handleCreate(socket, data);
		});

		// Movement input (event "4")
		socket.on("4", (input: MovementInput) => {
			this.handleMovementInput(socket, input);
		});

		// Shoot (event "1")
		socket.on("1", (input: ShootInput) => {
			this.handleShoot(socket, input);
		});

		// Mouse angle update (event "0")
		socket.on("0", (angle: number) => {
			this.handleAngleUpdate(socket, angle);
		});

		// Weapon swap
		socket.on("sw", (weaponIndex: number) => {
			this.handleWeaponSwap(socket, weaponIndex);
		});

		// Reload request
		socket.on("r", () => {
			this.handleReload(socket);
		});

		// Respawn
		socket.on("respawn", () => {
			this.handleRespawn(socket);
		});

		// Chat message
		socket.on("cht", (message: string, type: ChatType) => {
			this.handleChat(socket, message, type);
		});

		// Got it (confirmation)
		socket.on("gotit", (...args: unknown[]) => {
			console.log("Player confirmed:", socket.id, args);
		});
	}

	/**
	 * Handle welcome event
	 */
	private handleWelcome(socket: Socket): void {
		const welcomeData: WelcomeData = {
			id: 0,
			room: "DEV",
		};

		socket.emit("welcome", welcomeData, false);
	}

	/**
	 * Handle create/join room
	 */
	private handleCreate(socket: Socket, data: CreateRoomInput): void {
		// Get or create room
		let room = this.getDefaultRoom();

		// Add player to room
		const player = room.addPlayer(socket.id, data.name, data.classIndex);

		if (!player) {
			socket.emit("kick", "Room is full");
			return;
		}

		// Set cosmetics
		if (data.hatId !== undefined || data.shirtId !== undefined || data.sprayId !== undefined) {
			player.setCosmetics(
				data.hatId ?? -1,
				data.shirtId ?? -1,
				data.sprayId ?? -1
			);
		}

		// Spawn the player
		room.spawnPlayer(player);

		// Track player room
		this.playerRooms.set(socket.id, room.id);

		// Join socket room
		socket.join(room.id);

		// Get game setup data
		const gameSetupData = room.getGameSetupData(player);

		// Send gameSetup event to the joining player
		// Format: gameSetup(JSON string, isInitialSetup, gameStart)
		socket.emit("gameSetup", JSON.stringify(gameSetupData), true, true);

		// Notify other players about the new player
		socket.to(room.id).emit("add", player.toJSON());

		// Send leaderboard update
		const leaderboard = room.getLeaderboard().getAllEntries();
		socket.emit("lb", leaderboard);

		// Send team scores if team mode
		const teamScores = room.getTeamScores();
		socket.emit("ts", teamScores.red, teamScores.blue);
	}

	/**
	 * Handle movement input
	 */
	private handleMovementInput(socket: Socket, input: MovementInput): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const processedInput = this.inputHandler.processMovementInput(
			socket.id,
			input
		);
		if (processedInput) {
			room.processInput(socket.id, processedInput);
		}
	}

	/**
	 * Handle shoot input
	 */
	private handleShoot(socket: Socket, input: ShootInput): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const projectiles = room.processShoot(socket.id);

		if (projectiles.length > 0) {
			// Broadcast shot to other players
			const player = room.getEntityManager().getPlayer(socket.id);
			if (player) {
				const shotData = {
					oi: player.index,
					x: input.x,
					y: input.y,
					jy: input.jumpY,
					dir: input.angle,
					bi: projectiles[0].serverIndex,
					wi: projectiles[0].weaponIndex,
				};

				socket.to(roomId).emit("2", shotData);
			}
		}
	}

	/**
	 * Handle angle update
	 */
	private handleAngleUpdate(socket: Socket, angle: number): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		room.processAngleUpdate(socket.id, angle);
	}

	/**
	 * Handle weapon swap
	 */
	private handleWeaponSwap(socket: Socket, weaponIndex: number): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const success = room.processWeaponSwap(socket.id, weaponIndex);
		if (success) {
			const player = room.getEntityManager().getPlayer(socket.id);
			if (player) {
				socket.emit("upd", {
					index: player.index,
					currentWeapon: player.currentWeapon,
				});
			}
		}
	}

	/**
	 * Handle reload
	 */
	private handleReload(socket: Socket): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		room.processReload(socket.id);
	}

	/**
	 * Handle respawn
	 */
	private handleRespawn(socket: Socket): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const player = room.getEntityManager().getPlayer(socket.id);
		if (!player) return;

		// Spawn the player
		room.spawnPlayer(player);

		// Send game setup
		const setupData = room.getGameSetupData(player);
		socket.emit("gameSetup", JSON.stringify(setupData), true, true);

		// Send initial state
		const stateUpdate = StateSync.createPersonalizedStateUpdate(
			room.getEntityManager().getAllPlayers(),
			player
		);
		socket.emit("rsd", stateUpdate);

		// Send teleport event
		socket.emit("tprt", {
			indx: player.index,
			newX: player.x,
			newY: player.y,
		});
	}

	/**
	 * Handle chat message
	 */
	private handleChat(socket: Socket, message: string, type: ChatType): void {
		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const player = room.getEntityManager().getPlayer(socket.id);
		if (!player) return;

		let chatManager = this.chatManagers.get(roomId);
		if (!chatManager) {
			chatManager = new ChatManager();
			this.chatManagers.set(roomId, chatManager);
		}

		const chatMessage = chatManager.processMessage(
			player.index,
			message,
			type,
			player.team
		);

		if (chatMessage) {
			const formatted = chatManager.formatForNetwork(chatMessage);

			if (type === "TEAM" && player.team) {
				// Send to team only
				const teamPlayers = room.getTeamManager().getRedTeamPlayers();
				if (player.team === "red") {
					for (const playerIndex of teamPlayers) {
						const teamPlayer = room.getEntityManager().getPlayerByIndex(playerIndex);
						if (teamPlayer) {
							this.io.to(teamPlayer.socketId).emit("cht", formatted);
						}
					}
				} else {
					const bluePlayers = room.getTeamManager().getBlueTeamPlayers();
					for (const playerIndex of bluePlayers) {
						const teamPlayer = room.getEntityManager().getPlayerByIndex(playerIndex);
						if (teamPlayer) {
							this.io.to(teamPlayer.socketId).emit("cht", formatted);
						}
					}
				}
			} else {
				// Send to all in room
				this.io.to(roomId).emit("cht", formatted);
			}
		}
	}

	/**
	 * Handle disconnect
	 */
	private handleDisconnect(socket: Socket): void {
		console.log("Player disconnected:", socket.id);

		const roomId = this.playerRooms.get(socket.id);
		if (!roomId) return;

		const room = this.rooms.get(roomId);
		if (!room) return;

		const player = room.removePlayer(socket.id);
		if (player) {
			// Notify other players
			this.io.to(roomId).emit("rem", player.index);
		}

		// Cleanup
		this.playerRooms.delete(socket.id);
		this.inputHandler.removePlayer(socket.id);
	}

	/**
	 * Get or create default room
	 */
	private getDefaultRoom(): GameRoom {
		const defaultRoomId = "default";

		let room = this.rooms.get(defaultRoomId);
		if (!room) {
			room = new GameRoom({
				id: defaultRoomId,
				name: "Default Room",
				maxPlayers: 16,
				mapName: "default",
				gameMode: "TDM",
			});

			// Setup room callbacks
			this.setupRoomCallbacks(room);

			// Load a simple test map
			room.loadMap({
				width: 10,
				height: 10,
				data: this.createTestMapData(10, 10),
			});

			// Start the room
			room.start();

			this.rooms.set(defaultRoomId, room);
		}

		return room;
	}

	/**
	 * Create test map data
	 */
	private createTestMapData(width: number, height: number): number[][] {
		const data: number[][] = [];

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				// Create walls on edges
				if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
					data.push([0, 0, 0]); // Black = wall
				} else {
					data.push([255, 255, 255]); // White = floor
				}
			}
		}

		return data;
	}

	/**
	 * Setup callbacks for a room
	 */
	private setupRoomCallbacks(room: GameRoom): void {
		room.setCallbacks({
			onPlayerJoin: (player: Player) => {
				console.log(`Player ${player.name} joined room ${room.id}`);
			},
			onPlayerLeave: (player: Player) => {
				console.log(`Player ${player.name} left room ${room.id}`);
			},
			onDamage: (event) => {
				this.io.to(room.id).emit("1", event);
			},
			onDeath: (event) => {
				this.io.to(room.id).emit("3", event);
			},
			onShoot: (player, projectiles) => {
				// Already handled in handleShoot
			},
			onStateUpdate: (state) => {
				this.io.to(room.id).emit("rsd", state);
			},
			onGameOver: (winningTeam) => {
				const stats = room.getLeaderboard().getGameStats();
				this.io.to(room.id).emit("7", winningTeam, null, stats.entries, false);
			},
		});
	}

	/**
	 * Create a new room
	 */
	public createRoom(config: {
		id: string;
		name: string;
		maxPlayers?: number;
		gameMode?: "TDM" | "FFA" | "Hardpoint" | "Zone War";
	}): GameRoom {
		const room = new GameRoom({
			id: config.id,
			name: config.name,
			maxPlayers: config.maxPlayers || 16,
			mapName: "default",
			gameMode: config.gameMode || "TDM",
		});

		this.setupRoomCallbacks(room);
		this.rooms.set(config.id, room);

		return room;
	}

	/**
	 * Get a room by ID
	 */
	public getRoom(roomId: string): GameRoom | undefined {
		return this.rooms.get(roomId);
	}

	/**
	 * Get all rooms
	 */
	public getAllRooms(): GameRoom[] {
		return Array.from(this.rooms.values());
	}

	/**
	 * Remove a room
	 */
	public removeRoom(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (room) {
			room.stop();
			this.rooms.delete(roomId);
			this.chatManagers.delete(roomId);
		}
	}

	/**
	 * Broadcast to a room
	 */
	public broadcastToRoom(roomId: string, event: string, data: unknown): void {
		this.io.to(roomId).emit(event, data);
	}

	/**
	 * Send to a specific player
	 */
	public sendToPlayer(socketId: string, event: string, data: unknown): void {
		this.io.to(socketId).emit(event, data);
	}

	/**
	 * Get player count across all rooms
	 */
	public getTotalPlayerCount(): number {
		let total = 0;
		for (const room of this.rooms.values()) {
			total += room.getPlayerCount();
		}
		return total;
	}
}

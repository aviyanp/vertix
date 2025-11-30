// Game Room - Individual game room logic

import { GameLoop } from "./GameLoop.ts";
import { GameMode } from "./GameMode.ts";
import { TeamManager } from "./TeamManager.ts";
import { Leaderboard } from "./Leaderboard.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { Player } from "../entities/Player.ts";
import { GameMap } from "../map/GameMap.ts";
import { PhysicsEngine } from "../physics/PhysicsEngine.ts";
import { CollisionDetection } from "../physics/CollisionDetection.ts";
import { Projectile } from "../weapons/Projectile.ts";
import {
	SERVER_CONFIG,
	MAP_CONFIG,
	SCORING_CONFIG,
	PLAYER_CONFIG,
} from "../config/gameConfig.ts";
import type {
	GameRoomConfig,
	GameRoomState,
	GameModeType,
	PlayerInput,
	MapGenData,
	Team,
	DamageEvent,
	DeathEvent,
	StateUpdateArray,
	GameSetupData,
} from "../types/index.ts";

/**
 * GameRoom - Manages an individual game room
 */
export class GameRoom {
	public readonly id: string;
	public readonly name: string;

	private gameLoop: GameLoop;
	private gameMode: GameMode;
	private teamManager: TeamManager;
	private leaderboard: Leaderboard;
	private entityManager: EntityManager;
	private gameMap: GameMap;

	private maxPlayers: number;
	private gameStarted: boolean;
	private gameOver: boolean;
	private nextGameTime: number;

	// Event callbacks
	private onPlayerJoin?: (player: Player) => void;
	private onPlayerLeave?: (player: Player) => void;
	private onDamage?: (event: DamageEvent) => void;
	private onDeath?: (event: DeathEvent) => void;
	private onShoot?: (player: Player, projectiles: Projectile[]) => void;
	private onStateUpdate?: (state: StateUpdateArray) => void;
	private onGameOver?: (winningTeam: Team | null) => void;

	constructor(config: GameRoomConfig) {
		this.id = config.id;
		this.name = config.name;
		this.maxPlayers = config.maxPlayers || SERVER_CONFIG.MAX_PLAYERS_PER_ROOM;

		this.gameLoop = new GameLoop();
		this.gameMode = new GameMode(config.gameMode);
		this.teamManager = new TeamManager(this.gameMode.hasTeams());
		this.leaderboard = new Leaderboard();
		this.entityManager = new EntityManager();
		this.gameMap = new GameMap();

		this.gameStarted = false;
		this.gameOver = false;
		this.nextGameTime = 0;

		// Setup game loop callback
		this.gameLoop.addCallback(this.update.bind(this));
	}

	/**
	 * Load map data
	 */
	public loadMap(genData: MapGenData): void {
		this.gameMap.loadMap(genData, this.gameMode.getConfig());
	}

	/**
	 * Start the game
	 */
	public start(): void {
		this.gameStarted = true;
		this.gameOver = false;
		this.gameLoop.start();
	}

	/**
	 * Stop the game
	 */
	public stop(): void {
		this.gameLoop.stop();
		this.gameStarted = false;
	}

	/**
	 * Main update loop
	 */
	private update(deltaTime: number, tickCount: number): void {
		if (this.gameOver) return;

		const players = this.entityManager.getLivingPlayers();
		const tiles = this.gameMap.getTiles();
		const clutter = this.entityManager.getActiveClutter();

		// Process player inputs
		for (const player of players) {
			const inputs = player.getPendingInputs();
			for (const input of inputs) {
				PhysicsEngine.processPlayerMovement(
					player,
					input,
					tiles,
					clutter.map((c) => c.toJSON()),
					input.delta
				);
			}
			player.clearPendingInputs();

			// Update weapons
			player.updateWeapons(deltaTime * 1000);
		}

		// Process projectiles
		this.processProjectiles(deltaTime);

		// Check pickups
		this.checkPickups();

		// Check hardpoint control
		if (this.gameMode.getName() === "Hardpoint") {
			this.updateHardpoint(deltaTime);
		}

		// Update leaderboard
		for (const player of this.entityManager.getAllPlayers()) {
			this.leaderboard.updatePlayer(player);
		}

		// Check game over
		if (this.gameMode.isGameOver()) {
			this.endGame();
		}

		// Broadcast state update
		this.broadcastState();
	}

	/**
	 * Process all projectiles
	 */
	private processProjectiles(deltaTime: number): void {
		const players = this.entityManager.getLivingPlayers();
		const tiles = this.gameMap.getTiles();
		const clutter = this.entityManager.getActiveClutter();

		const projectiles = this.entityManager.getActiveProjectiles();

		for (const projectile of projectiles) {
			const result = PhysicsEngine.processProjectile(
				projectile,
				tiles,
				clutter.map((c) => c.toJSON()),
				players.map((p) => p.toJSON()),
				deltaTime
			);

			if (result.hitPlayer) {
				this.handleProjectileHit(projectile, result.hitPlayer.index);
			}

			// Handle explosion
			if (projectile.shouldExplode()) {
				this.handleExplosion(projectile);
			}

			if (!result.active) {
				this.entityManager.removeProjectile(projectile.id);
			}
		}
	}

	/**
	 * Handle projectile hitting a player
	 */
	private handleProjectileHit(projectile: Projectile, victimIndex: number): void {
		const victim = this.entityManager.getPlayerByIndex(victimIndex);
		const attacker = this.entityManager.getPlayerByIndex(projectile.ownerId);

		if (!victim || victim.dead) return;

		// Check team damage
		const isTeamHit =
			attacker &&
			this.teamManager.areOnSameTeam(attacker.index, victim.index);

		if (isTeamHit && this.gameMode.hasTeams()) {
			// Reduce or prevent team damage
			return;
		}

		const damage = victim.takeDamage(projectile.damage, projectile.ownerId);

		// Emit damage event
		const damageEvent: DamageEvent = {
			gID: victim.index,
			dID: attacker?.index ?? null,
			amount: -damage,
			h: victim.health,
			bi: projectile.serverIndex,
			dir: projectile.dir,
		};
		this.onDamage?.(damageEvent);

		// Check for kill
		if (victim.dead && attacker) {
			this.handleKill(attacker, victim, isTeamHit ?? false);
		}
	}

	/**
	 * Handle explosion damage
	 */
	private handleExplosion(projectile: Projectile): void {
		const radius = projectile.getExplosionRadius();
		if (radius <= 0) return;

		const damaged = PhysicsEngine.processExplosion(
			projectile.x,
			projectile.y,
			projectile.damage,
			radius,
			this.entityManager.getLivingPlayers().map((p) => p.toJSON()),
			projectile.ownerId
		);

		for (const { player: victimState, damage } of damaged) {
			const victim = this.entityManager.getPlayerByIndex(victimState.index);
			const attacker = this.entityManager.getPlayerByIndex(projectile.ownerId);

			if (!victim) continue;

			const isTeamHit =
				attacker &&
				this.teamManager.areOnSameTeam(attacker.index, victim.index);

			if (isTeamHit && this.gameMode.hasTeams()) continue;

			const actualDamage = victim.takeDamage(damage, projectile.ownerId);

			const damageEvent: DamageEvent = {
				gID: victim.index,
				dID: attacker?.index ?? null,
				amount: -actualDamage,
				h: victim.health,
				dir: PhysicsEngine.calculateAngle(
					projectile.x,
					projectile.y,
					victim.x,
					victim.y
				),
			};
			this.onDamage?.(damageEvent);

			if (victim.dead && attacker) {
				this.handleKill(attacker, victim, isTeamHit ?? false);
			}
		}
	}

	/**
	 * Handle a kill
	 */
	private handleKill(
		killer: Player,
		victim: Player,
		isTeamKill: boolean
	): void {
		let points = SCORING_CONFIG.KILL_POINTS;

		if (isTeamKill) {
			points = SCORING_CONFIG.TEAM_KILL_PENALTY;
		} else {
			// Add kill streak bonus
			points += killer.killStreak * SCORING_CONFIG.KILL_STREAK_MULTIPLIER;
		}

		killer.recordKill(points);

		// Check for assist
		const assisterId = victim.getLastDamagerIndex();
		if (assisterId !== null && assisterId !== killer.index) {
			const assister = this.entityManager.getPlayerByIndex(assisterId);
			if (assister) {
				assister.recordAssist(SCORING_CONFIG.ASSIST_POINTS);
			}
		}

		// Update game mode score
		if (!isTeamKill) {
			this.gameMode.processKill(killer.team, victim.team, false);
		}

		// Emit death event
		const deathEvent: DeathEvent = {
			gID: victim.index,
			dID: killer.index,
			sS: points,
			kd: killer.killStreak,
			ast: assisterId !== null && assisterId !== killer.index,
		};
		this.onDeath?.(deathEvent);
	}

	/**
	 * Check pickup collection
	 */
	private checkPickups(): void {
		const players = this.entityManager.getLivingPlayers();
		const pickups = this.entityManager.getActivePickups();

		for (const player of players) {
			for (const pickup of pickups) {
				if (
					PhysicsEngine.isPlayerInPickupRange(
						player,
						pickup.x,
						pickup.y
					)
				) {
					const value = pickup.collect();
					if (value > 0 && pickup.pickupType === "health") {
						const healed = player.heal(value);
						if (healed > 0) {
							const healEvent: DamageEvent = {
								gID: player.index,
								dID: null,
								amount: healed,
								h: player.health,
							};
							this.onDamage?.(healEvent);
						}
					}
				}
			}
		}

		// Check for respawns
		this.entityManager.checkPickupRespawns();
	}

	/**
	 * Update hardpoint control
	 */
	private updateHardpoint(deltaTime: number): void {
		const players = this.entityManager.getLivingPlayers();
		let redInZone = 0;
		let blueInZone = 0;

		for (const player of players) {
			if (this.gameMap.isInHardpoint(player.x, player.y)) {
				if (player.team === "red") redInZone++;
				else if (player.team === "blue") blueInZone++;
			}
		}

		let controller: Team | null = null;
		if (redInZone > 0 && blueInZone === 0) controller = "red";
		else if (blueInZone > 0 && redInZone === 0) controller = "blue";

		this.gameMode.updateHardpoint(controller, deltaTime * 1000);
	}

	/**
	 * Broadcast state update to all players
	 */
	private broadcastState(): void {
		const players = this.entityManager.getLivingPlayers();
		const stateUpdate: StateUpdateArray = [];

		for (const player of players) {
			const state = player.getMinimalState();
			// Format: [fieldCount, playerIndex, x, y, angle, isn, nameYOffset]
			stateUpdate.push(
				6,
				state.index,
				state.x,
				state.y,
				state.angle,
				state.isn
			);
		}

		this.onStateUpdate?.(stateUpdate);
	}

	/**
	 * End the game
	 */
	private endGame(): void {
		this.gameOver = true;
		this.gameLoop.stop();

		const winner = this.gameMode.getWinningTeam();
		this.onGameOver?.(winner);

		// Schedule next game
		this.nextGameTime = Date.now() + 15000;
	}

	/**
	 * Add a player to the room
	 */
	public addPlayer(socketId: string, name: string, classIndex: number): Player | null {
		if (this.entityManager.getPlayerCount() >= this.maxPlayers) {
			return null;
		}

		const player = new Player(socketId, name, classIndex);

		// Assign team
		this.teamManager.assignTeam(player);

		// Add to entity manager
		this.entityManager.addPlayer(player);

		// Add to leaderboard
		this.leaderboard.updatePlayer(player);

		this.onPlayerJoin?.(player);

		return player;
	}

	/**
	 * Remove a player from the room
	 */
	public removePlayer(socketId: string): Player | undefined {
		const player = this.entityManager.removePlayer(socketId);
		if (player) {
			this.teamManager.removeFromTeam(player);
			this.leaderboard.removePlayer(player.index);
			this.onPlayerLeave?.(player);
		}
		return player;
	}

	/**
	 * Spawn a player
	 */
	public spawnPlayer(player: Player): void {
		let spawnPos: { x: number; y: number };

		if (this.gameMode.hasTeams() && player.team) {
			spawnPos = this.gameMap.getTeamSpawnPosition(player.team);
		} else {
			spawnPos = this.gameMap.getRandomSpawnPosition();
		}

		player.spawn(spawnPos.x, spawnPos.y);
	}

	/**
	 * Process player input
	 */
	public processInput(socketId: string, input: PlayerInput): void {
		const player = this.entityManager.getPlayer(socketId);
		if (player) {
			player.processInput(input);
		}
	}

	/**
	 * Process player shoot
	 */
	public processShoot(socketId: string): Projectile[] {
		const player = this.entityManager.getPlayer(socketId);
		if (!player) return [];

		const projectiles = player.fire();
		this.entityManager.addProjectiles(projectiles);

		this.onShoot?.(player, projectiles);

		return projectiles;
	}

	/**
	 * Process weapon swap
	 */
	public processWeaponSwap(socketId: string, weaponIndex: number): boolean {
		const player = this.entityManager.getPlayer(socketId);
		if (!player) return false;
		return player.switchWeapon(weaponIndex);
	}

	/**
	 * Process reload request
	 */
	public processReload(socketId: string): boolean {
		const player = this.entityManager.getPlayer(socketId);
		if (!player) return false;
		return player.reload();
	}

	/**
	 * Process angle update
	 */
	public processAngleUpdate(socketId: string, angle: number): void {
		const player = this.entityManager.getPlayer(socketId);
		if (player) {
			player.setAngle(angle);
		}
	}

	/**
	 * Get game setup data for a player
	 */
	public getGameSetupData(player: Player): GameSetupData {
		return {
			width: this.gameMap.getWidth(),
			height: this.gameMap.getHeight(),
			mapData: this.gameMap.toJSON(),
			maxScreenWidth: MAP_CONFIG.MAX_SCREEN_WIDTH,
			maxScreenHeight: MAP_CONFIG.MAX_SCREEN_HEIGHT,
			viewMult: MAP_CONFIG.VIEW_MULT,
			tileScale: this.gameMap.getTileScale(),
			usersInRoom: this.entityManager.getPlayerStates(),
			you: player.toJSON(),
		};
	}

	/**
	 * Get room state
	 */
	public getState(): GameRoomState {
		return {
			id: this.id,
			players: new Map(
				this.entityManager
					.getAllPlayers()
					.map((p) => [p.socketId, p.toJSON()])
			),
			projectiles: new Map(
				this.entityManager.getAllProjectiles().map((p) => [p.id, p.toJSON()])
			),
			gameObjects: this.entityManager.getAllGameObjects(),
			map: this.gameMap.toJSON(),
			gameMode: this.gameMode.getConfig(),
			redScore: this.gameMode.getScores().red,
			blueScore: this.gameMode.getScores().blue,
			gameStarted: this.gameStarted,
			gameOver: this.gameOver,
			tickCount: this.gameLoop.getTickCount(),
			startTime: this.gameLoop.getElapsedTime(),
			nextGameTime: this.nextGameTime,
		};
	}

	/**
	 * Get player count
	 */
	public getPlayerCount(): number {
		return this.entityManager.getPlayerCount();
	}

	/**
	 * Check if room is full
	 */
	public isFull(): boolean {
		return this.entityManager.getPlayerCount() >= this.maxPlayers;
	}

	/**
	 * Get leaderboard
	 */
	public getLeaderboard(): Leaderboard {
		return this.leaderboard;
	}

	/**
	 * Get team scores
	 */
	public getTeamScores(): { red: number; blue: number } {
		return this.gameMode.getScores();
	}

	/**
	 * Set event callbacks
	 */
	public setCallbacks(callbacks: {
		onPlayerJoin?: (player: Player) => void;
		onPlayerLeave?: (player: Player) => void;
		onDamage?: (event: DamageEvent) => void;
		onDeath?: (event: DeathEvent) => void;
		onShoot?: (player: Player, projectiles: Projectile[]) => void;
		onStateUpdate?: (state: StateUpdateArray) => void;
		onGameOver?: (winningTeam: Team | null) => void;
	}): void {
		this.onPlayerJoin = callbacks.onPlayerJoin;
		this.onPlayerLeave = callbacks.onPlayerLeave;
		this.onDamage = callbacks.onDamage;
		this.onDeath = callbacks.onDeath;
		this.onShoot = callbacks.onShoot;
		this.onStateUpdate = callbacks.onStateUpdate;
		this.onGameOver = callbacks.onGameOver;
	}

	/**
	 * Reset the game
	 */
	public reset(): void {
		this.gameLoop.reset();
		this.gameMode.reset();
		this.entityManager.reset();
		this.leaderboard.resetScores();
		this.gameOver = false;
		this.gameStarted = false;
	}

	/**
	 * Get entity manager
	 */
	public getEntityManager(): EntityManager {
		return this.entityManager;
	}

	/**
	 * Get game map
	 */
	public getGameMap(): GameMap {
		return this.gameMap;
	}

	/**
	 * Get game mode
	 */
	public getGameMode(): GameMode {
		return this.gameMode;
	}

	/**
	 * Get team manager
	 */
	public getTeamManager(): TeamManager {
		return this.teamManager;
	}
}

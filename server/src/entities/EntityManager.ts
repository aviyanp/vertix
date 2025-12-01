// Entity Manager - Track all game objects

import { Player } from "./Player.ts";
import { Clutter, Flag, Pickup } from "./GameObjects.ts";
import { Projectile } from "../weapons/Projectile.ts";
import type {
	PlayerState,
	ClutterObject,
	FlagObject,
	PickupObject,
	GameObject,
	Team,
} from "../types/index.ts";

/**
 * EntityManager - Manages all game entities
 */
export class EntityManager {
	private players: Map<string, Player>;
	private playersByIndex: Map<number, Player>;
	private clutter: Clutter[];
	private flags: Flag[];
	private pickups: Pickup[];
	private projectiles: Map<number, Projectile>;

	constructor() {
		this.players = new Map();
		this.playersByIndex = new Map();
		this.clutter = [];
		this.flags = [];
		this.pickups = [];
		this.projectiles = new Map();
	}

	// =========================================
	// Player Management
	// =========================================

	/**
	 * Add a player
	 */
	public addPlayer(player: Player): void {
		this.players.set(player.socketId, player);
		this.playersByIndex.set(player.index, player);
	}

	/**
	 * Remove a player by socket ID
	 */
	public removePlayer(socketId: string): Player | undefined {
		const player = this.players.get(socketId);
		if (player) {
			this.players.delete(socketId);
			this.playersByIndex.delete(player.index);
		}
		return player;
	}

	/**
	 * Get player by socket ID
	 */
	public getPlayer(socketId: string): Player | undefined {
		return this.players.get(socketId);
	}

	/**
	 * Get player by index
	 */
	public getPlayerByIndex(index: number): Player | undefined {
		return this.playersByIndex.get(index);
	}

	/**
	 * Get all players
	 */
	public getAllPlayers(): Player[] {
		return Array.from(this.players.values());
	}

	/**
	 * Get all living players
	 */
	public getLivingPlayers(): Player[] {
		return Array.from(this.players.values()).filter((p) => !p.dead);
	}

	/**
	 * Get players on a team
	 */
	public getTeamPlayers(team: Team): Player[] {
		return Array.from(this.players.values()).filter((p) => p.team === team);
	}

	/**
	 * Get player count
	 */
	public getPlayerCount(): number {
		return this.players.size;
	}

	/**
	 * Get living player count
	 */
	public getLivingPlayerCount(): number {
		return this.getLivingPlayers().length;
	}

	/**
	 * Get team player count
	 */
	public getTeamPlayerCount(team: Team): number {
		return this.getTeamPlayers(team).length;
	}

	/**
	 * Get all player states for network
	 */
	public getPlayerStates(): PlayerState[] {
		return Array.from(this.players.values()).map((p) => p.toJSON());
	}

	// =========================================
	// Clutter Management
	// =========================================

	/**
	 * Add clutter objects
	 */
	public addClutter(clutterData: ClutterObject[]): void {
		this.clutter = clutterData.map(
			(c) => new Clutter(c.indx, c.x, c.y, c.w, c.h, c.hc, c.tp)
		);
	}

	/**
	 * Get all clutter
	 */
	public getAllClutter(): Clutter[] {
		return this.clutter;
	}

	/**
	 * Get active clutter
	 */
	public getActiveClutter(): Clutter[] {
		return this.clutter.filter((c) => c.active);
	}

	/**
	 * Get clutter by index
	 */
	public getClutterByIndex(index: number): Clutter | undefined {
		return this.clutter.find((c) => c.indx === index);
	}

	/**
	 * Get clutter as JSON
	 */
	public getClutterJSON(): ClutterObject[] {
		return this.clutter.map((c) => c.toJSON());
	}

	// =========================================
	// Flag Management
	// =========================================

	/**
	 * Add flags
	 */
	public addFlags(flagData: FlagObject[]): void {
		this.flags = flagData.map((f) => new Flag(f.x, f.y, f.team));
	}

	/**
	 * Get all flags
	 */
	public getAllFlags(): Flag[] {
		return this.flags;
	}

	/**
	 * Get flags by team
	 */
	public getTeamFlags(team: Team | "e"): Flag[] {
		return this.flags.filter((f) => f.team === team);
	}

	/**
	 * Update all flag animations
	 */
	public updateFlags(): void {
		for (const flag of this.flags) {
			flag.updateAnimation();
		}
	}

	/**
	 * Get flags as JSON
	 */
	public getFlagsJSON(): FlagObject[] {
		return this.flags.map((f) => f.toJSON());
	}

	// =========================================
	// Pickup Management
	// =========================================

	/**
	 * Add pickups
	 */
	public addPickups(pickupData: PickupObject[]): void {
		this.pickups = pickupData.map(
			(p) => new Pickup(p.x, p.y, p.pickupType, p.value, p.respawnTime)
		);
	}

	/**
	 * Get all pickups
	 */
	public getAllPickups(): Pickup[] {
		return this.pickups;
	}

	/**
	 * Get active pickups
	 */
	public getActivePickups(): Pickup[] {
		return this.pickups.filter((p) => p.active);
	}

	/**
	 * Check for pickup respawns
	 */
	public checkPickupRespawns(): Pickup[] {
		const respawned: Pickup[] = [];
		for (const pickup of this.pickups) {
			if (pickup.checkRespawn()) {
				respawned.push(pickup);
			}
		}
		return respawned;
	}

	/**
	 * Get pickups as JSON
	 */
	public getPickupsJSON(): PickupObject[] {
		return this.pickups.map((p) => p.toJSON());
	}

	// =========================================
	// Projectile Management
	// =========================================

	/**
	 * Add a projectile
	 */
	public addProjectile(projectile: Projectile): void {
		this.projectiles.set(projectile.id, projectile);
	}

	/**
	 * Add multiple projectiles
	 */
	public addProjectiles(projectiles: Projectile[]): void {
		for (const projectile of projectiles) {
			this.projectiles.set(projectile.id, projectile);
		}
	}

	/**
	 * Remove a projectile
	 */
	public removeProjectile(id: number): void {
		this.projectiles.delete(id);
	}

	/**
	 * Get projectile by ID
	 */
	public getProjectile(id: number): Projectile | undefined {
		return this.projectiles.get(id);
	}

	/**
	 * Get all projectiles
	 */
	public getAllProjectiles(): Projectile[] {
		return Array.from(this.projectiles.values());
	}

	/**
	 * Get active projectiles
	 */
	public getActiveProjectiles(): Projectile[] {
		return Array.from(this.projectiles.values()).filter((p) => p.active);
	}

	/**
	 * Get projectiles by owner
	 */
	public getProjectilesByOwner(ownerId: number): Projectile[] {
		return Array.from(this.projectiles.values()).filter(
			(p) => p.ownerId === ownerId
		);
	}

	/**
	 * Clean up inactive projectiles
	 */
	public cleanupProjectiles(): void {
		for (const [id, projectile] of this.projectiles) {
			if (!projectile.active) {
				this.projectiles.delete(id);
			}
		}
	}

	/**
	 * Clear all projectiles
	 */
	public clearProjectiles(): void {
		this.projectiles.clear();
	}

	// =========================================
	// Combined Operations
	// =========================================

	/**
	 * Get all game objects (for client)
	 */
	public getAllGameObjects(): GameObject[] {
		const objects: GameObject[] = [];
		objects.push(...this.getClutterJSON());
		objects.push(...this.getFlagsJSON());
		objects.push(...this.getPickupsJSON());
		return objects;
	}

	/**
	 * Reset all entities
	 */
	public reset(): void {
		// Reset all players
		for (const player of this.players.values()) {
			player.die();
		}

		// Reset pickups
		for (const pickup of this.pickups) {
			pickup.respawn();
		}

		// Reset clutter
		for (const clutter of this.clutter) {
			clutter.activate();
		}

		// Clear projectiles
		this.clearProjectiles();
	}

	/**
	 * Clear all entities
	 */
	public clear(): void {
		this.players.clear();
		this.playersByIndex.clear();
		this.clutter = [];
		this.flags = [];
		this.pickups = [];
		this.projectiles.clear();
	}
}

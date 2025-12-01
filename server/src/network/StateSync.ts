// State Sync - Efficient state updates to clients

import type { PlayerState, StateUpdateArray, ProjectileData } from "../types/index.ts";
import { Player } from "../entities/Player.ts";

/**
 * StateSync - Handles efficient state synchronization to clients
 * Based on receiveServerData in app.js (lines 2458-2553)
 */
export class StateSync {
	/**
	 * Create optimized state update array for players
	 * Format: [fieldCount, playerIndex, x, y, angle, isn/nameYOffset, ...]
	 */
	public static createPlayerStateUpdate(players: Player[]): StateUpdateArray {
		const update: StateUpdateArray = [];

		for (const player of players) {
			if (player.dead) continue;

			const state = player.getMinimalState();

			// Format: [fieldCount, index, x, y, angle, isn]
			// fieldCount indicates how many fields follow after index
			update.push(
				6, // field count (index + 5 fields)
				state.index,
				Math.round(state.x),
				Math.round(state.y),
				state.angle,
				state.isn
			);
		}

		return update;
	}

	/**
	 * Create state update for a single player (for the player themselves)
	 */
	public static createSelfStateUpdate(player: Player): StateUpdateArray {
		const state = player.getMinimalState();

		return [
			6,
			state.index,
			Math.round(state.x),
			Math.round(state.y),
			state.angle,
			state.isn,
		];
	}

	/**
	 * Create state update for other players (for broadcast)
	 */
	public static createOtherPlayerStateUpdate(player: Player): StateUpdateArray {
		const state = player.getMinimalState();

		// For other players, send nameYOffset instead of isn
		return [
			6,
			state.index,
			Math.round(state.x),
			Math.round(state.y),
			state.angle,
			state.nameYOffset,
		];
	}

	/**
	 * Filter state updates based on visibility
	 */
	public static filterVisiblePlayers(
		players: Player[],
		viewerX: number,
		viewerY: number,
		viewDistance: number
	): Player[] {
		return players.filter((player) => {
			if (player.dead) return false;

			const dx = player.x - viewerX;
			const dy = player.y - viewerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			return distance <= viewDistance;
		});
	}

	/**
	 * Create personalized state update for a specific viewer
	 */
	public static createPersonalizedStateUpdate(
		allPlayers: Player[],
		viewer: Player,
		viewDistance: number = 2000
	): StateUpdateArray {
		const update: StateUpdateArray = [];

		for (const player of allPlayers) {
			if (player.dead) continue;

			// Calculate distance
			const dx = player.x - viewer.x;
			const dy = player.y - viewer.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Skip players too far away (unless it's the viewer themselves)
			if (player.index !== viewer.index && distance > viewDistance) {
				continue;
			}

			const state = player.getMinimalState();

			if (player.index === viewer.index) {
				// For the viewer, send their own data with isn
				update.push(
					6,
					state.index,
					Math.round(state.x),
					Math.round(state.y),
					state.angle,
					state.isn
				);
			} else {
				// For other players, send nameYOffset
				update.push(
					6,
					state.index,
					Math.round(state.x),
					Math.round(state.y),
					state.angle,
					state.nameYOffset
				);
			}
		}

		return update;
	}

	/**
	 * Create projectile state update
	 */
	public static createProjectileUpdate(
		projectiles: ProjectileData[]
	): Array<{
		bi: number;
		x: number;
		y: number;
		dir: number;
		wi: number;
		oi: number;
	}> {
		return projectiles.map((p) => ({
			bi: p.serverIndex,
			x: Math.round(p.x),
			y: Math.round(p.y),
			dir: p.dir,
			wi: p.weaponIndex,
			oi: p.ownerId,
		}));
	}

	/**
	 * Create delta update (only changed values)
	 */
	public static createDeltaUpdate(
		oldState: PlayerState,
		newState: PlayerState
	): Partial<PlayerState> {
		const delta: Partial<PlayerState> = {};

		if (oldState.x !== newState.x) delta.x = newState.x;
		if (oldState.y !== newState.y) delta.y = newState.y;
		if (oldState.angle !== newState.angle) delta.angle = newState.angle;
		if (oldState.health !== newState.health) delta.health = newState.health;
		if (oldState.dead !== newState.dead) delta.dead = newState.dead;
		if (oldState.score !== newState.score) delta.score = newState.score;
		if (oldState.currentWeapon !== newState.currentWeapon)
			delta.currentWeapon = newState.currentWeapon;

		return delta;
	}

	/**
	 * Compress state update using run-length encoding
	 */
	public static compressUpdate(update: StateUpdateArray): StateUpdateArray {
		// For now, just return the update as-is
		// Could implement RLE or other compression in the future
		return update;
	}

	/**
	 * Parse client state from update array
	 */
	public static parseStateUpdate(
		update: StateUpdateArray
	): Array<{
		index: number;
		x: number;
		y: number;
		angle: number;
		isn: number;
	}> {
		const parsed: Array<{
			index: number;
			x: number;
			y: number;
			angle: number;
			isn: number;
		}> = [];

		let i = 0;
		while (i < update.length) {
			const fieldCount = update[i];
			if (fieldCount >= 6) {
				parsed.push({
					index: update[i + 1],
					x: update[i + 2],
					y: update[i + 3],
					angle: update[i + 4],
					isn: update[i + 5],
				});
			}
			i += fieldCount;
		}

		return parsed;
	}

	/**
	 * Calculate bandwidth usage for state update
	 */
	public static calculateBandwidth(update: StateUpdateArray): number {
		// Rough estimate: 4 bytes per number
		return update.length * 4;
	}
}

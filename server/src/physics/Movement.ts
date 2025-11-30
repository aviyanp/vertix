// Player movement calculations

import { PLAYER_CONFIG, PHYSICS_CONFIG } from "../config/gameConfig.ts";
import type { PlayerState, PlayerInput } from "../types/index.ts";

/**
 * Movement - Handles player movement calculations
 */
export class Movement {
	/**
	 * Apply movement input to player position
	 */
	public static applyMovement(
		player: PlayerState,
		input: PlayerInput,
		delta: number
	): void {
		// Store old position for collision resolution
		player.oldX = player.x;
		player.oldY = player.y;

		// Normalize diagonal movement
		let hdt = input.hdt;
		let vdt = input.vdt;
		const magnitude = Math.sqrt(hdt * hdt + vdt * vdt);

		if (magnitude !== 0) {
			hdt /= magnitude;
			vdt /= magnitude;
		}

		// Apply movement
		player.x += hdt * player.speed * delta;
		player.y += vdt * player.speed * delta;
	}

	/**
	 * Apply jump to player
	 */
	public static applyJump(player: PlayerState): void {
		if (player.jumpY === 0) {
			player.jumpY = PLAYER_CONFIG.JUMP_VELOCITY;
		}
	}

	/**
	 * Update jump physics (gravity)
	 */
	public static updateJump(player: PlayerState, delta: number): void {
		if (player.jumpY > 0) {
			player.jumpY -= PLAYER_CONFIG.GRAVITY * delta;
			if (player.jumpY < 0) {
				player.jumpY = 0;
			}
		}
	}

	/**
	 * Calculate movement direction from horizontal and vertical deltas
	 */
	public static getMovementDirection(hdt: number, vdt: number): number {
		return Math.atan2(vdt, hdt);
	}

	/**
	 * Calculate distance between two points
	 */
	public static getDistance(
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): number {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Check if player is moving
	 */
	public static isMoving(input: PlayerInput): boolean {
		return input.hdt !== 0 || input.vdt !== 0;
	}

	/**
	 * Get player speed with modifiers
	 */
	public static getEffectiveSpeed(player: PlayerState): number {
		// Could add speed modifiers here (e.g., weapon weight, status effects)
		return player.speed;
	}

	/**
	 * Interpolate player position for smooth rendering
	 */
	public static interpolatePosition(
		player: PlayerState,
		targetX: number,
		targetY: number,
		factor: number
	): { x: number; y: number } {
		return {
			x: player.x + (targetX - player.x) * factor,
			y: player.y + (targetY - player.y) * factor,
		};
	}

	/**
	 * Clamp position within map bounds
	 */
	public static clampToMapBounds(
		player: PlayerState,
		mapWidth: number,
		mapHeight: number
	): void {
		const halfWidth = player.width / 2;

		player.x = Math.max(halfWidth, Math.min(mapWidth - halfWidth, player.x));
		player.y = Math.max(0, Math.min(mapHeight, player.y));
	}

	/**
	 * Apply velocity-based movement (for knockback, etc.)
	 */
	public static applyVelocity(
		player: PlayerState,
		velocityX: number,
		velocityY: number,
		delta: number
	): void {
		player.oldX = player.x;
		player.oldY = player.y;
		player.x += velocityX * delta;
		player.y += velocityY * delta;
	}

	/**
	 * Calculate knockback from damage
	 */
	public static calculateKnockback(
		damage: number,
		direction: number
	): { velocityX: number; velocityY: number } {
		const knockbackForce = damage * 0.5;
		return {
			velocityX: Math.cos(direction) * knockbackForce,
			velocityY: Math.sin(direction) * knockbackForce,
		};
	}
}

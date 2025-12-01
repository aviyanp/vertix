// Main physics engine

import { Movement } from "./Movement.ts";
import { CollisionDetection } from "./CollisionDetection.ts";
import { PLAYER_CONFIG } from "../config/gameConfig.ts";
import type {
	PlayerState,
	PlayerInput,
	Tile,
	ClutterObject,
	ProjectileData,
} from "../types/index.ts";

/**
 * PhysicsEngine - Main physics calculations coordinator
 */
export class PhysicsEngine {
	/**
	 * Process a player's movement for one tick
	 */
	public static processPlayerMovement(
		player: PlayerState,
		input: PlayerInput,
		tiles: Tile[],
		clutter: ClutterObject[],
		delta: number
	): void {
		if (player.dead) return;

		// Store old position
		player.oldX = player.x;
		player.oldY = player.y;

		// Apply movement
		Movement.applyMovement(player, input, delta);

		// Check and resolve wall collisions
		player.nameYOffset = CollisionDetection.checkWallCollision(player, tiles);

		// Check and resolve clutter collisions
		CollisionDetection.checkClutterCollision(player, clutter);

		// Update jump physics
		if (input.s) {
			Movement.applyJump(player);
		}
		Movement.updateJump(player, delta);

		// Round position to prevent floating point drift
		player.x = Math.round(player.x);
		player.y = Math.round(player.y);

		// Update input sequence number
		player.isn = input.isn;
	}

	/**
	 * Process a projectile for one tick
	 */
	public static processProjectile(
		projectile: ProjectileData,
		tiles: Tile[],
		clutter: ClutterObject[],
		players: PlayerState[],
		delta: number
	): {
		active: boolean;
		hitPlayer: PlayerState | null;
		hitWall: boolean;
		hitClutter: boolean;
	} {
		if (!projectile.active) {
			return { active: false, hitPlayer: null, hitWall: false, hitClutter: false };
		}

		// Move projectile
		const speed = projectile.speed * delta;
		projectile.x += Math.cos(projectile.dir) * speed;
		projectile.y += Math.sin(projectile.dir) * speed;

		// Update trail
		const distance = Movement.getDistance(
			projectile.startX,
			projectile.startY,
			projectile.x,
			projectile.y
		);
		if (distance >= projectile.trailMaxLength) {
			projectile.startX += Math.cos(projectile.dir) * speed;
			projectile.startY += Math.sin(projectile.dir) * speed;
		}

		// Check clutter collision
		const clutterHit = CollisionDetection.checkProjectileClutterCollision(
			projectile,
			clutter
		);
		if (clutterHit.hit) {
			if (projectile.bounce) {
				this.bounceProjectile(projectile, true);
			} else {
				projectile.active = false;
				return { active: false, hitPlayer: null, hitWall: false, hitClutter: true };
			}
		}

		// Check wall collision
		const wallHit = CollisionDetection.checkProjectileWallCollision(
			projectile,
			tiles
		);
		if (wallHit.hit) {
			if (projectile.bounce) {
				this.bounceProjectile(projectile, wallHit.tile !== null);
			} else {
				projectile.active = false;
				return { active: false, hitPlayer: null, hitWall: true, hitClutter: false };
			}
		}

		// Check player collision
		for (const player of players) {
			if (
				player.index !== projectile.ownerId &&
				!player.dead &&
				CollisionDetection.checkProjectilePlayerCollision(projectile, player)
			) {
				projectile.pierceCount--;
				if (projectile.pierceCount <= 0) {
					projectile.active = false;
				}
				return { active: projectile.active, hitPlayer: player, hitWall: false, hitClutter: false };
			}
		}

		// Check lifetime
		if (
			projectile.maxLifeTime !== null &&
			Date.now() - projectile.startTime > projectile.maxLifeTime
		) {
			projectile.active = false;
		}

		return { active: projectile.active, hitPlayer: null, hitWall: false, hitClutter: false };
	}

	/**
	 * Bounce a projectile off a surface
	 */
	private static bounceProjectile(
		projectile: ProjectileData,
		isHorizontalSurface: boolean
	): void {
		if (isHorizontalSurface) {
			// Bounce off horizontal surface (top/bottom)
			projectile.dir = -projectile.dir;
		} else {
			// Bounce off vertical surface (left/right)
			projectile.dir = Math.PI - projectile.dir;
		}
		// Normalize direction
		projectile.dir = projectile.dir % (2 * Math.PI);
	}

	/**
	 * Check if a player is in range to pick up an item
	 */
	public static isPlayerInPickupRange(
		player: PlayerState,
		itemX: number,
		itemY: number,
		pickupRadius: number = 50
	): boolean {
		return (
			Movement.getDistance(player.x, player.y, itemX, itemY) <= pickupRadius
		);
	}

	/**
	 * Process explosion damage
	 */
	public static processExplosion(
		explosionX: number,
		explosionY: number,
		baseDamage: number,
		radius: number,
		players: PlayerState[],
		ownerIndex: number
	): Array<{ player: PlayerState; damage: number }> {
		const damaged: Array<{ player: PlayerState; damage: number }> = [];

		for (const player of players) {
			if (player.dead) continue;

			const distance = Movement.getDistance(
				explosionX,
				explosionY,
				player.x,
				player.y - player.height / 2
			);

			if (distance <= radius) {
				const damage = CollisionDetection.calculateExplosionDamage(
					baseDamage,
					distance,
					radius
				);
				if (damage > 0) {
					damaged.push({ player, damage });
				}
			}
		}

		return damaged;
	}

	/**
	 * Reconcile client prediction with server state
	 */
	public static reconcileClientState(
		player: PlayerState,
		serverX: number,
		serverY: number,
		serverIsn: number,
		pendingInputs: PlayerInput[],
		tiles: Tile[],
		clutter: ClutterObject[]
	): void {
		// Remove processed inputs
		const filtered = pendingInputs.filter((input) => input.isn > serverIsn);
		pendingInputs.length = 0;
		pendingInputs.push(...filtered);

		// Start from server position
		player.x = serverX;
		player.y = serverY;
		player.isn = serverIsn;

		// Re-apply pending inputs
		for (const input of pendingInputs) {
			this.processPlayerMovement(player, input, tiles, clutter, input.delta);
		}
	}

	/**
	 * Calculate projectile trajectory
	 */
	public static calculateTrajectory(
		startX: number,
		startY: number,
		angle: number,
		distance: number
	): { endX: number; endY: number } {
		return {
			endX: startX + Math.cos(angle) * distance,
			endY: startY + Math.sin(angle) * distance,
		};
	}

	/**
	 * Calculate angle between two points
	 */
	public static calculateAngle(
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): number {
		return Math.atan2(y2 - y1, x2 - x1);
	}

	/**
	 * Apply gravity to an entity
	 */
	public static applyGravity(
		entity: { jumpY: number },
		delta: number
	): void {
		if (entity.jumpY > 0) {
			entity.jumpY -= PLAYER_CONFIG.GRAVITY * delta;
			if (entity.jumpY < 0) {
				entity.jumpY = 0;
			}
		}
	}
}

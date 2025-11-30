// Collision detection for walls, players, and bullets

import { PHYSICS_CONFIG, PLAYER_CONFIG } from "../config/gameConfig.ts";
import type {
	PlayerState,
	Tile,
	ClutterObject,
	ProjectileData,
} from "../types/index.ts";

/**
 * CollisionDetection - Handles all collision detection and resolution
 * Based on wallCol function in app.js (lines 3136-3198)
 */
export class CollisionDetection {
	/**
	 * Check and resolve wall collisions for a player
	 */
	public static checkWallCollision(
		player: PlayerState,
		tiles: Tile[]
	): number {
		if (player.dead) return 0;

		let nameYOffset = 0;

		for (const tile of tiles) {
			if (tile.wall && tile.hasCollision) {
				// Check if player overlaps with wall tile
				if (
					player.x + player.width / 2 >= tile.x &&
					player.x - player.width / 2 <= tile.x + tile.scale &&
					player.y >= tile.y &&
					player.y <= tile.y + tile.scale
				) {
					// Resolve collision based on previous position
					if (player.oldX <= tile.x) {
						player.x = tile.x - player.width / 2 - PHYSICS_CONFIG.COLLISION_BUFFER;
					} else if (player.oldX - player.width / 2 >= tile.x + tile.scale) {
						player.x = tile.x + tile.scale + player.width / 2 + PHYSICS_CONFIG.COLLISION_BUFFER;
					}

					if (player.oldY <= tile.y) {
						player.y = tile.y - PHYSICS_CONFIG.COLLISION_BUFFER;
					} else if (player.oldY >= tile.y + tile.scale) {
						player.y = tile.y + tile.scale + PHYSICS_CONFIG.COLLISION_BUFFER;
					}
				}

				// Calculate name Y offset for rendering behind walls
				if (
					!tile.hardPoint &&
					player.x > tile.x &&
					player.x < tile.x + tile.scale &&
					player.y - player.jumpY - player.height * 0.85 > tile.y - tile.scale / 2 &&
					player.y - player.jumpY - player.height * 0.85 <= tile.y
				) {
					nameYOffset = Math.round(
						player.y - player.jumpY - player.height * 0.85 - (tile.y - tile.scale / 2)
					);
				}
			}
		}

		return nameYOffset;
	}

	/**
	 * Check and resolve clutter object collisions for a player
	 */
	public static checkClutterCollision(
		player: PlayerState,
		clutter: ClutterObject[]
	): void {
		if (player.dead) return;

		for (const obj of clutter) {
			if (obj.type === "clutter" && obj.active && obj.hc) {
				// Check collision with clutter
				if (
					player.x + player.width / 2 >= obj.x &&
					player.x - player.width / 2 <= obj.x + obj.w &&
					player.y >= obj.y - obj.h * obj.tp &&
					player.y <= obj.y
				) {
					// Resolve collision
					if (player.oldX + player.width / 2 <= obj.x) {
						player.x = obj.x - player.width / 2 - 1;
					} else if (player.oldX - player.width / 2 >= obj.x + obj.w) {
						player.x = obj.x + obj.w + player.width / 2 + 1;
					}

					if (player.oldY >= obj.y) {
						player.y = obj.y + 1;
					} else if (player.oldY <= obj.y - obj.h * obj.tp) {
						player.y = obj.y - obj.h * obj.tp - 1;
					}
				}
			}
		}
	}

	/**
	 * Check if a projectile hits a wall tile
	 */
	public static checkProjectileWallCollision(
		projectile: ProjectileData,
		tiles: Tile[]
	): { hit: boolean; tile: Tile | null } {
		const endX =
			projectile.x + Math.cos(projectile.dir) * (projectile.speed + projectile.height);
		const endY =
			projectile.y + Math.sin(projectile.dir) * (projectile.speed + projectile.height);

		for (const tile of tiles) {
			if (tile.wall && tile.hasCollision) {
				if (
					this.lineIntersectsRect(
						projectile.x,
						projectile.y,
						endX,
						endY,
						tile.x,
						tile.y,
						tile.scale,
						tile.scale
					)
				) {
					return { hit: true, tile };
				}
			}
		}

		return { hit: false, tile: null };
	}

	/**
	 * Check if a projectile hits a clutter object
	 */
	public static checkProjectileClutterCollision(
		projectile: ProjectileData,
		clutter: ClutterObject[]
	): { hit: boolean; clutter: ClutterObject | null } {
		const endX =
			projectile.x + Math.cos(projectile.dir) * (projectile.speed + projectile.height);
		const endY =
			projectile.y + Math.sin(projectile.dir) * (projectile.speed + projectile.height);

		for (const obj of clutter) {
			if (obj.type === "clutter" && obj.active && obj.hc) {
				if (
					obj.h * obj.tp >= projectile.yOffset &&
					this.lineIntersectsRect(
						projectile.x,
						projectile.y,
						endX,
						endY,
						obj.x,
						obj.y - obj.h,
						obj.w,
						obj.h - projectile.yOffset
					)
				) {
					return { hit: true, clutter: obj };
				}
			}
		}

		return { hit: false, clutter: null };
	}

	/**
	 * Check if a projectile hits a player
	 */
	public static checkProjectilePlayerCollision(
		projectile: ProjectileData,
		player: PlayerState
	): boolean {
		if (player.dead) return false;
		if (projectile.ownerId === player.index) return false;

		const endX =
			projectile.x + Math.cos(projectile.dir) * (projectile.speed + projectile.height);
		const endY =
			projectile.y + Math.sin(projectile.dir) * (projectile.speed + projectile.height);

		// Check if projectile line intersects player hitbox
		return this.lineIntersectsRect(
			projectile.x,
			projectile.y,
			endX,
			endY,
			player.x - player.width / 2,
			player.y - player.height - player.jumpY,
			player.width,
			player.height
		);
	}

	/**
	 * Check if two players are colliding
	 */
	public static checkPlayerCollision(
		player1: PlayerState,
		player2: PlayerState
	): boolean {
		if (player1.dead || player2.dead) return false;

		const dx = player1.x - player2.x;
		const dy = player1.y - player2.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const minDistance = (player1.width + player2.width) / 2;

		return distance < minDistance;
	}

	/**
	 * Check if a line segment intersects with a rectangle
	 */
	public static lineIntersectsRect(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		rx: number,
		ry: number,
		rw: number,
		rh: number
	): boolean {
		// Check if either endpoint is inside the rectangle
		if (this.pointInRect(x1, y1, rx, ry, rw, rh)) return true;
		if (this.pointInRect(x2, y2, rx, ry, rw, rh)) return true;

		// Check if line intersects any of the rectangle edges
		if (this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry)) return true;
		if (this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh)) return true;
		if (this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh)) return true;
		if (this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry)) return true;

		return false;
	}

	/**
	 * Check if a point is inside a rectangle
	 */
	public static pointInRect(
		px: number,
		py: number,
		rx: number,
		ry: number,
		rw: number,
		rh: number
	): boolean {
		return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
	}

	/**
	 * Check if two line segments intersect
	 */
	public static lineIntersectsLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		x3: number,
		y3: number,
		x4: number,
		y4: number
	): boolean {
		const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
		if (denom === 0) return false;

		const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
		const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

		return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
	}

	/**
	 * Get the distance from a point to a line segment
	 */
	public static pointToLineDistance(
		px: number,
		py: number,
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): number {
		const A = px - x1;
		const B = py - y1;
		const C = x2 - x1;
		const D = y2 - y1;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;

		if (lenSq !== 0) {
			param = dot / lenSq;
		}

		let xx: number;
		let yy: number;

		if (param < 0) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		const dx = px - xx;
		const dy = py - yy;

		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Check if a point is within explosion radius
	 */
	public static isInExplosionRadius(
		explosionX: number,
		explosionY: number,
		radius: number,
		targetX: number,
		targetY: number
	): boolean {
		const dx = targetX - explosionX;
		const dy = targetY - explosionY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance <= radius;
	}

	/**
	 * Calculate explosion damage based on distance
	 */
	public static calculateExplosionDamage(
		baseDamage: number,
		distance: number,
		radius: number
	): number {
		if (distance > radius) return 0;
		// Linear falloff
		const falloff = 1 - distance / radius;
		return Math.floor(baseDamage * falloff);
	}
}

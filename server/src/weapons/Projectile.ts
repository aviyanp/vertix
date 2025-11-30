// Projectile - Bullet/grenade/flame logic

import type { ProjectileData, WeaponStats, PlayerState } from "../types/index.ts";
import { getWeaponStats } from "./weaponData.ts";
import { WEAPON_CONFIG } from "../config/gameConfig.ts";

let nextProjectileId = 0;

/**
 * Projectile - Represents a projectile in the game
 */
export class Projectile implements ProjectileData {
	public id: number;
	public ownerId: number;
	public x: number;
	public y: number;
	public startX: number;
	public startY: number;
	public dir: number;
	public speed: number;
	public width: number;
	public height: number;
	public damage: number;
	public weaponIndex: number;
	public pierce: number;
	public pierceCount: number;
	public bounce: boolean;
	public explodeOnDeath: boolean;
	public active: boolean;
	public startTime: number;
	public maxLifeTime: number | null;
	public yOffset: number;
	public jumpY: number;
	public trailWidth: number;
	public trailMaxLength: number;
	public glowWidth: number | null;
	public glowHeight: number | null;
	public lastHit: string;
	public serverIndex: number;

	constructor() {
		this.id = nextProjectileId++;
		this.ownerId = -1;
		this.x = 0;
		this.y = 0;
		this.startX = 0;
		this.startY = 0;
		this.dir = 0;
		this.speed = 0;
		this.width = 0;
		this.height = 0;
		this.damage = 0;
		this.weaponIndex = 0;
		this.pierce = 1;
		this.pierceCount = 1;
		this.bounce = false;
		this.explodeOnDeath = false;
		this.active = false;
		this.startTime = 0;
		this.maxLifeTime = WEAPON_CONFIG.DEFAULT_BULLET_LIFETIME;
		this.yOffset = 0;
		this.jumpY = 0;
		this.trailWidth = 0;
		this.trailMaxLength = 100;
		this.glowWidth = null;
		this.glowHeight = null;
		this.lastHit = "";
		this.serverIndex = this.id;
	}

	/**
	 * Initialize projectile from a weapon shot
	 */
	public init(
		owner: PlayerState,
		weaponStats: WeaponStats,
		x: number,
		y: number,
		angle: number,
		spreadOffset: number = 0
	): void {
		this.ownerId = owner.index;
		this.x = x;
		this.y = y;
		this.startX = x;
		this.startY = y;
		this.dir = angle + (spreadOffset * Math.PI) / 180; // Convert spread to radians
		this.speed = weaponStats.bulletSpeed;
		this.width = weaponStats.bulletWidth;
		this.height = weaponStats.bulletHeight;
		this.damage = weaponStats.damage;
		this.weaponIndex = weaponStats.index;
		this.pierce = weaponStats.pierce;
		this.pierceCount = weaponStats.pierce;
		this.bounce = weaponStats.bounce;
		this.explodeOnDeath = weaponStats.explodeOnDeath;
		this.active = true;
		this.startTime = Date.now();
		this.maxLifeTime = WEAPON_CONFIG.DEFAULT_BULLET_LIFETIME;
		this.yOffset = 0;
		this.jumpY = owner.jumpY;
		this.trailWidth = weaponStats.trailWidth;
		this.trailMaxLength = weaponStats.trailMaxLength;
		this.glowWidth = weaponStats.glowWidth;
		this.glowHeight = weaponStats.glowHeight;
		this.lastHit = "";
		this.serverIndex = this.id;
	}

	/**
	 * Update projectile position
	 */
	public update(delta: number): void {
		if (!this.active) return;

		// Move projectile
		const moveSpeed = this.speed * delta;
		this.x += Math.cos(this.dir) * moveSpeed;
		this.y += Math.sin(this.dir) * moveSpeed;

		// Update trail start position
		const distance = this.getDistance(
			this.startX,
			this.startY,
			this.x,
			this.y
		);
		if (distance >= this.trailMaxLength) {
			this.startX += Math.cos(this.dir) * moveSpeed;
			this.startY += Math.sin(this.dir) * moveSpeed;
		}

		// Check lifetime
		if (
			this.maxLifeTime !== null &&
			Date.now() - this.startTime > this.maxLifeTime
		) {
			this.deactivate();
		}
	}

	/**
	 * Handle collision with a player
	 */
	public onHitPlayer(playerId: number): boolean {
		if (this.lastHit === `player_${playerId}`) return false;
		this.lastHit = `player_${playerId}`;

		this.pierceCount--;
		if (this.pierceCount <= 0) {
			this.deactivate();
		}
		return true;
	}

	/**
	 * Handle collision with a wall
	 */
	public onHitWall(isHorizontalSurface: boolean): void {
		if (this.bounce) {
			this.bounceOff(isHorizontalSurface);
		} else {
			this.deactivate();
		}
	}

	/**
	 * Handle collision with clutter
	 */
	public onHitClutter(clutterId: number, isHorizontalSurface: boolean): void {
		if (this.lastHit === `clutter_${clutterId}`) return;
		this.lastHit = `clutter_${clutterId}`;

		if (this.bounce) {
			this.bounceOff(isHorizontalSurface);
		} else {
			this.deactivate();
		}
	}

	/**
	 * Bounce off a surface
	 */
	public bounceOff(isHorizontalSurface: boolean): void {
		if (isHorizontalSurface) {
			// Bounce off horizontal surface (top/bottom)
			this.dir = -this.dir;
		} else {
			// Bounce off vertical surface (left/right)
			this.dir = Math.PI - this.dir;
		}
		// Normalize direction to 0-2π
		while (this.dir < 0) this.dir += 2 * Math.PI;
		while (this.dir >= 2 * Math.PI) this.dir -= 2 * Math.PI;
	}

	/**
	 * Deactivate the projectile
	 */
	public deactivate(): void {
		this.active = false;
	}

	/**
	 * Check if projectile should explode
	 */
	public shouldExplode(): boolean {
		return !this.active && this.explodeOnDeath;
	}

	/**
	 * Get explosion radius
	 */
	public getExplosionRadius(): number {
		const stats = getWeaponStats(this.weaponIndex);
		return stats?.explosionRadius || 0;
	}

	/**
	 * Calculate distance between two points
	 */
	private getDistance(
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
	 * Get projectile end point for collision detection
	 */
	public getEndPoint(): { x: number; y: number } {
		const extendedLength = this.speed + this.height;
		return {
			x: this.x + Math.cos(this.dir) * extendedLength,
			y: this.y + Math.sin(this.dir) * extendedLength,
		};
	}

	/**
	 * Check if projectile is still valid
	 */
	public isValid(): boolean {
		return this.active && this.pierceCount > 0;
	}

	/**
	 * Serialize projectile for network transmission
	 */
	public toJSON(): ProjectileData {
		return {
			id: this.id,
			ownerId: this.ownerId,
			x: this.x,
			y: this.y,
			startX: this.startX,
			startY: this.startY,
			dir: this.dir,
			speed: this.speed,
			width: this.width,
			height: this.height,
			damage: this.damage,
			weaponIndex: this.weaponIndex,
			pierce: this.pierce,
			pierceCount: this.pierceCount,
			bounce: this.bounce,
			explodeOnDeath: this.explodeOnDeath,
			active: this.active,
			startTime: this.startTime,
			maxLifeTime: this.maxLifeTime,
			yOffset: this.yOffset,
			jumpY: this.jumpY,
			trailWidth: this.trailWidth,
			trailMaxLength: this.trailMaxLength,
			glowWidth: this.glowWidth,
			glowHeight: this.glowHeight,
			lastHit: this.lastHit,
			serverIndex: this.serverIndex,
		};
	}

	/**
	 * Reset projectile ID counter (for testing)
	 */
	public static resetIdCounter(): void {
		nextProjectileId = 0;
	}
}

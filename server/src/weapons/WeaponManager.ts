// Weapon inventory handling

import { Weapon } from "./Weapon.ts";
import { Projectile } from "./Projectile.ts";
import { getWeaponStats } from "./weaponData.ts";
import type { PlayerState, WeaponInstance } from "../types/index.ts";

/**
 * WeaponManager - Handles weapon inventory and shooting for a player
 */
export class WeaponManager {
	private weapons: Weapon[];
	private currentWeaponIndex: number;
	private projectilePool: Projectile[];
	private activeProjectiles: Map<number, Projectile>;

	constructor(weaponIndexes: number[], projectilePoolSize: number = 100) {
		this.weapons = weaponIndexes.map((index) => new Weapon(index));
		this.currentWeaponIndex = 0;

		// Initialize projectile pool
		this.projectilePool = [];
		for (let i = 0; i < projectilePoolSize; i++) {
			this.projectilePool.push(new Projectile());
		}
		this.activeProjectiles = new Map();
	}

	/**
	 * Get current weapon
	 */
	public getCurrentWeapon(): Weapon | undefined {
		return this.weapons[this.currentWeaponIndex];
	}

	/**
	 * Get weapon at index
	 */
	public getWeapon(index: number): Weapon | undefined {
		return this.weapons[index];
	}

	/**
	 * Get all weapons
	 */
	public getAllWeapons(): Weapon[] {
		return this.weapons;
	}

	/**
	 * Get current weapon index
	 */
	public getCurrentWeaponIndex(): number {
		return this.currentWeaponIndex;
	}

	/**
	 * Switch to weapon at index
	 */
	public switchWeapon(index: number): boolean {
		if (index < 0 || index >= this.weapons.length) return false;
		if (index === this.currentWeaponIndex) return false;

		// Cancel reload on current weapon
		const currentWeapon = this.getCurrentWeapon();
		if (currentWeapon) {
			currentWeapon.cancelReload();
		}

		this.currentWeaponIndex = index;
		return true;
	}

	/**
	 * Switch to next weapon
	 */
	public switchToNextWeapon(): boolean {
		if (this.weapons.length <= 1) return false;
		const nextIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
		return this.switchWeapon(nextIndex);
	}

	/**
	 * Switch to previous weapon
	 */
	public switchToPreviousWeapon(): boolean {
		if (this.weapons.length <= 1) return false;
		const prevIndex =
			(this.currentWeaponIndex - 1 + this.weapons.length) %
			this.weapons.length;
		return this.switchWeapon(prevIndex);
	}

	/**
	 * Attempt to fire current weapon
	 */
	public fire(owner: PlayerState, x: number, y: number, angle: number): Projectile[] {
		const weapon = this.getCurrentWeapon();
		if (!weapon || !weapon.canFire()) return [];

		const projectiles: Projectile[] = [];
		const stats = weapon.stats;

		for (let i = 0; i < stats.bulletsPerShot; i++) {
			// Get spread offset
			const spreadOffset =
				stats.bulletsPerShot > 1
					? stats.spread[i] || 0
					: weapon.getCurrentSpread();

			// Get projectile from pool
			const projectile = this.getProjectileFromPool();
			if (projectile) {
				projectile.init(owner, stats, x, y, angle, spreadOffset);
				this.activeProjectiles.set(projectile.id, projectile);
				projectiles.push(projectile);
			}
		}

		// Fire the weapon (consumes ammo, updates spread)
		weapon.fire();

		return projectiles;
	}

	/**
	 * Get a projectile from the pool
	 */
	private getProjectileFromPool(): Projectile | null {
		for (const projectile of this.projectilePool) {
			if (!projectile.active) {
				return projectile;
			}
		}

		// Pool exhausted, create new projectile
		const newProjectile = new Projectile();
		this.projectilePool.push(newProjectile);
		return newProjectile;
	}

	/**
	 * Request reload for current weapon
	 */
	public reload(): boolean {
		const weapon = this.getCurrentWeapon();
		if (!weapon) return false;
		return weapon.startReload();
	}

	/**
	 * Request reload for specific weapon
	 */
	public reloadWeapon(index: number): boolean {
		const weapon = this.getWeapon(index);
		if (!weapon) return false;
		return weapon.startReload();
	}

	/**
	 * Update all weapons (reload progress)
	 */
	public update(deltaTime: number): number[] {
		const reloadedWeapons: number[] = [];

		for (let i = 0; i < this.weapons.length; i++) {
			if (this.weapons[i].updateReload(deltaTime)) {
				reloadedWeapons.push(i);
			}
		}

		return reloadedWeapons;
	}

	/**
	 * Update all active projectiles
	 */
	public updateProjectiles(delta: number): Projectile[] {
		const expiredProjectiles: Projectile[] = [];

		for (const [id, projectile] of this.activeProjectiles) {
			projectile.update(delta);

			if (!projectile.active) {
				expiredProjectiles.push(projectile);
				this.activeProjectiles.delete(id);
			}
		}

		return expiredProjectiles;
	}

	/**
	 * Get all active projectiles
	 */
	public getActiveProjectiles(): Projectile[] {
		return Array.from(this.activeProjectiles.values());
	}

	/**
	 * Get projectile by ID
	 */
	public getProjectile(id: number): Projectile | undefined {
		return this.activeProjectiles.get(id);
	}

	/**
	 * Remove projectile
	 */
	public removeProjectile(id: number): void {
		const projectile = this.activeProjectiles.get(id);
		if (projectile) {
			projectile.deactivate();
			this.activeProjectiles.delete(id);
		}
	}

	/**
	 * Clear all active projectiles
	 */
	public clearProjectiles(): void {
		for (const projectile of this.activeProjectiles.values()) {
			projectile.deactivate();
		}
		this.activeProjectiles.clear();
	}

	/**
	 * Reset all weapons
	 */
	public resetWeapons(): void {
		for (const weapon of this.weapons) {
			weapon.reset();
		}
		this.currentWeaponIndex = 0;
	}

	/**
	 * Check if any weapon is reloading
	 */
	public isAnyWeaponReloading(): boolean {
		return this.weapons.some((weapon) => weapon.getIsReloading());
	}

	/**
	 * Get weapons as JSON for network
	 */
	public getWeaponsJSON(): WeaponInstance[] {
		return this.weapons.map((weapon) => weapon.toJSON());
	}

	/**
	 * Set weapons from JSON (for deserialization)
	 */
	public setWeaponsFromJSON(weaponsData: WeaponInstance[]): void {
		this.weapons = weaponsData.map((data) => Weapon.fromJSON(data));
		if (this.currentWeaponIndex >= this.weapons.length) {
			this.currentWeaponIndex = 0;
		}
	}
}

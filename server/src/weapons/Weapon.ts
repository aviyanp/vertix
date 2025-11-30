// Base weapon class

import type { WeaponStats, WeaponInstance } from "../types/index.ts";
import { getWeaponStats } from "./weaponData.ts";

/**
 * Weapon - Represents a weapon instance held by a player
 */
export class Weapon implements WeaponInstance {
	public index: number;
	public stats: WeaponStats;
	public ammo: number;
	public reloadTime: number;
	public spreadIndex: number;
	public front: boolean;

	private lastFireTime: number;
	private isReloading: boolean;

	constructor(weaponIndex: number) {
		const stats = getWeaponStats(weaponIndex);
		if (!stats) {
			throw new Error(`Invalid weapon index: ${weaponIndex}`);
		}

		this.index = weaponIndex;
		this.stats = stats;
		this.ammo = stats.maxAmmo;
		this.reloadTime = 0;
		this.spreadIndex = 0;
		this.front = true;
		this.lastFireTime = 0;
		this.isReloading = false;
	}

	/**
	 * Check if the weapon can fire
	 */
	public canFire(): boolean {
		const now = Date.now();
		return (
			this.ammo > 0 &&
			!this.isReloading &&
			now - this.lastFireTime >= this.stats.fireRate
		);
	}

	/**
	 * Fire the weapon
	 */
	public fire(): boolean {
		if (!this.canFire()) return false;

		this.ammo--;
		this.lastFireTime = Date.now();

		// Advance spread pattern
		this.spreadIndex++;
		if (this.spreadIndex >= this.stats.spread.length) {
			this.spreadIndex = 0;
		}

		return true;
	}

	/**
	 * Get current spread value
	 */
	public getCurrentSpread(): number {
		return this.stats.spread[this.spreadIndex] || 0;
	}

	/**
	 * Start reloading
	 */
	public startReload(): boolean {
		if (this.isReloading) return false;
		if (this.ammo === this.stats.maxAmmo) return false;

		this.isReloading = true;
		this.reloadTime = this.stats.reloadSpeed;
		this.spreadIndex = 0;
		return true;
	}

	/**
	 * Update reload progress
	 */
	public updateReload(deltaTime: number): boolean {
		if (!this.isReloading) return false;

		this.reloadTime -= deltaTime;
		if (this.reloadTime <= 0) {
			this.finishReload();
			return true;
		}
		return false;
	}

	/**
	 * Finish reloading
	 */
	public finishReload(): void {
		this.ammo = this.stats.maxAmmo;
		this.reloadTime = 0;
		this.isReloading = false;
		this.spreadIndex = 0;
	}

	/**
	 * Cancel reload
	 */
	public cancelReload(): void {
		this.isReloading = false;
		this.reloadTime = 0;
	}

	/**
	 * Check if weapon is reloading
	 */
	public getIsReloading(): boolean {
		return this.isReloading;
	}

	/**
	 * Get reload progress (0-1)
	 */
	public getReloadProgress(): number {
		if (!this.isReloading) return 1;
		return 1 - this.reloadTime / this.stats.reloadSpeed;
	}

	/**
	 * Check if weapon needs reload
	 */
	public needsReload(): boolean {
		return this.ammo < this.stats.maxAmmo && !this.isReloading;
	}

	/**
	 * Check if weapon is empty
	 */
	public isEmpty(): boolean {
		return this.ammo === 0;
	}

	/**
	 * Get time until next fire
	 */
	public getTimeUntilNextFire(): number {
		const elapsed = Date.now() - this.lastFireTime;
		const remaining = this.stats.fireRate - elapsed;
		return Math.max(0, remaining);
	}

	/**
	 * Reset weapon state
	 */
	public reset(): void {
		this.ammo = this.stats.maxAmmo;
		this.reloadTime = 0;
		this.spreadIndex = 0;
		this.isReloading = false;
		this.lastFireTime = 0;
	}

	/**
	 * Serialize weapon for network transmission
	 */
	public toJSON(): WeaponInstance {
		return {
			index: this.index,
			stats: this.stats,
			ammo: this.ammo,
			reloadTime: this.reloadTime,
			spreadIndex: this.spreadIndex,
			front: this.front,
		};
	}

	/**
	 * Create weapon instance from JSON
	 */
	public static fromJSON(data: WeaponInstance): Weapon {
		const weapon = new Weapon(data.index);
		weapon.ammo = data.ammo;
		weapon.reloadTime = data.reloadTime;
		weapon.spreadIndex = data.spreadIndex;
		weapon.front = data.front;
		return weapon;
	}
}

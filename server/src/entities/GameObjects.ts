// Game objects - Clutter, flags, pickups

import type {
	ClutterObject,
	FlagObject,
	PickupObject,
	GameObject,
	Team,
} from "../types/index.ts";

/**
 * Utility to get random integer in range
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a clutter object
 */
export function createClutterObject(
	index: number,
	x: number,
	y: number,
	width: number,
	height: number,
	hasCollision: boolean = true,
	topPercent: number = 1,
	spriteIndex: number = 0
): ClutterObject {
	return {
		type: "clutter",
		indx: index,
		x,
		y,
		w: width,
		h: height,
		hc: hasCollision,
		tp: topPercent,
		active: true,
		spriteIndex,
	};
}

/**
 * Create a flag object
 */
export function createFlagObject(
	x: number,
	y: number,
	team: Team | "e"
): FlagObject {
	return {
		type: "flag",
		team,
		x,
		y,
		w: 70,
		h: 152,
		ai: randomInt(0, 2),
		ac: 0,
	};
}

/**
 * Create a health pickup
 */
export function createHealthPickup(
	x: number,
	y: number,
	healAmount: number = 50,
	respawnTime: number = 30000
): PickupObject {
	return {
		type: "pickup",
		pickupType: "health",
		x,
		y,
		active: true,
		respawnTime,
		value: healAmount,
	};
}

/**
 * Create a loot crate pickup
 */
export function createLootCrate(
	x: number,
	y: number,
	respawnTime: number = 60000
): PickupObject {
	return {
		type: "pickup",
		pickupType: "loot",
		x,
		y,
		active: true,
		respawnTime,
		value: 0,
	};
}

/**
 * Clutter - Represents a clutter object in the game
 */
export class Clutter implements ClutterObject {
	public type: "clutter" = "clutter";
	public indx: number;
	public x: number;
	public y: number;
	public w: number;
	public h: number;
	public hc: boolean;
	public tp: number;
	public active: boolean;
	public spriteIndex?: number;

	constructor(
		index: number,
		x: number,
		y: number,
		width: number,
		height: number,
		hasCollision: boolean = true,
		topPercent: number = 1
	) {
		this.indx = index;
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
		this.hc = hasCollision;
		this.tp = topPercent;
		this.active = true;
	}

	/**
	 * Deactivate clutter (e.g., when destroyed)
	 */
	public deactivate(): void {
		this.active = false;
	}

	/**
	 * Activate clutter
	 */
	public activate(): void {
		this.active = true;
	}

	/**
	 * Check if a point is inside this clutter
	 */
	public containsPoint(px: number, py: number): boolean {
		return (
			px >= this.x &&
			px <= this.x + this.w &&
			py >= this.y - this.h * this.tp &&
			py <= this.y
		);
	}

	/**
	 * Serialize for network
	 */
	public toJSON(): ClutterObject {
		return {
			type: "clutter",
			indx: this.indx,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			hc: this.hc,
			tp: this.tp,
			active: this.active,
			spriteIndex: this.spriteIndex,
		};
	}
}

/**
 * Flag - Represents a flag/zone marker
 */
export class Flag implements FlagObject {
	public type: "flag" = "flag";
	public team: Team | "e";
	public x: number;
	public y: number;
	public w: number;
	public h: number;
	public ai: number;
	public ac: number;

	constructor(x: number, y: number, team: Team | "e" = "e") {
		this.team = team;
		this.x = x;
		this.y = y;
		this.w = 70;
		this.h = 152;
		this.ai = randomInt(0, 2);
		this.ac = 0;
	}

	/**
	 * Update animation counter
	 */
	public updateAnimation(): void {
		this.ac++;
		if (this.ac > 10) {
			this.ac = 0;
			this.ai = (this.ai + 1) % 3;
		}
	}

	/**
	 * Serialize for network
	 */
	public toJSON(): FlagObject {
		return {
			type: "flag",
			team: this.team,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			ai: this.ai,
			ac: this.ac,
		};
	}
}

/**
 * Pickup - Represents a pickup item
 */
export class Pickup implements PickupObject {
	public type: "pickup" = "pickup";
	public pickupType: "health" | "loot";
	public x: number;
	public y: number;
	public active: boolean;
	public respawnTime: number;
	public value: number;

	private deactivatedAt: number;

	constructor(
		x: number,
		y: number,
		pickupType: "health" | "loot",
		value: number = 50,
		respawnTime: number = 30000
	) {
		this.x = x;
		this.y = y;
		this.pickupType = pickupType;
		this.value = value;
		this.respawnTime = respawnTime;
		this.active = true;
		this.deactivatedAt = 0;
	}

	/**
	 * Collect the pickup
	 */
	public collect(): number {
		if (!this.active) return 0;

		this.active = false;
		this.deactivatedAt = Date.now();
		return this.value;
	}

	/**
	 * Check if pickup should respawn
	 */
	public checkRespawn(): boolean {
		if (this.active) return false;

		if (Date.now() - this.deactivatedAt >= this.respawnTime) {
			this.active = true;
			return true;
		}
		return false;
	}

	/**
	 * Force respawn
	 */
	public respawn(): void {
		this.active = true;
		this.deactivatedAt = 0;
	}

	/**
	 * Get time until respawn
	 */
	public getTimeUntilRespawn(): number {
		if (this.active) return 0;
		const elapsed = Date.now() - this.deactivatedAt;
		return Math.max(0, this.respawnTime - elapsed);
	}

	/**
	 * Serialize for network
	 */
	public toJSON(): PickupObject {
		return {
			type: "pickup",
			pickupType: this.pickupType,
			x: this.x,
			y: this.y,
			active: this.active,
			respawnTime: this.respawnTime,
			value: this.value,
		};
	}
}

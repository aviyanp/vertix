// All 10 weapon stats for Vertix.io

import type { WeaponStats } from "../types/index.ts";

/**
 * Weapon indices mapping
 */
export const WEAPON_INDICES = {
	SMG: 0,
	REVOLVER: 1,
	SNIPER: 2,
	TOYGUN: 3,
	SHOTGUN: 4,
	GRENADES: 5,
	ROCKETS: 6,
	PISTOL: 7,
	MINIGUN: 8,
	FLAMETHROWER: 9,
} as const;

/**
 * Weapon name list
 */
export const WEAPON_NAMES = [
	"smg",
	"revolver",
	"sniper",
	"toygun",
	"shotgun",
	"grenades",
	"rockets",
	"pistol",
	"minigun",
	"flamethrower",
] as const;

/**
 * All weapon stats data
 */
export const WEAPON_DATA: WeaponStats[] = [
	// SMG (index 0) - Machine Gun / Triggerman primary
	{
		index: 0,
		name: "smg",
		displayName: "Machine Gun",
		fireRate: 100, // ms between shots
		damage: 12,
		bulletSpeed: 35,
		bulletWidth: 8,
		bulletHeight: 20,
		spread: [0, 1, -1, 2, -2, 1, -1],
		reloadSpeed: 1500,
		maxAmmo: 30,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 3,
		trailMaxLength: 100,
		glowWidth: null,
		glowHeight: null,
	},
	// Revolver (index 1) - Desert Eagle / Detective primary
	{
		index: 1,
		name: "revolver",
		displayName: "Desert Eagle",
		fireRate: 400,
		damage: 35,
		bulletSpeed: 40,
		bulletWidth: 10,
		bulletHeight: 25,
		spread: [0],
		reloadSpeed: 1800,
		maxAmmo: 6,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 5,
		trailMaxLength: 120,
		glowWidth: null,
		glowHeight: null,
	},
	// Sniper (index 2) - Sniper Rifle / Hunter primary
	{
		index: 2,
		name: "sniper",
		displayName: "Sniper Rifle",
		fireRate: 1000,
		damage: 100,
		bulletSpeed: 60,
		bulletWidth: 6,
		bulletHeight: 40,
		spread: [0],
		reloadSpeed: 2500,
		maxAmmo: 3,
		pierce: 3, // Can pierce through multiple targets
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 4,
		trailMaxLength: 200,
		glowWidth: 20,
		glowHeight: 60,
	},
	// Toygun (index 3) - Toy Blaster / Run N Gun primary
	{
		index: 3,
		name: "toygun",
		displayName: "Toy Blaster",
		fireRate: 150,
		damage: 15,
		bulletSpeed: 30,
		bulletWidth: 12,
		bulletHeight: 12,
		spread: [0, 2, -2, 3, -3, 2, -2],
		reloadSpeed: 1200,
		maxAmmo: 40,
		pierce: 1,
		bounce: true, // Bounces off walls
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 6,
		trailMaxLength: 80,
		glowWidth: 15,
		glowHeight: 15,
	},
	// Shotgun (index 4) - Shotgun / Vince primary
	{
		index: 4,
		name: "shotgun",
		displayName: "Shotgun",
		fireRate: 800,
		damage: 18,
		bulletSpeed: 35,
		bulletWidth: 6,
		bulletHeight: 15,
		spread: [-15, -10, -5, 0, 5, 10, 15],
		reloadSpeed: 2000,
		maxAmmo: 6,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 7, // Fires multiple pellets
		explosionRadius: 0,
		trailWidth: 3,
		trailMaxLength: 60,
		glowWidth: null,
		glowHeight: null,
	},
	// Grenades (index 5) - Grenade Launcher / Secondary for multiple classes
	{
		index: 5,
		name: "grenades",
		displayName: "Grenade Launcher",
		fireRate: 1200,
		damage: 50,
		bulletSpeed: 25,
		bulletWidth: 20,
		bulletHeight: 20,
		spread: [0],
		reloadSpeed: 2200,
		maxAmmo: 4,
		pierce: 1,
		bounce: true,
		explodeOnDeath: true, // Explodes on impact or after time
		bulletsPerShot: 1,
		explosionRadius: 120,
		trailWidth: 0,
		trailMaxLength: 0,
		glowWidth: 30,
		glowHeight: 30,
	},
	// Rockets (index 6) - Rocket Launcher / Rocketeer primary
	{
		index: 6,
		name: "rockets",
		displayName: "Rocket Launcher",
		fireRate: 1500,
		damage: 75,
		bulletSpeed: 20,
		bulletWidth: 15,
		bulletHeight: 35,
		spread: [0],
		reloadSpeed: 3000,
		maxAmmo: 3,
		pierce: 1,
		bounce: false,
		explodeOnDeath: true,
		bulletsPerShot: 1,
		explosionRadius: 150,
		trailWidth: 8,
		trailMaxLength: 150,
		glowWidth: 40,
		glowHeight: 50,
	},
	// Pistol (index 7) - Machine Pistol / Hunter secondary
	{
		index: 7,
		name: "pistol",
		displayName: "Machine Pistol",
		fireRate: 120,
		damage: 10,
		bulletSpeed: 32,
		bulletWidth: 6,
		bulletHeight: 15,
		spread: [0, 1, -1, 2, -2],
		reloadSpeed: 1400,
		maxAmmo: 20,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 2,
		trailMaxLength: 80,
		glowWidth: null,
		glowHeight: null,
	},
	// Minigun (index 8) - Minigun / Spray N Pray primary
	{
		index: 8,
		name: "minigun",
		displayName: "Minigun",
		fireRate: 50, // Very fast fire rate
		damage: 8,
		bulletSpeed: 38,
		bulletWidth: 5,
		bulletHeight: 18,
		spread: [0, 2, -2, 4, -4, 3, -3, 5, -5],
		reloadSpeed: 3500,
		maxAmmo: 100,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 2,
		trailMaxLength: 90,
		glowWidth: null,
		glowHeight: null,
	},
	// Flamethrower (index 9) - Flamethrower / Arsonist primary
	{
		index: 9,
		name: "flamethrower",
		displayName: "Flamethrower",
		fireRate: 40, // Very fast, continuous stream
		damage: 5,
		bulletSpeed: 15, // Slower projectiles
		bulletWidth: 20,
		bulletHeight: 20,
		spread: [-5, 0, 5, -3, 3, -8, 8],
		reloadSpeed: 2500,
		maxAmmo: 150,
		pierce: 1,
		bounce: false,
		explodeOnDeath: false,
		bulletsPerShot: 1,
		explosionRadius: 0,
		trailWidth: 15,
		trailMaxLength: 30,
		glowWidth: 25,
		glowHeight: 25,
	},
];

/**
 * Get weapon stats by index
 */
export function getWeaponStats(index: number): WeaponStats | undefined {
	return WEAPON_DATA[index];
}

/**
 * Get weapon stats by name
 */
export function getWeaponStatsByName(name: string): WeaponStats | undefined {
	return WEAPON_DATA.find((weapon) => weapon.name === name);
}

/**
 * Get all weapon names
 */
export function getAllWeaponNames(): readonly string[] {
	return WEAPON_NAMES;
}

// All 8 character classes for Vertix.io

import type { CharacterClass } from "../types/index.ts";
import { WEAPON_INDICES } from "../weapons/weaponData.ts";

/**
 * Character classes data
 * Based on characterClasses array in app.js (lines 4477-4559)
 */
export const CHARACTER_CLASSES: CharacterClass[] = [
	{
		classN: "Triggerman",
		weaponIndexes: [WEAPON_INDICES.SMG, WEAPON_INDICES.GRENADES],
		pWeapon: "Machine Gun",
		sWeapon: "Grenade Launcher",
		folderName: "triggerman",
		hasDown: false,
	},
	{
		classN: "Detective",
		weaponIndexes: [WEAPON_INDICES.REVOLVER, WEAPON_INDICES.GRENADES],
		pWeapon: "Desert Eagle",
		sWeapon: "Grenade Launcher",
		folderName: "detective",
		hasDown: false,
	},
	{
		classN: "Hunter",
		weaponIndexes: [WEAPON_INDICES.SNIPER, WEAPON_INDICES.PISTOL],
		pWeapon: "Sniper",
		sWeapon: "Machine Pistol",
		folderName: "hunter",
		hasDown: true,
	},
	{
		classN: "Run 'N Gun",
		weaponIndexes: [WEAPON_INDICES.TOYGUN],
		pWeapon: "Toy Blaster",
		sWeapon: "None",
		folderName: "billy",
		hasDown: false,
	},
	{
		classN: "Vince",
		weaponIndexes: [WEAPON_INDICES.SHOTGUN, WEAPON_INDICES.GRENADES],
		pWeapon: "Shotgun",
		sWeapon: "Grenade Launcher",
		folderName: "vinc",
		hasDown: true,
	},
	{
		classN: "Rocketeer",
		name: "General Weiss",
		weaponIndexes: [WEAPON_INDICES.ROCKETS],
		pWeapon: "Rocket Launcher",
		sWeapon: "None",
		folderName: "rocketeer",
		hasDown: false,
	},
	{
		classN: "Spray N' Pray",
		weaponIndexes: [WEAPON_INDICES.MINIGUN],
		pWeapon: "Minigun",
		sWeapon: "None",
		folderName: "mbob",
		hasDown: true,
	},
	{
		classN: "Arsonist",
		weaponIndexes: [WEAPON_INDICES.FLAMETHROWER],
		pWeapon: "Flamethrower",
		sWeapon: "None",
		folderName: "pyro",
		hasDown: true,
	},
];

/**
 * Special boss classes (not normally playable)
 */
export const SPECIAL_CLASSES: CharacterClass[] = [
	{
		classN: "Duck",
		weaponIndexes: [WEAPON_INDICES.FLAMETHROWER],
		pWeapon: "Jump",
		sWeapon: "None",
		folderName: "boss2",
		hasDown: true,
	},
	{
		classN: "Nademan",
		weaponIndexes: [WEAPON_INDICES.GRENADES],
		pWeapon: "Nade Launcher",
		sWeapon: "None",
		folderName: "demo",
		hasDown: false,
	},
];

/**
 * Get character class by index
 */
export function getCharacterClass(index: number): CharacterClass | undefined {
	return CHARACTER_CLASSES[index];
}

/**
 * Get character class by name
 */
export function getCharacterClassByName(
	name: string
): CharacterClass | undefined {
	return CHARACTER_CLASSES.find(
		(c) => c.classN.toLowerCase() === name.toLowerCase()
	);
}

/**
 * Get all character classes
 */
export function getAllCharacterClasses(): CharacterClass[] {
	return CHARACTER_CLASSES;
}

/**
 * Get number of playable classes
 */
export function getPlayableClassCount(): number {
	return CHARACTER_CLASSES.length;
}

/**
 * Check if a class index is valid
 */
export function isValidClassIndex(index: number): boolean {
	return index >= 0 && index < CHARACTER_CLASSES.length;
}

/**
 * Get weapon indexes for a class
 */
export function getClassWeaponIndexes(classIndex: number): number[] {
	const characterClass = getCharacterClass(classIndex);
	return characterClass?.weaponIndexes || [];
}

/**
 * Get class folder name for sprites
 */
export function getClassFolderName(classIndex: number): string {
	const characterClass = getCharacterClass(classIndex);
	return characterClass?.folderName || "triggerman";
}

/**
 * Check if class has down animation
 */
export function classHasDownAnimation(classIndex: number): boolean {
	const characterClass = getCharacterClass(classIndex);
	return characterClass?.hasDown || false;
}

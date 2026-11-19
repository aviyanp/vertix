import { camos, hats, shirts } from "core/src/skins.ts";
import { getSoldItems, getUserUnlocks, grantUnlock, type UnlockItemType } from "./db.ts";

// Sprays have no rarity ("chance") field in their catalog, so the unlock
// economy only covers hats/shirts/camos — there's no rarity data to hook a
// milestone into for sprays.

// Lifetime-score milestones, keyed by the catalog's existing "chance" rarity
// weight (higher chance = more common = unlocks earlier). Items with chance
// <= 0 are treated as disabled/unobtainable and never unlock.
const RARITY_TIERS = [
	{ minChance: 90, scoreThreshold: 0 }, // common — unlocked from the start
	{ minChance: 20, scoreThreshold: 2000 }, // uncommon
	{ minChance: 5, scoreThreshold: 8000 }, // rare
	{ minChance: 0.5, scoreThreshold: 20000 }, // epic
	{ minChance: 0.01, scoreThreshold: 50000 }, // legendary
] as const;

function thresholdForChance(chance: number): number {
	for (const tier of RARITY_TIERS) {
		if (chance >= tier.minChance) return tier.scoreThreshold;
	}
	return Number.POSITIVE_INFINITY;
}

// sprays are market-only unlocks — the drop/milestone economy only ever
// grants equippable catalog items
export type DropItemType = Exclude<UnlockItemType, "spray">;

// carries type+id as well as the display fields so callers can render the item's
// image and tooltip (the scoreboard's "Last Reward" cell needs all four)
export type UnlockedItem = { type: DropItemType; id: number; name: string; chance: number };

/**
 * Grants any hat/shirt/camo unlocks the player's lifetime score newly
 * qualifies for. Returns the items unlocked by THIS call (empty if none),
 * including their rarity `chance` so callers can render rarity-colored
 * reveal banners.
 */
export function checkForNewUnlocks(userId: number, lifetimeScore: number): UnlockedItem[] {
	const newlyUnlocked: UnlockedItem[] = [];
	// items the player already sold once must not be re-granted for free —
	// otherwise sell → relog → re-grant mints infinite KR at sellback price
	const sold = new Set(getSoldItems(userId).map((s) => `${s.item_type}:${s.item_id}`));

	for (const hat of hats) {
		if (hat.chance <= 0 || hat.hide || sold.has(`hat:${hat.id}`)) continue;
		if (lifetimeScore < thresholdForChance(hat.chance)) continue;
		if (grantUnlock(userId, "hat", hat.id))
			newlyUnlocked.push({ type: "hat", id: hat.id, name: hat.name, chance: hat.chance });
	}
	for (const shirt of shirts) {
		if (shirt.chance <= 0 || shirt.hide || sold.has(`shirt:${shirt.id}`)) continue;
		if (lifetimeScore < thresholdForChance(shirt.chance)) continue;
		if (grantUnlock(userId, "shirt", shirt.id))
			newlyUnlocked.push({ type: "shirt", id: shirt.id, name: shirt.name, chance: shirt.chance });
	}
	for (const camo of camos) {
		if (camo.chance <= 0 || camo.hide || sold.has(`camo:${camo.id}`)) continue;
		if (lifetimeScore < thresholdForChance(camo.chance)) continue;
		if (grantUnlock(userId, "camo", camo.id))
			newlyUnlocked.push({ type: "camo", id: camo.id, name: camo.name, chance: camo.chance });
	}

	return newlyUnlocked;
}

const CATALOGS: Record<
	DropItemType,
	{ id: number; name: string; chance: number; hide?: boolean }[]
> = {
	hat: hats,
	shirt: shirts,
	camo: camos,
};

/**
 * Returns the user's unlocked items resolved against the catalogs, with their
 * rarity `chance` so callers (e.g. the public profile page) can render
 * rarity-tiered achievement lists. Sorted rarest first.
 */
export function getUserUnlockedItems(
	userId: number,
): { type: UnlockItemType; name: string; chance: number }[] {
	const items: { type: UnlockItemType; name: string; chance: number }[] = [];
	for (const unlock of getUserUnlocks(userId)) {
		// spray unlocks have no rarity catalog entry — they render via sprays.ts
		const catalog = (CATALOGS as Partial<Record<UnlockItemType, (typeof CATALOGS)[DropItemType]>>)[
			unlock.item_type
		];
		const item = catalog?.find((i) => i.id === unlock.item_id);
		if (item) items.push({ type: unlock.item_type, name: item.name, chance: item.chance });
	}
	return items.sort((a, b) => a.chance - b.chance);
}

/**
 * Every cosmetic the user doesn't own yet, with `weight` pre-populated from
 * the catalog's rarity `chance` so a caller can tilt the roll.
 */
function unownedDropPool(userId: number): { itemType: DropItemType; id: number; name: string; chance: number; weight: number }[] {
	const owned = new Set(getUserUnlocks(userId).map((u) => `${u.item_type}:${u.item_id}`));
	const pool: { itemType: DropItemType; id: number; name: string; chance: number; weight: number }[] = [];
	for (const itemType of Object.keys(CATALOGS) as DropItemType[]) {
		for (const item of CATALOGS[itemType]) {
			// hidden items (e.g. Bones) never render in the loadout picker, so
			// awarding one hands the player a cosmetic they can never equip
			if (item.chance <= 0 || item.hide) continue;
			if (owned.has(`${itemType}:${item.id}`)) continue;
			pool.push({ itemType, id: item.id, name: item.name, chance: item.chance, weight: item.chance });
		}
	}
	return pool;
}

/** Weighted pick from the pool, grants the chosen item, returns it (null on empty pool). */
function rollDropFromPool(
	userId: number,
	pool: { itemType: DropItemType; id: number; name: string; chance: number; weight: number }[],
): UnlockedItem | null {
	if (pool.length === 0) return null;
	const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * totalWeight;
	let chosen = pool[pool.length - 1];
	for (const item of pool) {
		roll -= item.weight;
		if (roll <= 0) {
			chosen = item;
			break;
		}
	}
	grantUnlock(userId, chosen.itemType, chosen.id);
	return { type: chosen.itemType, id: chosen.id, name: chosen.name, chance: chosen.chance };
}

/**
 * Opens a reward crate: picks a random currently-unowned hat/shirt/camo
 * weighted by its rarity `chance` (not gated by score threshold — that's
 * what makes a crate worth more than the passive unlock system). Returns
 * null if the user already owns everything obtainable.
 */
export function openCrateForUser(
	userId: number,
): { itemType: DropItemType; itemId: number; itemName: string; chance: number } | null {
	const drop = rollDropFromPool(userId, unownedDropPool(userId));
	if (!drop) return null;
	return { itemType: drop.type, itemId: drop.id, itemName: drop.name, chance: drop.chance };
}

// --- end-of-round placement drops ---------------------------------------------
//
// The primary reward path: how you finish on the leaderboard decides both
// WHETHER you get a drop and how rare it leans — no crate in the middle.

// Chance of any drop at all, by 1-based leaderboard placement (capped at the
// last row). First place always drops; deeper finishes roll progressively
// worse odds.
const DROP_CHANCE = [1, 0.85, 0.65, 0.4, 0.25] as const;

// Per-rarity-tier weight multipliers by placement. A first-place finish tilts
// the same catalog heavily toward rare pulls without ever making a legendary
// likely; a bottom finish gets the flat catalog odds.
const TIER_MULT = [
	[1, 1, 2, 4, 8], // 1st
	[1, 1, 1.5, 3, 5], // 2nd
	[1, 1, 1.2, 2, 3], // 3rd
	[1, 1, 1, 1.5, 2], // 4th
	[1, 1, 1, 1.2, 1.5], // 5th+
] as const;

function tierIndex(chance: number): number {
	for (let i = 0; i < RARITY_TIERS.length; i++) {
		if (chance >= RARITY_TIERS[i].minChance) return i;
	}
	return RARITY_TIERS.length - 1;
}

/**
 * Rolls one end-of-round drop for a leaderboard placement (1 = first place).
 * Better finishes are likelier to drop at all and lean rarer. Grants the item
 * directly — returns it for reveal/lastItem wiring, null on a missed roll or
 * when the user owns everything.
 */
export function rollPlacementDrop(userId: number, placement: number): UnlockedItem | null {
	const row = Math.min(Math.max(placement, 1), DROP_CHANCE.length) - 1;
	if (Math.random() >= DROP_CHANCE[row]) return null;
	const mult = TIER_MULT[Math.min(row, TIER_MULT.length - 1)];
	const pool = unownedDropPool(userId);
	for (const item of pool) {
		item.weight = item.chance * mult[tierIndex(item.chance)];
	}
	return rollDropFromPool(userId, pool);
}

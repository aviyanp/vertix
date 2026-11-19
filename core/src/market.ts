/**
 * KR — the game's earnable currency — and marketplace pricing shared between
 * server (authoritative) and client (display). Wins pay KR; the market sells
 * cosmetic unlocks for it.
 */

/** KR credited to each winner at round end (private rooms excluded — unranked). */
export const KR_WIN = 100;

/** Fraction of the list price returned when selling an owned cosmetic. */
export const KR_SELLBACK = 0.4;

/**
 * List price for a hat/shirt/camo from its rarity `chance` — the same tier
 * thresholds the milestone/drop system uses, so drops stay meaningfully rarer
 * than what KR can casually buy.
 */
export function krPriceForChance(chance: number): number {
	if (chance >= 90) return 150; // common
	if (chance >= 20) return 500; // uncommon
	if (chance >= 5) return 1500; // rare
	if (chance >= 0.5) return 4000; // epic
	return 10000; // legendary
}

/**
 * Spray ids sold exclusively in the market (creator/clan sprays). Every spray
 * NOT listed here stays free for everyone — the basic sprays are part of the
 * base game.
 */
export const MARKET_SPRAYS: Record<number, number> = {
	65: 400, // Dawe (new)
	69: 500, // TJ Clan Spray
	71: 500, // WINX Clan Spray
	72: 500, // RCX Clan Spray
	78: 500, // BOT! Clan Spray
	79: 400, // Awake (new)
	80: 400, // jbernz18
	81: 500, // Mau Clan Spray
	82: 400, // CustomVan
};

/** KR price for a spray, or null when the spray is free for everyone. */
export function marketSprayPrice(id: number): number | null {
	return MARKET_SPRAYS[id] ?? null;
}

/**
 * Marketplace: buy and sell cosmetic unlocks for KR. All validation and money
 * movement is server-side; the shared pricing table in core/src/market.ts is
 * what the client displays.
 */
import { KR_SELLBACK, krPriceForChance, marketSprayPrice } from "core/src/market.ts";
import { camos, hats, shirts } from "core/src/skins.ts";
import { sprays } from "core/src/sprays.ts";
import {
	addKr,
	deleteUnlock,
	getDb,
	getUserStats,
	getUserUnlocks,
	grantUnlock,
	hasUnlock,
	recordSale,
	spendKr,
	type UnlockItemType,
} from "./db.ts";

export type MarketCosmetic = {
	type: "hat" | "shirt" | "camo";
	id: number;
	name: string;
	chance: number;
	price: number;
	sellPrice: number;
	owned: boolean;
};
export type MarketSpray = {
	type: "spray";
	id: number;
	name: string;
	price: number;
	sellPrice: number;
	owned: boolean;
};

function cosmeticPrice(type: UnlockItemType, id: number): number | null {
	const catalog = type === "hat" ? hats : type === "shirt" ? shirts : camos;
	const item = catalog.find((i) => i.id === id);
	// hidden items can't be equipped — same rule as the drop pool
	if (!item || item.hide) return null;
	return krPriceForChance(item.chance);
}

function sellPrice(price: number): number {
	return Math.floor(price * KR_SELLBACK);
}

export function getMarketData(userId: number): {
	kr: number;
	items: (MarketCosmetic | MarketSpray)[];
} {
	const owned = new Set(getUserUnlocks(userId).map((u) => `${u.item_type}:${u.item_id}`));
	const items: (MarketCosmetic | MarketSpray)[] = [];
	for (const [type, catalog] of [
		["hat", hats],
		["shirt", shirts],
		["camo", camos],
	] as const) {
		for (const item of catalog) {
			if (item.hide) continue;
			const price = krPriceForChance(item.chance);
			items.push({
				type,
				id: item.id,
				name: item.name,
				chance: item.chance,
				price,
				sellPrice: sellPrice(price),
				owned: owned.has(`${type}:${item.id}`),
			});
		}
	}
	for (const spray of sprays) {
		const price = marketSprayPrice(spray.id);
		if (price === null) continue; // free sprays aren't market items
		items.push({
			type: "spray",
			id: spray.id,
			name: spray.name,
			price,
			sellPrice: sellPrice(price),
			owned: owned.has(`spray:${spray.id}`),
		});
	}
	return { kr: getUserStats(userId)?.kr ?? 0, items };
}

export type MarketResult = { success: true; kr: number } | { success: false; error: string };

function priceFor(type: string, id: number): number | null {
	if (type === "hat" || type === "shirt" || type === "camo") {
		return cosmeticPrice(type, id);
	}
	if (type === "spray") return marketSprayPrice(id);
	return null;
}

export function buyMarketItem(userId: number, type: string, id: number): MarketResult {
	const price = priceFor(type, id);
	if (price === null) return { success: false, error: "Not for sale" };
	if (hasUnlock(userId, type as UnlockItemType, id)) {
		return { success: false, error: "Already owned" };
	}
	// debit + grant in one transaction: a crash between them must not leave
	// the KR gone with no cosmetic to show for it
	const bought = getDb().transaction(() => {
		if (!spendKr(userId, price)) return false;
		grantUnlock(userId, type as UnlockItemType, id);
		return true;
	})();
	if (!bought) return { success: false, error: "Not enough KR" };
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

export function sellMarketItem(userId: number, type: string, id: number): MarketResult {
	const price = priceFor(type, id);
	if (price === null) return { success: false, error: "Not sellable" };
	if (!hasUnlock(userId, type as UnlockItemType, id)) {
		return { success: false, error: "Not owned" };
	}
	getDb().transaction(() => {
		deleteUnlock(userId, type, id);
		recordSale(userId, type, id);
		addKr(userId, sellPrice(price));
	})();
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

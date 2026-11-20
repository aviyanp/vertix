/**
 * Marketplace: fixed-price mint/sell plus player-to-player listings for KR.
 * All validation and money movement is server-side; the shared pricing table in
 * core/src/market.ts is what the client displays. Serial numbers make every
 * copy individually ownable and listable.
 */
import { KR_SELLBACK, krPriceForChance, marketSprayPrice } from "core/src/market.ts";
import { camos, hats, shirts } from "core/src/skins.ts";
import { sprays } from "core/src/sprays.ts";
import { getCosmeticImageUrl } from "core/src/utils.ts";
import {
	addKr,
	deleteUnlock,
	delistUnlock,
	getDb,
	getListingRow,
	getMarketListings,
	getUnlockSupplyStats,
	getUserStats,
	getUserUnlocks,
	grantUnlock,
	hasUnlock,
	listUnlock,
	spendKr,
	transferUnlock,
	type UnlockItemType,
	type UserUnlock,
} from "./db.ts";

function officialPrice(type: string, id: number): number | null {
	if (type === "hat" || type === "shirt" || type === "camo") {
		const catalog = type === "hat" ? hats : type === "shirt" ? shirts : camos;
		const item = catalog.find((i) => i.id === id);
		// hidden items can't be equipped — same rule as the drop pool
		if (!item || item.hide) return null;
		return krPriceForChance(item.chance);
	}
	if (type === "spray") return marketSprayPrice(id);
	return null;
}

function sellPrice(price: number): number {
	return Math.floor(price * KR_SELLBACK);
}

export type MarketPageItem = {
	type: UnlockItemType;
	id: number;
	name: string;
	chance: number | null;
	image: string;
	officialPrice: number | null;
	sellPrice: number | null;
	minted: number;
	owners: number;
	lowestAsk: number | null;
};

export type MarketPageData = {
	kr: number;
	items: MarketPageItem[];
	listings: { type: string; id: number; serial: number; price: number; seller: string }[];
	mine: { type: string; id: number; serial: number; listedPrice: number | null }[];
};

/**
 * The whole marketplace payload in four queries total — catalog walks are
 * in-memory, supply stats and listings come from single GROUP BY / JOIN scans.
 */
export function getMarketPageData(userId: number | undefined): MarketPageData {
	const stats = getUnlockSupplyStats();
	const items: MarketPageItem[] = [];
	const owned = userId ? new Map(getUserUnlocks(userId).map((u) => [`${u.item_type}:${u.item_id}`, u])) : new Map();

	for (const [type, catalog] of [
		["hat", hats],
		["shirt", shirts],
		["camo", camos],
	] as const) {
		for (const item of catalog) {
			if (item.hide) continue;
			const price = krPriceForChance(item.chance);
			const s = stats.get(`${type}:${item.id}`);
			items.push({
				type,
				id: item.id,
				name: item.name,
				chance: item.chance,
				image: getCosmeticImageUrl(type, item.id),
				officialPrice: price,
				sellPrice: sellPrice(price),
				minted: s?.minted ?? 0,
				owners: s?.owners ?? 0,
				lowestAsk: s?.minPrice ?? null,
			});
		}
	}
	for (const spray of sprays) {
		const price = marketSprayPrice(spray.id);
		if (price === null) continue; // free sprays aren't market items
		const s = stats.get(`spray:${spray.id}`);
		items.push({
			type: "spray",
			id: spray.id,
			name: spray.name,
			chance: null,
			image: `/images/sprays/${spray.id}.png`,
			officialPrice: price,
			sellPrice: sellPrice(price),
			minted: s?.minted ?? 0,
			owners: s?.owners ?? 0,
			lowestAsk: s?.minPrice ?? null,
		});
	}
	return {
		kr: userId ? (getUserStats(userId)?.kr ?? 0) : 0,
		items,
		listings: getMarketListings().map((l) => ({
			type: l.item_type,
			id: l.item_id,
			serial: l.serial,
			price: l.price,
			seller: l.seller,
		})),
		mine: [...owned.values()].map((u: UserUnlock) => ({
			type: u.item_type,
			id: u.item_id,
			serial: u.serial,
			listedPrice: u.listed_price,
		})),
	};
}

export type MarketResult = { success: true; kr: number } | { success: false; error: string };

/** Mint a fresh copy at the official price — unlimited supply, new serial. */
export function buyMarketItem(userId: number, type: string, id: number): MarketResult {
	const price = officialPrice(type, id);
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

/** Instant sell-back to the void at KR_SELLBACK of official price. */
export function sellMarketItem(userId: number, type: string, id: number): MarketResult {
	const price = officialPrice(type, id);
	if (price === null) return { success: false, error: "Not sellable" };
	if (!hasUnlock(userId, type as UnlockItemType, id)) {
		return { success: false, error: "Not owned" };
	}
	getDb().transaction(() => {
		deleteUnlock(userId, type, id);
		addKr(userId, sellPrice(price));
	})();
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

export function listMarketItem(userId: number, type: string, id: number, price: number): MarketResult {
	if (officialPrice(type, id) === null) return { success: false, error: "Not listable" };
	if (!Number.isInteger(price) || price < 1 || price > 1_000_000_000) {
		return { success: false, error: "Invalid price" };
	}
	if (!listUnlock(userId, type, id, price)) {
		return { success: false, error: "Not owned or already listed" };
	}
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

export function delistMarketItem(userId: number, type: string, id: number): MarketResult {
	if (!delistUnlock(userId, type, id)) return { success: false, error: "Not listed" };
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

/**
 * Player-to-player purchase: in ONE transaction, the listing is re-read (it can
 * vanish between page load and click), the buyer is debited, the copy transfers
 * owners, and the seller is credited. Any step failing rolls all of it back.
 */
export function buyListing(
	userId: number,
	type: string,
	id: number,
	serial: number,
	expectedPrice: number,
): MarketResult {
	const bought = getDb().transaction(() => {
		const listing = getListingRow(type, id, serial);
		if (!listing) return "gone" as const;
		if (listing.seller_id === userId) return "own" as const;
		// the seller can delist and relist at a new ask before the click lands —
		// charge only the price the buyer actually saw
		if (listing.price !== expectedPrice) return "stale" as const;
		// one copy per item per account — the PK can't hold two serials of the
		// same item for a user
		if (hasUnlock(userId, type as UnlockItemType, id)) return "dup" as const;
		if (!spendKr(userId, listing.price)) return "poor" as const;
		transferUnlock(userId, type, id, serial);
		addKr(listing.seller_id, listing.price);
		return listing.price;
	})();
	if (bought === "gone") return { success: false, error: "Listing gone" };
	if (bought === "own") return { success: false, error: "That's your listing" };
	if (bought === "stale") return { success: false, error: "Price changed — refresh" };
	if (bought === "dup") return { success: false, error: "Already owned" };
	if (bought === "poor") return { success: false, error: "Not enough KR" };
	return { success: true, kr: getUserStats(userId)?.kr ?? 0 };
}

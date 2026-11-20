/**
 * Admin-created cosmetics: rows in `custom_cosmetics` merged over the static
 * catalogs so they behave like first-class items — milestones, drops, market,
 * loadout and equip validation all read through `allItems`/`itemById`.
 * Custom ids live at CUSTOM_ID_BASE + rowid so they can never collide with the
 * static catalogs, and their art lives in the custom_cosmetics.png blob served
 * by /api/customCosmeticImg.
 */
import { rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { camos, hats, shirts } from "core/src/skins.ts";
import { sprays } from "core/src/sprays.ts";
import {
	getCustomCosmeticRows,
	getCustomCosmeticPng,
	insertCustomCosmetic,
	deleteCustomCosmeticRow,
	type UnlockItemType,
} from "./db.ts";

export const CUSTOM_ID_BASE = 10_000;
const CUSTOM_DIR = join(import.meta.dirname, "data", "custom");

const STATIC: Record<UnlockItemType, { id: number; name: string; chance?: number; hide?: boolean }[]> = {
	hat: hats,
	shirt: shirts,
	camo: camos,
	spray: sprays,
};

export type CustomItem = {
	id: number;
	type: UnlockItemType;
	name: string;
	chance: number;
	price: number | null;
	hide: boolean;
	image: string;
	rowid: number;
};

let cache: CustomItem[] | null = null;

function load(): CustomItem[] {
	return getCustomCosmeticRows().map((r) => ({
		id: CUSTOM_ID_BASE + r.id,
		type: r.type as UnlockItemType,
		name: r.name,
		chance: r.chance,
		price: r.price,
		hide: !!r.hide,
		image: `/api/customCosmeticImg/${r.id}.png`,
		rowid: r.id,
	}));
}

export function getCustomCosmetics(): CustomItem[] {
	cache ??= load();
	return cache;
}

export function invalidateCustomCache(): void {
	cache = null;
	merged = {};
}

// merged arrays are memoized per type — validators and the market walk them
// on hot paths (per socket message / per market request)
let merged: Partial<Record<UnlockItemType, { id: number; name: string; chance?: number; hide?: boolean; image?: string; price?: number | null }[]>> = {};

/** Static catalog + custom rows, as the merge point for every consumer. */
export function allItems(type: UnlockItemType): ({ id: number; name: string; chance?: number; hide?: boolean; image?: string; price?: number | null })[] {
	return (merged[type] ??= [
		...(STATIC[type] as { id: number; name: string; chance?: number; hide?: boolean }[]),
		...getCustomCosmetics()
			.filter((c) => c.type === type)
			.map((c) => ({
				id: c.id,
				name: c.name,
				chance: c.chance,
				hide: c.hide,
				image: c.image,
				price: c.price,
				// sprays need render settings — clients read .info on the equipped spray
				...(type === "spray" ? { info: { scale: 64, alpha: 1, resolution: 30 } } : {}),
			})),
	]);
}

export function itemById(type: UnlockItemType, id: number): { id: number; name: string; chance?: number; hide?: boolean; image?: string; price?: number | null } | undefined {
	return allItems(type).find((i) => i.id === id);
}

export function isValidItemId(type: UnlockItemType, id: number): boolean {
	return itemById(type, id) !== undefined;
}

const MAX_IMG_BYTES = 500_000;

/** Saves the PNG, inserts the row, returns the new item. Throws on bad input. */
export async function createCustomCosmetic(input: {
	type: string;
	name: string;
	chance: number;
	price: number | null;
	hide: boolean;
	png: Buffer;
}): Promise<CustomItem> {
	const type = input.type as UnlockItemType;
	if (!STATIC[type]) throw new Error("type must be hat|shirt|camo|spray");
	const name = input.name.trim().substring(0, 40);
	if (!name) throw new Error("Name required");
	if (input.png.length > MAX_IMG_BYTES) throw new Error("Image too large (500KB max)");
	// normalize to PNG so whatever the admin uploads stores uniformly
	const png = await sharp(input.png).png().toBuffer().catch(() => null);
	if (!png) throw new Error("Image must be a valid image file");
	const rowid = insertCustomCosmetic({
		type,
		name,
		chance: Math.min(100, Math.max(0, input.chance)),
		price: input.price !== null && Number.isInteger(input.price) && input.price! > 0 ? input.price : null,
		hide: input.hide ? 1 : 0,
		image: "",
		png,
	});
	invalidateCustomCache();
	return getCustomCosmetics().find((c) => c.rowid === rowid)!;
}

export function deleteCustomCosmetic(cosmeticRowId: number): boolean {
	const row = deleteCustomCosmeticRow(cosmeticRowId);
	if (!row) return false;
	if (row.image) rmSync(join(CUSTOM_DIR, row.image), { force: true });
	// keep unlock rows — the item could be recreated; they're inert while no
	// catalog entry exists (market and loadout only render catalog items)
	invalidateCustomCache();
	return true;
}

/** Stored artwork: the DB blob (durable across container rebuilds), falling
 * back to the legacy file on disk for rows created before the blob column. */
export function customImageData(rowid: number): { data: Buffer; legacyFile?: never } | { file: string; data?: never } | null {
	const blob = getCustomCosmeticPng(rowid);
	if (blob) return { data: blob };
	const r = getCustomCosmeticRows().find((x) => x.id === rowid);
	if (!r?.image) return null;
	const p = join(CUSTOM_DIR, r.image);
	return p.startsWith(CUSTOM_DIR) ? { file: p } : null;
}

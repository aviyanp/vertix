import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { GenData } from "core/src/types.ts";
import { getCustomMapRows, insertCustomMap } from "./db.ts";

export const defaultGenData: GenData[] = [];

const dir = join(import.meta.dirname, "./maps");
const files = (await readdir(dir))
	.filter((f) => f.endsWith(".png"))
	.toSorted((a, b) => parseInt(a, 10) - parseInt(b, 10));

for (const file of files) {
	const { data, info } = await sharp(join(dir, file))
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	defaultGenData.push({
		width: info.width,
		height: info.height,
		data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
	});
}

// custom maps made in the admin panel persist as SQLite blobs — a container
// rebuild re-clones the repo (losing uncommitted maps/*.png) but keeps the DB.
// Runs after initDb (index.ts calls it right after).
export async function loadCustomMaps(): Promise<void> {
	for (const row of getCustomMapRows()) {
		if (row.map_index !== defaultGenData.length) continue; // pool grew/changed — skip stale
		const { data, info } = await sharp(row.png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
		defaultGenData.push({
			width: info.width,
			height: info.height,
			data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
		});
	}
}

/**
 * Map maker: decodes a PNG into GenData and appends it to the live map pool,
 * persisting the PNG blob keyed on its index so the pool order is identical
 * on restart.
 */
export async function addMapBuffer(png: Buffer): Promise<{ mapIndex: number; width: number; height: number }> {
	const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const index = defaultGenData.length;
	defaultGenData.push({
		width: info.width,
		height: info.height,
		data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
	});
	insertCustomMap(index, png);
	return { mapIndex: index, width: info.width, height: info.height };
}

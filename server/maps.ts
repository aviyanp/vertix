import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { GenData } from "core/src/types.ts";

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

/**
 * Map maker: decodes a PNG into GenData and appends it to the live map pool.
 * If `saveName` is set, also writes <saveName>.png into maps/ so the map
 * survives restarts; the name must resolve to a new file inside maps/.
 */
export async function addMapBuffer(png: Buffer, saveName?: string): Promise<{ mapIndex: number; width: number; height: number }> {
	const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const index = defaultGenData.length;
	defaultGenData.push({
		width: info.width,
		height: info.height,
		data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
	});
	if (saveName !== undefined) {
		const { writeFile } = await import("node:fs/promises");
		const target = join(dir, `${saveName}.png`);
		if (!target.startsWith(dir + "/") || saveName.includes("/") || saveName.includes("\\") || saveName.startsWith(".")) {
			defaultGenData.pop();
			throw new Error("Invalid map name");
		}
		await writeFile(target, png);
	}
	return { mapIndex: index, width: info.width, height: info.height };
}

// Map parsing logic - converts pixel colors to tiles

import { Tile } from "./Tile.ts";
import { MAP_CONFIG, MAP_COLORS } from "../config/gameConfig.ts";
import type { MapGenData, GameModeConfig, Team } from "../types/index.ts";

/**
 * Utility to get random integer in range
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Parse RGB pixel data to identify tile type
 */
function parsePixelColor(
	r: number,
	g: number,
	b: number
): "wall" | "floor" | "special" | "hardpoint" {
	// Black pixels (0,0,0) = Walls
	if (r === MAP_COLORS.WALL.r && g === MAP_COLORS.WALL.g && b === MAP_COLORS.WALL.b) {
		return "wall";
	}
	// Green pixels (0,255,0) = Special floor tiles
	if (
		r === MAP_COLORS.SPECIAL_FLOOR.r &&
		g === MAP_COLORS.SPECIAL_FLOOR.g &&
		b === MAP_COLORS.SPECIAL_FLOOR.b
	) {
		return "special";
	}
	// Yellow pixels (255,255,0) = Hardpoint/Zone areas
	if (
		r === MAP_COLORS.HARDPOINT.r &&
		g === MAP_COLORS.HARDPOINT.g &&
		b === MAP_COLORS.HARDPOINT.b
	) {
		return "hardpoint";
	}
	// Everything else is regular floor
	return "floor";
}

/**
 * MapParser - Converts PNG map data to game tiles
 * Based on setupMap in app.js (lines 2254-2456)
 */
export class MapParser {
	private tileScale: number;

	constructor(tileScale: number = MAP_CONFIG.TILE_SCALE) {
		this.tileScale = tileScale;
	}

	/**
	 * Parse map generation data and create tiles
	 */
	public parse(
		genData: MapGenData,
		gameMode: GameModeConfig
	): {
		tiles: Tile[];
		width: number;
		height: number;
		tilePerCol: number;
	} {
		const tiles: Tile[] = [];
		const offsetX = -(this.tileScale * 2);
		const offsetY = -(this.tileScale * 2);
		let tileIndex = 0;
		const height = genData.height;

		// Get pixel data array
		const pixelData = Array.isArray(genData.data)
			? genData.data
			: (genData.data as { data: number[] }).data;

		// Process each pixel
		for (let col = 0; col < genData.width; col++) {
			for (let row = 0; row < genData.height; row++) {
				// Calculate pixel position in data array
				const pixelIndex = (genData.width * row + col) * 4;
				let r: number, g: number, b: number;

				// Handle different data formats
				if (Array.isArray(pixelData[0])) {
					// Format: [[r, g, b], [r, g, b], ...]
					const idx = genData.width * row + col;
					const pixel = (pixelData as number[][])[idx];
					r = pixel[0];
					g = pixel[1];
					b = pixel[2];
				} else {
					// Format: [r, g, b, a, r, g, b, a, ...]
					r = (pixelData as number[])[pixelIndex];
					g = (pixelData as number[])[pixelIndex + 1];
					b = (pixelData as number[])[pixelIndex + 2];
				}

				// Create tile
				const tile = new Tile(
					tileIndex,
					this.tileScale,
					offsetX + this.tileScale * col,
					offsetY + this.tileScale * row
				);

				// Force first tile (0,0) to be a wall
				if (col === 0 && row === 0) {
					r = 0;
					g = 0;
					b = 0;
				}

				const tileType = parsePixelColor(r, g, b);

				if (tileType === "wall") {
					this.processWallTile(tile, tiles, tileIndex, height, genData, col, row);
				} else {
					this.processFloorTile(tile, tiles, tileIndex, height, tileType, gameMode, genData, col);
				}

				tiles.push(tile);
				tileIndex++;
			}
		}

		// Post-process tiles
		this.postProcessTiles(tiles, height, gameMode);

		return {
			tiles,
			width: (genData.width - 4) * this.tileScale,
			height: (genData.height - 4) * this.tileScale,
			tilePerCol: height,
		};
	}

	/**
	 * Process a wall tile and update neighbor relationships
	 */
	private processWallTile(
		tile: Tile,
		tiles: Tile[],
		tileIndex: number,
		height: number,
		genData: MapGenData,
		col: number,
		row: number
	): void {
		tile.setAsWall();

		// Check left neighbor
		const leftNeighbor = tiles[tileIndex - height];
		if (leftNeighbor) {
			tile.setLeftNeighbor(leftNeighbor);
		}

		// Reset sprite index for top-left neighbor
		const topLeftNeighbor = tiles[tileIndex - height - 1];
		if (topLeftNeighbor?.wall) {
			topLeftNeighbor.spriteIndex = 0;
			tile.topLeft = 1;
			topLeftNeighbor.bottomRight = 1;
		}

		// Check bottom-left neighbor
		const bottomLeftNeighbor = tiles[tileIndex - height + 1];
		if (bottomLeftNeighbor) {
			bottomLeftNeighbor.topRight = 1;
			if (bottomLeftNeighbor.wall) {
				tile.bottomLeft = 1;
			}
		}

		// Check top neighbor
		const topNeighbor = tiles[tileIndex - 1];
		if (topNeighbor) {
			tile.setTopNeighbor(topNeighbor);
		}

		// Check if edge tile
		if (
			col <= 0 ||
			row <= 0 ||
			col >= genData.width - 1 ||
			row >= genData.height - 1
		) {
			tile.setAsEdgeTile();
		}

		// Random sprite variation
		if (tile.spriteIndex === 0 && randomInt(0, 2) === 0) {
			tile.spriteIndex = randomInt(1, 2);
		}
	}

	/**
	 * Process a floor tile
	 */
	private processFloorTile(
		tile: Tile,
		tiles: Tile[],
		tileIndex: number,
		height: number,
		tileType: "floor" | "special" | "hardpoint",
		gameMode: GameModeConfig,
		genData: MapGenData,
		col: number
	): void {
		// Random floor sprite variation
		if (randomInt(0, 10) <= 0) {
			tile.spriteIndex = 1;
		}

		// Check wall neighbors
		const leftNeighbor = tiles[tileIndex - height];
		if (leftNeighbor?.wall) {
			tile.left = 1;
			tile.neighbours += 1;
		}

		const topNeighbor = tiles[tileIndex - 1];
		if (topNeighbor?.wall) {
			tile.top = 1;
			tile.neighbours += 1;
		}

		const topLeftNeighbor = tiles[tileIndex - height - 1];
		if (topLeftNeighbor?.wall) {
			tile.topLeft = 1;
		}

		// Handle special tile types
		if (tileType === "special") {
			tile.spriteIndex = 2;
		} else if (tileType === "hardpoint") {
			if (gameMode.name === "Hardpoint" || gameMode.name === "Zone War") {
				tile.hardPoint = true;
				if (gameMode.name === "Zone War") {
					// Assign team based on position (left = red, right = blue)
					tile.objTeam = col < genData.width / 2 ? "red" : "blue";
				}
			} else {
				tile.spriteIndex = 1;
			}
		}
	}

	/**
	 * Post-process tiles after initial parsing
	 */
	private postProcessTiles(
		tiles: Tile[],
		height: number,
		gameMode: GameModeConfig
	): void {
		for (const tile of tiles) {
			// Finalize edge tiles
			tile.finalizeEdgeTile();
		}
	}

	/**
	 * Get all tiles that can have flags placed on them
	 */
	public getFlagPositions(
		tiles: Tile[],
		height: number,
		gameMode: GameModeConfig
	): Array<{ x: number; y: number; team: Team | "e" }> {
		const positions: Array<{ x: number; y: number; team: Team | "e" }> = [];

		if (gameMode.name !== "Hardpoint" && gameMode.name !== "Zone War") {
			return positions;
		}

		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];
			if (!tile.wall && tile.hardPoint) {
				// Check different flag positions around the hardpoint
				const checkPositions = [
					{ offsetX: 40, offsetY: 40, neighbors: [i - height, i - 1] },
					{
						offsetX: this.tileScale - 70,
						offsetY: 40,
						neighbors: [i + height, i - 1],
					},
					{
						offsetX: this.tileScale - 70,
						offsetY: this.tileScale - 70,
						neighbors: [i + height, i + 1],
					},
					{
						offsetX: 40,
						offsetY: this.tileScale - 70,
						neighbors: [i - height, i + 1],
					},
				];

				for (const pos of checkPositions) {
					const neighbor1 = tiles[pos.neighbors[0]];
					const neighbor2 = tiles[pos.neighbors[1]];

					if (
						this.canPlaceFlag(neighbor1, true) &&
						this.canPlaceFlag(neighbor2, false)
					) {
						positions.push({
							x: tile.x + pos.offsetX,
							y: tile.y + pos.offsetY,
							team: tile.objTeam,
						});
					}
				}
			}
		}

		return positions;
	}

	/**
	 * Check if a flag can be placed on a tile
	 */
	private canPlaceFlag(tile: Tile | undefined, checkWall: boolean): boolean {
		if (!tile) return false;
		if (checkWall) {
			return !tile.wall && !tile.hardPoint;
		}
		return !tile.hardPoint;
	}

	/**
	 * Get tile scale
	 */
	public getTileScale(): number {
		return this.tileScale;
	}

	/**
	 * Set tile scale
	 */
	public setTileScale(scale: number): void {
		this.tileScale = scale;
	}
}

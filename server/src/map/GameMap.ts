// GameMap - Map management and collision grid

import { Tile } from "./Tile.ts";
import { MapParser } from "./MapParser.ts";
import { MAP_CONFIG } from "../config/gameConfig.ts";
import type {
	MapData,
	MapGenData,
	GameModeConfig,
	ClutterObject,
	PickupObject,
	FlagObject,
	Team,
} from "../types/index.ts";

/**
 * Utility to get random integer in range
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * GameMap - Manages the game map, tiles, and collision detection
 */
export class GameMap {
	private tiles: Tile[];
	private width: number;
	private height: number;
	private tileScale: number;
	private tilePerCol: number;
	private parser: MapParser;
	private clutter: ClutterObject[];
	private pickups: PickupObject[];
	private flags: FlagObject[];
	private gameMode: GameModeConfig | null;
	private scoreToWin: number;
	private genData: MapGenData | null;

	constructor(tileScale: number = MAP_CONFIG.TILE_SCALE) {
		this.tiles = [];
		this.width = 0;
		this.height = 0;
		this.tileScale = tileScale;
		this.tilePerCol = 0;
		this.parser = new MapParser(tileScale);
		this.clutter = [];
		this.pickups = [];
		this.flags = [];
		this.gameMode = null;
		this.scoreToWin = 0;
		this.genData = null;
	}

	/**
	 * Load and parse a map from generation data
	 */
	public loadMap(genData: MapGenData, gameMode: GameModeConfig): void {
		this.genData = genData;
		this.gameMode = gameMode;
		this.scoreToWin = gameMode.score;

		const result = this.parser.parse(genData, gameMode);
		this.tiles = result.tiles;
		this.width = result.width;
		this.height = result.height;
		this.tilePerCol = result.tilePerCol;

		// Generate flags for hardpoint/zone war modes
		if (gameMode.name === "Hardpoint" || gameMode.name === "Zone War") {
			this.generateFlags();
		}
	}

	/**
	 * Generate flags for hardpoint/zone war game modes
	 */
	private generateFlags(): void {
		if (!this.gameMode) return;

		this.flags = [];
		const positions = this.parser.getFlagPositions(
			this.tiles,
			this.tilePerCol,
			this.gameMode
		);

		for (const pos of positions) {
			this.flags.push({
				type: "flag",
				team: pos.team,
				x: pos.x,
				y: pos.y,
				w: 70,
				h: 152,
				ai: randomInt(0, 2),
				ac: 0,
			});
		}
	}

	/**
	 * Add clutter objects to the map
	 */
	public addClutter(clutter: ClutterObject[]): void {
		this.clutter = clutter;
	}

	/**
	 * Add pickup objects to the map
	 */
	public addPickups(pickups: PickupObject[]): void {
		this.pickups = pickups;
	}

	/**
	 * Get all tiles
	 */
	public getTiles(): Tile[] {
		return this.tiles;
	}

	/**
	 * Get a tile at a specific index
	 */
	public getTileAt(index: number): Tile | undefined {
		return this.tiles[index];
	}

	/**
	 * Get a tile at specific coordinates
	 */
	public getTileAtPosition(x: number, y: number): Tile | undefined {
		for (const tile of this.tiles) {
			if (tile.containsPoint(x, y)) {
				return tile;
			}
		}
		return undefined;
	}

	/**
	 * Get all wall tiles with collision
	 */
	public getWallTiles(): Tile[] {
		return this.tiles.filter((tile) => tile.wall && tile.hasCollision);
	}

	/**
	 * Get all hardpoint tiles
	 */
	public getHardpointTiles(): Tile[] {
		return this.tiles.filter((tile) => tile.hardPoint);
	}

	/**
	 * Get hardpoint tiles for a specific team
	 */
	public getTeamHardpointTiles(team: Team): Tile[] {
		return this.tiles.filter(
			(tile) => tile.hardPoint && tile.objTeam === team
		);
	}

	/**
	 * Get all clutter objects
	 */
	public getClutter(): ClutterObject[] {
		return this.clutter;
	}

	/**
	 * Get active clutter objects
	 */
	public getActiveClutter(): ClutterObject[] {
		return this.clutter.filter((obj) => obj.active);
	}

	/**
	 * Get all pickup objects
	 */
	public getPickups(): PickupObject[] {
		return this.pickups;
	}

	/**
	 * Get active pickup objects
	 */
	public getActivePickups(): PickupObject[] {
		return this.pickups.filter((obj) => obj.active);
	}

	/**
	 * Get all flags
	 */
	public getFlags(): FlagObject[] {
		return this.flags;
	}

	/**
	 * Get map width
	 */
	public getWidth(): number {
		return this.width;
	}

	/**
	 * Get map height
	 */
	public getHeight(): number {
		return this.height;
	}

	/**
	 * Get tile scale
	 */
	public getTileScale(): number {
		return this.tileScale;
	}

	/**
	 * Get tiles per column
	 */
	public getTilePerCol(): number {
		return this.tilePerCol;
	}

	/**
	 * Get game mode
	 */
	public getGameMode(): GameModeConfig | null {
		return this.gameMode;
	}

	/**
	 * Get score to win
	 */
	public getScoreToWin(): number {
		return this.scoreToWin;
	}

	/**
	 * Find a random spawn position that is not inside a wall
	 */
	public getRandomSpawnPosition(): { x: number; y: number } {
		const floorTiles = this.tiles.filter(
			(tile) => !tile.wall && !tile.hardPoint
		);

		if (floorTiles.length === 0) {
			return { x: 0, y: 0 };
		}

		const tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
		return {
			x: tile.x + this.tileScale / 2,
			y: tile.y + this.tileScale / 2,
		};
	}

	/**
	 * Find a spawn position for a specific team
	 */
	public getTeamSpawnPosition(team: Team): { x: number; y: number } {
		// For zone war, spawn on team's side
		if (this.gameMode?.name === "Zone War") {
			const teamTiles = this.getTeamHardpointTiles(team);
			if (teamTiles.length > 0) {
				const tile = teamTiles[Math.floor(Math.random() * teamTiles.length)];
				return {
					x: tile.x + this.tileScale / 2,
					y: tile.y + this.tileScale / 2,
				};
			}
		}

		// For other modes, spawn on appropriate side of map
		const floorTiles = this.tiles.filter((tile) => !tile.wall);
		const sideTiles = floorTiles.filter((tile) => {
			const midX = this.width / 2;
			return team === "red" ? tile.x < midX : tile.x >= midX;
		});

		if (sideTiles.length > 0) {
			const tile = sideTiles[Math.floor(Math.random() * sideTiles.length)];
			return {
				x: tile.x + this.tileScale / 2,
				y: tile.y + this.tileScale / 2,
			};
		}

		return this.getRandomSpawnPosition();
	}

	/**
	 * Check if a position is inside any hardpoint zone
	 */
	public isInHardpoint(x: number, y: number): boolean {
		for (const tile of this.tiles) {
			if (tile.hardPoint && tile.containsPoint(x, y)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check which team's zone a position is in
	 */
	public getZoneTeam(x: number, y: number): Team | null {
		for (const tile of this.tiles) {
			if (tile.hardPoint && tile.containsPoint(x, y)) {
				return tile.objTeam === "e" ? null : tile.objTeam;
			}
		}
		return null;
	}

	/**
	 * Serialize map data for network transmission
	 */
	public toJSON(): MapData {
		return {
			width: this.width,
			height: this.height,
			tiles: this.tiles.map((tile) => tile.toJSON()),
			tilePerCol: this.tilePerCol,
			scoreToWin: this.scoreToWin,
			gameMode: this.gameMode!,
			clutter: this.clutter,
			pickups: this.pickups,
			genData: this.genData!,
		};
	}

	/**
	 * Get minimal map data for client setup
	 */
	public getClientMapData(): {
		gameMode: GameModeConfig;
		clutter: ClutterObject[];
		genData: MapGenData;
		pickups: PickupObject[];
	} {
		return {
			gameMode: this.gameMode!,
			clutter: this.clutter,
			genData: this.genData!,
			pickups: this.pickups,
		};
	}
}

// Tile class for map representation

import type { Tile as TileInterface, Team } from "../types/index.ts";

/**
 * Represents a single tile in the game map
 */
export class Tile implements TileInterface {
	public index: number;
	public scale: number;
	public x: number;
	public y: number;
	public wall: boolean;
	public spriteIndex: number;
	public left: number;
	public right: number;
	public top: number;
	public bottom: number;
	public topLeft: number;
	public topRight: number;
	public bottomLeft: number;
	public bottomRight: number;
	public neighbours: number;
	public hasCollision: boolean;
	public hardPoint: boolean;
	public objTeam: Team | "e";
	public edgeTile: boolean;

	constructor(index: number, scale: number, x: number, y: number) {
		this.index = index;
		this.scale = scale;
		this.x = x;
		this.y = y;
		this.wall = false;
		this.spriteIndex = 0;
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
		this.topLeft = 0;
		this.topRight = 0;
		this.bottomLeft = 0;
		this.bottomRight = 0;
		this.neighbours = 0;
		this.hasCollision = false;
		this.hardPoint = false;
		this.objTeam = "e";
		this.edgeTile = false;
	}

	/**
	 * Set this tile as a wall with collision
	 */
	public setAsWall(): void {
		this.wall = true;
		this.hasCollision = true;
	}

	/**
	 * Set this tile as a hardpoint zone
	 */
	public setAsHardpoint(team: Team | "e" = "e"): void {
		this.hardPoint = true;
		this.objTeam = team;
	}

	/**
	 * Update left neighbor relationship
	 */
	public setLeftNeighbor(neighbor: Tile): void {
		if (neighbor.wall) {
			this.left = 1;
			this.neighbours += 1;
		}
		neighbor.right = 1;
		neighbor.neighbours += 1;
	}

	/**
	 * Update top neighbor relationship
	 */
	public setTopNeighbor(neighbor: Tile): void {
		if (neighbor.wall) {
			this.top = 1;
			this.neighbours += 1;
		}
		neighbor.bottom = 1;
		neighbor.neighbours += 1;
	}

	/**
	 * Update diagonal neighbor relationships
	 */
	public setDiagonalNeighbors(
		topLeft?: Tile,
		topRight?: Tile,
		bottomLeft?: Tile,
		bottomRight?: Tile
	): void {
		if (topLeft?.wall) {
			this.topLeft = 1;
			topLeft.bottomRight = 1;
		}
		if (topRight) {
			topRight.topRight = 1;
			if (topRight.wall) {
				this.bottomLeft = 1;
			}
		}
	}

	/**
	 * Mark this tile as an edge tile (border of map)
	 */
	public setAsEdgeTile(): void {
		this.left = 1;
		this.right = 1;
		this.top = 1;
		this.bottom = 1;
		this.neighbours = 4;
		this.edgeTile = true;
	}

	/**
	 * Finalize edge tile (remove collision for edge tiles)
	 */
	public finalizeEdgeTile(): void {
		if (this.edgeTile) {
			this.hasCollision = false;
		}
	}

	/**
	 * Check if a point is inside this tile
	 */
	public containsPoint(px: number, py: number): boolean {
		return (
			px >= this.x &&
			px <= this.x + this.scale &&
			py >= this.y &&
			py <= this.y + this.scale
		);
	}

	/**
	 * Check if a rectangle overlaps with this tile
	 */
	public overlapsRect(
		rx: number,
		ry: number,
		rwidth: number,
		rheight: number
	): boolean {
		return (
			rx < this.x + this.scale &&
			rx + rwidth > this.x &&
			ry < this.y + this.scale &&
			ry + rheight > this.y
		);
	}

	/**
	 * Get tile bounds
	 */
	public getBounds(): {
		left: number;
		right: number;
		top: number;
		bottom: number;
	} {
		return {
			left: this.x,
			right: this.x + this.scale,
			top: this.y,
			bottom: this.y + this.scale,
		};
	}

	/**
	 * Serialize tile for network transmission
	 */
	public toJSON(): TileInterface {
		return {
			index: this.index,
			scale: this.scale,
			x: this.x,
			y: this.y,
			wall: this.wall,
			spriteIndex: this.spriteIndex,
			left: this.left,
			right: this.right,
			top: this.top,
			bottom: this.bottom,
			topLeft: this.topLeft,
			topRight: this.topRight,
			bottomLeft: this.bottomLeft,
			bottomRight: this.bottomRight,
			neighbours: this.neighbours,
			hasCollision: this.hasCollision,
			hardPoint: this.hardPoint,
			objTeam: this.objTeam,
			edgeTile: this.edgeTile,
		};
	}
}

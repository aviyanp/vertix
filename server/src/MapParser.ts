import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Tile {
  index: number;
  scale: number;
  x: number;
  y: number;
  wall: boolean;
  hasCollision: boolean;
  hardPoint: boolean;
  edgeTile: boolean;
}

export class GameMap {
  public tiles: Tile[] = [];
  public width: number = 0;
  public height: number = 0;
  public tileScale: number = 80;
  public tilePerCol: number = 0;
  private imageData: Buffer | null = null;
  private imageWidth: number = 0;
  private imageHeight: number = 0;

  constructor(tileScale: number = 80) {
    this.tileScale = tileScale;
  }

  async loadMap(mapPath: string): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      const fullPath = path.join(__dirname, '../../', mapPath);

      fs.createReadStream(fullPath)
        .pipe(new PNG())
        .on('parsed', function(this: PNG) {
          self.imageData = this.data;
          self.imageWidth = this.width;
          self.imageHeight = this.height;
          self.processMap();
          resolve();
        })
        .on('error', reject);
    });
  }

  private processMap(): void {
    const mapTileScale = this.tileScale;
    const startX = -(mapTileScale * 2);
    const startY = -(mapTileScale * 2);

    this.tilePerCol = this.imageHeight;
    this.width = (this.imageWidth - 4) * mapTileScale;
    this.height = (this.imageHeight - 4) * mapTileScale;

    let tileIndex = 0;

    for (let x = 0; x < this.imageWidth; x++) {
      for (let y = 0; y < this.imageHeight; y++) {
        const pixelIndex = (this.imageWidth * y + x) << 2;
        const r = this.imageData![pixelIndex];
        const g = this.imageData![pixelIndex + 1];
        const b = this.imageData![pixelIndex + 2];

        const tile: Tile = {
          index: tileIndex,
          scale: mapTileScale,
          x: startX + mapTileScale * x,
          y: startY + mapTileScale * y,
          wall: false,
          hasCollision: false,
          hardPoint: false,
          edgeTile: false
        };

        if (r === 0 && g === 0 && b === 0) {
          tile.wall = true;
          tile.hasCollision = true;

          if (x <= 0 || y <= 0 || x >= this.imageWidth - 1 || y >= this.imageHeight - 1) {
            tile.edgeTile = true;
          }
        } else if (r === 255 && g === 255 && b === 0) {
          tile.hardPoint = true;
        }

        if (tile.edgeTile) {
          tile.hasCollision = false;
        }

        this.tiles.push(tile);
        tileIndex++;
      }
    }
  }

  isWall(x: number, y: number): Tile | null {
    for (const tile of this.tiles) {
      if (tile.wall && tile.hasCollision) {
        if (
          x >= tile.x &&
          x <= tile.x + tile.scale &&
          y >= tile.y &&
          y <= tile.y + tile.scale
        ) {
          return tile;
        }
      }
    }
    return null;
  }

  getTileAt(x: number, y: number): Tile | null {
    for (const tile of this.tiles) {
      if (
        x >= tile.x &&
        x <= tile.x + tile.scale &&
        y >= tile.y &&
        y <= tile.y + tile.scale
      ) {
        return tile;
      }
    }
    return null;
  }

  getCollidingTiles(x: number, y: number, width: number, height: number): Tile[] {
    const collidingTiles: Tile[] = [];

    for (const tile of this.tiles) {
      if (tile.wall && tile.hasCollision) {
        if (
          x + width / 2 >= tile.x &&
          x - width / 2 <= tile.x + tile.scale &&
          y >= tile.y &&
          y <= tile.y + tile.scale
        ) {
          collidingTiles.push(tile);
        }
      }
    }

    return collidingTiles;
  }
}

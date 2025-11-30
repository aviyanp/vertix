import { GameMap } from './MapParser.js';

export interface Entity {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  width: number;
  height: number;
  speed: number;
  jumpY: number;
  jumpDelta: number;
  jumpStrength: number;
  gravityStrength: number;
  dead: boolean;
  nameYOffset?: number;
}

export class Physics {
  static readonly FRICTION = 0.85;
  static readonly ACCELERATION = 0.5;

  static applyWallCollision(entity: Entity, gameMap: GameMap): void {
    if (entity.dead) {
      return;
    }

    entity.nameYOffset = 0;

    for (const tile of gameMap.tiles) {
      if (tile.wall && tile.hasCollision) {
        if (
          entity.x + entity.width / 2 >= tile.x &&
          entity.x - entity.width / 2 <= tile.x + tile.scale &&
          entity.y >= tile.y &&
          entity.y <= tile.y + tile.scale
        ) {
          if (entity.oldX <= tile.x) {
            entity.x = tile.x - entity.width / 2 - 2;
          } else if (entity.oldX - entity.width / 2 >= tile.x + tile.scale) {
            entity.x = tile.x + tile.scale + entity.width / 2 + 2;
          }

          if (entity.oldY <= tile.y) {
            entity.y = tile.y - 2;
          } else if (entity.oldY >= tile.y + tile.scale) {
            entity.y = tile.y + tile.scale + 2;
          }
        }

        if (
          !tile.hardPoint &&
          entity.x > tile.x &&
          entity.x < tile.x + tile.scale &&
          entity.y - entity.jumpY - entity.height * 0.85 > tile.y - tile.scale / 2 &&
          entity.y - entity.jumpY - entity.height * 0.85 <= tile.y
        ) {
          entity.nameYOffset = Math.round(
            entity.y - entity.jumpY - entity.height * 0.85 - (tile.y - tile.scale / 2)
          );
        }
      }
    }
  }

  static applyMovement(
    entity: Entity,
    horizontalInput: number,
    verticalInput: number,
    delta: number
  ): void {
    if (entity.dead) {
      return;
    }

    entity.oldX = entity.x;
    entity.oldY = entity.y;

    const magnitude = Math.sqrt(
      horizontalInput * horizontalInput + verticalInput * verticalInput
    );

    let normalizedX = horizontalInput;
    let normalizedY = verticalInput;

    if (magnitude !== 0) {
      normalizedX /= magnitude;
      normalizedY /= magnitude;
    }

    entity.x += normalizedX * entity.speed * delta;
    entity.y += normalizedY * entity.speed * delta;

    entity.x = Math.round(entity.x);
    entity.y = Math.round(entity.y);
  }

  static applyGravity(entity: Entity, delta: number): void {
    if (entity.jumpY !== 0) {
      entity.jumpDelta -= entity.gravityStrength * delta;
      entity.jumpY += entity.jumpDelta * delta;

      if (entity.jumpY <= 0) {
        entity.jumpY = 0;
        entity.jumpDelta = 0;
      }

      entity.jumpY = Math.round(entity.jumpY);
    }
  }

  static applyJump(entity: Entity): boolean {
    if (entity.jumpY <= 0 && !entity.dead) {
      entity.jumpDelta = entity.jumpStrength;
      entity.jumpY = entity.jumpDelta;
      return true;
    }
    return false;
  }

  static isPointInRect(
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    return (
      pointX >= rectX &&
      pointX <= rectX + rectWidth &&
      pointY >= rectY &&
      pointY <= rectY + rectHeight
    );
  }

  static areRectsColliding(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    );
  }

  static getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static lineIntersectsRect(
    lineX1: number,
    lineY1: number,
    lineX2: number,
    lineY2: number,
    rectX: number,
    rectY: number,
    rectW: number,
    rectH: number
  ): boolean {
    const left = this.lineIntersectsLine(
      lineX1, lineY1, lineX2, lineY2,
      rectX, rectY, rectX, rectY + rectH
    );
    const right = this.lineIntersectsLine(
      lineX1, lineY1, lineX2, lineY2,
      rectX + rectW, rectY, rectX + rectW, rectY + rectH
    );
    const top = this.lineIntersectsLine(
      lineX1, lineY1, lineX2, lineY2,
      rectX, rectY, rectX + rectW, rectY
    );
    const bottom = this.lineIntersectsLine(
      lineX1, lineY1, lineX2, lineY2,
      rectX, rectY + rectH, rectX + rectW, rectY + rectH
    );

    return left || right || top || bottom ||
      (this.isPointInRect(lineX1, lineY1, rectX, rectY, rectW, rectH) &&
       this.isPointInRect(lineX2, lineY2, rectX, rectY, rectW, rectH));
  }

  private static lineIntersectsLine(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): boolean {
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denom === 0) {
      return false;
    }

    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
  }
}

import { Player } from './Player.js';
import { GameMap } from './MapParser.js';
import { Physics } from './Physics.js';
import { getWeaponStats } from './WeaponConfig.js';
import type { WeaponStats } from './WeaponConfig.js';

export class Projectile {
  public id: string;
  public x: number;
  public y: number;
  public startX: number;
  public startY: number;
  public velocityX: number;
  public velocityY: number;
  public direction: number;
  public speed: number;
  public ownerId: string;
  public ownerTeam: string;
  public active: boolean;
  public damage: number;
  public pierceCount: number;
  public hitPlayers: Set<string>;
  public startTime: number;
  public maxLifeTime: number;
  public explodeOnDeath: boolean;
  public width: number;
  public height: number;
  public yOffset: number;

  private static nextId = 0;

  constructor(
    x: number,
    y: number,
    direction: number,
    weaponStats: WeaponStats,
    ownerId: string,
    ownerTeam: string,
    yOffset: number = 0
  ) {
    this.id = `proj_${Projectile.nextId++}`;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.direction = direction;
    this.speed = weaponStats.bulletSpeed;
    this.velocityX = Math.cos(direction) * this.speed;
    this.velocityY = Math.sin(direction) * this.speed;
    this.ownerId = ownerId;
    this.ownerTeam = ownerTeam;
    this.active = true;
    this.damage = weaponStats.damage;
    this.pierceCount = weaponStats.pierceCount;
    this.hitPlayers = new Set<string>();
    this.startTime = Date.now();
    this.maxLifeTime = 5000;
    this.explodeOnDeath = weaponStats.explodeOnDeath;
    this.width = 10;
    this.height = 10;
    this.yOffset = yOffset;
  }

  update(delta: number, gameMap: GameMap, players: Player[]): void {
    if (!this.active) {
      return;
    }

    if (Date.now() - this.startTime > this.maxLifeTime) {
      this.active = false;
      return;
    }

    const moveDistance = this.speed * delta;
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;

    const endX = this.x + this.velocityX * delta * 2;
    const endY = this.y + this.velocityY * delta * 2;

    for (const tile of gameMap.tiles) {
      if (tile.wall && tile.hasCollision) {
        if (Physics.lineIntersectsRect(
          this.x, this.y, endX, endY,
          tile.x, tile.y, tile.scale, tile.scale
        )) {
          this.active = false;
          return;
        }
      }
    }

    for (const player of players) {
      if (
        player.id === this.ownerId ||
        player.team === this.ownerTeam ||
        player.isDead ||
        this.hitPlayers.has(player.id) ||
        player.spawnProtection > 0
      ) {
        continue;
      }

      const playerLeft = player.x - player.width / 2;
      const playerTop = player.y - player.height - player.jumpY;
      const playerWidth = player.width;
      const playerHeight = player.height;

      if (Physics.lineIntersectsRect(
        this.x, this.y, endX, endY,
        playerLeft, playerTop, playerWidth, playerHeight
      )) {
        this.hitPlayers.add(player.id);

        if (this.pierceCount <= 1) {
          this.active = false;
        }

        return;
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      x: Math.round(this.x),
      y: Math.round(this.y),
      startX: Math.round(this.startX),
      startY: Math.round(this.startY),
      direction: this.direction,
      active: this.active,
      ownerId: this.ownerId
    };
  }
}

export class CombatSystem {
  private projectiles: Projectile[] = [];

  createProjectile(
    player: Player,
    weaponKey: string,
    targetAngle: number,
    gameMap: GameMap
  ): Projectile[] {
    const weaponStats = getWeaponStats(weaponKey);
    if (!weaponStats) {
      return [];
    }

    const currentTime = Date.now();
    if (!player.canFire(currentTime, weaponStats.fireRate)) {
      return [];
    }

    const createdProjectiles: Projectile[] = [];
    const spawnOffsetDistance = 40;
    const baseX = player.x + Math.cos(targetAngle) * spawnOffsetDistance;
    const baseY = player.y + Math.sin(targetAngle) * spawnOffsetDistance;

    for (const spreadAngle of weaponStats.spread) {
      const finalAngle = targetAngle + spreadAngle;
      const projectile = new Projectile(
        baseX,
        baseY,
        finalAngle,
        weaponStats,
        player.id,
        player.team,
        player.jumpY
      );

      this.projectiles.push(projectile);
      createdProjectiles.push(projectile);
    }

    return createdProjectiles;
  }

  update(delta: number, gameMap: GameMap, players: Player[]): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      projectile.update(delta, gameMap, players);

      if (!projectile.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (const playerId of projectile.hitPlayers) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          const killed = player.takeDamage(projectile.damage, projectile.ownerId);

          if (killed) {
            const attacker = players.find(p => p.id === projectile.ownerId);
            if (attacker) {
              attacker.addKill();
            }
          }
        }
      }
    }
  }

  getActiveProjectiles(): Projectile[] {
    return this.projectiles.filter(p => p.active);
  }

  clear(): void {
    this.projectiles = [];
  }
}

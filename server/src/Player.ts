import { Physics } from './Physics.js';
import { GameMap } from './MapParser.js';
import { getClassWeapons } from './WeaponConfig.js';

export interface PlayerInput {
  horizontalInput: number;
  verticalInput: number;
  jump: boolean;
  angle: number;
}

export class Player {
  public id: string;
  public x: number;
  public y: number;
  public oldX: number;
  public oldY: number;
  public angle: number;
  public health: number;
  public maxHealth: number;
  public isDead: boolean;
  public speed: number;
  public width: number;
  public height: number;
  public jumpY: number;
  public jumpDelta: number;
  public jumpStrength: number;
  public gravityStrength: number;
  public jumpCountdown: number;
  public nameYOffset: number;
  public dead: boolean;

  public kills: number;
  public deaths: number;
  public score: number;

  public activeWeaponIndex: number;
  public weapons: string[];
  public classIndex: number;
  public team: string;
  public name: string;

  public spawnProtection: number;
  public lastFireTime: number;

  constructor(
    id: string,
    name: string,
    x: number = 0,
    y: number = 0,
    classIndex: number = 0,
    team: string = 'blue'
  ) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.angle = 0;

    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.isDead = false;
    this.dead = false;

    this.speed = 0.12;
    this.width = 30;
    this.height = 60;

    this.jumpY = 0;
    this.jumpDelta = 0;
    this.jumpStrength = 2.0;
    this.gravityStrength = 0.008;
    this.jumpCountdown = 0;
    this.nameYOffset = 0;

    this.kills = 0;
    this.deaths = 0;
    this.score = 0;

    this.classIndex = classIndex;
    this.weapons = getClassWeapons(classIndex);
    this.activeWeaponIndex = 0;
    this.team = team;

    this.spawnProtection = 1500;
    this.lastFireTime = 0;
  }

  tick(input: PlayerInput, gameMap: GameMap, delta: number): void {
    if (this.isDead) {
      return;
    }

    if (this.spawnProtection > 0) {
      this.spawnProtection -= delta;
    }

    Physics.applyMovement(this, input.horizontalInput, input.verticalInput, delta);
    Physics.applyWallCollision(this, gameMap);
    Physics.applyGravity(this, delta);

    if (this.jumpCountdown > 0) {
      this.jumpCountdown -= delta;
    }

    if (input.jump && this.jumpCountdown <= 0) {
      if (Physics.applyJump(this)) {
        this.jumpCountdown = 250;
      }
    }

    this.angle = input.angle;
  }

  respawn(x: number, y: number, classIndex?: number): void {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.health = this.maxHealth;
    this.isDead = false;
    this.dead = false;
    this.jumpY = 0;
    this.jumpDelta = 0;
    this.spawnProtection = 1500;

    if (classIndex !== undefined && classIndex !== this.classIndex) {
      this.classIndex = classIndex;
      this.weapons = getClassWeapons(classIndex);
      this.activeWeaponIndex = 0;
    }
  }

  takeDamage(damage: number, attackerId: string): boolean {
    if (this.isDead || this.spawnProtection > 0) {
      return false;
    }

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.dead = true;
      this.deaths++;
      return true;
    }

    return false;
  }

  addKill(): void {
    this.kills++;
    this.score += 100;
  }

  swapWeapon(direction: number): void {
    if (this.weapons.length <= 1) {
      return;
    }

    this.activeWeaponIndex += direction;

    if (this.activeWeaponIndex >= this.weapons.length) {
      this.activeWeaponIndex = 0;
    } else if (this.activeWeaponIndex < 0) {
      this.activeWeaponIndex = this.weapons.length - 1;
    }
  }

  getCurrentWeapon(): string | null {
    if (this.activeWeaponIndex >= 0 && this.activeWeaponIndex < this.weapons.length) {
      return this.weapons[this.activeWeaponIndex];
    }
    return null;
  }

  canFire(currentTime: number, fireRate: number): boolean {
    if (this.isDead) {
      return false;
    }

    if (currentTime - this.lastFireTime >= fireRate) {
      this.lastFireTime = currentTime;
      return true;
    }

    return false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      x: Math.round(this.x),
      y: Math.round(this.y),
      angle: this.angle,
      health: this.health,
      isDead: this.isDead,
      kills: this.kills,
      deaths: this.deaths,
      score: this.score,
      activeWeaponIndex: this.activeWeaponIndex,
      team: this.team,
      jumpY: this.jumpY
    };
  }
}

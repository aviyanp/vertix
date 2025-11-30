// Player state and methods

import type {
	PlayerState,
	PlayerInput,
	WeaponInstance,
	Team,
	PlayerAccount,
} from "../types/index.ts";
import { PLAYER_CONFIG } from "../config/gameConfig.ts";
import { WeaponManager } from "../weapons/WeaponManager.ts";
import { getClassWeaponIndexes } from "../classes/CharacterClasses.ts";
import { Projectile } from "../weapons/Projectile.ts";

let nextPlayerIndex = 0;

/**
 * Player - Represents a player in the game
 */
export class Player implements PlayerState {
	public id: string;
	public index: number;
	public socketId: string;
	public name: string;
	public classIndex: number;
	public team: Team;
	public x: number;
	public y: number;
	public oldX: number;
	public oldY: number;
	public angle: number;
	public jumpY: number;
	public health: number;
	public maxHealth: number;
	public speed: number;
	public width: number;
	public height: number;
	public dead: boolean;
	public score: number;
	public kills: number;
	public deaths: number;
	public assists: number;
	public isn: number;
	public weapons: WeaponInstance[];
	public currentWeapon: number;
	public nameYOffset: number;
	public onScreen: boolean;
	public loggedIn: boolean;
	public account?: PlayerAccount;
	public hatId: number;
	public shirtId: number;
	public sprayId: number;
	public lastKillTime: number;
	public killStreak: number;

	private weaponManager: WeaponManager;
	private pendingInputs: PlayerInput[];
	private lastDamagerIndex: number | null;
	private lastDamageTime: number;

	constructor(socketId: string, name: string, classIndex: number) {
		this.id = socketId;
		this.index = nextPlayerIndex++;
		this.socketId = socketId;
		this.name = name.substring(0, PLAYER_CONFIG.MAX_NAME_LENGTH);
		this.classIndex = classIndex;
		this.team = "";
		this.x = 0;
		this.y = 0;
		this.oldX = 0;
		this.oldY = 0;
		this.angle = 0;
		this.jumpY = 0;
		this.health = PLAYER_CONFIG.MAX_HEALTH;
		this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;
		this.speed = PLAYER_CONFIG.DEFAULT_SPEED;
		this.width = PLAYER_CONFIG.WIDTH;
		this.height = PLAYER_CONFIG.HEIGHT;
		this.dead = true; // Start dead, respawn to play
		this.score = 0;
		this.kills = 0;
		this.deaths = 0;
		this.assists = 0;
		this.isn = 0;
		this.currentWeapon = 0;
		this.nameYOffset = 0;
		this.onScreen = true;
		this.loggedIn = false;
		this.hatId = -1;
		this.shirtId = -1;
		this.sprayId = -1;
		this.lastKillTime = 0;
		this.killStreak = 0;

		// Initialize weapon manager
		const weaponIndexes = getClassWeaponIndexes(classIndex);
		this.weaponManager = new WeaponManager(weaponIndexes);
		this.weapons = this.weaponManager.getWeaponsJSON();

		this.pendingInputs = [];
		this.lastDamagerIndex = null;
		this.lastDamageTime = 0;
	}

	/**
	 * Spawn the player at a position
	 */
	public spawn(x: number, y: number): void {
		this.x = x;
		this.y = y;
		this.oldX = x;
		this.oldY = y;
		this.health = this.maxHealth;
		this.dead = false;
		this.jumpY = 0;
		this.killStreak = 0;
		this.weaponManager.resetWeapons();
		this.weaponManager.clearProjectiles();
		this.weapons = this.weaponManager.getWeaponsJSON();
		this.currentWeapon = 0;
		this.lastDamagerIndex = null;
	}

	/**
	 * Process movement input
	 */
	public processInput(input: PlayerInput): void {
		if (this.dead) return;
		this.pendingInputs.push(input);
	}

	/**
	 * Get pending inputs
	 */
	public getPendingInputs(): PlayerInput[] {
		return this.pendingInputs;
	}

	/**
	 * Clear pending inputs
	 */
	public clearPendingInputs(): void {
		this.pendingInputs = [];
	}

	/**
	 * Clear processed inputs up to a sequence number
	 */
	public clearProcessedInputs(upToIsn: number): void {
		this.pendingInputs = this.pendingInputs.filter(
			(input) => input.isn > upToIsn
		);
	}

	/**
	 * Update angle
	 */
	public setAngle(angle: number): void {
		this.angle = angle;

		// Update weapon facing
		const weapon = this.weaponManager.getCurrentWeapon();
		if (weapon) {
			const normalizedAngle = Math.round((angle % 360) / 90) * 90;
			weapon.front = normalizedAngle !== 180;
			this.weapons = this.weaponManager.getWeaponsJSON();
		}
	}

	/**
	 * Fire current weapon
	 */
	public fire(): Projectile[] {
		if (this.dead) return [];

		const projectiles = this.weaponManager.fire(
			this,
			this.x,
			this.y - this.height / 2 - this.jumpY,
			(this.angle * Math.PI) / 180
		);

		this.weapons = this.weaponManager.getWeaponsJSON();
		return projectiles;
	}

	/**
	 * Switch weapon
	 */
	public switchWeapon(index: number): boolean {
		const result = this.weaponManager.switchWeapon(index);
		if (result) {
			this.currentWeapon = this.weaponManager.getCurrentWeaponIndex();
			this.weapons = this.weaponManager.getWeaponsJSON();
		}
		return result;
	}

	/**
	 * Request reload
	 */
	public reload(): boolean {
		const result = this.weaponManager.reload();
		if (result) {
			this.weapons = this.weaponManager.getWeaponsJSON();
		}
		return result;
	}

	/**
	 * Update weapon states
	 */
	public updateWeapons(deltaTime: number): number[] {
		const reloadedWeapons = this.weaponManager.update(deltaTime);
		if (reloadedWeapons.length > 0) {
			this.weapons = this.weaponManager.getWeaponsJSON();
		}
		return reloadedWeapons;
	}

	/**
	 * Get weapon manager
	 */
	public getWeaponManager(): WeaponManager {
		return this.weaponManager;
	}

	/**
	 * Take damage
	 */
	public takeDamage(amount: number, dealerIndex: number | null): number {
		if (this.dead) return 0;

		const actualDamage = Math.min(this.health, amount);
		this.health -= actualDamage;

		if (dealerIndex !== null) {
			this.lastDamagerIndex = dealerIndex;
			this.lastDamageTime = Date.now();
		}

		if (this.health <= 0) {
			this.die();
		}

		return actualDamage;
	}

	/**
	 * Heal
	 */
	public heal(amount: number): number {
		if (this.dead) return 0;

		const actualHeal = Math.min(this.maxHealth - this.health, amount);
		this.health += actualHeal;
		return actualHeal;
	}

	/**
	 * Die
	 */
	public die(): void {
		this.dead = true;
		this.deaths++;
		this.killStreak = 0;
		this.weaponManager.clearProjectiles();
	}

	/**
	 * Record a kill
	 */
	public recordKill(points: number): void {
		this.kills++;
		this.score += points;

		const now = Date.now();
		if (now - this.lastKillTime < 5000) {
			this.killStreak++;
		} else {
			this.killStreak = 1;
		}
		this.lastKillTime = now;
	}

	/**
	 * Record an assist
	 */
	public recordAssist(points: number): void {
		this.assists++;
		this.score += points;
	}

	/**
	 * Get last damager index (for assists)
	 */
	public getLastDamagerIndex(): number | null {
		// Only count if damage was recent
		if (Date.now() - this.lastDamageTime > 5000) {
			return null;
		}
		return this.lastDamagerIndex;
	}

	/**
	 * Set team
	 */
	public setTeam(team: Team): void {
		this.team = team;
	}

	/**
	 * Check if player is on same team as another player
	 */
	public isSameTeam(other: Player): boolean {
		if (this.team === "" || other.team === "") return false;
		return this.team === other.team;
	}

	/**
	 * Set cosmetics
	 */
	public setCosmetics(hatId: number, shirtId: number, sprayId: number): void {
		this.hatId = hatId;
		this.shirtId = shirtId;
		this.sprayId = sprayId;
	}

	/**
	 * Update position
	 */
	public setPosition(x: number, y: number): void {
		this.oldX = this.x;
		this.oldY = this.y;
		this.x = x;
		this.y = y;
	}

	/**
	 * Jump
	 */
	public jump(): void {
		if (this.jumpY === 0) {
			this.jumpY = PLAYER_CONFIG.JUMP_VELOCITY;
		}
	}

	/**
	 * Serialize player for network transmission
	 */
	public toJSON(): PlayerState {
		return {
			id: this.id,
			index: this.index,
			socketId: this.socketId,
			name: this.name,
			classIndex: this.classIndex,
			team: this.team,
			x: this.x,
			y: this.y,
			oldX: this.oldX,
			oldY: this.oldY,
			angle: this.angle,
			jumpY: this.jumpY,
			health: this.health,
			maxHealth: this.maxHealth,
			speed: this.speed,
			width: this.width,
			height: this.height,
			dead: this.dead,
			score: this.score,
			kills: this.kills,
			deaths: this.deaths,
			assists: this.assists,
			isn: this.isn,
			weapons: this.weapons,
			currentWeapon: this.currentWeapon,
			nameYOffset: this.nameYOffset,
			onScreen: this.onScreen,
			loggedIn: this.loggedIn,
			account: this.account,
			hatId: this.hatId,
			shirtId: this.shirtId,
			sprayId: this.sprayId,
			lastKillTime: this.lastKillTime,
			killStreak: this.killStreak,
		};
	}

	/**
	 * Get minimal state for updates
	 */
	public getMinimalState(): {
		index: number;
		x: number;
		y: number;
		angle: number;
		isn: number;
		nameYOffset: number;
	} {
		return {
			index: this.index,
			x: Math.round(this.x),
			y: Math.round(this.y),
			angle: this.angle,
			isn: this.isn,
			nameYOffset: this.nameYOffset,
		};
	}

	/**
	 * Reset player index counter (for testing)
	 */
	public static resetIndexCounter(): void {
		nextPlayerIndex = 0;
	}
}

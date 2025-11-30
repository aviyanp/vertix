// Types and interfaces for Vertix.io server

// =========================================
// Core Types
// =========================================

export type Team = "red" | "blue" | "";
export type ChatType = "ALL" | "TEAM";
export type GameModeType = "TDM" | "FFA" | "Hardpoint" | "Zone War";

// =========================================
// Vector/Position
// =========================================

export interface Vector2D {
	x: number;
	y: number;
}

export interface Position extends Vector2D {
	oldX?: number;
	oldY?: number;
}

// =========================================
// Tile and Map
// =========================================

export interface Tile {
	index: number;
	scale: number;
	x: number;
	y: number;
	wall: boolean;
	spriteIndex: number;
	left: number;
	right: number;
	top: number;
	bottom: number;
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
	neighbours: number;
	hasCollision: boolean;
	hardPoint: boolean;
	objTeam: Team | "e";
	edgeTile: boolean;
}

export interface MapGenData {
	width: number;
	height: number;
	data: number[][] | { data: number[] };
}

export interface MapData {
	width: number;
	height: number;
	tiles: Tile[];
	tilePerCol: number;
	scoreToWin: number;
	gameMode: GameModeConfig;
	clutter: ClutterObject[];
	pickups: PickupObject[];
	genData: MapGenData;
}

// =========================================
// Game Mode
// =========================================

export interface GameModeConfig {
	name: GameModeType;
	teams: boolean;
	score: number;
	desc1: string;
	desc2: string;
}

// =========================================
// Weapon System
// =========================================

export interface WeaponStats {
	index: number;
	name: string;
	displayName: string;
	fireRate: number;
	damage: number;
	bulletSpeed: number;
	bulletWidth: number;
	bulletHeight: number;
	spread: number[];
	reloadSpeed: number;
	maxAmmo: number;
	pierce: number;
	bounce: boolean;
	explodeOnDeath: boolean;
	bulletsPerShot: number;
	explosionRadius: number;
	trailWidth: number;
	trailMaxLength: number;
	glowWidth: number | null;
	glowHeight: number | null;
}

export interface WeaponInstance {
	index: number;
	stats: WeaponStats;
	ammo: number;
	reloadTime: number;
	spreadIndex: number;
	front: boolean;
}

// =========================================
// Character Classes
// =========================================

export interface CharacterClass {
	classN: string;
	name?: string;
	weaponIndexes: number[];
	pWeapon: string;
	sWeapon: string;
	folderName: string;
	hasDown: boolean;
}

// =========================================
// Projectile
// =========================================

export interface ProjectileData {
	id: number;
	ownerId: number;
	x: number;
	y: number;
	startX: number;
	startY: number;
	dir: number;
	speed: number;
	width: number;
	height: number;
	damage: number;
	weaponIndex: number;
	pierce: number;
	pierceCount: number;
	bounce: boolean;
	explodeOnDeath: boolean;
	active: boolean;
	startTime: number;
	maxLifeTime: number | null;
	yOffset: number;
	jumpY: number;
	trailWidth: number;
	trailMaxLength: number;
	glowWidth: number | null;
	glowHeight: number | null;
	lastHit: string;
	serverIndex: number;
}

// =========================================
// Player
// =========================================

export interface PlayerInput {
	hdt: number; // Horizontal delta
	vdt: number; // Vertical delta
	ts: number; // Timestamp
	isn: number; // Input sequence number
	s?: number; // Jump
	delta: number;
}

export interface PlayerState {
	id: string;
	index: number;
	socketId: string;
	name: string;
	classIndex: number;
	team: Team;
	x: number;
	y: number;
	oldX: number;
	oldY: number;
	angle: number;
	jumpY: number;
	health: number;
	maxHealth: number;
	speed: number;
	width: number;
	height: number;
	dead: boolean;
	score: number;
	kills: number;
	deaths: number;
	assists: number;
	isn: number; // Input sequence number for reconciliation
	weapons: WeaponInstance[];
	currentWeapon: number;
	nameYOffset: number;
	onScreen: boolean;
	loggedIn: boolean;
	account?: PlayerAccount;
	hatId: number;
	shirtId: number;
	sprayId: number;
	lastKillTime: number;
	killStreak: number;
}

export interface PlayerAccount {
	user_name?: string;
	clan?: string;
}

// =========================================
// Game Objects
// =========================================

export interface BaseGameObject {
	type: string;
	x: number;
	y: number;
}

export interface ClutterObject extends BaseGameObject {
	type: "clutter";
	indx: number;
	w: number;
	h: number;
	hc: boolean; // Has collision
	tp: number; // Top percentage
	active: boolean;
	spriteIndex?: number;
}

export interface FlagObject extends BaseGameObject {
	type: "flag";
	team: Team | "e";
	w: number;
	h: number;
	ai: number;
	ac: number;
}

export interface PickupObject extends BaseGameObject {
	type: "pickup";
	pickupType: "health" | "loot";
	active: boolean;
	respawnTime: number;
	value: number;
}

export type GameObject = ClutterObject | FlagObject | PickupObject;

// =========================================
// Room and Game State
// =========================================

export interface GameRoomConfig {
	id: string;
	name: string;
	maxPlayers: number;
	mapName: string;
	gameMode: GameModeType;
}

export interface GameRoomState {
	id: string;
	players: Map<string, PlayerState>;
	projectiles: Map<number, ProjectileData>;
	gameObjects: GameObject[];
	map: MapData | null;
	gameMode: GameModeConfig | null;
	redScore: number;
	blueScore: number;
	gameStarted: boolean;
	gameOver: boolean;
	tickCount: number;
	startTime: number;
	nextGameTime: number;
}

// =========================================
// Leaderboard
// =========================================

export interface LeaderboardEntry {
	index: number;
	name: string;
	score: number;
	kills: number;
	deaths: number;
	team: Team;
}

// =========================================
// Chat
// =========================================

export interface ChatMessage {
	senderIndex: number;
	message: string;
	type: ChatType;
	team: Team;
	timestamp: number;
}

// =========================================
// Network Events
// =========================================

export interface MovementInput {
	hdt: number;
	vdt: number;
	ts: number;
	isn: number;
	s?: number;
}

export interface ShootInput {
	x: number;
	y: number;
	jumpY: number;
	angle: number;
	distance: number;
	time: number;
}

export interface CreateRoomInput {
	name: string;
	classIndex: number;
	hatId?: number;
	shirtId?: number;
	sprayId?: number;
}

export interface DamageEvent {
	gID: number; // Got hit ID
	dID: number | null; // Dealer ID
	amount: number;
	h: number; // New health
	bi?: number; // Bullet index
	dir?: number; // Direction
}

export interface DeathEvent {
	gID: number; // Got killed ID
	dID: number; // Dealer ID
	sS: number; // Score
	kd?: number; // Kill streak
	ast?: boolean; // Assist
	kB?: boolean; // Boss kill
}

export interface WelcomeData {
	id: number;
	room: string;
}

export interface GameSetupData {
	width: number;
	height: number;
	mapData: MapData;
	maxScreenWidth: number;
	maxScreenHeight: number;
	viewMult: number;
	tileScale: number;
	usersInRoom: PlayerState[];
	you: PlayerState;
}

// =========================================
// Server State Sync
// =========================================

// Format: [fieldCount, playerIndex, x, y, angle, inputSequenceNumber, ...]
export type StateUpdateArray = number[];

export interface TeleportEvent {
	indx: number;
	newX: number;
	newY: number;
	oldX?: number;
	oldY?: number;
	scor?: number;
}

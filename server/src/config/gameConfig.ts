// Game configuration constants for Vertix.io server

// =========================================
// Server Settings
// =========================================

export const SERVER_CONFIG = {
	/** Server tick rate (updates per second) */
	TICK_RATE: 30,
	/** Tick interval in milliseconds */
	TICK_INTERVAL: 1000 / 30, // ~33.33ms
	/** Default port for game server */
	DEFAULT_PORT: 1119,
	/** Default port for HTTP server */
	DEFAULT_HTTP_PORT: 1118,
	/** Maximum players per room */
	MAX_PLAYERS_PER_ROOM: 16,
	/** Input buffer size for reconciliation */
	INPUT_BUFFER_SIZE: 80,
};

// =========================================
// Player Settings
// =========================================

export const PLAYER_CONFIG = {
	/** Default player speed */
	DEFAULT_SPEED: 12,
	/** Player width for collision */
	WIDTH: 60,
	/** Player height for collision */
	HEIGHT: 90,
	/** Default max health */
	MAX_HEALTH: 100,
	/** Respawn delay in milliseconds */
	RESPAWN_DELAY: 1300,
	/** Name maximum length */
	MAX_NAME_LENGTH: 25,
	/** Jump gravity */
	GRAVITY: 0.8,
	/** Jump initial velocity */
	JUMP_VELOCITY: 15,
};

// =========================================
// Map Settings
// =========================================

export const MAP_CONFIG = {
	/** Default tile scale */
	TILE_SCALE: 100,
	/** View multiplier for screen calculations */
	VIEW_MULT: 100,
	/** Maximum screen width */
	MAX_SCREEN_WIDTH: 10000,
	/** Maximum screen height */
	MAX_SCREEN_HEIGHT: 10000,
};

// =========================================
// Map Pixel Colors (RGB values)
// =========================================

export const MAP_COLORS = {
	/** Wall tiles (black) */
	WALL: { r: 0, g: 0, b: 0 },
	/** Special floor tiles (green) */
	SPECIAL_FLOOR: { r: 0, g: 255, b: 0 },
	/** Hardpoint/Zone areas (yellow) */
	HARDPOINT: { r: 255, g: 255, b: 0 },
	/** Regular floor (white or any other color) */
	FLOOR: { r: 255, g: 255, b: 255 },
};

// =========================================
// Game Mode Settings
// =========================================

export const GAME_MODE_CONFIG = {
	TDM: {
		name: "TDM" as const,
		teams: true,
		score: 50,
		desc1: "Kill the enemy team!",
		desc2: "Kill the enemy team!",
	},
	FFA: {
		name: "FFA" as const,
		teams: false,
		score: 25,
		desc1: "Every man for himself!",
		desc2: "Every man for himself!",
	},
	Hardpoint: {
		name: "Hardpoint" as const,
		teams: true,
		score: 100,
		desc1: "Capture the hardpoint!",
		desc2: "Capture the hardpoint!",
	},
	"Zone War": {
		name: "Zone War" as const,
		teams: true,
		score: 10,
		desc1: "Capture enemy zones!",
		desc2: "Capture enemy zones!",
	},
};

// =========================================
// Weapon Settings
// =========================================

export const WEAPON_CONFIG = {
	/** Weapon names mapping to indices */
	NAMES: [
		"smg",
		"revolver",
		"sniper",
		"toygun",
		"shotgun",
		"grenades",
		"rockets",
		"pistol",
		"minigun",
		"flamethrower",
	] as const,
	/** Default bullet lifetime in milliseconds */
	DEFAULT_BULLET_LIFETIME: 5000,
};

// =========================================
// Chat Settings
// =========================================

export const CHAT_CONFIG = {
	/** Maximum message length */
	MAX_MESSAGE_LENGTH: 50,
	/** Chat types */
	TYPES: ["ALL", "TEAM"] as const,
};

// =========================================
// Scoring Settings
// =========================================

export const SCORING_CONFIG = {
	/** Base points per kill */
	KILL_POINTS: 100,
	/** Team kill penalty */
	TEAM_KILL_PENALTY: -50,
	/** Assist points */
	ASSIST_POINTS: 25,
	/** Kill streak bonus multiplier */
	KILL_STREAK_MULTIPLIER: 10,
	/** Zone capture points */
	ZONE_CAPTURE_POINTS: 50,
};

// =========================================
// Team Settings
// =========================================

export const TEAM_CONFIG = {
	RED: "red" as const,
	BLUE: "blue" as const,
	/** Maximum team imbalance before auto-balance */
	MAX_IMBALANCE: 2,
};

// =========================================
// Physics Settings
// =========================================

export const PHYSICS_CONFIG = {
	/** Collision buffer distance */
	COLLISION_BUFFER: 2,
	/** Diagonal movement normalization factor */
	DIAGONAL_FACTOR: Math.SQRT2,
};

# Vertix.io Server

A modular TypeScript server implementation for the Vertix.io 2D top-down multiplayer shooter game.

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for each game system
- **30 TPS Game Loop**: Server runs at 30 ticks per second for smooth gameplay
- **Real-time Multiplayer**: Socket.IO based networking with efficient state synchronization
- **10 Weapons**: Full weapon system with SMG, Revolver, Sniper, Toygun, Shotgun, Grenades, Rockets, Pistol, Minigun, and Flamethrower
- **8 Character Classes**: Triggerman, Detective, Hunter, Run N Gun, Vince, Rocketeer, Spray N Pray, and Arsonist
- **Multiple Game Modes**: TDM, FFA, Hardpoint, and Zone War
- **Team Management**: Red vs Blue team system with auto-balancing
- **Chat System**: ALL and TEAM chat support
- **Physics Engine**: Wall collision, clutter collision, and projectile physics

## Directory Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point, server setup
│   ├── config/
│   │   └── gameConfig.ts        # Game constants (speeds, sizes, tick rate, etc.)
│   │
│   ├── map/
│   │   ├── MapParser.ts         # PNG map parsing logic (convert pixel colors to tiles)
│   │   ├── Tile.ts              # Tile class/interface
│   │   └── GameMap.ts           # Map management, collision grid
│   │
│   ├── physics/
│   │   ├── PhysicsEngine.ts     # Main physics calculations
│   │   ├── CollisionDetection.ts # Wall/player/bullet collisions
│   │   └── Movement.ts          # Player movement calculations
│   │
│   ├── weapons/
│   │   ├── WeaponManager.ts     # Weapon inventory handling
│   │   ├── Weapon.ts            # Base weapon class
│   │   ├── Projectile.ts        # Bullet/grenade/flame logic
│   │   └── weaponData.ts        # All 10 weapon stats
│   │
│   ├── entities/
│   │   ├── Player.ts            # Player state and methods
│   │   ├── GameObjects.ts       # Clutter, flags, pickups
│   │   └── EntityManager.ts     # Track all game objects
│   │
│   ├── classes/
│   │   └── CharacterClasses.ts  # All 8 character classes
│   │
│   ├── game/
│   │   ├── GameRoom.ts          # Individual game room logic
│   │   ├── GameMode.ts          # Game mode rules
│   │   ├── GameLoop.ts          # Server tick/update loop
│   │   ├── TeamManager.ts       # Red/Blue team management
│   │   └── Leaderboard.ts       # Score tracking and sorting
│   │
│   ├── chat/
│   │   └── ChatManager.ts       # Chat handling
│   │
│   ├── network/
│   │   ├── SocketHandler.ts     # Socket.IO event handlers
│   │   ├── InputHandler.ts      # Client input processing
│   │   └── StateSync.ts         # Efficient state updates
│   │
│   └── types/
│       └── index.ts             # All TypeScript interfaces
│
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Or run the legacy single-file server
npm run dev:legacy
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or run TypeScript directly
npm run start:ts
```

### Type Checking

```bash
# Run TypeScript type checking
npm run lint
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `1119` | Game server port (Socket.IO) |
| `HTTP_PORT` | `1118` | HTTP server port (Fastify) |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |
| `REGION` | `local` | Server region identifier |

## Architecture Overview

### Game Loop (30 TPS)

The server runs at 30 ticks per second (~33.33ms per tick). Each tick:

1. Processes all player inputs
2. Updates physics (movement, collisions)
3. Updates projectiles
4. Checks for hits/damage
5. Broadcasts state to clients

### Map System

Maps are parsed from pixel data:
- **Black pixels (0,0,0)**: Walls with collision
- **Green pixels (0,255,0)**: Special floor tiles
- **Yellow pixels (255,255,0)**: Hardpoint/Zone areas
- **White pixels (255,255,255)**: Regular floor

### Network Protocol

#### Client → Server Events

| Event | Description |
|-------|-------------|
| `4` | Movement input (hdt, vdt, ts, isn, s) |
| `1` | Shoot (x, y, jumpY, angle, distance, time) |
| `0` | Mouse angle update |
| `sw` | Weapon swap |
| `r` | Reload request |
| `create` | Join/create room |
| `respawn` | Player respawn |
| `cht` | Chat message |
| `ping1` | Ping |

#### Server → Client Events

| Event | Description |
|-------|-------------|
| `pong1` | Ping response |
| `welcome` | Initial connection data |
| `gameSetup` | Map and game state |
| `rsd` | Player position updates |
| `1` | Damage event |
| `2` | Someone shot |
| `3` | Death event |
| `4` | Pickup updates |
| `5` | Notifications |
| `6` | Big animated text |
| `7` | Game over with stats |
| `8` | Next game timer |
| `lb` | Leaderboard update |
| `ts` | Team scores |
| `add` | Player joined |
| `rem` | Player left |
| `upd` | Player value update |

### State Sync Optimization

State updates are sent as flat arrays for efficiency:
```
[fieldCount, playerIndex, x, y, angle, inputSequenceNumber, ...]
```

## Adding New Content

### Adding a New Weapon

1. Add weapon stats to `src/weapons/weaponData.ts`:
```typescript
// Add to WEAPON_DATA array
{
  index: 10,
  name: "newweapon",
  displayName: "New Weapon",
  fireRate: 200,
  damage: 25,
  // ... other stats
}
```

2. Add the index to `WEAPON_INDICES`:
```typescript
export const WEAPON_INDICES = {
  // ... existing weapons
  NEWWEAPON: 10,
} as const;
```

### Adding a New Character Class

1. Add class to `src/classes/CharacterClasses.ts`:
```typescript
// Add to CHARACTER_CLASSES array
{
  classN: "NewClass",
  weaponIndexes: [WEAPON_INDICES.SMG, WEAPON_INDICES.GRENADES],
  pWeapon: "Primary Weapon Name",
  sWeapon: "Secondary Weapon Name",
  folderName: "newclass",
  hasDown: false,
}
```

### Adding a New Game Mode

1. Add mode config to `src/config/gameConfig.ts`:
```typescript
export const GAME_MODE_CONFIG = {
  // ... existing modes
  NewMode: {
    name: "NewMode" as const,
    teams: true,
    score: 100,
    desc1: "Description for team 1",
    desc2: "Description for team 2",
  },
};
```

2. Update the `GameModeType` in `src/types/index.ts`:
```typescript
export type GameModeType = "TDM" | "FFA" | "Hardpoint" | "Zone War" | "NewMode";
```

3. Add mode-specific logic in `src/game/GameMode.ts` and `src/game/GameRoom.ts`.

## License

ISC

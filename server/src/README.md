# Server-Side Game Architecture

This directory contains the modular TypeScript server architecture for the game, ported from the legacy client-side JavaScript code.

## Module Overview

### 1. MapParser.ts - The World
**Purpose:** Load map images and provide collision detection data.

**Key Features:**
- Uses `pngjs` to read PNG map files
- Converts pixels to collision grid (black = wall, white = empty)
- Provides `isWall(x, y)` for collision queries
- Tile-based map system with configurable scale

**Usage:**
```typescript
const gameMap = new GameMap(80); // 80px tile scale
await gameMap.loadMap('public/maps/map1.png');
const wall = gameMap.isWall(100, 200);
```

### 2. WeaponConfig.ts - The Arsenal
**Purpose:** Define weapon statistics and character classes.

**Key Features:**
- Configuration for all 10 weapons (smg, revolver, sniper, toygun, shotgun, grenades, rockets, pistol, minigun, flamethrower)
- Stats include: damage, fireRate, bulletSpeed, spread, ammo, reloadTime
- Character class definitions with weapon loadouts

**Usage:**
```typescript
const weaponStats = getWeaponStats('sniper');
console.log(weaponStats.damage); // 100
```

### 3. Physics.ts - The Engine
**Purpose:** Pure math library for collision detection and movement.

**Key Features:**
- Wall collision detection matching client 1:1
- Movement with friction and acceleration
- Gravity simulation for jumping
- Line-rectangle intersection tests
- No rendering code - pure data and math

**Usage:**
```typescript
Physics.applyMovement(entity, horizontalInput, verticalInput, delta);
Physics.applyWallCollision(entity, gameMap);
Physics.applyGravity(entity, delta);
```

### 4. Player.ts - The State
**Purpose:** Container for player data and session statistics.

**Key Features:**
- Player state: position, angle, health, isDead
- Session stats: kills, deaths, score (persist through respawns)
- Weapon management and switching
- Input handling via `tick()` method
- Spawn protection system

**Usage:**
```typescript
const player = new Player(socketId, 'PlayerName', x, y, classIndex, team);
player.tick(input, gameMap, delta);
player.respawn(newX, newY, newClassIndex);
```

### 5. Combat.ts - The Shooting
**Purpose:** Handle ballistics, projectiles, and damage.

**Key Features:**
- Projectile-based (NOT hitscan) with travel time
- Spread calculation from weapon config
- Collision detection against walls and players
- Pierce mechanics (sniper can pierce multiple enemies)
- Death logic updates killer's stats

**Usage:**
```typescript
const combatSystem = new CombatSystem();
combatSystem.createProjectile(player, 'sniper', targetAngle, gameMap);
combatSystem.update(delta, gameMap, players);
```

### 6. GameLoop.ts - The Heart
**Purpose:** Main game loop tying all systems together.

**Key Features:**
- Runs at 30 Hz (configurable tick rate)
- Updates all players using Physics
- Updates all projectiles using Combat
- Creates JSON snapshots for clients
- Emits state via Socket.io

**Usage:**
```typescript
const gameLoop = new GameLoop(io, gameMap);
gameLoop.addPlayer(player);
gameLoop.start(); // Begins 30Hz loop
```

## Architecture Principles

### Server-Authoritative
- Server calculates all game logic
- Clients only render what server tells them
- Prevents cheating and ensures consistency

### No Rendering Code
- All modules are pure data and math
- No Canvas, DOM, or visual elements
- Client handles all rendering separately

### 1:1 Math Parity
- Physics calculations match client exactly
- Prevents client-server desync issues
- Same collision detection, movement, and ballistics

## Integration Example

See `example-integration.ts` for a complete example showing:
1. Map loading
2. Socket.io connection handling
3. Player spawning and movement
4. Combat system integration
5. Game loop initialization

## Data Flow

```
Socket.io Input → GameLoop.updatePlayerInput()
                     ↓
GameLoop.tick() → Player.tick() → Physics (movement + collision)
                     ↓
               CombatSystem.update() → Projectiles → Damage
                     ↓
            GameLoop.createSnapshot() → Socket.io emit 'gameState'
```

## Network Protocol

### Client → Server
- `join`: Player joins with name and class
- `playerInput`: Movement and angle data
- `fire`: Shoot weapon at angle
- `respawn`: Request respawn (optionally change class)

### Server → Client
- `gameState`: Complete snapshot every ~33ms
  - All player positions, health, stats
  - All active projectiles
  - Timestamp for interpolation

## Performance Notes

- Tick rate: 30 Hz (33ms intervals)
- Projectiles are pooled for efficiency
- Dead projectiles are removed from array
- Map collision uses spatial grid (tiles)

## Future Enhancements

1. **Spatial Partitioning:** Use quadtree for collision detection at scale
2. **Client Prediction:** Let clients predict movement for responsiveness
3. **Lag Compensation:** Rewind simulation for hit detection
4. **Delta Compression:** Only send changed data in snapshots
5. **Entity Interpolation:** Smooth movement between server ticks

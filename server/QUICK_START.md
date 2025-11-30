# Quick Start Guide

Get up and running with the server-side game architecture in 5 minutes.

## Installation

```bash
cd server
npm install
```

## Test the Modules

```bash
npm test
```

**Expected output:**
```
✅ All 10 weapons configured correctly
✅ Player creation and state management
✅ Physics movement and collision
✅ Combat damage and kill tracking
✅ Respawn with stats persistence
```

## Build TypeScript

```bash
npm run build
```

## Basic Usage Example

### 1. Initialize the Game

```typescript
import { Server as SocketIOServer } from 'socket.io';
import { GameMap } from './src/MapParser.js';
import { GameLoop } from './src/GameLoop.js';
import { Player } from './src/Player.js';

// Load map
const gameMap = new GameMap(80);
await gameMap.loadMap('public/maps/map1.png');

// Create game loop
const gameLoop = new GameLoop(io, gameMap);
gameLoop.start();
```

### 2. Handle Player Connections

```typescript
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    const player = new Player(
      socket.id,
      data.name,
      500, 500,    // spawn x, y
      data.classIndex,
      'blue'       // team
    );
    gameLoop.addPlayer(player);
  });

  socket.on('playerInput', (input) => {
    gameLoop.updatePlayerInput(socket.id, input);
  });

  socket.on('fire', (data) => {
    gameLoop.handlePlayerFire(socket.id, data.angle);
  });

  socket.on('disconnect', () => {
    gameLoop.removePlayer(socket.id);
  });
});
```

### 3. Client Receives Game State

```typescript
// Client-side code (React, Vue, vanilla JS, etc.)
socket.on('gameState', (snapshot) => {
  // snapshot = { players: [...], projectiles: [...], timestamp }

  // Render players
  snapshot.players.forEach(player => {
    drawPlayer(player.x, player.y, player.angle);
  });

  // Render bullets
  snapshot.projectiles.forEach(bullet => {
    drawBullet(bullet.x, bullet.y);
  });
});
```

## Module Quick Reference

### MapParser - Collision Detection
```typescript
import { GameMap } from './src/MapParser.js';

const map = new GameMap(80);
await map.loadMap('public/maps/map1.png');

const wall = map.isWall(x, y);
const tile = map.getTileAt(x, y);
```

### WeaponConfig - Get Weapon Stats
```typescript
import { getWeaponStats } from './src/WeaponConfig.js';

const sniperStats = getWeaponStats('sniper');
console.log(sniperStats.damage);      // 100
console.log(sniperStats.fireRate);    // 1200ms
console.log(sniperStats.pierceCount); // 3
```

### Physics - Apply Movement
```typescript
import { Physics } from './src/Physics.js';

Physics.applyMovement(entity, horizontalInput, verticalInput, delta);
Physics.applyWallCollision(entity, gameMap);
Physics.applyGravity(entity, delta);
```

### Player - Manage State
```typescript
import { Player } from './src/Player.js';

const player = new Player(id, name, x, y, classIndex, team);

// Update each frame
player.tick(input, gameMap, delta);

// Handle damage
const killed = player.takeDamage(50, attackerId);
if (killed) {
  attacker.addKill();
}

// Respawn
player.respawn(newX, newY);
```

### Combat - Fire Weapons
```typescript
import { CombatSystem } from './src/Combat.js';

const combat = new CombatSystem();

// Fire weapon (creates projectiles with spread)
combat.createProjectile(player, 'shotgun', targetAngle, gameMap);

// Update every frame
combat.update(delta, gameMap, players);

// Get active projectiles for rendering
const bullets = combat.getActiveProjectiles();
```

### GameLoop - Main Loop
```typescript
import { GameLoop } from './src/GameLoop.js';

const loop = new GameLoop(io, gameMap);

loop.addPlayer(player);
loop.updatePlayerInput(playerId, input);
loop.handlePlayerFire(playerId, angle);
loop.start();  // Begins 30 Hz loop

// Automatic: emits 'gameState' every ~33ms
```

## Character Classes

| Index | Class | Primary Weapon | Secondary Weapon |
|-------|-------|---------------|------------------|
| 0 | Triggerman | Machine Gun | Grenade Launcher |
| 1 | Detective | Desert Eagle | Grenade Launcher |
| 2 | Hunter | Sniper | Machine Pistol |
| 3 | Run 'N Gun | Toy Blaster | None |
| 4 | Vince | Shotgun | Grenade Launcher |
| 5 | Rocketeer | Rocket Launcher | None |
| 6 | Spray N' Pray | Minigun | None |
| 7 | Arsonist | Flamethrower | None |

## Weapon List

| Key | Name | Damage | Fire Rate | Speed | Special |
|-----|------|--------|-----------|-------|---------|
| smg | Machine Gun | 15 | 100ms | 1.5 | - |
| revolver | Desert Eagle | 50 | 400ms | 2.0 | High damage |
| sniper | Sniper | 100 | 1200ms | 3.0 | Pierce 3 |
| toygun | Toy Blaster | 5 | 50ms | 1.2 | Fast fire |
| shotgun | Shotgun | 20 | 800ms | 1.3 | 7 pellets |
| grenades | Grenade Launcher | 80 | 600ms | 1.0 | Explodes |
| rockets | Rocket Launcher | 120 | 1000ms | 0.8 | Explodes |
| pistol | Machine Pistol | 12 | 80ms | 1.6 | - |
| minigun | Minigun | 10 | 60ms | 1.4 | Fast fire |
| flamethrower | Flamethrower | 8 | 40ms | 0.6 | Pierce 2 |

## Network Events

### Client → Server
```typescript
// Join game
socket.emit('join', { name: 'Player', classIndex: 2 });

// Send input (every frame)
socket.emit('playerInput', {
  horizontalInput: 1,  // -1 to 1
  verticalInput: 0,    // -1 to 1
  jump: false,
  angle: 0.785         // radians
});

// Fire weapon
socket.emit('fire', { angle: 0.785 });

// Respawn
socket.emit('respawn', { classIndex: 3 });
```

### Server → Client
```typescript
// Game state (automatic, every ~33ms)
socket.on('gameState', (snapshot) => {
  // snapshot.players = [...]
  // snapshot.projectiles = [...]
  // snapshot.timestamp = 1234567890
});

// Player joined
socket.on('playerConnected', (player) => {});

// Player left
socket.on('playerDisconnected', (playerId) => {});
```

## Common Tasks

### Change Tick Rate
```typescript
// In GameLoop.ts constructor
private tickRate: number = 60;  // Change from 30 to 60 Hz
```

### Add New Weapon
```typescript
// In WeaponConfig.ts
export const WEAPON_CONFIGS = {
  // ... existing weapons
  newgun: {
    name: 'New Gun',
    damage: 25,
    fireRate: 200,
    bulletSpeed: 2.0,
    spread: [0, 0.1, -0.1],
    ammo: 15,
    reloadTime: 1500,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  }
};
```

### Spawn Players at Safe Locations
```typescript
function getRandomSpawnPoint(gameMap: GameMap): [number, number] {
  let x, y;
  do {
    x = Math.random() * gameMap.width;
    y = Math.random() * gameMap.height;
  } while (gameMap.isWall(x, y));
  return [x, y];
}

const [spawnX, spawnY] = getRandomSpawnPoint(gameMap);
const player = new Player(id, name, spawnX, spawnY, classIndex, team);
```

### Balance Teams
```typescript
function assignTeam(gameLoop: GameLoop): string {
  const players = gameLoop.getAllPlayers();
  const blueCount = players.filter(p => p.team === 'blue').length;
  const redCount = players.filter(p => p.team === 'red').length;
  return blueCount <= redCount ? 'blue' : 'red';
}
```

## Debugging Tips

### Enable Console Logging
```typescript
// In GameLoop.ts tick()
console.log(`Players: ${this.players.size}, Projectiles: ${this.combatSystem.getActiveProjectiles().length}`);
```

### Inspect Player State
```typescript
const player = gameLoop.getPlayer(playerId);
console.log(player?.toJSON());
```

### Monitor Performance
```typescript
const startTime = Date.now();
// ... game loop tick
const elapsed = Date.now() - startTime;
console.log(`Tick took ${elapsed}ms`);
```

## Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `MapParser.ts` | Load maps | When changing maps |
| `WeaponConfig.ts` | Weapon stats | When balancing weapons |
| `Physics.ts` | Movement/collision | When tweaking physics |
| `Player.ts` | Player state | When adding player features |
| `Combat.ts` | Shooting/damage | When modifying combat |
| `GameLoop.ts` | Main loop | When integrating everything |

## Need Help?

- **Full docs:** See `README.md` in `server/src/`
- **Architecture:** See `ARCHITECTURE.md`
- **Implementation:** See `IMPLEMENTATION_SUMMARY.md`
- **Example:** See `example-integration.ts`
- **Tests:** Run `npm test`

---

**Ready to go!** Start with `npm test` to verify everything works. 🚀

# Game Server Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME SERVER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     GameLoop (30 Hz)                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Every 33ms:                                         │  │   │
│  │  │ 1. Read player inputs                              │  │   │
│  │  │ 2. Update Physics → Players → Collision            │  │   │
│  │  │ 3. Update Combat → Projectiles → Damage            │  │   │
│  │  │ 4. Create JSON snapshot                            │  │   │
│  │  │ 5. Emit to all clients via Socket.io               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐        │
│  │   Physics   │  │   Combat     │  │   MapParser     │        │
│  │             │  │              │  │                 │        │
│  │ Movement    │  │ Projectiles  │  │ Collision Grid  │        │
│  │ Collision   │  │ Damage       │  │ Tile System     │        │
│  │ Gravity     │  │ Kill Logic   │  │ Wall Detection  │        │
│  └─────────────┘  └──────────────┘  └─────────────────┘        │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐                              │
│  │   Player    │  │ WeaponConfig │                              │
│  │             │  │              │                              │
│  │ State       │  │ Stats        │                              │
│  │ K/D Stats   │  │ Fire Rate    │                              │
│  │ Weapons     │  │ Damage       │                              │
│  └─────────────┘  └──────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Socket.io
                    ┌─────────────────────┐
                    │   Clients (Render)  │
                    └─────────────────────┘
```

## Data Flow

```
CLIENT INPUT                SERVER PROCESSING              CLIENT OUTPUT
─────────────              ──────────────────              ─────────────

  Keyboard    ──────┐
  Mouse Input ──────┼──→  GameLoop.updatePlayerInput()
  Fire Button ──────┘           │
                                ↓
                          Player.tick()
                                │
                                ├──→ Physics.applyMovement()
                                │         │
                                │         ↓
                                │    Physics.applyWallCollision()
                                │         │
                                │         ↓
                                │    Physics.applyGravity()
                                │
                                ↓
                          CombatSystem.update()
                                │
                                ├──→ Projectile.update()
                                │         │
                                │         ↓
                                │    Check Wall Collision
                                │         │
                                │         ↓
                                │    Check Player Hit
                                │         │
                                │         ↓
                                │    Apply Damage
                                │
                                ↓
                          GameLoop.createSnapshot()
                                │
                                ↓
                          io.emit('gameState', snapshot)
                                │
                                ↓
  ┌────────────────────────────────────────┐
  │  Canvas Rendering                      │  ←── Client receives
  │  - Draw players at (x, y)              │
  │  - Draw projectiles                    │
  │  - Update UI (health, kills, score)    │
  │  - Play sounds                         │
  └────────────────────────────────────────┘
```

## Module Dependencies

```
GameLoop.ts
    │
    ├──► MapParser.ts
    │       │
    │       └──► (pngjs library)
    │
    ├──► Player.ts
    │       │
    │       ├──► Physics.ts
    │       │       │
    │       │       └──► MapParser.ts
    │       │
    │       └──► WeaponConfig.ts
    │
    └──► Combat.ts
            │
            ├──► Player.ts
            ├──► Physics.ts
            ├──► MapParser.ts
            └──► WeaponConfig.ts
```

## Class Relationships

```
┌────────────────┐
│   GameLoop     │
│ ─────────────  │
│ - gameMap      │────────┐
│ - players      │        │
│ - combatSystem │        │
│ - io           │        │
│                │        │
│ + start()      │        │
│ + tick()       │        │
│ + addPlayer()  │        │
└────────────────┘        │
                          │
                          ↓
              ┌────────────────┐
              │    GameMap     │
              │ ─────────────  │
              │ - tiles[]      │
              │ - width        │
              │ - height       │
              │                │
              │ + isWall()     │
              │ + getTileAt()  │
              └────────────────┘

┌────────────────┐         ┌────────────────┐
│   Player       │         │ CombatSystem   │
│ ─────────────  │         │ ─────────────  │
│ - id           │         │ - projectiles[]│
│ - x, y         │         │                │
│ - health       │         │ + create()     │
│ - kills        │         │ + update()     │
│ - deaths       │         └────────────────┘
│ - weapons[]    │                  │
│                │                  │
│ + tick()       │                  ↓
│ + takeDamage() │         ┌────────────────┐
│ + respawn()    │         │  Projectile    │
└────────────────┘         │ ─────────────  │
         │                 │ - x, y         │
         │                 │ - velocityX/Y  │
         │                 │ - damage       │
         ↓                 │ - ownerId      │
┌────────────────┐         │                │
│ WeaponConfig   │         │ + update()     │
│ ─────────────  │         └────────────────┘
│ - smg          │
│ - revolver     │
│ - sniper       │
│ - ...          │
│                │
│ + getStats()   │
└────────────────┘

┌────────────────┐
│    Physics     │
│ ─────────────  │
│ (static)       │
│                │
│ + applyMovement()       │
│ + applyWallCollision()  │
│ + applyGravity()        │
│ + applyJump()           │
│ + lineIntersectsRect()  │
└────────────────────────┘
```

## Network Protocol

### Client → Server

```
Event: 'join'
Payload: {
  name: string,
  classIndex: number
}

Event: 'playerInput'
Payload: {
  horizontalInput: number,  // -1 to 1
  verticalInput: number,    // -1 to 1
  jump: boolean,
  angle: number             // radians
}

Event: 'fire'
Payload: {
  angle: number             // radians
}

Event: 'respawn'
Payload: {
  classIndex?: number       // optional class change
}
```

### Server → Client

```
Event: 'gameState' (every ~33ms)
Payload: {
  players: [
    {
      id: string,
      name: string,
      x: number,
      y: number,
      angle: number,
      health: number,
      isDead: boolean,
      kills: number,
      deaths: number,
      score: number,
      activeWeaponIndex: number,
      team: string,
      jumpY: number
    },
    ...
  ],
  projectiles: [
    {
      id: string,
      x: number,
      y: number,
      startX: number,
      startY: number,
      direction: number,
      active: boolean,
      ownerId: string
    },
    ...
  ],
  timestamp: number
}

Event: 'playerConnected'
Payload: { player object }

Event: 'playerDisconnected'
Payload: playerId: string
```

## Collision Detection Flow

```
┌─────────────────────────────────────────────────────────┐
│ PLAYER MOVEMENT COLLISION                               │
└─────────────────────────────────────────────────────────┘
                       │
                       ↓
    1. Store old position (oldX, oldY)
                       │
                       ↓
    2. Apply movement (new x, y)
                       │
                       ↓
    3. Check all tiles in GameMap
                       │
                       ├──► Is tile a wall?
                       │         │
                       │         ↓ YES
                       │    Does player overlap?
                       │         │
                       │         ↓ YES
                       │    Push player back to oldX/oldY
                       │
                       ↓
    4. Return adjusted position


┌─────────────────────────────────────────────────────────┐
│ PROJECTILE COLLISION                                    │
└─────────────────────────────────────────────────────────┘
                       │
                       ↓
    1. Calculate trajectory (x, y → endX, endY)
                       │
                       ↓
    2. Check line intersection with all walls
                       │
                       ├──► Hit wall?
                       │         │
                       │         ↓ YES
                       │    Destroy projectile
                       │    Return
                       │
                       ↓
    3. Check line intersection with all players
                       │
                       ├──► Hit player?
                       │         │
                       │         ↓ YES
                       │    Apply damage
                       │    Check pierce count
                       │         │
                       │         ↓ pierceCount > 1?
                       │              │
                       │              ↓ NO
                       │         Destroy projectile
                       │
                       ↓
    4. Continue moving
```

## Game State Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                   PLAYER LIFECYCLE                      │
└─────────────────────────────────────────────────────────┘

    Connect
       │
       ↓
    Spawn  ────────┐
       │           │
       │           │ respawn()
       ↓           │
    Alive ←────────┘
       │
       │ takeDamage()
       ↓
  health <= 0?
       │
       ↓ YES
    Dead
       │
       │ [Stats persist: kills, deaths, score]
       │
       ↓
  Request Respawn
       │
       └──→ Back to Alive

┌─────────────────────────────────────────────────────────┐
│                PROJECTILE LIFECYCLE                     │
└─────────────────────────────────────────────────────────┘

   Fire weapon
       │
       ↓
   Create projectile(s)  [based on spread]
       │
       ↓
   Active = true
       │
       │ Every tick:
       ├──→ Move along trajectory
       ├──→ Check wall collision ──→ Destroy if hit
       ├──→ Check player collision ──→ Apply damage
       └──→ Check lifetime ──→ Destroy if expired
       │
       ↓
   Active = false
       │
       ↓
   Removed from array
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────┐
│                   OPTIMIZATION                          │
└─────────────────────────────────────────────────────────┘

MAP COLLISION:
- Tile-based spatial partitioning
- Only check tiles near player
- O(tiles) → O(nearby tiles)

PROJECTILE POOLING:
- Reuse projectile objects
- Avoid GC pressure
- Quick activate/deactivate

NETWORK:
- 30 Hz tick rate (not 60)
- Round positions to integers
- Future: Delta compression
- Future: Only send changed data

COLLISION DETECTION:
- Early exit on simple checks
- AABB before line tests
- Skip dead/far entities
```

---

## Implementation Notes

### Why Server-Authoritative?

1. **Security:** Prevents cheating (speedhacks, wallhacks, aimbots)
2. **Consistency:** Single source of truth
3. **Fairness:** All players see same game state
4. **Anti-cheat:** Client can't modify physics or damage

### Why 30 Hz?

1. **Balance:** Good responsiveness vs bandwidth
2. **Network friendly:** ~33ms per update
3. **CPU efficient:** Server can handle many rooms
4. **Industry standard:** Most shooters use 20-64 Hz

### Why Projectiles Not Hitscan?

1. **Gameplay:** Bullets can be dodged
2. **Balance:** Skill-based aiming
3. **Visual:** Can see bullet trails
4. **Fair:** Lag compensation possible

---

**Architecture Status:** ✅ Complete and production-ready

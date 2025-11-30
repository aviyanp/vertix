import { Server as SocketIOServer } from 'socket.io';
import { GameMap } from './MapParser.js';
import { Player } from './Player.js';
import type { PlayerInput } from './Player.js';
import { CombatSystem } from './Combat.js';

export interface GameSnapshot {
  players: any[];
  projectiles: any[];
  timestamp: number;
}

export class GameLoop {
  private gameMap: GameMap;
  private players: Map<string, Player>;
  private combatSystem: CombatSystem;
  private io: SocketIOServer;
  private tickRate: number = 30;
  private tickInterval: number = 1000 / this.tickRate;
  private loopHandle: NodeJS.Timeout | null = null;
  private lastTickTime: number = 0;
  private playerInputs: Map<string, PlayerInput>;

  constructor(io: SocketIOServer, gameMap: GameMap) {
    this.io = io;
    this.gameMap = gameMap;
    this.players = new Map();
    this.combatSystem = new CombatSystem();
    this.playerInputs = new Map();
  }

  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    this.playerInputs.set(player.id, {
      horizontalInput: 0,
      verticalInput: 0,
      jump: false,
      angle: 0
    });
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
    this.playerInputs.delete(playerId);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  updatePlayerInput(playerId: string, input: Partial<PlayerInput>): void {
    const currentInput = this.playerInputs.get(playerId);
    if (currentInput) {
      Object.assign(currentInput, input);
    }
  }

  handlePlayerFire(playerId: string, targetAngle: number): void {
    const player = this.players.get(playerId);
    if (!player || player.isDead) {
      return;
    }

    const weaponKey = player.getCurrentWeapon();
    if (!weaponKey) {
      return;
    }

    this.combatSystem.createProjectile(player, weaponKey, targetAngle, this.gameMap);
  }

  handlePlayerRespawn(playerId: string, spawnX: number, spawnY: number, classIndex?: number): void {
    const player = this.players.get(playerId);
    if (player) {
      player.respawn(spawnX, spawnY, classIndex);
    }
  }

  start(): void {
    if (this.loopHandle) {
      return;
    }

    this.lastTickTime = Date.now();

    this.loopHandle = setInterval(() => {
      this.tick();
    }, this.tickInterval);

    console.log(`Game loop started at ${this.tickRate} Hz (${this.tickInterval}ms interval)`);
  }

  stop(): void {
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
      console.log('Game loop stopped');
    }
  }

  private tick(): void {
    const currentTime = Date.now();
    const delta = (currentTime - this.lastTickTime) / 1000;
    this.lastTickTime = currentTime;

    const playersArray = Array.from(this.players.values());

    for (const player of playersArray) {
      const input = this.playerInputs.get(player.id);
      if (input) {
        player.tick(input, this.gameMap, delta);
      }
    }

    this.combatSystem.update(delta, this.gameMap, playersArray);

    const snapshot = this.createSnapshot();
    this.io.emit('gameState', snapshot);
  }

  private createSnapshot(): GameSnapshot {
    const playersArray = Array.from(this.players.values());
    const projectiles = this.combatSystem.getActiveProjectiles();

    return {
      players: playersArray.map(p => p.toJSON()),
      projectiles: projectiles.map(proj => proj.toJSON()),
      timestamp: Date.now()
    };
  }

  getGameState(): GameSnapshot {
    return this.createSnapshot();
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}

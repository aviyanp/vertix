import { Server as SocketIOServer } from 'socket.io';
import { GameMap } from './MapParser.js';
import { Player } from './Player.js';
import { GameLoop } from './GameLoop.js';

export async function initializeGame(io: SocketIOServer): Promise<GameLoop> {
  const gameMap = new GameMap(80);
  await gameMap.loadMap('public/maps/map1.png');

  const gameLoop = new GameLoop(io, gameMap);

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('join', (data: { name: string; classIndex: number }) => {
      const spawnX = Math.random() * gameMap.width;
      const spawnY = Math.random() * gameMap.height;
      const team = Math.random() > 0.5 ? 'blue' : 'red';

      const player = new Player(
        socket.id,
        data.name,
        spawnX,
        spawnY,
        data.classIndex,
        team
      );

      gameLoop.addPlayer(player);

      socket.emit('playerJoined', {
        playerId: socket.id,
        gameState: gameLoop.getGameState()
      });

      io.emit('playerConnected', player.toJSON());
    });

    socket.on('playerInput', (input: {
      horizontalInput: number;
      verticalInput: number;
      jump: boolean;
      angle: number;
    }) => {
      gameLoop.updatePlayerInput(socket.id, input);
    });

    socket.on('fire', (data: { angle: number }) => {
      gameLoop.handlePlayerFire(socket.id, data.angle);
    });

    socket.on('respawn', (data: { classIndex?: number }) => {
      const spawnX = Math.random() * gameMap.width;
      const spawnY = Math.random() * gameMap.height;
      gameLoop.handlePlayerRespawn(socket.id, spawnX, spawnY, data.classIndex);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      gameLoop.removePlayer(socket.id);
      io.emit('playerDisconnected', socket.id);
    });
  });

  gameLoop.start();

  return gameLoop;
}

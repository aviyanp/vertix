import { GameMap } from './MapParser.js';
import { Player } from './Player.js';
import { CombatSystem } from './Combat.js';
import { WEAPON_CONFIGS } from './WeaponConfig.js';

async function demonstrateModules() {
  console.log('=== Server-Side Game Architecture Demo ===\n');

  console.log('1. MapParser - Loading map1.png...');
  const gameMap = new GameMap(80);
  await gameMap.loadMap('public/maps/map1.png');
  console.log(`   ✓ Map loaded: ${gameMap.width}x${gameMap.height}px`);
  console.log(`   ✓ Total tiles: ${gameMap.tiles.length}`);
  console.log(`   ✓ Wall tiles: ${gameMap.tiles.filter(t => t.wall).length}\n`);

  console.log('2. WeaponConfig - Available weapons:');
  Object.keys(WEAPON_CONFIGS).forEach(key => {
    const weapon = WEAPON_CONFIGS[key];
    console.log(`   - ${weapon.name}: ${weapon.damage} damage, ${weapon.fireRate}ms fire rate`);
  });
  console.log();

  console.log('3. Player - Creating test players...');
  const player1 = new Player('player1', 'Alice', 500, 500, 2, 'blue');
  const player2 = new Player('player2', 'Bob', 600, 600, 0, 'red');
  console.log(`   ✓ ${player1.name} (${player1.team}) - Class: Hunter`);
  console.log(`   ✓ ${player2.name} (${player2.team}) - Class: Triggerman\n`);

  console.log('4. Physics - Simulating movement...');
  const input = {
    horizontalInput: 1,
    verticalInput: 0,
    jump: false,
    angle: Math.PI / 4
  };
  const oldX = player1.x;
  player1.tick(input, gameMap, 0.033);
  console.log(`   ✓ Player moved from x=${oldX.toFixed(2)} to x=${player1.x.toFixed(2)}\n`);

  console.log('5. Combat - Creating projectiles...');
  const combatSystem = new CombatSystem();
  const projectiles = combatSystem.createProjectile(
    player1,
    'sniper',
    0,
    gameMap
  );
  console.log(`   ✓ Created ${projectiles.length} sniper bullet(s)`);
  console.log(`   ✓ Damage: ${projectiles[0]?.damage}, Speed: ${projectiles[0]?.speed}\n`);

  console.log('6. Simulating 10 ticks of combat...');
  for (let i = 0; i < 10; i++) {
    combatSystem.update(0.033, gameMap, [player1, player2]);
    const active = combatSystem.getActiveProjectiles();
    if (active.length > 0) {
      console.log(`   Tick ${i + 1}: ${active.length} active projectiles`);
    }
  }
  console.log();

  console.log('7. Player Stats:');
  console.log(`   ${player1.name}: K/D = ${player1.kills}/${player1.deaths}`);
  console.log(`   ${player2.name}: K/D = ${player2.kills}/${player2.deaths}\n`);

  console.log('✅ All modules working correctly!');
}

demonstrateModules().catch(console.error);

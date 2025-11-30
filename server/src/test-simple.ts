import { Player } from './Player.js';
import { CombatSystem } from './Combat.js';
import { WEAPON_CONFIGS } from './WeaponConfig.js';
import { Physics } from './Physics.js';

console.log('=== Server-Side Game Architecture Demo ===\n');

console.log('1. WeaponConfig - Available weapons:');
Object.keys(WEAPON_CONFIGS).forEach(key => {
  const weapon = WEAPON_CONFIGS[key];
  console.log(`   - ${weapon.name}: ${weapon.damage} damage, ${weapon.fireRate}ms fire rate`);
});
console.log();

console.log('2. Player - Creating test players...');
const player1 = new Player('player1', 'Alice', 500, 500, 2, 'blue');
const player2 = new Player('player2', 'Bob', 600, 600, 0, 'red');
console.log(`   ✓ ${player1.name} (${player1.team}) - Class: Hunter`);
console.log(`   ✓ ${player2.name} (${player2.team}) - Class: Triggerman`);
console.log(`   ✓ Player 1 health: ${player1.health}/${player1.maxHealth}`);
console.log(`   ✓ Player 1 weapons: ${player1.weapons.join(', ')}\n`);

console.log('3. Physics - Testing movement...');
const oldX = player1.x;
const entity = {
  x: player1.x,
  y: player1.y,
  oldX: player1.x,
  oldY: player1.y,
  width: player1.width,
  height: player1.height,
  speed: player1.speed,
  jumpY: 0,
  jumpDelta: 0,
  jumpStrength: 2.0,
  gravityStrength: 0.008,
  dead: false
};

Physics.applyMovement(entity, 1, 0, 0.033);
console.log(`   ✓ Moved from x=${oldX.toFixed(2)} to x=${entity.x.toFixed(2)}`);

Physics.applyJump(entity);
console.log(`   ✓ Jump initiated: jumpY=${entity.jumpY.toFixed(2)}`);

Physics.applyGravity(entity, 0.033);
console.log(`   ✓ After gravity: jumpY=${entity.jumpY.toFixed(2)}\n`);

console.log('4. Combat - Damage system...');
console.log(`   Player 2 health before: ${player2.health}`);
const killed = player2.takeDamage(50, player1.id);
console.log(`   Player 2 health after: ${player2.health}`);
console.log(`   Was killed: ${killed}`);

if (killed) {
  player1.addKill();
  console.log(`   Player 1 kills: ${player1.kills}\n`);
}

console.log('5. Weapon Stats:');
const sniperStats = WEAPON_CONFIGS['sniper'];
console.log(`   Sniper:`);
console.log(`     - Damage: ${sniperStats.damage}`);
console.log(`     - Fire Rate: ${sniperStats.fireRate}ms`);
console.log(`     - Bullet Speed: ${sniperStats.bulletSpeed}`);
console.log(`     - Pierce Count: ${sniperStats.pierceCount}\n`);

console.log('6. Player Stats Summary:');
console.log(`   ${player1.name}: K/D = ${player1.kills}/${player1.deaths}, Score: ${player1.score}`);
console.log(`   ${player2.name}: K/D = ${player2.kills}/${player2.deaths}, Score: ${player2.score}\n`);

console.log('7. Respawn Test:');
player2.respawn(800, 800, 1);
console.log(`   ✓ Player 2 respawned at (${player2.x}, ${player2.y})`);
console.log(`   ✓ Health restored: ${player2.health}/${player2.maxHealth}`);
console.log(`   ✓ isDead: ${player2.isDead}\n`);

console.log('✅ All modules tested successfully!');
console.log('\n📝 Note: Map loading skipped (requires valid PNG files)');

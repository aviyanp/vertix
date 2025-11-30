export interface WeaponStats {
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  spread: number[];
  ammo: number;
  reloadTime: number;
  pierceCount: number;
  projectileType: 'bullet' | 'flame' | 'grenade' | 'rocket';
  explodeOnDeath: boolean;
}

export const WEAPON_CONFIGS: Record<string, WeaponStats> = {
  smg: {
    name: 'Machine Gun',
    damage: 15,
    fireRate: 100,
    bulletSpeed: 1.5,
    spread: [0, 0.05, -0.05],
    ammo: 30,
    reloadTime: 1500,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  revolver: {
    name: 'Desert Eagle',
    damage: 50,
    fireRate: 400,
    bulletSpeed: 2.0,
    spread: [0],
    ammo: 7,
    reloadTime: 2000,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  sniper: {
    name: 'Sniper',
    damage: 100,
    fireRate: 1200,
    bulletSpeed: 3.0,
    spread: [0],
    ammo: 5,
    reloadTime: 3000,
    pierceCount: 3,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  toygun: {
    name: 'Toy Blaster',
    damage: 5,
    fireRate: 50,
    bulletSpeed: 1.2,
    spread: [0, 0.1, -0.1, 0.15, -0.15],
    ammo: 100,
    reloadTime: 1000,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  shotgun: {
    name: 'Shotgun',
    damage: 20,
    fireRate: 800,
    bulletSpeed: 1.3,
    spread: [0, 0.1, -0.1, 0.2, -0.2, 0.3, -0.3],
    ammo: 8,
    reloadTime: 2500,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  grenades: {
    name: 'Grenade Launcher',
    damage: 80,
    fireRate: 600,
    bulletSpeed: 1.0,
    spread: [0],
    ammo: 6,
    reloadTime: 2000,
    pierceCount: 0,
    projectileType: 'grenade',
    explodeOnDeath: true
  },

  rockets: {
    name: 'Rocket Launcher',
    damage: 120,
    fireRate: 1000,
    bulletSpeed: 0.8,
    spread: [0],
    ammo: 4,
    reloadTime: 3000,
    pierceCount: 0,
    projectileType: 'rocket',
    explodeOnDeath: true
  },

  pistol: {
    name: 'Machine Pistol',
    damage: 12,
    fireRate: 80,
    bulletSpeed: 1.6,
    spread: [0, 0.08, -0.08],
    ammo: 20,
    reloadTime: 1200,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  minigun: {
    name: 'Minigun',
    damage: 10,
    fireRate: 60,
    bulletSpeed: 1.4,
    spread: [0, 0.15, -0.15, 0.1, -0.1],
    ammo: 200,
    reloadTime: 4000,
    pierceCount: 1,
    projectileType: 'bullet',
    explodeOnDeath: false
  },

  flamethrower: {
    name: 'Flamethrower',
    damage: 8,
    fireRate: 40,
    bulletSpeed: 0.6,
    spread: [0, 0.2, -0.2, 0.3, -0.3],
    ammo: 100,
    reloadTime: 2500,
    pierceCount: 2,
    projectileType: 'flame',
    explodeOnDeath: false
  }
};

export const CHARACTER_CLASSES = [
  {
    classN: 'Triggerman',
    weaponIndexes: [0, 5],
    pWeapon: 'Machine Gun',
    sWeapon: 'Grenade Launcher',
    weaponKeys: ['smg', 'grenades']
  },
  {
    classN: 'Detective',
    weaponIndexes: [1, 5],
    pWeapon: 'Desert Eagle',
    sWeapon: 'Grenade Launcher',
    weaponKeys: ['revolver', 'grenades']
  },
  {
    classN: 'Hunter',
    weaponIndexes: [2, 7],
    pWeapon: 'Sniper',
    sWeapon: 'Machine Pistol',
    weaponKeys: ['sniper', 'pistol']
  },
  {
    classN: "Run 'N Gun",
    weaponIndexes: [3],
    pWeapon: 'Toy Blaster',
    sWeapon: 'None',
    weaponKeys: ['toygun']
  },
  {
    classN: 'Vince',
    weaponIndexes: [4, 5],
    pWeapon: 'Shotgun',
    sWeapon: 'Grenade Launcher',
    weaponKeys: ['shotgun', 'grenades']
  },
  {
    classN: 'Rocketeer',
    weaponIndexes: [6],
    pWeapon: 'Rocket Launcher',
    sWeapon: 'None',
    weaponKeys: ['rockets']
  },
  {
    classN: "Spray N' Pray",
    weaponIndexes: [8],
    pWeapon: 'Minigun',
    sWeapon: 'None',
    weaponKeys: ['minigun']
  },
  {
    classN: 'Arsonist',
    weaponIndexes: [9],
    pWeapon: 'Flamethrower',
    sWeapon: 'None',
    weaponKeys: ['flamethrower']
  }
];

export function getWeaponStats(weaponKey: string): WeaponStats | null {
  return WEAPON_CONFIGS[weaponKey] || null;
}

export function getClassWeapons(classIndex: number): string[] {
  if (classIndex >= 0 && classIndex < CHARACTER_CLASSES.length) {
    return CHARACTER_CLASSES[classIndex].weaponKeys;
  }
  return [];
}

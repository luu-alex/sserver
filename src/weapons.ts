import { Weapon } from './types';

export const sword = {
  level: 1,
  stats: {
    attack: 7
  },
  name: 'sword',
  rarity: 'uncommon'
} as Weapon;

export const spear = {
    level: 1,
    stats: {
      attack: 5,
      defense: 5,
    },
    name: 'spear',
    rarity: 'common'
  } as Weapon;

export const dagger = {
    level: 1,
    stats: {
      attack: 10,
      defense: 2,
    },
    name: 'dagger',
    rarity: 'rare'
  } as Weapon;

  const weapons = [dagger, spear, sword]
  export const getRandomWeapon = () => {
    const randomIndex = Math.floor(Math.random() * weapons.length);
    return weapons[randomIndex]
    
  } 
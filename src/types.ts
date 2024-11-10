export type ProfileData =  {
    coins: number;
    level: number;
    gems: number;
    orderNumber: number;
    username: string;
    characters: {
        knight: {
            unlocked: boolean;
            level: number;
            stats: {
                attack: number;
                defense: number;
                attackSpeed: number;
                hp: number;
            };
        };
        druid: {
            unlocked: boolean;
            level: number;
            stats: {
                attack: number;
                defense: number;
                attackSpeed: number;
                hp: number;
            };
        };
        swordsmaster: {
            unlocked: boolean;
            level: number;
            stats: {
                attack: number;
                defense: number;
                attackSpeed: number;
                hp: number;
            };
        };
    };
    weapons: weaponInventory;
    currentWeapon: number;
    currentCharacter: string;
    inventory: NormalInventory;
    shop: Shop;
}

export type InventoryItem = {
    name: string;
    id: number;
    type: ItemType;
    rarity: string;
}
export type NormalInventory = InventoryItem[];
type weaponInventory = Weapon[];

export const defaultProfileData: ProfileData = {
    coins: 0,
    level: 1,
    gems: 100,
    orderNumber: 0,
    characters: {
      knight: {
        unlocked: true,
        level: 1,
        stats: {
          attack: 5,
          defense: 5,
          attackSpeed: 5,
          hp: 120,
        }
      },
      druid: {
        unlocked: false,
        level: 1,
        stats: {
          attack: 5,
          defense: 2,
          attackSpeed: 7,
          hp: 100,
        }
      },
      swordsmaster: {
        unlocked: false,
        level: 1,
        stats: {
          attack: 5,
          defense: 3,
          attackSpeed: 10,
          hp: 130,
        }
      }
    },
    weapons: [{
        level: 1,
        stats: {
          attack: 5,
          defense: 5,
        },
        name: 'spear',
        rarity: 'common'
      }
    ],
    currentWeapon: 0,
    currentCharacter: 'knight',
    username: 'default',
    inventory: [],
    shop: {
        date: "2021-09-01",
        items: []
    }
};

export type ShopData = {
    type: ItemType,
    item: ShopItem
}

export type ShopItem = {
    title: string,
    currency: string,
    cost: number,
    bought: boolean,
    index:number,
    itemType: ItemType,
    rarity: string,
}

export type ItemType = "weapon" | "character" | "item";

export type Shop = {
    date: string;
    items: ShopItem[];
};

export type Weapon = {
    level: number;
    stats: {
        attack: number;
        defense: number;
    };
    name: string;
    rarity: string;
}
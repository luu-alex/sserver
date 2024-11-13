require('dotenv').config()
import cors from 'cors';
import express from 'express';
import { connect, fetchOrCreateProfile, findProfileByUsername, getCollection, updateProfile } from './mongodb';
import { sendOrder, fetchAeonOrder } from './aeon';
import { generateDailyShop, generateStaticDailyShop, levelToGold } from './utils';
import { ItemType, ProfileData, InventoryItem } from './types';
import { dagger, getRandomWeapon, spear } from './weapons';
import { basicChest } from './items';


const app = express();
const PORT = process.env.PORT || 5001;
// Middleware
app.use(cors({
  origin: 'https://shinyknights.netlify.app/',
}));
app.use(express.json());
connect();

// Example route
app.get('/api/data', async (req, res) => {
    const result = await getCollection('test');
    res.send(result);
});

app.post('/api/profile', async (req, res) => {
  try {
      const { username } = req.body; // Get username from the request body
      console.log("accessing profile", username)
      if (!username) {
          res.status(400).send({ error: 'Username is required' });
          return;
      }

      // Default profile data for new users
      const defaultProfileData = {
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
          }],
          currentWeapon: 0,
          currentCharacter: 'knight',
          inventoryIndex: 1,
          weaponIndex: 1,
          inventory: [],
      };

      // Fetch or create the profile
      const profile = await fetchOrCreateProfile(username, defaultProfileData);

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      if (profile.shop.date !== today) {
        const shop = generateStaticDailyShop();
        profile.shop = shop;
        updateProfile(username, {shop: profile.shop})
      }


      // debug
    //   profile.weapons = [{
    //     level: 1,
    //     stats: {
    //       attack: 5,
    //       defense: 5,
    //     },
    //     name: 'spear',
    //     rarity: 'common'
    // }],
      // profile.gold = 1000;
      // profile.shop.date = new Date().toISOString().split('T')[0];
      // updateProfile(username, profile);
      res.send(profile); // Return the profile (either fetched or newly created)
  } catch (error) {
      console.error('Error fetching/creating profile:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
  return;
});

app.post('/api/dailyShop', async (req, res) => {
  try {
    const { username } = req.body; // Get username and properties from the request body
    console.log("getting username")
    const profile = await findProfileByUsername(username);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const shopItems = generateDailyShop();
    const updatedProfile = updateProfile(username, {shop: {date: today, items: shopItems}});

    
    res.send(updatedProfile);

  } catch (error) {
    console.error('Error fetching daily shop:', error);
    res.status(500).send({ error: 'Internal server error' });
  }

});

app.post('/api/updateProfile', async (req, res) => {

  try {
      const { username, updatedProfile } = req.body; // Get username and properties from the request body
      if (!username || !updatedProfile) {
          res.status(400).send({ error: 'Username and updated properties are required' });
          return;
      }
      if (updatedProfile._id) {
        delete updatedProfile._id;
    }

      const response = await updateProfile(username, updatedProfile);
      if (!response) {
          res.status(400).send({ error: 'Error updating profile' });
          return
      }
      res.status(200).json(updatedProfile); // Send the update response
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/api/upgradeCharacter', async (req, res) => {
  try {
      const { username, characterID } = req.body; // Get username and properties from the request body
      console.log("updating character", username, characterID)
      if (!username || !characterID) {
          res.status(400).send({ error: 'Username and updated properties are required' });
          return;
      }
      const profile = await findProfileByUsername(username);
      if (!profile) {
          res.status(400).send({ error: 'Profile not found' });
          return;
      }
      // if (profile.gold < levelToGold(profile.characters[characterID].level)) {
      //   res.status(400).send({ error: 'Not enough gold' });
      //   return;
      // }
      // const gold = profile.gold - levelToGold(profile.characters[characterID].level);
      const characters = profile.characters;
      characters[characterID].level = characters[characterID].level + 1;
      if (characterID === 'knight') {
        const stats = {
          attack: characters[characterID].stats.attack + 2,
          defense: characters[characterID].stats.defense + 2,
          attackSpeed: characters[characterID].stats.attackSpeed + 2,
          hp: characters[characterID].stats.hp + 5
        }
        console.log(stats)
        characters[characterID].stats = stats;
      }
      console.log("after characters", characters)

      const response = await updateProfile(username, {characters});
      if (!response) {
        console.log("error response profile")
          res.status(400).send({ error: 'Error updating profile' });
          return
      }
      res.status(200).json(response); // Send the update response
  } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/api/upgradeWeapon', async (req, res) => {
  try {
      const { username, weaponID } = req.body; // Get username and properties from the request body
      console.log("updating weapon", username, weaponID)
      if (!username || !weaponID && weaponID !== 0) {
          res.status(400).send({ error: 'Username and updated properties are required' });
          return;
      }
      const profile = await findProfileByUsername(username);
      if (!profile) {
          res.status(400).send({ error: 'Profile not found' });
          return;
      }
      if (profile.gold < levelToGold(profile.weapons[weaponID].level)) {
        res.status(400).send({ error: 'Not enough gold' });
        return;
      }
      const gold = profile.gold - levelToGold(profile.weapons[weaponID].level);
      const weapons = profile.weapons;
      weapons[weaponID].level = weapons[weaponID].level + 1;
      if (weapons[weaponID].name === 'spear') {
        weapons[weaponID].stats.attack = weapons[weaponID].stats.attack + 2;
        weapons[weaponID].stats.defense = weapons[weaponID].stats.defense + 2;
      }
      console.log("after weapons", weapons)

      const response = await updateProfile(username, {weapons, gold});
      if (!response) {
        console.log("error response profile")
          res.status(400).send({ error: 'Error updating profile' });
          return
      }
      res.status(200).json(response); // Send the update response
  } catch (error) {
      console.error('Error updating weapon:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/api/unlockChest', async (req, res) => {
  try {
    const { username, itemID } = req.body;
    const profile = await findProfileByUsername(username);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    if (profile.gems < 100) {
      res.status(400).send({ error: 'Not enough gems' });
      return;
    }
    const gems = profile.gems - 100;
    const inventory = profile.inventory;
    // remove chest from inventory
    console.log(inventory);
    const index = inventory.findIndex((item: InventoryItem) => item.id == itemID);
    console.log("index",index)
    if (index !== -1) {
      inventory.splice(index, 1);
    } else {
      res.status(400).send({ error: 'Item not found' });
      return;
    }
    inventory.push(basicChest);
    const random = getRandomWeapon()
    profile.weapons.push(
      random
    );
    const response = await updateProfile(username, {inventory, gems, weapons: profile.weapons});
    if (!response) {
      res.status(400).send({ error: 'Error updating profile' });
      return;
    }
    res.status(200).json({unlocked: random});
  } catch (error) {
    console.error('Error unlocking chest:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
})

app.post('/api/gameResults', async (req, res) => {
  try {
    const { username, wave} = req.body;
    const profile = await findProfileByUsername(username);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    const extraGold = wave*100;
    const response = await updateProfile(username, {gold: profile.gold + extraGold});
    res.status(200).json(response);
    return;
  } catch (error) {
    res.status(400).send(error)

  }
})

app.post('/api/buyItem', async (req, res) => {
  try {
    console.log("buying item")
    const { username, itemIndex } = req.body;
    const profile = await findProfileByUsername(username);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    const item = profile.shop.items[itemIndex];
    if (profile.shop.items[itemIndex].bought) {
      res.status(400).send({ error: 'Item already bought' });
      return;
    }

    profile.shop.items[itemIndex].bought = true;
    const currency = item.currency;
    console.log("currency",currency)
    if (item.cost < profile[currency]) {
      const remainder = profile[currency] - item.cost;
      profile[currency] = remainder;
      console.log("entering here", item)
      if (item.itemType === "weapon") {
        if (item.title === "Spear") {
          profile.weapons.push(
            spear
          );
        } else if (item.title === "Dagger") {
          profile.weapons.push(
            dagger
          )
        }
      } else if (item.itemType === "item") {
        if (item.title === "chest") {
          profile.inventory.push(basicChest);
        }
      }
      let s;
      if (currency === 'gold') {
        s = await updateProfile(username, {gold: remainder, weapons: profile.weapons, shop: profile.shop, inventory: profile.inventory});
        
      } else if ( currency === 'gem') {
        s = await updateProfile(username, {gems: remainder, weapons: profile.weapons, shop: profile.shop, inventory: profile.inventory});
      }
      res.status(200).json(profile);
      return
    }
  } catch (error) {
    console.error('Error buying item:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
  res.status(400).send({ error: 'Not enough currency' });

});

app.post('/api/equipWeapon', async (req, res) => {
  try {
    const { username, index } = req.body;
    console.log("equipping weapon", username, index)
    const profile = await findProfileByUsername(username);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    if (index >= profile.weapons.length) {
      res.status(400).send({ error: 'Invalid weapon index' });
      return;
    }
    const response = await updateProfile(username, {currentWeapon: index});
    if (!response) {
      res.status(400).send({ error: 'Error updating profile' });
      return;
    }
    res.send(response);
  } catch (error) {
    console.error('Error equipping weapon:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
app.post('/api/aeonOrder', async (req, res) => {
  try {
    const { userID, amount } = req.body;
    console.log("creating aeon order")

    const profile = await findProfileByUsername(userID);
    if (!profile) {
      res.status(400).send({ error: 'Profile not found' });
      return;
    }
    const aeonOrderResponse = await fetchAeonOrder({merchantOrderNo: profile.orderNumber  });   
    console.log("aeon order response", aeonOrderResponse)
    if (aeonOrderResponse && aeonOrderResponse.model && (aeonOrderResponse.model.orderStatus === 'PROCESSING' || aeonOrderResponse.model.orderStatus === 'INIT' || aeonOrderResponse.model.orderStatus === 'COMPLETED')) {
      console.log("aeon Order Response", aeonOrderResponse?.model)
      res.send({...aeonOrderResponse, merchantURL: profile.merchantURL});
      return;
    }


    const response = await sendOrder(profile.orderNumber + 1, userID);
    if (!response) {
      res.status(400).send({ error: 'Invalid response from Aeon' });
      return;
    }
    console.log("sending order", response)

    // need to create a new order number, so increment and update profile
    const updatedProfileResponse = updateProfile(userID, {orderNumber: profile.orderNumber + 1, merchantURL: response.model.webUrl, amount});
    if (!updatedProfileResponse) {
      res.status(400).send({ error: 'Error updating profile after order number' });
      return;
    }
    
    if (response.msg === 'success') {
      res.send(response);
    } else {
      res.status(400).send(response);
    }
  } catch (error) {
    console.error('Error creating Aeon order:', error);
    res.status(500).send({ error: 'Internal server error' });
  }

});

// get order status
app.post('/api/aeonOrderStatus', async (req, res) => {
  console.log("aeon order status")
  try {
    const { userID } = req.body;

    const profile = await findProfileByUsername(userID);
      if (!profile) {
        res.status(400).send({ error: 'Profile not found' });
        return;
      }
    // const response = await fetchAeonOrder({merchantOrderNo: "12"});
    const response = await fetchAeonOrder({merchantOrderNo: profile.orderNumber});
    if (!response) {
      res.status(400).send({ error: 'Invalid response from Aeon' });
      return;
    }
    console.log("aeon order status response", response)
    if (response.msg === 'success') {
      if (response.model.orderStatus === 'COMPLETED') {
        
        const updatedProfileResponse = await updateProfile(userID, {orderNumber: profile.orderNumber + 1, merchantURL: "", gems: 1000 + profile.gems});
        if (!updatedProfileResponse) {
          res.status(400).send({ error: 'Error updating profile after order number' });
          return;
      }
      console.log("updated profile", updatedProfileResponse)
      res.send(response);
      return;
    }  else {
      res.send(response);
      }
  } 
  } catch (error) {
    console.error('Error fetching Aeon order:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
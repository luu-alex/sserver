require('dotenv').config();
import * as crypto from 'crypto';
import { ItemType, ProfileData, Shop, ShopItem } from './types';
const appID = process.env.APP_ID;
const secretKey = process.env.SECRET_KEY;
const merchantID = process.env.MERCHANT_ID;
const testUserID = "testemail@qq.com";
if (!appID || !secretKey || !merchantID) {
    console.log("error")
}
export const createOrder = (orderAmount: number = 1) => {
    const jsonData = {
        "appId": appID,
        "merchantOrderNo": merchantID,
        "orderAmount": orderAmount,
        "payCurrency": "USD",
        "paymentToken": "USDT",
        "paymentExchange": "16f021b0-f220-4bbb-aa3b-82d423301957",
        "userId": testUserID
    }
    
    const payCurrency = 'USD';
    const paymentExchange = "16f021b0-f220-4bbb-aa3b-82d423301957";
    const paymentTokens = "USDT";

    const prepareSigning = "appId=" + appID + "&merchantOrderNo=" + merchantID + "&orderAmount=" + orderAmount + "&payCurrency=" + payCurrency + "&paymentExchange=" + paymentExchange + "&paymentTokens=" + paymentTokens + "&userId=" + testUserID + "&key=" + secretKey;

    
    // perform SHA-512
    const signature = hashWithSHA512(prepareSigning).toUpperCase();
    console.log(signature)


}

function hashWithSHA512(data: string): string {

    return crypto.createHash('sha512').update(data).digest('hex');
};



export function levelToGold(level: number): number {
    return Math.pow(level, 2);
}

export const generateRandomItem = ( type: ItemType, index: number): ShopItem => {
    switch (type) {
        case "weapon":
            return {
                title: "Spear",
                currency: "gold",
                cost: 100,
                bought: false,
                index: index,
                itemType: "weapon",
                rarity: "common",
            }
        case "character":
            return {
                title: "swordsmaster",
                currency: "gems",
                cost: 100,
                bought: false,
                index: index,
                itemType: "character",
                rarity: "epic",
            }
        case "item":
            return {
                title: "chest",
                currency: "gold",
                cost: 100,
                bought: false,
                index: index,
                itemType: "item",
                rarity: "common",
            }
    }

}

export const generateDailyShop = (): Shop => {
    const items: ShopItem[] = [];
    const types: ItemType[] = ["weapon", "character", "item"];
    const numberOfItemsPerType = 1; // Adjust as needed
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if the shop is already generated for today
    // if (userProfile.shop.date === today) {
    //     return userProfile.shop;
    // }

    let index = 0;
    types.forEach((type) => {
        for (let i = 0; i < numberOfItemsPerType; i++) {
            items.push(generateRandomItem(type, index));
            index++;
        }
    });

    return {
        date: today,
        items
    };
};

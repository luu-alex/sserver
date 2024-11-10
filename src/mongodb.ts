import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client: MongoClient;

export const connect = async () => {
    if (!uri) {
        throw new Error('Mongo URI not defined');
    }
    client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // console.log("inserted")

}

export const getCollection = async (collectionName: string) => {
    return await client.db('test').collection(collectionName).find().toArray();
};

export const findProfileByUsername = async (username: string) => {
    console.log('Finding profile:', username);
    return await client.db('test').collection('profiles').findOne({ username });
};

// Function to create a new profile
export const createProfile = async (profile: any) => {
    return await client.db('test').collection('profiles').insertOne(profile);
};

// Function to either fetch or create a profile based on username
export const fetchOrCreateProfile = async (username: string, defaultProfileData: any) => {
    const existingProfile = await findProfileByUsername(username);
    if (existingProfile) {
        return existingProfile; // Return the existing profile
    } else {
        const newProfile = { username, ...defaultProfileData };
        await createProfile(newProfile);
        return newProfile; // Return the newly created profile
    }
};
export const updateProfile = async (username: string, updatedProperties: any) => {
    console.log('Updating profile:', username, updatedProperties);
    const result = await client.db('test').collection('profiles').updateOne(
        { username }, // Find the profile by username
        { $set: updatedProperties } // Update the profile with the provided properties
    );

    if (result.matchedCount > 0) {
        return { success: true, message: 'Profile updated successfully' };
    } else {
        return { success: false, message: 'Profile not found' };
    }
};
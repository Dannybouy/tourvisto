import { Account, Client, Databases, Storage } from "appwrite";

export const appwriteConfig = {
  endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
  projectID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
  databaseID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  userCollectionID: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  tripsCollectionID: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectID);

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { account, client, database, storage };

import { ID, OAuthProvider, Query } from "appwrite";
import { redirect } from "react-router";
import { account, appwriteConfig, database } from "./client";

const { databaseID, userCollectionID, tripsCollectionID } = appwriteConfig;

export const loginWithGoogle = async () => {
  try {
    account.createOAuth2Session(OAuthProvider.Google);
  } catch (error) {
    console.log("loginWithGoogle", error);
  }
};

export const getUser = async () => {
  try {
    const user = await account.get();

    if (!user) return redirect("/sign-in");

    const { documents } = await database.listDocuments(
      databaseID,
      userCollectionID,
      [
        Query.equal("accountId", user.$id),
        Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
      ]
    );
  } catch (error) {
    console.log(error);
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log("logoutUser error: ", error);
    return false;
  }
};

export const getGooglePicture = async () => {
  try {
    // Get the current user session
    const session = await account.getSession("current");

    // Get the OAuth2 token from the session
    const oAuthToken = session.providerAccessToken;

    if (!oAuthToken) {
      console.log("No OAuth token available");
      return null;
    }

    // Make a request to the Google People API to get the profile photo
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      {
        headers: {
          Authorization: `Bearer ${oAuthToken}`,
        },
      }
    );

    if (!response.ok) {
      console.log("Failed to fetch profile photo from Google People API");
      return null;
    }

    const data = await response.json();

    // Extract the profile photo URL from the response
    const photoUrl =
      data.photo && data.photo.length > 0 ? data.photos[0].url : null;

    return photoUrl;
  } catch (error) {
    console.log("getGooglePicture error: ", error);
    return null;
  }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();

    if (!user) return null;

    //Check if the user already exist in the db
    const { documents } = await database.listDocuments(
      databaseID,
      userCollectionID,
      [Query.equal("accountId", user.$id)]
    );

    if (documents.length > 0) return documents[0];

    //Get profile photo from google
    const imageUrl = await getGooglePicture();

    // Create new user document
    const newUser = await database.createDocument(
      databaseID,
      userCollectionID,
      ID.unique(),
      {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: imageUrl || "",
        joinedAt: new Date().toISOString(),
      }
    );

    return newUser;
  } catch (error) {
    console.log("storeUserData error: ", error);
    return null;
  }
};

export const getExistingUser = async () => {
  try {
    const user = await account.get();

    if (!user) return null;

    //Check if the user already exist in the db
    const { documents } = await database.listDocuments(
      databaseID,
      userCollectionID,
      [Query.equal("accountId", user.$id)]
    );

    if (documents.length === 0) return null;

    return documents[0];
  } catch (error) {
    console.log("getExistingUser error: ", error);
  }
};

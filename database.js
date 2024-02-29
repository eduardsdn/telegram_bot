import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const mongodbKey = process.env.MONGODB_KEY;

const client = new MongoClient(mongodbKey);

// Connnect to database and catch errors
try {
  await client.connect();
} catch (e) {
  console.log(e);
}

// Create new user record
async function createUser(newUser) {
  const result = await client
    .db("test_galleryGenius")
    .collection("Users")
    .insertOne(newUser);
  console.log(result.insertedId);
}

// Find a user
async function findUser(userID) {
  return client
    .db("test_galleryGenius")
    .collection("Users")
    .findOne({ _id: userID });
}

// Update user record
async function updateUser(userID, updatedState) {
  await client
    .db("test_galleryGenius")
    .collection("Users")
    .updateOne({ _id: userID }, { $set: updatedState });
}

export { createUser, findUser, updateUser };

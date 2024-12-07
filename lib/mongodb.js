// // lib/mongodb.js
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     "Please define the MONGODB_URI environment variable inside .env.local"
//   );
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose
//       .connect(MONGODB_URI, opts)
//       .then((mongoose) => {
//         console.log("MongoDB connected successfully!"); // Log on successful connection
//         return mongoose;
//       })
//       .catch((err) => {
//         console.error("MongoDB connection error:", err);
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default dbConnect;

import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://client_manage:IRZ4H0Rgv3m0A8U6@cluster0.zepjg.mongodb.net/database?retryWrites=true&w=majority";

let client;
let clientPromise;

// Function to log connection status
async function connectToMongoDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    client = new MongoClient(uri);
    const connection = await client.connect();
    console.log("Connected successfully to MongoDB");
    return connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error; // Re-throw the error to handle it properly downstream
  }
}

// Set up the global promise
if (!global._mongoClientPromise) {
  global._mongoClientPromise = connectToMongoDB();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;

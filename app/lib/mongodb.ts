// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

// Get the MongoDB URI from environment variables
const uri: string = process.env.MONGODB_URI!;

// Extract the database name from the URI.
// Example: "mongodb+srv://user:pass@cluster.mongodb.net/mydatabase?..."
// The pathname will be "/mydatabase", substring(1) removes the leading '/'.
const dbName: string = new URL(uri).pathname.substring(1);

// Cached connection variables
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Check if MONGODB_URI is defined
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Connects to the MongoDB database, reusing a cached connection if available.
 * @returns An object containing the MongoClient instance and the Db instance.
 */
export async function connectToDatabase() {
  // If a connection is already cached, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If no cached connection, create a new one
  const client = await MongoClient.connect(uri);

  // Get the database instance
  const db = client.db(dbName);

  // Cache the new connection for future use
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
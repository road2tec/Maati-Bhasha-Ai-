import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('Please add your MongoDB URI to .env file');
}

console.log('MongoDB URI found:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('MongoDB DB Name:', process.env.MONGODB_DB_NAME || 'marathi_translator');

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across module reloads
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB client for development');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  } else {
    console.log('Reusing existing MongoDB client for development');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each request
  console.log('Creating new MongoDB client for production');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    console.log('Getting database connection...');
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'marathi_translator';
    console.log('Connected to database:', dbName);
    return client.db(dbName);
  } catch (error: any) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

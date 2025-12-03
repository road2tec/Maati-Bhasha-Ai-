import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');

  const user: User = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(user);
  return result.insertedId.toString();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');
  return usersCollection.findOne({ email });
}

export async function getUserById(userId: string): Promise<UserPublic | null> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
  if (!user) return null;

  return {
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getAllUsers(): Promise<UserPublic[]> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');
  const users = await usersCollection.find({}).toArray();
  
  return users.map(user => ({
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export async function updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<boolean> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');
  
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $set: { 
        isBlocked,
        updatedAt: new Date()
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = await getDatabase();
  const usersCollection = db.collection<User>('users');
  
  const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
  return result.deletedCount > 0;
}

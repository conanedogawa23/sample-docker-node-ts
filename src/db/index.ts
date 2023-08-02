import mongoose from 'mongoose';
import winston from 'winston';

class Database {
  private static instance: Database;
  private isConnected: boolean;

  private constructor() {
    this.isConnected = false;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const maxRetries = 5;
    let retryCount = 0;

    while (!this.isConnected && retryCount < maxRetries) {
      try {
        await mongoose.connect(process.env.MONGODB_URI!, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        this.isConnected = true;
        console.log('Connected to MongoDB successfully.');
      } catch (error) {
        retryCount++;
        console.error('Error connecting to MongoDB:', error.message);
        console.log(`Retrying connection... (Attempt ${retryCount})`);
        await new Promise<void>((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
      }
    }

    if (!this.isConnected) {
      console.error('Failed to connect to MongoDB after multiple attempts.');
      process.exit(1); // Exit the application on connection failure
    }
  }
}

export default Database;

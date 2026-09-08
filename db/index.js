import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv";

dotenv.config({
   path: "./.env"
   });

async function connectDB () {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("MongoDB connected successfully 🥳 :", connectionInstance.connection.host);
  }catch(error){
    console.error("Error connecting to the database:", error.message);
    throw error;
  }
};

export default connectDB;

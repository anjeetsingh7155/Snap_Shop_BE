import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async (): Promise<void> => {
  const { DB_URL } = process.env;
  if (!DB_URL) {
    throw new Error("DB_URL is not defined in .env");
  }
  await mongoose.connect(DB_URL);
  console.log("dataBase is Connected");
};

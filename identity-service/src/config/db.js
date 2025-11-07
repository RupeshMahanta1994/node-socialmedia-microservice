import mongoose from "mongoose";
import logger from "../utils/logger.js";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("Database connection Successful");
  } catch (error) {
    logger.error("Error in connecting DB", error);
  }
}

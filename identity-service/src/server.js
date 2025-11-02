import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import connectDB from "./config/db.js";
dotenv.config();
const app = express();
connectDB();
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info("Application running on port:", PORT);
});

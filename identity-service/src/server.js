import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
dotenv.config();
const app = express();
connectDB();

//middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3002;

//router
app.use("/api/user", userRouter);
app.listen(PORT, () => {
  logger.info("Application running on port:", PORT);
  console.log("application running on port", PORT);
});

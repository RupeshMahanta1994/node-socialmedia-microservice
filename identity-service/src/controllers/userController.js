import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import { validateRegistration } from "../utils/validation.js";

export async function registerController(req, res) {
  logger.info("Registration end point hit...");
  try {
    //validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { username, email, password } = req.body;
    //check for existing user
    let user = await userModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    user = new userModel({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    logger.error("Error in Regiter controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

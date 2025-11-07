import RefreshTokenModel from "../models/RefreshTokenModel.js";
import UserModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import generateToken from "../utils/token.js";
import { validateLogin, validateRegistration } from "../utils/validation.js";

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
    let user = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    user = new UserModel({ username, email, password });
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

export async function loginController(req, res) {
  logger.info("Login endpoint hit...");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.error("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid Credentils, User doesn't exists",
      });
    }
    //Validate password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid credentials");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const { accessToken, refreshToken } = await generateToken(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Error in Login controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
//Refresh Token
export async function refreshTokenController(req, res) {
  logger.info("Refresh token endpoint hit...");
  const { refreshToken } = req.body;
  if (!refreshToken) {
    logger.warn("Refesh token Missing");
    return res.status(400).json({
      success: false,
      message: "Refresh token is missing",
    });
  }
  let storedToken = await RefreshTokenModel.findOne({ token: refreshToken });

  if (!storedToken) {
    logger.warn("Invalid refresh token provided");
    return res.status(400).json({
      success: false,
      message: "Invalid refresh token provided",
    });
  }
  if (!storedToken || storedToken.expiresAt < new Date()) {
    logger.warn("Invalid or expired refresh token provided");
    return res.status(400).json({
      success: false,
      message: "Invalid or expired refresh token provided",
    });
  }
  const user = await UserModel.findById(storedToken.user);
  if (!user) {
    logger.warn("User not found");
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateToken(user);
  //delete old refresh token
  await RefreshTokenModel.deleteOne({ _id: storedToken._id });
  res.status(200).json({
    success: true,
    message: "Token generated",
    token: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
}
//logout
export async function logoutController(req, res) {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }
    const storedToken = await RefreshTokenModel.findOneAndDelete({
      token: refreshToken,
    });
    if (!storedToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    logger.info("Refresh token deleted for logout");
    res.json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    logger.error("Error in Logout", error);
    res.status(500).json({
      success: false,
      message: "Internal server error(Logout)",
      error,
    });
  }
}

import express from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from "../controllers/userController.js";
const router = express.Router();

//register user
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);
export default router;

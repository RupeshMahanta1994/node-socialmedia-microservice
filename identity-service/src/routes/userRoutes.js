import express from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/userController.js";
const router = express.Router();

//register user
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
export default router;

import express from "express";

import {
  handleAdminLogin
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/login", handleAdminLogin);
//router.post("/register", handleAdminRegister);

export default router;

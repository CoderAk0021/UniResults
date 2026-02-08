import express from "express";

import {
  handleGetStudentResult,
  handleGetLeaderBoard,
} from "../controllers/public.controllers.js";

const router = express.Router();

router.get("/student-result/:regNo", handleGetStudentResult);
router.get("/leaderboard", handleGetLeaderBoard);

export default router;
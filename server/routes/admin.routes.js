import express from "express";

import {
  handleGetStudents,
  handleStudentDelete,
  handleResultUpdate,
  handleBulkUpload,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.get("/students", handleGetStudents);
router.delete("/student/:id", handleStudentDelete);
router.put("/update-result", handleResultUpdate);
router.post("/bulk-upload", handleBulkUpload);

export default router;

import Student from "../models/Student.js";

export async function handleGetStudentResult(req, res) {
  const student = await Student.findOne({
    registrationNumber: req.params.regNo,
  });
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
}

export async function handleGetLeaderBoard(req, res) {
  try {
    const topStudents = await Student.find({})
      .sort({ cgpa: -1 })
      .select("name branch cgpa registrationNumber");

    res.json(topStudents);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

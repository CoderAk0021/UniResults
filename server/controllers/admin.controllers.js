import Student from "../models/Student.js";
import calculateCGPA from '../utility/calculateCGPA.js';

export async function handleGetStudents(req, res) {
  try {
    const students = await Student.find({}).select(
      "registrationNumber name branch cgpa",
    );
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

export async function handleStudentDelete(req, res) {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
}

export async function handleResultUpdate(req, res) {
  try {
    const {
      registrationNumber,
      name,
      branch,
      semesterNumber,
      subjects,
      sgpa,
      remarks,
    } = req.body;

    if (!registrationNumber || !semesterNumber || !subjects) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let student = await Student.findOne({ registrationNumber });

    const newSemester = {
      semesterNumber: Number(semesterNumber),
      subjects,
      sgpa: Number(sgpa),
      remarks,
    };

    if (!student) {
      // CASE A: Student does not exist -> CREATE NEW
      // We need name and branch to create a new student
      if (!name || !branch) {
        return res
          .status(400)
          .json({ error: "New student requires Name and Branch" });
      }

      student = new Student({
        registrationNumber,
        name,
        branch,
        academicHistory: [newSemester],
        cgpa: Number(sgpa),
      });

      await student.save();
      return res
        .status(201)
        .json({ message: "New student created successfully", data: student });
    } else {
      // CASE B: Student exists -> UPDATE ACADEMIC HISTORY

      // Check if this semester already exists in their history
      const semIndex = student.academicHistory.findIndex(
        (s) => s.semesterNumber === Number(semesterNumber),
      );

      if (semIndex !== -1) {
        // Semester exists: Update/Overwrite it
        student.academicHistory[semIndex] = newSemester;
      } else {
        // Semester doesn't exist: Add it
        student.academicHistory.push(newSemester);
      }

      // Recalculate CGPA
      student.cgpa = calculateCGPA(student.academicHistory);

      // Optional: Update name/branch if provided, just in case of corrections
      if (name) student.name = name;
      if (branch) student.branch = branch;

      await student.save();
      return res.json({
        message: "Student record updated successfully",
        data: student,
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
}

export async function handleBulkUpload(req, res) {
  try {
    const studentsData = req.body;

    if (!Array.isArray(studentsData)) {
      return res
        .status(400)
        .json({ error: "Input must be an array of students" });
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const entry of studentsData) {
      const { registrationNumber, name, branch, academicHistory, cgpa } = entry;

      if (!registrationNumber || !name) continue; // Skip bad rows

      let student = await Student.findOne({ registrationNumber });

      if (!student) {
        // Create New
        await Student.create({
          registrationNumber,
          name,
          branch,
          academicHistory,
          cgpa: cgpa || 0,
        });
        createdCount++;
      } else {
        // Update Existing (Merge academic history)
        // We'll just add new semesters that don't exist
        academicHistory.forEach((newSem) => {
          const exists = student.academicHistory.find(
            (s) => s.semesterNumber === newSem.semesterNumber,
          );
          if (!exists) {
            student.academicHistory.push(newSem);
          } else {
            // Optional: Overwrite existing semester data
            const index = student.academicHistory.indexOf(exists);
            student.academicHistory[index] = newSem;
          }
        });

        // Recalculate CGPA
        const totalSgpa = student.academicHistory.reduce(
          (sum, s) => sum + s.sgpa,
          0,
        );
        student.cgpa = parseFloat(
          (totalSgpa / student.academicHistory.length).toFixed(2),
        );

        await student.save();
        updatedCount++;
      }
    }

    res.json({
      message: "Bulk upload successful",
      stats: { created: createdCount, updated: updatedCount },
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ error: "Bulk upload failed" });
  }
}

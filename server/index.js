import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Student from './models/studentSchema.js';
import Admin from './models/Admin.js';
import { protect } from './middleware/authMiddleware.js';
import './utility/connection.js';
import calculateCGPA from './utility/calculateCGPA.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: 'https://university-results.vercel.app', // Allow all origins (we will restrict this later for security)
    credentials: true
}));

// --- AUTH ROUTE: Login ---
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: admin.username });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// --- AUTH ROUTE: Setup First Admin (Run once via Postman) ---
app.post('/api/admin/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.create({ username, password });
        res.status(201).json({ message: "Admin created" });
    } catch (error) {
        console.error("❌ Registration Error:", error); // Print to terminal
        res.status(500).json({ error: error.message }); // Send to Postman
    }
});

// --- ADMIN: Get All Students (Dashboard) ---
app.get('/api/admin/students', protect, async (req, res) => {
    try {
        const students = await Student.find({}).select('registrationNumber name branch cgpa');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// --- ADMIN: Delete Student ---
app.delete('/api/admin/student/:id', protect, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Student removed" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- ADMIN: Update/Edit Student (Robust Update) ---
app.put('/api/admin/update-result', protect, async (req, res) => {
    try {
        const { 
            registrationNumber, 
            name, 
            branch, 
            semesterNumber, 
            subjects, 
            sgpa, 
            remarks 
        } = req.body;

        // Validation
        if (!registrationNumber || !semesterNumber || !subjects) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Try to find the student
        let student = await Student.findOne({ registrationNumber });

        // 2. Define the new semester object
        const newSemester = {
            semesterNumber: Number(semesterNumber),
            subjects,
            sgpa: Number(sgpa),
            remarks
        };

        if (!student) {
            // CASE A: Student does not exist -> CREATE NEW
            // We need name and branch to create a new student
            if (!name || !branch) {
                return res.status(400).json({ error: "New student requires Name and Branch" });
            }

            student = new Student({
                registrationNumber,
                name,
                branch,
                academicHistory: [newSemester],
                cgpa: Number(sgpa) // Initial CGPA is just the first SGPA
            });
            
            await student.save();
            return res.status(201).json({ message: "New student created successfully", data: student });

        } else {
            // CASE B: Student exists -> UPDATE ACADEMIC HISTORY
            
            // Check if this semester already exists in their history
            const semIndex = student.academicHistory.findIndex(s => s.semesterNumber === Number(semesterNumber));

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
            return res.json({ message: "Student record updated successfully", data: student });
        }

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Server Error: " + error.message });
    }
});

// --- PUBLIC: Get Student Result ---
app.get('/api/student-result/:regNo', async (req, res) => {
    const student = await Student.findOne({ registrationNumber: req.params.regNo });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Find all, Sort by CGPA (descending: -1), Limit to 10
        // Select only necessary fields to save bandwidth
        const topStudents = await Student.find({})
            .sort({ cgpa: -1 }).select('name branch cgpa registrationNumber');
        
        res.json(topStudents);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// --- ADMIN: Bulk Upload (JSON) ---
app.post('/api/admin/bulk-upload', protect, async (req, res) => {
    try {
        const studentsData = req.body; // Expecting an array of students

        if (!Array.isArray(studentsData)) {
            return res.status(400).json({ error: "Input must be an array of students" });
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const entry of studentsData) {
            const { registrationNumber, name, branch, academicHistory, cgpa } = entry;

            // Basic validation
            if (!registrationNumber || !name) continue; // Skip bad rows

            // Check if student exists
            let student = await Student.findOne({ registrationNumber });

            if (!student) {
                // Create New
                await Student.create({
                    registrationNumber,
                    name,
                    branch,
                    academicHistory,
                    cgpa: cgpa || 0
                });
                createdCount++;
            } else {
                // Update Existing (Merge academic history)
                // We'll just add new semesters that don't exist
                academicHistory.forEach(newSem => {
                    const exists = student.academicHistory.find(s => s.semesterNumber === newSem.semesterNumber);
                    if (!exists) {
                        student.academicHistory.push(newSem);
                    } else {
                        // Optional: Overwrite existing semester data
                        const index = student.academicHistory.indexOf(exists);
                        student.academicHistory[index] = newSem;
                    }
                });
                
                // Recalculate CGPA
                const totalSgpa = student.academicHistory.reduce((sum, s) => sum + s.sgpa, 0);
                student.cgpa = parseFloat((totalSgpa / student.academicHistory.length).toFixed(2));
                
                await student.save();
                updatedCount++;
            }
        }

        res.json({ 
            message: "Bulk upload successful", 
            stats: { created: createdCount, updated: updatedCount } 
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ error: "Bulk upload failed" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
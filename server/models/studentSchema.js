import mongoose from 'mongoose';

// 1. Define Sub-Schemas
const SubjectSchema = new mongoose.Schema({
    subjectCode: { type: String, required: true },
    marks: { type: Number, required: true },
    credits: { type: Number, required: true } 
}, { _id: false });

const SemesterSchema = new mongoose.Schema({
    semesterNumber: { type: Number, required: true },
    subjects: [SubjectSchema], 
    sgpa: { type: Number, required: true },
    remarks: { type: String, default: "Promoted" }
}, { _id: false });

// 2. Define Main Student Schema
const StudentSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
    academicHistory: [SemesterSchema],
    cgpa: { type: Number, default: 0 }
});

// 3. Create and Export the MODEL (Not the schema)
const Student = mongoose.model('Student', StudentSchema);
export default Student;
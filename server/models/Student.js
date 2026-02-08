import mongoose from 'mongoose';


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


const StudentSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
    academicHistory: [SemesterSchema],
    cgpa: { type: Number, default: 0 }
});


const Student = mongoose.model('Student', StudentSchema);

export default Student;
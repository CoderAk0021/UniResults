import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, LogOut, Users, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    // Check Auth
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/login');
        fetchStudents(token);
    }, []);

    const fetchStudents = async (token) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(data);
        } catch (error) {
            toast.error("Session expired");
            navigate('/login');
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/student/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.filter(s => s._id !== id));
            toast.success("Student deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    // Calculate Analytics
    const averageCGPA = students.length > 0 
        ? (students.reduce((acc, curr) => acc + curr.cgpa, 0) / students.length).toFixed(2) 
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-12">
            
            {/* Header & Stats */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage student records and performance</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-700">
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full"><Users size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Total Students</p>
                        <p className="text-2xl font-bold text-slate-800">{students.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-full"><TrendingUp size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Batch Avg CGPA</p>
                        <p className="text-2xl font-bold text-slate-800">{averageCGPA}</p>
                    </div>
                </div>
                <Link to="/admin/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
                    <Plus size={24} />
                    <span className="text-lg font-bold">Upload New Result</span>
                </Link>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Reg No</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Branch</th>
                            <th className="p-4">CGPA</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.map(student => (
                            <tr key={student._id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{student.registrationNumber}</td>
                                <td className="p-4 text-slate-600">{student.name}</td>
                                <td className="p-4 text-slate-500">{student.branch}</td>
                                <td className="p-4 font-bold text-indigo-600">{student.cgpa}</td>
                                <td className="p-4 flex justify-end gap-3">
                                    <button className="text-slate-400 hover:text-indigo-600 transition" 
                                            title="Edit feature coming in V2">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(student._id)} className="text-slate-400 hover:text-red-600 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && <p className="p-8 text-center text-slate-400">No students found.</p>}
            </div>
        </div>
    );
};
export default AdminDashboard;
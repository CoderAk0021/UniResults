import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            // If already logged in, go straight to dashboard
            navigate('/admin/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, creds);
            localStorage.setItem('adminToken', data.token); // Save Token
            toast.success("Welcome back, Admin!");
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-6">
                <h2 className="text-2xl font-bold text-center text-slate-800">Admin Login</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input type="text" placeholder="Username" className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
                            onChange={(e) => setCreds({...creds, username: e.target.value})} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input type="password" placeholder="Password" className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
                            onChange={(e) => setCreds({...creds, password: e.target.value})} />
                    </div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">Login</button>
            </form>
        </div>
    );
};
export default Login;
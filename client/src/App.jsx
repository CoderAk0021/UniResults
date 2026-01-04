import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import StudentView from './components/StudentView';
import AdminUpload from './components/AdminUpload';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import the guard

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StudentView />} />
        <Route path="/login" element={<Login />} />

        {/* --- PROTECTED ADMIN ROUTES --- */}
        {/* Any route inside this group requires a Token */}
        <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
            
            {/* Smart Redirect: If user visits "/admin", send to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

      </Routes>
      <ToastContainer position="bottom-right" theme="light" />
    </Router>
  );
}

export default App;
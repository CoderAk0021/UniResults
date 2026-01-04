import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, UploadCloud } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors">
        {isActive && (
          <motion.span 
            layoutId="nav-pill" 
            className="absolute inset-0 bg-indigo-100 text-indigo-700 rounded-full" 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}>
          <Icon size={18} />
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            U
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">UniResult</span>
        </div>
        
        <div className="flex items-center gap-1">
          <NavItem to="/" icon={GraduationCap} label="Student Portal" />
          <NavItem to="/admin" icon={UploadCloud} label="Admin Upload" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
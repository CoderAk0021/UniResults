import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-white text-center px-4">
      <h1 className="text-8xl font-extrabold text-indigo-500">404</h1>
      <h2 className="text-3xl font-bold mt-4 text-gray-600">Page Not Found</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>

      <div className="flex gap-4 mt-6">
        <Link
          to="/"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-semibold transition"
        >
          <Home size={18} /> Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 border border-slate-600 bg-slate-800 px-5 py-3 rounded-lg transition"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;

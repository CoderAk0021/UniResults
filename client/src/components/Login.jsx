import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, User, Loader2 } from "lucide-react";
import { useCookies } from "react-cookie";
import api from "../config/axiosConfig";

const Login = () => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [cookies, setCookie] = useCookies(["user_token"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // prevent flicker

  useEffect(() => {
    if (cookies.user_token) {
      navigate("/admin/dashboard", { replace: true });
    }
    setCheckingAuth(false);
  }, [cookies.user_token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!creds.username || !creds.password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", creds);
      console.log(res);
      const token = res.data?.token;
      if (!token) {
        throw new Error("NO_TOKEN");
      }

      setCookie("user_token", token, {
        path: "/",
        maxAge: 60 * 60,
        sameSite: "strict",
        secure: window.location.protocol === "https:",
      });

      toast.success("Welcome back, Admin!");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        toast.error("Invalid username or password");
      } else if (err.message === "NO_TOKEN") {
        toast.error("Server error: Token not returned");
      } else {
        toast.error("Server unreachable. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-6 relative"
      >
        <h2 className="text-2xl font-bold text-center text-slate-800">
          Admin Login
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={creds.username}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ring-indigo-500 disabled:bg-gray-100"
              onChange={(e) =>
                setCreds((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={creds.password}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ring-indigo-500 disabled:bg-gray-100"
              onChange={(e) =>
                setCreds((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

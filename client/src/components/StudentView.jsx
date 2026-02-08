import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  User,
  Layers,
  Calendar,
  Trophy,
  Medal,
  Crown,
} from "lucide-react";
import { toast } from "react-toastify";

const StudentView = () => {
  const [searchParams, setSearchParams] = useState({ regNo: "", branch: "" });
  const [studentData, setStudentData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/leaderboard`
        );
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load leaderboard : ",err.message);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.regNo)
      return toast.warning("Please enter a Registration Number");

    setLoading(true);
    setStudentData(null); // Clear previous result to focus on loading

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/student-result/${searchParams.regNo}`
      );
      setStudentData(response.data);
      toast.success("Result found!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Student not found.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get Rank Colors
  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-yellow-200 text-yellow-700 shadow-yellow-100"; // Gold
      case 1:
        return "bg-slate-50 border-slate-200 text-slate-700 shadow-slate-100"; // Silver
      case 2:
        return "bg-orange-50 border-orange-200 text-orange-800 shadow-orange-100"; // Bronze
      default:
        return "bg-white border-slate-100 text-slate-600";
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
      case 1:
        return <Medal size={24} className="text-slate-400 fill-slate-400" />;
      case 2:
        return <Medal size={24} className="text-orange-400 fill-orange-400" />;
      default:
        return <span className="font-bold text-slate-400">#{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto space-y-16 scrollbar-hide">
      {/* --- HERO SECTION & SEARCH --- */}
      <section className="max-w-3xl mx-auto text-center space-y-8 scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Check Your <span className="text-indigo-600">Performance</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Enter your details to view results.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 p-6 relative z-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Reg. Number"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchParams.regNo}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, regNo: e.target.value })
                }
              />
              <User
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <Search size={18} /> Get Result
                </>
              )}
            </button>
          </form>
        </motion.div>
      </section>

      {/* --- RESULT DISPLAY SECTION (Only shows if searched) --- */}
      <AnimatePresence>
        {studentData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {/* Student Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  {studentData.name}
                </h2>
                <div className="flex flex-wrap gap-4 text-slate-500 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <User size={14} /> {studentData.registrationNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> {studentData.branch}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end">
                <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  Overall CGPA
                </span>
                <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                  {studentData.cgpa}
                </div>
              </div>
            </div>

            {/* Semesters List */}
            <div className="grid gap-6">
              {studentData.academicHistory.map((sem, idx) => (
                <motion.div
                  key={sem.semesterNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <Calendar size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">
                        Semester {sem.semesterNumber}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-xs text-slate-400 font-semibold uppercase">
                          SGPA
                        </span>
                        <span className="font-bold text-slate-800">
                          {sem.sgpa}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          sem.remarks === "Promoted"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {sem.remarks}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">
                            Subject Code
                          </th>
                          <th className="px-6 py-3 font-semibold text-center">
                            Credits
                          </th>
                          <th className="px-6 py-3 font-semibold text-right">
                            Marks Secured
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sem.subjects.map((sub, sIdx) => (
                          <tr
                            key={sIdx}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-3 font-medium text-slate-700">
                              {sub.subjectCode}
                            </td>
                            <td className="px-6 py-3 text-center text-slate-500">
                              {sub.credits}
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-slate-800">
                              {sub.marks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEADERBOARD SECTION (Shows if no search result) --- */}
      {!studentData && leaderboard.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Trophy className="text-yellow-500" size={32} />
            <h2 className="text-3xl font-bold text-slate-800">
              Top Performers
            </h2>
          </div>

          <div className="grid gap-4">
            {leaderboard.map((student, index) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-transform hover:scale-[1.01] ${getRankStyle(
                  index
                )}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-xs opacity-80 font-medium tracking-wide">
                      {student.branch} • {student.registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black tracking-tight">
                    {student.cgpa}
                  </div>
                  <div className="text-[10px] uppercase font-bold opacity-60">
                    CGPA
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentView;

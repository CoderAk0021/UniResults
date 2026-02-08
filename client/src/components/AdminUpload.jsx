import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, FileJson, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../config/axiosConfig.js'
import { BRANCH_CURRICULUM } from '../utils/curriculum.js'; 
import selectBranch from '../utils/selectBranch.js';

const AdminUpload = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [jsonFile, setJsonFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStudent, setFetchingStudent] = useState(false);

  // Store the full fetched student object to look up history locally
  const [fullStudentData, setFullStudentData] = useState(null);

  const initialFormState = {
    registrationNumber: '', 
    name: '', 
    branch: '', 
    semesterNumber: '', // This will now be controlled by dropdown
    sgpa: '', 
    remarks: 'Promoted',
    subjects: [] // Empty initially
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Lock logic
  const isFormLocked = formData.registrationNumber.length !== 11;

  // --- 1. Fetch Student Logic ---
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (formData.registrationNumber.length === 11) {
        setFetchingStudent(true);
        try {
          const { data } = await api.get(`/api/student-result/${formData.registrationNumber}`);
          
          setFullStudentData(data); // Save full history
          setFormData(prev => ({
            ...prev,
            name: data.name,
            branch: data.branch,
            semesterNumber: '' // Reset semester so user has to choose one
          }));
          toast.info(`Found: ${data.name}`);
        } catch (error) {
          // New Student
          setFullStudentData(null);
          const branch = selectBranch(formData.registrationNumber); 
          setFormData(prev => ({ ...prev, name: '', branch: branch , subjects: [] }));
          toast.success("New student! Enter details.");
        } finally {
          setFetchingStudent(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
        if(formData.registrationNumber.length === 11) fetchStudentDetails();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.registrationNumber]);


  // --- 2. INTELLIGENT SEMESTER CHANGE LOGIC ---
  const handleSemesterChange = (e) => {
    const selectedSem = Number(e.target.value);
    const currentBranch = formData.branch;

    // 1. Update the semester in state
    const updatedFormData = { ...formData, semesterNumber: selectedSem };

    // 2. Check if this student ALREADY has data for this semester
    const existingSemData = fullStudentData?.academicHistory?.find(s => s.semesterNumber === selectedSem);

    if (existingSemData) {
        // CASE A: Data Exists -> Load it (Edit Mode)
        updatedFormData.sgpa = existingSemData.sgpa;
        updatedFormData.remarks = existingSemData.remarks;
        updatedFormData.subjects = existingSemData.subjects;
        toast.info(`Loaded existing data for Sem ${selectedSem}`);
    } else {
        // CASE B: New Semester -> Load Template from Curriculum (Create Mode)
        updatedFormData.sgpa = ''; 
        updatedFormData.remarks = 'Promoted';
        
        // Check if we have a template for this Branch + Sem
        const template = BRANCH_CURRICULUM[currentBranch]?.[selectedSem];
        if (template) {
            // Pre-fill codes and credits, leave marks empty
            updatedFormData.subjects = template.map(sub => ({
                subjectCode: sub.subjectCode,
                credits: sub.credits,
                marks: '' // User only needs to type this!
            }));
            toast.success("Loaded subject template!");
        } else {
            // No template found, give one empty row
            updatedFormData.subjects = [{ subjectCode: '', marks: '', credits: '' }];
        }
    }

    setFormData(updatedFormData);
  };

  // --- Standard Handlers ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubjectRow = () => {
    setFormData({ ...formData, subjects: [...formData.subjects, { subjectCode: '', marks: '', credits: '' }] });
  };

  const removeSubjectRow = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      semesterNumber: Number(formData.semesterNumber),
      sgpa: Number(formData.sgpa),
      subjects: formData.subjects.map(sub => ({
        subjectCode: sub.subjectCode,
        marks: Number(sub.marks),
        credits: Number(sub.credits)
      }))
    };

    try {
      const token = localStorage.getItem('adminToken');
      await api.put('/api/admin/update-result', payload, {
          headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Saved successfully!");
      // Don't reset everything, just maybe the semester-specific parts if you want
      // setFormData(initialFormState); 
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep Bulk Upload Handlers same as before) ...
  const handleFileChange = (e) => setJsonFile(e.target.files[0]);
  
  const handleBulkUpload = async () => {
    if (!jsonFile) return toast.warning("Please select a JSON file first");
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            if (!Array.isArray(jsonData)) throw new Error("Not an array");
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const { data } = await api.post('/api/admin/bulk-upload', jsonData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Created: ${data.stats.created}, Updated: ${data.stats.updated}`);
            setJsonFile(null);
        } catch (error) {
            toast.error("Invalid JSON or Server Error");
        } finally {
            setLoading(false);
        }
    };
    reader.readAsText(jsonFile);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      {/* ... (Keep Tab Switcher same as before) ... */}

      <div className="flex gap-4 mb-8 justify-center">
        <button onClick={() => setActiveTab('single')} 
            className={`cursor-pointer px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'single' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
            Single Entry
        </button>
        <button onClick={() => setActiveTab('bulk')} 
            className={`cursor-pointer px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'bulk' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
            Bulk Upload (JSON)
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {activeTab === 'single' ? (
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Basic Info (Same as before) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* ... (Keep RegNo, Name, Branch Inputs same as before) ... */}
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reg Number</label>
              <div className="relative">
                <input 
                    type="text" name="registrationNumber" value={formData.registrationNumber} 
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} 
                    required maxLength={11}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wider" 
                    placeholder="2403..." 
                />
                 <div className="absolute right-3 top-3">
                    {formData.registrationNumber.length === 11 ? (
                        fetchingStudent ? <Loader2 size={18} className="animate-spin text-indigo-500"/> : <CheckCircle2 size={18} className="text-green-500"/>
                    ) : (
                        <span className="text-xs text-slate-300">{formData.registrationNumber.length}/11</span>
                    )}
                </div>
              </div>
            </div>

            <div className={`space-y-2 ${isFormLocked && 'opacity-50'}`}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isFormLocked} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Auto-filled..." />
            </div>
            <div className={`space-y-2 ${isFormLocked && 'opacity-50'}`}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} disabled={isFormLocked} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Auto-filled..." />
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          <fieldset disabled={isFormLocked} className={`space-y-8 transition-opacity duration-300 ${isFormLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            
            {/* Section 2: Semester (DROPDOWN NOW) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SEMESTER DROPDOWN */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                    <select 
                        name="semesterNumber" 
                        value={formData.semesterNumber} 
                        onChange={handleSemesterChange} 
                        required 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="">Select Sem</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SGPA</label>
                    <input type="number" step="0.01" name="sgpa" value={formData.sgpa} onChange={handleChange} required 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</label>
                    <select name="remarks" value={formData.remarks} onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Promoted">Promoted</option>
                        <option value="Fail">Fail</option>
                    </select>
                </div>
            </div>

            {/* Section 3: Dynamic Subjects (Pre-filled) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">Subject Breakdown</label>
                    <button type="button" onClick={addSubjectRow} className="text-xs text-indigo-600 font-bold flex gap-1"><Plus size={14} /> Add Subject</button>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <AnimatePresence>
                    {formData.subjects.map((subject, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-12 gap-3 items-end"
                    >
                        <div className="col-span-4">
                            <input type="text" placeholder="Subject Code" value={subject.subjectCode} 
                                onChange={(e) => handleSubjectChange(index, 'subjectCode', e.target.value)} required
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-600" />
                        </div>
                        <div className="col-span-3">
                            <input type="number" placeholder="Marks" value={subject.marks} 
                                onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)} required
                                className="w-full p-2.5 bg-white border-2 border-indigo-100 rounded-md text-sm focus:border-indigo-500 outline-none font-bold text-indigo-600" />
                        </div>
                        <div className="col-span-3">
                            <input type="number" placeholder="Credits" value={subject.credits} 
                                onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)} required
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-500" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                             <button type="button" onClick={() => removeSubjectRow(index)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
                {formData.subjects.length === 0 && <p className="text-center text-xs text-slate-400 italic">Select a semester to load subjects...</p>}
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                {loading ? 'Uploading...' : <><Save size={20}/> Save Result Record</>}
            </button>
          </fieldset>
        </form>
        ) : (
            /* Bulk Upload UI */
             <div className="p-12 text-center space-y-6">
                
                {/* ... existing bulk upload UI ... */}
                <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                    <FileJson size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Upload JSON Data</h2>
                <div className="max-w-md mx-auto border-2 border-dashed border-slate-300 rounded-xl p-8">
                    <input type="file" accept=".json" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700"/>
                </div>
                <button onClick={handleBulkUpload} disabled={loading} className="cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">
                    {loading ? "Uploading..." : "Process Bulk Upload"}
                </button>
             </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpload;
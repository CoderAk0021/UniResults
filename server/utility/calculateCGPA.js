const calculateCGPA = (history) => {
    if (!history || history.length === 0) return 0;
    const totalSgpa = history.reduce((sum, semester) => sum + semester.sgpa, 0);
    const cgpa = totalSgpa / history.length;
    return parseFloat(cgpa.toFixed(2));
};

export default calculateCGPA
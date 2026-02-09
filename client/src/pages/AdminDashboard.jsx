import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FilePlus,
    Users,
    Settings,
    LogOut,
    Plus,
    Trash2,
    Save,
    Eye,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Award,
    Monitor,
    FileText,
    ChevronRight,
    Edit3,
    Upload,
    Download,
    FileSpreadsheet,
    Menu,
    Mail,
    Send,
    Search,
    Lock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Toast = ({ message, type, onClose }) => (
    <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-full duration-300 z-[9999] ${type === 'success' ? 'bg-cyan-900/90 border-cyan-500/50 text-cyan-50' :
        type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-50' :
            'bg-gray-900/90 border-gray-700 text-gray-50'
        }`}>
        {type === 'success' && <CheckCircle className="w-5 h-5 text-cyan-400" />}
        {type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-4">
            <X className="w-4 h-4" />
        </button>
    </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-[#1a1c23] border border-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-500'
                    }`}>
                    {type === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-400 font-bold hover:bg-gray-800 transition-all"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-900/20'
                            }`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ activeTab, setActiveTab, handleLogout, isOpen, setIsOpen }) => (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsOpen(false)}
            />
        )}

        <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        ParikshaX Admin
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Exam Control Center</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button
                    onClick={() => { setActiveTab('dashboard'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </button>
                <button
                    onClick={() => { setActiveTab('create-exam'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'create-exam' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <FilePlus className="w-5 h-5" /> Create Exam
                </button>
                <button
                    onClick={() => { setActiveTab('students'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'students' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Users className="w-5 h-5" /> Students
                </button>
                <button
                    onClick={() => { setActiveTab('monitoring'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'monitoring' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Eye className="w-5 h-5" /> Live Monitoring
                </button>
                <button
                    onClick={() => { setActiveTab('results'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'results' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Award className="w-5 h-5" /> Results
                </button>
                <button
                    onClick={() => { setActiveTab('settings'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Settings className="w-5 h-5" /> Settings
                </button>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900 transition-all font-bold"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
    </>
);

const StudentManagement = ({ students, setStudents, exams, onDelete, notify, confirmAction, fetchStudents }) => {
    const [view, setView] = useState('list-exams'); // list-exams, manage-students
    const [selectedExam, setSelectedExam] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubTab, setActiveSubTab] = useState('by-exam'); // 'by-exam' or 'all-students'

    // Form States
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [bulkData, setBulkData] = useState('');
    const [sendEmail, setSendEmail] = useState(false); // Default to false


    // Derived State: Students assigned to the currently selected exam
    const examStudents = selectedExam
        ? students.filter(s => s.eligibleExams?.some(id =>
            id && (id._id || id).toString() === selectedExam._id.toString()
        ))
        : [];

    const handleExamClick = (exam) => {
        setSelectedExam(exam);
        setView('manage-students');
    };

    const generateId = () => {
        if (!selectedExam) return '';
        const year = new Date().getFullYear();
        const prefix = selectedExam.title
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 4);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${year}${prefix}${random}`;
    };

    const handleSingleRegister = async (e) => {
        e.preventDefault();
        if (!newName || !newEmail) {
            notify('Please fill all fields', 'error');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/students/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: selectedExam._id,
                    students: [{ name: newName, email: newEmail }],
                    sendEmail
                })
            });
            const data = await res.json();
            if (data.success) {
                notify(`Student registered successfully!`);
                setNewName('');
                setNewEmail('');
                await fetchStudents(); // Refresh global list - examStudents will update automatically!
            } else {
                notify(data.error, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Registration failed', 'error');
        }
    };

    const registerBatch = async (studentsList) => {
        try {
            const res = await fetch(`${API_BASE_URL}/students/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: selectedExam._id,
                    students: studentsList,
                    sendEmail
                })
            });
            const data = await res.json();
            if (data.success) {
                notify(`Successfully registered ${data.count} students!`);
                setBulkData('');
                await fetchStudents(); // Refresh global list
            } else {
                notify(data.error || 'Failed to register students', 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Bulk registration failed', 'error');
        }
    };

    const handleBulkRegister = () => {
        if (!bulkData) {
            notify('Please paste some data', 'error');
            return;
        }
        const lines = bulkData.split('\n');
        const formattedData = lines.map(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                return { name: parts[0].trim(), email: parts[1].trim() };
            }
            return null;
        }).filter(Boolean);

        if (formattedData.length === 0) {
            notify('Invalid format. Use: Name, Email', 'error');
            return;
        }

        confirmAction(
            'Confirm Registration',
            `Ready to register ${formattedData.length} students. Proceed?`,
            () => registerBatch(formattedData),
            'info'
        );
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Expected columns: Name, Email (case insensitive)
                const formattedData = data.map(row => {
                    const name = row.Name || row.name || row.NAME;
                    const email = row.Email || row.email || row.EMAIL;
                    if (name && email) return { name, email };
                    return null;
                }).filter(Boolean);

                if (formattedData.length === 0) {
                    notify('Could not find valid data. Ensure columns are "Name" and "Email".', 'error');
                    return;
                }

                confirmAction(
                    'Excel Import',
                    `Found ${formattedData.length} students in file. Register them?`,
                    () => registerBatch(formattedData),
                    'info'
                );
            } catch (err) {
                console.error(err);
                notify('Error reading Excel file', 'error');
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet([
                { Name: 'John Doe', Email: 'john@example.com' },
                { Name: 'Jane Smith', Email: 'jane@example.com' }
            ]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students");
            XLSX.writeFile(wb, "Student_Registration_Template.xlsx");
            notify('Template download started');
        } catch (err) {
            notify('Download failed', 'error');
        }
    };

    const handleResendCredentials = async (studentId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/students/send-credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, examId: selectedExam._id })
            });
            const data = await res.json();
            if (data.success) notify('Credentials sent successfully!');
            else notify(data.error || 'Failed to send email', 'error');
        } catch (err) {
            console.error(err);
            notify('Failed to send email', 'error');
        }
    };

    const handleBulkResendCredentials = async () => {
        confirmAction(
            'Resend Credentials',
            `Resend credentials to all ${examStudents.length} registered students ? This will trigger ${examStudents.length} emails.`,
            async () => {
                let count = 0;
                for (const s of examStudents) {
                    try {
                        await fetch(`${API_BASE_URL}/students/send-credentials`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId: s._id, examId: selectedExam._id })
                        });
                        count++;
                    } catch (e) {
                        console.error(e);
                    }
                }
                notify(`Emails triggered for ${count} students`);
            },
            'info'
        );
    };

    const downloadStudentList = () => {
        try {
            if (examStudents.length === 0) {
                notify('No students registered to download', 'error');
                return;
            }
            const dataToExport = examStudents.map(student => ({
                Name: student.name,
                Email: student.email
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Registered Students");
            XLSX.writeFile(wb, `${selectedExam.title.replace(/[^a-z0-9]/gi, '_')}_Students.xlsx`);
            notify('Student list downloaded successfully');
        } catch (err) {
            console.error(err);
            notify('Failed to download list', 'error');
        }
    };

    const handleDeleteAllForExam = async () => {
        confirmAction(
            'Delete All Students',
            `Are you sure you want to remove ALL ${examStudents.length} students from this exam? This action cannot be undone.`,
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/students/delete-many`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ examId: selectedExam._id })
                    });
                    const data = await res.json();
                    if (data.success) {
                        notify(data.message);
                        await fetchStudents();
                    } else {
                        notify(data.error || 'Failed to delete students', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    notify('Failed to delete students', 'error');
                }
            }
        );
    };

    if (activeSubTab === 'all-students') {
        const filteredAllStudents = students.filter(s =>
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Global Student Database</h2>
                        <p className="text-sm text-gray-500 mt-1">Total Registered Students: {students.length}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="relative group w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400" />
                            <input
                                type="text"
                                placeholder="Search all students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>
                        <button onClick={() => { setActiveSubTab('by-exam'); setView('list-exams'); }} className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-900/20">Manage by Exam</button>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-bold tracking-widest border-b border-gray-700">
                                <tr>
                                    <th className="p-5">Student Information</th>
                                    <th className="p-5">Student ID</th>
                                    <th className="p-5">Exams Assigned</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredAllStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-16 text-center text-gray-600 italic">No students found in global database.</td>
                                    </tr>
                                )}
                                {filteredAllStudents.map((s) => (
                                    <tr key={s._id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="p-5">
                                            <div className="font-bold text-white">{s.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{s.email}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-mono text-cyan-400 font-bold bg-gray-900/80 px-2 py-1 rounded text-sm border border-gray-800">{s.studentId || 'N/A'}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {s.eligibleExams && s.eligibleExams.length > 0 ? (
                                                    s.eligibleExams.map((exam, idx) => {
                                                        if (!exam) return null; // Skip if null
                                                        // Handle both populated objects and raw IDs
                                                        const examId = exam._id || exam;
                                                        const examTitle = exam.title || 'Exam';
                                                        return (
                                                            <span
                                                                key={examId || idx}
                                                                className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-bold truncate max-w-full"
                                                                title={examTitle}
                                                            >
                                                                {examTitle}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-gray-600 text-[10px] italic">No Exams</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => onDelete(s._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Student Permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'list-exams') {
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">Student Enrollment</h2>
                        <p className="text-gray-500 text-sm mt-1">Select an assessment to manage its candidate list.</p>
                    </div>
                    <button
                        onClick={() => setActiveSubTab('all-students')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-700 hover:border-cyan-500 text-sm font-bold transition-all text-white group"
                    >
                        <Users className="w-4 h-4 text-cyan-400" /> View All Students ({students.length})
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

                    {exams.map(exam => (
                        <div key={exam._id} onClick={() => handleExamClick(exam)} className="bg-gray-800 border border-gray-700 hover:border-cyan-500 rounded-xl p-5 md:p-6 cursor-pointer transition-all hover:bg-gray-700/50 group">
                            <h3 className="text-lg md:text-xl font-bold group-hover:text-cyan-400 mb-2 truncate">{exam.title}</h3>
                            <div className="text-sm text-gray-400 mb-4 font-mono select-all bg-gray-900/50 px-2 py-1 rounded inline-block">{exam.code}</div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{exam.duration} mins</span>
                                <span className="text-cyan-500 font-medium">Manage &rarr;</span>
                            </div>
                        </div>
                    ))}
                    {exams.length === 0 && <div className="text-gray-500 col-span-full text-center py-12 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">No exams created yet.</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <button onClick={() => setView('list-exams')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 font-medium bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">&larr; Back to Exams</button>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Manage Students: <span className="text-cyan-400 block sm:inline">{selectedExam.title}</span></h2>
            <p className="text-sm text-gray-500 mb-8 border-b border-gray-700 pb-4">Exam Code: <span className="font-mono text-cyan-500/80">{selectedExam.code}</span></p>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-6 md:space-y-8">
                    {/* Add Single */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-400" /> Register Student
                        </h3>
                        <form onSubmit={handleSingleRegister} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Full Name</label>
                                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Aditi Rao" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Email Address</label>
                                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="student@university.edu" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-all" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sendEmailSingle"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-900"
                                />
                                <label htmlFor="sendEmailSingle" className="text-sm text-gray-400 select-none cursor-pointer">Send Welcome Email with Credentials</label>
                            </div>
                            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]">Add to Exam</button>
                        </form>
                    </div>

                    {/* Bulk Upload */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FilePlus className="w-5 h-5 text-blue-400" /> Bulk Register
                        </h3>

                        <div className="space-y-4">
                            {/* Excel Upload Option */}
                            <div className="p-5 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all group">
                                <label className="flex flex-col items-center justify-center cursor-pointer">
                                    <FileSpreadsheet className="w-10 h-10 text-gray-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                                    <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Upload Excel Sheet</span>
                                    <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                                </label>
                                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]">
                                    <span className="text-gray-500 italic">Format: Name, Email columns</span>
                                    <button onClick={downloadTemplate} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-bold bg-cyan-500/10 px-2 py-1 rounded">
                                        <Download className="w-3 h-3" /> Get Template
                                    </button>
                                </div>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-800 px-3 text-gray-500 font-bold tracking-widest">OR PASTE</span></div>
                            </div>

                            <div>
                                <label className="text-[11px] text-gray-500 mb-2 uppercase tracking-wider block font-bold">Paste (Name, Email) per line:</label>
                                <textarea
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                                    className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-mono focus:border-cyan-500 outline-none mb-3 transition-all"
                                ></textarea>
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="sendEmailBulk"
                                        checked={sendEmail}
                                        onChange={(e) => setSendEmail(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-900"
                                    />
                                    <label htmlFor="sendEmailBulk" className="text-sm text-gray-400 select-none cursor-pointer">Send Welcome Email with Credentials</label>
                                </div>
                                <button onClick={handleBulkRegister} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]">Register from Text</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-fit shadow-xl">
                    <div className="p-4 md:p-6 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-900/30 gap-4">
                        <h3 className="font-bold">Registered Students ({examStudents.length})</h3>
                        {examStudents.length > 0 && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={downloadStudentList}
                                    className="flex-1 sm:flex-none text-xs bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.95]"
                                    title="Download Excel List (Name, Email)"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download List
                                </button>
                                <button
                                    onClick={handleBulkResendCredentials}
                                    className="flex-1 sm:flex-none text-xs bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.95]"
                                >
                                    <Upload className="w-3.5 h-3.5 rotate-180" /> Email All
                                </button>
                                <button
                                    onClick={handleDeleteAllForExam}
                                    className="flex-1 sm:flex-none text-xs bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-[0.95]"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete All
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Student ID</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email Address</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {examStudents.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-500 font-medium">No students registered yet.</td></tr>}
                                {examStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 font-mono font-bold text-cyan-400 text-sm">{student.studentId}</td>
                                        <td className="p-4 font-medium">{student.name}</td>
                                        <td className="p-4 text-gray-400 text-sm truncate max-w-[150px]" title={student.email}>{student.email}</td>
                                        <td className="p-4">
                                            <div className="flex justify-end items-center gap-1">
                                                <button className="text-gray-400 hover:text-white text-[10px] border border-gray-700 px-2 py-1 rounded-md transition-colors" onClick={() => { navigator.clipboard.writeText(student.studentId); notify('ID Copied!'); }}>Copy</button>
                                                <button
                                                    className="text-cyan-400 hover:text-cyan-300 text-[10px] border border-cyan-900/30 bg-cyan-900/10 px-2 py-1 rounded-md transition-colors font-bold"
                                                    onClick={() => handleResendCredentials(student._id)}
                                                >
                                                    Email
                                                </button>
                                                <button
                                                    onClick={() => onDelete(student._id)}
                                                    className="text-red-500 hover:text-white hover:bg-red-500/20 p-2 rounded-md transition-all"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
};

const CreateExam = ({ fetchExams, setActiveTab, notify }) => {
    const [examTitle, setExamTitle] = useState('');
    const [sections, setSections] = useState([
        { title: 'Quants', duration: 30, questions: [] },
        { title: 'Verbal', duration: 30, questions: [] },
        { title: 'Reasoning', duration: 30, questions: [] }
    ]);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);

    // Question Form States
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);

    const downloadQuestionTemplate = () => {
        const data = [
            ["Question Text", "Option A", "Option B", "Option C", "Option D", "Correct Option (A/B/C/D)"],
            ["What is the capital of France?", "London", "Berlin", "Paris", "Madrid", "C"],
            ["Which planet is known as the Red Planet?", "Earth", "Mars", "Jupiter", "Venus", "B"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "Question_Template.xlsx");
    };

    const handleBulkQuestionUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                const newQuestions = data.map(row => {
                    const qText = row["Question Text"] || row["questionText"];
                    const opts = [
                        row["Option A"] || row["optionA"],
                        row["Option B"] || row["optionB"],
                        row["Option C"] || row["optionC"],
                        row["Option D"] || row["optionD"]
                    ];
                    const correct = row["Correct Option (A/B/C/D)"]?.toString().toUpperCase().trim();
                    let correctIdx = 0;
                    if (correct === 'A') correctIdx = 0;
                    else if (correct === 'B') correctIdx = 1;
                    else if (correct === 'C') correctIdx = 2;
                    else if (correct === 'D') correctIdx = 3;

                    return {
                        questionText: qText,
                        options: opts.map(o => o?.toString() || ''),
                        correctOption: correctIdx
                    };
                }).filter(q => q.questionText && q.options.every(o => o));

                if (newQuestions.length === 0) {
                    notify('No valid questions found. Please check the template format.', 'error');
                    return;
                }

                const updatedSections = [...sections];
                updatedSections[activeSectionIndex].questions = [
                    ...updatedSections[activeSectionIndex].questions,
                    ...newQuestions
                ];
                setSections(updatedSections);
                notify(`Successfully imported ${newQuestions.length} questions!`);
            } catch (err) {
                console.error(err);
                notify('Failed to process file', 'error');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const handleAddQuestion = () => {
        if (!qText || qOptions.some(o => !o)) {
            notify('Please complete the question and all options', 'error');
            return;
        }

        const newSections = [...sections];
        newSections[activeSectionIndex].questions.push({
            questionText: qText,
            options: qOptions,
            correctOption: parseInt(qCorrect)
        });

        setSections(newSections);
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
    };

    const handleSectionDurationChange = (index, value) => {
        const newSections = [...sections];
        newSections[index].duration = parseInt(value || 0);
        setSections(newSections);
    };

    const handleSectionTitleChange = (index, value) => {
        const newSections = [...sections];
        newSections[index].title = value;
        setSections(newSections);
    };

    const handleAddSection = () => {
        setSections([...sections, { title: 'New Section', duration: 30, questions: [] }]);
    };

    const handleRemoveSection = (index) => {
        if (sections.length === 1) {
            notify('Cannot remove the last section.', 'error');
            return;
        }
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
        if (activeSectionIndex >= newSections.length) setActiveSectionIndex(newSections.length - 1);
    };

    const handleSaveExam = async () => {
        const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);

        if (!examTitle || totalDuration <= 0 || sections.some(s => s.questions.length === 0)) {
            notify('Please fill title, valid duration for all sections, and ensure each section has at least one question', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/exams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: examTitle,
                    duration: totalDuration,
                    sections: sections
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchExams(); // Full reload to stay in sync
                notify('Exam Created Successfully!');
                setActiveTab('dashboard');
            } else {
                notify(data.error, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to create exam. Please try again.', 'error');
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold">Create Multi-Section Exam</h2>
                    <button onClick={handleSaveExam} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]"><Save className="w-4 h-4" /> Save Exam</button>
                </div>

                <div className="mb-8">
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Exam Title</label>
                    <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. Placement Assessment 2024" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 text-white outline-none focus:border-cyan-500 shadow-inner transition-all" />
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-bold text-lg">Sections</h3>
                        <button onClick={handleAddSection} className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold"><Plus className="w-4 h-4 text-cyan-400" /> Add Section</button>
                    </div>
                    {sections.map((section, idx) => (
                        <div key={idx} className={`p-4 md:p-5 rounded-2xl border transition-all ${idx === activeSectionIndex ? 'bg-cyan-900/10 border-cyan-500/50 shadow-lg shadow-cyan-900/10' : 'bg-gray-800/40 border-gray-700'}`}>
                            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-gray-500 font-mono font-bold bg-gray-900 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">#{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                                        className="bg-transparent border-b border-gray-600 focus:border-cyan-500 outline-none p-1 font-bold text-lg flex-1 min-w-0"
                                        placeholder="Section Name"
                                    />
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 border-t md:border-t-0 border-gray-700/50 pt-3 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={section.duration}
                                            onChange={(e) => handleSectionDurationChange(idx, e.target.value)}
                                            className="w-16 md:w-20 bg-gray-900 border border-gray-700 rounded-lg p-2 text-center font-mono font-bold text-cyan-400 focus:border-cyan-500 outline-none"
                                        />
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider shrink-0">Mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setActiveSectionIndex(idx)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${idx === activeSectionIndex ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            Edit Qs ({section.questions.length})
                                        </button>
                                        <button onClick={() => handleRemoveSection(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"><Trash2 className="w-5 h-5 focus:scale-110 active:scale-95 transition-all" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Question Builder for Active Section */}
                <div className="bg-gray-800 p-5 md:p-8 rounded-2xl border border-gray-700 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FileText className="w-24 h-24" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h3 className="font-bold flex items-center gap-3 text-cyan-400 text-lg uppercase tracking-wider">
                            <Plus className="w-5 h-5" /> Add Question: <span className="text-white bg-gray-900 px-3 py-1 rounded-lg">{sections[activeSectionIndex].title}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadQuestionTemplate}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-all flex items-center gap-2 border border-gray-600"
                            >
                                <Download className="w-3 h-3" /> Template
                            </button>
                            <label className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 rounded-lg text-cyan-400 transition-all flex items-center gap-2 border border-cyan-500/20 cursor-pointer">
                                <Upload className="w-3 h-3" /> Bulk Import
                                <input type="file" accept=".xlsx, .xls" onChange={handleBulkQuestionUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Question Text</label>
                            <input type="text" value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Type your question here..." className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {qOptions.map((opt, idx) => (
                                <div key={idx}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block px-1">Option {idx + 1}</label>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...qOptions];
                                            newOpts[idx] = e.target.value;
                                            setQOptions(newOpts);
                                        }}
                                        placeholder={`Option ${idx + 1} `}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-all md:text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Correct Answer:</span>
                            <div className="flex flex-wrap gap-3">
                                {qOptions.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setQCorrect(i)}
                                        className={`w-12 h-12 rounded-xl font-bold border-2 transition-all flex items-center justify-center shadow-md ${qCorrect === i ? 'bg-cyan-500 border-cyan-400 text-white scale-110' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        {idxToLetter(i)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleAddQuestion} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-lg transition-all shadow-xl shadow-cyan-900/30 active:scale-[0.98]">Add Question to Section</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="font-bold text-lg">Question List ({sections[activeSectionIndex].title})</h3>
                        <span className="text-sm font-mono text-cyan-500 font-bold">{sections[activeSectionIndex].questions.length} Items</span>
                    </div>
                    {sections[activeSectionIndex].questions.map((q, i) => (
                        <div key={i} className="bg-gray-800/40 p-5 rounded-2xl border border-gray-800 flex justify-between items-start group hover:border-gray-700 transition-all shadow-md">
                            <div className="flex gap-4">
                                <span className="text-gray-500 font-mono font-bold pt-1 shrink-0">#{i + 1}</span>
                                <div className="space-y-2">
                                    <p className="font-bold text-white leading-relaxed">{q.questionText}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`text-xs flex items-center gap-2 ${oIdx === q.correctOption ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                                <span className="bg-gray-900 w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0">{idxToLetter(oIdx)}</span>
                                                <span className="truncate">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const newSections = [...sections];
                                    newSections[activeSectionIndex].questions.splice(i, 1);
                                    setSections(newSections);
                                }}
                                className="md:opacity-0 md:group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all shrink-0 ml-4"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {sections[activeSectionIndex].questions.length === 0 && (
                        <div className="text-center py-12 bg-gray-800/10 rounded-2xl border border-dashed border-gray-800 text-gray-600 font-medium">Add questions using the builder above.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const idxToLetter = (idx) => String.fromCharCode(65 + idx);

const QuestionManagement = ({ exam, onBack, onUpdate, notify }) => {
    const [examTitle, setExamTitle] = useState(exam.title);
    const [sections, setSections] = useState(exam.sections || []);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);

    // Question Form States
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);
    const [editingIndex, setEditingIndex] = useState(null);

    const downloadQuestionTemplate = () => {
        const data = [
            ["Question Text", "Option A", "Option B", "Option C", "Option D", "Correct Option (A/B/C/D)"],
            ["What is the capital of France?", "London", "Berlin", "Paris", "Madrid", "C"],
            ["Which planet is known as the Red Planet?", "Earth", "Mars", "Jupiter", "Venus", "B"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "Question_Template.xlsx");
    };

    const handleBulkQuestionUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                const newQuestions = data.map(row => {
                    const qText = row["Question Text"] || row["questionText"];
                    const opts = [
                        row["Option A"] || row["optionA"],
                        row["Option B"] || row["optionB"],
                        row["Option C"] || row["optionC"],
                        row["Option D"] || row["optionD"]
                    ];
                    const correct = row["Correct Option (A/B/C/D)"]?.toString().toUpperCase().trim();
                    let correctIdx = 0;
                    if (correct === 'A') correctIdx = 0;
                    else if (correct === 'B') correctIdx = 1;
                    else if (correct === 'C') correctIdx = 2;
                    else if (correct === 'D') correctIdx = 3;

                    return {
                        questionText: qText,
                        options: opts.map(o => o?.toString() || ''),
                        correctOption: correctIdx
                    };
                }).filter(q => q.questionText && q.options.every(o => o));

                if (newQuestions.length === 0) {
                    notify('No valid questions found. Please check the template format.', 'error');
                    return;
                }

                const updatedSections = [...sections];
                updatedSections[activeSectionIndex].questions = [
                    ...updatedSections[activeSectionIndex].questions,
                    ...newQuestions
                ];
                setSections(updatedSections);
                notify(`Successfully imported ${newQuestions.length} questions!`);
            } catch (err) {
                console.error(err);
                notify('Failed to process file', 'error');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const handleAddQuestion = () => {
        if (!qText || qOptions.some(o => !o)) {
            notify('Please complete the question and all options', 'error');
            return;
        }

        const newSections = [...sections];
        const questionData = {
            questionText: qText,
            options: qOptions,
            correctOption: parseInt(qCorrect)
        };

        if (editingIndex !== null) {
            newSections[activeSectionIndex].questions[editingIndex] = questionData;
            setEditingIndex(null);
        } else {
            newSections[activeSectionIndex].questions.push(questionData);
        }

        setSections(newSections);
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
    };

    const handleEditQuestion = (idx) => {
        const q = sections[activeSectionIndex].questions[idx];
        setQText(q.questionText);
        setQOptions([...q.options]);
        setQCorrect(q.correctOption);
        setEditingIndex(idx);
    };

    const handleSaveExam = async () => {
        const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);

        if (!examTitle || totalDuration <= 0 || sections.some(s => s.questions.length === 0)) {
            notify('Please fill title, valid duration for all sections, and ensure each section has at least one question', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/exams/${exam._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: examTitle,
                    duration: totalDuration,
                    sections: sections
                })
            });
            const data = await res.json();
            if (data.success) {
                notify('Exam Updated Successfully!');
                onUpdate(data.exam);
                onBack();
            } else {
                notify(data.error, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to update exam. Please try again.', 'error');
        }
    };

    const handleSectionDurationChange = (index, value) => {
        const newSections = [...sections];
        newSections[index].duration = parseInt(value || 0);
        setSections(newSections);
    };

    const handleSectionTitleChange = (index, value) => {
        const newSections = [...sections];
        newSections[index].title = value;
        setSections(newSections);
    };

    const handleAddSection = () => {
        setSections([...sections, { title: 'New Section', duration: 30, questions: [] }]);
    };

    const handleRemoveSection = (index) => {
        if (sections.length === 1) {
            notify('Cannot remove the last section.', 'error');
            return;
        }
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
        if (activeSectionIndex >= newSections.length) setActiveSectionIndex(newSections.length - 1);
    };

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 font-medium bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">&larr; Back to Dashboard</button>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <FileText className="text-cyan-400 w-6 h-6" /> Manage: <span className="text-cyan-400 truncate">{exam.title}</span>
                    </h2>
                    <button onClick={handleSaveExam} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block px-1">Exam Title</label>
                    <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 text-white outline-none focus:border-cyan-500 transition-all font-bold" />
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-bold text-lg">Sections</h3>
                        <button onClick={handleAddSection} className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold"><Plus className="w-4 h-4 text-cyan-400" /> Add Section</button>
                    </div>
                    {sections.map((section, idx) => (
                        <div key={idx} className={`p-4 md:p-5 rounded-2xl border transition-all ${idx === activeSectionIndex ? 'bg-cyan-900/10 border-cyan-500/50 shadow-lg shadow-cyan-900/10' : 'bg-gray-800/40 border-gray-700'}`}>
                            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-gray-500 font-mono font-bold bg-gray-900 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">#{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                                        className="bg-transparent border-b border-gray-600 focus:border-cyan-500 outline-none p-1 font-bold text-lg flex-1 min-w-0"
                                        placeholder="Section Name"
                                    />
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 border-t md:border-t-0 border-gray-700/50 pt-3 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={section.duration}
                                            onChange={(e) => handleSectionDurationChange(idx, e.target.value)}
                                            className="w-16 md:w-20 bg-gray-900 border border-gray-700 rounded-lg p-2 text-center font-mono font-bold text-cyan-400 focus:border-cyan-500 outline-none"
                                        />
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider shrink-0">Mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setActiveSectionIndex(idx)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${idx === activeSectionIndex ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            Edit Qs ({section.questions.length})
                                        </button>
                                        <button onClick={() => handleRemoveSection(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"><Trash2 className="w-5 h-5 focus:scale-110 active:scale-95 transition-all" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Question Builder for Active Section */}
                <div className="bg-gray-800 p-5 md:p-8 rounded-2xl border border-gray-700 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Edit3 className="w-24 h-24" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h3 className="font-bold flex items-center gap-3 text-cyan-400 text-lg uppercase tracking-wider">
                            {editingIndex !== null ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            <span>{editingIndex !== null ? 'Edit Question' : 'Add Question'}: <span className="text-white bg-gray-900 px-3 py-1 rounded-lg ml-2">{sections[activeSectionIndex]?.title}</span></span>
                        </h3>
                        <div className="flex items-center gap-2">
                            {editingIndex === null && (
                                <>
                                    <button
                                        onClick={downloadQuestionTemplate}
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-all flex items-center gap-2 border border-gray-600"
                                    >
                                        <Download className="w-3 h-3" /> Template
                                    </button>
                                    <label className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 rounded-lg text-cyan-400 transition-all flex items-center gap-2 border border-cyan-500/20 cursor-pointer">
                                        <Upload className="w-3 h-3" /> Bulk Import
                                        <input type="file" accept=".xlsx, .xls" onChange={handleBulkQuestionUpload} className="hidden" />
                                    </label>
                                </>
                            )}
                            {editingIndex !== null && <button onClick={() => { setEditingIndex(null); setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); }} className="text-xs text-gray-400 hover:text-white underline font-bold">Cancel Edit</button>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block px-1">Question Text</label>
                            <input type="text" value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Type your question here..." className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {qOptions.map((opt, idx) => (
                                <div key={idx}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block px-1">Option {idxToLetter(idx)}</label>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...qOptions];
                                            newOpts[idx] = e.target.value;
                                            setQOptions(newOpts);
                                        }}
                                        placeholder={`Option ${idxToLetter(idx)} `}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-all md:text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Correct Answer:</span>
                            <div className="flex flex-wrap gap-3">
                                {qOptions.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setQCorrect(i)}
                                        className={`w-12 h-12 rounded-xl font-bold border-2 transition-all flex items-center justify-center shadow-md ${qCorrect === i ? 'bg-cyan-500 border-cyan-400 text-white scale-110' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        {idxToLetter(i)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleAddQuestion} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-lg transition-all shadow-xl shadow-cyan-900/30 active:scale-[0.98]">
                            {editingIndex !== null ? 'Update Question' : 'Add Question'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="font-bold text-lg">Question List ({sections[activeSectionIndex]?.title})</h3>
                        <span className="text-sm font-mono text-cyan-500 font-bold">{sections[activeSectionIndex]?.questions.length || 0} Items</span>
                    </div>
                    {sections[activeSectionIndex]?.questions.map((q, i) => (
                        <div key={i} className="bg-gray-800/40 p-5 rounded-2xl border border-gray-800 flex justify-between items-start group hover:border-gray-700 transition-all shadow-md">
                            <div className="flex gap-4">
                                <span className="text-gray-500 font-mono font-bold pt-1 shrink-0">#{i + 1}</span>
                                <div className="space-y-2">
                                    <p className="font-bold text-white leading-relaxed">{q.questionText}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`text-xs flex items-center gap-2 ${oIdx === q.correctOption ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                                <span className="bg-gray-900 w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 font-bold">{idxToLetter(oIdx)}</span>
                                                <span className="truncate">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 ml-4">
                                <button
                                    onClick={() => handleEditQuestion(i)}
                                    className="md:opacity-0 md:group-hover:opacity-100 text-cyan-400 p-2 hover:bg-cyan-400/10 rounded-lg transition-all"
                                    title="Edit Question"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        const newSections = [...sections];
                                        newSections[activeSectionIndex].questions.splice(i, 1);
                                        setSections(newSections);
                                    }}
                                    className="md:opacity-0 md:group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Question"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!sections[activeSectionIndex]?.questions || sections[activeSectionIndex].questions.length === 0) && (
                        <div className="text-center py-12 bg-gray-800/10 rounded-2xl border border-dashed border-gray-800 text-gray-600 font-medium font-bold">No questions in this section.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Monitoring = ({ sessions, setSelectedSessionLog, setActiveTab, onDelete, onDeleteAll, confirmAction, fetchSessionById }) => (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-xl md:text-2xl font-bold">Live Monitoring</h2>
            {sessions.filter(s => s.status === 'in_progress').length > 0 && (
                <button
                    onClick={onDeleteAll}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/50 rounded-xl transition-all text-sm font-bold shadow-lg shadow-red-900/10 active:scale-95"
                >
                    <Trash2 className="w-4 h-4" /> Clear All Sessions
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sessions.filter(s => s.status === 'in_progress').map(session => (
                <div key={session._id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all relative group shadow-xl">
                    <button
                        onClick={() => onDelete(session._id)}
                        className="absolute top-3 left-3 z-10 p-2 bg-red-600/90 text-white rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-500 shadow-xl active:scale-90"
                        title="Delete Session"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="bg-gray-950 aspect-video flex items-center justify-center relative overflow-hidden">
                        {session.lastSnapshot ? (
                            <img
                                src={session.lastSnapshot}
                                alt="Live Feed"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <Monitor className="text-gray-800 w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute top-3 right-3 flex gap-2">
                            <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-[10px] font-bold border border-green-500/20">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {session.lastSnapshot ? 'LIVE' : 'WAITING'}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold border shadow-lg ${session.integrityScore > 80 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                                Score: {session.integrityScore?.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    <div className="p-4 md:p-5">
                        <h3 className="font-bold text-lg truncate text-white mb-1">{session.studentId?.name || 'Unknown Student'}</h3>
                        <p className="text-xs text-gray-500 mb-5 truncate font-medium flex items-center gap-1.5"><FileText className="w-3 h-3" /> {session.examId?.title}</p>
                        <button
                            onClick={() => fetchSessionById(session._id)}
                            className="w-full py-3 bg-gray-700/50 hover:bg-cyan-600 text-white rounded-xl text-sm transition-all font-bold border border-gray-600 hover:border-cyan-500 shadow-lg active:scale-[0.98]"
                        >
                            Review Activity Log
                        </button>
                    </div>
                </div>
            ))}
            {sessions.filter(s => s.status === 'in_progress').length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-800/10 rounded-3xl border-2 border-dashed border-gray-800/50 flex flex-col items-center justify-center px-6">
                    <Monitor className="w-12 h-12 text-gray-700 mb-4 opacity-30" />
                    <h3 className="text-gray-400 font-bold text-lg">No Active Sessions</h3>
                    <p className="text-gray-600 text-sm mt-1 max-w-xs mx-auto">Real-time monitoring will appear here when students begin their exams.</p>
                </div>
            )}
        </div>
    </div>
);

const Results = ({ sessions, students, exams, onDelete, onDeleteAll, notify, confirmAction, fetchSessionById }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showPendingFor, setShowPendingFor] = useState(null); // exam ID




    // 1. Group by Exam ID first (to be robust)
    const examGroups = exams.reduce((acc, exam) => {
        // Students registered for this exam
        const registeredStudents = students.filter(s =>
            s.eligibleExams?.some(e => (e._id || e).toString() === exam._id.toString())
        );

        // Submissions for this exam
        const submissions = sessions.filter(s =>
            (s.examId?._id === exam._id || s.examId === exam._id) &&
            s.status !== 'in_progress'
        );

        // Registered but not in submissions
        const pendingStudents = registeredStudents.filter(rs =>
            !submissions.some(s => s.studentId?._id === rs._id || s.studentId === rs._id)
        ).map(student => {
            const activeSession = sessions.find(s =>
                (s.studentId?._id === student._id || s.studentId === student._id) &&
                (s.examId?._id === exam._id || s.examId === exam._id) &&
                s.status === 'in_progress'
            );
            return { ...student, status: activeSession ? 'Started' : 'Not Started' };
        });

        acc[exam._id] = {
            exam,
            submissions,
            pendingStudents,
            isFullyCompleted: pendingStudents.length === 0 && registeredStudents.length > 0
        };
        return acc;
    }, {});

    // Filter by search
    const filteredExamIds = Object.keys(examGroups).filter(id => {
        const { exam, submissions } = examGroups[id];
        if (exam.title.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        return submissions.some(s =>
            s.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleSendEmail = async (sessionId, email) => {
        try {
            const res = await fetch(`${API_BASE_URL}/sessions/email-results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionIds: [sessionId] })
            });
            const data = await res.json();
            if (data.success) notify(`Result email sent to ${email}`);
            else notify(data.error || 'Failed to send email', 'error');
        } catch (err) {
            console.error(err);
            notify('Failed to send email', 'error');
        }
    };

    const handleBulkEmail = async (examTitle, examSessions) => {
        const sessionIds = examSessions.map(s => s._id);
        confirmAction(
            'Confirm Bulk Email',
            `Send results to all ${sessionIds.length} students for ${examTitle}?`,
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/sessions/email-results`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionIds })
                    });
                    const data = await res.json();
                    if (data.success) notify(`Bulk emails sent successfully!`);
                    else notify(data.error || 'Failed to send bulk emails', 'error');
                } catch (err) {
                    console.error(err);
                    notify('Failed to send bulk emails', 'error');
                }
            },
            'info'
        );
    };

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">Examination Results</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and manage student performance across all assessments.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by student or exam..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/1 transition-all shadow-xl"
                        />
                    </div>

                    {sessions.length > 0 && (
                        <button
                            onClick={onDeleteAll}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/30 rounded-2xl transition-all text-sm font-black uppercase tracking-widest active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {filteredExamIds.map(examId => {
                const { exam, submissions, pendingStudents, isFullyCompleted } = examGroups[examId];
                if (submissions.length === 0 && pendingStudents.length === 0) return null;

                return (
                    <div key={examId} className="mb-10 bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="bg-gray-900/50 p-5 md:p-6 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isFullyCompleted ? 'bg-green-500/10' : 'bg-cyan-500/10'}`}>
                                    {isFullyCompleted ? <CheckCircle className="text-green-400 w-5 h-5" /> : <Award className="text-cyan-400 w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg text-white leading-tight truncate">{exam.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isFullyCompleted ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'}`}>
                                            {isFullyCompleted ? 'Completed' : 'Pending Submissions'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{submissions.length} Submissions</span>
                                        <span className="text-gray-700 text-xs">•</span>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${pendingStudents.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {pendingStudents.length} Remaining
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {pendingStudents.length > 0 && (
                                    <button
                                        onClick={() => setShowPendingFor(showPendingFor === examId ? null : examId)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-all border border-gray-600"
                                        title="See who hasn't submitted"
                                    >
                                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                                        {showPendingFor === examId ? 'Close List' : 'Pending Students'}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleBulkEmail(exam.title, submissions)}
                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                                >
                                    <Mail className="w-4 h-4" /> Send Bulk
                                </button>
                            </div>
                        </div>

                        {showPendingFor === examId && (
                            <div className="bg-gray-900/80 p-6 border-b border-gray-700 animate-in slide-in-from-top-4 transition-all">
                                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Left Students (Not Submitted)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {pendingStudents.map(s => (
                                        <div key={s._id} className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex items-center justify-between group">
                                            <div className="min-w-0">
                                                <div className="font-bold text-xs text-white truncate">{s.name}</div>
                                                <div className="text-[10px] text-gray-500 truncate">{s.email}</div>
                                                <div className={`mt-1 text-[9px] font-black uppercase tracking-widest inline-block px-1.5 py-0.5 rounded ${s.status === 'Started' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse' : 'bg-gray-700 text-gray-500 border border-gray-600'}`}>
                                                    {s.status === 'Started' ? 'In Progress' : 'Not Started'}
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono text-cyan-500/50 group-hover:text-cyan-400 transition-colors uppercase ml-2 shrink-0 whitespace-nowrap">
                                                ID: {s.studentId}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-900/30 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                    <tr>
                                        <th className="p-5">Student Information</th>
                                        <th className="p-5">Final Score</th>
                                        <th className="p-5">Integrity</th>
                                        <th className="p-5">Submission Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {submissions.map(session => (
                                        <tr key={session._id} className="hover:bg-gray-700/20 border-b border-gray-700/30 last:border-0 transition-colors">
                                            <td className="p-5">
                                                <div className="font-bold text-white text-sm">{session.studentId?.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{session.studentId?.email}</div>
                                                <div className="text-[10px] text-cyan-500/80 font-bold uppercase mt-1 px-1.5 py-0.5 bg-cyan-500/5 rounded border border-cyan-500/10 inline-block whitespace-nowrap">
                                                    ID: {session.studentId?.studentId || 'N/A'}
                                                </div>
                                                <div className="text-[9px] text-gray-600 font-bold uppercase mt-1 block">
                                                    {session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <div className="font-black font-mono text-lg text-cyan-400">
                                                        {session.score !== undefined ? session.score : '-'}<span className="text-gray-600 text-sm font-medium">/{session.maxScore || '-'}</span>
                                                    </div>
                                                    {session.sectionResults && session.sectionResults.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {session.sectionResults.map((sec, i) => (
                                                                <div key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-900/80 rounded border border-gray-700 text-gray-400 font-bold uppercase tracking-tighter" title={sec.sectionTitle}>
                                                                    {sec.score}/{sec.maxScore}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 w-12 bg-gray-900 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${session.integrityScore > 80 ? 'bg-green-500' : session.integrityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${session.integrityScore}%` }}></div>
                                                    </div>
                                                    <span className={`text-xs font-black font-mono ${session.integrityScore > 80 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {session.integrityScore}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${session.status === 'completed' || session.status === 'submitted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => fetchSessionById(session._id)}
                                                        className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                                                        title="View Activity Logs"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendEmail(session._id, session.studentId?.email)}
                                                        className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                                                        title="Email Result"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(session._id)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete Result"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {filteredExamIds.length === 0 && (
                <div className="text-center py-24 bg-gray-800/10 rounded-3xl border-2 border-dashed border-gray-800/50">
                    <Award className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-30" />
                    <p className="text-gray-500 font-bold">No exam results available yet.</p>
                </div>
            )}
        </div>
    );
};

const ViewLog = ({ selectedSessionLog, setActiveTab }) => {
    if (!selectedSessionLog) return <div className="p-8 text-center text-gray-500 italic">No session selected for viewing logs.</div>;
    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <button onClick={() => setActiveTab('monitoring')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 font-medium bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors w-fit">&larr; Back to Monitoring</button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-800 pb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">{selectedSessionLog.studentId?.name}</h2>
                    <p className="text-cyan-500 font-mono text-sm mt-1">ID: {selectedSessionLog._id}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-black uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {selectedSessionLog.status}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Integrity Score</div>
                    <div className={`text-3xl font-black ${selectedSessionLog.integrityScore > 80 ? 'text-green-400' : 'text-red-400'}`}>{selectedSessionLog.integrityScore?.toFixed(0)}%</div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Tab Switches</div>
                    <div className="text-3xl font-black text-white">{selectedSessionLog.metrics?.tabSwitchCount || 0}</div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Focus Lost Duration</div>
                    <div className="text-3xl font-black text-white">{Math.round(selectedSessionLog.metrics?.totalFocusLostDuration || 0)}<span className="text-sm font-medium text-gray-500 ml-1">sec</span></div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Lockdown Breaches</div>
                    <div className="text-3xl font-black text-white">{selectedSessionLog.metrics?.lockdownBreachCount || 0}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6 mb-8">

                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Face Absent</div>
                    <div className="text-2xl font-black text-white">{selectedSessionLog.metrics?.faceAbsentCount || 0}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Multiple Faces</div>
                    <div className="text-2xl font-black text-white">{selectedSessionLog.metrics?.multipleFacesCount || 0}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Gaze Deviations</div>
                    <div className="text-2xl font-black text-white">{selectedSessionLog.metrics?.gazeDeviationCount || 0}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Face Mismatch</div>
                    <div className="text-2xl font-black text-white">{selectedSessionLog.metrics?.faceMismatchCount || 0}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 px-1">Camera Blocked</div>
                    <div className="text-2xl font-black text-white">{selectedSessionLog.metrics?.cameraBlockedCount || 0}</div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-2xl">

                <h3 className="font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-gray-700 pb-4">
                    <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center"><AlertTriangle className="text-red-500 w-5 h-5" /></div>
                    Critical Event Timeline
                </h3>
                <div className="space-y-4">
                    {selectedSessionLog.eventLogs && selectedSessionLog.eventLogs.length > 0 ? (
                        selectedSessionLog.eventLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${log.severity === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}></div>
                                    <div className="w-0.5 h-full bg-gray-700 group-last:hidden mt-1"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <span className={`font-black text-sm uppercase tracking-wider ${log.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {log.eventType.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-0.5 rounded border border-gray-800">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{log.details || 'Suspicious behavior detected and logged by security system.'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20"><Monitor className="text-green-500 w-8 h-8" /></div>
                            <h4 className="text-white font-bold">Perfect Record</h4>
                            <p className="text-gray-500 text-sm mt-1">No integrity breaches or suspicious events recorded for this session.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingsPage = ({ notify }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        const email = localStorage.getItem('adminEmail') || 'admin@parikshax.com';

        try {
            const res = await fetch(`${API_BASE_URL}/admin/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, oldPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                notify('Password changed successfully');
                setOldPassword('');
                setNewPassword('');
            } else {
                notify(data.error || 'Failed to change password', 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Server error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Settings & Preferences</h2>

            <div className="max-w-3xl space-y-8">
                {/* General Settings */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 text-white">General Preferences</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div>
                            <span className="font-bold text-gray-300 block">Enforce Kiosk Mode</span>
                            <span className="text-xs text-gray-500">Force full-screen examination window for all students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs font-bold text-green-500 uppercase tracking-wider">Active</div>
                            <div className="w-12 h-6 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-80" title="Always Enabled">
                                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2 border-b border-gray-700 pb-4">
                        <Lock className="w-5 h-5 text-cyan-400" /> Account Security
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={5}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:border-cyan-500 outline-none transition-colors"
                                />
                                <p className="text-[10px] text-gray-500 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Minimum 5 characters required</p>
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20 active:scale-95 flex items-center gap-2"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Update Password</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionLog, setSelectedSessionLog] = useState(null);
    const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);

    // Custom UI Notification State
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

    const notify = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const confirmAction = (title, message, onConfirm, type = 'danger') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            type
        });
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const initFetch = async () => {
            setIsRefreshing(true);
            await Promise.all([fetchExams(), fetchStudents(), fetchSessions()]);
            setIsRefreshing(false);
        };
        initFetch();

        const interval = setInterval(fetchSessions, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/exams`);
            const data = await res.json();
            if (data.success) setExams(data.exams);
        } catch (err) {
            console.error(err);
            notify('Failed to load exams', 'error');
        }
    };

    const fetchStudents = async () => {
        try {
            console.log('Fetching students from:', `${API_BASE_URL}/students`);
            const res = await fetch(`${API_BASE_URL}/students`);
            console.log('Fetch response status:', res.status);
            const data = await res.json();
            console.log('Fetch data:', data);
            if (data.success) setStudents(data.students);
        } catch (err) {
            console.error(err);
            notify('Failed to load students', 'error');
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/sessions`);
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (err) {
            console.error(err);
            notify('Failed to load sessions', 'error');
        }
    };

    const fetchSessionById = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/sessions/${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedSessionLog(data.session);
                setActiveTab('view-log');
            } else {
                notify(data.error, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to load session details', 'error');
        }
    };

    const handleDeleteExam = async (id) => {
        confirmAction(
            'Delete Exam',
            'Are you sure you want to delete this exam? All associated student records and sessions will also be removed. This action is irreversible.',
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/exams/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await fetchExams();
                        await fetchStudents();
                        await fetchSessions();
                        notify('Exam deleted successfully');
                    } else {
                        notify(data.error, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    notify('Failed to delete exam', 'error');
                }
            }
        );
    };

    const handleDeleteStudent = async (id) => {
        confirmAction(
            'Delete Student',
            'Are you sure you want to delete this student registration? They will no longer have access to the assigned exam.',
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await fetchStudents(); // Refresh complete list and stats
                        notify('Student record deleted');
                    } else {
                        notify(data.error, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    notify('Failed to delete student', 'error');
                }
            }
        );
    };

    const handleDeleteSession = async (id) => {
        confirmAction(
            'Delete Result',
            'Are you sure you want to delete this exam result and session log?',
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/sessions/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await fetchSessions(); // Sync with DB
                        notify('Session record deleted');
                    } else {
                        notify(data.error, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    notify('Failed to delete session', 'error');
                }
            }
        );
    };

    const handleDeleteAllSessions = async () => {
        confirmAction(
            'CRITICAL: Clear All Data',
            'Are you sure you want to delete ALL sessions and results? This will wipe the entire history and cannot be undone.',
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/sessions/all`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await fetchSessions();
                        notify('All records cleared successfully');
                    } else {
                        notify(data.error, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    notify('Failed to clear data', 'error');
                }
            }
        );
    };

    const handleUpdateExam = (updatedExam) => {
        setExams(exams.map(e => e._id === updatedExam._id ? updatedExam : e));
    };

    const getCompletedExamsCount = () => {
        return exams.filter(exam => {
            const registered = students.filter(s =>
                s.eligibleExams?.some(e => (e._id || e).toString() === exam._id.toString())
            );

            if (registered.length === 0) return false;

            return registered.every(student =>
                sessions.some(s =>
                    s.examId &&
                    (s.examId._id || s.examId).toString() === exam._id.toString() &&
                    s.studentId &&
                    (s.studentId._id || s.studentId).toString() === student._id.toString() &&
                    ['completed', 'submitted'].includes(s.status)
                )
            );
        }).length;
    };

    const handleLogout = () => {
        confirmAction(
            'Confirm Logout',
            'Are you sure you want to log out?',
            () => {
                // Clear auth state
                localStorage.removeItem('adminAuth');

                // Switch back to locked mode if needed
                if (window.electronAPI) {
                    window.electronAPI.setExamMode(); // Default back to secure
                }
                navigate('/admin/login');
            },
            'danger'
        );
    };

    return (
        <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shrink-0">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        ParikshaX
                    </h1>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto min-w-0">
                    {activeTab === 'dashboard' && (
                        <div className="p-4 md:p-8">
                            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><FilePlus className="w-6 h-6" /></div>
                                        <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">Total</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold mb-1">{exams.length}</div>
                                    <div className="text-sm text-gray-500">Exams Created</div>
                                </div>
                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Users className="w-6 h-6" /></div>
                                        <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">Registered</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold mb-1">{students.length}</div>
                                    <div className="text-sm text-gray-500">Total Candidates</div>
                                </div>
                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Eye className="w-6 h-6" /></div>
                                        <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded animate-pulse">Live</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold mb-1">{sessions.filter(s => s.status === 'in_progress').length}</div>
                                    <div className="text-sm text-gray-500">Active Sessions</div>
                                </div>
                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Award className="w-6 h-6" /></div>
                                        <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">Finished</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold mb-1">
                                        {getCompletedExamsCount()}
                                    </div>
                                    <div className="text-sm text-gray-500">Completed Exams</div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                                <div
                                    onClick={() => setActiveTab('create-exam')}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all group"
                                >
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Create New Exam
                                    </h3>
                                    <p className="text-blue-100 text-sm">Design a new assessment with custom questions and difficulty.</p>
                                </div>
                                <div
                                    onClick={() => setActiveTab('monitoring')}
                                    className="bg-gray-800 border border-gray-700 hover:border-cyan-500 rounded-xl p-6 cursor-pointer transition-all group"
                                >
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-cyan-400">
                                        <Monitor className="w-5 h-5" /> View Live Monitor
                                    </h3>
                                    <p className="text-gray-400 text-sm">Watch active exam sessions in real-time with AI integrity checks.</p>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 md:p-6 mb-8 overflow-hidden">
                                <h3 className="font-bold mb-4 text-lg">Your Exam Library</h3>
                                {exams.length === 0 && <div className="text-gray-500 text-center py-8">No exams created yet.</div>}
                                <div className="space-y-3">
                                    {exams.map(exam => (
                                        <div key={exam._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/50 p-4 rounded-lg hover:bg-gray-700/30 transition-colors gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1 wrap">
                                                    <span className="font-bold text-lg truncate">{exam.title}</span>
                                                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-cyan-900/30 text-cyan-400 border border-cyan-800 font-mono tracking-tighter">{exam.code}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 block">
                                                    {exam.sections?.reduce((sum, section) => sum + (section.questions?.length || 0), 0)} Questions • {exam.duration} Minutes Duration
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setSelectedExamForQuestions(exam);
                                                        setActiveTab('view-questions');
                                                    }}
                                                    className="flex-1 sm:flex-none text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm font-medium border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> <span className="sm:hidden lg:inline">View Qs</span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('students')}
                                                    className="flex-1 sm:flex-none text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm font-medium border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-center"
                                                >
                                                    <span className="sm:hidden lg:inline">Manage </span>Students
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(exam.code);
                                                        notify(`Exam Code Copied: ${exam.code}`);
                                                    }}
                                                    className="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 rounded text-sm font-bold transition-all shadow-lg shadow-cyan-900/20 text-center"
                                                >
                                                    Copy Code
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExam(exam._id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'create-exam' && <CreateExam fetchExams={fetchExams} setActiveTab={setActiveTab} notify={notify} />}
                    {activeTab === 'students' && <StudentManagement students={students} setStudents={setStudents} exams={exams} onDelete={handleDeleteStudent} notify={notify} confirmAction={confirmAction} fetchStudents={fetchStudents} />}
                    {activeTab === 'monitoring' && <Monitoring sessions={sessions} setSelectedSessionLog={setSelectedSessionLog} setActiveTab={setActiveTab} onDelete={handleDeleteSession} onDeleteAll={handleDeleteAllSessions} confirmAction={confirmAction} fetchSessionById={fetchSessionById} />}
                    {activeTab === 'view-log' && <ViewLog selectedSessionLog={selectedSessionLog} setActiveTab={setActiveTab} />}
                    {activeTab === 'view-questions' && <QuestionManagement exam={selectedExamForQuestions} onBack={() => { setActiveTab('dashboard'); setSelectedExamForQuestions(null); }} onUpdate={handleUpdateExam} notify={notify} />}
                    {activeTab === 'results' && <Results sessions={sessions} students={students} exams={exams} onDelete={handleDeleteSession} onDeleteAll={handleDeleteAllSessions} notify={notify} confirmAction={confirmAction} fetchSessionById={fetchSessionById} />}
                    {activeTab === 'settings' && <SettingsPage notify={notify} />}
                </main>
            </div>

            {/* Refresh Indicator */}
            {isRefreshing && (
                <div className="fixed top-6 right-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-3 backdrop-blur-md animate-pulse z-[1000]">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    Updating Data...
                </div>
            )}

            {/* Notification Overlays */}
            <div className="fixed bottom-0 right-0 p-8 space-y-4 pointer-events-none z-[9999]">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        />
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default AdminDashboard;

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
    ArrowLeft,
    Edit3,
    Upload,
    Download,
    FileSpreadsheet,
    Menu,
    Mail,
    Send,
    Search,
    Lock,
    Copy,
    X,
    Clock,
    ShieldCheck,
    RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import BrandMark from '../components/BrandMark';

/* ------------------------------------------------------------------ */
/*  Shared UI primitives                                               */
/* ------------------------------------------------------------------ */

const Toast = ({ message, type, onClose }) => (
    <div className="flex items-start gap-3 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        {type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
        {type !== 'success' && type !== 'error' && <AlertCircle className="w-5 h-5 text-brand-600 shrink-0" />}
        <span className="flex-1 text-sm text-slate-700">{message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Dismiss">
            <X className="w-4 h-4" />
        </button>
    </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onCancel}></div>
            <div className="relative modal-panel max-w-md p-6">
                <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                        {type === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="btn btn-secondary">
                        {cancelText || 'Cancel'}
                    </button>
                    <button onClick={onConfirm} className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PageHeader = ({ title, description, actions, onBack, backLabel }) => (
    <div className="mb-6">
        {onBack && (
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {backLabel || 'Back'}
            </button>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 truncate">{title}</h1>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
    </div>
);

const PageContainer = ({ children, narrow }) => (
    <div className={`p-4 md:p-8 ${narrow ? 'max-w-5xl' : 'max-w-7xl'} mx-auto w-full`}>{children}</div>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="empty-state">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

const scoreTone = (score) => (score > 80 ? 'success' : score > 50 ? 'warning' : 'danger');
const toneText = { success: 'text-emerald-700', warning: 'text-amber-700', danger: 'text-red-700' };
const toneBar = { success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500' };

const IntegrityMeter = ({ score }) => {
    const tone = scoreTone(score ?? 0);
    return (
        <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${toneBar[tone]}`} style={{ width: `${score ?? 0}%` }} />
            </div>
            <span className={`text-sm font-semibold tabular-nums ${toneText[tone]}`}>{Math.round(score ?? 0)}%</span>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-exam', label: 'Create Exam', icon: FilePlus },
    { id: 'students', label: 'Candidates', icon: Users },
    { id: 'monitoring', label: 'Live Monitoring', icon: Eye },
    { id: 'results', label: 'Results', icon: Award },
];

const PAGE_TITLES = {
    'dashboard': 'Dashboard',
    'create-exam': 'Create Exam',
    'students': 'Candidates',
    'monitoring': 'Live Monitoring',
    'view-log': 'Session Report',
    'view-questions': 'Edit Exam',
    'results': 'Results',
    'settings': 'Settings',
};

const NavButton = ({ id, label, icon: Icon, badge, active, onSelect }) => (
    <button
        onClick={() => onSelect(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        <Icon className={`w-[18px] h-[18px] ${active ? 'text-brand-300' : ''}`} />
        <span className="flex-1 text-left">{label}</span>
        {badge > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold flex items-center justify-center">{badge}</span>
        )}
    </button>
);

const Sidebar = ({ activeTab, setActiveTab, handleLogout, isOpen, setIsOpen, liveCount }) => {
    const onSelect = (id) => { setActiveTab(id); setIsOpen(false); };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 flex flex-col h-screen z-50 transition-transform duration-200 lg:translate-x-0 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 px-5 flex justify-between items-center border-b border-white/10">
                    <BrandMark tone="light" subtitle="Admin Console" />
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 rounded-md text-slate-400 hover:bg-white/10" aria-label="Close menu">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Main</div>
                    {NAV_ITEMS.map(item => (
                        <NavButton key={item.id} {...item} badge={item.id === 'monitoring' ? liveCount : 0} active={activeTab === item.id} onSelect={onSelect} />
                    ))}
                    <div className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">System</div>
                    <NavButton id="settings" label="Settings" icon={Settings} active={activeTab === 'settings'} onSelect={onSelect} />
                </nav>

                <div className="p-3 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                            {(localStorage.getItem('adminEmail') || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">Administrator</div>
                            <div className="text-xs text-slate-400 truncate">{localStorage.getItem('adminEmail') || 'admin'}</div>
                        </div>
                        <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Sign out">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

/* ------------------------------------------------------------------ */
/*  Exam builder building blocks (shared by Create + Edit)             */
/* ------------------------------------------------------------------ */

const idxToLetter = (idx) => String.fromCharCode(65 + idx);

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

const parseQuestionRows = (data) => data.map(row => {
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

const SectionsEditor = ({ sections, activeSectionIndex, setActiveSectionIndex, onTitleChange, onDurationChange, onAdd, onRemove }) => {
    const totalDuration = sections.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h2 className="card-title">Sections</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{sections.length} sections · {totalQuestions} questions · {totalDuration} min total</p>
                </div>
                <button onClick={onAdd} className="btn btn-secondary btn-sm"><Plus className="w-4 h-4" /> Add section</button>
            </div>
            <div className="divide-y divide-slate-100">
                {sections.map((section, idx) => {
                    const active = idx === activeSectionIndex;
                    return (
                        <div key={idx} className={`flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 transition-colors ${active ? 'bg-brand-50/60' : ''}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center shrink-0 ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => onTitleChange(idx, e.target.value)}
                                    className="input py-2 font-medium"
                                    placeholder="Section name"
                                    aria-label={`Section ${idx + 1} name`}
                                />
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={section.duration}
                                        onChange={(e) => onDurationChange(idx, e.target.value)}
                                        className="input py-2 w-20 text-center tabular-nums"
                                        aria-label={`Section ${idx + 1} duration in minutes`}
                                    />
                                    <span className="text-xs text-slate-500">min</span>
                                </div>
                                <button
                                    onClick={() => setActiveSectionIndex(idx)}
                                    className={`btn btn-sm w-[118px] ${active ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {active ? 'Editing' : 'Edit'} · {section.questions.length} Qs
                                </button>
                                <button onClick={() => onRemove(idx)} className="btn-icon-danger" title="Remove section">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuestionBuilder = ({ sectionTitle, qText, setQText, qOptions, setQOptions, qCorrect, setQCorrect, onSubmit, onUpload, isEditing, onCancelEdit }) => (
    <div className="card">
        <div className="card-header">
            <div className="flex items-center gap-2 min-w-0">
                {isEditing ? <Edit3 className="w-4 h-4 text-brand-600" /> : <Plus className="w-4 h-4 text-brand-600" />}
                <h2 className="card-title">{isEditing ? 'Edit question' : 'Add question'}</h2>
                <span className="badge badge-brand truncate">{sectionTitle}</span>
            </div>
            <div className="flex items-center gap-2">
                {!isEditing ? (
                    <>
                        <button onClick={downloadQuestionTemplate} className="btn btn-ghost btn-sm">
                            <Download className="w-3.5 h-3.5" /> Template
                        </button>
                        <label className="btn btn-secondary btn-sm cursor-pointer">
                            <Upload className="w-3.5 h-3.5" /> Import Excel
                            <input type="file" accept=".xlsx, .xls" onChange={onUpload} className="hidden" />
                        </label>
                    </>
                ) : (
                    <button onClick={onCancelEdit} className="btn btn-ghost btn-sm">Cancel edit</button>
                )}
            </div>
        </div>
        <div className="card-body space-y-5">
            <div>
                <label className="label">Question</label>
                <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Type the question here…"
                    className="input resize-y"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="label mb-0">Options</span>
                    <span className="text-xs text-slate-500">Select the circle to mark the correct answer</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qOptions.map((opt, idx) => {
                        const correct = qCorrect === idx;
                        return (
                            <div key={idx} className={`flex items-center gap-2 rounded-lg border p-1.5 pl-2 transition-colors ${correct ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setQCorrect(idx)}
                                    className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 transition-colors ${correct ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    title={`Mark option ${idxToLetter(idx)} as correct`}
                                >
                                    {correct ? <CheckCircle className="w-4 h-4" /> : idxToLetter(idx)}
                                </button>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...qOptions];
                                        newOpts[idx] = e.target.value;
                                        setQOptions(newOpts);
                                    }}
                                    placeholder={`Option ${idxToLetter(idx)}`}
                                    className="flex-1 min-w-0 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 py-1.5"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={onSubmit} className="btn btn-primary">
                    {isEditing ? <><Save className="w-4 h-4" /> Update question</> : <><Plus className="w-4 h-4" /> Add question</>}
                </button>
            </div>
        </div>
    </div>
);

const QuestionList = ({ sectionTitle, questions = [], onEdit, onDelete }) => (
    <div className="card">
        <div className="card-header">
            <h2 className="card-title">Questions · {sectionTitle}</h2>
            <span className="badge badge-neutral">{questions.length} items</span>
        </div>
        {questions.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No questions in this section yet. Add one above or import from Excel.</div>
        ) : (
            <ol className="divide-y divide-slate-100">
                {questions.map((q, i) => (
                    <li key={i} className="flex justify-between items-start gap-4 px-5 py-4 group hover:bg-slate-50/70">
                        <div className="flex gap-3 min-w-0">
                            <span className="text-sm font-semibold text-slate-400 tabular-nums pt-px shrink-0 w-6">{i + 1}.</span>
                            <div className="min-w-0 space-y-2">
                                <p className="text-sm font-medium text-slate-900 leading-relaxed">{q.questionText}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`text-xs flex items-center gap-2 ${oIdx === q.correctOption ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold shrink-0 ${oIdx === q.correctOption ? 'bg-emerald-100' : 'bg-slate-100'}`}>{idxToLetter(oIdx)}</span>
                                            <span className="truncate">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <button onClick={() => onEdit(i)} className="btn-icon" title="Edit question">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => onDelete(i)} className="btn-icon-danger" title="Delete question">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ol>
        )}
    </div>
);

/* ------------------------------------------------------------------ */
/*  Candidates                                                         */
/* ------------------------------------------------------------------ */

const StudentManagement = ({ students, exams, onDelete, notify, confirmAction, fetchStudents }) => {
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
            'Confirm registration',
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
                    'Excel import',
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
        e.target.value = '';
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
            console.error('Template download failed:', err);
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
            'Resend credentials',
            `Resend credentials to all ${examStudents.length} registered students? This will send ${examStudents.length} emails.`,
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
            'Remove all candidates',
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

    const subTabs = (
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm font-medium mb-6">
            {[
                { id: 'by-exam', label: 'By exam' },
                { id: 'all-students', label: `All candidates (${students.length})` },
            ].map(t => (
                <button
                    key={t.id}
                    onClick={() => { setActiveSubTab(t.id); if (t.id === 'by-exam') setView('list-exams'); }}
                    className={`px-3.5 py-1.5 rounded-md transition-colors ${activeSubTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );

    if (activeSubTab === 'all-students') {
        const filteredAllStudents = students.filter(s =>
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <PageContainer>
                <PageHeader title="Candidates" description="All candidates registered across every exam." />
                {subTabs}

                <div className="card overflow-hidden">
                    <div className="card-header">
                        <h2 className="card-title">Candidate directory</h2>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search name, email or ID…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-9 py-2"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Candidate ID</th>
                                    <th>Assigned exams</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAllStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-14 text-center text-slate-500">No candidates found.</td>
                                    </tr>
                                )}
                                {filteredAllStudents.map((s) => (
                                    <tr key={s._id}>
                                        <td>
                                            <div className="font-medium text-slate-900">{s.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{s.email}</div>
                                        </td>
                                        <td>
                                            <span className="code-chip">{s.studentId || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                                                {s.eligibleExams && s.eligibleExams.length > 0 ? (
                                                    s.eligibleExams.map((exam, idx) => {
                                                        if (!exam) return null; // Skip if null
                                                        // Handle both populated objects and raw IDs
                                                        const examId = exam._id || exam;
                                                        const examTitle = exam.title || 'Exam';
                                                        return (
                                                            <span key={examId || idx} className="badge badge-neutral max-w-full truncate" title={examTitle}>
                                                                {examTitle}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-slate-400 text-xs">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button onClick={() => onDelete(s._id)} className="btn-icon-danger" title="Delete candidate permanently">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (view === 'list-exams') {
        return (
            <PageContainer>
                <PageHeader title="Candidates" description="Select an exam to register and manage its candidates." />
                {subTabs}

                {exams.length === 0 ? (
                    <EmptyState icon={FileText} title="No exams yet" description="Create an exam first, then register candidates for it." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {exams.map(exam => {
                            const count = students.filter(s => s.eligibleExams?.some(id => id && (id._id || id).toString() === exam._id.toString())).length;
                            return (
                                <button
                                    key={exam._id}
                                    onClick={() => handleExamClick(exam)}
                                    className="card p-5 text-left hover:border-brand-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 truncate">{exam.title}</h3>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 shrink-0 mt-0.5" />
                                    </div>
                                    <div className="mt-2"><span className="code-chip">{exam.code}</span></div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {count} registered</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} min</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                onBack={() => setView('list-exams')}
                backLabel="All exams"
                title={selectedExam.title}
                description={<>Exam code <span className="code-chip ml-1">{selectedExam.code}</span></>}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="space-y-6">
                    {/* Add Single */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Register a candidate</h2>
                        </div>
                        <form onSubmit={handleSingleRegister} className="card-body space-y-4">
                            <div>
                                <label className="label" htmlFor="newName">Full name</label>
                                <input id="newName" type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Aditi Rao" className="input" />
                            </div>
                            <div>
                                <label className="label" htmlFor="newEmail">Email address</label>
                                <input id="newEmail" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="candidate@university.edu" className="input" />
                            </div>
                            <label htmlFor="sendEmailSingle" className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="sendEmailSingle" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="checkbox" />
                                <span className="text-sm text-slate-600">Email login credentials to candidate</span>
                            </label>
                            <button type="submit" className="btn btn-primary w-full"><Plus className="w-4 h-4" /> Register candidate</button>
                        </form>
                    </div>

                    {/* Bulk Upload */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Bulk registration</h2>
                            <button onClick={downloadTemplate} className="btn btn-ghost btn-sm">
                                <Download className="w-3.5 h-3.5" /> Template
                            </button>
                        </div>
                        <div className="card-body space-y-4">
                            <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer transition-colors text-center">
                                <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Upload Excel or CSV</span>
                                <span className="text-xs text-slate-500">Columns: Name, Email</span>
                                <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                            </label>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-slate-400">or paste</span></div>
                            </div>

                            <div>
                                <label className="label" htmlFor="bulkData">One candidate per line (Name, Email)</label>
                                <textarea
                                    id="bulkData"
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    placeholder={"John Doe, john@example.com\nJane Smith, jane@example.com"}
                                    className="input h-24 font-mono text-xs"
                                ></textarea>
                            </div>
                            <label htmlFor="sendEmailBulk" className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="sendEmailBulk" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="checkbox" />
                                <span className="text-sm text-slate-600">Email login credentials to candidates</span>
                            </label>
                            <button onClick={handleBulkRegister} className="btn btn-secondary w-full">Register from text</button>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 card overflow-hidden h-fit">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Registered candidates</h2>
                            <p className="text-xs text-slate-500 mt-0.5">{examStudents.length} total</p>
                        </div>
                        {examStudents.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button onClick={downloadStudentList} className="btn btn-secondary btn-sm" title="Download Excel list (Name, Email)">
                                    <Download className="w-3.5 h-3.5" /> Export
                                </button>
                                <button onClick={handleBulkResendCredentials} className="btn btn-secondary btn-sm">
                                    <Mail className="w-3.5 h-3.5" /> Email all
                                </button>
                                <button onClick={handleDeleteAllForExam} className="btn btn-danger-outline btn-sm">
                                    <Trash2 className="w-3.5 h-3.5" /> Remove all
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table min-w-[600px]">
                            <thead>
                                <tr>
                                    <th>Candidate ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examStudents.length === 0 && <tr><td colSpan="4" className="py-14 text-center text-slate-500">No candidates registered yet.</td></tr>}
                                {examStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td><span className="code-chip">{student.studentId}</span></td>
                                        <td className="font-medium text-slate-900">{student.name}</td>
                                        <td className="text-slate-500 truncate max-w-[200px]" title={student.email}>{student.email}</td>
                                        <td>
                                            <div className="flex justify-end items-center gap-1">
                                                <button className="btn-icon" title="Copy candidate ID" onClick={() => { navigator.clipboard.writeText(student.studentId); notify('ID copied to clipboard'); }}>
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button className="btn-icon" title="Email credentials" onClick={() => handleResendCredentials(student._id)}>
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDelete(student._id)} className="btn-icon-danger" title="Delete candidate">
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
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Create Exam                                                        */
/* ------------------------------------------------------------------ */

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

                const newQuestions = parseQuestionRows(data);

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

    const handleDeleteQuestion = (i) => {
        const newSections = [...sections];
        newSections[activeSectionIndex].questions.splice(i, 1);
        setSections(newSections);
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
                notify('Exam created successfully');
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
        <PageContainer narrow>
            <PageHeader
                title="Create exam"
                description="Define sections with individual time limits, then add questions to each."
                actions={<button onClick={handleSaveExam} className="btn btn-primary"><Save className="w-4 h-4" /> Save exam</button>}
            />

            <div className="space-y-6">
                <div className="card card-body">
                    <label className="label" htmlFor="examTitle">Exam title</label>
                    <input id="examTitle" type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. Placement Assessment 2026" className="input" />
                </div>

                <SectionsEditor
                    sections={sections}
                    activeSectionIndex={activeSectionIndex}
                    setActiveSectionIndex={setActiveSectionIndex}
                    onTitleChange={handleSectionTitleChange}
                    onDurationChange={handleSectionDurationChange}
                    onAdd={handleAddSection}
                    onRemove={handleRemoveSection}
                />

                <QuestionBuilder
                    sectionTitle={sections[activeSectionIndex].title}
                    qText={qText} setQText={setQText}
                    qOptions={qOptions} setQOptions={setQOptions}
                    qCorrect={qCorrect} setQCorrect={setQCorrect}
                    onSubmit={handleAddQuestion}
                    onUpload={handleBulkQuestionUpload}
                    isEditing={false}
                />

                <QuestionList
                    sectionTitle={sections[activeSectionIndex].title}
                    questions={sections[activeSectionIndex].questions}
                    onDelete={handleDeleteQuestion}
                />
            </div>
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Edit Exam                                                          */
/* ------------------------------------------------------------------ */

const QuestionManagement = ({ exam, onBack, onUpdate, notify }) => {
    const [examTitle, setExamTitle] = useState(exam.title);
    const [sections, setSections] = useState(exam.sections || []);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);

    // Question Form States
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);
    const [editingIndex, setEditingIndex] = useState(null);

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

                const newQuestions = parseQuestionRows(data);

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

    const resetForm = () => {
        setEditingIndex(null);
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
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
        } else {
            newSections[activeSectionIndex].questions.push(questionData);
        }

        setSections(newSections);
        resetForm();
    };

    const handleEditQuestion = (idx) => {
        const q = sections[activeSectionIndex].questions[idx];
        setQText(q.questionText);
        setQOptions([...q.options]);
        setQCorrect(q.correctOption);
        setEditingIndex(idx);
    };

    const handleDeleteQuestion = (i) => {
        const newSections = [...sections];
        newSections[activeSectionIndex].questions.splice(i, 1);
        setSections(newSections);
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
                notify('Exam updated successfully');
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
        <PageContainer narrow>
            <PageHeader
                onBack={onBack}
                backLabel="Back to dashboard"
                title={exam.title}
                description={<>Exam code <span className="code-chip ml-1">{exam.code}</span></>}
                actions={<button onClick={handleSaveExam} className="btn btn-primary"><Save className="w-4 h-4" /> Save changes</button>}
            />

            <div className="space-y-6">
                <div className="card card-body">
                    <label className="label" htmlFor="editExamTitle">Exam title</label>
                    <input id="editExamTitle" type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="input" />
                </div>

                <SectionsEditor
                    sections={sections}
                    activeSectionIndex={activeSectionIndex}
                    setActiveSectionIndex={setActiveSectionIndex}
                    onTitleChange={handleSectionTitleChange}
                    onDurationChange={handleSectionDurationChange}
                    onAdd={handleAddSection}
                    onRemove={handleRemoveSection}
                />

                <QuestionBuilder
                    sectionTitle={sections[activeSectionIndex]?.title}
                    qText={qText} setQText={setQText}
                    qOptions={qOptions} setQOptions={setQOptions}
                    qCorrect={qCorrect} setQCorrect={setQCorrect}
                    onSubmit={handleAddQuestion}
                    onUpload={handleBulkQuestionUpload}
                    isEditing={editingIndex !== null}
                    onCancelEdit={resetForm}
                />

                <QuestionList
                    sectionTitle={sections[activeSectionIndex]?.title}
                    questions={sections[activeSectionIndex]?.questions}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                />
            </div>
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Live Monitoring                                                    */
/* ------------------------------------------------------------------ */

const Monitoring = ({ sessions, onDelete, onDeleteAll, fetchSessionById }) => {
    const live = sessions.filter(s => s.status === 'in_progress');
    return (
        <PageContainer>
            <PageHeader
                title="Live monitoring"
                description={<span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {live.length} active {live.length === 1 ? 'session' : 'sessions'} · refreshes every 10 seconds
                </span>}
                actions={live.length > 0 && (
                    <button onClick={onDeleteAll} className="btn btn-danger-outline">
                        <Trash2 className="w-4 h-4" /> Clear all sessions
                    </button>
                )}
            />

            {live.length === 0 ? (
                <EmptyState icon={Monitor} title="No active sessions" description="Live camera feeds will appear here when candidates start their exams." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {live.map(session => {
                        const tone = scoreTone(session.integrityScore ?? 0);
                        return (
                            <div key={session._id} className="card overflow-hidden group">
                                <div className="bg-slate-900 aspect-video flex items-center justify-center relative overflow-hidden">
                                    {session.lastSnapshot ? (
                                        <img src={session.lastSnapshot} alt={`Live feed of ${session.studentId?.name || 'candidate'}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <Monitor className="text-slate-700 w-10 h-10" />
                                    )}
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                                        <span className={`w-1.5 h-1.5 rounded-full ${session.lastSnapshot ? 'bg-red-500' : 'bg-slate-400'}`} />
                                        {session.lastSnapshot ? 'LIVE' : 'WAITING'}
                                    </div>
                                    <button
                                        onClick={() => onDelete(session._id)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded md:opacity-0 md:group-hover:opacity-100 transition-all"
                                        title="Delete session"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{session.studentId?.name || 'Unknown candidate'}</h3>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{session.examId?.title}</p>
                                        </div>
                                        <span className={`badge ${tone === 'success' ? 'badge-success' : tone === 'warning' ? 'badge-warning' : 'badge-danger'}`}>
                                            {session.integrityScore?.toFixed(0)}%
                                        </span>
                                    </div>
                                    <button onClick={() => fetchSessionById(session._id)} className="btn btn-secondary btn-sm w-full mt-4">
                                        View activity log
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Results                                                            */
/* ------------------------------------------------------------------ */

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

    const visibleExamIds = filteredExamIds.filter(id => examGroups[id].submissions.length > 0 || examGroups[id].pendingStudents.length > 0);

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
            'Email results',
            `Send results to all ${sessionIds.length} candidates for ${examTitle}?`,
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/sessions/email-results`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionIds })
                    });
                    const data = await res.json();
                    if (data.success) notify(`Result emails sent successfully`);
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
        <PageContainer>
            <PageHeader
                title="Results"
                description="Scores, integrity and submission status for every exam."
                actions={<>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search candidate or exam…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-9"
                        />
                    </div>
                    {sessions.length > 0 && (
                        <button onClick={onDeleteAll} className="btn btn-danger-outline">
                            <Trash2 className="w-4 h-4" /> Clear all
                        </button>
                    )}
                </>}
            />

            <div className="space-y-6">
                {visibleExamIds.map(examId => {
                    const { exam, submissions, pendingStudents, isFullyCompleted } = examGroups[examId];

                    return (
                        <div key={examId} className="card overflow-hidden">
                            <div className="card-header">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h2 className="card-title truncate">{exam.title}</h2>
                                        <span className={`badge ${isFullyCompleted ? 'badge-success' : 'badge-warning'}`}>
                                            {isFullyCompleted ? 'All submitted' : 'In progress'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {submissions.length} submitted · <span className={pendingStudents.length > 0 ? 'text-amber-700 font-medium' : ''}>{pendingStudents.length} pending</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {pendingStudents.length > 0 && (
                                        <button onClick={() => setShowPendingFor(showPendingFor === examId ? null : examId)} className="btn btn-secondary btn-sm">
                                            <Users className="w-3.5 h-3.5" />
                                            {showPendingFor === examId ? 'Hide pending' : 'View pending'}
                                        </button>
                                    )}
                                    <button onClick={() => handleBulkEmail(exam.title, submissions)} className="btn btn-primary btn-sm">
                                        <Mail className="w-3.5 h-3.5" /> Email results
                                    </button>
                                </div>
                            </div>

                            {showPendingFor === examId && (
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Not yet submitted</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                        {pendingStudents.map(s => (
                                            <div key={s._id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-slate-900 truncate">{s.name}</div>
                                                    <div className="text-xs text-slate-500 truncate">{s.email}</div>
                                                    <div className="text-[11px] font-mono text-slate-400 mt-1">{s.studentId}</div>
                                                </div>
                                                <span className={`badge ${s.status === 'Started' ? 'badge-warning' : 'badge-neutral'}`}>
                                                    {s.status === 'Started' ? 'In progress' : 'Not started'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="table min-w-[760px]">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Score</th>
                                            <th>Integrity</th>
                                            <th>Status</th>
                                            <th>Submitted</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.length === 0 && (
                                            <tr><td colSpan="6" className="py-10 text-center text-slate-500">No submissions yet.</td></tr>
                                        )}
                                        {submissions.map(session => (
                                            <tr key={session._id}>
                                                <td>
                                                    <div className="font-medium text-slate-900">{session.studentId?.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{session.studentId?.email}</div>
                                                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{session.studentId?.studentId || 'N/A'}</div>
                                                </td>
                                                <td>
                                                    <div className="font-semibold text-slate-900 tabular-nums">
                                                        {session.score !== undefined ? session.score : '–'}
                                                        <span className="text-slate-400 font-normal"> / {session.maxScore || '–'}</span>
                                                    </div>
                                                    {session.sectionResults && session.sectionResults.length > 0 && (
                                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                                            {session.sectionResults.map((sec, i) => (
                                                                <span key={i} className="text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 tabular-nums" title={sec.sectionTitle}>
                                                                    {sec.sectionTitle ? `${sec.sectionTitle.slice(0, 3)} ` : ''}{sec.score}/{sec.maxScore}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td><IntegrityMeter score={session.integrityScore} /></td>
                                                <td>
                                                    <span className={`badge capitalize ${session.status === 'completed' || session.status === 'submitted' ? 'badge-success' : 'badge-brand'}`}>
                                                        {session.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-xs text-slate-500 whitespace-nowrap">
                                                    {session.endTime ? new Date(session.endTime).toLocaleString() : '–'}
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => fetchSessionById(session._id)} className="btn-icon" title="View activity log">
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleSendEmail(session._id, session.studentId?.email)} className="btn-icon" title="Email result">
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(session._id)} className="btn-icon-danger" title="Delete result">
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

                {visibleExamIds.length === 0 && (
                    <EmptyState icon={Award} title="No results yet" description="Results will appear here once candidates are registered and submit their exams." />
                )}
            </div>
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Session log                                                        */
/* ------------------------------------------------------------------ */

const ViewLog = ({ selectedSessionLog, setActiveTab }) => {
    if (!selectedSessionLog) return <PageContainer><EmptyState icon={FileText} title="No session selected" /></PageContainer>;

    const m = selectedSessionLog.metrics || {};
    const tone = scoreTone(selectedSessionLog.integrityScore ?? 0);
    const primary = [
        { label: 'Integrity score', value: `${selectedSessionLog.integrityScore?.toFixed(0)}%`, cls: toneText[tone] },
        { label: 'Tab switches', value: m.tabSwitchCount || 0 },
        { label: 'Focus lost', value: <>{Math.round(m.totalFocusLostDuration || 0)}<span className="text-sm font-normal text-slate-500 ml-1">sec</span></> },
        { label: 'Lockdown breaches', value: m.lockdownBreachCount || 0 },
    ];
    const secondary = [
        { label: 'Face absent', value: m.faceAbsentCount || 0 },
        { label: 'Multiple faces', value: m.multipleFacesCount || 0 },
        { label: 'Gaze deviations', value: m.gazeDeviationCount || 0 },
        { label: 'Face mismatch', value: m.faceMismatchCount || 0 },
        { label: 'Camera blocked', value: m.cameraBlockedCount || 0 },
    ];
    const isLive = selectedSessionLog.status === 'in_progress';

    return (
        <PageContainer>
            <PageHeader
                onBack={() => setActiveTab('monitoring')}
                backLabel="Back to monitoring"
                title={selectedSessionLog.studentId?.name || 'Session report'}
                description={<>Session <span className="code-chip ml-1">{selectedSessionLog._id}</span></>}
                actions={
                    <span className={`badge capitalize ${isLive ? 'badge-success' : 'badge-neutral'}`}>
                        {isLive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                        {selectedSessionLog.status?.replace(/_/g, ' ')}
                    </span>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {primary.map(({ label, value, cls }) => (
                    <div key={label} className="card p-5">
                        <div className="stat-label">{label}</div>
                        <div className={`text-2xl font-semibold mt-1 tabular-nums ${cls || 'text-slate-900'}`}>{value}</div>
                    </div>
                ))}
            </div>

            <div className="card mb-6">
                <dl className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {secondary.map(({ label, value }) => (
                        <div key={label} className="px-5 py-4">
                            <dt className="text-xs text-slate-500">{label}</dt>
                            <dd className={`text-lg font-semibold mt-0.5 tabular-nums ${value > 0 ? 'text-red-600' : 'text-slate-900'}`}>{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Event timeline</h2>
                    <span className="badge badge-neutral">{selectedSessionLog.eventLogs?.length || 0} events</span>
                </div>
                <div className="card-body">
                    {selectedSessionLog.eventLogs && selectedSessionLog.eventLogs.length > 0 ? (
                        <ol className="relative">
                            {selectedSessionLog.eventLogs.map((log, idx) => {
                                const high = log.severity === 'high';
                                const medium = log.severity === 'medium';
                                return (
                                    <li key={idx} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-4 ${high ? 'bg-red-500 ring-red-100' : medium ? 'bg-amber-500 ring-amber-100' : 'bg-slate-400 ring-slate-100'}`} />
                                            <span className="w-px flex-1 bg-slate-200 group-last:hidden mt-1" />
                                        </div>
                                        <div className="flex-1 pb-6 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900 capitalize">{log.eventType.replace(/_/g, ' ')}</span>
                                                    <span className={`badge capitalize ${high ? 'badge-danger' : medium ? 'badge-warning' : 'badge-neutral'}`}>{log.severity}</span>
                                                </div>
                                                <span className="text-xs text-slate-500 tabular-nums">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{log.details || 'Suspicious behaviour detected and logged by the proctoring system.'}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck className="text-emerald-600 w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">Clean session</h4>
                            <p className="text-sm text-slate-500 mt-1">No integrity events were recorded for this session.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

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
        <PageContainer narrow>
            <PageHeader title="Settings" description="Manage platform preferences and account security." />

            <div className="space-y-6 max-w-3xl">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Exam environment</h2>
                    </div>
                    <div className="card-body flex items-center justify-between gap-4">
                        <div>
                            <div className="text-sm font-medium text-slate-900">Enforce kiosk mode</div>
                            <div className="text-sm text-slate-500 mt-0.5">Force a fullscreen exam window for all candidates.</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0" title="Always enabled">
                            <span className="text-xs font-medium text-emerald-700">Always on</span>
                            <div className="w-10 h-6 bg-emerald-600 rounded-full flex items-center justify-end px-0.5 opacity-80 cursor-not-allowed">
                                <div className="w-5 h-5 bg-white rounded-full shadow" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400" /> Change password</h2>
                    </div>
                    <form onSubmit={handleChangePassword} className="card-body space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="label" htmlFor="oldPassword">Current password</label>
                                <input
                                    id="oldPassword"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="newPassword">New password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    required
                                    minLength={5}
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input"
                                />
                                <p className="help-text">Minimum 5 characters.</p>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-slate-100 pt-5">
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Update password</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageContainer>
    );
};

/* ------------------------------------------------------------------ */
/*  Dashboard shell                                                    */
/* ------------------------------------------------------------------ */

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
            const res = await fetch(`${API_BASE_URL}/students`);
            const data = await res.json();
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
            'Delete exam',
            'Are you sure you want to delete this exam? All associated candidate records and sessions will also be removed. This action is irreversible.',
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
            'Delete candidate',
            'Are you sure you want to delete this candidate registration? They will no longer have access to the assigned exam.',
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await fetchStudents(); // Refresh complete list and stats
                        notify('Candidate record deleted');
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
            'Delete result',
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
            'Clear all sessions and results',
            'This will permanently delete ALL sessions and results. The entire history will be wiped and cannot be recovered.',
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
            'Sign out',
            'Are you sure you want to sign out of the admin console?',
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

    const liveCount = sessions.filter(s => s.status === 'in_progress').length;

    const stats = [
        { label: 'Exams created', value: exams.length, icon: FileText, iconCls: 'bg-brand-50 text-brand-600' },
        { label: 'Registered candidates', value: students.length, icon: Users, iconCls: 'bg-violet-50 text-violet-600' },
        { label: 'Active sessions', value: liveCount, icon: Eye, iconCls: 'bg-emerald-50 text-emerald-600', live: liveCount > 0 },
        { label: 'Completed exams', value: getCompletedExamsCount(), icon: Award, iconCls: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                liveCount={liveCount}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="h-16 flex items-center justify-between gap-4 px-4 md:px-8 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden btn-icon" aria-label="Open menu">
                            <Menu className="w-5 h-5" />
                        </button>
                        <nav className="flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
                            <span className="text-slate-400 hidden sm:inline">Admin</span>
                            <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:inline" />
                            <span className="font-medium text-slate-900 truncate">{PAGE_TITLES[activeTab]}</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {isRefreshing ? (
                            <span className="flex items-center gap-2 text-xs text-slate-500">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing…
                            </span>
                        ) : (
                            <span className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                            </span>
                        )}
                        <button onClick={() => setActiveTab('create-exam')} className="btn btn-primary btn-sm hidden sm:inline-flex">
                            <Plus className="w-4 h-4" /> New exam
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto min-w-0">
                    {activeTab === 'dashboard' && (
                        <PageContainer>
                            <PageHeader title="Dashboard" description="Overview of your exams, candidates and live activity." />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                {stats.map(({ label, value, icon: Icon, iconCls, live }) => (
                                    <div key={label} className="card p-5 flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-slate-500">{label}</div>
                                            <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-1.5 tabular-nums">{value}</div>
                                            {live && <div className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live now</div>}
                                        </div>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconCls}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {[
                                    { tab: 'create-exam', icon: FilePlus, title: 'Create a new exam', text: 'Build a multi-section assessment with timed sections.' },
                                    { tab: 'students', icon: Users, title: 'Register candidates', text: 'Add candidates individually or import from Excel.' },
                                    { tab: 'monitoring', icon: Monitor, title: 'Open live monitor', text: 'Watch active sessions with camera snapshots.' },
                                ].map(({ tab, icon: Icon, title, text }) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className="card p-5 text-left flex gap-4 hover:border-brand-300 hover:shadow-md transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center shrink-0 transition-colors">
                                            <Icon className="w-5 h-5 text-slate-600 group-hover:text-brand-600 transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-900 flex items-center gap-1">{title} <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" /></div>
                                            <div className="text-sm text-slate-500 mt-0.5">{text}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Exam library */}
                            <div className="card overflow-hidden">
                                <div className="card-header">
                                    <div>
                                        <h2 className="card-title">Exam library</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">{exams.length} {exams.length === 1 ? 'exam' : 'exams'}</p>
                                    </div>
                                </div>
                                {exams.length === 0 ? (
                                    <div className="p-5">
                                        <EmptyState
                                            icon={FileText}
                                            title="No exams created yet"
                                            description="Create your first exam to start registering candidates."
                                            action={<button onClick={() => setActiveTab('create-exam')} className="btn btn-primary"><Plus className="w-4 h-4" /> Create exam</button>}
                                        />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="table min-w-[720px]">
                                            <thead>
                                                <tr>
                                                    <th>Exam</th>
                                                    <th>Code</th>
                                                    <th className="text-right">Sections</th>
                                                    <th className="text-right">Questions</th>
                                                    <th className="text-right">Duration</th>
                                                    <th className="text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map(exam => (
                                                    <tr key={exam._id}>
                                                        <td className="font-medium text-slate-900 max-w-[280px] truncate">{exam.title}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(exam.code);
                                                                    notify(`Exam code copied: ${exam.code}`);
                                                                }}
                                                                className="code-chip gap-1.5 hover:bg-slate-200 transition-colors"
                                                                title="Copy exam code"
                                                            >
                                                                {exam.code} <Copy className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </td>
                                                        <td className="text-right tabular-nums">{exam.sections?.length || 0}</td>
                                                        <td className="text-right tabular-nums">{exam.sections?.reduce((sum, section) => sum + (section.questions?.length || 0), 0)}</td>
                                                        <td className="text-right tabular-nums">{exam.duration} min</td>
                                                        <td>
                                                            <div className="flex justify-end items-center gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedExamForQuestions(exam);
                                                                        setActiveTab('view-questions');
                                                                    }}
                                                                    className="btn btn-ghost btn-sm"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                                                </button>
                                                                <button onClick={() => setActiveTab('students')} className="btn btn-ghost btn-sm">
                                                                    <Users className="w-3.5 h-3.5" /> Candidates
                                                                </button>
                                                                <button onClick={() => handleDeleteExam(exam._id)} className="btn-icon-danger" title="Delete exam">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </PageContainer>
                    )}
                    {activeTab === 'create-exam' && <CreateExam fetchExams={fetchExams} setActiveTab={setActiveTab} notify={notify} />}
                    {activeTab === 'students' && <StudentManagement students={students} exams={exams} onDelete={handleDeleteStudent} notify={notify} confirmAction={confirmAction} fetchStudents={fetchStudents} />}
                    {activeTab === 'monitoring' && <Monitoring sessions={sessions} onDelete={handleDeleteSession} onDeleteAll={handleDeleteAllSessions} fetchSessionById={fetchSessionById} />}
                    {activeTab === 'view-log' && <ViewLog selectedSessionLog={selectedSessionLog} setActiveTab={setActiveTab} />}
                    {activeTab === 'view-questions' && <QuestionManagement exam={selectedExamForQuestions} onBack={() => { setActiveTab('dashboard'); setSelectedExamForQuestions(null); }} onUpdate={handleUpdateExam} notify={notify} />}
                    {activeTab === 'results' && <Results sessions={sessions} students={students} exams={exams} onDelete={handleDeleteSession} onDeleteAll={handleDeleteAllSessions} notify={notify} confirmAction={confirmAction} fetchSessionById={fetchSessionById} />}
                    {activeTab === 'settings' && <SettingsPage notify={notify} />}
                </main>
            </div>

            {/* Notification Overlays */}
            <div className="fixed bottom-0 right-0 p-4 md:p-6 space-y-3 pointer-events-none z-[9999]">
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

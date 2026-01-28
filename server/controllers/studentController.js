const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamSession = require('../models/ExamSession');
const mongoose = require('mongoose');
const emailService = require('../utils/emailService');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('eligibleExams', '_id title code');
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, studentId } = req.body;

        // Check if student exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const newUser = new User({
            name,
            email,
            studentId,
            password: 'password123', // Default password
            role: 'student',
        });

        await newUser.save();
        res.status(201).json({ success: true, student: newUser });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify student
exports.verifyStudent = async (req, res) => {
    try {
        const { studentId, examId } = req.body;

        // Cast examId to ObjectId for the student query if provided
        let queryExamId = examId;
        if (examId && mongoose.Types.ObjectId.isValid(examId)) {
            queryExamId = new mongoose.Types.ObjectId(examId);
        }

        const query = { studentId, role: 'student' };
        if (queryExamId) {
            query.eligibleExams = queryExamId;
        }

        const student = await User.findOne(query);

        if (!student) {
            const userExists = await User.findOne({ studentId, role: 'student' });
            if (userExists) {
                return res.status(403).json({ error: 'This exam is not assigned to you.' });
            }
            return res.status(404).json({ error: 'Student ID not found.' });
        }

        // --- PREVENT RE-ENTRY CHECK ---
        if (examId) {
            const sId = student._id;
            const eId = new mongoose.Types.ObjectId(examId);

            // Find ALL sessions for this student regardless of exam
            const allStudentSessions = await ExamSession.find({ studentId: sId });

            // Find ALL sessions specifically for THIS exam
            const existingSessions = allStudentSessions.filter(s => s.examId.toString() === eId.toString());

            // Find ANY finished session (Already submitted or terminated)
            const finishedSession = existingSessions.find(s => {
                const status = (s.status || '').toLowerCase();
                return ['completed', 'submitted', 'terminated', 'finished'].includes(status);
            });

            if (finishedSession) {
                return res.status(403).json({
                    success: false,
                    error: `You have already completed this exam (Status: ${finishedSession.status}).`,
                    alreadyCompleted: true
                });
            }
        }
        // ------------------------------

        res.json({
            success: true,
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                studentId: student.studentId,
                eligibleExams: student.eligibleExams
            }
        });
    } catch (error) {
        console.error('[Verify] Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Assign students to exam (Single or Bulk)
exports.assignStudentsToExam = async (req, res) => {
    try {
        const { examId, students } = req.body;

        const results = [];

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        for (const s of students) {
            const email = s.email?.toLowerCase().trim();
            let user = await User.findOne({ email });

            const prefix = exam.title
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 4);

            const studentId = s.studentId || `${new Date().getFullYear()}${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

            if (!user) {
                user = new User({
                    name: s.name,
                    email: email,
                    studentId: studentId,
                    password: 'password123',
                    role: 'student',
                    eligibleExams: [examId]
                });
            } else {
                // Fix: Check if examId already exists in eligibleExams using toString() comparison
                const alreadyEligible = user.eligibleExams.some(id => id.toString() === examId.toString());

                if (!alreadyEligible) {
                    user.eligibleExams.push(examId);
                } else {
                    // Student already eligible
                }

                if (!user.studentId) user.studentId = studentId;
                if (!user.name && s.name) user.name = s.name; // Update name if missing
            }

            await user.save();
            results.push(user);

            emailService.sendExamCredentials(
                user.email,
                user.name,
                exam.title,
                exam.code,
                user.studentId
            );
        }

        res.json({ success: true, count: results.length, students: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get students for a specific exam
exports.getStudentsByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const students = await User.find({
            role: 'student',
            eligibleExams: examId
        });
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Resend Credentials
exports.sendCredentials = async (req, res) => {
    try {
        const { studentId, examId } = req.body;

        const student = await User.findById(studentId);
        const exam = await Exam.findById(examId);

        if (!student || !exam) {
            return res.status(404).json({ error: 'Student or Exam not found' });
        }

        await emailService.sendExamCredentials(
            student.email,
            student.name,
            exam.title,
            exam.code,
            student.studentId
        );

        res.json({ success: true, message: 'Credentials sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

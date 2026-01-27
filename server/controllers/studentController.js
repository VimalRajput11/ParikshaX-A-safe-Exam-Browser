const User = require('../models/User');
const Exam = require('../models/Exam');
const emailService = require('../utils/emailService');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, studentId } = req.body; // studentId usually comes from UI, or we map it to 'username' or something. 
        // The UI sends: { id, name, email } where id is '2024CS...'
        // User model doesn't have 'studentId' or 'id' field explicit (uses _id).
        // I should probably add a 'studentId' field to User model or map it.
        // For now, I'll assume 'password' is auto-generated or default.

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
            // We might want to store the custom ID passed from frontend if needed, but MongoDB uses _id.
            // Let's add 'customId' to the User model schema later if needed. For now we will rely on MongoDB's _id or add it there.
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
        const { studentId, examId } = req.body; // examId optional for generic verify, but needed for access control

        const query = { studentId, role: 'student' };
        if (examId) {
            query.eligibleExams = examId;
        }

        const student = await User.findOne(query);

        if (!student) {
            // Check if student exists but not for this exam
            const userExists = await User.findOne({ studentId, role: 'student' });
            if (userExists) {
                return res.status(403).json({ error: 'Student not registered for this exam' });
            }
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign students to exam (Single or Bulk)
exports.assignStudentsToExam = async (req, res) => {
    try {
        const { examId, students } = req.body; // students = [{ name, email, studentId }]

        const results = [];

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        for (const s of students) {
            let user = await User.findOne({ email: s.email });

            // Generate ID if missing based on Exam Title initials
            const prefix = exam.title
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 4); // Limit prefix length

            const studentId = s.studentId || `${new Date().getFullYear()}${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

            if (!user) {
                // Create new user
                user = new User({
                    name: s.name,
                    email: s.email,
                    studentId: studentId,
                    password: 'password123', // Default
                    role: 'student',
                    eligibleExams: [examId]
                });
            } else {
                // Update existing user: add examId if not present
                if (!user.eligibleExams.includes(examId)) {
                    user.eligibleExams.push(examId);
                }
                // Ensure studentId is set if missing (legacy support)
                if (!user.studentId) user.studentId = studentId;
            }

            await user.save();
            results.push(user);

            // Send Email with credentials
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

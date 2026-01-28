const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const ExamSessionSchema = new mongoose.Schema({
    examId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    status: String,
    startTime: Date,
    endTime: Date
});

const ExamSession = mongoose.model('ExamSession', ExamSessionSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const sessions = await ExamSession.find().limit(10).sort({ startTime: -1 });
    console.log('Recent Sessions:');
    sessions.forEach(s => {
        console.log(`ID: ${s._id} | Student: ${s.studentId} | Exam: ${s.examId} | Status: ${s.status}`);
    });

    await mongoose.disconnect();
}

check().catch(console.error);

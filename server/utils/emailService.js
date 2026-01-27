const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendExamCredentials = async (email, name, examTitle, examCode, studentId) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not configured. Skipping email.');
            return;
        }

        const mailOptions = {
            from: `"ParikshaX Exams" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Exam Admission: ${examTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">ParikshaX</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Secure Assessment Portal</p>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 20px;">Exam Admission Details</h2>
                            <p style="color: #4b5563; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                            <p style="color: #4b5563; line-height: 1.6;">You have been successfully registered for <strong>${examTitle}</strong>. Please use the following credentials to access your exam:</p>
                            
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Candidate ID</td>
                                        <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold; font-size: 18px; color: #0891b2;">${studentId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Exam code</td>
                                        <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold; font-size: 18px; color: #0891b2;">${examCode}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="border-left: 4px solid #0891b2; padding-left: 20px; margin-top: 30px;">
                                <h3 style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">Next Steps:</h3>
                                <ul style="margin: 0; padding: 0; list-style: none; color: #4b5563; font-size: 14px; line-height: 1.8;">
                                    <li>✓ Download and install <strong>ParikshaX Secure Browser</strong></li>
                                    <li>✓ Ensure camera and microphone access</li>
                                    <li>✓ Keep your Candidate ID ready for verification</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin-top: 40px;">
                                <a href="#" style="background: #0891b2; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Download Secure Browser</a>
                            </div>
                        </div>
                        <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated invitation. If you did not expect this exam, please contact your administrator.</p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending exam credentials email:', error);
    }
};

exports.sendExamResult = async (email, name, examTitle, score, maxScore, integrityScore) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not configured. Skipping email.');
            return;
        }

        const percentage = Math.round((score / maxScore) * 100);
        const statusColor = percentage >= 40 ? '#059669' : '#dc2626';

        const mailOptions = {
            from: `"ParikshaX Results" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Result Declaration: ${examTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, ${statusColor} 0%, #1f2937 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Result Declaration</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Assessment Performance Report</p>
                        </div>
                        <div style="padding: 40px;">
                            <p style="color: #4b5563; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                            <p style="color: #4b5563; line-height: 1.6;">Your official results and integrity report for <strong>${examTitle}</strong> have been published.</p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <div style="font-size: 14px; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; letter-spacing: 1px;">Overall Score</div>
                                <div style="font-size: 48px; font-weight: 800; color: ${statusColor};">${score}<span style="font-size: 20px; color: #9ca3af; font-weight: 400;"> / ${maxScore}</span></div>
                                <div style="margin-top: 15px; display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; background: ${integrityScore > 80 ? '#dcfce7' : '#fee2e2'}; color: ${integrityScore > 80 ? '#166534' : '#991b1b'};">
                                    Integrity Rating: ${integrityScore}%
                                </div>
                            </div>

                            <div style="border-top: 1px solid #f3f4f6; padding-top: 30px;">
                                <h3 style="color: #111827; font-size: 16px; margin: 0 0 15px 0;">Summary Details:</h3>
                                <table style="width: 100%; color: #4b5563; font-size: 14px;">
                                    <tr><td style="padding: 5px 0;">Percentage Score:</td><td style="text-align: right; font-weight: bold; color: #111827;">${percentage}%</td></tr>
                                    <tr><td style="padding: 5px 0;">Result Status:</td><td style="text-align: right; font-weight: bold; color: ${statusColor};">${percentage >= 40 ? 'PASS' : 'FAIL'}</td></tr>
                                </table>
                            </div>

                            <div style="text-align: center; margin-top: 40px;">
                                <a href="#" style="background: #111827; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Detailed Feedback</a>
                            </div>
                        </div>
                        <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">ParikshaX Secure Portal • AI-Powered Integrity Monitoring</p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending exam result email:', error);
    }
};

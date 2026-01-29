const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
            from: `"ParikshaX Authority" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `OFFICIAL ADMISSION NOTICE: ${examTitle.toUpperCase()}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Admission Notice</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
                    <div style="background-color: #f8fafc; padding: 40px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <!-- Official Header -->
                            <tr>
                                <td align="center" style="background-color: #0f172a; padding: 40px 20px;">
                                    <table border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 4px;">
                                                <div style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">ParikshaX</div>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-top: 12px;">Unified Assessment Authority</div>
                                </td>
                            </tr>

                            <!-- Content Body -->
                            <tr>
                                <td style="padding: 48px 40px;">
                                    <div style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 24px; text-align: center;">Official Admission Notice</div>
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Dear <strong>${name}</strong>,</p>
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">This document serves as your official authorization to participate in the <strong>${examTitle}</strong>. Your unique secure-access credentials have been generated and are detailed below.</p>
                                    
                                    <!-- Secure Credentials Block -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 8px; margin-bottom: 32px; color: #ffffff;">
                                        <tr>
                                            <td style="padding: 30px;">
                                                <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Unique Candidate ID</div>
                                                <div style="color: #22d3ee; font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800;">${studentId}</div>
                                                <div style="height: 1px; background-color: rgba(255,255,255,0.1); margin: 20px 0;"></div>
                                                <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Secure Access Code</div>
                                                <div style="color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800;">${examCode}</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Guidelines -->
                                    <div style="border-left: 4px solid #0891b2; padding-left: 20px; margin-bottom: 40px;">
                                        <div style="color: #0f172a; font-size: 16px; font-weight: 700; margin-bottom: 12px;">Requirements for Admission:</div>
                                        <ul style="margin: 0; padding: 0; list-style: none; color: #475569; font-size: 14px; line-height: 1.8;">
                                            <li style="margin-bottom: 8px;">&bull; Mandatory use of the <strong>ParikshaX Secure Browser</strong>.</li>
                                            <li style="margin-bottom: 8px;">&bull; Verification via live biometric and camera feed.</li>
                                            <li style="margin-bottom: 8px;">&bull; Stable network environment with zero-latency requirement.</li>
                                        </ul>
                                    </div>

                                    <!-- Action -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center">
                                                <div style="margin-bottom: 20px; color: #64748b; font-size: 13px; font-style: italic;">
                                                    * The ParikshaX Secure Browser setup is attached to this email. Please install it before the session.
                                                </div>
                                                <a href="${process.env.BROWSER_DOWNLOAD_URL || 'https://drive.google.com/file/d/1IOBs_TGSb86pKrox3q0IyDyAwkqosBIr/view?usp=drive_link'}" style="background-color: #0080ff; color: #ffffff; padding: 18px 40px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,128,255,0.3);">DOWNLOAD SECURE BROWSER</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Official Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                                    <div style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                                        This is a system-generated notice regarding your academic assessment.<br>
                                        Please do not share these credentials with anyone.
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 10px; margin-top: 16px; font-weight: 700; letter-spacing: 1px;">&copy; 2026 PARIKSHAX AUDIT COMPLIANCE</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </body>
                </html>
            `,
            attachments: []
        };

        // Attachments removed per request
        // const exePath = path.join(__dirname, '..', 'attachments', 'ParikshaX-Browser.exe');

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
        const pass = percentage >= 40;
        const statusColor = pass ? '#10b981' : '#ef4444';
        const integrityColor = integrityScore > 80 ? '#10b981' : integrityScore > 50 ? '#f59e0b' : '#ef4444';

        const mailOptions = {
            from: `"ParikshaX Audit" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `OFFICIAL PERFORMANCE REPORT: ${examTitle.toUpperCase()}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Performance Report</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
                    <div style="background-color: #f8fafc; padding: 40px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #0f172a; padding: 40px 20px;">
                                    <div style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">Result Declaration</div>
                                    <div style="color: #64748b; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px;">Secured Audit Evaluation</div>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding: 48px 40px;">
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Dear <strong>${name}</strong>,</p>
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 40px;">Your automated evaluation for the <strong>${examTitle}</strong> has been finalized. This report contains your comprehensive performance analysis and integrity verification score.</p>
                                    
                                    <!-- Score Display Card -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 16px; margin-bottom: 40px; text-align: center;">
                                        <tr>
                                            <td style="padding: 48px 20px;">
                                                <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Aggregate Performance</div>
                                                <div style="font-size: 64px; font-weight: 900; color: #0f172a; line-height: 1;">${score}<span style="font-size: 24px; color: #94a3b8; font-weight: 400;">/${maxScore}</span></div>
                                                
                                                <div style="margin-top: 32px; display: inline-block; padding: 8px 20px; border-radius: 4px; font-weight: 700; font-size: 12px; background-color: #ffffff; color: ${integrityColor}; border: 1px solid #e2e8f0;">
                                                    INTEGRITY INDEX: ${integrityScore}%
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Summary Details -->
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                                        <tr>
                                            <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 600;">Percentage Score</td>
                                            <td align="right" style="padding: 16px 0; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${percentage}%</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 16px 0; color: #64748b; font-size: 14px; font-weight: 600;">Evaluation Status</td>
                                            <td align="right" style="padding: 16px 0; font-weight: 800; color: ${statusColor};">${pass ? 'QUALIFIED' : 'NOT QUALIFIED'}</td>
                                        </tr>
                                    </table>

                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center">
                                                <a href="#" style="background-color: #0f172a; color: #ffffff; padding: 18px 40px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 1px;">VIEW DETAILED TRANSCRIPT</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                                    <div style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                                        This document belongs to the intended recipient only. Any unauthorized distribution is a violation of assessment protocol.
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 10px; margin-top: 16px; font-weight: 700; letter-spacing: 1px;">&copy; 2026 PARIKSHAX AUDIT COMPLIANCE</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending exam result email:', error);
    }
};

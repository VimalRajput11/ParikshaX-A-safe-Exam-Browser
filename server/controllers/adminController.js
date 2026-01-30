const User = require('../models/User');

// Admin Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const DEFAULT_EMAIL = 'admin@parikshax.com';
        const DEFAULT_PASSWORD = 'admin';

        // 1. Try to find admin in DB
        let admin = await User.findOne({ email, role: 'admin' });

        if (!admin) {
            // 2. If valid default credentials and no DB record, create one
            if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
                admin = new User({
                    name: 'System Admin',
                    email: DEFAULT_EMAIL,
                    password: DEFAULT_PASSWORD, // Plain text as per existing pattern
                    role: 'admin'
                });
                await admin.save();
                return res.json({ success: true, message: 'Admin account created and logged in', admin: { name: admin.name, email: admin.email } });
            } else {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
        }

        // 3. Verify password
        if (admin.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        res.json({ success: true, admin: { name: admin.name, email: admin.email } });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 5) {
            return res.status(400).json({ success: false, error: 'New password must be at least 5 characters long' });
        }

        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        if (admin.password !== oldPassword) {
            return res.status(401).json({ success: false, error: 'Incorrect current password' });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update password' });
    }
};

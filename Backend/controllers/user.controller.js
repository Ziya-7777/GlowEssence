import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
// Random token generate karne ke liye
import crypto from "crypto";
// Email send karne ke liye
import transporter from "../configs/nodemailer.js";

// register user controller
// api/user/register

export const register = async (req, res) => {

    try {

        // Validation Errors
        const error = validationResult(req);

        if (error.array().length > 0) {

            return res.status(400).json(error.array());

        }

        // Body se data lena
        const { name, email, password } = req.body;


        // Required Fields Check
        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message: "All fields are required."

            });

        }


        // Check User Exists
        const userExist = await User.findOne({ email });

        if (userExist) {

            return res.status(400).json({

                success: false,

                message: "User already exists."

            });

        }

        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt);

        // no email verification step - account is ready to use right away
        await User.create({

            name,

            email,

            password: hashPassword

        });

        return res.status(201).json({

            success: true,

            message: "Registration successful. You can now log in."

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Verify Email Controller
// /api/user/verify-email/:token

export const verifyEmail = async (req, res) => {

    try {

        // URL se token nikal rahe hain
        const { token } = req.params;

        // Token match hona chahiye
        // Aur token expire bhi nahi hona chahiye

        const user = await User.findOne({

            verificationToken: token,

            verificationTokenExpire: { $gt: Date.now() }

        });


        // Agar token galat hai ya expire ho gaya
        if (!user) {

            // send them back into the actual app (not raw JSON) with a status flag
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?verified=failed`
            );

        }

        user.isVerified = true;

        // Token remove kar denge
        user.verificationToken = "";

        user.verificationTokenExpire = null;


        await user.save();

        // verified! send them back into the app so they can log in
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?verified=success`
        );

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Forgot Password Controller
// Sends a reset link to the user's email (same idea as verifyEmail above,
// just a different token field so it doesn't clash with email verification)
// api/user/forgot-password
export const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email is required."

            });

        }

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({

                success: false,

                message: "User not found."

            });

        }

        // Random 32 byte token banega
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token 15 minute baad expire hoga
        const resetTokenExpire = Date.now() + 15 * 60 * 1000;

        user.resetPasswordToken = resetToken;

        user.resetPasswordExpire = resetTokenExpire;

        await user.save();

        // Frontend URL baad me change kar dena
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: user.email,

            subject: "Reset Your Password",

            html: `

                <h2>Hello ${user.name}</h2>

                <p>Click the button below to reset your password.</p>

                <a href="${resetURL}">

                    <button
                        style="
                            padding:10px 20px;
                            background:#4CAF50;
                            color:white;
                            border:none;
                            cursor:pointer;
                        ">
                        Reset Password
                    </button>

                </a>

                <p>This link will expire in 15 minutes.</p>

            `

        });

        return res.status(200).json({

            success: true,

            message: "Password reset link sent. Please check your email."

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Reset Password Controller
// Checks the token from the reset link, then saves the new (hashed) password
// api/user/reset-password/:token
export const resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { password } = req.body;

        if (!password) {

            return res.status(400).json({

                success: false,

                message: "New password is required."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters."

            });

        }

        // Token match hona chahiye
        // Aur token expire bhi nahi hona chahiye
        const user = await User.findOne({

            resetPasswordToken: token,

            resetPasswordExpire: { $gt: Date.now() }

        });

        // Agar token galat hai ya expire ho gaya
        if (!user) {

            return res.status(400).json({

                success: false,

                message: "Invalid or Expired Reset Link."

            });

        }

        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt);

        user.password = hashPassword;

        // Token remove kar denge (dobara use na ho)
        user.resetPasswordToken = "";

        user.resetPasswordExpire = null;

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Password reset successfully. You can now login."

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// login user controller
// api/user/login
export const login = async (req, res) => {
    try {
        const error = validationResult(req);

        if (error.array().length > 0) {
            return res.status(400).json(error.array())
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "user not found" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Password not match" });
        }

        const payload = {
            id: user.id,
            name: user.name,
            role: user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // role is included here so the frontend knows if this is an
        // admin or a regular user (Admin isn't a separate model — it's
        // just a User document with role: "admin")
        return res.status(200).json({ success: true, message: "Login successfully.", userId: user.id, name: user.name, role: user.role, token })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get all user controller
// api/user/getalluser
export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({});

        if (!users) {
            return res.status(400).json({ success: false, message: "No users found." });
        }

        return res.status(200).json({ success: true, message: "All users found.", users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get user by id controller
// api/user/profile/:id
export const profile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User found.", user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// update user controller
// api/user/update/:id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(id, req.body, { new: true });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User updated.", user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// change password controller (for an already logged-in user,
// used by the "Security" tab on the Profile page)
// api/user/change-password/:id
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        // Purani password sahi hai ya nahi check karo
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// delete user controller
// api/user/delete/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User deleted.", userId: user.id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
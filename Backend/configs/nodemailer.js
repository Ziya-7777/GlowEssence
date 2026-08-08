import nodemailer from "nodemailer";

// Create Nodemailer transporter
// Is transporter ka use hum emails bhejne ke liye karenge (reset password, etc.)

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default transporter;

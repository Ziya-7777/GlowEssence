import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        // new accounts can log in right away - no email verification
        // step is required
        isVerified: {
            type: Boolean,
            default: true
        },
        // Verification token store hoga
        verificationToken: {
            type: String,
            default: ""
        },
        // Token kab expire hoga
        verificationTokenExpire: {
            type: Date
        },
        // Forgot Password token store hoga (same idea as verificationToken above)
        resetPasswordToken: {
            type: String,
            default: ""
        },
        // Reset token kab expire hoga
        resetPasswordExpire: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

       // ✅ Generate JWT token
       const token = jwt.sign(
        { id: user._id, user_type: user.user_type, name: user.name, email: user.email },
        process.env.JWT_SECRET, // ✅ Use the secret key from .env
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // ✅ Token expires in 7 days
    );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.user_type
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Updated Register Route
router.post("/register", async (req, res) => {
    console.log("✅ Received Request Body:", req.body); // Debugging log

    const { user_type, name, email, password, dob, address, medical_history, point_of_contact } = req.body;

    try {
        if (!user_type) {
            return res.status(400).json({ error: "User type is required (elderly or caretaker)" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = {
            user_type,
            name,
            email,
            password_hash,
            created_at: new Date(),
            updated_at: new Date()
        };

        if (user_type === "elderly") {
            newUser.dob = dob;
            newUser.address = address;
            newUser.medical_history = medical_history || [];
            newUser.point_of_contact = point_of_contact;
        }

        const user = await User.create(newUser);

        console.log("✅ User registered:", user); // Log user registration
        return res.status(201).json({ message: "User registered successfully", user });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

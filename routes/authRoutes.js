const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    
    console.log("Received data:", req.body);  // console Log the request payload for my debuggin hehe

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, passwordHash, role });

        console.log("Saved user:", user);  // ✅ Log the saved user document

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("MongoDB Error:", error);  // ✅ Log any MongoDB errors
        res.status(400).json({ error: "Email already in use or database error" });
    }
});


router.get("/register", (req, res) => {
    res.json({ message: "Register endpoint is working, but use POST instead!" });
});


// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
});

module.exports = router;

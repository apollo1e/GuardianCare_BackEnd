// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./database/connection");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev")); // Logs API requests

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Internal service routes

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Auth Service running on port ${PORT}`));

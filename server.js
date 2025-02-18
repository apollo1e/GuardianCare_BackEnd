require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json()); // Allows JSON request bodies
app.use(cors());

app.use("/api/auth", authRoutes); // ROUTES ALWAYS DEFINED AFTER MIDDLEWARE OMG 6 HOURS GONE


// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error(" MONGO_URI is missing in .env file!");
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(`✅ Connected to MongoDB: ${MONGO_URI}`))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));

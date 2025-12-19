const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PythonShell } = require("python-shell");
const path = require("path");
const mongoose = require("mongoose");  // Import mongoose

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/farmfresh";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Multer storage setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// API route
app.post("/predict", upload.single("image"), (req, res) => {
  const imagePath = req.file.path;

  PythonShell.run("predict.py", { args: [imagePath] }, (err, results) => {
    if (err) return res.status(500).send("Prediction failed.");

    try {
      const data = JSON.parse(results[0]);
      res.json({ prediction: data.result, confidence: data.confidence });
    } catch {
      res.status(500).send("Error parsing prediction.");
    }
  });
});

// Start server
app.listen(5001, () => {
  console.log("🚀 Server running on http://localhost:5001");
});

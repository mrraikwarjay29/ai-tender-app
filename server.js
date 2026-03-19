const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 🔥 LOWDB SETUP (FIXED)
const { Low, JSONFile } = require("lowdb");

const adapter = new JSONFile("db.json");
const db = new Low(adapter);

// Initialize DB
async function initDB() {
  await db.read();

  db.data = db.data || {
    tenders: [],
    history: []
  };

  await db.write();
}

initDB();

// ---------------- APP ----------------
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ---------------- FILE UPLOAD ----------------
const upload = multer({ dest: "uploads/" });

// ---------------- SAMPLE TENDERS ----------------
let tenders = [
  { title: "Prefab Building Work", location: "Delhi", amount: 2000000 },
  { title: "Steel Shed Work", location: "Bhopal", amount: 1500000 }
];

// ---------------- ROUTES ----------------

// Get tenders
app.get("/tenders", (req, res) => {
  res.json(tenders);
});

// Upload BOQ
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    res.json({
      message: "File processed successfully",
      rows: data.length,
      preview: data.slice(0, 5)
    });

  } catch (error) {
    res.status(500).json({ error: "Error reading file" });
  }
});

// Calculate Bid
app.post("/calculate", async (req, res) => {
  const { baseCost } = req.body;

  if (!baseCost) {
    return res.status(400).json({ error: "Base cost required" });
  }

  const profitMargin = 0.15;
  const bid = baseCost + baseCost * profitMargin;

  // Save to DB
  await db.read();
  db.data.history.push({
    baseCost,
    bid,
    date: new Date()
  });
  await db.write();

  res.json({ bid });
});

// Get History
app.get("/history", async (req, res) => {
  await db.read();
  res.json(db.data.history);
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FILE UPLOAD SETUP
const upload = multer({ dest: "uploads/" });

// ✅ SERVE FRONTEND (VERY IMPORTANT)
app.use(express.static(__dirname));

// ✅ DEFAULT ROUTE FIX (IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ SAMPLE TENDER DATA
let tenders = [
  {
    title: "Prefab Building Work",
    department: "PWD",
    location: "Delhi",
    budget: 2000000,
    deadline: "25 March"
  },
  {
    title: "Steel Shed Work",
    department: "Railways",
    location: "Bhopal",
    budget: 1500000,
    deadline: "28 March"
  }
];

// ✅ GET TENDERS
app.get("/tenders", (req, res) => {
  res.json(tenders);
});

// ✅ BOQ UPLOAD + ANALYSIS
app.post("/upload-boq", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let totalCost = 0;

    data.forEach(item => {
      totalCost += item.Quantity * item.Rate;
    });

    res.json({
      totalCost: totalCost,
      message: "BOQ analyzed successfully"
    });

  } catch (err) {
    res.status(500).json({ error: "Error processing BOQ" });
  }
});

// ✅ BID CALCULATION
app.post("/calculate-bid", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let totalCost = 0;

    data.forEach(item => {
      totalCost += item.Quantity * item.Rate;
    });

    const profit = totalCost * 0.15;
    const bidPrice = totalCost + profit;

    res.json({
      totalCost: Math.round(totalCost),
      bidPrice: Math.round(bidPrice),
      profit: Math.round(profit)
    });

  } catch (err) {
    res.status(500).json({ error: "Error calculating bid" });
  }
});

// ✅ PORT FIX FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
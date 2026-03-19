const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// SERVE FRONTEND
app.use(express.static(__dirname));

// FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.send("OK");
});

// 🔥 STATIC TENDERS
app.get("/tenders", (req, res) => {
  res.json([
    { title: "Prefab Building Work", location: "Delhi", budget: 2000000 },
    { title: "Steel Shed Work", location: "Bhopal", budget: 1500000 }
  ]);
});

// 🔥 BOQ ANALYSIS
app.post("/upload-boq", upload.single("file"), (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let totalCost = 0;

    data.forEach(item => {
      totalCost += (item.Quantity || 0) * (item.Rate || 0);
    });

    res.json({ totalCost });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 BID CALCULATION
app.post("/calculate-bid", upload.single("file"), (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let totalCost = 0;

    data.forEach(item => {
      totalCost += (item.Quantity || 0) * (item.Rate || 0);
    });

    const profit = totalCost * 0.15;
    const bidPrice = totalCost + profit;

    res.json({
      totalCost: Math.round(totalCost),
      profit: Math.round(profit),
      bidPrice: Math.round(bidPrice)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 AI MATCHING
app.post("/match-tender", upload.single("file"), (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let workType = "General";

    data.forEach(item => {
      const name = (item.Item || "").toLowerCase();

      if (name.includes("steel")) workType = "Steel Shed";
      if (name.includes("cement")) workType = "Prefab Building";
    });

    const tenders = [
      { title: "Prefab Building Work", match: workType === "Prefab Building" ? 90 : 60 },
      { title: "Steel Shed Work", match: workType === "Steel Shed" ? 92 : 65 }
    ];

    const best = tenders.sort((a, b) => b.match - a.match)[0];

    res.json({ best });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PORT FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
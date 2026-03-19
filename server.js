const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// SERVE FRONTEND
app.use(express.static(__dirname));

// HOME ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 SMART TENDERS (DYNAMIC)
app.get("/tenders", (req, res) => {
  const cities = ["Delhi", "Bhopal", "Mumbai", "Indore"];
  const works = ["Prefab Building", "Steel Shed", "Road Work", "Bridge Work"];

  const tenders = [];

  for (let i = 0; i < 5; i++) {
    tenders.push({
      title: works[Math.floor(Math.random() * works.length)] + " Work",
      location: cities[Math.floor(Math.random() * cities.length)],
      budget: Math.floor(Math.random() * 5000000) + 500000
    });
  }

  res.json(tenders);
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

// PORT FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
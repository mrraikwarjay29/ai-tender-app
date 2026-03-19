const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({ dest: "uploads/" });

// ================= USER SYSTEM =================
let users = [{ username: "admin", password: "1234" }];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) res.json({ success: true });
  else res.json({ success: false });
});

// ================= TENDERS =================
app.get("/tenders", (req, res) => {
  const cities = ["Delhi", "Bhopal", "Mumbai", "Indore"];
  const works = ["Prefab", "Steel", "Road", "Bridge"];

  const tenders = [];

  for (let i = 0; i < 6; i++) {
    tenders.push({
      title: works[Math.floor(Math.random() * works.length)] + " Work",
      location: cities[Math.floor(Math.random() * cities.length)],
      budget: Math.floor(Math.random() * 5000000) + 500000
    });
  }

  res.json(tenders);
});

// ================= BOQ =================
app.post("/upload-boq", upload.single("file"), (req, res) => {
  const buffer = fs.readFileSync(req.file.path);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  let totalCost = 0;

  data.forEach(item => {
    totalCost += (item.Quantity || 0) * (item.Rate || 0);
  });

  res.json({ totalCost });
});

// ================= BID =================
app.post("/calculate-bid", upload.single("file"), (req, res) => {
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
    bidPrice: Math.round(bidPrice),
    profit: Math.round(profit)
  });
});

// ================= AI MATCH =================
app.post("/match-tender", upload.single("file"), (req, res) => {
  const buffer = fs.readFileSync(req.file.path);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  let type = "General";

  data.forEach(item => {
    const name = (item.Item || "").toLowerCase();
    if (name.includes("steel")) type = "Steel";
    if (name.includes("cement")) type = "Prefab";
  });

  const result = {
    title: type + " Work",
    match: Math.floor(Math.random() * 20) + 80
  };

  res.json({ best: result });
});

// ================= HISTORY =================
app.post("/save-history", (req, res) => {
  const file = "history.json";
  let history = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];

  history.push(req.body);
  fs.writeFileSync(file, JSON.stringify(history, null, 2));

  res.json({ ok: true });
});

app.get("/history", (req, res) => {
  const file = "history.json";
  if (!fs.existsSync(file)) return res.json([]);

  res.json(JSON.parse(fs.readFileSync(file)));
});

// ================= STATS =================
app.get("/stats", (req, res) => {
  const file = "history.json";

  if (!fs.existsSync(file)) {
    return res.json({ total: 0, avgProfit: 0 });
  }

  const data = JSON.parse(fs.readFileSync(file));

  let total = data.length;
  let profit = data.reduce((sum, d) => sum + (d.profit || 0), 0);

  res.json({
    total,
    avgProfit: total ? Math.round(profit / total) : 0
  });
});

// ================= PORT =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on " + PORT);
});
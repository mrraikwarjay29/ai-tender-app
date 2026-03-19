const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");

// LOWDB (LATEST VERSION FIXED)
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
const PORT = 3000;

// DB SETUP (FIXED)
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { tenders: [], history: [] });

async function initDB() {
  await db.read();
  await db.write();
}
initDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// SAMPLE TENDERS
let tenders = [
  { title: "Prefab Building Work", location: "Delhi", amount: 2000000 },
  { title: "Steel Shed Work", location: "Bhopal", amount: 1500000 },
  { title: "Warehouse Construction", location: "Mumbai", amount: 5000000 },
  { title: "Road Construction Project", location: "Delhi", amount: 8000000 }
];

// ================= ROUTES =================

// GET TENDERS
app.get("/tenders", (req, res) => {
  res.json(tenders);
});

// MATCH TENDERS
app.post("/match", (req, res) => {
  const { location, maxBudget } = req.body;

  let matched = tenders.filter(t => {
    return (
      (!location || t.location.toLowerCase() === location.toLowerCase()) &&
      (!maxBudget || t.amount <= maxBudget)
    );
  });

  matched.sort((a, b) => b.amount - a.amount);

  res.json(matched);
});

// UPLOAD EXCEL
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

  res.json({ rows: data.length });
});

// CALCULATE BID
app.post("/calculate", async (req, res) => {
  const { baseCost } = req.body;

  if (!baseCost) {
    return res.status(400).json({ error: "Base cost required" });
  }

  const bid = baseCost * 1.15;

  await db.read();
  db.data.history.push({
    baseCost,
    bid,
    date: new Date()
  });
  await db.write();

  res.json({ bid });
});

// GET HISTORY
app.get("/history", async (req, res) => {
  await db.read();
  res.json(db.data.history);
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});
const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");
const multer = require("multer");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

/* DATABASE */
const adapter = new JSONFile("db.json");
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { history: [] };
  await db.write();
}
initDB();

/* GET TENDERS */
app.get("/tenders", (req, res) => {
  const workbook = xlsx.readFile("tenders.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  res.json(data);
});

/* BOQ MATCHING */
app.post("/upload-boq", upload.single("file"), async (req, res) => {
  const boqWorkbook = xlsx.readFile(req.file.path);
  const boqSheet = boqWorkbook.Sheets[boqWorkbook.SheetNames[0]];
  const boqData = xlsx.utils.sheet_to_json(boqSheet);

  const tenderWorkbook = xlsx.readFile("tenders.xlsx");
  const tenderSheet = tenderWorkbook.Sheets[tenderWorkbook.SheetNames[0]];
  const tenders = xlsx.utils.sheet_to_json(tenderSheet);

  const boqText = JSON.stringify(boqData).toLowerCase();

  let matched = [];

  tenders.forEach(t => {
    let score = 0;
    const title = (t.title || "").toLowerCase();

    if (boqText.includes("cement") && title.includes("building")) score += 50;
    if (boqText.includes("steel") && title.includes("steel")) score += 50;

    if (score > 0) {
      matched.push({ ...t, matchScore: score });
    }
  });

  matched.sort((a, b) => b.matchScore - a.matchScore);
  const result = matched.slice(0, 3);

  await db.read();
  db.data.history.push({
    type: "match",
    date: new Date().toLocaleString(),
    result
  });
  await db.write();

  res.json({ matches: result });
});

/* BID CALCULATOR */
app.post("/calculate-bid", upload.single("file"), async (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  let totalCost = 0;

  data.forEach(item => {
    const quantity = parseFloat(item.quantity) || 0;

    let rate = 100;
    const text = JSON.stringify(item).toLowerCase();

    if (text.includes("cement")) rate = 400;
    else if (text.includes("steel")) rate = 70;
    else if (text.includes("concrete")) rate = 6000;

    totalCost += quantity * rate;
  });

  const bidPrice = totalCost * 1.15;
  const profit = bidPrice - totalCost;

  await db.read();
  db.data.history.push({
    type: "bid",
    date: new Date().toLocaleString(),
    totalCost,
    bidPrice,
    profit
  });
  await db.write();

  res.json({
    totalCost: Math.round(totalCost),
    bidPrice: Math.round(bidPrice),
    profit: Math.round(profit)
  });
});

/* HISTORY */
app.get("/history", async (req, res) => {
  await db.read();
  res.json(db.data.history);
});

/* PORT FIX (IMPORTANT FOR DEPLOY) */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
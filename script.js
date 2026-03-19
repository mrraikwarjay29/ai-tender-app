async function getTenders() {
  const res = await fetch("/tenders");
  const data = await res.json();

  let html = "";

  data.forEach(t => {
    html += `
      <div class="card">
        <h3>${t.title}</h3>
        <p>${t.location}</p>
        <p>₹${t.budget}</p>
      </div>
    `;
  });

  document.getElementById("tenderList").innerHTML = html;
}

async function analyze() {
  const file = document.getElementById("boqFile").files[0];

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/upload-boq", { method: "POST", body: fd });
  const data = await res.json();

  document.getElementById("boqResult").innerText =
    "Total Cost: ₹" + data.totalCost;
}

async function calculate() {
  const file = document.getElementById("boqFile").files[0];

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/calculate-bid", { method: "POST", body: fd });
  const data = await res.json();

  document.getElementById("bidResult").innerHTML =
    `Bid: ₹${data.bidPrice} | Profit: ₹${data.profit}`;

  // SAVE HISTORY
  await fetch("/save-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function match() {
  const file = document.getElementById("boqFile").files[0];

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/match-tender", { method: "POST", body: fd });
  const data = await res.json();

  document.getElementById("matchResult").innerHTML =
    `Best: ${data.best.title} (${data.best.match}%)`;
}

async function loadHistory() {
  const res = await fetch("/history");
  const data = await res.json();

  let html = "";

  data.forEach(h => {
    html += `<div class="card">₹${h.bidPrice} | Profit ₹${h.profit}</div>`;
  });

  document.getElementById("history").innerHTML = html;
}
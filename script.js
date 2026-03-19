async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: document.getElementById("user").value,
      password: document.getElementById("pass").value
    })
  });

  const data = await res.json();
  alert(data.success ? "Login success" : "Wrong login");
}

async function getTenders() {
  const res = await fetch("/tenders");
  const data = await res.json();

  let html = "";
  data.forEach(t => {
    html += `<div class="card">${t.title} - ₹${t.budget}</div>`;
  });

  document.getElementById("tenderList").innerHTML = html;
}

async function analyze() {
  const file = document.getElementById("boqFile").files[0];
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/upload-boq", { method: "POST", body: fd });
  const d = await res.json();

  document.getElementById("output").innerText = "Cost ₹" + d.totalCost;
}

async function calculate() {
  const file = document.getElementById("boqFile").files[0];
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/calculate-bid", { method: "POST", body: fd });
  const d = await res.json();

  document.getElementById("output").innerText =
    `Bid ₹${d.bidPrice}, Profit ₹${d.profit}`;

  await fetch("/save-history", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(d)
  });
}

async function match() {
  const file = document.getElementById("boqFile").files[0];
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/match-tender", { method: "POST", body: fd });
  const d = await res.json();

  alert(`Best: ${d.best.title} (${d.best.match}%)`);
}

async function loadStats() {
  const res = await fetch("/stats");
  const d = await res.json();

  document.getElementById("stats").innerText =
    `Total Bids: ${d.total}, Avg Profit: ₹${d.avgProfit}`;
}
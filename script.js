document.getElementById("getTenders").addEventListener("click", fetchTenders);
document.getElementById("uploadBtn").addEventListener("click", uploadBOQ);

async function fetchTenders() {
  const res = await fetch("http://localhost:3000/tenders");
  const data = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  data.forEach(t => {
    container.innerHTML += `
      <div class="card">
        <h3>${t.title}</h3>
        <p>📍 ${t.location}</p>
        <p>💰 ₹${t.budget}</p>
      </div>
    `;
  });
}

async function uploadBOQ() {
  const file = document.getElementById("boqFile").files[0];
  if (!file) return alert("Select file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/upload-boq", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  let html = "";

  data.matches.forEach(t => {
    html += `
      <div class="card">
        <h3>${t.title}</h3>
        <p>${t.location}</p>
        <p>₹${t.budget}</p>
        <p>Score: ${t.matchScore}</p>
      </div>
    `;
  });

  document.getElementById("boqMatch").innerHTML = html;
}

async function calculateBid() {
  const file = document.getElementById("boqFile").files[0];
  if (!file) return alert("Select file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/calculate-bid", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  document.getElementById("boqAnalysis").innerHTML = `
    <div class="card">
      <h3>Bid Analysis</h3>
      <p>Total Cost: ₹${data.totalCost}</p>
      <p>Bid Price: ₹${data.bidPrice}</p>
      <p>Profit: ₹${data.profit}</p>
    </div>
  `;
}

async function loadHistory() {
  const res = await fetch("http://localhost:3000/history");
  const data = await res.json();

  let html = "";

  data.forEach(item => {
    html += `
      <div class="card">
        <p><b>Type:</b> ${item.type}</p>
        <p><b>Date:</b> ${item.date}</p>
      </div>
    `;
  });

  document.getElementById("history").innerHTML = html;
}
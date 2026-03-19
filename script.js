function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === "admin" && p === "1234") {
    alert("Login successful");
  } else {
    alert("Wrong credentials");
  }
}

async function getTenders() {
  const res = await fetch("/tenders");
  const data = await res.json();

  let html = "";

  data.forEach(t => {
    html += `
      <div class="card">
        <h3>${t.title}</h3>
        <p>${t.location}</p>
        <p>₹${t.amount}</p>
      </div>
    `;
  });

  document.getElementById("tenders").innerHTML = html;
}

async function analyzeBOQ() {
  const file = document.getElementById("file").files[0];
  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  alert("Rows: " + data.rows);
}

async function calculateBid() {
  const baseCost = prompt("Enter cost");

  const res = await fetch("/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ baseCost: Number(baseCost) })
  });

  const data = await res.json();

  alert("Bid: ₹" + data.bid);
}

async function loadHistory() {
  const res = await fetch("/history");
  const data = await res.json();

  let html = "<h3>History</h3>";

  data.forEach(h => {
    html += `<p>₹${h.baseCost} → ₹${h.bid}</p>`;
  });

  document.getElementById("history").innerHTML = html;
}
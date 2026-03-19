// GET TENDERS
async function getTenders() {
  const res = await fetch("/tenders");
  const data = await res.json();

  let html = "";

  data.forEach(t => {
    const score = Math.floor(Math.random() * 50) + 50;

    html += `
      <div class="card">
        <h3>${t.title}</h3>
        <p>📍 ${t.location}</p>
        <p>💰 ₹${t.budget}</p>
        <p>🎯 Match Score: ${score}%</p>
      </div>
    `;
  });

  document.getElementById("tenderList").innerHTML = html;
}

// ANALYZE BOQ
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("boqFile").files[0];

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/upload-boq", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  document.getElementById("boqResult").innerHTML =
    `Total Cost: ₹${data.totalCost}`;
});

// CALCULATE BID
document.getElementById("calcBtn").addEventListener("click", async () => {
  const file = document.getElementById("boqFile").files[0];

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/calculate-bid", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  document.getElementById("bidResult").innerHTML = `
    <p>Total Cost: ₹${data.totalCost}</p>
    <p>Profit: ₹${data.profit}</p>
    <p><b>Bid Price: ₹${data.bidPrice}</b></p>
  `;
});
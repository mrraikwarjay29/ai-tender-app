// GET TENDERS (FIXED WITH RETRY)
async function getTenders() {
  let attempts = 0;

  while (attempts < 3) {
    try {
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
      return;

    } catch (err) {
      console.log("Retrying...");
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
  }

  document.getElementById("tenderList").innerHTML =
    "<p>⚠️ Server waking up... click again</p>";
}
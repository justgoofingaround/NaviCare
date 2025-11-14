function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

function renderProviders(target, doctors){
  target.innerHTML = '';
  doctors.forEach(d=>{
    target.appendChild(el(`
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3>${d.name}</h3>
            <div class="small">${d.specialty} • ${d.distance} mi • ${d.address}</div>
          </div>
          <span class="badge">${d.inNetwork ? 'In-Network' : 'OON'}</span>
        </div>
        <p class="small" style="margin-top:8px">Rating: ${d.rating} / 5</p>
        <div style="margin-top:10px;display:flex;gap:8px">
          <a class="btn" href="provider.html">View</a>
          <button class="btn" onclick="navigator.clipboard.writeText('${d.address}')">Copy Address</button>
        </div>
      </div>
    `));
  });
}

function renderCoverage(target, cov){
  target.innerHTML = `
    <div class="card">
      <h3>${cov.service} — ${cov.plan}</h3>
      <p class="small">Covered: <b>${cov.covered?'Yes':'No'}</b> • Copay: <b>${cov.copay}</b> • Prior Auth: <b>${cov.requiresPA?'Required':'No'}</b> • Deductible Remaining: <b>${cov.deductibleRemaining}</b></p>
    </div>`;
}

function renderMedCoverage(target, m){
  target.innerHTML = `
    <div class="card">
      <h3>${m.name}</h3>
      <p class="small">Covered: <b>${m.covered?'Yes':'No'}</b> • Tier: <b>${m.tier}</b> • Copay: <b>${m.copay}</b> • Qty Limit: <b>${m.qtyLimit}</b> • Prior Auth: <b>${m.priorAuth?'Required':'No'}</b></p>
    </div>`;
}

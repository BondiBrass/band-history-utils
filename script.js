function parseCSV(csv) {
  const rows = csv.trim().split('\n').map(r => r.split(','));
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim().toLowerCase()] = (row[i] || "").trim();
    });
    return obj;
  });
}

function renderCards(data) {
  const container = document.getElementById('container');
  container.innerHTML = '';
  data.forEach(d => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${d.name || ''} <small>(${d.year || ''})</small></h3>
      <p><strong>Summary:</strong> ${d.summary_short || ''}</p>
      ${d.summary_long && d.summary_long !== d.summary_short ? `<p>${d.summary_long}</p>` : ''}
      ${d.url ? `<p><a href="${d.url}" target="_blank">More Info</a></p>` : ''}
    `;
    container.appendChild(div);
  });
}

function loadTab(tabId) {
  const tab = sheetTabs.find(t => t.id === tabId);
  if (!tab) return;
  fetch(tab.csv)
    .then(r => r.text())
    .then(text => renderCards(parseCSV(text)))
    .catch(err => {
      console.warn("Fetch error", err);
      document.getElementById('container').innerText = 'Failed to load data.';
    });
}

window.onload = () => {
  const select = document.getElementById('tabSelect');
  sheetTabs.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.label;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => loadTab(select.value));
  loadTab(sheetTabs[0].id);
};
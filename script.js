const timelineTable = document.getElementById('timeline');
const alumniContainer = document.getElementById('alumniView');
const toggleAllBtn = document.getElementById('toggleAll');
const toggleViewBtn = document.getElementById('toggleView');
const timelineView = document.getElementById('timelineView');
const loadingEl = document.getElementById('loading');

let expandedState = false;
let currentView = 'timeline';

const SHEET_URLS = {
  timeline: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQT_FJkDwdUhwtsapwC0f2i-8XT5KtPFX0bKuQY_3xUwVeKf1t85XhHMj-Imzi07xHIZtb5bv9UW8q7/pub?gid=0&single=true&output=csv",
  alumni: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQT_FJkDwdUhwtsapwC0f2i-8XT5KtPFX0bKuQY_3xUwVeKf1t85XhHMj-Imzi07xHIZtb5bv9UW8q7/pub?gid=476539840&single=true&output=csv"
};

function openSheet() {
  window.open("https://docs.google.com/spreadsheets/d/18KQ-p9nwqmKol1gtwda6fYkOLyEwXffsMAjFTKP-CCQ/edit?usp=sharing", "_blank");
}

function showAbout() {
  document.getElementById('aboutModal').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';
}

function hideAbout() {
  document.getElementById('aboutModal').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

toggleAllBtn.addEventListener('click', () => {
  expandedState = !expandedState;
  document.querySelectorAll('.card-expanded').forEach(expanded => {
    expanded.style.display = expandedState ? 'block' : 'none';
  });
  document.querySelectorAll('.toggle-button').forEach(toggle => {
    toggle.className = expandedState ? 'fas fa-chevron-up toggle-button' : 'fas fa-chevron-down toggle-button';
  });
  toggleAllBtn.textContent = expandedState ? 'Collapse All' : 'Expand All';
});

toggleViewBtn.addEventListener('click', () => {
  currentView = currentView === 'timeline' ? 'alumni' : 'timeline';
  toggleViewBtn.textContent = `Switch to ${currentView === 'timeline' ? 'Alumni' : 'Timeline'} View`;
  toggleAllBtn.style.display = currentView === 'timeline' ? 'inline-block' : 'none';
  timelineView.style.display = currentView === 'timeline' ? 'block' : 'none';
  alumniContainer.style.display = currentView === 'alumni' ? 'flex' : 'none';
  loadingEl.style.display = 'block';
  loadCSVData(SHEET_URLS[currentView]).then(render);
});

async function loadCSVData(url) {
  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV Parsing Errors:", parsed.errors);
  }

  return parsed.data;
}

function render(data) {
  loadingEl.style.display = 'none';
  if (currentView === 'timeline') renderTimeline(data);
  else renderAlumni(data);
}

function renderTimeline(data) {
  timelineTable.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');

    const dateTd = document.createElement('td');
    dateTd.className = 'date-col';
    dateTd.textContent = row.Date || '';

    const dotTd = document.createElement('td');
    dotTd.className = 'dot-col';
    const dotContainer = document.createElement('div');
    dotContainer.className = 'dot-container';
    const line = document.createElement('div');
    line.className = 'line';
    const dot = document.createElement('div');
    dot.className = 'dot';
    dotContainer.appendChild(line);
    dotContainer.appendChild(dot);
    dotTd.appendChild(dotContainer);

    const cardTd = document.createElement('td');
    cardTd.className = 'card-col';
    const card = document.createElement('div');
    card.className = 'card';
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const img = document.createElement('img');
    if (row.Img) {
      img.src = row.Img;
      img.onerror = () => img.style.display = 'none';
    } else {
      img.style.display = 'none';
    }

    const text = document.createElement('div');
    text.className = 'card-text';
    const toggle = document.createElement('i');
    const expanded = document.createElement('div');
    expanded.className = 'card-expanded';
    expanded.style.display = 'none';

    if (row.Img) {
      const expandedImg = document.createElement('img');
      expandedImg.src = row.Img;
      expanded.appendChild(expandedImg);
    }

    const urlLine = row.URL ? `<p><a href="${row.URL}" target="_blank" style="color:#007bff;text-decoration:none;"><i class="fas fa-link"></i> Open Link</a></p>` : '';
    text.innerHTML = `<h3>${row.EventTitle || 'Untitled Event'}</h3><p>${row.Entity || ''}</p>${urlLine}<p>${row.Description || ''}</p>`;

    if (row.Img) {
      toggle.className = 'fas fa-chevron-down toggle-button';
      toggle.setAttribute('tabindex', '0');
      toggle.addEventListener('click', toggleExpand);
      toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand.call(toggle); });
      function toggleExpand() {
        expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
        this.className = expanded.style.display === 'none'
          ? 'fas fa-chevron-down toggle-button'
          : 'fas fa-chevron-up toggle-button';
      }
      cardContent.appendChild(toggle);
    }

    cardContent.appendChild(img);
    cardContent.appendChild(text);
    card.appendChild(cardContent);
    card.appendChild(expanded);
    cardTd.appendChild(card);

    tr.appendChild(dateTd);
    tr.appendChild(dotTd);
    tr.appendChild(cardTd);
    timelineTable.appendChild(tr);
  });
}

function renderAlumni(data) {
  alumniContainer.innerHTML = '';
  data.forEach(alum => {
    const initials = (alum.Name || '??').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const card = document.createElement('div');
    card.className = 'card alumni-card';
    card.innerHTML = `
      <div class="card-content alumni-card-content">
        <div class="top-row">
          <div class="avatar">${initials}</div>
          <div class="name">${alum.Name || 'Unknown'}</div>
          ${alum.URL ? `<div class="link"><a href="${alum.URL}" target="_blank">Read More</a></div>` : ''}
        </div>
        <div class="year">${alum.Year || ''}</div>
        <div class="summary">${alum.Summary || ''}</div>
      </div>
    `;
    alumniContainer.appendChild(card);
  });
}

// Load timeline on page load
timelineView.style.display = 'block';
toggleAllBtn.style.display = 'inline-block';
loadCSVData(SHEET_URLS.timeline).then(render);

function showTimeline() {
  document.body.classList.add('timeline-mode');
  document.body.classList.remove('alumni-mode');
  document.getElementById('container').innerHTML = '';
  loadTimeline(); // assumes this function already exists
}

function showAlumni() {
  document.body.classList.add('alumni-mode');
  document.body.classList.remove('timeline-mode');
  document.getElementById('container').innerHTML = '';
  loadAlumni(); // render alumni cards
}

// Dummy alumni data
const alumniData = [
  { name: "Alice Brass", year: "2005", summary: "Solo Cornet. Toured with BB in 2004–2005.", url: "#" },
  { name: "Bob Horn", year: "2010", summary: "Principal Horn 2008–2010. Current teacher at XYZ.", url: "" }
];

function getInitials(name) {
  return name.split(" ").map(word => word[0]).join("").toUpperCase();
}

function loadAlumni() {
  const container = document.getElementById("container");
  alumniData.forEach(alum => {
    const card = document.createElement("div");
    card.className = "card";
    const initials = getInitials(alum.name);
    card.innerHTML = \`
      <div class="card-content">
        <div class="top-row">
          <div class="avatar">\${initials}</div>
          <div class="name">\${alum.name}</div>
          \${alum.url ? \`<div class="link"><a href="\${alum.url}" target="_blank">Read More</a></div>\` : ''}
        </div>
        <div class="year">\${alum.year}</div>
        <div class="summary">\${alum.summary}</div>
      </div>
    \`;
    container.appendChild(card);
  });
}
requireAuth();
initNav('Mood Tracking');

const EMOJIS = ['', '😞', '😐', '🙂', '😄', '😁'];
const LABELS = ['', 'Awful', 'Meh', 'Good', 'Great', 'Elite'];

let selectedMood = null;
let selectedFactors = new Set();

// ── Mood picker ──────────────────────────────────────────────────────────────
document.querySelectorAll('#moodPicker .mood-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#moodPicker .mood-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedMood = parseInt(this.dataset.value);
    document.getElementById('saveMoodBtn').disabled = false;
  });
});

// ── Factor chips ─────────────────────────────────────────────────────────────
document.querySelectorAll('#factorChips .chip').forEach(chip => {
  chip.addEventListener('click', function () {
    const f = this.dataset.factor;
    if (selectedFactors.has(f)) {
      selectedFactors.delete(f);
      this.classList.remove('active');
    } else {
      selectedFactors.add(f);
      this.classList.add('active');
    }
  });
});

// ── Save mood ────────────────────────────────────────────────────────────────
document.getElementById('saveMoodBtn').addEventListener('click', async () => {
  if (!selectedMood) return;
  const btn = document.getElementById('saveMoodBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  const entry = {
    value: selectedMood,
    factors: [...selectedFactors],
    note: document.getElementById('moodNote').value.trim(),
    date: new Date().toISOString(),
  };

  try {
    // await api.logMood(entry);
    await new Promise(r => setTimeout(r, 700)); // mock
    // Prepend to local mock list
    mockEntries.unshift({
      emoji: EMOJIS[selectedMood],
      label: LABELS[selectedMood],
      title: `${LABELS[selectedMood]} day`,
      note: entry.note || 'No notes added.',
      date: 'Just now',
    });
    renderEntries();
    showToast('Mood saved!', 'success');
    // Reset
    document.querySelectorAll('#moodPicker .mood-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('#factorChips .chip').forEach(c => c.classList.remove('active'));
    document.getElementById('moodNote').value = '';
    selectedMood = null;
    selectedFactors.clear();
    btn.disabled = true;
    btn.textContent = 'Save Entry';
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Save Entry';
  }
});

// ── Chart ────────────────────────────────────────────────────────────────────
const weekData   = { values: [2, 3, 2, 4, 5, 3, 1], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] };
const monthData  = { values: [3,2,4,3,5,4,3,2,3,4,5,4,3,2,3,4,3,5,4,3,2,3,4,3,5,4,3,2,3,4], labels: Array.from({length:30},(_,i)=>i+1) };

function renderChart(data) {
  const chart  = document.getElementById('analyticsChart');
  const labels = document.getElementById('chartLabels');
  chart.innerHTML = data.values.map(v => `
    <div class="bar-col">
      <div class="bar-outer" style="height:7rem;">
        <div class="bar-inner" style="height:${(v/5)*100}%;"></div>
        <div class="bar-emoji">${EMOJIS[v]}</div>
      </div>
    </div>`).join('');
  labels.innerHTML = data.labels.map(l =>
    `<span style="font-size:0.6rem;font-weight:700;color:var(--outline-variant);text-transform:uppercase;">${l}</span>`
  ).join('');
}

function switchTab(tab) {
  document.getElementById('tabWeekly').classList.toggle('active', tab === 'weekly');
  document.getElementById('tabMonthly').classList.toggle('active', tab === 'monthly');
  if (tab === 'weekly') {
    renderChart(weekData);
    document.getElementById('chartRange').textContent = 'This week';
  } else {
    renderChart(monthData);
    document.getElementById('chartRange').textContent = 'This month';
  }
}
window.switchTab = switchTab;
switchTab('weekly');

// ── Entries list ─────────────────────────────────────────────────────────────
const mockEntries = [
  { emoji:'😁', label:'Amazing', title:'Fantastic Friday', note:'Finally finished the major project! Feeling a huge weight off my shoulders.', date:'Today, 9:42 AM' },
  { emoji:'🙂', label:'Good',    title:'Steady Morning',   note:'Good sleep, morning walk was refreshing. Ready for the day.', date:'Yesterday' },
  { emoji:'😞', label:'Awful',   title:'Feeling Overwhelmed', note:'Too many exams scheduled for the same week. Struggling to keep up.', date:'Oct 25' },
];

function renderEntries() {
  document.getElementById('entriesList').innerHTML = mockEntries.map(e => `
    <div class="entry-row">
      <div class="entry-emoji">${e.emoji}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <h4 class="headline" style="font-size:0.95rem;font-weight:700;">${e.title}</h4>
          <span style="font-size:0.7rem;color:var(--outline);white-space:nowrap;">${e.date}</span>
        </div>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);margin-top:0.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.note}</p>
      </div>
      <span class="material-symbols-outlined" style="color:var(--outline);font-size:1.25rem;">chevron_right</span>
    </div>`).join('');
}
renderEntries();

// app.js — wires UI to problem generator and step-through visualizer

let current;
let vizStep = 0;
let vizOpen = false;

function load() {
  const diff = document.getElementById('diff-select').value;
  current = generateProblem(diff || undefined);
  document.getElementById('code-box').textContent = current.code;
  document.getElementById('meta').textContent =
    `Difficulty: ${current.difficulty}  |  Concepts: ${current.concepts}`;
  document.getElementById('answer').value = '';
  const fb = document.getElementById('feedback');
  fb.textContent = '';
  fb.className = '';
  document.getElementById('submit-btn').hidden = false;
  document.getElementById('retry-btn').hidden = true;
  // Reset viz
  vizStep = 0;
  vizOpen = false;
  document.getElementById('viz-section').hidden = true;
  document.getElementById('viz-btn').textContent = 'Visualize';
  document.getElementById('answer').focus();
}

function check() {
  const userAns = document.getElementById('answer').value.trim();
  const correct  = current.answer.trim();
  const fb = document.getElementById('feedback');
  if (userAns === correct) {
    fb.textContent = '✓ Correct!';
    fb.className = 'correct';
  } else {
    fb.textContent = `✗ Wrong. Expected: "${correct}"`;
    fb.className = 'incorrect';
  }
  document.getElementById('submit-btn').hidden = true;
  document.getElementById('retry-btn').hidden = false;
}

function showVizStep(i) {
  const steps = current.trace;
  vizStep = Math.max(0, Math.min(i, steps.length - 1));
  const prev = vizStep > 0 ? steps[vizStep - 1].cells : [];
  document.getElementById('viz-line').textContent = steps[vizStep].line;
  document.getElementById('viz-step-label').textContent =
    `Step ${vizStep + 1} of ${steps.length}`;
  document.getElementById('viz').innerHTML =
    renderTrace(steps[vizStep].cells, prev);
  document.getElementById('viz-prev').disabled = (vizStep === 0);
  document.getElementById('viz-next').disabled = (vizStep === steps.length - 1);
}

document.getElementById('viz-btn').addEventListener('click', () => {
  vizOpen = !vizOpen;
  document.getElementById('viz-section').hidden = !vizOpen;
  document.getElementById('viz-btn').textContent = vizOpen ? 'Hide Diagram' : 'Visualize';
  if (vizOpen) showVizStep(vizStep);
});

document.getElementById('viz-prev').addEventListener('click', () => showVizStep(vizStep - 1));
document.getElementById('viz-next').addEventListener('click', () => showVizStep(vizStep + 1));

document.getElementById('submit-btn').addEventListener('click', check);
document.getElementById('retry-btn').addEventListener('click', load);
document.getElementById('answer').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !document.getElementById('submit-btn').hidden) check();
});

document.addEventListener('DOMContentLoaded', load);
document.getElementById('diff-select').addEventListener('change', load);

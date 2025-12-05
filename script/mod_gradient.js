import { hexToRgb } from './mod_helpers.js';

export function setupGradientViewControls() {
  const root = document.documentElement;
  const mainPanel = document.querySelector('.main-panel');
  const rightTop = document.querySelector('.right-top');
  if (!mainPanel || !rightTop) return;

  // Remove any existing gradient element
  const existing = mainPanel.querySelector('.gradient-bg');
  if (existing) existing.remove();

  // Create gradient container that fills the center content area
  const grad = document.createElement('div');
  grad.className = 'gradient-bg';
  mainPanel.appendChild(grad);
  mainPanel.style.overflow = 'hidden';

  // Read defaults from root CSS variables or use sane defaults
  const defStart = getComputedStyle(root).getPropertyValue('--gradient-start').trim() || '#2b2bff';
  const defEnd = getComputedStyle(root).getPropertyValue('--gradient-end').trim() || '#ff2b9b';
  const defAngle = parseInt(getComputedStyle(root).getPropertyValue('--gradient-angle')) || 135;

  // Build right panel controls
  rightTop.innerHTML = '';
  const controls = document.createElement('div');
  controls.className = 'gradient-controls';
  controls.innerHTML = `
    <h2>Gradient</h2>
    <div class="color-picker-row"><label>Start <input id="grad-start" type="color" value="${defStart.startsWith('#') ? defStart : '#2b2bff'}"/></label></div>
    <div class="color-picker-row"><label>End <input id="grad-end" type="color" value="${defEnd.startsWith('#') ? defEnd : '#ff2b9b'}"/></label></div>
    <div class="amount-picker-row"><label>Angle <input id="grad-angle" type="range" min="0" max="360" value="${defAngle}" style="width: 100%;"/></label></div>
    <div class="panel-buttons"><button id="grad-reset" class="btn">Reset</button></div>
    <div style="margin-top:12px;"><strong>Presets</strong></div>
    <div class="panel-buttons" style="margin-top:8px;">
      <button data-preset="#ff7a18,#af002d" class="btn">Sunset</button>
      <button data-preset="#00c6ff,#0072ff" class="btn">Ocean</button>
      <button data-preset="#8e2de2,#4a00e0" class="btn">Violet</button>
    </div>
    <div class="panel-buttons" style="margin-top:8px;">
      <button data-preset="#56ab2f,#a8e063" class="btn">Forest</button>
      <button data-preset="#ee0979,#ff6a00" class="btn">Fire</button>
      <button data-preset="#2193b0,#6dd5ed" class="btn">Sky</button>
    </div>
  `;
  rightTop.appendChild(controls);

  const startEl = document.getElementById('grad-start');
  const endEl = document.getElementById('grad-end');
  const angleEl = document.getElementById('grad-angle');
  const resetBtn = document.getElementById('grad-reset');

  function updatePreview() {
    const s = startEl.value;
    const e = endEl.value;
    const a = angleEl.value;
    grad.style.background = `linear-gradient(${a}deg, ${s} 0%, ${e} 100%)`;
  }

  // initialize
  updatePreview();

  // live preview on input - also persist to CSS variables immediately
  startEl.addEventListener('input', () => {
    root.style.setProperty('--gradient-start', startEl.value);
    updatePreview();
  });
  endEl.addEventListener('input', () => {
    root.style.setProperty('--gradient-end', endEl.value);
    updatePreview();
  });
  angleEl.addEventListener('input', () => {
    root.style.setProperty('--gradient-angle', angleEl.value);
    updatePreview();
  });

  resetBtn.addEventListener('click', () => {
    root.style.removeProperty('--gradient-start');
    root.style.removeProperty('--gradient-end');
    root.style.removeProperty('--gradient-angle');
    // revert to defaults
    startEl.value = '#2b2bff';
    endEl.value = '#ff2b9b';
    angleEl.value = 135;
    updatePreview();
  });

  // preset handlers
  controls.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [s,eCol] = btn.dataset.preset.split(',');
      startEl.value = s;
      endEl.value = eCol;
      updatePreview();
    });
  });

  // cleanup when leaving view: observe body.class and remove gradient when not view-gradient
  const observer = new MutationObserver(() => {
    if (!document.body.classList.contains('view-gradient')) {
      grad.remove();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

export default setupGradientViewControls;

import { applyMainPanelBounds, hexToRgb } from './mod_helpers.js';

export function setupAnimatedViewControls() {
  const root = document.documentElement;
  const mainPanel = document.querySelector('.main-panel');
  // Remove any short multi-lines from older implementations and keep a single
  // `.moving-line` element — that is the canonical line controlled by the UI.
  if (mainPanel) {
    // remove module-created short animated-line elements
    mainPanel.querySelectorAll('.animated-line').forEach(el => el.remove());
    // remove any static test line
    const staticLine = mainPanel.querySelector('.static-line');
    if (staticLine) staticLine.remove();
  }

  // Ensure there's exactly one moving-line to control
  let movingLine = mainPanel ? mainPanel.querySelector('.moving-line') : null;
  if (mainPanel && !movingLine) {
    movingLine = document.createElement('div');
    movingLine.className = 'moving-line';
    mainPanel.appendChild(movingLine);
  }
  if (mainPanel) mainPanel.style.overflow = 'hidden';
  let currentDirection = 'horizontal';
  let currentPattern = 'straight';
  let currentPosition = 'top';
  let animatedLines = [];

  function createLines(n = 3) {
    removeLines();
    for (let i = 0; i < n; i++) {
  const el = document.createElement('div');
  // Do not add the global 'debug' class to lines — keep debug overlay separately
  el.className = 'animated-line';
      el.dataset.index = i;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '1';
      if (mainPanel) {
        const mpStyle = getComputedStyle(mainPanel).position;
        if (mpStyle === 'static') mainPanel.style.position = 'relative';
        mainPanel.appendChild(el);
      } else {
        document.body.appendChild(el);
      }
      animatedLines.push(el);
    }
    attachDebugOverlay();
    updateLinePositions();
  }

  function removeLines() { animatedLines.forEach(el => el.remove()); animatedLines = []; }

  function getCenterBounds() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const lp = leftPanel.getBoundingClientRect();
    const rp = rightPanel.getBoundingClientRect();
    return { left: Math.max(0, Math.round(lp.right)), right: Math.max(0, Math.round(rp.left)) };
  }

  function updateLinePositions() {
    const bounds = getCenterBounds();
    const animPicker = document.getElementById('animated-color-picker');
    const color = (animPicker && animPicker.value) ? animPicker.value : (document.getElementById('color-picker') ? document.getElementById('color-picker').value : getComputedStyle(root).getPropertyValue('--animated-bg').trim() || '#ffffff');
    const mpRect = mainPanel.getBoundingClientRect();
    // apply sizing and position to the single moving line
    if (movingLine) {
      const lineHeight = 3;
      const mpStyle = getComputedStyle(mainPanel);
      const padTop = parseFloat(mpStyle.paddingTop) || 0;
      const padBottom = parseFloat(mpStyle.paddingBottom) || 0;
      if (currentPosition === 'top') movingLine.style.top = padTop + 'px'; else { const h = mainPanel.clientHeight || mainPanel.getBoundingClientRect().height; movingLine.style.top = Math.max(0, h - padBottom - lineHeight) + 'px'; }
      const mpWidth = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
      const inset = Math.min(120, Math.floor(mpWidth * 0.06));
      movingLine.style.left = inset + 'px';
      movingLine.style.width = Math.max(0, mpWidth - inset * 2) + 'px';
      movingLine.style.height = lineHeight + 'px';
  // build a gradient that uses only shades/alpha of the chosen color (no white)
  const rgb = hexToRgb(color);
  const soft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
  const strong = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
  movingLine.style.background = `linear-gradient(90deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
      movingLine.style.backgroundSize = '200% 100%';
      // ensure it uses the full-sweep animation (CSS class has line-move; keep sweep for gradient position)
      movingLine.style.animation = `line-move 2.2s linear infinite`;
    }
    updateDebugOverlay(bounds, mpRect, movingLine ? 1 : 0);
  }

  let debugOverlayEl = null;
  function attachDebugOverlay() {
    if (!mainPanel) return; mainPanel.classList.add('debug-border');
    if (!debugOverlayEl) { debugOverlayEl = document.createElement('div'); debugOverlayEl.className = 'debug-overlay'; debugOverlayEl.textContent = 'animated debug'; mainPanel.appendChild(debugOverlayEl); }
  }
  function updateDebugOverlay(bounds, mpRect, count) { if (!debugOverlayEl) return; debugOverlayEl.innerHTML = `lines: ${count}<br>mp: ${Math.round(mpRect.width)}x${Math.round(mpRect.height)}<br>bounds L:${bounds.left} R:${bounds.right}`; }

  const rightTopEl = document.querySelector('.right-top');
    if (rightTopEl) {
    const posRow = document.createElement('div'); posRow.className = 'direction-picker-row'; posRow.innerHTML = `<label>Position <select id="position-select"><option value="top">Top</option><option value="bottom">Bottom</option></select></label>`;
    rightTopEl.insertBefore(posRow, rightTopEl.querySelector('.panel-buttons'));
    const animColorRow = document.createElement('div'); animColorRow.className = 'color-picker-row'; animColorRow.innerHTML = `<label>Line Color <input id="animated-color-picker" type="color" value="#ffffff"/></label>`;
    const btnArea = rightTopEl.querySelector('.panel-buttons'); if (btnArea) rightTopEl.insertBefore(animColorRow, btnArea); else rightTopEl.appendChild(animColorRow);

    // add apply / reset buttons under the color picker
    const btnRow = document.createElement('div');
    btnRow.className = 'panel-buttons animated-apply-row';
    btnRow.style.marginTop = '8px';
    btnRow.innerHTML = `<button id="animated-apply" class="btn">Apply</button><button id="animated-reset" class="btn">Reset</button>`;
    if (btnArea) rightTopEl.insertBefore(btnRow, btnArea);
    else rightTopEl.appendChild(btnRow);

    const acp = document.getElementById('animated-color-picker');
    if (acp) {
      const v = getComputedStyle(root).getPropertyValue('--animated-bg').trim() || '#ffffff';
      acp.value = (v.startsWith('#') ? v : '#ffffff');

      // live-preview updates the single moving line without touching the CSS var
      acp.addEventListener('input', (e) => {
        updateLinePositions();
      });

      // Apply button: write CSS var and refresh
      const applyBtn = document.getElementById('animated-apply');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          root.style.setProperty('--animated-bg', acp.value);
          updateLinePositions();
        });
      }

      // Reset button: reset CSS var to white and update picker + line
      const resetBtn = document.getElementById('animated-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          root.style.setProperty('--animated-bg', '#ffffff');
          acp.value = '#ffffff';
          updateLinePositions();
        });
      }
    }
    }

  const positionSelect = document.getElementById('position-select'); if (positionSelect) positionSelect.addEventListener('change', (e) => { currentPosition = e.target.value; updateLinePositions(); });

  // initialize single line sizing
  updateLinePositions();

  function applyOriginalLineMath() {
    const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
    const inset = Math.min(120, Math.floor(mpW * 0.06));
    if (movingLine) { movingLine.style.left = inset + 'px'; movingLine.style.width = Math.max(0, mpW - inset * 2) + 'px'; }
    const mpRect = mainPanel.getBoundingClientRect();
    const leftPx = Math.round(mpRect.left);
    const rightPx = Math.round(mpRect.right);
    updateDebugOverlay({ left: leftPx, right: rightPx }, mpRect, movingLine ? 1 : 0);
  }

  window.addEventListener('resize', applyOriginalLineMath);

  const observer = new MutationObserver(() => { if (!document.body.classList.contains('view-animated')) { if (movingLine) movingLine.remove(); window.removeEventListener('resize', applyOriginalLineMath); observer.disconnect(); } });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

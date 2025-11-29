import { applyMainPanelBounds } from './mod_helpers.js';

export function setupAnimatedViewControls() {
  const root = document.documentElement;
  const mainPanel = document.querySelector('.main-panel');
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
    animatedLines.forEach((line, i) => {
      const lineHeight = 3;
      const mpStyle = getComputedStyle(mainPanel);
      const padTop = parseFloat(mpStyle.paddingTop) || 0;
      const padBottom = parseFloat(mpStyle.paddingBottom) || 0;
      if (currentPosition === 'top') line.style.top = padTop + 'px'; else { const h = mainPanel.clientHeight || mainPanel.getBoundingClientRect().height; line.style.top = Math.max(0, h - padBottom - lineHeight) + 'px'; }
      const mpWidth = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
      const inset = Math.min(120, Math.floor(mpWidth * 0.06));
      line.style.left = inset + 'px';
      line.style.width = Math.max(0, mpWidth - inset * 2) + 'px';
      line.style.height = lineHeight + 'px';
      line.style.background = `linear-gradient(90deg, transparent 0%, ${color} 10%, rgba(255,255,255,0.95) 50%, ${color} 90%, transparent 100%)`;
      line.style.backgroundSize = '200% 100%';
      line.style.animation = `sweep 2.2s linear ${i * 0.15}s infinite`;
    });
    updateDebugOverlay(bounds, mpRect, animatedLines.length);
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

      // live-preview still useful, but Apply will commit the chosen color explicitly
      acp.addEventListener('input', (e) => {
        // don't overwrite the CSS var until Apply, but allow immediate preview if desired
        // Here we choose to only preview visually by updating lines without changing the CSS var
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

      // Reset button: reset CSS var to white and update picker + lines
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

  createLines(3);

  function applyOriginalLineMath() {
    const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
    const inset = Math.min(120, Math.floor(mpW * 0.06));
    animatedLines.forEach((line) => { line.style.left = inset + 'px'; line.style.width = Math.max(0, mpW - inset * 2) + 'px'; });
    const mpRect = mainPanel.getBoundingClientRect();
    const leftPx = Math.round(mpRect.left);
    const rightPx = Math.round(mpRect.right);
    updateDebugOverlay({ left: leftPx, right: rightPx }, mpRect, animatedLines.length);
  }

  window.addEventListener('resize', applyOriginalLineMath);

  const observer = new MutationObserver(() => { if (!document.body.classList.contains('view-animated')) { removeLines(); window.removeEventListener('resize', applyOriginalLineMath); observer.disconnect(); } });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

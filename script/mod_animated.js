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

  // Manage multiple moving-line elements (user-configurable). Default to 3.
  let currentDirection = 'horizontal';
  let currentPattern = 'straight';
  let currentPosition = 'top';
  const DEFAULT_LINE_COUNT = 3;
  let movingLines = mainPanel ? Array.from(mainPanel.querySelectorAll('.moving-line')) : [];
  function removeMovingLines() {
    movingLines.forEach(l => l.remove());
    movingLines = [];
  }
  function createMovingLines(n) {
    removeMovingLines();
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'moving-line';
      el.dataset.index = i;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '1';
      if (getComputedStyle(mainPanel).position === 'static') mainPanel.style.position = 'relative';
      mainPanel.appendChild(el);
      movingLines.push(el);
    }
  }
  if (!movingLines || movingLines.length === 0) createMovingLines(DEFAULT_LINE_COUNT);
  if (mainPanel) mainPanel.style.overflow = 'hidden';

  // legacy multi-short-line helpers removed; this module now manages `movingLines`.

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
    const lineThickness = 3; // thickness in px
    const mpStyle = getComputedStyle(mainPanel);
    const padTop = parseFloat(mpStyle.paddingTop) || 0;
    const padBottom = parseFloat(mpStyle.paddingBottom) || 0;
    const padLeft = parseFloat(mpStyle.paddingLeft) || 0;
    const padRight = parseFloat(mpStyle.paddingRight) || 0;
    const mpHeight = mainPanel.clientHeight || mainPanel.getBoundingClientRect().height;
    const mpWidth = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
    const inset = Math.min(120, Math.floor(mpWidth * 0.06));
    const rgb = hexToRgb(color);
    const soft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
    const strong = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;

    if (currentDirection === 'horizontal') {
      const available = Math.max(0, mpHeight - padTop - padBottom - lineThickness);
      const count = movingLines.length;
      let spacing = 0; if (count > 1) spacing = available / (count - 1);
      movingLines.forEach((line, i) => {
        let y = 0;
        if (count === 1) {
          if (currentPosition === 'top') y = padTop;
          else if (currentPosition === 'bottom') y = Math.max(0, padTop + available);
          else y = Math.max(0, Math.round(mpHeight / 2 - lineThickness / 2));
        } else {
          if (currentPosition === 'top') {
            y = padTop + Math.round(spacing * i);
          } else if (currentPosition === 'bottom') {
            const lastStart = padTop + Math.round(available - spacing * (count - 1));
            y = lastStart + Math.round(spacing * i);
          } else {
            const groupHeight = spacing * (count - 1);
            const start = Math.round(mpHeight / 2 - groupHeight / 2 - lineThickness / 2);
            y = Math.max(padTop, start + Math.round(spacing * i));
          }
        }
        line.style.top = y + 'px';
        line.style.left = inset + 'px';
        line.style.width = Math.max(0, mpWidth - inset * 2) + 'px';
        line.style.height = lineThickness + 'px';
        line.style.background = `linear-gradient(90deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
        line.style.backgroundSize = '200% 100%';
        line.style.animation = `line-move 2.2s linear ${i * 0.12}s infinite`;
      });
    } else {
      // vertical direction: lines become narrow vertical bars spanning height
      const lineWidth = 3;
      const availableX = Math.max(0, mpWidth - padLeft - padRight - lineWidth - inset * 2);
      const count = movingLines.length;
      let spacingX = 0; if (count > 1) spacingX = availableX / (count - 1);
      movingLines.forEach((line, i) => {
        let x = 0;
        if (count === 1) {
          if (currentPosition === 'top') x = padLeft + inset;
          else if (currentPosition === 'bottom') x = Math.max(padLeft + inset, padLeft + inset + availableX);
          else x = Math.max(padLeft + inset, Math.round(mpWidth / 2 - lineWidth / 2));
        } else {
          if (currentPosition === 'top') {
            x = padLeft + inset + Math.round(spacingX * i);
          } else if (currentPosition === 'bottom') {
            const lastStartX = padLeft + inset + Math.round(availableX - spacingX * (count - 1));
            x = lastStartX + Math.round(spacingX * i);
          } else {
            const groupWidth = spacingX * (count - 1);
            const startX = Math.round(mpWidth / 2 - groupWidth / 2 - lineWidth / 2);
            x = Math.max(padLeft + inset, startX + Math.round(spacingX * i));
          }
        }
        line.style.left = x + 'px';
        line.style.top = inset + 'px';
        line.style.width = lineWidth + 'px';
        line.style.height = Math.max(0, mpHeight - inset * 2) + 'px';
        // vertical gradient
        line.style.background = `linear-gradient(180deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
        line.style.backgroundSize = '100% 200%';
        line.style.animation = `line-move-vertical 2.2s linear ${i * 0.12}s infinite`;
      });
    }
    updateDebugOverlay(bounds, mpRect, movingLines.length);
  }

  let debugOverlayEl = null;
  function attachDebugOverlay() {
    if (!mainPanel) return; mainPanel.classList.add('debug-border');
    if (!debugOverlayEl) { debugOverlayEl = document.createElement('div'); debugOverlayEl.className = 'debug-overlay'; debugOverlayEl.textContent = 'animated debug'; mainPanel.appendChild(debugOverlayEl); }
  }
  function updateDebugOverlay(bounds, mpRect, count) { if (!debugOverlayEl) return; debugOverlayEl.innerHTML = `lines: ${count}<br>mp: ${Math.round(mpRect.width)}x${Math.round(mpRect.height)}<br>bounds L:${bounds.left} R:${bounds.right}`; }

  const rightTopEl = document.querySelector('.right-top');
    if (rightTopEl) {
  const posRow = document.createElement('div'); posRow.className = 'direction-picker-row'; posRow.innerHTML = `<label>Position <select id="position-select"><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option></select></label>`;
    rightTopEl.insertBefore(posRow, rightTopEl.querySelector('.panel-buttons'));
    // add direction selector (horizontal / vertical)
    const dirRow = document.createElement('div'); dirRow.className = 'direction-picker-row'; dirRow.style.marginTop = '6px'; dirRow.innerHTML = `<label>Direction <select id="direction-select"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>`;
    rightTopEl.insertBefore(dirRow, posRow.nextSibling);
    const animColorRow = document.createElement('div'); animColorRow.className = 'color-picker-row'; animColorRow.innerHTML = `<label>Line Color <input id="animated-color-picker" type="color" value="#ffffff"/></label>`;
  const btnArea = rightTopEl.querySelector('.panel-buttons'); if (btnArea) rightTopEl.insertBefore(animColorRow, btnArea); else rightTopEl.appendChild(animColorRow);

  // add lines count selector
  const countRow = document.createElement('div');
  countRow.className = 'count-picker-row';
  countRow.style.marginTop = '8px';
  countRow.innerHTML = `<label>Lines <select id="lines-count"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option><option value="8">8</option></select></label>`;
  if (btnArea) rightTopEl.insertBefore(countRow, btnArea); else rightTopEl.appendChild(countRow);

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
      // lines count wiring
      const linesSelect = document.getElementById('lines-count');
      if (linesSelect) {
        linesSelect.addEventListener('change', (e) => {
          const n = parseInt(e.target.value, 10) || DEFAULT_LINE_COUNT;
          createMovingLines(n);
          updateLinePositions();
        });
      }
    }
    }

  const positionSelect = document.getElementById('position-select'); if (positionSelect) positionSelect.addEventListener('change', (e) => { currentPosition = e.target.value; updateLinePositions(); });
  const directionSelect = document.getElementById('direction-select'); if (directionSelect) directionSelect.addEventListener('change', (e) => { currentDirection = e.target.value; updateLinePositions(); });

  // initialize single line sizing
  updateLinePositions();

  function applyOriginalLineMath() {
    const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
    const inset = Math.min(120, Math.floor(mpW * 0.06));
    // update all moving lines width/left (for horizontal) or height/top (for vertical)
    const mpRect = mainPanel.getBoundingClientRect();
    const mpH = mainPanel.clientHeight || mpRect.height;
    if (currentDirection === 'horizontal') {
      movingLines.forEach(l => { l.style.left = inset + 'px'; l.style.width = Math.max(0, mpW - inset * 2) + 'px'; });
    } else {
      movingLines.forEach(l => { l.style.top = inset + 'px'; l.style.height = Math.max(0, mpH - inset * 2) + 'px'; });
    }
    const leftPx = Math.round(mpRect.left);
    const rightPx = Math.round(mpRect.right);
    updateDebugOverlay({ left: leftPx, right: rightPx }, mpRect, movingLines.length);
  }

  window.addEventListener('resize', applyOriginalLineMath);

  const observer = new MutationObserver(() => { if (!document.body.classList.contains('view-animated')) { removeMovingLines(); window.removeEventListener('resize', applyOriginalLineMath); observer.disconnect(); } });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

import { applyMainPanelBounds, hexToRgb } from './mod_helpers.js';

export function setupAnimatedViewControls() {
  const root = document.documentElement;
  const mainPanel = document.querySelector('.main-panel');

  if (mainPanel) {
    mainPanel.querySelectorAll('.animated-line').forEach(el => el.remove());
    const staticLine = mainPanel.querySelector('.static-line');
    if (staticLine) staticLine.remove();
  }

  // Remove any leftover moving-line elements (they may have been created
  // elsewhere and could remain inside the scrolling main panel). We want
  // moving lines that represent background decorations to be viewport-fixed
  // (appended to document.body) and not scroll with page content.
  document.querySelectorAll('.moving-line').forEach(el => el.remove());

  let currentDirection = 'horizontal';
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
      // create moving lines as top-level viewport elements by default so
      // vertical/diagonal variants can be forced fixed without being trapped
      // inside a transformed/scrolling ancestor. Horizontal branch will
      // reparent into `mainPanel` when needed.
      if (getComputedStyle(mainPanel).position === 'static') mainPanel.style.position = 'relative';
      document.body.appendChild(el);
      movingLines.push(el);
    }
  }

  if (!movingLines || movingLines.length < DEFAULT_LINE_COUNT) createMovingLines(DEFAULT_LINE_COUNT);
  if (mainPanel) mainPanel.style.overflow = 'hidden';

  function getCenterBounds() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const lp = leftPanel ? leftPanel.getBoundingClientRect() : { right: 0 };
    const rp = rightPanel ? rightPanel.getBoundingClientRect() : { left: window.innerWidth };
    return { left: Math.max(0, Math.round(lp.right)), right: Math.max(0, Math.round(rp.left)) };
  }

  let debugOverlayEl = null;
  function attachDebugOverlay() {
    if (!mainPanel) return;
    mainPanel.classList.add('debug-border');
    if (!debugOverlayEl) {
      debugOverlayEl = document.createElement('div');
      debugOverlayEl.className = 'debug-overlay';
      debugOverlayEl.textContent = 'animated debug';
      mainPanel.appendChild(debugOverlayEl);
    }
  }

  function updateDebugOverlay(bounds, mpRect, count) {
    if (!debugOverlayEl) return;
    debugOverlayEl.innerHTML = `lines: ${count}<br>mp: ${Math.round(mpRect.width)}x${Math.round(mpRect.height)}<br>bounds L:${bounds.left} R:${bounds.right}`;
  }

  function updateLinePositions() {
    if (!mainPanel) return;
    const bounds = getCenterBounds();
    const animPicker = document.getElementById('animated-color-picker');
    const color = (animPicker && animPicker.value) ? animPicker.value : (document.getElementById('color-picker') ? document.getElementById('color-picker').value : getComputedStyle(root).getPropertyValue('--animated-bg').trim() || '#ffffff');
    const mpRect = mainPanel.getBoundingClientRect();
    const lineThickness = 3;
    const mpStyle = getComputedStyle(mainPanel);
    const padTop = parseFloat(mpStyle.paddingTop) || 0;
    const padBottom = parseFloat(mpStyle.paddingBottom) || 0;
    const padLeft = parseFloat(mpStyle.paddingLeft) || 0;
    const padRight = parseFloat(mpStyle.paddingRight) || 0;
    const mpHeight = mainPanel.clientHeight || mpRect.height;
    const mpWidth = mainPanel.clientWidth || mpRect.width;
    const inset = Math.min(120, Math.floor(mpWidth * 0.06));
    const rgb = hexToRgb(color);
    const soft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
    const strong = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;

    // Horizontal
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
  // ensure absolute-positioned lines are children of the main panel
  if (line.parentNode !== mainPanel) mainPanel.appendChild(line);
  line.classList.remove('moving-line--fixed');
  line.style.position = 'absolute';
        line.style.zIndex = '1';
        line.style.top = y + 'px';
        line.style.left = inset + 'px';
        line.style.width = Math.max(0, mpWidth - inset * 2) + 'px';
        line.style.height = lineThickness + 'px';
        line.style.background = `linear-gradient(90deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
        line.style.backgroundSize = '200% 100%';
        line.style.animation = `line-move 2.2s linear ${i * 0.12}s infinite`;
      });

    // Vertical
    } else if (currentDirection === 'vertical') {
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
  const absoluteLeft = Math.round(mpRect.left) + x;
  // ensure fixed-positioned lines are children of the document body so they are
  // truly fixed to the viewport (avoids transform/containment issues)
  if (line.parentNode !== document.body) document.body.appendChild(line);
  line.classList.add('moving-line--fixed');
  line.style.position = 'fixed';
  line.style.left = absoluteLeft + 'px';
  line.style.top = '0px';
        line.style.width = lineWidth + 'px';
        line.style.height = Math.max(0, window.innerHeight || document.documentElement.clientHeight) + 'px';
        line.style.background = `linear-gradient(180deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
        line.style.backgroundSize = '100% 200%';
        line.style.animation = `line-move-vertical 2.2s linear ${i * 0.12}s infinite`;
        line.style.zIndex = '0';
      });

    // Diagonal
    } else if (currentDirection === 'diagonal') {
      const count = movingLines.length;
      const diagInset = Math.max(6, Math.floor(mpWidth * 0.02)); // smaller inset so lines can reach corners
      const innerW = Math.max(0, mpWidth - diagInset * 2);
      const innerH = Math.max(0, mpHeight - diagInset * 2);

      const diagLen = Math.hypot(mpWidth, mpHeight);
      const dirX = mpWidth / diagLen;
      const dirY = mpHeight / diagLen;
      const angleDeg = Math.atan2(dirY, dirX) * 180 / Math.PI;

      const topCount = Math.ceil(count / 2);
      const leftCount = count - topCount;
      const topSpacing = topCount > 1 ? innerW / (topCount - 1) : 0;
      const leftSpacing = leftCount > 1 ? innerH / (leftCount - 1) : 0;

      // Build starts according to requested ordering:
      // - if count === 1 -> single start at top-left (0,0)
      // - otherwise: if odd, reserve the top-left corner as the first start;
      //   distribute the remaining starts across top and left edges using
      //   fractional positions (so 1 start -> midpoint, 2 -> 1/3 & 2/3, etc.)
      const starts = [];
      if (count === 1) {
        starts.push({ sx: 0, sy: 0 });
      } else {
        const reserveCorner = (count % 2 === 1);
        let remaining = count - (reserveCorner ? 1 : 0);
        const topAlloc = Math.ceil(remaining / 2);
        const leftAlloc = remaining - topAlloc;
        if (reserveCorner) starts.push({ sx: 0, sy: 0 });

        // top edge positions (exclude exact corner) -> fractions of panel width
        for (let i = 0; i < topAlloc; i++) {
          const frac = (i + 1) / (topAlloc + 1);
          const sx = Math.round(frac * mpWidth);
          starts.push({ sx: sx, sy: 0 });
        }

        // left edge positions -> fractions of panel height
        for (let j = 0; j < leftAlloc; j++) {
          const frac = (j + 1) / (leftAlloc + 1);
          const sy = Math.round(frac * mpHeight);
          starts.push({ sx: 0, sy: sy });
        }
      }

      function computeLineTRange(sx, sy, dirX, dirY, w, h) {
        const ts = [];
        if (Math.abs(dirX) > 1e-6) {
          const t0 = (0 - sx) / dirX; const y0 = sy + dirY * t0; if (y0 >= -0.5 && y0 <= h + 0.5) ts.push(t0);
          const t1 = (w - sx) / dirX; const y1 = sy + dirY * t1; if (y1 >= -0.5 && y1 <= h + 0.5) ts.push(t1);
        }
        if (Math.abs(dirY) > 1e-6) {
          const t2 = (0 - sy) / dirY; const x2 = sx + dirX * t2; if (x2 >= -0.5 && x2 <= w + 0.5) ts.push(t2);
          const t3 = (h - sy) / dirY; const x3 = sx + dirX * t3; if (x3 >= -0.5 && x3 <= w + 0.5) ts.push(t3);
        }
        if (ts.length === 0) return null;
        ts.sort((a, b) => a - b);
        return [ts[0], ts[ts.length - 1]];
      }

      // compute intersections of ray (sx,sy) + t*(dirX,dirY) with arbitrary rectangle
      // rect bounds: x in [xMin,xMax], y in [yMin,yMax]. Returns [tMin,tMax] or null.
      function computeLineTRangeRect(sx, sy, dirX, dirY, xMin, xMax, yMin, yMax) {
        const ts = [];
        if (Math.abs(dirX) > 1e-6) {
          // x = xMin
          const t0 = (xMin - sx) / dirX; const y0 = sy + dirY * t0; if (y0 >= yMin - 0.5 && y0 <= yMax + 0.5) ts.push(t0);
          // x = xMax
          const t1 = (xMax - sx) / dirX; const y1 = sy + dirY * t1; if (y1 >= yMin - 0.5 && y1 <= yMax + 0.5) ts.push(t1);
        }
        if (Math.abs(dirY) > 1e-6) {
          // y = yMin
          const t2 = (yMin - sy) / dirY; const x2 = sx + dirX * t2; if (x2 >= xMin - 0.5 && x2 <= xMax + 0.5) ts.push(t2);
          // y = yMax
          const t3 = (yMax - sy) / dirY; const x3 = sx + dirX * t3; if (x3 >= xMin - 0.5 && x3 <= xMax + 0.5) ts.push(t3);
        }
        if (ts.length === 0) return null;
        ts.sort((a, b) => a - b);
        return [ts[0], ts[ts.length - 1]];
      }

        movingLines.forEach((line, idx) => {
          const s = starts[idx] || starts[0];
          const sx = s.sx, sy = s.sy;

          // convert start (panel-local) to viewport coordinates
          const sx_vp = Math.round(mpRect.left + sx);
          const sy_vp = Math.round(mpRect.top + sy);

    // compute intersections against the viewport clipped to the main panel horizontal bounds
    // so lines start at the very top but do not extend into side panels
    const xMin = Math.round(mpRect.left);
    const xMax = Math.round(mpRect.right);
    const yMin = 0;
    const yMax = window.innerHeight;
    const rangeVP = computeLineTRangeRect(sx_vp, sy_vp, dirX, dirY, xMin, xMax, yMin, yMax);
          if (!rangeVP) {
            // fallback: centered diagonal across the viewport (fixed)
            const cx = Math.round(window.innerWidth / 2), cy = Math.round(window.innerHeight / 2);
            // ensure fixed positioning anchors to the viewport
            document.body.appendChild(line);
            line.classList.add('moving-line--fixed');
            line.style.position = 'fixed';
            line.style.left = cx + 'px';
            line.style.top = cy + 'px';
            line.style.width = Math.round(Math.hypot(window.innerWidth, window.innerHeight)) + 'px';
            line.style.height = lineThickness + 'px';
            line.style.transform = `translate(-50%,-50%) rotate(${angleDeg}deg)`;
            line.style.background = `linear-gradient(90deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
            line.style.backgroundSize = '200% 100%';
            line.style.animation = `gradient-shift 2.4s linear ${idx * 0.12}s infinite`;
            line.style.zIndex = '0';
            return;
          }

          const tStart = rangeVP[0], tEnd = rangeVP[1];
          const sxAbs_vp = sx_vp + dirX * tStart, syAbs_vp = sy_vp + dirY * tStart;
          const exAbs_vp = sx_vp + dirX * tEnd, eyAbs_vp = sy_vp + dirY * tEnd;
          const midX_vp = Math.round((sxAbs_vp + exAbs_vp) / 2), midY_vp = Math.round((syAbs_vp + eyAbs_vp) / 2);
          const length_vp = Math.max(2, Math.round(Math.hypot(exAbs_vp - sxAbs_vp, eyAbs_vp - syAbs_vp)));

  // position fixed in the viewport so diagonal lines behave like vertical lines
  if (line.parentNode !== document.body) document.body.appendChild(line);
  line.classList.add('moving-line--fixed');
  line.style.position = 'fixed';
    line.style.left = midX_vp + 'px';
    line.style.top = midY_vp + 'px';
          line.style.width = length_vp + 'px';
          line.style.height = lineThickness + 'px';
          line.style.background = `linear-gradient(90deg, transparent 0%, ${soft} 10%, ${strong} 50%, ${soft} 90%, transparent 100%)`;
          line.style.backgroundSize = '200% 100%';
          line.style.transform = `translate(-50%,-50%) rotate(${angleDeg}deg)`;
          line.style.transformOrigin = '50% 50%';
          line.style.animation = `gradient-shift 2.4s linear ${idx * 0.12}s infinite`;
          // keep lower z-index so header can render above
          line.style.zIndex = '0';
        });

    // fallback
    } else {
      const lineWidth = 3;
      const availableX = Math.max(0, mpWidth - padLeft - padRight - lineWidth - inset * 2);
      const count = movingLines.length;
      let spacingX = 0; if (count > 1) spacingX = availableX / (count - 1);
      movingLines.forEach((line, i) => {
        line.style.position = 'absolute';
        line.style.left = inset + 'px';
        line.style.width = Math.max(0, mpWidth - inset * 2) + 'px';
        line.style.height = lineThickness + 'px';
      });
    }

    updateDebugOverlay(bounds, mpRect, movingLines.length);
  }

  // UI wiring: add controls into the right-top area
  const rightTopEl = document.querySelector('.right-top');
  if (rightTopEl) {
    const posRow = document.createElement('div'); posRow.className = 'direction-picker-row'; posRow.innerHTML = `<label>Position <select id="position-select"><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option></select></label>`;
    rightTopEl.insertBefore(posRow, rightTopEl.querySelector('.panel-buttons'));

    const dirRow = document.createElement('div'); dirRow.className = 'direction-picker-row'; dirRow.style.marginTop = '6px';
    dirRow.innerHTML = `<label>Direction <select id="direction-select"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="diagonal">Diagonal</option></select></label>`;
    rightTopEl.insertBefore(dirRow, posRow.nextSibling);

    const animColorRow = document.createElement('div'); animColorRow.className = 'color-picker-row';
    animColorRow.innerHTML = `<label>Line Color <input id="animated-color-picker" type="color" value="#ffffff"/></label>`;
    const btnArea = rightTopEl.querySelector('.panel-buttons'); if (btnArea) rightTopEl.insertBefore(animColorRow, btnArea); else rightTopEl.appendChild(animColorRow);

    const countRow = document.createElement('div');
    countRow.className = 'count-picker-row';
    countRow.style.marginTop = '8px';
    countRow.innerHTML = `<label>Lines <select id="lines-count"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option><option value="8">8</option></select></label>`;
    if (btnArea) rightTopEl.insertBefore(countRow, btnArea); else rightTopEl.appendChild(countRow);

    const btnRow = document.createElement('div'); btnRow.className = 'panel-buttons animated-apply-row'; btnRow.style.marginTop = '8px';
    btnRow.innerHTML = `<button id="animated-apply" class="btn">Apply</button><button id="animated-reset" class="btn">Reset</button>`;
    if (btnArea) rightTopEl.insertBefore(btnRow, btnArea); else rightTopEl.appendChild(btnRow);

    const acp = document.getElementById('animated-color-picker');
    if (acp) {
      const v = getComputedStyle(root).getPropertyValue('--animated-bg').trim() || '#ffffff';
      acp.value = (v.startsWith('#') ? v : '#ffffff');
      acp.addEventListener('input', () => updateLinePositions());
      const applyBtn = document.getElementById('animated-apply'); if (applyBtn) applyBtn.addEventListener('click', () => { root.style.setProperty('--animated-bg', acp.value); updateLinePositions(); });
      const resetBtn = document.getElementById('animated-reset'); if (resetBtn) resetBtn.addEventListener('click', () => { root.style.setProperty('--animated-bg', '#ffffff'); acp.value = '#ffffff'; updateLinePositions(); });
      const linesSelect = document.getElementById('lines-count'); if (linesSelect) linesSelect.addEventListener('change', (e) => { const n = parseInt(e.target.value, 10) || DEFAULT_LINE_COUNT; createMovingLines(n); updateLinePositions(); });
    }
  }

  const positionSelect = document.getElementById('position-select'); if (positionSelect) positionSelect.addEventListener('change', (e) => { currentPosition = e.target.value; updateLinePositions(); });
  const directionSelect = document.getElementById('direction-select'); if (directionSelect) directionSelect.addEventListener('change', (e) => { currentDirection = e.target.value; updateLinePositions(); });

  // initial layout
  updateLinePositions();

  function applyOriginalLineMath() {
    if (!mainPanel) return;
    const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
    const inset = Math.min(120, Math.floor(mpW * 0.06));
    const mpRect = mainPanel.getBoundingClientRect();
    const mpH = mainPanel.clientHeight || mpRect.height;
    if (currentDirection === 'horizontal') {
      movingLines.forEach(l => { l.style.left = inset + 'px'; l.style.width = Math.max(0, mpW - inset * 2) + 'px'; });
    } else if (currentDirection === 'vertical') {
      movingLines.forEach(l => { l.style.top = inset + 'px'; l.style.height = Math.max(0, mpH - inset * 2) + 'px'; });
    } else if (currentDirection === 'diagonal') {
      updateLinePositions();
      return;
    }
    const leftPx = Math.round(mpRect.left);
    const rightPx = Math.round(mpRect.right);
    updateDebugOverlay({ left: leftPx, right: rightPx }, mpRect, movingLines.length);
  }

  window.addEventListener('resize', applyOriginalLineMath);

  const observer = new MutationObserver(() => { if (!document.body.classList.contains('view-animated')) { removeMovingLines(); window.removeEventListener('resize', applyOriginalLineMath); observer.disconnect(); } });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

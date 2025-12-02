import { normalizeHex, hexToRgb, getContrastColor, applyMainPanelBounds } from './mod_helpers.js';
import { setupButtons } from './mod_buttons.js';
import { setupAnimatedViewControls } from './mod_animated.js';

// Expose UI wiring functions
export function setupUI() {
  const root = document.documentElement;
  const h1 = document.querySelector('h1');
  const mainPanel = document.querySelector('.main-panel');
  const buttonGridHTML = `
<div class="button-grid">
  <button class="btn btn-1">Pulse</button>
  <button class="btn btn-3">Glow</button>
  <button class="btn btn-4">Bounce</button>
  <button class="btn btn-5">Bob</button>
  <button class="btn btn-6">Shimmer</button>
  <button class="btn btn-7">Subtle Glow</button>
  <button class="btn btn-8">Particle Explosion</button>
  <button class="btn btn-9">Loading Morph</button>
  <button class="btn btn-10">3D Push</button>
  <button class="btn btn-11">Glassmorphic</button>
  <button class="btn btn-12"><span class="btn-text">Disintegrate</span></button>
  <button class="btn btn-13"><span class="btn-text">Gradient Fill</span></button>
</div>
`;

  document.body.classList.add('view-plain');
  h1.textContent = 'Button Showcase';
  mainPanel.innerHTML = buttonGridHTML;
  setupButtons();

  // Collect some DOM refs used by UI controls
  const targetSelect = document.getElementById('target-select');
  const colorPicker = document.getElementById('color-picker');
  const applyBtn = document.getElementById('apply-color');
  const resetBtn = document.getElementById('reset-colors');
  const animToggle = document.getElementById('animations-toggle');

  // Build targets map same as original
  const targets = {
    all: ['--btn-1','--btn-3','--btn-4','--btn-5','--btn-6','--btn-7','--btn-base','--btn-8','--btn-9','--btn-10','--btn-11','--btn-12','--btn-13'],
    btn1: ['--btn-1'], btn3: ['--btn-3'], btn4: ['--btn-4'], btn5: ['--btn-5'], btn6: ['--btn-6'], btn7: ['--btn-7'], btn8: ['--btn-8'], btn9: ['--btn-9'], btn10: ['--btn-10'], btn11: ['--btn-11'], btn12: ['--btn-12'], btn13: ['--btn-13'], 'left-panel': ['--panel-left-bg','--panel-divider'], 'right-panel': ['--panel-right-bg'], text: ['--text'], accent: ['--accent']
  };

  // capture defaults for reset
  const uniqueVars = [...new Set(Object.values(targets).flat())];
  const textVars = uniqueVars.map(v => v + '-text');
  const allVars = [...new Set([...uniqueVars, ...textVars])];
  const defaults = {};
  allVars.forEach(v => { defaults[v] = getComputedStyle(root).getPropertyValue(v).trim() || ''; });

  function updatePicker() {
    const target = targetSelect.value;
    const vars = targets[target];
    if (!vars || vars.length === 0) return;
    const v = getComputedStyle(root).getPropertyValue(vars[0]).trim();
    colorPicker.value = normalizeHex(v);
  }

  if (applyBtn) applyBtn.addEventListener('click', () => {
    const color = colorPicker.value;
    const target = targetSelect.value;
    const vars = targets[target] || [];
    vars.forEach(variable => {
      root.style.setProperty(variable, color);
      if (variable.startsWith('--btn-')) {
        const rgb = hexToRgb(normalizeHex(color));
        const contrast = getContrastColor(rgb.r, rgb.g, rgb.b);
        root.style.setProperty(variable + '-text', contrast);
      }
    });
  });

  if (resetBtn) resetBtn.addEventListener('click', () => { Object.entries(defaults).forEach(([k,v]) => root.style.setProperty(k, v)); updatePicker(); });
  if (targetSelect) targetSelect.addEventListener('change', updatePicker);
  if (targetSelect && colorPicker) updatePicker();

  if (animToggle) {
    animToggle.checked = false;
    animToggle.addEventListener('change', () => {
      if (animToggle.checked) {
        // startAutoLoops - left in main script or could be migrated later
        const evt = new CustomEvent('startAutoLoops'); window.dispatchEvent(evt);
      } else {
        const evt = new CustomEvent('stopAutoLoops'); window.dispatchEvent(evt);
      }
    });
  }

  // menu background handlers
  document.querySelectorAll('.menu-option[data-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.bg;
      document.body.classList.remove('view-gradient', 'view-animated', 'view-plain');
      document.body.classList.add('view-' + type);

      const rightTop = document.querySelector('.right-top');
      const rightViewTitle = document.querySelector('.right-view-title');
      h1.textContent = '';
      mainPanel.innerHTML = '';
      rightViewTitle.textContent = '';
      rightTop.innerHTML = '';

      if (type === 'animated') {
        h1.textContent = 'Animated';
        mainPanel.innerHTML = '';
        if (getComputedStyle(mainPanel).position === 'static') mainPanel.style.position = 'relative';
        applyMainPanelBounds(mainPanel);
        const existing = mainPanel.querySelector('.static-line'); if (existing) existing.remove();
        const line = document.createElement('div'); line.className = 'static-line'; mainPanel.appendChild(line);
        const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
        const inset = Math.min(120, Math.floor(mpW * 0.06));
        line.style.left = inset + 'px';
        line.style.width = Math.max(0, mpW - inset * 2) + 'px';
        const mpStyle = getComputedStyle(mainPanel); const padTop = parseFloat(mpStyle.paddingTop) || 0; line.style.top = padTop + 'px';
        mainPanel.style.overflow = 'hidden';
        mainPanel.classList.add('plain-view');
      }

      if (type === 'animated') {
        mainPanel.classList.remove('plain-view');
        h1.textContent = 'Animated';
        mainPanel.innerHTML = '';
        if (getComputedStyle(mainPanel).position === 'static') mainPanel.style.position = 'relative';
        applyMainPanelBounds(mainPanel);
        const existing = mainPanel.querySelector('.static-line'); if (existing) existing.remove();
        const line = document.createElement('div'); line.className = 'static-line'; mainPanel.appendChild(line);
        const mpW = mainPanel.clientWidth || mainPanel.getBoundingClientRect().width;
        const inset = Math.min(120, Math.floor(mpW * 0.06));
        line.style.left = inset + 'px';
        line.style.width = Math.max(0, mpW - inset * 2) + 'px';
        const mpStyle = getComputedStyle(mainPanel); const padTop = parseFloat(mpStyle.paddingTop) || 0; line.style.top = padTop + 'px';
        mainPanel.style.overflow = 'hidden';
      } else if (type === 'gradient') {
        h1.textContent = 'Gradient'; mainPanel.innerHTML = '';
      }

      // right panel content
      if (type === 'animated') {
        // delegate to module to setup animated controls. The module will create
        // any needed moving-line elements and ensure they are attached to the
        // correct container (document.body for fixed lines). Avoid creating a
        // transient .moving-line here which could remain inside the scrolling
        // main panel and produce a scrolling artifact.
        setupAnimatedViewControls();
      } else if (type === 'gradient') {
        rightViewTitle.textContent = 'Gradient'; rightTop.innerHTML = '';
      } else {
        rightViewTitle.textContent = ''; rightTop.innerHTML = '';
      }
    });
  });

  // foreground (buttons) handler
  document.querySelectorAll('.menu-option[data-fg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.fg;
      if (type === 'buttons') {
        document.body.classList.remove('view-gradient', 'view-animated', 'view-plain');
        document.body.classList.add('view-plain');
        document.body.style.backgroundColor = getComputedStyle(root).getPropertyValue('--bg').trim();
        const rightTop = document.querySelector('.right-top');
        const rightViewTitle = document.querySelector('.right-view-title');
        h1.textContent = '';
        ['position','left','top','width','height','margin','padding','overflow'].forEach(p => mainPanel.style[p] = '');
        mainPanel.classList.add('plain-view');
        mainPanel.innerHTML = '';
        rightViewTitle.textContent = '';
        rightTop.innerHTML = '';
        mainPanel.innerHTML = buttonGridHTML;
        setupButtons();
        h1.textContent = 'Button Showcase';
        rightViewTitle.textContent = 'Plain';
        rightTop.innerHTML = `
          <h2>Theme Switcher</h2>
          <label for="target-select">Filter</label>
          <select id="target-select">
            <option value="all">All Buttons</option>
            <option value="btn1">Pulse</option>
            <option value="btn3">Glow</option>
            <option value="btn4">Bounce</option>
            <option value="btn5">Bob</option>
            <option value="btn6">Shimmer</option>
            <option value="btn7">Subtle Glow</option>
            <option value="btn8">Particle Explosion</option>
            <option value="btn9">Loading Morph</option>
            <option value="btn10">3D Push</option>
            <option value="btn11">Glassmorphic</option>
            <option value="btn12">Disintegrate</option>
            <option value="btn13">Gradient Fill</option>
            <option value="btn9">High Glow</option>
            <option value="left-panel">Left Panel</option>
            <option value="right-panel">Right Panel</option>
            <option value="text">Text Color</option>
            <option value="accent">Accent</option>
          </select>
          <div class="color-picker-row">
            <label>Color
              <input id="color-picker" type="color" value="#ffffff" />
            </label>
          </div>
          <div class="panel-buttons">
            <button id="apply-color" class="btn">Apply</button>
            <button id="reset-colors" class="btn">Reset</button>
          </div>
        `;

        setTimeout(() => {
          const targetSelect = document.getElementById('target-select');
          const colorPicker = document.getElementById('color-picker');
          const applyBtn = document.getElementById('apply-color');
          const resetBtn = document.getElementById('reset-colors');

          if (targetSelect && colorPicker && applyBtn && resetBtn) {
            function updatePicker() {
              const target = targetSelect.value;
              const vars = targets[target];
              if (!vars || vars.length === 0) return;
              const v = getComputedStyle(root).getPropertyValue(vars[0]).trim();
              colorPicker.value = normalizeHex(v);
            }

            applyBtn.addEventListener('click', () => {
              const color = colorPicker.value;
              const target = targetSelect.value;
              const vars = targets[target] || [];
              vars.forEach(variable => {
                root.style.setProperty(variable, color);
                if (variable.startsWith('--btn-')) {
                  const rgb = hexToRgb(normalizeHex(color));
                  const contrast = getContrastColor(rgb.r, rgb.g, rgb.b);
                  root.style.setProperty(variable + '-text', contrast);
                }
              });
            });

            resetBtn.addEventListener('click', () => { Object.entries(defaults).forEach(([k,v]) => root.style.setProperty(k, v)); updatePicker(); });
            targetSelect.addEventListener('change', updatePicker);
            updatePicker();
            document.querySelector('.color-picker-row').addEventListener('click', () => { document.getElementById('color-picker').click(); });
          } else {
            setupAnimatedViewControls();
          }
        }, 0);
      }
    });
  });

}

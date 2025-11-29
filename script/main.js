import { setupButtons } from './mod_buttons.js';
import { setupAnimatedViewControls } from './mod_animated.js';
import { setupUI } from './mod_ui.js';

// keep start/stop auto loops (minimal implementation moved here)
let _loops = {};

function startAutoLoops() {
  // Use the same perButtonConfigs used previously by buttons module; keep it simple
  const perButtonConfigs = {
    'btn-1': { selector: '.btn-1', duration: 400, interval: 3000, initialDelay: 120 },
    'btn-3': { selector: '.btn-3', duration: 500, interval: 3000, initialDelay: 240 },
    'btn-4': { selector: '.btn-4', duration: 600, interval: 3000, initialDelay: 360 },
    'btn-5': { selector: '.btn-5', duration: 2800, interval: 4200, initialDelay: 600 },
    'btn-6': { selector: '.btn-6', duration: 700, interval: 3000, initialDelay: 480 },
    'btn-7': { selector: '.btn-7', duration: 0, interval: 3000, initialDelay: 720 },
    'btn-11': { selector: '.btn-11', duration: 500, interval: 3000, initialDelay: 0 }
  };

  Object.values(perButtonConfigs).forEach(cfg => {
    const el = document.querySelector(cfg.selector);
    if (!el) return;
    const trigger = () => {
      if (cfg.selector === '.btn-6') { el.classList.add('shimmer-go'); setTimeout(() => el.classList.remove('shimmer-go'), 600); return; }
      if (cfg.selector === '.btn-11') { el.classList.add('shimmer-go'); setTimeout(() => el.classList.remove('shimmer-go'), 500); return; }
      if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) { el.classList.add('auto'); return; }
      el.classList.add('auto'); setTimeout(() => el.classList.remove('auto'), cfg.duration);
    };
    const delay = cfg.initialDelay || 0;
    const tid = setTimeout(() => { trigger(); _loops[cfg.selector] = setInterval(trigger, cfg.interval); }, delay);
    _loops[cfg.selector + '::init'] = tid;
  });
}

function stopAutoLoops() {
  Object.values(_loops).forEach(id => clearInterval(id) || clearTimeout(id));
  Object.keys(_loops).forEach(k => delete _loops[k]);
  // cleanup classes
  const perButtonConfigs = ['.btn-1','.btn-3','.btn-4','.btn-5','.btn-6','.btn-7','.btn-11'];
  perButtonConfigs.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.classList.remove('auto','shimmer-forward','shimmer-reverse','pulse-out','pulse-in','shimmer-go');
  });
}

// listen for custom events from UI module
window.addEventListener('startAutoLoops', startAutoLoops);
window.addEventListener('stopAutoLoops', stopAutoLoops);

// Entry point
document.addEventListener('DOMContentLoaded', () => {
  // main UI wiring and initial content
  setupUI();
});

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
    'btn-8': { selector: '.btn-8', duration: 0, interval: 4000, initialDelay: 840 },
    'btn-9': { selector: '.btn-9', duration: 0, interval: 5000, initialDelay: 960 },
    'btn-10': { selector: '.btn-10', duration: 0, interval: 3500, initialDelay: 1080 },
    'btn-11': { selector: '.btn-11', duration: 500, interval: 3000, initialDelay: 0 },
    'btn-12': { selector: '.btn-12', duration: 0, interval: 4500, initialDelay: 1200 },
    'btn-13': { selector: '.btn-13', duration: 0, interval: 3000, initialDelay: 1320 }
  };

  Object.values(perButtonConfigs).forEach(cfg => {
    const el = document.querySelector(cfg.selector);
    if (!el) return;
    const trigger = () => {
      if (cfg.selector === '.btn-6') { el.classList.add('shimmer-go'); setTimeout(() => el.classList.remove('shimmer-go'), 600); return; }
      if (cfg.selector === '.btn-11') { el.classList.add('shimmer-go'); setTimeout(() => el.classList.remove('shimmer-go'), 500); return; }
      if (cfg.selector === '.btn-7') { el.classList.add('auto'); return; }
      // 3D push button: add pressed class for 1 second
      if (cfg.selector === '.btn-10') {
        el.classList.add('pressed-3d');
        setTimeout(() => el.classList.remove('pressed-3d'), 1000);
        return;
      }
      // Click-based effects: trigger click
      if (['.btn-8', '.btn-9', '.btn-12'].includes(cfg.selector)) {
        el.click();
        // For btn-9, toggle back after a delay
        if (cfg.selector === '.btn-9') {
          setTimeout(() => el.click(), 2000);
        }
        return;
      }
      // Gradient fill for btn-13 (add fill-go class for 1.2 seconds)
      if (cfg.selector === '.btn-13') {
        el.classList.add('fill-go');
        setTimeout(() => {
          el.classList.remove('fill-go');
        }, 1200);
        return;
      }
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
  const perButtonConfigs = ['.btn-1','.btn-3','.btn-4','.btn-5','.btn-6','.btn-7','.btn-8','.btn-9','.btn-10','.btn-11','.btn-12','.btn-13'];
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

import { hexToRgb, getContrastColor } from './mod_helpers.js';

export function setupButtons() {
  const btn12 = document.querySelector('.btn-12');
  if (btn12) {
    for(let i = 0; i < 10; i++) {
      const strip = document.createElement('div');
      strip.classList.add('strip');
      strip.style.left = (i * 10) + '%';
      strip.style.width = '10%';
      btn12.appendChild(strip);
    }

    function recreateStrips() {
      if (!btn12.querySelector('.strip')) {
        for (let j = 0; j < 10; j++) {
          const strip = document.createElement('div');
          strip.classList.add('strip');
          strip.style.left = (j * 10) + '%';
          strip.style.width = '10%';
          btn12.appendChild(strip);
        }
      }
    }

    function resetBtn12Appearance() {
      if (!btn12.querySelector('.btn-text')) {
        const span = document.createElement('span');
        span.className = 'btn-text';
        span.textContent = 'Disintegrate';
        btn12.insertBefore(span, btn12.firstChild);
      }
      const stripsNow = btn12.querySelectorAll('.strip');
      stripsNow.forEach(s => {
        s.style.transform = '';
        s.style.opacity = '1';
        s.style.transitionDelay = '';
        s.classList.remove('slide-up', 'slide-down');
      });
      btn12.disabled = false;
    }

    // hover behaviour
    btn12.addEventListener('mouseenter', () => {
      const strips = btn12.querySelectorAll('.strip');
      btn12.addEventListener('mousemove', (e) => {
        const rect = btn12.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.floor(x / (rect.width / 10));
        strips.forEach((strip, i) => {
          if (Math.abs(i - index) <= 1) {
            if (i % 2 === 0) strip.classList.add('slide-up'); else strip.classList.add('slide-down');
          } else {
            strip.classList.remove('slide-up');
            strip.classList.remove('slide-down');
          }
        });
      });
    });

    btn12.addEventListener('mouseleave', () => {
      const strips = btn12.querySelectorAll('.strip');
      strips.forEach(strip => {
        strip.classList.remove('slide-up');
        strip.classList.remove('slide-down');
      });
    });

    btn12.addEventListener('click', (e) => {
      const rect = btn12.getBoundingClientRect();
      const strips = Array.from(btn12.querySelectorAll('.strip'));
      if (strips.length === 0) return;
      const localX = e.clientX - rect.left;
      const clickedIndex = Math.min(strips.length - 1, Math.max(0, Math.floor(localX / (rect.width / strips.length))));
      strips.forEach((strip, i) => {
        const dist = Math.abs(i - clickedIndex);
        const dir = i < clickedIndex ? -1 : (i > clickedIndex ? 1 : (Math.random() > 0.5 ? 1 : -1));
        const baseMove = Math.max(80, Math.floor(rect.width * 0.12));
        const move = baseMove + dist * 40;
        const vert = (10 + dist * 4) * (dir * (i % 2 === 0 ? 1 : -1));
        const rot = (6 + dist * 2) * dir;
        strip.style.transitionDelay = (dist * 60) + 'ms';
        strip.style.transform = `translateX(${dir * move}px) translateY(${vert}px) rotate(${rot}deg)`;
        strip.style.opacity = '0';
      });
      setTimeout(() => strips.forEach(s => s.remove()), 1200 + strips.length * 60);
      setTimeout(() => { recreateStrips(); }, 1200 + strips.length * 40);
      setTimeout(() => { resetBtn12Appearance(); recreateStrips(); }, 3000);
    });
  }

  // particles for btn-8
  const btn8 = document.querySelector('.btn-8');
  if (btn8) {
    btn8.addEventListener('click', (e) => {
      const btn = e.target;
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const sides = ['top', 'bottom', 'left', 'right'];
        const side = sides[Math.floor(Math.random() * 4)];
        let x, y, angle;
        if (side === 'top') { x = Math.random() * 100; y = 0; angle = (135 - (x / 100) * 90) * Math.PI / 180; }
        else if (side === 'bottom') { x = Math.random() * 100; y = 100; angle = (225 + (x / 100) * 90) * Math.PI / 180; }
        else if (side === 'left') { x = 0; y = Math.random() * 100; angle = (315 + (y / 100) * 90) * Math.PI / 180; }
        else { x = 100; y = Math.random() * 100; angle = (135 + (y / 100) * 90) * Math.PI / 180; }
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        const distance = Math.random() * 200 + 50;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        btn.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }
    });
  }

  const btn9 = document.querySelector('.btn-9');
  if (btn9) btn9.addEventListener('click', (e) => { const btn = e.target; btn.classList.toggle('loading'); });

  // per-button hover loops
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
    el.addEventListener('mouseenter', () => {
      if (cfg.selector === '.btn-6' || cfg.selector === '.btn-11') { el.classList.add('shimmer-go'); return; }
      const animToggle = document.getElementById('animations-toggle');
      if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) {
        if (animToggle && !animToggle.checked) { el.classList.remove('pulse-in'); el.classList.add('pulse-out'); }
        return;
      }
      el.classList.add('auto');
    });
    el.addEventListener('mouseleave', () => {
      if (cfg.selector === '.btn-6' || cfg.selector === '.btn-11') { el.classList.remove('shimmer-go'); return; }
      const animToggle = document.getElementById('animations-toggle');
      if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) {
        if (animToggle && !animToggle.checked) { el.classList.remove('pulse-out'); el.classList.add('pulse-in'); }
        return;
      }
      el.classList.remove('auto');
    });
  });

}

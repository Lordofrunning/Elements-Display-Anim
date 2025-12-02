import { normalizeHex, hexToRgb, getContrastColor } from './mod_helpers.js';

export function setupButtons() {
  // btn-12: disintegrate strips (lightweight implementation)
  const btn12 = document.querySelector('.btn-12');
  if (btn12) {
    // ensure strips exist
    for (let i = 0; i < 10; i++) {
      if (!btn12.querySelectorAll('.strip')[i]) {
        const strip = document.createElement('div');
        strip.classList.add('strip');
        strip.style.left = (i * 10) + '%';
        strip.style.width = '10%';
        btn12.appendChild(strip);
      }
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

    // click: disintegrate
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

  // particle explosion (btn-8)
  const btn8 = document.querySelector('.btn-8');
  if (btn8) {
    btn8.addEventListener('click', (e) => {
      const btn = e.currentTarget || e.target;
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

  // loading morph (btn-9)
  const btn9 = document.querySelector('.btn-9');
  if (btn9) {
    btn9.addEventListener('click', (e) => {
      const btn = e.currentTarget || e.target;
      btn.classList.toggle('loading');
    });
  }

  // btn-11: glass crack / spider-web punch effect
  const btn11 = document.querySelector('.btn-11');
  if (btn11) {
    btn11.addEventListener('click', (e) => {
      try {
        const rect = btn11.getBoundingClientRect();
        const w = Math.max(4, Math.floor(rect.width));
        const h = Math.max(4, Math.floor(rect.height));
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.classList.add('btn-11-cracks');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.pointerEvents = 'none';
        svg.style.overflow = 'visible';

        // click position relative to button
        const clickX = Math.max(0, Math.min(w, e.clientX - rect.left));
        const clickY = Math.max(0, Math.min(h, e.clientY - rect.top));
        const centerX = clickX;
        const centerY = clickY;

        // determine stroke color by button variable contrast
        let strokeColor = 'rgba(255,255,255,0.95)';
        try {
          const raw = getComputedStyle(document.documentElement).getPropertyValue('--btn-11').trim();
          const hex = normalizeHex(raw || '');
          const rgb = hexToRgb(hex);
          const contrast = getContrastColor(rgb.r, rgb.g, rgb.b);
          if (contrast && contrast.toLowerCase() === '#000000') strokeColor = 'rgba(0,0,0,0.95)';
        } catch (err) {
          // fallback already set
        }

        // spokes configuration
        const spokes = 9 + Math.floor(Math.random() * 6); // 9-14

        // angles: spread with slight jitter
        const angles = [];
        for (let i = 0; i < spokes; i++) {
          angles.push((i / spokes) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / spokes) * 0.6);
        }

        const paths = [];

        // main jagged spokes
        angles.forEach((angle) => {
          const segCount = 3 + Math.floor(Math.random() * 3);
          const maxRadius = Math.max(w, h) * (0.9 + Math.random() * 0.05);
          let d = `M ${centerX} ${centerY}`;
          for (let s = 1; s <= segCount; s++) {
            const t = s / segCount;
            const r = maxRadius * t * (0.9 + Math.random() * 0.18);
            const jitter = (1 - t) * (6 + Math.random() * 8);
            const perp = (Math.random() > 0.5 ? 1 : -1) * jitter;
            const px = centerX + Math.cos(angle) * r + (-Math.sin(angle) * perp);
            const py = centerY + Math.sin(angle) * r + (Math.cos(angle) * perp);
            d += ` L ${px} ${py}`;
          }
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('d', d);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('stroke-width', Math.max(1.2, Math.round(Math.min(w, h) * 0.028)));
          path.setAttribute('stroke', strokeColor);
          path.setAttribute('opacity', '0');
          paths.push(path);

          // branches near center
          const branches = 1 + Math.floor(Math.random() * 3);
          for (let b = 0; b < branches; b++) {
            const onSeg = 0.18 + Math.random() * 0.36;
            const branchLen = Math.max(w, h) * (0.06 + Math.random() * 0.08);
            const bx = centerX + Math.cos(angle) * (maxRadius * onSeg);
            const by = centerY + Math.sin(angle) * (maxRadius * onSeg);
            const branchAngle = angle + (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.85);
            const bex = bx + Math.cos(branchAngle) * branchLen;
            const bey = by + Math.sin(branchAngle) * branchLen;
            const bd = `M ${bx} ${by} L ${bex} ${bey}`;
            const bpath = document.createElementNS(svgNS, 'path');
            bpath.setAttribute('d', bd);
            bpath.setAttribute('fill', 'none');
            bpath.setAttribute('stroke-linecap', 'round');
            bpath.setAttribute('stroke-width', Math.max(0.8, Math.round(Math.min(w, h) * 0.012)));
            bpath.setAttribute('stroke', strokeColor);
            bpath.setAttribute('opacity', '0');
            paths.push(bpath);
          }
        });

        // append and animate
        paths.forEach(p => svg.appendChild(p));
        btn11.appendChild(svg);

        const svgPaths = Array.from(svg.querySelectorAll('path'));
        // Start all paths at the same time (no stagger). Duration scales with path length so
        // longer lines take slightly longer to draw while all begin simultaneously.
        svgPaths.forEach((ln) => {
          const length = ln.getTotalLength();
          ln.style.strokeDasharray = length;
          ln.style.strokeDashoffset = length;
          const delay = 0; // same start for all
          // duration scales with length (clamped)
          const duration = Math.round(Math.max(220, Math.min(900, 240 + length * 0.6)));
          const opacityDur = Math.max(180, duration - 40);
          ln.style.transition = `stroke-dashoffset ${duration}ms ${delay}ms cubic-bezier(0.2,1,0.2,1), opacity ${opacityDur}ms ${delay}ms ease-out`;
          // force reflow
          ln.getBoundingClientRect();
          ln.style.opacity = '1';
          ln.style.strokeDashoffset = '0';
        });

        // Fade and remove after the longest possible draw completes
        const maxDuration = svgPaths.reduce((m, p) => {
          try { return Math.max(m, Math.round(Math.max(220, Math.min(900, 240 + p.getTotalLength() * 0.6)))); } catch (e) { return m; }
        }, 0);
        setTimeout(() => { svg.style.transition = 'opacity 700ms ease'; svg.style.opacity = '0'; }, 200 + maxDuration);
        setTimeout(() => { svg.remove(); }, 900 + maxDuration);

        // subtle press visual
        btn11.classList.add('clicked-glass');
        setTimeout(() => btn11.classList.remove('clicked-glass'), 220);
      } catch (err) {
        // avoid breaking UI on unexpected errors
        console.error('btn-11 crack error', err);
      }
    });
  }

  // per-button hover loops (keep lightweight)
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

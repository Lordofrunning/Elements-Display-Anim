document.addEventListener('DOMContentLoaded', () => {
	const root = document.documentElement;

	// Set default view
	document.body.classList.add('view-plain');

	const targets = {
		all: ['--btn-1','--btn-3','--btn-4','--btn-5','--btn-6','--btn-7','--btn-base','--btn-8','--btn-9','--btn-10','--btn-11','--btn-12','--btn-13'],
		btn1: ['--btn-1'],
		btn3: ['--btn-3'],
		btn4: ['--btn-4'],
		btn5: ['--btn-5'],
		btn6: ['--btn-6'],
		btn7: ['--btn-7'],
		btn8: ['--btn-8'],
		btn9: ['--btn-9'],
		btn10: ['--btn-10'],
		btn11: ['--btn-11'],
		btn12: ['--btn-12'],
		btn13: ['--btn-13'],
		'left-panel': ['--panel-left-bg','--panel-divider'],
		'right-panel': ['--panel-right-bg'],
		text: ['--text'],
		accent: ['--accent']
	};

	// Create strips for btn-12
	const btn12 = document.querySelector('.btn-12');
	for(let i = 0; i < 10; i++) {
		const strip = document.createElement('div');
		strip.classList.add('strip');
		strip.style.left = (i * 10) + '%';
		strip.style.width = '10%';
		btn12.appendChild(strip);
	}

	// Disintegrate effect for btn-12
	btn12.addEventListener('mouseenter', () => {
		const strips = btn12.querySelectorAll('.strip');
		btn12.addEventListener('mousemove', (e) => {
			const rect = btn12.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const index = Math.floor(x / (rect.width / 10));
			strips.forEach((strip, i) => {
				if (Math.abs(i - index) <= 1) {
					if (i % 2 === 0) {
						strip.classList.add('slide-up');
					} else {
						strip.classList.add('slide-down');
					}
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

	// collect unique variable names and store defaults
	const uniqueVars = [...new Set(Object.values(targets).flat())];
	// also include per-button text vars (e.g. --btn-1-text) so Reset restores them
	const textVars = uniqueVars.map(v => v + '-text');
	const allVars = [...new Set([...uniqueVars, ...textVars])];
	const defaults = {};
	allVars.forEach(v => {
		defaults[v] = getComputedStyle(root).getPropertyValue(v).trim() || '';
	});

	/* bob shadow handled in CSS (fixed white/grey), JS detector removed */

	const targetSelect = document.getElementById('target-select');
	const colorPicker = document.getElementById('color-picker');
	const applyBtn = document.getElementById('apply-color');
	const resetBtn = document.getElementById('reset-colors');

	function normalizeHex(val) {
		if (!val) return '#000000';
		val = val.trim();
		if (val.startsWith('#')) return val;
		if (val.startsWith('rgb')) return rgbToHex(val);
		return val;
	}

	function updatePicker() {
		const target = targetSelect.value;
		const vars = targets[target];
		if (!vars || vars.length === 0) return;
		const v = getComputedStyle(root).getPropertyValue(vars[0]).trim();
		colorPicker.value = normalizeHex(v);
	}

	// apply selected color to chosen target(s)
	applyBtn.addEventListener('click', () => {
		const color = colorPicker.value;
		const target = targetSelect.value;
		const vars = targets[target] || [];
		vars.forEach(variable => {
			root.style.setProperty(variable, color);
			// if this is a button color var (e.g. --btn-1), compute contrast and set a text color var
			if (variable.startsWith('--btn-')) {
				const rgb = hexToRgb(normalizeHex(color));
				const contrast = getContrastColor(rgb.r, rgb.g, rgb.b);
				root.style.setProperty(variable + '-text', contrast);
			}
		});
	});

	resetBtn.addEventListener('click', () => {
		Object.entries(defaults).forEach(([k,v]) => {
			root.style.setProperty(k, v);
		});
		updatePicker();
	});

	targetSelect.addEventListener('change', updatePicker);

	// init picker with current value
	updatePicker();

	// helper: convert rgb(...) to hex
	function rgbToHex(rgb) {
		const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
		if (!m) return '#000000';
		return '#'+[1,2,3].map(i => {
			const n = parseInt(m[i], 10);
			return n.toString(16).padStart(2, '0');
		}).join('');
	}

	// helper: convert hex to rgb object {r,g,b}
	function hexToRgb(hex) {
		hex = hex.replace('#','');
		if (hex.length === 3) {
			hex = hex.split('').map(c => c + c).join('');
		}
		const num = parseInt(hex, 16);
		return {
			r: (num >> 16) & 255,
			g: (num >> 8) & 255,
			b: num & 255
		};
	}

	// helper: determine readable contrast color (returns '#000000' or '#ffffff')
	function getContrastColor(r, g, b) {
		// Perceived brightness algorithm
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 186 ? '#000000' : '#ffffff';
	}


	/* previous global auto-rotation removed; each button module manages itself below */
    /* Automatic effects — per-button modules
       Each button owns its own trigger function, duration and interval. This removes the
       previous shared loop and makes each button a compact module-like unit.
    */

    const perButtonConfigs = {
        'btn-1': { selector: '.btn-1', duration: 400, interval: 3000, initialDelay: 120 },
        'btn-3': { selector: '.btn-3', duration: 500, interval: 3000, initialDelay: 240 },
        'btn-4': { selector: '.btn-4', duration: 600, interval: 3000, initialDelay: 360 },
        // Bob has its own slower loop and longer duration
        'btn-5': { selector: '.btn-5', duration: 2800, interval: 4200, initialDelay: 600 },
        'btn-6': { selector: '.btn-6', duration: 700, interval: 3000, initialDelay: 480 },
        'btn-7': { selector: '.btn-7', duration: 0, interval: 3000, initialDelay: 720 },
        'btn-11': { selector: '.btn-11', duration: 500, interval: 3000, initialDelay: 0 }
    };

	// Create hover-based handlers for each button so effects only run on mouse interaction
	Object.values(perButtonConfigs).forEach(cfg => {
		const el = document.querySelector(cfg.selector);
		if (!el) return;

		// mouseenter: start effect
		el.addEventListener('mouseenter', () => {
			// Shimmer (btn-6) uses transition to go to 150%
			if (cfg.selector === '.btn-6') {
				el.classList.add('shimmer-go');
				return;
			}

			if (cfg.selector === '.btn-11') {
				el.classList.add('shimmer-go');
				return;
			}

			// For glow buttons (btn-7,8,9), if toggle off, pulse out on hover
			if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) {
				if (!animToggle.checked) {
					el.classList.remove('pulse-in');
					el.classList.add('pulse-out');
				}
				return;
			}

			// For other buttons, toggle the .auto class while hovered so CSS animations fire
			el.classList.add('auto');
		});

		// mouseleave: stop or reverse effect
		el.addEventListener('mouseleave', () => {
			if (cfg.selector === '.btn-6') {
				el.classList.remove('shimmer-go');
				return;
			}

			if (cfg.selector === '.btn-11') {
				el.classList.remove('shimmer-go');
				return;
			}

			// For glow buttons, if toggle off, pulse in on leave
			if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) {
				if (!animToggle.checked) {
					el.classList.remove('pulse-out');
					el.classList.add('pulse-in');
				}
				return;
			}

			el.classList.remove('auto');
		});
	});

	// (Shimmer handlers moved into per-button setup above.)

	// --- Global animation toggle (looped animations vs hover-only) ---
	const animToggle = document.getElementById('animations-toggle');
	// store interval IDs so they can be cleared
	const _loops = {};

	function startAutoLoops() {
		Object.values(perButtonConfigs).forEach(cfg => {
			const el = document.querySelector(cfg.selector);
			if (!el) return;

			const trigger = () => {
				// Shimmer (btn-6) plays forward then reverse
				if (cfg.selector === '.btn-6') {
					el.classList.add('shimmer-go');
					setTimeout(() => el.classList.remove('shimmer-go'), 600);
					return;
				}

				if (cfg.selector === '.btn-11') {
					el.classList.add('shimmer-go');
					setTimeout(() => el.classList.remove('shimmer-go'), 500);
					return;
				}

				// For glow buttons (btn-7,8,9), add .auto for infinite pulse
				if (['.btn-7', '.btn-8', '.btn-9'].includes(cfg.selector)) {
					el.classList.add('auto');
					return; // don't remove, infinite
				}

				// other buttons: add .auto briefly
				el.classList.add('auto');
				setTimeout(() => el.classList.remove('auto'), cfg.duration);
			};

			// run once after initialDelay (if provided) then on interval
			const delay = cfg.initialDelay || 0;
			const tid = setTimeout(() => {
				trigger();
				// store interval for repeated triggers
				_loops[cfg.selector] = setInterval(trigger, cfg.interval);
			}, delay);
			// keep the initial timeout id as well so we can clear if toggled off early
			_loops[cfg.selector + '::init'] = tid;
		});
	}

	function stopAutoLoops() {
		// clear all timers
		Object.values(_loops).forEach(id => clearInterval(id) || clearTimeout(id));
		Object.keys(_loops).forEach(k => delete _loops[k]);
		// remove any effect classes left behind
		Object.values(perButtonConfigs).forEach(cfg => {
			const el = document.querySelector(cfg.selector);
			if (!el) return;
			el.classList.remove('auto');
			el.classList.remove('shimmer-forward');
			el.classList.remove('shimmer-reverse');
			el.classList.remove('pulse-out');
			el.classList.remove('pulse-in');
			el.classList.remove('shimmer-go');
		});
	}

	// wire the checkbox: checked = ON (looping), unchecked = OFF (hover-only)
	if (animToggle) {
		// ensure default is OFF (hover-only)
		animToggle.checked = false;
		animToggle.addEventListener('change', () => {
			if (animToggle.checked) {
				startAutoLoops();
			} else {
				stopAutoLoops();
			}
		});
	}

	// --- Background menu options ---
	document.querySelectorAll('.menu-option[data-bg]').forEach(btn => {
		btn.addEventListener('click', () => {
			const type = btn.dataset.bg;
			// Remove previous view classes
			document.body.classList.remove('view-gradient', 'view-animated', 'view-plain');
			// Add new view class for dynamic content switching
			document.body.classList.add('view-' + type);
			// TODO: Switch center and right panel content based on view
		});
	});

	// --- Foreground menu options ---
	document.querySelectorAll('.menu-option[data-fg]').forEach(btn => {
		btn.addEventListener('click', () => {
			const type = btn.dataset.fg;
			if (type === 'buttons') {
				document.body.classList.remove('view-gradient', 'view-animated', 'view-plain');
				document.body.classList.add('view-plain');
			}
			// TODO: Handle other foreground options
		});
	});

	// Make the whole color picker button clickable
	document.querySelector('.color-picker-row').addEventListener('click', () => {
		document.getElementById('color-picker').click();
	});

	// Particle explosion on click
	document.querySelector('.btn-8').addEventListener('click', (e) => {
		const btn = e.target;
		for (let i = 0; i < 40; i++) {
			const particle = document.createElement('div');
			particle.classList.add('particle');
			// Random side: top, bottom, left, right
			const sides = ['top', 'bottom', 'left', 'right'];
			const side = sides[Math.floor(Math.random() * 4)];
			let x, y, angle;
			if (side === 'top') {
				x = Math.random() * 100;
				y = 0;
				angle = (135 - (x / 100) * 90) * Math.PI / 180; // degrees to radians
			} else if (side === 'bottom') {
				x = Math.random() * 100;
				y = 100;
				angle = (225 + (x / 100) * 90) * Math.PI / 180;
			} else if (side === 'left') {
				x = 0;
				y = Math.random() * 100;
				angle = (315 + (y / 100) * 90) * Math.PI / 180;
			} else {
				x = 100;
				y = Math.random() * 100;
				angle = (135 + (y / 100) * 90) * Math.PI / 180;
			}
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

	// Loading morph on click
	document.querySelector('.btn-9').addEventListener('click', (e) => {
		const btn = e.target;
		btn.classList.toggle('loading');
	});

});

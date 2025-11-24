document.addEventListener('DOMContentLoaded', () => {
	const root = document.documentElement;

	// Set default background
	document.body.classList.add('bg-plain');

	const targets = {
		all: ['--btn-1','--btn-3','--btn-4','--btn-5','--btn-6','--btn-7','--btn-8','--btn-9','--btn-base','--panel-divider'],
		btn1: ['--btn-1'],
		btn3: ['--btn-3'],
		btn4: ['--btn-4'],
		btn5: ['--btn-5'],
		btn6: ['--btn-6'],
		btn7: ['--btn-7'],
		btn8: ['--btn-8'],
		btn9: ['--btn-9'],
		'left-panel': ['--panel-left-bg','--panel-divider'],
		'right-panel': ['--panel-right-bg'],
		text: ['--text'],
		accent: ['--accent']
	};

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
        'btn-8': { selector: '.btn-8', duration: 0, interval: 3000, initialDelay: 840 },
        'btn-9': { selector: '.btn-9', duration: 0, interval: 3000, initialDelay: 960 }
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
			document.body.classList.remove('bg-gradient', 'bg-animated', 'bg-plain');
			document.body.classList.add('bg-' + type);
		});
	});

});

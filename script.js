document.addEventListener('DOMContentLoaded', () => {
	const root = document.documentElement;

	const targets = {
		all: ['--btn-1','--btn-3','--btn-4','--btn-5','--btn-6'],
		btn1: ['--btn-1'],
		btn3: ['--btn-3'],
		btn4: ['--btn-4'],
		btn5: ['--btn-5'],
		btn6: ['--btn-6'],
		'left-panel': ['--panel-left-bg'],
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

	// Determine an appropriate bob shadow color based on the page background brightness
	function colorStringToRgb(str) {
		if (!str) return { r: 0, g: 0, b: 0 };
		str = str.trim();
		if (str.startsWith('#')) {
			let hex = str.replace('#','');
			if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
			const num = parseInt(hex, 16);
			return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
		}
		const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
		if (m) return { r: parseInt(m[1],10), g: parseInt(m[2],10), b: parseInt(m[3],10) };
		return { r: 0, g: 0, b: 0 };
	}

	const bgRaw = getComputedStyle(root).getPropertyValue('--bg').trim();
	const bgRgb = colorStringToRgb(bgRaw);
	const bgBrightness = (bgRgb.r * 299 + bgRgb.g * 587 + bgRgb.b * 114) / 1000;
	let bobShadowColor = 'rgba(0,0,0,0.45)';
	// if very dark background, use a light subtle shadow instead
	if (bgBrightness < 40) {
		bobShadowColor = 'rgba(255,255,255,0.12)';
	}
	root.style.setProperty('--btn-5-shadow', bobShadowColor);

	// include the computed shadow color in defaults so Reset restores it
	defaults['--btn-5-shadow'] = bobShadowColor;

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


	/* Automatic effects: trigger each button's effect every ~3s (staggered) by toggling .auto */

	const buttons = Array.from(document.querySelectorAll('.btn'));
	// exclude the Bob button (btn-5) from the global rotation so it can have its own loop
	const globalAutoButtons = buttons.filter(b => !b.classList.contains('btn-5'));
	const bobButton = document.querySelector('.btn-5');

	// duration map in ms for how long the effect should remain before removing the .auto class
	const durationMap = {
		'btn-1': 400,
		'btn-3': 500,
		'btn-4': 600,
		'btn-5': 3000, // slow bob duration
		'btn-6': 700
	};

	function getButtonDuration(btn) {
		for (const cls of btn.classList) {
			if (durationMap[cls]) return durationMap[cls];
		}
		return 500;
	}

	function triggerAutoEffects() {
		globalAutoButtons.forEach((btn, i) => {
			const delay = i * 150; // stagger slightly so effects cascade
			setTimeout(() => {
				btn.classList.add('auto');
				// Force reflow for animations that rely on re-adding (helps with some browsers)
				// eslint-disable-next-line no-unused-expressions
				btn.offsetWidth;
				const d = getButtonDuration(btn);
				setTimeout(() => btn.classList.remove('auto'), d);
			}, delay);
		});
	}

	// kick off every ~3 seconds
	const intervalMs = 3000;
	// start immediate global rotation
	triggerAutoEffects();
	setInterval(triggerAutoEffects, intervalMs);

	// Bob button: independent loop so it bobs up/down on its own schedule
	if (bobButton) {
		const bobDuration = durationMap['btn-5'] || 2800;
		const bobInterval = 4200; // time between bobs (ms) — different from global interval

		function triggerBob() {
			// add .auto, remove after bobDuration
			bobButton.classList.add('auto');
			// reflow
			// eslint-disable-next-line no-unused-expressions
			bobButton.offsetWidth;
			setTimeout(() => bobButton.classList.remove('auto'), bobDuration);
		}

		// start with a small random offset so it doesn't always align exactly
		setTimeout(() => {
			triggerBob();
			setInterval(triggerBob, bobInterval);
		}, 600);
	}
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
        'btn-6': { selector: '.btn-6', duration: 700, interval: 3000, initialDelay: 480 }
    };

    // Create a per-button controller for each config
    Object.values(perButtonConfigs).forEach(cfg => {
        const el = document.querySelector(cfg.selector);
        if (!el) return;

        const trigger = () => {
            el.classList.add('auto');
            // force reflow for consistent animation restart
            // eslint-disable-next-line no-unused-expressions
            el.offsetWidth;
            setTimeout(() => el.classList.remove('auto'), cfg.duration);
        };

        // Start a loop for this button. Use a tiny random jitter so they don't stay perfectly synced.
        const jitter = Math.floor(Math.random() * 300);
        setTimeout(() => {
            trigger();
            setInterval(trigger, cfg.interval + jitter);
        }, cfg.initialDelay + jitter);
    });
});

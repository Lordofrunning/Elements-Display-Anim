document.addEventListener('DOMContentLoaded', () => {
	const root = document.documentElement;

	// Set default view
	document.body.classList.add('view-plain');

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

	// Set default view
	document.body.classList.add('view-plain');
	h1.textContent = 'Button Showcase';
	mainPanel.innerHTML = buttonGridHTML;
	setupButtons();

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



	function setupButtons() {
	// Create strips for btn-12
	const btn12 = document.querySelector('.btn-12');
	if (btn12) {
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
	}

	// Particle explosion on click
	const btn8 = document.querySelector('.btn-8');
	if (btn8) {
		btn8.addEventListener('click', (e) => {
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
	}

	// Loading morph on click
	const btn9 = document.querySelector('.btn-9');
	if (btn9) {
		btn9.addEventListener('click', (e) => {
			const btn = e.target;
			btn.classList.toggle('loading');
		});
	}

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
}

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

			// Reset center content
			h1.textContent = '';
			mainPanel.innerHTML = '';

			// Reset right panel content
			const rightTop = document.querySelector('.right-top');
			const rightViewTitle = document.querySelector('.right-view-title');
			rightViewTitle.textContent = '';
			rightTop.innerHTML = '';

			// Dynamically update center content
			if (type === 'animated') {
				h1.textContent = 'Animated';
				// mainPanel should not contain static .animated-line elements — lines are created dynamically
				mainPanel.innerHTML = '';
			} else if (type === 'gradient') {
				h1.textContent = 'Gradient';
				mainPanel.innerHTML = '';
			}

			// Dynamically update right panel content
			if (type === 'animated') {
				rightViewTitle.textContent = 'Animated';
				rightTop.innerHTML = `
					<div class="color-picker-row">
						<label>Color
							<input id="color-picker" type="color" value="#ffffff" />
						</label>
					</div>
					<div class="direction-picker-row">
						<label>Direction
							<select id="direction-select">
								<option value="horizontal" selected>Horizontal</option>
								<option value="vertical">Vertical</option>
							</select>
						</label>
					</div>
					<div class="pattern-picker-row">
						<label>Pattern
							<select id="pattern-select">
								<option value="straight" selected>Straight</option>
								<option value="curve">Curve</option>
								<option value="hexish">Hexish</option>
								<option value="zigzag">Zigzag</option>
							</select>
						</label>
					</div>
					<div class="panel-buttons">
						<button id="apply-color" class="btn">Apply</button>
						<button id="reset-colors" class="btn">Reset</button>
					</div>
				`;
				// Re-setup listeners after DOM change
				setTimeout(() => {
					const targetSelect = document.getElementById('target-select');
					const colorPicker = document.getElementById('color-picker');
					const applyBtn = document.getElementById('apply-color');
					const resetBtn = document.getElementById('reset-colors');

					if (targetSelect && colorPicker && applyBtn && resetBtn) {
						function normalizeHex(val) {
							if (!val) return '#000000';
							val = val.trim();
							if (val.startsWith('#')) return val;
							if (val.startsWith('rgb')) return rgbToHex(val);
							return val;
						}

						function updatePicker() {
							if (!targetSelect) {
								// For animated, update from --animated-bg
								const v = getComputedStyle(root).getPropertyValue('--animated-bg').trim();
								colorPicker.value = normalizeHex(v);
							} else {
								const target = targetSelect.value;
								const vars = targets[target];
								if (!vars || vars.length === 0) return;
								const v = getComputedStyle(root).getPropertyValue(vars[0]).trim();
								colorPicker.value = normalizeHex(v);
							}
						}

						applyBtn.addEventListener('click', () => {
							const color = colorPicker.value;
							if (!targetSelect) {
								// For animated, apply to --animated-bg
								root.style.setProperty('--animated-bg', color);
							} else {
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
							}
						});

						resetBtn.addEventListener('click', () => {
							if (!targetSelect) {
								// For animated, reset --animated-bg
								root.style.setProperty('--animated-bg', '#ffffff'); // default
							} else {
								Object.entries(defaults).forEach(([k,v]) => {
									root.style.setProperty(k, v);
								});
							}
							updatePicker();
						});

						if (targetSelect) {
							targetSelect.addEventListener('change', updatePicker);
						}
						updatePicker();

						document.querySelector('.color-picker-row').addEventListener('click', () => {
							document.getElementById('color-picker').click();
						});

					}
				}, 0);
			} else if (type === 'gradient') {
				rightViewTitle.textContent = 'Gradient';
				rightTop.innerHTML = '';
			} else {
				rightViewTitle.textContent = '';
				rightTop.innerHTML = ''; // for plain, but plain not here
			}
		});
	});	// --- Foreground menu options ---
	document.querySelectorAll('.menu-option[data-fg]').forEach(btn => {
		btn.addEventListener('click', () => {
			const type = btn.dataset.fg;
			if (type === 'buttons') {
				document.body.classList.remove('view-gradient', 'view-animated', 'view-plain');
				document.body.classList.add('view-plain');

				// Set background color back to dark
				document.body.style.backgroundColor = getComputedStyle(root).getPropertyValue('--bg').trim();

				const rightTop = document.querySelector('.right-top');
				const rightViewTitle = document.querySelector('.right-view-title');

			// Reset center content
			h1.textContent = '';
			mainPanel.innerHTML = '';

			// Reset right panel content
			rightViewTitle.textContent = '';
			rightTop.innerHTML = '';

			// Dynamically update center content
			mainPanel.innerHTML = buttonGridHTML;
			setupButtons();
			h1.textContent = 'Button Showcase';				// Dynamically update right panel content
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
				// Re-setup listeners after DOM change
				setTimeout(() => {
					const targetSelect = document.getElementById('target-select');
					const colorPicker = document.getElementById('color-picker');
					const applyBtn = document.getElementById('apply-color');
					const resetBtn = document.getElementById('reset-colors');

					if (targetSelect && colorPicker && applyBtn && resetBtn) {
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

						resetBtn.addEventListener('click', () => {
							Object.entries(defaults).forEach(([k,v]) => {
								root.style.setProperty(k, v);
							});
							updatePicker();
						});

						targetSelect.addEventListener('change', updatePicker);
						updatePicker();

						document.querySelector('.color-picker-row').addEventListener('click', () => {
							document.getElementById('color-picker').click();
						});
					} else {
						// Animated view setup
						let currentDirection = 'horizontal';
						let currentPattern = 'straight';
						let currentPosition = 'top'; // 'top' or 'bottom'
						let animatedLines = [];

						function normalizeHex(val) {
							if (!val) return '#000000';
							val = val.trim();
							if (val.startsWith('#')) return val;
							if (val.startsWith('rgb')) return rgbToHex(val);
							return val;
						}

						// create N lines and append to mainPanel so they sit inside the center area
						function createLines(n = 3) {
							removeLines();
							console.log('[animated] createLines -> creating', n, 'lines');
							for (let i = 0; i < n; i++) {
								const el = document.createElement('div');
								el.className = 'animated-line debug'; // mark debug so it's visible
								el.dataset.index = i;
								// pointer events none so they don't block UI
								el.style.pointerEvents = 'none';
								// ensure below header (header has z-index:2)
								el.style.zIndex = '1';
								// append into mainPanel (so they don't overlap side panels)
								if (mainPanel) {
									// make sure mainPanel is positioned to contain absolute children
									const mpStyle = getComputedStyle(mainPanel).position;
									if (mpStyle === 'static') mainPanel.style.position = 'relative';
									mainPanel.appendChild(el);
								} else {
									document.body.appendChild(el);
								}
								animatedLines.push(el);
							}
							// add debug overlay and border on mainPanel
							attachDebugOverlay();
							updateLinePositions();
						}

						function removeLines() {
							animatedLines.forEach(el => el.remove());
							animatedLines = [];
						}

						// compute left edge (right edge of left-panel) and right edge (left edge of right-panel)
						function getCenterBounds() {
							const leftPanel = document.querySelector('.left-panel');
							const rightPanel = document.querySelector('.right-panel');
							const lp = leftPanel.getBoundingClientRect();
							const rp = rightPanel.getBoundingClientRect();
							return { left: Math.max(0, Math.round(lp.right)), right: Math.max(0, Math.round(rp.left)) };
						}

						function updateLinePositions() {
							// compute center area from panels but place lines relative to mainPanel
							const bounds = getCenterBounds();
							const availableWidth = Math.max(0, bounds.right - bounds.left);
							const color = (colorPicker && colorPicker.value) ? colorPicker.value : getComputedStyle(root).getPropertyValue('--animated-bg').trim() || '#ffffff';
							const mpRect = mainPanel.getBoundingClientRect();
							console.log('[animated] updateLinePositions -> mainPanel rect', mpRect, 'bounds', bounds, 'availableWidth', availableWidth);
							animatedLines.forEach((line, i) => {
								// place at top or bottom inside mainPanel
								const lineHeight = 3; // px
								if (currentPosition === 'top') {
									line.style.top = '0px';
								} else {
									line.style.top = (mainPanel.clientHeight - lineHeight) + 'px';
								}
								// left relative to mainPanel (0) and width match mainPanel inner width
								line.style.left = '0px';
								line.style.width = Math.max(0, mainPanel.clientWidth) + 'px';
								line.style.height = lineHeight + 'px';
								// gradient sweep across the width
								line.style.background = `linear-gradient(90deg, transparent 0%, ${color} 10%, rgba(255,255,255,0.95) 50%, ${color} 90%, transparent 100%)`;
								line.style.backgroundSize = '200% 100%';
								line.style.animation = `sweep 2.2s linear ${i * 0.15}s infinite`;
							});
							updateDebugOverlay(bounds, mpRect, animatedLines.length);
						}

						// Debug overlay helpers
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

						// wire controls
						const directionSelect = document.getElementById('direction-select');
						const patternSelect = document.getElementById('pattern-select');

						// add a position control to the right-top (Top / Bottom)
						const posRow = document.createElement('div');
						posRow.className = 'direction-picker-row';
						posRow.innerHTML = `<label>Position <select id="position-select"><option value="top">Top</option><option value="bottom">Bottom</option></select></label>`;
						const rightTopEl = document.querySelector('.right-top');
						if (rightTopEl) rightTopEl.insertBefore(posRow, rightTopEl.querySelector('.panel-buttons'));

						const positionSelect = document.getElementById('position-select');
						if (positionSelect) {
							positionSelect.addEventListener('change', (e) => {
								currentPosition = e.target.value;
								updateLinePositions();
							});
						}

						if (directionSelect) {
							directionSelect.addEventListener('change', (e) => {
								currentDirection = e.target.value;
								// vertical not implemented for full-screen sweep currently, keep horizontal behavior
								updateLinePositions();
							});
						}

						if (patternSelect) {
							patternSelect.addEventListener('change', (e) => {
								currentPattern = e.target.value;
								// pattern clip-path could be applied per-line in future; for now keep full-width lines
								updateLinePositions();
							});
						}

						// color picker apply/reset
						if (applyBtn) {
							applyBtn.addEventListener('click', () => {
								const color = colorPicker.value;
								root.style.setProperty('--animated-bg', color);
								updateLinePositions();
							});
						}
						if (resetBtn) {
							resetBtn.addEventListener('click', () => {
								root.style.setProperty('--animated-bg', '#ffffff');
								if (colorPicker) colorPicker.value = '#ffffff';
								updateLinePositions();
							});
						}

						// create lines now and wire resize to update
						createLines(3);
						window.addEventListener('resize', updateLinePositions);

						// remove lines when navigating away: listen for view class changes by using a MutationObserver
						const observer = new MutationObserver(() => {
							if (!document.body.classList.contains('view-animated')) {
								removeLines();
								window.removeEventListener('resize', updateLinePositions);
								observer.disconnect();
							}
						});
						observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
					}
				}, 0);
			}
			// TODO: Handle other foreground options
		});
	});





});

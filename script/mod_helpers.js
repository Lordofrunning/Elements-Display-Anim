// helpers as ES module
export function normalizeHex(val) {
  if (!val) return '#000000';
  val = val.trim();
  if (val.startsWith('#')) return val;
  if (val.startsWith('rgb')) return rgbToHex(val);
  return val;
}

export function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return '#000000';
  return '#'+[1,2,3].map(i => {
    const n = parseInt(m[i], 10);
    return n.toString(16).padStart(2, '0');
  }).join('');
}

export function hexToRgb(hex) {
  hex = (hex || '').replace('#','');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function getContrastColor(r, g, b) {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 186 ? '#000000' : '#ffffff';
}

export function applyMainPanelBounds(mainPanel) {
  const leftPanel = document.querySelector('.left-panel');
  const rightPanel = document.querySelector('.right-panel');
  if (leftPanel && rightPanel && mainPanel) {
    const lpRect = leftPanel.getBoundingClientRect();
    const rpRect = rightPanel.getBoundingClientRect();
    const leftPx = Math.max(0, Math.round(lpRect.right));
    const rightPx = Math.max(0, Math.round(rpRect.left));
    const widthPx = Math.max(0, rightPx - leftPx);
    mainPanel.style.position = 'absolute';
    const layout = document.querySelector('.layout');
    const layoutRect = layout ? layout.getBoundingClientRect() : { left: 0, top: 0 };
    const relLeft = Math.max(0, leftPx - Math.round(layoutRect.left));
    mainPanel.style.left = relLeft + 'px';
    mainPanel.style.top = '0px';
    mainPanel.style.width = widthPx + 'px';
    mainPanel.style.height = window.innerHeight + 'px';
    mainPanel.style.margin = '0';
    mainPanel.style.padding = '0';
  }
}

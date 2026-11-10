/**
 * PopCraft Virtual Bubble Wrap Controller
 * Manages grid generation, physical deflation animations, drag interactions,
 * multi-color palettes, flying butterflies, attractive geometric patterns,
 * haptics, cascade waves, metrics, and celebrations.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    totalBubbles: 0,
    poppedCount: 0,
    sizeMode: 'standard', // 'jumbo', 'standard', 'micro'
    patternMode: 'honeycomb', // 'honeycomb', 'diamond', 'waves'
    isDragging: false,
    glideMode: true,
    hapticEnabled: true,
    startTime: null,
    endTime: null,
    popTimestamps: [],
    cascading: false,
    bubbles: [], // Array of bubble state references
  };

  // Color Palettes for Translucent Bubbles & Butterflies
  const COLOR_PALETTES = [
    {
      name: 'Crystal Azure',
      hue: 210,
      light: 'rgba(235, 245, 255, 0.75)',
      mid: 'rgba(180, 220, 255, 0.55)',
      base: 'rgba(120, 190, 255, 0.65)',
      deep: 'rgba(70, 150, 240, 0.78)',
      glow: 'rgba(100, 180, 255, 0.45)',
      shadow: 'rgba(25, 75, 140, 0.22)',
      rim: 'rgba(180, 220, 255, 0.6)',
      particle: '#64b5f6',
      popped: {
        light: 'rgba(215, 235, 255, 0.3)',
        mid: 'rgba(180, 215, 245, 0.45)',
        deep: 'rgba(150, 195, 235, 0.55)',
        border: 'rgba(160, 205, 245, 0.7)'
      },
      butterfly: {
        wing1: '#00b4d8',
        wing2: '#90e0ef',
        core: '#03045e'
      }
    },
    {
      name: 'Electric Amethyst',
      hue: 275,
      light: 'rgba(250, 240, 255, 0.75)',
      mid: 'rgba(225, 190, 255, 0.55)',
      base: 'rgba(195, 135, 255, 0.65)',
      deep: 'rgba(160, 80, 240, 0.78)',
      glow: 'rgba(190, 110, 255, 0.45)',
      shadow: 'rgba(85, 30, 130, 0.24)',
      rim: 'rgba(225, 190, 255, 0.6)',
      particle: '#ba68c8',
      popped: {
        light: 'rgba(240, 220, 255, 0.3)',
        mid: 'rgba(215, 185, 245, 0.45)',
        deep: 'rgba(190, 150, 230, 0.55)',
        border: 'rgba(200, 160, 240, 0.7)'
      },
      butterfly: {
        wing1: '#7209b7',
        wing2: '#b5179e',
        core: '#3a0ca3'
      }
    },
    {
      name: 'Vibrant Coral',
      hue: 350,
      light: 'rgba(255, 240, 245, 0.75)',
      mid: 'rgba(255, 180, 200, 0.55)',
      base: 'rgba(255, 120, 155, 0.65)',
      deep: 'rgba(245, 65, 115, 0.78)',
      glow: 'rgba(255, 100, 140, 0.45)',
      shadow: 'rgba(140, 25, 55, 0.22)',
      rim: 'rgba(255, 185, 205, 0.6)',
      particle: '#ff70a6',
      popped: {
        light: 'rgba(255, 225, 235, 0.3)',
        mid: 'rgba(245, 185, 200, 0.45)',
        deep: 'rgba(235, 155, 175, 0.55)',
        border: 'rgba(245, 165, 185, 0.7)'
      },
      butterfly: {
        wing1: '#f72585',
        wing2: '#ff70a6',
        core: '#480ca8'
      }
    },
    {
      name: 'Emerald Mint',
      hue: 155,
      light: 'rgba(235, 255, 248, 0.75)',
      mid: 'rgba(175, 245, 225, 0.55)',
      base: 'rgba(105, 230, 195, 0.65)',
      deep: 'rgba(30, 195, 150, 0.78)',
      glow: 'rgba(60, 220, 175, 0.45)',
      shadow: 'rgba(15, 95, 70, 0.22)',
      rim: 'rgba(175, 245, 225, 0.6)',
      particle: '#48cae4',
      popped: {
        light: 'rgba(215, 250, 238, 0.3)',
        mid: 'rgba(175, 230, 210, 0.45)',
        deep: 'rgba(140, 210, 185, 0.55)',
        border: 'rgba(150, 220, 195, 0.7)'
      },
      butterfly: {
        wing1: '#06d6a0',
        wing2: '#80ed99',
        core: '#1b4332'
      }
    },
    {
      name: 'Golden Amber',
      hue: 45,
      light: 'rgba(255, 250, 230, 0.75)',
      mid: 'rgba(255, 225, 150, 0.55)',
      base: 'rgba(255, 195, 75, 0.65)',
      deep: 'rgba(245, 160, 20, 0.78)',
      glow: 'rgba(255, 185, 45, 0.45)',
      shadow: 'rgba(125, 75, 10, 0.22)',
      rim: 'rgba(255, 230, 160, 0.6)',
      particle: '#ffd166',
      popped: {
        light: 'rgba(255, 245, 210, 0.3)',
        mid: 'rgba(245, 220, 160, 0.45)',
        deep: 'rgba(235, 195, 120, 0.55)',
        border: 'rgba(245, 205, 130, 0.7)'
      },
      butterfly: {
        wing1: '#ffb703',
        wing2: '#fdffb6',
        core: '#fb8500'
      }
    },
    {
      name: 'Cosmic Indigo',
      hue: 240,
      light: 'rgba(240, 245, 255, 0.75)',
      mid: 'rgba(195, 205, 255, 0.55)',
      base: 'rgba(145, 165, 255, 0.65)',
      deep: 'rgba(95, 115, 245, 0.78)',
      glow: 'rgba(120, 140, 255, 0.45)',
      shadow: 'rgba(40, 50, 135, 0.23)',
      rim: 'rgba(200, 210, 255, 0.6)',
      particle: '#818cf8',
      popped: {
        light: 'rgba(225, 230, 255, 0.3)',
        mid: 'rgba(190, 200, 245, 0.45)',
        deep: 'rgba(160, 175, 235, 0.55)',
        border: 'rgba(175, 185, 245, 0.7)'
      },
      butterfly: {
        wing1: '#4361ee',
        wing2: '#4cc9f0',
        core: '#3f37c9'
      }
    }
  ];

  // DOM Elements
  const DOM = {
    grid: document.getElementById('bubbleGrid'),
    sheetWrapper: document.getElementById('sheetWrapper'),
    sheetViewport: document.getElementById('sheetViewport'),
    poppedCount: document.getElementById('poppedCount'),
    totalCount: document.getElementById('totalCount'),
    progressPercent: document.getElementById('progressPercent'),
    progressBar: document.getElementById('progressBar'),
    speedMetric: document.getElementById('speedMetric'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundOnIcon: document.getElementById('soundOnIcon'),
    soundOffIcon: document.getElementById('soundOffIcon'),
    popAllBtn: document.getElementById('popAllBtn'),
    resetBtn: document.getElementById('resetBtn'),
    glideToggle: document.getElementById('glideModeToggle'),
    ambientToggle: document.getElementById('ambientToggle'),
    hapticToggle: document.getElementById('hapticToggle'),
    sizePills: document.querySelectorAll('.size-selector .pill-btn'),
    patternPills: document.querySelectorAll('.pattern-selector .pill-btn'),
    modal: document.getElementById('celebrationModal'),
    modalResetBtn: document.getElementById('modalResetBtn'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    clearedCount: document.getElementById('clearedCount'),
    clearedTime: document.getElementById('clearedTime'),
    clearedSpeed: document.getElementById('clearedSpeed'),
  };

  // Preset Configurations for Bubble Sizes
  const SIZE_CONFIGS = {
    standard: {
      bubbleSize: 64,
      gap: 14,
      class: 'size-standard',
      defaultCols: 10,
      defaultRows: 8,
    },
    jumbo: {
      bubbleSize: 80,
      gap: 18,
      class: 'size-jumbo',
      defaultCols: 8,
      defaultRows: 6,
    },
    micro: {
      bubbleSize: 46,
      gap: 10,
      class: 'size-micro',
      defaultCols: 14,
      defaultRows: 10,
    },
  };

  /**
   * Determine optimal grid dimensions based on viewport size and bubble configuration
   */
  function calculateOptimalGrid() {
    const config = SIZE_CONFIGS[state.sizeMode];
    const viewportWidth = DOM.sheetViewport.clientWidth || window.innerWidth;
    const viewportHeight = DOM.sheetViewport.clientHeight || window.innerHeight;

    const availW = Math.max(300, viewportWidth - 90);
    const availH = Math.max(320, viewportHeight - 120);

    const cellW = config.bubbleSize + config.gap;
    const cellH = config.bubbleSize + config.gap;

    let cols = Math.floor((availW + config.gap) / cellW);
    let rows = Math.floor((availH + config.gap) / cellH);

    cols = Math.max(4, Math.min(cols, 18));
    rows = Math.max(4, Math.min(rows, 14));

    return { cols, rows, config };
  }

  /**
   * Select color based on cell position and pattern mode
   */
  function getPaletteForCell(r, c, rows, cols) {
    let index = 0;
    if (state.patternMode === 'honeycomb') {
      index = (r + c + (r % 2)) % COLOR_PALETTES.length;
    } else if (state.patternMode === 'diamond') {
      const centerR = (rows - 1) / 2;
      const centerC = (cols - 1) / 2;
      const manhattan = Math.abs(r - centerR) + Math.abs(c - centerC);
      index = Math.floor(manhattan) % COLOR_PALETTES.length;
    } else if (state.patternMode === 'waves') {
      const wave = Math.sin(r * 0.7) + Math.cos(c * 0.7);
      index = Math.abs(Math.floor((wave + 2) * 1.5)) % COLOR_PALETTES.length;
    } else {
      index = (r * cols + c) % COLOR_PALETTES.length;
    }
    return COLOR_PALETTES[index];
  }

  /**
   * Calculate offset translation for pattern styling
   */
  function getPatternTransform(r, c) {
    if (state.patternMode === 'honeycomb') {
      // Hexagonal / Honeycomb stagger: alternate rows shift horizontally by half gap/offset
      const isOdd = r % 2 === 1;
      const shiftX = isOdd ? '16px' : '0px';
      return `translateX(${shiftX})`;
    }
    return 'none';
  }

  /**
   * Initialize or Re-render the Bubble Sheet
   */
  function buildSheet() {
    const { cols, rows, config } = calculateOptimalGrid();
    const total = cols * rows;

    // Update state
    state.totalBubbles = total;
    state.poppedCount = 0;
    state.popTimestamps = [];
    state.startTime = null;
    state.endTime = null;
    state.bubbles = [];

    // Apply class to wrapper
    DOM.sheetWrapper.className = `sheet-wrapper ${config.class}`;
    DOM.grid.style.setProperty('--grid-cols', cols);
    DOM.grid.innerHTML = '';

    // Play sheet setup sound
    if (window.bubbleAudio) {
      window.bubbleAudio.playSheetReset();
    }

    // Document fragment for rapid DOM injection
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const cell = document.createElement('div');
        cell.className = 'bubble-cell';
        cell.dataset.index = index;
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Apply pattern geometric offset
        const transform = getPatternTransform(r, c);
        if (transform !== 'none') {
          cell.style.transform = transform;
        }

        const palette = getPaletteForCell(r, c, rows, cols);
        const wrinkleAngle = Math.floor(Math.random() * 360);
        const pitchVariation = 0.88 + ((palette.hue / 360) * 0.28) + (Math.random() * 0.1 - 0.05);

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.setProperty('--wrinkle-rot', `${wrinkleAngle}deg`);
        
        // Dynamic translucent colors per bubble
        bubble.style.setProperty('--bubble-light', palette.light);
        bubble.style.setProperty('--bubble-mid', palette.mid);
        bubble.style.setProperty('--bubble-base', palette.base);
        bubble.style.setProperty('--bubble-deep', palette.deep);
        bubble.style.setProperty('--bubble-glow', palette.glow);
        bubble.style.setProperty('--bubble-shadow', palette.shadow);
        bubble.style.setProperty('--bubble-rim-color', palette.rim);
        bubble.style.setProperty('--bubble-ring', palette.glow);
        bubble.style.setProperty('--particle-color', palette.particle);
        bubble.style.setProperty('--bubble-popped-light', palette.popped.light);
        bubble.style.setProperty('--bubble-popped-mid', palette.popped.mid);
        bubble.style.setProperty('--bubble-popped-deep', palette.popped.deep);
        bubble.style.setProperty('--bubble-popped-border', palette.popped.border);

        bubble.setAttribute('role', 'button');
        bubble.setAttribute('tabindex', '0');
        bubble.setAttribute('aria-label', `${palette.name} Bubble ${index + 1}`);

        // Bubble plastic rim
        const rim = document.createElement('div');
        rim.className = 'bubble-rim';
        bubble.appendChild(rim);

        cell.appendChild(bubble);
        fragment.appendChild(cell);

        // Store in state array
        state.bubbles.push({
          index,
          row: r,
          col: c,
          element: bubble,
          cell: cell,
          popped: false,
          pitch: pitchVariation,
          palette: palette,
        });
      }
    }

    DOM.grid.appendChild(fragment);
    updateMetrics();
    closeModal();
  }

  /**
   * Spawn an animated flying butterfly emerging from a burst bubble
   * @param {number} x - Origin X coordinate
   * @param {number} y - Origin Y coordinate
   * @param {Object} palette - Color palette of the bubble
   */
  function spawnButterfly(x, y, palette) {
    const butterfly = document.createElement('div');
    butterfly.className = 'flying-butterfly';
    butterfly.style.left = `${x}px`;
    butterfly.style.top = `${y}px`;

    // Construct realistic 3D flapping wings
    const wrap = document.createElement('div');
    wrap.className = 'butterfly-body-wrap';

    const leftWing = document.createElement('div');
    leftWing.className = 'butterfly-wing left';
    leftWing.style.background = `linear-gradient(135deg, ${palette.butterfly.wing1} 0%, ${palette.butterfly.wing2} 100%)`;
    const leftPattern = document.createElement('div');
    leftPattern.className = 'wing-pattern';
    leftWing.appendChild(leftPattern);

    const rightWing = document.createElement('div');
    rightWing.className = 'butterfly-wing right';
    rightWing.style.background = `linear-gradient(135deg, ${palette.butterfly.wing1} 0%, ${palette.butterfly.wing2} 100%)`;
    const rightPattern = document.createElement('div');
    rightPattern.className = 'wing-pattern';
    rightWing.appendChild(rightPattern);

    const core = document.createElement('div');
    core.className = 'butterfly-core';
    core.style.background = palette.butterfly.core;

    const antL = document.createElement('div');
    antL.className = 'butterfly-antenna-left';
    const antR = document.createElement('div');
    antR.className = 'butterfly-antenna-right';
    core.appendChild(antL);
    core.appendChild(antR);

    wrap.appendChild(leftWing);
    wrap.appendChild(rightWing);
    wrap.appendChild(core);
    butterfly.appendChild(wrap);
    document.body.appendChild(butterfly);

    // Natural fluttering flight dynamics: upward curve with fluttering drift
    const startX = x;
    const startY = y;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // Mostly upward
    const speed = 130 + Math.random() * 80; // Distance traveled
    const targetX = startX + Math.cos(angle) * speed;
    const targetY = startY + Math.sin(angle) * speed - 60; // Upward buoyant drift
    const duration = 1400 + Math.random() * 500;
    const startTime = performance.now();
    const flutterFrequency = 0.015;
    const flutterAmp = 18 + Math.random() * 12;

    // Stardust Sparkles interval
    let sparkleTimer = setInterval(() => {
      if (!butterfly.isConnected) return;
      const rect = butterfly.getBoundingClientRect();
      const sparkle = document.createElement('div');
      sparkle.className = 'butterfly-sparkle';
      sparkle.style.left = `${rect.left + 19 + (Math.random() - 0.5) * 8}px`;
      sparkle.style.top = `${rect.top + 22 + (Math.random() - 0.5) * 8}px`;
      sparkle.style.color = palette.butterfly.wing1;
      sparkle.style.background = palette.butterfly.wing2;
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 650);
    }, 120);

    function animateFlight(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 2.5);

      const curX = startX + (targetX - startX) * ease + Math.sin(elapsed * flutterFrequency) * flutterAmp;
      const curY = startY + (targetY - startY) * ease;
      const scale = 0.5 + 0.6 * Math.sin(progress * Math.PI); // Gentle pop growth and fly off
      const rot = (Math.cos(elapsed * 0.01) * 20);
      const opacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;

      butterfly.style.transform = `translate(${curX - startX}px, ${curY - startY}px) scale(${scale}) rotate(${rot}deg)`;
      butterfly.style.opacity = opacity;

      if (progress < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        clearInterval(sparkleTimer);
        butterfly.remove();
      }
    }

    requestAnimationFrame(animateFlight);
  }

  /**
   * Pop an individual bubble
   * @param {Object} bubbleObj 
   * @param {boolean} triggeredByCascade 
   */
  function popBubble(bubbleObj, triggeredByCascade = false) {
    if (!bubbleObj || bubbleObj.popped) return false;

    bubbleObj.popped = true;
    bubbleObj.element.classList.add('popped');
    bubbleObj.element.setAttribute('aria-pressed', 'true');

    // Add wrinkle slit line decoration inside popped film
    const slit = document.createElement('div');
    slit.className = 'wrinkle-line';
    bubbleObj.element.appendChild(slit);

    // Spawn visual burst ring shockwave
    createBurstEffect(bubbleObj.cell, bubbleObj.palette);

    // Get bubble viewport center to release butterfly
    const rect = bubbleObj.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Release colorful flying butterfly!
    spawnButterfly(centerX, centerY, bubbleObj.palette);

    // Audio Playback
    if (window.bubbleAudio) {
      window.bubbleAudio.playPop(bubbleObj.pitch, triggeredByCascade ? 0.85 : 1.05);
    }

    // Haptic feedback
    triggerHaptic();

    // Stats Tracking
    if (!state.startTime) {
      state.startTime = performance.now();
    }
    state.poppedCount++;
    state.popTimestamps.push(performance.now());

    updateMetrics();

    // Check completion condition
    if (state.poppedCount >= state.totalBubbles) {
      handleComplete();
    }

    return true;
  }

  /**
   * Tactile Haptic Vibration for Supported Devices
   */
  function triggerHaptic() {
    if (!state.hapticEnabled) return;
    if (navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  }

  /**
   * Visual Shockwave & Colored Particle Burst
   */
  function createBurstEffect(cell, palette) {
    const ring = document.createElement('div');
    ring.className = 'burst-ring';
    cell.appendChild(ring);

    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'burst-particle';
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.5);
      const dist = 14 + Math.random() * 14;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.left = '50%';
      p.style.top = '50%';
      p.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px)`;
      p.style.opacity = '1';
      p.style.transition = 'all 0.35s cubic-bezier(0.1, 0.9, 0.2, 1)';

      cell.appendChild(p);

      requestAnimationFrame(() => {
        p.style.opacity = '0';
        p.style.transform = `translate(-50%, -50%) translate(${tx * 1.6}px, ${ty * 1.6}px) scale(0)`;
      });
    }

    setTimeout(() => {
      ring.remove();
      cell.querySelectorAll('.burst-particle').forEach(el => el.remove());
    }, 450);
  }

  /**
   * Update all numeric counters, percentages, and progress indicators
   */
  function updateMetrics() {
    DOM.poppedCount.textContent = state.poppedCount;
    DOM.totalCount.textContent = state.totalBubbles;

    const percent = state.totalBubbles > 0
      ? Math.round((state.poppedCount / state.totalBubbles) * 100)
      : 0;

    DOM.progressPercent.textContent = `${percent}%`;
    DOM.progressBar.style.width = `${percent}%`;

    const now = performance.now();
    const recentPops = state.popTimestamps.filter(t => now - t <= 1200);
    const speed = (recentPops.length * (1000 / 1200)).toFixed(1);
    DOM.speedMetric.textContent = speed;
  }

  /**
   * Cascade "Pop All" Wave Animation
   */
  function popAllCascade() {
    if (state.cascading) return;
    state.cascading = true;
    DOM.popAllBtn.disabled = true;

    const { cols, rows } = calculateOptimalGrid();
    const centerR = rows / 2;
    const centerC = cols / 2;

    const unpopped = state.bubbles.filter(b => !b.popped);
    if (unpopped.length === 0) {
      state.cascading = false;
      DOM.popAllBtn.disabled = false;
      return;
    }

    unpopped.sort((a, b) => {
      const distA = Math.hypot(a.row - centerR, a.col - centerC);
      const distB = Math.hypot(b.row - centerR, b.col - centerC);
      return distA - distB;
    });

    let index = 0;
    const totalToPop = unpopped.length;
    const intervalMs = Math.max(14, Math.min(35, 1200 / totalToPop));

    function step() {
      if (index >= totalToPop) {
        state.cascading = false;
        DOM.popAllBtn.disabled = false;
        return;
      }

      const batchSize = totalToPop > 80 ? 2 : 1;
      for (let b = 0; b < batchSize && index < totalToPop; b++) {
        popBubble(unpopped[index], true);
        index++;
      }

      setTimeout(step, intervalMs);
    }

    step();
  }

  /**
   * Celebration Handling when 100% is cleared
   */
  function handleComplete() {
    state.endTime = performance.now();
    const totalSeconds = ((state.endTime - (state.startTime || state.endTime)) / 1000).toFixed(1);
    const peakSpeed = (state.totalBubbles / Math.max(0.5, totalSeconds)).toFixed(1);

    if (window.bubbleAudio) {
      window.bubbleAudio.playCelebration();
    }

    if (window.confetti) {
      window.confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f72585', '#7209b7', '#4361ee', '#4cc9f0', '#06d6a0', '#ffd166']
      });

      setTimeout(() => {
        window.confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        window.confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
    }

    setTimeout(() => {
      DOM.clearedCount.textContent = state.totalBubbles;
      DOM.clearedTime.textContent = `${totalSeconds}s`;
      DOM.clearedSpeed.textContent = peakSpeed;
      DOM.modal.classList.remove('hidden');
    }, 450);
  }

  function closeModal() {
    DOM.modal.classList.add('hidden');
  }

  // ================= Event Listeners & Interaction =================

  function getBubbleFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cell = el.closest('.bubble-cell');
    if (!cell) return null;
    const idx = parseInt(cell.dataset.index, 10);
    return state.bubbles[idx];
  }

  DOM.grid.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    if (window.bubbleAudio) window.bubbleAudio.init();

    const bubbleObj = getBubbleFromPoint(e.clientX, e.clientY);
    if (bubbleObj) {
      popBubble(bubbleObj);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!state.isDragging || !state.glideMode) return;
    const bubbleObj = getBubbleFromPoint(e.clientX, e.clientY);
    if (bubbleObj && !bubbleObj.popped) {
      popBubble(bubbleObj);
    }
  });

  window.addEventListener('pointerup', () => {
    state.isDragging = false;
  });

  window.addEventListener('pointercancel', () => {
    state.isDragging = false;
  });

  DOM.grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const bubbleEl = e.target.closest('.bubble');
      if (bubbleEl) {
        e.preventDefault();
        const cell = bubbleEl.closest('.bubble-cell');
        const idx = parseInt(cell.dataset.index, 10);
        popBubble(state.bubbles[idx]);
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    const key = e.key.toLowerCase();
    if (key === 'r') {
      buildSheet();
    } else if (key === 'a') {
      popAllCascade();
    } else if (key === 'm') {
      toggleSound();
    }
  });

  function toggleSound() {
    const isMuted = !window.bubbleAudio.isMuted;
    window.bubbleAudio.setMuted(isMuted);
    DOM.soundOnIcon.classList.toggle('hidden', isMuted);
    DOM.soundOffIcon.classList.toggle('hidden', !isMuted);
    DOM.soundToggleBtn.setAttribute('title', isMuted ? 'Unmute (M)' : 'Mute (M)');
  }

  DOM.soundToggleBtn.addEventListener('click', toggleSound);

  DOM.resetBtn.addEventListener('click', () => {
    buildSheet();
  });

  DOM.popAllBtn.addEventListener('click', () => {
    popAllCascade();
  });

  DOM.glideToggle.addEventListener('change', (e) => {
    state.glideMode = e.target.checked;
  });

  DOM.ambientToggle.addEventListener('change', (e) => {
    if (window.bubbleAudio) {
      window.bubbleAudio.toggleAmbient(e.target.checked);
    }
  });

  DOM.hapticToggle.addEventListener('change', (e) => {
    state.hapticEnabled = e.target.checked;
  });

  // Size Mode Pills
  DOM.sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.sizePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.sizeMode = pill.dataset.size;
      buildSheet();
    });
  });

  // Pattern Mode Pills
  DOM.patternPills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.patternPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.patternMode = pill.dataset.pattern;
      buildSheet();
    });
  });

  DOM.modalResetBtn.addEventListener('click', () => {
    buildSheet();
  });

  DOM.modalCloseBtn.addEventListener('click', () => {
    closeModal();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildSheet();
    }, 250);
  });

  setInterval(() => {
    if (state.popTimestamps.length > 0) {
      updateMetrics();
    }
  }, 400);

  // Initial Boot
  buildSheet();
})();

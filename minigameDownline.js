// Downline Minigame 1.0.1

(function() {
'use strict';

var DOWNLINE_CUSTOM_SPRITE_URL = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/updatedSpriteSheet.png';

var downlineAchievementNames = [
    'Popularity factor',
    'Factorial factor',
    'Big tent factor'
];

var downlineAchievementState = {
    achievementsCreated: false
};

var DownlineM = {};
DownlineM.parent = Game.Objects && Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'] : {
    id: 0,
    level: 10,
    minigameName: 'Downline',
    minigameLoaded: false,
    minigameLoading: false,
    minigameDiv: null,
    l: null,
    refresh: function() {}
};
DownlineM.parent.minigame = DownlineM;

function getFractalEngine() {
    return Game.Objects['Fractal engine'];
}

var BAR_MAX = 1000;
var G = {
    players: { dabbler: 0, casual: 0, habitual: 0, devotee: 0, fanatic: 0 },
    hype: 50, commitment: 50, referrals: 0, reputation: BAR_MAX,
    rawCpS: 1,
    unfrozenRawCpS: 1,
    boredom: 0,
    lastActions: [],
    activeBoredomEffects: [],
    boredomEffectHour: 1,
    releaseMetPlayers: false,
    releaseMetHype: false,
    releaseMetCommitment: false,
    releaseMetReferrals: false,
    prestigeBoost: 0,
    tickCount: 0, elapsedSec: 0, speed: 1,
    activeActions: [], unlocked: {},
    _supremeIntellectWasActive: false,
    pendingNewPlayers: 0, fractalLevel: 20,
    tickerPool: [], prestige: 0,
    releasesThisAscension: 0,
    frozen: false,
    lumpSpeedBoostEnd: 0,
    lastTickTime: 0
};

var lumpBoostState = {
    active: false
};

DownlineM.launch = function() {
    var M = this;
    var fractalEngine = getFractalEngine();
    M.name = (fractalEngine && fractalEngine.minigameName) || 'Downline';
};

DownlineM.dragonBoostTooltip = function() {
    var bonus = Game.hasAura('Supreme Intellect') ? 1 : 0;
    return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>Supreme Intellect</b><div class="line"></div>Downline actions last 10% longer.</div>';
};

function $(id) { return document.getElementById(id); }

var SHEETS = {
    main: 'https://orteil.dashnet.org/cookieclicker/img/icons.png',
    custom: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/updatedSpriteSheet.png',
    garden: 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png'
};

function createIcon(col, row, sheet, cellSize) {
    cellSize = cellSize || 48;
    var el = document.createElement('span');
    el.className = 'downline-icon';
    el.style.backgroundImage = 'url(' + (SHEETS[sheet || 'main'] || SHEETS.main) + ')';
    el.style.backgroundPosition = (-col * cellSize) + 'px ' + (-row * cellSize) + 'px';
    return el;
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function getSupremeIntellectDurationMult() {
    return Game.hasAura('Supreme Intellect') ? 1.1 : 1;
}

function formatNum(n) { return Math.floor(n).toLocaleString(); }

function probRound(x, cap) {
    if (cap <= 0) return 0;
    var n = Math.floor(x) + (Math.random() < (x % 1) ? 1 : 0);
    return Math.min(cap, Math.max(0, n));
}

function formatDuration(sec) {
    if (sec <= 0) return 'Instant';
    if (sec < 60) return sec + ' sec';
    if (sec < 3600) return Math.round(sec / 60) + ' min';
    if (sec < 86400) { var h = sec / 3600; return (h % 1 ? h.toFixed(1) : h) + ' hour' + (h >= 2 ? 's' : ''); }
    var d = Math.round(sec / 86400); return d + ' day' + (d > 1 ? 's' : '');
}

function formatRemaining(sec) {
    sec = Math.max(0, Math.floor(sec));
    if (sec === 0) return '0s';
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var parts = [];
    if (h > 0) parts.push(h + 'h');
    if (m > 0) parts.push(m + 'm');
    if (s > 0 || parts.length === 0) parts.push(s + 's');
    return parts.join(' ');
}

DownlineM.init = function(div) {
    if (!div) return;
    DownlineM.div = div;

    var resPath = Game.resPath || 'https://orteil.dashnet.org/cookieclicker/';
    var cssContent = `
    .downline-row-visible .productDragonBoost { position: relative; z-index: 2; }
    #downline-bg {
      background: url('${resPath}img/shadedBorders.png'), linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
      background-size: 100% 100%, auto;
      background-repeat: no-repeat, repeat;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      z-index: -1;
    }
    #downline-wrap {
      box-sizing: border-box;
      max-width: 1000px;
      width: 100%;
      margin: 0 auto;
      padding: 8px;
      position: relative;
      background: transparent;
      container-type: inline-size;
      container-name: downline-wrap;
      overflow: hidden;
    }
    #downline-wrap .framed {
      background: transparent;
      box-sizing: border-box;
    }
    #downline-wrap .titleFont { font-family: 'Merriweather', Georgia, serif; }

    /* Default/widest (650px+): [bars + active stacked] | library side-by-side */
    .downline-main {
      display: flex;
      flex-direction: row;
      gap: 10px;
      align-items: flex-start;
      justify-content: center;
      background: transparent;
    }
    .downline-left-column {
      flex: 0 0 280px;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .downline-bars {
      flex-shrink: 0;
    }
    .downline-active-column {
      width: 280px;
      min-width: 280px;
      max-width: 280px;
      flex-grow: 0;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .downline-actions-library {
      flex: 1;
      min-width: 280px;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }
    .downline-bar {
      margin-bottom: 10px;
    }
    .downline-bar .name {
      font-weight: bold;
      font-size: 12px;
      color: #ccc;
      margin-bottom: 4px;
    }
    .downline-bar-track {
      position: relative;
      height: 14px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 0 4px #000, 0 2px 3px rgba(0,0,0,0.5) inset;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .downline-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.2s ease-out;
    }
    .downline-player-mix {
      display: flex;
      width: 100%;
      height: 100%;
    }
    .downline-player-mix span {
      height: 100%;
      transition: width 0.3s ease-out;
    }
    .downline-player-mix .dabbler   { background: #2a8a2a; }
    .downline-player-mix .casual    { background: #c9c920; }
    .downline-player-mix .habitual  { background: #c97620; }
    .downline-player-mix .devotee   { background: #c92a2a; }
    .downline-player-mix .fanatic   { background: #b07acc; }
    .downline-bar-hype .downline-bar-fill        { background: linear-gradient(90deg, #0a5, #3c9); }
    .downline-bar-commitment .downline-bar-fill { background: linear-gradient(90deg, #06c, #6ad); }
    .downline-bar-referrals .downline-bar-fill  { background: linear-gradient(90deg, #96c, #c6f); }
    .downline-bar-reputation .downline-bar-fill { background: linear-gradient(90deg, #c60, #fc7); }
    .downline-bar-cap {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      background: rgba(255,0,0,0.35);
      display: none;
      pointer-events: none;
      border-radius: 0 3px 3px 0;
    }
    .downline-bar-cap.active {
      display: block;
    }
    /* Actions library: vertical stack (filters, list area, bottom). Bottom bar pinned with margin-top: auto. */
    .downline-actions-library-bottom {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 10px 0 6px 0;
      border-top: 1px solid rgba(255,255,255,0.2);
      margin-top: auto;
    }
    .downline-actions-library-bottom-left,
    .downline-actions-library-bottom-right { flex: 1; min-width: 0; display: flex; align-items: center; }
    .downline-actions-library-bottom-right { justify-content: flex-end; }
    .downline-actions-library-bottom-center { flex: 0 0 auto; text-align: center; min-width: 0; }
    .downline-lump-row { margin: 0; text-align: center; }
    .downline-lump-wrap {
      position: relative;
      display: inline-block;
      padding: 4px 10px;
      padding-left: 28px;
      text-align: center;
      font-size: 11px;
      color: rgba(255,255,255,0.75);
      text-shadow: -1px 1px 0 #000;
      background: rgba(0,0,0,0.75);
      border-radius: 16px;
      cursor: pointer;
    }
    .downline-lump-wrap.disabled { opacity: 0.5; cursor: default; pointer-events: none; }
    .downline-lump-wrap .downline-lump-icon-slot {
      position: absolute;
      left: -9px;
      top: 50%;
      width: 48px;
      height: 48px;
      transform: translateY(-50%);
      z-index: 10;
      pointer-events: none;
    }
    .downline-lump-wrap .downline-lump-icon-slot .downline-lump-icon {
      pointer-events: auto;
    }
    .downline-lump-wrap .downline-lump-icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 48px;
      height: 48px;
      background-repeat: no-repeat;
      background-image: url(https://orteil.dashnet.org/cookieclicker/img/icons.png);
      background-position: -1392px -672px;
      filter: drop-shadow(0 3px 2px #000);
      cursor: pointer;
      transform: scale(0.5);
      transform-origin: center center;
      transition: transform 0.05s;
    }
    .downline-lump-wrap .downline-lump-icon:hover { transform: scale(1); }
    .downline-lump-wrap .downline-lump-icon:active { transform: scale(0.4); }
    .downline-lump-wrap.disabled .downline-lump-icon:hover { transform: scale(0.5); }
    .downline-lump-wrap .downline-lump-text { display: inline-block; }
    .downline-boredom-under-slots {
      flex-shrink: 0;
      margin-top: -2px;
    }
    .downline-boredom-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 1px 0 4px 0;
    }
    .downline-boredom-wrap.hidden { display: none !important; }
    .downline-boredom-label { font-weight: bold; font-size: 12px; color: rgba(255,255,255,0.9); }
    .downline-boredom-icons {
      display: flex;
      gap: 2px;
      align-items: center;
    }
    .downline-boredom-icon-box {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      overflow: hidden;
      display: inline-block;
    }
    .downline-boredom-icon-box .downline-boredom-icon {
      transform: scale(0.5);
      transform-origin: top left;
    }
    .downline-boredom-icon-box.hidden { display: none !important; }
    .downline-actions-library-inner {
      flex: 1 1 auto;
      min-height: 0;
      padding-bottom: 45px;
      display: flex;
      flex-direction: column;
    }
    .downline-actions-library .subsection { padding: 2px 0; }
    .downline-action-filters {
      display: flex;
      gap: 2px;
      margin-bottom: 4px;
      padding: 2px 0 4px 0;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .downline-action-filters .downline-filter-btn {
      flex: 1 1 0;
      min-width: 0;
      text-align: center !important;
      padding: 4px 2px !important;
      font-size: 13px;
      margin: 0;
      background-position: center !important;
    }
    .downline-filter-btn.off { opacity: 0.15; }
    .downline-actions-list-wrap {
      flex: 1 1 auto;
      min-height: 0;
    }
    /* Grid with auto-fit cols */
    .downline-actions-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, 50px);
      gap: 1px;
      justify-content: center;
      align-content: start;
      padding: 2px 0;
      width: 100%;
      max-width: 509px;
      margin: 0 auto;
    }
    .downline-release-wrap { flex-shrink: 0; }
    .downline-release-wrap.locked {
      opacity: 0.6;
    }
    .downline-release-wrap .smallFancyButton { margin: 0; }
    #downline-release-btn {
      width: auto !important;
      min-width: 0;
      padding: 4px 10px !important;
      text-align: center;
    }
    #downline-release-wrap.downline-release-ready #downline-release-btn,
    #downline-release-yes.downline-ascend-button {
      animation: rainbowCycle 5s infinite ease-in-out, pucker 0.2s ease-out;
      box-shadow: 0 0 0 1px #000, 0 0 1px 2px currentColor;
      background: linear-gradient(to bottom, transparent 0%, currentColor 500%) !important;
      border-color: currentColor !important;
    }
    #downline-release-wrap.downline-release-ready #downline-release-btn:hover,
    #downline-release-yes.downline-ascend-button:hover {
      border-color: currentColor !important;
      background: linear-gradient(to bottom, transparent 0%, currentColor 500%) !important;
    }
    .downline-action-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      padding: 0;
      margin: 0;
      font-size: 0;
      color: transparent;
      border: 1px solid #555;
      background: rgba(0,0,0,0.4);
      border-radius: 2px;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      overflow: hidden;
      flex-shrink: 0;
    }
    .downline-action-item:hover {
      border-color: #e2dd48;
      background: rgba(0,0,0,0.6);
    }

    .downline-icon {
      display: inline-block;
      width: 48px;
      height: 48px;
      background-repeat: no-repeat;
      pointer-events: none;
    }
    .downline-action-icon-wrap {
      display: inline-block;
      width: 48px;
      height: 48px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .downline-active-section {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
    }
    .downline-active-section .subsection {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      padding: 6px 8px;
    }
    .downline-active-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      padding: 0;
    }
    .downline-active-slot {
      min-width: 0;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
    }
    .downline-active-slot.available {
      background: rgba(0,0,0,0.25);
      border: 1px dashed rgba(255,255,255,0.15);
    }
    .downline-active-slot.blocked {
      background: rgba(255,0,0,0.15);
      border: 1px dashed rgba(255,100,100,0.3);
    }
    .downline-active-slots-info {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      margin-top: 6px;
      padding-bottom: 4px;
      flex-shrink: 0;
      text-align: center;
    }
    .downline-active-slots-info .green { color: #6f6; }
    .downline-active-chip {
      position: relative;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 2px;
      overflow: hidden;
      border: 1px solid #c07a36;
      box-shadow: 0 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.15) inset;
      background: #000;
    }
    .downline-active-chip .downline-icon {
      transform: scale(0.75);
      transform-origin: 0 0;
    }
    .downline-active-chip .downline-active-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 36px;
      height: 36px;
      pointer-events: none;
      box-sizing: border-box;
      background: url(https://orteil.dashnet.org/cookieclicker/img/pieFill.png) no-repeat;
      background-size: 648px 288px; 
      opacity: 0.5;
      z-index: 2;
    }
    .downline-ticker-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      margin-bottom: 2px;
      flex-shrink: 0;
    }
    #downline-freeze-btn { flex-shrink: 0; }
    #downline-wrap #downline-freeze-btn.gardenSeed { cursor: pointer; display: inline-block; width: 40px; height: 40px; position: relative; margin: 0; }
    #downline-wrap #downline-freeze-btn .gardenSeedIcon { pointer-events: none; display: inline-block; position: absolute; left: -4px; top: -4px; width: 48px; height: 48px; background: url(https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png); }
    #downline-wrap #downline-freeze-btn.gardenSeed.on::before { pointer-events: none; content: ''; display: block; position: absolute; left: -10px; top: -10px; width: 60px; height: 60px; background: url(https://orteil.dashnet.org/cookieclicker/img/selectTarget.png) no-repeat center; background-size: 100% 100%; animation: wobble 0.2s ease-out; z-index: 10; }
    .downline-ticker-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      border: 1px solid #555;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
      z-index: 1;
      position: relative;
    }
    .downline-ticker-banner {
      flex-shrink: 0;
      width: 90px;
      font-style: italic;
      height: 30px;
      background: #a60003;
      color: #fff;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .downline-ticker-bar {
      flex: 1;
      min-width: 0;
      height: 30px;
      background: #111;
      border-left: 1px solid #333;
      position: relative;
      overflow: hidden;
    }
    .downline-ticker-content {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      overflow: hidden;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .downline-ticker-wrap.frozen .downline-ticker-strip { color: #6ad; }
    .downline-ticker-wrap.sugar-rush .downline-ticker-strip { font-style: italic; }
    .downline-ticker-strip {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      line-height: 30px;
      font-size: 12px;
      color: #fff;
      will-change: transform;
      backface-visibility: hidden;
    }
    .downline-ticker-strip .ticker-segment {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-right: 16px;
    }
    .downline-ticker-strip .ticker-segment .downline-tooltip-cost-cookie-wrap {
      width: 18px;
      height: 18px;
      overflow: hidden;
      flex-shrink: 0;
      margin-left: 3px;
    }
    .downline-ticker-strip .ticker-segment .downline-tooltip-cost-cookie-wrap .downline-tooltip-cost-cookie {
      transform: scale(0.42);
      transform-origin: 0 0;
    }
    .downline-tier-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
      vertical-align: middle;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .downline-tier-line { margin-bottom: 5px; line-height: 1.5; }
    .downline-action-item.locked {
      opacity: 0.3;
      filter: grayscale(100%);
    }
    .downline-status-title.title { font-size: 16px !important; }
    .downline-bars .title .green,
    .downline-active-section .title .green { color: #6f6; }
    .downline-bars .title .red,
    .downline-active-section .title .red { color: #f66; }

    .downline-debug {
      margin-top: 16px;
      padding: 8px 12px;
      border: 1px dashed rgba(255,100,100,0.4);
      border-radius: 4px;
      background: rgba(50,0,0,0.3);
      font-size: 11px;
      color: #f99;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .downline-debug .label { font-weight: bold; margin-right: 4px; }
    .downline-debug-group { display: inline-flex; align-items: center; gap: 4px; }
    .downline-debug-group label { font-size: 11px; color: #f99; }
    .downline-debug input[type="number"] {
      width: 3em;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,100,100,0.5);
      color: #fcc;
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 11px;
      font-family: inherit;
    }
    .downline-debug button {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,100,100,0.5);
      color: #fcc;
      padding: 2px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
      font-family: inherit;
    }
    .downline-debug button:hover { background: rgba(255,255,255,0.2); }
    .downline-debug button.active { background: rgba(255,80,80,0.4); border-color: #f66; color: #fff; }
    .downline-debug .debug-stats { color: #ccc; margin-left: auto; }
    /* Medium (below 650px): stack main to column, library goes below left-column */
    @container downline-wrap (max-width: 649px) {
      #downline-wrap .downline-main {
        flex-direction: column;
      }
      #downline-wrap .downline-left-column {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
      }
      #downline-wrap .downline-actions-library {
        width: 100%;
      }
    }
    @container downline-wrap (max-width: 499px) {
      #downline-wrap .downline-left-column {
        flex-direction: column;
      }
    }
    /* Medium range (500-649px): bars and active side-by-side, left column expands to full width */
    @container downline-wrap (min-width: 500px) and (max-width: 649px) {
      #downline-wrap .downline-left-column {
        flex-direction: row;
        gap: 10px;
      }
      #downline-wrap .downline-bars {
        flex: 1 1 auto;
        min-width: 0;
      }
      #downline-wrap .downline-active-column {
        flex: 0 0 280px;
        width: 280px;
        min-width: 280px;
      }
    }
    `;
    
    var styleEl = document.createElement('style');
    styleEl.textContent = cssContent;
    document.head.appendChild(styleEl);
    var htmlContent = `
<div id="downline-bg"></div>
<div id="downline-wrap">
<div class="downline-main">
      <div class="downline-left-column">
      <div class="downline-bars framed">
        <div class="subsection">
          <div class="title downline-status-title">Downline CpS + <span id="downline-status-boost" class="green">0.00%</span></div>
          <div class="downline-bar downline-bar-players" data-name="Players" data-desc-html="Players who you have recruited who are actively playing Cookie Clicker.&lt;br&gt;&lt;br&gt;&lt;div class='downline-tier-line'&gt;&lt;span class='downline-tier-dot' style='background:#2a8a2a'&gt;&lt;/span&gt;&lt;b&gt;Dabblers&lt;/b&gt; New players who are trying out the game, they may not stay long if you cannot hold their interest but they may go on to become more serious players.&lt;/div&gt;&lt;div class='downline-tier-line'&gt;&lt;span class='downline-tier-dot' style='background:#c9c920'&gt;&lt;/span&gt;&lt;b&gt;Casuals&lt;/b&gt; These players have decided to give the game a chance and as long as it&amp;rsquo;s well maintained there is a decent chance they stick around.&lt;/div&gt;&lt;div class='downline-tier-line'&gt;&lt;span class='downline-tier-dot' style='background:#c97620'&gt;&lt;/span&gt;&lt;b&gt;Habituals&lt;/b&gt; These players have caught cookie fever and are playing regularly.&lt;/div&gt;&lt;div class='downline-tier-line'&gt;&lt;span class='downline-tier-dot' style='background:#c92a2a'&gt;&lt;/span&gt;&lt;b&gt;Devotees&lt;/b&gt; Players who are committed to 100%ing the game and maybe even recruit some friends to play with them. With enough commitment they can become fanatics.&lt;/div&gt;&lt;div class='downline-tier-line'&gt;&lt;span class='downline-tier-dot' style='background:#b07acc'&gt;&lt;/span&gt;&lt;b&gt;Fanatics&lt;/b&gt; Your most devoted players, they will actively recruit more players. However if they get frustrated and quit playing they will take many players with them.&lt;/div&gt;">
            <div class="name" id="downline-bar-players-label">Players 0</div>
            <div class="downline-bar-track">
              <div class="downline-bar-fill" id="downline-bar-players-fill" style="width:0%">
                <div class="downline-player-mix" id="downline-player-mix">
                  <span class="dabbler" title="Dabblers" style="width:0%"></span>
                  <span class="casual" title="Casuals" style="width:0%"></span>
                  <span class="habitual" title="Habituals" style="width:0%"></span>
                  <span class="devotee" title="Devotees" style="width:0%"></span>
                  <span class="fanatic" title="Fanatics" style="width:0%"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="downline-bar downline-bar-hype" data-name="Hype" data-desc="How hyped players are right now. The more hyped players are about the game, the more likely they are to play for longer hours earning more CpS, spread the word to friends, and move up to higher-tier player types.">
            <div class="name" id="downline-bar-hype-label">Hype</div>
            <div class="downline-bar-track"><div class="downline-bar-fill" id="downline-bar-hype-fill"></div><div class="downline-bar-cap" id="downline-bar-hype-cap"></div></div>
          </div>
          <div class="downline-bar downline-bar-commitment" data-name="Commitment" data-desc="How committed your players are to the game. Commitment affects not only their odds of not quitting each day they play but also how likely they are to move up into higher tiers of player types. More committed players will play for longer earning more CpS.">
            <div class="name" id="downline-bar-commitment-label">Commitment</div>
            <div class="downline-bar-track"><div class="downline-bar-fill" id="downline-bar-commitment-fill"></div><div class="downline-bar-cap" id="downline-bar-commitment-cap"></div></div>
          </div>
          <div class="downline-bar downline-bar-referrals" data-name="Word of Mouth" data-desc="The strength of your referrals. Players will continually invite new players to the game, the higher tier of player the more effective they are at finding friends to play with. The strength of your word of mouth bar multiplies how effective each player is at recruiting on their own.">
            <div class="name" id="downline-bar-referrals-label">Word of Mouth</div>
            <div class="downline-bar-track"><div class="downline-bar-fill" id="downline-bar-referrals-fill"></div></div>
          </div>
          <div class="downline-bar downline-bar-reputation" data-name="Reputation" data-desc="The overall reputation of Cookie Clicker. Many actions provide fast gains but damage the public's perception; if the public has a low opinion of the game, players will leave, hype will drop, and commitment will fall. Reputation slowly recovers over time, but the damage done can be immediate and devastating. Even a modest drop in reputation will be felt across all metrics.">
            <div class="name" id="downline-bar-reputation-label">Reputation</div>
            <div class="downline-bar-track"><div class="downline-bar-fill" id="downline-bar-reputation-fill"></div></div>
          </div>
        </div>
      </div>

      <div class="downline-active-column">
      <div class="downline-active-section framed">
        <div class="subsection">
          <div class="downline-active-grid" id="downline-active-list">
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot available"></div>
            <div class="downline-active-slot"></div>
            <div class="downline-active-slot"></div>
            <div class="downline-active-slot"></div>
          </div>
          <p class="downline-active-slots-info" id="downline-active-slots-info" data-desc-html="Available action slots. One slot per fractal engine level, up to 10 slots."><span id="downline-active-count" class="green">0</span>/<span id="downline-active-max">7</span> slots used</p>
        </div>
      </div>
        <div class="downline-boredom-under-slots">
          <div class="downline-boredom-wrap hidden" id="downline-boredom-wrap">
            <span class="downline-boredom-label">Boredom</span>
            <div class="downline-boredom-icons" id="downline-boredom-icons"></div>
          </div>
        </div>
      </div>
      </div>

      <div class="downline-actions-library framed">
        <div class="downline-actions-library-inner">
          <div class="downline-action-filters">
            <a href="#" class="smallFancyButton downline-filter-btn" data-bar="players" title="Show/hide actions that affect Players">Players</a>
            <a href="#" class="smallFancyButton downline-filter-btn" data-bar="hype" title="Show/hide actions that affect Hype">Hype</a>
            <a href="#" class="smallFancyButton downline-filter-btn" data-bar="commitment" title="Show/hide actions that affect Commitment">Commitment</a>
            <a href="#" class="smallFancyButton downline-filter-btn" data-bar="referrals" title="Show/hide actions that affect Word of Mouth">Word of Mouth</a>
            <a href="#" class="smallFancyButton downline-filter-btn" data-bar="reputation" title="Show/hide actions that affect Reputation">Reputation</a>
          </div>
          <div class="downline-actions-list-wrap">
            <div class="downline-actions-list" id="downline-actions-list"></div>
          </div>
        </div>
        <div class="downline-actions-library-bottom">
          <div class="downline-actions-library-bottom-left">
            <div class="downline-lump-row">
              <div class="downline-lump-wrap" id="downline-lump-wrap">
                <div class="downline-lump-icon-slot">
                  <div class="downline-lump-icon usesIcon shadowFilter lumpRefill" id="downline-lump-icon" style="background-position:-1392px -672px;"></div>
                </div>
                <div class="downline-lump-text" id="downline-lump-text">Sugar Rush&reg;</div>
              </div>
            </div>
          </div>
          <div class="downline-actions-library-bottom-right">
            <div class="downline-release-wrap" id="downline-release-wrap" data-desc="">
              <a href="#" class="option smallFancyButton warning" id="downline-release-btn">Release Fractal Minigame</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="downline-ticker-row">
      <div id="downline-freeze-btn" class="gardenSeed" role="button" tabindex="0" data-name="Freeze" title="Freeze" data-desc-html="Freeze the Downline, everything runs slower! Action effects, decay, and CpS bonus are all reduced by 1/6th, plenty of time to take your eyes off the prize and get some Zzz's or maybe a pizza."><div class="gardenSeedIcon shadowFilter" style="background-position: -48px -1680px;"></div></div>
      <div class="downline-ticker-wrap">
        <div class="downline-ticker-banner">BREAKING</div>
        <div class="downline-ticker-bar">
          <div class="downline-ticker-content">
            <div class="downline-ticker-strip" id="downline-ticker-strip"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="downline-debug" id="downline-debug">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
        <span class="label">DEBUG</span>
        <span class="downline-debug-group">
          <label for="debug-fractal-level">Fractal Lv</label>
          <input type="number" id="debug-fractal-level" min="1" max="20" value="20">
        </span>
        <button id="debug-speed-0">Pause</button>
        <button id="debug-speed-1">1x</button>
        <button id="debug-speed-10">10x</button>
        <button id="debug-speed-100">100x</button>
        <button id="debug-speed-1000">1000x</button>
        <button id="debug-speed-10000">10000x</button>
        <span class="debug-stats" id="debug-stats">tick 0 | 0s elapsed</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <span class="downline-debug-group"><label id="debug-dabbler-label">Dab (0)</label><input type="number" id="debug-dabbler" min="0" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-casual-label">Cas (0)</label><input type="number" id="debug-casual" min="0" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-habitual-label">Hab (0)</label><input type="number" id="debug-habitual" min="0" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-devotee-label">Dev (0)</label><input type="number" id="debug-devotee" min="0" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-fanatic-label">Fan (0)</label><input type="number" id="debug-fanatic" min="0" placeholder="set" style="width:50px"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-hype-label">Hyp (50)</label><input type="number" id="debug-hype" min="0" max="1000" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-commitment-label">Com (50)</label><input type="number" id="debug-commitment" min="0" max="1000" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-referrals-label">WoM (0)</label><input type="number" id="debug-referrals" min="0" max="1000" placeholder="set" style="width:50px"></span>
        <span class="downline-debug-group"><label id="debug-reputation-label">Rep (1000)</label><input type="number" id="debug-reputation" min="0" max="1000" placeholder="set" style="width:50px"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-boredom-label">Boredom (0)</label><input type="number" id="debug-boredom" min="0" max="100" placeholder="set" style="width:50px" title="Boredom 0–100 (hidden until ≥20)"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-rawcps-label">raw CpS (1)</label><input type="number" id="debug-rawcps" min="0" step="any" placeholder="set" style="width:80px" title="Raw CpS used to compute action cost in cookies"></span>
        <button id="debug-apply-state" style="margin-left:4px">Apply</button>
        <button id="debug-shuffle-boredom" style="margin-left:4px" title="Re-roll boredom debuffs as if a new hour">Shuffle boredom</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px;">
        <span style="color:#888;font-size:11px">CpS balance:</span>
        <span class="downline-debug-group"><label id="debug-bonus-cap-label">Cap (150)</label><input type="number" id="debug-bonus-cap" min="0" step="any" placeholder="set" style="width:50px" title="BONUS_CAP max boost %"></span>
        <span class="downline-debug-group"><label id="debug-bonus-k-label">K (3)</label><input type="number" id="debug-bonus-k" min="0" step="any" placeholder="set" style="width:45px" title="BONUS_K"></span>
        <span class="downline-debug-group"><label id="debug-bonus-pow-label">Pow (0.32)</label><input type="number" id="debug-bonus-pow" min="0" step="0.01" placeholder="set" style="width:55px" title="BONUS_POW"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-bonus-hype-exp-label">HypExp (1)</label><input type="number" id="debug-bonus-hype-exp" min="0" step="any" placeholder="set" style="width:55px" title="Exponent on hype in bars factor"></span>
        <span class="downline-debug-group"><label id="debug-bonus-commit-exp-label">ComExp (1)</label><input type="number" id="debug-bonus-commit-exp" min="0" step="any" placeholder="set" style="width:55px" title="Exponent on commitment in bars factor"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-weight-dabbler-label">DabW (0.2)</label><input type="number" id="debug-weight-dabbler" min="0" step="0.1" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-weight-casual-label">CasW (0.5)</label><input type="number" id="debug-weight-casual" min="0" step="0.1" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-weight-habitual-label">HabW (1)</label><input type="number" id="debug-weight-habitual" min="0" step="0.1" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-weight-devotee-label">DevW (2)</label><input type="number" id="debug-weight-devotee" min="0" step="0.1" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-weight-fanatic-label">FanW (5)</label><input type="number" id="debug-weight-fanatic" min="0" step="0.1" placeholder="set" style="width:45px"></span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px;">
        <span style="color:#888;font-size:11px">Referral:</span>
        <span class="downline-debug-group"><label id="debug-ref-dab-label">RefDab</label><input type="number" id="debug-ref-dab" min="0" step="0.01" placeholder="set" style="width:45px" title="Referral rate dabbler/hr"></span>
        <span class="downline-debug-group"><label id="debug-ref-cas-label">RefCas</label><input type="number" id="debug-ref-cas" min="0" step="0.01" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-ref-hab-label">RefHab</label><input type="number" id="debug-ref-hab" min="0" step="0.01" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-ref-dev-label">RefDev</label><input type="number" id="debug-ref-dev" min="0" step="0.01" placeholder="set" style="width:45px"></span>
        <span class="downline-debug-group"><label id="debug-ref-fan-label">RefFan</label><input type="number" id="debug-ref-fan" min="0" step="0.01" placeholder="set" style="width:45px"></span>
        <span style="color:#666">|</span>
        <span class="downline-debug-group"><label id="debug-ref-hype-mid-label">HypMid</label><input type="number" id="debug-ref-hype-mid" min="0" step="any" placeholder="set" style="width:50px" title="Hype for 1x ref"></span>
        <span class="downline-debug-group"><label id="debug-ref-hype-cap-label">HypCap</label><input type="number" id="debug-ref-hype-cap" min="0" step="0.1" placeholder="set" style="width:45px" title="Max hype mult"></span>
        <span class="downline-debug-group"><label id="debug-ref-wom-min-label">WoMMin</label><input type="number" id="debug-ref-wom-min" min="0" max="1" step="0.05" placeholder="set" style="width:50px" title="WoM empty mult"></span>
        <span class="downline-debug-group"><label id="debug-ref-wom-max-label">WoMMax</label><input type="number" id="debug-ref-wom-max" min="0" step="0.1" placeholder="set" style="width:50px" title="WoM full mult"></span>
        <span class="downline-debug-group"><label id="debug-ref-exp-label">RefExp</label><input type="number" id="debug-ref-exp" min="0.1" max="1" step="0.05" placeholder="set" style="width:45px" title="Player count exponent (runaway cap)"></span>
      </div>
    </div>
  </div>
</div>
    `;
    
    div.style.position = 'relative';
    if (div.parentNode) div.parentNode.classList.add('downline-row-visible');
    div.innerHTML = htmlContent;
    var debugElInit = document.getElementById('downline-debug');
    if (debugElInit) debugElInit.style.display = Game.downlineDebug ? 'block' : 'none';
   

    var SHEETS = {
      main:   'https://orteil.dashnet.org/cookieclicker/img/icons.png',
      custom: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/updatedSpriteSheet.png',
      garden: 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png'
    };
    function createIcon(col, row, sheet, cellSize) {
      cellSize = cellSize || 48;
      var el = document.createElement('span');
      el.className = 'downline-icon';
      el.style.backgroundImage = 'url(' + (SHEETS[sheet || 'main'] || SHEETS.main) + ')';
      el.style.backgroundPosition = (-col * cellSize) + 'px ' + (-row * cellSize) + 'px';
      return el;
    }
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    function getSupremeIntellectDurationMult() {
      return Game.hasAura('Supreme Intellect') ? 1.1 : 1;
    }

    function formatNum(n) { return Math.floor(n).toLocaleString(); }
    function probRound(x, cap) {
      if (cap <= 0) return 0;
      var n = Math.floor(x) + (Math.random() < (x % 1) ? 1 : 0);
      return Math.min(cap, Math.max(0, n));
    }
    function formatDuration(sec) {
      if (sec <= 0) return 'Instant';
      if (sec < 60) return sec + ' sec';
      if (sec < 3600) return Math.round(sec / 60) + ' min';
      if (sec < 86400) { var h = sec / 3600; return (h % 1 ? h.toFixed(1) : h) + ' hour' + (h >= 2 ? 's' : ''); }
      var d = Math.round(sec / 86400); return d + ' day' + (d > 1 ? 's' : '');
    }
    function formatRemaining(sec) {
      sec = Math.max(0, Math.floor(sec));
      if (sec === 0) return '0s';
      var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      var parts = [];
      if (h > 0) parts.push(h + 'h');
      if (m > 0) parts.push(m + 'm');
      if (s > 0 || parts.length === 0) parts.push(s + 's');
      return parts.join(' ');
    }

    var PROMOTE_RATE = [0.50, 0.35, 0.20, 0.10];
    var PROMOTION_FAIL_CHANCE = 0.1;
    var QUIT_RATE_PER_MIN = [0.25/60, 0.15/60, 0.08/60, 0.028/60, 0.007/60];
    var COMMIT_QUIT_MULT_LOW = 4.4;
    var REFERRAL_RATE = [0.05, 0.15, 0.8, 2.0, 4.5];
    var REF_HYPE_MID = 650;
    var REF_HYPE_CAP = 1.3;
    var REF_WOM_MIN = 1;
    var REF_WOM_MAX = 12.0;
    var REF_PLAYER_COUNT_EXP = 0.78;
    var PLAYER_WEIGHT = [0.17, 0.4, 1.0, 3.0, 5.5];
    var HYPE_DECAY = -3.7 / 600;
    var COMMITMENT_DECAY = -2.4 / 600;
    var REFERRAL_DECAY = -1.9 / 600;
    var DECAY_MULT_LOW = 0.8;
    var DECAY_MULT_HIGH = 12;
    var REPUTATION_REGEN = 3 / 600;
    var REP_REGEN_MULT_LOW = 6;
    var QUIT_CASCADE_DAB = [0, 0, 2, 15, 65];
    var QUIT_CASCADE_CAS = [0, 0, 0, 2, 8];
    var QUIT_CASCADE_HAB = [0, 0, 0, 0, 1];  
    var QUIT_TICKER_NAMES = ['LeetGriffion', 'NyanDog', 'Lock8164', 'LuckyGlod', 'Ragoon', 'Lo the Cleric', 'Le Flower', 'HeavenDude', 'Phylexx', 'Dorky', 'CandidShadow', 'Infamous555'];
    var QUIT_TICKER_HEADLINES = [
      function (name) { return name + ' says no more clicking for me it just isn\'t as fun as it used to be.'; },
      function (name) { return name + ' hangs up their clicking finger, several players follow them out the door.'; },
      function (name) { return 'Community legend ' + name + ' quits playing in frustration many quit in solidarity.'; }
    ];
    var CASUAL_CHANCE = 0.15;
    var BONUS_CAP = 150;
    var BONUS_K = 4.5;
    var BONUS_POW = 0.23;
    var BONUS_HYPE_EXP = 0.7;
    var BONUS_COMMIT_EXP = 0.8;

    function getMaxSlots(level) {
      return Math.min(10, Math.max(1, level));
    }
    function getEffectiveMaxSlots() {
      var max = getMaxSlots(G.fractalLevel);
      return hasBoredomEffect('slots_half') ? Math.max(1, Math.ceil(max / 2)) : max;
    }

    var TYPES = ['dabbler', 'casual', 'habitual', 'devotee', 'fanatic'];
    var BOREDOM_MAX = 100;
    var LAST_ACTIONS_CAP = 25; 
    var BOREDOM_ICONS_MAIN = [ [12,8], [11,6], [11,7], [11,8], [29,6] ];
    var BOREDOM_EFFECT_IDS = [
      'quit_2x', 'hype_commit_drain_3x', 'referrals_negative', 'cost_double', 'slots_half',
      'rep_drains', 'boost_third_less', 'no_unique', 'promotion_reverse', 'rep_penalty_20',
      'unlocks_reset', 'hype_cap_half', 'commitment_cap_half', 'actions_25_less',
      'negative_effects_2x', 'positive_effects_half'
    ];
    var BOREDOM_EFFECT_NAMES = {
      quit_2x: 'Players are twice as likely to quit',
      hype_commit_drain_3x: 'Commitment and Hype idle drain are tripled',
      referrals_negative: 'Word of mouth works negatively',
      cost_double: 'Cost of actions are doubled',
      slots_half: 'Action slots are reduced by half (rounded up)',
      rep_drains: 'Reputation drains over time instead of increasing',
      boost_third_less: 'Boost is reduced by a third',
      no_unique: 'No unique actions may be used',
      promotion_reverse: 'Players are demoted instead of promoted',
      rep_penalty_20: 'Reputation damage penalties are increased by 20%',
      unlocks_reset: 'All permanent unlocks are reset and must be unlocked again',
      hype_cap_half: 'Hype bar is maxed at half',
      commitment_cap_half: 'Commitment bar is maxed at half',
      actions_25_less: 'All actions last 25% less',
      negative_effects_2x: 'All negative action effects are doubled',
      positive_effects_half: 'All positive action effects are halved'
    };
    function hasBoredomEffect(id) {
      return G.activeBoredomEffects && G.activeBoredomEffects.indexOf(id) >= 0;
    }
    function updateBoredomEffects() {
      var b = Math.min(BOREDOM_MAX, Math.max(0, G.boredom));
      var desiredCount = Math.min(5, Math.floor(b / 20));
      
      if (b < 20) {
        G.activeBoredomEffects = [];
        return;
      }
      var currentClockHour = Math.floor(Date.now() / 3600000);
      var isNewHour = G.activeBoredomEffects.length === 0 || G.boredomEffectHour !== currentClockHour;

      if (isNewHour) {
        G.boredomEffectHour = currentClockHour;
        var list = BOREDOM_EFFECT_IDS.slice();
        G.activeBoredomEffects = [];
        for (var i = 0; i < desiredCount && list.length > 0; i++) {
          var idx = Math.floor(Math.random() * list.length);
          G.activeBoredomEffects.push(list[idx]);
          list.splice(idx, 1);
        }
        if (G.activeBoredomEffects.indexOf('unlocks_reset') >= 0) G.unlocked = {};
        return;
      }
      
      var list = G.activeBoredomEffects.slice();
      var hadUnlocksReset = list.indexOf('unlocks_reset') >= 0;
      while (list.length > desiredCount) {
        var idx = Math.floor(Math.random() * list.length);
        list.splice(idx, 1);
      }
      while (list.length < desiredCount) {
        var available = BOREDOM_EFFECT_IDS.filter(function (id) { return list.indexOf(id) < 0; });
        if (available.length === 0) break;
        var pick = available[Math.floor(Math.random() * available.length)];
        list.push(pick);
      }
      G.activeBoredomEffects = list;
      if (list.indexOf('unlocks_reset') >= 0 && !hadUnlocksReset) G.unlocked = {};
    }
    function totalPlayers() {
      var p = G.players;
      return p.dabbler + p.casual + p.habitual + p.devotee + p.fanatic;
    }


    function repMult() {
      var repPct = Math.min(1, Math.max(0, G.reputation / BAR_MAX));
      var rm = 1 + Math.pow(1 - repPct, 2) * 49;
      return hasBoredomEffect('rep_penalty_20') ? rm * 1.2 : rm;
    }

    function getRefRates() { return (G.refRates && G.refRates.length === 5) ? G.refRates : REFERRAL_RATE; }
    function getRefHypeMid() { return G.refHypeMid != null ? G.refHypeMid : REF_HYPE_MID; }
    function getRefHypeCap() { return G.refHypeCap != null ? G.refHypeCap : REF_HYPE_CAP; }
    function getRefWomMin() { return G.refWomMin != null ? G.refWomMin : REF_WOM_MIN; }
    function getRefWomMax() { return G.refWomMax != null ? G.refWomMax : REF_WOM_MAX; }
    function getRefPlayerCountExp() { return G.refPlayerCountExp != null ? G.refPlayerCountExp : REF_PLAYER_COUNT_EXP; }
    function referralRate() {
      if (G.hype <= 0) return 0;
      var refRates = getRefRates();
      var hypeMid = getRefHypeMid();
      var hypeCap = getRefHypeCap();
      var womMin = getRefWomMin();
      var womMax = getRefWomMax();
      var countExp = getRefPlayerCountExp();
      
      // 1. Base rate from player tiers
      var p = G.players, totalPlayers = 0, weightedRate = 0;
      for (var i = 0; i < 5; i++) {
        totalPlayers += p[TYPES[i]];
        weightedRate += p[TYPES[i]] * refRates[i];
      }
      if (totalPlayers > 0) weightedRate = weightedRate * Math.pow(totalPlayers, countExp - 1);
      var basePerSec = weightedRate / 3600;
      
      // 2. Hype multiplier
      var hypeMult = Math.min(hypeCap, G.hype / hypeMid);
      
      // 3. Word of Mouth bar
      var womPct = Math.min(1, Math.max(0, G.referrals / BAR_MAX));
      var womMult = womMin + (womMax - womMin) * womPct;
      
      var rate = basePerSec * hypeMult * womMult;
      return hasBoredomEffect('referrals_negative') ? -Math.abs(rate) : rate;
    }

    function weightedPlayers() {
      var p = G.players, w = 0, weights = (G.playerWeight && G.playerWeight.length === 5) ? G.playerWeight : PLAYER_WEIGHT;
      for (var i = 0; i < 5; i++) w += p[TYPES[i]] * weights[i];
      return w;
    }

    function applyPromotions(dt) {
      var hypeCap = hasBoredomEffect('hype_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var hypePct = Math.min(1, Math.max(0, (G.hype || 0) / hypeCap));
      var commitPct = Math.min(1, Math.max(0, (G.commitment || 0) / commitCap));
      var scale = Math.pow(hypePct, 0.5) * Math.pow(commitPct, 1.0); 
      var p = G.players;
      if (hasBoredomEffect('promotion_reverse')) {
        if (scale <= 0) return;
        for (var i = 3; i >= 0; i--) {
          var from = TYPES[i + 1], to = TYPES[i];
          var moved = probRound(p[from] * (PROMOTE_RATE[i] / 3600) * scale * dt, p[from]);
          p[from] -= moved;
          p[to] += moved;
        }
      } else {
        if (scale <= 0) return;
        for (var i = 0; i < 4; i++) {
          var from = TYPES[i], to = TYPES[i + 1];
          var moved = probRound(p[from] * (PROMOTE_RATE[i] / 3600) * scale * dt, p[from]);
          if (moved <= 0) continue;
          var promotedCount = probRound(moved * (1 - PROMOTION_FAIL_CHANCE), moved);
          var demotedCount = moved - promotedCount;
          p[from] -= moved;
          p[to] += promotedCount;
          if (i > 0) p[TYPES[i - 1]] += demotedCount; else p[from] += demotedCount;
        }
      }
    }

    function applyQuits(dt) {
      var rm = repMult(), p = G.players;
      if (hasBoredomEffect('quit_2x')) rm *= 2;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitPct = Math.min(1, (G.commitment || 0) / commitCap);
      var commitMult = 1 + (1 - commitPct) * (COMMIT_QUIT_MULT_LOW - 1);
      var minutes = dt / 60;
      for (var i = 4; i >= 0; i--) {
        var count = p[TYPES[i]];
        var expectedQuits = count * QUIT_RATE_PER_MIN[i] * rm * commitMult * minutes;
        var lost = probRound(expectedQuits, count);
        p[TYPES[i]] -= lost;
        if (lost > 0) {
          var dabLost = Math.min(p.dabbler, lost * QUIT_CASCADE_DAB[i]);
          var casLost = Math.min(p.casual, lost * QUIT_CASCADE_CAS[i]);
          var habLost = Math.min(p.habitual, lost * QUIT_CASCADE_HAB[i]);
          p.dabbler -= dabLost;
          p.casual -= casLost;
          p.habitual -= habLost;
          if (i >= 3 && QUIT_TICKER_HEADLINES[i - 2]) {
            var name = QUIT_TICKER_NAMES[Math.floor(Math.random() * QUIT_TICKER_NAMES.length)];
            if (i === 3 && Math.random() >= 0.2) continue;
            addHeadlineToTickerPool(QUIT_TICKER_HEADLINES[i - 2](name));
          }
        }
      }
    }

    var HYPE_COMMIT_REGEN_RATE = 1 / 300;
    var HYPE_COMMIT_FLOOR = 50;

    function applyDecay(dt) {
      var rm = repMult();

      var hypeChange, commitChange;
      if (G.hype <= HYPE_COMMIT_FLOOR) {
        hypeChange = Math.min(HYPE_COMMIT_REGEN_RATE * dt, HYPE_COMMIT_FLOOR - G.hype);
      } else {
        var hypePct = G.hype / BAR_MAX;
        var hypeMult = DECAY_MULT_LOW + (DECAY_MULT_HIGH - DECAY_MULT_LOW) * hypePct;
        hypeChange = HYPE_DECAY * hypePct * hypeMult * rm * dt;
      }
      if (G.commitment <= HYPE_COMMIT_FLOOR) {
        commitChange = Math.min(HYPE_COMMIT_REGEN_RATE * dt, HYPE_COMMIT_FLOOR - G.commitment);
      } else {
        var commitPct = G.commitment / BAR_MAX;
        var commitMult = DECAY_MULT_LOW + (DECAY_MULT_HIGH - DECAY_MULT_LOW) * commitPct;
        commitChange = COMMITMENT_DECAY * commitPct * commitMult * rm * dt;
      }
      var refPct = G.referrals / BAR_MAX;
      var refMult = DECAY_MULT_LOW + (DECAY_MULT_HIGH - DECAY_MULT_LOW) * refPct;
      var refChange = REFERRAL_DECAY * refPct * refMult * rm * dt;

      var hypeMult = hasBoredomEffect('hype_commit_drain_3x') ? 3 : 1;
      var hypeCap = hasBoredomEffect('hype_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      G.hype       = clamp(G.hype       + hypeChange * hypeMult,   0, hypeCap);
      G.commitment = clamp(G.commitment + commitChange * hypeMult, 0, commitCap);
      G.referrals  = clamp(G.referrals  + refChange,    0, BAR_MAX);
      if (hasBoredomEffect('rep_drains')) {
        var repDrainMult = 1 + (1 - G.reputation / BAR_MAX) * (REP_REGEN_MULT_LOW - 1);
        G.reputation = clamp(G.reputation - REPUTATION_REGEN * repDrainMult * 3 * dt, 0, BAR_MAX);
      } else {
        var repRegenMult = 1 + (1 - G.reputation / BAR_MAX) * (REP_REGEN_MULT_LOW - 1);
        G.reputation = clamp(G.reputation + REPUTATION_REGEN * repRegenMult * dt, 0, BAR_MAX);
      }
    }

    function applyPlayerEffect(perMin, dt) {
      var perSec = perMin / 60;
      if (perSec > 0) {
        G.pendingNewPlayers += perSec * dt;
      } else {
        var loss = probRound(-perSec * dt, totalPlayers());
        for (var i = 0; i < loss; i++) {
          for (var t = 0; t < 5; t++) { if (G.players[TYPES[t]] > 0) { G.players[TYPES[t]]--; break; } }
        }
      }
    }

    function applyEffects(e, dt) {
      var negMult = hasBoredomEffect('negative_effects_2x') ? 2 : 1;
      var posMult = hasBoredomEffect('positive_effects_half') ? 0.5 : 1;
      function scale(v) { return v == null ? 0 : (v < 0 ? v * negMult : v * posMult); }
      if (e.players) applyPlayerEffect(scale(e.players), dt);
      var m = dt / 60;
      var hypeCap = hasBoredomEffect('hype_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      if (e.hype)   G.hype   = clamp(G.hype   + scale(e.hype)   * m, 0, hypeCap);
      if (e.commitment) G.commitment = clamp(G.commitment + scale(e.commitment) * m, 0, commitCap);
      if (e.referrals)  G.referrals  = clamp(G.referrals  + scale(e.referrals)  * m, 0, BAR_MAX);
      if (e.reputation) G.reputation = clamp(G.reputation + scale(e.reputation) * m, 0, BAR_MAX);
    }

    function flushNewPlayers() {
      while (G.pendingNewPlayers >= 1) {
        G.players[Math.random() < CASUAL_CHANCE ? 'casual' : 'dabbler']++;
        G.pendingNewPlayers--;
      }
      while (G.pendingNewPlayers <= -1 && totalPlayers() > 0) {
        for (var t = 0; t < 5; t++) {
          if (G.players[TYPES[t]] > 0) { G.players[TYPES[t]]--; break; }
        }
        G.pendingNewPlayers++;
      }
      if (G.pendingNewPlayers < 0) G.pendingNewPlayers = 0;
    }

    function clampAll() {
      var hypeCap = hasBoredomEffect('hype_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      G.hype   = clamp(G.hype,   0, hypeCap);
      G.commitment = clamp(G.commitment, 0, commitCap);
      G.referrals  = clamp(G.referrals,  0, BAR_MAX);
      G.reputation = clamp(G.reputation, 0, BAR_MAX);
      for (var i = 0; i < 5; i++) G.players[TYPES[i]] = Math.max(0, G.players[TYPES[i]]);
    }

    var EFFECT_KEYS = [['players','Players'], ['hype','Hype'], ['commitment','Commitment'], ['referrals','Word of Mouth'], ['reputation','Reputation'], ['boost','Boost']];
    function buildEffectLines(effects) {
      var lines = [];
      for (var i = 0; i < EFFECT_KEYS.length; i++) {
        var k = EFFECT_KEYS[i][0], v = effects[k];
        if (!v) continue;
        var text = EFFECT_KEYS[i][1] + ' ' + (v > 0 ? '+' : '') + v + (k === 'boost' ? '% (while active)' : '/min');
        lines.push({ text: text, positive: v > 0 });
      }
      lines.sort(function (a, b) { return (a.positive === b.positive) ? 0 : (a.positive ? -1 : 1); });
      return lines;
    }


    DownlineM.updateLumpBoostState = function() {
      var now = Date.now();
      var wasActive = lumpBoostState.active;
      lumpBoostState.active = G.lumpSpeedBoostEnd && now < G.lumpSpeedBoostEnd;
      if (wasActive !== lumpBoostState.active) DownlineM.updateTickerSpeed();
    };

    DownlineM.updateTickerSpeed = function() {
      var tickerWrap = document.querySelector('.downline-ticker-wrap');
      if (tickerWrap) tickerWrap.classList.toggle('sugar-rush', lumpBoostState.active);
    };


    function statValue(stat) {
      if (stat === 'players') return totalPlayers();
      if (stat === 'referralsPerHour') return referralRate() * 3600;
      if (G.players && G.players[stat] !== undefined) return G.players[stat] || 0;
      return G[stat] || 0;
    }
    function conditionsMet(conds) {
      if (!conds || !conds.length) return true;
      for (var i = 0; i < conds.length; i++) {
        var c = conds[i], v = statValue(c.stat);
        if (c.min != null && v < c.min) return false;
        if (c.max != null && v > c.max) return false;
      }
      return true;
    }
    function unlockText(def) {
      var labels = { players:'Players', hype:'Hype', commitment:'Commitment', referrals:'Word of Mouth', referralsPerHour:'Word of Mouth per hour', reputation:'Reputation', dabbler:'Dabbler players', casual:'Casual players', habitual:'Habitual players', devotee:'Devotee players', fanatic:'Fanatic players' };
      function formatUnlockLines(conds, isPermanent) {
        if (!conds || !conds.length) return [];
        var byStat = {};
        for (var i = 0; i < conds.length; i++) {
          var c = conds[i];
          var s = c.stat;
          if (!byStat[s]) byStat[s] = [];
          byStat[s].push(c);
        }
        var lines = [];
        for (var stat in byStat) {
          var list = byStat[stat];
          var label = labels[stat] || stat;
          var min = null, max = null;
          for (var j = 0; j < list.length; j++) {
            var c = list[j];
            if (c.min != null) min = min == null ? c.min : Math.max(min, c.min);
            if (c.max != null) max = max == null ? c.max : Math.min(max, c.max);
          }
          if (min != null && max != null) {
            lines.push(label + ' between ' + formatNum(min) + ' and ' + formatNum(max));
          } else if (min != null) {
            if (isPermanent) lines.push(formatNum(min) + ' ' + label);
            else lines.push(label + ' at least ' + formatNum(min));
          } else if (max != null) {
            lines.push(label + ' below ' + formatNum(max));
          }
        }
        return lines;
      }
      function formatUnlockBlock(lines, isPermanent) {
        if (!lines || !lines.length) return '';
        if (lines.length === 1) {
          return isPermanent ? ('Unlocked at ' + lines[0]) : ('Requires ' + lines[0]);
        }
        var header = isPermanent ? 'Unlocks At:' : 'Requires:';
        return header + '\n' + lines.join('\n');
      }
      var permLines = def.unlock.conditions && def.unlock.conditions.length ? formatUnlockLines(def.unlock.conditions, true) : [];
      var tempLines = def.unlock.tempConditions && def.unlock.tempConditions.length ? formatUnlockLines(def.unlock.tempConditions, false) : [];
      return { perm: formatUnlockBlock(permLines, true), temp: formatUnlockBlock(tempLines, false) };
    }
    function buildUnlockTooltipHtml(def) {
      if (!def || !def.unlock) return '';
      var parts = unlockText(def);
      var bits = [];
      function nlToBr(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); }
      if (parts.perm && !(def.isUnlocked && def.isUnlocked())) {
        bits.push('<span class="red">' + nlToBr(parts.perm) + '</span>');
      }
      if (parts.temp) {
        var tempMet = conditionsMet(def.unlock.tempConditions);
        bits.push('<span class="' + (tempMet ? 'green' : 'red') + '">' + nlToBr(parts.temp) + '</span>');
      }
      return bits.join('<br><br>');
    }

    var ACTIONS = {};
    var ACTION_LIST = [
      { name: 'Put up posters at school', icon: [15,9], durationSec: 10 * 60, costCps: 1 * 60,
        desc: 'Hand-drawn flyers on every bulletin board in school advertising Cookie Clicker.',
        flavor: 'After an emergency PTA meeting the schoolboard has determined Cookie Clicker is in fact not educational.',
        unlock: { conditions: [] },
        effects: { players: 1 },
        headline: 'Local schools plastered with new cookie game flyers' },

      { name: 'Run newspaper ad', icon: [27,7], durationSec: 45 * 60, costCps: 10 * 60,
        desc: 'Full-page spread in the local papers. Reaches a broad audience of people who still read newspapers.',
        flavor: "We have mastered the art of reaching the 6 people currently subscribed to this newspaper.",
        unlock: { conditions: [{ stat: 'players', min: 15 }] },
        effects: { players: 2},
        headline: 'Natural Expansion Gazette runs full-page Cookie Clicker ad — a game where players just click a cookie?' },

      { name: 'Door to door grandmas', icon: [10,9], durationSec: 60 * 60, costCps: 18 * 60,
      desc: 'Send your grandmas door to door to recruit players directly. It isn\'t going to help your coolness factor but it\'s more effective than you think.',
      flavor: 'Grandmas calling, you wouldn\'t leave us out here all cold and alone would you?',
      unlock: { conditions: [{ stat: 'players', min: 35 }] },
      effects: { players: 3, commitment: 1, hype: -1 },
      headline: 'Packs of grandmas seen wandering from door to door, handing out flyers for something about cookies' },

      { name: '4chan Post', icon: [15,6], durationSec: 90 * 60, costCps: 8 * 60,
        desc: 'Surprisingly effective recruitment, but you are now associated with 4chan which isn\'t great.',
        flavor: 'Hey it worked for Orteil right?',
        unlock: { conditions: [{ stat: 'players', min: 100 }] },
        effects: { players: 5, reputation: -1.5 },
        headline: '4chan still has a userbase, more news at 10pm' },

      { name: 'Buy billboards', icon: [29,1], durationSec: 90 * 60, costCps: 18 * 60,
        desc: 'Plaster the highways with Cookie Clicker billboards.',
        flavor: 'Traffic jams and idle games are a dangerous combo.',
        unlock: { conditions: [{ stat: 'players', min: 125 }] },
        effects: { players: 5, commitment: -2, hype: 1 },
        headline: 'Delicious looking cookie billboards draw people to drive-throughs across the country' },
      
        { name: 'Sponsor influencers', icon: [10,14], sheet: 'custom', durationSec: 5 * 60 * 60, costCps: 90 * 60,
        desc: 'Pay content creators to pretend they discovered your game organically.',
        flavor: 'This is truly a product I use every day and I\'m not just saying that because they are paying me to. #NotSponsored).',
        unlock: { conditions: [{ stat: 'players', min: 250 }], tempConditions: [{ stat: 'hype', min: 150 }] },
        effects: { players: 9, reputation: -3, hype: 1, referrals: 2 },
        headline: '#NotSponsored cookie game videos garner nationwide attention' },

        { name: 'National TV spot', icon: [28,22], durationSec: 4 * 60 * 60, costCps: 120 * 60,
        desc: 'Prime-time TV commercial spot.',
        flavor: 'Players will flock to your game until the next commercial break that is.',
        unlock: { conditions: [{ stat: 'players', min: 350 }], tempConditions: [{ stat: 'reputation', min: 750 }] },
        effects: { players: 10, commitment: -2, reputation: -1 },
        headline: 'New cookie themed TV commercial airs - not as viral as hoped' },
      
      { name: 'Popup ads', icon: [0,0], durationSec: 2 * 60 * 60, costCps: 30 * 60,
        desc: 'Aggressive browser popups. Effective but universally despised.',
        flavor: "Hate-downloading new games since 2013.",
        unlock: { conditions: [{ stat: 'players', min: 450 }] },
        effects: { players: 12, reputation: -3, referrals: -1},
        headline: 'Aggressive popup campaign sparks backlash, local player states "One more ad and I\'m going postal"' },
      
        { name: 'Direct mailing', icon: [7,16], sheet: 'custom', durationSec: 3 * 60 * 60, costCps: 36 * 60,
        desc: 'Cost effective spam the old fashioned way right into the tin mailbox.',
        flavor: "Studies have shown that 93% of people don\'t even open the letter.",
        unlock: { conditions: [{ stat: 'players', min: 600 }], tempConditions: [{ stat: 'hype', min: 125 }] },
        effects: { players: 14, reputation: -2, hype: -2, referrals: -1 },
        headline: 'Cookie Clicker mailers hit mailboxes across the country — in unrelated news paper recycling quotas are up' },

      { name: 'Space billboard', icon: [11,5], durationSec: 24 * 60 * 60, costCps: 12 * 60 * 60,
        desc: 'Orbital advertising platform visible from the ground everywhere whether you want to see it or not. The future is now.',
        flavor: 'Great advertising but people seem to miss seeing the moon and stars.',
        unlock: { conditions: [{ stat: 'players', min: 1500 }], tempConditions: [{ stat: 'reputation', min: 950 }] },
        effects: { players: 18, hype: 3, reputation: -5},
        headline: 'Orbital ad platform blocks moon, astronomers baffled at who would have approved this' },
     
      { name: 'Bug fixes', icon: [18,8], durationSec: 30 * 60, costCps: 10 * 60,
        desc: 'Squashing those bugs while not admitting they existed in the first place.',
        flavor: "Assorted bug fixes and improvements... players are slightly less frustrated now.",
        unlock: { conditions: [{ stat: 'players', min: 5 }] },
        effects: { commitment: 1 },
        headline: 'Developers fix bugs exactly like they are supposed to - why is this a news headline who is moderating this thing?' },

      { name: 'New content', icon: [22,29], durationSec: 1 * 60 * 60, costCps: 60 * 60,
        desc: 'Dropping new features is the best way to keep people playing.',
        flavor: "Patch notes: New upgrade pop 100,000 wrinklers for chance of drop. This will keep them busy for a while.",
        unlock: { conditions: [{ stat: 'players', min: 20 }] },
        effects: { hype: 1.5, commitment: 1, reputation: -1},
        headline: 'New cookie clicker content hits the game, users are very whelmed' },

      { name: 'Add easter eggs', icon: [13,12], durationSec: 1 * 60 * 60, costCps: 20 * 60,
        desc: 'Hidden surprises that reward the curious, so well hidden sometimes players never even find them.',
        flavor: "If an easter egg drops in the game and no one ever finds it, does it really even exist?",
        unlock: { conditions: [{ stat: 'commitment', min: 75 }] },
        effects: { hype: 2.5, players: -1 },
        headline: 'Rumors of new hidden items in Cookie Clicker — Players excited at least the ones who don\'t quit in frustration are' },

      { name: 'Add minigame', icon: [18,33], durationSec: 4 * 60 * 60, costCps: 150 * 60,
        desc: 'People love minigames! though we have found some people get confused by them and wander off to play Minecraft instead.',
        unique: true,
        flavor: 'A You minigame sounds like an easy project, or at least it did...',
        unlock: { conditions: [{ stat: 'hype', min: 100 }, { stat: 'commitment', min: 100 }], tempConditions: [{ stat: 'players', min: 100 }] },
        effects: { hype: 1, commitment: 1, players: -3, reputation: 1},
        headline: 'New minigame inside cookie game — Players clamor for game within a game concept' },

      { name: 'Improve modding support', icon: [16,5], durationSec: 2 * 60 * 60, costCps: 35 * 60,
        desc: 'Let the community build for you. Free labor disguised as empowerment. Huh… naw i\'m not going to read into that too much.',
        flavor: 'The easier the game is to mod the more people will mod it. The problem is everyone ends up playing a different version of the game.',
        unlock: { conditions: [{ stat: 'players', min: 75 }, { stat: 'commitment', min: 75 }] },
        effects: { hype: 2, commitment: -1 },
        headline: 'Modder exclaims "we can do anything now!" before realizing they can\'t do much of anything' },

      { name: 'Engine optimization', icon: [8,0], durationSec: 1 * 60 * 60, costCps: 25 * 60,
        desc: 'Make it run smooth on a potato. Performance is a feature.',
        flavor: 'If it runs on a 2004 Dell, it runs anywhere.',
        unlock: { conditions: [{ stat: 'players', min: 50 }] },
        effects: { players: 1, commitment: 1, referrals: -1 },
        headline: 'Cookie Clicker now runs on actual potatoes — "silky smooth, but why?"' },

      { name: 'Improve graphics', icon: [13,0], durationSec: 1.5 * 60 * 60, costCps: 35 * 60,
        desc: 'Shiny new pixels, not a lot of them granted but the couple that were added are really nice looking.',
        flavor: 'Still 2D. Still beautiful.',
        unlock: { conditions: [{ stat: 'players', min: 100 }, { stat: 'commitment', min: 100 }] },
        effects: { hype: 2, commitment: 1, players: -1.5},
        headline: 'Visual overhaul hits the market — still pixelated, still just perfect' },
      

      { name: 'Publish roadmap', icon: [13,17], sheet: 'custom', durationSec: 2 * 60 * 60, costCps: 10 * 60,
        desc: 'Share the vision. Better hope you can keep these deadlines though or players might come after you.',
        flavor: 'Coming this year. Maybe next year, or in 11 years. We believe in transparency.',
        unlock: { conditions: [{ stat: 'commitment', min: 125 }] },
        effects: { hype: 4, commitment: -1.5, players: -1 },
        headline: 'Roadmap excites community — "but where the hell are dungeons?"' },

        { name: 'Document bugs', icon: [8,17], sheet: 'custom', durationSec: 4 * 60 * 60, costCps: 75 * 60,
        desc: 'Building a list of bugs is a good thing until people read the list of bugs and get discouraged by them.',
        flavor: 'If a bug is used long enough, does it become part of the game itself?',
        unlock: { conditions: [{ stat: 'commitment', min: 200 }], tempConditions: [{ stat: 'hype', min: 200 }] },
        effects: { hype: -3.5, commitment: 3, reputation: 2, players: -3, referrals: -1},
        headline: 'Players discover massive bug list hidden in plain sight within Discord Bugs and Glitches Channel' },
    
      { name: 'Leave in fun exploits', icon: [23, 7], durationSec: 6 * 60 * 60, costCps: 90 * 60,
        desc: 'Patch all the bugs, well not that one, or that one either.',
        flavor: 'Some bugs make the game more fun, not everyone agrees though.',
        unlock: { conditions: [{ stat: 'players', min: 75 }, { stat: 'hype', min: 100 }] },
        effects: { players: -2, reputation: -1, commitment: -2, hype: 6 },
        headline: 'Cookie Clicker "exploit" patches divide community' },

        { name: 'Localize content', icon: [17,16], sheet: 'custom', durationSec: 2 * 60 * 60, costCps: 75 * 60,
        desc: 'Translate the game into new languages.',
        flavor: 'Cookies now in Elvish, Klingon, Dothraki, Na\'vi, and Parseltongue',
        unlock: { conditions: [{ stat: 'players', min: 200 }, { stat: 'reputation', min: 400 }], tempConditions: [{ stat: 'hype', min: 150 }] },
        effects: { players: 2, reputation: 1, commitment: 1, hype: -2 },
        headline: 'Cookie Clicker now runs in Elvish and Parseltongue, more critical langauges being added soon says developer' },

      { name: 'Add accessibility', icon: [28,26], durationSec: 1.5 * 60 * 60, costCps: 90 * 60,
        desc: 'Screen readers, contrast options, and input alternatives. The right thing to do.',
        flavor: 'Everyone should be able to click cookies. It\'s in the Constitution. Somewhere, after the part about not quartering soldiers I think.',
        unlock: { conditions: [{ stat: 'players', min: 50 }, { stat: 'reputation', min: 250 }], tempConditions: [{ stat: 'hype', min: 150 }] },
        effects: { reputation: 3, hype: -2, commitment: -1 },
        headline: 'Cookie Clicker accessibility update universally praised — "they really do care about the differently abled"' },
     
       { name: 'Port to new platform', icon: [5,0], durationSec: 8 * 60 * 60, costCps: 4 * 60 * 60,
        desc: 'Launch on a new system. Big player influx; existing community commitment dips due to fragmentation of gameplay.',
        flavor: 'Now on iOS? Nope we are releasing it on Samsung Branded Toasters, iOS soon though.',
        unlock: { conditions: [{ stat: 'players', min: 300 }], tempConditions: [{ stat: 'hype', min: 250 }, { stat: 'commitment', min: 250 }] },
        effects: { players: 30, commitment: -5 },
        headline: 'Cookie Clicker now available on iOS nope strike that it\'s available on Smart Mattresses' },

        { name: 'Post Memes', icon: [27,21], durationSec: 1 * 60 * 60, costCps: 12 * 60,
        desc: "Viral content. Low effort, high reach. The loss of Xennial players is more than made up for by the new zoomers.",
        flavor: "67 or whatever right?",
        unlock: { conditions: [{ stat: 'players', min: 20 }], tempConditions: [{ stat: 'hype', min: 75 }] },
        effects: { players: 3, hype: 2, referrals: 1,  reputation: -2},
        headline: "Cookie memes flood social media some call it spam others call it content" },
     
      { name: 'Reddit AMA', icon: [8,10], durationSec: 2 * 60 * 60, costCps: 45 * 60,
        desc: 'Answer questions from the community. Transparency builds trust. Things can go a bit sideways with these things though.',
        flavor: "But why cookies?",
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 50 }], tempConditions: [{ stat: 'reputation', min: 350 }] },
        effects: { hype: 1, reputation: 2, commitment: -2 },
        headline: 'Developers answer thousands of questions on Reddit' },

        { name: 'Announce dungeons coming soon', icon: [11,6], durationSec: 1 * 60 * 60, costCps: 12 * 60,
        desc: 'When hype begins to die off just announce Dungeons minigame is almost ready to release, the hype will overcome the eventual disappointment.',
        flavor: 'Soon\u2122. No, the other Soon. I wonder how much longer this joke can last.',
        unlock: { conditions: [{ stat: 'players', min: 50 }], tempConditions: [{ stat: 'reputation', min: 700 }] },
        effects: { hype: 3, commitment: -1, reputation: -1 },
        headline: 'Dungeons teaser divides community — hype and skepticism' },

      { name: 'Sponsor leaderboard contest', icon: [29,21], durationSec: 4 * 60 * 60, costCps: 80 * 60,
        desc: 'Competitive events that push players toward the good kind of fighting.',
        flavor: 'I hope you banned cheaters first or this is going to be a huge mess.',
        unlock: { conditions: [{ stat: 'players', min: 150 }, { stat: 'hype', min: 125 }] },
        effects: { players: -1.5, hype: -1, commitment: 3 },
        headline: 'Leaderboard contest sparks fierce competition — "I will be number one" says several dozen different players' },

        { name: 'Mascot mall appearance', icon: [18,0], durationSec: 3 * 60 * 60, costCps: 35 * 60,
        desc: 'Send in the slightly creepy guy in the giant kitten outfit.',
        flavor: "He has a little dance he does and everything",
        unlock: { conditions: [{ stat: 'players', min: 100 }, { stat: 'hype', min: 100 }] },
        effects: { players: 4, reputation: 2, hype: -2, commitment: -1, referrals: 1 },
        headline: 'Kitten mascot waves at shoppers — wholesome but forgettable' },
    
        { name: 'Ban cheaters', icon: [1,7], durationSec: 1 * 60 * 60, costCps: 35 * 60,
        desc: 'Cheated cookies taste awful but some players like weird tasting things.',
        flavor: 'No one believes your level 42 bank, buddy.',
        unlock: { conditions: [{ stat: 'players', min: 60 }] },
        effects: { players: -2  , commitment: 1, reputation: 1 },
        headline: 'Mass ban wave hits cookie cheaters' },

        { name: 'Social media blitz', icon: [17,17], sheet: 'custom', durationSec: 2 * 60 * 60, costCps: 45 * 60,
        desc: 'Spam all the platforms with fake engagement posts',
        flavor: "Playing cookie clicker can add 5 years onto your life.",
        unlock: { conditions: [{ stat: 'players', min: 100 }, { stat: 'hype', min: 100 }] },
        effects: { players: 5, hype: 2, commitment: -2, boost: -3 },
        headline: 'Viral campaign floods feeds — everywhere we look it\'s the same cookie spam' },

        { name: 'Start rumors about competitors', icon: [17,5], durationSec: 4 * 60 * 60, costCps: 40 * 60,
        desc: "Whisper campaigns against rival games.",
        flavor: 'All\'s fair in love and cookies.',
        unlock: { conditions: [{ stat: 'players', min: 150 }], tempConditions: [{ stat: 'hype', min: 150 }, { stat: 'referrals', min: 200 }] },
        effects: { hype: 7, commitment: 2, reputation: -3, referrals: -3},
        headline: 'Rumors spread that Burger Clicker uses child labor and counterfeit pixels' },

        { name: 'Clickbait videos', icon: [1,33], durationSec: 3 * 60 * 60, costCps: 30 * 60,
        desc: "YOU WON'T BELIEVE what this cookie game does! (Number 7 will shock you)",
        flavor: 'Like and subscribe for part 4.',
        unlock: { conditions: [{ stat: 'players', min: 100 }, { stat: 'hype', min: 150 }] },
        effects: { players: 8, hype: 3, reputation: -2, commitment: -2 },
        headline: 'Clickbait videos are becoming a real problem — Top 10 ways to avoid them, you won\'t believe #7' },

        { name: 'After school cookie clubs', icon: [3,5], durationSec: 6 * 60 * 60, costCps: 40 * 60,
        desc: 'Target the youth demographic. Questionable ethics, undeniable results.',
        flavor: 'Parental consent sold separately.',
        unlock: { conditions: [{ stat: 'players', min: 75 }] },
        effects: { players: 7, hype: 1, reputation: -2 },
        headline: 'Cookie clubs spread to schools — parents ask questions but get few answers' },

        { name: 'Buy fake reviews', icon: [31,8], durationSec: 4 * 60 * 60, costCps: 28 * 60,
        desc: 'Five stars across the board. Suspiciously uniform praise.',
        flavor: "Best game ever — Let me know if you would like the review to sound more human.",
        unlock: { conditions: [{ stat: 'players', min: 250 }], tempConditions: [{ stat: 'reputation', max: 850 }] },
        effects: { players: 6, reputation: -2, hype: 2.5, commitment: -2 },
        headline: 'How to spot fake online reviews — Expose tonight at 9pm' },

        { name: 'Aggressively moderate negative reviews', icon: [21,30], durationSec: 2 * 60 * 60, costCps: 25 * 60,
        desc: "Silence the critics with prejudice",
        flavor: '1 star, deleted. 1 star, deleted. 1 star, deleted. Feeling better yet?',
        unlock: { conditions: [{ stat: 'players', min: 100 }], tempConditions: [{ stat: 'reputation', min: 300 }] },
        effects: { hype: 4, reputation: -2 },
        headline: 'Negative reviews vanish — "suspiciously positive" 5 star rating appears' },

      { name: 'Energy drink sponsorship', icon: [9,7], durationSec: 8 * 60 * 60, costCps: 60 * 60,
        desc: 'Brand deal with a caffeine giant.',
        flavor: 'Now with 200% of your daily sugar per serving, 4.5 servings per can.',
        unlock: { conditions: [{ stat: 'players', min: 150 }, { stat: 'hype', min: 100 }] },
        effects: { players: 6, commitment: 5, reputation: -3.5 },
        headline: 'Energy drink and Cookie Clicker partnership rolls out to skeptics' },

        { name: 'Referral rewards program', icon: [4, 0], durationSec: 6 * 60 * 60, costCps: 90 * 60,
        desc: 'Paying players to find more players. No way this one can go wrong.',
        flavor: 'What\'s the worst thing that could happen?',
        unlock: { conditions: [{ stat: 'players', min: 150 }, { stat: 'reputation', min: 300 }], tempConditions: [{ stat: 'reputation', min: 750 }] },
        effects: { referrals: 8, reputation: -2, commitment: -1, hype: -1},
        headline: 'Refer-a-friend rewards launch — "is it growth or bribery?" you decide' },

        { name: 'Player hypnosis', icon: [19,24], sheet: 'custom', durationSec: 3 * 60 * 60, costCps: 120 * 60,
        desc: 'Hypnosis really only works if you think it does, I wonder what percent of people believe in it.',
        flavor: "You are feeling sleepy so sleepy, no wait you are feeling clickly so clicky.",
        unlock: { conditions: [{ stat: 'players', min: 200 }, { stat: 'commitment', min: 100 }] },
        effects: { players: -2, commitment: 3, referrals: 3, reputation: -2 },
        headline: 'Hypnosis campaign sparks ethical concerns' },

       { name: 'Loot boxes', icon: [18,24], sheet: 'custom', durationSec: 4 * 60 * 60, costCps: 120 * 60,
        desc: 'No one will admit to liking loot boxes but they sure do work.',
        flavor: "Sudo gambling now in Cookie Clicker",
        unlock: { conditions: [{ stat: 'players', min: 400 }, { stat: 'commitment', min: 250 }] },
        effects: { players: -3, referrals: 5, reputation: -2, boost: 2 },
        headline: 'Loot boxes draw ire — some leave, others bring friends' },

        { name: 'Pay users to play', icon: [16,14], sheet: 'custom', durationSec: 8 * 60 * 60, costCps: 140 * 60,
        desc: 'Bribe players with real cookies. Wait, not those cookies.',
        flavor: "Cash for cookies program is a hit.",
        unlock: { conditions: [{ stat: 'players', min: 500 }], tempConditions: [{ stat: 'referrals', min: 250 }] },
        effects: { commitment: 5, referrals: -3, reputation: -1 },
        headline: 'Reports of paid Cookie Clicker actors — How involved is George Soros?' },

        { name: 'Pyramid Scam', icon: [13,13], sheet: 'custom', durationSec: 8 * 60 * 60, costCps: 180 * 60,
        desc: 'Each player just needs to recruit three more. Then each of those players will recruit 3 more.',
        flavor: "It's not a pyramid. It's a reverse funnel.",
        unlock: { conditions: [{ stat: 'players', min: 500 }, { stat: 'hype', min: 150 }], tempConditions: [{ stat: 'reputation', min: 800 }] },
        effects: { players: 12, referrals: 5, reputation: -7, commitment: 5, hype: -2},
        headline: 'Massive backlash on some sort of Cookie Pyramid Scam — Somehow didn\'t even involve edible cookies' },

        { name: 'Launch swag store', icon: [14,9], durationSec: 1.5 *  60 * 60, costCps: 90 * 60,
        desc: 'Sell cookie merch. Committed fans love it; critics call it commercialization and selling out.',
        flavor: 'People are actually buying shirts with pictures of grandmas on them, this is a real cash cow.',
        unique: true, 
        unlock: { conditions: [{ stat: 'players', min: 250 }, { stat: 'commitment', min: 150 }], tempConditions: [{ stat: 'commitment', min: 250 }] },
        effects: { commitment: 5, players: -2, reputation: -3, boost: 4},
        headline: 'Cookie Clicker swag store opens top seller a cookie keychain, wait that can\'t be right can it?' },

      { name: 'Private equity deal', icon: [15,0], durationSec: 10 * 60 * 60, costCps: 4 * 60 * 60,
        desc: 'Sell a stake for growth capital.',
        flavor: 'We didn\'t think we were making good decisions on our own so we brought in some money people to make even worse decisions.',
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 1000 }, { stat: 'reputation', min: 250 }] },
        effects: { reputation: -5, hype: 3, players: 5, boost: 4 },
        headline: 'Private equity takes slice of Cookie Clicker' },

        { name: 'Sell player data', icon: [29,6], durationSec: 6 * 60 * 60, costCps: 3 * 60 * 60,
        desc: 'Sell your users out and profit from their info.',
        flavor: "Oof this is going to be a hard one to come back from.",
        unique: true,
        unlock: { tempConditions: [{ stat: 'players', min: 1000 }] },
        effects: { reputation: -3, commitment: -2, players: -3, boost: 10 },
        headline: 'Data deal boosts margins — players and trust take a hit' },

        { name: 'Tax evasion', icon: [4,33], durationSec: 8 * 60 * 60, costCps: 150 * 60,
        desc: 'Creative accounting keeps more cookies in the jar. We aren\'t going to be paying our fair share, that much is for sure.',
        flavor: 'The only certainties: death and taxes, and there is some wiggle room with the latter.',
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 1000 }] },
        effects: { reputation: -4, players: -3, hype: 6, boost: 3},
        headline: 'Cookie Clicker tax strategy under scrutiny — IRS announces audit' },
    
        { name: 'Make game pay to play', icon: [13,14], sheet: 'custom', durationSec: 12 * 60 * 60, costCps: 8 * 60 * 60,
        desc: 'Paywall everything. Instant revenue, instant exodus.',
        flavor: 'Wow that really didn\'t go over well, who could have predicted that?',
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 500 }, { stat: 'commitment', min: 200 }] },
        effects: { players: -12, reputation: -7, commitment: 11, boost: 10 },
        headline: 'Cookie Paywall drops like an iron curtain — player count plummets overnight' },

        { name: 'Corporate blackmail', icon: [10,13], sheet: 'custom', durationSec: 4 * 60 * 60, costCps: 90 * 60,
        desc: 'Leverage sensitive information to silence critics and sway coverage.',
        flavor: 'Kompromat as far as the eye can see, don\'t worry about how we got it just worry about who we show it to.',
        unlock: { conditions: [{ stat: 'players', min: 300 }, { stat: 'reputation', max: 500 }] },
        effects: { reputation: -4, hype: 3, commitment: 2 },
        headline: 'Cookie Clicker parent company accused of pressure tactics' },

      { name: 'Age gate verification', icon: [10,16], sheet: 'custom', durationSec: 2 * 60 * 60, costCps: 180 * 60,
        desc: 'Restrict access by age. Everyone hated that, except for the government but they don\'t click cookies anyways.',
        flavor: 'Enter birthday and it better not start with January 1.',
        unlock: { conditions: [{ stat: 'players', min: 400 }, { stat: 'commitment', min: 150 }], tempConditions: [{ stat: 'commitment', min: 300 }] },
        unique: true,
        effects: { players: -14, reputation: -4, commitment: 7, referrals: 3 },
        headline: 'Cookie Clicker adds age verification Government ID required from now on — JNews instant polling shows 3% favorability with 4% margin of error' },

        { name: 'Donating profits to charity', icon: [7,15], sheet: 'custom', durationSec: 5 * 60 * 60, costCps: 3 * 60 * 60,
        desc: 'Giving away the profits to charity, even if it is just lip service its effective.',
        flavor: 'Everyone knows you are just trying to buy yourself out of a reputation scandal.',
        unlock: { conditions: [], tempConditions: [{ stat: 'reputation', min: 500, max: 800 }, { stat: 'players', min: 1000 }] },
        effects: {reputation: 8, players: -4, hype: -3, commitment: -2, boost: -3},
        headline: 'Cookie Clicker donates profits to charity "Told you we were the good guys!" exclaims scandal ridden CEO' },

      { name: '"We hear you" blog post', icon: [34,33], durationSec: 1.5 * 60 * 60, costCps: 45 * 60,
        desc: 'Public letter acknowledging that there is a problem and you are working diligently to solve it.',
        flavor: 'We read every comment, that\'s our story and we are sticking to it.',
        unique: true,
        unlock: { conditions: [], tempConditions: [{ stat: 'reputation', max: 700 }] },
        effects: { reputation: 5, players: 6, commitment: -2, hype: -2, referrals: -2 },
        headline: 'Cookie CEO posts heartfelt letter to the public — Not everyone is buying it' },

      { name: 'Public apology video', icon: [27,2], durationSec: 4 * 60 * 60, costCps: 2 * 60 * 60,
        desc: 'Tearful admission of wrongdoing. Sincerity optional but recommended.',
        flavor: "Set in a sunny field with a fake family and even a dog, old skip here knows how you feel.",
        unique: true,
        unlock: { conditions: [], tempConditions: [{ stat: 'reputation', max: 650 }] },
        effects: { reputation: 7, hype: -3, players: -3 },
        headline: "Tearful Cookie CEO apology video trends — \"we're sorry you felt that way\"" },

      { name: 'CEO resignation', icon: [12,12], sheet: 'custom', durationSec: 10 * 60 * 60, costCps: 2 * 60 * 60,
        desc: 'Resign your role but take the chairman of the board position.',
        flavor: "I am very sorry and I am stepping down immediately into a position of more power thats less visible.",
        unlock: { conditions: [], tempConditions: [{ stat: 'reputation', max: 500 }] },
        effects: { reputation: 9, players: -8, commitment: -4, hype: 3 },
        unique: true,
        headline: 'CEO steps down amid controversy — "time to focus on family", oddly enough they have no family' },

      { name: 'Lobby government', icon: [11,17], sheet: 'custom', durationSec: 6 * 60 * 60, costCps: 3 * 60 * 60,
        desc: 'Influence policy to favor your business, the fancy approved by government sticker really helps. Polarizing but effective.',
        flavor: 'We wrote the bill. Well, the intern wrote it. Okay it might have been a kitten intern.',
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 750 }], tempConditions: [{ stat: 'reputation', max: 800 }] },
        effects: { reputation: 5, players: -7, boost: -3},
        headline: 'SAVE Cookie Clicker Act passes house of representatives next stop the senate' },
      
        { name: 'Subliminal marketing', icon: [0,16], sheet: 'custom', durationSec: 4 * 60 * 60, costCps: 180 * 60,
        desc: "Hidden messages everywhere. They won't know why they're clicking.",
        flavor: 'eikooc eht kcilc',
        unlock: { conditions: [{ stat: 'players', min: 500 }], tempConditions: [{ stat: 'reputation', min: 700 }] },
        effects: { players: 15, commitment: 4, hype: -4, reputation: -4 },
        headline: 'Nightly news viewers report urge to click after watching' },

      { name: 'Make a fake botnet', icon: [4,9], durationSec: 3 * 60 * 60, costCps: 200 * 60,
        desc: "Inflate your numbers with AI bots. Nobody will notice, right… RIGHT?",
        flavor: "A player is a player, can't get picky now we're too deep.",
        unlock: { conditions: [{ stat: 'players', min: 300 }], tempConditions: [{ stat: 'reputation', min: 800 }] },
        effects: { players: 50, commitment: -3, reputation: -8, hype: 3, referrals: -2 },
        headline: 'Fake players inflate numbers — CEO claims "they are just highly efficient users"' },

      { name: 'Spike drinking water with game enhancing drugs', icon: [9,0], durationSec: 2 * 60 * 60, costCps: 220 * 60,
        desc: 'Controversial business decisions to say the least, some extra chemicals that are all natural to help out the players.',
        flavor: 'It was harmless we swear. Everything that exists is natural right? It wasn\'t supernatural if that is what you are asking.',
        unlock: { conditions: [{ stat: 'players', min: 250 }], tempConditions: [{ stat: 'reputation', min: 500 }] },
        effects: { players: 8, hype: 7, reputation: -7 },
        headline: 'Cookie Clicker found to be adding mystery chemicals to water supply' },

      { name: 'Revive Order of the Cookie Age Cult', icon: [3, 14], sheet: 'custom', durationSec: 12 * 60 * 60, costCps: 10 * 60 * 60,
        desc: 'Awaken the ancient order. They prove to be very enthusiastic, maybe too much, ok we should probably stop this.',
        flavor: 'The gregorian chants are very calming, like white noise. The inquistion is a lot less calming though.',
        unique: true,
        unlock: { conditions: [{ stat: 'players', min: 1000 }, { stat: 'fanatic', min: 10 }], tempConditions: [{ stat: 'hype', min: 300 }] },
        effects: { players: 95, referrals: 10, reputation: -19, hype: 8, commitment: 5 },
        headline: 'Ancient Cookie Cult resurfaces — "these guys are everywhere maybe if we did some puzzles they would chill out"' },
 
      { name: 'Cookie Clicker the Motion Picture', icon: [2,7], durationSec: 6 * 60 * 60, costCps: 5 * 60 * 60,
        desc: 'A cinematic masterpiece about clicking cookies. Fans rejoice everyone else cringes.',
        flavor: 'Maybe we should have cut it down a little from 3 hours and 45 minutes, we probably didn\'t need that 3rd dream sequence.',
        unique: true,
        unlock: { conditions: [{ stat: 'devotee', min: 15 }], tempConditions: [{ stat: 'hype', min: 250 }, { stat: 'commitment', min: 250 }] },
        effects: { players: 60, commitment: -3, reputation: -5, hype: 4, referrals: 3, boost: -7 },
        headline: 'Cookie Clicker the Motion Picture premieres to packed theaters — finishes to half empty theaters' },

      { name: 'Pivot!', icon: [15,17], sheet: 'custom', durationSec: 0, costCps: 24 * 60 * 60,
        desc: 'Immediately stop all actions.',
        flavor: 'Wait this isn\'t really working. CHANGE EVERYTHING RIGHT NOW!',
        unlock: { conditions: [{ stat: 'players', min: 250 }]},
        special: 'pivot',
        effects: {},
        headline: 'Cookie Clicker implements entirely new business plan suddenly and unexpectedly' },

        { name: 'Rebrand', icon: [31, 1], durationSec: 0, costCps: 0,
        desc: "When everything else fails, rebrand. This will reset your progress back to the starting point. (Does not reset prestige)",
        flavor: 'Kookie Clicker a brand new game with no association to the original game at all we swear.',
        unlock: { conditions: [{ stat: 'players', min: 50 }]},
        effects: {},
        special: 'rebrand',
        headline: '"A new dawn a new day" says Kookie Clicker CEO who was totally not the CEO of Cookie Clicker 5 minutes ago.' }
    ];
    ACTION_LIST.forEach(function (a) {
      var conds = (a.unlock && a.unlock.conditions) || [];
      var tempConds = (a.unlock && a.unlock.tempConditions) || [];
      ACTIONS[a.name] = {
        name: a.name, desc: a.desc || '', flavor: a.flavor || '',
        icon: a.icon || [0,0], sheet: a.sheet || 'main',
        durationSec: a.durationSec || 0, costCps: a.costCps || 0,
        unlock: { conditions: conds, tempConditions: tempConds },
        effects: a.effects || {}, special: a.special || null, unique: !!a.unique, headline: a.headline || '',
        isUnlocked: (function (n, c) {
          return function () { return c.length === 0 || !!G.unlocked[n]; };
        })(a.name, conds),
        isUsable: (function (n, c, tc) {
          return function () {
            var permOk = c.length === 0 || !!G.unlocked[n];
            return permOk && (tc.length === 0 || conditionsMet(tc));
          };
        })(a.name, conds, tempConds)
      };
    });


    var STATE_NEWS = [
  { stat: 'players', min: 0, max: 5, headline: 'Cookie Clicker franchise announces new Fractal Engine initiative' },
  { stat: 'players', min: 100, max: 500, headline: 'Cookie clickers making Cookie Clicker games proves to be a roaring success' },
  { stat: 'players', min: 1000, max: 5000, headline: 'Recruitment efforts pay off for young Cookie Clicker franchise owner' },
  { stat: 'players', min: 5001, max: 20000, headline: '"This has gotten so big I think we need to release a Fractal Engine minigame" says stunned Cookie Clicker' },

  { stat: 'hype', min: 900, max: 1000, headline: 'Everyone is talking about Cookie Clicker\'s new features!' },
  { stat: 'hype', min: 0, max: 200, headline: '"Same day same game, when do we get dungeons anyway?" says bitter player' },
  { stat: 'hype', min: 201, max: 500, headline: 'New features of Cookie Clicker spread around the internet, players getting more excited about the future' },
  { stat: 'hype', min: 501, max: 900, headline: '"I can\'t wait to see what they do next with the cookies!" exclaims overly excited Cookie Clicker when interviewed about new stoplight in hometown' },

  { stat: 'commitment', min: 900, max: 1000, headline: 'Players report being addicted to the clicking, they just can\'t stop' },
  { stat: 'commitment', min: 0, max: 200, headline: 'Players don\'t feel very committed to keep playing, "I can quit anytime"' },
  { stat: 'commitment', min: 201, max: 600, headline: 'Cookie Clickers report feeling the slight tinge of addiction, "it\'s just hard to put down" says player' },

  { stat: 'boredom', min: 5, max: 11, headline: 'Community sentiment suggests growing boredom with recent tactics, demand more diversity in actions' },
  { stat: 'boredom', min: 12, max: 17, headline: 'Player base becoming bored by lack of diverse actions, "Unless variaty is added things are going to get weird in here" warns user' },
  { stat: 'boredom', min: 18, max: 19, headline: 'Researchers warn of dangerously bored players, "Just one more ad i\'m burning it all down" warns player' },
  { stat: 'boredom', min: 20, max: 39, headline: 'Players become hopelessly bored as Cookie Clicker franchise brings no fresh ideas to the table' },
  { stat: 'boredom', min: 40, max: 59, headline: 'Boredom overtakes player base, they begin clicking outside the bounds of the cookie itself' },
  { stat: 'boredom', min: 60, max: 100, headline: 'Players have become so bored of your game that winning them back seems hopeless; only pure chaos at this point has a chance' },

  { stat: 'reputation', min: 900, max: 1000, headline: 'Cookie Clicker reputation stronger than ever, nothing but nice things to say' },
  { stat: 'reputation', min: 700, max: 899, headline: 'Public opinion on Cookie Clicker wavers, critics no longer afraid to speak out over fear of blacklisting' },
  { stat: 'reputation', min: 500, max: 699, headline: '"Take it or leave it" says former Cookie Clicker addict, "it\'s not what it used to be."' },
  { stat: 'reputation', min: 300, max: 499, headline: 'Recent polls show more people dislike clicking cookies than like it' },
  { stat: 'reputation', min: 150, max: 299, headline: '"I didn\'t want my friends to find out I was clicking cookies after school" — more and more hide their cookie shame' },
  { stat: 'reputation', min: 0, max: 149, headline: 'Cookie Clicker name is Mud; considers rebranding to Cockroach Clicker as it polls more favorably' }
];

    var TICKER_PX_PER_SEC = 25;
    var TICKER_GAP = 16;
    var tickerScrollOffset = 0;
    var lastTickerRafTime = 0;
    var tickerJustReset = false;
    var tickerAnimationRunning = false;
    var tickerRetryCount = 0;
    var TICKER_MAX_RETRIES = 10;

    function resetTickerPosition() {
      var strip = document.getElementById('downline-ticker-strip');
      tickerScrollOffset = 0;
      lastTickerRafTime = 0;
      tickerJustReset = true;
      if (strip) strip.style.transform = 'translateX(0px)';
    }

    function clearTickerStripAndPool() {
      var strip = document.getElementById('downline-ticker-strip');
      if (strip) while (strip.firstChild) strip.removeChild(strip.firstChild);
      G.tickerPool = [];
      tickerAnimationRunning = false;
    }

    function refillTickerPool() {
      var seen = new Set();
      var items = [];
      var v, headline;
      
      for (var i = 0; i < STATE_NEWS.length; i++) {
        var s = STATE_NEWS[i];
        try { v = statValue(s.stat); } catch (e) { continue; }
        if (typeof v !== 'number' || isNaN(v)) continue;
        if (v >= s.min && v <= s.max) {
          headline = s.headline;
          if (headline && !seen.has(headline)) { 
            seen.add(headline); 
            items.push(headline);
          }
        }
      }
      
      var seenAction = {};
      for (var j = 0; j < G.activeActions.length; j++) {
        var name_ = G.activeActions[j].name;
        if (seenAction[name_]) continue;
        seenAction[name_] = true;
        var d = ACTIONS[name_];
        if (d && d.headline && !seen.has(d.headline)) { 
          seen.add(d.headline); 
          items.push(d.headline);
        }
      }
      
      if (items.length === 0) {
        items.push('Slow news day, eh?');
      }
      
      G.tickerPool = items;
    }

    function addHeadlineToTickerPool(headline) {
      if (!headline || !String(headline).trim()) return;
      if (!G.tickerPool) G.tickerPool = [];
      if (G.tickerPool.indexOf(headline) >= 0) return;
      G.tickerPool.push(headline);
    }

    function getNextTickerItem(strip) {
      var inStrip = new Set();
      if (strip) {
        for (var i = 0; i < strip.children.length; i++) {
          var t = (strip.children[i].textContent || '').trim();
          if (t) inStrip.add(t);
        }
      }
      
      if (!G.tickerPool || G.tickerPool.length === 0) {
        refillTickerPool();
      }
      
      var available = G.tickerPool.filter(function (h) { return !inStrip.has(h); });
      
      if (available.length === 0) {
        available = G.tickerPool.slice();
      }
      
      var picked = available[Math.floor(Math.random() * available.length)];
      var idx = G.tickerPool.indexOf(picked);
      if (idx >= 0) G.tickerPool.splice(idx, 1);
      
      return picked;
    }

    function appendTickerSegment(strip, text) {
      if (!text || !String(text).trim()) return;
      var seg = document.createElement('span');
      seg.className = 'ticker-segment';
      seg.appendChild(document.createTextNode(text));
      var cookieWrap = document.createElement('span');
      cookieWrap.className = 'downline-tooltip-cost-cookie-wrap';
      var cookieIcon = createIcon(0, 3);
      cookieIcon.className = 'downline-icon downline-tooltip-cost-cookie';
      cookieWrap.appendChild(cookieIcon);
      seg.appendChild(cookieWrap);
      strip.appendChild(seg);
    }

    function updateNewsTicker() {
      G.tickerPool = [];
      var strip = document.getElementById('downline-ticker-strip');
      if (!strip) return;
      var parent = strip.parentElement;
      var visibleWidth = parent ? parent.clientWidth : 0;
      
      // If visible width is 0, the element isn't rendered yet - defer population
      if (visibleWidth === 0) {
        if (tickerRetryCount < TICKER_MAX_RETRIES) {
          tickerRetryCount++;
          setTimeout(function() {
            updateNewsTicker();
          }, 100);
        } else {
          tickerRetryCount = 0; // Reset for future calls
        }
        return;
      }
      
      tickerRetryCount = 0;
      
      while (strip.offsetWidth < visibleWidth) {
        var text = getNextTickerItem(strip);
        if (!text) break;
        if (text) {
          appendTickerSegment(strip, text);
        }
      }
      
      if (strip.children.length > 0 && !tickerAnimationRunning) {
        tickerAnimationRunning = true;
        requestAnimationFrame(tickerAnimationLoop);
      }
    }

    function tickerAnimationLoop(now) {
      now = now || performance.now();
      var strip = document.getElementById('downline-ticker-strip');
      if (tickerJustReset) {
        tickerScrollOffset = 0;
        lastTickerRafTime = now;
        tickerJustReset = false;
        if (strip) strip.style.transform = 'translateX(0px)';
        requestAnimationFrame(tickerAnimationLoop);
        return;
      }
      if (lastTickerRafTime === 0) lastTickerRafTime = now;
      var dt = Math.min((now - lastTickerRafTime) / 1000, 0.2);
      lastTickerRafTime = now;

      if (strip) {
        var visibleWidth = strip.parentElement ? strip.parentElement.clientWidth : 0;
        
        if (visibleWidth > 0 && (strip.children.length === 0 || strip.offsetWidth - tickerScrollOffset <= visibleWidth)) {
          var text = getNextTickerItem(strip);
          if (text) {
            appendTickerSegment(strip, text);
            void strip.offsetWidth;
          }
        }
        
        if (strip.children.length > 0) {
          var tickerSpeed = G.frozen ? 0.15 : (lumpBoostState.active ? 3.5 : 1);
          tickerScrollOffset += TICKER_PX_PER_SEC * dt * tickerSpeed;
          var first = strip.firstElementChild;
          while (first && tickerScrollOffset >= first.offsetWidth + TICKER_GAP) {
            var widthToRemove = first.offsetWidth + TICKER_GAP;
            strip.removeChild(first);
            tickerScrollOffset -= widthToRemove;
            first = strip.firstElementChild;
          }
          strip.style.transform = 'translateX(' + (-tickerScrollOffset) + 'px)';
        }
        
        requestAnimationFrame(tickerAnimationLoop);
      } else {
        tickerAnimationRunning = false;
      }
    }


    function onTickerResize() {
      var strip = document.getElementById('downline-ticker-strip');
      if (!strip) return;
      var parent = strip.parentElement;
      var visibleWidth = parent ? parent.clientWidth : 0;
      
      if (strip.children.length === 0 || (visibleWidth > 0 && strip.offsetWidth < visibleWidth)) {
        tickerScrollOffset = 0;
        tickerJustReset = true;
        }
    }
    window.addEventListener('resize', onTickerResize);


    var $ = document.getElementById.bind(document);
    var activeList = $('downline-active-list'), activeCountEl = $('downline-active-count'), activeMaxEl = $('downline-active-max');
    var actionsListEl = $('downline-actions-list');
    var actionsLibraryEl = document.querySelector('#downline-wrap .downline-actions-library');
    var actionsListWrapEl = document.querySelector('#downline-wrap .downline-actions-list-wrap');
    var barsEl = document.querySelector('#downline-wrap .downline-bars');
    var lastWrapWidth = 0;

    function escapeTooltipHtml(s) {
      if (s == null) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getTooltipIconStyle(def, name) {
      var iconsUrl = (Game.resPath || 'https://orteil.dashnet.org/cookieclicker/') + 'img/icons.png';
      var gardenUrl = (Game.resPath || 'https://orteil.dashnet.org/cookieclicker/') + 'img/gardenPlants.png';
      var customUrl = (SHEETS && SHEETS.custom) ? SHEETS.custom : 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/updatedSpriteSheet.png';
      var icon, url;
      if (def && def.icon) {
        icon = def.icon;
        if (def.sheet === 'garden') url = gardenUrl;
        else if (def.sheet === 'custom') url = customUrl;
        else url = iconsUrl;
      } else if (name === 'Freeze') {
        icon = [1, 35];
        url = gardenUrl;
      } else {
        icon = [0, 3];
        url = iconsUrl;
      }
      var style = (url ? 'background-image:url(\'' + String(url).replace(/'/g, "\\'") + '\');' : '') + 'background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;';
      return style;
    }

    function tooltipShouldShowIcon(el) {
      if (!el) return false;
      if (el.classList.contains('downline-bar')) return false;
      if (el.id === 'downline-release-btn' || el.classList.contains('downline-release-wrap')) return false;
      if (el.id === 'downline-active-slots-info') return false;
      if (el.id === 'downline-boredom-wrap' || el.classList.contains('downline-boredom-wrap') || (el.closest && el.closest('#downline-boredom-wrap'))) return false;
      if (el.closest && el.closest('.downline-active-slot')) return el.classList.contains('downline-active-chip');
      return true;
    }

    function buildDownlineTooltipHtml(el) {
      if (el.id === 'downline-lump-wrap') return getLumpSpeedTooltipHtml();
      var name = el.getAttribute('data-name');
      var descHtml = el.getAttribute('data-desc-html'), descPlain = el.getAttribute('data-desc');
      if (!name && !descHtml && !descPlain) return '';
      var def = name ? ACTIONS[name] : null;
      var isChip = el.classList.contains('downline-active-chip');
      var showIcon = tooltipShouldShowIcon(el);
      var parts = [];
      if (showIcon) {
        var iconStyle = getTooltipIconStyle(def, name);
        parts.push('<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;width:48px;height:48px;' + iconStyle + '"></div>');
      }
      var barValueHtml = '';
      if (el.classList.contains('downline-bar-hype')) {
        var hypeCap = hasBoredomEffect('hype_cap_half') ? 500 : 1000;
        barValueHtml = '<span style="color:#3c9">' + Math.round(G.hype) + '/' + hypeCap + '</span>';
        if (hypeCap < 1000) barValueHtml += ' <span class="red">(capped by boredom)</span>';
      } else if (el.classList.contains('downline-bar-commitment')) {
        var commitCap = hasBoredomEffect('commitment_cap_half') ? 500 : 1000;
        barValueHtml = '<span style="color:#6ad">' + Math.round(G.commitment) + '/' + commitCap + '</span>';
        if (commitCap < 1000) barValueHtml += ' <span class="red">(capped by boredom)</span>';
      } else if (el.classList.contains('downline-bar-referrals')) {
        barValueHtml = '<span style="color:#c6f">' + Math.round(G.referrals) + '/1000</span>';
      } else if (el.classList.contains('downline-bar-reputation')) {
        barValueHtml = '<span style="color:#fc7">' + Math.round(G.reputation) + '/1000</span>';
      }
      var priceHtml = '';
      if (barValueHtml) {
        priceHtml = '<div style="float:right;text-align:right;">' + barValueHtml + '</div>';
      } else if (def && def.costCps > 0) {
        var costMult = hasBoredomEffect('cost_double') ? 2 : 1;
        var costCookies = G.unfrozenRawCpS * def.costCps * costMult;
        var canAfford = Game.cookies >= costCookies;
        var costStr = Beautify ? Beautify(Math.round(costCookies)) : formatCookies(costCookies);
        var timeStr = formatCostTime(def.costCps) + ' raw CpS' + (costMult > 1 ? ' (×2 boredom)' : '');
        priceHtml = '<div style="float:right;text-align:right;"><span class="price' + (canAfford ? '' : ' disabled') + '">' + escapeTooltipHtml(costStr) + '</span><div style="font-size:80%;opacity:0.8;">(' + escapeTooltipHtml(timeStr) + ')</div></div>';
      }
      if (priceHtml) parts.push(priceHtml);
      if (name) parts.push('<div class="name">' + escapeTooltipHtml(name) + '</div>');
      if (def && def.unique) {
        var uniqueInUse = G.activeActions.some(function (a) { return a.name === name; });
        var noUnique = hasBoredomEffect('no_unique');
        var color = noUnique ? '#f66' : (uniqueInUse ? '#f66' : '#fc6');
        var suffix = noUnique ? ' (locked by boredom)' : (uniqueInUse ? ' (in use)' : '');
        parts.push('<div class="meta" style="color:' + color + '">&#9733; Unique action' + escapeTooltipHtml(suffix) + '</div>');
      }
      parts.push('<div style="clear:both;"></div><div class="line"></div>');
      var descContent = descHtml || (def && def.desc) || descPlain || '';
      if (descContent) parts.push('<div class="description">' + (descHtml ? descContent : escapeTooltipHtml(descContent)) + '</div>');
      if (def && def.durationSec != null) {
        var baseDur = def.durationSec;
        var durationMult = hasBoredomEffect('actions_25_less') ? 0.75 : 1;
        var auraMult = getSupremeIntellectDurationMult();
        var actualDur = baseDur * durationMult * auraMult;
        var durationText = 'Duration: <b>' + escapeTooltipHtml(formatDuration(actualDur)) + '</b>';
        if (hasBoredomEffect('actions_25_less')) {
          durationText += ' <span class="red">(25% less from boredom)</span>';
        }
        parts.push('<div class="duration">' + durationText + '</div>');
      }
      if (def && def.effects) {
        var lines = buildEffectLines(def.effects);
        if (lines.length) {
          parts.push('<div class="effects">' + lines.map(function (l) { return '<div class="' + (l.positive ? 'green' : 'red') + '">&bull; ' + escapeTooltipHtml(l.text) + '</div>'; }).join('') + '</div>');
        }
      }
      if (isChip) {
        var stateIndex = parseInt(el.getAttribute('data-state-index'), 10);
        var action = !isNaN(stateIndex) && G.activeActions[stateIndex];
        if (!action) return '';
        var left = Math.max(0, action.remainSec);
        var lumpBoostActive = lumpBoostState.active;
        var effectiveSpeedMult = (lumpBoostActive ? 10 : G.speed) * Math.pow(2, G.prestige);
        var combinedMult = effectiveSpeedMult * (G.frozen ? FROZEN_SPEED_FRAC : 1);
        var displaySec = combinedMult > 0 ? left / combinedMult : left;
        var boostLabel = '';
        if (effectiveSpeedMult > 1) boostLabel += ' <span class="green">(Boosted ' + effectiveSpeedMult + '×)</span>';
        if (G.frozen) boostLabel += ' <span style="color:#6ad">(1/6× frozen)</span>';
        parts.push('<br><div class="remaining"><span class="green">Time remaining: ' + escapeTooltipHtml(formatRemaining(displaySec)) + boostLabel + '</span></div>');
      }
      var unlockHtml = def ? buildUnlockTooltipHtml(def) : '';
      if (unlockHtml) parts.push('<div class="line"></div><div class="unlock">' + unlockHtml + '</div>');
      if (def && def.flavor) parts.push('<q>' + escapeTooltipHtml(def.flavor) + '</q>');
      if (parts.length === 0) return '';
      return '<div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipDownline">' + parts.join('') + '</div>';
    }

    function updateSlotAvailability() {
      var max = getEffectiveMaxSlots();
      var baseMax = getMaxSlots(G.fractalLevel);
      var isHalved = hasBoredomEffect('slots_half');
      var blockedCount = 0;
      activeList.querySelectorAll('.downline-active-slot').forEach(function (s, i) {
        var isAvailable = i < max;
        var isBlocked = !isAvailable && i < baseMax && isHalved;
        var hasChip = s.querySelector('.downline-active-chip') !== null;
        if (isBlocked) blockedCount++;
        // Only mark as available if slot is empty and within max
        s.classList.toggle('available', isAvailable && !hasChip);
        s.classList.toggle('blocked', isBlocked);
        if (isBlocked) {
          s.title = 'Blocked by boredom debuff';
        } else {
          s.title = '';
        }
      });
      activeMaxEl.textContent = max;
    }

    ACTION_LIST.forEach(function (a) {
      var def = ACTIONS[a.name], e = def.effects;
      var bars = [];
      var positiveBars = [];
      for (var i = 0; i < EFFECT_KEYS.length; i++) {
        var key = EFFECT_KEYS[i][0];
        if (e[key]) {
          bars.push(key);
          if (e[key] > 0) positiveBars.push(key);
        }
      }
      var el = document.createElement('a');
      el.className = 'downline-action-item';
      el.href = '#';
      el.setAttribute('data-name', a.name);
      el.setAttribute('data-bars', bars.join(' '));
      el.setAttribute('data-positive-bars', positiveBars.join(' '));
      var wrap = document.createElement('span');
      wrap.className = 'downline-action-icon-wrap';
      wrap.appendChild(createIcon(def.icon[0], def.icon[1], def.sheet));
      el.appendChild(wrap);
      actionsListEl.appendChild(el);
    });

    var boredomIconsEl = $('downline-boredom-icons');
    var boredomWrapEl = $('downline-boredom-wrap');
    if (boredomIconsEl && boredomIconsEl.children.length === 0) {
      for (var bi = 0; bi < BOREDOM_ICONS_MAIN.length; bi++) {
        var ico = BOREDOM_ICONS_MAIN[bi];
        var iconEl = createIcon(ico[0], ico[1], 'main');
        iconEl.className = iconEl.className + ' downline-boredom-icon';
        var box = document.createElement('span');
        box.className = 'downline-boredom-icon-box';
        box.appendChild(iconEl);
        boredomIconsEl.appendChild(box);
      }
    }
    function updateBoredomUI() {
      if (!boredomWrapEl || !boredomIconsEl) return;
      var b = Math.min(BOREDOM_MAX, Math.max(0, G.boredom));
      var showWrap = b >= 20;
      boredomWrapEl.classList.toggle('hidden', !showWrap);
      if (!showWrap) return;
      var filled = Math.min(5, Math.floor(b / 20));
      for (var i = 0; i < boredomIconsEl.children.length; i++) {
        var box = boredomIconsEl.children[i];
        box.classList.toggle('hidden', i >= filled);
      }
      var seen = {};
      var activeNames = [];
      if (G.activeBoredomEffects) {
        for (var j = 0; j < G.activeBoredomEffects.length; j++) {
          var id = G.activeBoredomEffects[j];
          if (!seen[id]) { seen[id] = true; activeNames.push(BOREDOM_EFFECT_NAMES[id] || id); }
        }
      }
      var now = Date.now();
      var nextHourMs = (Math.floor(now / 3600000) + 1) * 3600000;
      var secsToReshuffle = Math.max(1, Math.min(3600, (nextHourMs - now) / 1000));
      var reshuffleLine = 'Debuffs reshuffle at the top of each hour (next in ' + formatDuration(secsToReshuffle) + ').';
      var html = 'Your player base is becoming bored by your lack of diversity. Boredom can be lowered by using new and different actions, repeating the same actions (even when not sequential) will continue to raise the boredom level. The higher the players\' boredom, the more negative effects you will experience.<br><br><b>Active effects:</b><br>' +
        (activeNames.length ? activeNames.map(function (n) { return '<div class="red">&bull; ' + n + '</div>'; }).join('') : '<span class="red">(none this hour)</span>') +
        '<br>' + reshuffleLine;
      boredomWrapEl.setAttribute('data-desc-html', html);
      boredomWrapEl.removeAttribute('data-desc');
    }

    function formatCostTime(sec) {
      if (!sec) return '';
      if (sec >= 86400) {
        var d = Math.floor(sec / 86400);
        var rest = sec % 86400;
        var h = Math.floor(rest / 3600);
        var dayStr = d + ' day' + (d !== 1 ? 's' : '');
        return h > 0 ? dayStr + ', ' + h + ' hour' + (h !== 1 ? 's' : '') : dayStr;
      }
      var m = sec / 60;
      return m < 60 ? Math.round(m) + ' min' : (m / 60).toFixed(1).replace(/\.0$/, '') + ' hour' + (m >= 120 ? 's' : '');
    }
    function formatCookies(n) {
      return n < 1e15 ? formatNum(Math.floor(n)) : n.toExponential(2);
    }

    function getLumpSpeedTooltipHtml() {
      var lumpAmount = Beautify(1);
      var now = Date.now();
      var boostActive = G.lumpSpeedBoostEnd && now < G.lumpSpeedBoostEnd;
      var html = '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipLumpSpeed">';
      if (boostActive) {
        var remainSec = Math.ceil((G.lumpSpeedBoostEnd - now) / 1000);
        var mins = Math.floor(remainSec / 60);
        var secs = remainSec % 60;
        var timeStr = mins > 0 ? mins + ' min ' + secs + ' s' : secs + ' s';
        html += 'Sugar Rush\u00AE boost active.<br><span class="green">' + timeStr + ' remaining at 10× speed.</span>';
      } else {
        var lumps = Game.lumps || 0;
        var costClass = lumps >= 1 ? 'price lump green' : 'price lump disabled red';
        html += 'Click to run the Downline at 10× speed for 30 minutes for <span class="' + costClass + '">' + lumpAmount + ' sugar lump</span>.';
        if (lumps < 1) {
          html += '<br><small class="red">(Need 1 sugar lump.)</small>';
        }
      }
      html += '</div>';
      return html;
    }

    function addTooltipListeners(el) {
      if (Game.tooltip && Game.tooltip.draw) {
        el.addEventListener('mouseenter', function () {
          Game.tooltip.dynamic = 1;
          Game.tooltip.draw(el, function () { return buildDownlineTooltipHtml(el); }, 'bottom');
          if (Game.tooltip.wobble) Game.tooltip.wobble();
        });
        el.addEventListener('mouseleave', function () { Game.tooltip.shouldHide = 1; });
      }
    }

    function renderActiveSlots() {
      var allSlots = activeList.querySelectorAll('.downline-active-slot');
      for (var i = 0; i < allSlots.length; i++) {
        allSlots[i].innerHTML = '';
        if (i >= G.activeActions.length) {
          allSlots[i].classList.add('available');
        } else {
          allSlots[i].classList.remove('available');
        }
      }
      for (var j = 0; j < G.activeActions.length && j < allSlots.length; j++) {
        var state = G.activeActions[j];
        var existingChip = allSlots[j].querySelector('.downline-active-chip[data-state-index="' + j + '"]');
        if (!existingChip) {
          var def = ACTIONS[state.name];
          if (def) {
            var chip = document.createElement('span');
            chip.className = 'downline-active-chip';
            chip.setAttribute('data-name', state.name);
            chip.setAttribute('data-state-index', j);
            chip.title = state.name;
            chip.appendChild(createIcon(def.icon[0], def.icon[1], def.sheet));
            var overlay = document.createElement('span');
            overlay.className = 'downline-active-overlay';
            chip.appendChild(overlay);
            allSlots[j].appendChild(chip);
            addTooltipListeners(chip);
          }
        }
      }
    }

    function addActionToCurrent(evt) {
      evt.preventDefault();
      var link = evt.currentTarget;
      if (link.classList.contains('locked')) return;
      var name = link.getAttribute('data-name'), def = ACTIONS[name];
      if (!def || !def.isUsable()) return;
      if (def.special === 'pivot') {
        G.activeActions.length = 0; renderActiveSlots(); activeCountEl.textContent = 0; return;
      }
      if (def.special === 'rebrand') {
        showRebrandActionPrompt(def.headline); return;
      }
      if (G.activeActions.length >= getEffectiveMaxSlots()) return;
      if (def.unique && (hasBoredomEffect('no_unique') || G.activeActions.some(function (a) { return a.name === name; }))) return;

      if (def.costCps && def.costCps > 0) {
        var costMult = hasBoredomEffect('cost_double') ? 2 : 1;
        var costCookies = G.unfrozenRawCpS * def.costCps * costMult;
        if (costCookies > 0) {
          var have = Game.cookies;
          if (have < costCookies) return;
          Game.cookies = have - costCookies;
          Game.recalculateGains = 1;
        }
      }

      var chip = document.createElement('span');
      chip.className = 'downline-active-chip'; chip.setAttribute('data-name', name); chip.title = name;
      chip.appendChild(createIcon(def.icon[0], def.icon[1], def.sheet));
      var overlay = document.createElement('span'); overlay.className = 'downline-active-overlay'; chip.appendChild(overlay);
      var durationMult = hasBoredomEffect('actions_25_less') ? 0.75 : 1;
      var auraMult = getSupremeIntellectDurationMult();
      var total = Math.max(def.durationSec * durationMult * auraMult, 0.001);
      var state = { name: name, totalSec: total, remainSec: total };
      var stateIndex = G.activeActions.length;
      chip.setAttribute('data-state-index', stateIndex);
      G.activeActions.push(state);
      if (def.headline) addHeadlineToTickerPool(def.headline);

      G.lastActions.unshift(name);
      if (G.lastActions.length > LAST_ACTIONS_CAP) G.lastActions.length = LAST_ACTIONS_CAP;
      var countOfName = 0;
      for (var i = 0; i < G.lastActions.length; i++) if (G.lastActions[i] === name) countOfName++;
      if (countOfName >= 2) {
        var boredomDelta = countOfName > 6 ? 3 : (countOfName >= 3 ? 2 : 1);
        G.boredom = Math.min(BOREDOM_MAX, G.boredom + boredomDelta);
      } else {
        var inLookback = false;
        for (var j = 1; j <= LAST_ACTIONS_CAP && j < G.lastActions.length; j++) { if (G.lastActions[j] === name) { inLookback = true; break; } }
        if (!inLookback) G.boredom = Math.max(0, G.boredom - 1);
      }
      Game.recalculateGains = 1;
      renderActiveSlots(); 
      activeCountEl.textContent = G.activeActions.length;
      addTooltipListeners(chip);
    }

    function checkUnlocks() {
      var noUnique = hasBoredomEffect('no_unique');
      var lockedByUnlock = 0, lockedByNoUnique = 0;
      actionsListEl.querySelectorAll('.downline-action-item[data-name]').forEach(function (el) {
        var def = ACTIONS[el.getAttribute('data-name')];
        if (!def) return;
        if (def.unlock.conditions && def.unlock.conditions.length > 0 && conditionsMet(def.unlock.conditions)) G.unlocked[def.name] = true;
        var unlockOk = def.isUnlocked();
        var usableOk = def.isUsable && def.isUsable();
        var blockedByNoUnique = def.unique && noUnique;
        var canAfford = true;
        if (usableOk && def.costCps && def.costCps > 0) {
          var costMult = hasBoredomEffect('cost_double') ? 2 : 1;
          var costCookies = G.unfrozenRawCpS * def.costCps * costMult;
          if (costCookies > 0 && Game.cookies < costCookies) canAfford = false;
        }
        var isLocked = !usableOk || blockedByNoUnique;
        if (isLocked && blockedByNoUnique) lockedByNoUnique++;
        else if (isLocked) lockedByUnlock++;
        el.classList.toggle('locked', isLocked);
      });
    }

    function syncDebugLabels() {
      function setLabel(id, text) { var el = $(id); if (el) el.textContent = text; }
      TYPES.forEach(function (t) { setLabel('debug-' + t + '-label', (t === 'dabbler' ? 'Dab' : t === 'casual' ? 'Cas' : t === 'habitual' ? 'Hab' : t === 'devotee' ? 'Dev' : 'Fan') + ' (' + G.players[t] + ')'); });
      setLabel('debug-hype-label', 'Hyp (' + Math.floor(G.hype) + ')');
      setLabel('debug-commitment-label', 'Com (' + Math.floor(G.commitment) + ')');
      setLabel('debug-referrals-label', 'WoM (' + Math.floor(G.referrals) + ')');
      setLabel('debug-reputation-label', 'Rep (' + Math.floor(G.reputation) + ')');
      setLabel('debug-boredom-label', 'Boredom (' + Math.floor(G.boredom) + ')');
      setLabel('debug-rawcps-label', 'raw CpS (' + G.rawCpS + ')');
      var cap = G.bonusCap != null ? G.bonusCap : BONUS_CAP;
      var k = G.bonusK != null ? G.bonusK : BONUS_K;
      var pow = G.bonusPow != null ? G.bonusPow : BONUS_POW;
      setLabel('debug-bonus-cap-label', 'Cap (' + cap + ')');
      setLabel('debug-bonus-k-label', 'K (' + k + ')');
      setLabel('debug-bonus-pow-label', 'Pow (' + pow + ')');
      var hypeExpL = G.bonusHypeExp != null ? G.bonusHypeExp : BONUS_HYPE_EXP;
      var commitExpL = G.bonusCommitExp != null ? G.bonusCommitExp : BONUS_COMMIT_EXP;
      setLabel('debug-bonus-hype-exp-label', 'HypExp (' + hypeExpL + ')');
      setLabel('debug-bonus-commit-exp-label', 'ComExp (' + commitExpL + ')');
      var weights = (G.playerWeight && G.playerWeight.length === 5) ? G.playerWeight : PLAYER_WEIGHT;
      var wNames = ['DabW', 'CasW', 'HabW', 'DevW', 'FanW'];
      for (var i = 0; i < 5; i++) setLabel('debug-weight-' + TYPES[i] + '-label', wNames[i] + ' (' + weights[i] + ')');
      var refR = getRefRates();
      setLabel('debug-ref-dab-label', 'RefDab (' + refR[0] + ')');
      setLabel('debug-ref-cas-label', 'RefCas (' + refR[1] + ')');
      setLabel('debug-ref-hab-label', 'RefHab (' + refR[2] + ')');
      setLabel('debug-ref-dev-label', 'RefDev (' + refR[3] + ')');
      setLabel('debug-ref-fan-label', 'RefFan (' + refR[4] + ')');
      setLabel('debug-ref-hype-mid-label', 'HypMid (' + getRefHypeMid() + ')');
      setLabel('debug-ref-hype-cap-label', 'HypCap (' + getRefHypeCap() + ')');
      setLabel('debug-ref-wom-min-label', 'WoMMin (' + getRefWomMin() + ')');
      setLabel('debug-ref-wom-max-label', 'WoMMax (' + getRefWomMax() + ')');
      setLabel('debug-ref-exp-label', 'RefExp (' + getRefPlayerCountExp() + ')');
    }
    function clearDebugInputs() {
      var ids = ['debug-dabbler','debug-casual','debug-habitual','debug-devotee','debug-fanatic','debug-hype','debug-commitment','debug-referrals','debug-reputation','debug-boredom','debug-rawcps','debug-bonus-cap','debug-bonus-k','debug-bonus-pow','debug-bonus-hype-exp','debug-bonus-commit-exp','debug-weight-dabbler','debug-weight-casual','debug-weight-habitual','debug-weight-devotee','debug-weight-fanatic','debug-ref-dab','debug-ref-cas','debug-ref-hab','debug-ref-dev','debug-ref-fan','debug-ref-hype-mid','debug-ref-hype-cap','debug-ref-wom-min','debug-ref-wom-max','debug-ref-exp'];
      ids.forEach(function (id) { var el = $(id); if (el) el.value = ''; });
    }

    function getCurrentBoost() {
      var w = weightedPlayers();
      var cap = G.bonusCap != null ? G.bonusCap : BONUS_CAP;
      var k = G.bonusK != null ? G.bonusK : BONUS_K;
      var pow = G.bonusPow != null ? G.bonusPow : BONUS_POW;
      var hypeExp = G.bonusHypeExp != null ? G.bonusHypeExp : BONUS_HYPE_EXP;
      var commitExp = G.bonusCommitExp != null ? G.bonusCommitExp : BONUS_COMMIT_EXP;
      var hypePct = G.hype / BAR_MAX;
      var commitPct = G.commitment / BAR_MAX;
      var barsFactor = (hypeExp > 0 ? Math.pow(Math.max(0, hypePct), hypeExp) : 1) * (commitExp > 0 ? Math.pow(Math.max(0, commitPct), commitExp) : 1);
      var eff = w > 0 ? Math.pow(w, pow) * barsFactor : 0;
      var rawBoost = eff > 0 ? cap * eff / (eff + k) : 0;
      var repBoostMult = G.reputation / BAR_MAX;
      var actionBoostBonus = 0;
      G.activeActions.forEach(function (a) {
        var d = ACTIONS[a.name];
        if (d && d.effects && d.effects.boost) actionBoostBonus += d.effects.boost;
      });
      if (hasBoredomEffect('positive_effects_half')) actionBoostBonus *= 0.5;
      var boost = (rawBoost * repBoostMult) + actionBoostBonus;
      return hasBoredomEffect('boost_third_less') ? boost * (2 / 3) : boost;
    }
    function updateUI() {
      var debugEl = $('downline-debug');
      if (debugEl) debugEl.style.display = Game.downlineDebug ? 'block' : 'none';
      var fractalEngine = getFractalEngine();
      if (fractalEngine && fractalEngine.minigameDiv && fractalEngine.minigameDiv.parentNode) {
        fractalEngine.minigameDiv.parentNode.classList.add('downline-row-visible');
      }
      var total = totalPlayers(), p = G.players;
      $('downline-bar-players-label').textContent = 'Players ' + formatNum(total);
      $('downline-bar-players-fill').style.width = total >= 1 ? '100%' : '0%';
      var segs = $('downline-player-mix').children;
      for (var i = 0; i < 5; i++) segs[i].style.width = (total > 0 ? p[TYPES[i]] / total * 100 : 0) + '%';

      var hypeCap = hasBoredomEffect('hype_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      var commitCap = hasBoredomEffect('commitment_cap_half') ? BAR_MAX / 2 : BAR_MAX;
      
      $('downline-bar-hype-fill').style.width = (G.hype / BAR_MAX * 100) + '%';
      $('downline-bar-commitment-fill').style.width = (G.commitment / BAR_MAX * 100) + '%';
      $('downline-bar-reputation-fill').style.width = (G.reputation / BAR_MAX * 100) + '%';
      
      var hypeCapped = hypeCap < BAR_MAX;
      var commitCapped = commitCap < BAR_MAX;
      var hypeCapEl = $('downline-bar-hype-cap');
      var commitCapEl = $('downline-bar-commitment-cap');
      if (hypeCapEl) {
        hypeCapEl.classList.toggle('active', hypeCapped);
        if (hypeCapped) hypeCapEl.style.width = ((BAR_MAX - hypeCap) / BAR_MAX * 100) + '%';
      }
      if (commitCapEl) {
        commitCapEl.classList.toggle('active', commitCapped);
        if (commitCapped) commitCapEl.style.width = ((BAR_MAX - commitCap) / BAR_MAX * 100) + '%';
      }
      
      $('downline-bar-hype-label').textContent = 'Hype' + (hypeCapped ? ' (capped)' : '');
      $('downline-bar-commitment-label').textContent = 'Commitment' + (commitCapped ? ' (capped)' : '');

      var refPerMin = referralRate() * 60;
      $('downline-bar-referrals-fill').style.width = (G.referrals / BAR_MAX * 100) + '%';
      $('downline-bar-referrals-label').textContent = refPerMin !== 0 ? 'Word of Mouth ' + (refPerMin > 0 ? '+' : '') + refPerMin.toFixed(1) + '/min' : 'Word of Mouth';

      updateBoredomUI();

      if (totalPlayers() >= 5000) G.releaseMetPlayers = true;
      if (G.hype >= 800) G.releaseMetHype = true;
      if (G.commitment >= 800) G.releaseMetCommitment = true;
      if (G.referrals >= 300) G.releaseMetReferrals = true;
      var releaseMetCurrentPlayers = totalPlayers() >= 1500;
      var canReleaseFractal = G.releaseMetPlayers && G.releaseMetHype && G.releaseMetCommitment && G.reputation > 750 && G.releaseMetReferrals && releaseMetCurrentPlayers;
      var releaseWrap = $('downline-release-wrap');
      if (releaseWrap) {
        releaseWrap.classList.toggle('locked', !canReleaseFractal);
        releaseWrap.classList.toggle('downline-release-ready', canReleaseFractal);
        var releaseBtn = $('downline-release-btn');
        if (releaseBtn) releaseBtn.classList.toggle('warning', !canReleaseFractal);
        var currentBoost = getCurrentBoost();
        var tenPct = currentBoost * 0.1;
        function colorClass(met) { return met ? 'green' : 'red'; }
        var prestigeSpeedMult = Math.pow(2, G.prestige);
        var tooltipHtml = 'Release Fractal Engine Minigame. Your progress in the minigame will be reset back to the beginning but you will earn fractal prestige points!<br><br>' +
          'Unlocks At:<br>' +
          '<div class="' + colorClass(G.releaseMetPlayers) + '">&bull; At least 5000 Players</div>' +
          '<div class="' + colorClass(G.releaseMetHype) + '">&bull; At least 800 Hype</div>' +
          '<div class="' + colorClass(G.releaseMetCommitment) + '">&bull; At least 800 Commitment</div>' +
          '<div class="' + colorClass(G.releaseMetReferrals) + '">&bull; At least 300 Word of Mouth</div><br>' +
          'Requires:<br>' +
          '<div class="' + colorClass(releaseMetCurrentPlayers) + '">&bull; 1500+ current Players</div>' +
          '<div class="' + colorClass(G.reputation > 750) + '">&bull; A current Reputation of at least 750<br><br></div>' +
          'Each time you build a Fractal Engine Minigame the speed of the game will double and 10% of the current boost will be added permanently until next ascension. ' +
          '<span class="green"><br>Next release would add: +' + tenPct.toFixed(2) + '%</span>';
        if (G.prestige >= 1) {
          tooltipHtml += '<br><span class="green">Current speed boost: ' + prestigeSpeedMult + '×</span>';
        }
        releaseWrap.setAttribute('data-desc-html', tooltipHtml);
        releaseWrap.removeAttribute('data-desc');
      }

      var currentBoostVal = G.frozen ? getCurrentBoost() * FROZEN_SPEED_FRAC : getCurrentBoost();
      var boostText = currentBoostVal.toFixed(2) + '%';
      var prestigeVal = G.prestigeBoost > 0 ? (G.frozen ? G.prestigeBoost * FROZEN_SPEED_FRAC : G.prestigeBoost) : 0;
      if (prestigeVal > 0) boostText += '<br>(+' + prestigeVal.toFixed(2) + '%  Fractal Prestige)';
      var boostEl = $('downline-status-boost');
      boostEl.innerHTML = boostText;
      boostEl.classList.toggle('green', currentBoostVal >= 0);
      boostEl.classList.toggle('red', currentBoostVal < 0);
      var titleEl = document.querySelector('.downline-status-title');
      if (titleEl) titleEl.style.color = G.frozen ? '#6ad' : '';
      var tickerWrap = document.querySelector('.downline-ticker-wrap');
      if (tickerWrap) {
        tickerWrap.classList.toggle('frozen', G.frozen);
        tickerWrap.classList.toggle('sugar-rush', lumpBoostState.active);
      }

      activeCountEl.textContent = G.activeActions.length;

      G.activeActions.forEach(function (a, index) {
        var pct = a.totalSec <= 0 ? 1 : clamp(1 - a.remainSec / a.totalSec, 0, 1);
        var T = (pct * 144) % 144;
        var frame = Math.floor(T);
        var cell = 36;
        var chip = document.querySelector('.downline-active-chip[data-state-index="' + index + '"]');
        if (chip) {
          var overlay = chip.querySelector('.downline-active-overlay');
          if (overlay) {
            overlay.style.backgroundPosition = (-(frame % 18) * cell) + 'px ' + (-Math.floor(frame / 18) * cell) + 'px';
          }
        }
      });
      syncDebugLabels();
      updateSlotAvailability();

      checkUnlocks();
    }


    var FROZEN_SPEED_FRAC = 1 / 6;
    DownlineM.gameTick = function() {
      var now = Date.now();
      if (G.lastTickTime === 0) G.lastTickTime = now;
      var realDt = Math.min((now - G.lastTickTime) / 1000, 1);
      G.lastTickTime = now;
      
      G.rawCpS = Game.cookiesPsRaw || G.rawCpS;
      if (!G.frozen) {
        G.unfrozenRawCpS = G.rawCpS;
      }
      var debugLevelEl = document.getElementById('debug-fractal-level');
      var debugLevelOverride = debugLevelEl && String(debugLevelEl.value).trim() !== '' && !isNaN(parseInt(debugLevelEl.value, 10));
      if (debugLevelOverride) {
        G.fractalLevel = clamp(parseInt(debugLevelEl.value, 10), 1, 20);
      } else {
        var fe = Game.Objects['Fractal engine'];
        if (fe && fe.amount) {
          G.fractalLevel = Math.min(20, Math.max(1, fe.amount));
          if (debugLevelEl) debugLevelEl.value = G.fractalLevel;
        }
      }
      var lumpBoostActive = lumpBoostState.active;
      var effectiveSpeed = lumpBoostActive ? 10 : G.speed;
      var prestigeSpeedMult = Math.pow(2, G.prestige);
      var dt = realDt * effectiveSpeed * prestigeSpeedMult;
      if (G.frozen) dt *= FROZEN_SPEED_FRAC;
      if (dt > 0) {
        G.tickCount++; G.elapsedSec += dt;
      }

      updateBoredomEffects();

      var hadSupremeIntellect = G._supremeIntellectWasActive === true;
      var hasSupremeIntellectNow = Game.hasAura('Supreme Intellect');
      if (hadSupremeIntellect && !hasSupremeIntellectNow) {
        for (var si = 0; si < G.activeActions.length; si++) {
          var act = G.activeActions[si];
          act.totalSec = act.totalSec / 1.1;
          act.remainSec = Math.max(0.001, Math.min(act.remainSec / 1.1, act.totalSec));
        }
      } else if (!hadSupremeIntellect && hasSupremeIntellectNow) {
        for (var sj = 0; sj < G.activeActions.length; sj++) {
          var act2 = G.activeActions[sj];
          act2.totalSec = act2.totalSec * 1.1;
          act2.remainSec = act2.remainSec * 1.1;
        }
      }
      if (hadSupremeIntellect !== hasSupremeIntellectNow) {
        var fractalEngine = getFractalEngine();
        if (fractalEngine && fractalEngine.refresh) fractalEngine.refresh();
      }
      G._supremeIntellectWasActive = hasSupremeIntellectNow;

      var expiredNames = [];
      var hadExpiration = false;
      for (var i = G.activeActions.length - 1; i >= 0; i--) {
        var a = G.activeActions[i];
        a.remainSec -= dt;
        var d = ACTIONS[a.name];
        if (d && d.effects) applyEffects(d.effects, dt);
        if (a.remainSec <= 0) {
          expiredNames.push(a.name);
          G.activeActions.splice(i, 1);
          hadExpiration = true;
        }
      }
      for (var ei = 0; ei < expiredNames.length; ei++) {
        var name_ = expiredNames[ei];
        if (!G.activeActions.some(function (x) { return x.name === name_; })) {
          var head = ACTIONS[name_] && ACTIONS[name_].headline;
          if (head && G.tickerPool) {
            var idx = G.tickerPool.indexOf(head);
            if (idx >= 0) G.tickerPool.splice(idx, 1);
          }
        }
      }
      if (hadExpiration) Game.recalculateGains = 1;
      renderActiveSlots();

      var ref = referralRate();
      G.pendingNewPlayers += ref * dt;
      flushNewPlayers();
      applyPromotions(dt);
      applyQuits(dt);
      applyDecay(dt);
      clampAll();
      updateUI();

      var baseSpeedLabel = G.speed === 0 ? 'PAUSED' : (lumpBoostActive ? '10× (lump)' : G.speed + 'x');
      var speedLabel = (G.prestige >= 1 && baseSpeedLabel !== 'PAUSED') ? baseSpeedLabel + ' (' + prestigeSpeedMult + '× from releases)' : baseSpeedLabel;
      if (G.frozen) speedLabel = '(frozen)';
      $('debug-stats').textContent = 'tick ' + G.tickCount + ' | ' + Math.floor(G.elapsedSec) + 's game | ' + formatNum(totalPlayers()) + ' players | ' + speedLabel;

      var totBoost = getCurrentBoost() + (G.prestigeBoost || 0);
      if (G.frozen) totBoost *= FROZEN_SPEED_FRAC;
      var newEffs = 1 + totBoost / 100;
      var cpsChanged = !DownlineM.effs || Math.abs(DownlineM.effs.cps - newEffs) > 0.0001;
      
      if (cpsChanged) {
        DownlineM.effs = { cps: newEffs };
        if (!DownlineM._lastRecalcTime || G.elapsedSec - DownlineM._lastRecalcTime >= 0.5) {
          DownlineM._lastRecalcTime = G.elapsedSec;
          Game.recalculateGains = 1;
        }
      }
    }


    actionsListEl.querySelectorAll('.downline-action-item').forEach(function (el) {
      el.addEventListener('click', addActionToCurrent); addTooltipListeners(el);
    });
    document.querySelectorAll('.downline-bar[data-name]').forEach(addTooltipListeners);
    if (boredomWrapEl) addTooltipListeners(boredomWrapEl);
    var slotsInfoEl = $('downline-active-slots-info');
    if (slotsInfoEl) addTooltipListeners(slotsInfoEl);

    function applyFilterVisibility() {
      if (!actionsListEl) return;
      var on = [];
      document.querySelectorAll('.downline-filter-btn:not(.off)').forEach(function (b) { on.push(b.getAttribute('data-bar')); });
      var showAll = on.length === 0;
      actionsListEl.querySelectorAll('.downline-action-item').forEach(function (el) {
        if (showAll) { el.style.display = ''; return; }
        var positiveBars = (el.getAttribute('data-positive-bars') || '').split(/\s+/).filter(function (b) { return b; });
        el.style.display = on.every(function (bar) { return positiveBars.indexOf(bar) >= 0; }) ? '' : 'none';
      });
    }
    document.querySelectorAll('.downline-filter-btn').forEach(function (btn) {
      btn.classList.add('off');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        btn.classList.toggle('off');
        applyFilterVisibility();
      });
    });

    function recomputeBaseHeights() {
      if (!barsEl) return;
      
      var wrapEl = document.getElementById('downline-wrap');
      if (wrapEl) {
        var currentWidth = wrapEl.offsetWidth;
        if (lastWrapWidth !== 0 && currentWidth === lastWrapWidth) return;
        lastWrapWidth = currentWidth;
      }
      
      barsEl.style.height = 'auto';
      var barsRect = barsEl.getBoundingClientRect();
      if (barsRect.height > 0) {
        barsEl.style.height = barsRect.height + 'px';
      }
      
      if (actionsLibraryEl && actionsListEl && actionsListWrapEl) {
        var items = actionsListEl.querySelectorAll('.downline-action-item');
        items.forEach(function (el) { el.style.display = ''; });
        
        actionsListWrapEl.style.minHeight = '';
        actionsLibraryEl.style.width = '';
        actionsLibraryEl.style.height = '';
        
        void actionsListWrapEl.offsetHeight;
        var listWrapHeight = actionsListWrapEl.offsetHeight;
        if (listWrapHeight > 0) {
          actionsListWrapEl.style.minHeight = listWrapHeight + 'px';
        }
        
        applyFilterVisibility();
      }
    }

    function scheduleRecomputeBaseHeights() {
      requestAnimationFrame(recomputeBaseHeights);
    }

    scheduleRecomputeBaseHeights();

    // Recompute on resize
    try {
      var wrapEl = document.getElementById('downline-wrap');
      if (wrapEl) {
        var ro = new ResizeObserver(function () { scheduleRecomputeBaseHeights(); });
        ro.observe(wrapEl);
      }
    } catch (e) {
      window.addEventListener('resize', scheduleRecomputeBaseHeights);
    }

    function playFreezeSound() {
      try {
        var a = new Audio('https://orteil.dashnet.org/cookieclicker/snd/freezeGarden.mp3');
        a.play().catch(function () {});
        a.volume = 0.5;
      } catch (e) {}
    }
    var freezeBtn = $('downline-freeze-btn');
    if (freezeBtn) {
      freezeBtn.classList.toggle('on', G.frozen);
      freezeBtn.addEventListener('click', function () {
        G.frozen = !G.frozen;
        freezeBtn.classList.toggle('on', G.frozen);
        var tickerWrap = document.querySelector('.downline-ticker-wrap');
        if (tickerWrap) tickerWrap.classList.toggle('frozen', G.frozen);
        if (G.frozen) playFreezeSound();
        var totBoost = getCurrentBoost() + (G.prestigeBoost || 0);
        if (G.frozen) totBoost *= FROZEN_SPEED_FRAC;
        DownlineM.effs = { cps: 1 + totBoost / 100 };
        Game.recalculateGains = 1;
      });
      freezeBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); freezeBtn.click(); } });
      addTooltipListeners(freezeBtn);
    }

    function downlineDoRelease() {
      G.prestigeBoost += getCurrentBoost() * 0.1;
      G.players = { dabbler: 0, casual: 0, habitual: 0, devotee: 0, fanatic: 0 };
      G.hype = 50; G.commitment = 50; G.referrals = 0; G.reputation = BAR_MAX;
      G.boredom = 0; G.lastActions = []; G.activeBoredomEffects = []; G.boredomEffectHour = -1;
      G.releaseMetPlayers = false; G.releaseMetHype = false; G.releaseMetCommitment = false; G.releaseMetReferrals = false;
      G.tickCount = 0; G.elapsedSec = 0;
      G.activeActions = []; G.unlocked = {}; G.pendingNewPlayers = 0; G.tickerPool = [];
      G.prestige++;
      G.releasesThisAscension = (G.releasesThisAscension || 0) + 1;
      renderActiveSlots();
      activeCountEl.textContent = 0;
      checkUnlocks();
      updateUI();
    }
    function doRebrand(headline) {
      G.players = { dabbler: 0, casual: 0, habitual: 0, devotee: 0, fanatic: 0 };
      G.hype = 50; G.commitment = 50; G.referrals = 0; G.reputation = BAR_MAX;
      G.boredom = 0; G.lastActions = []; G.activeBoredomEffects = []; G.boredomEffectHour = -1;
      G.releaseMetPlayers = false; G.releaseMetHype = false; G.releaseMetCommitment = false; G.releaseMetReferrals = false;
      G.tickCount = 0; G.elapsedSec = 0;
      G.activeActions = []; G.unlocked = {}; G.pendingNewPlayers = 0;
      renderActiveSlots();
      activeCountEl.textContent = 0;
      G.tickerPool = headline ? [headline] : [];
      checkUnlocks();
      updateUI();
    }
    function showRebrandActionPrompt(headline) {
      Game.Prompt(
        '<h3>Rebrand</h3><div class="block"><div class="line"></div>Are you sure you want to rebrand? You will lose all your progress and start over from scratch.<div class="line"></div>No prestige will be awarded.</div>',
        [['Yes', 'Game.ClosePrompt();window.DownlineMinigame.doRebrand(\'' + headline + '\');'], 'No']
      );
    }
    function downlineShowReleasePrompt() {
      Game.Prompt(
        '<h3>Release Fractal Engine Minigame</h3><div class="block"><div class="line"></div>Are you sure you want to release the Fractal Engine Minigame? You will lose all your Downline Minigame progress but the game will run twice as fast and you will gain 10% of your boost permanently until your next ascension.</div>',
        [['Release!', 'Game.ClosePrompt();window.DownlineMinigame.downlineDoRelease();'], 'No']
      );
    }
        var releaseBtn = $('downline-release-btn');
    var releaseWrapEl = $('downline-release-wrap');
    if (releaseWrapEl) addTooltipListeners(releaseWrapEl);
    if (releaseBtn) {
      releaseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!G.releaseMetPlayers || !G.releaseMetHype || !G.releaseMetCommitment || G.reputation <= 750 || !G.releaseMetReferrals || totalPlayers() < 1500) return;
        downlineShowReleasePrompt();
      });
    }
    var lumpWrap = $('downline-lump-wrap');
    if (lumpWrap) {
      addTooltipListeners(lumpWrap);
      lumpWrap.addEventListener('click', function (e) {
        e.preventDefault();
        if (lumpBoostState.active) return;
        if (Game.lumps >= 1) {
          Game.Prompt(
            '<h3>Sugar Rush&reg;</h3><div class="block"><div class="line"></div>Spend 1 sugar lump to increase Downline speed by 10x for 30 minutes?<div class="line">',
            [['Yes', 'Game.ClosePrompt();window.DownlineMinigame.activateSugarRush();'], 'No']
          );
        }
      });
    }

    var SPEEDS = [0,1,10,100,1000,10000];
    SPEEDS.forEach(function (spd) {
      $('debug-speed-' + spd).addEventListener('click', function () {
        G.speed = spd;
        SPEEDS.forEach(function (s) { $('debug-speed-' + s).classList.toggle('active', s === spd); });
      });
    });
    $('debug-speed-1').classList.add('active');

    $('debug-fractal-level').addEventListener('input', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v)) { G.fractalLevel = clamp(v, 1, 20); updateSlotAvailability(); }
    });

    $('debug-apply-state').addEventListener('click', function () {
      function dv(id) {
        var el = $(id); if (!el || el.value === '') return null;
        var v = parseInt(el.value, 10); return isNaN(v) ? null : Math.max(0, v);
      }
      function df(id) {
        var el = $(id); if (!el || el.value === '') return null;
        var v = parseFloat(el.value); return isNaN(v) ? null : Math.max(0, v);
      }
      TYPES.forEach(function (t) { var v = dv('debug-' + t); if (v !== null) G.players[t] = v; });
      var h = dv('debug-hype'); if (h !== null) G.hype = Math.min(BAR_MAX, h);
      var c = dv('debug-commitment'); if (c !== null) G.commitment = Math.min(BAR_MAX, c);
      var r = dv('debug-referrals'); if (r !== null) G.referrals = Math.min(BAR_MAX, r);
      var rep = dv('debug-reputation'); if (rep !== null) G.reputation = Math.min(BAR_MAX, rep);
      var raw = df('debug-rawcps'); if (raw !== null) G.rawCpS = raw;
      var bor = dv('debug-boredom'); if (bor !== null) G.boredom = Math.min(BOREDOM_MAX, Math.max(0, bor));
      var bc = df('debug-bonus-cap'); if (bc !== null) G.bonusCap = Math.max(0, bc);
      var bk = df('debug-bonus-k'); if (bk !== null) G.bonusK = Math.max(0, bk);
      var bp = df('debug-bonus-pow'); if (bp !== null) G.bonusPow = Math.max(0, bp);
      var he = df('debug-bonus-hype-exp'); if (he !== null) G.bonusHypeExp = Math.max(0, he);
      var ce = df('debug-bonus-commit-exp'); if (ce !== null) G.bonusCommitExp = Math.max(0, ce);
      var w0 = df('debug-weight-dabbler');
      var w1 = df('debug-weight-casual');
      var w2 = df('debug-weight-habitual');
      var w3 = df('debug-weight-devotee');
      var w4 = df('debug-weight-fanatic');
      if (w0 !== null || w1 !== null || w2 !== null || w3 !== null || w4 !== null) {
        var def = PLAYER_WEIGHT;
        G.playerWeight = [
          w0 !== null ? Math.max(0, w0) : def[0],
          w1 !== null ? Math.max(0, w1) : def[1],
          w2 !== null ? Math.max(0, w2) : def[2],
          w3 !== null ? Math.max(0, w3) : def[3],
          w4 !== null ? Math.max(0, w4) : def[4]
        ];
      }
      var rd = df('debug-ref-dab'), rc = df('debug-ref-cas'), rh = df('debug-ref-hab'), rdev = df('debug-ref-dev'), rfan = df('debug-ref-fan');
      if (rd !== null || rc !== null || rh !== null || rdev !== null || rfan !== null) {
        var defR = REFERRAL_RATE;
        G.refRates = [
          rd !== null ? Math.max(0, rd) : defR[0],
          rc !== null ? Math.max(0, rc) : defR[1],
          rh !== null ? Math.max(0, rh) : defR[2],
          rdev !== null ? Math.max(0, rdev) : defR[3],
          rfan !== null ? Math.max(0, rfan) : defR[4]
        ];
      }
      var hmid = df('debug-ref-hype-mid'); if (hmid !== null) G.refHypeMid = Math.max(1, hmid);
      var hcap = df('debug-ref-hype-cap'); if (hcap !== null) G.refHypeCap = Math.max(0, hcap);
      var wmin = df('debug-ref-wom-min'); if (wmin !== null) G.refWomMin = Math.max(0, Math.min(1, wmin));
      var wmax = df('debug-ref-wom-max'); if (wmax !== null) G.refWomMax = Math.max(0, wmax);
      var rexp = df('debug-ref-exp'); if (rexp !== null) G.refPlayerCountExp = Math.max(0.1, Math.min(1, rexp));
      if (bor !== null) updateBoredomEffects();
      syncDebugLabels();
      clearDebugInputs();
      checkUnlocks(); updateUI();
    });

    $('debug-shuffle-boredom').addEventListener('click', function () {
      G.boredomEffectHour = -1;
      updateBoredomEffects();
      updateUI();
    });

    function startTickerAnimationIfNeeded() {
      if (!tickerAnimationRunning) {
        tickerAnimationRunning = true;
        requestAnimationFrame(tickerAnimationLoop);
      }
    }

    function runTickerInit() {
      clearTickerStripAndPool();
      resetTickerPosition();
      updateSlotAvailability();
      checkUnlocks();
      updateUI();
      syncDebugLabels();
      setTimeout(startTickerAnimationIfNeeded, 100);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runTickerInit);
    } else {
      runTickerInit();
    }

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        clearTickerStripAndPool();
        resetTickerPosition();
        }
    });

    // Only set initial effects if not already set (prevent re-execution on script reload during toggle)
    if (!DownlineM.effs || !DownlineM._initialEffsSet) {
        var totBoost = getCurrentBoost() + (G.prestigeBoost || 0);
        if (G.frozen) totBoost *= FROZEN_SPEED_FRAC;
        DownlineM.effs = { cps: 1 + totBoost / 100 };
        DownlineM._initialEffsSet = true;
        Game.recalculateGains = 1;
    } else {
    }

    DownlineM._buildSaveDataImpl = function () {
      var data = {
        v: 1,
        players: G.players,
        hype: G.hype,
        commitment: G.commitment,
        referrals: G.referrals,
        reputation: G.reputation,
        boredom: G.boredom,
        lastActions: G.lastActions.slice(0, LAST_ACTIONS_CAP),
        activeBoredomEffects: (G.activeBoredomEffects || []).slice(0),
        boredomEffectHour: G.boredomEffectHour,
        releaseMetPlayers: !!G.releaseMetPlayers,
        releaseMetHype: !!G.releaseMetHype,
        releaseMetCommitment: !!G.releaseMetCommitment,
        releaseMetReferrals: !!G.releaseMetReferrals,
        prestigeBoost: G.prestigeBoost || 0,
        prestige: G.prestige || 0,
        releasesThisAscension: G.releasesThisAscension || 0,
        unlocked: G.unlocked || {},
        pendingNewPlayers: G.pendingNewPlayers || 0,
        frozen: !!G.frozen,
        lumpSpeedBoostEnd: G.lumpSpeedBoostEnd || 0,
        activeActions: G.activeActions.map(function (a) {
          return { name: a.name, totalSec: a.totalSec, remainSec: a.remainSec };
        })
      };
      var isVisible = 0;
      var fractalEngine = getFractalEngine();
      if (fractalEngine) isVisible = fractalEngine.onMinigame ? 1 : 0;
      data.isVisible = isVisible;
      return data;
    };

    DownlineM._saveImpl = function () {
      var payload = DownlineM._buildSaveDataImpl();
      var saveString = '';
      try {
        saveString = JSON.stringify(payload);
      } catch (e) {
        saveString = '';
      }
      if (window.DownlineMinigame && window.DownlineMinigame.writeCache) {
        window.DownlineMinigame.writeCache(saveString);
      }
      return saveString;
    };

    DownlineM._loadImpl = function (str) {
      if (!str || str === '') {
        DownlineM._resetImpl(false);
        return;
      }
      var data = null;
      try {
        data = JSON.parse(str);
      } catch (e) {
        DownlineM._resetImpl(false);
        return;
      }
      if (!data || typeof data !== 'object') {
        DownlineM._resetImpl(false);
        return;
      }
      var prevPrestige = G.prestige || 0;
      var prevPrestigeBoost = G.prestigeBoost || 0;
      DownlineM._resetImpl(false);

      if (data.players && typeof data.players === 'object') {
        var p = data.players;
        G.players = {
          dabbler: Math.max(0, p.dabbler || 0),
          casual: Math.max(0, p.casual || 0),
          habitual: Math.max(0, p.habitual || 0),
          devotee: Math.max(0, p.devotee || 0),
          fanatic: Math.max(0, p.fanatic || 0)
        };
      }
      if (typeof data.hype === 'number') G.hype = Math.max(0, Math.min(BAR_MAX, data.hype));
      if (typeof data.commitment === 'number') G.commitment = Math.max(0, Math.min(BAR_MAX, data.commitment));
      if (typeof data.referrals === 'number') G.referrals = Math.max(0, Math.min(BAR_MAX, data.referrals));
      if (typeof data.reputation === 'number') G.reputation = Math.max(0, Math.min(BAR_MAX, data.reputation));
      if (typeof data.boredom === 'number') G.boredom = Math.max(0, Math.min(BOREDOM_MAX, data.boredom));
      if (Array.isArray(data.lastActions)) {
        G.lastActions = data.lastActions.slice(0, LAST_ACTIONS_CAP).map(function (x) { return String(x); });
      }
      if (Array.isArray(data.activeBoredomEffects)) {
        G.activeBoredomEffects = data.activeBoredomEffects.filter(function (id) {
          return BOREDOM_EFFECT_IDS.indexOf(id) >= 0;
        });
      }
      if (typeof data.boredomEffectHour === 'number') {
        G.boredomEffectHour = data.boredomEffectHour;
      }
      G.releaseMetPlayers = !!data.releaseMetPlayers;
      G.releaseMetHype = !!data.releaseMetHype;
      G.releaseMetCommitment = !!data.releaseMetCommitment;
      G.releaseMetReferrals = !!data.releaseMetReferrals;
      if (typeof data.prestigeBoost === 'number') G.prestigeBoost = data.prestigeBoost;
      else G.prestigeBoost = prevPrestigeBoost;
      if (typeof data.prestige === 'number') G.prestige = Math.max(0, data.prestige);
      else G.prestige = prevPrestige;
      if (typeof data.releasesThisAscension === 'number') G.releasesThisAscension = Math.max(0, data.releasesThisAscension);
      if (data.unlocked && typeof data.unlocked === 'object') {
        G.unlocked = data.unlocked;
      }
      if (typeof data.pendingNewPlayers === 'number') G.pendingNewPlayers = Math.max(0, data.pendingNewPlayers);
      G.frozen = !!data.frozen;
      if (typeof data.lumpSpeedBoostEnd === 'number') {
        G.lumpSpeedBoostEnd = data.lumpSpeedBoostEnd;
      }

      G.activeActions = [];
      if (Array.isArray(data.activeActions)) {
        data.activeActions.forEach(function (saved) {
          if (!saved || typeof saved.name !== 'string') return;
          var def = ACTIONS[saved.name];
          if (!def) return;
          var chip = document.createElement('span');
          chip.className = 'downline-active-chip';
          chip.setAttribute('data-name', saved.name);
          chip.title = saved.name;
          chip.appendChild(createIcon(def.icon[0], def.icon[1], def.sheet));
          var overlay = document.createElement('span');
          overlay.className = 'downline-active-overlay';
          chip.appendChild(overlay);
          var total = (typeof saved.totalSec === 'number' && saved.totalSec > 0) ? saved.totalSec : (def.durationSec || 0);
          total = Math.max(total, 0.001);
          var remain = (typeof saved.remainSec === 'number') ? saved.remainSec : total;
          remain = Math.max(0, Math.min(total, remain));
          var state = { name: saved.name, totalSec: total, remainSec: remain };
          var stateIndex = G.activeActions.length;
          chip.setAttribute('data-state-index', stateIndex);
          G.activeActions.push(state);
          addTooltipListeners(chip);
        });
      }

      renderActiveSlots();
      if (activeCountEl) activeCountEl.textContent = G.activeActions.length;
      checkUnlocks();
      updateUI();
      syncDebugLabels();
      DownlineM.updateLumpBoostState();

      var fractalEngine = getFractalEngine();
      if (fractalEngine && data.isVisible) {
        setTimeout(function () {
          var fe = getFractalEngine();
          if (fe && !fe.onMinigame) {
            if (fe.switchMinigame) {
              fe.switchMinigame(true);
            } else {
              fe.onMinigame = 1;
              if (fe.minigameDiv && fe.minigameDiv.parentNode) {
                fe.minigameDiv.parentNode.classList.add('onMinigame');
              }
              if (fe.refresh) fe.refresh();
            }
          }
        }, 50);
      }
    };

    DownlineM._resetImpl = function (hard) {
      // Force hard reset during ascension to wipe all data
      if (Game.OnAscend || Game.AscendTimer > 0) {
        hard = true;
      }
      var keepPrestige = !hard;
      var prevPrestige = keepPrestige ? (G.prestige || 0) : 0;
      var prevPrestigeBoost = keepPrestige ? (G.prestigeBoost || 0) : 0;
      G.players = { dabbler: 0, casual: 0, habitual: 0, devotee: 0, fanatic: 0 };
      G.hype = 50;
      G.commitment = 50;
      G.referrals = 0;
      G.reputation = BAR_MAX;
      G.rawCpS = 1;
      G.unfrozenRawCpS = 1;
      G.boredom = 0;
      G.lastActions = [];
      G.activeBoredomEffects = [];
      G.boredomEffectHour = -1;
      G.releaseMetPlayers = false;
      G.releaseMetHype = false;
      G.releaseMetCommitment = false;
      G.releaseMetReferrals = false;
      G.tickCount = 0;
      G.elapsedSec = 0;
      G.speed = 1;
      G.activeActions = [];
      G.unlocked = {};
      G.pendingNewPlayers = 0;
      G.fractalLevel = 20;
      G.tickerPool = [];
      G.frozen = false;
      G.lumpSpeedBoostEnd = 0;
      G._supremeIntellectWasActive = false;
      G.lastTickTime = 0;
      lumpBoostState.active = false;
      if (keepPrestige) {
        G.prestige = prevPrestige;
        G.prestigeBoost = prevPrestigeBoost;
      } else {
        G.prestige = 0;
        G.prestigeBoost = 0;
      }
      if (hard) G.releasesThisAscension = 0;
      renderActiveSlots();
      if (activeCountEl) activeCountEl.textContent = 0;
      checkUnlocks();
      updateUI();
      syncDebugLabels();
    };

    DownlineM.getAchievementState = function () {
      return {
        hype: G.hype || 0,
        commitment: G.commitment || 0,
        referrals: G.referrals || 0,
        reputation: G.reputation || 0,
        players: totalPlayers(),
        releasesThisAscension: G.releasesThisAscension || 0
      };
    };
    DownlineM.updateNewsTicker = updateNewsTicker;
    DownlineM.doRebrand = doRebrand;
    DownlineM.downlineDoRelease = downlineDoRelease;
    DownlineM.activateSugarRushImpl = function() {
      Game.lumps -= 1;
      Game.recalculateGains = 1;
      G.lumpSpeedBoostEnd = Date.now() + 30 * 60 * 1000;
      DownlineM.updateLumpBoostState();
      if (PlaySound) PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
    };

    if (DownlineM.createAchievements) DownlineM.createAchievements();
    DownlineM.launched = true;
  };

  DownlineM.buildSaveString = function () {
    var data = DownlineM._buildSaveDataImpl();
    try { return JSON.stringify(data); } catch (e) { return ''; }
  };
  DownlineM.buildSaveData = function () {
    return DownlineM._buildSaveDataImpl();
  };
  DownlineM.save = function () {
    return DownlineM._saveImpl();
  };
  DownlineM.load = function (str) {
    DownlineM._loadImpl(str);
  };
  DownlineM.reset = function (hard) {
    DownlineM._resetImpl(hard);
  };

DownlineM.logic = function() {
  var fractalEngine = getFractalEngine();
  if (!fractalEngine || !fractalEngine.onMinigame) return;
  if (DownlineM.gameTick) {
    if (Game.T % 5 === 0 && DownlineM.updateLumpBoostState) {
      DownlineM.updateLumpBoostState();
    }
    DownlineM.gameTick();
  }
};

DownlineM.draw = function() {};

DownlineM.createAchievements = function() {
    createDownlineAchievements();
    checkAndAwardDownlineAchievements();
};

DownlineM.removeAchievements = function() {
    removeDownlineAchievements();
};

function createDownlineAchievements() {
    if (!Game.JNE || !Game.JNE.createAchievement) {
        return;
    }
    if (Game.JNE.enableDownlineMinigame === false) {
        return;
    }
    var needsCreation = false;
    for (var i = 0; i < downlineAchievementNames.length; i++) {
        var originalName = downlineAchievementNames[i];
        var hiddenName = originalName + ' [DISABLED]';
        if (!Game.Achievements[originalName] && !Game.Achievements[hiddenName]) {
            needsCreation = true;
            break;
        }
    }
    if (!needsCreation) {
        for (var i = 0; i < downlineAchievementNames.length; i++) {
            var originalName = downlineAchievementNames[i];
            var hiddenName = originalName + ' [DISABLED]';
            if (Game.Achievements[hiddenName]) {
                var ach = Game.Achievements[hiddenName];
                ach.pool = 'normal';
                if (ach._savedWonStatus) {
                    ach.won = 1;
                }
                Game.Achievements[originalName] = ach;
                delete Game.Achievements[hiddenName];
                delete ach._originalName;
                if (ach.id !== undefined && Game.AchievementsById[ach.id]) {
                    Game.AchievementsById[ach.id] = ach;
                }
            } else if (Game.Achievements[originalName]) {
                var ach = Game.Achievements[originalName];
                ach.pool = 'normal';
            }
        }
        downlineAchievementState.achievementsCreated = true;
        return;
    }
    var baseOrder = 61628;
    var downlineAchievements = [
      {
        name: 'Popularity factor',
        desc: 'Have <b>Hype</b>, <b>Commitment</b>, <b>Reputation</b>, and <b>Word of Mouth</b> over 950 at once in the Downline minigame.<q>You haven\'t been this popular since you got 13 votes for class treasurer in 10th grade, but this time you did better than 7th place.</q>',
        icon: [18, 9, DOWNLINE_CUSTOM_SPRITE_URL],
        order: baseOrder + 0.1
    },
    {
        name: 'Factorial factor',
        desc: 'Release the <b>Fractal Engine minigame</b> 5 times in the Downline minigame in one ascension.<q>Buckle your seatbelts we are going full recursive on this one.</q>',
        icon: [18, 8, DOWNLINE_CUSTOM_SPRITE_URL],
        order: baseOrder + 0.3
    },
    {
        name: 'Big tent factor',
        desc: 'Have <b>25,000 players</b> at one time in the Downline minigame.<q>You have more friends than Tila Tequila had on Facebook in 2006, but all of yours are recruiting their own friends to play Cookie Clicker; it’s a veritable pyramid scheme in here.</q>',
        icon: [18, 10, DOWNLINE_CUSTOM_SPRITE_URL],
        order: baseOrder + 0.2
    }
    ];
    var state = DownlineM.getAchievementState();
    var popular = state && state.hype > 950 && state.commitment > 950 && state.reputation > 950 && state.referrals > 950;
    var factorial = state && state.releasesThisAscension >= 5;
    var bigTent = state && state.players >= 25000;
    for (var index = 0; index < downlineAchievements.length; index++) {
        var achData = downlineAchievements[index];
        var shouldBeWon = false;
        if (index === 0) shouldBeWon = !!popular;
        else if (index === 1) shouldBeWon = !!factorial;
        else if (index === 2) shouldBeWon = !!bigTent;
        var achievement = Game.JNE.createAchievement(
            achData.name,
            achData.desc,
            null,
            achData.order,
            null,
            achData.icon
        );
        if (achievement) {
            achievement.pool = 'normal';
            if (shouldBeWon) {
                achievement.won = 1;
                achievement._restoredFromSave = true;
                if (!Game.AchievementsOwned) Game.AchievementsOwned = 0;
                Game.AchievementsOwned++;
                if (Game.stats && Game.stats['Achievements unlocked']) {
                    Game.stats['Achievements unlocked']++;
                }
            }
        }
    }
    downlineAchievementState.achievementsCreated = true;
    if (!DownlineM._checkHookRegistered) {
        DownlineM._checkHookRegistered = true;
        setTimeout(function () {
            if (Game.registerHook) Game.registerHook('check', checkAndAwardDownlineAchievements);
        }, 0);
    }
}

function removeDownlineAchievements() {
    if (!Game || !Game.Achievements) {
        return;
    }
    downlineAchievementNames.forEach(function(achievementName) {
        var hiddenName = achievementName + ' [DISABLED]';
        if (Game.Achievements[achievementName]) {
            var achievement = Game.Achievements[achievementName];
            if (achievement.won) {
                achievement._savedWonStatus = true;
            }
            achievement.pool = 'shadow';
            achievement.won = 0;
            achievement._originalName = achievementName;
            Game.Achievements[hiddenName] = achievement;
            delete Game.Achievements[achievementName];
            if (achievement.id !== undefined && Game.AchievementsById[achievement.id]) {
                Game.AchievementsById[achievement.id] = achievement;
            }
        } else if (Game.Achievements[hiddenName]) {
            var hiddenAchievement = Game.Achievements[hiddenName];
            hiddenAchievement.pool = 'shadow';
            hiddenAchievement.won = 0;
        }
    });
    downlineAchievementState.achievementsCreated = false;
    if (Game.Achievements) {
        var newAchievementsOwned = 0;
        for (var achName in Game.Achievements) {
            var ach = Game.Achievements[achName];
            if (ach && ach.won && ach.pool !== 'shadow') {
                newAchievementsOwned++;
            }
        }
        Game.AchievementsOwned = newAchievementsOwned;
    }
}

function checkAndAwardDownlineAchievements() {
    if (checkAndAwardDownlineAchievements._inProgress) return;
    if (!downlineAchievementState.achievementsCreated) return;
    checkAndAwardDownlineAchievements._inProgress = true;
    try {
        var state = DownlineM.getAchievementState();
        var popular = state.hype > 950 && state.commitment > 950 && state.reputation > 950 && state.referrals > 950;
        var factorial = state.releasesThisAscension >= 5;
        var bigTent = state.players >= 25000;
        var checks = [popular, factorial, bigTent];
        for (var i = 0; i < downlineAchievementNames.length; i++) {
            if (!checks[i]) continue;
            var achName = downlineAchievementNames[i];
            var ach = Game.Achievements[achName];
            if (!ach || ach.won) continue;
            if (ach._restoredFromSave) ach._restoredFromSave = false;
            try {
                if (Game.JNE && Game.JNE.markAchievementWon) Game.JNE.markAchievementWon(achName);
                if (!Game.Achievements[achName].won) Game.Win(achName);
            } catch (e) {}
        }
    } finally {
        checkAndAwardDownlineAchievements._inProgress = false;
    }
}

function initializeDownlineMinigame() {
    var fractalEngine = getFractalEngine();
    if (!fractalEngine) return;
    var flagDefined = !!(Game.JNE && Game.JNE.enableDownlineMinigame !== undefined);
    var isConsoleLoading = !flagDefined || (Game.JNE && Game.JNE.enableDownlineMinigame === false);
    var isEnabled = flagDefined ? !!Game.JNE.enableDownlineMinigame : true;

    function ensureMinigameDiv() {
        if (fractalEngine.minigameDiv) return;
        var existingDiv = l('rowSpecial' + fractalEngine.id);
        if (existingDiv) {
            fractalEngine.minigameDiv = existingDiv;
        } else {
            fractalEngine.minigameDiv = document.createElement('div');
            fractalEngine.minigameDiv.id = 'rowSpecial' + fractalEngine.id;
            fractalEngine.minigameDiv.className = 'rowSpecial';
            if (fractalEngine.l) fractalEngine.l.appendChild(fractalEngine.minigameDiv);
        }
    }

    function bootMinigame() {
        if (!fractalEngine) return;
        if (!fractalEngine.minigameLoaded) {
            fractalEngine.minigameLoaded = true;
            fractalEngine.minigameName = fractalEngine.minigameName || 'Downline';
            fractalEngine.minigameLoading = false;
        }

        ensureMinigameDiv();
        DownlineM.launch();
        DownlineM.init(fractalEngine.minigameDiv);

        if (Game.JNE && Game.JNE.downlineSavedData) {
            DownlineM.load(Game.JNE.downlineSavedData);
        }

        if (!fractalEngine.minigame) {
            fractalEngine.minigame = DownlineM;
        }

        if (isConsoleLoading && !fractalEngine.minigameUrl) {
            fractalEngine.minigameUrl = 'downline';
            fractalEngine.minigameIcon = [19, 11];
        }

        if (typeof fractalEngine.refresh === 'function') {
            fractalEngine.refresh();
        }
        if (isConsoleLoading && Game.ObjectsById && Game.ObjectsById[fractalEngine.id] && typeof Game.ObjectsById[fractalEngine.id].draw === 'function') {
            Game.ObjectsById[fractalEngine.id].draw();
        }
    }

    if (isEnabled || isConsoleLoading) {
        try {
            var minigameIsStub = !fractalEngine.minigame || !fractalEngine.minigame.init;
            if (!fractalEngine.minigameLoaded) {
                bootMinigame();
            } else if (minigameIsStub) {
                bootMinigame();
            } else if (fractalEngine.minigameLoaded && !DownlineM.launched) {
                DownlineM.launch();
                ensureMinigameDiv();
                DownlineM.init(fractalEngine.minigameDiv);
                
                if (Game.JNE && Game.JNE.downlineSavedData) {
                    DownlineM.load(Game.JNE.downlineSavedData);
                }
            }
        } catch (e) {
            fractalEngine.minigameLoading = false;
            throw e;
        }
        fractalEngine.minigameLoading = false;

        if (!fractalEngine.minigameUrl) {
            fractalEngine.minigameUrl = 'downline';
        }
    } else {
        fractalEngine.minigameLoading = false;
        if (DownlineM.removeAchievements) {
            DownlineM.removeAchievements();
        } else {
            removeDownlineAchievements();
        }
    }

    if (fractalEngine.switchMinigame) {
        var _origSwitchMinigame = fractalEngine.switchMinigame;
        fractalEngine.switchMinigame = function(on) {
            var result = _origSwitchMinigame.apply(this, arguments);
            var specialEl = document.getElementById('rowSpecial' + this.id);
            if (specialEl && this.onMinigame && specialEl.style.display === 'none') {
                specialEl.style.display = '';
            }
            return result;
        };
    }
}

initializeDownlineMinigame();

if (!getFractalEngine() || !getFractalEngine().minigame) {
    setTimeout(function() {
        initializeDownlineMinigame();
    }, 1000);
}

var existingAPI = window.DownlineMinigame || {};
var publicAPI = {
  save: function() { return DownlineM._saveImpl(); },
  load: function(str) { DownlineM._loadImpl(str); },
  reset: function(hard) { DownlineM._resetImpl(hard); },
  buildSaveString: function() {
    var data = DownlineM._buildSaveDataImpl();
    try { return JSON.stringify(data); } catch (e) { return ''; }
  },
  buildSaveData: function() { return DownlineM._buildSaveDataImpl(); },
  createAchievements: createDownlineAchievements,
  removeAchievements: removeDownlineAchievements,
  getAchievementState: function() {
    return DownlineM.getAchievementState();
  },
  doRebrand: function(headline) {
    if (DownlineM.doRebrand) DownlineM.doRebrand(headline);
  },
  downlineDoRelease: function() {
    if (DownlineM.downlineDoRelease) DownlineM.downlineDoRelease();
  },
  updateNewsTicker: function() {
    if (DownlineM.updateNewsTicker) DownlineM.updateNewsTicker();
  },
  activateSugarRush: function() {
    if (Game.lumps >= 1 && DownlineM.activateSugarRushImpl) {
      DownlineM.activateSugarRushImpl();
    }
  },
  getSaveData: existingAPI.getSaveData || undefined,
  applySaveData: existingAPI.applySaveData || undefined,
  writeCache: existingAPI.writeCache || undefined,
  requestSave: existingAPI.requestSave || undefined
};

for (var key in publicAPI) {
  if (publicAPI[key] === undefined) delete publicAPI[key];
}

Object.defineProperty(window, 'DownlineMinigame', {
  value: Object.freeze(publicAPI),
  writable: false,
  enumerable: false,
  configurable: true
});

Object.defineProperty(window, 'removeDownlineAchievements', {
  value: removeDownlineAchievements,
  writable: false,
  enumerable: false,
  configurable: true
});
Object.defineProperty(window, 'createDownlineAchievements', {
  value: createDownlineAchievements,
  writable: false,
  enumerable: false,
  configurable: true
});

})();

// Clone Escape minigame
(function() {
'use strict';

const CLONES_VERSION = '1.0.2';
var PUZZLE_BASE_BETA = 'https://raw.githubusercontent.com/dfsw/Cookies/beta/puzzles/';
var PUZZLE_BASE_RELEASE = 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/main/assets/ClonePuzzles/';
var PUZZLE_BASE_FALLBACK = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/ClonePuzzles/';
function puzzleBase() { return (Game.JNE && Game.JNE.beta === false) ? PUZZLE_BASE_RELEASE : PUZZLE_BASE_BETA; }
// release files retry on the jsDelivr mirror when raw.githubusercontent.com won't load
function puzzleFetch(path) {
    var base = puzzleBase();
    var get = function(b) {
        return fetch(b + path + '?t=' + Date.now()).then(function(r) {
            if (!r.ok) throw r;
            return r.json();
        });
    };
    return get(base).catch(function(e) {
        if (base !== PUZZLE_BASE_RELEASE || e instanceof SyntaxError) throw e;
        return get(PUZZLE_BASE_FALLBACK);
    });
}
function puzzleCooldown() { return ClonesM.debug ? 15 * 1000 : 2 * 3600 * 1000; }
var TIERS = { E: 'Easy', M: 'Medium', T: 'Tricky', H: 'Hard', V: 'Evil' };
var TIER_KEYS = ['E', 'M', 'T', 'H', 'V'];
var TIER_ICONS = [[12, 8], [11, 6], [11, 7], [11, 8], [29, 6]]; 

var ClonesM = {};
window.ClonesM = ClonesM;

var _clonesDebug = false;
Object.defineProperty(ClonesM, 'debug', {
    get: function() { return _clonesDebug; },
    set: function(v) {
        _clonesDebug = !!v;
        if (_clonesDebug && G.nextPuzzleAt > Date.now() + 15000) G.nextPuzzleAt = Date.now() + 15000;
        updateCooldown();
        syncTierIcons();
        if (G.claimed && l('clonesClues')) showStats(l('clonesClues'));
    }
});

function getYou() { return Game.Objects && Game.Objects['You']; }
ClonesM.parent = getYou() || {
    id: 0, level: 10, minigameName: 'Clone Escape', minigameLoaded: false,
    minigameLoading: false, minigameDiv: null, l: null, refresh: function() {}
};
if (getYou()) ClonesM.parent.minigame = ClonesM;

var NAMES = (
  'Alex Arden Ari Ash Avery Bailey Blair Blake Cameron Casey Charlie ' +
  'Dakota Dana Drew Emerson Finley Hayden Indigo Jackie Jamie Jesse Jo ' +
  'Jordan Jules Kai Kendall Kit Lane Logan Marley Morgan Nicky Parker Pat ' +
  'Quinn Reese Remy Riley River Robin Rowan Sage Sam Sawyer Sidney Skyler Terry Taylor'
).split(' ');

var COLS = 'ABCD';
var ALL_CELLS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
function cellId(i) { return COLS[i % 4] + (Math.floor(i / 4) + 1); }
function cellIdx(id) { return (parseInt(id.slice(1), 10) - 1) * 4 + COLS.indexOf(id[0]); }
function shuffle(a, rng) {
    var R = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(R() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

var clonesAchievementNames = [
    'The Quick and the Duplicate', 'An Allegedly Perfect Record', 'Doppelganger gang',
    'The Devil You Clone', 'The Devil Is in the Duplicates'
];
function awardClonesAchievement(name, met) {
    if (!met) return;
    var ach = Game.Achievements && Game.Achievements[name];
    if (!ach || ach.won) return;
    if (Game.JNE && Game.JNE.isAccomplishmintSuppressed && Game.JNE.isAccomplishmintSuppressed(name)) return;
    if (Game.JNE && Game.JNE.markAchievementWon) Game.JNE.markAchievementWon(name);
    Game.Win(name);
}

// appearance traits
var TRAITS = {
    glasses:  { prop: 'acc',     extras: [1, 2, 3, 4, 21], block: []      },
    beard:    { prop: 'acc',     extras: [6, 7],           block: [5, 8]  },
    halo:     { prop: 'acc',     extras: [18],             block: []      },
    mask:     { prop: 'acc',     extras: [23],             block: []      },
    bald:     { prop: 'hair',    indexes: [0, 13],         block: [12]    },
    redhair:  { prop: 'hairCol', indexes: [4, 5, 8, 12],   block: []      },
    bluehair: { prop: 'hairCol', indexes: [9, 10, 17],     block: [14]    },
    blueskin: { prop: 'skinCol', indexes: [8, 9],          block: []      },
    greenskin:{ prop: 'skinCol', indexes: [11],            block: []      }
};
var GENE_IDX = { hair: 0, hairCol: 1, skinCol: 2 };
var PROP_COUNT = { hair: 17, hairCol: 18, skinCol: 15 };
var HAIR_BALD_LIKE = [0, 13, 12];
var ACC_SLOTS = [5, 6];
var EXTRAS_COUNT = 36;
var PROP_OF = function(t) { return (TRAITS[t] || {}).prop; };
var reservedFor = function(t) { var tr = TRAITS[t]; return tr ? (tr.extras || tr.indexes).concat(tr.block || []) : []; };

function pickSafe(count, forbidden, rng) {
    var safe = [];
    for (var i = 0; i < count; i++) if (!forbidden.has(i)) safe.push(i);
    return safe.length ? safe[Math.floor((rng || Math.random)() * safe.length)] : 0;
}
// genes: [hair, hairCol, skinCol, head, face, acc1, acc2]
function enforceTraits(genes, cardTraits, usedTraits, rng) {
    var g = genes.slice();
    var wanted = (cardTraits || []).filter(function(t) { return TRAITS[t]; });
    // in-play traits reserve their indexes on cards that don't want them
    var accForbid = new Set();
    var propForbid = { hair: new Set(), hairCol: new Set(), skinCol: new Set() };
    var sinkFor = function(t) { return PROP_OF(t) === 'acc' ? accForbid : propForbid[PROP_OF(t)]; };
    usedTraits.forEach(function(t) {
        if (wanted.indexOf(t) === -1) reservedFor(t).forEach(function(i) { sinkFor(t).add(i); });
    });
    wanted.forEach(function(t) { (TRAITS[t].block || []).forEach(function(i) { sinkFor(t).add(i); }); });
    if (wanted.some(function(t) { return PROP_OF(t) === 'hairCol'; }))
        HAIR_BALD_LIKE.forEach(function(i) { propForbid.hair.add(i); });

    // each wanted acc trait claims a free slot 
    var slots = ACC_SLOTS.map(function(n) { return g[n]; });
    var wantedExtra = function(s) { return wanted.some(function(w) { return (TRAITS[w].extras || []).indexOf(s) !== -1; }); };
    wanted.forEach(function(t) {
        var ex = TRAITS[t].extras;
        if (!ex || slots.some(function(s) { return ex.indexOf(s) !== -1; })) return;
        var free = slots.findIndex(function(s) { return ex.indexOf(s) === -1 && !wantedExtra(s); });
        if (free < 0) free = slots.findIndex(function(s) { return !wantedExtra(s); });
        slots[free < 0 ? 0 : free] = ex[Math.floor((rng || Math.random)() * ex.length)];
    });
    for (var s = 0; s < slots.length; s++) if (accForbid.has(slots[s])) {
        var res = new Set(accForbid);
        usedTraits.forEach(function(t) {
            if (PROP_OF(t) === 'acc') reservedFor(t).forEach(function(i) { res.add(i); });
        });
        slots[s] = pickSafe(EXTRAS_COUNT, res, rng);
    }
    g[ACC_SLOTS[0]] = slots[0]; g[ACC_SLOTS[1]] = slots[1];

    for (var prop in GENE_IDX) {
        var gi = GENE_IDX[prop];
        var wants = wanted.find(function(t) { return PROP_OF(t) === prop; });
        var idxs = wants && TRAITS[wants].indexes;
        if (idxs && idxs.indexOf(g[gi]) === -1) g[gi] = idxs[Math.floor((rng || Math.random)() * idxs.length)];
        else if (!wants && propForbid[prop].has(g[gi])) g[gi] = pickSafe(PROP_COUNT[prop], propForbid[prop], rng);
    }
    return g;
}

var GENES = [
    { id: 'hair',    choices: [[0,0],[1,0],[2,0],[3,0],[4,0],[2,1],[3,1],[4,1],[4,2],[5,3],[8,2],[7,1],[5,5],[4,5],[10,0],[9,1],[9,2]] },
    { id: 'hairCol', choices: [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37] },
    { id: 'skinCol', choices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] },
    { id: 'head',    choices: [[0,0],[1,1],[0,1],[4,3],[10,3]] },
    { id: 'face',    choices: [[3,5],[0,0],[0,2],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3],[3,3]] },
    { id: 'acc1',    choices: [[0,0],[5,1],[5,0],[5,2],[0,4],[1,4],[2,4],[6,4],[8,5],[3,4],[7,5],[6,0],[6,1],[4,4],[5,4],[2,5],[7,4],[0,5],[1,5],[6,5],[6,2],[6,3],[7,0],[7,2],[7,3],[8,1],[8,3],[8,4],[9,3],[9,0],[10,1],[10,2],[9,4],[9,5],[10,4],[10,5]] },
    { id: 'acc2',    choices: null }
];
GENES[6].choices = GENES[5].choices; // acc2 shares 
var SPRITES = { you: null, addons: null };
var PALETTE = null;
var SKIN_SRC_ROW = 1, HAIR_SRC_ROW = 22;

function spritesReady(cb) {
    Game.Loader.waitForLoad(['you.png', 'youAddons.png?v=' + Game.version, 'youBackground.png'], function() {
        SPRITES.you = Pic('you.png');
        SPRITES.addons = Pic('youAddons.png?v=' + Game.version);
        SPRITES.youBg = Pic('youBackground.png');
        PALETTE = null;
        try {
            var c = document.createElement('canvas');
            c.width = SPRITES.addons.width; c.height = SPRITES.addons.height;
            c.getContext('2d').drawImage(SPRITES.addons, 0, 0);
            var d = c.getContext('2d').getImageData(1, 0, 3, 38).data;
            PALETTE = [];
            for (var y = 0; y < 38; y++)
                PALETTE.push([[d[y*12], d[y*12+1], d[y*12+2]], [d[y*12+4], d[y*12+5], d[y*12+6]], [d[y*12+8], d[y*12+9], d[y*12+10]]]);
        } catch (e) {}
        cb();
    });
}
function ramp(row) { return PALETTE && PALETTE[row]; }
function colRamp(genes, prop) { var gi = GENE_IDX[prop]; return ramp(GENES[gi].choices[genes[gi]]); }
function remapShades(ctx, w, h, srcRamp, dstRamp) {
    if (!srcRamp || !dstRamp || srcRamp === dstRamp) return;
    var map = {};
    for (var i = 0; i < 3; i++) map[srcRamp[i][0] * 65536 + srcRamp[i][1] * 256 + srcRamp[i][2]] = dstRamp[i];
    var img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (var p = 0; p < d.length; p += 4) {
        if (!d[p + 3]) continue;
        var dst = map[d[p] * 65536 + d[p + 1] * 256 + d[p + 2]];
        if (dst) { d[p] = dst[0]; d[p + 1] = dst[1]; d[p + 2] = dst[2]; }
    }
    ctx.putImageData(img, 0, 0);
}
// returns the center-head 32x32 crop of the 64px body scaled x2
function renderYou(genes) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    var ctx = canvas.getContext('2d');
    if (SPRITES.you) {
        ctx.drawImage(SPRITES.you, 0, 0);
        try { remapShades(ctx, 64, 64, ramp(SKIN_SRC_ROW), colRamp(genes, 'skinCol')); } catch (e) {}
        if (SPRITES.addons) {
            var c = document.createElement('canvas');
            c.width = c.height = 32;
            var cx = c.getContext('2d');
            [4, 3, 0, 5, 6].forEach(function(gi) { // face, head, hair, acc1, acc2
                var tile = GENES[gi].choices[genes[gi]];
                if (!tile || (tile[0] === 0 && tile[1] === 0)) return;
                cx.clearRect(0, 0, 32, 32);
                cx.drawImage(SPRITES.addons, 8 + tile[0] * 32, tile[1] * 32, 32, 32, 0, 0, 32, 32);
                try {
                    var id = GENES[gi].id;
                    if (id === 'hair') remapShades(cx, 32, 32, ramp(HAIR_SRC_ROW), colRamp(genes, 'hairCol'));
                    else if (id === 'head' || id === 'face') remapShades(cx, 32, 32, ramp(SKIN_SRC_ROW), colRamp(genes, 'skinCol'));
                } catch (e) {}
                ctx.drawImage(c, 16, 0);
            });
        }
    }
    var head = document.createElement('canvas');
    head.width = head.height = 32;
    var hx = head.getContext('2d');
    hx.imageSmoothingEnabled = false;
    hx.drawImage(canvas, 16, 0, 32, 32, 0, 0, 32, 32);
    return head;
}

function youSprite(genes) {
    var head = renderYou(genes);
    head.className = 'clones-you-head';
    var halo = document.createElement('canvas');
    halo.width = halo.height = 32;
    halo.className = 'clones-you-halo';
    halo.getContext('2d').drawImage(head, 0, 0);
    var bg = document.createElement('canvas');
    bg.width = bg.height = 32;
    bg.className = 'clones-you-bg';
    if (SPRITES.youBg) bg.getContext('2d').drawImage(SPRITES.youBg, 48, 32, 32, 32, 0, 0, 32, 32);
    var wrap = document.createElement('div');
    wrap.className = 'clones-you';
    wrap.appendChild(bg); wrap.appendChild(halo); wrap.appendChild(head);
    return wrap;
}

// due to problems with built in audio player we deployed an open source one. 
var SND = { ctx: null, noAC: false, bufs: {}, pending: {} };
function loadSnd(url) {
    if (SND.bufs[url] !== undefined) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { SND.noAC = true; SND.bufs[url] = false; return; }
    if (!SND.ctx) {
        // steam's music init replaces window.AudioContext with a live instance; reuse it
        try { SND.ctx = (typeof AC === 'function') ? new AC() : (AC.decodeAudioData ? AC : null); }
        catch (e) { SND.ctx = null; }
        if (!SND.ctx) { SND.noAC = true; SND.bufs[url] = false; return; }
    }
    var ctx = SND.ctx;
    SND.bufs[url] = null;
    fetch(url.indexOf('snd/') === 0 ? (Game.resPath || '') + url : url)
        .then(function(r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function(ab) { return ctx.decodeAudioData(ab); })
        .then(function(b) {
            SND.bufs[url] = b;
            var v = SND.pending[url];
            delete SND.pending[url];
            if (v !== undefined) playSnd(url, v); // replay the last queued call
        })
        .catch(function() { SND.bufs[url] = false; delete SND.pending[url]; });
}
function playSnd(url, vol) {
    try {
        var v = vol === undefined ? 1 : vol;
        if (!v || !Game.volume) return;
        loadSnd(url);
        var buf = SND.bufs[url];
        if (!buf) { // still loading or failed
            if (buf === null) SND.pending[url] = v; // repeats coalesce into one delayed play
            else if (SND.noAC && window.PlaySound) PlaySound(url, vol); // no WebAudio 
            return;
        }
        var c = SND.ctx;
        if (c.state === 'suspended') c.resume();
        var src = c.createBufferSource();
        src.buffer = buf;
        var g = c.createGain();
        g.gain.value = Math.pow(v * Game.volume / 100, 2);
        src.connect(g); g.connect(c.destination);
        src.start(0);
    } catch (e) {}
}

// state
var G = {
    tier: 'E', puzzleTier: null, puzzleFile: null, puzzle: null, starterSentence: null,
    yous: null, yousSeed: null, solved: {}, readMask: 0,
    earned: [], clueRowForClue: {}, clueRowEls: [],
    hintedCells: [], mistakeCells: [], hintCell: null, cornerTags: {}, dimmed: {}, tellRow: -1,
    won: 0, claimed: 0, earlyCells: [], tFirst: 0, tDone: 0, nextPuzzleAt: 0,
    failed: 0, reward: null, redeemed: 0, redeemedRw: null, spinPending: 0, tutBonus: 0, restored: 0,
    loading: false, picking: undefined, index: null, restore: null,
    populated: null, popGen: 0, populating: false,
    ready: false, reqId: 0, stacked: false, debugSalt: 0,
    tierProg: { u: 'E', p: null }, // unlock 
    cleanWins: 0, // lifetime no mistake clears 
    tutorialDone: 0, 
    rot: { last: {} } // per-tier completion bitsets + last-finished index
};
function clearRun() {
    G.solved = {}; G.readMask = 0; G.earned = []; G.clueRowForClue = {}; G.clueRowEls = [];
    G.hintedCells = []; G.mistakeCells = []; G.cornerTags = {}; G.dimmed = {};
    G.hintCell = null; G.tellRow = -1; G.populated = null; G.populating = false;
    G.claimed = 0; G.earlyCells = []; G.tFirst = 0; G.tDone = 0; G.popOrder = null;
    G.failed = 0; G.reward = null; G.redeemed = 0; G.redeemedRw = null;
    G.spinPending = 0; G.yousSeed = null; G.tutBonus = 0; G.restored = 0;
    closePrizeSlots();
}
var RUN_FIELDS = ['ys', 'solved', 'earned', 'hintedCells', 'mistakeCells', 'cornerTags', 'dimmed', 'claimed',
    'earlyCells', 'tFirst', 'tDone', 'failed', 'reward', 'redeemed', 'redeemedRw', 'tutBonus', 'restored'];

function checkLayout() {
    var main = l('clonesMain');
    if (!main) return;
    var stack = main.offsetWidth < 503;
    if (stack !== G.stacked) {
        G.stacked = stack;
        main.classList.toggle('clones-stacked', stack);
    }
    var grid = l('clonesGrid'), side = l('clonesSide');
    if (grid && side && grid.offsetHeight) { // 0 while the panel is hidden
        var h = stack ? '' : grid.offsetHeight + 'px';
        if (side.style.height !== h) side.style.height = h;
        var w = stack ? grid.offsetWidth + 'px' : '';
        if (side.style.minWidth !== w) side.style.minWidth = w;
    }
}

// deduce[readMask] is a 20-bit mask of cells provable under the clues read so far, A missing key means an unrea
function frontierMask() {
    if (!G.puzzle) return 0;
    var marks = 0;
    for (var i = 0; i < 20; i++) if (G.solved[i] !== undefined) marks |= 1 << i;
    return (G.puzzle.deduce[String(G.readMask)] || 0) & ~marks;
}

function deducible(i) {
    return !!(frontierMask() & (1 << i));
}

function setStatus(t) {
    var el = l('clonesStatus');
    if (el) el.textContent = t || '';
}
function loadIndex(cb) {
    if (G.index) return cb(G.index);
    var got = function(d) {
        var idx = {};
        var add = function(key, f) {
            f = f.replace(/\.json$/i, '');
            if (/^[EMTHV]/.test(f)) (idx[key] = idx[key] || []).push(f);
        };

        var tiers = d.tiers || {};
        for (var name in tiers) {
            var key = TIER_KEYS.filter(function(k) { return TIERS[k] === name; })[0] || name.charAt(0).toUpperCase();
            (tiers[name] || []).forEach(function(f) { add(key, f); });
        }
        if (Object.keys(idx).length) { G.index = idx; cb(idx); } else setStatus('Puzzle list is empty.');
    };
    var fail = function() { setStatus('Couldn\'t load puzzle list.'); };
    puzzleFetch('index.json').then(got).catch(fail);
}
function ensurePuzzle() {
    if (!G.ready || G.puzzle || G.loading) return;
    if (G.restore) startPuzzle(G.restore.file, G.restore);
    else setStatus('Pick a difficulty and press New Scenario.');
}
// per-tier completion bitset: bit (i&7) of byte (i>>3) flags catalog index i as
// finished this cycle. `last` holds each tier's most recently finished index so a
// fresh cycle can't re-deal it instantly. Bits are only set when a board reaches
// 20 cells, so abandoned puzzles stay eligible. 
var ROT_KEYS = 'emthv';
function isPlayed(bits, i) { return !!(bits[i >> 3] & (1 << (i & 7))); }
function markPlayed(bits, i) { bits[i >> 3] |= 1 << (i & 7); }
function resizeBits(oldBits, count) {
    var bits = new Uint8Array(Math.ceil(count / 8));
    bits.set(oldBits.subarray(0, bits.length));
    return bits;
}
function encodeBits(bits) {
    var binary = '';
    for (var i = 0; i < bits.length; i++) binary += String.fromCharCode(bits[i]);
    return btoa(binary);
}
function decodeBits(encoded, count) {
    var binary = '';
    try { binary = encoded ? atob(encoded) : ''; } catch (e) {}
    var bits = new Uint8Array(Math.max(Math.ceil(count / 8), binary.length));
    for (var i = 0; i < binary.length; i++) bits[i] = binary.charCodeAt(i);
    return bits;
}
// bitsets grow lazily so a save can be decoded before the catalog arrives
function rotBits(tier, count) {
    var k = tier.toLowerCase(), b = G.rot[k];
    if (!b) b = new Uint8Array(0);
    if (b.length < Math.ceil(count / 8)) b = resizeBits(b, count);
    return (G.rot[k] = b);
}
// uniform pick among unfinished indices; on exhaustion the cycle resets here so
// appended puzzles join first, then the last-finished index is excluded once
function selectPuzzleIndex(puzzles, bits, lastPlayed) {
    var available = [];
    for (var i = 0; i < puzzles.length; i++) {
        if (puzzles[i] != null && !isPlayed(bits, i)) available.push(i);
    }
    if (!available.length) {
        for (i = 0; i < puzzles.length; i++) if (puzzles[i] != null) available.push(i);
        if (!available.length) return -1;
        bits.fill(0);
        if (available.length > 1) available = available.filter(function(j) { return j !== lastPlayed; });
    }
    return available[Math.floor(Math.random() * available.length)];
}
function dealPuzzleIndex(tier, pool) {
    var last = (G.rot.last || {})[tier.toLowerCase()];
    return selectPuzzleIndex(pool, rotBits(tier, pool.length), typeof last === 'number' ? last : -1);
}
// numeric fields from save data garbage becomes 0 rather than NaN-poisoning state
function saveNum(v) { v = +v; return (isFinite(v) && v >= 0) ? v : 0; }
function markPuzzleDone(file) {
    var tier = String(file || '')[0];
    if (TIER_KEYS.indexOf(tier) < 0) return; // tutorial and other non-catalog files

    if (!G.index) { var rot = G.rot; loadIndex(function() { if (G.rot === rot) markPuzzleDone(file); }); return; }
    var pool = G.index[tier];
    var i = pool ? pool.indexOf(file) : -1;
    if (i < 0) return;
    markPlayed(rotBits(tier, pool.length), i);
    (G.rot.last || (G.rot.last = {}))[tier.toLowerCase()] = i;
}
function rotSave() {
    var out = { last: G.rot.last || {} };
    for (var i = 0; i < ROT_KEYS.length; i++) {
        var k = ROT_KEYS[i], b = G.rot[k];
        if (b && b.length) out[k] = encodeBits(b);
    }
    return out;
}
function rotLoad(saved) {
    G.rot = { last: {} };
    if (!saved || typeof saved !== 'object') return; // legacy deal cursors can't map to bits
    for (var i = 0; i < ROT_KEYS.length; i++) {
        var k = ROT_KEYS[i];
        if (typeof saved[k] === 'string') G.rot[k] = decodeBits(saved[k], 0);
        var last = saved.last && saved.last[k];
        if (typeof last === 'number' && last >= 0) G.rot.last[k] = last;
    }
}
function startPuzzle(file, saved, retried) {
    var wanted = file; // an explicit request retries itself
    if (!file) {
        if (!G.index) {
            var gen = G.reqId; // a reset or load while the catalog loads cancels this deal
            return loadIndex(function() { if (gen === G.reqId) startPuzzle(null, saved, retried); });
        }
        var pool = G.index[G.tier] || [];
        var idx = dealPuzzleIndex(G.tier, pool);
        if (idx < 0) { setStatus('Failed to load the puzzle data, check internet connection.'); return; }
        file = pool[idx];
    }
    if (!saved) G.yous = null;
    G.loading = true;
    var req = ++G.reqId;
    puzzleFetch(file + '.json').then(function(data) {
        if (req !== G.reqId) return;
        G.loading = false;
        G.puzzleFile = data.name || file;
        applyPuzzle(data, saved);
        renderBoard();
    }).catch(function() {
        if (req !== G.reqId) return;
        G.loading = false;
        // a saved run is never swapped for a fresh board; G.restore keeps it in saves until it loads
        if (!retried) startPuzzle(wanted, saved, true);
        else setStatus('Couldn\'t load ' + file + '.');
    });
}
function applyPuzzle(data, saved) {
    G.popGen++; // invalidate pending populate timers from a previous puzzle
    var grid = data.grid;
    if (!Array.isArray(grid) || grid.length !== 20) throw new Error('bad puzzle grid');
    G.puzzle = {
        grid: grid, cards: Array.isArray(data.cards) ? data.cards : [],
        clues: Array.isArray(data.clues) ? data.clues : [],
        deduce: data.deduce || {}, proofs: data.proofs || {}, hintProofs: data.hintProofs || null,
        traits: data.traits || {}, cellTraits: {}, tutorial: !!data.tutorial
    };
    for (var t in G.puzzle.traits) (G.puzzle.traits[t] || []).forEach(function(id) {
        var ci = cellIdx(id);
        (G.puzzle.cellTraits[ci] = G.puzzle.cellTraits[ci] || []).push(t);
    });
    G.starterSentence = (data.start && data.start.text) || null;

    // the JSON's declared difficulty wins over the filename letter, so a
    var dk = TIER_KEYS.filter(function(k) { return TIERS[k] === data.difficulty; })[0];
    var t = dk || (G.puzzleFile || 'E')[0];
    if (TIERS[t]) G.tier = t;
    G.puzzleTier = G.tier; // the dealt puzzle's tier; promotion/selection mutate G.tier later
    syncTierIcons();

    clearRun();
    // puzzle files get regenerated under the same name; if the save contradicts
    // the fresh grid or references clues that no longer exist, drop the run
    // rather than replaying mismatched state
    var svArr = function(v) { return Array.isArray(v) ? v : (v == null ? [] : null); };
    var svSolved = saved ? svArr(saved.solved) : [];
    var svEarned = saved ? svArr(saved.earned) : [];
    var badClue = function(c) { return !Number.isInteger(c) || !G.puzzle.clues[c]; };
    // a finished board is past using its clues
    if (svSolved && svEarned && svSolved.length === 20) svEarned = svEarned.filter(function(c) { return !badClue(c); });
    if (saved && (
        svSolved == null || svEarned == null ||
        svSolved.some(function(i) { return !Number.isInteger(i) || i < 0 || i >= grid.length; }) ||
        svEarned.some(badClue)
    )) saved = null;
    if (saved) {
        var list = function(v) { return Array.isArray(v) ? v : []; };
        var safeKey = function(k) { return k !== '__proto__' && k !== 'constructor' && k !== 'prototype'; };
        // a malformed held prize is dropped rather than crashing the spin/redeem paths
        var svRw = function(rw) {
            if (!rw || typeof rw !== 'object') return null;
            var r = rw.reward;
            if (!r || typeof r !== 'object' || typeof r.id !== 'string' || typeof r.name !== 'string' || !Array.isArray(r.icon)) return null;
            if (typeof rw.tier !== 'number' || !Array.isArray(rw.weights)) return null;
            return rw;
        };
        G.hintedCells = list(saved.hintedCells);
        G.mistakeCells = list(saved.mistakeCells);
        G.cornerTags = {};
        if (saved.cornerTags && typeof saved.cornerTags === 'object') {
            for (var tk in saved.cornerTags) { // expand single letter codes
                if (!safeKey(tk)) continue;
                var st = saved.cornerTags[tk], dt = {};
                if (st && typeof st === 'object') for (var c in st) {
                    if (safeKey(c) && TAG_LETTERS[st[c]]) dt[c] = TAG_LETTERS[st[c]];
                }
                if (Object.keys(dt).length) G.cornerTags[tk] = dt;
            }
        }
        // dimmed saves as a plain clue-index array
        list(saved.dimmed).forEach(function(k) { if (safeKey(k)) G.dimmed[k] = 1; });
        G.yousSeed = saved.ys == null ? null : saved.ys;
        G.won = saveNum(saved.won); G.claimed = saved.claimed ? 1 : 0;
        G.earlyCells = list(saved.earlyCells);
        G.tFirst = saveNum(saved.tFirst); G.tDone = saveNum(saved.tDone);
        G.failed = saved.failed ? 1 : 0;
        G.reward = svRw(saved.reward);
        G.redeemed = saved.redeemed ? 1 : 0; G.redeemedRw = svRw(saved.redeemedRw);
        G.tutBonus = saved.tutBonus ? 1 : 0; // graduation prize still owed if Finish wasn't pressed
        // a held, unredeemed prize gets its slot reveal back on reload
        G.spinPending = (G.reward && !G.redeemed) ? 1 : 0;
        svSolved.forEach(function(i) { G.solved[i] = grid[i]; });
        svEarned.forEach(function(c) { G.earned.push(c); G.readMask |= 1 << c; });
        // resumed mid-run: the flawless V clear has to happen in a single session
        if (saved.restored || svSolved.length || G.tFirst || G.mistakeCells.length || G.earlyCells.length || G.hintedCells.length) G.restored = 1;
    } else {
        // fresh board
        G.populating = true;
        var gen = G.popGen, order = shuffle(ALL_CELLS.slice());
        G.popOrder = order; // wipe staggers authentics out in the same order
        G.populated = order.map(function() { return false; });
        order.forEach(function(ci, k) { setTimeout(function() {
            if (gen !== G.popGen) return;
            G.populated[ci] = true;
            var el = l('clonesCell' + cellId(ci));
            if (el) el.classList.remove('clones-unpop');
        }, k * 75); });
        setTimeout(function() {
            if (gen !== G.popGen) return;
            G.populating = false;
            renderBoard(); // draw the starter clue
        }, 1500);
    }
    G.restore = null;
    if (!G.yous) dealYous();
}
function dealYous() {
    // seed folds in the puzzle count so a repeated file deals a fresh lineup
    if (G.yousSeed == null) G.yousSeed = G.won;
    var rng = rollRng(String((window.Game && Game.seed) || 'seed') + '/' + (G.puzzleFile || 'E') + '/' + G.yousSeed);
    var usedTraits = Object.keys(G.puzzle.traits || {});
    // each gene deals from a reshuffled deck so 20 cards span the choices
    var decks = {};
    var deal = function(gi) {
        var d = decks[gi];
        if (!d || d.pos >= d.order.length)
            d = decks[gi] = { order: shuffle(GENES[gi].choices.map(function(_, k) { return k; }), rng), pos: 0 };
        return d.order[d.pos++];
    };
    // accessories distribute 
    var extraUse = {};
    var pickExtra = function(forbidden) {
        var best = Infinity, ties = [];
        for (var i = 0; i < EXTRAS_COUNT; i++) {
            var n = extraUse[i] || 0;
            if (!forbidden.has(i) && n <= best) { if (n < best) ties = []; best = n; ties.push(i); }
        }
        var pick = ties.length ? ties[Math.floor(rng() * ties.length)] : 0;
        extraUse[pick] = (extraUse[pick] || 0) + 1;
        return pick;
    };
    var names = shuffle(NAMES.slice(), rng);
    G.yous = [];
    for (var i = 0; i < 20; i++) {
        var acc1 = pickExtra(new Set());
        var acc2 = pickExtra(new Set([acc1]));
        var genes = [deal(0), deal(1), deal(2), deal(3), deal(4), acc1, acc2];
        G.yous.push({ name: names[i], genes: enforceTraits(genes, G.puzzle.cellTraits[i] || [], usedTraits, rng) });
    }
}

// Board and clues
function syncStartUI() {
    var active = !!(G.puzzle && !G.claimed);
    var start = l('clonesStart'), top = l('clonesTop');
    if (start) start.style.display = active ? 'none' : 'flex';
    if (top) top.style.display = active ? '' : 'none';
    var pid = l('clonesPuzzleId');
    if (pid) pid.textContent = active ? (G.puzzleFile || '') : '';
    syncBottomBtns();
}
function renderBoard() {
    var grid = l('clonesGrid'), list = l('clonesClues');
    if (!grid || !list) return;
    syncCompleted();
    var head = l('clonesHead');
    if (head) head.style.display = (G.populating || G.claimed) ? 'none' : '';
    var hintBtn = l('clonesHint');
    if (hintBtn) hintBtn.style.display = Object.keys(G.solved).length < 20 ? '' : 'none';
    if (G.claimed) {
        var start = l('clonesStart'), top = l('clonesTop');
        if (start) start.style.display = 'none'; // overlay waits for the wipe
        if (top) top.style.display = 'none';
        renderStats(); showClaim(); checkLayout(); setStatus('');
        return;
    }
    syncStartUI();
    if (!G.puzzle || !G.yous) return;
    grid.innerHTML = ''; list.innerHTML = '';
    G.clueRowEls = []; G.tellRow = -1; G.clueRowForClue = {};
    for (var i = 0; i < 20; i++) {
        (function(i) {
            var cell = document.createElement('div');
            cell.className = 'clones-cell';
            cell.id = 'clonesCell' + cellId(i);
            if (G.populated && !G.populated[i]) cell.classList.add('clones-unpop');
            cell.appendChild(youSprite(G.yous[i].genes));
            cell.insertAdjacentHTML('beforeend',
                '<div class="clones-coords">' + cellId(i) + '</div>' +
                '<div class="clones-name">' + G.yous[i].name + '</div>');
            AddEvent(cell, 'click', function() { cellClick(i); });
            grid.appendChild(cell);
            if (G.solved[i] !== undefined) paintSolved(i);
            else addCornerTags(cell, i);
        })(i);
    }
    if (!G.populating) {
        if (G.starterSentence) { G.tellRow = G.clueRowEls.length; addClue(G.starterSentence, -1); } // -1 keeps its dim persistent too
        G.earned.forEach(function(cid) { addClue(G.puzzle.clues[cid].text, cid); });
    }
    if (Object.keys(G.solved).length === 20) addEndIcons();
    showClaim();
    checkLayout();
    setStatus('');
}
function substituteNames(sentence) {
    return (sentence || '').replace(/\b([A-D][1-5])\b/g, function(m) {
        var y = G.yous[cellIdx(m)];
        return y ? y.name : m;
    });
}
// trait phrases get a hoverable span: connector + article + core word
var TRAIT_WORDS = {
    glasses: 'glasses', beard: 'beards?|bearded', halo: 'halos?', mask: 'masks?|masked',
    bald: 'bald', redhair: 'red[- ]hair(?:ed)?|redheads?', bluehair: 'blue[- ]hair(?:ed)?',
    blueskin: 'blue[- ]skin(?:ned)?', greenskin: 'green[- ]skin(?:ned)?'
};
var TRAIT_KEYS = Object.keys(TRAIT_WORDS);
var TRAIT_PHRASE_RE = new RegExp(TRAIT_KEYS.map(function(t) {
    return '\\b((?:(?:with|without|wearing|has|have|who\\s+(?:is|are|wear|wears|has|have))\\s+)?(?:(?:a|an)\\s+)?(?:' + TRAIT_WORDS[t] + '))\\b';
}).join('|'), 'gi');

// rawSentence keeps its coordinates for highlight
function addClue(rawSentence, clueIdx) {
    var item = document.createElement('div');
    item.className = 'clones-clue-item';
    var named = rawSentence.match(/\b[A-D][1-5]\b/g) || [];
    var html = substituteNames(rawSentence).replace(TRAIT_PHRASE_RE, function(m) {
        var g = arguments;
        for (var t = 0; t < TRAIT_KEYS.length; t++)
            if (g[1 + t] !== undefined)
                return '<span class="clones-clue-trait" data-t="' + TRAIT_KEYS[t] + '">' + m + '</span>';
        return m;
    });
    item.innerHTML = '<span class="clones-clue-num">' + (G.clueRowEls.length + 1) + ')</span><span class="clones-clue-text">' + html + '</span>';
    if (clueIdx !== undefined && G.dimmed[clueIdx]) item.style.opacity = '0.2';
    AddEvent(item, 'click', function() {
        var dim = item.style.opacity === '0.2';
        item.style.opacity = dim ? '1' : '0.2';
        if (clueIdx !== undefined) { if (dim) delete G.dimmed[clueIdx]; else G.dimmed[clueIdx] = 1; }
    });
    // row hover lights named cells; hovering a trait span swaps to that trait's cells
    var namedOn = false, traitOn = null;
    var apply = function() {
        var ids = traitOn ? (G.puzzle.traits[traitOn] || []) : (namedOn ? named : []), lit = {};
        ids.forEach(function(id) { lit[id] = 1; });
        for (var i = 0; i < 20; i++) {
            var el = l('clonesCell' + cellId(i));
            if (el) el.classList.toggle('clones-clue-ref', !!lit[cellId(i)]);
        }
    };
    AddEvent(item, 'mouseenter', function() { namedOn = true; apply(); });
    AddEvent(item, 'mouseleave', function() { namedOn = false; traitOn = null; apply(); });
    [].forEach.call(item.querySelectorAll('.clones-clue-trait'), function(sp) {
        AddEvent(sp, 'mouseenter', function() { traitOn = sp.getAttribute('data-t'); apply(); });
        AddEvent(sp, 'mouseleave', function() { traitOn = null; apply(); });
    });
    if (clueIdx !== undefined) G.clueRowForClue[clueIdx] = G.clueRowEls.length;
    G.clueRowEls.push(item);
    l('clonesClues').appendChild(item);
}
function cardClue(i) {
    var cid = G.puzzle.cards[i];
    var clue = typeof cid === 'number' && G.puzzle.clues[cid];
    if (!clue || G.earned.indexOf(cid) !== -1) return;
    G.earned.push(cid);
    G.readMask |= 1 << cid;
    addClue(clue.text, cid);
}
function paintSolved(i) {
    var el = l('clonesCell' + cellId(i));
    if (el) el.classList.add('clones-revealed', G.solved[i] ? 'clones-picked-clone' : 'clones-picked-authentic');
}
function stripTags(i) {
    var el = l('clonesCell' + cellId(i));
    if (el) [].forEach.call(el.querySelectorAll('.clones-tag'), function(t) { t.remove(); });
    delete G.cornerTags[i];
}

var CORNER_COLORS = ['none', 'red', 'green', 'yellow', 'blue', 'purple', 'orange'];
var TAG_LETTERS = {}; // single-letter color codes 
CORNER_COLORS.forEach(function(c) { TAG_LETTERS[c[0]] = c; });
function addCornerTags(cell, i) {
    var tags = G.cornerTags[i] || (G.cornerTags[i] = {});
    [['top-right', 'tr'], ['bottom-right', 'br'], ['bottom-left', 'bl']].forEach(function(c) {
        var tag = document.createElement('div');
        tag.className = 'clones-tag ' + c[0] + ' ' + (tags[c[1]] || 'none');
        AddEvent(tag, 'click', function(e) {
            e.stopPropagation();
            tags[c[1]] = CORNER_COLORS[(CORNER_COLORS.indexOf(tags[c[1]] || 'none') + 1) % CORNER_COLORS.length];
            tag.className = 'clones-tag ' + c[0] + ' ' + tags[c[1]];
        });
        cell.appendChild(tag);
    });
}

function cellClick(i) {
    if (!G.puzzle || G.loading || G.populating || G.claimed) return;
    if (G.solved[i] !== undefined) { cardClue(i); return; }
    G.picking = i;
    var you = G.yous[i];
    var img = '';
    try { img = '<img src="' + renderYou(you.genes).toDataURL() + '" style="width:64px;height:64px;image-rendering:pixelated;border-radius:16px;">'; } catch (e) {}
    Game.Prompt('<h3>' + you.name + '</h3><div style="text-align:center;margin:8px 0;">' + img + '</div>', [
        ['Clone', 'ClonesM.pick(1);', 'float:left;color:#ff6666;margin-left:10px'],
        ['Authentic', 'ClonesM.pick(0);', 'float:right;color:#66ff66;margin-right:10px']
    ]);

    Game.promptOptionFocus = -1;
    var f = l('promptOption0'); if (f) f.classList.remove('focused');
}
ClonesM.pick = function(type) {
    var i = G.picking;
    G.picking = undefined;
    if (i === undefined || G.solved[i] !== undefined) { Game.ClosePrompt(); return; }
    if (!G.tFirst) G.tFirst = Date.now();
    if (!deducible(i)) {
        if (G.earlyCells.indexOf(i) === -1) G.earlyCells.push(i);
        var picked = type ? 'a Clone' : 'an Authentic';
        var other = type ? 'an Authentic' : 'a Clone';
        Game.Prompt('<h3 style="color:#FFE600">Cannot be determined</h3><div class="block" style="font-size:11px;">No clue or combination of clues can prove that ' + G.yous[i].name + ' is ' + picked + ' right now, there is still a logical path in which they are ' + other + '. Remember you must have absolute certainty before sorting.</div>', ['OK']);
        return;
    }
    if (type === G.puzzle.grid[i]) {
        Game.ClosePrompt();
        G.solved[i] = type;
        paintSolved(i);
        stripTags(i);
        cardClue(i);
        clearHint();
        if (Object.keys(G.solved).length === 20) completePuzzle();
    } else {
        if (G.mistakeCells.indexOf(i) === -1) G.mistakeCells.push(i);
        Game.Prompt('<h3 style="color:#ff6666">Incorrect</h3><div class="block" style="font-size:11px;">Oh no, ' + G.yous[i].name + ' wasn\'t ' + (type ? 'a Clone' : 'an Authentic') + ' after all! This will reflect poorly in your final report.</div>', ['Try Again']);
    }
};
function endIcon(col, row, dy) {
    var d = document.createElement('div');
    d.className = 'clones-endicon';
    d.style.backgroundImage = 'url(' + window.getSpriteSheet('custom') + ')';
    d.style.backgroundPosition = (-col * 48) + 'px ' + (-row * 48) + 'px';
    if (dy) d.style.marginTop = (-24 + dy) + 'px';
    return d;
}
function showClaim() {
    var el = l('clonesClaim');
    if (el) el.style.display = (!G.claimed && Object.keys(G.solved).length === 20) ? '' : 'none';
    var cb = l('clonesClaimBtn');
    if (cb) cb.textContent = (G.puzzle && G.puzzle.tutorial) ? 'Finish' : 'Claim Reward';
    var rd = l('clonesRedeem');

    if (rd) {
        rd.style.display = G.reward ? '' : 'none';
        rd.style.visibility = (G.reward && !G.spinPending) ? 'visible' : 'hidden';
    }
    syncBottomBtns();
}
function renderStats() {
    var grid = l('clonesGrid'), list = l('clonesClues');
    if (!grid || !list) return;
    var gen = ++G.popGen; // stale populate 
    list.innerHTML = '';
    //exit animiation 
    var order = G.popOrder || ALL_CELLS;
    var lastDelay = 0;
    for (var i = 0; i < 20; i++) {
        var el = l('clonesCell' + cellId(i));
        if (!el) continue;
        [].forEach.call(el.querySelectorAll('.clones-endicon'), function(m) { m.remove(); });
        if (G.solved[i]) continue;
        var d = order.indexOf(i) * 75;
        el.style.setProperty('--wd', d + 'ms');
        el.classList.add('clones-wipe-auth');
        if (d > lastDelay) lastDelay = d;
    }
    setTimeout(function() {
        if (gen !== G.popGen) return;
        grid.classList.add('clones-wipe-all');
        setTimeout(function() {
            if (gen !== G.popGen) return;
            grid.innerHTML = '';
            grid.classList.remove('clones-wipe-all');
            syncStartUI();
            showStats(list);
            if (G.spinPending) spinPrize();
        }, 550);
    }, lastDelay + 1350); 
}
function spriteIconHtml(sheet, ic) {
    return '<div style="display:inline-block;width:24px;height:24px;vertical-align:-7px;margin-right:2px;overflow:hidden;"><div style="width:48px;height:48px;background-image:url(' + sheet + ');background-position:' + (-ic[0] * 48) + 'px ' + (-ic[1] * 48) + 'px;transform:scale(0.5);transform-origin:top left;"></div></div>';
}
function tierIconHtml(k) {
    return spriteIconHtml(window.getSpriteSheet('main'), TIER_ICONS[TIER_KEYS.indexOf(k)] || TIER_ICONS[0]);
}

function rwIcon(rw) { return [rw.icon[0], rw.icon[1], window.getSpriteSheet(rw.sheet === 'custom' ? 'custom' : 'main')]; }
function rewardIconEl(rw) {
    var ic = rwIcon(rw);
    var d = document.createElement('div');
    d.style.backgroundImage = 'url(' + ic[2] + ')';
    d.style.backgroundPosition = (-ic[0] * 48) + 'px ' + (-ic[1] * 48) + 'px';
    return d;
}
function oddsLineHtml(r) {
    return '<span style="font-size:10px;color:#888;">Roll odds (score ' + r.score + ', rolled T' + r.tier + '): ' +
        r.weights.map(function(w, i) { return 'T' + (i + 1) + ' ' + w + '%'; }).join(' · ') + '</span>';
}
function rewardLineHtml() {
    if (G.puzzle && G.puzzle.tutorial)
        return (G.reward || G.redeemedRw)
            ? '<b>Congratulations for finishing your training!</b><br>You are now prepared to undertake your first scenario, have a little reward for your efforts.'
            : '<span style="color:#999;">Training exercise (no compensation)</span>';
    if (G.failed) return '<span style="color:#ff6666;">Performance too poor (no compensation)</span>';
    if (G.reward && G.spinPending) return '';
    if (G.reward) return ClonesM.debug ? oddsLineHtml(G.reward) : '';
    return G.redeemed && G.redeemedRw && ClonesM.debug ? oddsLineHtml(G.redeemedRw) : '';
}
//Prize
var slotRun = 0;
function showPrizeSlots(opts) {
    var slot = l('prizeSlots');
    if (!slot) return Promise.resolve();
    var id = ++slotRun;
    var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reels = slot.querySelector('.reels'), prize = slot.querySelector('.prize');
    slot.className = 'slots'; slot.hidden = false;
    var rd = l('clonesRedeem');
    if (rd) { rd.style.display = ''; rd.style.visibility = 'hidden'; }
    reels.innerHTML = ''; prize.innerHTML = '';
    prize.appendChild(rewardIconEl(opts.winner));
    var title = slot.querySelector('.prize-title');
    if (title) title.textContent = opts.winner.name;
    slot.style.setProperty('--pitch', '80px'); // 70px window + 10px gap
    if (reduced) { slot.classList.add('done'); return Promise.resolve(); }
    var promises = [0.62, 0.81, 1].map(function(fraction, index) {
        var reel = document.createElement('div'); reel.className = 'reel';
        var track = document.createElement('div'); track.className = 'track';

        var count = 22 + index * 4, symbols = [];
        for (var s = 0; s < count - 1; s++) symbols.push(opts.eligibleRewards[Math.floor(Math.random() * opts.eligibleRewards.length)]);
        symbols.push(opts.winner);
        symbols.forEach(function(rw) {
            var cell = document.createElement('div'); cell.className = 'symbol';
            cell.appendChild(rewardIconEl(rw)); track.appendChild(cell);
        });
        reel.appendChild(track); reels.appendChild(reel);
        return new Promise(function(resolve) {
            var animation = track.animate(
                [{ transform: 'translateY(0)' }, { transform: 'translateY(-' + ((count - 1) * 60) + 'px)' }],
                { duration: (opts.duration || 3000) * fraction, easing: 'cubic-bezier(.15,.65,.25,1)', fill: 'forwards' }
            );
            // tick sync with the deceleration
            var lastSym = -1, tickTimer = setInterval(function() {
                var p = animation.effect && animation.effect.getComputedTiming
                    ? animation.effect.getComputedTiming().progress
                    : animation.currentTime / ((opts.duration || 3000) * fraction);
                if (p == null) return;
                var sym = Math.floor(p * (count - 1));
                if (sym !== lastSym && sym < count - 1) { lastSym = sym; playSnd('snd/smallTick.mp3', 0.75); }
            }, 40);
            var stop = function() { clearInterval(tickTimer); resolve(); };
            animation.onfinish = function() { playSnd('snd/toneTick.mp3'); stop(); };
            animation.oncancel = stop;
            reel._animation = animation;
        });
    });
    return Promise.all(promises).then(function() {
        if (id !== slotRun) return;
        slot.classList.add('merging');
        return new Promise(function(res) { setTimeout(res, 850); }).then(function() {
            if (id !== slotRun) return;
            slot.classList.remove('merging'); slot.classList.add('done');
        });
    });
}
function closePrizeSlots() {
    slotRun++;
    var slot = l('prizeSlots');
    if (!slot) return;
    [].forEach.call(slot.querySelectorAll('.reel'), function(reel) { if (reel._animation) reel._animation.cancel(); });
    slot.hidden = true;
    var lb = l('clonesRedeemedLabel'); if (lb) lb.style.display = 'none';
}
// the redeemed prize text 
function showRedeemedLabel() {
    var lb = l('clonesRedeemedLabel'), rw = G.redeemedRw && G.redeemedRw.reward;
    if (lb && rw) { lb.innerHTML = 'Redeemed:<br><b>' + rw.name + '</b>'; lb.style.display = ''; }
}
// filler comes only from tiers that had a nonzero chance 
function spinPrize() {
    var r = G.reward;
    if (!r) { G.spinPending = 0; return; }
    showPrizeSlots({
        winner: r.reward,
        eligibleRewards: REWARDS.filter(function(x) { return r.weights[x.tier - 1] > 0 && rewardUnlocked(x); }),
        duration: 5000
    }).then(function() {
        G.spinPending = 0;
        if (l('clonesRewardLine')) l('clonesRewardLine').innerHTML = rewardLineHtml();
        showClaim(); // reveal Redeem once the prize has landed
    });
}
function fmtDur(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
    return (h ? h + ':' + ('0' + m).slice(-2) : m) + ':' + ('0' + sec).slice(-2);
}
function showStats(list) {
    var t = G.tFirst && G.tDone ? fmtDur(G.tDone - G.tFirst) : '—';
    list.innerHTML = '<div style="text-align:center;padding:14px 6px;font-size:12px;color:#ccc;line-height:1.9;">' +
        '<b style="color:#e2dd48;">Job Satisfaction Report</b><br>' +
        'Difficulty: ' + (G.puzzle && G.puzzle.tutorial ? 'Tutorial' : tierIconHtml(G.puzzleTier || 'E')) + '<br>' +
        'Time: <b>' + t + '</b><br>' +
        'Hints used: <b>' + G.hintedCells.length + '</b><br>' +
        'Undeducible picks: <b>' + G.earlyCells.length + '</b><br>' +
        'Mistakes: <b>' + G.mistakeCells.length + '</b><br>' +
        '<span id="clonesRewardLine">' + rewardLineHtml() + '</span>' +
        '</div>';
    if (G.redeemedRw) { closePrizeSlots(); showRedeemedLabel(); }
}
function updateCooldown() {
    var cd = l('clonesCooldown'), btn = l('clonesNew');
    var rem = Math.max(0, G.nextPuzzleAt - Date.now());
    if (cd) {
        var s = rem > 0
            ? 'Next sorting assignment: <b>' + fmtDur(rem) + '</b>'
            : 'Next sorting assignment: <b style="color:#6f6;">Ready</b>';
        if (cd._txt !== s) { cd._txt = s; cd.innerHTML = s; }
    }
    if (btn) btn.classList.toggle('disabled', rem > 0);
    var sv = l('clonesSolve'), d;
    if (sv) { d = (ClonesM.debug && G.puzzle && !G.claimed) ? '' : 'none'; if (sv.style.display !== d) sv.style.display = d; }
    var rr = l('clonesRerollBtn');
    if (rr) { d = (ClonesM.debug && G.reward && !G.spinPending) ? '' : 'none'; if (rr.style.display !== d) rr.style.display = d; }
}
ClonesM.refillTooltip = function() {
    var tip = '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipClonesRefill">';
    var lumpAmount = (typeof Beautify === 'function') ? Beautify(1) : '1';
    tip += 'Click to reset the assignment cooldown for <span class="price lump">' + lumpAmount + ' sugar lump</span>.';
    if (typeof Game.canRefillLump === 'function' && Game.canRefillLump() && typeof Game.getLumpRefillMax === 'function' && typeof Game.sayTime === 'function') {
        tip += '<br><small>(Can be done once every ' + Game.sayTime(Game.getLumpRefillMax(), -1) + '.)</small>';
    } else if (typeof Game.getLumpRefillRemaining === 'function' && typeof Game.fps === 'number' && typeof Game.sayTime === 'function') {
        tip += '<br><small class="red">(Usable again in ' + Game.sayTime(Game.getLumpRefillRemaining() + Game.fps, -1) + '.)</small>';
    }
    return tip + '</div>';
};
ClonesM.dragonBoostTooltip = function() {
    if (!supremeIntellectBonus()) return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>Supreme Intellect</b><div class="line"></div>No aura bonus active for Clone Escape.</div>';
    return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>Supreme Intellect</b><div class="line"></div>Adds 1 to your final report score when rolling for compensation.</div>';
};
// rewards
var DIFF_SCORES = { E: 2, M: 4, T: 6, H: 8, V: 10 };
var TIER_WEIGHTS = { // index 0-4 = reward tiers 1-5
    10: [0, 0, 0, 10, 90], 9: [0, 0, 0, 30, 70], 8: [0, 0, 10, 50, 40],
    7: [0, 5, 30, 65, 0], 6: [0, 15, 55, 30, 0], 5: [5, 25, 60, 5, 0],
    4: [25, 55, 20, 0, 0], 3: [40, 50, 10, 0, 0], 2: [75, 25, 0, 0, 0],
    low: [100, 0, 0, 0, 0] // score <= 1
};
var REWARDS = [
    { id: 'free_lump', name: 'Free sugar lump', tier: 5, icon: [29, 14] },
    { id: 'click_x7', name: 'Clicking ×7 for 77 seconds', tier: 5, icon: [0, 14] },
    { id: 'random_bs', name: 'Gain a random Building Special', tier: 5, icon: [11, 33] },
    { id: 'extend_buffs', name: 'Extend active buffs by 30 seconds', tier: 5, icon: [23, 11] },
    { id: 'dragon_harvest', name: 'Gain a dragon harvest buff', tier: 5, icon: [6, 17], sheet: 'custom' },
    { id: 'random_gc', name: 'Spawn a Golden Cookie', tier: 4, icon: [23, 6] },
    { id: 'reset_minigames', name: 'Reset minigame cooldowns', tier: 4, icon: [8, 0] },
    { id: 'gc_faster', name: 'Golden Cookies spawn 25% faster for an hour', tier: 4, icon: [3, 5] },
    { id: 'double_cps', name: 'Double CpS for 7 minutes', tier: 4, icon: [20, 14], sheet: 'custom' },
    { id: 'grimoire_mana', name: 'Restore 50% mana', tier: 4, icon: [14, 16], sheet: 'custom' },
    { id: 'free_yous', name: 'Gain 5 free Yous', tier: 3, icon: [35, 36] },
    { id: 'fill_reagents', name: 'Fill your potion reagents', tier: 3, icon: [11, 25], sheet: 'custom' },
    { id: 'rare_lump', name: 'Current sugar lump becomes rare', tier: 3, icon: [27, 17] },
    { id: 'cps_day', name: 'Gain 24 hours of CpS (50% cap)', tier: 3, icon: [8, 25], sheet: 'custom' },
    { id: 'click_frenzy', name: 'Gain a click frenzy', tier: 3, icon: [11, 17] },
    { id: 'potion_effect', name: 'Gain a random positive potion effect', tier: 2, icon: [6, 26], sheet: 'custom' },
    { id: 'remove_seasons', name: 'Forget 5 season changes', tier: 2, icon: [16, 6] },
    { id: 'garden_ticks', name: 'Garden ticks 10 times', tier: 2, icon: [15, 24], sheet: 'custom' },
    { id: 'lump_faster', name: 'Current sugar matures 2 hours faster', tier: 2, icon: [20, 15], sheet: 'custom' },
    { id: 'reindeer_lanterns', name: 'Spawn 10 reindeer and lanterns', tier: 2, icon: [23, 24], sheet: 'custom' },
    { id: 'wrath_cookie', name: 'Summon a Wrath Cookie', tier: 1, icon: [20, 17], sheet: 'custom' },
    { id: 'cps_hour', name: 'Gain 1 hour worth of CpS (8% cap)', tier: 1, icon: [1, 0] },
    { id: 'frenzy', name: 'Gain a frenzy buff', tier: 1, icon: [10, 0] },
    { id: 'cheap', name: 'Buildings & upgrades are 10% cheaper for 3 min', tier: 1, icon: [3, 0] },
    { id: 'downline_double', name: 'New Downline actions last twice as long for 15min', tier: 1, icon: [17, 6] },
    { id: 'free_play', name: 'Free play', tier: 1, icon: [16, 1], sheet: 'custom' },
    { id: 'free_play', name: 'Free play', tier: 1, icon: [16, 1], sheet: 'custom' } // doubled entry for higher chance
];
// rewards that need another building's minigame (unlocked at level 1) to do anything
var REWARD_BUILDING = {
    garden_ticks: 'Farm', grimoire_mana: 'Wizard tower',
    potion_effect: 'Alchemy lab', fill_reagents: 'Alchemy lab',
    downline_double: 'Fractal engine'
};
function rewardUnlocked(r) {
    var b = REWARD_BUILDING[r.id];
    var o = b && Game.Objects && Game.Objects[b];
    return !b || !!(o && o.level >= 1);
}

function mistakeCount() {
    var seen = {}, n = 0;
    G.mistakeCells.concat(G.earlyCells, G.hintedCells).forEach(function(i) { if (!seen[i]) { seen[i] = 1; n++; } });
    return n;
}

function supremeIntellectBonus() {
    return (typeof Game.hasAura === 'function' && Game.hasAura('Supreme Intellect')) ? 1 : 0;
}

function scorePenalty() {
    var seen = {}, n = 0;
    G.mistakeCells.concat(G.earlyCells).forEach(function(i) { if (!seen[i]) { seen[i] = 1; n++; } });
    return n + Math.ceil(G.hintedCells.length / 2);
}
// mulberry32 over a hash of the key — same save, same win count, same prize
function rollRng(key) {
    var h = 1779033703;
    for (var i = 0; i < key.length; i++) { h = Math.imul(h ^ key.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    var a = h >>> 0;
    return function() {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function redeemRng(rw) {
    return rollRng(String((window.Game && Game.seed) || 'seed') + '/' + G.won + '/' + rw.id);
}
function rollReward(salt) {
    var rng = rollRng(String((window.Game && Game.seed) || 'seed') + '/' + G.won + '/' + (salt || 0));
    // first tutorial clear graduates with a free tier 2 
    if (G.puzzle && G.puzzle.tutorial) {
        if (!G.tutBonus) return null;
        G.tutBonus = 0;
        var t2 = REWARDS.filter(function(r) { return r.tier === 2 && rewardUnlocked(r); });
        return { score: 0, tier: 2, weights: [0, 100, 0, 0, 0], reward: t2[Math.floor(rng() * t2.length)] };
    }
    if (mistakeCount() >= 8) return null;

    var t = G.puzzleTier || 'E';
    var score = Math.min(10, (DIFF_SCORES[t] || 2) - scorePenalty() + supremeIntellectBonus());
    var w = score >= 10 ? TIER_WEIGHTS[10] : score <= 1 ? TIER_WEIGHTS.low : TIER_WEIGHTS[score];
    // salt varies the seed so debug rerolls aren't pinned to the saved result
    var roll = rng() * 100, cum = 0, tier = 5;
    for (var i = 0; i < 5; i++) { cum += w[i]; if (roll < cum) { tier = i + 1; break; } }
    var cands = REWARDS.filter(function(r) { return r.tier === tier && rewardUnlocked(r); });
    if (!cands.length) throw new Error('No rewards configured for tier ' + tier);
    return { score: score, tier: tier, weights: w, reward: cands[Math.floor(rng() * cands.length)] };
}

function tierUnlocked(t) {
    return TIER_KEYS.indexOf(t) <= TIER_KEYS.indexOf(G.tierProg.u || 'E');
}

function recordTierProgress() {
    var u = G.tierProg.u || 'E', idx = TIER_KEYS.indexOf(u);
    if (G.puzzleTier !== u || idx >= TIER_KEYS.length - 1) return;
    var mist = mistakeCount();
    if (mist >= 8) return; // failed runs teach nothing
    var p = G.tierProg.p || (G.tierProg.p = { c: 0, g: 0, o: 0 });
    if (mist === 0) p.c = 1;
    if (mist < 3) p.g = Math.min(3, p.g + 1);
    p.o = Math.min(5, p.o + 1);

    if (p.c || p.g >= 3 || p.o >= 5) {
        G.tierProg = { u: TIER_KEYS[idx + 1], p: null };
        G.tier = TIER_KEYS[idx + 1];
        syncTierIcons();
        Game.Notify('Promotion granted', 'A higher difficulty has been cleared for processing.', TIER_ICONS[idx + 1], 6);
    }
}
// golden cookie duration scaling
function cloneEffectDurMod() {
    var m = 1;
    if (Game.Has('Get lucky')) m *= 2;
    if (Game.Has('Lasting fortune')) m *= 1.1;
    ['Lucky digit', 'Lucky number', 'Green yeast digestives', 'Lucky payout'].forEach(function(u) { if (Game.Has(u)) m *= 1.01; });
    m *= 1 + Game.auraMult('Epoch Manipulator') * 0.05;
    m *= Game.eff('goldenCookieEffDur');
    if (Game.hasGod) {
        var g = Game.hasGod('decadence');
        if (g == 1) m *= 1.07; else if (g == 2) m *= 1.05; else if (g == 3) m *= 1.02;
    }
    return m;
}
// buff types unique to minigame rewards
var CLONE_BUFFS = [
    ['clicking clones', 'Clicking Clones', [0, 14], function(p) { return 'Clicking power x' + p; }, 'multClick'],
    ['clone twinning', 'Clone Twinning', [20, 14, 'custom'], function(p) { return 'Cookie production x' + p; }, 'multCpS'],
    ['clearance protocol', 'Clearance Protocol', [3, 0], function(p) { return 'Buildings and upgrades are ' + Math.round((1 - p) * 100) + '% cheaper'; }, 'power', 1],
    ['clone greed', 'Clone Greed', [3, 5], function(p) { return 'Golden cookies spawn ' + Math.round((p - 1) * 100) + '% faster'; }, 'power', 1],
    ['cloneconomics', 'Cloneconomics', [17, 6], function() { return 'New Downline actions last twice as long'; }, 'power']
];
function registerCloneBuffTypes() {
    if (!Game || !Game.buffType || !Game.buffTypesByName) return;
    var refreshEffs = function() { if (ClonesM._updateEffs) ClonesM._updateEffs(); };
    CLONE_BUFFS.forEach(function(b) {
        if (Game.buffTypesByName[b[0]]) return;
        new Game.buffType(b[0], function(time, pow) {
            var o = {
                name: b[1],
                desc: b[3](pow) + ' for ' + Game.sayTime(time * Game.fps, -1) + '!',
                icon: b[2].length === 3 ? [b[2][0], b[2][1], window.getSpriteSheet(b[2][2])] : b[2],
                time: time * Game.fps, add: true, aura: 1
            };
            o[b[4]] = pow;
            if (b[5]) o.onDie = refreshEffs;
            return o;
        });
    });
}
registerCloneBuffTypes();

// WriteSave only serializes vanilla-flagged buff types, so ours are re-granted on load
function cloneBuffSave() {
    var out = [];
    CLONE_BUFFS.forEach(function(bt) {
        var bf = Game.buffs && Game.buffs[bt[1]];
        if (bf && bf.time > 0) out.push({ n: bt[0], t: Math.round(bf.time / (Game.fps || 30)), m: Math.round(bf.maxTime / (Game.fps || 30)), pw: bf.multClick || bf.multCpS || bf.power });
    });
    return out;
}
function restoreCloneBuffs(saved) {
    if (!Array.isArray(saved) || !Game.buffTypesByName) return;
    CLONE_BUFFS.forEach(function(bt) { if (Game.buffs && Game.buffs[bt[1]] && Game.killBuff) Game.killBuff(bt[1]); });
    saved.forEach(function(bd) {
        if (!bd || typeof bd.n !== 'string') return;
        var bt = CLONE_BUFFS.filter(function(b) { return b[0] === bd.n; })[0];
        var secs = saveNum(bd.t), pow = bd.pw === undefined ? 1 : bd.pw;
        if (!bt || !secs || !Game.buffTypesByName[bd.n]) return;
        try {
            var restored = Game.gainBuff(bd.n, secs, pow);
            if (restored) { restored.maxTime = (saveNum(bd.m) || secs) * (Game.fps || 30); restored[bt[4]] = pow; }
        } catch (e) {}
    });
    ClonesM._updateEffs();
}

if (window.Game && Game.registerHook && !Game._clonesReincarnateHooked) {
    Game.registerHook('reincarnate', function() { ClonesM.onAscend(); });
    Game._clonesReincarnateHooked = true;
}

ClonesM._updateEffs = function() {
    if (ClonesM._updatingEffs) return;
    var cp = Game.hasBuff('Clearance Protocol'), cg = Game.hasBuff('Clone Greed');
    var old = ClonesM.effs || {};
    if (!cp && !cg && !Object.keys(old).length) return; // no marker buffs, nothing to feed
    ClonesM._updatingEffs = true;
    try {
        var effs = {};
        if (cp) { effs.buildingCost = cp.power; effs.upgradeCost = cp.power; }
        if (cg) effs.goldenCookieFreq = cg.power;
        var changed = Object.keys(effs).some(function(k) { return old[k] !== effs[k]; }) ||
            Object.keys(old).some(function(k) { return effs[k] === undefined; });
        ClonesM.effs = effs;
        if (changed) Game.recalculateGains = 1;
    } finally { ClonesM._updatingEffs = false; }
};
function cloneMg(b) { var o = Game.Objects[b]; return o && o.minigame ? o.minigame : null; }

var SIMPLE_REWARDS = {
    free_lump:      { lumps: 1, needLumps: 1, msg: 'Sweet, a sugar lump!' },
    click_x7:       { buff: 'clicking clones',     secs: 77,   mult: 7,    msg: 'Clicking power septupled!' },
    dragon_harvest: { buff: 'dragon harvest',        secs: 60,   mult: 15,   msg: 'Dragons begin the harvest!', durMod: 1 },
    random_gc:      { shimmer: 'golden', force: { noWrath: true },           msg: 'A golden cookie appears!' },
    reset_minigames:{ run: function() { Game.lumpRefill = 0; },              msg: 'Cooldowns cleared!' },
    gc_faster:      { buff: 'clone greed',         secs: 3600, mult: 1.25, msg: 'Golden cookies now spawn faster!', effs: 1 },
    free_yous:      { run: function() { Game.Objects['You'].getFree(5); Game.recalculateGains = 1; }, msg: 'Additional Yous appear!' },
    double_cps:     { buff: 'clone twinning',        secs: 420,  mult: 2,    msg: 'Cookie production doubled!' },
    grimoire_mana:  { run: function() {
        var gm = cloneMg('Wizard tower');
        if (!gm || typeof gm.magic !== 'number' || !gm.magicM) return 'the Grimoire';
        gm.magic = Math.min(gm.magicM, gm.magic + gm.magicM * 0.5);
    }, msg: 'You gain mana!' },
    cps_day:        { earn: 86400, cap: 0.5 },
    click_frenzy:   { buff: 'click frenzy',          secs: 13,   mult: 777,  msg: 'Clicking power x777!', durMod: 1 },
    garden_ticks:   { run: function() {
        var fm = cloneMg('Farm');
        if (!fm || typeof fm.logic !== 'function') return 'the garden';
        var wf = fm.freeze; fm.freeze = 0;
        for (var gi = 0; gi < 10; gi++) { fm.nextStep = Date.now(); fm.logic(); }
        fm.freeze = wf;
    }, msg: 'Your garden leaps forward in time!' },
    lump_faster:    { run: function() { Game.lumpT -= 7200000; }, msg: 'Your sugar lump ages!' },
    reindeer_lanterns: { run: function(rw) {
        var hasLantern = !!(Game.shimmerTypes && Game.shimmerTypes['lantern']);
        var bits = Math.floor(redeemRng(rw)() * 1024);
        for (var ri = 0; ri < 10; ri++) (function(n) {
            setTimeout(function() {
                if (hasLantern && ((bits >> n) & 1)) {
                    var ss = Game.season; Game.season = 'lunarnewyear';
                    var lan = new Game.shimmer('lantern'); Game.season = ss;
                    if (lan) lan.delay = 0;
                } else new Game.shimmer('reindeer');
            }, n * 300);
        })(ri);
    }, msg: 'A festive crowd descends!' },
    wrath_cookie:   { shimmer: 'golden', force: { wrath: true },             msg: 'A wrath cookie appears!' },
    cps_hour:       { earn: 3600,  cap: 0.08 },
    frenzy:         { buff: 'frenzy',                secs: 77,   mult: 7,    msg: 'Cookie production x7!', durMod: 1 },
    cheap:          { buff: 'clearance protocol',    secs: 180,  mult: 0.9,  msg: 'Buildings and upgrades are cheaper!', effs: 1 },
    downline_double:{ buff: 'cloneconomics',         secs: 900,  mult: 2,    msg: 'New Downline actions last longer!' },
    free_play:      { run: function() { G.nextPuzzleAt = 0; updateCooldown(); }, msg: 'Your next assignment is ready!' }
};

//possible potion results
var POTION_BUFFS = {
    'Oil of Hephaestus': [180, 1.15],       'Arcana of the Finger': [900, 1.2],
    'Tincture of Purpose': [120, 1.3],      'Infusion of Chance': [1800, 1.3],
    'Ether of Serendipity': [60, 1.5],      'Tonic of Ebisu': [900, 1.1],
    'Distillate of Kala': [900, 1.15],      'Cordial of Tyche': [900],
    'Vapor of Luck': [600],                 'Ember of Dragon Fire': [3600, 1.1],
    'Emulsion of Sinful Greed': [1800],     'Corruption of Sin': [1800, 0.5],
    'Vitae of the Mother': [900, 1.03],     'Mercury of Age': [900, 1.25],
    'Balm of Merlin': [600, 1],             'Bloom of Industry': [600]
};
// reward time
function applyCloneReward(rw) {
    var icon = rwIcon(rw);
    var note = function(text) { Game.Notify(rw.name, text, icon, 6); };
    var fizzle = function(what) { note('Nothing happened — ' + what + ' is not available.'); };
    var spec = SIMPLE_REWARDS[rw.id];
    // sugar-lump rewards fizzle before lumps are unlocked
    if (((spec && spec.needLumps) || rw.id === 'rare_lump' || rw.id === 'lump_faster') && !(Game.canLumps && Game.canLumps())) {
        fizzle('sugar lumps');
        return;
    }
    if (spec) {
        var msg = spec.msg;
        if (spec.buff) {
            var M = spec.durMod ? cloneEffectDurMod() : 1;
            Game.gainBuff(spec.buff, Math.ceil(spec.secs * M), spec.mult);
            if (spec.effs) ClonesM._updateEffs();
        }
        if (spec.shimmer) new Game.shimmer(spec.shimmer, spec.force);
        if (spec.lumps) Game.gainLumps(spec.lumps);
        if (spec.earn) { var amt = Math.min(Game.cookies * spec.cap, Game.cookiesPs * spec.earn); Game.Earn(amt); msg = 'Gained ' + Beautify(amt) + ' cookies!'; }
        // run() returning a string fizzles the reward with reason
        var fail = spec.run && spec.run(rw);
        if (fail) { fizzle(fail); return; }
        note(msg);
        return;
    }
    switch (rw.id) {
        case 'random_bs': {
            var list = [];
            for (var i in Game.Objects) { if (Game.Objects[i].amount >= 10) list.push(Game.Objects[i].id); }
            var M = cloneEffectDurMod();
            if (!list.length) { Game.gainBuff('frenzy', Math.ceil(77 * M), 7); note('No building qualifies — gained a Frenzy instead!'); break; }
            var objId = list[Math.floor(redeemRng(rw)() * list.length)], pow = Game.ObjectsById[objId].amount / 10 + 1;
            Game.gainBuff('building buff', Math.ceil(30 * M), pow, objId);
            note('Your ' + Game.ObjectsById[objId].plural + ' are boosting your CpS!');
            break;
        }
        case 'extend_buffs': {
            var n = 0;
            for (var bn in Game.buffs) {
                var bb = Game.buffs[bn];
                if (typeof bb.time !== 'number' || bb.time < 0) continue; // skip permanent/untimed buffs
                bb.time += 30 * Game.fps; bb.maxTime += 30 * Game.fps; n++;
            }
            note('Buffs have been extended!');
            break;
        }
        case 'potion_effect': {
            // gainBuff throws on an unregistered type, so potions minigame must be loaded
            var names = Object.keys(POTION_BUFFS), pn = names[Math.floor(redeemRng(rw)() * names.length)];
            if (!Game.buffTypesByName || !Game.buffTypesByName[pn]) { fizzle('the potion brewery'); break; }
            var pa = POTION_BUFFS[pn];
            Game.gainBuff(pn, pa[0], pa[1]);
            note('You gain ' + pn + 'from your Potions Class!');
            break;
        }
        case 'fill_reagents': {
            var PM2 = window.PotionsM;
            if (!PM2 || !PM2.G) { fizzle('the potion brewery'); break; }
            var ids = {}, rid;
            for (rid in PM2.G.unlockedReagents) ids[rid] = 1; for (rid in PM2.G.reagents) ids[rid] = 1;
            var count = 0;
            for (rid in ids) { PM2.G.reagents[rid] = PM2.G.maxReagents; count++; }
            if (PM2._renderSelectedReagents) PM2._renderSelectedReagents();
            if (PM2._buildReagents) PM2._buildReagents();
            note('Reagents everywhere the eye can see!');
            break;
        }
        case 'rare_lump': {
            var roll = redeemRng(rw)(); // bifurcated 50%, meaty 40%, caramelized 9%, golden 1%
            Game.lumpCurrentType = roll < 0.50 ? 1 : roll < 0.90 ? 3 : roll < 0.99 ? 4 : 2;
            note('Your sugar lump has morphed into a ' + ['', 'bifurcated', 'golden', 'meaty', 'caramelized'][Game.lumpCurrentType] + '!');
            break;
        }
        case 'remove_seasons': {
            var forgotten = Math.min(5, Game.seasonUses);
            Game.seasonUses = Math.max(0, Game.seasonUses - 5);
            note('Your rememberance of the calendar is suddenly weaker!');
            break;
        }
        default:
            note('Unknown reward, nothing happens.');
    }
}
ClonesM.claimReward = function() {
    if (G.claimed || Object.keys(G.solved).length < 20) return;
    G.claimed = 1;
    G.reward = rollReward(); // held for activation; null when the run failed
    G.spinPending = G.reward ? 1 : 0; 
    renderBoard();
};
function grantReward(rw) {
    try { applyCloneReward(rw); playSnd('snd/chime.mp3'); }
    catch (e) {
        console.error('Clone Escape reward "' + rw.id + '" failed:', e);
        if (typeof Game.Notify === 'function') Game.Notify('Redeemed: ' + rw.name, 'Something went wrong while applying the reward.');
    }
}
ClonesM.redeemReward = function() {
    var r = G.reward;
    if (!r) return;
    G.reward = null; G.redeemed = 1; G.redeemedRw = r; G.spinPending = 0;
    closePrizeSlots();
    showRedeemedLabel();
    var rd = l('clonesRedeem'); if (rd) rd.style.display = 'none';
    if (l('clonesRewardLine')) l('clonesRewardLine').innerHTML = rewardLineHtml();
    grantReward(r.reward);
};
ClonesM.rerollReward = function() {
    if (!ClonesM.debug || !G.reward) return;
    G.reward = rollReward(++G.debugSalt);
    if (!G.reward) return;
    G.spinPending = 1;
    closePrizeSlots();
    spinPrize();
};

// Terminal hook — instant cash-out; skips the slot reveal
ClonesM.cashInReward = function() {
    // a save still waiting on its puzzle file parks its run in G.restore — that prize is cashable too
    if (!G.reward && G.restore && !G.restore.redeemed && G.restore.reward) {
        var pr = G.restore.reward, prw = pr && pr.reward;
        if (!prw || typeof prw.id !== 'string' || typeof prw.name !== 'string' || !Array.isArray(prw.icon)) {
            G.restore.reward = null; // malformed — populate's svRw would drop it anyway
        } else {
            G.restore.reward = null; G.restore.redeemed = 1; G.restore.redeemedRw = pr; // lands pre-redeemed, no spin replay
            grantReward(prw);
            return { success: true, message: 'Cashed in ' + prw.name + '!' };
        }
    }
    if (G.redeemed) return { success: false, message: 'Clone Escape reward was already cashed in.' };
    if (!G.puzzle || Object.keys(G.solved).length < 20) return { success: false, message: 'Clone Escape is not solved yet.' };
    if (!G.claimed) ClonesM.claimReward();
    var live = G.reward && G.reward.reward;
    if (!live) return { success: false, message: 'No Clone Escape reward is waiting.' };
    var name = live.name;
    ClonesM.redeemReward(); // clears spinPending, kills the reels, shows the redeemed label
    return { success: true, message: 'Cashed in ' + name + '!' };
};

ClonesM.tutorial = function(force) {
    if (!G.ready) { setStatus('Sprites still loading…'); return; }
    if (!force && heldPrize()) return forfeitPrompt('the tutorial', 'ClonesM.tutorial(true)');
    startPuzzle('tutorial');
};
ClonesM.debugSolve = function() {
    if (!ClonesM.debug || !G.puzzle || G.populating || G.claimed) return;
    if (!G.tFirst) G.tFirst = Date.now();
    for (var i = 0; i < 20; i++) {
        if (G.solved[i] !== undefined) continue;
        G.solved[i] = G.puzzle.grid[i];
        paintSolved(i);
        stripTags(i);
        cardClue(i);
    }
    G.cornerTags = {};
    clearHint();
    if (Object.keys(G.solved).length === 20) completePuzzle();
};
function completePuzzle() {
    if (G.tDone) return; // already counted 
    G.tDone = Date.now();

    if (G.puzzle.tutorial) {
        if (!G.tutorialDone) G.tutBonus = 1;
        G.tutorialDone = 1;
        syncTutButton();
    } else {
        markPuzzleDone(G.puzzleFile); // every finished board
        var mist = mistakeCount();
        G.failed = mist >= 8 ? 1 : 0; // finished, but too poor to compensate
        // the cooldown runs from a rewarded completion, a failed run is free
        if (!G.failed) {
            G.won++;
            G.nextPuzzleAt = Date.now() + puzzleCooldown() * (mist ? 1 : 0.5); // flawless clears halve it
            syncCompleted();
            updateCooldown();
        }
        recordTierProgress();
        if (!mist) G.cleanWins++;
        if (Game.Achievements) [
            ['The Quick and the Duplicate', !mist && G.tDone - G.tFirst <= 120000],
            ['An Allegedly Perfect Record', G.cleanWins >= 10],
            ['Doppelganger gang', G.won >= 123],
            ['The Devil You Clone', tierUnlocked('V')],
            ['The Devil Is in the Duplicates', G.puzzleTier === 'V' && !mist && !G.restored]
        ].forEach(function(a) { awardClonesAchievement(a[0], a[1]); });
    }
    addEndIcons();
    playSnd('snd/cymbalRev.mp3');
    showClaim();
}

function addEndIcons() {
    for (var i = 0; i < 20; i++) {
        var mis = G.mistakeCells.indexOf(i) !== -1 || G.earlyCells.indexOf(i) !== -1;
        var hin = G.hintedCells.indexOf(i) !== -1;
        if (!mis && !hin) continue;
        var el = l('clonesCell' + cellId(i));
        if (!el) continue;
        if (hin) el.appendChild(endIcon(22, 27, -15)); // hint under the wrong icon
        if (mis) el.appendChild(endIcon(23, 27, 5));
    }
}
ClonesM.hintTooltip = function() {
    return '<div style="padding:8px;width:280px;"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-image:url(' + window.getSpriteSheet('custom') + ');background-position:' + (-22 * 48) + 'px ' + (-27 * 48) + 'px;"></div><div class="name">Supervisor!</div><div class="line"></div>' +
        '<div class="description">Calls over your supervisor for a hint. They will begrudgingly highlight the clues and a cell that can be logically revealed at the moment. While helpful it will be reflected negatively in your final score.' +
        '<div style="font-size:10px;color:#999;font-style:italic;margin-top:6px;">"The sorting supervisor seems to have a subhuman ability to instantly see everything you are missing and before any questions can be asked they are gone in an angry huff and under the breath mumbles about how you aren\'t working out."</div></div></div>';
};
ClonesM.hint = function() {
    if (G.populating) return;
    if (G.hintCell !== null) { clearHint(); return; }
    var fm = frontierMask();
    if (!fm) return;
    var starterMask = G.puzzle.deduce['0'] || 0;
    var known = starterMask;
    for (var s in G.solved) known |= 1 << (+s);
    var bits = function(m, want) {
        var n = 0;
        for (var b = 0; b < 20; b++) if ((m & (1 << b)) && (want === undefined || !!G.dimmed[b] === want)) n++;
        return n;
    };
    // light the cell + cited clue rows; a clue-free proof of the starter
    var cite = function(i, m) {
        G.hintCell = i;
        if (G.hintedCells.indexOf(i) === -1) G.hintedCells.push(i);
        var el = l('clonesCell' + cellId(i));
        if (el) el.classList.add('clones-hint');
        for (var b = 0; m > 0 && b < 20; b++) {
            if (!(m & (1 << b))) continue;
            var row = G.clueRowForClue[b];
            if (row !== undefined && G.clueRowEls[row]) G.clueRowEls[row].classList.add('clones-hint-clue');
        }
        if (m === 0 && (starterMask & (1 << i)) && G.tellRow >= 0 && G.clueRowEls[G.tellRow])
            G.clueRowEls[G.tellRow].classList.add('clones-hint-clue');
    };
    var hp = G.puzzle.hintProofs;
    if (hp) {
        // an entry applies iff its clues are read and its pins known; cite the
        // fewest-clue entry across the frontier, dimmed clues break ties
        var cand = [], bestN = 99, bestDim = 99;
        for (var c = 0; c < 20; c++) {
            if (!(fm & (1 << c))) continue;
            (hp[cellId(c)] || []).forEach(function(e) {
                if ((e[0] & ~G.readMask) !== 0 || (e[1] & ~known) !== 0) return;
                var n = bits(e[0]), d = bits(e[0], true);
                if (n < bestN || (n === bestN && d < bestDim)) { cand = []; bestN = n; bestDim = d; }
                if (n === bestN && d === bestDim) cand.push([c, e[0]]);
            });
        }
        if (cand.length) {
            var pk = cand[Math.floor(Math.random() * cand.length)];
            cite(pk[0], pk[1]);
            return;
        }
    }
    var dead = 0;
    G.puzzle.clues.forEach(function(cl, c) {
        if (cl && !(cl.scope & ~known)) dead |= 1 << c;
    });
    var liveClues = G.readMask & ~dead;
    // conditional proofs stored minimal sets minus dead clues, ⊆-minimal only
    var residFor = function(ci) {
        var out = [], seen = {};
        (G.puzzle.proofs[cellId(ci)] || []).forEach(function(m) {
            if ((m & ~G.readMask) !== 0) return;
            var r = m & liveClues;
            if (!seen[r]) { seen[r] = 1; out.push(r); }
        });
        return out.filter(function(m) { return !out.some(function(o) { return o !== m && (o & ~m) === 0; }); });
    };
    var pool = [];
    for (var c = 0; c < 20; c++) if ((fm & (1 << c)) && G.hintedCells.indexOf(c) === -1) pool.push(c);
    if (!pool.length) for (c = 0; c < 20; c++) if (fm & (1 << c)) pool.push(c);
    // prefer a cell provable without dimmed clues 
    var active = pool.filter(function(c) { return residFor(c).some(function(m) { return !bits(m, true); }); });
    if (active.length) pool = active;
    // cite the leanest conditional proof 
    var best = -1, bestDim = 99, bestBits = 99;
    var i = pool[Math.floor(Math.random() * pool.length)];
    residFor(i).forEach(function(m) {
        var dim = bits(m, true), n = bits(m);
        if (dim < bestDim || (dim === bestDim && n < bestBits)) { best = m; bestDim = dim; bestBits = n; }
    });
    cite(i, Math.max(best, 0));
};
function clearHint() {
    if (G.hintCell !== null) {
        var el = l('clonesCell' + cellId(G.hintCell));
        if (el) el.classList.remove('clones-hint');
        G.hintCell = null;
    }
    G.clueRowEls.forEach(function(el) { el.classList.remove('clones-hint-clue'); });
}

function syncTutButton() {
    var b = l('clonesTut');
    if (b) b.classList.toggle('clones-attention', !G.tutorialDone);
}
function syncBottomBtns() {
    var q = l('clonesQuitTut');
    if (q) q.style.display = (G.puzzle && G.puzzle.tutorial && !G.claimed) ? '' : 'none';
    var g = l('clonesGlossary');
    if (g) g.style.display = (G.puzzle && !G.puzzle.tutorial && !G.claimed) ? '' : 'none';
}
function syncCompleted() {
    var el = l('clonesCompleted');
    if (el) el.textContent = 'Scenarios Completed ' + (typeof Beautify === 'function' ? Beautify(G.won) : G.won);
}
function clearBoardUI() {
    var grid = l('clonesGrid'), list = l('clonesClues');
    if (grid) { grid.innerHTML = ''; grid.classList.remove('clones-wipe-all'); }
    if (list) list.innerHTML = '';
    var head = l('clonesHead'); if (head) head.style.display = 'none'; // Intel Report + Supervisor!
    var hintBtn = l('clonesHint'); if (hintBtn) hintBtn.style.display = 'none';
}
function syncAllUI() {
    try {
        syncStartUI(); syncTutButton(); syncTierIcons(); showClaim(); syncCompleted(); updateCooldown();
    } catch (e) { console.error('Clone Escape UI refresh failed:', e); }
}
// got a know it all here
ClonesM.quitTutorial = function() {
    if (!G.puzzle || !G.puzzle.tutorial || G.claimed) return;
    G.popGen++; // abort pending populate/wipe timers
    G.puzzle = null; G.puzzleFile = null;
    clearRun();
    clearBoardUI();
    syncStartUI(); syncBottomBtns(); showClaim(); setStatus('');
};

var GLOSSARY = [
    ['At least', 'At least, but possibly more.'],
    ['Between', 'The cells strictly between two named suspects in the same row or column; the named suspects themselves are never included.'],
    ['Both', 'Exactly two.'],
    ['Column', 'Each of the 4 columns is a vertical line of 5 suspects, lettered A through D.'],
    ['Connected', 'The named suspects form one unbroken chain directly connected (no diagonals); requires at least 2 suspects.'],
    ['Corner', 'The 4 corner positions: A1, D1, A5, and D5.'],
    ['Directly', 'The single neighboring cell in a direction.'],
    ['Edge', 'The outer ring: rows 1 and 5 and columns A and D.'],
    ['Even', 'An even number: 2, 4, 6, etc.'],
    ['Exactly', 'Precisely the number.'],
    ['Fewest', 'Strictly less than.'],
    ['Most', 'Strictly more than.'],
    ['Neighbors', 'Everyone touching a suspect, including diagonally. Suspects in the middle have 8 neighbors, suspects on the edges have 5, and corners have 3.'],
    ['Odd', 'An odd number: 1, 3, 5, etc.'],
    ['Only', 'Exactly one.'],
    ['Row', 'Each of the 5 rows is a horizontal line of 4 suspects, numbered 1 through 5.'],
    ['Shared', 'Suspects who neighbor both of the named suspects - the overlapping group of neighbors. Also phrased as "in common" in some clues.'],
    ['Total', 'The total count combining all named units.']
];

ClonesM.glossary = function() {
    Game.Prompt('<h3>Glossary</h3><div class="block" style="font-size:11px;text-align:left;max-height:50vh;overflow-y:auto;">' +
        GLOSSARY.map(function(e) { return '<div style="margin-bottom:6px;"><b>' + e[0] + '</b>: ' + e[1] + '</div>'; }).join('') +
        '</div>', ['Close']);
};

function syncTierIcons() {
    var row = l('clonesTierRow');
    if (!row) return;
    var sel = TIER_KEYS.indexOf(G.tier);
    [].forEach.call(row.children, function(d, idx) {
        var locked = !ClonesM.debug && !tierUnlocked(TIER_KEYS[idx]);
        d.classList.toggle('clones-tier-locked', locked);
        d.style.opacity = (!locked && idx <= sel) ? '1' : '0.15';
    });
}
// prize is forfeited by starting anything new
function forfeitPrompt(what, go) {
    Game.Prompt('<h3>Unused prize</h3><div class="block" style="font-size:11px;">You have a prize waiting to be used, starting ' + what + ' will forfeit it.</div>', [
        ['Forfeit & start', 'Game.ClosePrompt();' + go],
        ['Cancel', 'Game.ClosePrompt()']
    ]);
}
// a restore still loading (or parked offline) holds its prize too
function heldPrize() { return G.reward || (G.restore && !G.restore.redeemed && G.restore.reward) || null; }
ClonesM.newPuzzle = function(force) {
    if (!G.ready) { setStatus('Sprites still loading…'); return; }
    if (G.nextPuzzleAt > Date.now()) return;
    if (!force && heldPrize()) return forfeitPrompt('a new scenario', 'ClonesM.newPuzzle(true)');
    startPuzzle(null); // clearRun wipes any held prize
};

//just some AI generated CSS junk im so over css 
var BG_URL = 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/main/assets/CloneBG.png';
var BG_URL_CDN = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CloneBG.png';
var CSS = '.clones-wrap{padding:8px 12px 18px;font-size:12px;color:#ccc;position:relative;' +
'background:url(' + (Game.resPath || 'https://orteil.dashnet.org/cookieclicker/') + 'img/shadedBorders.png),url(' + BG_URL + '),url(' + BG_URL_CDN + ');background-size:100% 100%,auto,auto;background-repeat:no-repeat,repeat,repeat;min-height:490px}' +
'.clones-top{display:flex;gap:8px;align-items:center;margin-bottom:8px}#clonesStatus{color:#888;font-size:11px;margin-left:6px}' +
'#clonesPuzzleId{position:absolute;bottom:2px;right:6px;font-size:10px;color:#666}' +
'.clones-main{display:flex;gap:12px;align-items:stretch;min-height:438px}' +
'.clones-main.clones-stacked{flex-direction:column}.clones-main.clones-stacked .clones-side{flex:0 0 auto}' +
'.clones-main.clones-stacked .clones-clues{max-height:220px}' +
'.clones-grid{display:grid;grid-template-columns:repeat(4,72px);gap:1px;width:291px;min-height:436px;flex-shrink:0;padding:6px;background:#141414}' +
'.clones-start{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:20}' +
'.clones-cd-wrap{position:relative;display:inline-block;padding:8px 16px;padding-left:32px;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}' +
'#clonesLumpRefill{position:absolute;left:-6px;top:-10px;cursor:pointer;}' +
'.clones-tier-label{font-size:11px;font-weight:bold;color:#ccc}.clones-tier-row{display:flex;gap:2px}' +
'.clones-tier-icon{width:48px;height:48px;cursor:pointer;opacity:0.15;transition:none}' +
'.clones-tier-icon.clones-tier-locked{cursor:not-allowed;filter:grayscale(0.9)}' +
'#clonesTut.clones-attention{animation:rainbowCycle 5s infinite ease-in-out,pucker 0.2s ease-out;box-shadow:0px 0px 1px 2px currentcolor}' +
'#prizeSlots{position:relative;width:max-content;padding:12px;background:#111219;border:2px solid #4c4b54;margin:8px auto}' +
'#prizeSlots .reels{display:flex;gap:10px}' +
'#prizeSlots .reel{position:relative;width:70px;height:70px;overflow:hidden;background:#2b2c37;border:2px solid #6b6874;box-sizing:border-box}' +
'#prizeSlots .reel::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(#15151c,transparent 30%,transparent 70%,#15151c)}' +
'#prizeSlots .track{position:absolute;left:9px;top:9px;width:48px}' +
'#prizeSlots .symbol{display:flex;width:48px;height:60px;align-items:center;justify-content:center}' +
'#prizeSlots .symbol>div,#prizeSlots .prize>div{width:48px;height:48px;image-rendering:pixelated}' +
'#prizeSlots .prize{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.2);opacity:0;pointer-events:none;filter:drop-shadow(0 0 5px #f2cf7077)}' +
'#prizeSlots .prize-title{position:absolute;left:0;right:0;top:-6px;transform:translateY(-100%);text-align:center;font-size:11px;color:#ccc;opacity:0;transition:opacity .4s;pointer-events:none;white-space:nowrap}' +
'#clonesRedeemedLabel{margin:8px auto;text-align:center;font-size:12px;color:#ccc;line-height:1.6}' +
'#clonesCompleted{position:absolute;top:100%;left:0;right:0;margin-top:4px;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000}' +
'.clones-main.clones-stacked #clonesCompleted{position:static}' +
'#prizeSlots.done .prize-title{opacity:1}' +
'#prizeSlots.merging .reel:first-child{animation:stackLeft 850ms steps(12,end) forwards}' +
'#prizeSlots.merging .reel:nth-child(2){animation:stackCenter 850ms steps(12,end) forwards}' +
'#prizeSlots.merging .reel:last-child{animation:stackRight 850ms steps(12,end) forwards}' +
'#prizeSlots.merging .prize{animation:stackPrize 850ms steps(10,end) forwards}' +
'#prizeSlots.done .reels{visibility:hidden}' +
'#prizeSlots.done .prize{opacity:1;transform:translate(-50%,-50%) scale(1.35)}' +
'@keyframes stackLeft{55%{transform:translateX(var(--pitch));opacity:1}85%,100%{transform:translateX(var(--pitch)) scale(.25);opacity:0}}' +
'@keyframes stackCenter{55%{opacity:1}85%,100%{transform:scale(.25);opacity:0}}' +
'@keyframes stackRight{55%{transform:translateX(calc(-1 * var(--pitch)));opacity:1}85%,100%{transform:translateX(calc(-1 * var(--pitch))) scale(.25);opacity:0}}' +
'@keyframes stackPrize{0%,70%{opacity:0;transform:translate(-50%,-50%) scale(.2)}90%{opacity:1;transform:translate(-50%,-50%) scale(1.65)}100%{opacity:1;transform:translate(-50%,-50%) scale(1.35)}}' +
'.clones-cell{border:1px solid rgba(255,255,255,0.3);background:#141414;position:relative;height:84px;box-sizing:border-box;display:flex;align-items:center;justify-content:center}' +
'.clones-you{position:relative;width:64px;height:64px;transform:translateY(-4px);pointer-events:none}' +
'.clones-you canvas{width:64px;height:64px;image-rendering:pixelated;border-radius:16px;position:absolute;left:0;top:0;z-index:1}' +
'.clones-you-head{mask-image:radial-gradient(rgba(0,0,0,1) 0%,rgba(0,0,0,1) 40%,rgba(0,0,0,0) 75%);-webkit-mask-image:radial-gradient(rgba(0,0,0,1) 0%,rgba(0,0,0,1) 60%,rgba(0,0,0,0) 75%);z-index:2;transition:opacity .1s ease}' +
'.clones-you-halo{filter:blur(1px);opacity:0.5;z-index:3;transition:opacity .1s ease}' +
'.clones-coords{position:absolute;top:0;left:2px;font-size:8px;font-weight:bold;color:#ccc;z-index:6;text-shadow:0 1px 2px #000}' +
'.clones-name{position:absolute;bottom:-1px;left:0;right:0;font-size:10px;font-weight:bold;color:#fff;text-align:center;z-index:6;pointer-events:none;text-shadow:0 1px 2px #000,0 0 3px #000;transition:opacity .1s ease}' +
'.clones-unpop .clones-you-head,.clones-unpop .clones-you-halo,.clones-unpop .clones-name{opacity:0}' +
'.clones-wipe-auth .clones-you-head,.clones-wipe-auth .clones-you-halo{opacity:0;transition:opacity .3s ease;transition-delay:var(--wd,0ms)}' +
'.clones-wipe-all .clones-cell{opacity:0;transition:opacity .5s ease;pointer-events:none}' +
'.clones-cell.clones-picked-clone{border:2px solid #E63A3A}.clones-cell.clones-picked-authentic{border:2px solid #24C95A}' +
'.clones-cell.clones-picked-clone::after,.clones-cell.clones-picked-authentic::after{content:\'\';position:absolute;inset:0;pointer-events:none;z-index:10}' +
'.clones-cell.clones-picked-clone::after{background:rgba(230,58,58,0.15)}.clones-cell.clones-picked-authentic::after{background:rgba(36,201,90,0.15)}' +
'.clones-cell.clones-hint{outline:2px solid #FFE600;z-index:5;animation:clonesHintGlow 3s ease-in-out infinite}' +
'.clones-cell.clones-hint::after{content:\'\';position:absolute;inset:0;pointer-events:none;z-index:14;animation:clonesHintInset 3s ease-in-out infinite}' +
'@keyframes clonesHintGlow{0%,100%{box-shadow:0 0 2px 1px rgba(255,230,0,0.13)}50%{box-shadow:0 0 8px 2px rgba(255,230,0,0.29)}}' +
'@keyframes clonesHintInset{0%,100%{box-shadow:inset 0 0 2px 0 rgba(255,230,0,0.15)}50%{box-shadow:inset 0 0 10px 3px rgba(255,230,0,0.42)}}' +
'.clones-cell.clones-clue-ref{outline:2px solid #87ceeb;z-index:5;animation:clonesRefGlow 3s ease-in-out infinite}' +
'.clones-cell.clones-clue-ref::after{content:\'\';position:absolute;inset:0;pointer-events:none;z-index:14;animation:clonesRefInset 3s ease-in-out infinite}' +
'.clones-cell.clones-clue-ref .clones-coords,.clones-cell.clones-clue-ref .clones-name{color:#87ceeb}' +
'@keyframes clonesRefGlow{0%,100%{box-shadow:0 0 2px 1px rgba(135,206,235,0.13)}50%{box-shadow:0 0 8px 2px rgba(135,206,235,0.29)}}' +
'@keyframes clonesRefInset{0%,100%{box-shadow:inset 0 0 2px 0 rgba(135,206,235,0.15)}50%{box-shadow:inset 0 0 10px 3px rgba(135,206,235,0.42)}}' +
'.clones-tag{position:absolute;width:0;height:0;z-index:15;cursor:pointer;filter:drop-shadow(0 0 2px var(--cc,#666))}' +
'.clones-tag.top-right{top:0;right:0;border:0 solid transparent;border-width:0 17px 17px 0}.clones-tag.bottom-right{bottom:0;right:0;border:0 solid transparent;border-width:0 0 17px 17px}' +
'.clones-tag.bottom-left{bottom:0;left:0;border:0 solid transparent;border-width:17px 0 0 17px}' +
'.clones-tag.none{opacity:0}' +
'.clones-tag.red{--cc:#FF3B30}.clones-tag.green{--cc:#34C759}.clones-tag.yellow{--cc:#FFE600}' +
'.clones-tag.blue{--cc:#00BFFF}.clones-tag.purple{--cc:#E100FF}.clones-tag.orange{--cc:#FF7B00}' +
'.clones-tag.top-right:not(.none){border-color:transparent var(--cc) transparent transparent}.clones-tag.bottom-right:not(.none){border-color:transparent transparent var(--cc) transparent}' +
'.clones-tag.bottom-left:not(.none){border-color:transparent transparent transparent var(--cc)}' +
'.clones-endicon{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;pointer-events:none;z-index:12;filter:drop-shadow(0 0 3px #000)}' +
'.clones-side{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0;padding:8px;background:#141414;box-sizing:border-box;position:relative}' +
'#clonesQuitTut,#clonesGlossary{position:absolute;top:100%;left:0;right:0;margin-top:4px;text-align:center}' +
'.clones-head{display:flex;justify-content:space-between;align-items:center}.clones-head b{color:#e2dd48;font-size:13px}' +
'.clones-clues{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#ccc;overflow-y:auto;flex:1;min-height:0}' +
'.clones-clue-item{display:flex;gap:4px;padding:2px 0;cursor:pointer}.clones-clue-item.clones-hint-clue{opacity:1 !important}' +
'.clones-clue-trait{color:#87ceeb}' +
'.clones-clue-item.clones-hint-clue .clones-clue-text{background:#FFE60024;border-bottom:4px solid #FFE600;padding:2px 3px;box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
'.clones-clue-num{font-weight:bold;min-width:14px;flex-shrink:0;text-align:right}';


ClonesM.launch = function() {
    var M = this;
    M.name = M.parent.minigameName; M.launched = true; M.effs = null;
    registerCloneBuffTypes();
    // decode all the sounds we use up front so plays never queue on the cache
    ['snd/tick.mp3', 'snd/smallTick.mp3', 'snd/toneTick.mp3', 'snd/chime.mp3',
     'snd/cymbalRev.mp3', 'snd/pop1.mp3', 'snd/pop2.mp3', 'snd/pop3.mp3'].forEach(loadSnd);

    var st = l('clonesCSS');
    if (!st) {
        st = document.createElement('style');
        st.id = 'clonesCSS';
        document.head.appendChild(st);
    }
    st.textContent = CSS;

    ClonesM.init = function(div) {
        div.innerHTML =
            '<div class="clones-wrap">' +
            '<div class="clones-top" id="clonesTop" style="display:none;">' +
            '<a class="option" id="clonesSolve" style="display:none;font-size:11px;padding:2px 8px;">Solve</a><span id="clonesStatus"></span></div>' +
            '<div class="clones-main" id="clonesMain">' +
            '<div style="position:relative;align-self:flex-start;"><div class="clones-grid framed" id="clonesGrid"></div>' +
            '<div class="clones-start" id="clonesStart"><div class="clones-tier-label">Difficulty</div><div class="clones-tier-row" id="clonesTierRow"></div>' +
            '<a class="option" id="clonesNew" style="font-size:11px;padding:2px 8px;">New Scenario</a>' +
            '<a class="option" id="clonesTut" style="font-size:11px;padding:2px 8px;">Tutorial</a>' +
            '<div class="clones-cd-wrap"><div ' + Game.getDynamicTooltip('ClonesM.refillTooltip', 'this') + ' id="clonesLumpRefill" class="usesIcon shadowFilter lumpRefill" style="background-position:' + (-29 * 48) + 'px ' + (-14 * 48) + 'px;"></div><div id="clonesCooldown"></div></div></div><div id="clonesCompleted"></div></div>' +
            '<div class="clones-side framed" id="clonesSide"><div class="clones-head" id="clonesHead" style="display:none;"><b>Intel Report</b><a class="option" id="clonesHint" style="font-size:11px;padding:2px 8px;" ' + Game.getDynamicTooltip('ClonesM.hintTooltip', 'this') + '>Supervisor!</a></div>' +
            '<div class="clones-clues" id="clonesClues"></div>' +
            '<div id="clonesClaim" style="display:none;text-align:center;padding-top:4px;"><a class="option smallFancyButton" id="clonesClaimBtn" style="width:auto;margin:4px;padding:4px 14px;animation:rainbowCycle 5s infinite ease-in-out,pucker 0.2s ease-out;box-shadow:0px 0px 1px 2px currentcolor;background:linear-gradient(to bottom,transparent 0%,currentColor 500%);">Claim Reward</a></div>' +
            '<div id="prizeSlots" class="slots" hidden><div class="prize-title"></div><div class="reels"></div><div class="prize"></div></div>' +
            '<div id="clonesRedeemedLabel" style="display:none;"></div>' +
            '<div id="clonesRedeem" style="display:none;min-height:34px;text-align:center;padding-top:4px;"><a class="option" id="clonesRedeemBtn" style="margin:4px;padding:4px 14px;">Redeem Reward</a><a class="option" id="clonesRerollBtn" style="display:none;margin:4px;padding:4px 14px;">Reroll</a></div>' +
            '<div id="clonesQuitTut" style="display:none;"><a class="option" style="font-size:11px;padding:2px 8px;">Quit Training</a></div>' +
            '<div id="clonesGlossary" style="display:none;"><a class="option" style="font-size:11px;padding:2px 8px;">Glossary</a></div></div>' +
            '</div><div id="clonesPuzzleId"></div></div>';
        var tierRow = l('clonesTierRow');
        if (tierRow) TIER_KEYS.forEach(function(k, idx) {
            var d = document.createElement('div');
            d.className = 'clones-tier-icon';
            d.style.backgroundImage = 'url(' + window.getSpriteSheet('main') + ')';
            d.style.backgroundPosition = (-TIER_ICONS[idx][0] * 48) + 'px ' + (-TIER_ICONS[idx][1] * 48) + 'px';
            AddEvent(d, 'click', function() {
                playSnd('snd/tick.mp3');
                if (!ClonesM.debug && !tierUnlocked(k)) {
                    Game.Notify('Clearance denied', 'This case exceeds your clearance level. Process more cases at your highest unlocked difficulty to petition a promotion.', TIER_ICONS[idx], 6);
                    return;
                }
                G.tier = k; syncTierIcons();
            });
            tierRow.appendChild(d);
        });
        syncTierIcons();
        syncTutButton();
        syncCompleted();
        [['clonesNew', 'newPuzzle'], ['clonesTut', 'tutorial'], ['clonesSolve', 'debugSolve'],
         ['clonesHint', 'hint'], ['clonesClaimBtn', 'claimReward'], ['clonesQuitTut', 'quitTutorial'],
         ['clonesGlossary', 'glossary'],
         ['clonesRedeemBtn', 'redeemReward'], ['clonesRerollBtn', 'rerollReward']].forEach(function(w) {
            AddEvent(l(w[0]), 'click', function() { playSnd('snd/tick.mp3'); ClonesM[w[1]](); });
        });
        var refill = l('clonesLumpRefill');
        if (refill) AddEvent(refill, 'click', function() {
            playSnd('snd/tick.mp3');
            if (G.nextPuzzleAt <= Date.now() || typeof Game.refillLump !== 'function') return;
            Game.refillLump(1, function() {
                G.nextPuzzleAt = 0;
                updateCooldown();
                playSnd('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
            });
        });
        updateCooldown();
        if (G.puzzle) {
            renderBoard(); 
            return;
        }
        setStatus('Loading sprites…');
        spritesReady(function() {
            G.ready = true;
            setTimeout(ensurePuzzle, 0); // load() applies save data between init and now
        });
    };

    ClonesM.buildSaveData = function() {
        var tags = {}; // corners that aren't blank, first letter
        for (var k in G.cornerTags) {
            var o = {};
            for (var c in G.cornerTags[k]) { var v = G.cornerTags[k][c]; if (v && v !== 'none') o[c] = v[0]; }
            if (o.tr || o.br || o.bl) tags[k] = o;
        }
        var tp = { u: G.tierProg.u || 'E' };
        if (G.tierProg.p) tp.p = G.tierProg.p;
        var out = {
            v: CLONES_VERSION,
            // yous regenerate deterministically
            file: G.puzzleFile, ys: G.yousSeed == null ? undefined : G.yousSeed,
            solved: Object.keys(G.solved).map(Number),
            earned: G.earned,
            hintedCells: G.hintedCells, mistakeCells: G.mistakeCells,
            cornerTags: tags, dimmed: Object.keys(G.dimmed).map(Number),
            won: G.won, claimed: G.claimed, earlyCells: G.earlyCells,
            tFirst: G.tFirst, tDone: G.tDone, nextPuzzleAt: G.nextPuzzleAt,
            failed: G.failed, reward: G.reward, redeemed: G.redeemed, redeemedRw: G.redeemedRw, restored: G.restored,
            tierProg: tp, cleanWins: G.cleanWins,
            tutorialDone: G.tutorialDone, tutBonus: G.tutBonus,
            rot: rotSave(), // completion bitsets survive ascension
            b: cloneBuffSave(), // vanilla skips non-vanilla buff types
            aw: clonesAchievementNames.filter(function(n) {
                var a = Game.Achievements && Game.Achievements[n];
                return a && a.won;
            }),
            isVisible: (ClonesM.parent && ClonesM.parent.onMinigame) ? 1 : 0
        };
        // a restore that hasn't landed yet still owns its run
        if (G.restore) RUN_FIELDS.forEach(function(k) { out[k] = G.restore[k]; });
        return out;
    };

    ClonesM.save = function() {
        var json = '';
        try { json = JSON.stringify(ClonesM.buildSaveData()); } catch (e) { return ''; }
        if (window.ClonesMinigame && typeof window.ClonesMinigame.writeCache === 'function') {
            window.ClonesMinigame.writeCache(json);
        }
        return encodeURIComponent(json);
    };

    ClonesM.load = function(str) {
        var data = null;
        // cache holds raw JSON (writeCache stores it unencoded); decode only if parse fails
        if (str) {
            try { data = JSON.parse(str); } catch (e) {
                try { data = JSON.parse(decodeURIComponent(str)); } catch (e2) { data = null; }
            }
        }
        ClonesM.reset(true); // wipe the live session; missing or malformed data leaves it fresh
        if (!data || typeof data !== 'object' || Array.isArray(data)) return;
        var file = (typeof data.file === 'string' && data.file) ? data.file : null;
        G.puzzleFile = file;
        G.won = saveNum(data.won);
        G.nextPuzzleAt = Math.min(saveNum(data.nextPuzzleAt), Date.now() + puzzleCooldown());
        var tp = data.tierProg;
        // an unrecognized unlocked tier would lock every tier out
        if (tp && typeof tp === 'object' && TIER_KEYS.indexOf(tp.u) >= 0) {
            G.tierProg = { u: tp.u, p: null };
            if (tp.p && typeof tp.p === 'object') {
                G.tierProg.p = { c: tp.p.c ? 1 : 0, g: Math.min(3, saveNum(tp.p.g)), o: Math.min(5, saveNum(tp.p.o)) };
            }
        }

        var ft = file && file[0]; // tutorial isnt a tier
        G.tier = TIER_KEYS.indexOf(ft) >= 0 ? ft : G.tierProg.u;
        G.cleanWins = saveNum(data.cleanWins);
        G.tutorialDone = data.tutorialDone ? 1 : 0;
        rotLoad(data.rot);
        restoreCloneBuffs(data.b);
        G.restore = file ? data : null; // RUN_FIELDS apply once the puzzle file arrives
        // wins restore immediately if the achievements already exist; otherwise
        // createClonesAchievements picks this stash up when it runs
        if (Array.isArray(data.aw)) {
            ClonesM._pendingAchWon = data.aw;
            data.aw.forEach(function(n) {
                var a = Game.Achievements && Game.Achievements[n];
                if (a && !a.won && !(Game.JNE && Game.JNE.isAccomplishmintSuppressed && Game.JNE.isAccomplishmintSuppressed(n))) {
                    a.won = 1; a._restoredFromSave = true;
                }
            });
        }
        syncAllUI();
        if (ClonesM.parent && data.isVisible) reopenMinigame(ClonesM.parent, 50);
        if (G.ready && G.restore) startPuzzle(G.restore.file, G.restore); // save applied while live
    };

    ClonesM.reset = function(hard) {
        if (!hard) return ClonesM.onAscend();
        G.popGen++; G.reqId++; // abort pending populate/wipe/spin work and in-flight fetches
        G.loading = false;
        G.puzzle = null; G.puzzleFile = null; G.yous = null; G.starterSentence = null;
        G.won = 0; G.restore = null; G.nextPuzzleAt = 0;
        G.cleanWins = 0; G.tutorialDone = 0;
        G.tierProg = { u: 'E', p: null }; G.tier = 'E';
        G.rot = { last: {} };
        ClonesM._pendingAchWon = null;
        clearRun();
        clearBoardUI();
        syncAllUI(); setStatus('');
    };

    // ascension
    ClonesM.onAscend = function() {
        G.popGen++; G.reqId++; // invalidate pending populate timers and in-flight fetches
        G.loading = false;
        G.puzzle = null; G.puzzleFile = null; G.yous = null;
        G.restore = null; G.starterSentence = null;
        clearRun();
        G.nextPuzzleAt = 0; // fresh run reset cooldown
        G.tier = G.tierProg.u || 'E'; // snap to highest tier
        clearBoardUI();
        syncAllUI();
    };

    var cdTick = 0;
    ClonesM.logic = function() {
        var now = Date.now();
        if (now - cdTick >= 500) { cdTick = now; checkLayout(); ClonesM._updateEffs(); updateCooldown(); }
    };
    ClonesM.draw = function() {};
    ClonesM.onResize = function() { checkLayout(); };
    ClonesM.close = function() {
        if (!ClonesM.parent) return;
        ClonesM.parent.onMinigame = 0;
        var row = l('row' + ClonesM.parent.id);
        if (row) row.classList.remove('onMinigame');
    };
};

function reopenMinigame(building, delay) {
    setTimeout(function() {
        var b = getYou() || building;
        if (!b) return;
        if (typeof b.switchMinigame === 'function') b.switchMinigame(true);
        else {
            b.onMinigame = 1;
            var row = l('row' + b.id);
            if (row) row.classList.add('onMinigame');
        }
        if (b.refresh) b.refresh();
    }, delay || 50);
}

function createClonesAchievements() {
    if (!Game.JNE || !Game.JNE.createAchievement || Game.JNE.enableClonesMinigame === false) return;
    var suppressed = function(n) { return Game.JNE.isAccomplishmintSuppressed && Game.JNE.isAccomplishmintSuppressed(n); };
    var wantShadow = !!Game.JNE.shadowAchievementMode;
    var poolFor = function(ach) {
        if (ach._order0 != null) ach.order = ach._order0 + (wantShadow ? 50000 : 0);
        ach.pool = wantShadow ? 'shadow' : 'normal';
    };
    // re-enable hidden [DISABLED] entries come back carrying their won flag
    var needsCreation = clonesAchievementNames.some(function(n) {
        return !Game.Achievements[n] && !Game.Achievements[n + ' [DISABLED]'];
    });
    if (!needsCreation) {
        clonesAchievementNames.forEach(function(n) {
            var hidden = Game.Achievements[n + ' [DISABLED]'];
            if (hidden) {
                poolFor(hidden);
                if (hidden._savedWonStatus && !suppressed(n)) hidden.won = 1;
                swapClonesAchievement(n, false);
            } else if (Game.Achievements[n]) poolFor(Game.Achievements[n]);
        });
        return;
    }
    var baseOrder = 61648;
    [
        { name: 'The Quick and the Duplicate',
          desc: 'Solve a Clone Escape puzzle in less than 2 minutes with no mistakes.<q>Fast, flawless, and frighteningly efficient. Your performance review has been upgraded from \'expendable\' to \'probably expendable.\'</q>',
          icon: Game.JNE.icon(35, 13, 'main'), order: baseOrder + 0.1 },
        { name: 'An Allegedly Perfect Record',
          desc: 'Solve 10 puzzles with no mistakes.<q>Our records indicate a 100% success rate. Our records also indicate that our records have never been wrong. Please do not investigate our records.</q>',
          icon: Game.JNE.icon(32, 33, 'main'), order: baseOrder + 0.2 },
        { name: 'Doppelganger gang',
          desc: 'Solve 123 puzzles.<q>Congratulations! You\'ve processed enough suspicious individuals to qualify as an organized crime syndicate in seventeen jurisdictions. Fortunately, Clone Recovery & Sorting® operates in eighteen.</q>',
          icon: Game.JNE.icon(35, 33, 'main'), order: baseOrder + 0.3 },
        { name: 'The Devil You Clone',
          desc: 'Unlock the highest difficulty puzzles.<q>By proceeding, you acknowledge that difficulty selection is entirely voluntary, that all resulting psychological distress is considered a workplace perk, and that your soul remains the intellectual property of Clone Recovery & Sorting®.</q>',
          icon: Game.JNE.icon(35, 29, 'main'), order: baseOrder + 0.4 },
        { name: 'The Devil Is in the Duplicates',
          desc: 'Solve a highest difficulty puzzle with no mistakes or hints.<q>The greatest trick the devil ever pulled was convincing the world he was actually an authentic.</q>',
          icon: Game.JNE.icon(23, 7, 'main'), order: baseOrder + 0.5 }
    ].forEach(function(a) {
        var ach = Game.JNE.createAchievement(a.name, a.desc, a.icon, a.order, null);
        if (ach) { ach._order0 = a.order; poolFor(ach); }
    });
    // load() may have run before the achievements existed, apply stashed wins
    if (Array.isArray(ClonesM._pendingAchWon)) {
        ClonesM._pendingAchWon.forEach(function(n) {
            var ach = Game.Achievements[n];
            if (ach && !ach.won && !suppressed(n)) { ach.won = 1; ach._restoredFromSave = true; }
        });
        ClonesM._pendingAchWon = null;
    }
}
// move an achievement to/from its [DISABLED] alias, preserving its won state
function swapClonesAchievement(name, hide) {
    var key = name + ' [DISABLED]';
    var ach = Game.Achievements[hide ? (Game.Achievements[name] || key) : key];
    if (!ach) return;
    if (hide) { if (ach.won) ach._savedWonStatus = true; ach.pool = 'shadow'; ach.won = 0; ach._originalName = name; }
    else delete ach._originalName;
    Game.Achievements[hide ? key : name] = ach;
    delete Game.Achievements[hide ? name : key];
    if (ach.id !== undefined && Game.AchievementsById[ach.id]) Game.AchievementsById[ach.id] = ach;
}
function removeClonesAchievements() {
    if (!Game || !Game.Achievements) return;
    clonesAchievementNames.forEach(function(name) { swapClonesAchievement(name, true); });
}

function initializeClonesMinigame() {
    var you = getYou();
    if (!you) return;
    if (ClonesM.parent !== you) {
        ClonesM.parent = you;
        you.minigame = ClonesM;
    }
    var flagDefined = !!(Game.JNE && Game.JNE.enableClonesMinigame !== undefined);
    var isExternalLoading = !flagDefined || (Game.JNE && Game.JNE.enableClonesMinigame === false);
    var isEnabled = flagDefined ? !!Game.JNE.enableClonesMinigame : true;

    function ensureMinigameDiv() {
        if (you.minigameDiv) return;
        var existingDiv = l('rowSpecial' + you.id);
        if (existingDiv) { you.minigameDiv = existingDiv; return; }
        you.minigameDiv = document.createElement('div');
        you.minigameDiv.id = 'rowSpecial' + you.id;
        you.minigameDiv.className = 'rowSpecial';
        if (you.l) you.l.appendChild(you.minigameDiv);
    }

    function bootMinigame() {
        if (!you.minigameLoaded) {
            you.minigameLoaded = true;
            you.minigameName = you.minigameName || 'Clone Escape';
            you.minigameLoading = false;
        }
        ensureMinigameDiv();
        ClonesM.launch();
        ClonesM.init(you.minigameDiv);
        if (!you.minigame) you.minigame = ClonesM;
        if (Game.JNE && Game.JNE.clonesSavedData) ClonesM.load(Game.JNE.clonesSavedData);
        createClonesAchievements();
        if (isExternalLoading && !you.minigameUrl) you.minigameUrl = 'clones';
        if (you.refresh) you.refresh();
        var ob = isExternalLoading && Game.ObjectsById && Game.ObjectsById[you.id];
        if (ob && typeof ob.draw === 'function') ob.draw();
    }

    if (isEnabled || isExternalLoading) {
        try {
            if (!you.minigameLoaded || !you.minigame || !you.minigame.init || !ClonesM.launched) bootMinigame();
        } catch (e) {
            you.minigameLoading = false;
            throw e;
        }
        you.minigameLoading = false;
    } else {
        you.minigameLoading = false;
        removeClonesAchievements(); // ClonesM.removeAchievements aliases this
    }
}

initializeClonesMinigame();
if (!getYou() || !getYou().minigame) {
    setTimeout(function() { initializeClonesMinigame(); }, 1000);
}

window.initializeClonesMinigame = initializeClonesMinigame;
window.removeClonesAchievements = removeClonesAchievements;
window.createClonesAchievements = createClonesAchievements;

var existingAPI = window.ClonesMinigame || {};
window.ClonesMinigame = ClonesM;
window.ClonesMinigame.VERSION = CLONES_VERSION;
window.ClonesMinigame.createAchievements = createClonesAchievements;
window.ClonesMinigame.removeAchievements = removeClonesAchievements;

['getSaveData', 'applySaveData', 'writeCache', 'requestSave'].forEach(function(k) {
    if (typeof existingAPI[k] === 'function') window.ClonesMinigame[k] = existingAPI[k];
});

window.ClonesMinigame.forceOpen = function() {
    var b = getYou();
    if (!b) return 'You building not found';
    if (b.switchMinigame) b.switchMinigame(true); else b.onMinigame = 1;
    if (b.refresh) b.refresh();
    return 'Force open complete';
};
})();
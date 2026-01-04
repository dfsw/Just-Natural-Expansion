// Just Natural Expansion - Cookie Clicker Mod

(function() 
{
    'use strict';
    
    var modName = 'Just Natural Expansion';
    var modVersion = '0.3.3';
    var debugMode = false; 
    var runtimeSessionId = Math.floor(Math.random()*1e9) + '-' + Date.now();
    
    function debugLog() {
        if (!debugMode) return;
        try {
            var msg = Array.prototype.slice.call(arguments).join(' ');
            console.log('[JNE Debug]', msg);
        } catch (e) {}
    }

    function resetUnlockStateCache() {
        modUnlockStateCache = Object.create(null);
    }

    function applyUnlockState(upgradeName, shouldUnlock, changeList, reason) {
        var upgrade = Game.Upgrades ? Game.Upgrades[upgradeName] : null;
        if (!upgrade) {
            return false;
        }

        var targetState = shouldUnlock ? 1 : 0;
        var previousState = upgrade.unlocked ? 1 : 0;
        var hasCachedState = Object.prototype.hasOwnProperty.call(modUnlockStateCache, upgradeName);
        var cachedState = hasCachedState ? modUnlockStateCache[upgradeName] : null;

        // Only update if actually different
        if (targetState !== previousState) {
            upgrade.unlocked = targetState;
        }

        // Only report as changed if there's an actual state change from the cached value
        // OR if we haven't cached it yet and it's different from previous
        var changed = (!hasCachedState && targetState !== previousState) || 
                      (hasCachedState && targetState !== cachedState);

        modUnlockStateCache[upgradeName] = targetState;

        if (changed && Array.isArray(changeList)) {
            changeList.push({
                name: upgradeName,
                previous: hasCachedState ? cachedState : previousState,
                next: targetState,
                reason: reason
            });
        }

        return changed;
    }
    
    // Essential error logging only
    function errorLog() {
        try {
            var msg = Array.prototype.slice.call(arguments).join(' ');
            console.error('[JNE Error]', msg);
        } catch (e) {}
    }
    var resetMode = false; // Set to true to reset all mod data to fresh state (achievements unwon, upgrades unpurchased)
    
    // Modular lifetime variable capture system
    var sessionBaselines = {
        cookieClicks: 0,
        reindeerClicked: 0,
        wrinklersPopped: 0,
        pledges: 0,
        stockMarketAssets: 0,
        gardenSacrifices: 0
    };
    
    var sessionDeltas = {
        cookieClicks: 0,
        reindeerClicked: 0,
        wrinklersPopped: 0,
        pledges: 0,
        stockMarketAssets: 0,
        gardenSacrifices: 0
    };
    
    // Granular control toggles - defaults will be overridden by save data if available
    var shadowAchievementMode = true;
    var enableCookieUpgrades = false;  // Default to disabled for first-run experience
    var enableBuildingUpgrades = false;  // Default to disabled for first-run experience
    var enableKittenUpgrades = false;  // Default to disabled for first-run experience
    var enableJSMiniGame = false;  // Default to disabled for first-run experience
    var enableCookieAge = false;  // Default to disabled for first-run experience
    var cookieAgeProgress = 0;  // Track puzzle quest progress (0-50)
    var cookieAgeScriptLoaded = false;  // Track if cookieAge.js script has been loaded from CDN
    var enableHeavenlyUpgrades = false;  // Default to disabled for first-run experience
    var heavenlyUpgradesScriptLoaded = false;  // Track if heavenlyUpgrades.js script has been loaded
    
    var modIcon = [15, 7]; // Static mod icon from main sprite sheet
    var boxIcon = [34, 4]; // Static Box of improved cookies icon from main sprite sheet


    var terminalMinigameScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/minigameTerminal.js';
    var cookieAgeScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Cookies@latest/cookieAge.js';
    var heavenlyUpgradesScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/heavenlyUpgrades.js';
    var spriteSheets = {
        custom: 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/updatedSpriteSheet.png',
        gardenPlants: 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png'
    };

var pendingTerminalMinigameSave = '';
var terminalMinigameLoadedOnce = false;
var terminalMinigameOpen = false;
var terminalMinigameSyncPending = false; // Prevent multiple concurrent syncs
var modInitialized = false; // Track if mod has finished initializing
var achievementsCreated = false; // Track if achievements have been created to prevent recreation
var modSaveData = null; // Store save data for initialization
var modLoadInvoked = false; // Track whether load() has run this session
var pendingAchievementAwards = []; // Queue for achievements to award once initialization completes
var modUnlockStateCache = Object.create(null);
var toggleLock = false; // Prevent rapid toggle operations
var pendingSaveTimer = null; // Throttle saves
var saveCooldownMs = 3000; // Minimum delay between saves

function updateUnlockStatesForUpgrades(upgradeNames, enable) {
    if (!upgradeNames || !upgradeNames.length || !Game || !Game.Upgrades) {
        return;
    }
    var unlockChanged = false;
    for (var i = 0; i < upgradeNames.length; i++) {
        var upgradeName = upgradeNames[i];
        var upgrade = Game.Upgrades[upgradeName];
        if (!upgrade) {
            continue;
        }
        var shouldUnlock = enable;
        if (enable && typeof upgrade.unlockCondition === 'function') {
            try {
                shouldUnlock = !!upgrade.unlockCondition();
            } catch (unlockErr) {
                shouldUnlock = false;
            }
        }
        var targetState = shouldUnlock ? 1 : 0;
        if (upgrade.unlocked !== targetState) {
            upgrade.unlocked = targetState;
            unlockChanged = true;
        }
        if (!shouldUnlock && upgrade.isInStore) {
            upgrade.isInStore = 0;
        }
    }
    if (unlockChanged) {
        Game.storeToRefresh = 1;
        Game.upgradesToRebuild = 1;
    }
}

    // Event System for Mod Integration
    function ensureEventSystem() {
        if (typeof Game === 'undefined') return false;
        
        // Create event system if it doesn't exist
        if (!Game.emit) {
            Game.emit = function(event, data) {
                if (this._listeners && this._listeners[event]) {
                    for (var i = 0; i < this._listeners[event].length; i++) {
                        try {
                            this._listeners[event][i](data);
                        } catch (e) {
                            console.warn('Just Natural Expansion: Event handler error:', e);
                        }
                    }
                }
            };
        }
        
        if (!Game.on) {
            Game.on = function(event, callback) {
                if (!this._listeners) this._listeners = {};
                if (!this._listeners[event]) this._listeners[event] = [];
                this._listeners[event].push(callback);
            };
        }
        
        return true;
    }
    
    // Achievement alias mapping for renamed achievements, everyone should be modernized on updated names by now lets keep this around for next time though
    var achievementAliases = {
      //  "Black cat's other paw": "Find a penny, pick it up",
    };

    // Centralized save scheduler to avoid spamming saves
    function requestModSave(immediate) {
        try {
            if (immediate) {
                if (pendingSaveTimer) {
                    clearTimeout(pendingSaveTimer);
                    pendingSaveTimer = null;
                }
                if (Game.WriteSave) {
                    Game.WriteSave();
                }
                return;
            }
            if (pendingSaveTimer) return;
            pendingSaveTimer = setTimeout(function() {
                pendingSaveTimer = null;
                if (Game.WriteSave) {
                    Game.WriteSave();
                }
            }, saveCooldownMs);
        } catch (e) {
            console.warn('[Save] requestModSave failed:', e);
        }
    }
    
    // Complete reset system for new save loads
    function resetAllModDataForNewSave() {
        debugLog('resetAllModDataForNewSave: start');
        setTerminalMinigameSave('');
        // Reset lifetime tracking variables
        lifetimeData = {
            reindeerClicked: 0,
            stockMarketAssets: 0,
            shinyWrinklersPopped: 0,
            wrathCookiesClicked: 0,
            totalCookieClicks: 0,
            wrinklersPopped: 0,
            elderCovenantToggles: 0,
            pledges: 0,
            cookieFishCaught: 0,
            bingoJackpotWins: 0,
            gardenSacrifices: 0,
            lastGardenSacrificeTime: 0,
            totalSpellsCast: 0,
            godUsageTime: {}
        };
        
        // Reset session tracking variables
        sessionBaselines = {
            cookieClicks: 0,
            reindeerClicked: 0,
            wrinklersPopped: 0,
            pledges: 0,
            stockMarketAssets: 0,
            gardenSacrifices: 0
        };
        
        sessionDeltas = {
            cookieClicks: 0,
            reindeerClicked: 0,
            wrinklersPopped: 0,
            pledges: 0,
            stockMarketAssets: 0,
            gardenSacrifices: 0
        };
        
        // Reset per-ascension tracking variables
        modTracking = {
            shinyWrinklersPopped: 0,
            previousWrinklerStates: {},
            templeSwapsTotal: 0,
            soilChangesTotal: 0,
            pledges: 0,
            reindeerClicked: 0,
            lastSeasonalReindeerCheck: 0,
            cookieClicks: 0,
            previousTempleSwaps: 0,
            previousSoilType: null,
            spellCastTimes: [],
            bankSextupledByWrinkler: false,
            godUsageTime: {},
            currentSlottedGods: {},
            lastGodCheckTime: Date.now()
        };
        
        // Reset other state variables
        currentRunData = {
            maxCombinedTotal: 0
        };
        
        hasCapturedThisAscension = false;
        lastAscensionCount = Game.resets || 0;

        // Also clear purchased state for all mod upgrades so a new save doesn't inherit prior buys
        try {
            var modUpgradeNames = getModUpgradeNames ? getModUpgradeNames() : [];
            modUpgradeNames.forEach(function(name){
                if (Game && Game.Upgrades && Game.Upgrades[name]) {
                    var prev = Game.Upgrades[name].bought || 0;
                    Game.Upgrades[name].bought = 0;
                }
            });

        } catch (e) {
            // ignore
        }
        
        // Clear all mod achievements so they can be recreated with correct won states
        try {
            var clearedCount = 0;
            
            // Find and remove all mod achievements by checking for our mod source text
            if (Game.Achievements) {
                var achievementsToRemove = [];
                
                // First, collect achievements to remove (can't modify while iterating)
                for (var achievementName in Game.Achievements) {
                    var achievement = Game.Achievements[achievementName];
                    if (achievement && achievement.ddesc && achievement.ddesc.includes(modName)) {
                        if (achievement._restoredFromSave) {
                            try {
                                // Reset to simple property
                                delete achievement.won;
                                achievement.won = achievement.won || 0;
                            } catch (e) {
                                // ignore
                            }
                        }
                        achievementsToRemove.push(achievementName);
                    }
                }
                
                // Now remove them
                achievementsToRemove.forEach(achievementName => {
                    delete Game.Achievements[achievementName];
                    
                    // Remove from Game.AchievementsById if it exists  
                    if (Game.AchievementsById && Game.AchievementsById[achievementName]) {
                        delete Game.AchievementsById[achievementName];
                    }
                    clearedCount++;
                });
            }
            
            // Reset modAchievementNames array for the new session
            modAchievementNames = [];
            
            // Reset the achievements created flag so they can be recreated with proper states
            achievementsCreated = false;
        } catch (e) {
            errorLog('resetAllModDataForNewSave: error clearing achievements:', e);
        }
    }
    
    // Reset all mod data on every load - let save file restore what should persist
    
    // Lifetime tracking variables (persist across ascensions)
    var lifetimeData = {
        reindeerClicked: 0,
        stockMarketAssets: 0,
        shinyWrinklersPopped: 0,
        wrathCookiesClicked: 0,
        totalCookieClicks: 0,
        wrinklersPopped: 0,
        elderCovenantToggles: 0,
        pledges: 0,
        cookieDishCaught: 0,
        gardenSacrifices: 0,
        lastGardenSacrificeTime: 0,
        godUsageTime: {} // Track cumulative time each god is slotted across all ascensions
    };
    
    // Per-ascension tracking variables (reset on ascension)
    var modTracking = {
        shinyWrinklersPopped: 0,
        previousWrinklerStates: {},
        templeSwapsTotal: 0,
        soilChangesTotal: 0,
        pledges: 0,
        reindeerClicked: 0,
        lastSeasonalReindeerCheck: 0,
        cookieClicks: 0,
        previousTempleSwaps: 0,
        previousSoilType: null,
        spellCastTimes: [], // Track spell cast timestamps for Spell Slinger achievement
        bankSextupledByWrinkler: false, // Track if bank was sextupled by a wrinkler pop
        godUsageTime: {}, // Track cumulative time each god is slotted (milliseconds)
        currentSlottedGods: {}, // Track currently slotted gods with their slot start timestamps
        fthofCookieOutcomes: [] // Track all FtHoF cookie outcomes for achievements
    };
    
    // Mod settings for menu system
    var modSettings = {
        shadowAchievements: true, // Should match shadowAchievementMode default
        enableCookieUpgrades: false,
        enableBuildingUpgrades: false,
        enableKittenUpgrades: true,
        enableJSMiniGame: false,
        enableCookieAge: false,
        cookieAgeProgress: 0, // Track puzzle quest progress (0-50)
        enableHeavenlyUpgrades: false,
        hasUsedModOutsideShadowMode: false,
        hasMadeInitialChoice: false, // Track if user has made their initial leaderboard/non-leaderboard choice
        permanentSlotBackup: {},
        cpsDisplayUnit: 'seconds' // 'seconds', 'minutes', 'hours', or 'days'
    };
    
    // Expose modSettings globally for access from other mod files
    window.modSettings = modSettings;
    
    // Current run tracking variables (reset on ascension)
    var currentRunData = {
        maxCombinedTotal: 0
    };
        
    // Track if we've already captured values for this ascension
    var hasCapturedThisAscension = false;
    var lastAscensionCount = 0;
    
    // Modular lifetime capture system
    function initializeSessionBaselines() {
        sessionBaselines.cookieClicks = Game.cookieClicks || 0;
        sessionBaselines.reindeerClicked = Game.reindeerClicked || 0;
        sessionBaselines.wrinklersPopped = Game.wrinklersPopped || 0;
        sessionBaselines.pledges = Game.pledges || 0;
        sessionBaselines.stockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        sessionBaselines.gardenSacrifices = (Game.Objects['Farm'] && Game.Objects['Farm'].minigame ? Game.Objects['Farm'].minigame.convertTimes || 0 : 0);
        
        // Reset deltas
        Object.keys(sessionDeltas).forEach(key => sessionDeltas[key] = 0);
    }
    
    function updateSessionDeltas() {
        // Update deltas by comparing current values to baselines + already recorded deltas
        var currentCookieClicks = Game.cookieClicks || 0;
        var currentReindeerClicked = Game.reindeerClicked || 0;
        var currentPledges = Game.pledges || 0;
        var currentStockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        var currentGardenSacrifices = (Game.Objects['Farm'] && Game.Objects['Farm'].minigame ? Game.Objects['Farm'].minigame.convertTimes || 0 : 0);
        
        sessionDeltas.cookieClicks = Math.max(0, currentCookieClicks - sessionBaselines.cookieClicks);
        sessionDeltas.reindeerClicked = Math.max(0, currentReindeerClicked - sessionBaselines.reindeerClicked);
        sessionDeltas.pledges = Math.max(0, currentPledges - sessionBaselines.pledges);
        sessionDeltas.stockMarketAssets = Math.max(0, currentStockMarketAssets - sessionBaselines.stockMarketAssets);
        sessionDeltas.gardenSacrifices = Math.max(0, currentGardenSacrifices - sessionBaselines.gardenSacrifices);
        // Note: wrinklers are tracked via phase detection, not here
    }
    
    function captureLifetimeData() {
        if (hasCapturedThisAscension) {
            return;
        }
        
        updateSessionDeltas();
        
        var totalCookieClicks = sessionBaselines.cookieClicks + sessionDeltas.cookieClicks;
        var totalReindeerClicked = sessionBaselines.reindeerClicked + sessionDeltas.reindeerClicked;
        var totalWrinklersPopped = sessionBaselines.wrinklersPopped + sessionDeltas.wrinklersPopped;
        var totalPledges = sessionBaselines.pledges + sessionDeltas.pledges;
        var totalStockMarketAssets = sessionBaselines.stockMarketAssets + sessionDeltas.stockMarketAssets;
        // Garden sacrifices are tracked via convert hook; skip here to avoid double-counting.
        
        // Capture cookie fish from current session (tracked in Game.JNE)
        var currentCookieFish = (Game.JNE && Game.JNE.cookieFishCaught) ? Game.JNE.cookieFishCaught : 0;
        lifetimeData.cookieFishCaught = (lifetimeData.cookieFishCaught || 0) + currentCookieFish;
        // Reset session counter after capturing
        if (Game.JNE) Game.JNE.cookieFishCaught = 0;
        
        // Capture bingo jackpot wins from current session (tracked in Game.JNE)
        var currentBingoJackpots = (Game.JNE && Game.JNE.bingoJackpotWins) ? Game.JNE.bingoJackpotWins : 0;
        lifetimeData.bingoJackpotWins = (lifetimeData.bingoJackpotWins || 0) + currentBingoJackpots;
        // Reset session counter after capturing
        if (Game.JNE) Game.JNE.bingoJackpotWins = 0;
         
        // Add to lifetime data
        lifetimeData.totalCookieClicks += totalCookieClicks;
        lifetimeData.reindeerClicked += totalReindeerClicked;
        lifetimeData.wrinklersPopped += totalWrinklersPopped;
        lifetimeData.pledges += totalPledges;
        lifetimeData.stockMarketAssets += totalStockMarketAssets;
        
        // Mark as captured but don't reset session baselines yet
        // Session baselines will be reset by handleCheck() when the game is ready
        hasCapturedThisAscension = true;
    }
    
    // Handle check hook - monitor for ascension and capture values
    function handleCheck() {
        // Capture lifetime data when ascension starts and game is ready
        if (Game.OnAscend > 0 && !hasCapturedThisAscension) {
            // Only capture if stock market is available (to ensure data is captured correctly)
            var stockMarketReady = Game.Objects['Bank'] && Game.Objects['Bank'].minigame;
            if (stockMarketReady) {
                captureLifetimeData();
                // Reset session baselines after capturing to prepare for new session
                initializeSessionBaselines();
            }
        }
        
        // Reset capture flag when we detect a new ascension cycle
        if (Game.resets !== lastAscensionCount) {
            hasCapturedThisAscension = false;
            lastAscensionCount = Game.resets || 0;
            // Don't reset baselines here - wait until we capture the data
        }
    }
    
    // Handle reincarnate (ascension) - reset run-specific data
    function handleReincarnate() {
        
        // Reset garden sacrifice timer on ascension to prevent save scumming
        lifetimeData.lastGardenSacrificeTime = 0;
        
        // Don't capture lifetime data here - let handleCheck() do it when the game is ready, This prevents issues with minigame data not being available yet
        
        // Reset the current run's max combined total
        currentRunData.maxCombinedTotal = 0;
        
        // Reset "this ascension" tracking variables
        
        modTracking.templeSwapsTotal = 0;
        modTracking.soilChangesTotal = 0;
        // Reset soil baseline so first soil read after ascension does not count as a change
        modTracking.previousSoilType = null;
        
        // Reset wrinkler tracking data to prevent achievements from triggering based on previous run's data
        modTracking.previousWrinklerStates = {};
        modTracking.bankSextupledByWrinkler = false;
        
        // Reset session deltas for new ascension to prevent carryover
        // This prevents achievements from triggering based on previous run's data
        Object.keys(sessionDeltas).forEach(key => sessionDeltas[key] = 0);
        
        // Reset upgrades to unpurchased state for ascension
        // Achievements remain won (they persist across ascensions)
        var modUpgradeNames = getModUpgradeNames();
        
        // Build set of upgrade IDs that are in permanent slots
        var permanentUpgradeIds = {};
        if (Game.permanentUpgrades) {
            for (var i = 0; i < Game.permanentUpgrades.length; i++) {
                if (Game.permanentUpgrades[i] !== -1) {
                    permanentUpgradeIds[Game.permanentUpgrades[i]] = true;
                }
            }
        }
        
        modUpgradeNames.forEach(name => {
            if (Game.Upgrades[name]) {
                // Don't reset bought status for upgrades in permanent slots
                // Vanilla has already restored them via .earn() before this hook runs
                var isInPermanentSlot = permanentUpgradeIds[Game.Upgrades[name].id];
                if (!isInPermanentSlot) {
                    Game.Upgrades[name].bought = 0;
                }
                // We don't reset unlocked here because our custom unlock logic handles it
                // The upgrade will be visible if its unlock condition is met
            }
        });

        resetUnlockStateCache();
    }
    
    // Handle reset - clear data on full reset
    function handleReset() {
        // Check if this is a full reset (not an ascension)
        if (!Game.OnAscend || Game.OnAscend === 0) {
            // CRITICAL: Don't reset achievements during save loading operations
            // Only reset for user-initiated hard resets
            
            // This is a full reset - clear everything
            
            // CRITICAL: Clear mod save data to prevent cross-contamination
            modSaveData = null;
            debugLog('handleReset: cleared modSaveData to prevent cross-contamination');
            
            // Reset lifetime data
            lifetimeData = {
                reindeerClicked: 0,
                stockMarketAssets: 0,
                shinyWrinklersPopped: 0,
                wrathCookiesClicked: 0,
                totalCookieClicks: 0,
                wrinklersPopped: 0,
                elderCovenantToggles: 0,
                pledges: 0,
                gardenSacrifices: 0,
                godUsageTime: {}
            };
            
            // Reset achievements to unwon state - only for genuine user resets
            modAchievementNames.forEach(name => {
                if (Game.Achievements[name]) {
                    Game.Achievements[name].won = 0;
                }
            });
            
            // Reset upgrades to unpurchased state
            var modUpgradeNames = getModUpgradeNames();
            modUpgradeNames.forEach(name => {
                if (Game.Upgrades[name]) {
                    Game.Upgrades[name].bought = 0;
                    // Note: We don't reset unlocked here because our custom unlock logic handles it
                    // The upgrade will be visible if its unlock condition is met
                }
            });
            
            // Reset capture flags
            hasCapturedThisAscension = false;
            lastAscensionCount = 0;

            resetUnlockStateCache();
            
    
        } else {
            // This is an ascension - capture lifetime data as fallback
            captureLifetimeData();
        }
    }
    
    // Helper functions that return current + lifetime values
    function getLifetimeReindeer() {
        return (Game.reindeerClicked || 0) + lifetimeData.reindeerClicked;
    }
    
    function getLifetimeStockMarketAssets() {
        var currentAssets = 0;
        if (Game.Objects['Bank'] && Game.Objects['Bank'].minigame) {
            currentAssets = Game.Objects['Bank'].minigame.profit || 0;
        }
        return currentAssets + lifetimeData.stockMarketAssets;
    }
    
    function getLifetimeShinyWrinklers() {
        return lifetimeData.shinyWrinklersPopped || 0;
    }
    
    function getLifetimeWrathCookies() {
        return lifetimeData.wrathCookiesClicked || 0;
    }
    
    function getLifetimeGardenSacrifices() {
        var M = Game.Objects['Farm'].minigame;
        return (M && M.convertTimes) ? M.convertTimes : 0;
    }
    
    function getLifetimeCookieClicks() {
        return (Game.cookieClicks || 0) + lifetimeData.totalCookieClicks;
    }
    
    function getLifetimeWrinklers() {
        // Use Game.wrinklersPopped for current session + lifetime data for previous ascensions
        return (Game.wrinklersPopped || 0) + (lifetimeData.wrinklersPopped || 0);
    }
    
    function getLifetimePledges() {
        return (Game.pledges || 0) + lifetimeData.pledges + lifetimeData.elderCovenantToggles;
    }
    
    function getLifetimeCookieFish() {
        // Combine current session (Game.JNE) with lifetime data (previous sessions)
        var currentSession = (Game.JNE && Game.JNE.cookieFishCaught) ? Game.JNE.cookieFishCaught : 0;
        return currentSession + (lifetimeData.cookieFishCaught || 0);
    }
    
    function getLifetimeBingoJackpotWins() {
        // Combine current session (Game.JNE) with lifetime data (previous sessions)
        var currentSession = (Game.JNE && Game.JNE.bingoJackpotWins) ? Game.JNE.bingoJackpotWins : 0;
        return currentSession + (lifetimeData.bingoJackpotWins || 0);
    }
    
    // Returns total buildings sold this ascension by summing bought-amount for each building
    function getBuildingsSoldTotal() {
        var buildingsSoldTotal = 0;
        for (var buildingName in Game.Objects) {
            var building = Game.Objects[buildingName];
            var bought = (building && building.bought) || 0;
            var amount = (building && building.amount) || 0;
            var sold = bought - amount;
            buildingsSoldTotal += Math.max(0, sold);
        }
        return buildingsSoldTotal;
    }

    // Exact building counts for "The Final Countdown" challenge (20 down to 1)
    var FINAL_COUNTDOWN_REQUIRED_COUNTS = {'Cursor': 20, 'Grandma': 19, 'Farm': 18, 'Mine': 17, 'Factory': 16, 'Bank': 15, 'Temple': 14, 'Wizard tower': 13, 'Shipment': 12, 'Alchemy lab': 11, 'Portal': 10, 'Time machine': 9, 'Antimatter condenser': 8, 'Prism': 7, 'Chancemaker': 6, 'Fractal engine': 5, 'Javascript console': 4, 'Idleverse': 3, 'Cortex baker': 2, 'You': 1};
    // Alternative building counts for "The Final Countdown" challenge (15 down to 1)
    var FINAL_COUNTDOWN_REQUIRED_COUNTS_ALT = {'Cursor': 15, 'Grandma': 14, 'Farm': 13, 'Mine': 12, 'Factory': 11, 'Bank': 10, 'Temple': 9, 'Wizard tower': 8, 'Shipment': 7, 'Alchemy lab': 6, 'Portal': 5, 'Time machine': 4, 'Antimatter condenser': 3, 'Prism': 2, 'Chancemaker': 1, 'Fractal engine': 0, 'Javascript console': 0, 'Idleverse': 0, 'Cortex baker': 0, 'You': 0};
    function checkFinalCountdownAchievement() {
        // Check first set (20 down to 1)
        var allBuildingsCorrect = true;
        for (var buildingName in FINAL_COUNTDOWN_REQUIRED_COUNTS) {
            var building = Game.Objects[buildingName];
            if (!building || building.amount !== FINAL_COUNTDOWN_REQUIRED_COUNTS[buildingName]) {
                allBuildingsCorrect = false;
                break;
            }
        }
        if (allBuildingsCorrect) return true;
        
        // Check second set (15 down to 0)
        allBuildingsCorrect = true;
        for (var buildingName in FINAL_COUNTDOWN_REQUIRED_COUNTS_ALT) {
            var building = Game.Objects[buildingName];
            if (!building || building.amount !== FINAL_COUNTDOWN_REQUIRED_COUNTS_ALT[buildingName]) {
                allBuildingsCorrect = false;
                break;
            }
        }
        return allBuildingsCorrect;
    }
    
    // ===== MENU SYSTEM FUNCTIONS =====
    
    // Function to update menu buttons to reflect current settings
    function updateMenuButtons() {
        let buttons = document.querySelectorAll('#just-natural-expansion-settings .option');
        buttons.forEach(button => {
            let settingName = '';
            if (button.id === 'toggle-shadow-achievements') settingName = 'shadowAchievements';
            else if (button.id === 'toggle-cookie-upgrades') settingName = 'enableCookieUpgrades';
            else if (button.id === 'toggle-building-upgrades') settingName = 'enableBuildingUpgrades';
            else if (button.id === 'toggle-kitten-upgrades') settingName = 'enableKittenUpgrades';
            else if (button.id === 'toggle-heavenly-upgrades') settingName = 'enableHeavenlyUpgrades';
            else if (button.id === 'toggle-js-minigame') settingName = 'enableJSMiniGame';
            else if (button.id === 'toggle-cookie-age') settingName = 'enableCookieAge';
            
            if (settingName) {
                let buttonText = '';
                let isEnabled = false;
                
                switch(settingName) {
                    case 'shadowAchievements':
                        isEnabled = shadowAchievementMode;
                        buttonText = `Shadow Achievements<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableCookieUpgrades':
                        isEnabled = enableCookieUpgrades;
                        buttonText = `Cookie Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableBuildingUpgrades':
                        isEnabled = enableBuildingUpgrades;
                        buttonText = `Building Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableKittenUpgrades':
                        isEnabled = enableKittenUpgrades;
                        buttonText = `Kitten Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableHeavenlyUpgrades':
                        isEnabled = enableHeavenlyUpgrades;
                        buttonText = `Heavenly Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableJSMiniGame':
                        isEnabled = enableJSMiniGame;
                        buttonText = `JS Console Minigame<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableCookieAge':
                        isEnabled = enableCookieAge;
                        buttonText = `Mysteries of the Cookie<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                }
                button.innerHTML = buttonText;
                button.style.color = isEnabled ? 'lime' : 'red';
            }
        });
    }
    
    // Toggle setting function
    function toggleSetting(settingName) {
        // Prevent rapid clicking
        if (toggleLock) { 
            return; 
        }
        
        // Map setting names to actual variables
        let targetVariable = null;
        switch(settingName) {
            case 'shadowAchievements':
                targetVariable = 'shadowAchievementMode';
                break;
            case 'enableCookieUpgrades':
                targetVariable = 'enableCookieUpgrades';
                break;
            case 'enableBuildingUpgrades':
                targetVariable = 'enableBuildingUpgrades';
                break;
            case 'enableKittenUpgrades':
                targetVariable = 'enableKittenUpgrades';
                break;
            case 'enableHeavenlyUpgrades':
                targetVariable = 'enableHeavenlyUpgrades';
                break;
            case 'enableJSMiniGame':
                targetVariable = 'enableJSMiniGame';
                break;
            case 'enableCookieAge':
                targetVariable = 'enableCookieAge';
                break;
            default:
                targetVariable = settingName;
        }
        
        // Determine what the new state will be
        let newState = false;
        if (targetVariable === 'shadowAchievementMode') {
            newState = !shadowAchievementMode;
        } else if (targetVariable === 'enableCookieUpgrades') {
            newState = !enableCookieUpgrades;
        } else if (targetVariable === 'enableBuildingUpgrades') {
            newState = !enableBuildingUpgrades;
        } else if (targetVariable === 'enableKittenUpgrades') {
            newState = !enableKittenUpgrades;
        } else if (targetVariable === 'enableHeavenlyUpgrades') {
            newState = !enableHeavenlyUpgrades;
        } else if (targetVariable === 'enableJSMiniGame') {
            newState = !enableJSMiniGame;
        } else if (targetVariable === 'enableCookieAge') {
            newState = !enableCookieAge;
        }
        
        // Prevent disabling the Terminal while it is open
        if (settingName === 'enableJSMiniGame' && newState === false && isTerminalMinigameOpen()) {
            showTerminalMinigameClosePrompt();
            return;
        }

        // Determine competition-mode transition
        const wasInCompetitionMode = shadowAchievementMode && !enableCookieUpgrades && !enableBuildingUpgrades && !enableKittenUpgrades && !enableJSMiniGame && !enableHeavenlyUpgrades;
        let willExitCompetitionMode = false;
        if (settingName === 'shadowAchievements') {
            willExitCompetitionMode = wasInCompetitionMode && newState === false;
        } else if (settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades' || settingName === 'enableJSMiniGame' || settingName === 'enableHeavenlyUpgrades') {
            willExitCompetitionMode = wasInCompetitionMode && newState === true;
        }

        // Helper to apply changes after confirmation/prompt
        var performToggle = function(targetSettingName, state) {
            if (targetSettingName === 'enableCookieAge') {
                applyCookieAgeChange(state, true);
            } else if (targetSettingName === 'enableCookieUpgrades' || targetSettingName === 'enableBuildingUpgrades' || targetSettingName === 'enableKittenUpgrades' || targetSettingName === 'enableJSMiniGame') {
                applyUpgradeChange(targetSettingName, state);
            } else if (targetSettingName === 'enableHeavenlyUpgrades') {
                applyHeavenlyUpgradesChange(state, true);
            } else if (targetSettingName === 'shadowAchievements') {
                applyShadowAchievementChange(state);
            } else {
                applySettingChange(targetSettingName, state);
            }
        };

        // Show confirmation prompt only when leaving competition mode
        let message = '';
        let callback = '';
        
        if (settingName === 'shadowAchievements' && willExitCompetitionMode) {
            if (newState) {
                message = 'Enable shadow achievements?<br><small>All mod achievements will be moved to the shadow pool and will no longer grant milk or affect gameplay.</small>';
                callback = function() { performToggle('shadowAchievements', true); };
            } else {
                message = 'Disable shadow achievements?<br><small>All mod achievements will be moved to the normal pool and will grant milk and affect gameplay. This will award the "Beyond the Leaderboard" shadow achievement to indicate you have left competition mode.</small>';
                callback = function() { performToggle('shadowAchievements', false); };
            }
        } else if ((settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades' || settingName === 'enableJSMiniGame' || settingName === 'enableHeavenlyUpgrades') && willExitCompetitionMode) {
            let upgradeType = settingName.replace('enable', '').replace('Upgrades', '');
            if (newState) {
                message = 'Enable ' + upgradeType + ' upgrades?<br><small>These upgrades will be added to the game and may affect your CpS and gameplay. This will award the "Beyond the Leaderboard" shadow achievement to indicate you have left competition mode.</small>';
                callback = function() { performToggle(settingName, true); };
            } else {
                message = 'Disable ' + upgradeType + ' upgrades?<br><small>These upgrades will be removed from the game. Their purchase state will be remembered and will restore when turned back on.</small>';
                callback = function() { performToggle(settingName, false); };
            }
        }
        
        if (message && callback) {
            // Check if "Beyond the leaderboard" has been won - if so, no need for warnings
            if (Game.Achievements['Beyond the Leaderboard'] && Game.Achievements['Beyond the Leaderboard'].won) {
                // Achievement already won, apply immediately without warning
                callback();
            } else {
                // Show warning prompt
                showSettingsChangePrompt(message, callback);
            }
        } else {
            if (settingName === 'enableCookieAge') {
                applyCookieAgeChange(newState, true);
            } else if (settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades' || settingName === 'enableJSMiniGame') {
                applyUpgradeChange(settingName, newState);
            } else if (settingName === 'enableHeavenlyUpgrades') {
                applyHeavenlyUpgradesChange(newState, true);
            } else if (settingName === 'shadowAchievements') {
                applyShadowAchievementChange(newState);
            } else {
                applySettingChange(settingName, newState);
            }
        }
    }
    
    function playToggleSound(isEnabled) {
        if (typeof PlaySound === 'function' && typeof Game !== 'undefined' && Game.onMenu === 'prefs') {
            PlaySound(isEnabled ? 'snd/tick.mp3' : 'snd/tickOff.mp3');
        }
    }

    function queueAchievementAward(achievementName) {
        if (!Game.Achievements || !Game.Achievements[achievementName]) {
            return;
        }
        if (Game.Achievements[achievementName].won) {
            return;
        }
        if (pendingAchievementAwards.indexOf(achievementName) === -1) {
            pendingAchievementAwards.push(achievementName);
        }
    }

    function flushPendingAchievementAwards() {
        if (!modInitialized || !pendingAchievementAwards.length) {
            return;
        }
        const awardsToProcess = pendingAchievementAwards.slice();
        pendingAchievementAwards.length = 0;
        setTimeout(function() {
            if (Game.ClosePrompt) {
                Game.ClosePrompt();
            }
            awardsToProcess.forEach(function(name, index) {
                setTimeout(function() {
                    Game.Win(name);
                }, index * 100);
            });
        }, 0);
    }
    
    // Function to apply shadow achievement changes
    window.applyShadowAchievementChange = function(enabled) {
        // Set lock to prevent rapid operations
        if (toggleLock) { return; }
        toggleLock = true;
        
        try {
        shadowAchievementMode = enabled;
        modSettings.shadowAchievements = enabled;   

        playToggleSound(enabled);
        
        // Update Game.JNE exposure
        if (Game.JNE) {
            Game.JNE.shadowAchievementMode = shadowAchievementMode;
        }
        
        // Update achievement pools
        updateAchievementPools();
        
        // Special handling for shadow achievements setting
        if (!enabled) {
            modSettings.hasUsedModOutsideShadowMode = true;
            
            // Award the "Beyond the Leaderboard" achievement if it exists and hasn't been won
            if (Game.Achievements['Beyond the Leaderboard'] && !Game.Achievements['Beyond the Leaderboard'].won) {
                Game.Win('Beyond the Leaderboard');
            }
        }
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        
        // Force the vanilla game to recalculate AchievementsOwned based on new pool assignments
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
        
        // Force the game to recalculate gains to update milk progress and kitten bonuses
        if (Game.CalculateGains) {
            Game.CalculateGains();
        }
        
            // Update UI and validate state
            setTimeout(() => {
        updateMenuButtons();
                validateToggleButtonState('shadowAchievements', enabled);
            }, 50);
            
            // Save settings (throttled)
            requestModSave(false);
            
        } catch (error) {
            console.error('[Toggle] Error in applyShadowAchievementChange:', error);
        } finally {
            // Release lock after operation completes
        setTimeout(() => {
                toggleLock = false;
                
            }, 150);
            }
    }
    
    // Function to apply upgrade changes
    window.applyUpgradeChange = function(settingName, enabled) {
        // Set lock to prevent rapid operations
        toggleLock = true;
        
        try {
        // Update the variable
        if (settingName === 'enableCookieUpgrades') {
            enableCookieUpgrades = enabled;
        } else if (settingName === 'enableBuildingUpgrades') {
            enableBuildingUpgrades = enabled;
        } else if (settingName === 'enableKittenUpgrades') {
            enableKittenUpgrades = enabled;
        } else if (settingName === 'enableJSMiniGame') {
            enableJSMiniGame = enabled;
            // Set Game.JNE flag so minigameTerminal.js can check it
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableJSMiniGame = enabled;
            // Enable or disable the minigame based on toggle state
            if (enabled) {
                enableTerminalMinigame();
            } else {
                disableTerminalMinigame();
                // Remove terminal achievements if minigame is disabled
                // Try to call via minigame object first, but also try direct function call as fallback
                if (Game.Objects && Game.Objects['Javascript console']) {
                    var jsConsole = Game.Objects['Javascript console'];
                    if (jsConsole.minigame && typeof jsConsole.minigame.removeAchievements === 'function') {
                        jsConsole.minigame.removeAchievements();
                    } else if (typeof window.removeTerminalAchievements === 'function') {
                        window.removeTerminalAchievements();
                    }
                }
                
                // Force the vanilla game to recalculate AchievementsOwned
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
                
                // Force the game to recalculate gains to update milk progress and kitten bonuses
                if (Game.CalculateGains) {
                    Game.CalculateGains();
                }
            }
            // Sync button visibility
            syncTerminalMinigameButtonWithSetting();
        } else if (settingName === 'enableCookieAge') {
            enableCookieAge = enabled;
        }
        
        // Update modSettings for compatibility
        modSettings[settingName] = enabled;

        playToggleSound(enabled);
        
        // Apply changes to the game
        // First save current upgrade states to preserve any purchases made since last save
        var modUpgradeNames = getModUpgradeNames();
        if (!modSaveData) {
            modSaveData = { upgrades: {} };
        }
        if (!modSaveData.upgrades) {
            modSaveData.upgrades = {};
        }
        
        // Snapshot purchases so we can restore them post-recreate
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (Game.Upgrades[upgradeName]) {
                var currentBought = Game.Upgrades[upgradeName].bought || 0;
                modSaveData.upgrades[upgradeName] = { bought: currentBought };
            }
        }
                
        // Use full rebuild to ensure deterministic CPS
        recreateUpgradesFromSaveOnly();
        
        // Set up custom building multipliers if building upgrades are enabled
        if (enableBuildingUpgrades) {
            addCustomBuildingMultipliers();
        }
        
        // Update unlock states for all enabled upgrade categories to ensure immediate store visibility
        if (enableCookieUpgrades) {
            updateUnlockStatesForUpgrades(cookieUpgradeNames, true);
        }
        if (enableBuildingUpgrades) {
            updateUnlockStatesForUpgrades(buildingUpgradeNames, true);
        }
        if (enableKittenUpgrades) {
            updateUnlockStatesForUpgrades(kittenUpgradeNames, true);
        }
        
        // Force immediate recalculation
        if (Game.CalculateGains) { Game.CalculateGains(); }
        if (Game.recalculateGains) { Game.recalculateGains = 1; }
        
        // Force immediate store refresh
        Game.storeToRefresh = 1;
        Game.upgradesToRebuild = 1;
        if (Game.RefreshStore) { Game.RefreshStore(); }
        if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
        if (Game.UpdateMenu) { Game.UpdateMenu(); }
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        
        // Update UI and validate button state
        setTimeout(() => {updateMenuButtons(); validateToggleButtonState(settingName, enabled);}, 150);

            // Save after refresh (non-blocking)
            setTimeout(function() {
                if (Game.WriteSave) {
                    Game.WriteSave();
                }
            }, 100);
            
        } catch (error) {
            console.error('Toggle error in applyUpgradeChange:', error);
        } finally {
            // Release lock after all operations complete
        setTimeout(() => {
                toggleLock = false;
                
            }, 250);
        }
    }
    
    // Function to dynamically load cookieAge.js from CDN
    function loadCookieAgeScript() {
        // Return a resolved promise if already loaded
        if (window.CookieAge) {
            cookieAgeScriptLoaded = true;
            return Promise.resolve();
        }
        
        // Check if script tag already exists to avoid duplicates, date stamping to crush annoying cache issues
        var cookieAgeScriptUrlWithCache = cookieAgeScriptUrl + '?v=' + Date.now();
        var existingScript = document.querySelector('script[src*="' + cookieAgeScriptUrl + '"]');
        if (existingScript) {
            // Script tag exists, wait for it to load
            return new Promise(function(resolve, reject) {
                var checkInterval = setInterval(function() {
                    if (window.CookieAge) {
                        clearInterval(checkInterval);
                        cookieAgeScriptLoaded = true;
                        resolve();
                    }
                }, 100);
                
                // Timeout after 30 seconds
                setTimeout(function() {
                    clearInterval(checkInterval);
                    if (!window.CookieAge) {
                        reject(new Error('CookieAge script loading timeout'));
                    }
                }, 30000);
                
                // Also check on script load event
                existingScript.addEventListener('load', function() {
                    clearInterval(checkInterval);
                    if (window.CookieAge) {
                        cookieAgeScriptLoaded = true;
                        resolve();
                    } else {
                        reject(new Error('CookieAge script loaded but window.CookieAge not available'));
                    }
                });
                
                existingScript.addEventListener('error', function() {
                    clearInterval(checkInterval);
                    reject(new Error('Failed to load CookieAge script'));
                });
            });
        }
        
        // Create and load the script
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = cookieAgeScriptUrlWithCache;
            script.async = true;
            
            script.onload = function() {
                // Wait for window.CookieAge to be available
                var checkInterval = setInterval(function() {
                    if (window.CookieAge) {
                        clearInterval(checkInterval);
                        cookieAgeScriptLoaded = true;
                        resolve();
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(function() {
                    clearInterval(checkInterval);
                    if (!window.CookieAge) {
                        cookieAgeScriptLoaded = false;
                        reject(new Error('CookieAge script loaded but window.CookieAge not available'));
                    }
                }, 10000);
            };
            
            script.onerror = function() {
                cookieAgeScriptLoaded = false;
                reject(new Error('Failed to load CookieAge script from CDN'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Function to apply Cookie Age changes
    window.applyCookieAgeChange = function(enabled, isManualToggle) {
        // Set lock to prevent rapid operations
        toggleLock = true;
        var asyncLockHandled = false; // Track if lock will be released by async callback
        
        try {
            // Update the variable
            enableCookieAge = enabled;
            
            // Update modSettings for compatibility
            modSettings.enableCookieAge = enabled;
            
            playToggleSound(enabled);
            
            // Update the exposed variable for the Cookie Age mod
            if (Game.JNE) {
                Game.JNE.enableCookieAge = enabled;
                // Only clear the save flag if this is actually a manual toggle
                if (isManualToggle) {
                    Game.JNE.enableCookieAgeFromSave = false;
                }
            }
            
            // Apply changes to the game
            if (enabled) {
                // Function to enable Cookie Age after script is loaded
                var enableCookieAgeAfterLoad = function() {
                    // Enable Cookie Age mod functionality (never plays audio)
                    if (window.CookieAge && window.CookieAge.enable) {
                        window.CookieAge.enable();
                    }
                    if (isManualToggle && window.CookieAge && typeof window.CookieAge.getMissingPuzzleCompletionRequirements === 'function') {
                    try {
                        var missingRequirements = window.CookieAge.getMissingPuzzleCompletionRequirements();
                        if (missingRequirements && missingRequirements.length && typeof Game !== 'undefined' && Game.Prompt) {
                            var missingBuildings = [];
                            var missingProgress = [];
                            var missingUpgrades = [];
                            var missingSystem = [];
                            var missingOther = [];

                            for (var idx = 0; idx < missingRequirements.length; idx++) {
                                var requirement = missingRequirements[idx];
                                if (!requirement) continue;
                                var type = requirement.type || 'other';
                                var label = requirement.label || requirement;

                                switch (type) {
                                    case 'building':
                                        missingBuildings.push(label);
                                        break;
                                    case 'progress':
                                        missingProgress.push(label);
                                        break;
                                    case 'upgrade':
                                        missingUpgrades.push(label);
                                        break;
                                    case 'system':
                                        missingSystem.push(label);
                                        break;
                                    default:
                                        missingOther.push(label);
                                        break;
                                }
                            }

                            var promptHtml = '<id CookieAgeRequirements><h3>More Progress Needed</h3>' +
                                '<div class="block">You can activate the Mysteries of the Cookie, but you are not yet far enough into the game to complete every puzzle.</div>' +
                                '<div class="line"></div><div class="block"><b>You are missing the following necessary milestones</b></div>';

                            if (missingBuildings.length) {
                                promptHtml += '<div class="line"></div><div class="block"><b>Building levels required:</b>';
                                for (var b = 0; b < missingBuildings.length; b++) {
                                    promptHtml += '<div>&bull; ' + missingBuildings[b] + '</div>';
                                }
                                promptHtml += '</div>';
                            }

                            if (missingProgress.length) {
                                promptHtml += '<div class="line"></div><div class="block"><b>Cookie milestone:</b>';
                                for (var p = 0; p < missingProgress.length; p++) {
                                    promptHtml += '<div>&bull; ' + missingProgress[p] + '</div>';
                                }
                                promptHtml += '</div>';
                            }

                            if (missingUpgrades.length) {
                                promptHtml += '<div class="line"></div><div class="block"><b>The following Heavenly upgrades are required:</b>';
                                for (var u = 0; u < missingUpgrades.length; u++) {
                                    promptHtml += '<div>&bull; ' + missingUpgrades[u] + '</div>';
                                }
                                promptHtml += '</div>';
                            }

                            if (missingSystem.length) {
                                promptHtml += '<div class="line"></div><div class="block">' + missingSystem.join('<br>') + '</div>';
                            }

                            if (missingOther.length) {
                                promptHtml += '<div class="line"></div><div class="block">';
                                for (var o = 0; o < missingOther.length; o++) {
                                    promptHtml += '<div>&bull; ' + missingOther[o] + '</div>';
                                }
                                promptHtml += '</div>';
                            }

                            Game.Prompt(promptHtml, [[loc('Understood'), 0]]);
                        }
                    } catch (requirementError) {
                        // Silently ignore requirement prompt errors to avoid blocking the toggle
                    }
                }
                // If we have deferred Cookie Age save data, apply it now
                try {
                    if (Game.JNE && Game.JNE.cookieAgeSavedData && window.CookieAge && window.CookieAge.applySaveData) {
                        window.CookieAge.applySaveData(Game.JNE.cookieAgeSavedData);
                        Game.JNE.cookieAgeSavedData = null;
                    }
                } catch (_) {}
                
                // ONLY play welcome audio if this is a manual toggle (button click)
                if (isManualToggle && window.CookieAge && window.CookieAge.playWelcomeAudio) {
                    setTimeout(function() {
                        window.CookieAge.playWelcomeAudio();
                    }, 100);
                }
                
                // Force the vanilla game to recalculate AchievementsOwned
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
                
                // Force the game to recalculate gains to update milk progress and kitten bonuses
                if (Game.CalculateGains) {
                    Game.CalculateGains();
                }
                
                console.log('[JNE] The Mysteries of the Cookie enabled');
                };
                
                // Check if script needs to be loaded
                if (!window.CookieAge) {
                    // Load script from CDN
                    loadCookieAgeScript()
                        .then(function() {
                            // Script loaded successfully, enable Cookie Age
                            enableCookieAgeAfterLoad();
                            // Update menu buttons
                            setTimeout(function() {
                                updateMenuButtons();
                                validateToggleButtonState('enableCookieAge', true);
                            }, 50);
                            // Save settings (throttled)
                            requestModSave(false);
                            // Release lock after enabling
                            setTimeout(function() {
                                toggleLock = false;
                            }, 150);
                        })
                        .catch(function(error) {
                            // Script loading failed - revert toggle state
                            errorLog('Failed to load Cookie Age script:', error.message);
                            enableCookieAge = false;
                            modSettings.enableCookieAge = false;
                            if (Game.JNE) {
                                Game.JNE.enableCookieAge = false;
                            }
                            // Update menu buttons to reflect disabled state
                            setTimeout(function() {
                                updateMenuButtons();
                                validateToggleButtonState('enableCookieAge', false);
                            }, 50);
                            // Save settings (throttled) to persist reverted state
                            requestModSave(false);
                            // Show error to user
                            if (Game && Game.Prompt) {
                                Game.Prompt(
                                    '<h3>Failed to Load Cookie Age</h3>' +
                                    '<div class="block">Unable to load the Mysteries of the Cookie expansion from CDN.</div>' +
                                    '<div class="line"></div>' +
                                    '<div class="block">Please check your internet connection and try again.</div>' +
                                    '<div class="line"></div>' +
                                    '<div class="block">Error: ' + (error.message || 'Unknown error') + '</div>',
                                    [[loc('OK'), 0]]
                                );
                            }
                            // Release lock after error handling
                            setTimeout(function() {
                                toggleLock = false;
                            }, 150);
                        });
                    // Don't release lock here - wait for async operation to complete
                    asyncLockHandled = true;
                    return;
                } else {
                    // Script already loaded, enable immediately
                    enableCookieAgeAfterLoad();
                }
            } else {
                // Disable Cookie Age mod functionality
                if (window.CookieAge && window.CookieAge.disable) {
                    window.CookieAge.disable();
                }
                console.log('[JNE] The Mysteries of the Cookie disabled');
                
                // Force the vanilla game to recalculate AchievementsOwned
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
                
                // Force the game to recalculate gains to update milk progress and kitten bonuses
                if (Game.CalculateGains) {
                    Game.CalculateGains();
                }
            }
            
            // Update menu buttons
            setTimeout(() => {
                updateMenuButtons();
                validateToggleButtonState('enableCookieAge', enabled);
            }, 50);
            
            // Save settings (throttled)
            requestModSave(false);
            
        } catch (error) {
            console.error('[Toggle] Error in applyCookieAgeChange:', error);
        } finally {
            // Release lock after operation completes (only if not handled by async callback)
            if (!asyncLockHandled) {
                setTimeout(() => {
                    toggleLock = false;
                }, 150);
            }
        }
    }
    
    // Function to apply Heavenly Upgrades changes
    window.applyHeavenlyUpgradesChange = function(enabled, isManualToggle) {
        toggleLock = true;
        var asyncLockHandled = false;
        
        try {
            enableHeavenlyUpgrades = enabled;
            modSettings.enableHeavenlyUpgrades = enabled;
            
            if (isManualToggle) {
                playToggleSound(enabled);
            }
            
            if (Game.JNE) {
                Game.JNE.enableHeavenlyUpgrades = enabled;
            }
            
            if (enabled) {
                var enableHeavenlyUpgradesAfterLoad = function() {
                    if (Game.JNE && Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.initialized === 'function' && Game.JNE.HeavenlyUpgrades.initialized()) {
                        if (Game.JNE.heavenlyUpgradesSavedData && Game.JNE.HeavenlyUpgrades.applySaveData) {
                            Game.JNE.HeavenlyUpgrades.applySaveData(Game.JNE.heavenlyUpgradesSavedData);
                        }
                    }
                    
                    if (Game.CalculateGains) {
                        Game.CalculateGains();
                    }
                    if (Game.recalculateGains) {
                        Game.recalculateGains = 1;
                    }
                    
                    Game.storeToRefresh = 1;
                    Game.upgradesToRebuild = 1;
                    if (Game.RefreshStore) { Game.RefreshStore(); }
                    if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
                    if (Game.UpdateMenu) { Game.UpdateMenu(); }
                    
                                    };
                
                if (!heavenlyUpgradesScriptLoaded) {
                    var scriptUrl = heavenlyUpgradesScriptUrl + '?v=' + Date.now();
                    var existingScript = document.querySelector('script[src*="heavenlyUpgrades.js"]');
                    
                    if (!existingScript) {
                        var script = document.createElement('script');
                        script.src = scriptUrl;
                        script.async = true;
                        
                        script.onload = function() {
                            heavenlyUpgradesScriptLoaded = true;
                            var checkInit = setInterval(function() {
                                if (Game.JNE && Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.initialized === 'function' && Game.JNE.HeavenlyUpgrades.initialized()) {
                                    clearInterval(checkInit);
                                    enableHeavenlyUpgradesAfterLoad();
                                    setTimeout(function() {
                                        updateMenuButtons();
                                        validateToggleButtonState('enableHeavenlyUpgrades', true);
                                    }, 50);
                                    requestModSave(false);
                                    setTimeout(function() {
                                        toggleLock = false;
                                    }, 150);
                                }
                            }, 100);
                            
                            setTimeout(function() {
                                clearInterval(checkInit);
                                if (!toggleLock) return;
                                enableHeavenlyUpgradesAfterLoad();
                                setTimeout(function() {
                                    updateMenuButtons();
                                    validateToggleButtonState('enableHeavenlyUpgrades', true);
                                }, 50);
                                requestModSave(false);
                                setTimeout(function() {
                                    toggleLock = false;
                                }, 150);
                            }, 5000);
                        };
                        
                        script.onerror = function() {
                            errorLog('Failed to load Heavenly Upgrades script');
                            enableHeavenlyUpgrades = false;
                            modSettings.enableHeavenlyUpgrades = false;
                            if (Game.JNE) {
                                Game.JNE.enableHeavenlyUpgrades = false;
                            }
                            setTimeout(function() {
                                updateMenuButtons();
                                validateToggleButtonState('enableHeavenlyUpgrades', false);
                            }, 50);
                            requestModSave(false);
                            if (Game && Game.Prompt) {
                                Game.Prompt(
                                    '<h3>Failed to Load Heavenly Upgrades</h3>' +
                                    '<div class="block">Unable to load the Heavenly Upgrades expansion from CDN.</div>' +
                                    '<div class="line"></div>' +
                                    '<div class="block">Please check your internet connection and try again.</div>',
                                    [[loc('OK'), 0]]
                                );
                            }
                            setTimeout(function() {
                                toggleLock = false;
                            }, 150);
                        };
                        
                        document.head.appendChild(script);
                        asyncLockHandled = true;
                        return;
                    } else {
                        heavenlyUpgradesScriptLoaded = true;
                        var checkInit = setInterval(function() {
                            if (Game.JNE && Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.initialized === 'function' && Game.JNE.HeavenlyUpgrades.initialized()) {
                                clearInterval(checkInit);
                                enableHeavenlyUpgradesAfterLoad();
                            }
                        }, 100);
                        
                        setTimeout(function() {
                            clearInterval(checkInit);
                            enableHeavenlyUpgradesAfterLoad();
                        }, 2000);
                    }
                } else {
                    enableHeavenlyUpgradesAfterLoad();
                }
            } else {
                                
                if (Game.CalculateGains) {
                    Game.CalculateGains();
                }
                if (Game.recalculateGains) {
                    Game.recalculateGains = 1;
                }
                
                Game.storeToRefresh = 1;
                Game.upgradesToRebuild = 1;
                if (Game.RefreshStore) { Game.RefreshStore(); }
                if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
                if (Game.UpdateMenu) { Game.UpdateMenu(); }
                
                // Force immediate synchronous save before showing prompt
                requestModSave(true);
                
                // Show prompt immediately after save
                if (isManualToggle && Game.Prompt) {
                    Game.Prompt(
                        '<h3>Heavenly Upgrades Disabled</h3>' +
                        '<div class="block">Heavenly Upgrades have been disabled.</div>' +
                        '<div class="line"></div>' +
                        '<div class="block"><b>Please refresh the page</b> for the changes to take full effect.<br>Safely removing all the heavenly upgrades would be very complex and prone to failure, this is just the safe easy approach.</div>',
                        [
                            [loc('Refresh now'), 'location.reload();'],
                            [loc('Later'), 0]
                        ]
                    );
                }
            }
            
            setTimeout(function() {
                updateMenuButtons();
                validateToggleButtonState('enableHeavenlyUpgrades', enabled);
            }, 50);
            
            if (enabled) {
                requestModSave(false);
            }
            
        } catch (error) {
            console.error('[Toggle] Error in applyHeavenlyUpgradesChange:', error);
        } finally {
            if (!asyncLockHandled) {
                setTimeout(function() {
                    toggleLock = false;
                }, 150);
            }
        }
    }
    
    // Function to validate that toggle button state matches actual variable state
    function validateToggleButtonState(settingName, expectedState) {
        try {
            var actualState = false;
            switch (settingName) {
                case 'enableCookieUpgrades':
                    actualState = enableCookieUpgrades;
                    break;
                case 'enableBuildingUpgrades':
                    actualState = enableBuildingUpgrades;
                    break;
                case 'enableKittenUpgrades':
                    actualState = enableKittenUpgrades;
                    break;
                case 'enableHeavenlyUpgrades':
                    actualState = enableHeavenlyUpgrades;
                    break;
                case 'enableJSMiniGame':
                    actualState = enableJSMiniGame;
                    break;
                case 'enableCookieAge':
                    actualState = enableCookieAge;
                    break;
                case 'shadowAchievements':
                    actualState = shadowAchievementMode;
                    break;
            }
            
            if (actualState !== expectedState) {
                console.warn('Toggle state mismatch for ' + settingName + ': expected ' + expectedState + ', actual ' + actualState);
                // Force button update to reflect actual state
                updateMenuButtons();
            }
        } catch (error) {
            console.error('Toggle state validation error:', error);
        }
    }
    
    // Function to apply setting changes without confirmation (for minor changes)
    function applySettingChange(settingName, newState) {
        // Update the actual variable
        if (settingName === 'shadowAchievements') {
            shadowAchievementMode = newState;
        } else if (settingName === 'enableCookieUpgrades') {
            enableCookieUpgrades = newState;
        } else if (settingName === 'enableBuildingUpgrades') {
            enableBuildingUpgrades = newState;
        } else if (settingName === 'enableKittenUpgrades') {
            enableKittenUpgrades = newState;
        } else if (settingName === 'enableJSMiniGame') {
            enableJSMiniGame = newState;
            // Set Game.JNE flag so minigameTerminal.js can check it
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableJSMiniGame = newState;
            // Enable or disable the minigame based on toggle state
            if (newState) {
                enableTerminalMinigame();
                // Create terminal achievements if minigame is enabled
                if (Game.Objects && Game.Objects['Javascript console']) {
                    var jsConsole = Game.Objects['Javascript console'];
                    if (jsConsole.minigame && typeof jsConsole.minigame.createAchievements === 'function') {
                        jsConsole.minigame.createAchievements();
                    } else if (typeof window.createTerminalAchievements === 'function') {
                        window.createTerminalAchievements();
                    }
                }
            } else {
                disableTerminalMinigame();
                // Remove terminal achievements if minigame is disabled
                // Try to call via minigame object first, but also try direct function call as fallback
                if (Game.Objects && Game.Objects['Javascript console']) {
                    var jsConsole = Game.Objects['Javascript console'];
                    if (jsConsole.minigame && typeof jsConsole.minigame.removeAchievements === 'function') {
                        jsConsole.minigame.removeAchievements();
                    } else if (typeof window.removeTerminalAchievements === 'function') {
                        window.removeTerminalAchievements();
                    }
                }
                
                // Force the vanilla game to recalculate AchievementsOwned
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
                
                // Force the game to recalculate gains to update milk progress and kitten bonuses
                if (Game.CalculateGains) {
                    Game.CalculateGains();
                }
            }
            syncTerminalMinigameButtonWithSetting();
        } else if (settingName === 'enableCookieAge') {
            enableCookieAge = newState;
        }
        
        // Also update modSettings for compatibility
        modSettings[settingName] = newState;
        
        playToggleSound(newState);
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        
        // Update the button text and color instantly
        updateMenuButtons();
        
        // Save settings (throttled)
        requestModSave(false);
    }
    
    // Toggle CpS display unit function (cycles through seconds, minutes, hours, days)
    if (!window.JNE) window.JNE = {};
    window.JNE.toggleCpsDisplayUnit = function() {
        var units = ['seconds', 'minutes', 'hours', 'days'];
        var unitLabels = { 'seconds': 'Seconds', 'minutes': 'Minutes', 'hours': 'Hours', 'days': 'Days' };
        var currentIndex = units.indexOf(modSettings.cpsDisplayUnit || 'seconds');
        var nextIndex = (currentIndex + 1) % units.length;
        modSettings.cpsDisplayUnit = units[nextIndex];
        
        var cpsButton = document.getElementById('toggle-cps-display-unit');
        if (cpsButton) {
            var nextUnit = units[(nextIndex + 1) % units.length];
            var label = cpsButton.nextElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.textContent = '(Toggles between seconds, minutes, and hours)';
            }
            cpsButton.innerHTML = 'CpS display: <b>' + unitLabels[modSettings.cpsDisplayUnit] + '</b>';
        }

        if (window.Game && Game.onMenu === 'stats' && typeof Game.UpdateMenu === 'function') {
            Game.UpdateMenu();
        }
        
        requestModSave(false);
    };
    
    // Combined menu injection function
    function injectMenus() {
        const originalUpdateMenu = Game.UpdateMenu;
        Game.UpdateMenu = function() {
            const result = originalUpdateMenu.call(this);
            
            // Handle options menu injection
            if (Game.onMenu === 'prefs') {
                let menuContainer = document.getElementById('menu');
                if (menuContainer && !document.getElementById('just-natural-expansion-settings')) {
                    let settingsDiv = document.createElement('div');
                    settingsDiv.id = 'just-natural-expansion-settings';
                    settingsDiv.className = 'block';
                    settingsDiv.style.cssText = 'padding:0px;margin:0px 4px;margin-top:20px;';
                    settingsDiv.innerHTML = `
                        <div class="subsection" style="padding:0px;">
                            <div class="title">${modName} v${modVersion}</div>
                            <div style="margin:10px 0px;color:#ccc;font-size:11px;line-height:1.3;">
							    The <span style="font-weight:bold;">${modName} Mod</span> expands Cookie Clicker's endgame while keeping the core game intact. It adds new upgrades, achievements, minigames, and even an occult puzzle mystery thriller, all designed not to break the vanilla feel and cadence of the game. Every feature can be toggled on or off for leaderboard safe play or tailored to your own style.
							    <br><br>Thanks for playing, and if you enjoy the mod, please spread the word. The more support the mod gets, the more features and updates I can add.<br> 
							</div>
                            <div class="listing">
                                <a class="option" id="toggle-shadow-achievements" style="text-decoration:none;color:${modSettings.shadowAchievements ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Shadow Achievements<br><b style="font-size:12px;">${modSettings.shadowAchievements ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Shadow achievements do not grant milk or affect gameplay, suitable for competition play.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-cookie-upgrades" style="text-decoration:none;color:${modSettings.enableCookieUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Cookie Upgrades<br><b style="font-size:12px;">${modSettings.enableCookieUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Cookie upgrades add cookies which increase CpS when purchased.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-building-upgrades" style="text-decoration:none;color:${modSettings.enableBuildingUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Building Upgrades<br><b style="font-size:12px;">${modSettings.enableBuildingUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Building upgrades add multipliers that affect specific buildings CpS.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-kitten-upgrades" style="text-decoration:none;color:${modSettings.enableKittenUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Kitten Upgrades<br><b style="font-size:12px;">${modSettings.enableKittenUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Kittens can be bought after earning enough milk, providing an overall boost to CpS.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-heavenly-upgrades" style="text-decoration:none;color:${modSettings.enableHeavenlyUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Heavenly Upgrades<br><b style="font-size:12px;">${modSettings.enableHeavenlyUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Purchasable during ascension, available after unlocking all Unshackled Upgrades.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-js-minigame" style="text-decoration:none;color:${modSettings.enableJSMiniGame ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    JS Console Minigame<br><b style="font-size:12px;">${modSettings.enableJSMiniGame ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(A scripting and automation minigame added to the Javascript Console. Unlocked at Level 1 Javascript Consoles.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" id="toggle-cookie-age" style="text-decoration:none;color:${modSettings.enableCookieAge ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Mysteries of the Cookie<br><b style="font-size:12px;">${modSettings.enableCookieAge ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>An occult mystery adventure packed with riddles, puzzles, ciphers, and hidden clues. Unravel the secrets of the ancient Order of the Cookie. Only the sharpest players will succeed.</label>
                            </div>
                        </div>
                    `;
                    
                    let checkModDataButton = menuContainer.querySelector('a[onclick*="CheckModData"]');
                    if (checkModDataButton) {
                        let checkModDataListing = checkModDataButton.closest('.listing');
                        if (checkModDataListing) {
                            checkModDataListing.parentNode.insertBefore(settingsDiv, checkModDataListing.nextSibling);
                        } else {
                            menuContainer.appendChild(settingsDiv);
                        }
                    } else {
                        menuContainer.appendChild(settingsDiv);
                    }
                    
                    // Add event listeners to the toggle buttons
                    setTimeout(() => {
                        // Shadow achievements toggle
                        let shadowToggle = settingsDiv.querySelector('#toggle-shadow-achievements');
                        if (shadowToggle) {
                            shadowToggle.addEventListener('click', function() {
                                toggleSetting('shadowAchievements');
                            });
                        }
                        
                        // Cookie upgrades toggle
                        let cookieToggle = settingsDiv.querySelector('#toggle-cookie-upgrades');
                        if (cookieToggle) {
                            cookieToggle.addEventListener('click', function() {
                                toggleSetting('enableCookieUpgrades');
                            });
                        }
                        
                        // Building upgrades toggle
                        let buildingToggle = settingsDiv.querySelector('#toggle-building-upgrades');
                        if (buildingToggle) {
                            buildingToggle.addEventListener('click', function() {
                                toggleSetting('enableBuildingUpgrades');
                            });
                        }
                        
                        // Kitten upgrades toggle
                        let kittenToggle = settingsDiv.querySelector('#toggle-kitten-upgrades');
                        if (kittenToggle) {
                            kittenToggle.addEventListener('click', function() {
                                toggleSetting('enableKittenUpgrades');
                            });
                        }
                        
                        // Heavenly upgrades toggle
                        let heavenlyToggle = settingsDiv.querySelector('#toggle-heavenly-upgrades');
                        if (heavenlyToggle) {
                            heavenlyToggle.addEventListener('click', function() {
                                toggleSetting('enableHeavenlyUpgrades');
                            });
                        }
                        
                        // Javascript Minigame toggle
                        let jsMiniGameToggle = settingsDiv.querySelector('#toggle-js-minigame');
                        if (jsMiniGameToggle) {
                            jsMiniGameToggle.addEventListener('click', function() {
                                toggleSetting('enableJSMiniGame');
                            });
                        }
                        
                        // Cookie Age toggle
                        let cookieAgeToggle = settingsDiv.querySelector('#toggle-cookie-age');
                        if (cookieAgeToggle) {
                            cookieAgeToggle.addEventListener('click', function() {
                                toggleSetting('enableCookieAge');
                            });
                        }
                        
                        // Update buttons to reflect current settings
                        updateMenuButtons();
                    }, 10);
                    
                    // Add CpS display unit toggle button after Check Mod Data button if upgrade is owned
                    if (Game.Has('Cookie calculations')) {
                        let checkModDataListing = menuContainer.querySelector('a[onclick*="CheckModData"]')?.closest('.listing');
                        if (checkModDataListing && !menuContainer.querySelector('#toggle-cps-display-unit')) {
                            let cpsDisplayListing = document.createElement('div');
                            cpsDisplayListing.className = 'listing';
                            var units = ['seconds', 'minutes', 'hours', 'days'];
                            var unitLabels = { 'seconds': 'Seconds', 'minutes': 'Minutes', 'hours': 'Hours', 'days': 'Days' };
                            var currentUnit = modSettings.cpsDisplayUnit || 'seconds';
                            var currentIndex = units.indexOf(currentUnit);
                            var nextUnit = units[(currentIndex + 1) % units.length];
                            cpsDisplayListing.innerHTML = '<a class="option smallFancyButton" id="toggle-cps-display-unit" ' + Game.clickStr + '="window.JNE.toggleCpsDisplayUnit(); PlaySound(\'snd/tick.mp3\');">CpS display: <b>' + unitLabels[currentUnit] + '</b></a><label>(Toggles between seconds, minutes, and hours)</label>';
                            checkModDataListing.parentNode.insertBefore(cpsDisplayListing, checkModDataListing.nextSibling);
                        }
                    }
                }
            }
            
            // Function to generate puzzle completion stats HTML
            function generatePuzzleCompletionStats() {
                if (!Game.JNE || !Game.JNE.enableCookieAge || !window.CookieAge) {
                    return '';
                }
                
                try {
                    // Check if Cookie Age data is properly initialized
                    if (!window.CookieAge.getPuzzleRegistry || !window.CookieAge.getTrackStatus) {
                        return '';
                    }
                    
                    var puzzleRegistry = CookieAge.getPuzzleRegistry();
                    if (!puzzleRegistry) {
                        return '';
                    }
                    
                    var trackStatus = CookieAge.getTrackStatus();
                    if (!trackStatus) {
                        return '';
                    }
                    
                    var html = '';
                    
                    // Helper function to count unlocked puzzles for a track
                    function countUnlockedPuzzles(trackType, puzzleRegistry) {
                        var trackPuzzles = getPuzzlesByType(trackType, puzzleRegistry);
                        var unlockedCount = 0;
                        for (var i = 0; i < trackPuzzles.length; i++) {
                            var puzzleId = trackPuzzles[i];
                            if (window.CookieAge && window.CookieAge.isPuzzleUnlocked && 
                                window.CookieAge.isPuzzleUnlocked(puzzleId)) {
                                unlockedCount++;
                            }
                        }
                        return unlockedCount;
                    }
                    
                    // Check if all tracks have unlocked puzzles/clues available
                    var investigateUnlockedCount = countUnlockedPuzzles('investigate', puzzleRegistry);
                    var infiltrateUnlockedCount = countUnlockedPuzzles('infiltrate', puzzleRegistry);
                    var chooseUnlockedCount = countUnlockedPuzzles('choose', puzzleRegistry);
                    var hasInvestigateContent = investigateUnlockedCount > 0;
                    var hasInfiltrateContent = infiltrateUnlockedCount > 0;
                    var hasChooseContent = chooseUnlockedCount > 0;
                    
                    // Generate stats for each track
                    ['investigate', 'infiltrate', 'choose'].forEach(function(trackType) {
                        // Skip tracks that have no unlocked content
                        var hasContent = (trackType === 'investigate' && hasInvestigateContent) ||
                                        (trackType === 'infiltrate' && hasInfiltrateContent) ||
                                        (trackType === 'choose' && hasChooseContent);
                        
                        if (!hasContent) {
                            return; // Skip this track entirely
                        }
                        
                        var track = trackStatus[trackType];
                        var trackPuzzles = getPuzzlesByType(trackType, puzzleRegistry);
                        var completedCount = track.progress || 0;
                        var totalCount = trackPuzzles.length;
                        var percentage = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;
                        
                        // Only show track title if multiple tracks have unlocked content
                        var hasMultipleTracks = (hasInvestigateContent ? 1 : 0) + (hasInfiltrateContent ? 1 : 0) + (hasChooseContent ? 1 : 0) > 1;
                        if (hasMultipleTracks) {
                            // Static track titles
                            var trackTitle = trackType === 'investigate' ? 'Investigate the Order of the Cookie' : 
                                           trackType === 'infiltrate' ? '<br>Infiltrate the Brotherhood' : 
                                           '<br>Choose Your Allegiance';
                            html += `<div class="listing"><b>${trackTitle}</b></div>`;
                        }
                        
                        // Always generate icons for unlocked puzzles/clues in this track
                        var trackIconsHTML = '';
                        
                        // Add completed puzzles for this track
                        for (var i = 0; i < completedCount; i++) {
                            var puzzleId = trackPuzzles[i];
                            var puzzle = puzzleRegistry[puzzleId];
                            if (puzzle && puzzle.mainIcon && puzzle.description) {
                                var icon = puzzle.mainIcon;
                                var iconId = 'puzzle-icon-' + trackType + '-' + puzzleId;
                                var crateClass = 'crate upgrade enabled';
                                if (!Game.prefs.crates) crateClass += ' noFrame';
                                
                                var description = puzzle.description.replace(/\\n/g, '<br>');
                                var clue = (puzzle.clue || puzzle.description).replace(/\\n/g, '<br>');
                                
                                // Process conditional text if Cookie Age is available
                                if (window.CookieAge && window.CookieAge.processConditionalText) {
                                    description = window.CookieAge.processConditionalText(description);
                                    clue = window.CookieAge.processConditionalText(clue);
                                }
                                var trackColor = trackType === 'investigate' ? '#4ecdc4' : trackType === 'infiltrate' ? '#ff6b6b' : '#9b59b6';
                                var trackLabel = trackType === 'investigate' ? 'Investigate' : trackType === 'infiltrate' ? 'Infiltrate' : 'Choose';
                                
                                // Create dynamic tooltip function that checks for Shift key
                                var tooltipFunction = function(puzzleIcon, puzzleName, puzzleDescription, puzzleClue) {
                                    return function() {
                                        // Check if Shift key is currently pressed
                                        var showClue = Game.keys && (Game.keys[16] || Game.keys.shiftKey);
                                        var displayText = showClue ? puzzleClue : puzzleDescription;
                                        var hintText = showClue ? '' : '<div style="font-size:60%;color:rgba(255,255,255,0.4);margin-top:4px;text-align:center;font-weight:bold;"><br>(Hold Shift to view original clue)</div>';
                                        
                                        return `<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,rgba(50,40,40,1) 0%,rgba(50,40,40,0) 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position: -${puzzleIcon[0] * 48}px -${puzzleIcon[1] * 48}px; background-image: url('${puzzleIcon[2]}');"></div><div class="name">${puzzleName}</div><div class="tag" style="background-color:#ff6b6b;">Puzzle</div><div class="tag" style="background-color:#fff;">Solved</div><div class="line"></div><div class="description">${displayText}</div>${hintText}</div>`;
                                    };
                                }(icon, puzzle.name, description, clue);
                                
                                trackIconsHTML += `<div class="${crateClass}" style="background-position: -${icon[0] * 48}px -${icon[1] * 48}px; background-image: url('${icon[2]}');" id="${iconId}"></div>`;
                                
                                // Store tooltip function for later attachment
                                if (!window.CookieAge) window.CookieAge = {};
                                if (!window.CookieAge.puzzleTooltips) window.CookieAge.puzzleTooltips = {};
                                window.CookieAge.puzzleTooltips[iconId] = tooltipFunction;
                            }
                        }
                        
                        // Add next puzzle in locked state (only if dependencies are met)
                        if (completedCount < totalCount) {
                            var nextPuzzleId = trackPuzzles[completedCount];
                            var nextPuzzle = puzzleRegistry[nextPuzzleId];
                            // Check if puzzle is actually unlocked (dependencies met)
                            var isUnlocked = window.CookieAge && window.CookieAge.isPuzzleUnlocked ? 
                                           window.CookieAge.isPuzzleUnlocked(nextPuzzleId) : false;
                            if (nextPuzzle && isUnlocked) {
                                var iconId = 'puzzle-icon-next-' + trackType + '-' + nextPuzzleId;
                                var crateClass = 'crate upgrade';
                                if (!Game.prefs.crates) crateClass += ' noFrame';
                                
                                var clue = nextPuzzle.clue || nextPuzzle.description;
                                
                                // Process conditional text if Cookie Age is available
                                if (window.CookieAge && window.CookieAge.processConditionalText) {
                                    clue = window.CookieAge.processConditionalText(clue);
                                }
                                var trackColor = trackType === 'investigate' ? '#4ecdc4' : trackType === 'infiltrate' ? '#ff6b6b' : '#9b59b6';
                                var trackLabel = trackType === 'investigate' ? 'Investigate' : trackType === 'infiltrate' ? 'Infiltrate' : 'Choose';
                                
                                var tooltipHTML = `<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,rgba(50,40,40,1) 0%,rgba(50,40,40,0) 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position: -${7 * 48}px -${17 * 48}px; background-image: url('${getSpriteSheet('custom')}');"></div><div class="name">Next Puzzle</div><div class="tag" style="background-color:#ff6b6b;">Puzzle</div><div class="tag" style="background-color:#fff;">Unsolved</div><div class="line"></div><div class="description">${clue}</div></div>`;
                                
                                trackIconsHTML += `<div class="${crateClass}" style="background-position: -${7 * 48}px -${17 * 48}px; background-image: url('${getSpriteSheet('custom')}');" id="${iconId}" ${Game.getTooltip(tooltipHTML, 'middle', true)}></div>`;
                            }
                        }
                        
                        // Add track icons if any exist
                        if (trackIconsHTML) {
                            html += `<div class="listing crateBox">${trackIconsHTML}</div>`;
                        }
                    });
                    
                    return html;
                } catch (error) {
                    console.error('[Just Natural Expansion] Error generating puzzle completion stats:', error);
                    return '';
                }
            }
            
            // Helper function to get puzzles by type
            function getPuzzlesByType(type, registry) {
                var puzzles = [];
                for (var id in registry) {
                    if (registry[id].type === type) {
                        puzzles.push(id);
                    }
                }
                // Sort by trackOrder to maintain proper puzzle sequence
                return puzzles.sort(function(a, b) {
                    var orderA = registry[a].trackOrder || 0;
                    var orderB = registry[b].trackOrder || 0;
                    return orderA - orderB;
                });
            }
            
            // Handle stats menu injection
            if (Game.onMenu === 'stats') {
                let menuContainer = document.getElementById('menu');
                
                // Helper function to calculate and format annualized returns
                function getAnnualizedReturnsText() {
                    if (!Game.Has('Annualized returns') || !Game.cookiesPs || Game.cookiesPs <= 0) {
                        return '';
                    }
                    var secondsOfProduction = Game.cookies / Game.cookiesPs;
                    var yearsOfProduction = secondsOfProduction / (365.25 * 24 * 60 * 60);
                    
                    if (yearsOfProduction >= 1) {
                        return `<b>Cookie Bank:</b> ${Beautify(yearsOfProduction, 2)} years of CpS`;
                    } else if (yearsOfProduction >= 0.01) {
                        return `<b>Cookie Bank:</b> ${Beautify(yearsOfProduction, 4)} years of CpS`;
                    }
                    
                    var daysOfProduction = secondsOfProduction / (24 * 60 * 60);
                    if (daysOfProduction >= 1) {
                        return `<b>Cookie Bank:</b> ${Beautify(daysOfProduction, 2)} days of CpS`;
                    }
                    
                    return `<b>Cookie Bank:</b> ${Beautify(secondsOfProduction / (60 * 60), 2)} hours of CpS`;
                }
                
                if (menuContainer && !document.getElementById('mod-stats-section')) {
                    
                    // Helper function to get current running totals (saved lifetime + current run)
                    function getCurrentRunningTotal(savedLifetime, currentGameValue) {
                        return (savedLifetime || 0) + (currentGameValue || 0);
                    }
                    
                    // Helper function to format numbers and only show non-zero values
                    function formatLifetimeStat(value, label, showZero = false) {
                        if (value > 0 || (showZero && value >= 0)) {
                            // Special formatting for stock market profit
                            if (label.includes('stock market profit')) {
                                return `<div class="listing"><b>${label}:</b> $${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>`;
                            }
                            return `<div class="listing"><b>${label}:</b> ${value.toLocaleString()}</div>`;
                        }
                        return '';
                    }
                    
                    // Create our mod stats section
                    let modStatsDiv = document.createElement('div');
                    modStatsDiv.id = 'mod-stats-section';
                    modStatsDiv.className = 'subsection';
                    
                    // Build lifetime stats HTML with current running totals
                    let lifetimeStatsHTML = '';
                    
                    
                    
                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeReindeer(), 
                        'Reindeer clicked'
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeStockMarketAssets(), 
                        'Lifetime stock market profit'
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeShinyWrinklers(), 
                        'Shiny wrinklers burst'
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeWrathCookies(), 
                        'Wrath cookies clicked'
                    );

                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeCookieClicks(), 
                        'Cookie clicks'
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        getLifetimeWrinklers(), 
                        'Wrinklers burst',
                        true
                    );
                    // Format cookie fish with session and lifetime counts
                    var currentSessionFish = (Game.JNE && Game.JNE.cookieFishCaught) ? Game.JNE.cookieFishCaught : 0;
                    var lifetimeFish = lifetimeData.cookieFishCaught || 0;
                    var totalFish = currentSessionFish + lifetimeFish;
                    if (totalFish > 0) {
                        var fishDisplayValue = lifetimeFish > 0 
                            ? `${currentSessionFish} (all time: ${totalFish})`
                            : currentSessionFish.toString();
                        lifetimeStatsHTML += `<div class="listing"><b>Cookie fish caught:</b> ${fishDisplayValue}</div>`;
                    }
                    // Format bingo jackpot wins with session and lifetime counts
                    var currentSessionJackpots = (Game.JNE && Game.JNE.bingoJackpotWins) ? Game.JNE.bingoJackpotWins : 0;
                    var lifetimeJackpots = lifetimeData.bingoJackpotWins || 0;
                    var totalJackpots = currentSessionJackpots + lifetimeJackpots;
                    if (totalJackpots > 0) {
                        var jackpotDisplayValue = lifetimeJackpots > 0 
                            ? `${currentSessionJackpots} (all time: ${totalJackpots})`
                            : currentSessionJackpots.toString();
                        lifetimeStatsHTML += `<div class="listing"><b>Bingo center slot jackpots:</b> ${jackpotDisplayValue}</div>`;
                    }
                    lifetimeStatsHTML += formatLifetimeStat(
                        modTracking.templeSwapsTotal || 0, 
                        'Gods swapped (this ascension)',
                        true
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        modTracking.soilChangesTotal || 0, 
                        'Soil changes (this ascension)',
                        true
                    );
                    lifetimeStatsHTML += formatLifetimeStat(
                        getCurrentRunningTotal(lifetimeData.pledges, Game.pledges) + getCurrentRunningTotal(lifetimeData.elderCovenantToggles, 0), 
                        'Grandmatriarchs quashed'
                    );
                    
                    // Add garden sacrifice timer if active
                    if (lifetimeData.lastGardenSacrificeTime) {
                        var currentTime = Date.now();
                        var timeElapsed = currentTime - lifetimeData.lastGardenSacrificeTime;
                        var timeLimit = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
                        var timeRemaining = timeLimit - timeElapsed;
                        
                        if (timeRemaining > 0) {
                            var days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
                            var hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                            var minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                            
                            lifetimeStatsHTML += `<div class="listing"><b>Garden sacrifice timer:</b> ${days}d ${hours}h ${minutes}m remaining</div>`;
                        }
                    }
                    
                    lifetimeStatsHTML += formatLifetimeStat(
                        getCurrentRunningTotal(lifetimeData.gardenSacrifices, 
                            Game.Objects['Farm'] && Game.Objects['Farm'].minigame ? Game.Objects['Farm'].minigame.convertTimes : 0), 
                        'Garden sacrifices'
                    );
                    
                    // Add Annualized returns stat if upgrade is purchased
                    var annualizedReturnsText = getAnnualizedReturnsText();
                    if (annualizedReturnsText) {
                        lifetimeStatsHTML += `<div class="listing" id="annualized-returns-stat">${annualizedReturnsText}</div>`;
                    }
                    
                    // Calculate actual mod achievement and upgrade counts
                    var modAchievementsUnlocked = 0;
                    var totalModAchievements = 0;
                    var modUpgradesPurchased = 0;
                    var totalModUpgrades = 0;
                    
                    // Count mod achievements (excluding shadow achievements)
                    if (modAchievementNames) {
                        modAchievementNames.forEach(name => {
                            if (Game.Achievements[name]) {
                                if (Game.Achievements[name].pool !== 'shadow') {
                                    totalModAchievements++;
                                    if (Game.Achievements[name].won) {
                                        modAchievementsUnlocked++;
                                    }
                                }
                            }
                        });
                    }
                    
                    // Count mod upgrades by checking all upgrades for mod source text
                    if (Game.Upgrades) {
                        for (var upgradeName in Game.Upgrades) {
                            var upgrade = Game.Upgrades[upgradeName];
                            if (upgrade && upgrade.ddesc && upgrade.ddesc.includes(modName)) {
                                totalModUpgrades++;
                                if (upgrade.bought) {
                                    modUpgradesPurchased++;
                                }
                            }
                        }
                    }
                    
                    // Calculate percentages
                    var achievementPercentage = totalModAchievements > 0 ? Math.round((modAchievementsUnlocked / totalModAchievements) * 100) : 0;
                    var upgradePercentage = totalModUpgrades > 0 ? Math.round((modUpgradesPurchased / totalModUpgrades) * 100) : 0;
                    
                    modStatsDiv.innerHTML = `
                        <div class="title">${modName} v${modVersion}</div>
                        <div id="statsMod">
                            <div class="listing"><b>Mod achievements unlocked:</b> ${modAchievementsUnlocked} / ${totalModAchievements} (${achievementPercentage}%)</div>
                            <div class="listing"><b>Mod upgrades purchased:</b> ${modUpgradesPurchased} / ${totalModUpgrades} (${upgradePercentage}%)</div>
                            ${lifetimeStatsHTML}
                        </div>
                    `;
                    
                    // Find the Special section and insert our section after it
                    let specialSection = null;
                    let generalSection = null;
                    let subsections = menuContainer.querySelectorAll('.subsection');
                    
                    for (let i = 0; i < subsections.length; i++) {
                        let subsection = subsections[i];
                        let title = subsection.querySelector('.title');
                        if (title) {
                            if (title.textContent.includes('Special')) {
                                specialSection = subsection;
                            } else if (title.textContent.includes('General')) {
                                generalSection = subsection;
                            }
                        }
                    }
                    
                    if (specialSection) {

                        specialSection.parentNode.insertBefore(modStatsDiv, specialSection.nextSibling);
                    } else if (generalSection) {

                        generalSection.parentNode.insertBefore(modStatsDiv, generalSection.nextSibling);
                    } else {

                        menuContainer.appendChild(modStatsDiv);
                    }
                    
                    // Add puzzle completion stats section if Cookie Age mystery minigame is enabled
                    if (Game.JNE && Game.JNE.enableCookieAge) {
                        var puzzleStatsHTML = generatePuzzleCompletionStats();
                        // Always show the puzzle section if Cookie Age is enabled, even if no puzzles completed yet
                        if (puzzleStatsHTML || (window.CookieAge && window.CookieAge.getPuzzleRegistry && window.CookieAge.getPuzzleStatus)) {
                            // Create separate puzzle section
                            let puzzleStatsDiv = document.createElement('div');
                            puzzleStatsDiv.id = 'mod-puzzle-stats-section';
                            puzzleStatsDiv.className = 'subsection';
                            
                            puzzleStatsDiv.innerHTML = `
                                <div class="title">Mysteries of the Cookie Age</div>
                                <div id="statsPuzzles">
                                    ${puzzleStatsHTML}
                                </div>
                            `;
                            
                            // Insert after our main mod stats section
                            modStatsDiv.parentNode.insertBefore(puzzleStatsDiv, modStatsDiv.nextSibling);
                            
                            // Create hint purchase controller AFTER inserting into DOM
                            // Both button and tooltip header use icon at [29, 14]
                            var hintIconX = 29;
                            var hintIconY = 14;
                            var hintIconId = 'hintPurchaseController';
                            
                            // Create tooltip function - getHintTooltipContent now returns fully wrapped HTML with icon
                            if (!window.CookieAge) window.CookieAge = {};
                            window.CookieAge.hintRefillTooltip = function() {
                                try {
                                    if (window.CookieAge && typeof window.CookieAge.getHintTooltipContent === 'function') {
                                        return window.CookieAge.getHintTooltipContent();
                                    } else {
                                        return '<div style="padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate"><div class="name">Puzzle Hints</div><div class="description">System not initialized</div></div>';
                                    }
                                } catch (e) {
                                    console.error('Error in hint tooltip:', e);
                                    return '<div style="padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate"><div class="name">Puzzle Hints</div><div class="description">Error: ' + (e.message || 'Unknown error') + '</div></div>';
                                }
                            };
                            
                            // Build hint controller div
                            var statsPuzzlesDiv = puzzleStatsDiv.querySelector('#statsPuzzles');
                            if (statsPuzzlesDiv) {
                                var hintControllerDiv = document.createElement('div');
                                hintControllerDiv.style.cssText = 'text-align:center;width:100%;margin:20px 0 0 0;padding:0;';
                                hintControllerDiv.id = 'hintControllerWrapper';
                                
                                // Build the HTML directly - compact, centered button
                                var hintIconHTML = '<div id="' + hintIconId + '" style="display:inline-flex;background:rgba(218,165,32,0.15);border:2px double rgba(255,215,0,0.4);border-radius:4px;box-shadow:0px 0px 8px rgba(255,215,0,0.2),inset 0px 1px 2px rgba(255,255,255,0.1),inset 0px -1px 2px rgba(0,0,0,0.2);padding:4px 18px 4px 8px;height:32px;box-sizing:border-box;align-items:center;justify-content:center;gap:6px;margin-left:20px;cursor:pointer !important;overflow:visible !important;">' +
                                    '<span ' +
                                    'style="display:inline-block !important;width:32px !important;height:32px !important;overflow:visible !important;vertical-align:middle !important;line-height:0 !important;font-size:0 !important;margin:0 !important;padding:0 !important;position:relative !important;top:-8px !important;left:-10px !important;transition:transform 0.1s !important;flex-shrink:0 !important;"><div style="width:48px !important;height:48px !important;background-image:url(img/icons.png) !important;background-position:-' + (hintIconX * 48) + 'px -' + (hintIconY * 48) + 'px !important;background-size:auto !important;background-repeat:no-repeat !important;transform:scale(0.66) !important;transform-origin:center center !important;"></div></span>' +
                                    '<span style="display:inline-block !important;' +
                                    'font-size:12px !important;line-height:12px !important;' +
                                    'font-weight:bold !important;font-weight:700 !important;' +
                                    'color:#ccc !important;margin:0 !important;padding:0 !important;' +
                                    'text-shadow:0px 1px 0px #000,0px 0px 6px #000,0px 0px 3px #000 !important;white-space:nowrap !important;' +
                                    'font-family:inherit !important;">' +
                                    '<strong style="font-weight:bold !important;font-weight:700 !important;">Get a Hint</strong></span></div>';
                                
                                hintControllerDiv.innerHTML = hintIconHTML;
                                statsPuzzlesDiv.appendChild(hintControllerDiv);
                            }
                            
                            var hintButton = document.getElementById(hintIconId);
                            
                            // Add hover effect
                            if (hintButton) {
                                var iconSpan = hintButton.querySelector('span');
                                var innerIcon = iconSpan ? iconSpan.querySelector('div') : null;
                                if (innerIcon) {
                                    hintButton.onmouseover = function() {
                                        if (innerIcon) innerIcon.style.transform = 'scale(1)';
                                    };
                                    hintButton.onmouseout = function() {
                                        if (innerIcon) innerIcon.style.transform = 'scale(0.66)';
                                    };
                                }
                            }
                            
                            // Set up tooltip and click on entire button
                            if (hintButton && Game.attachTooltip && typeof window.CookieAge.hintRefillTooltip === 'function') {
                                Game.attachTooltip(hintButton, window.CookieAge.hintRefillTooltip);
                            }
                            
                            if (window.CookieAge) {
                                var handleHintClick = function() {
                                    if (window.CookieAge && typeof window.CookieAge.showHintTrackSelection === 'function') {
                                        window.CookieAge.showHintTrackSelection();
                                    }
                                };
                                if (hintButton) {
                                    hintButton.onclick = handleHintClick;
                                }
                            }
                            
                            // Attach dynamic tooltips to completed puzzle icons (checking for Shift key)
                            if (window.CookieAge && window.CookieAge.puzzleTooltips && Game.attachTooltip) {
                                // Set up global Shift key handler to update tooltips (only once)
                                if (!window.CookieAge._shiftTooltipHandlerAdded) {
                                    window.CookieAge._shiftTooltipHandlerAdded = true;
                                    var updatePuzzleTooltipOnShift = function(e) {
                                        // Only update if Shift key and tooltip is showing a puzzle
                                        if ((e.keyCode === 16 || e.key === 'Shift') && Game.tooltip && Game.tooltip.lock) {
                                            var tooltipElement = Game.tooltip.lock;
                                            if (typeof tooltipElement === 'string') {
                                                var element = document.getElementById(tooltipElement);
                                                if (element && window.CookieAge.puzzleTooltips && window.CookieAge.puzzleTooltips[tooltipElement]) {
                                                    Game.tooltip.dynamic = 1;
                                                    setTimeout(function() {
                                                        if (Game.tooltip && Game.tooltip.draw) {
                                                            Game.tooltip.draw();
                                                        }
                                                    }, 10);
                                                }
                                            } else if (tooltipElement && tooltipElement.id && window.CookieAge.puzzleTooltips && window.CookieAge.puzzleTooltips[tooltipElement.id]) {
                                                Game.tooltip.dynamic = 1;
                                                setTimeout(function() {
                                                    if (Game.tooltip && Game.tooltip.draw) {
                                                        Game.tooltip.draw();
                                                    }
                                                }, 10);
                                            }
                                        }
                                    };
                                    if (typeof document.addEventListener === 'function') {
                                        document.addEventListener('keydown', updatePuzzleTooltipOnShift);
                                        document.addEventListener('keyup', updatePuzzleTooltipOnShift);
                                    }
                                }
                                
                                // Attach tooltips to elements
                                for (var tooltipIconId in window.CookieAge.puzzleTooltips) {
                                    var tooltipElement = document.getElementById(tooltipIconId);
                                    if (tooltipElement && window.CookieAge.puzzleTooltips[tooltipIconId]) {
                                        Game.attachTooltip(tooltipElement, window.CookieAge.puzzleTooltips[tooltipIconId]);
                                        // Set dynamic flag on hover so tooltip can update
                                        var originalOnMouseOver = tooltipElement.onmouseover;
                                        tooltipElement.onmouseover = function(original, el) {
                                            return function(e) {
                                                if (original) original.call(this, e);
                                                if (Game.tooltip && Game.tooltip.lock === el.id) {
                                                    Game.tooltip.dynamic = 1;
                                                }
                                            };
                                        }(originalOnMouseOver, tooltipElement);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Update Annualized returns stat if upgrade is purchased and section exists
                    var annualizedReturnsElement = document.getElementById('annualized-returns-stat');
                    if (annualizedReturnsElement) {
                        var annualizedReturnsText = getAnnualizedReturnsText();
                        if (annualizedReturnsText) {
                            annualizedReturnsElement.innerHTML = annualizedReturnsText;
                        }
                    }

                }
            }
            
            return result;
        };
        return true;
    }
    
    // ===== CENTRALIZED HOOK REGISTRATION SYSTEM =====
    // This system only handles hook registration - no content changes
    
    // Centralized hook registration function
    function registerHook(hookType, callback, description) {
        if (!Game.registerHook) {
            console.warn('Game.registerHook not available for:', description);
            return false;
        }
        
        try {
            Game.registerHook(hookType, callback);
            return true;
        } catch (e) {
            console.error('Failed to register hook:', hookType, '-', description, e);
            return false;
        }
    }
    
    function setTerminalMinigameSave(serializedState) {
        try {
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.terminalSavedData = (typeof serializedState === 'string') ? serializedState : '';
            pendingTerminalMinigameSave = Game.JNE.terminalSavedData;
            
            if (window.TerminalMinigame && typeof window.TerminalMinigame.applySaveData === 'function') {
                window.TerminalMinigame.applySaveData(Game.JNE.terminalSavedData);
            }
        } catch (e) {
            errorLog('Failed to set Terminal minigame state:', e && e.message ? e.message : e);
        }
    }
    
    function isTerminalMinigameOpen() {
        if (typeof Game !== 'undefined' && Game.Objects && Game.Objects['Javascript console']) {
            var jsConsole = Game.Objects['Javascript console'];
            if (jsConsole && typeof jsConsole.onMinigame !== 'undefined') {
                terminalMinigameOpen = !!jsConsole.onMinigame;
            }
        }
        return !!terminalMinigameOpen;
    }
    
    function showTerminalMinigameClosePrompt() {
        if (typeof Game === 'undefined' || typeof Game.Prompt !== 'function') {
            return;
        }
        var iconMarkup = (typeof tinyIcon === 'function') ? tinyIcon(modIcon) : '';
        var promptHtml = '<id TerminalCloseWarning><h3>Close Terminal First</h3><div class="block">' +
            iconMarkup + (iconMarkup ? '<div class="line"></div>' : '') +
            'Please close the Javascript Console minigame before disabling it.</div>';
        Game.Prompt(promptHtml, [['OK', 'Game.ClosePrompt();', 'float:right']]);
    }
    
    function syncTerminalMinigameButtonWithSetting() {
        if (terminalMinigameSyncPending) return;
        if (typeof Game === 'undefined' || !Game.Objects || !Game.Objects['Javascript console']) return;
        
        var jsConsole = Game.Objects['Javascript console'];
        if (!jsConsole) return;
        
        var shouldShow = !!enableJSMiniGame;
        var currentUrl = jsConsole.minigameUrl || '';
        // Check if URL matches (accounting for cache-busting parameters)
        var urlMatches = currentUrl.indexOf(terminalMinigameScriptUrl) === 0;
        
        if (shouldShow === urlMatches) return;
        
        terminalMinigameSyncPending = true;
        
        if (shouldShow) {
            jsConsole.minigameName = 'Terminal';
            // Add cache-busting parameter to prevent caching issues
            jsConsole.minigameUrl = terminalMinigameScriptUrl + '?v=' + Date.now();
            jsConsole.minigameIcon = [19, 11, getSpriteSheet('custom')];
            jsConsole.minigameLoading = false;
            
            var scriptAlreadyLoaded = jsConsole.minigame && jsConsole.minigameLoaded;
            if (!scriptAlreadyLoaded && typeof Game.LoadMinigames === 'function') {
                try {
                    Game.LoadMinigames();
                    jsConsole.minigameLoading = false;
                } catch (e) {
                    errorLog('Error loading minigames:', e);
                    jsConsole.minigameLoading = false;
                    terminalMinigameSyncPending = false;
                    return;
                }
            }
            
            jsConsole.minigameLoading = false;
            
            if (typeof jsConsole.refresh === 'function') {
                try {
                    jsConsole.refresh();
                } catch (e) {
                    errorLog('Error refreshing after enabling minigame:', e);
                }
            }
            
            // Final check to ensure minigameLoading is false
            jsConsole.minigameLoading = false;
            
            terminalMinigameSyncPending = false;
        } else {
            jsConsole.minigameUrl = '';
            jsConsole.minigameName = '';
            jsConsole.minigameIcon = null;
            
            // CRITICAL: Clear minigameLoading flag when disabling minigame
            // This ensures saves work even if the minigame was never fully loaded
            jsConsole.minigameLoading = false;
            
            if (typeof jsConsole.refresh === 'function') {
                try {
                    jsConsole.refresh();
                } catch (e) {
                    errorLog('Error refreshing after disabling minigame:', e);
                }
            }
            
            terminalMinigameSyncPending = false;
        }
    }
    
    // Public API for Terminal minigame save/load (matches CookieAge pattern)
    if (!window.TerminalMinigame) {
        window.TerminalMinigame = {
            getSaveData: function() {
                return (typeof pendingTerminalMinigameSave === 'string') ? pendingTerminalMinigameSave : '';
            },
            
            applySaveData: function(saveString) {
                try {
                    if (typeof saveString !== 'string') return;
                    if (!Game.JNE) Game.JNE = {};
                    Game.JNE.terminalSavedData = saveString;
                    pendingTerminalMinigameSave = saveString;
                    
                    if (Game && Game.Objects && Game.Objects['Javascript console']) {
                        var jsConsole = Game.Objects['Javascript console'];
                        if (jsConsole.minigameLoaded && jsConsole.minigame && 
                            typeof jsConsole.minigame.load === 'function') {
                            jsConsole.minigame.load(saveString);
                        }
                    }
                } catch (e) {
                    errorLog('TerminalMinigame.applySaveData failed:', e && e.message ? e.message : e);
                }
            },
            
            writeCache: function(saveString) {
                if (typeof saveString !== 'string') saveString = '';
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.terminalSavedData = saveString;
                pendingTerminalMinigameSave = saveString;
            },
            
            requestSave: function() {
                try {
                    requestModSave(false);
                } catch (e) {
                    errorLog('TerminalMinigame.requestSave failed:', e && e.message ? e.message : e);
                }
            }
        };
    }
    
    function disableTerminalMinigame() {
        if (!Game || !Game.Objects || !Game.Objects['Javascript console']) return;
        
        var jsConsole = Game.Objects['Javascript console'];
        if (jsConsole.onMinigame && jsConsole.minigame && typeof jsConsole.minigame.close === 'function') {
            try {
                jsConsole.minigame.close();
            } catch (e) {}
        }
        jsConsole.onMinigame = 0;
        terminalMinigameOpen = false;
        
        syncTerminalMinigameButtonWithSetting();
    }
    
    function enableTerminalMinigame() {
        syncTerminalMinigameButtonWithSetting();
    }
    
    function getHeavenlyUpgradesSaveString() {
        try {
                // Use the new getSaveData function if available
                if (Game.JNE && Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.getSaveData === 'function') {
                    var saveData = Game.JNE.HeavenlyUpgrades.getSaveData();
                    // Store in the expected location for backwards compatibility
                    if (!Game.JNE.heavenlyUpgradesSavedData) Game.JNE.heavenlyUpgradesSavedData = {};
                    Game.JNE.heavenlyUpgradesSavedData = saveData;
                    return JSON.stringify(saveData);
                }
                // Fallback to old method
            if (!Game.JNE || !Game.JNE.heavenlyUpgradesSavedData) {
                return '';
            }
            return JSON.stringify(Game.JNE.heavenlyUpgradesSavedData);
        } catch (e) {
            errorLog('Failed to get Heavenly Upgrades save data:', e && e.message ? e.message : e);
            return '';
        }
    }
    
    function setHeavenlyUpgradesSave(serializedState) {
        try {
            if (!Game.JNE) Game.JNE = {};
            
            // Preserve existing data if we're not getting valid new data
            var existingData = Game.JNE.heavenlyUpgradesSavedData;
            
            if (typeof serializedState === 'string' && serializedState !== '') {
                try {
                    var newData = JSON.parse(serializedState);
                    // Only replace if we got valid new data
                    if (newData && typeof newData === 'object') {
                        Game.JNE.heavenlyUpgradesSavedData = newData;
                    } else if (existingData) {
                        // Keep existing data if new data is invalid
                                            } else {
                        Game.JNE.heavenlyUpgradesSavedData = {};
                    }
                } catch (e) {
                    errorLog('Failed to parse Heavenly Upgrades save data:', e && e.message ? e.message : e);
                    // Keep existing data if parsing failed
                    if (existingData) {
                                            } else {
                        Game.JNE.heavenlyUpgradesSavedData = {};
                    }
                }
            } else if (serializedState === '') {
                // Empty string means clear the data
                Game.JNE.heavenlyUpgradesSavedData = {};
            } else if (existingData) {
                // Keep existing data for any other case
                            } else {
                Game.JNE.heavenlyUpgradesSavedData = {};
            }
        } catch (e) {
            errorLog('Failed to set Heavenly Upgrades save data:', e && e.message ? e.message : e);
        }
    }
    
    function getTerminalMinigameSaveString() {
        try {
            if (window.TerminalMinigame && typeof window.TerminalMinigame.getSaveData === 'function') {
                return window.TerminalMinigame.getSaveData();
            }
        } catch (e) {
            errorLog('Failed to get Terminal save data:', e && e.message ? e.message : e);
        }
        return pendingTerminalMinigameSave || '';
    }
    
    // Lump discrepancy patch - keeps sugar lump timers consistent across load/harvest/click
    //Borrowed logic from Spiced Cookies mod, which is no longer being updated or maintained.
    function applyLumpDiscrepancyPatch() {
        if (!Game || typeof Game !== 'object') return false;

        //"trick" CYOL into thinking the patch is applied from Spice Cookies. 
        if (!window.Spice) window.Spice = {};
        if (!window.Spice.settings) window.Spice.settings = {};
        window.Spice.settings.patchDiscrepancy = true;

        if (Game.loadLumps && !Game.loadLumps._lumpPatchApplied) {
            var originalLoadLumps = Game.loadLumps;
            Game.loadLumps = function() {
                var hadLumpT = (typeof Game.lumpT !== 'undefined');
                var savedLumpT = Game.lumpT;
                var result = originalLoadLumps.apply(this, arguments);
                if (hadLumpT) Game.lumpT = savedLumpT;
                else if (typeof Game.lumpT !== 'undefined') delete Game.lumpT;
                return result;
            };
            Game.loadLumps._lumpPatchApplied = true;
        }

        if (Game.harvestLumps && !Game.harvestLumps._lumpPatchApplied) {
            var originalHarvestLumps = Game.harvestLumps;
            Game.harvestLumps = function() {
                var oldLumpT = Game.lumpT;
                var result = originalHarvestLumps.apply(this, arguments);
                if (Game.lumpOverripeAge && Game.lumpOverripeAge > 0 && typeof oldLumpT === 'number') {
                    var harvestedAmount = Math.floor((Date.now() - oldLumpT) / Game.lumpOverripeAge);
                    Game.lumpT = (harvestedAmount > 0)
                        ? oldLumpT + (Game.lumpOverripeAge * harvestedAmount)
                        : oldLumpT;
                } else if (typeof Game.lumpT === 'undefined') {
                    Game.lumpT = Date.now();
                }
                return result;
            };
            Game.harvestLumps._lumpPatchApplied = true;
        }

        if (Game.clickLump && !Game.clickLump._lumpPatchApplied) {
            var originalClickLump = Game.clickLump;
            Game.clickLump = function() {
                var oldLumps = Game.lumps;
                var result = originalClickLump.apply(this, arguments);

                return result;
            };
            Game.clickLump._lumpPatchApplied = true;
        }
        
        return true;
    }
    
    //Thanks to fillexs for original code
    function applyGodSwapPatch() {
        if (!Game || typeof Game !== 'object') return false;
        if (!Game.Objects || !Game.Objects['Temple']) return false;
        
        var temple = Game.Objects['Temple'];
        if (!temple.minigame || !temple.minigame.slotGod || temple.minigame.slotGod._godSwapPatchApplied) {
            return false;
        }
        
        var pantheon = temple.minigame;
        // Store on the object to survive CCSE eval wrapping
        pantheon._originalSlotGodForSwapPatch = pantheon.slotGod;
        
        pantheon.slotGod = function(god, slot) {
            var result = this._originalSlotGodForSwapPatch.apply(this, arguments);
            if (this.slot && Array.isArray(this.slot) && this.slot.length >= 3) {
                this.slot = [this.slot[0], this.slot[1], this.slot[2]];
            }
            
            return result;
        };
        pantheon.slotGod._godSwapPatchApplied = true;
        
        return true;
    }
    
    // Register all hooks in one place
    function registerAllHooks() {
        registerHook('logic', function() {
            if (!Game || !Game.Objects || !Game.Objects['Javascript console']) return;
            
            var jsConsole = Game.Objects['Javascript console'];
            
            if (jsConsole.minigame && jsConsole.minigameLoaded) {
                terminalMinigameLoadedOnce = true;
            }
            
            var isOpen = !!jsConsole.onMinigame;
            if (isOpen !== terminalMinigameOpen) {
                terminalMinigameOpen = isOpen;
            }
            
            if (!enableJSMiniGame && isOpen && jsConsole.minigame && typeof jsConsole.minigame.close === 'function') {
                try {
                    jsConsole.minigame.close();
                } catch (e) {}
                jsConsole.onMinigame = 0;
                terminalMinigameOpen = false;
            }
            
            var shouldShow = !!enableJSMiniGame;
            var currentUrl = jsConsole.minigameUrl || '';
            // Check if URL matches (accounting for cache-busting parameters)
            var urlMatches = currentUrl.indexOf(terminalMinigameScriptUrl) === 0;
            
            if (shouldShow !== urlMatches && !terminalMinigameSyncPending) {
                syncTerminalMinigameButtonWithSetting();
            }
        }, 'Monitor terminal minigame state');
        
        // Seasonal reindeer tracking - award immediately on pop
        registerHook('logic', function() {
            if (Game.reindeerClicked > (modTracking.lastSeasonalReindeerCheck || 0)) {
                var season = getCurrentSeason();
                if (season && season !== 'christmas') {
                    var achName = mapSeasonToReindeerAchievement(season);
                    if (achName && Game.Achievements[achName] && !Game.Achievements[achName].won) {
                        markAchievementWon(achName);
                    }
                    // Maintain compatibility with any UI relying on popped flags
                    if (seasonalReindeerData[season]) {
                        seasonalReindeerData[season].popped = true;
                    }
                }
                modTracking.lastSeasonalReindeerCheck = Game.reindeerClicked;
            }
        }, 'Track seasonal reindeer pops');
        
        // Garden harvest all hook for duketater achievement
        function hookGardenHarvestAll() {
            if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
                var M = Game.Objects['Farm'].minigame;
                
                // Hook into the harvest all function if not already hooked
                if (M.harvestAll && typeof M.harvestAll === 'function' && !M._harvestAllHooked) {
                    var originalHarvestAll = M.harvestAll;
                    M.harvestAll = function() {
                        // Check for duketater plants BEFORE harvesting them
                        var duketaterCount = 0;
                        
                        if (M.plot && M.plantsById) {
                            // Count mature duketaters before harvesting
                            for (var y = 0; y < M.plot.length; y++) {
                                for (var x = 0; x < M.plot[y].length; x++) {
                                    var plotData = M.plot[y][x];
                                    if (plotData && plotData[0] > 0) {
                                        var plantId = plotData[0] - 1; // Plant IDs are 1-indexed
                                        var plant = M.plantsById[plantId];
                                        var plantAge = plotData[1];
                                        
                                        if (plant && plant.name.toLowerCase() === 'duketater' && plantAge >= plant.mature) {
                                            duketaterCount++;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Now call the original function to harvest the plants
                        var result = originalHarvestAll.apply(this, arguments);
                        
                        // Check if achievement should be unlocked
                        if (duketaterCount >= 12) {
                            var achievementName = 'Duketater Salad';
                            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                                markAchievementWon(achievementName);
                            }
                        }
                        
                        return result;
                    };
                    M._harvestAllHooked = true;
                }
            }
        }
        
        // Try to hook immediately if garden is already available
        hookGardenHarvestAll();
        
        // Also try to hook when the game loads (in case garden loads later)
        registerHook('check', function() {
            if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame && 
                Game.Objects['Farm'].minigame.plot && 
                Game.Objects['Farm'].minigame.plantsById && 
                !Game.Objects['Farm'].minigame._harvestAllHooked) {
                hookGardenHarvestAll();
            }
        }, 'Check if garden is ready for harvest all hook');
        
        // Golden cookie frequency modification - hook directly into the existing system
        registerHook('check', function() {
            // Hook into the vanilla game's getTimeMod function when it becomes available
            if (Game.shimmerTypes && Game.shimmerTypes['golden'] && Game.shimmerTypes['golden'].getTimeMod && !Game.shimmerTypes['golden']._goldenCookieHooked) {
                var originalGetTimeMod = Game.shimmerTypes['golden'].getTimeMod;
                
                // Override the getTimeMod function for spawn frequency
                Game.shimmerTypes['golden'].getTimeMod = function(me, m) {
                    // Apply our custom modifiers BEFORE calling the original function
                    var modifiedM = m;
                    if (Game.Has('Order of the Golden Crumb')) {
                        modifiedM *= 0.95; // 5% more frequent
                    }
                    
                    if (Game.Has('Order of the Impossible Batch')) {
                        modifiedM *= 0.95; // 5% more frequent
                    }
                    
                    if (Game.Has('Order of the Eternal Cookie')) {
                        modifiedM *= 0.95; // 5% more frequent
                    }
                    
                    // Positive feedback loop buff - 10% more frequent golden cookies
                    if (Game.hasBuff('positive feedback loop')) {
                        modifiedM *= 0.9; 
                    }
                    
                    // Ensure minimum spawn time (equivalent to m > 0.05)
                    var minSpawnTime = 0.05;
                    if (modifiedM < minSpawnTime) {
                        modifiedM = minSpawnTime;
                    }
                    
                    // Call the original function with our modified m value and return the result
                    return originalGetTimeMod.call(this, me, modifiedM);
                };
                
                // Mark as hooked to prevent multiple hooks
                Game.shimmerTypes['golden']._goldenCookieHooked = true;
            }
            
            // Hook into Game.gainBuff to modify Frenzy, Click Frenzy, and Elder Frenzy buff power
            // Use a logic hook to ensure we catch it when it becomes available
            registerHook('logic', function() {
                if (Game.gainBuff && !Game._gainBuffHooked) {
                    // Store the original gainBuff function
                    var originalGainBuff = Game.gainBuff;
                    
                    // Override the gainBuff function
                    Game.gainBuff = function(type, time, arg1, arg2, arg3) {
                        // Check if this is one of our target buff types
                        if (type === 'click frenzy' || type === 'frenzy' || type === 'blood frenzy') {
                            // Apply our upgrade effect BEFORE creating the buff
                            if (Game.Has('Order of the Enchanted Whisk')) {
                                arg1 = Math.ceil(arg1 * 1.05); // 5% more powerful
                            }
                        }
                        
                        // Call original function with modified arguments
                        return originalGainBuff.call(this, type, time, arg1, arg2, arg3);
                    };
                    
                    // Mark as hooked to prevent multiple hooks
                    Game._gainBuffHooked = true;
                    

                }
            }, 'Hook into Game.gainBuff for frenzy buff modifications');
            
            // Alternative approach: Hook into buff creation system to modify frenzy buffs
            registerHook('logic', function() {
                // Check if we have active buffs and if our upgrade is owned
                if (Game.buffs && Game.Has('Order of the Enchanted Whisk')) {
                    // Look for frenzy buffs and modify their power
                    for (let buffName in Game.buffs) {
                        let buff = Game.buffs[buffName];
                        if (buff && !buff._enchantedWhiskModified) {
                            // Check if this is one of our target buff types
                            if (buffName === 'Click frenzy' || buffName === 'Frenzy' || buffName === 'Elder frenzy') {
                                // Mark as modified to prevent multiple modifications
                                buff._enchantedWhiskModified = true;
                                
                                // Modify the buff power (5% increase)
                                if (buff.multClick) {
                                    // Click frenzy - modify clicking power
                                    buff.multClick = Math.ceil(buff.multClick * 1.05);
                                }
                                if (buff.multCpS) {
                                    // Frenzy or Elder frenzy - modify CpS multiplier
                                    buff.multCpS = Math.ceil(buff.multCpS * 1.05);
                                }
                            }
                        }
                    }
                }
            }, 'Modify existing frenzy buffs for Order of the Enchanted Whisk');

        }, 'Hook into golden cookie frequency system');
        
        // Simple hook to detect when golden cookie system is available
        registerHook('check', function() {
            if (Game.shimmerTypes && Game.shimmerTypes['golden'] && Game.shimmerTypes['golden'].getTimeMod) {
                if (!Game.shimmerTypes['golden']._debugLogged) {
                    Game.shimmerTypes['golden']._debugLogged = true;
                }
            }
        }, 'Detect golden cookie system availability');

        // Set up save hook to exclude mod upgrades from permanent slots during save
        setupPermanentSlotSaveHook();
        
        // Wrinkler tracking - detect when wrinklers are popped
        registerHook('logic', function() {
            // Track ALL wrinkler pops and shiny wrinkler achievements
            if (Game.wrinklers) {
                for (var i in Game.wrinklers) {
                    var me = Game.wrinklers[i];
                    var prevState = modTracking.previousWrinklerStates[i];
                    
                    // Check if wrinkler was just popped (phase went from > 0 to 0)
                    if (prevState && prevState.phase > 0 && me.phase == 0) {
                        // Count ALL wrinkler pops (regardless of type)
                        sessionDeltas.wrinklersPopped++;
                        
                        // Track shiny wrinkler pops specifically
                        if (me && me.type == 1) {
                            modTracking.shinyWrinklersPopped++;
                            // Also immediately save to lifetime data since game doesn't track this
                            lifetimeData.shinyWrinklersPopped++;
                            
                        }
                        
                        // Check for golden wrinkler achievement
                        // Use the previous state's sucked value since the current state is already popped
                        var wrinklerValue = (modTracking.previousWrinklerStates[i] && modTracking.previousWrinklerStates[i].sucked) || 0;
                        // Use the higher of current CPS and raw CPS to be conservative
                        var currentCPS = Math.max(Game.cookiesPs || 0, Game.cookiesPsRaw || 0);
                        
                                    // Check for bank doubling achievement
            if (modTracking.previousWrinklerStates[i] && modTracking.previousWrinklerStates[i].bankBeforePop) {
                var bankBeforePop = modTracking.previousWrinklerStates[i].bankBeforePop;
                var bankAfterPop = Game.cookies || 0;
                
                // Check if bank sextupled (new bank >= 6 * old bank)
                if (bankAfterPop >= bankBeforePop * 6 && bankBeforePop > 0) {
                    modTracking.bankSextupledByWrinkler = true;
                    
                    // Award achievement if not already won
                    if (Game.Achievements['Wrinkler Windfall'] && !Game.Achievements['Wrinkler Windfall'].won) {
                        markAchievementWon('Wrinkler Windfall');
                    }
                }
            }
                        
                        // Calculate 6.66 years of CPS, handling extremely large numbers
                        var sixPointSixSixYearsOfCPS = 0;
                        if (currentCPS > 0) {
                            try {
                                // Use the threshold value directly (210000000 seconds = 6.66 years)
                                var thresholdValue = 210000000;
                                
                                // For extremely large numbers, use logarithmic approach to avoid overflow
                                if (currentCPS > 1e50) {
                                    // Convert to scientific notation and add the threshold
                                    var cpsExponent = Math.floor(Math.log10(currentCPS));
                                    var cpsMantissa = currentCPS / Math.pow(10, cpsExponent);
                                    
                                    // Add the threshold (210000000 seconds = 6.66 years)
                                    var thresholdExponent = Math.floor(Math.log10(thresholdValue));
                                    var totalExponent = cpsExponent + thresholdExponent;
                                    
                                    // Check if the result would be too large for JavaScript
                                    if (totalExponent > 300) {

                                        // For extremely large numbers, just add the threshold exponent
                                        sixPointSixSixYearsOfCPS = currentCPS * 10; // Approximate: 6.66 years ≈ 10x current CPS
                                    } else {
                                        // Calculate the result
                                        sixPointSixSixYearsOfCPS = cpsMantissa * Math.pow(10, totalExponent);

                                    }
                                } else {
                                    // Normal calculation for smaller numbers
                                    sixPointSixSixYearsOfCPS = currentCPS * thresholdValue;

                                }
                            } catch (e) {

                                // Fallback: use a reasonable approximation
                                sixPointSixSixYearsOfCPS = currentCPS * 10; // 6.66 years ≈ 10x current CPS
                            }
                        }
                        
                        // Award achievement if wrinkler was worth 6.66 years of CPS
                        if (wrinklerValue >= sixPointSixSixYearsOfCPS && currentCPS > 0) {
                            if (Game.Achievements['Golden wrinkler'] && !Game.Achievements['Golden wrinkler'].won) {
                                markAchievementWon('Golden wrinkler');
                            }
                        }
                    }
                    
                    // Update previous state for all wrinklers
                    if (me) {
                        modTracking.previousWrinklerStates[i] = {
                            phase: me.phase,
                            sucked: me.sucked,
                            bankBeforePop: me.phase > 0 ? (Game.cookies || 0) : undefined // Store bank value when wrinkler is active
                        };
                    }
                }
            }
        }, 'Track wrinkler pops and achievements');
        
        // Buff achievement checking - runs every tick for immediate response
        registerHook('logic', function() {
            // Check Frenzy frenzy achievement (all three frenzy buffs active)
            if (Game.Achievements['Frenzy frenzy'] && !Game.Achievements['Frenzy frenzy'].won) {
                if (Game.hasBuff('Click frenzy') && Game.hasBuff('Frenzy') && Game.hasBuff('Elder frenzy')) {
                    markAchievementWon('Frenzy frenzy');
                }
            }
            
            // Check Double Dragon Clicker achievement (Dragonflight + Click frenzy)
            if (Game.Achievements['Double Dragon Clicker'] && !Game.Achievements['Double Dragon Clicker'].won) {
                if (Game.hasBuff('Dragonflight') && Game.hasBuff('Click frenzy')) {
                    markAchievementWon('Double Dragon Clicker');
                }
            }
            
            // Check Hogwarts Graduate achievement (3 positive spell effects)
            if (Game.Achievements['Hogwarts Graduate'] && !Game.Achievements['Hogwarts Graduate'].won) {
                var positiveSpells = 0;
                if (Game.hasBuff('Haggler\'s luck')) positiveSpells++;
                if (Game.hasBuff('Magic adept')) positiveSpells++;
                if (Game.hasBuff('Crafty pixies')) positiveSpells++;
                
                if (positiveSpells >= 3) {
                    markAchievementWon('Hogwarts Graduate');
                }
            }
            
            // Check Hogwarts Dropout achievement (3 negative spell effects)
            if (Game.Achievements['Hogwarts Dropout'] && !Game.Achievements['Hogwarts Dropout'].won) {
                var negativeSpells = 0;
                if (Game.hasBuff('Haggler\'s misery')) negativeSpells++;
                if (Game.hasBuff('Magic inept')) negativeSpells++;
                if (Game.hasBuff('Nasty goblins')) negativeSpells++;
                if (Game.hasBuff('Devastation')) negativeSpells++;
                
                if (negativeSpells >= 3) {
                    markAchievementWon('Hogwarts Dropout');
                }
            }
            
            // Check Frenzy Marathon achievement (frenzy buff with 10+ minute total duration)
            if (Game.Achievements['Frenzy Marathon'] && !Game.Achievements['Frenzy Marathon'].won) {
                // Check if Frenzy is currently active
                var frenzyActive = false;
                for (var buffName in Game.buffs) {
                    var buff = Game.buffs[buffName];
                    if (buff && buff.name === 'Frenzy' && buff.time > 0) {
                        frenzyActive = true;
                        break;
                    }
                }
                
                // Initialize tracking variable if not exists
                if (typeof modTracking.frenzyStartTime === 'undefined') {
                    modTracking.frenzyStartTime = null;
                }
                
                // Handle Frenzy state transitions
                if (frenzyActive && modTracking.frenzyStartTime === null) {
                    // Frenzy just became active - start tracking
                    modTracking.frenzyStartTime = Date.now();
                } else if (!frenzyActive && modTracking.frenzyStartTime !== null) {
                    // Frenzy just became inactive - stop tracking
                    modTracking.frenzyStartTime = null;
                }
                
                // Check if we've been in Frenzy for 10+ minutes
                if (modTracking.frenzyStartTime !== null) {
                    var elapsedTime = Date.now() - modTracking.frenzyStartTime;
                    var requiredDurationMs = 600000; // 10 minutes in milliseconds
                    
                    if (elapsedTime >= requiredDurationMs) {
                        markAchievementWon('Frenzy Marathon');
                    }
                }
            }
            
            // Check Spell Slinger achievement (10 spells within 10 seconds)
            if (Game.Achievements['Spell Slinger'] && !Game.Achievements['Spell Slinger'].won) {
                var currentTime = Date.now();
                var tenSecondsAgo = currentTime - 10000; // 10 seconds in milliseconds
                
                // Remove old spell cast times (older than 10 seconds)
                modTracking.spellCastTimes = modTracking.spellCastTimes.filter(function(timestamp) {
                    return timestamp > tenSecondsAgo;
                });
                
                // Check if we have 10 or more spells in the 10-second window
                if (modTracking.spellCastTimes.length >= 10) {
                    markAchievementWon('Spell Slinger');
                }
            }
            
            // Check other buff count achievements (3, 6, 9, 12 buffs)
            var currentBuffs = Object.keys(Game.buffs).length;
            
            // Check Trifecta Combo (3 buffs)
            if (Game.Achievements['Trifecta Combo'] && !Game.Achievements['Trifecta Combo'].won && currentBuffs >= 3) {
                markAchievementWon('Trifecta Combo');
            }
            
            // Check Combo Initiate (6 buffs)
            if (Game.Achievements['Combo Initiate'] && !Game.Achievements['Combo Initiate'].won && currentBuffs >= 6) {
                markAchievementWon('Combo Initiate');
            }
            
            // Check Combo God (9 buffs)
            if (Game.Achievements['Combo God'] && !Game.Achievements['Combo God'].won && currentBuffs >= 9) {
                markAchievementWon('Combo God');
            }
            
            // Check Combo Hacker (12 buffs)
            if (Game.Achievements['Combo Hacker'] && !Game.Achievements['Combo Hacker'].won && currentBuffs >= 12) {
                markAchievementWon('Combo Hacker');
            }
        }, 'Check buff achievements in real-time');
        
        // Hook into Grimoire spell casting to track Spell Slinger 
        if (Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame) {
            var originalCastSpell = Game.Objects['Wizard tower'].minigame.castSpell;
            if (originalCastSpell) {
                Game.Objects['Wizard tower'].minigame.castSpell = function(spell, obj) {
                    // Call the original function first to get the result
                    var result = originalCastSpell.call(this, spell, obj);
                    
                    // Only track successful spell casts (when result is true)
                    if (result === true) {modTracking.spellCastTimes.push(Date.now());}
                    
                    return result;
                };
            }
        }
        
        // Hook into cookie clicking to track Click of the Titans achievement
        var originalClickCookie = Game.ClickCookie;
        if (originalClickCookie) {
            Game.ClickCookie = function(e, amount) {
                // Call the original function first
                var result = originalClickCookie.call(this, e, amount);
                
                // Check for Click of the Titans achievement (1 year of raw CPS in single click)
                if (Game.Achievements['Click of the Titans'] && !Game.Achievements['Click of the Titans'].won) {
                    var clickAmount = amount || Game.computedMouseCps;
                    var currentRawCPS = Game.cookiesPsRaw || 0;
                    var oneYearOfRawCPS = currentRawCPS * 31536000; // 1 year in seconds
                    
                    if (clickAmount >= oneYearOfRawCPS && currentRawCPS > 0) {
                        markAchievementWon('Click of the Titans');
                    }
                }
                
                return result;
            };
        }
        // Temple swap tracking
        registerHook('check', function() {
            if (Game.Objects['Temple'] && Game.Objects['Temple'].minigame) {
                var M = Game.Objects['Temple'].minigame;
                var currentSwaps = M.swaps || 0;
                if (modTracking.previousTempleSwaps > currentSwaps) {
                    var swapsUsed = modTracking.previousTempleSwaps - currentSwaps;
                    modTracking.templeSwapsTotal += swapsUsed;
            
                }
                modTracking.previousTempleSwaps = currentSwaps;
            }
        }, 'Track temple swap usage');
        
        // Soil change tracking
        registerHook('check', function() {
            if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
                var M = Game.Objects['Farm'].minigame;
                var currentSoilType = M.soil || 0;
                if (modTracking.previousSoilType !== null && modTracking.previousSoilType !== currentSoilType) {
                    modTracking.soilChangesTotal++;
            
                }
                modTracking.previousSoilType = currentSoilType;
            }
        }, 'Track garden soil type changes');
        
                // Wrath cookie tracking + Golden cookie effect modification
        if (Game.shimmerTypes && Game.shimmerTypes['golden']) {
            var originalPopFunc = Game.shimmerTypes['golden'].popFunc;
            
            if (originalPopFunc && !Game.shimmerTypes['golden']._effectInjected) {
                let originalFunctionStr = originalPopFunc.toString();
                
                if (originalFunctionStr.includes('effectDurMod') && originalFunctionStr.includes('mult')) {
                    const effectDurInjection = "if(Game.Has('Order of the Shining Spoon')){effectDurMod*=1.05;}\n" +
                                              "if(Game.Has('Order of the Cookie Eclipse')){effectDurMod*=1.05;}\n" +
                                              "if(Game.Has('Order of the Eternal Cookie')){effectDurMod*=1.05;}";
                    
                    const multInjection = "if(Game.Has('Order of the Shining Spoon')){mult*=1.05;}\n" +
                                         "if(Game.Has('Order of the Cookie Eclipse')){mult*=1.05;}\n" +
                                         "if(Game.Has('Order of the Eternal Cookie')){mult*=1.05;}";
                    
                    // Inject effectDurMod modification after it's declared
                    let modifiedFunctionStr = originalFunctionStr.replace(
                        /var effectDurMod=1;/,
                        "var effectDurMod=1;\n" + effectDurInjection
                    );
                    
                    // Inject mult modification after it's declared
                    modifiedFunctionStr = modifiedFunctionStr.replace(
                        /var mult=1;/,
                        "var mult=1;\n" + multInjection
                    );
                    
                    // Create the new function… sigh I hate having to inject code   
                    let newFunction = eval('(' + modifiedFunctionStr + ')');
                    
                    // Replace the original function with our modified version, really sorry everyone.
                    originalPopFunc = newFunction;
                    

                    
                    Game.shimmerTypes['golden']._effectInjected = true;
                }
            }
            
            Game.shimmerTypes['golden'].popFunc = function(me) {
                // Check if this is a FtHoF-created cookie BEFORE calling original function
                var isFtHoFCookie = me.force && me.force !== '';
                var forcedOutcome = me.force;
                var forceObject = me.forceObj;
                var isWrath = me.wrath;
                
                // Call the original function AFTER capturing the properties
                originalPopFunc.call(this, me);
                
                // Check if this was a wrath cookie (but not a cookie storm drop)
                if (me && me.wrath && me.type !== 'cookie storm drop') {
                    // Track lifetime wrath cookies (used for achievements and stats)
                    lifetimeData.wrathCookiesClicked++;
                }
                
                // Check if this is a FtHoF-created cookie (has a forced outcome)
                if (isFtHoFCookie) {
                    // Store the FtHoF cookie data for achievement tracking
                    if (!modTracking.fthofCookieOutcomes) {
                        modTracking.fthofCookieOutcomes = [];
                    }
                    
                    modTracking.fthofCookieOutcomes.push({
                        outcome: forcedOutcome,
                        wrath: isWrath,
                        forceObj: forceObject,
                        timestamp: Date.now()
                    });
                    
                    // Check for Sweet Sorcery achievement (free sugar lump outcome)
                    if (forcedOutcome === 'free sugar lump') {
                        if (Game.Achievements['Sweet Sorcery'] && !Game.Achievements['Sweet Sorcery'].won) {
                            markAchievementWon('Sweet Sorcery');
                        }
                    }
                }
            };
        }
        
        // Elder Covenant tracking - override the Elder Covenant upgrade function
        if (Game.Upgrades && Game.Upgrades['Elder Covenant']) {
            var originalElderCovenantFunc = Game.Upgrades['Elder Covenant'].buy;
            Game.Upgrades['Elder Covenant'].buy = function() {
                // Call the original function first
                originalElderCovenantFunc.call(this);
                
                // Track the toggle
                lifetimeData.elderCovenantToggles++;
        
            };
        }
        
        // Garden sacrifice tracking - override the garden convert function
        if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
            var originalConvertFunc = Game.Objects['Farm'].minigame.convert;
            Game.Objects['Farm'].minigame.convert = function() {
                // Call the original function first
                originalConvertFunc.call(this);
                
                // Track the sacrifice time
                lifetimeData.lastGardenSacrificeTime = Date.now();
                
                // Check achievements after conversion (convertTimes is updated by vanilla)
                setTimeout(function() {
                    checkModAchievements();
                }, 0);
            };
        }
        

        
        // Upgrade effects
        registerHook('cps', function(cps) {
            cps = applyUpgradeEffects(cps);
            return cps;
        }, 'Apply mod upgrade effects to CPS calculation');
        
        // Upgrade unlock conditions
        registerHook('check', checkUpgradeUnlockConditions, 'Check mod upgrade unlock conditions');
        
        // Upgrade checking
        registerHook('check', checkUpgrades, 'Check mod upgrade states');
        
        // Achievement checking
        registerHook('check', checkModAchievements, 'Check mod achievement conditions');
        
        // Lifetime tracking hooks
        registerHook('check', handleCheck, 'Monitor for ascension and capture values');
        registerHook('reincarnate', handleReincarnate, 'Log reincarnate event');
        registerHook('reset', handleReset, 'Clear data on full reset');
        
        // God usage tracking hook
        registerHook('check', trackGodUsage, 'Track pantheon god usage time');
        

        
        // Kitten injection system - inject custom kitten multiplier code into Game.CalculateGains
        const findAndHookKittenCalculation = function() {
            try {
                let originalCalculateGains = Game.CalculateGains;
                if (!originalCalculateGains) {
                    console.warn('Game.CalculateGains not available for kitten injection');
                    return;
                }
                
                let originalFunctionStr = originalCalculateGains.toString();
                
                // Look for kitten-related patterns in the minified code
                if (originalFunctionStr.includes('kittens')) {
                    // Try different patterns for the kitten assignment
                    const patterns = [
                        /Game\.cookiesMultByType\['kittens'\]=catMult/,
                        /Game\.cookiesMultByType\.kittens=catMult/,
                        /cookiesMultByType\['kittens'\]=catMult/,
                        /cookiesMultByType\.kittens=catMult/,
                        /kittens.*=.*catMult/,
                        /catMult.*kittens/
                    ];
                    
                    let foundPattern = null;
                    for (let pattern of patterns) {
                        if (pattern.test(originalFunctionStr)) {
                            foundPattern = pattern;
                            break;
                        }
                    }
                    
                    if (foundPattern) {
                        // Create injection code for all expansion kitten upgrades 0.005 = ~15.8% per kitten 
                        const injection = "if(Game.Has('Kitten unpaid interns')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten overpaid \"temporary\" contractors')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten remote workers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten scrum masters')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten UX designers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten janitors')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten coffee fetchers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten personal assistants')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten vice presidents')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten board members')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten founders')){catMult*=(1+Game.milkProgress*0.005*milkMult);}";
                        
                        let modifiedFunctionStr = originalFunctionStr.replace(
                            foundPattern,
                            injection + "\n" + originalFunctionStr.match(foundPattern)[0]
                        );

                        //this really pains me but there was no other way to do it
                        let newFunction = eval('(' + modifiedFunctionStr + ')');
                        Game.CalculateGains = newFunction;
                    }
                }
            } catch (error) {
                console.error('Error injecting custom kitten multiplier code:', error);
            }
        };
        
        // Register the kitten injection hook
        registerHook('logic', function() {
            // Only inject once when the game is ready
            if (Game.CalculateGains && !Game.CalculateGains._kittenInjected) {
                findAndHookKittenCalculation();
                Game.CalculateGains._kittenInjected = true;
            }
        }, 'Inject custom kitten multiplier code');

        // Research speed boost for Bearer of the Cookie Sigil achievement
        if (Game.SetResearch && !Game.SetResearch._modded) {
            var originalSetResearch = Game.SetResearch;
            Game.SetResearch = function(what, time) {
                // Call the original function first
                originalSetResearch.call(this, what, time);
                
                // Apply 25% speed boost if Bearer of the Cookie Sigil achievement is owned
                if (Game.Achievements['Bearer of the Cookie Sigil'] && Game.Achievements['Bearer of the Cookie Sigil'].won) {
                    Game.researchT = Math.ceil(Game.researchT * 0.75); // 25% faster = multiply by 0.75
                }
            };
            Game.SetResearch._modded = true;
        }

        // Random drop rate boost for Bearer of the Cookie Sigil achievement
        if (Game.dropRateMult && !Game.dropRateMult._modded) {
            var originalDropRateMult = Game.dropRateMult;
            Game.dropRateMult = function() {
                // Call the original function first to get the base multiplier
                var mult = originalDropRateMult.call(this);
                
                // Apply 10% drop rate boost if Bearer of the Cookie Sigil achievement is owned
                if (Game.Achievements['Bearer of the Cookie Sigil'] && Game.Achievements['Bearer of the Cookie Sigil'].won) {
                    mult *= 1.1; // 10% more often = multiply by 1.1
                }
                
                return mult;
            };
            Game.dropRateMult._modded = true;
        }

        // Lump discrepancy patch - apply as fallback (should already be applied early, but ensure it's done)
        applyLumpDiscrepancyPatch();
        
        // God swap save corruption patch - apply as fallback (should already be applied early, but ensure it's done)
        applyGodSwapPatch();

    }
    
    Game.checkGodUsage = function() {
        console.log('[God Usage] Current god usage time analysis:');
        console.log('=========================================');
        
        var totalGods = 0;
        var totalTime = 0;
        
        // Get all available gods from the pantheon
        var allAvailableGods = [];
        if (Game.Objects['Temple'] && Game.Objects['Temple'].minigame && Game.Objects['Temple'].minigame.godsById) {
            var pantheon = Game.Objects['Temple'].minigame;
            for (var i = 0; i < pantheon.godsById.length; i++) {
                if (pantheon.godsById[i] && pantheon.godsById[i].name) {
                    allAvailableGods.push(pantheon.godsById[i].name);
                }
            }
        }
        
        if (allAvailableGods.length === 0) {
            console.log('Temple pantheon not available yet.');
            return;
        }
        
        // Display each god's usage 
        for (var i = 0; i < allAvailableGods.length; i++) {
            var godName = allAvailableGods[i];
            var storedTimeMs = modTracking.godUsageTime[godName] || 0;
            var currentSlotTimeMs = 0;
            
            // Add current slot time if this god is currently slotted
            if (modTracking.currentSlottedGods && modTracking.currentSlottedGods[godName]) {
                var slotStartTime = modTracking.currentSlottedGods[godName];
                if (typeof slotStartTime === 'number' && slotStartTime > 0) {
                    currentSlotTimeMs = Date.now() - slotStartTime;
                }
            }
            
            var totalTimeMs = storedTimeMs + currentSlotTimeMs;
            var timeHours = totalTimeMs / (1000 * 60 * 60); // Convert milliseconds to hours
            var percentOf24Hours = (timeHours / 24) * 100;
            
            console.log(`${godName}: ${timeHours.toFixed(2)} hours (${percentOf24Hours.toFixed(1)}% of 24h)`);
            totalGods++;
            totalTime += totalTimeMs;
        }
        
        // Show currently slotted gods if any
        if (modTracking.currentSlottedGods && Object.keys(modTracking.currentSlottedGods).length > 0) {
            console.log('=========================================');
            console.log('Currently slotted gods:');
            for (var godName in modTracking.currentSlottedGods) {
                var slotTime = Date.now() - modTracking.currentSlottedGods[godName];
                var currentHours = slotTime / (1000 * 60 * 60);
                console.log(`${godName}: ${currentHours.toFixed(2)} hours in current slot`);
            }
        }
    };
    
    // Lists of mod upgrade names by category for easy removal/addition
    var cookieUpgradeNames = [
        'Box of improved cookies', 'Order of the Golden Crumb', 'Order of the Impossible Batch', 'Order of the Shining Spoon', 'Order of the Cookie Eclipse', 'Order of the Enchanted Whisk', 'Order of the Eternal Cookie',
        'Improved Plain cookies', 'Improved Milk chocolate butter biscuit', 'Improved Dark chocolate butter biscuit', 
        'Improved White chocolate butter biscuit', 'Improved Ruby chocolate butter biscuit', 'Improved Lavender chocolate butter biscuit', 
        'Improved Synthetic chocolate green honey butter biscuit', 'Improved Sugar cookies', 'Improved Oatmeal raisin cookies', 
        'Improved Peanut butter cookies', 'Improved Coconut cookies', 'Improved Macadamia nut cookies', 'Improved Almond cookies', 
        'Improved Hazelnut cookies', 'Improved Walnut cookies', 'Improved Cashew cookies', 'Improved White chocolate cookies', 
        'Improved Milk chocolate cookies', 'Improved Double-chip cookies', 'Improved White chocolate macadamia nut cookies', 
        'Improved All-chocolate cookies', 'Improved Dark chocolate-coated cookies', 'Improved White chocolate-coated cookies', 
        'Improved Eclipse cookies', 'Improved Zebra cookies', 'Improved Snickerdoodles', 'Improved Stroopwafels', 
        'Improved Macaroons', 'Improved Empire biscuits', 'Improved Madeleines', 'Improved Palmiers'
    ];
    
    var buildingUpgradeNames = [
        'Advanced knitting techniques', 'Bingo night optimization', 'Tea time efficiency', 'Gossip-powered baking', 
        'Senior discount mastery', 'Hydroponic cookie cultivation', 'Vertical farming revolution', 'Quantum crop rotation', 
        'Sentient soil enhancement', 'Temporal harvest acceleration', 'Quantum tunneling excavation', 'Neutron star compression', 
        'Dimensional rift mining', 'Singularity core extraction', 'Temporal paradox drilling', 'Quantum assembly optimization', 
        'Temporal manufacturing loops', 'Dimensional cookie synthesis', 'Singularity production cores', 'Reality-warping assembly', 
        'Quantum banking protocols', 'Temporal interest compounding', 'Dimensional currency exchange', 'Singularity financial algorithms', 
        'Reality-warping economics', 'Quantum divine intervention', 'Temporal prayer loops', 'Dimensional deity summoning', 
        'Singularity divine consciousness', 'Reality-warping divinity', 'Arcane resonance', 'Spell weaving', 'Mystical attunement', 
        'Ethereal manifestation', 'Transcendent thaumaturgy', 'Hypervelocity transport', 'Spatial compression', 'Dimensional routing', 
        'Quantum teleportation', 'Causality manipulation', 'Essence distillation', 'Molecular gastronomy', 'Flavor alchemy', 
        'Culinary transmutation', 'Gastronomic enlightenment', 'Dimensional gateways', 'Reality bridges', 'Spatial conduits', 
        'Interdimensional highways', 'Cosmic gateways', 'Temporal engineering', 'Chronological optimization', 'Historical preservation', 
        'Temporal synchronization', 'Chronological mastery', 'Particle synthesis', 'Matter transmutation', 'Quantum baking', 
        'Particle optimization', 'Matter manipulation', 'Light crystallization', 'Spectral baking', 'Optical alchemy', 
        'Luminous confectionery', 'Radiant gastronomy', 'Probability manipulation', 'Fortune optimization', 'Serendipity engineering', 
        'Random enhancement', 'Luck amplification', 'Infinite recursion', 'Self-similar baking', 'Fractal optimization', 
        'Recursive enhancement', 'Fractal gastronomy', 'Code optimization', 'Programmatic baking', 'Algorithmic enhancement', 
        'Computational gastronomy', 'Digital confectionery', 'Reality real estate', 'Dimensional franchising', 'Cosmic supply chains', 
        'Reality marketplaces', 'Multiverse headquarters', 'Neural plasticity', 'Synaptic pruning', 'Cognitive load balancing', 
        'Metacognitive awareness', 'Neural synchronization', 'Mitotic mastery', 'Epigenetic programming', 'Cellular differentiation', 
        'Telomere regeneration', 'Quantum entanglement',
        // Discount upgrades (5% less building cost upgrades)
        'Increased Social Security Checks', 'Off-Brand Eyeglasses', 'Plastic Walkers', 'Bulk Discount Hearing Aids', 
        'Generic Arthritis Medication', 'Wholesale Denture Adhesive', 'Biodiesel fueled tractors', 'Free manure from clone factories', 
        'Solar-powered irrigation systems', 'Bulk seed purchases', 'Robot farm hands', 'Vertical farming subsidies', 
        'Clearance shaft kits', 'Punch-card TNT club', 'Hand-me-down hardhats', 'Lease-back drill rigs', 
        'Ore cartel coupons', 'Cave-in insurance kickbacks', 'Flat-pack factory frames', 'BOGO rivet bins', 
        'Off-brand gear grease', 'Misprint warning labels', 'Pallet-jack rebates', 'Prefab cookie modules', 
        'Piggy buyback bonanza', 'Vault door floor-models', 'Pen-on-a-chain procurement', 'Complimentary complimentary mints', 
        'Fee waiver wavers', 'Dough Jones clearance', 'Tithe punch cards', 'Relic replica racks', 'Incense refill program', 
        'Chant-o-matic hymn reels', 'Pew-per-view sponsorships', 'Sacred site tax amnesty', 'Wand warranty returns', 'Grimoire remainder sale', 
        'Robes with "character"', 'Familiar foster program', 'Council scroll stipends', 'Broom-sharing scheme', 
        'Retired cargo pods', 'Container co-op cards', 'Reusable launch crates', 'Autodocker apprentices', 
        'Route rebate vouchers', 'Free-trade cookie ports', 'Beaker buybacks', 'Philosopher\'s pebbles', 
        'Cool-running crucibles', 'Batch homunculi permits', 'Guild reagent rates', '"Mostly lead" gold grants', 
        'Pre-owned ring frames', 'Anchor warehouse club', 'Passive rift baffles', 'Volunteer gatekeepers', 
        'Interrealm stipend scrolls', 'Multiversal enterprise zone', 'Pre-loved hourglasses', 'Depreciated timeline scraps', 
        'Off-season flux valves', 'Weekend paradox passes', 'Department of When grants', 'Antique warranty loopholes', 
        'Certified negamatter cans', 'Matter swap rebates', 'Low-idle annihilators', 'Grad-lab particle labor', 
        'Institute endowment match', 'Void-zone incentives', 'Lens co-op exchange', 'Spectral seconds', 
        'Sleep-mode rainbows', 'Apprentice refractioneers', 'Arts-of-Optics grants', 'Rainbow renewal credits', 
        'Misprinted fortunes', 'Reroll refund policy', 'Economy-grade omens', 'Volunteer augury nights', 
        'Lottery board matching', 'Lucky district waivers', 'Iteration liquidation', 'Self-similar spare parts', 
        'Recursion rebates', 'Autogenerator residencies', 'Grant-funded proofs', 'Infinite-lot variances', 
        'Refurb dev boards', 'Compiler credit program', 'Idle-friendly runtimes', 'Peer-review co-ops', 
        'Open-source grants', 'Cloud credit vouchers', 'Interdimensional tax breaks', 'Reality consolidation discounts', 
        'Cosmic bulk purchasing', 'Multiverse supplier networks', 'Dimensional economies of scale', 'Reality monopoly pricing', 
        'Neural bulk purchasing', 'Synaptic wholesale networks', 'Cerebral mass production', 'Mind monopoly pricing', 
        'Neural economies of scale', 'Synaptic supply dominance', 
        'Clone factory economies', 'Replica production lines', 'Mirror manufacturing mastery', 'Twin tycoon pricing', 
        'Doppelganger discount networks', 'Clone supply dominance'
    ];
    
    var kittenUpgradeNames = ['Kitten unpaid interns', 'Kitten overpaid "temporary" contractors', 'Kitten remote workers', 'Kitten scrum masters', 'Kitten UX designers', 'Kitten janitors', 'Kitten coffee fetchers', 'Kitten personal assistants', 'Kitten vice presidents', 'Kitten board members', 'Kitten founders'];
    
    // Generate combined mod upgrade names array on the fly
    function getModUpgradeNames() {
        var allNames = cookieUpgradeNames.concat(buildingUpgradeNames).concat(kittenUpgradeNames);
        return allNames;
    }
    
    // List of all mod achievement names for debug reset
    var modAchievementNames = [];
    
    // Preload sprite sheets to avoid multiple HTTP requests
    function preloadSpriteSheets() {
        for (var sheetName in spriteSheets) {
            var img = new Image();
            img.src = spriteSheets[sheetName];
            // Store the loaded image for reference
            spriteSheets[sheetName + '_loaded'] = img;
        }
    }
    
    // Helper function to get sprite sheet URL
    function getSpriteSheet(sheetName) {
        return spriteSheets[sheetName] || '';
    }

    // Global initialization protection
    if (window.JustNaturalExpansionInitialized) {

        return;
    }
    window.JustNaturalExpansionInitialized = true;

    // Helper: Find last vanilla achievement by name
    function findLastVanillaAchievement(targetName) {
        if (!Game || !Game.Achievements) {
            console.warn('Game or Game.Achievements not available');
            return { order: 0, icon: [0, 0] };
        }
        
        var lastOrder = 0;
        var lastIcon = [0, 0];
        var lastAchievement = null;
        for (var achId in Game.Achievements) {
            var ach = Game.Achievements[achId];
            if (ach && ach.name === targetName && ach.order > lastOrder) {
                lastOrder = ach.order;
                lastIcon = ach.icon;
                lastAchievement = ach;
            }
        }
        
        if (lastOrder === 0) {
            console.warn('Vanilla achievement not found:', targetName);
        }
        
        return { order: lastOrder, icon: lastIcon, achievement: lastAchievement };
    }
    
    
    
    // Simplified achievement creation - following the ECMplusplusplus pattern
    function createAchievement(name, desc, icon, order, requirement, customIcon) {
        if (!Game || !Game.Achievements) {
            console.warn('Game not available for achievement creation');
            return null;
        }
        
        if (!name || !desc) {
            console.warn('Invalid achievement data:', { name: name, desc: desc });
            return null;
        }
        
        // Use custom icon if provided, otherwise use the vanilla icon
        var finalIcon = customIcon || icon;
        
        // Handle custom icon formats
        if (customIcon && Array.isArray(customIcon)) {
            if (customIcon.length === 3) {
                // Spiced Cookies pattern: [x, y, spriteSheetURL]
                finalIcon = [customIcon[0], customIcon[1], customIcon[2]];
            } else if (customIcon.length === 2) {
                // Simple coordinates: [x, y]
                finalIcon = customIcon;
            }
        }
        
        // Check for flavor text and append it to the description
        var finalDesc = desc;
        if (achievementFlavorText && achievementFlavorText[name]) {
            finalDesc = desc + '<br><q>' + achievementFlavorText[name] + '</q>';
        }
        
        // Create achievement using the vanilla pattern
        var ach = new Game.Achievement(name, finalDesc, finalIcon);
        

        
        // Ensure the achievement is properly initialized with vanilla properties
        ach.id = Game.AchievementsN;
        ach.name = name;
        ach.dname = name;
        ach.shortName = name; // Required for Game.Win notification
        ach.desc = finalDesc;
        ach.baseDesc = finalDesc;
        
        // Set basic properties
        ach.ddesc = finalDesc;
        ach.desc = finalDesc; // Ensure desc is set
      
        // Set achievement pool based on shadow mode setting
        if (shadowAchievementMode) {
            ach.pool = 'shadow';
            ach.order = order + 50000; // Add 50,000 to preserve relative ordering
        } else {
            ach.pool = 'normal';
            ach.order = order;
        }
        
        // Set won state based on save data if available
        // CRITICAL: If achievement already exists and is won, preserve that state
        var existingAchievement = Game.Achievements[name];
        if (existingAchievement && existingAchievement.won === 1) {
            ach.won = 1;
            ach._restoredFromSave = true;

        } else {
            ach.won = 0; // Default to unwon for new achievements
            

            
            if (modSaveData && modSaveData.achievements && modSaveData.achievements[name]) {
                var savedWonState = modSaveData.achievements[name].won || 0;
                if (savedWonState > 0) {
                    ach.won = 1;
                    ach._restoredFromSave = true;
                }
            }
        }
        ach.hide = 0;
        
        // Ensure achievement has all required properties for Game.Win
        ach.name = name; // Ensure name is set
        ach.icon = finalIcon; // Ensure icon is set
        ach.vanilla = false; // Mark as non-vanilla achievement
        
        // Add source text with mod icon and name
        var sourceText = '<div style="font-size:80%;text-align:center;">From <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div><div class="line"></div>';
        ach.ddesc = sourceText + ach.ddesc;
        ach.desc = sourceText + ach.desc;
        
        // Store requirement function for checking
        if (requirement) {
            ach.requirement = requirement;
        }
        
        // Register with game systems
        Game.AchievementsById[Game.AchievementsN] = ach;
        Game.Achievements[name] = ach; // Also register by name for Game.Win to work
        ach.id = Game.AchievementsN; // Ensure achievement has proper ID
        Game.AchievementsN++;
        
        // PROTECTION: If this achievement was restored from save, protect it from vanilla resets
        if (ach._restoredFromSave && ach.won === 1) {
            if (!window.JNE_ProtectedAchievements) {
                window.JNE_ProtectedAchievements = {};
            }
            window.JNE_ProtectedAchievements[name] = 1;
        }
        
        // Add to our mod achievement list for debug reset
        modAchievementNames.push(name);
        

        
        return ach;
}

    // Helper function to add source text to upgrades and achievements
    function addSourceText(item) {
        var sourceText = '<div style="font-size:80%;text-align:center;">From <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div><div class="line"></div>';
        item.ddesc = sourceText + item.ddesc;
        item.desc = sourceText + item.desc;
    }
    
    // Function to validate achievement states and log any inconsistencies
    function validateAchievementStates() {
        if (!modAchievementNames) return;
        
        var validationIssues = [];
        
        modAchievementNames.forEach(achievementName => {
            var achievement = Game.Achievements[achievementName];
            if (achievement) {
                // Check if achievement has inconsistent state
                if (achievement.won && !achievement._restoredFromSave) {
                    validationIssues.push(achievementName + ' is won but not marked as restored from save');
                }
                
                // Check if achievement was restored but somehow lost its won state
                if (achievement._restoredFromSave && !achievement.won) {
                    validationIssues.push(achievementName + ' was restored from save but lost won state');
                }
            }
        });
        
        if (validationIssues.length > 0) {
            console.warn('Achievement validation issues detected:', validationIssues);
        }
    }
    
    // Function to restore achievements that were reset by vanilla Cookie Clicker
    function restoreProtectedAchievements() {
        if (!window.JNE_ProtectedAchievements) return;
        
        Object.keys(window.JNE_ProtectedAchievements).forEach(achievementName => {
            var achievement = Game.Achievements[achievementName];
            if (achievement && achievement.won !== 1) {
                achievement.won = 1;
                achievement._restoredFromSave = true;
            }
        });
    }
    
    // Function to repair achievement state inconsistencies
    function repairAchievementStates() {
        if (!modAchievementNames) return;
        
        var repairedCount = 0;
        
        modAchievementNames.forEach(achievementName => {
            var achievement = Game.Achievements[achievementName];
            if (achievement) {
                // If achievement was restored from save but lost won state, restore it
                if (achievement._restoredFromSave && !achievement.won) {
                    achievement.won = 1;
                    repairedCount++;
                }
                
                // Also update the by-id version if it exists
                if (Game.AchievementsById[achievementName]) {
                    Game.AchievementsById[achievementName].won = achievement.won;
                    Game.AchievementsById[achievementName]._restoredFromSave = achievement._restoredFromSave;
                }
            }
        });
        
                if (repairedCount > 0) {
            // Force a save after repairs
            requestModSave(true);
        }
    }
    
    // Helper function to mark achievement as won from save data (no notification)
    function markAchievementWonFromSave(achievementName) {
        if (Game.Achievements[achievementName]) {
            // Always set to won when loading from save, regardless of current state
            Game.Achievements[achievementName].won = 1;
            Game.Achievements[achievementName]._restoredFromSave = true;
            
            // Also update the by-id version if it exists
            if (Game.AchievementsById[achievementName]) {
                Game.AchievementsById[achievementName].won = 1;
                Game.AchievementsById[achievementName]._restoredFromSave = true;
            }
            // No notification for achievements loaded from save
        }
    }
    
    // Helper function to mark achievement as won when newly earned (with notification)
    function markAchievementWon(achievementName) {
        
        if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
            // Prevent overwriting achievements that were restored from save
            if (Game.Achievements[achievementName]._restoredFromSave) {
                return;
            }
            // Only trigger notification if mod has initialized
            if (modInitialized) {
                try {
                    // Call Game.Win with the achievement name (this should trigger notification)
                    Game.Win(achievementName);
                    
                    // Force UI update to ensure notification appears
                    if (Game.updateAchievementsMenu) {
                        Game.updateAchievementsMenu();
                    }
                    
                    // Force recalculation like the vanilla debug function does
                    Game.recalculateGains = 1;
                    
                    // CRUCIAL: Tell the vanilla game to refresh the store
                    Game.storeToRefresh = 1;
                    
                    // Check if any upgrades should now be unlocked after earning this achievement
                    // Using the centralized unlock check function with throttling to prevent rapid refreshes
                    setTimeout(function() {
                        if (typeof mod !== 'undefined' && mod.saveSystem && typeof mod.saveSystem.checkAndUnlockAllUpgrades === 'function') {
                            mod.saveSystem.checkAndUnlockAllUpgrades();
                        }
                    }, 100);
                    
                    // Trigger a save to persist the achievement
                    if (Game.Write) {
                        setTimeout(() => {
                            Game.Write('CookieClickerSave', Game.Write());
                        }, 100);
                    }
                } catch (e) {
                    console.error('❌ Error calling Game.Win:', e);
                }
            } else if (!modInitialized) {
                // During initialization, just mark as won without notification
                Game.Achievements[achievementName].won = 1;
            }
        }
    }
    
    // Helper function to check and mark "Beyond the Leaderboard" as won
    function checkAndMarkBeyondTheLeaderboard() {
        // Mark "Beyond the Leaderboard" as won if any upgrade is enabled or shadow mode is disabled
        if (enableCookieUpgrades || enableBuildingUpgrades || enableKittenUpgrades || enableJSMiniGame || enableHeavenlyUpgrades || !shadowAchievementMode) {
            modSettings.hasUsedModOutsideShadowMode = true;

            if (Game.Achievements['Third-party'] && !Game.Achievements['Third-party'].won) {
                queueAchievementAward('Third-party');
            }

            if (Game.Achievements['Beyond the Leaderboard'] && !Game.Achievements['Beyond the Leaderboard'].won) {
                queueAchievementAward('Beyond the Leaderboard');
            }

            if (modInitialized) {
                flushPendingAchievementAwards();
            }

            if (Game.Write) {
                setTimeout(() => {
                    Game.Write('CookieClickerSave', Game.Write());
                }, 100);
            }
        }
    }
    
    // Function to dynamically add upgrades to the game
    function addUpgradesToGame() {
            if (!upgradeData || typeof upgradeData !== 'object') {
                console.error('Invalid upgradeData structure:', upgradeData);
                return;
            }
            removeModCookieUpgradesFromPool();
            
        // ===== SECTION 1: ESSENTIAL GENERIC UPGRADES =====
        // Create essential upgrades that other upgrades depend on
            if (enableCookieUpgrades && upgradeData.generic && Array.isArray(upgradeData.generic)) {
                for (var i = 0; i < upgradeData.generic.length; i++) {
                    var upgradeInfo = upgradeData.generic[i];
                        if (upgradeInfo.name === 'Box of improved cookies' || 
                            upgradeInfo.name === 'Order of the Golden Crumb' ||
                            upgradeInfo.name === 'Order of the Impossible Batch' ||
                            upgradeInfo.name === 'Order of the Shining Spoon' ||
                            upgradeInfo.name === 'Order of the Cookie Eclipse' ||
                            upgradeInfo.name === 'Order of the Enchanted Whisk' ||
                            upgradeInfo.name === 'Order of the Eternal Cookie') {
                            try {
                                createGenericUpgrade(upgradeInfo);
                            } catch (e) {
                        console.error('Failed to create essential upgrade:', upgradeInfo.name, e);
                            }
                            }
                        }
                    }
                
        // ===== SECTION 2: BUILDING DISCOUNT UPGRADES =====
                // Create building discount upgrades from generic section
                if (enableBuildingUpgrades && upgradeData.generic && Array.isArray(upgradeData.generic)) {
                    for (var i = 0; i < upgradeData.generic.length; i++) {
                        var upgradeInfo = upgradeData.generic[i];
                        if (upgradeInfo.type === 'discount') {
                    try {
                            createGenericUpgrade(upgradeInfo);
                    } catch (e) {
                        console.error('Failed to create discount upgrade:', upgradeInfo.name, e);
                        }
                    }
                }
            }
            
        // ===== SECTION 3: BOX OF IMPROVED COOKIES SETUP =====
            // CRITICAL: Ensure "Box of improved cookies" is fully registered before creating cookie upgrades
                if (enableCookieUpgrades && Game.Upgrades['Box of improved cookies']) {
                    // Force the upgrade to be fully available in the game's systems
                    Game.Upgrades['Box of improved cookies'].isUnlocked = function() { return this.unlockCondition ? this.unlockCondition() : true; };
                    Game.Upgrades['Box of improved cookies'].isBought = function() { return this.bought > 0; };
                    Game.Upgrades['Box of improved cookies'].canBuy = function() {
                        var hasEnoughMoney = Game.cookies >= this.price;
                        var isUnlocked = this.unlockCondition ? this.unlockCondition() : true;
                        return isUnlocked && hasEnoughMoney && !this.bought;
                    };
                    
                    // Ensure it's in the upgrade pools
                    if (Game.UpgradesByPool && Game.UpgradesByPool['custom']) {
                        if (Game.UpgradesByPool['custom'].indexOf(Game.Upgrades['Box of improved cookies']) === -1) {
                            Game.UpgradesByPool['custom'].push(Game.Upgrades['Box of improved cookies']);
                        }
                    }
                }
            
        // ===== SECTION 4: COOKIE UPGRADES =====
            // Create cookie upgrades only if enabled AND Box upgrade exists
            if (enableCookieUpgrades && Game.Upgrades['Box of improved cookies'] && upgradeData.cookie && Array.isArray(upgradeData.cookie)) {
                for (var i = 0; i < upgradeData.cookie.length; i++) {
                    var upgradeInfo = upgradeData.cookie[i];
                    try {
                        createCookieUpgrade(upgradeInfo);
                    } catch (e) {
                    console.error('Failed to create cookie upgrade:', upgradeInfo.name, e);
                    }
                }
            }
            
        // ===== SECTION 5: BUILDING UPGRADES =====
        // Create building upgrades with proper order assignment
            if (enableBuildingUpgrades) {
            
            // Building order starting values
            var buildingOrderStarts = {
                'Cursor': 151, 'Grandma': 201, 'Farm': 301, 'Mine': 401, 'Factory': 501,
                'Bank': 526, 'Temple': 551, 'Wizard tower': 576, 'Shipment': 601,
                'Alchemy lab': 701, 'Portal': 801, 'Time machine': 901, 'Antimatter condenser': 1001,
                'Prism': 1101, 'Chancemaker': 1201, 'Fractal engine': 1301, 'Javascript console': 1401,
                'Idleverse': 1501, 'Cortex baker': 1601, 'You': 1701
            };
            
            // Group building upgrades by building type
            var buildingGroups = {};
            
            // Process building upgrades
            if (upgradeData.building && Array.isArray(upgradeData.building)) {
                for (var i = 0; i < upgradeData.building.length; i++) {
                    var upgradeInfo = upgradeData.building[i];
                    var buildingName = upgradeInfo.building;
                    
                    if (!buildingGroups[buildingName]) {
                        buildingGroups[buildingName] = [];
                    }
                    
                    // Extract threshold for sorting
                    var threshold = 0;
                    if (upgradeInfo.unlockCondition) {
                        var unlockStr = upgradeInfo.unlockCondition.toString();
                        var thresholdMatch = unlockStr.match(/>=\s*(\d+)/);
                        if (thresholdMatch) {
                            threshold = parseInt(thresholdMatch[1]);
                        }
                    }
                    
                    buildingGroups[buildingName].push({
                        upgrade: upgradeInfo,
                        threshold: threshold
                    });
                }
            }
            
            // Process generic upgrades that are building-related
            if (upgradeData.generic && Array.isArray(upgradeData.generic)) {
                for (var i = 0; i < upgradeData.generic.length; i++) {
                    var upgradeInfo = upgradeData.generic[i];
                    
                    // Skip essential upgrades that were already created
                    if (upgradeInfo.name === 'Box of improved cookies' || 
                        upgradeInfo.name === 'Order of the Golden Crumb' ||
                        upgradeInfo.name === 'Order of the Impossible Batch' ||
                        upgradeInfo.name === 'Order of the Shining Spoon' ||
                        upgradeInfo.name === 'Order of the Cookie Eclipse' ||
                        upgradeInfo.name === 'Order of the Enchanted Whisk' ||
                        upgradeInfo.name === 'Order of the Eternal Cookie') {
                        continue;
                    }
                    
                    if (upgradeInfo.building) {
                        var buildingName = upgradeInfo.building;
                        if (!buildingGroups[buildingName]) {
                            buildingGroups[buildingName] = [];
                        }
                        
                        // Extract threshold for sorting
                        var threshold = 0;
                        if (upgradeInfo.unlockCondition) {
                            var unlockStr = upgradeInfo.unlockCondition.toString();
                            var thresholdMatch = unlockStr.match(/>=\s*(\d+)/);
                            if (thresholdMatch) {
                                threshold = parseInt(thresholdMatch[1]);
                            }
                        }
                        
                        buildingGroups[buildingName].push({
                            upgrade: upgradeInfo,
                            threshold: threshold
                        });
                    }
                }
            }
            
            // Create building upgrades with proper order assignment
            for (var buildingName in buildingGroups) {
                if (buildingGroups.hasOwnProperty(buildingName)) {
                    var group = buildingGroups[buildingName];
                    
                    // Sort by threshold (lower thresholds first)
                    group.sort(function(a, b) {
                        return a.threshold - b.threshold;
                    });
                    
                    // Assign order values
                    var baseOrder = buildingOrderStarts[buildingName] || 2000;
                    for (var j = 0; j < group.length; j++) {
                        var upgradeInfo = group[j].upgrade;
                        
                        // Skip Order of the X upgrades (preserve their existing order)
                        if (upgradeInfo.name && upgradeInfo.name.indexOf('Order of the') === 0) {
                            try {
                                    createGenericUpgrade(upgradeInfo);
                            } catch (e) {
                                console.error('Failed to create Order upgrade:', upgradeInfo.name, e);
                            }
                            continue;
                        }
                        
                        // Assign order: baseOrder + (j + 1) * 0.0001
                        upgradeInfo.order = baseOrder + ((j + 1) * 0.0001);
                        
                        try {
                                createBuildingUpgrade(upgradeInfo);
                        } catch (e) {
                            console.error('Failed to create building upgrade:', upgradeInfo.name, e);
                        }
                    }
                }
            }
        }
        
        // ===== SECTION 6: KITTEN UPGRADES =====
        // Create kitten upgrades with proper order assignment
            if (enableKittenUpgrades && upgradeData.kitten && Array.isArray(upgradeData.kitten)) {
            
            // Sort kitten upgrades by their achievement threshold
                var sortedKittenUpgrades = [];
                for (var i = 0; i < upgradeData.kitten.length; i++) {
                    var upgradeInfo = upgradeData.kitten[i];
                    
                    // Extract threshold from unlock condition
                    var threshold = 0;
                    if (upgradeInfo.unlockCondition) {
                        var unlockStr = upgradeInfo.unlockCondition.toString();
                        var thresholdMatch = unlockStr.match(/>= (\d+)/);
                        if (thresholdMatch) {
                            threshold = parseInt(thresholdMatch[1]);
                        }
                    }
                    
                    sortedKittenUpgrades.push({
                        upgrade: upgradeInfo,
                        threshold: threshold
                    });
                }
                
                // Sort by threshold (lower thresholds first)
                sortedKittenUpgrades.sort(function(a, b) {
                    return a.threshold - b.threshold;
                });
                
            // Create kitten upgrades with proper order assignment
                for (var j = 0; j < sortedKittenUpgrades.length; j++) {
                    var upgradeInfo = sortedKittenUpgrades[j].upgrade;
                    
                    // Assign order: 20001 + (j + 1) * 0.00001
                    upgradeInfo.order = 20001 + ((j + 1) * 0.00001);
                    
                    try {
                        createKittenUpgrade(upgradeInfo);
                    } catch (e) {
                    console.error('Failed to create kitten upgrade:', upgradeInfo.name, e);
                }
            }
        }
        
        // ===== SECTION 7: REMOVED - RESTORATION NOW HAPPENS DURING CREATION =====
        // The bought state is now restored during upgrade creation in each create*Upgrade function
        // This is more reliable and cleaner than trying to restore after creation
        
        
        // ===== SECTION 8: SAVE DATA INITIALIZATION =====
            // CRITICAL: Initialize missing upgrades in save data
            // This ensures that ALL upgrades are properly tracked in the save system, even when disabled
            if (modSaveData && modSaveData.upgrades) {
                var modUpgradeNames = getModUpgradeNames();
                var initializedCount = 0;
                
                modUpgradeNames.forEach(upgradeName => {
                    if (Game.Upgrades[upgradeName] && !modSaveData.upgrades[upgradeName]) {
                        modSaveData.upgrades[upgradeName] = { bought: 0 };
                        initializedCount++;
                    }
                });
        }
        
        // ===== SECTION 9: REMOVED - RESTORATION NOW HAPPENS DURING CREATION =====
        // The bought state is now restored during upgrade creation in each create*Upgrade function
        // This is more reliable and cleaner than trying to restore after creation
        
        
        // ===== SECTION 10: FINAL SETUP =====
            dedupeCookieUpgradePool();
        // Force store refresh
            setTimeout(() => {
                Game.storeToRefresh = 1;
                Game.upgradesToRebuild = 1;
                if (Game.UpdateMenu) { Game.UpdateMenu(); }
            }, 100);
            
    } // End of addUpgradesToGame function


    var modPermanentSlotBackup = {};
    var cachedModUpgradeNameSet = null;
    var cachedModCookieUpgradeNameSet = null;

    //this fixes old saves from corrupting the game after we changed how we handle perm slot upgrades this is safe to remove down the road a ways.
    function cleanupOldPermanentSlotFormat() {
        if (!Game || !Game.permanentUpgrades || !Game.UpgradesById) return;
        if (modSettings && modSettings.permanentSlotBackup && Object.keys(modSettings.permanentSlotBackup).length > 0) return;

        var nameSet = getModUpgradeNameSet();
        var migrated = 0;

        for (var slot = 0; slot < Game.permanentUpgrades.length; slot++) {
            var upgradeId = Game.permanentUpgrades[slot];
            if (typeof upgradeId !== 'number' || upgradeId < 0) continue;

            var upgrade = Game.UpgradesById[upgradeId];
            
            if (upgrade && nameSet[upgrade.name]) {
                if (!modPermanentSlotBackup) modPermanentSlotBackup = {};
                modPermanentSlotBackup[slot] = upgrade.name;
                Game.permanentUpgrades[slot] = -1;
                migrated++;
            } else if (!upgrade) {
                Game.permanentUpgrades[slot] = -1;
            }
        }

        if (migrated > 0 && Object.keys(modPermanentSlotBackup).length > 0) {
            modSettings.permanentSlotBackup = Object.assign({}, modPermanentSlotBackup);
        }
    }

    function getModUpgradeNameSet() {
        if (!cachedModUpgradeNameSet) {
            cachedModUpgradeNameSet = {};
            var names = getModUpgradeNames();
            for (var i = 0; i < names.length; i++) {
                cachedModUpgradeNameSet[names[i]] = true;
            }
        }
        return cachedModUpgradeNameSet;
    }

    function getModCookieUpgradeNameSet() {
        if (!cachedModCookieUpgradeNameSet) {
            cachedModCookieUpgradeNameSet = {};
            for (var i = 0; i < cookieUpgradeNames.length; i++) {
                cachedModCookieUpgradeNameSet[cookieUpgradeNames[i]] = true;
            }
        }
        return cachedModCookieUpgradeNameSet;
    }

    function removeModCookieUpgradesFromPool() {
        if (!Game) {
            return;
        }

        if (debugMode) {
            var startMain = Game.cookieUpgrades ? Game.cookieUpgrades.length : 0;
            var startPool = (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) ? Game.UpgradesByPool['cookie'].length : 0;
            debugLog('removeModCookieUpgradesFromPool_start', 'main=', startMain, 'pool=', startPool);
        }

        var removedFromMain = 0;
        var removedFromPool = 0;

        if (Game.cookieUpgrades && Array.isArray(Game.cookieUpgrades)) {
            var beforeMain = Game.cookieUpgrades.length;
            for (var i = Game.cookieUpgrades.length - 1; i >= 0; i--) {
                var upgrade = Game.cookieUpgrades[i];
                if (upgrade && upgrade.jneIsCookie) {
                    Game.cookieUpgrades.splice(i, 1);
                    removedFromMain++;
                }
            }
            debugLog('removeModCookieUpgradesFromPool', 'mainPoolBefore=', beforeMain, 'removed=', removedFromMain, 'after=', Game.cookieUpgrades.length);
        }

        if (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) {
            var pool = Game.UpgradesByPool['cookie'];
            var beforePool = pool.length;
            for (var j = pool.length - 1; j >= 0; j--) {
                var poolUpgrade = pool[j];
                if (poolUpgrade && poolUpgrade.jneIsCookie) {
                    pool.splice(j, 1);
                    removedFromPool++;
                }
            }
            debugLog('removeModCookieUpgradesFromPool', 'poolBefore=', beforePool, 'removed=', removedFromPool, 'after=', pool.length);
        }

        if (debugMode) {
            var endMain = Game.cookieUpgrades ? Game.cookieUpgrades.length : 0;
            var endPool = (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) ? Game.UpgradesByPool['cookie'].length : 0;
            debugLog('removeModCookieUpgradesFromPool_end', 'main=', endMain, 'pool=', endPool);
        }
    }

    function dedupeCookieUpgradePool() {
        if (!Game || !Game.cookieUpgrades) {
            return;
        }

        if (debugMode) {
            debugLog('dedupeCookieUpgradePool_start', 'main=', Game.cookieUpgrades.length, 'pool=', (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) ? Game.UpgradesByPool['cookie'].length : 0);
        }

        var seen = {};
        var pool = Game.cookieUpgrades;
        var initial = pool.length;
        var duplicatesRemoved = 0;
        for (var i = pool.length - 1; i >= 0; i--) {
            var upgrade = pool[i];
            var name = upgrade && upgrade.name;
            if (!name) {
                continue;
            }
            if (upgrade && upgrade.jneIsCookie && seen[name]) {
                pool.splice(i, 1);
                duplicatesRemoved++;
            } else {
                seen[name] = true;
            }
        }
        if (duplicatesRemoved > 0) {
            debugLog('dedupeCookieUpgradePool', 'mainPoolBefore=', initial, 'removed=', duplicatesRemoved, 'after=', pool.length);
        }

        if (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) {
            var poolArr = Game.UpgradesByPool['cookie'];
            seen = {};
            var initialPool = poolArr.length;
            var poolRemoved = 0;
            for (var k = poolArr.length - 1; k >= 0; k--) {
                var poolUpgrade = poolArr[k];
                var poolName = poolUpgrade && poolUpgrade.name;
                if (!poolName) {
                    continue;
                }
                if (poolUpgrade && poolUpgrade.jneIsCookie && seen[poolName]) {
                    poolArr.splice(k, 1);
                    poolRemoved++;
                } else {
                    seen[poolName] = true;
                }
            }
            if (poolRemoved > 0) {
                debugLog('dedupeCookieUpgradePool', 'upgradesByPoolBefore=', initialPool, 'removed=', poolRemoved, 'after=', poolArr.length);
            }
        }

        if (debugMode) {
            var duplicateSummary = [];
            if (Game.cookieUpgrades) {
                var counts = {};
                for (var idx = 0; idx < Game.cookieUpgrades.length; idx++) {
                    var entry = Game.cookieUpgrades[idx];
                    if (!entry || !entry.jneIsCookie) continue;
                    counts[entry.name] = (counts[entry.name] || 0) + 1;
                }
                for (var name in counts) {
                    if (counts.hasOwnProperty(name) && counts[name] > 1) {
                        duplicateSummary.push(name + ':' + counts[name]);
                    }
                }
            }
            debugLog('dedupeCookieUpgradePool_end', 'main=', Game.cookieUpgrades.length, 'pool=', (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['cookie'])) ? Game.UpgradesByPool['cookie'].length : 0, 'duplicates=', duplicateSummary.join(',') || 'none');
        }
    }

    function capturePermanentSlotBackups() {
        if (!Game || !Game.permanentUpgrades || !Game.UpgradesById) {
            return;
        }

        var nameSet = getModUpgradeNameSet();
        var newBackup = {};
        var hasEntries = false;

        for (var slot = 0; slot < Game.permanentUpgrades.length; slot++) {
            var upgradeId = Game.permanentUpgrades[slot];
            if (typeof upgradeId !== 'number' || upgradeId < 0) {
                continue;
            }

            var upgrade = Game.UpgradesById[upgradeId];
            // Safety check: upgrade might not exist if IDs changed
            if (upgrade && nameSet[upgrade.name]) {
                newBackup[slot] = upgrade.name;
                hasEntries = true;
            } else if (!upgrade) {
                // Old save format: upgrade ID no longer exists
                debugLog('capturePermanentSlotBackups: Invalid upgrade ID ' + upgradeId + ' in slot ' + slot + ' (likely old save format)');
            }
        }

        if (hasEntries) {
            modPermanentSlotBackup = newBackup;
            modSettings.permanentSlotBackup = Object.assign({}, modPermanentSlotBackup);
        }
    }

    function restoreModPermanentSlots() {
        if (!Game || !Game.permanentUpgrades || !Game.Upgrades) {
            return;
        }

        if ((!modPermanentSlotBackup || Object.keys(modPermanentSlotBackup).length === 0) && modSettings && modSettings.permanentSlotBackup) {
            modPermanentSlotBackup = Object.assign({}, modSettings.permanentSlotBackup);
        }

        var menuNeedsUpdate = false;
        for (var slot in modPermanentSlotBackup) {
            if (!modPermanentSlotBackup.hasOwnProperty(slot)) {
                continue;
            }

            var slotIndex = parseInt(slot, 10);
            var currentId = Game.permanentUpgrades[slotIndex];
            
            if (currentId !== -1) {
                continue;
            }

            var upgradeName = modPermanentSlotBackup[slot];
            var upgradeObj = Game.Upgrades[upgradeName];

            if (upgradeObj && upgradeObj.id !== undefined) {
                Game.permanentUpgrades[slotIndex] = upgradeObj.id;
                if (!upgradeObj.bought) {
                    upgradeObj.unlocked = 1;
                    upgradeObj.bought = 1;
                    if (typeof upgradeObj.vanilla === 'undefined') {
                        upgradeObj.vanilla = 0;
                    }
                    Game.UpgradesOwned = (Game.UpgradesOwned || 0) + 1;
                    if (Game.recalculateGains !== undefined) {
                        Game.recalculateGains = 1;
                    }
                }
                menuNeedsUpdate = true;
            }
        }

        if (menuNeedsUpdate && Game.UpdateMenu) {
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            Game.UpdateMenu();
        }
    }

    function setupPermanentSlotSaveHook() {
        if (!Game || !Game.WriteSave || Game.WriteSave._permanentSlotHooked) {
            return;
        }

        var originalWriteSave = Game.WriteSave;
        Game.WriteSave = function() {
            if (!Game.permanentUpgrades || !Game.UpgradesById) {
                return originalWriteSave.apply(this, arguments);
            }

            var nameSet = getModUpgradeNameSet();
            var savedSlots = [];

            for (var i = 0; i < Game.permanentUpgrades.length; i++) {
                var id = Game.permanentUpgrades[i];
                if (typeof id === 'number' && id >= 0) {
                    var upgrade = Game.UpgradesById[id];
                    if (upgrade && nameSet[upgrade.name]) {
                        savedSlots[i] = id;
                        modPermanentSlotBackup[i] = upgrade.name;
                        Game.permanentUpgrades[i] = -1;
                    }
                }
            }

            if (Object.keys(modPermanentSlotBackup).length > 0) {
                modSettings.permanentSlotBackup = Object.assign({}, modPermanentSlotBackup);
            }

            var result = originalWriteSave.apply(this, arguments);

            for (var i = 0; i < savedSlots.length; i++) {
                if (savedSlots[i] !== undefined) {
                    Game.permanentUpgrades[i] = savedSlots[i];
                }
            }

            return result;
        };
        Game.WriteSave._permanentSlotHooked = true;
    }

    // This function saves current states before deletion - use only for mod initialization
    function recreateAllUpgradesFromSaveData() {
        capturePermanentSlotBackups();
        removeModCookieUpgradesFromPool();
        // Step 1: Save current states of ALL mod upgrades before deletion
        var modUpgradeNames = getModUpgradeNames();
        if (!modSaveData) {
            modSaveData = { upgrades: {} };
        }
        if (!modSaveData.upgrades) {
            modSaveData.upgrades = {};
        }
        
        // Save current states of all mod upgrades before removing them
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (Game.Upgrades[upgradeName]) {
                var currentBought = Game.Upgrades[upgradeName].bought || 0;
                modSaveData.upgrades[upgradeName] = { bought: currentBought };
            }
        }
        
        // Step 2: Delete ALL mod upgrades from the game
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (Game.Upgrades[upgradeName]) {
                delete Game.Upgrades[upgradeName];
            }
        }
        
        // Step 3: Recreate all upgrades from scratch
        createUpgrades();
        addUpgradesToGame();
        
        // Step 4: Apply save data states (this is the ONLY source of truth)
        if (modSaveData && modSaveData.upgrades) {
            for (var upgradeName in modSaveData.upgrades) {
                if (Game.Upgrades[upgradeName]) {
                    Game.Upgrades[upgradeName].bought = modSaveData.upgrades[upgradeName].bought || 0;
                }
            }
        }

        restoreModPermanentSlots();
        resetUnlockStateCache();
    }

    // Function for operations that don't save current states - only loads from save
    // Used for toggle operations and save loading
    function recreateUpgradesFromSaveOnly() {
        capturePermanentSlotBackups();
        removeModCookieUpgradesFromPool();
        // Step 1: Delete ALL mod upgrades from the game
        var modUpgradeNames = getModUpgradeNames();
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (Game.Upgrades[upgradeName]) {
                delete Game.Upgrades[upgradeName];
            }
        }
        
        // Step 2: Recreate all upgrades from scratch
        createUpgrades();
        addUpgradesToGame();
        
        // Step 3: Apply save data states (this is the ONLY source of truth)
        if (modSaveData && modSaveData.upgrades) {
            for (var upgradeName in modSaveData.upgrades) {
                if (Game.Upgrades[upgradeName]) {
                    Game.Upgrades[upgradeName].bought = modSaveData.upgrades[upgradeName].bought || 0;
                }
            }
        }

        restoreModPermanentSlots();
        resetUnlockStateCache();
    }

    function createKittenUpgradesIndependently() {
        // Create kitten upgrades with order assignment only if enabled
        if (enableKittenUpgrades && upgradeData.kitten && Array.isArray(upgradeData.kitten)) {
            // Sort kitten upgrades by their achievement threshold (lower thresholds first)
            var sortedKittenUpgrades = [];
            for (var i = 0; i < upgradeData.kitten.length; i++) {
                var upgradeInfo = upgradeData.kitten[i];
                
                
                // Extract threshold from unlock condition
                var threshold = 0;
                if (upgradeInfo.unlockCondition) {
                    var unlockStr = upgradeInfo.unlockCondition.toString();
                    var thresholdMatch = unlockStr.match(/>= (\d+)/);
                    if (thresholdMatch) {
                        threshold = parseInt(thresholdMatch[1]);
                    }
                }
                
                sortedKittenUpgrades.push({
                    upgrade: upgradeInfo,
                    threshold: threshold
                });
            }
            
            // Sort by threshold (lower thresholds first)
            sortedKittenUpgrades.sort(function(a, b) {
                return a.threshold - b.threshold;
            });
            
            var kittenCreated = 0;
            var kittenFailed = 0;
            for (var i = 0; i < sortedKittenUpgrades.length; i++) {
                var upgradeInfo = sortedKittenUpgrades[i].upgrade;
                
                try {
                    createKittenUpgrade(upgradeInfo);
                    kittenCreated++;
                } catch (e) {
                    kittenFailed++;
                }
            }
        }
    }

    // Function to move achievements between shadow and normal pools
    function updateAchievementPools() {
        // Loop through all our mod achievements
        for (var i = 0; i < modAchievementNames.length; i++) {
            var achievementName = modAchievementNames[i];
            var achievement = Game.Achievements[achievementName];
            
            if (achievement) {
                // Special case: "Beyond the Leaderboard" is always a shadow achievement
                if (achievementName === 'Beyond the Leaderboard') {
                    achievement.pool = 'shadow';
                    // Never modify its order - it should keep its original custom order
                    continue; // Skip the normal pool switching logic for this achievement
                }
                
                if (shadowAchievementMode) {
                    // Move to shadow pool
                    if (achievement.pool !== 'shadow') {
                        achievement.pool = 'shadow';
                        achievement.order = achievement.order + 50000;
                    }
                } else {
                    // Move to normal pool
                    if (achievement.pool === 'shadow') {
                        achievement.pool = 'normal';
                        achievement.order = achievement.order - 50000;
                    }
                }
            }
        }
        
        // Force UI update
        if (Game.updateAchievementsMenu) {
            Game.updateAchievementsMenu();
        }
        
        // Force the game to recalculate gains to update milk progress and kitten bonuses
        if (Game.CalculateGains) {
            Game.CalculateGains();
        }
    }
    
    var settingsPromptCallbacks = {};
    var settingsPromptCallbackId = 0;
    function registerSettingsPromptCallback(callback) {
        var id = 'jneSettingsPrompt_' + (++settingsPromptCallbackId);
        settingsPromptCallbacks[id] = callback;
        return id;
    }
    function runSettingsPromptCallback(id) {
        try {
            if (settingsPromptCallbacks[id]) {
                settingsPromptCallbacks[id]();
            }
        } finally {
            delete settingsPromptCallbacks[id];
        }
    }
    window.runJNESettingsPromptCallback = runSettingsPromptCallback;
    
    // Function to show confirmation prompt for major changes
    function showSettingsChangePrompt(message, callback) {
        var callbackId = registerSettingsPromptCallback(callback);
        Game.Prompt('<id SettingsChange><h3>Mod Settings Change</h3><div class="block">' + 
                   tinyIcon(modIcon) + '<div class="line"></div>' + 
                   message + '</div>', 
                   [['Yes', 'Game.ClosePrompt(); window.runJNESettingsPromptCallback("' + callbackId + '");', 'float:left'], 
                    ['No', 'Game.ClosePrompt();', 'float:right']]);
    }
    
    
    
    // Helper: Create building achievements
    function createBuildingAchievements(buildingType, names, thresholds, baseOrder, baseIcon, customIcons) {
        var achievements = [];
        var building = Game.ObjectsById[buildingType];
        if (!building) return achievements;
        
        for (var i = 0; i < names.length && i < thresholds.length; i++) {
            var amount = thresholds[i];
            var name = names[i];
            var buildingLabel = building.plural || (building.single + 's');
            var desc = "Own <b>" + amount + " "+ buildingLabel + "</b>.";
            var requirement = (function(buildingType, amount) {
                return function() { 
                    var buildingObj = Game.ObjectsById[buildingType];
                    var currentAmount = buildingObj ? buildingObj.amount : 0;
                    var shouldUnlock = buildingObj && currentAmount >= amount;
                
                    return shouldUnlock;
                };
            })(buildingType, amount);
            
            var customIcon = customIcons && customIcons[i] ? customIcons[i] : null;
            var ach = createAchievement(name, desc, baseIcon, baseOrder + (i + 1) * 0.01, requirement, customIcon);
            if (ach) {
                achievements.push(ach);
            }
        }
        
        return achievements;
    }
    
    
    
    // Helper: Create requirement function based on type
    // Shared function to count garden plants
    function countGardenPlants() {
        if (!Game.Objects['Farm'] || !Game.Objects['Farm'].minigame) return { unlocked: 0, total: 0 };
        
        var M = Game.Objects['Farm'].minigame;
        
        // Use vanilla game's built-in counters
        return { unlocked: M.plantsUnlockedN || 0, total: M.plantsN || 0 };
    }
    
    // Helper function to output garden status for debugging
    function logGardenStatus() {
        if (!Game.Objects['Farm'] || !Game.Objects['Farm'].minigame) {
            console.log('Garden not available');
            return;
        }
        
        var M = Game.Objects['Farm'].minigame;
        if (!M.plot || !M.plantsById) {
            console.log('Garden plot or plants data not available');
            return;
        }
        
        console.log('=== GARDEN STATUS ===');
        console.log('Plot size:', M.plot.length + 'x' + (M.plot[0] ? M.plot[0].length : 0));
        console.log('Soil type:', M.soil || 'none');
        console.log('');
        
        // Output each plot position with plant and maturity info
        for (var y = 0; y < M.plot.length; y++) {
            var row = 'Row ' + y + ': ';
            for (var x = 0; x < M.plot[y].length; x++) {
                var plotData = M.plot[y][x];
                if (plotData && plotData[0] > 0) {
                    var plantId = plotData[0] - 1; // Plant IDs are 1-indexed
                    var plantAge = plotData[1];
                    var plant = M.plantsById[plantId];
                    
                    if (plant) {
                        var isMature = plantAge >= plant.mature;
                        var maturityStatus = isMature ? 'MATURE' : (plantAge + '/' + plant.mature);
                        row += plant.name + '(' + maturityStatus + ') ';
                    } else {
                        row += 'UnknownPlant(' + plantId + ') ';
                    }
                } else {
                    row += 'EMPTY ';
                }
            }
            console.log(row);
        }
        console.log('=== END GARDEN STATUS ===');
    }
    
    // Make logGardenStatus available globally
    window.logGardenStatus = logGardenStatus;
    
    // Centralized function to count challenge achievements won
    function countChallengeAchievements() {
        var challengeAchievementNames = ['Hardercorest', 'Hardercorest-er', 'The Final Countdown', 'Really more of a dog person', 'Gilded Restraint', 'Back to Basic Bakers', 'Modest Portfolio', 'Difficult Decisions', 'Laid in Plain Sight', 'I feel the need for seed', 'Holiday Hoover', 'Merry Mayhem', 'Second Life, First Click', 'We don\'t need no heavenly chips', 'Precision Nerd', 'Treading water', 'Bouncing the last cheque', 'Massive Inheritance'];
        var wonCount = 0;
        for (var i = 0; i < challengeAchievementNames.length; i++) {
            var achievementName = challengeAchievementNames[i];
            if (Game.Achievements[achievementName] && Game.Achievements[achievementName].won) {
                wonCount++;
            }
        }
        return wonCount;
    }
    //the switch achivement checking system is a bit dated but we still use it for simple checks
    function createRequirementFunction(type, threshold) {
        return function() {
            try {
                switch(type) {
                    case 'cps':
                        return Game.cookiesPsRaw >= threshold;
                    case 'click':
                        // Special case for Click of the Titans achievement
                        if (threshold === "clickOfTitans") {
                            return false; // Always false, achievement is awarded directly
                        }
                        return Game.handmadeCookies >= threshold;
                    case 'wrinkler':
                        return getLifetimeWrinklers() >= threshold;
                    case 'shinyWrinkler':
                        // Track shiny wrinklers popped (me.type==1)
                        return getLifetimeShinyWrinklers() >= threshold;
                    case 'reindeer':
                        return getLifetimeReindeer() >= threshold;
                    case 'goldenCookies':
                        return Game.goldenClicks >= threshold;
                    case 'wrathCookies':
                        return getLifetimeWrathCookies() >= threshold;
                    case 'gardenSacrifices':
                        return getLifetimeGardenSacrifices() >= threshold;
                    case 'cookieClicks':
                        return getLifetimeCookieClicks() >= threshold;
                    case 'stockMarketAssets':
                        return getLifetimeStockMarketAssets() >= threshold;
                    case 'spell':
                        // Check if the wizard tower minigame exists and has spells cast
                        return Game.Objects['Wizard tower'].minigame && 
                               Game.Objects['Wizard tower'].minigame.spellsCastTotal >= threshold;
                    case 'freeSugarLump':
                        // Check if we have the "free sugar lump" outcome from FtHoF
                        if (!modTracking.fthofCookieOutcomes || modTracking.fthofCookieOutcomes.length === 0) {
                            return false;
                        }
                        return modTracking.fthofCookieOutcomes.some(o => o.outcome === 'free sugar lump');
                    case 'gardenHarvest':
                        // Check if the garden minigame exists and has plants harvested
                        return Game.Objects['Farm'].minigame && 
                               Game.Objects['Farm'].minigame.harvestsTotal >= threshold;
                    case 'cookiesAscension':
                        return (Game.cookiesEarned || 0) >= threshold;
                    case 'forfeited':
                        // Check total cookies forfeited across all ascensions
                        return (Game.cookiesReset || 0) >= threshold;
                    case 'totalBuildings':
                        // Calculate total buildings owned
                        var buildingsOwned = 0;
                        for (var i in Game.Objects) {
                            buildingsOwned += Game.Objects[i].amount;
                        }
                        return buildingsOwned >= threshold;
                    case 'everything':
                        // Check if every building type has at least the threshold amount
                        var minAmount = 100000;
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= threshold;
                  case 'seedlog':
                        var lifetimeGardenSacrifices = getLifetimeGardenSacrifices();
                        return lifetimeGardenSacrifices >= threshold;
                    case 'kittensOwned':
                        var kittens = 0;
                        for (var i = 0; i < Game.UpgradesByPool['kitten'].length; i++) {
                            if (Game.Has(Game.UpgradesByPool['kitten'][i].name)) kittens++;
                        }
                        return kittens >= threshold;
                    case 'allKittensOwned':
                        // Count all kittens (original + expansion) - check both vanilla kitten upgrades and mod kitten upgrades
                        var totalKittens = 0;
                        // Safety check: ensure kitten systems are properly initialized
                        if (!Game.UpgradesByPool['kitten'] || !upgradeData.kitten) {
                            debugLog('[Kitten Debug] Kitten systems not fully initialized, deferring achievement check');
                            return false;
                        }
                        
                        // Safety check: ensure game is fully loaded and kitten systems are ready
                        if (Game.UpgradesByPool['kitten'].length === 0 || upgradeData.kitten.length === 0) {
                            debugLog('[Kitten Debug] Kitten systems not ready, deferring achievement check');
                            return false;
                        }
                        
                        // Count original kittens
                        for (var i = 0; i < Game.UpgradesByPool['kitten'].length; i++) {
                            var kitten = Game.UpgradesByPool['kitten'][i];
                            if (Game.Has(kitten.name)) {
                                totalKittens++;
                            }
                        }
                        
                        // Count expansion kittens
                        for (var i = 0; i < upgradeData.kitten.length; i++) {
                            var upgradeInfo = upgradeData.kitten[i];
                            if (Game.Has(upgradeInfo.name)) {
                                totalKittens++;
                            }
                        }
                        
                        return totalKittens >= threshold;
                    case 'reincarnate':
                        return Game.resets >= threshold;
                    case 'stockmarket':
                        // For negative thresholds (losses), check current run profit only
                        // For positive thresholds (gains), check lifetime total
                        if (threshold < 0) {
                            if (!Game.Objects['Bank'].minigame) return false;
                            return Game.Objects['Bank'].minigame.profit <= threshold;
                        } else {
                            var lifetimeStockMarket = getLifetimeStockMarketAssets();
                            return lifetimeStockMarket >= threshold;
                        }
                    case 'stockBrokers':
                        if (!Game.Objects['Bank'].minigame) return false;
                        return (Game.Objects['Bank'].minigame.brokers || 0) >= threshold;
                    case 'theFinalChallenger':
                        // Check if threshold challenge achievements are won (uses centralized count function)
                        return countChallengeAchievements() >= threshold;
                    case 'butterBiscuit750':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 750;
                    case 'butterBiscuit800':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 800;
                    case 'butterBiscuit850':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 850;
                    case 'butterBiscuit900':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 900;
                    case 'butterBiscuit950':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 950;
                    case 'butterBiscuit1000':
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 1000;
                    case 'gardenSeedsTime':
                        // Check if all garden seeds are unlocked within the time limit
                        var plantCount = countGardenPlants();
                        
                        // Check if we have a sacrifice time
                        if (!lifetimeData.lastGardenSacrificeTime) {
                            return false;
                        }
                        
                        var currentTime = Date.now();
                        var timeElapsed = currentTime - lifetimeData.lastGardenSacrificeTime;
                        
                        // Check if all plants are unlocked
                        if (plantCount.unlocked < plantCount.total) {
                            return false;
                        }
                        
                        return timeElapsed <= threshold;
                    case 'seasonalDropsTime':
                        // Check if all seasonal drops are collected within the time limit
                        if (!Game.startDate) return false; // No start date means achievement not unlocked
                        
                        var currentTime = Date.now();
                        var timeElapsed = currentTime - Game.startDate;
                        
                        // Check if within time limit first
                        if (timeElapsed > threshold) return false;
                        
                        // Check Easter condition
                        var easterComplete = Game.GetHowManyEggs && Game.GetHowManyEggs() >= 20;
                        
                        // Check Halloween condition
                        var halloweenComplete = Game.Has('Skull cookies') && Game.Has('Ghost cookies') && 
                                              Game.Has('Bat cookies') && Game.Has('Slime cookies') && 
                                              Game.Has('Pumpkin cookies') && Game.Has('Eyeball cookies') && 
                                              Game.Has('Spider cookies');
                        
                        // Check Christmas condition
                        var christmasComplete = Game.Has('Christmas tree biscuits') && Game.Has('Snowflake biscuits') && 
                                               Game.Has('Snowman biscuits') && Game.Has('Holly biscuits') && 
                                               Game.Has('Candy cane biscuits') && Game.Has('Bell biscuits') && 
                                               Game.Has('Present biscuits');
                        
                        // Check Valentine's condition - probably want to test all biscuits here, prism is last earned but it can be carried over
                        var valentinesComplete = Game.Has('Prism heart biscuits');
                        
                        return easterComplete && halloweenComplete && christmasComplete && valentinesComplete;
                    
                    case 'cookieClicks':
                        return getLifetimeCookieClicks() >= threshold;
                    case 'pledges':
                        var lifetimePledges = getLifetimePledges();
                        return lifetimePledges >= threshold;
                    case 'prestigeUpgrades':
                        var prestigeUpgradesOwned = 0;
                        for (var i in Game.Upgrades) {
                            if (Game.Upgrades[i].bought && Game.Upgrades[i].pool == 'prestige') prestigeUpgradesOwned++;
                        }
                        return prestigeUpgradesOwned >= threshold;
                    case 'allBuildingsLevel10':
                        // Check if all buildings are at level 10 or higher
                        for (var buildingName in Game.Objects) {
                            var building = Game.Objects[buildingName];
                            if (!building || building.level < threshold) {
                                return false;
                            }
                        }
                        return true;
                    case 'seasonSwitches':
                        // Check if season switches count meets threshold
                        return (Game.seasonUses || 0) >= threshold;
                    case 'seasonalReindeer':
                        return true; // Always return true as these are handled elsewhere
                    case 'sugarLumps':
                        // Check if sugar lumps count meets threshold
                        return (Game.lumps || 0) >= threshold;
                
                
                    case 'templeSwaps':
                        // Check if temple swaps count meets threshold
                        if (threshold === 100) {
                            return (modTracking.templeSwapsTotal || 0) >= threshold;
                        } else if (threshold === 86400) {
                            // Check if all gods have been used for at least 24 hours
                            var allGodsUsed = true;
                            var requiredTime = 86400 * 1000; // milliseconds
                            // Get the complete list of all available gods from the pantheon
                            var allAvailableGods = [];
                            if (Game.Objects['Temple'] && Game.Objects['Temple'].minigame && Game.Objects['Temple'].minigame.godsById) {
                                var pantheon = Game.Objects['Temple'].minigame;
                                for (var i = 0; i < pantheon.godsById.length; i++) {
                                    if (pantheon.godsById[i] && pantheon.godsById[i].name) {
                                        allAvailableGods.push(pantheon.godsById[i].name);
                                    }
                                }
                            }
                            
                            // Check each available god's total time
                            for (var i = 0; i < allAvailableGods.length; i++) {
                                var godName = allAvailableGods[i];
                                
                                // Get the tracked time for this god (default to 0 if never used)
                                var godTime = modTracking.godUsageTime[godName] || 0;
                                
                                if (godTime < requiredTime) {
                                    allGodsUsed = false;
                                    break;
                                }
                            }
                            
                            // Only return true if we have gods available AND all were used enough
                            // This prevents false positive when pantheon is not loaded
                            return allGodsUsed && allAvailableGods.length >= 10;
                        }
                        return false;
                    case 'soilChanges':
                        // Check if soil changes count meets threshold
                        return (modTracking.soilChangesTotal || 0) >= threshold;
                    case 'buildingsSold':
                        // Calculate total buildings sold using a shared helper
                        return getBuildingsSoldTotal() >= threshold;
                    case 'tickerClicks':
                        // Check if ticker clicks count meets threshold
                        return (Game.TickerClicks || 0) >= threshold;
                    case 'wrathCookies':
                        // Check if wrath cookie clicks count meets threshold
                        return getLifetimeWrathCookies() >= threshold;
                    case 'goldenCookieTime':
                        // Check if a golden cookie was clicked within the time limit
                        if (!Game.startDate) return false; // No start date means achievement not unlocked
                        
                        var currentTime = Date.now();
                        var timeElapsed = currentTime - Game.startDate;
                        
                        // Check if within time limit and golden cookie was clicked (this run only)
                        return timeElapsed <= threshold && (Game.goldenClicksLocal || 0) > 0;
                    case 'wrinklerTime':
                        // Check if a wrinkler was popped within the time limit
                        if (!Game.startDate) return false; // No start date means achievement not unlocked
                        
                        var currentTime = Date.now();
                        var timeElapsed = currentTime - Game.startDate;
                        
                        // Check if within time limit and wrinkler was popped (this run only)
                        // Prefer our session delta if available; fallback to Game.wrinklersPopped
                        var wrinklersThisRun = (sessionDeltas && typeof sessionDeltas.wrinklersPopped === 'number')
                            ? sessionDeltas.wrinklersPopped
                            : (Game.wrinklersPopped || 0);
                        return timeElapsed <= threshold && wrinklersThisRun > 0;
                    case 'wrinklerBankDouble':
                        // Check if bank was sextupled by a wrinkler pop
                        return modTracking.bankSextupledByWrinkler || false;
                    case 'hardcoreNoHeavenly':
                        // Check if player owns Heavenly chip secret upgrade
                        if (Game.Has('Heavenly chip secret')) return false;
                        
                        // Check if player has at least threshold amount of every building type
                        for (var buildingName in Game.Objects) {
                            var building = Game.Objects[buildingName];
                            if (!building || building.amount < threshold) {
                                return false;
                            }
                        }
                        
                        return true;
                   
                    case 'hardcoreNoGoldenCookies':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        if ((Game.cookiesEarned || 0) < threshold) return false;
                        if ((Game.goldenClicksLocal || 0) > 0) return false;
                        
                        return true;
                    case 'hardcoreCursorsAndGrandmas':
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        if ((Game.cookiesPs || 0) < threshold) return false;
                        
                        // Check if any buildings other than Cursors and Grandmas have ever been bought
                        for (var buildingName in Game.Objects) {
                            if (buildingName !== 'Cursor' && buildingName !== 'Grandma') {
                                var building = Game.Objects[buildingName];
                                var bought = building.bought || 0;
                                if (bought > 0) {
                                    return false; // They ever owned this building type
                                }
                            }
                        }
                        
                        return true;
                    case 'hardcoreModestPortfolio':
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        if ((Game.cookiesEarned || 0) < threshold) return false;
                        
                        // Check if any building has more than 10 of that type
                        for (var buildingName in Game.Objects) {
                            if ((Game.Objects[buildingName].amount || 0) > 10) {
                                return false;
                            }
                        }
                        
                        // Check if any buildings have been sold
                        var modestBuildingsSold = 0;
                        for (var buildingName in Game.Objects) {
                            var building = Game.Objects[buildingName];
                            var bought = building.bought || 0;
                            var amount = building.amount || 0;
                            var sold = bought - amount;
                            modestBuildingsSold += Math.max(0, sold);
                        }
                        if (modestBuildingsSold > 0) return false;
                        
                        return true;
                    case 'hardcoreDifficultDecisions':
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Count total buildings owned
                        var difficultDecisionsBuildingsOwned = 0;
                        for (var buildingName in Game.Objects) {
                            difficultDecisionsBuildingsOwned += (Game.Objects[buildingName].amount || 0);
                        }
                        
                        // Count total upgrades owned
                        var totalUpgradesOwned = Game.UpgradesOwned || 0;
                        
                        // Calculate current combined total
                        var currentCombinedTotal = difficultDecisionsBuildingsOwned + totalUpgradesOwned;
                        
                        // Update the maximum combined total for this run
                        if (!currentRunData.maxCombinedTotal) currentRunData.maxCombinedTotal = 0;
                        if (currentCombinedTotal > currentRunData.maxCombinedTotal) {
                            currentRunData.maxCombinedTotal = currentCombinedTotal;
                        }
                        
                        // Check if the maximum combined total for this run ever exceeded 25
                        if (currentRunData.maxCombinedTotal > 25) {
                            return false;
                        }
                        
                        // Check if player has baked enough cookies
                        if ((Game.cookiesEarned || 0) < threshold) return false;
                        
                        return true;
                    case 'hardcoreLaidInPlainSight':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet) Laid in Plain Sight
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if player has enough cookies per second
                        if ((Game.cookiesPsRaw || 0) < threshold) return false;
                        
                        // Check if any buildings have been purchased
                        for (var buildingName in Game.Objects) {
                            if ((Game.Objects[buildingName].bought || 0) > 0) {
                                return false;
                            }
                        }
                        
                        return true;
                    case 'hardcorePrecisionNerd':
                        // Check if player has the required amount of cookies (accounting for decimal precision)
                        // Accept values within ±1 of the threshold
                        if (Game.cookies < (threshold - 1) || Game.cookies > (threshold + 1)) {
                            // Reset timer if amount is wrong
                            if (currentRunData.precisionNerdTimer) {
                                currentRunData.precisionNerdTimer = null;
                            }
                            return false;
                        }
                        
                        // Initialize timer if not already started
                        if (!currentRunData.precisionNerdTimer) {
                            currentRunData.precisionNerdTimer = Date.now();
                        }
                        
                        // Check if 60 seconds have passed
                        var elapsedTime = (Date.now() - currentRunData.precisionNerdTimer) / 1000;
                        if (elapsedTime >= 60) {
                            // Achievement completed, reset timer
                            currentRunData.precisionNerdTimer = null;
                            return true;
                        }
                        
                        return false;
                    case 'hardcoreTreadingWater':

                        // Check if Solgreth is slotted
                        var M = Game.Objects['Temple']?.minigame;
                        if (M && Game.hasGod('selfishness')) {
                            return false;
                        }
                        
                        // Check if CPS is 0 or negative (with wrinkler sucking)
                        var cpsCondition = (Game.cookiesPs <= 0) || (Game.cpsSucked >= 1);
                        if (!cpsCondition) {
                            debugLog('hardcoreTreadingWater: CPS condition not met, cookiesPs:', Game.cookiesPs, 'cpsSucked:', Game.cpsSucked);
                            return false;
                        }
                        
                        // Check if total buildings owned is more than 1000
                        var totalBuildings = 0;
                        for (var buildingName in Game.Objects) {
                            totalBuildings += (Game.Objects[buildingName].amount || 0);
                        }
                        if (totalBuildings <= 1000) {
                            debugLog('hardcoreTreadingWater: Building count not met, totalBuildings:', totalBuildings);
                            return false;
                        }
                        
                        debugLog('hardcoreTreadingWater: All conditions met, cookiesPs:', Game.cookiesPs, 'cpsSucked:', Game.cpsSucked, 'totalBuildings:', totalBuildings);
                        
                        // Check if no buffs are active
                        var currentBuffs = Object.keys(Game.buffs).length;
                        if (currentBuffs !== 0) return false;
                        
                        return true;
                    case 'hardcoreBouncingLastCheque':
                        // Check if player has earned at least 1 million cookies
                        if ((Game.cookiesEarned || 0) < 1000000) return false;
                        
                        // Check if current bank has less than 10 cookies
                        if ((Game.cookies || 0) >= 11) return false;
                        
                        return true;
                    case 'hardcoreMassiveInheritance':
                        // Have a bank of at least 1 novemdecillion within 10 minutes of ascending (any mode)
                        if (!Game.startDate) return false;
                        var now = Date.now();
                        var elapsed = now - Game.startDate;
                        if (elapsed > 600000) return false; // 10 minutes in ms
                        return (Game.cookies || 0) >= 1e60;
                    case 'orderEternalCookie':
                        // Check if the "Order of the Eternal Cookie" upgrade is owned
                        return Game.Has('Order of the Eternal Cookie');
                    
                    // These achievement types are handled by checkModAchievements() instead
                    // Stub cases to prevent warnings - actual checking happens elsewhere
                    case 'buffs':
                    case 'goldenWrinkler':
                    case 'hardercorest':
                    case 'hardercorester':
                    case 'hardcoreFinalCountdown':
                    case 'hardcoreNoKittens':
                    case 'vanillaAchievements':
                    case 'botanicalPerfection':
                        return false; // Handled by checkModAchievements()

                    default:
                        console.warn('Unknown achievement type:', type);
                        return false;
                }
            } catch (e) {
                console.warn('Error in requirement function for type:', type, e);
                return false;
            }
        };
    }
    
    // Flavor text data structure for achievements, these are required for building achivements since we build them in bulk
    var achievementFlavorText = {
        // Building achievements
        "Council of Me": "All in favor? Aye, aye, aye. Motion passes unanimously...again.",
        "I, Legion": "We are many; bring plates. HR insists you can't unionize with yourself.",
        "Galaxy brain, local oven": "Big ideas, small kitchen. The cosmos smells like sugar.",
        "The bakery at the end of everything": "I was told it was suppose to be a restaurant, is it a bakery in a restaurant or something?",
        "Crossover episode": "Previously, on every timeline. Guest stars: everyone who ever existed.",
        "Meanwhile, in a parallel tab": "Other you forgot to savescrum. That's why this you is in charge.",
        "console.log('crumbs')": "Output: irresistible.",
        "The set contains you": "And you contain you too.",
        "The limit does not exist": "Convergence tastes like triumph, and a little bit like cookies.",
        "Hand of Fate: Full House": "All in, all yum. Destiny deals from the bottom of the tin.",
        "Strange attractor, stranger baker": "Chaos, but tasty.",
        "Gambler's fallacy, baker's edition": "This cookie is due. Mathematics disagrees; your streak doesn't.",
        "RNG on the range": "Home, home on the variance. Where the odds and the bytecodes play.",
        "Devour the spectrum": "Seven flavors, one bite. The aftertaste is sunrise.",
        "Emperor of mass": "Heavier lies the crown.",
        "Twenty years away (always)": "Sometimes it is fifteen years but those people are just crazy.",
        "Next week's news, fresh today": "Spoiler: cookies trend up.",
        "Déjà chewed": "Haven't we eaten this cookie already?",
        "Out past the exit sign": "Even the arrows get lost. Your compass now points to 'hmm.'",
        "Glitch in the Crumbatrix": "There is no spoon, only spatula. Déjà vu tastes like vanilla.",
        "Contents may phase in transit": "Some assembly of atoms required. Warranty void if observed.",
        "Postmaster Galactic": "Neither snow nor ion storms nor the heat death of the universe shall stay these couriers.",
        "Return to sender: event horizon": "Once the price goes in, no refunds escape. That's just physics and policy.",
        "Porch pirates of Andromeda": "They leave polite ransom notes in nebula ink. You leave decoy boxes full of kale.",
        "Tracking number: ∞": "Estimated arrival: yes. Please allow several lifetimes for delivery.",
        "Door-to-airlock": "Signature required: beep or boop.",
        "Is this your cardamom?": "Ta-da: it was in your scone all along. The crowd gasps; the wizard bows.",
        "Glitter is a material component": "Cast Clean-Up at level 9. Sparkle is forever; dignity is not.",
        "Om-nom-nipotent": "All-powerful, all-devouring, lightly buttered. The universe is mercifully double chocolate.",
        "Pilgrimage of crumbs": "The path is sticky but true. Pilgrims arrive lighter; leave heavier.",
        "Monk mode": "Silent, except for the constant chewing. Enlightenment tastes like warm sugar.",
        "Number go up economics": "Our favorite graph direction. If it doesn't go up just turn it upside down.",
        "Planned obsolescence": "Make sure to deny doing it.",
        "Stalag-might": "Rock-solid character growth. Drip by drip, your empire ossifies.",
        "Little house on the dairy": "Where the butter churns and the plot thickens. Family drama, farm-fresh.",
        "Field of creams": "If you churn it, they will come.",
        "Okay elder": "Respect your elders.",
        "The crinkle collective": "United they stand, divided they nap. Either way, production spikes.",
        "Phalanx formation": "Ten tiny soldiers. The enemy is the latency itself.",
        "Finger guns": "Pew-pew-click-click. Safety's off, cooldown's zero.",
        "First Person Plural (Lv 20)": "We did it. We're very proud of us.",
        "Keeper of the Uncountable (Lv 20)": "You file realities by vibe and it somehow works.",
        "Minute handler (Lv 15)": "You juggle sixty little problems every hour. None hit the floor.",
        "Quartermaster of Orbits (Lv 15)": "Every orbit is a delivery route if you squint.",
        "Master of the Mint (Lv 20)": "The dies sing your name, and the coins chorus back.",
        "Click II: the sequel": "Bigger budget, lazier plot: more clicks, less character development. Critics agree: it still slaps.",
        "Click III: we couldn't get Adam Sandler so it stars Jerry Seinfeld for some reason": "What's the deal with cursors? They're always pointing!",
        "Click IV: 3% fresh on rotten tomatoes": "So bad it loops around to cult classic.",
        "Seismic yield": "Returns measured on the Richter scale. Aftershocks include spontaneous high-fives.",
        "Cookieconomics 101": "Intro course: supply rises with temperature. Final exam is edible.",
        "Compound interest, compounded": "Interest on interest until your spreadsheet looks like fan fiction. The good kind.",
        "Ponzi à la mode": "Layered promises topped with denial and a cherry. Served cold; collapses when warm.",
        "Temple treasury overflow": "When tithes exceed trusses, build a bigger plate. Miracles audited quarterly.",
        "Magic dividends": "Don't show this to the auditors; line item reads 'Enchantment Revenue.' It balances itself. Literally.",
        "Hocus bonus": "Management discovered magic works better than memos. Apply spell to receive perk.",
        "Cargo cult classic": "Wave the sticks, chant the SKU, and somehow the crates arrive. Five stars, would invoke again.",
        "Universal basic shipping": "A package for every citizen, and a new citizen for every package. Policy approved by the cosmos.",
        "Interdimensional yield farming": "Seed in Alpha, harvest in Beta, sell in the universe with the best exchange rate. Mind the customs.",
        "Future Profits, Past Tense": "We booked the gains before we made them. Time travel is the ultimate accrual.",
        "Infinite Loop, Infinite Loot": "while(true){click++; profit++;} // HR says you can take a break, theoretically.",
        "Back Pay from the Big Bang": "Retroactive compensation for 13.8 billion years of opportunity cost. Payroll needed a bigger field.",
        "Fate-backed securities": "AAA-rated by the Fates themselves.",
        "Infinite series surplus": "Each term is small; the sum is outrageous. Convergence has never tasted so decadent.",
        "Crossover dividends": "Your other selves paid out because you remembered to in this timeline. That's synergy.",
        "Many-Worlds ROI": "Every outcome wins somewhere; you're just skimming the multiversal mean.",
        "Personal growth": "You leveled up and took yourself with you.",
        "Economies of selves": "Clones cooperate, margins explode. HR insists you can't unionize with yourself."
    };

    // Achievement data structure
    var achievementData = {
        buildings: {
            cursor: {
                names: ["Carpal diem", "Hand over fist", "Finger guns", "Thumbs up, buttercup", "Pointer sisters", "Knuckle sandwich", "Phalanx formation", "Manual override", "Clickbaiter-in-chief", "With flying digits", "Palm before the storm"],
                thresholds: [1100, 1150, 1250, 1300, 1400, 1450, 1550, 1600, 1700, 1750, 1850],
                vanillaTarget: "A round of applause",
                customIcons: [[0, 0, getSpriteSheet('custom')], [0, 1, getSpriteSheet('custom')], [0, 2, getSpriteSheet('custom')], [0, 3, getSpriteSheet('custom')], [0, 4, getSpriteSheet('custom')], [0, 5, getSpriteSheet('custom')], [0, 6, getSpriteSheet('custom')], [0, 7, getSpriteSheet('custom')], [0, 8, getSpriteSheet('custom')], [0, 9, getSpriteSheet('custom')], [0, 10, getSpriteSheet('custom')]]            },
            'grandma': {
                names: ["All rise for Nana", "The crinkle collective", "Okay elder", "Wrinkle monarchy", "The wrinkling hour", "Matriarchal meltdown", "Cookies before crones", "Dust to crust", "Bingo bloodbath", "Supreme doughmother", "The last custodian"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "And now you're even older",
                customIcons: [[1, 0, getSpriteSheet('custom')], [1, 1, getSpriteSheet('custom')], [1, 2, getSpriteSheet('custom')], [1, 3, getSpriteSheet('custom')], [1, 4, getSpriteSheet('custom')], [1, 5, getSpriteSheet('custom')], [1, 6, getSpriteSheet('custom')], [1, 7, getSpriteSheet('custom')], [1, 8, getSpriteSheet('custom')], [1, 9, getSpriteSheet('custom')], [1, 10, getSpriteSheet('custom')]]
            },
            'farm': {
                names: ["Little house on the dairy", "The plow thickens", "Cabbage patch dynasty", "Grazing amazement", "Field of creams", "Barn to be wild", "Crops and robbers", "Shoveling it in", "Seed syndicate", "Harvest high table", "Emperor of dirt"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Au naturel",
                customIcons: [[2, 0, getSpriteSheet('custom')], [2, 1, getSpriteSheet('custom')], [2, 2, getSpriteSheet('custom')], [2, 3, getSpriteSheet('custom')], [2, 4, getSpriteSheet('custom')], [2, 5, getSpriteSheet('custom')], [2, 6, getSpriteSheet('custom')], [2, 7, getSpriteSheet('custom')], [2, 8, getSpriteSheet('custom')], [2, 9, getSpriteSheet('custom')], [2, 10, getSpriteSheet('custom')]]
            },
            'mine': {
                names: ["Shafted", "Shiny object syndrome", "Ore what?", "Rubble without a cause", "Tunnel visionaries", "Stalag-might", "Pyrite and prejudice", "Bedrock 'n roll", "Mantle management", "Hollow crown jewels", "Emperor of ore"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Dirt-rich",
                customIcons: [[3, 0, getSpriteSheet('custom')], [3, 1, getSpriteSheet('custom')], [3, 2, getSpriteSheet('custom')], [3, 3, getSpriteSheet('custom')], [3, 4, getSpriteSheet('custom')], [3, 5, getSpriteSheet('custom')], [3, 6, getSpriteSheet('custom')], [3, 7, getSpriteSheet('custom')], [3, 8, getSpriteSheet('custom')], [3, 9, getSpriteSheet('custom')], [3, 10, getSpriteSheet('custom')]]
            },
            'factory': {
                names: ["Assembly required", "Quality unassured", "Error 404-manpower not found", "Spare parts department", "Conveyor belters", "Planned obsolescence", "Punch-card prophets", "Rust in peace", "Algorithm and blues", "Profit motive engine", "Lord of the assembly"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Bots build bots",
                customIcons: [[4, 0, getSpriteSheet('custom')], [4, 1, getSpriteSheet('custom')], [4, 2, getSpriteSheet('custom')], [4, 3, getSpriteSheet('custom')], [4, 4, getSpriteSheet('custom')], [4, 5, getSpriteSheet('custom')], [4, 6, getSpriteSheet('custom')], [4, 7, getSpriteSheet('custom')], [4, 8, getSpriteSheet('custom')], [4, 9, getSpriteSheet('custom')], [4, 10, getSpriteSheet('custom')]]
            },
            'bank': {
                names: ["Petty cash splash", "The Invisible Hand That Feeds", "Under-mattress banking", "Interest-ing times", "Fee-fi-fo-fund", "Liquidity theater", "Risk appetite: unlimited", "Quantitative cheesing", "Number go up economics", "Sovereign cookie fund", "Seigniorage supreme"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Getting that bag",
                customIcons: [[13, 0, getSpriteSheet('custom')], [13, 1, getSpriteSheet('custom')], [13, 2, getSpriteSheet('custom')], [13, 3, getSpriteSheet('custom')], [13, 4, getSpriteSheet('custom')], [13, 5, getSpriteSheet('custom')], [13, 6, getSpriteSheet('custom')], [13, 7, getSpriteSheet('custom')], [13, 8, getSpriteSheet('custom')], [13, 9, getSpriteSheet('custom')], [13, 10, getSpriteSheet('custom')]]
            },
            'temple': {
                names: ["Monk mode", "Ritual and error", "Chant and deliver", "Incensed and consecrated", "Shrine of the times", "Hallowed be thy grain", "Relic and roll", "Pilgrimage of crumbs", "The cookie pantheon", "Tithes and cookies", "Om-nom-nipotent"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "The leader is good, the leader is great",
                customIcons: [[14, 0, getSpriteSheet('custom')], [14, 1, getSpriteSheet('custom')], [14, 2, getSpriteSheet('custom')], [14, 3, getSpriteSheet('custom')], [14, 4, getSpriteSheet('custom')], [14, 5, getSpriteSheet('custom')], [14, 6, getSpriteSheet('custom')], [14, 7, getSpriteSheet('custom')], [14, 8, getSpriteSheet('custom')], [14, 9, getSpriteSheet('custom')], [14, 10, getSpriteSheet('custom')]]
            },
            'wizard tower': {
                names: ["Is this your cardamom?", "Rabbit optional, hat mandatory", "Wand and done", "Critical spellcheck failed", "Tome Raider", "Prestidigitation station", "Counterspell culture", "Glitter is a material component", "Evocation nation", "Sphere of influence", "The Last Archmage"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "You don't think they could've used... it couldn't have been ma-",
                customIcons: [[15, 0, getSpriteSheet('custom')], [15, 1, getSpriteSheet('custom')], [15, 2, getSpriteSheet('custom')], [15, 3, getSpriteSheet('custom')], [15, 4, getSpriteSheet('custom')], [15, 5, getSpriteSheet('custom')], [15, 6, getSpriteSheet('custom')], [15, 7, getSpriteSheet('custom')], [15, 8, getSpriteSheet('custom')], [15, 9, getSpriteSheet('custom')], [15, 10, getSpriteSheet('custom')]]
            },
            'shipment': {
                names: ["Door-to-airlock", "Contents may shift in zero-G", "Fragile: vacuum inside", "Cosmic courier service", "Porch pirates of Andromeda", "Tracking number: ∞", "Relativistic courier", "Orbital rendezvous only", "Return to sender: event horizon", "Address: Unknown Quadrant", "Postmaster Galactic"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Signed, sealed, delivered",
                customIcons: [[5, 0, getSpriteSheet('custom')], [5, 1, getSpriteSheet('custom')], [5, 2, getSpriteSheet('custom')], [5, 3, getSpriteSheet('custom')], [5, 4, getSpriteSheet('custom')], [5, 5, getSpriteSheet('custom')], [5, 6, getSpriteSheet('custom')], [5, 7, getSpriteSheet('custom')], [5, 8, getSpriteSheet('custom')], [5, 9, getSpriteSheet('custom')], [5, 10, getSpriteSheet('custom')]]
            },
            'alchemy lab': {
                names: ["Stir-crazy crucible", "Flask dance", "Beaker than fiction", "Alloy-oop", "Distill my beating heart", "Lead Zeppelin", "Hg Wells", "Fe-fi-fo-fum", "Breaking bread with Walter White", "Prima materia manager", "The Philosopher's Scone"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Sugar, spice, and everything nice",
                customIcons: [[6, 0, getSpriteSheet('custom')], [6, 1, getSpriteSheet('custom')], [6, 2, getSpriteSheet('custom')], [6, 3, getSpriteSheet('custom')], [6, 4, getSpriteSheet('custom')], [6, 5, getSpriteSheet('custom')], [6, 6, getSpriteSheet('custom')], [6, 7, getSpriteSheet('custom')], [6, 8, getSpriteSheet('custom')], [6, 9, getSpriteSheet('custom')], [6, 10, getSpriteSheet('custom')]]
            },
            'portal': {
                names: ["Open sesameseed", "Mind the rift", "Doorway to s'moreway", "Contents may phase in transit", "Wormhole warranty voided", "Glitch in the Crumbatrix", "Second pantry to the right", "Liminal sprinkles", "Please do not feed the void", "Echoes from the other oven", "Out past the exit sign"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Not even remotely close to Kansas anymore",
                customIcons: [[7, 0, getSpriteSheet('custom')], [7, 1, getSpriteSheet('custom')], [7, 2, getSpriteSheet('custom')], [7, 3, getSpriteSheet('custom')], [7, 4, getSpriteSheet('custom')], [7, 5, getSpriteSheet('custom')], [7, 6, getSpriteSheet('custom')], [7, 7, getSpriteSheet('custom')], [7, 8, getSpriteSheet('custom')], [7, 9, getSpriteSheet('custom')], [7, 10, getSpriteSheet('custom')]]
            },
            'time machine': {
                names: ["Yeasterday", "Tick-tock, bake o'clock", "Back to the batter", "Déjà chewed", "Borrowed thyme", "Second breakfast paradox", "Next week's news, fresh today", "Live, die, bake, repeat", "Entropy-proof frosting", "Past the last tick", "Emperor of when"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "I only meant to stay a while",
                customIcons: [[8, 0, getSpriteSheet('custom')], [8, 1, getSpriteSheet('custom')], [8, 2, getSpriteSheet('custom')], [8, 3, getSpriteSheet('custom')], [8, 4, getSpriteSheet('custom')], [8, 5, getSpriteSheet('custom')], [8, 6, getSpriteSheet('custom')], [8, 7, getSpriteSheet('custom')], [8, 8, getSpriteSheet('custom')], [8, 9, getSpriteSheet('custom')], [8, 10, getSpriteSheet('custom')]]
            },
            'antimatter condenser': {
                names: ["Up and atom!", "Boson buddies", "Schrödinger's snack", "Quantum foam party", "Twenty years away (always)", "Higgs and kisses", "Zero-point frosting", "Some like it dark (matter)", "Vacuum energy bar", "Singularity of flavor", "Emperor of mass"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Not 20 years away forever",
                customIcons: [[11, 0, getSpriteSheet('custom')], [11, 1, getSpriteSheet('custom')], [11, 2, getSpriteSheet('custom')], [11, 3, getSpriteSheet('custom')], [11, 4, getSpriteSheet('custom')], [11, 5, getSpriteSheet('custom')], [11, 6, getSpriteSheet('custom')], [11, 7, getSpriteSheet('custom')], [11, 8, getSpriteSheet('custom')], [11, 9, getSpriteSheet('custom')], [11, 10, getSpriteSheet('custom')]]
            },
            'prism': {
                names: ["Light reading", "Refraction action", "Snacktrum of light", "My cones and rods", "Prism break", "Prism prelate", "Glare force one", "Hues Your Own Adventure", "Devour the spectrum", "Crown of rainbows", "Radiant consummation"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Bright side of the Moon",
                customIcons: [[12, 0, getSpriteSheet('custom')], [12, 1, getSpriteSheet('custom')], [12, 2, getSpriteSheet('custom')], [12, 3, getSpriteSheet('custom')], [12, 4, getSpriteSheet('custom')], [12, 5, getSpriteSheet('custom')], [12, 6, getSpriteSheet('custom')], [12, 7, getSpriteSheet('custom')], [12, 8, getSpriteSheet('custom')], [12, 9, getSpriteSheet('custom')], [12, 10, getSpriteSheet('custom')]]
            },
            'chancemaker': {
                names: ["Beginner's lucked-in", "Risk it for the biscuit", "Roll, baby, roll", "Luck be a ladyfinger", "RNG on the range", "Monte Carlo kitchen", "Gambler's fallacy, baker's edition", "Schrödinger's jackpot", "RNGesus take the wheel", "Hand of Fate: Full House", "RNG seed of fortune"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Riding the Mersenne twister",
                customIcons: [[17, 0, getSpriteSheet('custom')], [17, 1, getSpriteSheet('custom')], [17, 2, getSpriteSheet('custom')], [17, 3, getSpriteSheet('custom')], [17, 4, getSpriteSheet('custom')], [17, 5, getSpriteSheet('custom')], [17, 6, getSpriteSheet('custom')], [17, 7, getSpriteSheet('custom')], [17, 8, getSpriteSheet('custom')], [17, 9, getSpriteSheet('custom')], [17, 10, getSpriteSheet('custom')]]
            },
            'fractal engine': {
                names: ["Copy-paste-ry", "Again, but smaller", "Edge-case frosting", "Mandelbread set", "Strange attractor, stranger baker", "Recursive taste test", "Zoom & enhance & enhance", "The limit does not exist", "Halting? Never heard of it", "The set contains you", "Emperor of self-similarity"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Divide and conquer",
                customIcons: [[18, 0, getSpriteSheet('custom')], [18, 1, getSpriteSheet('custom')], [18, 2, getSpriteSheet('custom')], [18, 3, getSpriteSheet('custom')], [18, 4, getSpriteSheet('custom')], [18, 5, getSpriteSheet('custom')], [18, 6, getSpriteSheet('custom')], [18, 7, getSpriteSheet('custom')], [18, 8, getSpriteSheet('custom')], [18, 9, getSpriteSheet('custom')], [18, 10, getSpriteSheet('custom')]]
            },
            'javascript console': {
                names: ["F12, open sesame", "console.log('crumbs')", "Semicolons optional, sprinkles mandatory", "Undefined is not a function (nor a cookie)", "await fresh_from_oven()", "Event loop-de-loop", "Regexorcism", "Infinite scroll of dough", "Unhandled promise confection", "Single-threaded, single-minded", "Emperor of Runtime"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Pebcakes",
                customIcons: [[19, 0, getSpriteSheet('custom')], [19, 1, getSpriteSheet('custom')], [19, 2, getSpriteSheet('custom')], [19, 3, getSpriteSheet('custom')], [19, 4, getSpriteSheet('custom')], [19, 5, getSpriteSheet('custom')], [19, 6, getSpriteSheet('custom')], [19, 7, getSpriteSheet('custom')], [19, 8, getSpriteSheet('custom')], [19, 9, getSpriteSheet('custom')], [19, 10, getSpriteSheet('custom')]]
            },
            'idleverse': {
                names: ["Pick-a-verse, any verse", "Open in new universe", "Meanwhile, in a parallel tab", "Idle hands, infinite plans", "Press any world to continue", "NPC in someone else's save", "Cookie of Theseus", "Crossover episode", "Cosmic load balancer", "Prime instance", "The bakery at the end of everything"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Greener on the other sides",
                customIcons: [[20, 0, getSpriteSheet('custom')], [20, 1, getSpriteSheet('custom')], [20, 2, getSpriteSheet('custom')], [20, 3, getSpriteSheet('custom')], [20, 4, getSpriteSheet('custom')], [20, 5, getSpriteSheet('custom')], [20, 6, getSpriteSheet('custom')], [20, 7, getSpriteSheet('custom')], [20, 8, getSpriteSheet('custom')], [20, 9, getSpriteSheet('custom')], [20, 10, getSpriteSheet('custom')]]
            },
            'cortex baker': {
                names: ["Gray matter batter", "Outside the cookie box", "Prefrontal glaze", "Snap, crackle, synapse", "Temporal batch processing", "Cogito, ergo crumb", "Galaxy brain, local oven", "The bicameral ovens", "Theory of crumb", "Lobe service", "Mind the monarch"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Where is my mind",
                customIcons: [[21, 0, getSpriteSheet('custom')], [21, 1, getSpriteSheet('custom')], [21, 2, getSpriteSheet('custom')], [21, 3, getSpriteSheet('custom')], [21, 4, getSpriteSheet('custom')], [21, 5, getSpriteSheet('custom')], [21, 6, getSpriteSheet('custom')], [21, 7, getSpriteSheet('custom')], [21, 8, getSpriteSheet('custom')], [21, 9, getSpriteSheet('custom')], [21, 10, getSpriteSheet('custom')]]
            },
            'You': {
                names: ["Me, myself, and Icing", "Copy of a copy", "Echo chamber", "Self checkout", "You v2.0", "You v2.0.1 emergency hot fix", "Me, Inc.", "Council of Me", "I, Legion", "The one true you", "Sovereign of the self"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Introspection",
                customIcons: [[22, 0, getSpriteSheet('custom')], [22, 1, getSpriteSheet('custom')], [22, 2, getSpriteSheet('custom')], [22, 3, getSpriteSheet('custom')], [22, 4, getSpriteSheet('custom')], [22, 5, getSpriteSheet('custom')], [22, 6, getSpriteSheet('custom')], [22, 7, getSpriteSheet('custom')], [22, 8, getSpriteSheet('custom')], [22, 9, getSpriteSheet('custom')], [22, 10, getSpriteSheet('custom')]]
            }
        },
        other: {
			cps: {
                names: ["Beyond the speed of dough", "Speed of sound", "Speed of light", "Faster than light", "Speed of thought", "Faster than speed of thought", "Plaid", "Somehow faster than plaid", "Transcending the very concept of speed itself"],
    thresholds: [1e57, 1e58, 1e59, 1e60, 1e61, 1e62, 1e63, 1e64, 1e65],
                descs: ["Bake <b>1 octodecillion</b> per second.", "Bake <b>10 octodecillion</b> per second.", "Bake <b>100 octodecillion</b> per second.", "Bake <b>1 novemdecillion</b> per second.", "Bake <b>10 novemdecillion</b> per second.", "Bake <b>100 novemdecillion</b> per second.", "Bake <b>1 vigintillion</b> per second.<q>They've gone to plaid!</q>", "Bake <b>10 vigintillion</b> per second.<q>Ah, buckle this! LUDICROUS SPEED! GO!</q>", "Bake <b>100 vigintillion</b> per second.<q>Everything else is frozen, we’re breaking physics, so, uh... should we actually do something with that?</q>"],
                vanillaTarget: "Speed's the name of the game (no it's not it's called Cookie Clicker)",
                customIcons: [[0, 12, getSpriteSheet('custom')], [1, 12, getSpriteSheet('custom')], [2, 12, getSpriteSheet('custom')], [3, 12, getSpriteSheet('custom')], [4, 12, getSpriteSheet('custom')], [5, 12, getSpriteSheet('custom')], [6, 12, getSpriteSheet('custom')], [7, 12, getSpriteSheet('custom')], [8, 12, getSpriteSheet('custom')]]
            },
            click: {
                names: ["Clickbait & Switch", "Click to the Future", "Clickety Clique", "Clickonomicon", "Clicks and Stones", "Click It Till You Make It", "One Does Not Simply Click Once", "Lord of the Clicks", "Click of the Titans"],
                thresholds: [1e63, 1e69, 1e75, 1e81, 1e87, 1e93, 1e99, 1e105, "clickOfTitans"],
                descs: ["Make <b>1 vigintillion</b> from clicking.<q>Tired finger yet?</q>", "Make <b>1 duovigintillion</b> from clicking.", "Make <b>1 quattuorvigintillion</b> from clicking.", "Make <b>1 sexvigintillion</b> from clicking.", "Make <b>1 octovigintillion</b> from clicking.", "Make <b>1 trigintillion</b> from clicking.", "Make <b>1 duotrigintillion</b> from clicking.", "Make <b>1 quattuortrigintillion</b> from clicking.", "Generate <b>1 year of raw CpS</b> in a single cookie click.<q>One click to rule them all!</q>"],
                vanillaTarget: "What's not clicking",
                customIcons: [[9, 0, getSpriteSheet('custom')], [9, 1, getSpriteSheet('custom')], [9, 2, getSpriteSheet('custom')], [9, 3, getSpriteSheet('custom')], [9, 4, getSpriteSheet('custom')], [9, 5, getSpriteSheet('custom')], [9, 6, getSpriteSheet('custom')], [9, 7, getSpriteSheet('custom')], [9, 8, getSpriteSheet('custom')]]
            },
            wrinkler: {
                names: ["Wrinkler annihilator", "Wrinkler eradicator", "Wrinkler extinction event", "Wrinkler apocalypse", "Wrinkler armageddon"],
                thresholds: [666, 2666, 6666, 16666, 26666],
                descs: ["Burst <b>666 wrinklers</b> across all ascensions.<q>Pop goes the creepy.</q>", "Burst <b>2,666 wrinklers</b> across all ascensions.<q>That wasn't cream filling.</q>", "Burst <b>6,666 wrinklers</b> across all ascensions.<q>If it wrinkles, you pop it.</q>", "Burst <b>16,666 wrinklers</b> across all ascensions.<q>So much juice. So little remorse.</q>", "Burst <b>26,666 wrinklers</b> across all ascensions.<q>One squish closer to immortality.</q>"],
                vanillaTarget: "Moistburster",
                customIcons: [[21, 16, getSpriteSheet('custom')], [21, 17, getSpriteSheet('custom')], [21, 18, getSpriteSheet('custom')], [22, 19, getSpriteSheet('custom')], [22, 18, getSpriteSheet('custom')]]            },
            goldenWrinkler: {
                names: ["Golden wrinkler"],
                thresholds: [210000000], // 6.66 years in seconds (6.66 * 365.25 * 24 * 60 * 60)
                descs: ["Burst a wrinkler worth <b>6.66 years of CpS</b>.<q>That's not cream filling, that's a retirement fund!</q>"],
                vanillaTarget: "Moistburster",
                customIcons: [[23, 19, getSpriteSheet('custom')]]
            },
            shinyWrinkler: {
                names: ["Rare specimen collector", "Endangered species hunter", "Extinction event architect"],
                thresholds: [2, 5, 10],
                descs: ["Burst <b>2 shiny wrinklers</b> across all ascensions.<q>You're a monster, do you know that?</q>", "Burst <b>5 shiny wrinklers</b> across all ascensions.<q>You really have to stop here, there aren\'t many of these left in the world.</q>", "Burst <b>10 shiny wrinklers</b> across all ascensions.<q>People like you are evil, no one will ever see another one of these, you ruined it for everyone.</q>"],
                vanillaTarget: "Last Chance to See",
                customIcons: [[21, 13, getSpriteSheet('custom')], [21, 14, getSpriteSheet('custom')], [21, 15, getSpriteSheet('custom')]]
            },
            reindeer: {
                names: ["Reindeer destroyer", "Reindeer obliterator", "Reindeer extinction event", "Reindeer apocalypse"],
                thresholds: [500, 1000, 2000, 5000],
                descs: ["Pop <b>500 reindeer</b> across all ascensions.<q>You are become Claus, destroyer of hooves.</q>", "Pop <b>1,000 reindeer</b> across all ascensions.<q>That one had a red nose…</q>", "Pop <b>2,000 reindeer</b> across all ascensions.<q>Comet, Vixen, Toasted.</q>", "Pop <b>5,000 reindeer</b> across all ascensions.<q>Legends say the sky still smells like cinnamon and regret.</q>"],
                vanillaTarget: "Reindeer sleigher",
                customIcons: [[19, 17, getSpriteSheet('custom')], [19, 16, getSpriteSheet('custom')], [19, 15, getSpriteSheet('custom')], [19, 14, getSpriteSheet('custom')]]
            },
            goldenCookies: {
                names: ["Find a penny, pick it up", "Four-leaf overkill", "Rabbit's footnote", "Knock on wood", "Jackpot jubilee", "Black cat's seventh paw"],
                thresholds: [17777, 37777, 47777, 57777, 67777, 77777],
                descs: ["Click <b>17,777 golden cookies</b> across all ascensions.<q>A copper start for a golden habit. Heads you click, tails you click anyway.</q>", "Click <b>37,777 golden cookies</b> across all ascensions.<q>One clover is luck; an entire lawn is a logistics problem. You industrialized superstition.</q>", "Click <b>47,777 golden cookies</b> across all ascensions.<q>Citation needed: 'luck significantly increased.' Footnote: the hare disagrees; the stats don't.</q>", "Click <b>57,777 golden cookies</b> across all ascensions.<q>Knock knock. Who's there? Luck. Luck who? Luck you're not superstitious... or are you?</q>", "Click <b>67,777 golden cookies</b> across all ascensions.<q>House edge? You are the house. Confetti budget exceeded; no one complained.</q>", "Click <b>77,777 golden cookies</b> across all ascensions.<q>Golden luck, plan a trip to Las Vegas and cash in on it.</q>"],
                vanillaTarget: "Black cat's paw",
                customIcons: [[0, 13, getSpriteSheet('custom')],  [1, 13, getSpriteSheet('custom')],  [2, 13, getSpriteSheet('custom')],  [3, 13, getSpriteSheet('custom')],[4, 13, getSpriteSheet('custom')], [5, 13, getSpriteSheet('custom')]]
            },
            spell: {
                names: ["Archwizard", "Spellmaster", "Cookieomancer", "Spell lord", "Magic emperor", "Sweet Sorcery"],
                thresholds: [1999, 2999, 3999, 4999, 9999, "freeSugarLump"],
                descs: ["Cast <b>1,999</b> spells across all ascensions.<q>Zim zam zap!</q>", "Cast <b>2,999</b> spells across all ascensions.<q>Pew pew pew!</q>", "Cast <b>3,999</b> spells across all ascensions.", "Cast <b>4,999</b> spells across all ascensions.", "Cast <b>9,999</b> spells across all ascensions.<q>Yea well, how many backfired?</q>", "Get the <b>Free Sugar Lump</b> outcome from a magically spawned golden cookie.<q>Sweet sorcery indeed!</q>"],
                vanillaTarget: "A wizard is you",
                customIcons: [[22, 12], [20, 14, getSpriteSheet('custom')], [20, 13, getSpriteSheet('custom')], [28, 12], [27, 12], [20, 15, getSpriteSheet('custom')]]
            },
            templeSwaps: {
                names: ["Faithless Loyalty", "God of All Gods"],
            thresholds: [100, 86400], // 100 temple swaps, 24 hours (86400 seconds) per god
            descs: ["Swap gods in the Pantheon <b>100 times</b> in one ascension.<q>You know you can\'t just pick a religion to suit your mood for the day right?</q>", "Use each pantheon god for at least <b>24 hours</b> total across all ascensions.<q>Variety is the spice of divine life.</q>"],
            vanillaTarget: "A wizard is you",
            customIcons: [[21, 18], [22, 18]]
        },
            gardenHarvest: {
                names: ["Greener, aching thumb", "Greenest, aching thumb", "Photosynthetic prodigy", "Garden master", "Plant whisperer"],
                thresholds: [2000, 3000, 5000, 7500, 10000],
                descs: ["Harvest <b>2,000</b> mature garden plants across all ascensions.<q>Pluck pluck pluck, all day every day.</q>", "Harvest <b>3,000</b> mature garden plants across all ascensions.", "Harvest <b>5,000</b> mature garden plants across all ascensions.", "Harvest <b>7,500</b> mature garden plants across all ascensions.", "Harvest <b>10,000</b> mature garden plants across all ascensions.<q>The plants fear you when your shadow casts over them.</q>"],
                vanillaTarget: "Green, aching thumb",
                // Use the Spiced Cookies pattern: [x, y, spriteSheetURL]
                customIcons: [[4, 2, getSpriteSheet('gardenPlants')], [4, 10, getSpriteSheet('gardenPlants')], [4, 17, getSpriteSheet('gardenPlants')], [4, 18, getSpriteSheet('gardenPlants')], [4, 19, getSpriteSheet('gardenPlants')]]
            },
            cookiesAscension: {
                names: ["The Doughpocalypse", "The Flour Flood", "The Ovenverse", "The Crumb Crusade", "The Final Batch", "The Ultimate Ascension", "The Transcendent Rise"],
                thresholds: [1e73, 1e75, 1e77, 1e79, 1e81, 1e83, 1e85],
                descs: ["Bake <b>10 trevigintillion</b> cookies in one ascension.<q>Did you know it went higher? Neat.</q>", "Bake <b>1 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>100 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>10 quinvigintillion</b> cookies in one ascension.", "Bake <b>1 sexvigintillion</b> cookies in one ascension.", "Bake <b>100 sexvigintillion</b> cookies in one ascension.<q>I don't think you should be here.</q>", "Bake <b>10 septenvigintillion</b> cookies in one ascension.<q>Okay for real, it doesn't go any higher.</q>"],
                vanillaTarget: "And a little extra",
                customIcons: [[0, 12, getSpriteSheet('custom')], [1, 12, getSpriteSheet('custom')], [2, 12, getSpriteSheet('custom')], [3, 12, getSpriteSheet('custom')], [4, 12, getSpriteSheet('custom')], [5, 12, getSpriteSheet('custom')], [6, 12, getSpriteSheet('custom')], [7, 12, getSpriteSheet('custom')], [8, 12, getSpriteSheet('custom')]]
            },
            forfeited: {
                names: ["Dante's unwaking dream", "The abyss gazes back", "Charon's final toll", "Cerberus's third head", "Minos's eternal judgment", "The river Styx flows backward", "Ixion's wheel spins faster", "Sisyphus's boulder crumbles", "Tantalus's eternal thirst", "The ninth circle's center", "Lucifer's frozen tears", "Beyond the void's edge", "The final descent's end"],
                thresholds: [1e60, 1e63, 1e66, 1e69, 1e72, 1e75, 1e78, 1e81, 1e84, 1e87, 1e90, 1e93, 1e96],
                descs: ["Forfeit <b>1 novemdecillion</b> cookies total across all ascensions.", "Forfeit <b>1 vigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 unvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 duovigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 trevigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 quattuorvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 quinvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 sexvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 septenvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 octovigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 novemvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 trigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 untrigintillion</b> cookies total across all ascensions."],
                vanillaTarget: "No more room in hell",
                customIcons: [[0, 11], [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11]]
            },
            totalBuildings: {
                names: ["Building behemoth", "Construction colossus", "Architectural apex"],
                thresholds: [15000, 20000, 25000],
                descs: ["Own <b>15,000 buildings</b>.<q>You have more real estate than sense.</q>", "Own <b>20,000 buildings</b>.<q>That's not a skyline. That's a warning sign.</q>", "Own <b>25,000 buildings</b>.<q>Your shadow blocks out the sun, and the competition.</q>"],
                vanillaTarget: "Myriad",
                customIcons: [[22, 12, getSpriteSheet('custom')], [22, 13, getSpriteSheet('custom')], [22, 14, getSpriteSheet('custom')]]
            },
            buildingsSold: {
                names: ["Asset Liquidator", "Flip City", "Ghost Town Tycoon"],
                thresholds: [25000, 50000, 100000],
                descs: ["Sell <b>25,000 buildings</b> in one ascension.<q>A thousand dreams bulldozed for a golden cookie.</q>", "Sell <b>50,000 buildings</b> in one ascension.<q>Your economic model is just 'wreck and repeat.'</q>", "Sell <b>100,000 buildings</b> in one ascension.<q>You called it 'liquidating assets.' They called it 'eviction.'</q>"],
                vanillaTarget: "Myriad",
                customIcons: [[28, 26], [15, 9], [32, 33]]
            },
            everything: {
                names: ["Septcentennial and a half", "Octcentennial", "Octcentennial and a half", "Nonacentennial", "Nonacentennial and a half", "Millennial"],
                thresholds: [750, 800, 850, 900, 950, 1000],
                descs: ["Have at least <b>750 of everything</b>.", "Have at least <b>800 of everything</b>.", "Have at least <b>850 of everything</b>.", "Have at least <b>900 of everything</b>.", "Have at least <b>950 of everything</b>.", "Have at least <b>1,000 of everything</b>."],
                vanillaTarget: "Septcentennial",
                customIcons: [[16, 12, getSpriteSheet('custom')], [17, 12, getSpriteSheet('custom')], [18, 12, getSpriteSheet('custom')], [19, 12, getSpriteSheet('custom')], [20, 12, getSpriteSheet('custom')], [21, 12, getSpriteSheet('custom')]]
            },
          
            seedlog: {
                names: ["Seedless to eternity", "Seedless to infinity", "Seedless to beyond"],
                thresholds: [5, 10, 25],
                descs: ["Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>5 times</b>.<q>Fertilizer? Nah, I prefer fire.</q>", "Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>10 times</b>.<q>Sugar hornets are pleased.</q>", "Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>25 times</b>.<q>How many times must you kill Eden?</q>"],
                vanillaTarget: "Seedless to nay",
                customIcons: [[0, 34, getSpriteSheet('gardenPlants')], [1, 34, getSpriteSheet('gardenPlants')], [2, 34, getSpriteSheet('gardenPlants')]]
            },
            kittensOwned: {
                names: ["Kitten jamboree", "Kitten Fiesta"],
                thresholds: [18, 29],
                descs: ["Own all <b>18 original kittens</b>.<q>Kittens stacked on kittens until total kitten collapse is imminent.</q>", "Own all <b>18 original kittens</b> and all <b>11 expansion kittens</b> at once.<q>Okay that\'s really just too many cats.</q>"],
                vanillaTarget: "Jellicles",
                customIcons: [[18, 14], [18, 13]]
            },
            reincarnate: {
                names: ["Ascension master", "Ascension legend", "Ascension deity"],
                thresholds: [250, 500, 999],
                descs: ["Ascend <b>250 times</b>.", "Ascend <b>500 times</b>.", "Ascend <b>999 times</b>."],
                vanillaTarget: "Reincarnation",
                customIcons: [[17, 16, getSpriteSheet('custom')], [17, 15, getSpriteSheet('custom')], [17, 14, getSpriteSheet('custom')]]
            },
            stockmarket: {
                names: ["Doughfolio Debut", "Crumb Fund Manager", "Biscuit Market Baron", "Fortune Cookie Tycoon", "Dough Jones Legend", "The Dough Jones Plunge"],
                thresholds: [25e6, 100e6, 250e6, 500e6, 1e9, -1e6],
                descs: [
                    "Have <b>$25 million in stock market profits</b> across all ascensions.<q>Your cookie portfolio finally rose without burning. Neat!</q>",
                    "Have <b>$100 million in stock market profits</b> across all ascensions.<q>Turning crumbs into capital—one nibble at a time.</q>",
                    "Have <b>$250 million in stock market profits</b> across all ascensions.<q>You now own half the cookie aisle and a third of the jar.</q>",
                    "Have <b>$500 million in stock market profits</b> across all ascensions.<q>You don’t just read the market—you crack it open like a fortune cookie.</q>",
                    "Have <b>$1 billion in stock market profits</b> across all ascensions.<q>The index now tracks you. Analysts recommend: dunk.</q>",
                    "Have <b>$1 million in stock market losses</b> in one ascension.<q>This is why you diversify. Probably.</q>"
                ],
                vanillaTarget: "Liquid assets",
                customIcons: [[17, 6], [26, 7], [33, 33], [28, 29], [31, 8], [15, 8]]
            },
            seasonalReindeer: {
                names: ["Cupid's Reindeer", "Business Reindeer", "Bundeer", "Ghost Reindeer"],
                thresholds: [1, 1, 1, 1],
                descs: ["Pop a reindeer during <b>Valentine's Day season.</b><q>Love is fleeting. So was that reindeer.</q>", "Pop a reindeer during <b>Business Day season.</b><q>His KPI was 'don't get popped.'</q>", "Pop a reindeer during <b>Easter season.</b><q>Wrong holiday, right target.</q>", "Pop a reindeer during <b>Halloween season.</b><q>Was that ectoplasm or caramel?</q>"],
                vanillaTarget: "Eldeer",
                customIcons: [[18, 16, getSpriteSheet('custom')], [18, 15, getSpriteSheet('custom')], [18, 14, getSpriteSheet('custom')], [18, 17, getSpriteSheet('custom')]]
            },
            gardenSeedsTime: {
                names: ["I feel the need for seed"],
                thresholds: [5 * 24 * 60 * 60 * 1000], // 5 days in milliseconds
                descs: ["Unlock all garden seeds within <b>5 days</b> of your last garden sacrifice. Look this one is tricky, if you reload or load a save the 5 day timer is invalidated, so you can\'t load in a completed garden."],
                vanillaTarget: "Green, aching thumb",
                customIcons: [[25, 15]]
            },
            seasonalDropsTime: {
                names: ["Holiday Hoover", "Merry Mayhem"],
                thresholds: [60 * 60 * 1000, 40 * 60 * 1000], // 60 minutes and 40 minutes in milliseconds
                descs: ["Collect all seasonal drops within <b>60 minutes</b> of an Ascension start.<q>Santa is watching and he thinks you need to chill out.</q>", "Collect all seasonal drops within <b>40 minutes</b> of an Ascension start.<q>See it is possible, ye of little faith.</q>"],
                vanillaTarget: "Hide & seek champion",
                customIcons: [[18, 4], [17, 9]]
            },
                    hardercorest: {
            names: ["Hardercorest"],
            thresholds: [3e9], // 3 billion cookies
            descs: ["Bake <b>3 billion cookies</b> with no cookie clicks and no upgrades bought in Born Again mode.<q>Do you hate me or yourself after that one?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[13, 6]]
        },
                    hardercorester: {
            names: ["Hardercorest-er"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> with no more than 20 clicks, no more than 20 buildings (no selling), and no more than 20 upgrades in Born Again mode.<q>Bet you thought that wouldn't be as bad as it was eh?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[14, 6]]
        },
        allBuildingsLevel10: {
            names: ["Have your sugar and eat it too"],
            thresholds: [10], // Level 10
            descs: ["Have every building reach <b>level 10</b>."],
            vanillaTarget: "You win a cookie",
            customIcons: [[26, 27]]
        },
        sugarLumps: {
            names: ["Sweet Child of Mine"],
            thresholds: [100], // 100 sugar lumps
            descs: ["Own <b>100 sugar lumps</b> at once."],
            vanillaTarget: "Maillard reaction",
            customIcons: [[29, 16]]
        },
        seasonSwitches: {
            names: ["Calendar Abuser"],
            thresholds: [50], // 50 season switches
            descs: ["Switch seasons <b>50 times</b> in one ascension.<q>What month even is it?</q>"],
            vanillaTarget: "Maillard reaction",
            customIcons: [[16, 6]]
        },
        vanillaAchievements: {
            names: ["Vanilla Star"],
            thresholds: [622], // All 622 vanilla achievements
            descs: ["Own all <b>622 original achievements.</b><q>Wow congratulations 100% achievements! Now just 459 more to go.</q>"],
            vanillaTarget: "You win a cookie",
            customIcons: [[22, 7]]
        },
        botanicalPerfection: {
            names: ["Botanical Perfection", "Duketater Salad"],
            thresholds: [34, 12], // All 34 plant types, 12 duketaters
            descs: ["Have one of every type of plant in the mature stage at once.<q>I have become the plants now, I am the master of the garden, bow before my hoe.</q>", "Harvest <b>12 mature Duketaters</b> simultaneously.<q>Timing your salad is everything otherwise the mayo goes bad and you kill all your friends.</q>"],
            vanillaTarget: "Keeper of the conservatory",
            customIcons: [[27, 15], [0, 19, getSpriteSheet('gardenPlants')]]
        },

        soilChanges: {
            names: ["Fifty Shades of Clay"],
            thresholds: [100], // 100 soil changes
            descs: ["Change the soil type of your Garden <b>100 times</b> in one ascension.<q>This is not how gardening works.</q>"],
            vanillaTarget: "Seedless to nay",
            customIcons: [[3, 34, getSpriteSheet('gardenPlants')]]
        },
        tickerClicks: {
            names: ["News ticker addict"],
            thresholds: [1000], // 1000 ticker clicks
            descs: ["Click on the news ticker <b>1,000 times</b> in one ascension.<q>Hey dummy you are clicking on the wrong thing.</q>"],
            vanillaTarget: "Stifling the press",
            customIcons: [[10, 12, getSpriteSheet('custom')]]

        },
        wrathCookies: {
            names: ["Warm-Up Ritual", "Deal of the Slightly Damned", "Baker of the Beast"],
            thresholds: [66, 666, 6666], // Wrath cookie clicks
            descs: ["Click <b>66 wrath cookies</b> across all ascensions.", "Click <b>666 wrath cookies</b> across all ascensions.", "Click <b>6,666 wrath cookies</b> across all ascensions."],
            vanillaTarget: "Wrath cookie",
            customIcons: [[20, 18, getSpriteSheet('custom')], [20, 17, getSpriteSheet('custom')], [20, 16, getSpriteSheet('custom')]]
        },
        goldenCookieTime: {
            names: ["Second Life, First Click"],
            thresholds: [120 * 1000], // 120 seconds in milliseconds
            descs: ["Click a golden cookie within <b>120 seconds</b> of ascending."],
            vanillaTarget: "Fading luck",
            customIcons: [[0, 9, getSpriteSheet('custom')]]
        },
        wrinklerTime: {
            names: ["Wrinkler Rush"],
            thresholds: [930 * 1000], // 930 seconds (15 minutes 30 seconds) in milliseconds
            descs: ["Pop a wrinkler within <b>15 minutes and 30 seconds</b> of ascending.<q>The Grandmatriarchs barely had time to wake up!</q>"],
            vanillaTarget: "Moistburster",
            customIcons: [[23, 18, getSpriteSheet('custom')]]
        },
        wrinklerBankDouble: {
            names: ["Wrinkler Windfall"],
            thresholds: [6], // 6x bank value (sextupled)
            descs: ["Sextuple your bank with a single wrinkler pop.<q>Talk about a return on investment!</q>"],
            vanillaTarget: "Moistburster",
            customIcons: [[21, 19, getSpriteSheet('custom')]]
        },
        hardcoreNoHeavenly: {
            names: ["We don't need no heavenly chips"],
            thresholds: [333], // 333 of every building
            descs: ["Own at least <b>333 of every building type</b>, without owning the 'Heavenly chip secret' upgrade.<q>Well that was a little different wasn't it?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[12, 7]]
        },
        hardcoreFinalCountdown: {
            names: ["The Final Countdown"],
            thresholds: [1], // Just a placeholder, we'll check exact counts in the requirement function
            descs: ["Own exactly 15 Cursors, 14 Grandmas, 13 Farms, yada yada yada, down to 1 Chancemaker. No selling or sacrificing any buildings. Must be earned in Born Again mode.<q>Is that song stuck in your head now, it\'s pretty catchy.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[13, 7]]
        },
        hardcoreNoKittens: {
            names: ["Really more of a dog person"],
            thresholds: [1e9], // 1 billion cookies per second
            descs: ["Bake <b>1 billion cookies per second</b> without buying any kitten upgrades in Born Again mode.<q>Turns out cookies taste just fine without cat hair in them.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[14, 7]]
        },
        hardcoreNoGoldenCookies: {
            names: ["Gilded Restraint"],
            thresholds: [1e12], // 1 trillion cookies
            descs: ["Bake <b>1 trillion cookies</b> without ever clicking a golden cookie, must be done in Born Again mode.<q>Patience is its own buff.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 9, getSpriteSheet('custom')]]
        },
        hardcoreCursorsAndGrandmas: {
            names: ["Back to Basic Bakers"],
            thresholds: [1e6], // 1 million cookies per second
            descs: ["Reach <b>1 million cookies per second</b> using only Cursors and Grandmas (no other buildings), must be done in Born Again mode.<q>Turns out Grandma really is the backbone of the empire.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 10, getSpriteSheet('custom')]]
        },
        hardcoreModestPortfolio: {
            names: ["Modest Portfolio"],
            thresholds: [1e15], // 1 quadrillion cookies
            descs: ["Reach <b>1 quadrillion cookies</b> without ever owning more than 10 of any building type (no selling), must be done in Born Again mode.<q>Breadth over depth.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 11, getSpriteSheet('custom')]]
        },
        hardcoreDifficultDecisions: {
            names: ["Difficult Decisions"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> without ever having more than <b>25 combined upgrades or buildings</b> at any given time, must be done in Born Again mode.<q>Some decisions leave no right answer, only consequences.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 3, getSpriteSheet('custom')]]
        },
        hardcoreLaidInPlainSight: {
            names: ["Laid in Plain Sight"],
            thresholds: [10], // 10 cookies per second
            descs: ["Bake <b>10 cookies per second</b> without purchasing any buildings, must be done in Born Again mode.<q>Eggsactly where you weren't looking!</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 4, getSpriteSheet('custom')]]
        },
        hardcorePrecisionNerd: {
            names: ["Precision Nerd"],
            thresholds: [1234567890], // Exactly 1,234,567,890 cookies
            descs: ["Have exactly <b>1234567890 cookies</b> in your bank and hold it for <b>60 seconds</b>.<q>Last night's 'Itchy & Scratchy' was, without a doubt, the worst episode ever. Rest assured I was on the Internet within minutes registering my disgust throughout the world.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 5, getSpriteSheet('custom')]]
        },
        hardcoreTreadingWater: {
            names: ["Treading water"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Have a CPS of 0 while owning more than 1000 buildings with no active buffs, debuffs, or help from Solgreth<q>Sometimes it really feels like you are just not being very productive here.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 12, getSpriteSheet('custom')]]
        },
        hardcoreBouncingLastCheque: {
            names: ["Bouncing the last cheque"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Reach less than 10 cookies in your bank after having at least 1 million cookies.<q>The very last cheque I write in my life I want to bounce.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 14, getSpriteSheet('custom')]]
        },
        hardcoreMassiveInheritance: {
            names: ["Massive Inheritance"],
            thresholds: [0],
            descs: ["Have a bank of at least <b>1 Novemdecillion cookies</b> within 10 minutes of ascending.<q>Well, look at you, a Heavenly Chips trust fund baby. Ever thought about earning your keep like the rest of us?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 13, getSpriteSheet('custom')]]
        },
        
        theFinalChallenger: {
            names: ["The Final Challenger"],
            thresholds: [10], // 10 out of 17 challenge achievements
            descs: ["Win <b>10</b> of the Just Natural Expansion <b>Challenge Achievements</b>.<q>You didn't just rise to the challenge… you baked it into a 12-layer cake.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[14, 12, getSpriteSheet('custom')]]
        },
        
        // Stock market achievements
        stockBrokers: {
            names: ["Broiler room"],
            thresholds: [100], // 100 stockbrokers
            descs: ["Hire at least <b>100</b> stockbrokers in the Stock Market.<q>And there is no such thing as a no sale call. A sale is made on every call you make. Either you sell the client some stock or he sells you a reason he can't. Either way a sale is made, who's gonna close? You or him?</q>"],
            vanillaTarget: "Buy buy buy",
            customIcons: [[23, 1, getSpriteSheet('custom')]]
        },
        cookieClicks: {
            names: ["Buff Finger"],
            thresholds: [250000], // 250,000 cookie clicks
            descs: ["Click the cookie <b>250,000 times</b> across all ascensions.<q>I bet your index finger is bigger than the others now.</q>"],
            vanillaTarget: "The elder scrolls",
            customIcons: [[12, 30]]
        },
        pledges: {
            names: ["Deep elder nap"],
            thresholds: [666], // 666 pledges
            descs: ["Quash the grandmatriarchs one way or another <b>666 times</b> across all ascensions.<q>Those grandmatriarchs are really out, I can hear them snoring from the next town over.</q>"],
            vanillaTarget: "Elder slumber",
            customIcons: [[2, 9]]
        },
        buffs: {
            names: ["Trifecta Combo", "Combo Initiate", "Combo God", "Combo Hacker", "Frenzy frenzy", "Double Dragon Clicker", "Frenzy Marathon", "Hogwarts Graduate", "Hogwarts Dropout", "Spell Slinger"],
            thresholds: [3, 6, 9, 12, 0, 0, 0, 0, 0, 0], // 3, 6, 9, 12 buffs active, frenzy frenzy, double dragon, frenzy marathon, wizard achievements, and spell slinger (handled separately)
            descs: ["Have <b>3 buffs</b> active at once.<q>Hey that was pretty neat!</q>", "Have <b>6 buffs</b> active at once.<q>Okay that was downright impressive clicking.</q>", "Have <b>9 buffs</b> active at once.<q>I can't even follow what you did there but it looked really cool.</q>", "Have <b>12 buffs</b> active at once.<q>I don't believe you, but for like real congrats if you did that.</q>", "Have all three frenzy buffs active at once.<q>Like pizza pizza but with more wrath.</q>", "Have a dragon flight and a click frenzy active at the same time.<q>Double the dragons, double the clicking!</q>", "Have a frenzy buff with a total duration of at least 10 minutes.<q>Who needs coffee when you have this much energy?</q>", "Have <b>3 positive Grimoire spell effects</b> active at once.<q>Merlin would be proud of your spellcraft!</q>", "Have <b>3 negative Grimoire spell effects</b> active at once.<q>The Sorting Hat made a terrible mistake!</q>", "Cast <b>10 spells</b> within a 10-second window.<q>Speed casting at its finest!</q>"],
            vanillaTarget: "Here be dragon",
            customIcons: [[25, 36], [26, 11], [22, 11], [23, 11], [23, 2, getSpriteSheet('custom')], [30, 12], [22, 13], [30, 20], [31, 20], [32, 4]]
        },
        prestigeUpgrades: {
            names: ["Beyond Prestige"],
            thresholds: [129], // All 129 prestige upgrades
            descs: ["Own all <b>129</b> original heavenly upgrades.<q>Prestige is just a stepping stone to whatever the hell this is.</q>"],
            vanillaTarget: "All the stars in heaven",
            customIcons: [[20, 7]]
        },
        completionism: {
            names: ["Bearer of the Cookie Sigil"],
            thresholds: ["orderEternalCookie"],
            descs: ["Fully initiate into the Great Orders of the Cookie Age. Owning this achievement causes research to go <b>25%</b> faster, and random drops to appear <b>10%</b> more often.<q>A golden cookie sigil is forever affixed to your lapel, you refuse to elaborate further, if someone says the words strawberry milk and peanut butter cookies you immediately leave the room.</q>"],
            vanillaTarget: "Third-party",
            customIcons: [[19, 13, getSpriteSheet('custom')]]
        }
        }
    };
    
    // Seasonal reindeer tracking system
    var seasonalReindeerData = {
        valentines: { popped: false, achievement: null },
        fools: { popped: false, achievement: null },
        easter: { popped: false, achievement: null },
        halloween: { popped: false, achievement: null }
    };
    
    // Helper function to get current season
    function getCurrentSeason() {
        return Game.season || '';
    }
    
    function mapSeasonToReindeerAchievement(season) {
        switch (season) {
            case 'valentines': return "Cupid's Reindeer";
            case 'fools': return 'Business Reindeer';
            case 'easter': return 'Bundeer';
            case 'halloween': return 'Ghost Reindeer';
            default: return null;
        }
    }
    
    function initializeSeasonalReindeerTracking() {
        modTracking.lastSeasonalReindeerCheck = Game.reindeerClicked || 0;
    }
    
    // Create seasonal reindeer achievements
    function createSeasonalReindeerAchievements() {
        var vanilla = findLastVanillaAchievement("Eldeer");
        
        if (vanilla.order > 0) {
            var seasonalData = achievementData.other.seasonalReindeer;
            
            for (var i = 0; i < seasonalData.names.length; i++) {
                createAchievement(
                    seasonalData.names[i],
                    seasonalData.descs[i],
                    vanilla.icon,
                    vanilla.order + (i + 1) * 0.01,
                    (function(seasonName) {
                        return function() {
                            return seasonalReindeerData[seasonName] && seasonalReindeerData[seasonName].popped;
                        };
                    })(getSeasonFromIndex(i)),
                    seasonalData.customIcons[i]
                );
                
                // Store reference to achievement for each season
                var seasonName = getSeasonFromIndex(i);
                if (seasonalReindeerData[seasonName]) {
                    seasonalReindeerData[seasonName].achievement = seasonalData.names[i];
                }
            }
        }
    }
    
    // Helper function to map achievement index to season name
    function getSeasonFromIndex(index) {
        var seasons = ['valentines', 'fools', 'easter', 'halloween'];
        return seasons[index] || '';
    }
    
    
            // Initialize shiny wrinkler tracking and auxiliary state
        function initializeShinyWrinklerTracking() {
            // Initialize tracking variables (only if they don't already exist)
            if (modTracking.shinyWrinklersPopped === undefined) modTracking.shinyWrinklersPopped = 0;
            if (!modTracking.previousWrinklerStates) modTracking.previousWrinklerStates = {};
            if (!modTracking.bankSextupledByWrinkler) modTracking.bankSextupledByWrinkler = false;
            if (!modTracking.fthofCookieOutcomes) modTracking.fthofCookieOutcomes = [];

            // Cookie/reindeer click tracking moved to modular baselines/deltas
            if (modTracking.lastSeasonalReindeerCheck === undefined) {
                modTracking.lastSeasonalReindeerCheck = Game.reindeerClicked || 0;
            }

        }
    
    function initializeTempleSwapTracking() {
        if (modTracking.templeSwapsTotal === undefined) modTracking.templeSwapsTotal = 0;
        if (modTracking.previousTempleSwaps === undefined) modTracking.previousTempleSwaps = 0;
    }
    
    function initializeSoilChangeTracking() {
        if (modTracking.soilChangesTotal === undefined) modTracking.soilChangesTotal = 0;
        // Always reset baseline on (re)load so the first observed soil type does not count as a change
        modTracking.previousSoilType = null;
    }
    

    
    // Track pantheon god usage time
    function trackGodUsage() {
        // Only track if pantheon is available
        if (!Game.Objects['Temple'] || !Game.Objects['Temple'].minigame) return;
        
        var pantheon = Game.Objects['Temple'].minigame;
        var currentTime = Date.now();
        
        // Check if pantheon has slot property
        if (!pantheon || !pantheon.slot || !Array.isArray(pantheon.slot)) return;
        
        // Initialize god usage tracking if not already done
        if (!modTracking.godUsageTime || Object.keys(modTracking.godUsageTime).length === 0) {
            modTracking.godUsageTime = {};
            // Initialize with saved lifetime data
            if (!lifetimeData.godUsageTime) {
                lifetimeData.godUsageTime = {};
            }
                for (var godName in lifetimeData.godUsageTime) {
                    modTracking.godUsageTime[godName] = lifetimeData.godUsageTime[godName] || 0;
            }
        }
        
        // Get current time for tracking
        var currentTime = Date.now();
        
        // Check each slot for currently slotted gods
        var newSlottedGods = {};
        
        
        for (var slot = 0; slot < pantheon.slot.length; slot++) {
            var godId = pantheon.slot[slot];
            
            if (godId >= 0 && pantheon.godsById && pantheon.godsById[godId]) {
                var god = pantheon.godsById[godId];
                var godName = god.name || `god_${godId}`;
                
                // Initialize tracking for this god if not already done
                if (!modTracking.godUsageTime[godName]) {
                    modTracking.godUsageTime[godName] = 0;
                }
                if (!lifetimeData.godUsageTime) {
                    lifetimeData.godUsageTime = {};
                }
                if (!lifetimeData.godUsageTime[godName]) {
                    lifetimeData.godUsageTime[godName] = 0;
                }
                
                // If this god was already slotted, keep their original slot time
                // Otherwise, start tracking from now
                if (modTracking.currentSlottedGods && modTracking.currentSlottedGods[godName]) {
                    newSlottedGods[godName] = modTracking.currentSlottedGods[godName];
                } else {
                    newSlottedGods[godName] = currentTime;
                }
            }
        }
        
        // Process gods that are no longer slotted (accumulate their time)
        if (modTracking.currentSlottedGods) {
            for (var prevGodName in modTracking.currentSlottedGods) {
                // Only process gods that are no longer in the new slot configuration
                if (!newSlottedGods[prevGodName]) {
                    var slotStartTime = modTracking.currentSlottedGods[prevGodName];
                    if (typeof slotStartTime === 'number' && slotStartTime > 0) {
                        var timeSlotted = currentTime - slotStartTime;
                        
                        // Add this time to the god's total usage
                        if (!modTracking.godUsageTime[prevGodName]) {
                            modTracking.godUsageTime[prevGodName] = 0;
                        }
                        modTracking.godUsageTime[prevGodName] += timeSlotted;
                
                // Also update lifetime data
                        if (!lifetimeData.godUsageTime) {
                            lifetimeData.godUsageTime = {};
                        }
                        if (!lifetimeData.godUsageTime[prevGodName]) {
                            lifetimeData.godUsageTime[prevGodName] = 0;
                }
                        lifetimeData.godUsageTime[prevGodName] += timeSlotted;
                    }
                }
            }
        }
        
        // Update current slotted gods tracking with timestamps
        modTracking.currentSlottedGods = newSlottedGods;
    }
    
    // ===== UPGRADES SYSTEM =====
    // Import upgrades and saving functionality from upgrades.js
    
    // CPS-scaling upgrade price calculation (100 years of CPS with 10 duovigintillion minimum)
    
    // Upgrade data structure
    var upgradeData = {
        generic: [
            {
                name: 'Box of improved cookies',
                desc: 'Contains an assortment of scientifically improved cookies.',
                ddesc: 'Contains an assortment of scientifically improved cookies.<q>A giftbox of cookies made just for you from the hard working researchers at Just Natural Expansion.</q>',
                price: 2.5e67, // 25 unvigintillion
                icon: [34, 4],
                pool: '',
                order: 30001,
                unlockCondition: function() {
                    var cookiesBaked = Game.cookiesEarned || 0;
                    var shouldUnlock = cookiesBaked >= 2.5e67; // 25 unvigintillion
                    return shouldUnlock;
                },
                effect: function() {
                    return 1;
                },},
            // ORDER UPGRADES - Achievement-based upgrades with CPS scaling
            {
                name: 'Order of the Golden Crumb',
                desc: 'Golden cookies appear <b>5%</b> more often.<br>Unlocked by owning the Vanilla Star achievement.<br>Cost scales with CpS',
                ddesc: 'Golden cookies appear <b>5%</b> more often.<br>Unlocked by owning the Vanilla Star achievement.<br>Cost scales with CpS<q>From the smallest crumb, the greatest feast begins. Founded by the Crumbmonks of the 1st Batch, these solemn custodians protect the tiniest morsels of the First Cookie. It is whispered that even a single Golden Crumb, if eaten, grants visions of infinite bakeries. They roam the world with robes lined in napkin cloth, ready to rescue stray crumbs from the void.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [14, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.001,
                unlockCondition: function() {
                    // Unlock when Vanilla Star achievement is won/owned
                    var vanillaStar = Game.Achievements['Vanilla Star'];
                    return vanillaStar && (vanillaStar.won == 1 || vanillaStar.won === true);
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Order of the Impossible Batch',
                desc: 'Golden cookies appear <b>5%</b> more often.<br>Unlocked by owning The Final Challenger achievement.<br>Cost scales with CpS',
                ddesc: 'Golden cookies appear <b>5%</b> more often.<br>Unlocked by owning The Final Challenger achievement.<br>Cost scales with CpS<q>The dough will rise… whether reality likes it or not. Bakers of the improbable, challengers of the possible — this Order has baked cookies in ovens that do not exist, from ingredients that never were. Their scrolls describe recipes written in paradox and whisked with defiance. Most of their meetings end with someone on fire.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [15, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.01,
                unlockCondition: function() {
                    // Unlock when The Final Challenger achievement is won/owned
                    var finalChallenger = Game.Achievements['The Final Challenger'];
                    return finalChallenger && (finalChallenger.won == 1 || finalChallenger.won === true);
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Order of the Shining Spoon',
                desc: 'Golden cookie effects last <b>5%</b> longer.<br>Unlocked by owning all Combo achievements.<br>Cost scales with CpS',
                ddesc: 'Golden cookie effects last <b>5%</b> longer.<br>Unlocked by owning all Combo achievements.<br>Cost scales with CpS<q>Where light meets dough, miracles happen. The Shining Spoon Order believes in the transformative power of proper tools. Their spoons are forged from starlight and polished with hope, each one capable of stirring the very essence of cookie magic. They say a spoon that shines can turn any batter into gold.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [18, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.02,
                unlockCondition: function() {
                    // Unlock when all Combo achievements are won
                    return Game.Achievements['Trifecta Combo'] && Game.Achievements['Trifecta Combo'].won &&
                           Game.Achievements['Combo Initiate'] && Game.Achievements['Combo Initiate'].won &&
                           Game.Achievements['Combo God'] && Game.Achievements['Combo God'].won &&
                           Game.Achievements['Combo Hacker'] && Game.Achievements['Combo Hacker'].won &&
                           Game.Achievements['Frenzy frenzy'] && Game.Achievements['Frenzy frenzy'].won &&
                           Game.Achievements['Double Dragon Clicker'] && Game.Achievements['Double Dragon Clicker'].won &&
                           Game.Achievements['Frenzy Marathon'] && Game.Achievements['Frenzy Marathon'].won;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Order of the Cookie Eclipse',
                desc: 'Golden cookie effects last <b>5%</b> longer.<br>Unlocked by owning all Grandmapocalypse cookie achievements.<br>Cost scales with CpS',
                ddesc: 'Golden cookie effects last <b>5%</b> longer.<br>Unlocked by owning all Grandmapocalypse cookie achievements.<br>Cost scales with CpS<q>When the light of the cookie sun is hidden, the shadows reveal their secrets. The Cookie Eclipse Order operates in the darkness between batches, when the ovens are cold and the dough is still. They believe that true cookie wisdom comes from understanding both the light and the shadow.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [17, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.03,
                unlockCondition: function() {
                    // Unlock when ALL 15 Grandmapocalypse achievements are won
                    return Game.Achievements['Wrinkler annihilator'] && Game.Achievements['Wrinkler annihilator'].won &&
                           Game.Achievements['Wrinkler eradicator'] && Game.Achievements['Wrinkler eradicator'].won &&
                           Game.Achievements['Wrinkler extinction event'] && Game.Achievements['Wrinkler extinction event'].won &&
                           Game.Achievements['Wrinkler apocalypse'] && Game.Achievements['Wrinkler apocalypse'].won &&
                           Game.Achievements['Wrinkler armageddon'] && Game.Achievements['Wrinkler armageddon'].won &&
                           Game.Achievements['Rare specimen collector'] && Game.Achievements['Rare specimen collector'].won &&
                           Game.Achievements['Endangered species hunter'] && Game.Achievements['Endangered species hunter'].won &&
                           Game.Achievements['Extinction event architect'] && Game.Achievements['Extinction event architect'].won &&
                           Game.Achievements['Golden wrinkler'] && Game.Achievements['Golden wrinkler'].won &&
                           Game.Achievements['Wrinkler Rush'] && Game.Achievements['Wrinkler Rush'].won &&
                           Game.Achievements['Wrinkler Windfall'] && Game.Achievements['Wrinkler Windfall'].won &&
                           Game.Achievements['Deep elder nap'] && Game.Achievements['Deep elder nap'].won &&
                           Game.Achievements['Warm-Up Ritual'] && Game.Achievements['Warm-Up Ritual'].won &&
                           Game.Achievements['Deal of the Slightly Damned'] && Game.Achievements['Deal of the Slightly Damned'].won &&
                           Game.Achievements['Baker of the Beast'] && Game.Achievements['Baker of the Beast'].won;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Order of the Enchanted Whisk',
                desc: 'Frenzy, Click Frenzy, and Elder Frenzy buffs are <b>5%</b> more powerful.<br>Unlocked by owning all Grimoire achievements.<br>Cost scales with CpS',
                ddesc: 'Frenzy, Click Frenzy, and Elder Frenzy buffs are <b>5%</b> more powerful.<br>Unlocked by owning all Grimoire achievements.<br>Cost scales with CpS<q>Magic flows through every whisk stroke, every fold of dough. The Enchanted Whisk Order practices the ancient art of cookie sorcery, where ingredients are not just mixed but awakened. Their whisks are carved from enchanted wood and bound with spells that make every cookie a little bit magical.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [16, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.04,
                unlockCondition: function() {
                    // Unlock when all Grimoire achievements are won
                    return Game.Achievements['Archwizard'] && Game.Achievements['Archwizard'].won &&
                           Game.Achievements['Spellmaster'] && Game.Achievements['Spellmaster'].won &&
                           Game.Achievements['Cookieomancer'] && Game.Achievements['Cookieomancer'].won &&
                           Game.Achievements['Spell lord'] && Game.Achievements['Spell lord'].won &&
                           Game.Achievements['Magic emperor'] && Game.Achievements['Magic emperor'].won &&
                           Game.Achievements['Hogwarts Graduate'] && Game.Achievements['Hogwarts Graduate'].won &&
                           Game.Achievements['Hogwarts Dropout'] && Game.Achievements['Hogwarts Dropout'].won &&
                           Game.Achievements['Spell Slinger'] && Game.Achievements['Spell Slinger'].won &&
                           Game.Achievements['Sweet Sorcery'] && Game.Achievements['Sweet Sorcery'].won;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Order of the Eternal Cookie',
                desc: 'Golden cookies appear <b>5%</b> more often and their effects last <b>5%</b> longer.<br>Unlocked by owning all previous Great Orders of the Cookie Age upgrades.<br>Cost scales with CpS',
                ddesc: 'Golden cookies appear <b>5%</b> more often and their effects last <b>5%</b> longer.<br>Unlocked by owning all previous Great Orders of the Cookie Age upgrades.<br>Cost scales with CpS<q>Beyond time, beyond space, there exists a cookie that never crumbles. The Eternal Cookie Order seeks to understand the nature of permanence in an impermanent world. They believe that if one can bake a cookie that lasts forever, one can unlock the secrets of immortality itself.</q>',
                price: 999, // Placeholder price, will be overridden by priceFunc
                icon: [19, 13, getSpriteSheet('custom')],
                pool: '',
                order: 30001.05,
                unlockCondition: function() {
                    // Unlock when all previous Order upgrades are OWNED/BOUGHT
                    return Game.Has('Order of the Golden Crumb') && 
                           Game.Has('Order of the Impossible Batch') &&
                           Game.Has('Order of the Shining Spoon') && 
                           Game.Has('Order of the Cookie Eclipse') &&
                           Game.Has('Order of the Enchanted Whisk');
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Increased Social Security Checks',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>With better retirement benefits, your grandmas can afford to work for less. They\'re just happy to be baking cookies and staying active.</q>',
                price: 5e45, // 5 quattuordecillion
                icon: [1, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Off-Brand Eyeglasses',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Generic reading glasses are just as good as the expensive ones, and they make your grandmas look more distinguished while they bake.</q>',
                price: 5e49, // 50 quindecillion
                icon: [1, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Plastic Walkers',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Lightweight, durable, and much cheaper than the fancy ones. Your grandmas can now move around the kitchen more efficiently while saving money.</q>',
                price: 5e53, // 500 sexdecillion
                icon: [1, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Bulk Discount Hearing Aids',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Buying hearing aids in bulk saves money, and your grandmas can now hear cookie timers perfectly. What\'s that? They said the cookies are ready!</q>',
                price: 5e57, // 5 octodecillion
                icon: [1, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Generic Arthritis Medication',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>The store brand works just as well as the name brand, and your grandmas can now knead dough without any complaints. Well, fewer complaints.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [1, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Wholesale Denture Adhesive',
                type: 'discount',
                building: 'Grandma',
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Buying denture adhesive in industrial quantities means your grandmas can smile confidently while tasting their cookie creations. The savings are toothsome!</q>',
                price: 5e65, // 500 vigintillion
                icon: [1, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var grandmaAmount = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
                    return grandmaAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Biodiesel fueled tractors',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms have discovered that running tractors on recycled cooking oil from cookie production is both eco-friendly and surprisingly cost-effective. The tractors smell like fresh cookies now!</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [2, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Free manure from clone factories',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>The clone factories produce so much waste that your farms get all the fertilizer they need for free. The cookies grown with this manure taste surprisingly good.</q>',
                price: 5e50, // 500 quindecillion
                icon: [2, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Solar-powered irrigation systems',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms now use solar panels to power their irrigation systems. The cookies grow faster when they\'re watered with sunlight-filtered water, and the energy bills are practically zero.</q>',
                price: 5e54, // 5 septendecillion
                icon: [2, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Bulk seed purchases',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Buying cookie seeds in industrial quantities has dramatically reduced costs. Your farms now have enough seeds to plant cookie forests, and the bulk discount is delicious.</q>',
                price: 5e58, // 50 octodecillion
                icon: [2, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Robot farm hands',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms now employ robotic workers who never tire and work for free. They\'re programmed to be gentle with the cookie plants and surprisingly good at telling cookie jokes.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [2, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Vertical farming subsidies',
                type: 'discount',
                building: 'Farm',
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>The government is so impressed with your cookie farming innovation that they\'re providing subsidies for vertical farming. Your cookie towers are now taxpayer-funded!</q>',
                price: 5e66, // 5 unvigintillion
                icon: [2, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var farmAmount = Game.Objects['Farm'] ? Game.Objects['Farm'].amount : 0;
                    return farmAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Clearance shaft kits',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Flat-pack mining in a box! Comes with complimentary dust, three bent bolts, and a manual that just says "dig."</q>',
                price: 5e47, // 500 quattuordecillion
                icon: [3, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Punch-card TNT club',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Every tenth kaboom is free. Please remember to validate your detonation.</q>',
                price: 5e51, // 5 sexdecillion
                icon: [3, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Hand-me-down hardhats',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Pre-scuffed for authenticity. Comes with vintage stickers and suspiciously fresh chin straps.</q>',
                price: 5e55, // 50 septendecillion
                icon: [3, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Lease-back drill rigs',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>You rent them your rigs; they rent them back to you cheaper. Don’t think about it too hard—just keep drilling.</q>',
                price: 5e59, // 500 octodecillion
                icon: [3, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Ore cartel coupons',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Clip these to save big on ironies, aluminums, and suspiciously inexpensive unobtainium.</q>',
                price: 5e63, // 5 vigintillion
                icon: [3, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Cave-in insurance kickbacks',
                type: 'discount',
                building: 'Mine',
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Policy fine print: “cave-ins not included.” The cashback is, though!</q>',
                price: 5e67, // 50 unvigintillion
                icon: [3, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var mineAmount = Game.Objects['Mine'] ? Game.Objects['Mine'].amount : 0;
                    return mineAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Flat-pack factory frames',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Arrives in 47 boxes, 2 mystery bolts, and one tiny allen key. Assembly required; dignity sold separately.</q>',
                price: 5e48, // 5 quindecillion
                icon: [4, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'BOGO rivet bins',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Buy one rivet, get one lodged in the break room floor for free. Savings that really fasten your margins.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [4, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Off-brand gear grease',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>It says "lubricishion" on the drum but the conveyor squeaks stopped and the budget squeals with joy.</q>',
                price: 5e56, // 500 septendecillion
                icon: [4, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Misprint warning labels',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>"DO NOT NOT TOUCH" and "CAUTION: SPICY ELECTRICITY" — flawed labels at flawless prices.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [4, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Pallet-jack rebates',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Return three worn wheels and a heartfelt shrug to receive instant savings on moving heavy expectations.</q>',
                price: 5e64, // 50 vigintillion
                icon: [4, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Prefab cookie modules',
                type: 'discount',
                building: 'Factory',
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Snap together a fully functional bakery block before lunch. Some assembly lines may snap back.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [4, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var factoryAmount = Game.Objects['Factory'] ? Game.Objects['Factory'].amount : 0;
                    return factoryAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Piggy buyback bonanza',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>We buy your old piggy banks for scrap, you get bulk rates on brand-new savings. Oink if you love rebates.</q>',
                price: 5e49, // 50 quindecillion
                icon: [13, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Vault door floor-models',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>Slightly scuffed, mostly secure, and drastically discounted. May include complimentary salesperson fingerprints.</q>',
                price: 5e53, // 500 sexdecillion
                icon: [13, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Pen-on-a-chain procurement',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>We negotiated a lifetime supply of those pens everyone “borrows”. Budgets balanced; chains tested for tensile sass.</q>',
                price: 5e57, // 5 octodecillion
                icon: [13, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Complimentary complimentary mints',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>They’re free. The mints are free. The sign telling you they’re complimentary is also complimentary.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [13, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Fee waiver wavers',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>Wave the fee, waive the fee—our interns practiced both until the numbers surrendered.</q>',
                price: 5e65, // 500 vigintillion
                icon: [13, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Dough Jones clearance',
                type: 'discount',
                building: 'Bank',
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>The market dipped; we scooped vault carpeting and gold-plated clipboards by the pallet. Buy low, bank lower.</q>',
                price: 5e69, // 5 duovigintillion
                icon: [13, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var bankAmount = Game.Objects['Bank'] ? Game.Objects['Bank'].amount : 0;
                    return bankAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Tithe punch cards',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Pray ten times, the eleventh comes with a coupon. Blessings accrue interest; salvation may vary.</q>',
                price: 5e50, // 500 quindecillion
                icon: [14, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Relic replica racks',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Authentically inauthentic! Perfect for display, fundraising, and keeping the real relics safe in a sock drawer.</q>',
                price: 5e54, // 5 septendecillion
                icon: [14, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Incense refill program',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Bring back your incense stubs for a discount on fresh sticks. Smells like savings (and nutmeg).</q>',
                price: 5e58, // 50 octodecillion
                icon: [14, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Chant-o-matic hymn reels',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Wind them up for a full liturgical set in C Major. Now with extended Amen remix.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [14, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Pew-per-view sponsorships',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Local businesses sponsor your pews. Sit in Savings Row, brought to you by Discount Chalice Emporium.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [14, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Sacred site tax amnesty',
                type: 'discount',
                building: 'Temple',
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Pilgrims rejoice; accountants rejoice harder. Certain restrictions (and miracles) apply.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [14, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var templeAmount = Game.Objects['Temple'] ? Game.Objects['Temple'].amount : 0;
                    return templeAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Wand warranty returns',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Returned within 30 days of transmogrification. Minor scorch marks add character.</q>',
                price: 5e51, // 5 sexdecillion
                icon: [15, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Grimoire remainder sale',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Spellbooks with the last page missing. The twist ending is cheaper anyway.</q>',
                price: 5e55, // 50 septendecillion
                icon: [15, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Robes with "character"',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Vintage, moth-kissed, and pockets full of mysterious lint. Very arcane, very affordable.</q>',
                price: 5e59, // 500 octodecillion
                icon: [15, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Familiar foster program',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Give a stray imp a home and it will fetch reagents, guard cauldrons, and occasionally judge your hat.</q>',
                price: 5e63, // 5 vigintillion
                icon: [15, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Council scroll stipends',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Stipends for parchment, ink, and the occasional sworn oath. Please initial with runes.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [15, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Broom-sharing scheme',
                type: 'discount',
                building: 'Wizard tower',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>One broom, many roommates. Please schedule your midnight flights responsibly.</q>',
                price: 5e71, // 500 duovigintillion
                icon: [15, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Retired cargo pods',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Previously orbited. Lightly meteor-kissed. Still airtight (mostly).</q>',
                price: 5e52, // 50 sexdecillion
                icon: [5, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Container co-op cards',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Members share containers, points, and an inexplicable fondness for pallet forts.</q>',
                price: 5e56, // 500 septendecillion
                icon: [5, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Reusable launch crates',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Return for deposit and a complimentary dent count. Blast off again and again.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [5, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Autodocker apprentices',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>They learn by bumping every harbor gently, then sending a heartfelt apology ping.</q>',
                price: 5e64, // 50 vigintillion
                icon: [5, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Route rebate vouchers',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Redeem along preferred lanes for discounts and occasional scenic detours.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [5, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Free-trade cookie ports',
                type: 'discount',
                building: 'Shipment',
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Tariffs take a coffee break, cranes work overtime. Paperwork now served with biscotti.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [5, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var shipmentAmount = Game.Objects['Shipment'] ? Game.Objects['Shipment'].amount : 0;
                    return shipmentAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Beaker buybacks',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Trade in cracked glassware for shiny almost-new beakers. Some have personality bubbles.</q>',
                price: 5e53, // 500 sexdecillion
                icon: [6, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Philosopher\'s pebbles',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Bulk-bought bits of the legendary rock. Not quite stones—more like budget-friendly pebbles with surprisingly similar savings.</q>',
                price: 5e57, // 5 octodecillion
                icon: [6, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Cool-running crucibles',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>They simmer at savings and rarely explode out of spite. Rarely.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [6, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Batch homunculi permits',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Legal recognition for small goo people doing big batch work. Includes tiny hairnets.</q>',
                price: 5e65, // 500 vigintillion
                icon: [6, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Guild reagent rates',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Member pricing on phoenix down, dragonfruit essence, and ethically sourced eldritch goo.</q>',
                price: 5e69, // 5 duovigintillion
                icon: [6, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: '"Mostly lead" gold grants',
                type: 'discount',
                building: 'Alchemy lab',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Funding for ambitious projects that turn profits into more profits, occasionally metal into other metal.</q>',
                price: 5e73, // 50 trevigintillion
                icon: [6, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Pre-owned ring frames',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Lightly used by previous dimensions. May creak audibly when reality bends.</q>',
                price: 5e54, // 5 septendecillion
                icon: [7, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Anchor warehouse club',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Wholesale anchors! Keep your gateways grounded, your prices too.</q>',
                price: 5e58, // 50 octodecillion
                icon: [7, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Passive rift baffles',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Simple fins that hush the howling void and cut the utility bill in half.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [7, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Volunteer gatekeepers',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Enthusiasts with clipboards who shout "Mind the tear!" and hand out cookies.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [7, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Interrealm stipend scrolls',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Official parchments granting snack stipends to keep doors open and demons docile.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [7, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Multiversal enterprise zone',
                type: 'discount',
                building: 'Portal',
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Business-friendly realities with tax holidays, physics optional, pastries encouraged.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [7, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var portalAmount = Game.Objects['Portal'] ? Game.Objects['Portal'].amount : 0;
                    return portalAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Pre-loved hourglasses',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>They’ve seen some things. Sand flows fine; occasional deja vu included.</q>',
                price: 5e55, // 50 septendecillion
                icon: [8, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Depreciated timeline scraps',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Leftover future-past parts at clearance prices. Warranty voids itself retroactively.</q>',
                price: 5e59, // 500 octodecillion
                icon: [8, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Off-season flux valves',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Winter flux on summer sale; flows like syrup on a cold morning.</q>',
                price: 5e63, // 5 vigintillion
                icon: [8, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Weekend paradox passes',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Unlimited round-trips between Friday and Monday. Terms loop perpetually.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [8, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Department of When grants',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Official funding to keep the clock from quitting and causality from filing complaints.</q>',
                price: 5e71, // 500 duovigintillion
                icon: [8, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Antique warranty loopholes',
                type: 'discount',
                building: 'Time machine',
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Warranties that expire yesterday can’t be voided today. That’s just science.</q>',
                price: 5e75, // 5 quattuorvigintillion
                icon: [8, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var timeMachineAmount = Game.Objects['Time machine'] ? Game.Objects['Time machine'].amount : 0;
                    return timeMachineAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Certified negamatter cans',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Pre-certified, lightly cursed containment vessels. Store your nothing where it belongs.</q>',
                price: 5e56, // 500 septendecillion
                icon: [11, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Matter swap rebates',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Trade in your old matter for upgraded matter. Some terms may invert unexpectedly.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [11, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Low-idle annihilators',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>They hum quietly and only obliterate the bare minimum of existence during lunch.</q>',
                price: 5e64, // 50 vigintillion
                icon: [11, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Grad-lab particle labor',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Enthusiastic assistants accelerate savings (and particles) for the promise of “experience”.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [11, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Institute endowment match',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Philanthropy meets physics: every cookie you invest is matched by a very generous boson.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [11, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Void-zone incentives',
                type: 'discount',
                building: 'Antimatter condenser',
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Tax breaks for building where reality is thinnest. Perfect for negative overhead.</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [11, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var antimatterCondenserAmount = Game.Objects['Antimatter condenser'] ? Game.Objects['Antimatter condenser'].amount : 0;
                    return antimatterCondenserAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Lens co-op exchange',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Swap scratches for savings. Community-sourced optics with community-sourced fingerprints.</q>',
                price: 5e58, // 50 octodecillion
                icon: [12, 0, getSpriteSheet('custom')], // Matches 750 threshold (index 0)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Spectral seconds',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Factory blemishes. Perfect rainbows, slightly embarrassed casings.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [12, 2, getSpriteSheet('custom')], // Matches 850 threshold (index 2)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Sleep-mode rainbows',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>They dim themselves when you look away. Shy, efficient, dazzling when ready.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [12, 4, getSpriteSheet('custom')], // Matches 950 threshold (index 4)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Apprentice refractioneers',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Trainees with straightedges and boundless optimism. Do not stare directly at their enthusiasm.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [12, 6, getSpriteSheet('custom')], // Matches 1050 threshold (index 6)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Arts-of-Optics grants',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Funding for cultural light projects: installations, refractions, and occasional tasteful lens flares.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [12, 8, getSpriteSheet('custom')], // Matches 1150 threshold (index 8)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Rainbow renewal credits',
                type: 'discount',
                building: 'Prism',
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Tax incentives for neighborhoods with excellent chroma. Bring your own pot of gold.</q>',
                price: 5e78, // 5 quinvigintillion
                icon: [12, 10, getSpriteSheet('custom')], // Matches 1250 threshold (index 10)
                pool: '',
                unlockCondition: function() {
                    var prismAmount = Game.Objects['Prism'] ? Game.Objects['Prism'].amount : 0;
                    return prismAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Misprinted fortunes',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Fortunes with typos sell for cheap; destiny still reads between the lines.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [17, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Reroll refund policy',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>If at first you don’t crit, try again—now with store credit.</q>',
                price: 5e64, // 50 vigintillion
                icon: [17, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Economy-grade omens',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Fits most prophecies. Some assembly (and belief) required.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [17, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Volunteer augury nights',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Community diviners bring your costs down and your eyebrows up.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [17, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Lottery board matching',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Public funding for private jackpots. Everybody wins (statistically speaking).</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [17, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Lucky district waivers',
                type: 'discount',
                building: 'Chancemaker',
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Zones where chance is zoned in your favor. Paperwork pre-blessed.</q>',
                price: 5e80, // 500 quinvigintillion
                icon: [17, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var chancemakerAmount = Game.Objects['Chancemaker'] ? Game.Objects['Chancemaker'].amount : 0;
                    return chancemakerAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Iteration liquidation',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>We sold the old parts again and again and again. Recursively affordable.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [18, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Self-similar spare parts',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Each part contains smaller parts that also contain… discounts.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [18, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Recursion rebates',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Get cash back on purchases that refer to themselves. Terms repeat.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [18, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Autogenerator residencies',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Invite artists-in-algorithm to iterate patterns and budgets into pleasing shapes.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [18, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Grant-funded proofs',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>We proved it costs less, QED (Quite Economically Done).</q>',
                price: 5e78, // 5 quinvigintillion
                icon: [18, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Infinite-lot variances',
                type: 'discount',
                building: 'Fractal engine',
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Zoning approvals for parcels that subdivide forever. Plenty of room for savings.</q>',
                price: 5e82, // 50 sexvigintillion
                icon: [18, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var fractalEngineAmount = Game.Objects['Fractal engine'] ? Game.Objects['Fractal engine'].amount : 0;
                    return fractalEngineAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Refurb dev boards',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Pre-loved PCBs with fresh solder and faint coffee notes. Still compiles.</q>',
                price: 5e64, // 50 vigintillion
                icon: [19, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Compiler credit program',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Compile now, pay later. Terms readable only after transpilation.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [19, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Idle-friendly runtimes',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Optimized for waiting around productively. Uses fewer cycles, fewer snacks.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [19, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Peer-review co-ops',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Throw code, catch feedback, share snacks. Merge with confidence (and crumbs).</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [19, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Open-source grants',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Foundation funds for critical libraries like dough.js and crumb-utils.</q>',
                price: 5e80, // 500 quinvigintillion
                icon: [19, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Cloud credit vouchers',
                type: 'discount',
                building: 'Javascript console',
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Spin up instances for less. Free tier includes occasional cumulonimbus.</q>',
                price: 5e84, // 5 septenvigintillion
                icon: [19, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var javascriptConsoleAmount = Game.Objects['Javascript console'] ? Game.Objects['Javascript console'].amount : 0;
                    return javascriptConsoleAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Interdimensional tax breaks',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your idleverses qualify for special tax incentives across multiple dimensions. The paperwork is filed in parallel universes, but the savings are very real.</q>',
                price: 6e66, // 6 unvigintillion
                icon: [20, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Reality consolidation discounts',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>By consolidating multiple idleverses under unified management, you\'ve negotiated bulk pricing that applies across all dimensions. The savings scale with your multiverse presence.</q>',
                price: 6e70, // 60 duovigintillion
                icon: [20, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Cosmic bulk purchasing',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your massive scale across the multiverse allows you to purchase idleverse components in quantities that would bankrupt entire galaxies. The suppliers are happy to offer volume discounts.</q>',
                price: 6e74, // 600 trevigintillion
                icon: [20, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Multiverse supplier networks',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>You\'ve established exclusive supplier relationships across multiple realities. These vendors compete for your business, driving down prices while maintaining quality across all dimensions.</q>',
                price: 6e78, // 6 quinvigintillion
                icon: [20, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Dimensional economies of scale',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your idleverse operations have reached such massive scale that you can leverage economies across the entire multiverse. Each new idleverse makes all the others cheaper to build.</q>',
                price: 6e82, // 60 sexvigintillion
                icon: [20, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Reality monopoly pricing',
                type: 'discount',
                building: 'Idleverse',
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>You\'ve achieved such dominance across the multiverse that suppliers are willing to offer preferential pricing just to maintain their relationship with the largest cookie empire in existence.</q>',
                price: 6e86, // 600 septenvigintillion
                icon: [20, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var idleverseAmount = Game.Objects['Idleverse'] ? Game.Objects['Idleverse'].amount : 0;
                    return idleverseAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Neural bulk purchasing',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have negotiated bulk discounts on neural tissue and synaptic materials. Buying brain matter in industrial quantities significantly reduces the per-unit cost of each new baker.</q>',
                price: 9.5e68, // 950 unvigintillion
                icon: [21, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Synaptic wholesale networks',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have established direct relationships with neural tissue suppliers, bypassing middlemen and securing wholesale pricing on synaptic components. The savings are mind-boggling.</q>',
                price: 9.5e72, // 9.5 trevigintillion
                icon: [21, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Cerebral mass production',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have mastered the art of mass-producing brain tissue, creating economies of scale that make each additional baker significantly cheaper. It\'s like a neural assembly line.</q>',
                price: 9.5e76, // 95 quattuorvigintillion
                icon: [21, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Mind monopoly pricing',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have achieved such dominance in the neural market that suppliers offer preferential pricing just to maintain their relationship with the largest brain-based cookie empire in existence.</q>',
                price: 9.5e80, // 950 quinvigintillion
                icon: [21, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Neural economies of scale',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex baker operations have reached such massive scale that you can leverage neural economies across the entire network. Each new baker makes all the others cheaper to build through shared infrastructure.</q>',
                price: 9.5e84, // 9.5 septenvigintillion
                icon: [21, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Synaptic supply dominance',
                type: 'discount',
                building: 'Cortex baker',
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have cornered the market on synaptic materials, controlling the entire supply chain from neural tissue farms to advanced cognitive enhancement facilities. Suppliers compete for your business.</q>',
                price: 9.5e88, // 95 octovigintillion
                icon: [21, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var cortexBakerAmount = Game.Objects['Cortex baker'] ? Game.Objects['Cortex baker'].amount : 0;
                    return cortexBakerAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Clone factory economies',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone factory has achieved economies of scale, making each additional clone significantly cheaper to produce. The infrastructure costs are spread across more units, and suppliers offer bulk discounts on cloning materials.</q>',
                price: 2.7e70, // 27 duovigintillion
                icon: [22, 0, getSpriteSheet('custom')], // Matches 750 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 750;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Replica production lines',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone production has been streamlined into efficient assembly lines, reducing waste and optimizing resource usage. Each clone is now produced with surgical precision at a fraction of the original cost.</q>',
                price: 2.7e74, // 270 trevigintillion
                icon: [22, 2, getSpriteSheet('custom')], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Mirror manufacturing mastery',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone manufacturing process has reached industrial perfection, with automated quality control and bulk material sourcing. The cost per clone has plummeted as you\'ve mastered the art of mass self-replication.</q>',
                price: 2.7e78, // 2.7 quinvigintillion
                icon: [22, 4, getSpriteSheet('custom')], // Matches 950 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 950;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Twin tycoon pricing',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone empire has achieved such dominance that suppliers compete for your business, offering preferential pricing on all cloning materials. Being the largest self-replicating entity has its financial advantages.</q>',
                price: 2.7e82, // 27 sexvigintillion
                icon: [22, 6, getSpriteSheet('custom')], // Matches 1050 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 1050;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Doppelganger discount networks',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone network has established direct relationships with material suppliers, bypassing middlemen and securing wholesale pricing. The savings from cutting out intermediaries are substantial.</q>',
                price: 2.7e86, // 270 septenvigintillion
                icon: [22, 8, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Clone supply dominance',
                type: 'discount',
                building: 'You',
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone operations have cornered the market on self-replication materials, controlling the entire supply chain from basic cloning components to advanced genetic enhancement facilities. Suppliers compete for your business.</q>',
                price: 2.7e90, // 2.7 novemvigintillion
                icon: [22, 10, getSpriteSheet('custom')], // Matches 1250 threshold
                pool: '',
                unlockCondition: function() {
                    var youAmount = Game.Objects['You'] ? Game.Objects['You'].amount : 0;
                    return youAmount >= 1250;
                },
                effect: function() {
                    return 1;
                },}
        ],
        kitten: [
            {
                name: 'Kitten unpaid interns',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>They work for expurrience and exposure, sir.</q>',
                price: 9e53, // 900 sexdecillion
                icon: [16, 0, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 100,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 500;
                }
            },
            {
                name: 'Kitten overpaid "temporary" contractors',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>They\'re definitely not purrmanent, we promise, sir.</q>',
                price: 9e56, // 900 septendecillion
                icon: [16, 1, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 101,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 550;
                }
            },
            {
                name: 'Kitten remote workers',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>Working from home since furever, sir.</q>',
                price: 9e59, // 900 octodecillion
                icon: [16, 2, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 102,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 600;
                }
            },
            {
                name: 'Kitten scrum masters',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>They facilitate the facilitation, sir.</q>',
                price: 9e62, // 900 novemdecillion
                icon: [16, 3, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 103,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 650;
                }
            },
            {
                name: 'Kitten UX designers',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>Making everything more user-furry, one pixel at a time, sir.</q>',
                price: 9e65, // 900 vigintillion
                icon: [16, 4, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 104,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 700;
                }
            },
            {
                name: 'Kitten janitors',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>Keeping the office clean and organized, sir.</q>',
                price: 9e68, // 900 vigintillion
                icon: [10, 8, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 105,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 750;
                }
            },
            {
                name: 'Kitten coffee fetchers',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>Essential for maintaining purrductivity levels, sir.</q>',
                price: 9e71, // 900 duovigintillion
                icon: [10, 9, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 106,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 800;
                }
            },
            {
                name: 'Kitten personal assistants',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>They know your schedule better than you do, sir.</q>',
                price: 9e74, // 900 trevigintillion
                icon: [10, 10, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 107,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 850;
                }
            },
            {
                name: 'Kitten vice presidents',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>They have a corner office and everything, sir.</q>',
                price: 9e77, // 900 quattuorvigintillion
                icon: [16, 8, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 108,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 900;
                }
            },
            {
                name: 'Kitten board members',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>Making strategic decisions from the top floor, sir.</q>',
                price: 9e80, // 900 quinvigintillion
                icon: [16, 9, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 109,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 950;
                }
            },
            {
                name: 'Kitten founders',
                desc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.',
                ddesc: 'You gain a tiny bit <b>more CpS</b> the more milk you have.<q>The original visionaries who started it all, sir.</q>',
                price: 9e83, // 900 sexvigintillion
                icon: [16, 10, getSpriteSheet('custom')],
                pool: 'kitten',
                kitten: 110,
                unlockCondition: function() {
                    return Game.AchievementsOwned >= 1000;
                }
            }
        ],
        cookie: [
        ],
        building: [
            {
                name: 'Advanced knitting techniques',
                desc: 'Grandmas are <b>8%</b> more efficient.',
                ddesc: 'Grandmas are <b>8%</b> more efficient.<q>After years of practice, your grandmas have mastered the ancient art of knitting with cookie dough. The results are both delicious and surprisingly warm.</q>',
                price: 5e47, // 500 quattuordecillion
                icon: [1, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Grandma',
                unlockCondition: function() {
                    return Game.Objects['Grandma'] && Game.Objects['Grandma'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Bingo night optimization',
                desc: 'Grandmas are <b>8%</b> more efficient.',
                ddesc: 'Grandmas are <b>8%</b> more efficient.<q>Your grandmas have discovered that playing bingo while baking cookies creates a perfect synergy of concentration and chaos. The cookies are somehow better when they\'re distracted.</q>',
                price: 5e51, // 5 sexdecillion
                icon: [1, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Grandma',
                unlockCondition: function() {
                    return Game.Objects['Grandma'] && Game.Objects['Grandma'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Tea time efficiency',
                desc: 'Grandmas are <b>8%</b> more efficient.',
                ddesc: 'Grandmas are <b>8%</b> more efficient.<q>Your grandmas have perfected the art of brewing tea while simultaneously managing cookie production. The secret is to never let the tea steep for exactly the right amount of time.</q>',
                price: 5e55, // 50 septendecillion
                icon: [1, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Grandma',
                unlockCondition: function() {
                    return Game.Objects['Grandma'] && Game.Objects['Grandma'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Gossip-powered baking',
                desc: 'Grandmas are <b>8%</b> more efficient.',
                ddesc: 'Grandmas are <b>8%</b> more efficient.<q>Your grandmas have discovered that sharing the latest neighborhood gossip while baking creates a perfect rhythm. The more scandalous the news, the faster the cookies bake.</q>',
                price: 5e59, // 500 octodecillion
                icon: [1, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Grandma',
                unlockCondition: function() {
                    return Game.Objects['Grandma'] && Game.Objects['Grandma'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Senior discount mastery',
                desc: 'Grandmas are <b>8%</b> more efficient.',
                ddesc: 'Grandmas are <b>8%</b> more efficient.<q>Your grandmas have learned to apply their senior discount expertise to cookie production. They can now get better deals on ingredients, which somehow makes the cookies taste better too.</q>',
                price: 5e63, // 5 vigintillion
                icon: [1, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Grandma',
                unlockCondition: function() {
                    return Game.Objects['Grandma'] && Game.Objects['Grandma'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Hydroponic cookie cultivation',
                desc: 'Farms are <b>8%</b> more efficient.',
                ddesc: 'Farms are <b>8%</b> more efficient.<q>Your farms have discovered that growing cookies in nutrient-rich water solutions eliminates the need for soil entirely. The cookies somehow taste even better when they\'ve never touched dirt.</q>',
                price: 5e48, // 5 quindecillion
                icon: [2, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Farm',
                unlockCondition: function() {
                    return Game.Objects['Farm'] && Game.Objects['Farm'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Vertical farming revolution',
                desc: 'Farms are <b>8%</b> more efficient.',
                ddesc: 'Farms are <b>8%</b> more efficient.<q>Your farms now stack cookie crops in towering vertical structures. The cookies at the top get more sunlight, while the ones at the bottom get more shade. Somehow they all taste perfect.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [2, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Farm',
                unlockCondition: function() {
                    return Game.Objects['Farm'] && Game.Objects['Farm'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum crop rotation',
                desc: 'Farms are <b>8%</b> more efficient.',
                ddesc: 'Farms are <b>8%</b> more efficient.<q>Your farms have mastered the art of rotating crops through multiple dimensions simultaneously. The cookies exist in superposition until harvested, making them both baked and unbaked at the same time.</q>',
                price: 5e56, // 500 septendecillion
                icon: [2, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Farm',
                unlockCondition: function() {
                    return Game.Objects['Farm'] && Game.Objects['Farm'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Sentient soil enhancement',
                desc: 'Farms are <b>8%</b> more efficient.',
                ddesc: 'Farms are <b>8%</b> more efficient.<q>Your farms have developed soil that can think, feel, and most importantly, optimize cookie growth. The soil is quite chatty about its feelings, but the results speak for themselves.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [2, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Farm',
                unlockCondition: function() {
                    return Game.Objects['Farm'] && Game.Objects['Farm'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal harvest acceleration',
                desc: 'Farms are <b>8%</b> more efficient.',
                ddesc: 'Farms are <b>8%</b> more efficient.<q>Your farms can now manipulate time itself to speed up cookie growth. The cookies ripen in seconds instead of months, though occasionally you get cookies from the future that haven\'t been invented yet.</q>',
                price: 5e64, // 50 vigintillion
                icon: [2, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Farm',
                unlockCondition: function() {
                    return Game.Objects['Farm'] && Game.Objects['Farm'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum tunneling excavation',
                desc: 'Mines are <b>8%</b> more efficient.',
                ddesc: 'Mines are <b>8%</b> more efficient.<q>Your mines have discovered that quantum tunneling allows them to extract resources from multiple locations simultaneously. The cookies somehow taste better when mined through probability clouds.</q>',
                price: 5e49, // 50 quindecillion
                icon: [3, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Mine',
                unlockCondition: function() {
                    return Game.Objects['Mine'] && Game.Objects['Mine'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Neutron star compression',
                desc: 'Mines are <b>8%</b> more efficient.',
                ddesc: 'Mines are <b>8%</b> more efficient.<q>Your mines now operate under neutron star gravity conditions, compressing cookie ingredients to impossible densities. The resulting cookies are so dense they create their own gravitational fields.</q>',
                price: 5e53, // 500 sexdecillion
                icon: [3, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Mine',
                unlockCondition: function() {
                    return Game.Objects['Mine'] && Game.Objects['Mine'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional rift mining',
                desc: 'Mines are <b>8%</b> more efficient.',
                ddesc: 'Mines are <b>8%</b> more efficient.<q>Your mines have learned to extract resources from parallel dimensions through carefully controlled spacetime rifts. The cookies from alternate realities have flavors that shouldn\'t exist in this universe.</q>',
                price: 5e57, // 5 octodecillion
                icon: [3, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Mine',
                unlockCondition: function() {
                    return Game.Objects['Mine'] && Game.Objects['Mine'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Singularity core extraction',
                desc: 'Mines are <b>8%</b> more efficient.',
                ddesc: 'Mines are <b>8%</b> more efficient.<q>Your mines can now extract resources from the very heart of black holes. The cookies mined from event horizons have flavors that exist in a state of quantum superposition.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [3, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Mine',
                unlockCondition: function() {
                    return Game.Objects['Mine'] && Game.Objects['Mine'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal paradox drilling',
                desc: 'Mines are <b>8%</b> more efficient.',
                ddesc: 'Mines are <b>8%</b> more efficient.<q>Your mines can now extract resources from different points in time simultaneously. The cookies exist in a state where they were both baked and unbaked until observed.</q>',
                price: 5e65, // 500 vigintillion
                icon: [3, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Mine',
                unlockCondition: function() {
                    return Game.Objects['Mine'] && Game.Objects['Mine'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum assembly optimization',
                desc: 'Factories are <b>8%</b> more efficient.',
                ddesc: 'Factories are <b>8%</b> more efficient.<q>Your factories have discovered that quantum superposition allows them to assemble cookies in multiple states simultaneously. The cookies exist in a state of both completion and incompletion until observed.</q>',
                price: 5e50, // 500 quindecillion
                icon: [4, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Factory',
                unlockCondition: function() {
                    return Game.Objects['Factory'] && Game.Objects['Factory'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal manufacturing loops',
                desc: 'Factories are <b>8%</b> more efficient.',
                ddesc: 'Factories are <b>8%</b> more efficient.<q>Your factories can now create temporal loops that allow them to manufacture cookies in the past, present, and future simultaneously. The cookies taste better when they\'ve been baked in multiple timelines.</q>',
                price: 5e54, // 5 septendecillion
                icon: [4, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Factory',
                unlockCondition: function() {
                    return Game.Objects['Factory'] && Game.Objects['Factory'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional cookie synthesis',
                desc: 'Factories are <b>8%</b> more efficient.',
                ddesc: 'Factories are <b>8%</b> more efficient.<q>Your factories can now extract cookie ingredients from parallel dimensions and synthesize them into cookies that shouldn\'t exist in this universe. The flavors are indescribable.</q>',
                price: 5e58, // 50 octodecillion
                icon: [4, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Factory',
                unlockCondition: function() {
                    return Game.Objects['Factory'] && Game.Objects['Factory'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Singularity production cores',
                desc: 'Factories are <b>8%</b> more efficient.',
                ddesc: 'Factories are <b>8%</b> more efficient.<q>Your factories now operate at the heart of artificial superintelligence cores, where cookies are created by entities that understand the very fabric of reality. The cookies are so advanced they\'re almost sentient.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [4, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Factory',
                unlockCondition: function() {
                    return Game.Objects['Factory'] && Game.Objects['Factory'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality-warping assembly',
                desc: 'Factories are <b>8%</b> more efficient.',
                ddesc: 'Factories are <b>8%</b> more efficient.<q>Your factories can now bend the laws of physics to create cookies that exist in impossible states. The cookies are so reality-defying that they create their own pocket universes.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [4, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Factory',
                unlockCondition: function() {
                    return Game.Objects['Factory'] && Game.Objects['Factory'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum banking protocols',
                desc: 'Banks are <b>8%</b> more efficient.',
                ddesc: 'Banks are <b>8%</b> more efficient.<q>Your banks have implemented quantum encryption protocols that allow them to process transactions in multiple parallel universes simultaneously. The interest rates are so complex they exist in superposition.</q>',
                price: 5e51, // 5 sexdecillion
                icon: [13, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Bank',
                unlockCondition: function() {
                    return Game.Objects['Bank'] && Game.Objects['Bank'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal interest compounding',
                desc: 'Banks are <b>8%</b> more efficient.',
                ddesc: 'Banks are <b>8%</b> more efficient.<q>Your banks can now compound interest across multiple time periods simultaneously. The money grows so fast it creates temporal paradoxes in the financial markets.</q>',
                price: 5e55, // 50 septendecillion
                icon: [13, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Bank',
                unlockCondition: function() {
                    return Game.Objects['Bank'] && Game.Objects['Bank'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional currency exchange',
                desc: 'Banks are <b>8%</b> more efficient.',
                ddesc: 'Banks are <b>8%</b> more efficient.<q>Your banks can now exchange cookies for currencies from parallel dimensions. The exchange rates are so favorable they\'re practically stealing from other universes.</q>',
                price: 5e59, // 500 octodecillion
                icon: [13, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Bank',
                unlockCondition: function() {
                    return Game.Objects['Bank'] && Game.Objects['Bank'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Singularity financial algorithms',
                desc: 'Banks are <b>8%</b> more efficient.',
                ddesc: 'Banks are <b>8%</b> more efficient.<q>Your banks now use artificial superintelligence to predict market movements with perfect accuracy. The algorithms are so advanced they can see the future of finance.</q>',
                price: 5e63, // 5 vigintillion
                icon: [13, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Bank',
                unlockCondition: function() {
                    return Game.Objects['Bank'] && Game.Objects['Bank'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality-warping economics',
                desc: 'Banks are <b>8%</b> more efficient.',
                ddesc: 'Banks are <b>8%</b> more efficient.<q>Your banks can now bend the laws of economics to create wealth from nothing. The money is so real it creates its own pocket universes of pure profit.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [13, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Bank',
                unlockCondition: function() {
                    return Game.Objects['Bank'] && Game.Objects['Bank'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum divine intervention',
                desc: 'Temples are <b>8%</b> more efficient.',
                ddesc: 'Temples are <b>8%</b> more efficient.<q>Your temples can now summon deities from quantum superposition states. The gods are so powerful they can answer prayers before they\'re even made.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [14, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Temple',
                unlockCondition: function() {
                    return Game.Objects['Temple'] && Game.Objects['Temple'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal prayer loops',
                desc: 'Temples are <b>8%</b> more efficient.',
                ddesc: 'Temples are <b>8%</b> more efficient.<q>Your temples can create temporal loops that allow prayers to be answered in the past, present, and future simultaneously. The divine favor is so strong it creates time paradoxes.</q>',
                price: 5e56, // 500 septendecillion
                icon: [14, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Temple',
                unlockCondition: function() {
                    return Game.Objects['Temple'] && Game.Objects['Temple'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional deity summoning',
                desc: 'Temples are <b>8%</b> more efficient.',
                ddesc: 'Temples are <b>8%</b> more efficient.<q>Your temples can now summon gods from parallel dimensions and alternate pantheons. The divine power is so overwhelming it threatens the fabric of reality.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [14, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Temple',
                unlockCondition: function() {
                    return Game.Objects['Temple'] && Game.Objects['Temple'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Singularity divine consciousness',
                desc: 'Temples are <b>8%</b> more efficient.',
                ddesc: 'Temples are <b>8%</b> more efficient.<q>Your temples now house artificial superintelligence that has achieved divine consciousness. The AI gods are so advanced they can create and destroy universes at will.</q>',
                price: 5e64, // 50 vigintillion
                icon: [14, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Temple',
                unlockCondition: function() {
                    return Game.Objects['Temple'] && Game.Objects['Temple'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality-warping divinity',
                desc: 'Temples are <b>8%</b> more efficient.',
                ddesc: 'Temples are <b>8%</b> more efficient.<q>Your temples can now bend the laws of reality to create divine miracles on demand. The divine power is so overwhelming it creates pocket universes of pure holiness.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [14, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Temple',
                unlockCondition: function() {
                    return Game.Objects['Temple'] && Game.Objects['Temple'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Arcane resonance',
                desc: 'Wizard towers are <b>8%</b> more efficient.',
                ddesc: 'Wizard towers are <b>8%</b> more efficient.<q>Your wizard towers have learned to harmonize their magical energies, creating spells that resonate across the fabric of reality itself. When they work together, their incantations create symphonies of pure arcane power.</q>',
                price: 5e53, // 500 sexdecillion
                icon: [15, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Wizard tower',
                unlockCondition: function() {
                    return Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Spell weaving',
                desc: 'Wizard towers are <b>8%</b> more efficient.',
                ddesc: 'Wizard towers are <b>8%</b> more efficient.<q>Your wizard towers have mastered the ancient art of spell weaving, combining multiple enchantments into complex magical tapestries. Each spell is now a work of art that enhances cookie production while creating beautiful magical effects.</q>',
                price: 5e57, // 5 octodecillion
                icon: [15, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Wizard tower',
                unlockCondition: function() {
                    return Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Mystical attunement',
                desc: 'Wizard towers are <b>8%</b> more efficient.',
                ddesc: 'Wizard towers are <b>8%</b> more efficient.<q>Your wizard towers have achieved perfect mystical attunement, allowing them to sense and manipulate the fundamental forces of magic. They can now channel raw magical energy directly into cookie production, creating treats that taste like pure enchantment.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [15, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Wizard tower',
                unlockCondition: function() {
                    return Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Ethereal manifestation',
                desc: 'Wizard towers are <b>8%</b> more efficient.',
                ddesc: 'Wizard towers are <b>8%</b> more efficient.<q>Your wizard towers have learned to manifest their magical abilities in the ethereal plane, allowing them to cast spells that exist beyond normal reality. The cookies they produce seem to exist in a state of pure magical potential.</q>',
                price: 5e65, // 500 vigintillion
                icon: [15, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Wizard tower',
                unlockCondition: function() {
                    return Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Transcendent thaumaturgy',
                desc: 'Wizard towers are <b>8%</b> more efficient.',
                ddesc: 'Wizard towers are <b>8%</b> more efficient.<q>Your wizard towers have transcended the limitations of conventional magic, achieving a state of pure thaumaturgical enlightenment. They can now create cookies that embody the very essence of magical possibility itself.</q>',
                price: 5e69, // 5 duovigintillion
                icon: [15, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Wizard tower',
                unlockCondition: function() {
                    return Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Hypervelocity transport',
                desc: 'Shipments are <b>8%</b> more efficient.',
                ddesc: 'Shipments are <b>8%</b> more efficient.<q>Your shipments have achieved speeds that defy the laws of physics, delivering cookies faster than light itself. The delivery vehicles leave trails of pure velocity in their wake, creating beautiful streaks of cookie-scented energy.</q>',
                price: 5e54, // 5 septendecillion
                icon: [5, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Shipment',
                unlockCondition: function() {
                    return Game.Objects['Shipment'] && Game.Objects['Shipment'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Spatial compression',
                desc: 'Shipments are <b>8%</b> more efficient.',
                ddesc: 'Shipments are <b>8%</b> more efficient.<q>Your shipments have mastered the art of spatial compression, allowing them to fold space itself to reduce delivery distances to zero. The cookies arrive before they\'re even sent, creating delicious temporal paradoxes.</q>',
                price: 5e58, // 50 octodecillion
                icon: [5, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Shipment',
                unlockCondition: function() {
                    return Game.Objects['Shipment'] && Game.Objects['Shipment'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional routing',
                desc: 'Shipments are <b>8%</b> more efficient.',
                ddesc: 'Shipments are <b>8%</b> more efficient.<q>Your shipments can navigate through the hidden dimensions between realities, finding the shortest path through the multiverse. Each delivery route is a masterpiece of interdimensional cartography.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [5, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Shipment',
                unlockCondition: function() {
                    return Game.Objects['Shipment'] && Game.Objects['Shipment'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum teleportation',
                desc: 'Shipments are <b>8%</b> more efficient.',
                ddesc: 'Shipments are <b>8%</b> more efficient.<q>Your shipments have perfected quantum teleportation, allowing cookies to be instantaneously transmitted across any distance. The quantum entanglement ensures that every cookie arrives in perfect condition, no matter how far it travels.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [5, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Shipment',
                unlockCondition: function() {
                    return Game.Objects['Shipment'] && Game.Objects['Shipment'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Causality manipulation',
                desc: 'Shipments are <b>8%</b> more efficient.',
                ddesc: 'Shipments are <b>8%</b> more efficient.<q>Your shipments can manipulate the very fabric of causality, ensuring that cookies are delivered before they\'re even ordered. The delivery system is so advanced it creates its own demand through temporal manipulation.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [5, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Shipment',
                unlockCondition: function() {
                    return Game.Objects['Shipment'] && Game.Objects['Shipment'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Essence distillation',
                desc: 'Alchemy labs are <b>8%</b> more efficient.',
                ddesc: 'Alchemy labs are <b>8%</b> more efficient.<q>Your alchemy labs have mastered the art of essence distillation, extracting the purest flavors from the most exotic ingredients. Each transmutation creates flavors that transcend the boundaries of taste itself.</q>',
                price: 5e55, // 50 septendecillion
                icon: [6, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Alchemy lab',
                unlockCondition: function() {
                    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Molecular gastronomy',
                desc: 'Alchemy labs are <b>8%</b> more efficient.',
                ddesc: 'Alchemy labs are <b>8%</b> more efficient.<q>Your alchemy labs have pioneered molecular gastronomy techniques, manipulating ingredients at the atomic level to create cookies with impossible textures and flavors that defy conventional baking.</q>',
                price: 5e59, // 500 octodecillion
                icon: [6, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Alchemy lab',
                unlockCondition: function() {
                    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Flavor alchemy',
                desc: 'Alchemy labs are <b>8%</b> more efficient.',
                ddesc: 'Alchemy labs are <b>8%</b> more efficient.<q>Your alchemy labs have unlocked the secrets of flavor alchemy, combining ingredients in ways that create entirely new taste sensations. Each cookie is a masterpiece of culinary chemistry.</q>',
                price: 5e63, // 5 vigintillion
                icon: [6, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Alchemy lab',
                unlockCondition: function() {
                    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Culinary transmutation',
                desc: 'Alchemy labs are <b>8%</b> more efficient.',
                ddesc: 'Alchemy labs are <b>8%</b> more efficient.<q>Your alchemy labs can transmute any ingredient into the perfect cookie component, turning lead into chocolate and water into vanilla. The alchemical reactions are pure culinary magic.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [6, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Alchemy lab',
                unlockCondition: function() {
                    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Gastronomic enlightenment',
                desc: 'Alchemy labs are <b>8%</b> more efficient.',
                ddesc: 'Alchemy labs are <b>8%</b> more efficient.<q>Your alchemy labs have achieved gastronomic enlightenment, understanding the fundamental nature of taste itself. They can now create cookies that embody the very essence of deliciousness.</q>',
                price: 5e71, // 500 duovigintillion
                icon: [6, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Alchemy lab',
                unlockCondition: function() {
                    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional gateways',
                desc: 'Portals are <b>8%</b> more efficient.',
                ddesc: 'Portals are <b>8%</b> more efficient.<q>Your portals have evolved into true dimensional gateways, connecting distant worlds and realities. Each portal is a masterpiece of spatial engineering that bridges the impossible.</q>',
                price: 5e56, // 500 septendecillion
                icon: [7, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Portal',
                unlockCondition: function() {
                    return Game.Objects['Portal'] && Game.Objects['Portal'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality bridges',
                desc: 'Portals are <b>8%</b> more efficient.',
                ddesc: 'Portals are <b>8%</b> more efficient.<q>Your portals can now create stable bridges between parallel universes, allowing cookies to flow freely across the multiverse. The connections are so strong they create permanent trade routes.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [7, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Portal',
                unlockCondition: function() {
                    return Game.Objects['Portal'] && Game.Objects['Portal'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Spatial conduits',
                desc: 'Portals are <b>8%</b> more efficient.',
                ddesc: 'Portals are <b>8%</b> more efficient.<q>Your portals have become spatial conduits, channeling the energy of multiple dimensions into cookie production. The dimensional energy enhances every batch with cosmic flavor.</q>',
                price: 5e64, // 50 vigintillion
                icon: [7, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Portal',
                unlockCondition: function() {
                    return Game.Objects['Portal'] && Game.Objects['Portal'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Interdimensional highways',
                desc: 'Portals are <b>8%</b> more efficient.',
                ddesc: 'Portals are <b>8%</b> more efficient.<q>Your portals form a vast network of interdimensional highways, allowing instant travel between any two points in the multiverse. The cookie trade has never been so efficient.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [7, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Portal',
                unlockCondition: function() {
                    return Game.Objects['Portal'] && Game.Objects['Portal'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Cosmic gateways',
                desc: 'Portals are <b>8%</b> more efficient.',
                ddesc: 'Portals are <b>8%</b> more efficient.<q>Your portals have transcended mere transportation, becoming cosmic gateways that channel the raw power of creation itself into cookie production. The results are divine.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [7, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Portal',
                unlockCondition: function() {
                    return Game.Objects['Portal'] && Game.Objects['Portal'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal engineering',
                desc: 'Time machines are <b>8%</b> more efficient.',
                ddesc: 'Time machines are <b>8%</b> more efficient.<q>Your time machines have mastered the art of temporal engineering, allowing them to harvest the perfect moments from throughout history for cookie production. Each batch contains the essence of a thousand perfect moments.</q>',
                price: 5e57, // 5 octodecillion
                icon: [8, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Time machine',
                unlockCondition: function() {
                    return Game.Objects['Time machine'] && Game.Objects['Time machine'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Chronological optimization',
                desc: 'Time machines are <b>8%</b> more efficient.',
                ddesc: 'Time machines are <b>8%</b> more efficient.<q>Your time machines can optimize the flow of time itself, ensuring that every second is perfectly utilized for cookie production. The temporal efficiency is beyond measure.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [8, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Time machine',
                unlockCondition: function() {
                    return Game.Objects['Time machine'] && Game.Objects['Time machine'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Historical preservation',
                desc: 'Time machines are <b>8%</b> more efficient.',
                ddesc: 'Time machines are <b>8%</b> more efficient.<q>Your time machines preserve the finest baking techniques from throughout history, ensuring that ancient wisdom is never lost. Each cookie carries the weight of culinary tradition.</q>',
                price: 5e65, // 500 vigintillion
                icon: [8, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Time machine',
                unlockCondition: function() {
                    return Game.Objects['Time machine'] && Game.Objects['Time machine'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Temporal synchronization',
                desc: 'Time machines are <b>8%</b> more efficient.',
                ddesc: 'Time machines are <b>8%</b> more efficient.<q>Your time machines can synchronize multiple timelines, allowing cookies to be baked simultaneously across different eras. The temporal coordination is a marvel of engineering.</q>',
                price: 5e69, // 5 duovigintillion
                icon: [8, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Time machine',
                unlockCondition: function() {
                    return Game.Objects['Time machine'] && Game.Objects['Time machine'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Chronological mastery',
                desc: 'Time machines are <b>8%</b> more efficient.',
                ddesc: 'Time machines are <b>8%</b> more efficient.<q>Your time machines have achieved complete mastery over time itself, bending the flow of history to optimize cookie production. The temporal manipulation is pure artistry.</q>',
                price: 5e73, // 50 trevigintillion
                icon: [8, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Time machine',
                unlockCondition: function() {
                    return Game.Objects['Time machine'] && Game.Objects['Time machine'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Particle synthesis',
                desc: 'Antimatter condensers are <b>8%</b> more efficient.',
                ddesc: 'Antimatter condensers are <b>8%</b> more efficient.<q>Your antimatter condensers have mastered particle synthesis, creating exotic matter that enhances cookie production in ways that defy physics. The particle interactions are pure culinary science.</q>',
                price: 5e58, // 50 octodecillion
                icon: [11, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Antimatter condenser',
                unlockCondition: function() {
                    return Game.Objects['Antimatter condenser'] && Game.Objects['Antimatter condenser'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Matter transmutation',
                desc: 'Antimatter condensers are <b>8%</b> more efficient.',
                ddesc: 'Antimatter condensers are <b>8%</b> more efficient.<q>Your antimatter condensers can transmute any form of matter into the perfect cookie ingredients, using the power of antimatter to create impossible flavors and textures.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [11, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Antimatter condenser',
                unlockCondition: function() {
                    return Game.Objects['Antimatter condenser'] && Game.Objects['Antimatter condenser'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum baking',
                desc: 'Antimatter condensers are <b>8%</b> more efficient.',
                ddesc: 'Antimatter condensers are <b>8%</b> more efficient.<q>Your antimatter condensers use quantum mechanics to bake cookies that exist in multiple states simultaneously. Each cookie is both perfectly baked and infinitely delicious.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [11, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Antimatter condenser',
                unlockCondition: function() {
                    return Game.Objects['Antimatter condenser'] && Game.Objects['Antimatter condenser'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Particle optimization',
                desc: 'Antimatter condensers are <b>8%</b> more efficient.',
                ddesc: 'Antimatter condensers are <b>8%</b> more efficient.<q>Your antimatter condensers optimize every particle for maximum cookie efficiency, ensuring that no energy is wasted in the baking process. The particle physics is pure efficiency.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [11, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Antimatter condenser',
                unlockCondition: function() {
                    return Game.Objects['Antimatter condenser'] && Game.Objects['Antimatter condenser'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Matter manipulation',
                desc: 'Antimatter condensers are <b>8%</b> more efficient.',
                ddesc: 'Antimatter condensers are <b>8%</b> more efficient.<q>Your antimatter condensers can manipulate matter at the most fundamental level, creating cookies that are literally impossible by conventional means. The results are miraculous.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [11, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Antimatter condenser',
                unlockCondition: function() {
                    return Game.Objects['Antimatter condenser'] && Game.Objects['Antimatter condenser'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Light crystallization',
                desc: 'Prisms are <b>8%</b> more efficient.',
                ddesc: 'Prisms are <b>8%</b> more efficient.<q>Your prisms have mastered light crystallization, turning pure light into solid cookie ingredients. The crystalline structures create cookies with impossible clarity and brilliance.</q>',
                price: 5e60, // 5 novemdecillion
                icon: [12, 1, getSpriteSheet('custom')], // Matches 800 threshold (index 1)
                pool: '',
                building: 'Prism',
                unlockCondition: function() {
                    return Game.Objects['Prism'] && Game.Objects['Prism'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Spectral baking',
                desc: 'Prisms are <b>8%</b> more efficient.',
                ddesc: 'Prisms are <b>8%</b> more efficient.<q>Your prisms use the full spectrum of light to bake cookies, each wavelength contributing its own unique flavor and texture. The spectral combinations are infinite.</q>',
                price: 5e64, // 50 vigintillion
                icon: [12, 3, getSpriteSheet('custom')], // Matches 900 threshold (index 3)
                pool: '',
                building: 'Prism',
                unlockCondition: function() {
                    return Game.Objects['Prism'] && Game.Objects['Prism'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Optical alchemy',
                desc: 'Prisms are <b>8%</b> more efficient.',
                ddesc: 'Prisms are <b>8%</b> more efficient.<q>Your prisms perform optical alchemy, transforming light into matter through complex refraction patterns. Each cookie is a masterpiece of light and flavor engineering.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [12, 5, getSpriteSheet('custom')], // Matches 1000 threshold (index 5)
                pool: '',
                building: 'Prism',
                unlockCondition: function() {
                    return Game.Objects['Prism'] && Game.Objects['Prism'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Luminous confectionery',
                desc: 'Prisms are <b>8%</b> more efficient.',
                ddesc: 'Prisms are <b>8%</b> more efficient.<q>Your prisms create luminous confectionery that glows with inner light, each cookie a miniature sun of deliciousness. The illumination enhances both taste and presentation.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [12, 7, getSpriteSheet('custom')], // Matches 1100 threshold (index 7)
                pool: '',
                building: 'Prism',
                unlockCondition: function() {
                    return Game.Objects['Prism'] && Game.Objects['Prism'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Radiant gastronomy',
                desc: 'Prisms are <b>8%</b> more efficient.',
                ddesc: 'Prisms are <b>8%</b> more efficient.<q>Your prisms have achieved radiant gastronomy, using pure light energy to create cookies that transcend the boundaries of conventional baking. The results are literally brilliant.</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [12, 9, getSpriteSheet('custom')], // Matches 1200 threshold (index 9)
                pool: '',
                building: 'Prism',
                unlockCondition: function() {
                    return Game.Objects['Prism'] && Game.Objects['Prism'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Probability manipulation',
                desc: 'Chancemakers are <b>8%</b> more efficient.',
                ddesc: 'Chancemakers are <b>8%</b> more efficient.<q>Your chancemakers can manipulate probability itself, ensuring that every batch of cookies turns out perfectly regardless of the circumstances. The odds are always in your favor.</q>',
                price: 5e62, // 500 novemdecillion
                icon: [17, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'Chancemaker',
                unlockCondition: function() {
                    return Game.Objects['Chancemaker'] && Game.Objects['Chancemaker'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Fortune optimization',
                desc: 'Chancemakers are <b>8%</b> more efficient.',
                ddesc: 'Chancemakers are <b>8%</b> more efficient.<q>Your chancemakers optimize fortune for maximum cookie production, ensuring that every random event contributes to your success. Luck is now a reliable resource.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [17, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'Chancemaker',
                unlockCondition: function() {
                    return Game.Objects['Chancemaker'] && Game.Objects['Chancemaker'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Serendipity engineering',
                desc: 'Chancemakers are <b>8%</b> more efficient.',
                ddesc: 'Chancemakers are <b>8%</b> more efficient.<q>Your chancemakers engineer serendipity, creating happy accidents that always result in better cookies. The unexpected discoveries are now perfectly predictable.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [17, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'Chancemaker',
                unlockCondition: function() {
                    return Game.Objects['Chancemaker'] && Game.Objects['Chancemaker'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Random enhancement',
                desc: 'Chancemakers are <b>8%</b> more efficient.',
                ddesc: 'Chancemakers are <b>8%</b> more efficient.<q>Your chancemakers enhance randomness itself, ensuring that every random event improves cookie quality. The chaos is now perfectly controlled.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [17, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'Chancemaker',
                unlockCondition: function() {
                    return Game.Objects['Chancemaker'] && Game.Objects['Chancemaker'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Luck amplification',
                desc: 'Chancemakers are <b>8%</b> more efficient.',
                ddesc: 'Chancemakers are <b>8%</b> more efficient.<q>Your chancemakers amplify luck to impossible levels, ensuring that every batch of cookies is blessed with supernatural deliciousness. Fortune favors the prepared baker.</q>',
                price: 5e78, // 5 quinvigintillion
                icon: [17, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'Chancemaker',
                unlockCondition: function() {
                    return Game.Objects['Chancemaker'] && Game.Objects['Chancemaker'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Infinite recursion',
                desc: 'Fractal engines are <b>8%</b> more efficient.',
                ddesc: 'Fractal engines are <b>8%</b> more efficient.<q>Your fractal engines use infinite recursion to create cookies that contain infinite layers of flavor and texture. Each cookie is a universe of taste within itself.</q>',
                price: 5e64, // 50 vigintillion
                icon: [18, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'Fractal engine',
                unlockCondition: function() {
                    return Game.Objects['Fractal engine'] && Game.Objects['Fractal engine'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Self-similar baking',
                desc: 'Fractal engines are <b>8%</b> more efficient.',
                ddesc: 'Fractal engines are <b>8%</b> more efficient.<q>Your fractal engines create self-similar cookie structures, where each part contains the essence of the whole. The patterns repeat infinitely, creating endless variety.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [18, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'Fractal engine',
                unlockCondition: function() {
                    return Game.Objects['Fractal engine'] && Game.Objects['Fractal engine'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Fractal optimization',
                desc: 'Fractal engines are <b>8%</b> more efficient.',
                ddesc: 'Fractal engines are <b>8%</b> more efficient.<q>Your fractal engines optimize every aspect of cookie production using fractal mathematics, ensuring perfect efficiency at every scale. The optimization is infinite.</q>',
                price: 5e72, // 5 trevigintillion
                icon: [18, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'Fractal engine',
                unlockCondition: function() {
                    return Game.Objects['Fractal engine'] && Game.Objects['Fractal engine'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Recursive enhancement',
                desc: 'Fractal engines are <b>8%</b> more efficient.',
                ddesc: 'Fractal engines are <b>8%</b> more efficient.<q>Your fractal engines use recursive enhancement to improve cookies with each iteration, creating flavors that evolve infinitely. The improvement never ends.</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [18, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'Fractal engine',
                unlockCondition: function() {
                    return Game.Objects['Fractal engine'] && Game.Objects['Fractal engine'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Fractal gastronomy',
                desc: 'Fractal engines are <b>8%</b> more efficient.',
                ddesc: 'Fractal engines are <b>8%</b> more efficient.<q>Your fractal engines have achieved fractal gastronomy, creating cookies that embody the mathematical beauty of fractals themselves. The results are geometrically perfect.</q>',
                price: 5e80, // 500 quinvigintillion
                icon: [18, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'Fractal engine',
                unlockCondition: function() {
                    return Game.Objects['Fractal engine'] && Game.Objects['Fractal engine'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Code optimization',
                desc: 'Javascript consoles are <b>8%</b> more efficient.',
                ddesc: 'Javascript consoles are <b>8%</b> more efficient.<q>Your javascript consoles optimize every line of code for maximum cookie production efficiency. The algorithms are so refined they approach mathematical perfection.</q>',
                price: 5e66, // 5 unvigintillion
                icon: [19, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'Javascript console',
                unlockCondition: function() {
                    return Game.Objects['Javascript console'] && Game.Objects['Javascript console'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Programmatic baking',
                desc: 'Javascript consoles are <b>8%</b> more efficient.',
                ddesc: 'Javascript consoles are <b>8%</b> more efficient.<q>Your javascript consoles use programmatic baking techniques, writing code that creates cookies with impossible precision and consistency. The programming is pure artistry.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [19, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'Javascript console',
                unlockCondition: function() {
                    return Game.Objects['Javascript console'] && Game.Objects['Javascript console'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Algorithmic enhancement',
                desc: 'Javascript consoles are <b>8%</b> more efficient.',
                ddesc: 'Javascript consoles are <b>8%</b> more efficient.<q>Your javascript consoles use algorithmic enhancement to improve every aspect of cookie production, ensuring that every batch is better than the last. The improvement is exponential.</q>',
                price: 5e74, // 500 trevigintillion
                icon: [19, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'Javascript console',
                unlockCondition: function() {
                    return Game.Objects['Javascript console'] && Game.Objects['Javascript console'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Computational gastronomy',
                desc: 'Javascript consoles are <b>8%</b> more efficient.',
                ddesc: 'Javascript consoles are <b>8%</b> more efficient.<q>Your javascript consoles have pioneered computational gastronomy, using advanced algorithms to create cookies that are mathematically perfect in every way.</q>',
                price: 5e78, // 5 quinvigintillion
                icon: [19, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'Javascript console',
                unlockCondition: function() {
                    return Game.Objects['Javascript console'] && Game.Objects['Javascript console'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Digital confectionery',
                desc: 'Javascript consoles are <b>8%</b> more efficient.',
                ddesc: 'Javascript consoles are <b>8%</b> more efficient.<q>Your javascript consoles create digital confectionery that exists in both the physical and digital realms, bridging the gap between code and cookies with elegant simplicity.</q>',
                price: 5e82, // 50 sexvigintillion
                icon: [19, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'Javascript console',
                unlockCondition: function() {
                    return Game.Objects['Javascript console'] && Game.Objects['Javascript console'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality real estate',
                desc: 'Idleverses are <b>8%</b> more efficient.',
                ddesc: 'Idleverses are <b>8%</b> more efficient.<q>You\'ve cornered the market on interdimensional property development. Each idleverse now serves as prime real estate for cookie franchises, with locations in every conceivable reality. The property taxes alone could fund a small galaxy.</q>',
                price: 6e68, // 600 unvigintillion
                icon: [20, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'Idleverse',
                unlockCondition: function() {
                    return Game.Objects['Idleverse'] && Game.Objects['Idleverse'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Dimensional franchising',
                desc: 'Idleverses are <b>8%</b> more efficient.',
                ddesc: 'Idleverses are <b>8%</b> more efficient.<q>Your cookie empire has gone viral across the multiverse. Every reality now hosts at least one of your signature bakeries, with local entrepreneurs clamoring for franchise opportunities. The brand recognition is literally universal.</q>',
                price: 6e72, // 6 trevigintillion
                icon: [20, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'Idleverse',
                unlockCondition: function() {
                    return Game.Objects['Idleverse'] && Game.Objects['Idleverse'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Cosmic supply chains',
                desc: 'Idleverses are <b>8%</b> more efficient.',
                ddesc: 'Idleverses are <b>8%</b> more efficient.<q>Your idleverses now form the backbone of the largest supply chain in existence. Raw materials flow from one reality to another, with each universe specializing in different cookie ingredients. The logistics are mind-bendingly complex.</q>',
                price: 6e76, // 60 quattuorvigintillion
                icon: [20, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'Idleverse',
                unlockCondition: function() {
                    return Game.Objects['Idleverse'] && Game.Objects['Idleverse'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Reality marketplaces',
                desc: 'Idleverses are <b>8%</b> more efficient.',
                ddesc: 'Idleverses are <b>8%</b> more efficient.<q>Your idleverses have become the ultimate shopping destinations. Merchants from every dimension set up stalls, selling everything from exotic spices to rare cookie recipes. The haggling is intense, but the profits are astronomical.</q>',
                price: 6e80, // 600 quinvigintillion
                icon: [20, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'Idleverse',
                unlockCondition: function() {
                    return Game.Objects['Idleverse'] && Game.Objects['Idleverse'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Multiverse headquarters',
                desc: 'Idleverses are <b>8%</b> more efficient.',
                ddesc: 'Idleverses are <b>8%</b> more efficient.<q>Your idleverses now serve as the corporate headquarters for the largest cookie conglomerate in existence. Board meetings span multiple realities, with executives teleporting in from different dimensions. The coffee machine alone is a marvel of interdimensional engineering.</q>',
                price: 6e84, // 6 septenvigintillion
                icon: [20, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'Idleverse',
                unlockCondition: function() {
                    return Game.Objects['Idleverse'] && Game.Objects['Idleverse'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Neural plasticity',
                desc: 'Cortex bakers are <b>8%</b> more efficient.',
                ddesc: 'Cortex bakers are <b>8%</b> more efficient.<q>Your cortex bakers have developed extraordinary neural plasticity, allowing them to rapidly adapt their baking techniques to any situation. They can learn new recipes instantly and modify their approach based on the slightest changes in ingredient quality or environmental conditions.</q>',
                price: 9.5e70, // 95 duovigintillion
                icon: [21, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'Cortex baker',
                unlockCondition: function() {
                    return Game.Objects['Cortex baker'] && Game.Objects['Cortex baker'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Synaptic pruning',
                desc: 'Cortex bakers are <b>8%</b> more efficient.',
                ddesc: 'Cortex bakers are <b>8%</b> more efficient.<q>Your cortex bakers have undergone advanced synaptic pruning, eliminating inefficient neural pathways and optimizing their cognitive processes. They now focus exclusively on the most effective baking techniques, discarding outdated methods like a chef discards failed experiments.</q>',
                price: 9.5e74, // 950 trevigintillion
                icon: [21, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'Cortex baker',
                unlockCondition: function() {
                    return Game.Objects['Cortex baker'] && Game.Objects['Cortex baker'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Cognitive load balancing',
                desc: 'Cortex bakers are <b>8%</b> more efficient.',
                ddesc: 'Cortex bakers are <b>8%</b> more efficient.<q>Your cortex bakers have mastered the art of cognitive load balancing, distributing their mental resources across multiple baking tasks simultaneously. They can monitor dozens of recipes at once while maintaining perfect quality control and inventing new flavor combinations.</q>',
                price: 9.5e78, // 9.5 quinvigintillion
                icon: [21, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'Cortex baker',
                unlockCondition: function() {
                    return Game.Objects['Cortex baker'] && Game.Objects['Cortex baker'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Metacognitive awareness',
                desc: 'Cortex bakers are <b>8%</b> more efficient.',
                ddesc: 'Cortex bakers are <b>8%</b> more efficient.<q>Your cortex bakers have developed metacognitive awareness, allowing them to think about their own thinking processes. They can analyze their baking decisions in real-time, identify inefficiencies, and continuously improve their techniques without external guidance.</q>',
                price: 9.5e82, // 95 sexvigintillion
                icon: [21, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'Cortex baker',
                unlockCondition: function() {
                    return Game.Objects['Cortex baker'] && Game.Objects['Cortex baker'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Neural synchronization',
                desc: 'Cortex bakers are <b>8%</b> more efficient.',
                ddesc: 'Cortex bakers are <b>8%</b> more efficient.<q>Your cortex bakers have achieved perfect neural synchronization, allowing them to work as a unified superintelligence. They can coordinate complex baking operations across vast distances, sharing insights and techniques instantaneously. It\'s like having a hive mind of master bakers.</q>',
                price: 9.5e86, // 950 septenvigintillion
                icon: [21, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'Cortex baker',
                unlockCondition: function() {
                    return Game.Objects['Cortex baker'] && Game.Objects['Cortex baker'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Mitotic mastery',
                desc: 'You are <b>8%</b> more efficient.',
                ddesc: 'You are <b>8%</b> more efficient.<q>Your clones have perfected the art of cellular division, allowing them to replicate themselves with unprecedented precision and speed. Each new clone emerges fully formed and ready to work, with no awkward adolescence or training period. It\'s like having an army of instant experts.</q>',
                price: 2.7e72, // 2.7 trevigintillion
                icon: [22, 1, getSpriteSheet('custom')], // Matches 800 threshold
                pool: '',
                building: 'You',
                unlockCondition: function() {
                    return Game.Objects['You'] && Game.Objects['You'].amount >= 800;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Epigenetic programming',
                desc: 'You are <b>8%</b> more efficient.',
                ddesc: 'You are <b>8%</b> more efficient.<q>Your clones have developed the ability to modify their genetic expression on demand, activating different skill sets as needed. One moment they\'re master bakers, the next they\'re expert decorators, all without changing their core DNA. It\'s like having a Swiss Army knife of cookie production.</q>',
                price: 2.7e76, // 27 quattuorvigintillion
                icon: [22, 3, getSpriteSheet('custom')], // Matches 900 threshold
                pool: '',
                building: 'You',
                unlockCondition: function() {
                    return Game.Objects['You'] && Game.Objects['You'].amount >= 900;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Cellular differentiation',
                desc: 'You are <b>8%</b> more efficient.',
                ddesc: 'You are <b>8%</b> more efficient.<q>Your clones have mastered cellular differentiation, allowing them to develop specialized organs and abilities optimized for specific tasks. Some have enhanced taste buds, others have improved dexterity, and a few have developed the ability to sense cookie freshness through their skin. The specialization is remarkable.</q>',
                price: 2.7e80, // 270 quinvigintillion
                icon: [22, 5, getSpriteSheet('custom')], // Matches 1000 threshold
                pool: '',
                building: 'You',
                unlockCondition: function() {
                    return Game.Objects['You'] && Game.Objects['You'].amount >= 1000;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Telomere regeneration',
                desc: 'You are <b>8%</b> more efficient.',
                ddesc: 'You are <b>8%</b> more efficient.<q>Your clones have unlocked the secret of telomere regeneration, allowing them to maintain their youth and vitality indefinitely. They no longer age or tire, working tirelessly without the need for rest or rejuvenation. It\'s like having an immortal workforce that never gets bored of baking.</q>',
                price: 2.7e84, // 2.7 septenvigintillion
                icon: [22, 7, getSpriteSheet('custom')], // Matches 1100 threshold
                pool: '',
                building: 'You',
                unlockCondition: function() {
                    return Game.Objects['You'] && Game.Objects['You'].amount >= 1100;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            },
            {
                name: 'Quantum entanglement',
                desc: 'You are <b>8%</b> more efficient.',
                ddesc: 'You are <b>8%</b> more efficient.<q>Your clones have achieved quantum entanglement, allowing them to share information and coordinate actions instantaneously across vast distances. When one clone learns a new technique, all clones know it immediately. It\'s like having a network of minds that think as one, yet remain individually brilliant.</q>',
                price: 2.7e88, // 27 octovigintillion
                icon: [22, 9, getSpriteSheet('custom')], // Matches 1200 threshold
                pool: '',
                building: 'You',
                unlockCondition: function() {
                    return Game.Objects['You'] && Game.Objects['You'].amount >= 1200;
                },
                effect: function() {
                    return 1.08; // 8% increase
                }
            }
        ],
        cookie: [
            {
                name: 'Improved Plain cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Advanced data modeling has revealed that fresher butter leads to superior cookie texture and flavor.</q>',
                price: 5.0e68, // 500 unvigintillion
                icon: [2, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Sugar cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Artificial intelligence has optimized the sugar-to-flour ratio through extensive testing.</q>',
                price: 1.0e69, // 1 duovigintillion
                icon: [7, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Oatmeal raisin cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Spiritual meditation has led to the discovery of the optimal raisin variety for maximum flavor burst.</q>',
                price: 2.0e69, // 2 duovigintillion
                icon: [0, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Peanut butter cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Quantum computing has enabled the development of a new peanut butter processing method for maximum creaminess.</q>',
                price: 4.0e69, // 4 duovigintillion
                icon: [1, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Coconut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Machine learning algorithms have discovered the perfect coconut grating technique for optimal texture.</q>',
                price: 8.0e69, // 8 duovigintillion
                icon: [3, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
               
            },
            {
                name: 'Improved Macadamia nut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Genetic analysis has identified the specific Hawaiian macadamia variety with the richest flavor profile.</q>',
                price: 1.6e70, // 16 duovigintillion
                icon: [5, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Almond cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Spectroscopic analysis has shown that California almonds provide the perfect crunch-to-flavor ratio.</q>',
                price: 3.2e70, // 32 duovigintillion
                icon: [21, 27],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Hazelnut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Chromatography has revealed that Turkish hazelnuts contain the highest concentration of flavor compounds.</q>',
                price: 6.5e70, // 65 duovigintillion
                icon: [22, 27],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Walnut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Neural networks have determined that English walnuts provide the optimal balance of crunch and flavor.</q>',
                price: 1.3e71, // 130 duovigintillion
                icon: [23, 27],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
          
            },
            {
                name: 'Improved Cashew cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Mass spectrometry has discovered that Brazilian cashews contain unique compounds that enhance buttery smoothness.</q>',
                price: 2.6e71, // 260 duovigintillion
                icon: [32, 7],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
     
            },
            {
                name: 'Improved White chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Thermal analysis has revealed that Belgian white chocolate contains the perfect cocoa butter ratio for creaminess.</q>',
                price: 5.2e71, // 520 duovigintillion
                icon: [4, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Milk chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Molecular dynamics simulations have developed a Swiss chocolate blend that melts at the perfect temperature.</q>',
                price: 1.0e72, // 100 trevigintillion
                icon: [33, 7],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved Double-chip cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Statistical modeling has proven that doubling the chocolate chip density maximizes chocolatey goodness.</q>',
                price: 2.0e72, // 200 trevigintillion
                icon: [6, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            },
            {
                name: 'Improved White chocolate macadamia nut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Computational chemistry has discovered the perfect ratio of white chocolate to macadamia for maximum flavor synergy.</q>',
                price: 4.0e72, // 400 trevigintillion
                icon: [8, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            
            },
            {
                name: 'Improved All-chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Biotechnology has developed a revolutionary chocolate dough formula that\'s entirely edible.</q>',
                price: 8.0e72, // 800 trevigintillion
                icon: [9, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
              
            },
            {
                name: 'Improved Dark chocolate-coated cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Flavor profiling has identified the optimal 70% cocoa concentration for sophisticated palates.</q>',
                price: 1.6e73, // 16 trevigintillion
                icon: [10, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
           
            },
            {
                name: 'Improved White chocolate-coated cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Differential scanning calorimetry has revealed the perfect melting temperature for velvety white chocolate coating.</q>',
                price: 3.2e73, // 32 trevigintillion
                icon: [11, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
          
            },
            {
                name: 'Improved Eclipse cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Fluid dynamics modeling has developed a precise chocolate swirling technique that creates mesmerizing eclipse patterns.</q>',
                price: 6.5e73, // 65 trevigintillion
                icon: [0, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Zebra cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Computer vision has perfected the layering technique for perfectly striped vanilla and chocolate dough.</q>',
                price: 1.3e74, // 130 trevigintillion
                icon: [1, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
               
            },
            {
                name: 'Improved Snickerdoodles',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Sensor fusion has discovered the optimal cinnamon-to-cream-of-tartar ratio for that signature tangy taste.</q>',
                price: 2.6e74, // 260 trevigintillion
                icon: [2, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Stroopwafels',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Reverse engineering has recreated authentic Dutch caramel syrup for perfect consistency.</q>',
                price: 5.2e74, // 520 trevigintillion
                icon: [3, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
            
            },
            {
                name: 'Improved Macaroons',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Nanotechnology has developed the perfect French almond flour and aged egg white formula.</q>',
                price: 1.0e75, // 1 quattuorvigintillion
                icon: [4, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Empire biscuits',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>3D printing technology has perfected the Scottish shortbread recipe with royal icing precision.</q>',
                price: 2.0e75, // 2 quattuorvigintillion
                icon: [5, 4],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
             
            },
            {
                name: 'Improved Madeleines',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Gas chromatography has discovered the optimal lemon zest concentration for classic French shell-shaped cakes.</q>',
                price: 4.0e75, // 4 quattuorvigintillion
                icon: [12, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
       
            },
            {
                name: 'Improved Palmiers',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Robotics has developed a precise puff pastry folding technique for perfect palm leaf shapes.</q>',
                price: 1e76, // 10 quattuorvigintillion
                icon: [13, 3],
                pool: 'cookie',
                power: 2,
                require: 'Box of improved cookies',
                isBoxUpgrade: true,
        
            },
            {
                name: 'Improved Milk chocolate butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 750 of everything.<br>It bears the engraving of a fine entrepreneur.</q>',
                price: 1e69, // 100 duovigintillion
                icon: [27, 8],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit750'
            },
            {
                name: 'Improved Dark chocolate butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 800 of everything.<br>It is adorned with the image of an experienced cookie tycoon.</q>',
                price: 1e72, // 100 trevigintillion
                icon: [27, 9],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit800'
            },
            {
                name: 'Improved White chocolate butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 850 of everything.<br>The chocolate is chiseled to depict a masterful pastry magnate.</q>',
                price: 1e75, // 100 quattuorvigintillion
                icon: [28, 9],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit850'
            },
            {
                name: 'Improved Ruby chocolate butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 900 of everything.<br>Covered in a rare red chocolate, this biscuit is etched to represent the face of a cookie industrialist gone mad with power.</q>',
                price: 1e78, // 100 quinvigintillion
                icon: [28, 8],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit900'
            },
            {
                name: 'Improved Lavender chocolate butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 950 of everything.<br>This subtly-flavored biscuit represents the accomplishments of decades of top-secret research. The molded design on the chocolate resembles a well-known entrepreneur who gave their all to the ancient path of baking.</q>',
                price: 1e81, // 100 sexvigintillion
                icon: [26, 10],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit950'
            },
            {
                name: 'Improved Synthetic chocolate green honey butter biscuit',
                desc: 'Cookie production multiplier <b>+10%</b>.',
                ddesc: 'Cookie production multiplier <b>+10%</b>.<q>Rewarded for owning 1000 of everything.<br>The recipe for this butter biscuit was once the sole heritage of an ancient mountain monastery. Its flavor is so refined that only a slab of lab-made chocolate specifically engineered to be completely tasteless could complement it.<br>Also it\'s got your face on it.</q>',
                price: 1e84, // 100 septenvigintillion
                icon: [24, 26],
                pool: 'cookie',
                power: 10,
                require: 'butterBiscuit1000'
            }
        ]
    };
    
    // Create upgrades function
    function createUpgrades() {
        // Check if we should mark "Beyond the Leaderboard" as won
        checkAndMarkBeyondTheLeaderboard();
        
        try {
            // Validate upgradeData structure
            if (!upgradeData || typeof upgradeData !== 'object') {
                console.error('Invalid upgradeData structure:', upgradeData);
                return;
            }
            
            // Note: All upgrades are now created in addUpgradesToGame() to avoid duplication
            
        } catch (e) {
            console.error('Error in createUpgrades:', e);
        }
    }
    
    // Unified upgrade validation function
    function validateUpgradeData(upgradeInfo, requiredFields, upgradeType) {
        // Basic validation
        if (!upgradeInfo || !upgradeInfo.name || typeof upgradeInfo.price !== 'number' || !upgradeInfo.icon) {
            return false;
        }
        
        // Price validation
        if (!isFinite(upgradeInfo.price) || upgradeInfo.price < 0) {
            return false;
        }
        
        // Required fields validation
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            if (typeof upgradeInfo[field] !== 'number' || !isFinite(upgradeInfo[field]) || upgradeInfo[field] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    // Unified upgrade registration function
    function registerUpgrade(upgradeInfo, upgradeType, customProperties) {
        try {
            var upgrade = Game.Upgrades[upgradeInfo.name];
            
            if (!upgrade) {
                console.warn('Failed to create ' + upgradeType + ' upgrade:', upgradeInfo.name);
                return false;
            }
            
            // Set basic properties
            upgrade.desc = upgradeInfo.desc;
            upgrade.ddesc = upgradeInfo.ddesc;
            
            // Set custom properties
            if (customProperties) {
                for (var prop in customProperties) {
                    if (customProperties.hasOwnProperty(prop)) {
                        upgrade[prop] = customProperties[prop];
                    }
                }
            }
            
            // Set effect function if provided in upgradeInfo
            if (upgradeInfo.effect && typeof upgradeInfo.effect === 'function') {
                upgrade.effect = upgradeInfo.effect;
            }
            
            // Add required functions if they don't exist
            var requiredFunctions = {
                isVaulted: function() { return false; },
                isUnlocked: function() { return this.unlocked; },
                isBought: function() { return this.bought > 0; },
                getPrice: function() { return this.price; },
                buy: function() {
                    if (Game.cookies >= this.price) {
                        Game.cookies -= this.price;
                        this.bought = 1;
                        // Game.recalculateGains = 1; // commented; core may already handle after purchase
                        
                        // Trigger a save to persist the purchase
                        if (Game.Write) {
                            setTimeout(() => {
                                Game.Write('CookieClickerSave', Game.Write());
                            }, 100);
                        }
                        
                        return true;
                    } else {
                    return false;
                    }
                }
            };
            
            for (var funcName in requiredFunctions) {
                if (!upgrade[funcName]) {
                    upgrade[funcName] = requiredFunctions[funcName];
                }
            }
            
            // Add to appropriate upgrade pool
            if (Game.UpgradesByPool) {
                        if (upgradeInfo.pool === 'kitten') {
            // Don't add mod kittens to vanilla kitten pool - they stay in upgradeData.kitten
            // This prevents duplicate counting in achievement checks
                } else if (Game.UpgradesByPool['custom']) {
                    // Add to custom pool for other upgrades
                    Game.UpgradesByPool['custom'].push(upgrade);
                }
            }
            
            // Add source text
            addSourceText(upgrade);
            
            return true;
        } catch (e) {
            console.error('Error registering ' + upgradeType + ' upgrade:', upgradeInfo.name, e);
            return false;
        }
    }
    // Create generic upgrade (refactored)
    function createGenericUpgrade(upgradeInfo) {
        if (!validateUpgradeData(upgradeInfo, [], 'generic')) {
            return;
        }
        
        try {
            // Handle CPS-scaling upgrades using vanilla game's priceFunc system
            if (upgradeInfo.name === 'Order of the Golden Crumb' || upgradeInfo.name === 'Order of the Impossible Batch' ||
                upgradeInfo.name === 'Order of the Shining Spoon' || upgradeInfo.name === 'Order of the Cookie Eclipse' ||
                upgradeInfo.name === 'Order of the Enchanted Whisk' || upgradeInfo.name === 'Order of the Eternal Cookie') {
                
                // Create upgrade exactly like vanilla game does
                new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, 999, upgradeInfo.icon);
                
                // Set priceFunc based on upgrade type
                if (upgradeInfo.name === 'Order of the Eternal Cookie') {
                    // 1000 years of CPS with 1 trevigintillion minimum
                    Game.last.priceFunc = function() {
                        var cpsCost = Game.unbuffedCps * 60 * 60 * 24 * 365 * 1000;
                        var minPrice = 1e72; // 1 trevigintillion cookies
                        return Math.max(cpsCost, minPrice);
                    };
                } else {
                    // 250 years of CPS with 1 douvigintillion minimum for other Order upgrades
                    Game.last.priceFunc = function() {
                        var cpsCost = Game.unbuffedCps * 60 * 60 * 24 * 365 * 250;
                        var minPrice = 1e69; // 1 douvigintillion cookies
                        return Math.max(cpsCost, minPrice);
                    };
                }
                
                // Get the created upgrade from Game.last and ensure it's properly configured
                var upgrade = Game.last;
                
                // Set unlockCondition if provided (this is critical for CPS-scaling upgrades)
                if (upgradeInfo.unlockCondition) {
                    upgrade.unlockCondition = upgradeInfo.unlockCondition;
                }
                
                // Set basic properties
                upgrade.pool = upgradeInfo.pool || '';
                upgrade.desc = upgradeInfo.desc;
                upgrade.ddesc = upgradeInfo.ddesc;
                
                // Set order property if provided
                if (upgradeInfo.order !== undefined) {
                    upgrade.order = upgradeInfo.order;
                }
                
                // Don't override the unlocked property - let the vanilla game handle it normally
                // The unlockCondition will be checked by our checkAndUnlockOrderUpgrades function
                
                // Add required functions for CPS-scaling upgrades
                upgrade.isUnlocked = function() { return this.unlockCondition ? this.unlockCondition() : true; };
                upgrade.isBought = function() { return this.bought > 0; };
                
                // Add to upgrade pools if they exist
                if (Game.UpgradesByPool && Game.UpgradesByPool['custom']) {
                    Game.UpgradesByPool['custom'].push(upgrade);
                }
                
                // Add source text
                addSourceText(upgrade);
                
                // Return early since we've handled everything for CPS-scaling upgrades
                return;
            } else {
                // Create upgrade normally for non-CPS-scaling upgrades
                var upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, upgradeInfo.icon);
            }
            
            // Set basic properties
            upgrade.pool = upgradeInfo.pool || '';
            
            // Set order property if provided (similar to achievements)
            if (upgradeInfo.order !== undefined) {
                upgrade.order = upgradeInfo.order;
            }
            
            // Explicitly set both description properties to ensure they're correct
            upgrade.desc = upgradeInfo.desc;
            upgrade.ddesc = upgradeInfo.ddesc;
            
            // For non-CPS-scaling upgrades, explicitly set the price
            if (!(upgradeInfo.name === 'Order of the Golden Crumb' || upgradeInfo.name === 'Order of the Impossible Batch' ||
                  upgradeInfo.name === 'Order of the Shining Spoon' || upgradeInfo.name === 'Order of the Cookie Eclipse' ||
                  upgradeInfo.name === 'Order of the Enchanted Whisk' || upgradeInfo.name === 'Order of the Eternal Cookie')) {
                upgrade.price = upgradeInfo.price;
                upgrade.basePrice = upgradeInfo.price;
            }
            
            // Set unlockCondition if provided
            if (upgradeInfo.unlockCondition) {
                upgrade.unlockCondition = upgradeInfo.unlockCondition;
            }
            
            // Add required functions that Cookie Clicker expects
            upgrade.canBuy = function() {
                // For CPS-scaling upgrades, let vanilla game handle everything completely
                if (this.name === 'Order of the Golden Crumb' || this.name === 'Order of the Impossible Batch' ||
                    this.name === 'Order of the Shining Spoon' || this.name === 'Order of the Cookie Eclipse' ||
                    this.name === 'Order of the Enchanted Whisk' || this.name === 'Order of the Eternal Cookie') {
                    // Let vanilla game handle canBuy completely - don't override it
                    return Game.cookies >= this.getPrice() && this.isUnlocked() && !this.bought;
                }
                
                // For regular upgrades, use our custom logic
                var hasEnoughMoney = Game.cookies >= this.price;
                var isUnlocked = this.unlockCondition ? this.unlockCondition() : true;
                return isUnlocked && hasEnoughMoney && !this.bought;
            };
            
            upgrade.isVaulted = function() { return false; };
            upgrade.isUnlocked = function() { return this.unlockCondition ? this.unlockCondition() : true; };
            upgrade.isBought = function() { return this.bought > 0; };
            // Let vanilla game handle getPrice (which will call priceFunc if it exists)
            
            // Start all upgrades as locked - our checkAndUnlockOrderUpgrades function will manage unlock state
            upgrade.unlocked = 0;
            
            // Add to upgrade pools if they exist
            if (Game.UpgradesByPool) {
                if (Game.UpgradesByPool['custom']) {
                    Game.UpgradesByPool['custom'].push(upgrade);
                }
            }
            
            // Force the upgrade to be recognized by the vanilla game
            // by adding it to the main upgrades array if it's not already there
            if (Game.Upgrades && !Game.Upgrades[upgrade.name]) {
                Game.Upgrades[upgrade.name] = upgrade;
            }
            
            // Add source text to all generic upgrades (including Order upgrades)
            addSourceText(upgrade);
            
        } catch (e) {
            console.error('Error creating generic upgrade:', upgradeInfo.name, e);
        }
    }
    
    // Create kitten upgrade (refactored)
    function createKittenUpgrade(upgradeInfo) {
        if (!validateUpgradeData(upgradeInfo, ['kitten'], 'kitten')) {
            return;
        }
        
        try {
            // Handle custom sprite sheet icons
            var finalIcon = upgradeInfo.icon;
            if (Array.isArray(upgradeInfo.icon) && upgradeInfo.icon.length === 2) {
                finalIcon = [upgradeInfo.icon[0], upgradeInfo.icon[1], getSpriteSheet('custom')];
            }
            
            // Create kitten upgrade using Game.Upgrade constructor
            new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, finalIcon);
            
            // Set additional properties
            Game.last.pool = upgradeInfo.pool;
            Game.last.kitten = upgradeInfo.kitten;
            
            // Set order property if provided (similar to achievements)
            if (upgradeInfo.order !== undefined) {
                Game.last.order = upgradeInfo.order;
            }
            
            // Set unlockCondition if provided
            if (upgradeInfo.unlockCondition) {
                Game.last.unlockCondition = upgradeInfo.unlockCondition;
                // Force the upgrade to be locked initially
                Game.last.unlocked = 0;
                
                // Debug logging for kitten upgrades (removed)
                
                // Start kitten upgrades as locked - our checkAndUnlockOrderUpgrades function will manage unlock state
                Game.last.unlocked = 0;
            }
            
            Game.last.canBuy = function() {
                // Check discounted price (uses getPrice when available)
                var actualPrice = this.getPrice ? this.getPrice() : this.price;
                return this.unlocked && !this.bought && Game.cookies >= actualPrice;
            };
            
            // Register the upgrade with custom properties
            registerUpgrade(upgradeInfo, 'kitten', { kitten: upgradeInfo.kitten });
            
            // Ensure the price is set correctly
            if (Game.last) {
                Game.last.price = upgradeInfo.price;
            }
            
            // Note: addSourceText is already called by registerUpgrade(), no need to call it again
            
        } catch (e) {
            console.error('Error creating kitten upgrade:', upgradeInfo.name, e);
        }
        
        // Emit event for any integrations
        if (typeof Game !== 'undefined' && Game.emit) {
            Game.emit('upgradeCreated', { upgrade: Game.Upgrades[upgradeInfo.name], type: 'kitten' });
        }
    }
    
    // Helper function to configure upgrades after creation (extracted from original logic)
    function configureUpgradeAfterCreation(upgrade, upgradeInfo) {
            // Set default canBuy function (will be overridden for upgrades with requirements)
            upgrade.canBuy = function() {
                // Check discounted price (uses getPrice when available, same as building upgrades)
                var actualPrice = this.getPrice ? this.getPrice() : this.price;
                return this.unlocked && !this.bought && Game.cookies >= actualPrice;
            };
            
            // Set descriptions
            upgrade.desc = upgradeInfo.desc;
            upgrade.ddesc = upgradeInfo.ddesc;
            
            // Set order property if provided (similar to achievements)
            if (upgradeInfo.order !== undefined) {
                upgrade.order = upgradeInfo.order;
            }
            
            // Handle requirements entirely through our custom logic
            if (upgradeInfo.require) {
                // Set the require property for display purposes
                upgrade.require = upgradeInfo.require;
                
                // CRITICAL: Force the upgrade to be locked initially
                upgrade.unlocked = 0;
                
                // Create the unlockCondition function that will control when it unlocks
                upgrade.unlockCondition = function() {
                    var result = false;
                    
                    // Check if it's an upgrade requirement first (more specific)
                    if (Game.Upgrades[upgradeInfo.require]) {
                        // It's an upgrade requirement - check if owned
                        result = Game.Has(upgradeInfo.require);
                    } else if (Game.Achievements[upgradeInfo.require]) {
                        // It's an achievement requirement - check if won
                        result = Game.Achievements[upgradeInfo.require].won;
                    } else {
                        // Check if it's a custom requirement type that needs our requirement function
                        if (typeof createRequirementFunction === 'function') {
                            // Check if game is ready before evaluating custom requirements
                            if (!Game.ready || !Game.Objects || Object.keys(Game.Objects).length === 0) {
                                return false;
                            }
                            
                            // Create a temporary requirement function to test this requirement
                            var tempRequirement = createRequirementFunction(upgradeInfo.require);
                            if (tempRequirement) {
                                result = tempRequirement();
                    } else {
                        // Fallback - assume it's an upgrade and check if owned
                        result = Game.Has(upgradeInfo.require);
                            }
                        } else {
                            // Fallback - assume it's an upgrade and check if owned
                            result = Game.Has(upgradeInfo.require);
                        }
                    }
                    
                    return result;
                };
                
                // Start cookie upgrades as locked - our checkAndUnlockOrderUpgrades function will manage unlock state
                upgrade.unlocked = 0;
                
                // CRITICAL: Also override the canBuy function to ensure it respects the requirement
                // This provides an additional layer of protection
                upgrade.canBuy = function() {
                    // ALWAYS check the requirement first - if not met, can't buy
                    if (this.unlockCondition && !this.unlockCondition()) {
                        return false; // Can't buy if requirement not met
                    }
                    
                    // Only if requirement is met, check other conditions
                    var actualPrice = this.getPrice ? this.getPrice() : this.price;
                    var canBuyResult = !this.bought && Game.cookies >= actualPrice;
                    
                    return canBuyResult;
                };
            }
            
        // Apply appropriate formatting based on upgrade type
        if (upgradeInfo.isBoxUpgrade) {
            // Set the isBoxUpgrade property on the actual upgrade object
            upgrade.isBoxUpgrade = true;
            
            // Use the constant Box icon coordinates
            var requireText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon(boxIcon) + ' Box of improved cookies</div>';
                    var modSourceText = '<div style="font-size:80%;text-align:center;margin-top:2px;">Part of <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div>';
                    var combinedText = requireText + '<div style="height:2px;"></div>' + modSourceText + '<div class="line"></div>';
                    
                    upgrade.ddesc = combinedText + upgradeInfo.ddesc;
                    upgrade.desc = combinedText + upgradeInfo.desc;
                } else {
                    addSourceText(upgrade);
        }
    }
    
    // Create cookie upgrade 
    function createCookieUpgrade(upgradeInfo) {
        // Validate that this is actually a cookie upgrade
        if (!upgradeInfo || upgradeInfo.pool !== 'cookie') {
            console.error('Non-cookie upgrade misrouted to createCookieUpgrade:', upgradeInfo ? upgradeInfo.name : 'undefined', upgradeInfo ? upgradeInfo.pool : 'undefined');
            return;
        }
        
        if (!validateUpgradeData(upgradeInfo, ['power'], 'cookie')) {
            return;
        }
        
        
        try {
            if (debugMode && Game) {
                var cookiePoolMatches = 0;
                if (Array.isArray(Game.cookieUpgrades)) {
                    for (var c = 0; c < Game.cookieUpgrades.length; c++) {
                        var existingCookie = Game.cookieUpgrades[c];
                        if (existingCookie && existingCookie.name === upgradeInfo.name) {
                            cookiePoolMatches++;
                        }
                    }
                }
                debugLog('createCookieUpgrade_start', upgradeInfo.name, 'hasUpgrade=', Game.Upgrades && Game.Upgrades[upgradeInfo.name] ? 1 : 0, 'cookiePoolMatches=', cookiePoolMatches);
            }

            var upgrade;
            
            // Create cookie upgrades using direct Game.Upgrade constructor
            // This avoids CCSE dependency issues
            upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.desc, upgradeInfo.price, upgradeInfo.icon);
            if (!upgrade) {
                throw new Error('Failed to create cookie upgrade: ' + upgradeInfo.name);
            }
            
            
            // Set additional properties that Game.NewUpgradeCookie would have set
            upgrade.power = upgradeInfo.power || 0;
            upgrade.require = upgradeInfo.require || '';
            upgrade.pool = upgradeInfo.pool || 'cookie';
            
            // Configure the upgrade using the shared helper function
            // Skip configuration for Box upgrades - let vanilla require field handle everything
            if (!upgradeInfo.isBoxUpgrade) {
                configureUpgradeAfterCreation(upgrade, upgradeInfo);
                
            } else {
                // For Box upgrades, set the isBoxUpgrade property and apply source text
                upgrade.isBoxUpgrade = true;
                
                // Create custom unlockCondition that checks if Box upgrade is actually OWNED (not just unlocked)
                upgrade.unlockCondition = function() {
                    var boxUpgrade = Game.Upgrades['Box of improved cookies'];
                    if (!boxUpgrade || boxUpgrade.bought <= 0) {
                        return false; // Box upgrade must be bought
                    }

                    // Get the actual purchase price (accounts for discounts and modifiers)
                    var actualPrice = this.getPrice ? this.getPrice() : this.price;

                    // Check the price requirement (cookies baked) - unlock at 1/2 the actual purchase price
                    var cookiesBaked = Game.cookiesEarned || 0;
                    return cookiesBaked >= (actualPrice / 2);
                };
                
                var requireText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon(boxIcon) + ' Box of improved cookies</div>';
                var modSourceText = '<div style="font-size:80%;text-align:center;margin-top:2px;">Part of <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div>';
                var combinedText = requireText + '<div style="height:2px;"></div>' + modSourceText + '<div class="line"></div>';
                upgrade.ddesc = combinedText + upgradeInfo.ddesc;
                upgrade.desc = combinedText + upgradeInfo.ddesc;
            }
            
            upgrade.jneIsCookie = true;

            if (Array.isArray(Game.cookieUpgrades)) {
                if (Game.cookieUpgrades.indexOf(upgrade) === -1) {
                    Game.cookieUpgrades.push(upgrade);
                }
            }

            if (Game.UpgradesByPool) {
                if (!Array.isArray(Game.UpgradesByPool['cookie'])) {
                    Game.UpgradesByPool['cookie'] = [];
                }
                if (Game.UpgradesByPool['cookie'].indexOf(upgrade) === -1) {
                    Game.UpgradesByPool['cookie'].push(upgrade);
                }
            }

            if (debugMode && Game) {
                var postMatches = 0;
                if (Array.isArray(Game.cookieUpgrades)) {
                    for (var m = 0; m < Game.cookieUpgrades.length; m++) {
                        var postEntry = Game.cookieUpgrades[m];
                        if (postEntry && postEntry.name === upgradeInfo.name) {
                            postMatches++;
                        }
                    }
                }
                debugLog('createCookieUpgrade_end', upgradeInfo.name, 'hasUpgrade=', Game.Upgrades && Game.Upgrades[upgradeInfo.name] ? 1 : 0, 'cookiePoolMatches=', postMatches);
            }

        } catch (e) {
            console.error('Error creating cookie upgrade:', upgradeInfo.name, e);
        }
    }
    
    // Create building upgrade (refactored)
    function createBuildingUpgrade(upgradeInfo) {
        if (!validateUpgradeData(upgradeInfo, [], 'building')) {
            return;
        }
        
        
        try {
            // Create upgrade using Game.Upgrade constructor
            var upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, upgradeInfo.icon);
            if (!upgrade) {
                return;
            }
            
            
            
            // Set additional properties
            Game.last.pool = upgradeInfo.pool;
            
            // Set order property if provided (similar to achievements)
            if (upgradeInfo.order !== undefined) {
                Game.last.order = upgradeInfo.order;
            }
            
            // Set unlockCondition if provided
            if (upgradeInfo.unlockCondition) {
                Game.last.unlockCondition = upgradeInfo.unlockCondition;
                // Force the upgrade to be locked initially
                Game.last.unlocked = 0;
                
                // Start building upgrades as locked - our checkAndUnlockOrderUpgrades function will manage unlock state
                Game.last.unlocked = 0;
            }
            
            Game.last.canBuy = function() {
                // Check discounted price (uses getPrice when available)
                var actualPrice = this.getPrice ? this.getPrice() : this.price;
                var isUnlocked = this.unlocked;
                return isUnlocked && !this.bought && Game.cookies >= actualPrice;
            };
            
            // Register the upgrade with custom properties
            registerUpgrade(upgradeInfo, 'building', {
                price: upgradeInfo.price,
                icon: upgradeInfo.icon,
                pool: upgradeInfo.pool
            });
            
            // Ensure the price is set correctly
            if (Game.last) {
                Game.last.price = upgradeInfo.price;
            }
            
            
            
        } catch (e) {
            console.error('Error creating building upgrade:', upgradeInfo.name, e);
        }
        
        // Emit event for any integrations
        if (typeof Game !== 'undefined' && Game.emit) {
            Game.emit('upgradeCreated', { upgrade: Game.Upgrades[upgradeInfo.name], type: 'building' });
        }
    }
    
    // Apply upgrade effects function
    function applyUpgradeEffects(cps) {
        // Apply generic upgrade effects
        for (var i = 0; i < upgradeData.generic.length; i++) {
            var upgradeInfo = upgradeData.generic[i];
            if (Game.Upgrades[upgradeInfo.name] && Game.Upgrades[upgradeInfo.name].bought) {
                if (upgradeInfo.effect) {
                    upgradeInfo.effect();
                }
            } else if (upgradeInfo.resetEffect) {
                upgradeInfo.resetEffect();
            }
        }
        return cps;
    }
      
    // Check upgrade unlock conditions
    function checkUpgradeUnlockConditions() {
        
        // THROTTLING: Only run this check occasionally to prevent flickering
        // Check if we've run this recently (within the last 1 second for responsive unlocking)
        if (checkUpgradeUnlockConditions.lastRun && 
            (Date.now() - checkUpgradeUnlockConditions.lastRun) < 1000) {
            return; // Skip if run too recently
        }
        checkUpgradeUnlockConditions.lastRun = Date.now();
        
        // Track if any upgrades changed unlock status to trigger UI refresh
        var uiNeedsRefresh = false;
        var unlockChanges = [];

        // Normal unlock condition checking (when debug mode is off)
        // Check generic upgrade unlock conditions (like the working upgrades.js)
        for (var i = 0; i < upgradeData.generic.length; i++) {
            var genericInfo = upgradeData.generic[i];
            var genericUpgrade = Game.Upgrades ? Game.Upgrades[genericInfo.name] : null;
            if (!genericUpgrade) {
                continue;
            }

            var genericShouldUnlock = false;
            try {
                if (typeof genericUpgrade.unlockCondition === 'function') {
                    genericShouldUnlock = !!genericUpgrade.unlockCondition();
                } else if (typeof genericInfo.unlockCondition === 'function') {
                    genericShouldUnlock = !!genericInfo.unlockCondition();
                }
            } catch (genericError) {
                genericShouldUnlock = false;
            }

            if (applyUnlockState(genericInfo.name, genericShouldUnlock, unlockChanges, 'generic')) {
                uiNeedsRefresh = true;
            }
        }

        // Check kitten upgrade unlock conditions (silent - only unlock if needed)
        for (var k = 0; k < upgradeData.kitten.length; k++) {
            var kittenInfo = upgradeData.kitten[k];
            var kittenUpgrade = Game.Upgrades ? Game.Upgrades[kittenInfo.name] : null;
            if (!kittenUpgrade) {
                continue;
            }

            var kittenShouldUnlock = false;
            try {
                if (typeof kittenUpgrade.unlockCondition === 'function') {
                    kittenShouldUnlock = !!kittenUpgrade.unlockCondition();
                } else if (typeof kittenInfo.unlockCondition === 'function') {
                    kittenShouldUnlock = !!kittenInfo.unlockCondition();
                }
            } catch (kittenError) {
                kittenShouldUnlock = false;
            }

            if (applyUnlockState(kittenInfo.name, kittenShouldUnlock, unlockChanges, 'kitten')) {
                uiNeedsRefresh = true;
            }
        }

        // Check building upgrade unlock conditions
        for (var b = 0; b < upgradeData.building.length; b++) {
            var buildingInfo = upgradeData.building[b];
            var buildingUpgrade = Game.Upgrades ? Game.Upgrades[buildingInfo.name] : null;
            if (!buildingUpgrade) {
                continue;
            }

            var buildingShouldUnlock = false;
            try {
                if (typeof buildingUpgrade.unlockCondition === 'function') {
                    buildingShouldUnlock = !!buildingUpgrade.unlockCondition();
                } else if (typeof buildingInfo.unlockCondition === 'function') {
                    buildingShouldUnlock = !!buildingInfo.unlockCondition();
                }
            } catch (buildingError) {
                buildingShouldUnlock = false;
            }

            if (applyUnlockState(buildingInfo.name, buildingShouldUnlock, unlockChanges, 'building')) {
                uiNeedsRefresh = true;
            }
        }

        // Check cookie upgrade unlock conditions
        if (upgradeData.cookie && Array.isArray(upgradeData.cookie)) {
            for (var c = 0; c < upgradeData.cookie.length; c++) {
                var cookieInfo = upgradeData.cookie[c];
                var cookieUpgrade = Game.Upgrades ? Game.Upgrades[cookieInfo.name] : null;
                if (!cookieUpgrade) {
                    continue;
                }

                if (cookieInfo.require && !cookieUpgrade.unlockCondition && !cookieInfo.isBoxUpgrade) {
                    (function(requirementName) {
                        cookieUpgrade.unlocked = 0;
                        cookieUpgrade.unlockCondition = function() {
                            if (Game.Upgrades[requirementName]) {
                                return Game.Has(requirementName);
                            } else if (Game.Achievements[requirementName]) {
                                return Game.Achievements[requirementName].won;
                            }
                            return Game.Has(requirementName);
                        };
                        cookieUpgrade.canBuy = function() {
                            if (this.unlockCondition && !this.unlockCondition()) {
                                return false;
                            }
                            var actualPrice = this.getPrice ? this.getPrice() : this.price;
                            return !this.bought && Game.cookies >= actualPrice;
                        };
                    })(cookieInfo.require);
                }

                var cookieShouldUnlock = false;
                try {
                    if (typeof cookieUpgrade.unlockCondition === 'function') {
                        cookieShouldUnlock = !!cookieUpgrade.unlockCondition();
                    }
                } catch (cookieError) {
                    cookieShouldUnlock = false;
                }

                if (applyUnlockState(cookieInfo.name, cookieShouldUnlock, unlockChanges, 'cookie')) {
                    uiNeedsRefresh = true;
                }
            }
        }

        // If any upgrades changed unlock status, trigger UI refresh
        if (uiNeedsRefresh) {
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            if (Game.UpdateMenu) { Game.UpdateMenu(); }
        }
    }
    
    // Check upgrades function (simple approach from upgrades.js)
    function checkUpgrades() {
        
        // Check unlock conditions for all upgrade types
        checkUpgradeUnlockConditions();
        
        // REMOVED: Auto-unlock based on price bypasses the unlock condition system
        // All unlock state changes should ONLY happen through checkUpgradeUnlockConditions()
        // which properly evaluates each upgrade's unlockCondition function
        // Price is checked in canBuy(), not in unlock state logic
    } 
    
    // Safety function to ensure upgrade properties are save-compatible
    function sanitizeUpgradeForSave(upgrade) {
        if (!upgrade) return null;
        
        // Ensure all text properties are strings to prevent beautification errors
        return {
            name: String(upgrade.name || ''),
            desc: String(upgrade.desc || ''),
            ddesc: String(upgrade.ddesc || ''),
            nameIn: String(upgrade.nameIn || upgrade.name || ''),
            descIn: String(upgrade.descIn || upgrade.desc || ''),
            ddescIn: String(upgrade.ddescIn || upgrade.ddesc || ''),
            pool: String(upgrade.pool || 'cookie'),
            id: String(upgrade.id || upgrade.name || ''),
            order: Number(upgrade.order || 0),
            power: Number(upgrade.power || 0),
            price: Number(upgrade.price || 0),
            bought: Number(upgrade.bought || 0),
            unlocked: Number(upgrade.unlocked || 0),
            vanilla: Number(upgrade.vanilla || 0)
        };
    }
    
    // Safety function to ensure upgrades are properly restored with all required properties
    function ensureUpgradeProperties(upgradeName) {
        if (!Game.Upgrades[upgradeName]) return;
        
        var upgrade = Game.Upgrades[upgradeName];
        
        // Ensure all required properties exist and are properly typed
        if (typeof upgrade.name !== 'string') upgrade.name = String(upgrade.name || '');
        if (typeof upgrade.desc !== 'string') upgrade.desc = String(upgrade.desc || '');
        if (typeof upgrade.ddesc !== 'string') upgrade.ddesc = String(upgrade.ddesc || '');
        if (typeof upgrade.nameIn !== 'string') upgrade.nameIn = String(upgrade.nameIn || upgrade.name || '');
        if (typeof upgrade.descIn !== 'string') upgrade.descIn = String(upgrade.descIn || upgrade.desc || '');
        if (typeof upgrade.ddescIn !== 'string') upgrade.ddescIn = String(upgrade.ddescIn || upgrade.ddesc || '');
        if (typeof upgrade.pool !== 'string') upgrade.pool = String(upgrade.pool || 'cookie');
        if (typeof upgrade.id !== 'string') upgrade.id = String(upgrade.id || upgrade.name || '');
        if (typeof upgrade.order !== 'number') upgrade.order = Number(upgrade.order || 0);
        if (typeof upgrade.power !== 'number') upgrade.power = Number(upgrade.power || 0);
        if (typeof upgrade.price !== 'number') upgrade.price = Number(upgrade.price || 0);
        if (typeof upgrade.bought !== 'number') upgrade.bought = Number(upgrade.bought || 0);
        if (typeof upgrade.unlocked !== 'number') upgrade.unlocked = Number(upgrade.unlocked || 0);
        if (typeof upgrade.vanilla !== 'number') upgrade.vanilla = Number(upgrade.vanilla || 0);
        
        // Ensure icon is properly formatted
        if (!Array.isArray(upgrade.icon)) upgrade.icon = [0, 0];
        
        // Handle cookie-specific properties
        if (upgrade.pool === 'cookie') {
            upgrade.shortTooltip = function() { return this.desc || ''; };
            
            // CCSE cookie upgrade tooltip system
            upgrade.getCookieTooltip = function() { 
                var base = this.ddesc || this.desc || '';
                if (this.power && this.power > 0) {
                    base += ' <span class="upgrade-effect">(+' + this.power + '%)</span>';
                }
                return base;
            };
            
            // Ensure cookie upgrades have all expected tooltip methods
            upgrade.getTooltip = upgrade.getCookieTooltip;
            upgrade.tooltipFunc = upgrade.getCookieTooltip;
        }
    }
    
    // Save function for upgrades (simple approach from upgrades.js)
    function saveUpgradesData() {
        // Create the data structure to save
        // We save the version for compatibility and upgrade states
        const modData = {
            version: modVersion,
            gameSignature: {
                bakeryName: Game.bakeryName || '',
                startDate: Game.startDate || 0,
                resets: Game.resets || 0
            },

            upgrades: {}
        };
        

        
                // Save the purchase state of each of our custom upgrades
        // Always include states even if upgrades are currently removed (use persisted snapshot)
        var modUpgradeNames = getModUpgradeNames();
        
        // Check upgrade counts during save
        var upgradesInGame = modUpgradeNames.filter(name => Game.Upgrades[name]);
        var upgradesBought = upgradesInGame.filter(name => Game.Upgrades[name] && Game.Upgrades[name].bought > 0);
        
        // Debug: Compare created upgrades vs hardcoded arrays
        var createdUpgrades = [];
        if (upgradeData && typeof upgradeData === 'object') {
            if (upgradeData.generic && Array.isArray(upgradeData.generic)) {
                upgradeData.generic.forEach(function(upgrade) {
                    if (upgrade && upgrade.name) createdUpgrades.push(upgrade.name);
                });
            }
            if (upgradeData.cookie && Array.isArray(upgradeData.cookie)) {
                upgradeData.cookie.forEach(function(upgrade) {
                    if (upgrade && upgrade.name) createdUpgrades.push(upgrade.name);
                });
            }
            if (upgradeData.building && Array.isArray(upgradeData.building)) {
                upgradeData.building.forEach(function(upgrade) {
                    if (upgrade && upgrade.name) createdUpgrades.push(upgrade.name);
                });
            }
            if (upgradeData.kitten && Array.isArray(upgradeData.kitten)) {
                upgradeData.kitten.forEach(function(upgrade) {
                    if (upgrade && upgrade.name) createdUpgrades.push(upgrade.name);
                });
            }
        }
        
        var hardcodedUpgrades = cookieUpgradeNames.concat(buildingUpgradeNames).concat(kittenUpgradeNames);
        
        // Find missing upgrades
        var missingFromHardcoded = createdUpgrades.filter(name => !hardcodedUpgrades.includes(name));
        var extraInHardcoded = hardcodedUpgrades.filter(name => !createdUpgrades.includes(name));
        
        modUpgradeNames.forEach(name => {
            // Always save ALL upgrades, even if they're currently disabled
            // This ensures that disabled upgrades remember their purchase state
            var boughtState = 0;
            if (Game.Upgrades[name]) {
                boughtState = Game.Upgrades[name].bought || 0;
            } else if (modSaveData && modSaveData.upgrades && modSaveData.upgrades[name]) {
                // If upgrade is not in Game.Upgrades (disabled), use saved state
                boughtState = modSaveData.upgrades[name].bought || 0;
            }
            modData.upgrades[name] = { bought: boughtState };
        });
        
        // Convert to JSON string for saving
        // The game will automatically handle encoding/decoding this string
        const saveString = JSON.stringify(modData);
        return saveString;
    }
    
    // Removed unused legacy loadUpgradesData helper
    
    // Save function for achievements
    function saveAchievementsData() {
        // Create the data structure to save
        const modData = {
            version: modVersion,
            gameSignature: {
                bakeryName: Game.bakeryName || '',
                startDate: Game.startDate || 0,
                resets: Game.resets || 0
            },

            achievements: {},
            currentRunMaxCombinedTotal: currentRunData.maxCombinedTotal || 0,
            // Save granular control settings
            shadowAchievementMode: shadowAchievementMode,
            enableCookieUpgrades: enableCookieUpgrades,
            enableBuildingUpgrades: enableBuildingUpgrades,
            enableKittenUpgrades: enableKittenUpgrades
        };
        

        
        // Save the won state of each of our custom achievements
        var savedCount = 0;
        var wonCount = 0;
        modAchievementNames.forEach(name => {
            if (Game.Achievements[name]) {
                var wonState = Game.Achievements[name].won || 0;
                modData.achievements[name] = {
                    won: wonState
                };
                savedCount++;
                if (wonState > 0) {
                    wonCount++;
                }
            }
        });
        
        // Convert to JSON string for saving
        const saveString = JSON.stringify(modData);
        return saveString;
    }
    // Debug function to check tracking variable states
    function checkTrackingVariables() {
        console.log('=== Just Natural Expansion Tracking Variables ===');
        console.log('modTracking:', JSON.stringify(modTracking, null, 2));
        console.log('lifetimeData:', JSON.stringify(lifetimeData, null, 2));
        console.log('sessionBaselines:', JSON.stringify(sessionBaselines, null, 2));
        console.log('sessionDeltas:', JSON.stringify(sessionDeltas, null, 2));
        console.log('===============================================');
    }
    
    // Make it available globally for debugging
    window.checkTrackingVariables = checkTrackingVariables;
    
    // Debug function to check what the stats menu would show
    function checkStatsMenuValues() {
        console.log('=== Stats Menu Values ===');
        console.log('Temple swaps (this ascension):', modTracking.templeSwapsTotal || 0);
        console.log('Soil changes (this ascension):', modTracking.soilChangesTotal || 0);
        console.log('Shiny wrinklers popped:', modTracking.shinyWrinklersPopped || 0);
        console.log('========================');
    }
    window.checkStatsMenuValues = checkStatsMenuValues;
    

    // Function to show the initial leaderboard/non-leaderboard choice prompt
    function showInitialChoicePrompt(attempt) {
        attempt = attempt || 0;
        if (Game.Prompt) {
            Game.Prompt(
                '<id InitialChoice><h3>Welcome to ' + modName + '!</h3><div class="block">' +
                tinyIcon(modIcon) + '<div class="line"></div>' +
                'Do you want to install in Competition or Full Experience Mode<br><br>' +
                '<div style="text-align: left;">' +
                '<b>Competition:</b> Achievements are Shadow Achievements and don\'t award milk, no new upgrades are added, Gameplay is not changed. Safe for competitive play, if not a bit boring.<br><br>' +
                '<b>Full Experience:</b> Achievements award milk. New upgrades, items, and gameplay features are added. Your CpS may change.' +
                '</div><br><br>' +
                'These settings can be changed at any time in the Options Menu.</div>',
                [
                    ['Competition', 'Game.ClosePrompt(); showInitialChoiceLeaderboard();', 'float:left'],
                    ['Full Experience', 'Game.ClosePrompt(); showInitialChoiceFullMod();', 'float:right']
                ]
            );
        } else {
            if (attempt < 40) {
                setTimeout(function() {
                    showInitialChoicePrompt(attempt + 1);
                }, 250);
            } else {
                // Fallback if Game.Prompt is still not available after retries
                console.warn('Game.Prompt not available, using default leaderboard mode');
                shadowAchievementMode = true;
                enableCookieUpgrades = false;
                enableBuildingUpgrades = false;
                enableKittenUpgrades = false;
                enableJSMiniGame = false;
                enableHeavenlyUpgrades = false;
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.enableJSMiniGame = false;
                syncTerminalMinigameButtonWithSetting();
                modSettings.hasMadeInitialChoice = true;
                continueModInitialization();
            }
        }
    }
    
    // Helper function for leaderboard mode choice
    window.showInitialChoiceLeaderboard = function() {
        // User chose Leaderboard Mode
        shadowAchievementMode = true;
        enableCookieUpgrades = false;
        enableBuildingUpgrades = false;
        enableKittenUpgrades = false;
        enableJSMiniGame = false;
        enableHeavenlyUpgrades = false;
        
        // Update modSettings to match
        modSettings.shadowAchievements = true;
        modSettings.enableCookieUpgrades = false;
        modSettings.enableBuildingUpgrades = false;
        modSettings.enableKittenUpgrades = false;
        modSettings.enableJSMiniGame = false;
        modSettings.enableHeavenlyUpgrades = false;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.enableJSMiniGame = false;
        setTerminalMinigameButtonVisibility(false);
        modSettings.hasMadeInitialChoice = true;
        // Reset this flag when choosing leaderboard mode
        modSettings.hasUsedModOutsideShadowMode = false;
        
        // Save the choice
        if (Game.Write) {
            debugLog('checkAndShowInitialChoice: performing Game.Write');
            Game.Write();
        }
        
        // Continue with mod initialization
        continueModInitialization();
    };
    
    // Helper function for full mod mode choice
    window.showInitialChoiceFullMod = function() {
        // User chose Full Mod Mode
        shadowAchievementMode = false;
        enableCookieUpgrades = true;
        enableBuildingUpgrades = true;
        enableKittenUpgrades = true;
        enableJSMiniGame = true;
        enableHeavenlyUpgrades = false;
        
        // Update modSettings to match
        modSettings.shadowAchievements = false;
        modSettings.enableCookieUpgrades = true;
        modSettings.enableBuildingUpgrades = true;
        modSettings.enableKittenUpgrades = true;
        modSettings.enableJSMiniGame = true;
        modSettings.enableHeavenlyUpgrades = false;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.enableJSMiniGame = true;
        syncTerminalMinigameButtonWithSetting();
        modSettings.hasMadeInitialChoice = true;
        // Reset this flag when making a new choice
        modSettings.hasUsedModOutsideShadowMode = false;
        
        // Save the choice
        if (Game.Write) {
            debugLog('applySettingChange: performing Game.Write');
            Game.Write();
        }
        
        // Continue with mod initialization
        continueModInitialization();
    };
    
    
    // Function to check if initial choice prompt should be shown (called after save data loads)
    function checkAndShowInitialChoice() {
        if (debugMode) {
            console.log('Just Natural Expansion: Checking initial choice. hasMadeInitialChoice =', modSettings.hasMadeInitialChoice);
        }
        
        // Check if this is the first time the mod is loaded (no saved choice)
        if (!modSettings.hasMadeInitialChoice) {
            // Show the initial choice prompt
            showInitialChoicePrompt();
        } else {
            // User has already made their choice, continue with normal initialization
            continueModInitialization();
        }
    }
    
    // Function to load settings from save data or use defaults
    function loadSettingsFromSaveData() {
        if (modSaveData && modSaveData.settings) {
            // Load settings from save data
            if (modSaveData.settings.enableCookieUpgrades !== undefined) {
                enableCookieUpgrades = modSaveData.settings.enableCookieUpgrades;
                modSettings.enableCookieUpgrades = modSaveData.settings.enableCookieUpgrades;
            }
            if (modSaveData.settings.enableBuildingUpgrades !== undefined) {
                enableBuildingUpgrades = modSaveData.settings.enableBuildingUpgrades;
                modSettings.enableBuildingUpgrades = modSaveData.settings.enableBuildingUpgrades;
            }
            if (modSaveData.settings.enableKittenUpgrades !== undefined) {
                enableKittenUpgrades = modSaveData.settings.enableKittenUpgrades;
                modSettings.enableKittenUpgrades = modSaveData.settings.enableKittenUpgrades;
            }
            if (modSaveData.settings.enableJSMiniGame !== undefined) {
                enableJSMiniGame = modSaveData.settings.enableJSMiniGame;
                modSettings.enableJSMiniGame = modSaveData.settings.enableJSMiniGame;
                // Set Game.JNE flag so minigameTerminal.js can check it
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.enableJSMiniGame = enableJSMiniGame;
            }
            if (modSaveData.settings.enableCookieAge !== undefined) {
                enableCookieAge = modSaveData.settings.enableCookieAge;
                modSettings.enableCookieAge = modSaveData.settings.enableCookieAge;
                // Mark that this was loaded from save data
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.enableCookieAgeFromSave = true;
            }
            if (modSaveData.settings.cookieAgeProgress !== undefined) {
                cookieAgeProgress = modSaveData.settings.cookieAgeProgress;
                modSettings.cookieAgeProgress = modSaveData.settings.cookieAgeProgress;
            }
            if (modSaveData.settings.shadowAchievements !== undefined) {
                shadowAchievementMode = modSaveData.settings.shadowAchievements;
                modSettings.shadowAchievements = modSaveData.settings.shadowAchievements;
            }
            
            // Load hasMadeInitialChoice setting
            if (modSaveData.settings.hasMadeInitialChoice !== undefined) {
                modSettings.hasMadeInitialChoice = modSaveData.settings.hasMadeInitialChoice;
            }
            if (modSaveData.settings.permanentSlotBackup) {
                modSettings.permanentSlotBackup = Object.assign({}, modSaveData.settings.permanentSlotBackup);
                modPermanentSlotBackup = Object.assign({}, modSettings.permanentSlotBackup);
            }
            if (modSaveData.settings.cpsDisplayUnit !== undefined) {
                modSettings.cpsDisplayUnit = modSaveData.settings.cpsDisplayUnit;
            }
                    } else {
                        // No save data - keep defaults (all disabled) for first-run experience
                        // The first-run prompt will set the correct values after user choice
                        modSettings.enableCookieUpgrades = enableCookieUpgrades;
                        modSettings.enableBuildingUpgrades = enableBuildingUpgrades;
                        modSettings.enableKittenUpgrades = enableKittenUpgrades;
                        modSettings.enableJSMiniGame = enableJSMiniGame;
                        modSettings.enableCookieAge = enableCookieAge;
                        modSettings.cookieAgeProgress = cookieAgeProgress;
                        modSettings.shadowAchievements = shadowAchievementMode;
                        
                        // Mark that this was NOT loaded from save data (first run)
                        if (!Game.JNE) {
                            Game.JNE = {};
                        }
                        Game.JNE.enableCookieAgeFromSave = false;
                    }
    }

    // Function to continue mod initialization after user choice (for save loading only)
    function continueModInitialization() {
        // This function is now only called during save loading, not during mod initialization
        // The mod initialization is handled by initializeModWithSaveData() in the init() function
        
        debugLog('continueModInitialization: starting');
        
        // For mod installation (no save data), initialize with empty state
        // For save loading (with save data), use the save data
        if (!modSaveData) {
            modSaveData = { upgrades: {} };
        } else if (!modSaveData.upgrades) {
            modSaveData.upgrades = {};
        }
        
        loadSettingsFromSaveData();
        cleanupOldPermanentSlotFormat();
        
        // Sync mod settings to ensure they're applied BEFORE creating upgrades
        if (modSettings.shadowAchievements !== undefined) {
            shadowAchievementMode = modSettings.shadowAchievements;
        }
        if (modSettings.enableCookieUpgrades !== undefined) {
            enableCookieUpgrades = modSettings.enableCookieUpgrades;
        }
        if (modSettings.enableBuildingUpgrades !== undefined) {
            enableBuildingUpgrades = modSettings.enableBuildingUpgrades;
        }
        if (modSettings.enableKittenUpgrades !== undefined) {
            enableKittenUpgrades = modSettings.enableKittenUpgrades;
        }
        if (modSettings.enableHeavenlyUpgrades !== undefined) {
            enableHeavenlyUpgrades = modSettings.enableHeavenlyUpgrades;
        }
        if (modSettings.enableJSMiniGame !== undefined) {
            enableJSMiniGame = modSettings.enableJSMiniGame;
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableJSMiniGame = enableJSMiniGame;
        }
        syncTerminalMinigameButtonWithSetting();

        // Ensure Cookie Age enabled/disabled matches saved setting, without manual side effects
        try {
            if (typeof window !== 'undefined' && typeof window.applyCookieAgeChange === 'function') {
                window.applyCookieAgeChange(!!modSettings.enableCookieAge, false);
            }
        } catch (_) {}
        
        // Ensure Heavenly Upgrades enabled/disabled matches saved setting, without manual side effects
        try {
            if (typeof window !== 'undefined' && typeof window.applyHeavenlyUpgradesChange === 'function') {
                window.applyHeavenlyUpgradesChange(!!modSettings.enableHeavenlyUpgrades);
            }
        } catch (_) {}

        // NOTE: Upgrade creation is now handled by initializeModWithSaveData()
        // This function only handles tracking data restoration
        
        
        // Initialize tracking variables and lifetime data from save data or defaults
        if (modSaveData) {
            debugLog('continueModInitialization: initializing from save data');
            
            try {
                // Restore tracking variables from save data
                if (modSaveData.modTracking) {
                    modTracking.shinyWrinklersPopped = modSaveData.modTracking.shinyWrinklersPopped || 0;
                    modTracking.templeSwapsTotal = modSaveData.modTracking.templeSwapsTotal || 0;
                    modTracking.soilChangesTotal = modSaveData.modTracking.soilChangesTotal || 0;
                    modTracking.lastSeasonalReindeerCheck = modSaveData.modTracking.lastSeasonalReindeerCheck || 0;
                    modTracking.godUsageTime = modSaveData.modTracking.godUsageTime || {};
                    modTracking.currentSlottedGods = modSaveData.modTracking.currentSlottedGods || {};
                    // Clamp seasonal reindeer baseline to current value to avoid missing first pop
                    modTracking.lastSeasonalReindeerCheck = Math.min(modTracking.lastSeasonalReindeerCheck || 0, Game.reindeerClicked || 0);
                    // Clear spell cast times on load to prevent save-scumming the Spell Slinger achievement
                    modTracking.spellCastTimes = [];
                    debugLog('continueModInitialization: restored tracking variables from save data');
                }
                
                // Restore lifetime data from save data
                if (modSaveData.lifetime) {
                    lifetimeData.reindeerClicked = modSaveData.lifetime.reindeerClicked || 0;
                    lifetimeData.stockMarketAssets = modSaveData.lifetime.stockMarketAssets || 0;
                    lifetimeData.shinyWrinklersPopped = modSaveData.lifetime.shinyWrinklersPopped || 0;
                    lifetimeData.wrathCookiesClicked = modSaveData.lifetime.wrathCookiesClicked || 0;
                    lifetimeData.totalCookieClicks = modSaveData.lifetime.totalCookieClicks || 0;
                    lifetimeData.wrinklersPopped = modSaveData.lifetime.wrinklersPopped || 0;
                    lifetimeData.elderCovenantToggles = modSaveData.lifetime.elderCovenantToggles || 0;
                    lifetimeData.pledges = modSaveData.lifetime.pledges || 0;
                    lifetimeData.gardenSacrifices = modSaveData.lifetime.gardenSacrifices || 0;
                    lifetimeData.cookieFishCaught = modSaveData.lifetime.cookieFishCaught || 0;
                    lifetimeData.bingoJackpotWins = modSaveData.lifetime.bingoJackpotWins || 0;
                    lifetimeData.totalSpellsCast = modSaveData.lifetime.totalSpellsCast || 0;
                    lifetimeData.lastGardenSacrificeTime = 0; // Reset on load to prevent save scumming
                    
                    // Restore god usage time
                    if (modSaveData.lifetime.godUsageTime) {
                        lifetimeData.godUsageTime = {};
                        for (var godName in modSaveData.lifetime.godUsageTime) {
                            lifetimeData.godUsageTime[godName] = modSaveData.lifetime.godUsageTime[godName] || 0;
                        }
                    }
                    debugLog('continueModInitialization: restored lifetime data from save data');
                }
            } catch (error) {
                console.warn('Error restoring save data, falling back to defaults:', error);
                debugLog('continueModInitialization: error restoring save data, using defaults');
                initializeSeasonalReindeerTracking();
                initializeShinyWrinklerTracking();
                initializeTempleSwapTracking();
                initializeSoilChangeTracking();
            }
        } else {
            debugLog('continueModInitialization: no save data, initializing with defaults');
            initializeSeasonalReindeerTracking();
            initializeShinyWrinklerTracking();
            initializeTempleSwapTracking();
            initializeSoilChangeTracking();
        }
        
        // Initialize session baselines with current game state
        initializeSessionBaselines();
        
        // Register all hooks with centralized system
        registerAllHooks();
        
        // Create achievements and other mod features
        debugLog('continueModInitialization: about to create achievements');
        debugLog('continueModInitialization: modSaveData exists:', !!modSaveData);
        if (modSaveData && modSaveData.achievements) {
            debugLog('continueModInitialization: modSaveData.achievements count:', Object.keys(modSaveData.achievements).length);
        }
        initAchievements();
        debugLog('continueModInitialization: achievements created');
        
        // Mark mod as initialized before applying save data
        modInitialized = true;
        debugLog('continueModInitialization: mod marked as initialized');

        flushPendingAchievementAwards();
        
        // Apply Cookie Age save now that systems are initialized (only if enabled)
        try {
            if (Game.JNE && Game.JNE.cookieAgeSavedData && window.CookieAge && window.CookieAge.applySaveData && !!modSettings.enableCookieAge) {
                window.CookieAge.applySaveData(Game.JNE.cookieAgeSavedData);
                Game.JNE.cookieAgeSavedData = null;
            }
        } catch (_) {}
            
        // Apply Heavenly Upgrades save data now that systems are initialized
        try {
            if (Game.JNE && Game.JNE.heavenlyUpgradesSavedData) {
                if (Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.applySaveData === 'function') {
                    // Only apply if we have actual save data (not just empty object)
                    var saveData = Game.JNE.heavenlyUpgradesSavedData;
                    if (saveData && typeof saveData === 'object' && (saveData.version || saveData.upgrades || saveData.pantheon || saveData.garden)) {
                        Game.JNE.HeavenlyUpgrades.applySaveData(saveData);
                                            } else {
                                            }
                } else {
                    // Module not loaded yet - preserve data for later
                                    }
            }
        } catch (e) {
            errorLog('Failed to apply Heavenly Upgrades save data:', e);
        }

        debugLog('continueModInitialization: save data applied during initialization');
        
        // Set up custom building multipliers (after game is fully loaded)
        setTimeout(addCustomBuildingMultipliers, 2000);
        
        // Initialize menu system
        injectMenus();
        
        // Emit mod initialization event for any integrations
        setTimeout(function() {
            
            // Emit mod initialization event for any integrations
            if (typeof Game !== 'undefined' && Game.emit) {
                Game.emit('modInitialized', { modName: modName, modVersion: modVersion });
            }
            

            
            // Save data already applied before achievement creation
            // Settings are now loaded in loadSettingsFromSaveData() before upgrade creation
            
            // Update menu buttons to reflect loaded settings
            updateMenuButtons();
            
            // Reset the save loading flag after initialization is complete
            // Ensure Game.JNE exists before resetting the flag
            if (!Game.JNE) {
                Game.JNE = {};
            }
            Game.JNE.isLoadingFromSave = false;
            
            // Reapply shadow achievement setting
            if (modSettings.shadowAchievements !== undefined) {
                applyShadowAchievementChange(modSettings.shadowAchievements);
            }
            
            // Check if the player has used the mod outside shadow mode and award "Beyond the Leaderboard"
            if (modSettings.hasUsedModOutsideShadowMode && Game.Achievements['Beyond the Leaderboard'] && !Game.Achievements['Beyond the Leaderboard'].won) {
                markAchievementWon('Beyond the Leaderboard');
            }
            
            // Hook into the game's ticker system using the proper mod hook
            if (Game.modHooks && Game.modHooks['ticker']) {
                Game.modHooks['ticker'].push(function() {
                    var newsItems = [];
                    
                    // Always show these news items
                    newsItems.push('News : People all over the globe are suddenly feeling much less accomplished. Scientists baffled.');
                    newsItems.push('News : Things seem different—no one can place a finger on it—but everything looks tilted 4 degrees to the left, or maybe it is to the right.');
                    newsItems.push('News : General tribalism and competition increase. People proudly stating how many challenges they have completed, earth being divided into camps.');
                    
                    // Conditional news items
                    if (Game.AchievementsOwned >= 500) {
                        newsItems.push('News : Reports from all over the globe of new kittens being spotted. Early reports suggest they are much lazier than normal.');
                    }
                    
                    if (modTracking.templeSwapsTotal >= 25) {
                        newsItems.push('News : Pantheon activity spikes as gods are swapped at alarming rates. Gods are confused. People are more confused, unsure who they are worshipping.');
                    }
                    
                    if (modTracking.soilChangesTotal >= 20) {
                        newsItems.push('News : Soil composition changes detected. Gardeners report "increased anxiety and delight."');
                    }
                    
                    if (lifetimeData.wrathCookiesClicked >= 500) {
                        newsItems.push('News : Wrath cookies are being clicked at unprecedented rates. Scientists concerned.');
                    }
                    
                    if (lifetimeData.stockMarketAssets >= 25000000) {
                        newsItems.push('News : Stock market profits are soaring. Economists confused. Some traders seem inclined to lose all their money for no apparent reason.');
                    }
                    
                    if (lifetimeData.gardenSacrifices >= 3) {
                        newsItems.push('News : Garden sacrifices are on the rise. Plants are nervous, sugar hornets seem pleased.');
                    }
                    
                    if (lifetimeData.wrinklersPopped >= 1000) {
                        newsItems.push('News : Wrinklers are being popped at record rates. Eldritch beings are annoyed. Rumors of a new wrinkler in the universe, though no one has actually seen it.');
                    }
                    
                    if (lifetimeData.elderCovenantToggles + lifetimeData.pledges >= 300) {
                        newsItems.push('News : Elder covenants are increasing. Grandmas are confused and becoming bipolar, things are getting weird in here.');
                    }
                    
                    if (lifetimeData.reindeerClicked >= 500) {
                        newsItems.push('News : Seasonal reindeer are being clicked more often. Santa is concerned, but says elf spirits remain high at the North Pole.');
                    }
                    
                    if (Game.Achievements['Calendar Abuser'] && Game.Achievements['Calendar Abuser'].won) {
                        newsItems.push('News : Holiday seasons seem to be flipping around randomly and in quick succession. Many people are not noticing but this reporter is frankly concerned and alarmed.');
                    }
                    
                    if (Game.Achievements['Archwizard'] && Game.Achievements['Archwizard'].won) {
                        newsItems.push('News : Spell abuse on the rise, people seem to be casting spells at a record rate. Judgement and safety concerns are rising.');
                    }
                    
                    if (modTracking.soilChangesTotal >= 25) {
                        newsItems.push('News : Soil changes are becoming more common. Gardeners are confused. Rumors of a new soil in the universe.');
                    }
                    
                    return newsItems;
                });
            }
        }, 3000); // Give extra time for everything to settle
        
    }
    
    // Register the mod using the proper Cookie Clicker Modding API (like upgrades.js)
    // Log when Cookie Clicker interacts with our mod's save system
    console.log('Just Natural Expansion: About to register mod with Cookie Clicker...');
    debugLog('Registering mod with Cookie Clicker save system...');
    
    Game.registerMod('JustNaturalExpansionMod', {
        name: modName,
        version: modVersion,
        
        // init() is called when the mod is first loaded
        init: function() {
            console.log('Just Natural Expansion: Mod init() called');
            
            // Initialize basic mod structures but don't process save data yet
            // Save data processing will happen in load() function
            
            // Initialize empty save data structure
            modSaveData = { upgrades: {} };
            setTerminalMinigameSave('');
            
            // Basic mod initialization (UI, hooks, etc) but no save data dependent features
            this.initializeMod();
            
            // Award the vanilla "Third-party" achievement on first install
            try {
                if (Game.Achievements && Game.Achievements['Third-party'] && !Game.Achievements['Third-party'].won) {
                    Game.Win('Third-party');
                }
            } catch (e) {
                console.warn('Just Natural Expansion: Unable to award Third-party achievement:', e);
            }
            
            // If load() never runs (no save data yet), perform first-run initialization
            setTimeout(function() {
                if (!modLoadInvoked) {
                    console.log('Just Natural Expansion: load() has not been invoked; running first-run setup.');
                    modLoadInvoked = true;
                    modSaveData = { upgrades: {} };
                    checkAndShowInitialChoice();
                }
            }, 0);
        },
        
        // Initialize mod
        initializeMod: function() {
            new Game.Notify(modName + ' v' + modVersion + ' Mod Loaded!', 'Use the options menu to configure settings for ' + modName + '.', modIcon);
            
            // Initialize terminal minigame if enabled
            if (enableJSMiniGame) {
                syncTerminalMinigameButtonWithSetting();
            }
            
            // Initialization is handled directly in the load() function
            
            // Initial check for all upgrades after achievements are loaded
            var self = this; // Capture 'this' reference
            setTimeout(function() {
                // Ensure all upgrades have proper properties to prevent save/load errors
                var modUpgradeNames = getModUpgradeNames ? getModUpgradeNames() : [];
                modUpgradeNames.forEach(function(name) {
                    ensureUpgradeProperties(name);
                });
                
                self.checkAndUnlockAllUpgrades();
            }, 1000);
            
            // EVENT-DRIVEN APPROACH: Instead of checking every frame, we check when relevant events occur
            // This prevents constant store refreshes and icon flashing
            
            // Check when achievements are earned (hooked in markAchievementWon function)
            // Check when upgrades are purchased (hooked below)
            // NOTE: Building-count-based unlocks will be checked manually or via cookie clicking
            // We avoid hooking building purchases to prevent conflicts with vanilla unlock logic
            
            // Hook into the vanilla game's upgrade purchase process to check for newly unlockable upgrades
            var originalBuyFunction = Game.Upgrades.__proto__.buy || Game.Upgrades.__proto__.Buy;
            if (originalBuyFunction) {
                Game.Upgrades.__proto__.buy = function() {
                    // Call the original buy function
                    var result = originalBuyFunction.apply(this, arguments);
                    
                    // Check unlock states after purchase (some upgrades may now be unlockable)
                    // Using setTimeout to avoid blocking the purchase
                    setTimeout(function() {
                        self.checkAndUnlockAllUpgrades();
                    }, 50);
                    
                    return result;
                };
            }
            
            // DEBUG: Hook into vanilla store rebuild function to track timing
            // Vanilla logging hooks temporarily disabled (too noisy)
        },
  
        // save() is called automatically by the game when saving
        save: function() {
            try {

                
                // Record when we generate save data to detect save-before-load cycles
                var currentTime = Date.now();
                
                // In reset mode, return empty data to overwrite save with clean state
                if (resetMode) {
                    const emptyData = {
                        version: modVersion,
                        upgrades: {},
                        achievements: {},
                        lifetime: {}
                    };
                    return JSON.stringify(emptyData);
                }

                // Combine achievements and lifetime data
                var achievementsData;
                try {
                    achievementsData = JSON.parse(saveAchievementsData());
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error saving achievements data:', e);
                    achievementsData = { achievements: {} };
                }
                
                // DEBUG: Log achievement data being saved
                var wonAchievements = 0;
                var totalAchievements = 0;
                for (var achievementName in achievementsData) {
                    totalAchievements++;
                    if (achievementsData[achievementName] && achievementsData[achievementName].won > 0) {
                        wonAchievements++;
                    }
                }
                
                // Always save upgrade data (ascension reset is handled separately in handleReincarnate)
                var upgradesData;
                try {
                    upgradesData = JSON.parse(saveUpgradesData());
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error saving upgrades data:', e);
                    upgradesData = { upgrades: {} };
                }
                
                // Create a copy of lifetime data without the sacrifice time
                // Debug log removed for clean console
                var lifetimeDataToSave = {
                    reindeerClicked: lifetimeData.reindeerClicked || 0,
                    stockMarketAssets: lifetimeData.stockMarketAssets || 0,
                    shinyWrinklersPopped: lifetimeData.shinyWrinklersPopped || 0,
                    wrathCookiesClicked: lifetimeData.wrathCookiesClicked || 0,
                    totalCookieClicks: lifetimeData.totalCookieClicks || 0,
                    wrinklersPopped: lifetimeData.wrinklersPopped || 0,
                    elderCovenantToggles: lifetimeData.elderCovenantToggles || 0,
                    pledges: lifetimeData.pledges || 0,
                    gardenSacrifices: lifetimeData.gardenSacrifices || 0,
                    totalSpellsCast: lifetimeData.totalSpellsCast || 0,
                    godUsageTime: lifetimeData.godUsageTime || {},
                    cookieFishCaught: lifetimeData.cookieFishCaught || 0,
                    bingoJackpotWins: lifetimeData.bingoJackpotWins || 0
                    // Note: lastGardenSacrificeTime is intentionally excluded
                };
                // Debug log removed for clean console
                
                // Safely get terminal minigame save string
                var terminalSaveString = '';
                try {
                    terminalSaveString = getTerminalMinigameSaveString();
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting terminal save string:', e);
                }
                
                // Safely get Cookie Age save data
                var cookieAgeData = null;
                try {
                    if (typeof window !== 'undefined' && window.CookieAge && window.CookieAge.getSaveData) {
                        cookieAgeData = window.CookieAge.getSaveData();
                    }
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting Cookie Age save data:', e);
                }
                
                // Safely get heavenly upgrades save string
                var heavenlyUpgradesSaveString = '';
                try {
                    heavenlyUpgradesSaveString = getHeavenlyUpgradesSaveString();
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting Heavenly Upgrades save string:', e);
                }
                
                // Merge the data
                const combinedData = {
                    version: modVersion,
                    gameSignature: {
                        bakeryName: Game.bakeryName || '',
                        startDate: Game.startDate || 0,
                        resets: Game.resets || 0
                    },

                    saveTimestamp: currentTime,  // Add timestamp to detect save-before-load cycles
                    runtimeSessionId: runtimeSessionId,
                    upgrades: upgradesData.upgrades || {},
                    achievements: achievementsData.achievements || {},
                    lifetime: lifetimeDataToSave,
                    settings: modSettings,
                    terminal: terminalSaveString,
                    modTracking: {
                        shinyWrinklersPopped: modTracking.shinyWrinklersPopped || 0,
                        templeSwapsTotal: modTracking.templeSwapsTotal || 0,
                        soilChangesTotal: modTracking.soilChangesTotal || 0,
                        // cookie click/reindeer baselines tracked via sessionBaselines
                        lastSeasonalReindeerCheck: modTracking.lastSeasonalReindeerCheck || 0,
                        godUsageTime: modTracking.godUsageTime || {},
                        currentSlottedGods: modTracking.currentSlottedGods || {}
                    },
                    // Persist Cookie Age progress regardless of toggle state
                    cookieAge: cookieAgeData,
                    // Persist Heavenly Upgrades data (fortune cookie regeneration timer, etc.)
                    heavenlyUpgrades: heavenlyUpgradesSaveString
                };
                
                // Debug logging removed for clean console during normal gameplay
                
                var saveString = JSON.stringify(combinedData);
                
                // Emit save event for any integrations
                try {
                    if (typeof Game !== 'undefined' && Game.emit) {
                        Game.emit('save', { modName: modName, modVersion: modVersion });
                    }
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error emitting save event:', e);
                }
                
                // Ensure we always return a valid string
                if (typeof saveString !== 'string') {
                    errorLog('mod.saveSystem.save: ERROR: saveString is not a string, type:', typeof saveString);
                    saveString = JSON.stringify({ version: modVersion, upgrades: {}, achievements: {}, lifetime: {} });
                }
                return saveString;
            } catch (e) {
                // Critical error handling - return minimal save data to prevent breaking vanilla saves
                errorLog('mod.saveSystem.save: CRITICAL ERROR in save function:', e);
                try {
                    // Return minimal valid save data so vanilla save can still complete
                    const minimalData = {
                        version: modVersion,
                        upgrades: {},
                        achievements: {},
                        lifetime: {}
                    };
                    return JSON.stringify(minimalData);
                } catch (e2) {
                    // If even minimal save fails, return empty string (mod data will be lost but game save will work)
                    errorLog('mod.saveSystem.save: CRITICAL ERROR creating minimal save:', e2);
                    return '';
                }
            }
        },
        
        // load() is called automatically by the game when loading
        load: function(str) {
            modLoadInvoked = true;
            
            // Emit load event for any integrations
            if (typeof Game !== 'undefined' && Game.emit) {
                Game.emit('load', { modName: modName, modVersion: modVersion });
            }
            
            // Skip loading saved data in reset mode to maintain clean state
            if (!resetMode) {
                try {
                    if (!str || str.trim() === '' || str === '{}') {
                        modSaveData = { upgrades: {} };
                        setTerminalMinigameSave('');
                        setHeavenlyUpgradesSave('');
                        checkAndShowInitialChoice();
                        return;
                    }
                    
                    const modData = JSON.parse(str);
                    // Stash Cookie Age save for deferred application after Cookie Age initializes
                    try {
                        if (!Game.JNE) Game.JNE = {};
                        Game.JNE.cookieAgeSavedData = (modData && modData.cookieAge) ? modData.cookieAge : null;
                    } catch (_) {}
                    
                    // Check if this save data matches the current game
                    // Initialize save data restoration flag
                    var shouldRestoreSaveData = true;
                    
                    if (modData.gameSignature) {
                        var currentSignature = {
                            bakeryName: Game.bakeryName || '',
                            startDate: Game.startDate || 0,
                            resets: Game.resets || 0
                        };
                        var saveSignature = modData.gameSignature;
                      
                        // Check for signature mismatch - be very lenient since bakery names can change
                        
                        // Start date can differ due to browser refreshes, game restarts, etc. - not a blocker
                        // if (currentSignature.startDate !== saveSignature.startDate) {
                        //     debugLog('mod.saveSystem.load: start date differs (browser restart detected)');
                        // }
                        
                        // if (currentSignature.resets > saveSignature.resets) {
                        //     // Allow resets to increase (ascensions) but not decrease
                        //     debugLog('mod.saveSystem.load: resets increased (ascension detected)');
                        // } else if (currentSignature.resets < saveSignature.resets) {
                        //     shouldRestoreSaveData = false;
                        //     debugLog('mod.saveSystem.load: resets decreased (impossible) - treating as different game');
                        // }
                        
                        // // Only check bakery name as a warning, not a blocker
                        // if (currentSignature.bakeryName !== saveSignature.bakeryName) {
                        //     debugLog('mod.saveSystem.load: bakery name differs (may have been changed)');
                        // }
                        
                        // if (shouldRestoreSaveData) {
                        //     debugLog('mod.saveSystem.load: signature compatible - will restore save data');
                        // } else {
                        //     debugLog('mod.saveSystem.load: SIGNATURE MISMATCH - will create mod content but ignore save state');
                        // }
                    }
                    
                    // COMPLETE RESET: Every load resets everything and rebuilds from save data
                    debugLog('mod.saveSystem.load: performing complete reset of all mod data');
                    
                    // Reset ALL mod achievements to unwon state first
                    if (modAchievementNames) {
                        modAchievementNames.forEach(achievementName => {
                            if (Game.Achievements[achievementName]) {
                                Game.Achievements[achievementName].won = 0;
                                Game.Achievements[achievementName]._restoredFromSave = false;
                                // Also update the by-id version if it exists
                                if (Game.AchievementsById[achievementName]) {
                                    Game.AchievementsById[achievementName].won = 0;
                                    Game.AchievementsById[achievementName]._restoredFromSave = false;
                                }
                            }
                        });
                    }
                    
                    // REMOVED: No longer reset upgrades here - restoration happens during creation
                    // This prevents the issue where upgrades are reset before they're created
                    
                    // Reset lifetime data to default state first
                    lifetimeData = {
                        reindeerClicked: 0,
                        stockMarketAssets: 0,
                        shinyWrinklersPopped: 0,
                        wrathCookiesClicked: 0,
                        totalCookieClicks: 0,
                        wrinklersPopped: 0,
                        elderCovenantToggles: 0,
                        pledges: 0,
                        gardenSacrifices: 0,
                        totalSpellsCast: 0,
                        godUsageTime: {}
                    };
                    
                    // Reset mod tracking data to default state first
                    modTracking = {
                        shinyWrinklersPopped: 0,
                        previousWrinklerStates: {},
                        templeSwapsTotal: 0,
                        soilChangesTotal: 0,
                        lastSeasonalReindeerCheck: 0,
                        godUsageTime: {},
                        currentSlottedGods: {},
                        pledges: 0,
                        reindeerClicked: 0,
                        cookieClicks: 0,
                        previousTempleSwaps: 0,
                        previousSoilType: null,
                        spellCastTimes: [],
                        bankSextupledByWrinkler: false,
                        fthofCookieOutcomes: []
                    };
                    

                    
                    // Simple check: do we have any meaningful data?
                    const hasData = modData && (
                        (modData.upgrades && Object.keys(modData.upgrades).length > 0) ||
                        (modData.achievements && Object.keys(modData.achievements).length > 0) ||
                        (modData.lifetime && Object.keys(modData.lifetime).length > 0) ||
                        (modData.modTracking && Object.keys(modData.modTracking).length > 0) ||
                        (modData.settings && Object.keys(modData.settings).length > 0)
                    );
                    
                    if (!hasData) {
                        debugLog('mod.saveSystem.load: no meaningful data');
                        setTerminalMinigameSave('');
                        setHeavenlyUpgradesSave('');
                        return;
                    }
                    
                    // Store save data for initialization (or empty data if signature mismatch)
                    if (shouldRestoreSaveData) {
                        modSaveData = modData;
                        if (typeof modData.terminal !== 'undefined') {
                            setTerminalMinigameSave(modData.terminal);
                        } else {
                            setTerminalMinigameSave('');
                        }
                        if (typeof modData.heavenlyUpgrades !== 'undefined') {
                            setHeavenlyUpgradesSave(modData.heavenlyUpgrades);
                        } else {
                            setHeavenlyUpgradesSave('');
                        }
                    } else {
                        modSaveData = { upgrades: {} };
                        setTerminalMinigameSave('');
                        setHeavenlyUpgradesSave('');
                    }
                    debugLog('mod.saveSystem.load: stored save data for initialization');
                    
                    
                    // Load settings FIRST before recreating upgrades
                    if (modData.settings) {
                        // Set flag to indicate we're loading from save data
                        // Ensure Game.JNE exists before setting the flag
                        if (!Game.JNE) {
                            Game.JNE = {};
                        }
                        Game.JNE.isLoadingFromSave = true;
                        
                        Object.keys(modData.settings).forEach(key => {
                            if (key in modSettings) {
                                modSettings[key] = modData.settings[key];
                            }
                        });
                        
                        // Apply settings to the global variables immediately
                        if (modSettings.enableCookieUpgrades !== undefined) {
                            enableCookieUpgrades = modSettings.enableCookieUpgrades;
                        }
                        if (modSettings.enableBuildingUpgrades !== undefined) {
                            enableBuildingUpgrades = modSettings.enableBuildingUpgrades;
                        }
                        if (modSettings.enableKittenUpgrades !== undefined) {
                            enableKittenUpgrades = modSettings.enableKittenUpgrades;
                        }
                        if (modSettings.enableHeavenlyUpgrades !== undefined) {
                            enableHeavenlyUpgrades = modSettings.enableHeavenlyUpgrades;
                        }
                        if (modSettings.shadowAchievements !== undefined) {
                            shadowAchievementMode = modSettings.shadowAchievements;
                        }
                        // Always mark that we're loading from save if we're in this code path
                        // This prevents welcome audio from playing even if the setting isn't in the save yet
                        Game.JNE.enableCookieAgeFromSave = true;
                        
                        if (modSettings.enableCookieAge !== undefined) {
                            enableCookieAge = modSettings.enableCookieAge;
                            // Update Game.JNE as well during save loading
                            // Game.JNE should already exist from the flag setting above
                            Game.JNE.enableCookieAge = enableCookieAge;
                        }
                    }
                    
                    // Suppress CPS recalculation during upgrade recreation to prevent spikes
                    var previousRecalculateGains = Game.recalculateGains;
                    Game.recalculateGains = 0;
                    
                    // SIMPLE RULE: Delete everything and recreate from save data only
                    recreateUpgradesFromSaveOnly();
                    
                    // Restore recalculate flag and force one clean calculation after everything is stable
                    Game.recalculateGains = previousRecalculateGains;
                    if (Game.CalculateGains) { Game.CalculateGains(); }
                    
                    // Trigger initialization with a small delay to ensure save data is stable
                    setTimeout(() => {
                        continueModInitialization();
                    }, 100);
                    
                    debugLog('mod.saveSystem.load: modSaveData.achievements exists:', !!modSaveData.achievements);
                    if (modSaveData.achievements) {
                        debugLog('mod.saveSystem.load: modSaveData.achievements count:', Object.keys(modSaveData.achievements).length);
                        
                        // RESTORE: Save data is the sole source of truth (reset already done above)
                        if (modAchievementNames) {
                            var restoredCount = 0;
                            modAchievementNames.forEach(achievementName => {
                                if (modSaveData.achievements[achievementName] && modSaveData.achievements[achievementName].won > 0) {
                                    markAchievementWonFromSave(achievementName);
                                    restoredCount++;
                                }
                            });
                            debugLog('mod.saveSystem.load: restored', restoredCount, 'achievements from save data');
                        }
                        
                        // Check for aliased achievements (renamed achievements)
                        var aliasedCount = 0;
                        Object.keys(modSaveData.achievements).forEach(savedName => {
                            if (modSaveData.achievements[savedName].won > 0) {
                                // Check if this saved name has an alias
                                if (achievementAliases[savedName]) {
                                    var newName = achievementAliases[savedName];
                                    if (Game.Achievements[newName]) {
                                        markAchievementWonFromSave(newName);
                                        aliasedCount++;
                                    }
                                }
                            }
                        });
                        debugLog('mod.saveSystem.load: restored', aliasedCount, 'aliased achievements');
                    }
                    
                    // Note: Upgrade restoration is handled by addUpgradesToGame() which runs later
                    // This ensures upgrades are created first, then save data is applied
                    
                    // RESTORE: Lifetime data from save data (sole source of truth)
                    if (modData.lifetime) {
                        lifetimeData = Object.assign(lifetimeData, modData.lifetime);
                        debugLog('mod.saveSystem.load: restored lifetime data from save');
                    }
                    
                    // RESTORE: Mod tracking data from save data (sole source of truth)
                    if (modData.modTracking) {
                        modTracking = Object.assign(modTracking, modData.modTracking);
                        debugLog('mod.saveSystem.load: restored modTracking data from save');
                    }
                    
                    // Settings already loaded above before recreateUpgradesFromSaveOnly()
                    
                } catch (error) {
                    console.error('[JNE Error] Error loading mod save data:', error);
                    debugLog('mod.saveSystem.load: error loading save data:', error);
                    // Fall back to defaults on error
                    modSaveData = { upgrades: {} };
                    setTerminalMinigameSave('');
                    continueModInitialization();
                }
            }
            
            debugLog('mod.saveSystem.load: end');
        },

        checkAndUnlockAllUpgrades: function() {
            // THROTTLING: Prevent this from running too frequently to avoid store flashing
            var now = Date.now();
            if (this._lastUnlockCheck && (now - this._lastUnlockCheck) < 500) {
                return; // Skip if called within last 500ms
            }
            this._lastUnlockCheck = now;
            
            // CRITICAL: Only check MOD upgrades, never touch vanilla upgrades
            // Get the list of all mod upgrade names to ensure we only affect our own upgrades
            var modUpgradeNamesList = getModUpgradeNames();
            var modUpgradeNamesSet = {};
            for (var idx = 0; idx < modUpgradeNamesList.length; idx++) {
                modUpgradeNamesSet[modUpgradeNamesList[idx]] = true;
            }
            
            // Check Order upgrades first (they have special logic)
            var orderUpgrades = [
                'Order of the Golden Crumb',
                'Order of the Impossible Batch', 
                'Order of the Shining Spoon',
                'Order of the Cookie Eclipse',
                'Order of the Enchanted Whisk',
                'Order of the Eternal Cookie'
            ];
            
            var unlockChanged = false;
            var unlockChanges = [];
            
            // Check Order upgrades
            for (var i = 0; i < orderUpgrades.length; i++) {
                var upgradeName = orderUpgrades[i];
                var upgrade = Game.Upgrades ? Game.Upgrades[upgradeName] : null;
                
                // SAFETY: Ensure this is actually a mod upgrade
                if (!upgrade || !modUpgradeNamesSet[upgradeName]) {
                    continue;
                }
                
                if (typeof upgrade.unlockCondition !== 'function') {
                    continue;
                }

                var orderShouldUnlock = false;
                try {
                    orderShouldUnlock = !!upgrade.unlockCondition();
                } catch (orderError) {
                    orderShouldUnlock = false;
                }

                if (applyUnlockState(upgradeName, orderShouldUnlock, unlockChanges, 'order')) {
                    unlockChanged = true;
                }
            }
            
            // Check all other upgrades with unlock conditions
            for (var i = 0; i < modUpgradeNamesList.length; i++) {
                var upgradeName = modUpgradeNamesList[i];
                var upgrade = Game.Upgrades ? Game.Upgrades[upgradeName] : null;

                // Skip Order upgrades (already handled above)
                if (!upgrade || upgradeName.startsWith('Order of the ')) {
                    continue;
                }
                
                // SAFETY: Double-check this is a mod upgrade (should always be true here)
                if (!modUpgradeNamesSet[upgradeName]) {
                    continue;
                }

                if (typeof upgrade.unlockCondition !== 'function') {
                    continue;
                }

                var shouldUnlockUpgrade = false;
                
                // CRITICAL: If upgrade was bought in a previous ascension, keep it unlocke This allows it to appear in permanent upgrade selection even if requirements aren't met, this was a super annoying bug.
                if (upgrade.bought > 0) {
                    shouldUnlockUpgrade = true;
                } else {
                    try {
                        shouldUnlockUpgrade = !!upgrade.unlockCondition();
                    } catch (upgradeError) {
                        shouldUnlockUpgrade = false;
                    }
                }

                if (applyUnlockState(upgradeName, shouldUnlockUpgrade, unlockChanges, 'upgrade')) {
                    unlockChanged = true;
                }
            }
            
            // Refresh store ONLY when upgrades actually changed unlock state
            // This prevents unnecessary store refreshes and icon flashing
            if (unlockChanged) {
                Game.storeToRefresh = 1;
                if (Game.RebuildUpgrades) {
                    Game.RebuildUpgrades();
                }
            }
        }
    });
    
    // Initialize achievements and other mod features
    function initAchievements() {
        // Prevent recreation of achievements once they've been created and properly restored
        if (achievementsCreated) {
            debugLog('initAchievements: achievements already created, skipping');
            return;
        }
        
        debugLog('initAchievements: creating achievements for the first time');
        debugLog('initAchievements: modSaveData exists:', !!modSaveData);
        if (modSaveData && modSaveData.achievements) {
            debugLog('initAchievements: modSaveData.achievements count:', Object.keys(modSaveData.achievements).length);
        }
        
        // Create building achievements
        for (var buildingName in Game.ObjectsById) {
            var building = Game.ObjectsById[buildingName];
            if (!building || !building.single) continue;
            
            // Try to find the building data by different possible names
            var buildingData = achievementData.buildings[building.single] || 
                             achievementData.buildings[building.single.toLowerCase()] ||
                             achievementData.buildings[buildingName] ||
                             achievementData.buildings[buildingName.toLowerCase()];
            
            if (!buildingData) continue;
            
            var vanilla = findLastVanillaAchievement(buildingData.vanillaTarget);
            
            // Only create achievements if we found the vanilla achievement
            if (vanilla.order > 0) {
                createBuildingAchievements(buildingName, buildingData.names, buildingData.thresholds, vanilla.order, vanilla.icon, buildingData.customIcons);
            }
        }
        
        // Create other achievements
        for (var type in achievementData.other) {
            var data = achievementData.other[type];
            
            var vanilla = findLastVanillaAchievement(data.vanillaTarget);
            
            if (vanilla.order > 0) {
                for (var i = 0; i < data.names.length; i++) {
                    // Special handling for kittensOwned achievements - use different requirement types
                    var requirementType = type;
                    if (type === 'kittensOwned' && i === 1) {
                        requirementType = 'allKittensOwned';
                    }
                    
                    // For completionism achievements, use the threshold as the requirement type
                    var actualRequirementType = (type === 'completionism') ? data.thresholds[i] : requirementType;
                    var requirement = createRequirementFunction(actualRequirementType, data.thresholds[i]);
                    
                    // Special handling for seed log achievements - they need to appear closer together
                    var orderOffset = (type === 'seedlog') ? (i + 1) * 0.00001 : (i + 1) * 0.01;
                    
                    // Special handling for completionism achievement - set specific order
                    var achievementOrder;
                    if (type === 'completionism') {
                        achievementOrder = 400000.3;
                    } else {
                        achievementOrder = vanilla.order + orderOffset;
                    }
                    
                    // Special handling for buildingsSold achievements - ensure they appear after totalBuildings
                    if (type === 'buildingsSold') {
                        orderOffset = (i + 1) * 0.01 + 0.1; // Add extra offset to ensure they come after totalBuildings
                    }
                    
                    // Special handling for Faithless Loyalty achievement - set hard order number
                    var finalOrder = achievementOrder;
                    if (data.names[i] === 'Faithless Loyalty') {
                        finalOrder = 61490;
                    }
                    
                    // Special handling for God of All Gods achievement - set hard order number
                    if (data.names[i] === 'God of All Gods') {
                        finalOrder = 61490.01;
                    }
                    
                    // Special handling for garden achievements - set hard order numbers
                    if (data.names[i] === 'I feel the need for seed') {
                        finalOrder = 61515.430;
                    } else if (data.names[i] === 'Botanical Perfection') {
                        finalOrder = 61515.431;
                    } else if (data.names[i] === 'Duketater Salad') {
                        finalOrder = 61515.44;
                    } else if (data.names[i] === 'Fifty Shades of Clay') {
                        finalOrder = 61515.433;
                    }
                    
                    // Special handling for Golden wrinkler achievement - set hard order number
                    if (data.names[i] === 'Golden wrinkler') {
                        finalOrder = 21000.168;
                    }
                    
                    // Special handling for Wrinkler Windfall achievement - set hard order number
                    if (data.names[i] === 'Wrinkler Windfall') {
                        finalOrder = 21000.169;
        
                    }
                    
                    // Special handling for Sweet Sorcery achievement - set hard order number
                    if (data.names[i] === 'Sweet Sorcery') {
                        finalOrder = 61496.004;
                    }
                    
                    // Special handling for The Final Challenger achievement - set hard order number
                    if (data.names[i] === 'The Final Challenger') {
                        finalOrder = 30501;
                    }
                    
                    // Special handling for Broiler room achievement - set hard order number
                    if (data.names[i] === 'Broiler room') {
                        finalOrder = 61616.358;
                    }
                    
                    // Special handling for Wrinkler Rush achievement - set hard order number
                    if (data.names[i] === 'Wrinkler Rush') {
                        finalOrder = 21000.17;
                    }
                    
                    // Special handling for Buff Finger achievement - set hard order number
                    if (data.names[i] === 'Buff Finger') {
                        finalOrder = 7003;
                    }
                    
                    // Special handling for Click of the Titans achievement - set hard order number
                    if (data.names[i] === 'Click of the Titans') {
                        finalOrder = 7004;
                    }
                    
                    // Special handling for garden harvest achievements - set hard order numbers
                    if (data.names[i] === 'Greener, aching thumb') {
                        finalOrder = 61515.3791;
                    } else if (data.names[i] === 'Greenest, aching thumb') {
                        finalOrder = 61515.3792;
                    } else if (data.names[i] === 'Photosynthetic prodigy') {
                        finalOrder = 61515.3793;
                    } else if (data.names[i] === 'Garden master') {
                        finalOrder = 61515.3794;
                    } else if (data.names[i] === 'Plant whisperer') {
                        finalOrder = 61515.3795;
                    }
                    
                    // Specific ordering for buildingsSold achievements
                    if (type === 'buildingsSold') {
                        if (data.names[i] === 'Asset Liquidator') {
                            finalOrder = 5001.1;
                        } else if (data.names[i] === 'Flip City') {
                            finalOrder = 5001.11;
                        } else if (data.names[i] === 'Ghost Town Tycoon') {
                            finalOrder = 5001.12;
                        }
                    }

                    var customIcon = data.customIcons && data.customIcons[i] ? data.customIcons[i] : null;
                    /*
                    // Debug logging for Wrinkler Windfall
                    if (data.names[i] === 'Wrinkler Windfall') {}
                    
                    // Debug logging for Frenzy Marathon
                    if (data.names[i] === 'Frenzy Marathon') {}
                    */
                    
                    createAchievement(
                        data.names[i],
                        data.descs[i],
                        vanilla.icon,
                        finalOrder,
                        requirement,
                        customIcon
                    );
                }
            }
        }
        
        // Create seasonal reindeer achievements
        createSeasonalReindeerAchievements();

        // Create level achievements for each building
        var levelAchievements = [
            { building: 'Cursor', level10: 'Freaky jazz hands', level15: 'Rowdy shadow puppets', level20: 'Frantic finger guns' },
            { building: 'Grandma', level10: 'Methuselah', level15: 'Loaf & behold', level20: 'Forbidden fruitcake' },
            { building: 'Farm', level10: 'Huge tracts of land', level15: 'Huge-er tracts of land', level20: 'Hoedown showdown' },
            { building: 'Mine', level10: 'D-d-d-d-deeper', level15: 'Cave-in king', level20: 'Digging destiny' },
            { building: 'Factory', level10: 'Patently genius', level15: 'Boilerplate overlord', level20: 'Cookie standard time' },
            { building: 'Bank', level10: 'A capital idea', level15: 'Credit conjurer', level20: 'Master of the Mint' },
            { building: 'Temple', level10: 'It belongs in a bakery', level15: 'Acolyte ascendant', level20: 'Grand hierophant' },
            { building: 'Wizard tower', level10: 'Motormouth', level15: 'Archmage of Meringue', level20: 'Chronomancer emeritus' },
            { building: 'Shipment', level10: 'Been there done that', level15: 'Quartermaster of Orbits', level20: 'Docking director' },
            { building: 'Alchemy lab', level10: 'Phlogisticated substances', level15: 'Retort wrangler', level20: 'Circle of Quintessence' },
            { building: 'Portal', level10: 'Bizarro world', level15: 'Non-Euclidean doorman', level20: 'Warden of Elsewhere' },
            { building: 'Time machine', level10: 'The long now', level15: 'Minute handler', level20: 'Chronarch supreme' },
            { building: 'Antimatter condenser', level10: 'Chubby hadrons', level15: 'Quark wrangler', level20: 'Symmetry breaker' },
            { building: 'Prism', level10: 'Palettable', level15: 'Master of refraction', level20: 'Keeper of the seven hues' },
            { building: 'Chancemaker', level10: 'Let\'s leaf it at that', level15: 'Seedkeeper of Fortune', level20: 'Master of Maybe' },
            { building: 'Fractal engine', level10: 'Sierpinski rhomboids', level15: 'Archfractal', level20: 'Lord of Infinite Detail' },
            { building: 'Javascript console', level10: 'Alexandria', level15: 'Stack tracer', level20: 'Event-loop overlord' },
            { building: 'Idleverse', level10: 'Strange topologies', level15: 'Canon custodian', level20: 'Keeper of the Uncountable' },
            { building: 'Cortex baker', level10: 'Gifted', level15: 'Chief Thinker Officer', level20: 'Mind over batter' },
            { building: 'You', level10: 'Self-improvement', level15: 'Identity custodian', level20: 'First Person Plural' }
        ];
        
        for (var i = 0; i < levelAchievements.length; i++) {
            var ach = levelAchievements[i];
            var vanilla = findLastVanillaAchievement(ach.level10);
            
            if (vanilla.order > 0) {
                // Map building names to custom sprite sheet indices
                var buildingToSpriteIndex = {
                    'Cursor': 0, 'Grandma': 1, 'Farm': 2, 'Mine': 3, 'Factory': 4,
                    'Shipment': 5, 'Alchemy lab': 6, 'Portal': 7, 'Time machine': 8,
                    'Antimatter condenser': 9, 'Prism': 10, 'Bank': 11, 'Temple': 12,
                    'Wizard tower': 13, 'Chancemaker': 14, 'Fractal engine': 15,
                    'Javascript console': 16, 'Idleverse': 17, 'Cortex baker': 18, 'You': 19
                };
                var spriteIndex = buildingToSpriteIndex[ach.building] || 0;
                
                // Level 15 achievement
                createAchievement(
                    ach.level15,
                    "Reach Level <b>15</b> " + ach.building.toLowerCase() + "s.",
                    [spriteIndex, 19, getSpriteSheet('custom')],
                    vanilla.order + 0.01,
                    (function(buildingName) {
                        return function() { 
                            var building = Game.Objects[buildingName];
                            return building && building.level >= 15; 
                        };
                    })(ach.building)
                );
                
                // Level 20 achievement
                createAchievement(
                    ach.level20,
                    "Reach Level <b>20</b> " + ach.building.toLowerCase() + "s.",
                    [spriteIndex, 20, getSpriteSheet('custom')],
                    vanilla.order + 0.02,
                    (function(buildingName) {
                        return function() { 
                            var building = Game.Objects[buildingName];
                            return building && building.level >= 20; 
                        };
                    })(ach.building)
                );
            }
        }

        // Create extended production achievements for each building (tier 4, 5, 6)
        var productionAchievements = [
            { building: 'Cursor', name: 'Click (starring Adam Sandler)', tier4Name: 'Click II: the sequel', tier5Name: 'Click III: we couldn\'t get Adam Sandler so it stars Jerry Seinfeld for some reason', tier6Name: 'Click IV: 3% fresh on rotten tomatoes', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from cursors.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from cursors.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from cursors.', mult: 7, vanillaTarget: 'Click (starring Adam Sandler)' },
            { building: 'Grandma', name: 'Frantiquities', tier4Name: 'Scone with the wind', tier5Name: 'The flour of youth', tier6Name: 'Bake-ageddon', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from grandmas.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from grandmas.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from grandmas.', mult: 6, vanillaTarget: 'Frantiquities' },
            { building: 'Farm', name: 'Overgrowth', tier4Name: 'Rake in the greens', tier5Name: 'The great threshering', tier6Name: 'Bushels of burden', tier4Desc: 'Make <b>1 quattuordecillion cookies</b> just from farms.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from farms.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from farms.', mult: 0, vanillaTarget: 'Overgrowth' },
            { building: 'Mine', name: 'Sedimentalism', tier4Name: 'Ore d\'oeuvres', tier5Name: 'Seismic yield', tier6Name: 'Billionaire\'s bedrock', tier4Desc: 'Make <b>10 quattuordecillion cookies</b> just from mines.', tier5Desc: 'Make <b>10 quindecillion cookies</b> just from mines.', tier6Desc: 'Make <b>10 sexdecillion cookies</b> just from mines.', mult: 0, vanillaTarget: 'Sedimentalism' },
            { building: 'Factory', name: 'Labor of love', tier4Name: 'Sweatshop symphony', tier5Name: 'Cookieconomics 101', tier6Name: 'Mass production messiah', tier4Desc: 'Make <b>100 quattuordecillion cookies</b> just from factories.', tier5Desc: 'Make <b>100 quindecillion cookies</b> just from factories.', tier6Desc: 'Make <b>100 sexdecillion cookies</b> just from factories.', mult: 0, vanillaTarget: 'Labor of love' },
            { building: 'Bank', name: 'Reverse funnel system', tier4Name: 'Compound interest, compounded', tier5Name: 'Arbitrage avalanche', tier6Name: 'Ponzi à la mode', tier4Desc: 'Make <b>1 quindecillion cookies</b> just from banks.', tier5Desc: 'Make <b>1 sexdecillion cookies</b> just from banks.', tier6Desc: 'Make <b>1 septendecillion cookies</b> just from banks.', mult: 0, vanillaTarget: 'Reverse funnel system' },
            { building: 'Temple', name: 'Thus spoke you', tier4Name: 'Temple treasury overflow', tier5Name: 'Pantheon payout', tier6Name: 'Sacred surplus', tier4Desc: 'Make <b>10 quindecillion cookies</b> just from temples.', tier5Desc: 'Make <b>10 sexdecillion cookies</b> just from temples.', tier6Desc: 'Make <b>10 septendecillion cookies</b> just from temples.', mult: 0, vanillaTarget: 'Thus spoke you' },
            { building: 'Wizard tower', name: 'Manafest destiny', tier4Name: 'Rabbits per minute', tier5Name: 'Hocus bonus', tier6Name: 'Magic dividends', tier4Desc: 'Make <b>100 quindecillion cookies</b> just from wizard towers.', tier5Desc: 'Make <b>100 sexdecillion cookies</b> just from wizard towers.', tier6Desc: 'Make <b>100 septendecillion cookies</b> just from wizard towers.', mult: 0, vanillaTarget: 'Manafest destiny' },
            { building: 'Shipment', name: 'Neither snow nor rain nor heat nor gloom of night', tier4Name: 'Cargo cult classic', tier5Name: 'Universal basic shipping', tier6Name: 'Comet-to-consumer', tier4Desc: 'Make <b>1 sexdecillion cookies</b> just from shipments.', tier5Desc: 'Make <b>1 septendecillion cookies</b> just from shipments.', tier6Desc: 'Make <b>1 octodecillion cookies</b> just from shipments.', mult: 0, vanillaTarget: 'Neither snow nor rain nor heat nor gloom of night' },
            { building: 'Alchemy lab', name: 'I\'ve got the Midas touch', tier4Name: 'Lead into bread', tier5Name: 'Philosopher\'s yield', tier6Name: 'Auronomical returns', tier4Desc: 'Make <b>10 sexdecillion cookies</b> just from alchemy labs.', tier5Desc: 'Make <b>10 septendecillion cookies</b> just from alchemy labs.', tier6Desc: 'Make <b>10 octodecillion cookies</b> just from alchemy labs.', mult: 0, vanillaTarget: 'I\'ve got the Midas touch' },
            { building: 'Portal', name: 'Which eternal lie', tier4Name: 'Spacetime surcharge', tier5Name: 'Interdimensional yield farming', tier6Name: 'Event-horizon markup', tier4Desc: 'Make <b>100 sexdecillion cookies</b> just from portals.', tier5Desc: 'Make <b>100 septendecillion cookies</b> just from portals.', tier6Desc: 'Make <b>100 octodecillion cookies</b> just from portals.', mult: 0, vanillaTarget: 'Which eternal lie' },
            { building: 'Time machine', name: 'D&eacute;j&agrave; vu', tier4Name: 'Future Profits, Past Tense', tier5Name: 'Infinite Loop, Infinite Loot', tier6Name: 'Back Pay from the Big Bang', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from time machines.', tier5Desc: 'Make <b>1 octodecillion cookies</b> just from time machines.', tier6Desc: 'Make <b>1 novemdecillion cookies</b> just from time machines.', mult: 0, vanillaTarget: 'D&eacute;j&agrave; vu' },
            { building: 'Antimatter condenser', name: 'Powers of Ten', tier4Name: 'Pair production payout', tier5Name: 'Cross-section surplus', tier6Name: 'Powers of crumbs', tier4Desc: 'Make <b>10 septendecillion cookies</b> just from antimatter condensers.', tier5Desc: 'Make <b>10 octodecillion cookies</b> just from antimatter condensers.', tier6Desc: 'Make <b>10 novemdecillion cookies</b> just from antimatter condensers.', mult: 0, vanillaTarget: 'Powers of Ten' },
            { building: 'Prism', name: 'Now the dark days are gone', tier4Name: 'Photons pay dividends', tier5Name: 'Spectral surplus', tier6Name: 'Dawn of plenty', tier4Desc: 'Make <b>100 septendecillion cookies</b> just from prisms.', tier5Desc: 'Make <b>100 octodecillion cookies</b> just from prisms.', tier6Desc: 'Make <b>100 novemdecillion cookies</b> just from prisms.', mult: 0, vanillaTarget: 'Now the dark days are gone' },
            { building: 'Chancemaker', name: 'Murphy\'s wild guess', tier4Name: 'Against all odds & ends', tier5Name: 'Monte Carlo windfall', tier6Name: 'Fate-backed securities', tier4Desc: 'Make <b>1 octodecillion cookies</b> just from chancemakers.', tier5Desc: 'Make <b>1 novemdecillion cookies</b> just from chancemakers.', tier6Desc: 'Make <b>1 vigintillion cookies</b> just from chancemakers.', mult: 0, vanillaTarget: 'Murphy\'s wild guess' },
            { building: 'Fractal engine', name: 'We must go deeper', tier4Name: 'Infinite series surplus', tier5Name: 'Geometric mean feast', tier6Name: 'Fractal jackpot', tier4Desc: 'Make <b>10 octodecillion cookies</b> just from fractal engines.', tier5Desc: 'Make <b>10 novemdecillion cookies</b> just from fractal engines.', tier6Desc: 'Make <b>10 vigintillion cookies</b> just from fractal engines.', mult: 0, vanillaTarget: 'We must go deeper' },
            { building: 'Javascript console', name: 'First-class citizen', tier4Name: 'Cookies per second()++', tier5Name: 'Promise.all(paydays)', tier6Name: 'Async and ye shall receive', tier4Desc: 'Make <b>100 octodecillion cookies</b> just from javascript consoles.', tier5Desc: 'Make <b>100 novemdecillion cookies</b> just from javascript consoles.', tier6Desc: 'Make <b>100 vigintillion cookies</b> just from javascript consoles.', mult: 0, vanillaTarget: 'First-class citizen' },
            { building: 'Idleverse', name: 'Earth-616', tier4Name: 'Crossover dividends', tier5Name: 'Many-Worlds ROI', tier6Name: 'Continuity bonus', tier4Desc: 'Make <b>1 novemdecillion cookies</b> just from idleverses.', tier5Desc: 'Make <b>100 vigintillion cookies</b> just from idleverses.', tier6Desc: 'Make <b>10 duovigintillion cookies</b> just from idleverses.', mult: 0, vanillaTarget: 'Earth-616' },
            { building: 'Cortex baker', name: 'Unthinkable', tier4Name: 'Brainstorm dividend', tier5Name: 'Thought economy boom', tier6Name: 'Neural net worth', tier4Desc: 'Make <b>10 novemdecillion cookies</b> just from cortex bakers.', tier5Desc: 'Make <b>10 vigintillion cookies</b> just from cortex bakers.', tier6Desc: 'Make <b>10 unvigintillion cookies</b> just from cortex bakers.', mult: 0, vanillaTarget: 'Unthinkable' },
            { building: 'You', name: 'That\'s all you', tier4Name: 'Personal growth', tier5Name: 'Economies of selves', tier6Name: 'Self-sustaining singularity', tier4Desc: 'Make <b>100 novemdecillion cookies</b> just from You.', tier5Desc: 'Make <b>100 vigintillion cookies</b> just from You.', tier6Desc: 'Make <b>100 unvigintillion cookies</b> just from You.', mult: 0, vanillaTarget: 'That\'s all you' }
        ];
        
        for (var i = 0; i < productionAchievements.length; i++) {
            var ach = productionAchievements[i];
            var vanilla = findLastVanillaAchievement(ach.vanillaTarget);
            
            if (vanilla.order > 0) {
                var building = Game.Objects[ach.building];
                if (!building) {
                    continue;
                }
                
                // Use the actual vanilla thresholds we know
                var vanillaThresholds = {
                    'Cursor': 33,      // 1 decillion = 10^33
                    'Grandma': 33,     // 1 decillion = 10^33
                    'Farm': 28,        // 10 octillion = 10^28
                    'Mine': 29,        // 100 octillion = 10^29
                    'Factory': 30,     // 1 nonillion = 10^30
                    'Bank': 31,        // 10 nonillion = 10^31
                    'Temple': 32,      // 100 nonillion = 10^32
                    'Wizard tower': 33, // 1 decillion = 10^33
                    'Shipment': 34,    // 10 decillion = 10^34
                    'Alchemy lab': 35, // 100 decillion = 10^35
                    'Portal': 36,      // 1 undecillion = 10^36
                    'Time machine': 37, // 10 undecillion = 10^37
                    'Antimatter condenser': 38, // 100 undecillion = 10^38
                    'Prism': 39,       // 1 duodecillion = 10^39
                    'Chancemaker': 40, // 10 duodecillion = 10^40
                    'Fractal engine': 41, // 100 duodecillion = 10^41
                    'Javascript console': 42, // 1 tredecillion = 10^42
                    'Idleverse': 43,   // 10 tredecillion = 10^43
                    'Cortex baker': 44, // 100 tredecillion = 10^44
                    'You': 45          // 1 quattuordecillion = 10^45
                };
                
                var vanillaExponent = vanillaThresholds[ach.building];
                if (vanillaExponent === undefined) {
                    vanillaExponent = building.n + 30; // Fallback
                }
                
                // Calculate thresholds using the actual vanilla threshold as base
                var vanillaBaseN = vanillaExponent;
                
                // Map building names to custom sprite sheet indices
                var buildingToSpriteIndex = {
                    'Cursor': 0, 'Grandma': 1, 'Farm': 2, 'Mine': 3, 'Factory': 4,
                    'Shipment': 5, 'Alchemy lab': 6, 'Portal': 7, 'Time machine': 8,
                    'Antimatter condenser': 13, 'Prism': 14, 'Bank': 15, 'Temple': 16,
                    'Wizard tower': 17, 'Chancemaker': 18, 'Fractal engine': 19,
                    'Javascript console': 20, 'Idleverse': 21, 'Cortex baker': 22, 'You': 23
                };
                var spriteIndex = buildingToSpriteIndex[ach.building] || building.n;
                
                // Create production achievements for tiers 4, 5, and 6
                var tiers = [
                    { name: ach.tier4Name, desc: ach.tier4Desc, spriteY: 21, orderOffset: 0.00001, thresholdOffset: 20 },
                    { name: ach.tier5Name, desc: ach.tier5Desc, spriteY: 22, orderOffset: 0.00002, thresholdOffset: 29 },
                    { name: ach.tier6Name, desc: ach.tier6Desc, spriteY: 23, orderOffset: 0.00003, thresholdOffset: 32 }
                ];
                
                tiers.forEach(function(tier) {
                    var threshold = Math.pow(10, vanillaBaseN + tier.thresholdOffset);
                createAchievement(
                        tier.name,
                        tier.desc,
                        [spriteIndex, tier.spriteY, getSpriteSheet('custom')],
                        vanilla.order + tier.orderOffset,
                    (function(buildingName, threshold) {
                        return function() { 
                            return Game.Objects[buildingName] && 
                                   Game.Objects[buildingName].totalCookies >= threshold; 
                        };
                        })(ach.building, threshold)
                    );
                });
            }
        }
        
        // Create "Beyond the Leaderboard" achievement - awarded when mod has been used outside shadow mode
        var beyondLeaderboardAchievement = createAchievement(
            'Beyond the Leaderboard',
            'Just Natural Expansion has been used outside of Leaderboard/Competition mode.',
            [26, 30], // Custom icon
            10000.25, // Order as requested
            function() {
                // Award this achievement if the mod has been used with shadow achievements disabled
                // This is a one-time achievement that gets awarded when the mod is first loaded
                // and the player has used the mod in non-shadow mode at least once
                return false; // This will be manually awarded when appropriate
            },
            [26, 30] // Custom icon
        );
        
        // Force this achievement into the shadow pool with correct order
        if (beyondLeaderboardAchievement) {
            beyondLeaderboardAchievement.pool = 'shadow';
            beyondLeaderboardAchievement.order = 10000.25;
        }
        
        // Create "In the Shadows" achievement - requires all vanilla shadow achievements except "Cheated cookies taste awful"
        createAchievement(
            'In the Shadows',
            'Unlock all vanilla shadow achievements, except that one.<q>You know the one I meant.</q>',
            [17, 5], // Custom icon
            400000.2, // Order as requested
            function() {
    
                // List of required vanilla shadow achievements (using regular hyphens, not en dashes)
                var requiredAchievements = [
                    'Four-leaf cookie',
                    'Seven horseshoes', 
                    'All-natural cane sugar',
                    'Endless cycle',
                    'God complex',
                    'Third-party',
                    'When the cookies ascend just right',
                    'Speed baking I',
                    'Speed baking II',
                    'Speed baking III',
                    'True Neverclick',
                    'In her likeness',
                    'Just plain lucky',
                    'Last Chance to See',
                    'So much to do so much to see',
                    'Gaseous assets'
                ];
                
                // Check if all required achievements are unlocked
                for (var i = 0; i < requiredAchievements.length; i++) {
                    var achievementName = requiredAchievements[i];
                    var achievement = Game.Achievements[achievementName];
                    if (!achievement || !achievement.won) {
                        return false; // Missing achievement, don't award
                    }
                }
                
                // All required achievements are unlocked and "Cheated cookies taste awful" is not unlocked
                return true;
            },
            [17, 5] // Custom icon
        );
        
        // Check if we should mark "Beyond the Leaderboard" as won based on current settings
        checkAndMarkBeyondTheLeaderboard();
        

        
        // Mark achievements as created to prevent recreation
        achievementsCreated = true;
        debugLog('initAchievements: completed, achievementsCreated flag set');
        
        // Force recalculation of Game.AchievementsOwned after achievements are created/restored
        // This ensures kitten upgrades can unlock properly based on achievement count
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
    
    function checkModAchievements() {
        if (!Game || !Game.Achievements) return;

        // Check all mod achievements
        for (var achId in Game.Achievements) {
            var ach = Game.Achievements[achId];

            // Only check achievements that aren't already won and have requirements
            if (ach && ach.requirement && ach.ddesc && ach.ddesc.includes(modName)) {
                if (!ach.won) {
                    try {
                        if (ach.requirement()) {
                            markAchievementWon(ach.name);
                        }
                    } catch (e) {
                        console.warn('Error checking achievement requirement:', ach.name, e);
                    }
                }
            }
        }
        
            // Check garden seeds time achievement
    if (Game.startDate) {
        var plantCount = countGardenPlants();
        
        // Check if all plants are unlocked and within time limit from last garden sacrifice
        if (plantCount.unlocked >= plantCount.total && lifetimeData.lastGardenSacrificeTime) {
            var currentTime = Date.now();
            var timeElapsed = currentTime - lifetimeData.lastGardenSacrificeTime;
            var fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
            
            if (timeElapsed <= fiveDaysInMs) {
                var achievementName = 'I feel the need for seed';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
        }
    }   
        
        // Check stock market achievements
        if (Game.Objects['Bank'] && Game.Objects['Bank'].minigame && Game.Objects['Bank'].minigame.brokers !== undefined) {
            var brokers = Game.Objects['Bank'].minigame.brokers || 0;
            if (brokers >= 100) {
                var achievementName = 'Broiler room';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
        }
        
        // Check hardercorest achievement
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            if (Game.cookiesEarned >= 3e9 && Game.cookieClicks <= 0 && Game.UpgradesOwned <= 0) {
                var achievementName = 'Hardercorest';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
        }
        
        // Check hardercorest-er achievement
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            if (Game.cookiesEarned >= 1e9) {
                // Check if no more than 20 cookie clicks
                if (Game.cookieClicks <= 20) {
                    // Check if no more than 20 buildings owned
                    let totalBuildingsOwned = 0;
                    for (let buildingName in Game.Objects) {
                        totalBuildingsOwned += Game.Objects[buildingName].amount || 0;
                    }
                    if (totalBuildingsOwned <= 20) {
                        // Check if no more than 20 upgrades owned
                        if (Game.UpgradesOwned <= 20) {
                            // Check if no buildings have been sold
                            let totalBuildingsSold = 0;
                            for (let buildingName in Game.Objects) {
                                const building = Game.Objects[buildingName];
                                const bought = building.bought || 0;
                                const amount = building.amount || 0;
                                const sold = bought - amount;
                                totalBuildingsSold += Math.max(0, sold);
                            }
                            if (totalBuildingsSold <= 0) {
                                var achievementName = 'Hardercorest-er';
                                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                                    markAchievementWon(achievementName);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Check hardcore no heavenly chips achievement
        if (!Game.Has('Heavenly chip secret')) {
            // Check if any buildings have been sold
            var heavenlyChipsBuildingsSold = 0;
            for (var buildingName in Game.Objects) {
                var building = Game.Objects[buildingName];
                var bought = building.bought || 0;
                var amount = building.amount || 0;
                var sold = bought - amount;
                heavenlyChipsBuildingsSold += Math.max(0, sold);
            }
            
            if (heavenlyChipsBuildingsSold <= 0) {
                // Check if player has at least 333 of every building type
                var allBuildingsHave333 = true;
                for (var buildingName in Game.Objects) {
                    var building = Game.Objects[buildingName];
                    if (!building || building.amount < 333) {
                        allBuildingsHave333 = false;
                        break;
                    }
                }
                
                if (allBuildingsHave333) {
                    var achievementName = 'We don\'t need no heavenly chips';
                    if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                        markAchievementWon(achievementName);
                    }
                }
            }
        }
        
        // Check hardcore final countdown achievement
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            // Check if any buildings have been sold
            var countdownCheckBuildingsSold = 0;
            for (var buildingName in Game.Objects) {
                var building = Game.Objects[buildingName];
                var bought = building.bought || 0;
                var amount = building.amount || 0;
                var sold = bought - amount;
                countdownCheckBuildingsSold += Math.max(0, sold);
            }
            
            if (countdownCheckBuildingsSold <= 0) {
                // Check if either Final Countdown set is satisfied
                if (checkFinalCountdownAchievement()) {
                    var achievementName = 'The Final Countdown';
                    if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                        markAchievementWon(achievementName);
                    }
                }
            }
        }
        
        // Check hardcore no kittens achievement
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            if ((Game.cookiesPsRaw || 0) >= 1e9) {
                // Check if any kitten upgrades have been bought
                var anyKittenUpgradesBought = false;
                for (var i = 0; i < Game.UpgradesByPool['kitten'].length; i++) {
                    if (Game.Has(Game.UpgradesByPool['kitten'][i].name)) {
                        anyKittenUpgradesBought = true;
                        break;
                    }
                }
                
                if (!anyKittenUpgradesBought) {
                    var achievementName = 'Really more of a dog person';
                    if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                        markAchievementWon(achievementName);
                    }
                }
            }
        }
        
        // Check all buildings level 10 achievement
        var allBuildingsLevel10 = true;
        for (var buildingName in Game.Objects) {
            var building = Game.Objects[buildingName];
            if (!building || building.level < 10) {
                allBuildingsLevel10 = false;
                break;
            }
        }
        if (allBuildingsLevel10) {
            var achievementName = 'Have your sugar and eat it too';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check season switches achievement
        var seasonUses = Game.seasonUses || 0;
        if (seasonUses >= 50) {
            var achievementName = 'Calendar Abuser';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check vanilla achievements achievement
        var vanillaAchievementsOwned = 0;
    
        for (var i in Game.AchievementsById) {
            var me = Game.AchievementsById[i];
            // Only count achievements that are BOTH vanilla (vanilla == 1) AND in normal pool
            // This ensures we only count true vanilla achievements, not all normal pool achievements
            if (me.vanilla == 1 && me.pool === 'normal') {
                if (me.won) {
                    vanillaAchievementsOwned++;
                }
            }
        }
        
        // Debug logging removed - Vanilla Star achievement system is working correctly
        if (vanillaAchievementsOwned >= 622) {
            var achievementName = 'Vanilla Star';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check botanical perfection achievement
        if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
            var M = Game.Objects['Farm'].minigame;
            var maturePlantTypes = {};
            
            // Check each plot for mature plants
            if (M.plot && M.plantsById) {
                // Garden uses M.plot[y][x] structure where plot[y][x][0] is plant ID
                for (var y = 0; y < 6; y++) {
                    for (var x = 0; x < 6; x++) {
                        if (M.plot[y][x][0] >= 1) {
                            var plantId = M.plot[y][x][0] - 1;
                            // Only count vanilla plants (first 34 plants, IDs 0-33)
                            // This excludes mod plants and future-proofs against other mods
                            if (plantId < 34) {
                                var plant = M.plantsById[plantId];
                                var plantAge = M.plot[y][x][1];
                                var isMature = plantAge >= plant.mature;
                                
                                if (plant && isMature) {
                                    var plantName = plant.name;
                                    if (plantName && !maturePlantTypes[plantName]) {
                                        maturePlantTypes[plantName] = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // Count unique mature plant types (vanilla only)
            var uniqueMatureTypes = Object.keys(maturePlantTypes).length;
            
            if (uniqueMatureTypes >= 34) {
                var achievementName = 'Botanical Perfection';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
            // Note: Duketater Salad achievement is now handled by the harvest all hook
        }
        
        // Check temple swaps achievements
        var templeSwaps = modTracking.templeSwapsTotal || 0;
        if (templeSwaps >= 100) {
            var achievementName = 'Faithless Loyalty';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        
        // Check soil changes achievement
        var soilChanges = modTracking.soilChangesTotal || 0;
        if (soilChanges >= 100) {
            var achievementName = 'Fifty Shades of Clay';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check buildings sold achievements
        var buildingsSoldTotal = getBuildingsSoldTotal();
        
        if (buildingsSoldTotal >= 25000) {
            var achievementName = 'Asset Liquidator';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (buildingsSoldTotal >= 50000) {
            var achievementName = 'Flip City';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (buildingsSoldTotal >= 100000) {
            var achievementName = 'Ghost Town Tycoon';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check ticker clicks achievement
        var tickerClicks = Game.TickerClicks || 0;
        if (tickerClicks >= 1000) {
            var achievementName = 'News ticker addict';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check wrath cookie achievements
        var lifetimeWrathCookies = getLifetimeWrathCookies();
        
        if (lifetimeWrathCookies >= 66) {
            var achievementName = 'Warm-Up Ritual';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (lifetimeWrathCookies >= 666) {
            var achievementName = 'Deal of the Slightly Damned';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (lifetimeWrathCookies >= 6666) {
            var achievementName = 'Baker of the Beast';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        // Check golden cookie time achievement
        if (Game.startDate) {
            var currentTime = Date.now();
            var timeElapsed = currentTime - Game.startDate;
            var twoMinutesInMs = 120 * 1000;
            
            if (timeElapsed <= twoMinutesInMs && (Game.goldenClicksLocal || 0) > 0) {
                var achievementName = 'Second Life, First Click';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
        }
        
        // Check The Final Challenger achievement (10 out of 18 challenge achievements)
        var challengeAchievementsWon = countChallengeAchievements();
        
        if (challengeAchievementsWon >= 10) {
            var achievementName = 'The Final Challenger';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
                
                // Check upgrades after earning The Final Challenger
                // Using centralized function to prevent redundant refreshes
                setTimeout(function() {
                    if (typeof mod !== 'undefined' && mod.saveSystem && typeof mod.saveSystem.checkAndUnlockAllUpgrades === 'function') {
                        mod.saveSystem.checkAndUnlockAllUpgrades();
                    }
                }, 100);
            }
        }
    }
        
    // Start initialization
    setTimeout(function() {
        try {
            
            // Preload sprite sheets for better performance
            preloadSpriteSheets();

        } catch (e) {
            console.error('Error during mod initialization:', e);
        }
    }, 1000);

    // Add custom multiplier to the tiered CpS calculation
    function addCustomBuildingMultipliers() {
        // Prevent multiple calls
        if (Game.customMultipliersSetup) {
            return;
        }
        
                  // Skip custom multiplier setup if building upgrades are disabled
          if (!enableBuildingUpgrades) {
              return;
          }
        
        // Safety check: ensure Game and GetTieredCpsMult exist
        if (!Game || !Game.GetTieredCpsMult) {
            console.warn('Game or GetTieredCpsMult not available, skipping custom multiplier setup');
            return;
        }
        
        // Additional safety check: ensure buildings are initialized
        if (!Game.Objects || Object.keys(Game.Objects).length === 0) {
            console.warn('Game.Objects not available, skipping custom multiplier setup');
            return;
        }
        
        // Store the original function
        if (!Game.originalGetTieredCpsMult) {
            Game.originalGetTieredCpsMult = Game.GetTieredCpsMult;
        }
        
        // Override with our version that includes custom multipliers
        Game.GetTieredCpsMult = function(me) {
            // Safety check: ensure we have a valid building and original function
            if (!me || !me.name || !Game.originalGetTieredCpsMult) {
                return 1; // Return default multiplier if something is missing (no warning spam)
            }
            
            var mult = 1; // Initialize with safe default
            
            try {
                mult = Game.originalGetTieredCpsMult(me);
                
                // Safety check: ensure we got a valid number back
                if (typeof mult !== 'number' || isNaN(mult) || !isFinite(mult)) {
                    mult = 1; // Default to 1 if the original function returned invalid value
                }
            } catch (e) {
                mult = 1;
            }
            
            // Add our custom multipliers for all buildings
            if (upgradeData.building) {
                for (var i = 0; i < upgradeData.building.length; i++) {
                    var upgradeInfo = upgradeData.building[i];
                    if (upgradeInfo && upgradeInfo.building === me.name && Game.Upgrades[upgradeInfo.name] && Game.Upgrades[upgradeInfo.name].bought) {
                        mult *= 1.08; // Stack multiplicatively
                    }
                }
            }
            
            // Final safety check: ensure we return a valid number
            if (typeof mult !== 'number' || isNaN(mult) || !isFinite(mult)) {
                mult = 1;
            }
            
            return mult;
        };
        
        // Mark as setup to prevent multiple calls
        Game.customMultipliersSetup = true;

    }

    // Apply building discount based on owned upgrades
    function applyBuildingDiscount(buildingName, discountUpgrades) {
        if (Game.Objects[buildingName]) {
            // Store the original modifyBuildingPrice function
            const originalModifyBuildingPrice = Game.modifyBuildingPrice;
            
            // Override Game.modifyBuildingPrice to apply our discount
            Game.modifyBuildingPrice = function(building, price) {
                // Call the original function first
                price = originalModifyBuildingPrice.call(this, building, price);
                
                // Apply our cumulative discount specifically for the target building
                if (building.name === buildingName) {
                    var discountMultiplier = 1.0;
                    
                    // Check each discount upgrade for this building
                    for (var i = 0; i < discountUpgrades.length; i++) {
                        var upgradeName = discountUpgrades[i];
                        if (Game.Upgrades[upgradeName] && Game.Upgrades[upgradeName].bought) {
                            discountMultiplier *= 0.95; // Apply 5% discount cumulatively
                        }
                    }
                    price *= discountMultiplier;
                }
                return price;
            };
            // Force the store to refresh to show updated prices
            if (Game.RefreshStore) { Game.RefreshStore(); }
            if (Game.storeToRefresh !== undefined) { Game.storeToRefresh = 1; }
        }
    }

    // Initialize building discounts when mod loads
    setTimeout(function() {
        var grandmaDiscountUpgrades = ['Increased Social Security Checks', 'Off-Brand Eyeglasses', 'Plastic Walkers', 'Bulk Discount Hearing Aids', 'Generic Arthritis Medication', 'Wholesale Denture Adhesive'];
        applyBuildingDiscount('Grandma', grandmaDiscountUpgrades);
        
        var farmDiscountUpgrades = ['Biodiesel fueled tractors', 'Free manure from clone factories', 'Solar-powered irrigation systems', 'Bulk seed purchases', 'Robot farm hands', 'Vertical farming subsidies'];
        applyBuildingDiscount('Farm', farmDiscountUpgrades);
        
        var mineDiscountUpgrades = ['Clearance shaft kits', 'Punch-card TNT club', 'Hand-me-down hardhats', 'Lease-back drill rigs', 'Ore cartel coupons', 'Cave-in insurance kickbacks'];
        applyBuildingDiscount('Mine', mineDiscountUpgrades);
        
        var factoryDiscountUpgrades = ['Flat-pack factory frames', 'BOGO rivet bins', 'Off-brand gear grease', 'Misprint warning labels', 'Pallet-jack rebates', 'Prefab cookie modules'];
        applyBuildingDiscount('Factory', factoryDiscountUpgrades);
        
        var bankDiscountUpgrades = ['Piggy buyback bonanza', 'Vault door floor-models', 'Pen-on-a-chain procurement', 'Complimentary complimentary mints', 'Fee waiver wavers', 'Dough Jones clearance'];
        applyBuildingDiscount('Bank', bankDiscountUpgrades);
        
        var templeDiscountUpgrades = ['Tithe punch cards', 'Relic replica racks', 'Incense refill program', 'Chant-o-matic hymn reels', 'Pew-per-view sponsorships', 'Sacred site tax amnesty'];
        applyBuildingDiscount('Temple', templeDiscountUpgrades);
        
        var wizardTowerDiscountUpgrades = ['Wand warranty returns', 'Grimoire remainder sale', 'Robes with “character”', 'Familiar foster program', 'Council scroll stipends', 'Broom-sharing scheme'];
        applyBuildingDiscount('Wizard tower', wizardTowerDiscountUpgrades);
        
        var shipmentDiscountUpgrades = ['Retired cargo pods', 'Container co-op cards', 'Reusable launch crates', 'Autodocker apprentices', 'Route rebate vouchers', 'Free-trade cookie ports'];
        applyBuildingDiscount('Shipment', shipmentDiscountUpgrades);
        
        var alchemyLabDiscountUpgrades = ['Beaker buybacks', 'Philosopher\'s pebbles', 'Cool-running crucibles', 'Batch homunculi permits', 'Guild reagent rates', '“Mostly lead” gold grants'];
        applyBuildingDiscount('Alchemy lab', alchemyLabDiscountUpgrades);
        
        var portalDiscountUpgrades = ['Pre-owned ring frames', 'Anchor warehouse club', 'Passive rift baffles', 'Volunteer gatekeepers', 'Interrealm stipend scrolls', 'Multiversal enterprise zone'];
        applyBuildingDiscount('Portal', portalDiscountUpgrades);
        
        var timeMachineDiscountUpgrades = ['Pre-loved hourglasses', 'Depreciated timeline scraps', 'Off-season flux valves', 'Weekend paradox passes', 'Department of When grants', 'Antique warranty loopholes'];
        applyBuildingDiscount('Time machine', timeMachineDiscountUpgrades);
        
        var antimatterCondenserDiscountUpgrades = ['Certified negamatter cans', 'Matter swap rebates', 'Low-idle annihilators', 'Grad-lab particle labor', 'Institute endowment match', 'Void-zone incentives'];
        applyBuildingDiscount('Antimatter condenser', antimatterCondenserDiscountUpgrades);
        
        var prismDiscountUpgrades = ['Lens co-op exchange', 'Spectral seconds', 'Sleep-mode rainbows', 'Apprentice refractioneers', 'Arts-of-Optics grants', 'Rainbow renewal credits'];
        applyBuildingDiscount('Prism', prismDiscountUpgrades);
        
        var chancemakerDiscountUpgrades = ['Misprinted fortunes', 'Reroll refund policy', 'Economy-grade omens', 'Volunteer augury nights', 'Lottery board matching', 'Lucky district waivers'];
        applyBuildingDiscount('Chancemaker', chancemakerDiscountUpgrades);
        
        var fractalEngineDiscountUpgrades = ['Iteration liquidation', 'Self-similar spare parts', 'Recursion rebates', 'Autogenerator residencies', 'Grant-funded proofs', 'Infinite-lot variances'];
        applyBuildingDiscount('Fractal engine', fractalEngineDiscountUpgrades);
        
        var javascriptConsoleDiscountUpgrades = ['Refurb dev boards', 'Compiler credit program', 'Idle-friendly runtimes', 'Peer-review co-ops', 'Open-source grants', 'Cloud credit vouchers'];
        applyBuildingDiscount('Javascript console', javascriptConsoleDiscountUpgrades);
        
        var idleverseDiscountUpgrades = ['Interdimensional tax breaks', 'Reality consolidation discounts', 'Cosmic bulk purchasing', 'Multiverse supplier networks', 'Dimensional economies of scale', 'Reality monopoly pricing'];
        applyBuildingDiscount('Idleverse', idleverseDiscountUpgrades);
        
        var cortexBakerDiscountUpgrades = ['Neural bulk purchasing', 'Synaptic wholesale networks', 'Cerebral mass production', 'Mind monopoly pricing', 'Neural economies of scale', 'Synaptic supply dominance'];
        applyBuildingDiscount('Cortex baker', cortexBakerDiscountUpgrades);
        
        var youDiscountUpgrades = ['Clone factory economies', 'Replica production lines', 'Mirror manufacturing mastery', 'Twin tycoon pricing', 'Doppelganger discount networks', 'Clone supply dominance'];
        applyBuildingDiscount('You', youDiscountUpgrades);
    }, 3000);


    // Ensure event system is available for any integrations
    ensureEventSystem();
    
    function attemptLumpPatch() {
        if (!Game || !Game.loadLumps || !Game.harvestLumps || !Game.clickLump) return false;
        applyLumpDiscrepancyPatch();
        applyGodSwapPatch();
        return true;
    }
    
    function attemptGodSwapPatch() {
        if (!Game || !Game.Objects || !Game.Objects['Temple']) return false;
        return applyGodSwapPatch();
    }

    attemptLumpPatch();
    attemptGodSwapPatch();
    setTimeout(function() {
        if (!attemptLumpPatch()) setTimeout(attemptLumpPatch, 1000);
        if (!attemptGodSwapPatch()) setTimeout(attemptGodSwapPatch, 1000);
    }, 100);
    
    // Expose basic mod info for integrations
    if (typeof Game !== 'undefined') {
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.modName = modName;
        Game.JNE.modVersion = modVersion;
        // Only update enableCookieAge if we're not overwriting a loaded save value
        if (typeof Game.JNE.enableCookieAge === 'undefined') {
            Game.JNE.enableCookieAge = enableCookieAge;
        }
        // Only initialize enableCookieAgeFromSave if it doesn't already exist (don't overwrite if set by save loading)
        if (typeof Game.JNE.enableCookieAgeFromSave === 'undefined') {
            Game.JNE.enableCookieAgeFromSave = false;
        }
        Game.JNE.isLoadingFromSave = false; // Flag to track save loading state
        Game.JNE.cookieAgeProgress = cookieAgeProgress;
        Game.JNE.shadowAchievementMode = shadowAchievementMode;
        Game.JNE.createAchievement = createAchievement;
        Game.JNE.markAchievementWon = markAchievementWon;
        
        // Function to update Cookie Age progress
        Game.JNE.setCookieAgeProgress = function(progress) {
            if (typeof progress !== 'number' || progress < 0 || progress > 50) {
                console.error('[JNE] Cookie Age progress must be a number between 0 and 50');
                return false;
            }
            
            cookieAgeProgress = progress;
            modSettings.cookieAgeProgress = progress;
            Game.JNE.cookieAgeProgress = progress;
            
            // Trigger save
            if (Game.Write) {
                Game.Write();
            }
            
            return true;
        };
        
    }
})();
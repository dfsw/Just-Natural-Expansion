// Just Natural Expansion - Cookie Clicker Mod

(function() 
{
    'use strict';
    
    // off loaded the static data for upgrades, achievements, etc
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/data.js';
    script.onload = function() {
        // Continue initialization after data.js is loaded
        initializeMod();
    };
    document.head.appendChild(script);
    
    function initializeMod() {
    var modName = 'Just Natural Expansion';
    var modVersion = '0.4.5';
    var debugMode = false; 
    
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
        var hasCachedState = upgradeName in modUnlockStateCache;
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
        
    // Modular lifetime variable capture system
    var sessionBaselines = {
        cookieClicks: 0,
        reindeerClicked: 0,
        wrinklersPopped: 0,
        pledges: 0,
        stockMarketAssets: 0
    };
    
    var sessionDeltas = {
        cookieClicks: 0,
        reindeerClicked: 0,
        wrinklersPopped: 0,
        pledges: 0,
        stockMarketAssets: 0
    };
    
    // Granular control toggles - defaults will be overridden by save data if available
    var shadowAchievementMode = true;
    var cookieAgeProgress = 0;  // Track puzzle quest progress (0-50)
    
    var modIcon = [15, 7]; // Static mod icon
    var boxIcon = [34, 4]; // Static Box of improved cookies icon

    var terminalMinigameScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/minigameTerminal.js';
    var downlineMinigameScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/minigameDownline.js';
    var potionsMinigameScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/minigamePotions.js';
    var cookieAgeScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Cookies@main/cookieAge.js';
    var heavenlyUpgradesScriptUrl = 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/heavenlyUpgrades.js';
    var spriteSheets = {
        custom: 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/updatedSpriteSheet.png',
        gardenPlants: 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png'
    };

var pendingTerminalMinigameSave = '';
var terminalMinigameLoadedOnce = false;
var pendingDownlineMinigameSave = '';
var downlineMinigameLoadedOnce = false;

var pendingPotionsMinigameSave = '';
var potionsMinigameLoadedOnce = false;
var cookieAgeScriptLoaded = false;
var heavenlyUpgradesScriptLoaded = false;
var modInitialized = false; // Track if mod has finished initializing
var achievementsCreated = false; // Track if achievements have been created to prevent recreation
var modSaveData = null; // Store save data for initialization
var modLoadInvoked = false; // Track whether load() has run this session
var pendingAchievementAwards = []; // Queue for achievements to award once initialization completes
var modUnlockStateCache = Object.create(null);
var toggleLock = false; // Prevent rapid toggle operations
var pendingSaveTimer = null; // Throttle saves
var saveCooldownMs = 3000; // Minimum delay between saves
var saveInProgress = false; // Prevent overlapping save operations

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

    // Centralized save scheduler with comprehensive safety measures
    function requestModSave(immediate) {
        try {
            if (Game.JNE.isLoadingFromSave) {
                debugLog('requestModSave: Blocked save during initialization - data still being restored');
                return;
            }
            
            // Validate game state before attempting save
            if (!Game || !Game.WriteSave || typeof Game.WriteSave !== 'function') {
                return;
            }
            
            // Prevent overlapping save operations
            if (saveInProgress) {
                if (!immediate && !pendingSaveTimer) {
                    pendingSaveTimer = setTimeout(function() {
                        pendingSaveTimer = null;
                        requestModSave(false);
                    }, saveCooldownMs);
                }
                return;
            }
            
            if (immediate) {
                // Clear any pending delayed save
                if (pendingSaveTimer) {
                    clearTimeout(pendingSaveTimer);
                    pendingSaveTimer = null;
                }
                
                // Execute immediate save with protection
                saveInProgress = true;
                try {
                    // Save heavenly upgrades data before main save
                    if (Game.JNE && typeof window.saveHeavenlyUpgradesData === 'function') {
                        window.saveHeavenlyUpgradesData();
                    }
                    Game.WriteSave();
                } catch (saveError) {
                } finally {
                    saveInProgress = false;
                }
                return;
            }
            
            // Throttled save: ignore if already scheduled
            if (pendingSaveTimer) {
                return;
            }
            
            // Schedule throttled save
            pendingSaveTimer = setTimeout(function() {
                pendingSaveTimer = null;
                
                // Double-check game state before executing
                if (!Game || !Game.WriteSave) {
                    saveInProgress = false;
                    return;
                }
                
                saveInProgress = true;
                try {
                    // Save heavenly upgrades data before main save
                    if (Game.JNE && typeof window.saveHeavenlyUpgradesData === 'function') {
                        window.saveHeavenlyUpgradesData();
                    }
                    Game.WriteSave();
                } catch (saveError) {
                } finally {
                    saveInProgress = false;
                }
            }, saveCooldownMs);
            
            
        } catch (e) {
            console.error('[Save] requestModSave error:', e);
            saveInProgress = false;
            if (pendingSaveTimer) {
                clearTimeout(pendingSaveTimer);
                pendingSaveTimer = null;
            }
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
            lastGardenSacrificeTime: 0,
            godUsageTime: {}
        };
        
        // Reset session tracking variables
        sessionBaselines = {
            cookieClicks: 0,
            reindeerClicked: 0,
            wrinklersPopped: 0,
            pledges: 0,
            stockMarketAssets: 0
        };
        
        sessionDeltas = {
            cookieClicks: 0,
            reindeerClicked: 0,
            wrinklersPopped: 0,
            pledges: 0,
            stockMarketAssets: 0
        };
        
        // Reset per-ascension tracking variables
        modTracking = {
            shinyWrinklersPopped: 0,
            previousWrinklerStates: {},
            templeSwapsTotal: 0,
            soilChangesTotal: 0,
            pledges: 0,
            reindeerClicked: 0,
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

            if (Game.Achievements && Array.isArray(modAchievementNames) && modAchievementNames.length) {
                modAchievementNames.forEach(function(achievementName) {
                    var achievement = Game.Achievements[achievementName];
                    if (!achievement) {
                        return;
                    }

                    if (achievement._restoredFromSave) {
                        try {
                            delete achievement.won;
                            achievement.won = achievement.won || 0;
                        } catch (ignore) {}
                    }

                    delete Game.Achievements[achievementName];
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
        cookieFishCaught: 0,
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
        cookieClicks: 0,
        previousTempleSwaps: 0,
        previousSoilType: null,
        spellCastTimes: [], // Track spell cast timestamps for Spell Slinger achievement
        bankSextupledByWrinkler: false, // Track if bank was sextupled by a wrinkler pop
        godUsageTime: {}, // Track cumulative time each god is slotted (milliseconds)
        currentSlottedGods: {} // Track currently slotted gods with their slot start timestamps
    };
    
    // Mod settings for menu system
    var modSettings = {
        shadowAchievements: true, // Should match shadowAchievementMode default
        enableCookieUpgrades: false,
        enableBuildingUpgrades: false,
        enableKittenUpgrades: false,
        enableMinigames: false, // Combined toggle for both JS Console and Downline minigames
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
        
    var hasCapturedThisAscension = false;
    var lastAscensionCount = 0;
    var trackedWrinklersPopped = 0;
    var trackedStockMarketAssets = 0;
    var isReincarnating = false;
    
    function initializeSessionBaselines() {
        sessionBaselines.cookieClicks = Game.cookieClicks || 0;
        sessionBaselines.reindeerClicked = Game.reindeerClicked || 0;
        sessionBaselines.wrinklersPopped = Game.wrinklersPopped || 0;
        sessionBaselines.pledges = Game.pledges || 0;
        sessionBaselines.stockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        trackedWrinklersPopped = Game.wrinklersPopped || 0;
        trackedStockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        Object.keys(sessionDeltas).forEach(key => sessionDeltas[key] = 0);
    }
    
    function updateSessionDeltas() {
        var currentCookieClicks = Game.cookieClicks || 0;
        var currentReindeerClicked = Game.reindeerClicked || 0;
        var currentPledges = Game.pledges || 0;
        var currentStockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        sessionDeltas.cookieClicks = Math.max(0, currentCookieClicks - sessionBaselines.cookieClicks);
        sessionDeltas.reindeerClicked = Math.max(0, currentReindeerClicked - sessionBaselines.reindeerClicked);
        sessionDeltas.pledges = Math.max(0, currentPledges - sessionBaselines.pledges);
        sessionDeltas.stockMarketAssets = Math.max(0, currentStockMarketAssets - sessionBaselines.stockMarketAssets);
    }
    
    function captureLifetimeData() {
        if (hasCapturedThisAscension) return;
        var totalCookieClicks = sessionBaselines.cookieClicks;
        var totalReindeerClicked = sessionBaselines.reindeerClicked;
        var totalPledges = sessionBaselines.pledges;
        var currentCookieFish = (Game.JNE && Game.JNE.cookieFishCaught) ? Game.JNE.cookieFishCaught : 0;
        lifetimeData.cookieFishCaught = (lifetimeData.cookieFishCaught || 0) + currentCookieFish;
        if (Game.JNE) Game.JNE.cookieFishCaught = 0;
        var currentBingoJackpots = (Game.JNE && Game.JNE.bingoJackpotWins) ? Game.JNE.bingoJackpotWins : 0;
        lifetimeData.bingoJackpotWins = (lifetimeData.bingoJackpotWins || 0) + currentBingoJackpots;
        if (Game.JNE) Game.JNE.bingoJackpotWins = 0;
        lifetimeData.totalCookieClicks += totalCookieClicks;
        lifetimeData.reindeerClicked += totalReindeerClicked;
        lifetimeData.pledges += totalPledges;
        hasCapturedThisAscension = true;
    }
    
    function handleCheck() {
        if (Game.OnAscend === 0 && !isReincarnating) {
            trackedWrinklersPopped = Game.wrinklersPopped || 0;
            trackedStockMarketAssets = (Game.Objects['Bank'] && Game.Objects['Bank'].minigame ? Game.Objects['Bank'].minigame.profit || 0 : 0);
        }
        
        if (Game.resets !== lastAscensionCount) {
            hasCapturedThisAscension = false;
            lastAscensionCount = Game.resets || 0;
            lifetimeData.wrinklersPopped = trackedWrinklersPopped + (lifetimeData.wrinklersPopped || 0);
            lifetimeData.stockMarketAssets = trackedStockMarketAssets + (lifetimeData.stockMarketAssets || 0);
            trackedWrinklersPopped = 0;
            trackedStockMarketAssets = 0;
            isReincarnating = false;
            captureLifetimeData();
        }
    }
    
    function handleReincarnate() {
        isReincarnating = true;
        lifetimeData.lastGardenSacrificeTime = 0;
        currentRunData.maxCombinedTotal = 0;
        modTracking.templeSwapsTotal = 0;
        modTracking.soilChangesTotal = 0;
        // Reset soil baseline so first soil read after ascension
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
            }
        });

        resetUnlockStateCache();
    }
    
    // Handle reset - clear data on full reset
    function handleReset() {        
        // Check if this is a full reset (not an ascension)
        if (!Game.OnAscend || Game.OnAscend === 0) {
            // This is a full reset - clear everything
            //  Clear mod save data to prevent cross-contamination
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
            // Don't call initializeSessionBaselines here - it's called during reincarnation when Game values are already 0
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
    
    // Returns total buildings sold this ascension
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

    // Exact building counts for "The Final Countdown" main and alt
    var FINAL_COUNTDOWN_REQUIRED_COUNTS = {'Cursor': 20, 'Grandma': 19, 'Farm': 18, 'Mine': 17, 'Factory': 16, 'Bank': 15, 'Temple': 14, 'Wizard tower': 13, 'Shipment': 12, 'Alchemy lab': 11, 'Portal': 10, 'Time machine': 9, 'Antimatter condenser': 8, 'Prism': 7, 'Chancemaker': 6, 'Fractal engine': 5, 'Javascript console': 4, 'Idleverse': 3, 'Cortex baker': 2, 'You': 1};
    var FINAL_COUNTDOWN_REQUIRED_COUNTS_ALT = {'Cursor': 15, 'Grandma': 14, 'Farm': 13, 'Mine': 12, 'Factory': 11, 'Bank': 10, 'Temple': 9, 'Wizard tower': 8, 'Shipment': 7, 'Alchemy lab': 6, 'Portal': 5, 'Time machine': 4, 'Antimatter condenser': 3, 'Prism': 2, 'Chancemaker': 1, 'Fractal engine': 0, 'Javascript console': 0, 'Idleverse': 0, 'Cortex baker': 0, 'You': 0};
    function checkFinalCountdownAchievement() {
        var allBuildingsCorrect = true;
        for (var buildingName in FINAL_COUNTDOWN_REQUIRED_COUNTS) {
            var building = Game.Objects[buildingName];
            if (!building || building.amount !== FINAL_COUNTDOWN_REQUIRED_COUNTS[buildingName]) {
                allBuildingsCorrect = false;
                break;
            }
        }
        if (allBuildingsCorrect) return true;
        
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
            else if (button.id === 'toggle-minigames') settingName = 'enableMinigames';
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
                        isEnabled = !!modSettings.enableCookieUpgrades;
                        buttonText = `Cookie Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableBuildingUpgrades':
                        isEnabled = !!modSettings.enableBuildingUpgrades;
                        buttonText = `Building Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableKittenUpgrades':
                        isEnabled = !!modSettings.enableKittenUpgrades;
                        buttonText = `Kitten Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableHeavenlyUpgrades':
                        isEnabled = !!modSettings.enableHeavenlyUpgrades;
                        buttonText = `Heavenly Upgrades<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableMinigames':
                        isEnabled = !!modSettings.enableMinigames;
                        buttonText = `Minigames<br><b style="font-size:12px;">${isEnabled ? 'ON' : 'OFF'}</b>`;
                        break;
                    case 'enableCookieAge':
                        isEnabled = !!modSettings.enableCookieAge;
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
        if (toggleLock) { 
        }
        toggleLock = true;
        
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
            case 'enableMinigames':
                targetVariable = 'enableMinigames';
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
        } else if (targetVariable && Object.prototype.hasOwnProperty.call(modSettings, targetVariable)) {
            newState = !modSettings[targetVariable];
        }
        

        // Determine competition-mode transition
        const wasInCompetitionMode = shadowAchievementMode && !modSettings.enableCookieUpgrades && !modSettings.enableBuildingUpgrades && !modSettings.enableKittenUpgrades && !modSettings.enableMinigames && !modSettings.enableHeavenlyUpgrades;
        let willExitCompetitionMode = false;
        if (settingName === 'shadowAchievements') {
            willExitCompetitionMode = wasInCompetitionMode && newState === false;
        } else if (settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades' || settingName === 'enableMinigames' || settingName === 'enableHeavenlyUpgrades') {
            willExitCompetitionMode = wasInCompetitionMode && newState === true;
        }

        // Helper to apply changes after confirmation/prompt
        var performToggle = function(targetSettingName, state) {
            if (targetSettingName === 'enableCookieAge') {
                applyCookieAgeChange(state, true);
            } else if (targetSettingName === 'enableCookieUpgrades' || targetSettingName === 'enableBuildingUpgrades' || targetSettingName === 'enableKittenUpgrades' || targetSettingName === 'enableMinigames') {
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
        } else if ((settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades' || settingName === 'enableMinigames' || settingName === 'enableHeavenlyUpgrades') && willExitCompetitionMode) {
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
                callback();
            } else {
                applySettingChange(settingName, newState);
            }
        } else {
            performToggle(settingName, newState);
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
        Game.CalculateGains();
        
        
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
            toggleLock = false;
        }
    }
    
    // Function to apply upgrade changes
    window.applyUpgradeChange = function(settingName, enabled) {
                
        try {
        if (settingName === 'enableMinigames') {
            modSettings.enableMinigames = enabled;
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableMinigames = enabled;
            Game.JNE.enableJSMiniGame = enabled;
            Game.JNE.enableDownlineMinigame = enabled;
            Game.JNE.enablePotionsMinigame = enabled;
            
            minigameConfigs.forEach(function(cfg) {
                if (enabled) {
                    _enableMinigame(cfg);
                } else {
                    _disableMinigame(cfg);
                    var b = Game.Objects && Game.Objects[cfg.buildingName];
                    if (b) {
                        if (b.minigame && typeof b.minigame.removeAchievements === 'function') {
                            b.minigame.removeAchievements();
                        } else if (cfg.removeAchievementsKey && typeof window[cfg.removeAchievementsKey] === 'function') {
                            window[cfg.removeAchievementsKey]();
                        }
                    }
                    _syncMinigame(cfg);
                }
            });
            
            syncAllMinigames(enabled);
            
            // Update achievements if disabling
            if (!enabled) {
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
        } else {
            modSettings[settingName] = enabled;
        }
        
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
        if (modSettings.enableBuildingUpgrades) {
            addCustomBuildingMultipliers();
        }
        
        // Update unlock states for all enabled upgrade categories to ensure immediate store visibility
        var allModNames = getModUpgradeNames();
        updateUnlockStatesForUpgrades(allModNames, true);
        
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

        // Save after refresh (throttled through centralized system)
        requestModSave(false);
            
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
        var asyncLockHandled = false; // Track if lock will be released by async callback
        
        try {
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
                
                //play welcome audio if this is a manual toggle
                if (isManualToggle && window.CookieAge && window.CookieAge.playWelcomeAudio) {
                    setTimeout(function() {
                        window.CookieAge.playWelcomeAudio();
                    }, 100);
                }
                
                // Force recalculate AchievementsOwned
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
                 Game.CalculateGains();

                };
                
                // Check if script needs to be loaded
                if (!window.CookieAge || !cookieAgeScriptLoaded) {
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
                // This ensures progress is preserved when toggling off and can be restored when toggling back on
                try {
                    if (window.CookieAge && window.CookieAge.getSaveData) {
                        if (!Game.JNE) Game.JNE = {};
                        Game.JNE.cookieAgeSavedData = window.CookieAge.getSaveData();
                    }
                } catch (e) {
                    errorLog('Failed to save Cookie Age data before disabling:', e);
                }
                
                // Disable Cookie Age mod functionality
                if (window.CookieAge && window.CookieAge.disable) {
                    window.CookieAge.disable();
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
                
                Game.CalculateGains();

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
    
    // apply Heavenly Upgrades changes
    window.applyHeavenlyUpgradesChange = function(enabled, isManualToggle) {
        var asyncLockHandled = false;
        
        try {
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
                        if (Game.JNE.heavenlyUpgradesSavedData && Game.JNE.HeavenlyUpgrades.load) {
                            Game.JNE.HeavenlyUpgrades.load(Game.JNE.heavenlyUpgradesSavedData);
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
                    actualState = !!modSettings.enableCookieUpgrades;
                    break;
                case 'enableBuildingUpgrades':
                    actualState = !!modSettings.enableBuildingUpgrades;
                    break;
                case 'enableKittenUpgrades':
                    actualState = !!modSettings.enableKittenUpgrades;
                    break;
                case 'enableHeavenlyUpgrades':
                    actualState = !!modSettings.enableHeavenlyUpgrades;
                    break;
                case 'enableMinigames':
                    actualState = !!modSettings.enableMinigames;
                    break;
                case 'enableCookieAge':
                    actualState = !!modSettings.enableCookieAge;
                    break;
                case 'shadowAchievements':
                    actualState = shadowAchievementMode;
                    break;
            }
            
            if (actualState !== expectedState) {
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
        } else if (Object.prototype.hasOwnProperty.call(modSettings, settingName)) {
            modSettings[settingName] = newState;
        }
        // When enableMinigames is changed via this path (e.g. competition-mode prompt), also run enable/disable and sync
        if (settingName === 'enableMinigames') {
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableMinigames = newState;
            Game.JNE.enableJSMiniGame = newState;
            Game.JNE.enableDownlineMinigame = newState;
            Game.JNE.enablePotionsMinigame = newState;
            minigameConfigs.forEach(function(cfg) {
                if (newState) { _enableMinigame(cfg); } else { _disableMinigame(cfg); }
                _syncMinigame(cfg);
            });
        }
        
        playToggleSound(newState);
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        updateMenuButtons();
        requestModSave(false);
        toggleLock = false;
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
							    The <span style="font-weight:bold;">Just Natural Expansion Mod</span> expands Cookie Clicker's endgame while keeping the core game intact. It adds new upgrades, achievements, minigames, and even an occult puzzle mystery thriller, all designed not to break the vanilla feel and cadence of the game. Every feature can be toggled on or off for leaderboard safe play or tailored to your own style.
							    <br><br><a href=" https://discord.gg/vTyR5vWhQR" target="_blank" rel="noopener noreferrer" style="color:#03adfc;font-weight:bold;">Join the official JNE Discord</a> to discuss with other players, get hints to puzzles, hear news and see sneak peeks from the developer.<br> 
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
                                <a class="option" id="toggle-minigames" style="text-decoration:none;color:${modSettings.enableMinigames ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;cursor:pointer;">
                                    Minigames<br><b style="font-size:12px;">${modSettings.enableMinigames ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Enables Terminal a Javascript Console minigame and Downline a Fractal Engine minigame.)</label>
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
                        
                        // Minigames toggle
                        let minigamesToggle = settingsDiv.querySelector('#toggle-minigames');
                        if (minigamesToggle) {
                            minigamesToggle.addEventListener('click', function() {
                                toggleSetting('enableMinigames');
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
                        let checkModDataButton = menuContainer.querySelector('a[onclick*="CheckModData"]');
                        let checkModDataListing = checkModDataButton ? checkModDataButton.closest('.listing') : null;
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
                    var currentSessionFish = (Game.JNE && Game.JNE.cookieFishCaught) ? Game.JNE.cookieFishCaught : 0;
                    var lifetimeFish = lifetimeData.cookieFishCaught || 0;
                    var totalFish = currentSessionFish + lifetimeFish;
                    if (totalFish > 0) {
                        var fishDisplayValue = lifetimeFish > 0 
                            ? `${currentSessionFish} (all time: ${totalFish})`
                            : currentSessionFish.toString();
                        lifetimeStatsHTML += `<div class="listing"><b>Cookie fish caught:</b> ${fishDisplayValue}</div>`;
                    }
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
                        getLifetimeGardenSacrifices(), 
                        'Garden sacrifices'
                    );
                    
                    var annualizedReturnsText = getAnnualizedReturnsText();
                    if (annualizedReturnsText) {
                        lifetimeStatsHTML += `<div class="listing" id="annualized-returns-stat">${annualizedReturnsText}</div>`;
                    }
                    
                    var modAchievementsUnlocked = 0;
                    var totalModAchievements = 0;
                    var modUpgradesPurchased = 0;
                    var totalModUpgrades = 0;
                    
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
                    
                    if (typeof getModUpgradeNames === 'function') {
                        var modUpgradeNamesList = getModUpgradeNames() || [];
                        totalModUpgrades = modUpgradeNamesList.length;

                        modUpgradeNamesList.forEach(function(upgradeName) {
                            var upgrade = Game.Upgrades && Game.Upgrades[upgradeName];
                            if (upgrade && upgrade.bought) {
                                modUpgradesPurchased++;
                            }
                        });
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
                            
                            // Create hint purchase controller 
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
                                        // Pin tooltip to the icon bounds (vanilla crate behavior)
                                        if (typeof Game.setOnCrate === 'function') {
                                            tooltipElement.addEventListener('mouseenter', function(e) {
                                                Game.setOnCrate(e.currentTarget);
                                            });
                                            tooltipElement.addEventListener('mouseleave', function() {
                                                Game.setOnCrate(0);
                                            });
                                        }
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
    
    // Unified minigame configuration — single source of truth for all per-minigame metadata
    var minigameConfigs = [
        {
            buildingName: 'Javascript console', minigameName: 'Terminal',
            scriptUrl: terminalMinigameScriptUrl, scriptPattern: 'minigameTerminal.js',
            globalMiniKey: 'Terminal', globalInitKey: null,
            removeAchievementsKey: 'removeTerminalAchievements',
            jneDataKey: 'terminalSavedData', windowApiKey: 'TerminalMinigame',
            getPendingSave: function() { return pendingTerminalMinigameSave; },
            setPendingSave: function(v) { pendingTerminalMinigameSave = v; },
            scriptLoaded: false, isOpen: false, syncPending: false
        },
        {
            buildingName: 'Fractal engine', minigameName: 'Downline',
            scriptUrl: downlineMinigameScriptUrl, scriptPattern: 'minigameDownline.js',
            globalMiniKey: 'DownlineM', globalInitKey: 'initializeDownlineMinigame',
            removeAchievementsKey: 'removeDownlineAchievements',
            jneDataKey: 'downlineSavedData', windowApiKey: 'DownlineMinigame',
            getPendingSave: function() { return pendingDownlineMinigameSave; },
            setPendingSave: function(v) { pendingDownlineMinigameSave = v; },
            scriptLoaded: false, isOpen: false, syncPending: false
        }
        // ,
        // {
        //     buildingName: 'Alchemy lab', minigameName: 'Potions Class',
        //     scriptUrl: potionsMinigameScriptUrl, scriptPattern: 'minigamePotions.js',
        //     globalMiniKey: 'PotionsM', globalInitKey: 'initializePotionsMinigame',
        //     removeAchievementsKey: 'removePotionsAchievements',
        //     jneDataKey: 'potionsSavedData', windowApiKey: 'PotionsMinigame',
        //     getPendingSave: function() { return pendingPotionsMinigameSave; },
        //     setPendingSave: function(v) { pendingPotionsMinigameSave = v; },
        //     scriptLoaded: false, isOpen: false, syncPending: false
        // }
    ];

    function _restoreMinigameOpenStates() {
        if (!Game.JNE) return;
        for (var i = 0; i < minigameConfigs.length; i++) {
            var cfg = minigameConfigs[i];
            var savedIsOpen = Game.JNE[cfg.jneDataKey + 'IsOpen'];
            if (typeof savedIsOpen === 'boolean') {
                cfg.isOpen = savedIsOpen;
            }
        }
    }

// ... (rest of the code remains the same)
    function _getMinigameCfg(buildingName) {
        for (var i = 0; i < minigameConfigs.length; i++) {
            if (minigameConfigs[i].buildingName === buildingName) return minigameConfigs[i];
        }
        return null;
    }

    function _disableMinigame(cfg) {
        if (!Game || !Game.Objects || !Game.Objects[cfg.buildingName]) return;
        var b = Game.Objects[cfg.buildingName];
        // Save the current open/close state before disabling
        cfg.isOpen = !!b.onMinigame;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE[cfg.jneDataKey + 'IsOpen'] = cfg.isOpen;
        if (b.onMinigame) {
            if (typeof b.switchMinigame === 'function') b.switchMinigame(false);
            else b.onMinigame = 0;
        }
        if (b.minigame) { b.minigame.effs = null; b.minigame._initialEffsSet = false; }
        b.minigameLoaded = false;
        b.minigame = null;
        // Hide the minigame button to prevent tooltip crash
        var buttonId = 'productMinigameButton' + b.id;
        var minigameButton = document.getElementById(buttonId);
        if (minigameButton) {
            minigameButton.style.display = 'none';
        }
    }

    function _enableMinigame(cfg) {
        if (Game.JNE && typeof Game.JNE[cfg.jneDataKey + 'IsOpen'] === 'boolean') {
            cfg.isOpen = Game.JNE[cfg.jneDataKey + 'IsOpen'];
        }
        _syncMinigame(cfg);
        var b = Game.Objects && Game.Objects[cfg.buildingName];
        if (b && b.id !== undefined && Game.ObjectsById && Game.ObjectsById[b.id] &&
            typeof Game.ObjectsById[b.id].draw === 'function') {
            Game.ObjectsById[b.id].draw();
        }
        // Restore open/close state after minigame loads
        var restoreAttempts = 0;
        var maxAttempts = 15; 
        var savedIsOpen = cfg.isOpen; 
        var buildingName = cfg.buildingName; 
        var restoreState = function() {
            var b = Game.Objects && Game.Objects[buildingName];
            if (b && b.minigame && b.minigameLoaded) {
                // Minigame is loaded, restore the saved state
                if (savedIsOpen) {
                    if (typeof b.switchMinigame === 'function') {
                        b.switchMinigame(true);
                    } else if (b.minigame && typeof b.minigame.launch === 'function') {
                        b.minigame.launch();
                    } else {
                        b.onMinigame = 1;
                    }
                } else {
                    setTimeout(function() {
                        var b = Game.Objects && Game.Objects[buildingName];
                        if (b && typeof b.switchMinigame === 'function') {
                            b.switchMinigame(false);
                        } else if (b) {
                            b.onMinigame = 0;
                        }
                    }, 500); 
                }
            } else if (b && !b.minigameLoaded && b.minigameUrl && restoreAttempts < maxAttempts) {
                restoreAttempts++;
                setTimeout(restoreState, 150);
            }
        };
        setTimeout(restoreState, 100);
    }

    function _syncMinigame(cfg) {
       if (!cfg) return;
        if (cfg.syncPending) return;
        cfg.syncPending = true;
        var b = Game.Objects && Game.Objects[cfg.buildingName];
        if (!!modSettings.enableMinigames) {
            _rebuildMinigame(cfg);
        } else {
            if (b) { b.minigame = null; b.minigameLoaded = false; b.minigameUrl = ''; }
            if (b && b.id !== undefined && Game.ObjectsById && Game.ObjectsById[b.id] &&
                typeof Game.ObjectsById[b.id].draw === 'function') {
                Game.ObjectsById[b.id].draw();
            }
        }
        cfg.syncPending = false;
    }

    function _rebuildMinigame(cfg) {
        var b = Game.Objects && Game.Objects[cfg.buildingName];
        if (!b) return;
        // If script was loaded before but the minigame object is gone (e.g. after disable),
        // we need a full reload — the init function must run again to restore b.minigame.
        var needsFullReload = cfg.scriptLoaded && !b.minigame && !b.minigameLoaded && !b.minigameUrl;
        if (cfg.scriptLoaded && !needsFullReload) { syncAllMinigames(true); return; }
        // Full reload path
        cfg.scriptLoaded = false;
        b.minigame = null; b.minigameLoaded = false; b.minigameUrl = '';
        b.minigameName = ''; b.minigameIcon = null; b.minigameLoading = false;
        if (cfg.globalMiniKey) window[cfg.globalMiniKey] = null;
        if (cfg.globalInitKey) window[cfg.globalInitKey] = null;
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf(cfg.scriptPattern) !== -1) {
                scripts[i].parentNode.removeChild(scripts[i]); break;
            }
        }
        syncAllMinigames(true);
    }

    function syncAllMinigames(shouldShow) {
        if (!Game || !Game.Objects) return;
        var needsLoad = false;
        var effectsCleared = false;
        for (var i = 0; i < minigameConfigs.length; i++) {
            var cfg = minigameConfigs[i];
            var b = Game.Objects[cfg.buildingName];
            if (!b) continue;
            var urlMatches = (b.minigameUrl || '').indexOf(cfg.scriptUrl) === 0;
            if (shouldShow === urlMatches) continue;
            if (shouldShow) {
                b.minigameName = cfg.minigameName;
                b.minigameUrl = cfg.scriptUrl + '?v=' + Date.now();
                b.minigameIcon = cfg.icon;
                b.minigameLoading = false;
                // Remove the CC-assigned script element so Game.LoadMinigames() creates a fresh one
                var oldScript = document.getElementById('minigameScript-' + b.id);
                if (oldScript && oldScript.parentNode) { oldScript.parentNode.removeChild(oldScript); needsLoad = true; }
                if (!cfg.scriptLoaded) needsLoad = true;
            } else {
                b.minigameUrl = ''; b.minigameName = ''; b.minigameIcon = null; b.minigameLoading = false;
                if (b.minigame && b.minigame.effs) { b.minigame.effs = null; effectsCleared = true; }
                if (b.minigame) b.minigame._initialEffsSet = false;
                b.minigameLoaded = false;
                b.minigame = null;
                if (Game.effs) Game.effs = {};
            }
        }
        if (needsLoad && typeof Game.LoadMinigames === 'function') {
            try {
                Game.LoadMinigames();
                for (var i = 0; i < minigameConfigs.length; i++) {
                    var cfg = minigameConfigs[i];
                    var b = Game.Objects[cfg.buildingName];
                    if (b && b.minigameUrl && b.minigameUrl.indexOf(cfg.scriptUrl) === 0) cfg.scriptLoaded = true;
                }
            } catch (e) { errorLog('Error loading minigames:', e); }
        }
        for (var i = 0; i < minigameConfigs.length; i++) {
            var b = Game.Objects[minigameConfigs[i].buildingName];
            if (b && typeof b.refresh === 'function') {
                try { b.refresh(); } catch (e) { errorLog('Error refreshing ' + minigameConfigs[i].buildingName + ':', e); }
            }
        }
        if (effectsCleared) Game.recalculateGains = 1;
    }

    // Named wrappers — kept for call-site compatibility
    function disableTerminalMinigame()           { _disableMinigame(_getMinigameCfg('Javascript console')); }
    function enableTerminalMinigame()            { _enableMinigame(_getMinigameCfg('Javascript console')); }
    function syncTerminalMinigameButtonWithSetting() { _syncMinigame(_getMinigameCfg('Javascript console')); }
    function disableDownlineMinigame()           { _disableMinigame(_getMinigameCfg('Fractal engine')); }
    function enableDownlineMinigame()            { _enableMinigame(_getMinigameCfg('Fractal engine')); }
    function syncDownlineMinigameButtonWithSetting() { _syncMinigame(_getMinigameCfg('Fractal engine')); }
    function disablePotionsMinigame()            { _disableMinigame(_getMinigameCfg('Alchemy lab')); }
    function enablePotionsMinigame()             { _enableMinigame(_getMinigameCfg('Alchemy lab')); }
    function syncPotionsMinigameButtonWithSetting()  { _syncMinigame(_getMinigameCfg('Alchemy lab')); }

    // Generate public save/load APIs for each minigame from the config
    minigameConfigs.forEach(function(cfg) {
        if (window[cfg.windowApiKey]) return;
        var api = {
            getSaveData: function() { return cfg.getPendingSave() || ''; },
            applySaveData: function(s) {
                try {
                    if (typeof s !== 'string') return;
                    if (!Game.JNE) Game.JNE = {};
                    Game.JNE[cfg.jneDataKey] = s;
                    cfg.setPendingSave(s);
                    var b = Game.Objects && Game.Objects[cfg.buildingName];
                    if (b && b.minigameLoaded && b.minigame && typeof b.minigame.load === 'function') b.minigame.load(s);
                } catch (e) { errorLog(cfg.windowApiKey + '.applySaveData failed:', e && e.message ? e.message : e); }
            },
            writeCache: function(s) {
                if (typeof s !== 'string') s = '';
                if (!Game.JNE) Game.JNE = {};
                Game.JNE[cfg.jneDataKey] = s;
                cfg.setPendingSave(s);
            },
            requestSave: function() {
                try { requestModSave(false); } catch (e) { errorLog(cfg.windowApiKey + '.requestSave failed:', e && e.message ? e.message : e); }
            }
        };
        window[cfg.windowApiKey] = api;
    });

    // Downline has extra save/load/reset methods used by minigameDownline.js itself
    if (window.DownlineMinigame) {
        var _dl = window.DownlineMinigame;
        _dl.save  = function() { return _dl.getSaveData(); };
        _dl.load  = function(s) { _dl.writeCache(typeof s === 'string' ? s : ''); };
        _dl.reset = function(hard) { if (hard) { _dl.writeCache(''); } };
    }

    // Generic get/set save helpers used by mod.saveSystem
    function _getMinigameSaveString(cfg) {
        if (!cfg) return '';
        try {
            var b = Game.Objects && Game.Objects[cfg.buildingName];
            if (b && b.minigameLoaded && b.minigame && typeof b.minigame.save === 'function') b.minigame.save();
            var api = window[cfg.windowApiKey];
            if (api && typeof api.getSaveData === 'function') return api.getSaveData();
        } catch (e) { errorLog('Failed to get ' + cfg.minigameName + ' save data:', e && e.message ? e.message : e); }
        return cfg.getPendingSave() || '';
    }

    function _setMinigameSave(cfg, s) {
        if (!cfg) return;
        try {
            if (!Game.JNE) Game.JNE = {};
            Game.JNE[cfg.jneDataKey] = typeof s === 'string' ? s : '';
            cfg.setPendingSave(Game.JNE[cfg.jneDataKey]);
            var api = window[cfg.windowApiKey];
            if (api && typeof api.applySaveData === 'function') { api.applySaveData(Game.JNE[cfg.jneDataKey]); return; }
            var b = Game.Objects && Game.Objects[cfg.buildingName];
            if (b && b.minigameLoaded && b.minigame && typeof b.minigame.load === 'function') b.minigame.load(Game.JNE[cfg.jneDataKey]);
        } catch (e) { errorLog(cfg.minigameName + ' setSaveData failed:', e && e.message ? e.message : e); }
    }

    function getTerminalMinigameSaveString()     { return _getMinigameSaveString(_getMinigameCfg('Javascript console')); }
    function getDownlineMinigameSaveString()     { return _getMinigameSaveString(_getMinigameCfg('Fractal engine')); }
    function getPotionsMinigameSaveString()      { return _getMinigameSaveString(_getMinigameCfg('Alchemy lab')); }
    function setTerminalMinigameSave(s)          { _setMinigameSave(_getMinigameCfg('Javascript console'), s); }
    function setDownlineMinigameSave(s)          { _setMinigameSave(_getMinigameCfg('Fractal engine'), s); }
    function setPotionsMinigameSave(s)           { _setMinigameSave(_getMinigameCfg('Alchemy lab'), s); }

    function getHeavenlyUpgradesSaveString() {
        try {
                // Use the new getSaveData function if available
                if (Game.JNE && Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.getSaveData === 'function') {
                    // Call the save function to ensure data is properly stored
                    if (typeof window.saveHeavenlyUpgradesData === 'function') {
                        window.saveHeavenlyUpgradesData();
                    }
                    var saveData = Game.JNE.heavenlyUpgradesSavedData;
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
    
    // Lump discrepancy patch - keeps sugar lump timers consistent across load/harvest/click
    //Borrowed logic from Spiced Cookies mod, which is no longer being updated or maintained.
    function applyLumpDiscrepancyPatch() {
        if (!Game || typeof Game !== 'object') return false;

        //"trick" CYOL into thinking the patch is applied from Spice Cookies since CYOL is still updated and used
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
                    if (harvestedAmount > 0) {
                        // Multiple overripe periods - adjust lumpT to account for all harvested
                        Game.lumpT = oldLumpT + (Game.lumpOverripeAge * harvestedAmount);
                    } else {
                        // Just harvested (not overripe) - reset timer to now
                        Game.lumpT = Date.now();
                    }
                } else if (typeof Game.lumpT === 'undefined') {
                    Game.lumpT = Date.now();
                }
                
                if (Game.Has && Game.Has('Sugar predictor') && Game.calculateLumpPredictions) {
                    setTimeout(function() {
                        Game.calculateLumpPredictions(true);
                    }, 0);
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
    
    // Global flag to prevent hooks from being registered multiple times
    var hooksRegistered = false;
    
    // Register all hooks in one place
    function registerAllHooks() {
        if (hooksRegistered) {
            return;
        }
        hooksRegistered = true;
        
        registerHook('logic', function() {
            if (!Game || !Game.Objects) return;
            
            for (var i = 0; i < minigameConfigs.length; i++) {
                var cfg = minigameConfigs[i];
                var b = Game.Objects[cfg.buildingName];
                if (!b) continue;
                
                if (b.minigame && b.minigameLoaded) {
                    if (cfg.buildingName === 'Javascript console') terminalMinigameLoadedOnce = true;
                    if (cfg.buildingName === 'Fractal engine') downlineMinigameLoadedOnce = true;
                    if (cfg.buildingName === 'Alchemy lab') potionsMinigameLoadedOnce = true;
                }
                
                var isOpen = !!b.onMinigame;
                if (cfg) cfg.isOpen = isOpen;
                // Only update saved state when minigame is loaded to avoid overwriting saved state during boot
                if (b.minigameLoaded) {
                    if (!Game.JNE) Game.JNE = {};
                    if (Game.JNE[cfg.jneDataKey + 'IsOpen'] !== isOpen) {
                        Game.JNE[cfg.jneDataKey + 'IsOpen'] = isOpen;
                    }
                }
                
                if (!modSettings.enableMinigames && isOpen && b.minigame && typeof b.minigame.close === 'function') {
                    try {
                        b.minigame.close();
                    } catch (e) {}
                    b.onMinigame = 0;
                    if (cfg) cfg.isOpen = false;
                }
                
                var shouldShow = !!modSettings.enableMinigames;
                var urlMatches = (b.minigameUrl || '').indexOf(cfg.scriptUrl) === 0;
                
                if (shouldShow !== urlMatches && cfg && !cfg.syncPending) {
                    if (cfg.buildingName === 'Javascript console') syncTerminalMinigameButtonWithSetting();
                    else if (cfg.buildingName === 'Fractal engine') syncDownlineMinigameButtonWithSetting();
                    else if (cfg.buildingName === 'Alchemy lab') syncPotionsMinigameButtonWithSetting();
                }
            }
        }, 'Monitor all minigame states');
        
        // Seasonal reindeer tracking - award immediately on pop
        if (Game.shimmerTypes && Game.shimmerTypes['reindeer']) {
            var originalReindeerPop = Game.shimmerTypes['reindeer'].popFunc;
            if (originalReindeerPop && !Game.shimmerTypes['reindeer']._seasonalReindeerHooked) {
                Game.shimmerTypes['reindeer'].popFunc = function(me) {
                    originalReindeerPop.call(this, me);
                    
                    if (me.spawnLead) {
                        var seasonMap = {
                            'valentines': "Cupid's Reindeer",
                            'fools': 'Business Reindeer',
                            'easter': 'Bundeer',
                            'halloween': 'Ghost Reindeer'
                        };
                        
                        var achName = seasonMap[Game.season];
                        if (achName && Game.Achievements[achName] && !Game.Achievements[achName].won) {
                            markAchievementWon(achName);
                        }
                    }
                };
                Game.shimmerTypes['reindeer']._seasonalReindeerHooked = true;
            }
        }
        
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
        
        // Golden cookie frequency modification - using eval cause Cursed asked so nicely. 
        registerHook('check', function() {
            if (Game.shimmerTypes['golden'].getTimeMod && !Game.shimmerTypes['golden']._goldenCookieHooked) {
                try {
                    var originalFunctionStr = Game.shimmerTypes['golden'].getTimeMod.toString();
                    
                    const injection = 
                        "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                        "if(Game.Has('Order of the Golden Crumb')){m*=0.95;}\n" +
                        "if(Game.Has('Order of the Impossible Batch')){m*=0.95;}\n" +
                        "if(Game.Has('Order of the Eternal Cookie')){m*=0.95;}\n" +
                        "if(Game.hasBuff('positive feedback loop')){m*=0.9;}\n" +
                        "//Selfishness god spawn rate increases\n" +
                        "if(!Game.OnAscend && Game.AscendTimer === 0 && Game.hasGod && Game.Objects['Temple'] && Game.Objects['Temple'].minigame && Game.Objects['Temple'].minigame.gods['selfishness']){\n" +
                        "    var level = Game.hasGod('selfishness');\n" +
                        "    if(level === 1){m*=0.5;}\n" +      // twice as often = half the time
                        "    else if(level === 2){m*=0.667;}\n" + // 50% more often = 2/3 the time  
                        "    else if(level === 3){m*=0.8;}\n" +   // 25% more often = 4/5 the time
                        "}\n" +
                        "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                    
                    var modifiedFunctionStr = originalFunctionStr.replace(/function[^{]*{/, function(match) {
                        return match + '\n' + injection;
                    });

                    Game.shimmerTypes['golden'].getTimeMod = eval('(' + modifiedFunctionStr + ')');
                    Game.shimmerTypes['golden']._goldenCookieHooked = true;
                } catch (error) {
                    console.error('JNE: Error injecting getTimeMod modifications:', error);
                }
            }
            
            registerHook('logic', function() {
                if (Game.gainBuff && !Game._gainBuffHooked) {
                    var originalGainBuff = Game.gainBuff;
                    
                    Game.gainBuff = function(type, time, arg1, arg2, arg3) {
                        if (type === 'click frenzy' || type === 'frenzy' || type === 'blood frenzy') {
                            if (Game.Has('Order of the Enchanted Whisk')) {
                                arg1 = Math.ceil(arg1 * 1.05);
                            }
                        }
                        
                        return originalGainBuff.call(this, type, time, arg1, arg2, arg3);
                    };
                    
                    Game._gainBuffHooked = true;
                }
            }, 'Hook into Game.gainBuff for frenzy buff modifications');
            
            registerHook('logic', function() {
                if (Game.buffs && Game.Has('Order of the Enchanted Whisk')) {
                    for (let buffName in Game.buffs) {
                        let buff = Game.buffs[buffName];
                        if (buff && !buff._enchantedWhiskModified) {
                            if (buffName === 'Click frenzy' || buffName === 'Frenzy' || buffName === 'Elder frenzy') {
                                buff._enchantedWhiskModified = true;
                                if (buff.multClick) buff.multClick = Math.ceil(buff.multClick * 1.05);
                                if (buff.multCpS) buff.multCpS = Math.ceil(buff.multCpS * 1.05);
                            }
                        }
                    }
                }
            }, 'Modify existing frenzy buffs for Order of the Enchanted Whisk');

        }, 'Hook into golden cookie frequency system');

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
                        
                        // Calculate 6.66 years of CPS
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
                                        //not my problem anymore
                                        
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
        // Golden cookie effect modification + wrath/achievement tracking
        if (Game.shimmerTypes && Game.shimmerTypes['golden']) {
            var originalPopFunc = Game.shimmerTypes['golden'].popFunc;
            
            if (originalPopFunc && !Game.shimmerTypes['golden']._effectInjected) {
                try {
                    let str = originalPopFunc.toString();
                    
                    const wrathTracking = "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                                         "if(me.wrath&&me.type!=='cookie storm drop'){if(!window.JNE_lifetimeData){window.JNE_lifetimeData={wrathCookiesClicked:0};}window.JNE_lifetimeData.wrathCookiesClicked++;}\n" +
                                         "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                    
                    const sweetSorcery = "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                                        "if(Game.Achievements['Sweet Sorcery']&&!Game.Achievements['Sweet Sorcery'].won){Game.Win('Sweet Sorcery');}\n" +
                                        "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                    
                    const effectDurMod = "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                                        "if(Game.Has('Order of the Shining Spoon')){effectDurMod*=1.05;}\n" +
                                        "if(Game.Has('Order of the Cookie Eclipse')){effectDurMod*=1.05;}\n" +
                                        "if(Game.Has('Order of the Eternal Cookie')){effectDurMod*=1.05;}\n" +
                                        "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                    
                    const mult = "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                                "if(Game.Has('Order of the Shining Spoon')){mult*=1.05;}\n" +
                                "if(Game.Has('Order of the Cookie Eclipse')){mult*=1.05;}\n" +
                                "if(Game.Has('Order of the Eternal Cookie')){mult*=1.05;}\n" +
                                "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                    
                    str = str.replace(/(if\s*\(me\.wrath\)\s*Game\.Win\s*\(\s*['"]Wrath cookie['"]\s*\)\s*;)/, "$1\n" + wrathTracking);
                    str = str.replace(/(Game\.gainLumps\s*\(\s*1\s*\)\s*;)/, "$1\n" + sweetSorcery);
                    str = str.replace(/var effectDurMod=1;/, "var effectDurMod=1;\n" + effectDurMod);
                    str = str.replace(/var mult=1;/, "var mult=1;\n" + mult);
                    
                    Game.shimmerTypes['golden'].popFunc = eval('(' + str + ')');
                    window.JNE_lifetimeData = lifetimeData;
                    Game.shimmerTypes['golden']._effectInjected = true;
                } catch (error) {
                    console.error('JNE: Error injecting popFunc modifications:', error);
                }
            }
        }
        
        if (Game.Upgrades && Game.Upgrades['Elder Covenant']) {
            var originalElderCovenantFunc = Game.Upgrades['Elder Covenant'].buy;
            Game.Upgrades['Elder Covenant'].buy = function() {
                originalElderCovenantFunc.call(this);
                lifetimeData.elderCovenantToggles++;
            };
        }
        
        if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
            var originalConvertFunc = Game.Objects['Farm'].minigame.convert;
            Game.Objects['Farm'].minigame.convert = function() {
                originalConvertFunc.call(this);
                lifetimeData.lastGardenSacrificeTime = Date.now();
                setTimeout(function() {
                    checkModAchievements();
                }, 0);
            };
        }

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
                
                // Check if already injected by looking for our marker comment
                if (originalFunctionStr.includes('JUST NATURAL EXPANSION MODIFICATIONS')) {
                    return;
                }
                
                // Look for kitten-related patterns in the minified code
                if (originalFunctionStr.includes('kittens')) {
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
                        // 0.005 = ~15.8% per kitten 
                        const injection = "//JUST NATURAL EXPANSION MODIFICATIONS FOLLOW\n" +
                                         "if(Game.Has('Kitten unpaid interns')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten overpaid \"temporary\" contractors')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten remote workers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten scrum masters')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten UX designers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten janitors')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten coffee fetchers')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten personal assistants')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten vice presidents')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten board members')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Has('Kitten founders')){catMult*=(1+Game.milkProgress*0.005*milkMult);}\n" +
                                         "if(Game.Achievements['Bearer of the Cookie Sigil'] && Game.Achievements['Bearer of the Cookie Sigil'].won){Game.eff('itemDrops',1.1);}\n" +
                                         "//END JUST NATURAL EXPANSION MODIFICATIONS\n";
                        
                        let modifiedFunctionStr = originalFunctionStr.replace(
                            foundPattern,
                            injection + "\n" + originalFunctionStr.match(foundPattern)[0]
                        );

                        Game.CalculateGains = eval('(' + modifiedFunctionStr + ')');
                    }
                }
            } catch (error) {
                console.error('Error injecting custom kitten multiplier code:', error);
            }
        };
        
        // Global flag to prevent re-injection (stored outside Game.CalculateGains)
        var kittenCodeInjected = false;
        
        // Register the kitten injection hook
        registerHook('logic', function() {
            // Only inject once when the game is ready
            if (Game.CalculateGains && !kittenCodeInjected) {
                findAndHookKittenCalculation();
                kittenCodeInjected = true;
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
    var cookieUpgradeNames = window.JNEData ? window.JNEData.cookieUpgradeNames : [];
    var buildingUpgradeNames = window.JNEData ? window.JNEData.buildingUpgradeNames : [];
    
    var kittenUpgradeNames = ['Kitten unpaid interns', 'Kitten overpaid "temporary" contractors', 'Kitten remote workers', 'Kitten scrum masters', 'Kitten UX designers', 'Kitten janitors', 'Kitten coffee fetchers', 'Kitten personal assistants', 'Kitten vice presidents', 'Kitten board members', 'Kitten founders'];
    var modKittenUpgradeNameSet = {};
    kittenUpgradeNames.forEach(function(name) { modKittenUpgradeNameSet[name] = true; });
    var heavenlyDonutUpgradeNames = ['Maple frosted donut', 'Boston creme donut', 'Strawberry jelly donut', 'Chocolate frosted donut', 'Donut holes', 'Chocolate filled donut', 'Powdered sugar jelly donut', 'Plain glazed donut', 'Blueberry jelly filled donut', 'Pink frosted donut', 'Chocolate sprinkle donut', 'Bear claw', 'Chocolate eclair'];
    var heavenlyGardenUpgradeNames = ['Sparkling sugar cane', 'Krazy kudzu', 'Magic mushroom'];
    
    // Generate combined mod upgrade names array on the fly
    function getModUpgradeNames() {
        var nameSet = {};
        var names = [];

        function addName(name) {
            if (name && !nameSet[name]) {
                nameSet[name] = true;
                names.push(name);
            }
        }

        if (upgradeData && typeof upgradeData === 'object') {
            ['generic', 'cookie', 'building', 'kitten'].forEach(function(category) {
                if (Array.isArray(upgradeData[category])) {
                    upgradeData[category].forEach(function(upgradeInfo) {
                        if (upgradeInfo && upgradeInfo.name) {
                            addName(upgradeInfo.name);
                        }
                    });
                }
            });
        }

        // Conditionally add heavenly-generated cookie/garden upgrades when enabled
        if (modSettings.enableHeavenlyUpgrades) {
            heavenlyDonutUpgradeNames.forEach(addName);
            heavenlyGardenUpgradeNames.forEach(addName);
        }

        // Fallback to legacy hard-coded lists if upgradeData wasn't available yet
        if (names.length === 0) {
            cookieUpgradeNames.forEach(addName);
            buildingUpgradeNames.forEach(addName);
            kittenUpgradeNames.forEach(addName);
            if (modSettings.enableHeavenlyUpgrades) {
                heavenlyDonutUpgradeNames.forEach(addName);
                heavenlyGardenUpgradeNames.forEach(addName);
            }
        }

        return names;
    }

    function getKittenOwnershipCounts() {
        var counts = {
            vanillaOwned: 0,
            vanillaTotal: 0,
            modOwned: 0,
            modTotal: kittenUpgradeNames.length || 0
        };

        var kittenPool = Game.UpgradesByPool['kitten'] || [];
        for (var i = 0; i < kittenPool.length; i++) {
            var kittenUpgrade = kittenPool[i];
            if (!kittenUpgrade || !kittenUpgrade.name) continue;

            var owned = Game.Has(kittenUpgrade.name);
            if (modKittenUpgradeNameSet[kittenUpgrade.name]) {
                counts.modTotal++;
                if (owned) counts.modOwned++;
            } else {
                counts.vanillaTotal++;
                if (owned) counts.vanillaOwned++;
            }
        }

        return counts;
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

    // Helper function to process icon arrays - convert string sprite sheet names to URLs
    function processIcon(icon) {
        if (!icon) return icon;
        if (Array.isArray(icon) && icon.length === 3) {
            var spriteSheet = icon[2];
            // Only convert if it's a simple name (not a full URL)
            if (typeof spriteSheet === 'string' && !spriteSheet.startsWith('http')) {
                return [icon[0], icon[1], getSpriteSheet(spriteSheet)];
            }
        }
        return icon;
    }

    // Global initialization protection
    if (window.JustNaturalExpansionInitialized) {

        return;
    }
    window.JustNaturalExpansionInitialized = true;

    // Helper to find last vanilla achievement by name
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
                // Convert string sprite sheet names to actual URLs (but not full URLs)
                var spriteSheet = customIcon[2];
                if (typeof spriteSheet === 'string' && !spriteSheet.startsWith('http')) {
                    spriteSheet = getSpriteSheet(spriteSheet);
                }
                finalIcon = [customIcon[0], customIcon[1], spriteSheet];
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

        var ach = new Game.Achievement(name, finalDesc, finalIcon);
        
        // Ensure the achievement is properly initialized with vanilla properties
        ach.id = Game.AchievementsN;
        ach.name = name;
        ach.dname = name;
        ach.shortName = name; // Required for Game.Win notification
        ach.desc = finalDesc;
        ach.baseDesc = finalDesc;
        ach.ddesc = finalDesc;
      
        // Set achievement pool based on shadow mode setting
        if (shadowAchievementMode) {
            ach.pool = 'shadow';
            ach.order = order + 50000; // Add 50,000 to preserve relative ordering
        } else {
            ach.pool = 'normal';
            ach.order = order;
        }
        
        // Set won state based on save data if available
        //  If achievement already exists and is won, preserve that state
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
        
        ach.name = name; 
        ach.icon = finalIcon;
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
                    
                    // Tell the vanilla game to refresh the store
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
        if (modSettings.enableCookieUpgrades || modSettings.enableBuildingUpgrades || modSettings.enableKittenUpgrades || modSettings.enableMinigames || modSettings.enableHeavenlyUpgrades || !shadowAchievementMode) {
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
                return;
            }
            removeModCookieUpgradesFromPool();
            removeModKittenUpgradesFromPool();
            
        // ===== ESSENTIAL GENERIC UPGRADES =====
        // Create essential upgrades that other upgrades depend on
            if (modSettings.enableCookieUpgrades && upgradeData.generic && Array.isArray(upgradeData.generic)) {
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
                
        // ===== BUILDING DISCOUNT UPGRADES =====
                // Create building discount upgrades from generic section
                if (modSettings.enableBuildingUpgrades && upgradeData.generic && Array.isArray(upgradeData.generic)) {
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
            
        // ===== BOX OF IMPROVED COOKIES SETUP =====
            //  Ensure "Box of improved cookies" is fully registered before creating cookie upgrades
                if (modSettings.enableCookieUpgrades && Game.Upgrades['Box of improved cookies']) {
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
            
        // ===== COOKIE UPGRADES =====
            // Create cookie upgrades only if enabled AND Box upgrade exists
            if (modSettings.enableCookieUpgrades && Game.Upgrades['Box of improved cookies'] && upgradeData.cookie && Array.isArray(upgradeData.cookie)) {
                for (var i = 0; i < upgradeData.cookie.length; i++) {
                    var upgradeInfo = upgradeData.cookie[i];
                    try {
                        createCookieUpgrade(upgradeInfo);
                    } catch (e) {
                    console.error('Failed to create cookie upgrade:', upgradeInfo.name, e);
                    }
                }
            }
            
        // ===== BUILDING UPGRADES =====
        // Create building upgrades with proper order assignment
            if (modSettings.enableBuildingUpgrades) {
            
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
        
        // ===== KITTEN UPGRADES =====
        // Create kitten upgrades with proper order assignment
            if (modSettings.enableKittenUpgrades && upgradeData.kitten && Array.isArray(upgradeData.kitten)) {
            
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
        
        // ===== SAVE DATA INITIALIZATION =====
            //  Initialize missing upgrades in save data
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

    function removeModKittenUpgradesFromPool() {
        if (!Game) {
            return;
        }

        var removedFromPool = 0;
        if (Game.UpgradesByPool && Array.isArray(Game.UpgradesByPool['kitten'])) {
            Game.UpgradesByPool['kitten'] = Game.UpgradesByPool['kitten'].filter(function(upgrade) {
                var isModUpgrade = upgrade && modKittenUpgradeNameSet[upgrade.name];
                if (isModUpgrade) {
                    removedFromPool++;
                }
                return !isModUpgrade;
            });
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
        if (typeof upgradeData === 'undefined' || !upgradeData || typeof upgradeData !== 'object') {
            return;
        }
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
        // Before deleting, snapshot donut bought states so heavenlyUpgrades.js can restore them after re-creation
        if (Game.JNE) {
            Game.JNE._pendingDonutRestores = {};
            heavenlyDonutUpgradeNames.forEach(function(name) {
                if (Game.Upgrades[name]) Game.JNE._pendingDonutRestores[name] = Game.Upgrades[name].bought || 0;
            });
        }
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (heavenlyGardenUpgradeNames.indexOf(upgradeName) !== -1) continue;
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
        if (typeof upgradeData === 'undefined' || !upgradeData || typeof upgradeData !== 'object') {
            return;
        }
        capturePermanentSlotBackups();
        removeModCookieUpgradesFromPool();
        removeModKittenUpgradesFromPool();
        // Step 1: Delete ALL mod upgrades from the game
        // Before deleting, snapshot donut bought states so heavenlyUpgrades.js can restore them after re-creation
        if (Game.JNE) {
            Game.JNE._pendingDonutRestores = {};
            heavenlyDonutUpgradeNames.forEach(function(name) {
                if (Game.Upgrades[name]) Game.JNE._pendingDonutRestores[name] = Game.Upgrades[name].bought || 0;
            });
        }
        var modUpgradeNames = getModUpgradeNames();
        for (var i = 0; i < modUpgradeNames.length; i++) {
            var upgradeName = modUpgradeNames[i];
            if (heavenlyGardenUpgradeNames.indexOf(upgradeName) !== -1) continue;
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
        if (modSettings.enableKittenUpgrades && upgradeData.kitten && Array.isArray(upgradeData.kitten)) {
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
    
    function hasAllBuildingsAtLeast(threshold) {
        var minAmount = Infinity;
        for (var buildingName in Game.Objects) {
            if (!Game.Objects.hasOwnProperty(buildingName)) {
                continue;
            }

            var building = Game.Objects[buildingName];
            if (building && typeof building.amount === 'number') {
                minAmount = Math.min(building.amount, minAmount);
            }
        }

        if (minAmount === Infinity) {
            return false;
        }

        return minAmount >= threshold;
    }
    
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
                    // Note: gardenSacrifices case handled by seedlog case below
                    case 'cookieClicks':
                        return getLifetimeCookieClicks() >= threshold;
                    case 'stockMarketAssets':
                        return getLifetimeStockMarketAssets() >= threshold;
                    case 'spell':
                        // Check if the wizard tower minigame exists and has spells cast
                        return Game.Objects['Wizard tower'].minigame && 
                               Game.Objects['Wizard tower'].minigame.spellsCastTotal >= threshold;
                    case 'freeSugarLump':
                        return Game.Achievements['Sweet Sorcery'] && Game.Achievements['Sweet Sorcery'].won;
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
                    case 'allKittensOwned':
                        var vanillaKittens = ['Kitten helpers', 'Kitten workers', 'Kitten engineers', 'Kitten overseers', 'Kitten managers', 'Kitten accountants', 'Kitten specialists', 'Kitten experts', 'Kitten consultants', 'Kitten assistants to the regional manager', 'Kitten marketeers', 'Kitten analysts', 'Kitten executives', 'Kitten admins', 'Kitten strategists', 'Kitten angels', 'Fortune #103'];
                        var modKittens = ['Kitten unpaid interns', 'Kitten overpaid "temporary" contractors', 'Kitten remote workers', 'Kitten scrum masters', 'Kitten UX designers', 'Kitten janitors', 'Kitten coffee fetchers', 'Kitten personal assistants', 'Kitten vice presidents', 'Kitten board members', 'Kitten founders'];
                        
                        if (threshold <= 18) {
                            // Check if all vanilla kittens are owned (Kitten Jamoree)
                            for (var i = 0; i < vanillaKittens.length; i++) {
                                if (!Game.Has(vanillaKittens[i])) return false;
                            }
                            return true;
                        } else {
                            // Check if all vanilla + mod kittens are owned (Kitten Fiesta)
                            var allKittens = vanillaKittens.concat(modKittens);
                            for (var j = 0; j < allKittens.length; j++) {
                                if (!Game.Has(allKittens[j])) return false;
                            }
                            return true;
                        }
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
                        return hasAllBuildingsAtLeast(750);
                    case 'butterBiscuit800':
                        return hasAllBuildingsAtLeast(800);
                    case 'butterBiscuit850':
                        return hasAllBuildingsAtLeast(850);
                    case 'butterBiscuit900':
                        return hasAllBuildingsAtLeast(900);
                    case 'butterBiscuit950':
                        return hasAllBuildingsAtLeast(950);
                    case 'butterBiscuit1000':
                        return hasAllBuildingsAtLeast(1000);
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
                        // Check if in Born Again mode or hasn't ascended yet
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
                        
                        if (getBuildingsSoldTotal() > 0) {
                            return false;
                        }
                        
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
                        // Check if in Born Again mode 
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
                        // Accept values within ±1 of the threshold precision by butt
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
                        var temple = Game.Objects['Temple'];
                        var M = temple ? temple.minigame : null;
                        if (M && M.gods['selfishness'] && Game.hasGod('selfishness')) {
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
    var achievementFlavorText = window.JNEData ? window.JNEData.achievementFlavorText : {};

    // Achievement data structure
    var achievementData = window.JNEData ? window.JNEData.achievementData : null;
    
    // Upgrade data structure
    var upgradeData = window.JNEData ? window.JNEData.upgradeData : null;
    
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
    
    
      // Initialize tracking and auxiliary states
    function initializeShinyWrinklerTracking() {
        // Initialize tracking variables (only if they don't already exist)
        if (modTracking.shinyWrinklersPopped === undefined) modTracking.shinyWrinklersPopped = 0;
        if (!modTracking.previousWrinklerStates) modTracking.previousWrinklerStates = {};
        if (!modTracking.bankSextupledByWrinkler) modTracking.bankSextupledByWrinkler = false;
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
        // Skip during ascension/reset to avoid triggering vanilla Pantheon bugs
        if (Game.OnAscend || Game.AscendTimer > 0) return;
        
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
    
    
    
    // Create upgrades function
    function createUpgrades() {
        // Check if we should mark "Beyond the Leaderboard" as won
        checkAndMarkBeyondTheLeaderboard();
        
        try {
            if (!upgradeData || typeof upgradeData !== 'object') {
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
                if (upgradeInfo.kitten) {
                    if (!Game.UpgradesByPool['kitten']) {
                        Game.UpgradesByPool['kitten'] = [];
                    }
                    Game.UpgradesByPool['kitten'].push(upgrade);
                }
                if (upgradeInfo.pool === 'custom' && Game.UpgradesByPool['custom']) {
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

                // Process icon to convert string sprite sheet names to URLs
                var processedIcon = processIcon(upgradeInfo.icon);

                // Create upgrade exactly like vanilla game does
                new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, 999, processedIcon);
                
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
                // Process icon to convert string sprite sheet names to URLs
                var processedIcon = processIcon(upgradeInfo.icon);
                // Create upgrade normally for non-CPS-scaling upgrades
                var upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, processedIcon);
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
            // Process icon to convert string sprite sheet names to URLs
            var processedIcon = processIcon(upgradeInfo.icon);
            var finalIcon = processedIcon;
            if (Array.isArray(processedIcon) && processedIcon.length === 2) {
                finalIcon = [processedIcon[0], processedIcon[1], getSpriteSheet('custom')];
            }
            
            // Create kitten upgrade using Game.Upgrade constructor
            new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, finalIcon);
            
            // Set additional properties
            // Vanilla kittens sit in the default (empty) pool so permanent slots can see them
            var kittenPool = (upgradeInfo.pool === 'kitten') ? '' : (upgradeInfo.pool || '');
            Game.last.pool = kittenPool;
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
            
            if (upgradeInfo.require) {
                upgrade.require = upgradeInfo.require;
                
                upgrade.unlocked = 0;
                
                // Create the unlockCondition function that will control when it unlocks
                upgrade.unlockCondition = function() {
                    // Butter biscuit special case: once unlocked, stay unlocked (don't relock if buildings are sold)
                    if (this.unlocked && upgradeInfo.require.startsWith('butterBiscuit')) {
                        return true;
                    }
                    
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
                
                //  Also override the canBuy function to ensure it respects the requirement
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
            
            // Use the constant Box icon coordinates - inline to prevent reference corruption
            var requireText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon([34, 4]) + ' Box of improved cookies</div>';
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

            // Process icon to convert string sprite sheet names to URLs
            var processedIcon = processIcon(upgradeInfo.icon);
            
            // Create cookie upgrades using direct Game.Upgrade constructor - This avoids CCSE dependency issues
            var upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.desc, upgradeInfo.price, processedIcon);
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
                
                var requireText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon([34, 4]) + ' Box of improved cookies</div>';
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
            // Process icon to convert string sprite sheet names to URLs
            var processedIcon = processIcon(upgradeInfo.icon);
            
            // Create upgrade using Game.Upgrade constructor
            var upgrade = new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, processedIcon);
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
                icon: processedIcon,
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
        
        // Only run this check occasionally to prevent flickering
        if (checkUpgradeUnlockConditions.lastRun && 
            (Date.now() - checkUpgradeUnlockConditions.lastRun) < 1000) {
            return; // Skip if run too recently
        }
        checkUpgradeUnlockConditions.lastRun = Date.now();
        
        // Track if any upgrades changed unlock status to trigger UI refresh
        var uiNeedsRefresh = false;
        var unlockChanges = [];

        // Normal unlock condition checking (when debug mode is off)
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
            // Always save ALL upgrades, even if they're currently disabled This ensures that disabled upgrades remember their purchase state
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
            enableCookieUpgrades: !!modSettings.enableCookieUpgrades,
            enableBuildingUpgrades: !!modSettings.enableBuildingUpgrades,
            enableKittenUpgrades: !!modSettings.enableKittenUpgrades
        };
        
        // Save the won state of each of our custom achievements
        var savedCount = 0;
        var wonCount = 0;
        modAchievementNames.forEach(name => {
            var ach = Game.Achievements[name];
            if (!ach) {
                // Achievement may have been renamed to '[DISABLED]'  Fall back to that variant so the won state is  not silently dropped from the save.
                ach = Game.Achievements[name + ' [DISABLED]'];
            }
            if (ach) {
                // _savedWonStatus is set to true before won is zeroed, so it is the authoritative pre-disable won state for hidden entries.
                var wonState = ach._savedWonStatus ? 1 : (ach.won || 0);
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
                modSettings.enableCookieUpgrades = false;
                modSettings.enableBuildingUpgrades = false;
                modSettings.enableKittenUpgrades = false;
                modSettings.enableMinigames = false;
                modSettings.enableHeavenlyUpgrades = false;
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.enableMinigames = false;
                Game.JNE.enableJSMiniGame = false;
                Game.JNE.enableDownlineMinigame = false;
                Game.JNE.enablePotionsMinigame = false;
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
        
        // Update modSettings to match
        modSettings.shadowAchievements = true;
        modSettings.enableCookieUpgrades = false;
        modSettings.enableBuildingUpgrades = false;
        modSettings.enableKittenUpgrades = false;
        modSettings.enableMinigames = false;
        modSettings.enableHeavenlyUpgrades = false;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.enableMinigames = false;
        Game.JNE.enableJSMiniGame = false;
        Game.JNE.enableDownlineMinigame = false;
        Game.JNE.enablePotionsMinigame = false;
        syncTerminalMinigameButtonWithSetting();
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
        
        // Update modSettings to match
        modSettings.shadowAchievements = false;
        modSettings.enableCookieUpgrades = true;
        modSettings.enableBuildingUpgrades = true;
        modSettings.enableKittenUpgrades = true;
        modSettings.enableMinigames = true;
        modSettings.enableHeavenlyUpgrades = true;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.enableMinigames = true;
        Game.JNE.enableJSMiniGame = true;
        Game.JNE.enableDownlineMinigame = true;
        Game.JNE.enablePotionsMinigame = true;
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
                modSettings.enableCookieUpgrades = modSaveData.settings.enableCookieUpgrades;
            }
            if (modSaveData.settings.enableBuildingUpgrades !== undefined) {
                modSettings.enableBuildingUpgrades = modSaveData.settings.enableBuildingUpgrades;
            }
            if (modSaveData.settings.enableKittenUpgrades !== undefined) {
                modSettings.enableKittenUpgrades = modSaveData.settings.enableKittenUpgrades;
            }
            if (modSaveData.settings.enableMinigames !== undefined) {
                modSettings.enableMinigames = modSaveData.settings.enableMinigames;
            } else if (modSaveData.settings.enableJSMiniGame !== undefined || modSaveData.settings.enableDownlineMinigame !== undefined) {
                // Migrate old individual minigame settings to combined setting
                var jsEnabled = modSaveData.settings.enableJSMiniGame || false;
                var downlineEnabled = modSaveData.settings.enableDownlineMinigame || false;
                modSettings.enableMinigames = jsEnabled || downlineEnabled;
            }
            if (modSaveData.settings.enableCookieAge !== undefined) {
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
                        modSettings.enableCookieUpgrades = !!modSettings.enableCookieUpgrades;
                        modSettings.enableBuildingUpgrades = !!modSettings.enableBuildingUpgrades;
                        modSettings.enableKittenUpgrades = !!modSettings.enableKittenUpgrades;
                        modSettings.enableMinigames = !!modSettings.enableMinigames;
                        modSettings.enableCookieAge = !!modSettings.enableCookieAge;
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
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.enableMinigames = !!modSettings.enableMinigames;
        Game.JNE.enableJSMiniGame = !!modSettings.enableMinigames;
        Game.JNE.enableDownlineMinigame = !!modSettings.enableMinigames;
        Game.JNE.enablePotionsMinigame = !!modSettings.enableMinigames;
        syncTerminalMinigameButtonWithSetting();
        syncDownlineMinigameButtonWithSetting();
        syncPotionsMinigameButtonWithSetting();

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

        // Initialize tracking variables and lifetime data from save data or defaults
        if (modSaveData) {
            debugLog('continueModInitialization: initializing from save data');
            
            try {
                // Restore tracking variables from save data
                if (modSaveData.modTracking) {
                    modTracking.shinyWrinklersPopped = modSaveData.modTracking.shinyWrinklersPopped || 0;
                    modTracking.templeSwapsTotal = modSaveData.modTracking.templeSwapsTotal || 0;
                    modTracking.soilChangesTotal = modSaveData.modTracking.soilChangesTotal || 0;
                    modTracking.godUsageTime = modSaveData.modTracking.godUsageTime || {};
                    modTracking.currentSlottedGods = modSaveData.modTracking.currentSlottedGods || {};
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
                    lifetimeData.cookieFishCaught = modSaveData.lifetime.cookieFishCaught || 0;
                    lifetimeData.bingoJackpotWins = modSaveData.lifetime.bingoJackpotWins || 0;
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
        lastAscensionCount = Game.resets || 0;
        
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
        
        // Apply Cookie Age save now that systems are initialized
        // The applySaveData function will handle the data appropriately whether enabled or not
        try {
            if (Game.JNE && Game.JNE.cookieAgeSavedData && window.CookieAge && window.CookieAge.applySaveData) {
                window.CookieAge.applySaveData(Game.JNE.cookieAgeSavedData);
                Game.JNE.cookieAgeSavedData = null;
            }
        } catch (_) {}
            
        // Apply Heavenly Upgrades save data now that systems are initialized
        try {
            if (Game.JNE && Game.JNE.heavenlyUpgradesSavedData) {
                if (Game.JNE.HeavenlyUpgrades && typeof Game.JNE.HeavenlyUpgrades.load === 'function') {
                    // Only apply if we have actual save data (not just empty object)
                    var saveData = Game.JNE.heavenlyUpgradesSavedData;
                    if (saveData && typeof saveData === 'object' && (saveData.version || saveData.upgrades || saveData.pantheon || saveData.garden)) {
                        Game.JNE.HeavenlyUpgrades.load(saveData);
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
            
            // Hook into the game's ticker system 
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
                    
                    if (getLifetimeGardenSacrifices() >= 3) {
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
    
    // ============================================================================
    // SAVE DATA COMPRESSION FUNCTIONS
    // ============================================================================
    function compressSaveData(saveObj) {
        try {
            var heavenlyUpgradesArray = [];
            var huData = saveObj.heavenlyUpgrades;
            var huDataString = saveObj.heavenlyUpgrades; // Keep the full data string
            if (typeof huData === 'string' && huData !== '') {
                try {
                    huData = JSON.parse(huData);
                } catch (e) {}
            }
            
            if (huData && huData.upgrades) {
                heavenlyUpgradesArray = Object.keys(huData.upgrades)
                    .filter(function(k) { return huData.upgrades[k].bought; });
            }
            
            var terminalData = saveObj.terminal;
            if (typeof terminalData === 'string' && terminalData.indexOf('%') !== -1) {
                try {
                    terminalData = decodeURIComponent(terminalData);
                } catch (e) {}
            }
            
            var wonAchievements = Object.keys(saveObj.achievements || {})
                .filter(function(k) { return saveObj.achievements[k].won; })
                .map(function(name) { return name.replace(/%/g, '[PCT]'); });
            
            const compressed = {
                v: saveObj.version,
                sig: saveObj.gameSignature,
                ts: saveObj.saveTimestamp,
                u: Object.keys(saveObj.upgrades || {})
                    .filter(function(k) { return saveObj.upgrades[k].bought; }),
                a: wonAchievements,
                h: heavenlyUpgradesArray,
                hu: huDataString, // Save full heavenly upgrades data
                lt: saveObj.lifetime,
                s: saveObj.settings,
                t: terminalData,
                dl: saveObj.downlineMinigame,
                pm: saveObj.potionsMinigame,
                pmo: Game.JNE && Game.JNE.potionsSavedDataIsOpen,
                mt: saveObj.modTracking,
                ca: saveObj.cookieAge
            };
            
            return JSON.stringify(compressed);
        } catch (e) {
            errorLog('compressSaveData: Error compressing save data:', e);
            return JSON.stringify(saveObj);
        }
    }
    
    function decompressSaveData(str) {
        try {
            const data = JSON.parse(str);
            
            if (data.version !== undefined) {
                return data;
            }
            
            const upgrades = {};
            (data.u || []).forEach(function(name) {
                upgrades[name] = {bought: 1};
            });
            
            const achievements = {};
            (data.a || []).forEach(function(name) {
                var actualName = name.replace(/\[PCT\]/g, '%');
                achievements[actualName] = {won: 1};
            });
            
            var heavenlyUpgradesObj = {
                version: "1.0.7",
                upgrades: {}
            };
            
            if (data.hu) {
                if (typeof data.hu === 'string') {
                    try {
                        var parsedHU = JSON.parse(data.hu);
                        // Preserve all fields from parsed data
                        if (parsedHU && typeof parsedHU === 'object') {
                            heavenlyUpgradesObj = parsedHU;
                        }
                    } catch (e) {}
                } else if (typeof data.hu === 'object') {
                    heavenlyUpgradesObj = data.hu;
                }
            }
            
            if (data.h && Array.isArray(data.h)) {
                data.h.forEach(function(name) {
                    heavenlyUpgradesObj.upgrades[name] = {bought: 1};
                });
            }
            
            var huData = JSON.stringify(heavenlyUpgradesObj);
            
            var potionsData = data.pm || '';
            var potionsIsOpen = data.pmo;
            if (typeof potionsIsOpen === 'boolean') {
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.potionsSavedDataIsOpen = potionsIsOpen;
            }

            var terminalData = data.t;
            if (typeof terminalData === 'string' && terminalData !== '') {
                if (terminalData.indexOf('%') === -1 && 
                    (terminalData.indexOf('{') !== -1 || terminalData.indexOf('~') !== -1)) {
                    try {
                        terminalData = encodeURIComponent(terminalData);
                    } catch (e) {}
                }
            }
            
            return {
                version: data.v,
                gameSignature: data.sig,
                saveTimestamp: data.ts,
                upgrades: upgrades,
                achievements: achievements,
                lifetime: data.lt,
                settings: data.s,
                terminal: terminalData,
                downlineMinigame: data.dl,
                potionsMinigame: potionsData,
                modTracking: data.mt,
                cookieAge: data.ca,
                heavenlyUpgrades: huData
            };
        } catch (e) {
            errorLog('decompressSaveData: Error decompressing save data:', e);
            // Return empty data structure on error
            return {
                version: modVersion,
                upgrades: {},
                achievements: {},
                lifetime: {}
            };
        }
    }
    
    Game.registerMod('JustNaturalExpansionMod', {
        name: modName,
        version: modVersion,
        
        init: function() {

            modSaveData = { upgrades: {} };
            setTerminalMinigameSave('');
            
            this.initializeMod();
            Game.Win('Third-party');
            
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
            
            // Set flags BEFORE syncing minigames
            if (!Game.JNE) Game.JNE = {};
            Game.JNE.enableMinigames = !!modSettings.enableMinigames;
            Game.JNE.enableJSMiniGame = !!modSettings.enableMinigames;
            Game.JNE.enableDownlineMinigame = !!modSettings.enableMinigames;
            Game.JNE.enablePotionsMinigame = !!modSettings.enableMinigames;

            // Restore saved open/close states from save file
            _restoreMinigameOpenStates();

            // Initialize terminal, downline, and potions minigames if enabled
            if (modSettings.enableMinigames) {
                syncTerminalMinigameButtonWithSetting();
                syncDownlineMinigameButtonWithSetting();
                syncPotionsMinigameButtonWithSetting();
            }
                        
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
          
            // Hook into the vanilla game's upgrade purchase process to check for newly unlockable upgrades
            var originalBuyFunction = Game.Upgrades.__proto__.buy || Game.Upgrades.__proto__.Buy;
            if (originalBuyFunction) {
                Game.Upgrades.__proto__.buy = function() {
                    // Call the original buy function
                    var result = originalBuyFunction.apply(this, arguments);
                    
                    // Check unlock states after purchase (some upgrades may now be unlockable)
                    setTimeout(function() {
                        self.checkAndUnlockAllUpgrades();
                    }, 50);
                    
                    return result;
                };
            }
        },
  
        // save() is called automatically by the game when saving
        save: function() {
            try {
                var currentTime = Date.now();
                
                // Combine achievements and lifetime data
                var achievementsData;
                try {
                    achievementsData = JSON.parse(saveAchievementsData());
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error saving achievements data:', e);
                    achievementsData = { achievements: {} };
                }
                
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
                                        godUsageTime: lifetimeData.godUsageTime || {},
                    cookieFishCaught: lifetimeData.cookieFishCaught || 0,
                    bingoJackpotWins: lifetimeData.bingoJackpotWins || 0
                };
                
                //get terminal minigame save string
                var terminalSaveString = '';
                try {
                    terminalSaveString = getTerminalMinigameSaveString();
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting terminal save string:', e);
                }
                
                //get Downline minigame save string
                var downlineMinigameSaveString = '';
                try {
                    downlineMinigameSaveString = getDownlineMinigameSaveString();
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting Downline minigame save string:', e);
                }
                
                //get Potions class minigame save string
                var potionsMinigameSaveString = '';
                try {
                    potionsMinigameSaveString = getPotionsMinigameSaveString();
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting Potions minigame save string:', e);
                }
                
                //get Cookie Age save data
                var cookieAgeData = null;
                try {
                    if (typeof window !== 'undefined' && window.CookieAge && window.CookieAge.getSaveData) {
                        cookieAgeData = window.CookieAge.getSaveData();
                    } else if (Game.JNE && Game.JNE.cookieAgeSavedData) {
                        // Fallback: If Cookie Age script is not loaded but we have stashed save data
                        // (e.g., user disabled Cookie Age and never re-enabled), use the stashed data
                        cookieAgeData = Game.JNE.cookieAgeSavedData;
                    }
                } catch (e) {
                    errorLog('mod.saveSystem.save: Error getting Cookie Age save data:', e);
                }
                
                //get heavenly upgrades save string
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
                    upgrades: upgradesData.upgrades || {},
                    achievements: achievementsData.achievements || {},
                    lifetime: lifetimeDataToSave,
                    settings: modSettings,
                    terminal: terminalSaveString,
                    downlineMinigame: downlineMinigameSaveString,
                    potionsMinigame: potionsMinigameSaveString,
                    modTracking: {
                        shinyWrinklersPopped: modTracking.shinyWrinklersPopped || 0,
                        templeSwapsTotal: modTracking.templeSwapsTotal || 0,
                        soilChangesTotal: modTracking.soilChangesTotal || 0,
                        godUsageTime: modTracking.godUsageTime || {},
                        currentSlottedGods: modTracking.currentSlottedGods || {}
                    },
                    // Persist Cookie Age progress regardless of toggle state
                    cookieAge: cookieAgeData,
                    // Persist Heavenly Upgrades data (fortune cookie regeneration timer, etc.)
                    heavenlyUpgrades: heavenlyUpgradesSaveString
                };
                                
                // Use compression to reduce save file size by ~50%
                var saveString = compressSaveData(combinedData);
                
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
            try {
                if (!str || str.trim() === '' || str === '{}') {
                    modSaveData = { upgrades: {} };
                    setTerminalMinigameSave('');
                    setPotionsMinigameSave('');
                    setHeavenlyUpgradesSave('');
                    checkAndShowInitialChoice();
                    return;
                }
                
                // Decompress save data (handles both old and new formats automatically)
                const modData = decompressSaveData(str);
                
                // Validate save data BEFORE resetting anything
                if (!modData) {
                    debugLog('mod.saveSystem.load: failed to decompress save data, aborting load');
                    modSaveData = { upgrades: {} };
                    setTerminalMinigameSave('');
                    setPotionsMinigameSave('');
                    setHeavenlyUpgradesSave('');
                    checkAndShowInitialChoice();
                    return;
                }
                
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
                }
                
                // do we have any meaningful data?
                const hasData = modData && (
                    (modData.upgrades && Object.keys(modData.upgrades).length > 0) ||
                    (modData.achievements && Object.keys(modData.achievements).length > 0) ||
                    (modData.lifetime && Object.keys(modData.lifetime).length > 0) ||
                    (modData.modTracking && Object.keys(modData.modTracking).length > 0) ||
                    (modData.settings && Object.keys(modData.settings).length > 0) ||
                    (typeof modData.terminal === 'string' && modData.terminal.length > 0) ||
                    (typeof modData.downlineMinigame === 'string' && modData.downlineMinigame.length > 0) ||
                    (typeof modData.potionsMinigame === 'string' && modData.potionsMinigame.length > 0)
                );
                
                if (!hasData) {
                    debugLog('mod.saveSystem.load: no meaningful data');
                    // Keep existing Downline minigame cache as-is; there is nothing new to restore.
                    setTerminalMinigameSave('');
                    setHeavenlyUpgradesSave('');
                    return;
                }
                
                // COMPLETE RESET: Every load resets everything and rebuilds from save data
                // ONLY PERFORMED AFTER VALIDATING SAVE DATA
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
                                                godUsageTime: {}
                    };
                    
                    // Reset mod tracking data to default state first
                    modTracking = {
                        shinyWrinklersPopped: 0,
                        previousWrinklerStates: {},
                        templeSwapsTotal: 0,
                        soilChangesTotal: 0,
                        godUsageTime: {},
                        currentSlottedGods: {},
                        pledges: 0,
                        reindeerClicked: 0,
                        cookieClicks: 0,
                        previousTempleSwaps: 0,
                        previousSoilType: null,
                        spellCastTimes: [],
                        bankSextupledByWrinkler: false
                    };
                    
                    // Store save data for initialization (or empty data if signature mismatch)
                    if (shouldRestoreSaveData) {
                        modSaveData = modData;
                        if (typeof modData.terminal !== 'undefined') {
                            setTerminalMinigameSave(modData.terminal);
                        } else {
                            setTerminalMinigameSave('');
                        }
                        if (typeof modData.downlineMinigame === 'string') {
                            setDownlineMinigameSave(modData.downlineMinigame);
                        } else {
                            setDownlineMinigameSave('');
                        }
                        if (typeof modData.potionsMinigame === 'string') {
                            setPotionsMinigameSave(modData.potionsMinigame);
                        } else {
                            setPotionsMinigameSave('');
                        }
                        if (typeof modData.heavenlyUpgrades !== 'undefined') {
                            setHeavenlyUpgradesSave(modData.heavenlyUpgrades);
                        } else {
                            setHeavenlyUpgradesSave('');
                        }
                    } else {
                        modSaveData = { upgrades: {} };
                        setTerminalMinigameSave('');
                        setDownlineMinigameSave('');
                        setPotionsMinigameSave('');
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
                        
                        // Apply settings to Game.JNE mirrors; modSettings are already populated above
                        if (modSettings.enableMinigames !== undefined) {
                            Game.JNE.enableMinigames = modSettings.enableMinigames;
                            Game.JNE.enableJSMiniGame = modSettings.enableMinigames;
                            Game.JNE.enableDownlineMinigame = modSettings.enableMinigames;
                            Game.JNE.enablePotionsMinigame = modSettings.enableMinigames;
                        }
                        if (modSettings.enableCookieAge !== undefined) {
                            Game.JNE.enableCookieAge = modSettings.enableCookieAge;
                        }
                        // Always mark that we're loading from save if we're in this code path
                        // This prevents welcome audio from playing even if the setting isn't in the save yet
                        Game.JNE.enableCookieAgeFromSave = true;
                    }
                    
                    // Suppress CPS recalculation during upgrade recreation to prevent spikes
                    var previousRecalculateGains = Game.recalculateGains;
                    Game.recalculateGains = 0;
                    
                    //Delete everything and recreate from save data only
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

                    if (modData.lifetime) {
                        lifetimeData = Object.assign(lifetimeData, modData.lifetime);
                        debugLog('mod.saveSystem.load: restored lifetime data from save');
                    }
                    
                    if (modData.modTracking) {
                        modTracking = Object.assign(modTracking, modData.modTracking);
                        debugLog('mod.saveSystem.load: restored modTracking data from save');
                    }
                                        
                } catch (error) {
                    console.error('[JNE Error] Error loading mod save data:', error);
                    debugLog('mod.saveSystem.load: error loading save data:', error);
                    // Fall back to defaults on error
                    modSaveData = { upgrades: {} };
                    setTerminalMinigameSave('');
                    continueModInitialization();
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
            
            //  Only check MOD upgrades, never touch vanilla upgrades
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
                    var actualRequirementType = (type === 'completionism') ? data.thresholds[i] : type;
                    var requirement = createRequirementFunction(actualRequirementType, data.thresholds[i]);
                    
                    var orderOffset = (type === 'seedlog') ? (i + 1) * 0.00001 : (i + 1) * 0.01;
                    
                    var achievementOrder;
                    if (type === 'completionism') {
                        achievementOrder = 400000.3;
                    } else {
                        achievementOrder = vanilla.order + orderOffset;
                    }
                    
                    if (type === 'buildingsSold') {
                        orderOffset = (i + 1) * 0.01 + 0.1; // Add extra offset to ensure they come after totalBuildings
                    }
                    
                    var finalOrder = achievementOrder;
                    if (data.names[i] === 'Faithless Loyalty') {
                        finalOrder = 61490;
                    }
                    
                    if (data.names[i] === 'God of All Gods') {
                        finalOrder = 61490.01;
                    }
                    
                    if (data.names[i] === 'I feel the need for seed') {
                        finalOrder = 61515.430;
                    } else if (data.names[i] === 'Botanical Perfection') {
                        finalOrder = 61515.431;
                    } else if (data.names[i] === 'Duketater Salad') {
                        finalOrder = 61515.44;
                    } else if (data.names[i] === 'Fifty Shades of Clay') {
                        finalOrder = 61515.433;
                    }
                    
                    if (data.names[i] === 'Golden wrinkler') {
                        finalOrder = 21000.168;
                    }
                    
                    if (data.names[i] === 'Wrinkler Windfall') {
                        finalOrder = 21000.169;
        
                    }
                    
                    if (data.names[i] === 'Sweet Sorcery') {
                        finalOrder = 61496.004;
                    }
                    
                    if (data.names[i] === 'The Final Challenger') {
                        finalOrder = 30501;
                    }
                    
                    if (data.names[i] === 'Broiler room') {
                        finalOrder = 61616.358;
                    }
                    
                    if (data.names[i] === 'Wrinkler Rush') {
                        finalOrder = 21000.17;
                    }
                    
                    if (data.names[i] === 'Buff Finger') {
                        finalOrder = 7003;
                    }
                    
                    if (data.names[i] === 'Click of the Titans') {
                        finalOrder = 7004;
                    }
                    
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
        var levelAchievements = window.JNEData ? window.JNEData.levelAchievements : [];
        
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
        var productionAchievements = window.JNEData ? window.JNEData.productionAchievements : [];
        
        for (var i = 0; i < productionAchievements.length; i++) {
            var ach = productionAchievements[i];
            var vanilla = findLastVanillaAchievement(ach.vanillaTarget);
            
            if (vanilla.order > 0) {
                var building = Game.Objects[ach.building];
                if (!building) {
                    continue;
                }
                
                // Use the actual vanilla thresholds from data.js
                var vanillaThresholds = window.JNEData ? window.JNEData.vanillaThresholds : {};
                
                var vanillaExponent = vanillaThresholds[ach.building];
                if (vanillaExponent === undefined) {
                    vanillaExponent = building.n + 40; // safety 
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
        
        var beyondLeaderboardAchievement = createAchievement(
            'Beyond the Leaderboard',
            'Just Natural Expansion has been used outside of Leaderboard/Competition mode.',
            [26, 30], // Custom icon
            10000.25, // Order as requested
            function() {
                // Award this achievement if the mod has been used with shadow achievements disabled
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
                
                // we let the user have cheated cookies taste awful here even though the tooltip says they cant
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

        // Check all mod achievements using authoritative list
        if (Array.isArray(modAchievementNames)) {
            modAchievementNames.forEach(function(achievementName) {
                var ach = Game.Achievements[achievementName];
                if (!ach || !ach.requirement || ach.won) {
                    return;
                }

                try {
                    if (ach.requirement()) {
                        markAchievementWon(ach.name);
                    }
                } catch (e) {
                    console.warn('Error checking achievement requirement:', ach.name, e);
                }
            });
        }
        
        // Also check forfeited achievements in the regular check loop
        if (achievementData && achievementData.other && achievementData.other.forfeited) {
            var forfeitedData = achievementData.other.forfeited;
            for (var i = 0; i < forfeitedData.names.length; i++) {
                var achievementName = forfeitedData.names[i];
                var achievement = Game.Achievements[achievementName];
                if (achievement && !achievement.won && (Game.cookiesReset || 0) >= forfeitedData.thresholds[i]) {
                    markAchievementWon(achievementName);
                }
            }
        }
        
     // Check garden seeds time achievement at some point we should change this to count via ticks instead of calendar time
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
                        if ((Game.UpgradesOwned || 0) <= 20) {
                            // Check no buildings sold this run
                            if (getBuildingsSoldTotal() <= 0) {
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
            if (getBuildingsSoldTotal() <= 0) {
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
            if (getBuildingsSoldTotal() <= 0) {
                // Check if either Final Countdown set is satisfied
                if (checkFinalCountdownAchievement()) {
                    var achievementName = 'The Final Countdown';
                    if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                        markAchievementWon(achievementName);
                    }
                }
            }
        }
        
        // Check hardcore no kittens achievement (no kittens of any type)
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            if ((Game.cookiesPsRaw || 0) >= 1e9) {
                var hardcoreKittenCounts = getKittenOwnershipCounts();
                if ((hardcoreKittenCounts.vanillaOwned + hardcoreKittenCounts.modOwned) === 0) {
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
        
    setTimeout(function() {
        try {            
            preloadSpriteSheets();
        } catch (e) {
            console.error('Error during mod initialization:', e);
        }
    }, 500);

    // Add custom multiplier to the tiered CpS calculation
    function addCustomBuildingMultipliers() {
        // Prevent multiple calls
        if (Game.customMultipliersSetup) {
            return;
        }
        
        // Skip custom multiplier setup if building upgrades are disabled
        if (!modSettings.enableBuildingUpgrades) {return;}
        
        // ensure GetTieredCpsMult exist
        if (!Game.GetTieredCpsMult) {
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
            
            var mult = 1; // safe default
            
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

    // Initialize building discounts on slight delay
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
    }, 1000);

    // Ensure event system is available for any integrations
    ensureEventSystem();
    
    function attemptLumpPatch() {
        if (!Game || !Game.loadLumps || !Game.harvestLumps || !Game.clickLump) return false;
        applyLumpDiscrepancyPatch();
        return true;
    }
    
    attemptLumpPatch();
    setTimeout(function() {
        if (!attemptLumpPatch()) setTimeout(attemptLumpPatch, 1000);
    }, 100);
    
    // Expose basic mod info for integrations
    if (typeof Game !== 'undefined') {
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.modName = modName;
        Game.JNE.modVersion = modVersion;
        // Only update enableCookieAge if we're not overwriting a loaded save value
        if (typeof Game.JNE.enableCookieAge === 'undefined') {
            Game.JNE.enableCookieAge = !!modSettings.enableCookieAge;
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
        
    } // end initializeMod
    } // end IIFE
})();
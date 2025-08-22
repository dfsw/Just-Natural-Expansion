// Just Natural Expansion - Cookie Clicker Mod

(function() 
{
    'use strict';
    
    var modName = 'Just Natural Expansion';
    var modVersion = '0.0.1';
    var debugMode = false;
    var isLoadingModData = true;
    var runtimeSessionId = Math.floor(Math.random()*1e9) + '-' + Date.now();
    
    /*There seems to be a bug with the vanilla game involving local caching and mod saved data, this was an overly complex work around
    I doubt anyone is playing like I am testing with frequent save swaps and resets, but better to try and be safe. 
    Compute a base save hash that uniquely identifies the current vanilla save*/
    function computeBaseSaveHash() {
        try {
            var parts = [];
            parts.push('bakery:' + (Game.bakeryName || ''));
            parts.push('start:' + (Game.startDate || 0));
            parts.push('resets:' + (Game.resets || 0));
            if (Game.seed) parts.push('seed:' + Game.seed);
            // Include building amounts and bought counts for stability
            if (Game.Objects) {
                for (var name in Game.Objects) {
                    var obj = Game.Objects[name];
                    if (!obj) continue;
                    parts.push(name + ':' + (obj.amount || 0) + ':' + (obj.bought || 0));
                }
            }
            // Include total cookies earned
            parts.push('earned:' + (Game.cookiesEarned || 0));
            var s = parts.join('|');
            // Simple djb2 hash
            var hash = 5381;
            for (var i = 0; i < s.length; i++) {
                hash = ((hash << 5) + hash) + s.charCodeAt(i);
                hash = hash & 0xffffffff;   
            }
            return (hash >>> 0).toString(16);
        } catch (e) {
            return '0';
        }
    }
    
    function debugLog() {
        if (!debugMode) return;
        try {
            var msg = Array.prototype.slice.call(arguments).join(' ');
            console.log('[JNE Debug]', msg);
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
    
    // Granular control toggles
    var shadowAchievementMode = true;
    var enableCookieUpgrades = false;
    var enableBuildingUpgrades = false;
    var enableKittenUpgrades = true;
    
    var modIcon = [15, 7]; // Static mod icon from main sprite sheet
    var modInitialized = false; // Track if mod has finished initializing
    var deferredSaveData = null; // Store save data for deferred loading after initialization
    var toggleLock = false; // Prevent rapid toggle operations
    var pendingSaveTimer = null; // Throttle saves
    var saveCooldownMs = 1000; // Minimum delay between saves
    var toggleSaveData = {}; // Store upgrade states during toggle operations
    
    // Centralized save scheduler to avoid spamming saves
    function requestModSave(immediate) {
        try {
            if (isLoadingModData) {
                debugLog('requestModSave: suppressed (isLoadingModData)');
                return;
            }
            if (immediate) {
                if (pendingSaveTimer) {
                    clearTimeout(pendingSaveTimer);
                    pendingSaveTimer = null;
                }
                if (Game.WriteSave) {
                    debugLog('requestModSave: immediate write via Game.WriteSave');
                    Game.WriteSave();
                }
                return;
            }
            if (pendingSaveTimer) return;
            debugLog('requestModSave: scheduled write');
            pendingSaveTimer = setTimeout(function() {
                pendingSaveTimer = null;
                if (Game.WriteSave) {
                    debugLog('requestModSave: executing scheduled write');
                    Game.WriteSave();
                }
            }, saveCooldownMs);
        } catch (e) {
            console.warn('[Save] requestModSave failed:', e);
        }
    }
    
    // Complete reset system for new save loads
    function resetAllModDataForNewSave() {
        debugLog('resetAllModDataForNewSave: start. gameSig=', (Game.cookiesEarned||0)+'_'+(Game.resets||0)+'_'+(Game.startDate||0));
        // Reset lifetime tracking variables
        lifetimeData = {
            reindeerClicked: 0,
            stockMarketAssets: 0,
            shinyWrinklersPopped: 0,
            wrathCookiesClicked: 0,
            totalGardenSacrifices: 0,
            totalCookieClicks: 0,
            wrinklersPopped: 0,
            elderCovenantToggles: 0,
            pledges: 0,
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
            wrathCookiesClicked: 0,
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
        
        debugLog('resetAllModDataForNewSave: base structures reset');

        // Also clear purchased state for all mod upgrades so a new save doesn't inherit prior buys
        try {
            var modUpgradeNames = getModUpgradeNames ? getModUpgradeNames() : [];
            modUpgradeNames.forEach(function(name){
                if (Game && Game.Upgrades && Game.Upgrades[name]) {
                    var prev = Game.Upgrades[name].bought || 0;
                    Game.Upgrades[name].bought = 0;
                    if (name === debugTargetUpgradeName) {
                        debugLog('resetAllModDataForNewSave: clearing bought for', name, 'from', prev, 'to 0');
                    }
                }
            });
            debugLog('resetAllModDataForNewSave: cleared bought flags for', (modUpgradeNames||[]).length, 'upgrades');
        } catch (e) {
            // ignore
        }
        debugLog('resetAllModDataForNewSave: end');
    }
    
    // Reset all mod data on every load - let save file restore what should persist
    
    // Lifetime tracking variables (persist across ascensions)
    var lifetimeData = {
        reindeerClicked: 0,
        stockMarketAssets: 0,
        shinyWrinklersPopped: 0,
        wrathCookiesClicked: 0,
        totalGardenSacrifices: 0,
        totalCookieClicks: 0,
        wrinklersPopped: 0,
        elderCovenantToggles: 0,
        pledges: 0,
        gardenSacrifices: 0,
        lastGardenSacrificeTime: 0,
        godUsageTime: {} // Track cumulative time each god is slotted across all ascensions
    };
    
    // Mod settings for menu system
    var modSettings = {
        shadowAchievements: true, // Should match shadowAchievementMode default
        enableCookieUpgrades: false,
        enableBuildingUpgrades: false,
        enableKittenUpgrades: true,
        hasUsedModOutsideShadowMode: false,
        hasMadeInitialChoice: false // Track if user has made their initial leaderboard/non-leaderboard choice
    };
    
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
         
        // Add to lifetime data
        lifetimeData.totalCookieClicks += totalCookieClicks;
        lifetimeData.reindeerClicked += totalReindeerClicked;
        lifetimeData.wrinklersPopped += totalWrinklersPopped;
        lifetimeData.pledges += totalPledges;
        lifetimeData.stockMarketAssets += totalStockMarketAssets;
        // Do not modify lifetimeData.gardenSacrifices here (handled by convert hook)
        
        // Reset for next session
        initializeSessionBaselines();
        hasCapturedThisAscension = true;
    }
    
    // Handle check hook - monitor for ascension and capture values
    function handleCheck() {
        // Capture lifetime data when ascension starts
        if (Game.OnAscend > 0) {
            captureLifetimeData();
        }
        
        // Reset capture flag when we detect a new ascension cycle
        if (Game.resets !== lastAscensionCount) {
            hasCapturedThisAscension = false;
            lastAscensionCount = Game.resets || 0;
            initializeSessionBaselines(); // Reset baselines for new session
        }
    }
    
    // Handle reincarnate (ascension) - reset run-specific data
    function handleReincarnate() {
        // Reset garden sacrifice timer on ascension to prevent save scumming
        lifetimeData.lastGardenSacrificeTime = 0;
        
        // Capture lifetime data if not already done
        captureLifetimeData();
        
        // Reset the current run's max combined total
        currentRunData.maxCombinedTotal = 0;
        
        // Reset "this ascension" tracking variables
        
        modTracking.templeSwapsTotal = 0;
        modTracking.soilChangesTotal = 0;
        // Reset soil baseline so first soil read after ascension does not count as a change
        modTracking.previousSoilType = null;
        
        // Reset upgrades to unpurchased state for ascension
        // Achievements remain won (they persist across ascensions)
        var modUpgradeNames = getModUpgradeNames();
        modUpgradeNames.forEach(name => {
            if (Game.Upgrades[name]) {
                Game.Upgrades[name].bought = 0;
                // Note: We don't reset unlocked here because our custom unlock logic handles it
                // The upgrade will be visible if its unlock condition is met
            }
        });
    }
    
    // Handle reset - clear data on full reset
    function handleReset() {
        // Check if this is a full reset (not an ascension)
        if (!Game.OnAscend || Game.OnAscend === 0) {
            // This is a full reset - clear everything
            
            // Reset lifetime data
            lifetimeData = {
                reindeerClicked: 0,
                stockMarketAssets: 0,
                shinyWrinklersPopped: 0,
                wrathCookiesClicked: 0,
                totalGardenSacrifices: 0,
                totalCookieClicks: 0,
                wrinklersPopped: 0,
                elderCovenantToggles: 0,
                pledges: 0,
                gardenSacrifices: 0,
                godUsageTime: {}
            };
            
            // Reset achievements to unwon state
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
        return lifetimeData.totalGardenSacrifices || 0;
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
    
    // ===== MENU SYSTEM FUNCTIONS =====
    
    // Function to update menu buttons to reflect current settings
    function updateMenuButtons() {
        let buttons = document.querySelectorAll('#just-natural-expansion-settings .option');
        buttons.forEach(button => {
            let onclick = button.getAttribute('onclick');
            if (onclick) {
                let settingName = '';
                if (onclick.includes('shadowAchievements')) settingName = 'shadowAchievements';
                else if (onclick.includes('enableCookieUpgrades')) settingName = 'enableCookieUpgrades';
                else if (onclick.includes('enableBuildingUpgrades')) settingName = 'enableBuildingUpgrades';
                else if (onclick.includes('enableKittenUpgrades')) settingName = 'enableKittenUpgrades';
                
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
                    }
                    button.innerHTML = buttonText;
                    button.style.color = isEnabled ? 'lime' : 'red';
                }
            }
        });
    }
    
    // Toggle setting function
    function toggleSetting(settingName) {
        // Prevent rapid clicking
        if (toggleLock) { return; }
        
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
        }
        
        // Show confirmation prompt for major changes
        let message = '';
        let callback = '';
        
        if (settingName === 'shadowAchievements') {
            if (newState) {
                message = 'Enable shadow achievements?<br><small>All mod achievements will be moved to the shadow pool and will no longer grant milk or affect gameplay.</small>';
                callback = 'JustNaturalExpansionMod.applyShadowAchievementChange(true);';
            } else {
                message = 'Disable shadow achievements?<br><small>All mod achievements will be moved to the normal pool and will grant milk and affect gameplay. This will award the "Beyond the Leaderboard" shadow achievement to indicate you have left competition mode.</small>';
                callback = 'JustNaturalExpansionMod.applyShadowAchievementChange(false);';
            }
        } else if (settingName === 'enableCookieUpgrades' || settingName === 'enableBuildingUpgrades' || settingName === 'enableKittenUpgrades') {
            let upgradeType = settingName.replace('enable', '').replace('Upgrades', '');
            if (newState) {
                message = 'Enable ' + upgradeType + ' upgrades?<br><small>These upgrades will be added to the game and may affect your CPS and gameplay. This will award the "Beyond the Leaderboard" shadow achievement to indicate you have left competition mode.</small>';
                callback = 'JustNaturalExpansionMod.applyUpgradeChange("' + settingName + '", true);';
            } else {
                message = 'Disable ' + upgradeType + ' upgrades?<br><small>These upgrades will be removed from the game. Their purchase state will be remembered and will restore when turned back on.</small>';
                callback = 'JustNaturalExpansionMod.applyUpgradeChange("' + settingName + '", false);';
            }
        }
        
        if (message && callback) {
            // Check if "Beyond the leaderboard" has been won - if so, no need for warnings
            if (Game.Achievements['Beyond the Leaderboard'] && Game.Achievements['Beyond the Leaderboard'].won) {
                // Achievement already won, apply immediately without warning
                eval(callback);
            } else {
                // Show warning prompt
            showSettingsChangePrompt(message, callback);
            }
        } else {
            // For minor changes, apply immediately
            applySettingChange(settingName, newState);
        }
    }
    

    
    // Function to apply shadow achievement changes
    function applyShadowAchievementChange(enabled) {
        // Set lock to prevent rapid operations
        if (toggleLock) { return; }
        toggleLock = true;
        
        try {
        shadowAchievementMode = enabled;
        modSettings.shadowAchievements = enabled;
        
        // Update achievement pools
        updateAchievementPools();
        
        // Special handling for shadow achievements setting
        if (!enabled) {
            modSettings.hasUsedModOutsideShadowMode = true;
            
            // Award the "Beyond the Leaderboard" achievement if it exists and hasn't been won
            if (Game.Achievements['Beyond the Leaderboard'] && !Game.Achievements['Beyond the Leaderboard'].won) {
                markAchievementWon('Beyond the Leaderboard');
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
    function applyUpgradeChange(settingName, enabled) {
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
        }
        
        // Update modSettings for compatibility
        modSettings[settingName] = enabled;
        
        // Apply changes to the game
        if (enabled) {
                // Add upgrades back to the game
            addUpgradesToGame();
                
                // Restore bought states from toggle save data after upgrades are recreated
                setTimeout(() => {
                    var dataToUse = null;
                    
                    // Priority 1: Use toggle save data (for runtime toggles)
                    if (toggleSaveData[settingName] && Object.keys(toggleSaveData[settingName]).length > 0) {
                        dataToUse = toggleSaveData[settingName];
                    }
                    // Priority 2: Use deferred save data (for initial load)
                    else if (deferredSaveData && deferredSaveData.upgrades) {
                        dataToUse = deferredSaveData.upgrades;
                    }
                    
                    if (dataToUse) {
                        Object.keys(dataToUse).forEach(upgradeName => {
                            var savedBoughtState = dataToUse[upgradeName].bought || 0;
                            if (Game.Upgrades[upgradeName] && savedBoughtState > 0) {
                                Game.Upgrades[upgradeName].bought = savedBoughtState;
                            }
                        });
                        
                        // if (Game.CalculateGains) Game.CalculateGains(); // commented to reduce redundant recalc; rely on flags
                    } else {
                        
                    }
                }, 50);
                
        } else {
            // Remove only our mod's upgrades of the specific type that was disabled
            var upgradeNamesToRemove = [];
            
            if (settingName === 'enableCookieUpgrades') {
                upgradeNamesToRemove = cookieUpgradeNames;
            } else if (settingName === 'enableBuildingUpgrades') {
                upgradeNamesToRemove = buildingUpgradeNames;
            } else if (settingName === 'enableKittenUpgrades') {
                upgradeNamesToRemove = kittenUpgradeNames;
            }
            
                // SAVE CURRENT STATES before removing upgrades
                if (!toggleSaveData[settingName]) {
                    toggleSaveData[settingName] = {};
                }
                
                for (var i = 0; i < upgradeNamesToRemove.length; i++) {
                    var upgradeName = upgradeNamesToRemove[i];
                    if (Game.Upgrades[upgradeName]) {
                        var currentBought = Game.Upgrades[upgradeName].bought || 0;
                        toggleSaveData[settingName][upgradeName] = { bought: currentBought };
                        

                    }
                }
                
                // Remove the upgrades (and clear any in-memory record from UpgradesByPool clones)
            for (var i = 0; i < upgradeNamesToRemove.length; i++) {
                var upgradeName = upgradeNamesToRemove[i];
                if (Game.Upgrades[upgradeName]) {
                    // Remove from the main upgrades object
                    delete Game.Upgrades[upgradeName];
                    
                    // Also remove from upgrade pools if they exist
                    if (Game.UpgradesByPool) {
                        for (var poolName in Game.UpgradesByPool) {
                            var pool = Game.UpgradesByPool[poolName];
                            if (pool && Array.isArray(pool)) {
                                for (var j = pool.length - 1; j >= 0; j--) {
                                    if (pool[j] && pool[j].name === upgradeName) {
                                        pool.splice(j, 1);
                                    }
                                }
                            }
                        }
                    }
                        // Remove from Game.UpgradesById as well if present
                        if (Game.UpgradesById) {
                            for (var k = Game.UpgradesById.length - 1; k >= 0; k--) {
                                if (Game.UpgradesById[k] && Game.UpgradesById[k].name === upgradeName) {
                                    Game.UpgradesById.splice(k, 1);
                            }
                        }
                    }
                }
            }
            
            // Force store refresh using the game's own mechanisms (needed for toggle UX)
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            
            // Force menu update
            if (Game.UpdateMenu) { Game.UpdateMenu(); }
                // Debug status for specific upgrade after removal
            
        }
        
        // Force recalculation to apply/remove effects immediately
        setTimeout(() => {
            if (Game.CalculateGains) { Game.CalculateGains(); }
            if (Game.recalculateGains) { Game.recalculateGains = 1; }
        }, 100);
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        
            // Update UI and validate button state
            setTimeout(() => {updateMenuButtons(); validateToggleButtonState(settingName, enabled);}, 150);
            
            // Save settings (throttled)
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
        }
        
        // Also update modSettings for compatibility
        modSettings[settingName] = newState;
        
        // Check if we should mark "Beyond the Leaderboard" as won based on new settings
        checkAndMarkBeyondTheLeaderboard();
        
        // Update the button text and color instantly
        updateMenuButtons();
        
        // Save settings (throttled)
        requestModSave(false);
    }
    
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
                                <span style="font-weight:bold;">The ${modName} Mod</span> enhances Cookie Clicker's endgame without disrupting core gameplay, staying true to the spirit of the vanilla experience. It introduces over <span style="font-weight:bold;">450 achievements</span> and <span style="font-weight:bold;">250 upgrades</span>, all specifically designed for late-game progression—so early or mid-game players may not immediately notice changes upon installation. By default, the mod adds no upgrades and marks new achievements as shadow, allowing leaderboard-focused players to pursue extra challenges without affecting their current gameplay.
                                <br><br>
                                Players seeking bigger numbers and a richer late-game can enable Cookie, Kitten, and Building upgrades, and convert shadow achievements into regular ones, earning additional milk for their accomplishments. All new achievements are designed to be attainable, though some require significant effort. Thank you for playing—and if you enjoy the mod, please spread the word!
                            </div>
                            <div class="listing">
                                <a class="option" style="text-decoration:none;color:${shadowAchievementMode ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;" 
                                   onclick="JustNaturalExpansionMod.toggleSetting('shadowAchievements');">
                                    Shadow Achievements<br><b style="font-size:12px;">${shadowAchievementMode ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Shadow achievements do not grant milk or affect gameplay, suitable for competition play.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" style="text-decoration:none;color:${enableCookieUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;" 
                                   onclick="JustNaturalExpansionMod.toggleSetting('enableCookieUpgrades');">
                                    Cookie Upgrades<br><b style="font-size:12px;">${enableCookieUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Cookie upgrades add cookies which increase CPS when purchased.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" style="text-decoration:none;color:${enableBuildingUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;" 
                                   onclick="JustNaturalExpansionMod.toggleSetting('enableBuildingUpgrades');">
                                    Building Upgrades<br><b style="font-size:12px;">${enableBuildingUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Building upgrades add multipliers that affect specific buildings CPS.)</label>
                            </div>
                            <div class="listing">
                                <a class="option" style="text-decoration:none;color:${enableKittenUpgrades ? 'lime' : 'red'};width:130px;display:inline-block;margin-left:-5px;text-align:right;font-size:12px;" 
                                   onclick="JustNaturalExpansionMod.toggleSetting('enableKittenUpgrades');">
                                    Kitten Upgrades<br><b style="font-size:12px;">${enableKittenUpgrades ? 'ON' : 'OFF'}</b>
                                </a>
                                <label>(Kittens can be purchased after earning enough milk, they provide an overall boost to CPS.)</label>
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
                    
                    // Update buttons to reflect current settings
                    setTimeout(() => {
                        updateMenuButtons();
                    }, 10);
                }
            }
            
            // Handle stats menu injection
            if (Game.onMenu === 'stats') {
                let menuContainer = document.getElementById('menu');
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
                                return `<div class="listing"><b>${label}:</b> $${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</div>`;
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
                        'Shiny wrinklers bursted'
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
                        'Wrinklers bursted',
                        true
                    );
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
                    
                    modStatsDiv.innerHTML = `
                        <div class="title">${modName}</div>
                        <div id="statsMod">
                            <div class="listing"><b>Mod achievements unlocked:</b> ${modAchievementsUnlocked} / ${totalModAchievements}</div>
                            <div class="listing"><b>Mod upgrades purchased:</b> ${modUpgradesPurchased} / ${totalModUpgrades}</div>
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
    
    // Register all hooks in one place
    function registerAllHooks() {
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
                // Look for an active Frenzy buff
                for (var buffName in Game.buffs) {
                    var buff = Game.buffs[buffName];
                    if (buff && buff.name === 'Frenzy' && buff.time > 0) {
                        // Use the actual game FPS to calculate real values on the fly
                        var gameFps = Game.FPS || Game.fps || 30;
                        var requiredDurationSeconds = 600; // 10 minutes
                        var requiredDurationFrames = requiredDurationSeconds * gameFps;
                        
                        // Check if the buff's maxTime meets the 10-minute requirement
                        // maxTime represents the total duration when the buff was created/stacked
                        if (buff.maxTime >= requiredDurationFrames) {
                            markAchievementWon('Frenzy Marathon');
                            break;
                        }
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
        
        // Hook into Grimoire spell casting to track Spell Slinger achievement and FtHoF cookies
        // This runs when the Grimoire minigame is available
        if (Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame) {
            var originalCastSpell = Game.Objects['Wizard tower'].minigame.castSpell;
            if (originalCastSpell) {
                Game.Objects['Wizard tower'].minigame.castSpell = function(spell, obj) {
                    // Call the original function first to get the result
                    var result = originalCastSpell.call(this, spell, obj);
                    
                    // Only track successful spell casts (when result is true)
                    if (result === true) {
                        modTracking.spellCastTimes.push(Date.now());
                        
                        // Track FtHoF spell specifically
                        if (spell.name === 'Force the Hand of Fate') {
                            // FtHoF spell cast - next golden cookie will be forced
                        }
                    }
                    
                    // Return the original result
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
                    
                    if (debugMode) {
                        console.log('Just Natural Expansion: Successfully injected golden cookie effect modifiers');
                    }
                    
                    Game.shimmerTypes['golden']._effectInjected = true;
                } else if (debugMode) {
                    console.log('Just Natural Expansion: Could not find effectDurMod or mult variables in golden cookie popFunc');
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
                
                // Check if this was a wrath cookie
                if (me && me.wrath) {
                    modTracking.wrathCookiesClicked++;
                    // Also immediately save to lifetime data since game doesn't track this
                    lifetimeData.wrathCookiesClicked++;
                    if (debugMode) {
                        console.log('Just Natural Expansion: Wrath cookie clicked! Total current:', modTracking.wrathCookiesClicked, 'Total lifetime:', lifetimeData.wrathCookiesClicked);
                    }
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
                
                
                // Also immediately increment total garden sacrifices since game doesn't persist this
                lifetimeData.totalGardenSacrifices++;
                if (debugMode) {
                    console.log('Just Natural Expansion: Garden sacrifice! Total lifetime:', lifetimeData.totalGardenSacrifices);
                }
        
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
                        // Create injection code for all 11 kitten upgrades (0.005 = ~15.8% per kitten with current milk stats)
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
        
        console.log('=========================================');
        var totalHours = totalTime / (1000 * 60 * 60);
        console.log(`Total gods tracked: ${totalGods}`);
        console.log(`Total time across all gods: ${totalHours.toFixed(2)} hours`);
        console.log(`Average time per god: ${totalGods > 0 ? (totalHours / totalGods).toFixed(2) : '0.00'} hours`);
        
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
        'Improved Macaroons', 'Improved Empire biscuits', 'Improved Madeleines', 'Improved Palmiers', 'Improved Palets'
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
        'Robes with “character”', 'Familiar foster program', 'Council scroll stipends', 'Broom-sharing scheme', 
        'Retired cargo pods', 'Container co-op cards', 'Reusable launch crates', 'Autodocker apprentices', 
        'Route rebate vouchers', 'Free-trade cookie ports', 'Beaker buybacks', 'Philosopher\'s pebbles', 
        'Cool-running crucibles', 'Batch homunculi permits', 'Guild reagent rates', '“Mostly lead” gold grants', 
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
    
    // Sprite sheet loading system - load once, reference many times
    var spriteSheets = {
        custom: 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/customSpriteSheet.png',
        gardenPlants: 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png'
    };
    
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
        
        // Create achievement using the vanilla pattern
        var ach = new Game.Achievement(name, desc, finalIcon);
        
        // Ensure the achievement is properly initialized with vanilla properties
        ach.id = Game.AchievementsN;
        ach.name = name;
        ach.dname = name;
        ach.shortName = name; // Required for Game.Win notification
        ach.desc = desc;
        ach.baseDesc = desc;
        
        // Set basic properties
        ach.ddesc = desc;
        ach.desc = desc; // Ensure desc is set
      
        // Set achievement pool based on shadow mode setting
        if (shadowAchievementMode) {
            ach.pool = 'shadow';
            ach.order = order + 50000; // Add 50,000 to preserve relative ordering
        } else {
            ach.pool = 'normal';
            ach.order = order;
        }
        
        // Always start as not won - let save/load system handle won status
        ach.won = 0;
        ach.hide = 0;
        
        // Ensure achievement has all required properties for Game.Win
        ach.name = name; // Ensure name is set
        ach.icon = finalIcon; // Ensure icon is set
        ach.vanilla = false; // Mark as non-vanilla achievement
        
        // Add source text with mod icon and name
        var sourceText = '<div style="font-size:80%;text-align:center;">From <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div><div class="line"></div>';
        ach.ddesc = sourceText + ach.ddesc;
        
        // Store requirement function for checking
        if (requirement) {
            ach.requirement = requirement;
        }
        
        // Register with game systems
        Game.AchievementsById[Game.AchievementsN] = ach;
        Game.Achievements[name] = ach; // Also register by name for Game.Win to work
        ach.id = Game.AchievementsN; // Ensure achievement has proper ID
        Game.AchievementsN++;
        
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
    
    // Helper function to mark achievement as won from save data (no notification)
    function markAchievementWonFromSave(achievementName) {
        if (Game.Achievements[achievementName]) {
            // Always set to won when loading from save, regardless of current state
            Game.Achievements[achievementName].won = 1;
            
            // Also update the by-id version if it exists
            if (Game.AchievementsById[achievementName]) {
                Game.AchievementsById[achievementName].won = 1;
            }
            // No notification for achievements loaded from save
        }
    }
    
    // Helper function to mark achievement as won when newly earned (with notification)
    function markAchievementWon(achievementName) {
        if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
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
                    
                    // CRUCIAL: Force check of upgrade unlock conditions after achievement is won
            
                    setTimeout(function() {
                        // Check all Order upgrades for unlock condition changes
                        var orderUpgrades = [
                            'Order of the Golden Crumb',
                            'Order of the Impossible Batch', 
                            'Order of the Shining Spoon',
                            'Order of the Cookie Eclipse',
                            'Order of the Enchanted Whisk',
                            'Order of the Eternal Cookie'
                        ];
                        
                        var unlockChanged = false;
                        for (var i = 0; i < orderUpgrades.length; i++) {
                            var upgradeName = orderUpgrades[i];
                            var upgrade = Game.Upgrades[upgradeName];
                            
                            if (upgrade && upgrade.unlockCondition) {
                                var shouldUnlock = upgrade.unlockCondition();
                                var currentlyUnlocked = upgrade.unlocked;
                                
                                if (shouldUnlock && currentlyUnlocked !== 1) {
                                    upgrade.unlocked = 1;
                                    unlockChanged = true;
            
                                }
                            }
                        }
                        
                        // If any upgrades were unlocked, force store refresh
                        if (unlockChanged) {
        
                            Game.storeToRefresh = 1;
                            if (Game.RebuildUpgrades) {
                                Game.RebuildUpgrades();
                            }
                        }
                    }, 100); // Small delay to ensure achievement is fully processed
                    
                    // THEN rebuild upgrades to refresh the display with the updated unlock states
                    
                    if (Game.RebuildUpgrades) {
                        Game.RebuildUpgrades();
                        console.log('🔧 Game.RebuildUpgrades() completed');
                    } else {

                    }
                    
                    // Trigger a save to persist the achievement
                    if (Game.Write) {
                        debugLog('markAchievementWon: scheduling Game.Write');
                        setTimeout(() => {
                            debugLog('markAchievementWon: performing Game.Write');
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
        if (enableCookieUpgrades || enableBuildingUpgrades || enableKittenUpgrades || !shadowAchievementMode) {
            if (Game.Achievements['Beyond the Leaderboard'] && !Game.Achievements['Beyond the Leaderboard'].won) {
                Game.Achievements['Beyond the Leaderboard'].won = 1;
                
                // Mark that the mod has been used outside shadow mode
                modSettings.hasUsedModOutsideShadowMode = true;
                
                // Trigger notification if mod is initialized
                if (modInitialized) {
                    try {
                        Game.Win('Third-party');
                        Game.Win('Beyond the Leaderboard');
                        if (Game.updateAchievementsMenu) {
                            Game.updateAchievementsMenu();
                        }
                    } catch (e) {
                        console.error('❌ Error calling Game.Win for Beyond the Leaderboard:', e);
                    }
                }
                
                // Trigger a save to persist the achievement
                if (Game.Write) {
                    setTimeout(() => {
                        Game.Write('CookieClickerSave', Game.Write());
                    }, 100);
                }
            }
        }
    }
    
            // Function to dynamically add upgrades to the game
        function addUpgradesToGame() {
            if (!upgradeData || typeof upgradeData !== 'object') {
                console.error('Invalid upgradeData structure:', upgradeData);
                return;
            }
            
            try {
                // PRESERVE existing bought states before recreation
                var existingBoughtStates = {};
                var modUpgradeNames = getModUpgradeNames();
                modUpgradeNames.forEach(name => {
                    if (Game.Upgrades[name] && Game.Upgrades[name].bought > 0) {
                        existingBoughtStates[name] = Game.Upgrades[name].bought;
                        
                    }
                });
                
                // Create essential generics only if cookie upgrades are enabled; other categories respect toggles
                
                // Create essential generic upgrades FIRST (including "Box of improved cookies" that cookie upgrades depend on)
                if (enableCookieUpgrades && upgradeData.generic && Array.isArray(upgradeData.generic)) {
                    for (var i = 0; i < upgradeData.generic.length; i++) {
                        var upgradeInfo = upgradeData.generic[i];
                        
                        // Create essential upgrades immediately (like "Box of improved cookies")
                        if (upgradeInfo.name === 'Box of improved cookies' || 
                            upgradeInfo.name === 'Order of the Golden Crumb' ||
                            upgradeInfo.name === 'Order of the Impossible Batch' ||
                            upgradeInfo.name === 'Order of the Shining Spoon' ||
                            upgradeInfo.name === 'Order of the Cookie Eclipse' ||
                            upgradeInfo.name === 'Order of the Enchanted Whisk' ||
                            upgradeInfo.name === 'Order of the Eternal Cookie') {
                        createGenericUpgrade(upgradeInfo);
                        }
                    }
                }
            
            // Create cookie upgrades only if enabled
            if (enableCookieUpgrades && upgradeData.cookie && Array.isArray(upgradeData.cookie)) {

                for (var i = 0; i < upgradeData.cookie.length; i++) {
                    var upgradeInfo = upgradeData.cookie[i];
                    createCookieUpgrade(upgradeInfo);
                }
            }
            
            // Create building upgrades with order assignment only if enabled
            if (enableBuildingUpgrades) {
            // Building order starting values
            var buildingOrderStarts = {
                'Cursor': 151,
                'Grandma': 201,
                'Farm': 301,
                'Mine': 401,
                'Factory': 501,
                'Bank': 526,
                'Temple': 551,
                'Wizard tower': 576,
                'Shipment': 601,
                'Alchemy lab': 701,
                'Portal': 801,
                'Time machine': 901,
                'Antimatter condenser': 1001,
                'Prism': 1101,
                'Chancemaker': 1201,
                'Fractal engine': 1301,
                'Javascript console': 1401,
                'Idleverse': 1501,
                'Cortex baker': 1601,
                'You': 1701
            };
            
            // Helper function to determine if an upgrade is building-related
            function isBuildingRelatedUpgrade(upgradeInfo) {
                if (upgradeInfo.building) {
                    return upgradeInfo.building; // return the building name
                }
                
                // Check if it's a cost reduction upgrade for a building
                if (upgradeInfo.desc && upgradeInfo.unlockCondition) {
                    // Handle standard plural form: "Grandmas cost", "Cortex bakers cost", etc.
                    var descMatch = upgradeInfo.desc.match(/^([^s]+)s cost/);
                    // Special-case singular building name "You": "You cost"
                    if (!descMatch && /^You cost/.test(upgradeInfo.desc)) {
                        descMatch = ['You cost', 'You'];
                    }
                    if (descMatch) {
                        var buildingName = descMatch[1];
                        var unlockStr = upgradeInfo.unlockCondition.toString();
                        if (unlockStr.includes("Game.Objects['" + buildingName + "']")) {
                            return buildingName;
                        }
                    }
                }
                
                return null;
            }
            
            // Group ALL building-related upgrades by building and extract threshold for sorting
            var buildingGroups = {};
            
            // Process building upgrades
            if (upgradeData.building && Array.isArray(upgradeData.building)) {
                for (var i = 0; i < upgradeData.building.length; i++) {
                    var upgradeInfo = upgradeData.building[i];
                    var buildingName = upgradeInfo.building;
                    
                    if (!buildingGroups[buildingName]) {
                        buildingGroups[buildingName] = [];
                    }
                    
                    // Extract threshold from unlock condition
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
                        threshold: threshold,
                        type: 'building'
                    });
                }
            }
            
            // Process generic upgrades that are building-related
            if (upgradeData.generic && Array.isArray(upgradeData.generic)) {
                for (var i = 0; i < upgradeData.generic.length; i++) {
                    var upgradeInfo = upgradeData.generic[i];
                    var buildingName = isBuildingRelatedUpgrade(upgradeInfo);
                    
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
                    
                    if (buildingName) {
                        if (!buildingGroups[buildingName]) {
                            buildingGroups[buildingName] = [];
                        }
                        
                        // Extract threshold from unlock condition
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
                            threshold: threshold,
                            type: 'generic'
                        });
                    }
                }
            }
            
            // Sort each building group by threshold and assign orders
            for (var buildingName in buildingGroups) {
                if (buildingGroups.hasOwnProperty(buildingName)) {
                    var group = buildingGroups[buildingName];
                    
                    // Sort by threshold (lower thresholds first)
                    group.sort(function(a, b) {
                        return a.threshold - b.threshold;
                    });
                    
                    // Assign order values
                    var baseOrder = buildingOrderStarts[buildingName] || 2000; // fallback for unknown buildings
                    for (var j = 0; j < group.length; j++) {
                        var upgradeInfo = group[j].upgrade;
                        
                        // Skip Order of the X upgrades (preserve their existing order)
                        if (upgradeInfo.name && upgradeInfo.name.indexOf('Order of the') === 0) {
                            if (group[j].type === 'building') {
                    createBuildingUpgrade(upgradeInfo);
                            } else {
                                createGenericUpgrade(upgradeInfo);
                            }
                            continue;
                        }
                        
                        // Assign order: baseOrder + (j + 1) * 0.0001
                        upgradeInfo.order = baseOrder + ((j + 1) * 0.0001);
                        
                        // Create the upgrade using the appropriate function
                        if (group[j].type === 'building') {
                            createBuildingUpgrade(upgradeInfo);
                        } else {
                            createGenericUpgrade(upgradeInfo);
                        }
                    }
                }
            }
            } // end if enableBuildingUpgrades
            

            
            // Create kitten upgrades with order assignment only if enabled
            debugLog('createUpgrades: enableKittenUpgrades=', enableKittenUpgrades, 'kittenUpgradeData.length=', upgradeData.kitten ? upgradeData.kitten.length : 'undefined');
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
                
                // Assign order values starting at 20001.00001
                for (var j = 0; j < sortedKittenUpgrades.length; j++) {
                    var upgradeInfo = sortedKittenUpgrades[j].upgrade;
                    
                    // Assign order: 20001 + (j + 1) * 0.00001
                    upgradeInfo.order = 20001 + ((j + 1) * 0.00001);
                    
                    createKittenUpgrade(upgradeInfo);
                }
                debugLog('createUpgrades: created', sortedKittenUpgrades.length, 'kitten upgrades');
            }
            
            
            
            // Force recalculation to apply effects immediately
            setTimeout(() => {
                // if (Game.CalculateGains) { Game.CalculateGains(); } // commented; rely on core loop
                // if (Game.recalculateGains) { Game.recalculateGains = 1; }
                
                // Force store refresh using the game's own mechanisms
                Game.storeToRefresh = 1;
                Game.upgradesToRebuild = 1;
                if (Game.UpdateMenu) { Game.UpdateMenu(); }
            }, 100);
            
            // RESTORE preserved bought states after recreation
            Object.keys(existingBoughtStates).forEach(name => {
                if (Game.Upgrades[name]) {
                    Game.Upgrades[name].bought = existingBoughtStates[name];

                }
            });
            
            // INITIAL LOAD: Set correct bought states from save data
            if (deferredSaveData && deferredSaveData.upgrades) {
                Object.keys(deferredSaveData.upgrades).forEach(upgradeName => {
                    if (Game.Upgrades[upgradeName] && deferredSaveData.upgrades[upgradeName].bought > 0) {
                        Game.Upgrades[upgradeName].bought = deferredSaveData.upgrades[upgradeName].bought;

                    }
                });
            }
            
        } catch (e) {
            console.error('Error in addUpgradesToGame:', e);
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
    
    // Function to show confirmation prompt for major changes
    function showSettingsChangePrompt(message, callback) {
        Game.Prompt('<id SettingsChange><h3>Mod Settings Change</h3><div class="block">' + 
                   tinyIcon(modIcon) + '<div class="line"></div>' + 
                   message + '</div>', 
                   [['Yes', 'Game.ClosePrompt();' + callback, 'float:left'], 
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
    
    function createRequirementFunction(type, threshold) {
        return function() {
            try {
                switch(type) {
                    case 'cps':
                        return Game.cookiesPsRaw >= threshold;
                    case 'click':
                        // Special case for Click of the Titans achievement
                        if (threshold === "clickOfTitans") {
                            // This achievement is checked in real-time when cookies are clicked
                            return false; // Always false, achievement is awarded directly
                        }
                        return Game.handmadeCookies >= threshold;
                    case 'wrinkler':
                        return getLifetimeWrinklers() >= threshold;
                    case 'shinyWrinkler':
                        // Track shiny wrinklers popped (me.type==1)
                        return getLifetimeShinyWrinklers() >= threshold;
                    case 'goldenWrinkler':
                        // This achievement is awarded when a wrinkler worth 1 year of CPS is popped
                        // The achievement is checked in real-time when wrinklers are popped
                        return false; // Always false, achievement is awarded directly
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
                        // Calculate total buildings owned like vanilla does
                        var buildingsOwned = 0;
                        for (var i in Game.Objects) {
                            buildingsOwned += Game.Objects[i].amount;
                        }
                        return buildingsOwned >= threshold;
                    case 'everything':
                        // Check if every building type has at least the threshold amount
                        // Use the same approach as vanilla game
                        var minAmount = 100000;
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= threshold;
                  case 'seedlog':
                        var lifetimeGardenSacrifices = getLifetimeGardenSacrifices();
                        return lifetimeGardenSacrifices >= threshold;
                    case 'kittensOwned':
                        // Count kittens like vanilla does - check kitten upgrades owned
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
                        
                        // Count original kittens (vanilla kitten upgrades)
                        for (var i = 0; i < Game.UpgradesByPool['kitten'].length; i++) {
                            var kitten = Game.UpgradesByPool['kitten'][i];
                            if (Game.Has(kitten.name)) {
                                totalKittens++;
                            }
                        }
                        
                        // Count expansion kittens (mod kitten upgrades)
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
                            // Loss achievement - only check current run
                            if (!Game.Objects['Bank'].minigame) return false;
                            return Game.Objects['Bank'].minigame.profit <= threshold;
                        } else {
                            // Gain achievement - check lifetime total
                            var lifetimeStockMarket = getLifetimeStockMarketAssets();
                            return lifetimeStockMarket >= threshold;
                        }
                    case 'stockBrokers':
                        // Check if stockbrokers count meets threshold
                        if (!Game.Objects['Bank'].minigame) return false;
                        return (Game.Objects['Bank'].minigame.brokers || 0) >= threshold;
                    case 'theFinalChallenger':
                        // Check if threshold challenge achievements are won (uses centralized count function)
                        return countChallengeAchievements() >= threshold;
                    case 'butterBiscuit750':
                        // Check if every building type has at least 750
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 750;
                    case 'butterBiscuit800':
                        // Check if every building type has at least 800
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 800;
                    case 'butterBiscuit850':
                        // Check if every building type has at least 850
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 850;
                    case 'butterBiscuit900':
                        // Check if every building type has at least 900
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 900;
                    case 'butterBiscuit950':
                        // Check if every building type has at least 950
                        var minAmount = 100000; // Start with a very high number
                        for (var i in Game.Objects) {
                            minAmount = Math.min(Game.Objects[i].amount, minAmount);
                        }
                        return minAmount >= 950;
                    case 'butterBiscuit1000':
                        // Check if every building type has at least 1000
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
                        
                        // Check Valentine's condition
                        var valentinesComplete = Game.Has('Prism heart biscuits');
                        
                        return easterComplete && halloweenComplete && christmasComplete && valentinesComplete;
                    case 'hardercorest':
                        // Check basic eligibility first (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if 10 billion cookies baked with no clicks and no upgrades
                        if (Game.cookiesEarned < threshold) return false;
                        
                        // Check if no cookie clicks (or very minimal clicks)
                        if (Game.cookieClicks > 0) return false;
                        
                        // Check if no upgrades bought
                        if (Game.UpgradesOwned > 0) return false;
                        
                        return true;
                    case 'hardercorester':
                        // Check basic eligibility first (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if 1 billion cookies earned
                        if (Game.cookiesEarned < threshold) return false;
                        
                        // Check if no more than 15 cookie clicks
                        if (Game.cookieClicks > 15) return false;
                        
                        // Check if no more than 15 buildings owned
                        let totalBuildingsOwned = 0;
                        for (let buildingName in Game.Objects) {
                            totalBuildingsOwned += Game.Objects[buildingName].amount || 0;
                        }
                        if (totalBuildingsOwned > 15) return false;
                        
                        // Check if no more than 15 upgrades owned
                        if (Game.UpgradesOwned > 15) return false;
                        
                        // Check if no buildings have been sold
                        let totalBuildingsSold = 0;
                        for (let buildingName in Game.Objects) {
                            const building = Game.Objects[buildingName];
                            const bought = building.bought || 0;
                            const amount = building.amount || 0;
                            const sold = bought - amount;
                            totalBuildingsSold += Math.max(0, sold);
                        }
                        if (totalBuildingsSold > 0) return false;
                        
                        return true;
                    case 'cookieClicks':
                        return getLifetimeCookieClicks() >= threshold;
                    case 'pledges':
                        var lifetimePledges = getLifetimePledges();
                        return lifetimePledges >= threshold;
                    case 'buffs':
                        // Buff achievements are now checked in real-time via logic hook
                        // This is just a fallback for the general achievement system
                        if (threshold === 0) return false; // Frenzy frenzy is handled separately
                        return Object.keys(Game.buffs).length >= threshold;
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
                        // Check if reindeer was popped during specific season
                        // These achievements are handled by the seasonal reindeer tracking system
                        // The threshold is 1 (just need to pop one reindeer during the season)
                        return true; // Always return true as these are handled elsewhere
                    case 'sugarLumps':
                        // Check if sugar lumps count meets threshold
                        return (Game.lumps || 0) >= threshold;
                    case 'vanillaAchievements':
                        // Count vanilla achievements (only those with vanilla property set to 1, excluding shadow achievements)
                        var vanillaAchievementsOwned = 0;
                        for (var i in Game.AchievementsById) {
                            var me = Game.AchievementsById[i];
                            if (me.won && me.vanilla == 1 && me.pool != 'shadow') {
                                vanillaAchievementsOwned++;
                            }
                        }
                        return vanillaAchievementsOwned >= threshold;
                    case 'botanicalPerfection':
                        // Check if all 34 plant types are in mature stage simultaneously
                        if (!Game.Objects['Farm'] || !Game.Objects['Farm'].minigame) return false;
                        
                        var M = Game.Objects['Farm'].minigame;
                        var maturePlantTypes = {};
                        
                        // Check each plot for mature plants using M.plot (2D array)
                        if (M.plot) {
                            for (var y = 0; y < M.plot.length; y++) {
                                for (var x = 0; x < M.plot[y].length; x++) {
                                    var plotData = M.plot[y][x];
                                    if (plotData && plotData[0] > 0) {
                                        var plantId = plotData[0] - 1; // Plant IDs are 1-indexed
                                        var plantAge = plotData[1];
                                        var plant = M.plantsById[plantId];
                                        
                                        if (plant && plantAge >= plant.mature) {
                                            var plantName = plant.name;
                                            if (plantName && !maturePlantTypes[plantName]) {
                                                maturePlantTypes[plantName] = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Count unique mature plant types
                        var uniqueMatureTypes = Object.keys(maturePlantTypes).length;
                        
                        return uniqueMatureTypes >= threshold;
                    case 'templeSwaps':
                        // Check if temple swaps count meets threshold
                        if (threshold === 100) {
                            return (modTracking.templeSwapsTotal || 0) >= threshold;
                        } else if (threshold === 86400) {
                            // Check if all gods have been used for at least 24 hours
                            var allGodsUsed = true;
                            var requiredTime = 86400 * 1000; // 24 hours in milliseconds (since our tracking uses milliseconds)
                            
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
                            
                            return allGodsUsed;
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
                    case 'hardcoreFinalCountdown':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if any buildings have been sold
                        var countdownBuildingsSold = 0;
                        for (var buildingName in Game.Objects) {
                            var building = Game.Objects[buildingName];
                            var bought = building.bought || 0;
                            var amount = building.amount || 0;
                            var sold = bought - amount;
                            countdownBuildingsSold += Math.max(0, sold);
                        }
                        if (countdownBuildingsSold > 0) return false;
                        
                        // Define the exact building counts required (20 down to 1)
                        var requiredCounts = FINAL_COUNTDOWN_REQUIRED_COUNTS;
                        
                        // Check if each building has exactly the required amount
                        for (var buildingName in requiredCounts) {
                            var building = Game.Objects[buildingName];
                            if (!building || building.amount !== requiredCounts[buildingName]) {
                                return false;
                            }
                        }
                        
                        return true;
                    case 'hardcoreNoKittens':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if player has enough cookies per second
                        if ((Game.cookiesPsRaw || 0) < threshold) return false;
                        
                        // Check if any vanilla kitten upgrades have been bought
                        for (var i = 0; i < Game.UpgradesByPool['kitten'].length; i++) {
                            if (Game.Has(Game.UpgradesByPool['kitten'][i].name)) {
                                return false;
                            }
                        }
                        
                        // Check if any mod kitten upgrades have been bought
                        for (var i = 0; i < upgradeData.kitten.length; i++) {
                            var upgradeInfo = upgradeData.kitten[i];
                            if (Game.Has(upgradeInfo.name)) {
                                return false;
                            }
                        }
                        
                        return true;
                    case 'hardcoreNoGoldenCookies':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if player has baked enough cookies
                        if ((Game.cookiesEarned || 0) < threshold) return false;
                        
                        // Check if any golden cookies have been clicked (this run only)
                        if ((Game.goldenClicksLocal || 0) > 0) return false;
                        
                        return true;
                    case 'hardcoreCursorsAndGrandmas':
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if player has enough cookies per second
                        if ((Game.cookiesPsRaw || 0) < threshold) return false;
                        
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
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
                        if (!(Game.ascensionMode == 1 || Game.resets == 0)) return false;
                        
                        // Check if player has baked enough cookies
                        if ((Game.cookiesEarned || 0) < threshold) return false;
                        
                        // Check if any building has more than 5 of that type
                        for (var buildingName in Game.Objects) {
                            if ((Game.Objects[buildingName].amount || 0) > 5) {
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
                        // Check if in Born Again mode (challenge run or hasn't ascended yet)
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
                        // Check if CPS is 0 or negative (with wrinkler sucking)
                        var cpsCondition = (Game.cookiesPs <= 0) || (Game.cpsSucked >= 1);
                        if (!cpsCondition) return false;
                        
                        // Check if total buildings owned is more than 1000
                        var totalBuildings = 0;
                        for (var buildingName in Game.Objects) {
                            totalBuildings += (Game.Objects[buildingName].amount || 0);
                        }
                        if (totalBuildings <= 1000) return false;
                        
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
    
    // Achievement data structure
    var achievementData = {
        buildings: {
            cursor: {
                names: ["Carpal diem", "Hand over fist", "Finger guns", "Thumbs up, buttercup", "Pointer sisters", "Knuckle sandwich", "Phalanx formation", "Manual override", "Clickbaiter-in-chief", "With flying digits", "Palm before the storm"],
                thresholds: [1100, 1150, 1250, 1300, 1400, 1450, 1550, 1600, 1700, 1750, 1850],
                vanillaTarget: "A round of applause",
                customIcons: [[0, 20], [0, 21], [0, 25], [0, 26], [0, 27], [0, 29], [0, 35], [1, 71, getSpriteSheet('custom')], [1, 72, getSpriteSheet('custom')], [1, 56, getSpriteSheet('custom')], [1, 54, getSpriteSheet('custom')]]
            },
            'grandma': {
                names: ["Doughy doyenne", "Batter nana", "Crust custodian", "Oven oracle", "Whisk whisperer", "Proofing matriarch", "Rolling-pin regent", "Larder luminary", "Hearth highness", "Biscotti baroness", "Panjandrum of pastry"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "And now you're even older",
                customIcons: [[1, 20], [1, 21], [1, 25], [1, 26], [1, 27], [1, 29], [1, 35], [4, 71, getSpriteSheet('custom')], [4, 72, getSpriteSheet('custom')], [4, 56, getSpriteSheet('custom')], [4, 54, getSpriteSheet('custom')]]
            },
            'farm': {
                names: ["Till titan", "Mulch magnate", "Loam lord", "Furrow foreman", "Compost captain", "Acre archon", "Silo sovereign", "Bushel baron", "Seed syndicate", "Harvest high table", "Soil sultan supreme"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Au naturel",
                customIcons: [[2, 20], [2, 21], [2, 25], [2, 26], [2, 27], [2, 29], [2, 35], [5, 71, getSpriteSheet('custom')], [5, 72, getSpriteSheet('custom')], [5, 56, getSpriteSheet('custom')], [5, 54, getSpriteSheet('custom')]]
            },
            'mine': {
                names: ["Vein viceroy", "Shaft superintendent", "Bedrock baron", "Lantern lord", "Ore orchestrator", "Strata strategist", "Pit prefect", "Pickaxe paragon", "Gravel governor", "Fault-line foreman", "Core sample czar"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Dirt-rich",
                customIcons: [[3, 20], [3, 21], [3, 25], [3, 26], [3, 27], [3, 29], [3, 35], [6, 71, getSpriteSheet('custom')], [6, 72, getSpriteSheet('custom')], [6, 56, getSpriteSheet('custom')], [6, 54, getSpriteSheet('custom')]]
            },
            'factory': {
                names: ["Gear grandee", "Conveyor commissioner", "Sprocket sovereign", "Blueprint boss", "Forge forecaster", "Lathe luminary", "Press primarch", "QA queen", "Throughput theocrat", "Assembly autarch", "Production paramount"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Bots build bots",
                customIcons: [[4, 20], [4, 21], [4, 25], [4, 26], [4, 27], [4, 29], [4, 35], [7, 71, getSpriteSheet('custom')], [7, 72, getSpriteSheet('custom')], [7, 56, getSpriteSheet('custom')], [7, 54, getSpriteSheet('custom')]]
            },
            'bank': {
                names: ["Ledger luminary", "Vault vanguard", "Interest idol", "Bond baron", "Hedge high priest", "Dividend duke", "Capital chancellor", "Liquidity laureate", "Spread sovereign", "Reserve regent", "Seigniorage supreme"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Getting that bag",
                customIcons: [[15, 20], [15, 21], [15, 25], [15, 26], [15, 27], [15, 29], [15, 35], [8, 71, getSpriteSheet('custom')], [8, 72, getSpriteSheet('custom')], [8, 56, getSpriteSheet('custom')], [8, 54, getSpriteSheet('custom')]]
            },
            'temple': {
                names: ["Biscuit beatified", "Piety pâtissier", "Relic ringmaster", "Canticle captain", "Pilgrim provost", "Parable patriarch", "Litany laureate", "Censer sentinel", "Basilica bigwig", "Tithe tsar", "Beatific baker"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "The leader is good, the leader is great",
                customIcons: [[16, 20], [16, 21], [16, 25], [16, 26], [16, 27], [16, 29], [16, 35], [9, 71, getSpriteSheet('custom')], [9, 72, getSpriteSheet('custom')], [9, 56, getSpriteSheet('custom')], [9, 54, getSpriteSheet('custom')]]
            },
            'wizard tower': {
                names: ["Rune registrar", "Hex headmaster", "Sigil steward", "Scroll shepherd", "Wand warden", "Cauldron chancellor", "Thaumaturge tribune", "Cantrip curator", "Leyline lord", "Familiar field marshal", "Archwizard emeritus"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "You don't think they could've used... it couldn't have been ma-",
                customIcons: [[17, 20], [17, 21], [17, 25], [17, 26], [17, 27], [17, 29], [17, 35], [10, 71, getSpriteSheet('custom')], [10, 72, getSpriteSheet('custom')], [10, 56, getSpriteSheet('custom')], [10, 54, getSpriteSheet('custom')]]
            },
            'shipment': {
                names: ["Manifest maestro", "Hull highlord", "Dockyard director", "Orbital outfitter", "Freight field marshal", "Warpway warden", "Cargo cartographer", "Starport sahib", "Payload patriarch", "Customs czar", "Interstellar impresario"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Signed, sealed, delivered",
                customIcons: [[5, 20], [5, 21], [5, 25], [5, 26], [5, 27], [5, 29], [5, 35], [11, 71, getSpriteSheet('custom')], [11, 72, getSpriteSheet('custom')], [11, 56, getSpriteSheet('custom')], [11, 54, getSpriteSheet('custom')]]
            },
            'alchemy lab': {
                names: ["Alembic adjudicator", "Crucible custodian", "Reagent regent", "Retort ringleader", "Tincture tycoon", "Catalyst chancellor", "Elixir elder", "Precipitate prefect", "Distillate duke", "Sublimate sovereign", "Magnum opus magnate"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Sugar, spice, and everything nice",
                customIcons: [[6, 20], [6, 21], [6, 25], [6, 26], [6, 27], [6, 29], [6, 35], [12, 71, getSpriteSheet('custom')], [12, 72, getSpriteSheet('custom')], [12, 56, getSpriteSheet('custom')], [12, 54, getSpriteSheet('custom')]]
            },
            'portal': {
                names: ["Gate gauger", "Rift rector", "Threshold thaum", "Liminal lawgiver", "Tesseract trustee", "Nth-entrance envoy", "Event-horizon emir", "Portal provost", "Keymaster kingpin", "Waystone warden", "Multidoor magistrate"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Not even remotely close to Kansas anymore",
                customIcons: [[7, 20], [7, 21], [7, 25], [7, 26], [7, 27], [7, 29], [7, 35], [13, 71, getSpriteSheet('custom')], [13, 72, getSpriteSheet('custom')], [13, 56, getSpriteSheet('custom')], [13, 54, getSpriteSheet('custom')]]
            },
            'time machine': {
                names: ["Tick-tock trustee", "Chrono chieftain", "Paradox provost", "Epoch executor", "Aeon alderman", "Timeline tactician", "Loop legislator", "Era eminence", "Causality constable", "Continuum custodian", "Grandfather-clause governor"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "I only meant to stay a while",
                customIcons: [[8, 20], [8, 21], [8, 25], [8, 26], [8, 27], [8, 29], [8, 35], [14, 71, getSpriteSheet('custom')], [14, 72, getSpriteSheet('custom')], [14, 56, getSpriteSheet('custom')], [14, 54, getSpriteSheet('custom')]]
            },
            'antimatter condenser': {
                names: ["Vacuum vicar", "Negamass nabob", "Quark quartermaster", "Hadron high bailiff", "Singularity steward", "Boson baron", "Lepton lieutenant", "Isotope imperator", "Reactor regnant", "Nullspace notary", "Entropy esquire"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Not 20 years away forever",
                customIcons: [[13, 20], [13, 21], [13, 25], [13, 26], [13, 27], [13, 29], [13, 35], [15, 71, getSpriteSheet('custom')], [15, 72, getSpriteSheet('custom')], [15, 56, getSpriteSheet('custom')], [15, 54, getSpriteSheet('custom')]]
            },
            'prism': {
                names: ["Photon prefect", "Spectrum superintendent", "Refraction regent", "Rainbow registrar", "Lumen laureate", "Prism prelate", "Chromatic chancellor", "Beam baronet", "Halo highlord", "Diffraction duke", "Radiance regnant"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Bright side of the Moon",
                customIcons: [[14, 20], [14, 21], [14, 25], [14, 26], [14, 27], [14, 29], [14, 35], [16, 71, getSpriteSheet('custom')], [16, 72, getSpriteSheet('custom')], [16, 56, getSpriteSheet('custom')], [16, 54, getSpriteSheet('custom')]]
            },
            'chancemaker': {
                names: ["Odds officer", "Fortune foreman", "Serendipity superintendent", "Gambit governor", "Probability provost", "Fate facilitator", "Draw director", "Jackpot jurist", "Pips preceptor", "Stochastic sovereign", "Luck laureate"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Riding the Mersenne twister",
                customIcons: [[19, 20], [19, 21], [19, 25], [19, 26], [19, 27], [19, 29], [19, 35], [19, 35], [19, 35], [19, 35], [19, 35]]
            },
            'fractal engine': {
                names: ["Mandel monarch", "Koch kingpin", "Cantor custodian", "Julia jurist", "Sierpiński steward", "Iteration imperator", "Recursion regent", "Self-similarity sheriff", "Pattern praetor", "Infinite indexer", "Depth-first demigod"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Divide and conquer",
                customIcons: [[20, 20], [20, 21], [20, 25], [20, 26], [20, 27], [20, 29], [20, 35], [20, 35], [20, 35], [20, 35], [20, 35]]
            },
            'javascript console': {
                names: ["Lint lord", "Closure captain", "Async archon", "Promise prelate", "Scope sovereign", "Hoist highness", "Node notable", "Regex regent", "Bundle baron", "Sandbox seer", "Runtime regnant"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Pebcakes",
                customIcons: [[32, 20], [32, 21], [32, 25], [32, 26], [32, 27], [32, 29], [32, 35], [32, 35], [32, 35], [32, 35], [32, 35]]
            },
            'idleverse': {
                names: ["Multiverse marshal", "Replica rector", "Shard shepherd", "Universe underwriter", "Realm regent", "Cosmos comptroller", "Omniverse ombuds", "Dimension director", "Reality registrar", "Plane provost", "Horizon high steward"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Greener on the other sides",
                customIcons: [[33, 20], [33, 21], [33, 25], [33, 26], [33, 27], [33, 29], [33, 35], [33, 35], [33, 35], [33, 35], [33, 35]]
            },
            'cortex baker': {
                names: ["Synapse superintendent", "Cortex commissioner", "Gyrus governor", "Lobe luminary", "Neuron notable", "Axon adjudicator", "Myelin magistrate", "Thalamus thegn", "Cerebellum chancellor", "Prefrontal prelate", "Mind monarch"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Where is my mind",
                customIcons: [[34, 20], [34, 21], [34, 25], [34, 26], [34, 27], [34, 29], [34, 35], [34, 35], [34, 35], [34, 35], [34, 35]]
            },
            'You': {
                names: ["Me manager", "Doppel director", "Mirror minister", "Clone commissioner", "Copy chieftain", "Echo executor", "Facsimile foreman", "Reflection regent", "Duplicate duke", "Replica regnant", "Self supreme"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                vanillaTarget: "Introspection",
                customIcons: [[35, 20], [35, 21], [35, 25], [35, 26], [35, 27], [35, 29], [35, 35], [35, 35], [35, 35], [35, 35], [35, 35]]
            }
        },
        other: {
            cps: {
                names: ["Beyond the speed of dough", "Speed of sound", "Speed of light", "Faster than light", "Speed of thought", "Faster than speed of thought"],
                thresholds: [1e57, 1e58, 1e59, 1e60, 1e61, 1e62],
                descs: ["Bake <b>1 octodecillion</b> per second.", "Bake <b>10 octodecillion</b> per second.", "Bake <b>100 octodecillion</b> per second.", "Bake <b>1 novemdecillion</b> per second.", "Bake <b>10 novemdecillion</b> per second.", "Bake <b>100 novemdecillion</b> per second."],
                vanillaTarget: "Speed's the name of the game (no it's not it's called Cookie Clicker)",
                customIcons: [[73, 0, getSpriteSheet('custom')], [73, 1, getSpriteSheet('custom')], [73, 2, getSpriteSheet('custom')], [73, 3, getSpriteSheet('custom')], [73, 4, getSpriteSheet('custom')], [73, 5, getSpriteSheet('custom')]]
            },
            click: {
                names: ["Click god", "Click emperor", "Click overlord", "Click sovereign", "Click monarch", "Click deity supreme", "Click deity ultimate", "Click deity transcendent", "Click of the Titans"],
                thresholds: [1e63, 1e69, 1e75, 1e81, 1e87, 1e93, 1e99, 1e105, "clickOfTitans"],
                descs: ["Make <b>1 vigintillion</b> from clicking.", "Make <b>1 duovigintillion</b> from clicking.", "Make <b>1 quattuorvigintillion</b> from clicking.", "Make <b>1 sexvigintillion</b> from clicking.", "Make <b>1 octovigintillion</b> from clicking.", "Make <b>1 trigintillion</b> from clicking.", "Make <b>1 duotrigintillion</b> from clicking.", "Make <b>1 quattuortrigintillion</b> from clicking.", "Generate <b>1 year of raw CPS</b> in a single cookie click.<q>One click to rule them all!</q>"],
                vanillaTarget: "What's not clicking",
                customIcons: [[0, 39, getSpriteSheet('custom')], [0, 40, getSpriteSheet('custom')], [0, 41, getSpriteSheet('custom')], [0, 42, getSpriteSheet('custom')], [0, 48, getSpriteSheet('custom')], [0, 74, getSpriteSheet('custom')], [0, 57, getSpriteSheet('custom')], [0, 54, getSpriteSheet('custom')], [32, 4]]
            },
            wrinkler: {
                names: ["Wrinkler annihilator", "Wrinkler eradicator", "Wrinkler extinction event", "Wrinkler apocalypse", "Wrinkler armageddon"],
                thresholds: [666, 2666, 6666, 16666, 26666],
                descs: ["Burst <b>666 wrinklers</b> across all ascensions.<q>Pop goes the creepy.</q>", "Burst <b>2,666 wrinklers</b> across all ascensions.<q>That wasn't cream filling.</q>", "Burst <b>6,666 wrinklers</b> across all ascensions.<q>If it wrinkles, you pop it.</q>", "Burst <b>16,666 wrinklers</b> across all ascensions.<q>So much juice. So little remorse.</q>", "Burst <b>26,666 wrinklers</b> across all ascensions.<q>One squish closer to immortality.</q>"],
                vanillaTarget: "Moistburster",
                customIcons: [[48, 63, getSpriteSheet('custom')], [48, 62, getSpriteSheet('custom')], [48, 61, getSpriteSheet('custom')], [48, 60, getSpriteSheet('custom')], [48, 59, getSpriteSheet('custom')]]
            },
            goldenWrinkler: {
                names: ["Golden wrinkler"],
                thresholds: [210000000], // 6.66 years in seconds (6.66 * 365.25 * 24 * 60 * 60)
                descs: ["Burst a wrinkler worth <b>6.66 years of CPS</b>.<q>That's not cream filling, that's a retirement fund!</q>"],
                vanillaTarget: "Moistburster",
                customIcons: [[48, 76, getSpriteSheet('custom')]]
            },
            shinyWrinkler: {
                names: ["Rare specimen collector", "Endangered species hunter", "Extinction event architect"],
                thresholds: [2, 5, 10],
                descs: ["Burst <b>2 shiny wrinklers</b> across all ascensions.<q>You're a monster, do you know that?</q>", "Burst <b>5 shiny wrinklers</b> across all ascensions.<q>You really have to stop here, there arent many of these left in the world.</q>", "Burst <b>10 shiny wrinklers</b> across all ascensions.<q>People like you are evil, no one will ever see another one of these, you ruined it for everyone.</q>"],
                vanillaTarget: "Last Chance to See",
                customIcons: [[48, 0, getSpriteSheet('custom')], [48, 71, getSpriteSheet('custom')], [48, 66, getSpriteSheet('custom')]]
            },
            reindeer: {
                names: ["Reindeer destroyer", "Reindeer obliterator", "Reindeer extinction event", "Reindeer apocalypse"],
                thresholds: [500, 1000, 2000, 5000],
                descs: ["Pop <b>500 reindeer</b> across all ascensions.<q>You are become Claus, destroyer of hooves.</q>", "Pop <b>1,000 reindeer</b> across all ascensions.<q>That one had a red nose…</q>", "Pop <b>2,000 reindeer</b> across all ascensions.<q>Comet, Vixen, Toasted.</q>", "Pop <b>5,000 reindeer</b> across all ascensions.<q>Legends say the sky still smells like cinnamon and regret.</q>"],
                vanillaTarget: "Reindeer sleigher",
                customIcons: [[50, 5, getSpriteSheet('custom')], [50, 72, getSpriteSheet('custom')], [50, 37, getSpriteSheet('custom')], [50, 38, getSpriteSheet('custom')]]
            },
            goldenCookies: {
                names: ["Black cat's other paw", "Black cat's third paw", "Black cat's fourth paw", "Black cat's fifth paw", "Black cat's sixth paw", "Black cat's seventh paw"],
                thresholds: [17777, 37777, 47777, 57777, 67777, 77777],
                descs: ["Click <b>17,777 golden cookies</b> across all ascensions.", "Click <b>37,777 golden cookies</b> across all ascensions.", "Click <b>47,777 golden cookies</b> across all ascensions.", "Click <b>57,777 golden cookies</b> across all ascensions.", "Click <b>67,777 golden cookies</b> across all ascensions.", "Click <b>77,777 golden cookies</b> across all ascensions."],
                vanillaTarget: "Black cat's paw",
                customIcons: [[20, 33], [30, 6], [27, 6], [18, 37, getSpriteSheet('custom')], [21, 33], [25, 7]]
            },
            spell: {
                names: ["Archwizard", "Spellmaster", "Cookieomancer", "Spell lord", "Magic emperor", "Sweet Sorcery"],
                thresholds: [1999, 2999, 3999, 4999, 9999, "freeSugarLump"],
                descs: ["Cast <b>1,999</b> spells across all ascensions.", "Cast <b>2,999</b> spells across all ascensions.", "Cast <b>3,999</b> spells across all ascensions.", "Cast <b>4,999</b> spells across all ascensions.", "Cast <b>9,999</b> spells across all ascensions.", "Get the <b>Free Sugar Lump</b> outcome from a magically spawned golden cookie.<q>Sweet sorcery indeed!</q>"],
                vanillaTarget: "A wizard is you",
                customIcons: [[22, 12], [43, 0, getSpriteSheet('custom')], [52, 0, getSpriteSheet('custom')], [28, 12], [27, 12], [47, 0, getSpriteSheet('custom')]]
            },
            templeSwaps: {
                names: ["Faithless Loyalty", "God of All Gods"],
            thresholds: [100, 86400], // 100 temple swaps, 24 hours (86400 seconds) per god
            descs: ["Swap gods in the Pantheon <b>100 times</b> in one ascension.<q>You know you cant just pick a religion to suit your mood for the day right?</q>", "Use each pantheon god for at least <b>24 hours</b> total across all ascensions.<q>Variety is the spice of divine life</q>"],
            vanillaTarget: "A wizard is you",
            customIcons: [[21, 18], [22, 18]]
        },
            gardenHarvest: {
                names: ["Greener, aching thumb", "Greenest, aching thumb", "Photosynthetic prodigy", "Garden master", "Plant whisperer"],
                thresholds: [2000, 3000, 5000, 7500, 10000],
                descs: ["Harvest <b>2,000</b> mature garden plants across all ascensions.", "Harvest <b>3,000</b> mature garden plants across all ascensions.", "Harvest <b>5,000</b> mature garden plants across all ascensions.", "Harvest <b>7,500</b> mature garden plants across all ascensions.", "Harvest <b>10,000</b> mature garden plants across all ascensions."],
                vanillaTarget: "Green, aching thumb",
                // Use the Spiced Cookies pattern: [x, y, spriteSheetURL]
                customIcons: [[4, 2, getSpriteSheet('gardenPlants')], [4, 10, getSpriteSheet('gardenPlants')], [4, 17, getSpriteSheet('gardenPlants')], [4, 18, getSpriteSheet('gardenPlants')], [4, 19, getSpriteSheet('gardenPlants')]]
            },
            cookiesAscension: {
                names: ["The Doughpocalypse", "The Flour Flood", "The Ovenverse", "The Crumb Crusade", "The Final Batch", "The Ultimate Ascension", "The Transcendent Rise"],
                thresholds: [1e73, 1e75, 1e77, 1e79, 1e81, 1e83, 1e85],
                descs: ["Bake <b>10 trevigintillion</b> cookies in one ascension.", "Bake <b>1 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>100 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>10 quinvigintillion</b> cookies in one ascension.", "Bake <b>1 sexvigintillion</b> cookies in one ascension.", "Bake <b>100 sexvigintillion</b> cookies in one ascension.", "Bake <b>10 septenvigintillion</b> cookies in one ascension."],
                vanillaTarget: "And a little extra",
                customIcons: [[73, 0, getSpriteSheet('custom')], [73, 1, getSpriteSheet('custom')], [73, 2, getSpriteSheet('custom')], [73, 3, getSpriteSheet('custom')], [73, 4, getSpriteSheet('custom')], [73, 5, getSpriteSheet('custom')], [73, 6, getSpriteSheet('custom')]]
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
                customIcons: [[20, 39, getSpriteSheet('custom')], [20, 47, getSpriteSheet('custom')], [20, 48, getSpriteSheet('custom')]]
            },
            buildingsSold: {
                names: ["Asset Liquidator", "Flip City", "Ghost Town Tycoon"],
                thresholds: [10000, 25000, 50000],
                descs: ["Sell <b>10,000 buildings</b> in one ascension.<q>A thousand dreams bulldozed for a golden cookie.</q>", "Sell <b>25,000 buildings</b> in one ascension.<q>Your economic model is just 'wreck and repeat.'</q>", "Sell <b>50,000 buildings</b> in one ascension.<q>You called it 'liquidating assets.' They called it 'eviction.'</q>"],
                vanillaTarget: "Myriad",
                customIcons: [[28, 26], [15, 9], [32, 33]]
            },
            everything: {
                names: ["Septcentennial and a half", "Octcentennial", "Octcentennial and a half", "Nonacentennial", "Nonacentennial and a half", "Millennial"],
                thresholds: [750, 800, 850, 900, 950, 1000],
                descs: ["Have at least <b>750 of everything</b>.", "Have at least <b>800 of everything</b>.", "Have at least <b>850 of everything</b>.", "Have at least <b>900 of everything</b>.", "Have at least <b>950 of everything</b>.", "Have at least <b>1,000 of everything</b>."],
                vanillaTarget: "Septcentennial",
                customIcons: [[21, 74, getSpriteSheet('custom')], [21, 75, getSpriteSheet('custom')], [21, 76, getSpriteSheet('custom')], [21, 77, getSpriteSheet('custom')], [21, 78, getSpriteSheet('custom')], [21, 79, getSpriteSheet('custom')]]
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
                descs: ["Own all <b>18 kittens</b> original kittens.", "Own all <b>18 original kittens</b> and all <b>11 expansion kittens</b> at once.<q>Okay thats really just too many cats</q>"],
                vanillaTarget: "Jellicles",
                customIcons: [[18, 14], [18, 13]]
            },
            reincarnate: {
                names: ["Ascension master", "Ascension legend", "Ascension deity"],
                thresholds: [250, 500, 999],
                descs: ["Ascend <b>250 times</b>.", "Ascend <b>500 times</b>.", "Ascend <b>999 times</b>."],
                vanillaTarget: "Reincarnation",
                customIcons: [[42, 76, getSpriteSheet('custom')], [42, 60, getSpriteSheet('custom')], [42, 59, getSpriteSheet('custom')]]
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
                customIcons: [[50, 73, getSpriteSheet('custom')], [50, 14, getSpriteSheet('custom')], [50, 19, getSpriteSheet('custom')], [50, 71, getSpriteSheet('custom')]]
            },
            gardenSeedsTime: {
                names: ["I feel the need for seed"],
                thresholds: [5 * 24 * 60 * 60 * 1000], // 5 days in milliseconds
                descs: ["Unlock all garden seeds within <b>5 days</b> of your last garden sacrifice. Look this one is tricky, if you reload or load a save the 5 day timer is invalidated, so you cant load in a completed garden."],
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
            thresholds: [1e10], // 10 billion cookies
            descs: ["Bake <b>10 billion cookies</b> with no cookie clicks and no upgrades bought in Born Again mode.<q>Do you hate me or yourself after that one?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[13, 6]]
        },
                    hardercorester: {
            names: ["Hardercorest-er"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> with no more than 15 clicks, no more than 15 buildings (no selling), and no more than 15 upgrades in Born Again mode.<q>Bet you thought that wouldn't be as bad as it was eh?</q>"],
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
            descs: ["Have one of every type of plant in the mature stage at once.<q>I have become the plants now, I am the master of the garden, bow before my hoe.</q>", "Harvest <b>12 mature Duketaters</b> simultaneously.<q>Timing your salad is everything otherwise the mayo goes bad and you kill all your friends</q>"],
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
            descs: ["Click on the news ticker <b>1,000 times</b> in one ascension.<q>Hey dummy you are clicking on the wrong thing</q>"],
            vanillaTarget: "Stifling the press"
        },
        wrathCookies: {
            names: ["Warm-Up Ritual", "Deal of the Slightly Damned", "Baker of the Beast"],
            thresholds: [66, 666, 6666], // Wrath cookie clicks
            descs: ["Click <b>66 wrath cookies</b> across all ascensions.", "Click <b>666 wrath cookies</b> across all ascensions.", "Click <b>6,666 wrath cookies</b> across all ascensions."],
            vanillaTarget: "Wrath cookie"
        },
        goldenCookieTime: {
            names: ["Second Life, First Click"],
            thresholds: [120 * 1000], // 120 seconds in milliseconds
            descs: ["Click a golden cookie within <b>120 seconds</b> of ascending."],
            vanillaTarget: "Fading luck",
            customIcons: [[12, 14]]
        },
        wrinklerTime: {
            names: ["Wrinkler Rush"],
            thresholds: [930 * 1000], // 930 seconds (15 minutes 30 seconds) in milliseconds
            descs: ["Pop a wrinkler within <b>15 minutes and 30 seconds</b> of ascending.<q>The Grandmatriarchs barely had time to wake up!</q>"],
            vanillaTarget: "Moistburster",
            customIcons: [[48, 62, getSpriteSheet('custom')]]
        },
        wrinklerBankDouble: {
            names: ["Wrinkler Windfall"],
            thresholds: [6], // 6x bank value (sextupled)
            descs: ["Sextuple your bank with a single wrinkler pop.<q>Talk about a return on investment!</q>"],
            vanillaTarget: "Moistburster",
            customIcons: [[48, 78, getSpriteSheet('custom')]]
        },
        hardcoreNoHeavenly: {
            names: ["We don't need no heavenly chips"],
            thresholds: [500], // 500 of every building
            descs: ["Own at least <b>500 of every building type</b>, without owning the 'Heavenly chip secret' upgrade.<q>Well that was a little different wasn't it?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[12, 7]]
        },
        hardcoreFinalCountdown: {
            names: ["The Final Countdown"],
            thresholds: [1], // Just a placeholder, we'll check exact counts in the requirement function
            descs: ["Own exactly 20 Cursors, 19 Grandmas, 18 Farms, yada yada yada, down to 1 You. No selling or sacrificing any buildings. Must be earned in Born Again mode.<q>Is that song stuck in your head now, its pretty catchy</q>"],
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
            thresholds: [1e15], // 1 quadrillion cookies
            descs: ["Bake <b>1 quadrillion cookies</b> without ever clicking a golden cookie, must be done in Born Again mode.<q>Patience is its own buff.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 66, getSpriteSheet('custom')]]
        },
        hardcoreCursorsAndGrandmas: {
            names: ["Back to Basic Bakers"],
            thresholds: [1e9], // 1 billion cookies per second
            descs: ["Reach <b>1 billion cookies per second</b> using only Cursors and Grandmas (no other buildings), must be done in Born Again mode.<q>Turns out Grandma really is the backbone of the empire.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 69, getSpriteSheet('custom')]]
        },
        hardcoreModestPortfolio: {
            names: ["Modest Portfolio"],
            thresholds: [1e15], // 1 quadrillion cookies
            descs: ["Reach <b>1 quadrillion cookies</b> without ever owning more than 5 of any building type (no selling), must be done in Born Again mode.<q>Breadth over depth.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 68, getSpriteSheet('custom')]]
        },
        hardcoreDifficultDecisions: {
            names: ["Difficult Decisions"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> without ever having more than <b>25 combined upgrades or buildings</b> at any given time, must be done in Born Again mode.<q>Some decisions leave no right answer, only consequences.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 10, getSpriteSheet('custom')]]
        },
        hardcoreLaidInPlainSight: {
            names: ["Laid in Plain Sight"],
            thresholds: [10], // 10 cookies per second
            descs: ["Bake <b>10 cookies per second</b> without purchasing any buildings, must be done in Born Again mode.<q>Eggsactly where you weren't looking!</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 25, getSpriteSheet('custom')]]
        },
        hardcorePrecisionNerd: {
            names: ["Precision Nerd"],
            thresholds: [1234567890], // Exactly 1,234,567,890 cookies
            descs: ["Have exactly <b>1234567890 cookies</b> in your bank and hold it for <b>60 seconds</b>.<q>Last night's 'Itchy & Scratchy' was, without a doubt, the worst episode ever. Rest assured I was on the Internet within minutes registering my disgust throughout the world.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[23, 9, getSpriteSheet('custom')]]
        },
        hardcoreTreadingWater: {
            names: ["Treading water"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Have a CPS of 0 while owning more than 1000 buildings with no active buffs or debuffs.<q>Sometimes it really feels like your just not being very productive here</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[49, 10, getSpriteSheet('custom')]]
        },
        hardcoreBouncingLastCheque: {
            names: ["Bouncing the last cheque"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Reach less than 10 cookies in your bank after having at least 1 million cookies.<q>The very last cheque I write in my life I want to bounce</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[49, 25, getSpriteSheet('custom')]]
        },
        hardcoreMassiveInheritance: {
            names: ["Massive Inheritance"],
            thresholds: [0],
            descs: ["Have a bank of at least <b>1 Novemdecillion cookies</b> within 10 minutes of ascending.<q>Well, look at you, a Heavenly Chips trust fund baby. Ever thought about earning your keep like the rest of us?</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[49, 9, getSpriteSheet('custom')]]
        },
        
        theFinalChallenger: {
            names: ["The Final Challenger"],
            thresholds: [10], // 10 out of 17 challenge achievements
            descs: ["Win <b>10</b> of the Just Natural Expansion <b>Challenge Achievements</b>.<q>You didn't just rise to the challenge… you baked it into a 12-layer cake.</q>"],
            vanillaTarget: "Hardcore",
            customIcons: [[47, 48, getSpriteSheet('custom')]]
        },
        
        // Stock market achievements
        stockBrokers: {
            names: ["Broiler room"],
            thresholds: [100], // 100 stockbrokers
            descs: ["Hire at least <b>100</b> stockbrokers in the Stock Market.<q>And there is no such thing as a no sale call. A sale is made on every call you make. Either you sell the client some stock or he sells you a reason he can't. Either way a sale is made, who's gonna close? You or him?</q>"],
            vanillaTarget: "Buy buy buy",
            customIcons: [[1, 33]]
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
            descs: ["Quash the grandmatriarchs one way or another <b>666 times</b> across all ascensions.<q>Those grandmatriarchs are really out, I can hear them snoring from the next town over</q>"],
            vanillaTarget: "Elder slumber",
            customIcons: [[2, 9]]
        },
        buffs: {
            names: ["Trifecta Combo", "Combo Initiate", "Combo God", "Combo Hacker", "Frenzy frenzy", "Double Dragon Clicker", "Frenzy Marathon", "Hogwarts Graduate", "Hogwarts Dropout", "Spell Slinger"],
            thresholds: [3, 6, 9, 12, 0, 0, 0, 0, 0, 0], // 3, 6, 9, 12 buffs active, frenzy frenzy, double dragon, frenzy marathon, wizard achievements, and spell slinger (handled separately)
            descs: ["Have <b>3 buffs</b> active at once.<q>Hey that was pretty neat!</q>", "Have <b>6 buffs</b> active at once.<q>Okay that was downright impressive clicking</q>", "Have <b>9 buffs</b> active at once.<q>I can't even follow what you did there but it looked really cool</q>", "Have <b>12 buffs</b> active at once.<q>I don't believe you, but for like real congrats if you did that.</q>", "Have all three frenzy buffs active at once.<q>Like pizza pizza but with more wrath.</q>", "Have a dragon flight and a click frenzy active at the same time.<q>Double the dragons, double the clicking!</q>", "Have a frenzy buff with a total duration of at least 10 minutes.<q>Who needs coffee when you have this much energy?</q>", "Have <b>3 positive Grimoire spell effects</b> active at once.<q>Merlin would be proud of your spellcraft!</q>", "Have <b>3 negative Grimoirespell effects</b> active at once.<q>The Sorting Hat made a terrible mistake!</q>", "Cast <b>10 spells</b> within a 10-second window.<q>Speed casting at its finest!</q>"],
            vanillaTarget: "Here be dragon",
            customIcons: [[25, 36], [26, 11], [22, 11], [23, 11], [39, 36, getSpriteSheet('custom')], [30, 12], [22, 13], [30, 20], [31, 20], [32, 4]]
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
            descs: ["Fully initiate into the Great Orders of the Cookie Age. Owning this achievement causes research to go <b>25%</b> faster, and random drops to appear <b>10%</b> more often.<q>A golden cookie sigil is forever affixed to your lapel, you refuse to elaborate further, if someone says the words strawberry milk and peanut butter cookies you immediately leave the room</q>"],
            vanillaTarget: "Third-party",
            customIcons: [[54, 54, getSpriteSheet('custom')]]
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
    
    
    

    
                // Initialize tracking variables
            var modTracking = {
                shinyWrinklersPopped: 0,
                previousWrinklerStates: {},
                wrathCookiesClicked: 0,
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
        if (!modTracking.templeSwapsTotal) modTracking.templeSwapsTotal = 0;
        if (!modTracking.previousTempleSwaps) modTracking.previousTempleSwaps = 0;
    }
    
    function initializeSoilChangeTracking() {
        if (!modTracking.soilChangesTotal) modTracking.soilChangesTotal = 0;
        // Always reset baseline on (re)load so the first observed soil type does not count as a change
        modTracking.previousSoilType = null;
    }
    
    function initializeWrathCookieTracking() {
        if (!modTracking.wrathCookiesClicked) modTracking.wrathCookiesClicked = 0;
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
                ddesc: 'Contains an assortment of scientifically improved cookies.<q>A giftbox of cookies made just for you from the hard working researchers at Just Natural Expansion</q>',
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
                icon: [54, 46, getSpriteSheet('custom')],
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
                icon: [54, 48, getSpriteSheet('custom')],
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
                icon: [54, 41, getSpriteSheet('custom')],
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
                icon: [54, 47, getSpriteSheet('custom')],
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
                icon: [54, 42, getSpriteSheet('custom')],
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
                icon: [54, 54, getSpriteSheet('custom')],
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>With better retirement benefits, your grandmas can afford to work for less. They\'re just happy to be baking cookies and staying active.</q>',
                price: 5e19, // 50 quintillion
                icon: [1, 20], // Matches 750 threshold
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Generic reading glasses are just as good as the expensive ones, and they make your grandmas look more distinguished while they bake.</q>',
                price: 5e22, // 50 sextillion
                icon: [1, 25], // Matches 850 threshold
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Lightweight, durable, and much cheaper than the fancy ones. Your grandmas can now move around the kitchen more efficiently while saving money.</q>',
                price: 5e25, // 50 septillion
                icon: [1, 27], // Matches 950 threshold
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Buying hearing aids in bulk saves money, and your grandmas can now hear cookie timers perfectly. What\'s that? They said the cookies are ready!</q>',
                price: 5e28, // 50 octillion
                icon: [1, 35], // Matches 1050 threshold
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>The store brand works just as well as the name brand, and your grandmas can now knead dough without any complaints. Well, fewer complaints.</q>',
                price: 5e31, // 50 nonillion
                icon: [4, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Grandmas cost <b>5%</b> less.',
                ddesc: 'Grandmas cost <b>5%</b> less.<q>Buying denture adhesive in industrial quantities means your grandmas can smile confidently while tasting their cookie creations. The savings are toothsome!</q>',
                price: 5e34, // 50 decillion
                icon: [4, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms have discovered that running tractors on recycled cooking oil from cookie production is both eco-friendly and surprisingly cost-effective. The tractors smell like fresh cookies now!</q>',
                price: 5e22, // 50 sextillion
                icon: [2, 20], // Matches 750 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>The clone factories produce so much waste that your farms get all the fertilizer they need for free. The cookies grown with this manure taste surprisingly good.</q>',
                price: 5e25, // 50 septillion
                icon: [2, 25], // Matches 850 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms now use solar panels to power their irrigation systems. The cookies grow faster when they\'re watered with sunlight-filtered water, and the energy bills are practically zero.</q>',
                price: 5e28, // 50 octillion
                icon: [2, 27], // Matches 950 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Buying cookie seeds in industrial quantities has dramatically reduced costs. Your farms now have enough seeds to plant cookie forests, and the bulk discount is delicious.</q>',
                price: 5e31, // 50 nonillion
                icon: [2, 35], // Matches 1050 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>Your farms now employ robotic workers who never tire and work for free. They\'re programmed to be gentle with the cookie plants and surprisingly good at telling cookie jokes.</q>',
                price: 5e34, // 50 decillion
                icon: [5, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Farms cost <b>5%</b> less.',
                ddesc: 'Farms cost <b>5%</b> less.<q>The government is so impressed with your cookie farming innovation that they\'re providing subsidies for vertical farming. Your cookie towers are now taxpayer-funded!</q>',
                price: 5e37, // 50 undecillion
                icon: [5, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Flat‑pack mining in a box! Comes with complimentary dust, three bent bolts, and a manual that just says “dig.”</q>',
                price: 5e25, // 50 septillion
                icon: [3, 20], // Matches 750 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Every tenth kaboom is free. Please remember to validate your detonation.</q>',
                price: 5e28, // 50 octillion
                icon: [3, 25], // Matches 850 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Pre-scuffed for authenticity. Comes with vintage stickers and suspiciously fresh chin straps.</q>',
                price: 5e31, // 50 nonillion
                icon: [3, 27], // Matches 950 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>You rent them your rigs; they rent them back to you cheaper. Don’t think about it too hard—just keep drilling.</q>',
                price: 5e34, // 50 decillion
                icon: [3, 35], // Matches 1050 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Clip these to save big on ironies, aluminums, and suspiciously inexpensive unobtainium.</q>',
                price: 5e37, // 50 undecillion
                icon: [6, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Mines cost <b>5%</b> less.',
                ddesc: 'Mines cost <b>5%</b> less.<q>Policy fine print: “cave-ins not included.” The cashback is, though!</q>',
                price: 5e40, // 50 duodecillion
                icon: [6, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Arrives in 47 boxes, 2 mystery bolts, and one tiny allen key. Assembly required; dignity sold separately.</q>',
                price: 5e28, // 50 octillion
                icon: [4, 20], // Matches 750 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Buy one rivet, get one lodged in the break room floor for free. Savings that really fasten your margins.</q>',
                price: 5e31, // 50 nonillion
                icon: [4, 25], // Matches 850 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>It says "lubricishion" on the drum but the conveyor squeaks stopped and the budget squeals with joy.</q>',
                price: 5e34, // 50 decillion
                icon: [4, 27], // Matches 950 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>"DO NOT NOT TOUCH" and "CAUTION: SPICY ELECTRICITY" — flawed labels at flawless prices.</q>',
                price: 5e37, // 50 undecillion
                icon: [4, 35], // Matches 1050 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Return three worn wheels and a heartfelt shrug to receive instant savings on moving heavy expectations.</q>',
                price: 5e40, // 50 duodecillion
                icon: [7, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Factories cost <b>5%</b> less.',
                ddesc: 'Factories cost <b>5%</b> less.<q>Snap together a fully functional bakery block before lunch. Some assembly lines may snap back.</q>',
                price: 5e43, // 50 tredecillion
                icon: [7, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>We buy your old piggy banks for scrap, you get bulk rates on brand-new savings. Oink if you love rebates.</q>',
                price: 5e31, // 50 nonillion
                icon: [15, 20], // Matches 750 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>Slightly scuffed, mostly secure, and drastically discounted. May include complimentary salesperson fingerprints.</q>',
                price: 5e34, // 50 decillion
                icon: [15, 25], // Matches 850 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>We negotiated a lifetime supply of those pens everyone “borrows”. Budgets balanced; chains tested for tensile sass.</q>',
                price: 5e37, // 50 undecillion
                icon: [15, 27], // Matches 950 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>They’re free. The mints are free. The sign telling you they’re complimentary is also complimentary.</q>',
                price: 5e40, // 50 duodecillion
                icon: [15, 35], // Matches 1050 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>Wave the fee, waive the fee—our interns practiced both until the numbers surrendered.</q>',
                price: 5e43, // 50 tredecillion
                icon: [8, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Banks cost <b>5%</b> less.',
                ddesc: 'Banks cost <b>5%</b> less.<q>The market dipped; we scooped vault carpeting and gold-plated clipboards by the pallet. Buy low, bank lower.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [8, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Pray ten times, the eleventh comes with a coupon. Blessings accrue interest; salvation may vary.</q>',
                price: 5e34, // 50 decillion
                icon: [16, 20], // Matches 750 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Authentically inauthentic! Perfect for display, fundraising, and keeping the real relics safe in a sock drawer.</q>',
                price: 5e37, // 50 undecillion
                icon: [16, 25], // Matches 850 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Bring back your incense stubs for a discount on fresh sticks. Smells like savings (and nutmeg).</q>',
                price: 5e40, // 50 duodecillion
                icon: [16, 27], // Matches 950 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Wind them up for a full liturgical set in C Major. Now with extended Amen remix.</q>',
                price: 5e43, // 50 tredecillion
                icon: [16, 35], // Matches 1050 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Local businesses sponsor your pews. Sit in Savings Row, brought to you by Discount Chalice Emporium.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [9, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Temples cost <b>5%</b> less.',
                ddesc: 'Temples cost <b>5%</b> less.<q>Pilgrims rejoice; accountants rejoice harder. Certain restrictions (and miracles) apply.</q>',
                price: 5e49, // 50 quindecillion
                icon: [9, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Returned within 30 days of transmogrification. Minor scorch marks add character.</q>',
                price: 5e37, // 50 undecillion
                icon: [17, 20], // Matches 750 threshold
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
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Spellbooks with the last page missing. The twist ending is cheaper anyway.</q>',
                price: 5e40, // 50 duodecillion
                icon: [17, 25], // Matches 850 threshold
                pool: '',
                unlockCondition: function() {
                    var wizardTowerAmount = Game.Objects['Wizard tower'] ? Game.Objects['Wizard tower'].amount : 0;
                    return wizardTowerAmount >= 850;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: 'Robes with “character”',
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Vintage, moth-kissed, and pockets full of mysterious lint. Very arcane, very affordable.</q>',
                price: 5e43, // 50 tredecillion
                icon: [17, 27], // Matches 950 threshold
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
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Give a stray imp a home and it will fetch reagents, guard cauldrons, and occasionally judge your hat.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [17, 35], // Matches 1050 threshold
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
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>Stipends for parchment, ink, and the occasional sworn oath. Please initial with runes.</q>',
                price: 5e49, // 50 quindecillion
                icon: [10, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Wizard towers cost <b>5%</b> less.',
                ddesc: 'Wizard towers cost <b>5%</b> less.<q>One broom, many roommates. Please schedule your midnight flights responsibly.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [10, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Previously orbited. Lightly meteor-kissed. Still airtight (mostly).</q>',
                price: 5e40, // 50 duodecillion
                icon: [5, 20], // Matches 750 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Members share containers, points, and an inexplicable fondness for pallet forts.</q>',
                price: 5e43, // 50 tredecillion
                icon: [5, 25], // Matches 850 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Return for deposit and a complimentary dent count. Blast off again and again.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [5, 27], // Matches 950 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>They learn by bumping every harbor gently, then sending a heartfelt apology ping.</q>',
                price: 5e49, // 50 quindecillion
                icon: [5, 35], // Matches 1050 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Redeem along preferred lanes for discounts and occasional scenic detours.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [11, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Shipments cost <b>5%</b> less.',
                ddesc: 'Shipments cost <b>5%</b> less.<q>Tariffs take a coffee break, cranes work overtime. Paperwork now served with biscotti.</q>',
                price: 5e55, // 50 septendecillion
                icon: [11, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Trade in cracked glassware for shiny almost‑new beakers. Some have personality bubbles.</q>',
                price: 5e43, // 50 tredecillion
                icon: [6, 20], // Matches 750 threshold
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
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Bulk-bought bits of the legendary rock. Not quite stones—more like budget-friendly pebbles with surprisingly similar savings.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [6, 25], // Matches 850 threshold
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
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>They simmer at savings and rarely explode out of spite. Rarely.</q>',
                price: 5e49, // 50 quindecillion
                icon: [6, 27], // Matches 950 threshold
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
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Legal recognition for small goo people doing big batch work. Includes tiny hairnets.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [6, 35], // Matches 1050 threshold
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
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Member pricing on phoenix down, dragonfruit essence, and ethically sourced eldritch goo.</q>',
                price: 5e55, // 50 septendecillion
                icon: [12, 72, getSpriteSheet('custom')], // Matches 1150 threshold
                pool: '',
                unlockCondition: function() {
                    var alchemyLabAmount = Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'].amount : 0;
                    return alchemyLabAmount >= 1150;
                },
                effect: function() {
                    return 1;
                },},
            {
                name: '“Mostly lead” gold grants',
                desc: 'Alchemy labs cost <b>5%</b> less.',
                ddesc: 'Alchemy labs cost <b>5%</b> less.<q>Funding for ambitious projects that turn profits into more profits, occasionally metal into other metal.</q>',
                price: 5e58, // 50 octodecillion
                icon: [12, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Lightly used by previous dimensions. May creak audibly when reality bends.</q>',
                price: 5e46, // 50 quattuordecillion
                icon: [7, 20], // Matches 750 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Wholesale anchors! Keep your gateways grounded, your prices too.</q>',
                price: 5e49, // 50 quindecillion
                icon: [7, 25], // Matches 850 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Simple fins that hush the howling void and cut the utility bill in half.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [7, 27], // Matches 950 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Enthusiasts with clipboards who shout "Mind the tear!" and hand out cookies.</q>',
                price: 5e55, // 50 septendecillion
                icon: [7, 35], // Matches 1050 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Official parchments granting snack stipends to keep doors open and demons docile.</q>',
                price: 5e58, // 50 octodecillion
                icon: [13, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Portals cost <b>5%</b> less.',
                ddesc: 'Portals cost <b>5%</b> less.<q>Business-friendly realities with tax holidays, physics optional, pastries encouraged.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [13, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>They’ve seen some things. Sand flows fine; occasional deja vu included.</q>',
                price: 5e49, // 50 quindecillion
                icon: [8, 20], // Matches 750 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Leftover future-past parts at clearance prices. Warranty voids itself retroactively.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [8, 25], // Matches 850 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Winter flux on summer sale; flows like syrup on a cold morning.</q>',
                price: 5e55, // 50 septendecillion
                icon: [8, 27], // Matches 950 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Unlimited round-trips between Friday and Monday. Terms loop perpetually.</q>',
                price: 5e58, // 50 octodecillion
                icon: [8, 35], // Matches 1050 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Official funding to keep the clock from quitting and causality from filing complaints.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [14, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Time machines cost <b>5%</b> less.',
                ddesc: 'Time machines cost <b>5%</b> less.<q>Warranties that expire yesterday can’t be voided today. That’s just science.</q>',
                price: 5e64, // 50 vigintillion
                icon: [14, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Pre-certified, lightly cursed containment vessels. Store your nothing where it belongs.</q>',
                price: 5e52, // 50 sexdecillion
                icon: [13, 20], // Matches 750 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Trade in your old matter for upgraded matter. Some terms may invert unexpectedly.</q>',
                price: 5e55, // 50 septendecillion
                icon: [13, 25], // Matches 850 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>They hum quietly and only obliterate the bare minimum of existence during lunch.</q>',
                price: 5e58, // 50 octodecillion
                icon: [13, 27], // Matches 950 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Enthusiastic assistants accelerate savings (and particles) for the promise of “experience”.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [13, 35], // Matches 1050 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Philanthropy meets physics: every cookie you invest is matched by a very generous boson.</q>',
                price: 5e64, // 50 vigintillion
                icon: [15, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Antimatter condensers cost <b>5%</b> less.',
                ddesc: 'Antimatter condensers cost <b>5%</b> less.<q>Tax breaks for building where reality is thinnest. Perfect for negative overhead.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [15, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Swap scratches for savings. Community-sourced optics with community-sourced fingerprints.</q>',
                price: 5e55, // 50 septendecillion
                icon: [14, 20], // Matches 750 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Factory blemishes. Perfect rainbows, slightly embarrassed casings.</q>',
                price: 5e58, // 50 octodecillion
                icon: [14, 25], // Matches 850 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>They dim themselves when you look away. Shy, efficient, dazzling when ready.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [14, 27], // Matches 950 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Trainees with straightedges and boundless optimism. Do not stare directly at their enthusiasm.</q>',
                price: 5e64, // 50 vigintillion
                icon: [14, 35], // Matches 1050 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Funding for cultural light projects: installations, refractions, and occasional tasteful lens flares.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [16, 72, getSpriteSheet('custom')], // Matches 1150 threshold
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
                desc: 'Prisms cost <b>5%</b> less.',
                ddesc: 'Prisms cost <b>5%</b> less.<q>Tax incentives for neighborhoods with excellent chroma. Bring your own pot of gold.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [16, 54, getSpriteSheet('custom')], // Matches 1250 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Fortunes with typos sell for cheap; destiny still reads between the lines.</q>',
                price: 5e58, // 50 octodecillion
                icon: [19, 20], // Matches 750 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>If at first you don’t crit, try again—now with store credit.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [19, 25], // Matches 850 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Fits most prophecies. Some assembly (and belief) required.</q>',
                price: 5e64, // 50 vigintillion
                icon: [19, 27], // Matches 950 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Community diviners bring your costs down and your eyebrows up.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [19, 35], // Matches 1050 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Public funding for private jackpots. Everybody wins (statistically speaking).</q>',
                price: 5e70, // 50 duovigintillion
                icon: [19, 35], // Matches 1150 threshold
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
                desc: 'Chancemakers cost <b>5%</b> less.',
                ddesc: 'Chancemakers cost <b>5%</b> less.<q>Zones where chance is zoned in your favor. Paperwork pre-blessed.</q>',
                price: 5e73, // 50 trevigintillion
                icon: [19, 35], // Matches 1250 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>We sold the old parts again and again and again. Recursively affordable.</q>',
                price: 5e61, // 50 novemdecillion
                icon: [20, 20], // Matches 750 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Each part contains smaller parts that also contain… discounts.</q>',
                price: 5e64, // 50 vigintillion
                icon: [20, 25], // Matches 850 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Get cash back on purchases that refer to themselves. Terms repeat.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [20, 27], // Matches 950 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Invite artists-in-algorithm to iterate patterns and budgets into pleasing shapes.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [20, 35], // Matches 1050 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>We proved it costs less, QED (Quite Economically Done).</q>',
                price: 5e73, // 50 trevigintillion
                icon: [20, 35], // Matches 1150 threshold
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
                desc: 'Fractal engines cost <b>5%</b> less.',
                ddesc: 'Fractal engines cost <b>5%</b> less.<q>Zoning approvals for parcels that subdivide forever. Plenty of room for savings.</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [20, 35], // Matches 1250 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Pre-loved PCBs with fresh solder and faint coffee notes. Still compiles.</q>',
                price: 5e64, // 50 vigintillion
                icon: [32, 20], // Matches 750 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Compile now, pay later. Terms readable only after transpilation.</q>',
                price: 5e67, // 50 unvigintillion
                icon: [32, 25], // Matches 850 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Optimized for waiting around productively. Uses fewer cycles, fewer snacks.</q>',
                price: 5e70, // 50 duovigintillion
                icon: [32, 27], // Matches 950 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Throw code, catch feedback, share snacks. Merge with confidence (and crumbs).</q>',
                price: 5e73, // 50 trevigintillion
                icon: [32, 35], // Matches 1050 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Foundation funds for critical libraries like dough.js and crumb-utils.</q>',
                price: 5e76, // 50 quattuorvigintillion
                icon: [32, 35], // Matches 1150 threshold
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
                desc: 'Javascript consoles cost <b>5%</b> less.',
                ddesc: 'Javascript consoles cost <b>5%</b> less.<q>Spin up instances for less. Free tier includes occasional cumulonimbus.</q>',
                price: 5e79, // 50 quinvigintillion
                icon: [32, 35], // Matches 1250 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your idleverses qualify for special tax incentives across multiple dimensions. The paperwork is filed in parallel universes, but the savings are very real.</q>',
                price: 6e66, // 6 unvigintillion (matches 8% efficiency upgrade price)
                icon: [33, 20], // Matches 750 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>By consolidating multiple idleverses under unified management, you\'ve negotiated bulk pricing that applies across all dimensions. The savings scale with your multiverse presence.</q>',
                price: 6e69, // 6 duovigintillion (matches 8% efficiency upgrade price)
                icon: [33, 25], // Matches 850 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your massive scale across the multiverse allows you to purchase idleverse components in quantities that would bankrupt entire galaxies. The suppliers are happy to offer volume discounts.</q>',
                price: 6e72, // 6 trevigintillion (matches 8% efficiency upgrade price)
                icon: [33, 26], // Matches 950 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>You\'ve established exclusive supplier relationships across multiple realities. These vendors compete for your business, driving down prices while maintaining quality across all dimensions.</q>',
                price: 6e75, // 6 quattuorvigintillion (matches 8% efficiency upgrade price)
                icon: [33, 29], // Matches 1050 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>Your idleverse operations have reached such massive scale that you can leverage economies across the entire multiverse. Each new idleverse makes all the others cheaper to build.</q>',
                price: 6e78, // 6 quinvigintillion (matches 8% efficiency upgrade price)
                icon: [33, 35], // Matches 1150 threshold
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
                desc: 'Idleverses cost <b>5%</b> less.',
                ddesc: 'Idleverses cost <b>5%</b> less.<q>You\'ve achieved such dominance across the multiverse that suppliers are willing to offer preferential pricing just to maintain their relationship with the largest cookie empire in existence.</q>',
                price: 6e81, // 6 sexvigintillion (matches 8% efficiency upgrade price)
                icon: [33, 35], // Matches 1250 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have negotiated bulk discounts on neural tissue and synaptic materials. Buying brain matter in industrial quantities significantly reduces the per-unit cost of each new baker.</q>',
                price: 9.5e68, // 950 unvigintillion (matches 8% efficiency upgrade price)
                icon: [34, 20], // Matches 750 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have established direct relationships with neural tissue suppliers, bypassing middlemen and securing wholesale pricing on synaptic components. The savings are mind-boggling.</q>',
                price: 9.5e71, // 950 duovigintillion (matches 8% efficiency upgrade price)
                icon: [34, 25], // Matches 850 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have mastered the art of mass-producing brain tissue, creating economies of scale that make each additional baker significantly cheaper. It\'s like a neural assembly line.</q>',
                price: 9.5e74, // 95 vigintillion (matches 8% efficiency upgrade price)
                icon: [34, 26], // Matches 950 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have achieved such dominance in the neural market that suppliers offer preferential pricing just to maintain their relationship with the largest brain-based cookie empire in existence.</q>',
                price: 9.5e77, // 950 quattuorvigintillion (matches 8% efficiency upgrade price)
                icon: [34, 29], // Matches 1050 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex baker operations have reached such massive scale that you can leverage neural economies across the entire network. Each new baker makes all the others cheaper to build through shared infrastructure.</q>',
                price: 9.5e80, // 950 quinvigintillion (matches 8% efficiency upgrade price)
                icon: [34, 35], // Matches 1150 threshold
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
                desc: 'Cortex bakers cost <b>5%</b> less.',
                ddesc: 'Cortex bakers cost <b>5%</b> less.<q>Your cortex bakers have cornered the market on synaptic materials, controlling the entire supply chain from neural tissue farms to advanced cognitive enhancement facilities. Suppliers compete for your business.</q>',
                price: 9.5e83, // 950 sexvigintillion (matches 8% efficiency upgrade price)
                icon: [34, 35], // Matches 1250 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone factory has achieved economies of scale, making each additional clone significantly cheaper to produce. The infrastructure costs are spread across more units, and suppliers offer bulk discounts on cloning materials.</q>',
                price: 2.7e70, // 27 duovigintillion (matches 8% efficiency upgrade price)
                icon: [35, 20], // Matches 750 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone production has been streamlined into efficient assembly lines, reducing waste and optimizing resource usage. Each clone is now produced with surgical precision at a fraction of the original cost.</q>',
                price: 2.7e73, // 27 vigintillion (matches 8% efficiency upgrade price)
                icon: [35, 25], // Matches 850 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone manufacturing process has reached industrial perfection, with automated quality control and bulk material sourcing. The cost per clone has plummeted as you\'ve mastered the art of mass self-replication.</q>',
                price: 2.7e76, // 27 quattuorvigintillion (matches 8% efficiency upgrade price)
                icon: [35, 26], // Matches 950 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone empire has achieved such dominance that suppliers compete for your business, offering preferential pricing on all cloning materials. Being the largest self-replicating entity has its financial advantages.</q>',
                price: 2.7e79, // 27 quinvigintillion (matches 8% efficiency upgrade price)
                icon: [35, 29], // Matches 1050 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone network has established direct relationships with material suppliers, bypassing middlemen and securing wholesale pricing. The savings from cutting out intermediaries are substantial.</q>',
                price: 2.7e82, // 27 sexvigintillion (matches 8% efficiency upgrade price)
                icon: [35, 35], // Matches 1150 threshold
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
                desc: 'You cost <b>5%</b> less.',
                ddesc: 'You cost <b>5%</b> less.<q>Your clone operations have cornered the market on self-replication materials, controlling the entire supply chain from basic cloning components to advanced genetic enhancement facilities. Suppliers compete for your business.</q>',
                price: 2.7e85, // 27 septenvigintillion (matches 8% efficiency upgrade price)
                icon: [35, 35], // Matches 1250 threshold
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
                price: 9e50, // 900 quindecillion
                icon: [17, 32, getSpriteSheet('custom')],
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
                price: 9e53, // 900 quattuordecillion
                icon: [17, 33, getSpriteSheet('custom')],
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
                price: 9e56, // 900 septendecillion
                icon: [17, 34, getSpriteSheet('custom')],
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
                price: 9e59, // 900 octodecillion
                icon: [17, 35, getSpriteSheet('custom')],
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
                price: 9e62, // 900 novemdecillion
                icon: [17, 36, getSpriteSheet('custom')],
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
                price: 9e65, // 900 vigintillion
                icon: [17, 37, getSpriteSheet('custom')],
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
                price: 9e68, // 900 unvigintillion
                icon: [17, 39, getSpriteSheet('custom')],
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
                price: 9e71, // 900 duovigintillion
                icon: [17, 40, getSpriteSheet('custom')],
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
                price: 9e74, // 900 trevigintillion
                icon: [17, 47, getSpriteSheet('custom')],
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
                price: 9e77, // 900 quattuorvigintillion
                icon: [17, 42, getSpriteSheet('custom')],
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
                price: 9e80, // 900 quinvigintillion
                icon: [17, 48, getSpriteSheet('custom')],
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
                price: 5e19, // 50 quintillion (10000x higher than vanilla's 5 quadrillion)
                icon: [1, 21], // Matches 800 threshold
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
                price: 5e22, // 50 sextillion (1000x increase)
                icon: [1, 26], // Matches 900 threshold
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
                price: 5e25, // 50 septillion (1000x increase)
                icon: [1, 29], // Matches 1000 threshold
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
                price: 5e28, // 50 octillion (1000x increase)
                icon: [4, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 5e31, // 50 nonillion (1000x increase)
                icon: [4, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 5.5e45, // 5.5 quattuordecillion (10000x higher than vanilla's 55 tredecillion)
                icon: [2, 21], // Matches 800 threshold
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
                price: 5.5e48, // 5.5 quindecillion (1000x increase)
                icon: [2, 26], // Matches 900 threshold
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
                price: 5.5e51, // 5.5 sexdecillion (1000x increase)
                icon: [2, 29], // Matches 1000 threshold
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
                price: 5.5e54, // 5.5 septendecillion (1000x increase)
                icon: [5, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 5.5e57, // 5.5 octodecillion (1000x increase)
                icon: [5, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 6e45, // 6 quattuordecillion (10000x higher than vanilla's 600 tredecillion)
                icon: [3, 21], // Matches 800 threshold
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
                price: 6e48, // 6 quindecillion (1000x increase)
                icon: [3, 26], // Matches 900 threshold
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
                price: 6e51, // 6 sexdecillion (1000x increase)
                icon: [3, 29], // Matches 1000 threshold
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
                price: 6e54, // 6 septendecillion (1000x increase)
                icon: [6, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 6e57, // 6 octodecillion (1000x increase)
                icon: [6, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 6.5e49, // 6.5 quindecillion (10000x higher than vanilla's 6.5 quattuordecillion)
                icon: [4, 21], // Matches 800 threshold
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
                price: 6.5e52, // 6.5 sexdecillion (1000x increase)
                icon: [4, 26], // Matches 900 threshold
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
                price: 6.5e55, // 6.5 septendecillion (1000x increase)
                icon: [4, 29], // Matches 1000 threshold
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
                price: 6.5e58, // 6.5 octodecillion (1000x increase)
                icon: [7, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 6.5e61, // 65 novemdecillion (1000x increase)
                icon: [7, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 7e50, // 70 quindecillion (10000x higher than vanilla's 70 quattuordecillion)
                icon: [15, 21], // Matches 800 threshold
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
                price: 7e53, // 70 sexdecillion (1000x increase)
                icon: [15, 26], // Matches 900 threshold
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
                price: 7e56, // 70 septendecillion (1000x increase)
                icon: [15, 29], // Matches 1000 threshold
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
                price: 7e59, // 70 octodecillion (1000x increase)
                icon: [8, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 7e62, // 700 novemdecillion (1000x increase)
                icon: [8, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 1e52, // 1 sexdecillion (10000x higher than vanilla's 1 quindecillion)
                icon: [16, 21], // Matches 800 threshold
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
                price: 1e55, // 1 septendecillion (1000x increase)
                icon: [16, 26], // Matches 900 threshold
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
                price: 1e58, // 1 octodecillion (1000x increase)
                icon: [16, 29], // Matches 1000 threshold
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
                price: 1e61, // 10 novemdecillion (1000x increase)
                icon: [9, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 1e64, // 10 vigintillion (1000x increase)
                icon: [9, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 1.65e53, // 16.5 sexdecillion (10000x higher than vanilla's 16.5 quindecillion)
                icon: [17, 21], // Matches 800 threshold
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
                price: 1.65e56, // 16.5 septendecillion (1000x increase)
                icon: [17, 26], // Matches 900 threshold
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
                price: 1.65e59, // 16.5 octodecillion (1000x increase)
                icon: [17, 29], // Matches 1000 threshold
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
                price: 1.65e62, // 165 novemdecillion (1000x increase)
                icon: [10, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 1.65e65, // 165 vigintillion (1000x increase)
                icon: [10, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 2.55e54, // 2.55 septendecillion (10000x higher than vanilla's 255 quindecillion)
                icon: [5, 21], // Matches 800 threshold
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
                price: 2.55e57, // 2.55 octodecillion (1000x increase)
                icon: [5, 26], // Matches 900 threshold
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
                price: 2.55e60, // 2.55 novemdecillion (1000x increase)
                icon: [5, 29], // Matches 1000 threshold
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
                price: 2.55e63, // 2.55 vigintillion (1000x increase)
                icon: [11, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 2.55e66, // 2.55 unvigintillion (1000x increase)
                icon: [11, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 3.75e55, // 37.5 septendecillion (10000x higher than vanilla's 3.75 sexdecillion)
                icon: [6, 21], // Matches 800 threshold
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
                price: 3.75e58, // 37.5 octodecillion (1000x increase)
                icon: [6, 26], // Matches 900 threshold
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
                price: 3.75e61, // 37.5 novemdecillion (1000x increase)
                icon: [6, 29], // Matches 1000 threshold
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
                price: 3.75e64, // 37.5 vigintillion (1000x increase)
                icon: [12, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 3.75e67, // 37.5 unvigintillion (1000x increase)
                icon: [12, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 5e56, // 500 septendecillion (10000x higher than vanilla's 50 sexdecillion)
                icon: [7, 21], // Matches 800 threshold
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
                price: 5e59, // 500 octodecillion (1000x increase)
                icon: [7, 26], // Matches 900 threshold
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
                price: 5e62, // 500 novemdecillion (1000x increase)
                icon: [7, 29], // Matches 1000 threshold
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
                price: 5e65, // 500 vigintillion (1000x increase)
                icon: [13, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 5e68, // 500 unvigintillion (1000x increase)
                icon: [13, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 7e57, // 7 octodecillion (10000x higher than vanilla's 700 sexdecillion)
                icon: [8, 21], // Matches 800 threshold
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
                price: 7e60, // 7 novemdecillion (1000x increase)
                icon: [8, 26], // Matches 900 threshold
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
                price: 7e63, // 7 vigintillion (1000x increase)
                icon: [8, 29], // Matches 1000 threshold
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
                price: 7e66, // 7 unvigintillion (1000x increase)
                icon: [14, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 7e69, // 7 duovigintillion (1000x increase)
                icon: [14, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 8.5e58, // 85 octodecillion (10000x higher than vanilla's 8.5 septendecillion)
                icon: [13, 21], // Matches 800 threshold
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
                price: 8.5e61, // 85 novemdecillion (1000x increase)
                icon: [13, 26], // Matches 900 threshold
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
                price: 8.5e64, // 85 vigintillion (1000x increase)
                icon: [13, 29], // Matches 1000 threshold
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
                price: 8.5e67, // 85 unvigintillion (1000x increase)
                icon: [15, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 8.5e70, // 85 duovigintillion (1000x increase)
                icon: [15, 72, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 1.05e60, // 1.05 novemdecillion (10000x higher than vanilla's 105 septendecillion)
                icon: [14, 21], // Matches 800 threshold
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
                price: 1.05e63, // 1.05 vigintillion (1000x increase)
                icon: [14, 26], // Matches 900 threshold
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
                price: 1.05e66, // 1.05 unvigintillion (1000x increase)
                icon: [14, 29], // Matches 1000 threshold
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
                price: 1.05e69, // 1.05 duovigintillion (1000x increase)
                icon: [16, 71, getSpriteSheet('custom')], // Matches 1100 threshold
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
                price: 1.05e72, // 1.05 trevigintillion (1000x increase)
                icon: [16, 56, getSpriteSheet('custom')], // Matches 1200 threshold
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
                price: 1.3e61, // 13 novemdecillion (10000x higher than vanilla's 1.3 octodecillion)
                icon: [19, 21], // Matches 800 threshold
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
                price: 1.3e64, // 13 vigintillion (1000x increase)
                icon: [19, 26], // Matches 900 threshold
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
                price: 1.3e67, // 13 unvigintillion (1000x increase)
                icon: [19, 29], // Matches 1000 threshold
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
                price: 1.3e70, // 13 duovigintillion (1000x increase)
                icon: [19, 35], // Matches 1100 threshold
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
                price: 1.3e73, // 13 trevigintillion (1000x increase)
                icon: [19, 35], // Matches 1200 threshold
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
                price: 1.55e62, // 155 novemdecillion (10000x higher than vanilla's 15.5 octodecillion)
                icon: [20, 21], // Matches 800 threshold
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
                price: 1.55e65, // 155 vigintillion (1000x increase)
                icon: [20, 26], // Matches 900 threshold
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
                price: 1.55e68, // 155 unvigintillion (1000x increase)
                icon: [20, 29], // Matches 1000 threshold
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
                price: 1.55e71, // 155 duovigintillion (1000x increase)
                icon: [20, 35], // Matches 1100 threshold
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
                price: 1.55e74, // 155 trevigintillion (1000x increase)
                icon: [20, 35], // Matches 1200 threshold
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
                price: 3.55e64, // 35.5 vigintillion (10000x higher than vanilla's 3.55 novemdecillion)
                icon: [32, 21], // Matches 800 threshold
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
                price: 3.55e67, // 35.5 unvigintillion (1000x increase)
                icon: [32, 26], // Matches 900 threshold
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
                price: 3.55e70, // 35.5 duovigintillion (1000x increase)
                icon: [32, 29], // Matches 1000 threshold
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
                price: 3.55e73, // 35.5 trevigintillion (1000x increase)
                icon: [32, 35], // Matches 1100 threshold
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
                price: 3.55e76, // 35.5 quattuorvigintillion (1000x increase)
                icon: [32, 35], // Matches 1200 threshold
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
                price: 6e66, // 6 unvigintillion (10000x higher than vanilla's 600 novemdecillion)
                icon: [33, 21], // Matches 800 threshold
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
                price: 6e69, // 6 duovigintillion (1000x increase)
                icon: [33, 26], // Matches 900 threshold
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
                price: 6e72, // 6 trevigintillion (1000x increase)
                icon: [33, 29], // Matches 1000 threshold
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
                price: 6e75, // 6 quattuorvigintillion (1000x increase)
                icon: [33, 35], // Matches 1100 threshold
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
                price: 6e78, // 6 quinvigintillion (1000x increase)
                icon: [33, 35], // Matches 1200 threshold
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
                price: 9.5e68, // 950 unvigintillion (10000x higher than vanilla's 95 vigintillion)
                icon: [34, 21], // Matches 800 threshold
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
                price: 9.5e71, // 950 duovigintillion (1000x increase)
                icon: [34, 26], // Matches 900 threshold
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
                price: 9.5e74, // 95 vigintillion (1000x increase)
                icon: [34, 29], // Matches 1000 threshold
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
                price: 9.5e77, // 950 quattuorvigintillion (1000x increase)
                icon: [34, 35], // Matches 1100 threshold
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
                price: 9.5e80, // 950 quinvigintillion (1000x increase)
                icon: [34, 35], // Matches 1200 threshold
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
                price: 2.7e70, // 27 duovigintillion (10000x higher than vanilla's 27 unvigintillion)
                icon: [35, 21], // Matches 800 threshold
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
                price: 2.7e73, // 27 vigintillion (1000x increase)
                icon: [35, 26], // Matches 900 threshold
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
                price: 2.7e76, // 27 quattuorvigintillion (1000x increase)
                icon: [35, 29], // Matches 1000 threshold
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
                price: 2.7e79, // 27 quinvigintillion (1000x increase)
                icon: [35, 35], // Matches 1100 threshold
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
                price: 2.7e82, // 27 sexvigintillion (1000x increase)
                icon: [35, 35], // Matches 1200 threshold
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
                name: 'Improved Sugar cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Artificial intelligence has optimized the sugar-to-flour ratio through extensive testing.</q>',
                price: 5e66, // 500 unvigintillion
                icon: [7, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Oatmeal raisin cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Spiritual meditation has led to the discovery of the optimal raisin variety for maximum flavor burst.</q>',
                price: 2e67, // 20 unvigintillion
                icon: [0, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Peanut butter cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Quantum computing has enabled the development of a new peanut butter processing method for maximum creaminess.</q>',
                price: 1e68, // 100 unvigintillion
                icon: [1, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Coconut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Machine learning algorithms have discovered the perfect coconut grating technique for optimal texture.</q>',
                price: 5e68, // 500 unvigintillion
                icon: [3, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
               
            },
            {
                name: 'Improved Macadamia nut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Genetic analysis has identified the specific Hawaiian macadamia variety with the richest flavor profile.</q>',
                price: 3e69, // 3 duovigintillion
                icon: [5, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Almond cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Spectroscopic analysis has shown that California almonds provide the perfect crunch-to-flavor ratio.</q>',
                price: 1.5e70, // 15 duovigintillion
                icon: [21, 27],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Hazelnut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Chromatography has revealed that Turkish hazelnuts contain the highest concentration of flavor compounds.</q>',
                price: 8e70, // 80 duovigintillion
                icon: [22, 27],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Walnut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Neural networks have determined that English walnuts provide the optimal balance of crunch and flavor.</q>',
                price: 4e71, // 400 duovigintillion
                icon: [23, 27],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
          
            },
            {
                name: 'Improved Cashew cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Mass spectrometry has discovered that Brazilian cashews contain unique compounds that enhance buttery smoothness.</q>',
                price: 2e72, // 2 trevigintillion
                icon: [32, 7],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
     
            },
            {
                name: 'Improved White chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Thermal analysis has revealed that Belgian white chocolate contains the perfect cocoa butter ratio for creaminess.</q>',
                price: 1e73, // 10 trevigintillion
                icon: [4, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Milk chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Molecular dynamics simulations have developed a Swiss chocolate blend that melts at the perfect temperature.</q>',
                price: 5e73, // 50 trevigintillion
                icon: [33, 7],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved Double-chip cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Statistical modeling has proven that doubling the chocolate chip density maximizes chocolatey goodness.</q>',
                price: 2.5e74, // 250 trevigintillion
                icon: [6, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            },
            {
                name: 'Improved White chocolate macadamia nut cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Computational chemistry has discovered the perfect ratio of white chocolate to macadamia for maximum flavor synergy.</q>',
                price: 1e75, // 1 quattuorvigintillion
                icon: [8, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            
            },
            {
                name: 'Improved All-chocolate cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Biotechnology has developed a revolutionary chocolate dough formula that\'s entirely edible.</q>',
                price: 5e75, // 5 quattuorvigintillion
                icon: [9, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
              
            },
            {
                name: 'Improved Dark chocolate-coated cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Flavor profiling has identified the optimal 70% cocoa concentration for sophisticated palates.</q>',
                price: 3e76, // 30 quattuorvigintillion
                icon: [10, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
           
            },
            {
                name: 'Improved White chocolate-coated cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Differential scanning calorimetry has revealed the perfect melting temperature for velvety white chocolate coating.</q>',
                price: 1.5e77, // 150 quattuorvigintillion
                icon: [11, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
          
            },
            {
                name: 'Improved Eclipse cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Fluid dynamics modeling has developed a precise chocolate swirling technique that creates mesmerizing eclipse patterns.</q>',
                price: 7.5e77, // 750 quattuorvigintillion
                icon: [0, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Zebra cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Computer vision has perfected the layering technique for perfectly striped vanilla and chocolate dough.</q>',
                price: 4e78, // 4 quinvigintillion
                icon: [1, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
               
            },
            {
                name: 'Improved Snickerdoodles',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Sensor fusion has discovered the optimal cinnamon-to-cream-of-tartar ratio for that signature tangy taste.</q>',
                price: 2e79, // 20 quinvigintillion
                icon: [2, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Stroopwafels',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Reverse engineering has recreated authentic Dutch caramel syrup for perfect consistency.</q>',
                price: 1e80, // 100 quinvigintillion
                icon: [3, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
            
            },
            {
                name: 'Improved Macaroons',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Nanotechnology has developed the perfect French almond flour and aged egg white formula.</q>',
                price: 5e80, // 500 quinvigintillion
                icon: [4, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Empire biscuits',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>3D printing technology has perfected the Scottish shortbread recipe with royal icing precision.</q>',
                price: 2.5e81, // 2.5 sexvigintillion
                icon: [5, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
             
            },
            {
                name: 'Improved Madeleines',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Gas chromatography has discovered the optimal lemon zest concentration for classic French shell-shaped cakes.</q>',
                price: 1e82, // 10 sexvigintillion
                icon: [12, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
       
            },
            {
                name: 'Improved Palmiers',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Robotics has developed a precise puff pastry folding technique for perfect palm leaf shapes.</q>',
                price: 6e82, // 60 sexvigintillion
                icon: [13, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
        
            },
            {
                name: 'Improved Palets',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Laser spectroscopy has perfected the Brittany-style shortbread technique for the ideal golden edge.</q>',
                price: 1.5e83, // 150 sexvigintillion
                icon: [12, 4],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
     
            },
            {
                name: 'Improved Plain cookies',
                desc: 'Cookie production multiplier <b>+2%</b>.',
                ddesc: 'Cookie production multiplier <b>+2%</b>.<q>Advanced data modeling has revealed that fresher butter leads to superior cookie texture and flavor.</q>',
                price: 1e66, // 100 unvigintillion
                icon: [2, 3],
                pool: 'cookie',
                require: 'Box of improved cookies',
                power: 2,
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
            console.error('Invalid ' + upgradeType + ' upgrade data:', upgradeInfo);
            return false;
        }
        
        // Price validation
        if (!isFinite(upgradeInfo.price) || upgradeInfo.price < 0) {
            console.error('Invalid price for ' + upgradeType + ' upgrade:', upgradeInfo.name, upgradeInfo.price);
            return false;
        }
        
        // Required fields validation
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            if (typeof upgradeInfo[field] !== 'number' || !isFinite(upgradeInfo[field]) || upgradeInfo[field] < 0) {
                console.error('Invalid ' + field + ' for ' + upgradeType + ' upgrade:', upgradeInfo.name, upgradeInfo[field]);
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
    }



    // Create cookie upgrade (refactored)
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
            // Create cookie upgrades using the proper Cookie Clicker method
            // NOTE: Don't pass require to Game.NewUpgradeCookie - we'll handle it ourselves
            Game.NewUpgradeCookie({
                name: upgradeInfo.name,
                icon: upgradeInfo.icon,
                power: upgradeInfo.power,
                price: upgradeInfo.price
                // require: upgradeInfo.require || ''  // REMOVED - we handle requirements ourselves
            });
            
            // Get the created upgrade object
            var upgrade = Game.Upgrades[upgradeInfo.name];
            if (!upgrade) {
                console.warn('Failed to create cookie upgrade:', upgradeInfo.name);
                return;
            }
            
            // Set default canBuy function (will be overridden for upgrades with requirements)
            upgrade.canBuy = function() {
                // Check if we have enough money
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
            
            // Apply appropriate formatting based on requirement
            if (upgradeInfo.require === 'Box of improved cookies') {
                // Check if the required upgrade exists before accessing its properties
                if (Game.Upgrades['Box of improved cookies']) {
                    var requireText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon([34, 4]) + ' Box of improved cookies</div>';
                    var modSourceText = '<div style="font-size:80%;text-align:center;margin-top:2px;">Part of <span style="margin: 0 4px;">' + tinyIcon(modIcon) + '</span> ' + modName + '</div>';
                    var combinedText = requireText + '<div style="height:2px;"></div>' + modSourceText + '<div class="line"></div>';
                    
                    upgrade.ddesc = combinedText + upgradeInfo.ddesc;
                    upgrade.desc = combinedText + upgradeInfo.desc;
                } else {
                    // Fallback if the required upgrade doesn't exist yet
                    console.warn('Required upgrade "Box of improved cookies" not found for:', upgradeInfo.name);
                    addSourceText(upgrade);
                }
            } else {
                addSourceText(upgrade);
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
            new Game.Upgrade(upgradeInfo.name, upgradeInfo.ddesc, upgradeInfo.price, upgradeInfo.icon);
            
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
    }
    
    // Apply upgrade effects function
    function applyUpgradeEffects(cps) {
        // Apply cookie upgrade effects manually (like the working upgrades.js)
        for (var i = 0; i < upgradeData.cookie.length; i++) {
            var upgradeInfo = upgradeData.cookie[i];
            if (Game.Upgrades[upgradeInfo.name] && Game.Upgrades[upgradeInfo.name].bought) {
                // Use the power value from the actual upgrade object
                var upgrade = Game.Upgrades[upgradeInfo.name];
                var multiplier = 1 + (upgrade.power / 100); // Convert power to percentage
                cps *= multiplier;
            }
        }
        
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
        
        // Normal unlock condition checking (when debug mode is off)
        // Check generic upgrade unlock conditions (like the working upgrades.js)
        for (var i = 0; i < upgradeData.generic.length; i++) {
            var upgradeInfo = upgradeData.generic[i];
            
            if (Game.Upgrades[upgradeInfo.name]) {
                var shouldUnlock = false;
                var wasUnlocked = Game.Upgrades[upgradeInfo.name].unlocked;
                
                // Only unlock if there's a specific unlock condition
                if (upgradeInfo.unlockCondition) {
                    shouldUnlock = upgradeInfo.unlockCondition();
                }
                // If no unlock condition, keep the upgrade locked
                // The canBuy() function will handle purchase availability based on money
                
                // Check if unlock status changed (the custom getter will handle the actual unlock logic)
                var isUnlockedNow = Game.Upgrades[upgradeInfo.name].unlocked;
                if (wasUnlocked != isUnlockedNow) {
                    uiNeedsRefresh = true;
                }
            } else {
                // Upgrade not found - this is expected for some cases
            }
        }
        
        // Check kitten upgrade unlock conditions (silent - only unlock if needed)
        for (var i = 0; i < upgradeData.kitten.length; i++) {
            var upgradeInfo = upgradeData.kitten[i];
            
            if (Game.Upgrades[upgradeInfo.name] && upgradeInfo.unlockCondition) {
                var wasUnlocked = Game.Upgrades[upgradeInfo.name].unlocked;
                upgradeInfo.unlockCondition();
                
                // Check if unlock status changed (the custom getter will handle the actual unlock logic)
                var isUnlockedNow = Game.Upgrades[upgradeInfo.name].unlocked;
                if (wasUnlocked != isUnlockedNow) {
                    uiNeedsRefresh = true;
                }
            }
        }
        
        // Check building upgrade unlock conditions
        for (var i = 0; i < upgradeData.building.length; i++) {
            var upgradeInfo = upgradeData.building[i];
            if (Game.Upgrades[upgradeInfo.name] && upgradeInfo.unlockCondition) {
                var wasUnlocked = Game.Upgrades[upgradeInfo.name].unlocked;
                upgradeInfo.unlockCondition();
                
                // Check if unlock status changed (the custom getter will handle the actual unlock logic)
                var isUnlockedNow = Game.Upgrades[upgradeInfo.name].unlocked;
                if (wasUnlocked != isUnlockedNow) {
                    uiNeedsRefresh = true;
                }
            }
        }
        
        // Check cookie upgrade unlock conditions
        if (upgradeData.cookie && Array.isArray(upgradeData.cookie)) {
            for (var i = 0; i < upgradeData.cookie.length; i++) {
                var upgradeInfo = upgradeData.cookie[i];
                
                if (Game.Upgrades[upgradeInfo.name]) {
                    var upgrade = Game.Upgrades[upgradeInfo.name];
                    var shouldUnlock = false;
                    
                    // ONLY set unlockCondition and canBuy functions if they don't exist yet
                    // This prevents constant overriding and flickering
                    if (upgradeInfo.require && !upgrade.unlockCondition) {
                        // Force the upgrade to be locked initially (only once)
                        upgrade.unlocked = 0;
                        
                        // Create the unlockCondition function (only once)
                        upgrade.unlockCondition = function() {
                            // Check if it's an upgrade requirement first (more specific)
                            if (Game.Upgrades[upgradeInfo.require]) {
                                // It's an upgrade requirement - check if owned
                                return Game.Has(upgradeInfo.require);
                            } else if (Game.Achievements[upgradeInfo.require]) {
                                // It's an achievement requirement - check if won
                                return Game.Achievements[upgradeInfo.require].won;
                            } else {
                                // Fallback - assume it's an upgrade and check if owned
                                return Game.Has(upgradeInfo.require);
                            }
                        };
                        
                        // Create the canBuy function (only once)
                        upgrade.canBuy = function() {
                            // Check if the requirement is met first
                            if (this.unlockCondition && !this.unlockCondition()) {
                                return false; // Can't buy if requirement not met
                            }
                            
                            // Then check if we have enough money
                            var actualPrice = this.getPrice ? this.getPrice() : this.price;
                            return this.unlocked && !this.bought && Game.cookies >= actualPrice;
                        };
                    }
                    
                    // Track unlock status before checking
                    var wasUnlocked = upgrade.unlocked;
                    
                    // Now check if the unlock condition is met (only if unlockCondition exists)
                    if (upgrade.unlockCondition) {
                        shouldUnlock = upgrade.unlockCondition();
                        
                        // Only unlock if the condition is met and it's not already unlocked
                        if (shouldUnlock && !upgrade.unlocked) {
                            // Don't call Game.Unlock() - let our custom unlocked property handle it
                            // Game.Unlock(upgradeInfo.name);
                        }
                    }
                    
                    // Only unlock if there's a specific unlock condition AND it's met
                    if (upgradeInfo.require && shouldUnlock && !upgrade.unlocked) {
                        // Don't call Game.Unlock() - let our custom unlocked property handle it
                        // Game.Unlock(upgradeInfo.name);
                    }
                    
                    // Check if unlock status changed (the custom getter will handle the actual unlock logic)
                    var isUnlockedNow = upgrade.unlocked;
                    if (wasUnlocked != isUnlockedNow) {
                        uiNeedsRefresh = true;
                    }
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
        
        // Check for upgrades that can be purchased (money-based unlocks)
        var modUpgradeNames = getModUpgradeNames();
        modUpgradeNames.forEach(name => {
            if (Game.Upgrades[name] && !Game.Upgrades[name].require) {
                // Only auto-unlock upgrades without requirements
                var actualPrice = Game.Upgrades[name].getPrice ? Game.Upgrades[name].getPrice() : Game.Upgrades[name].price;
                if (Game.cookies >= actualPrice && !Game.Upgrades[name].unlocked) {
                    Game.Upgrades[name].unlocked = 1;
                }
            }
        });
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
            baseSaveHash: computeBaseSaveHash(),
            upgrades: {}
        };
        
        debugLog('saveUpgradesData: baseSaveHash updated');
        
                // Save the purchase state of each of our custom upgrades
        // Always include states even if upgrades are currently removed (use persisted snapshot)
        var modUpgradeNames = getModUpgradeNames();
        
        // Debug: Check if kitten upgrades exist in game during save
        var kittenUpgradesInGame = kittenUpgradeNames.filter(name => Game.Upgrades[name]);
        var kittenUpgradesBought = kittenUpgradesInGame.filter(name => Game.Upgrades[name] && Game.Upgrades[name].bought > 0);
        // Minimal kitten summary to keep console clean
        debugLog('saveUpgradesData: kitten summary', kittenUpgradesBought.length, '/', kittenUpgradeNames.length);
        
        modUpgradeNames.forEach(name => {
                        if (Game.Upgrades[name]) {
                            var boughtState = Game.Upgrades[name].bought || 0;
                modData.upgrades[name] = { bought: boughtState };
                // keep console clean for individual upgrades
                        }
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
            baseSaveHash: computeBaseSaveHash(),
            achievements: {},
            currentRunMaxCombinedTotal: currentRunData.maxCombinedTotal || 0,
            // Save granular control settings
            shadowAchievementMode: shadowAchievementMode,
            enableCookieUpgrades: enableCookieUpgrades,
            enableBuildingUpgrades: enableBuildingUpgrades,
            enableKittenUpgrades: enableKittenUpgrades
        };
        
        // Save the won state of each of our custom achievements
        modAchievementNames.forEach(name => {
            if (Game.Achievements[name]) {
                modData.achievements[name] = {
                    won: Game.Achievements[name].won || 0
                };
            }
        });
        
        // Convert to JSON string for saving
        const saveString = JSON.stringify(modData);
        return saveString;
    }
    
    // Function to handle deferred loading after initialization is complete
    function applyDeferredSaveData() {
        if (!deferredSaveData || !modInitialized) return;
        
        try {
            debugLog('applyDeferredSaveData: begin');
            isLoadingModData = true;
            
            var modData = deferredSaveData;
            // Guard: ensure the staged data belongs to the currently loaded save
            if (modData.gameSignature) {
                var matchesCurrent = (
                    (modData.gameSignature.bakeryName||'') === (Game.bakeryName||'') &&
                    (modData.gameSignature.startDate||0) === (Game.startDate||0) &&
                    (modData.gameSignature.resets||0) === (Game.resets||0)
                );
                if (!matchesCurrent) {
                    debugLog('applyDeferredSaveData: signature mismatch; ignoring');
                    deferredSaveData = null;
                    isLoadingModData = false;
                    return;
                }
            }
            debugLog('applyDeferredSaveData: keys=', Object.keys(modData||{}).join(','));
            
            // Load upgrades data first
            if (modData.upgrades) {
                debugLog('applyDeferredSaveData: upgrades=', Object.keys(modData.upgrades||{}).length);
                
                // Debug: Check if kitten upgrades are in the save data
                
                // quiet kitten list
                
                Object.keys(modData.upgrades).forEach(upgradeName => {
                    // Debug: Check if kitten upgrades exist in game during restore
                    if (kittenUpgradeNames.includes(upgradeName) && !Game.Upgrades[upgradeName]) {
                        // quiet missing kitten upgrade names
                    }
                    
                    if (Game.Upgrades[upgradeName]) {
                        var savedBoughtState = modData.upgrades[upgradeName].bought || 0;
                        
                        // For Order upgrades, always preserve the saved bought state
                        // Their unlock conditions depend on achievements which may not be loaded yet
                        var isOrderUpgrade = upgradeName.startsWith('Order of the ');
                        
                        if (isOrderUpgrade) {
                            // Always preserve saved state for Order upgrades
                            Game.Upgrades[upgradeName].bought = savedBoughtState > 0 ? 1 : 0;
                            
                            // IMPORTANT: Always start Order upgrades as locked on load
                            // Our checkAndUnlockOrderUpgrades function will set the proper unlock state
                            // This prevents blinking where upgrades show unlocked before requirements are checked
                            if (Game.Upgrades[upgradeName]._unlocked !== undefined) {
                                Game.Upgrades[upgradeName]._unlocked = 0;
                            }
                            Game.Upgrades[upgradeName].unlocked = 0;
                        } else {
                            // For kitten upgrades, preserve purchase state during load
                            // Their unlock conditions depend on achievements which may not be fully loaded yet
                            var isKittenUpgrade = kittenUpgradeNames.includes(upgradeName);
                            
                            if (isKittenUpgrade) {
                                // Always preserve saved state for kitten upgrades
                                Game.Upgrades[upgradeName].bought = savedBoughtState > 0 ? 1 : 0;
                                
                                // Start kitten upgrades as locked on load - our function will set proper unlock state
                                if (Game.Upgrades[upgradeName]._unlocked !== undefined) {
                                    Game.Upgrades[upgradeName]._unlocked = 0;
                                }
                                Game.Upgrades[upgradeName].unlocked = 0;
                            } else {
                                // For all other upgrades, respect the save state
                                // If it's in the save, the player owned it - no validation needed
                                Game.Upgrades[upgradeName].bought = savedBoughtState > 0 ? 1 : 0;
                                
                                // Start all upgrades as locked on load - our function will set proper unlock state
                                if (Game.Upgrades[upgradeName]._unlocked !== undefined) {
                                    Game.Upgrades[upgradeName]._unlocked = 0;
                                }
                                Game.Upgrades[upgradeName].unlocked = 0;
                            }
                        }
                    }
                });
            }
            
            // Load achievements data
            if (modData.achievements) {
                debugLog('applyDeferredSaveData: achievements=', Object.keys(modData.achievements||{}).length);
                Object.keys(modData.achievements).forEach(achievementName => {
                    if (Game.Achievements[achievementName]) {
                        var savedWonState = modData.achievements[achievementName].won || 0;
                        
                        if (savedWonState > 0) {
                            markAchievementWonFromSave(achievementName);
                        } else {
                            Game.Achievements[achievementName].won = 0;
                        }
                        // quiet per-achievement logs
                    }
                });
            }
            
            // Load lifetime data - merge with current data instead of replacing
            if (modData.lifetime) {
                debugLog('applyDeferredSaveData: lifetime');
                
                // Reset garden sacrifice time on load to prevent save scumming
                lifetimeData.lastGardenSacrificeTime = 0;
                
                // Preserve current session data by taking the maximum of saved vs current
                lifetimeData.reindeerClicked = Math.max(lifetimeData.reindeerClicked || 0, modData.lifetime.reindeerClicked || 0);
                lifetimeData.stockMarketAssets = Math.max(lifetimeData.stockMarketAssets || 0, modData.lifetime.stockMarketAssets || 0);
                lifetimeData.shinyWrinklersPopped = Math.max(lifetimeData.shinyWrinklersPopped || 0, modData.lifetime.shinyWrinklersPopped || 0);
                lifetimeData.wrathCookiesClicked = Math.max(lifetimeData.wrathCookiesClicked || 0, modData.lifetime.wrathCookiesClicked || 0);
                lifetimeData.totalGardenSacrifices = Math.max(lifetimeData.totalGardenSacrifices || 0, modData.lifetime.totalGardenSacrifices || 0);
                lifetimeData.totalCookieClicks = Math.max(lifetimeData.totalCookieClicks || 0, modData.lifetime.totalCookieClicks || 0);
                lifetimeData.wrinklersPopped = Math.max(lifetimeData.wrinklersPopped || 0, modData.lifetime.wrinklersPopped || 0);
                lifetimeData.elderCovenantToggles = Math.max(lifetimeData.elderCovenantToggles || 0, modData.lifetime.elderCovenantToggles || 0);
                lifetimeData.pledges = Math.max(lifetimeData.pledges || 0, modData.lifetime.pledges || 0);
                lifetimeData.gardenSacrifices = Math.max(lifetimeData.gardenSacrifices || 0, modData.lifetime.gardenSacrifices || 0);
                lifetimeData.totalSpellsCast = Math.max(lifetimeData.totalSpellsCast || 0, modData.lifetime.totalSpellsCast || 0);
                
                // For godUsageTime, merge the objects properly
                if (modData.lifetime.godUsageTime) {
                    if (!lifetimeData.godUsageTime) lifetimeData.godUsageTime = {};
                    for (var godName in modData.lifetime.godUsageTime) {
                        lifetimeData.godUsageTime[godName] = Math.max(
                            lifetimeData.godUsageTime[godName] || 0,
                            modData.lifetime.godUsageTime[godName] || 0
                        );
                    }
                }
            }
            
            // Load mod settings
            if (modData.settings) {
                Object.keys(modData.settings).forEach(key => {
                    if (key in modSettings) {
                        modSettings[key] = modData.settings[key];
                    }
                });
                
                // Apply loaded settings to the actual control variables
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
            }
            
            // Load modTracking data
            if (modData.modTracking) {
                // Restore modTracking values from save

                modTracking.shinyWrinklersPopped = modData.modTracking.shinyWrinklersPopped || 0;
                modTracking.wrathCookiesClicked = modData.modTracking.wrathCookiesClicked || 0;
                modTracking.templeSwapsTotal = modData.modTracking.templeSwapsTotal || 0;
                modTracking.soilChangesTotal = modData.modTracking.soilChangesTotal || 0;
                // lastCookieClicks/lastReindeerClicked no longer tracked in modTracking
                modTracking.lastSeasonalReindeerCheck = modData.modTracking.lastSeasonalReindeerCheck || 0;
                modTracking.godUsageTime = modData.modTracking.godUsageTime || {};
                modTracking.currentSlottedGods = modData.modTracking.currentSlottedGods || {};
                // Clamp seasonal reindeer baseline to current value to avoid missing first pop
                modTracking.lastSeasonalReindeerCheck = Math.min(modTracking.lastSeasonalReindeerCheck || 0, Game.reindeerClicked || 0);
                
                if (debugMode) {
                    console.log('Just Natural Expansion: Loaded modTracking data:', modTracking);
                }
            }
            
            // Force recalculation to apply effects immediately after loading
            setTimeout(() => {
                // if (Game.CalculateGains) { Game.CalculateGains(); }
                // if (Game.recalculateGains) { Game.recalculateGains = 1; }
                // if (Game.RefreshStore) { Game.RefreshStore(); }
                // if (Game.upgradesToRebuild !== undefined) { Game.upgradesToRebuild = 1; }
            }, 100);
            

            
            // Clear the deferred data
            deferredSaveData = null;
            isLoadingModData = false;
            debugLog('applyDeferredSaveData: end');
            
        } catch (error) {
            console.warn('Error applying deferred save data:', error);
            deferredSaveData = null;
            isLoadingModData = false;
        }
    }
    
    
        
    // Function to show the initial leaderboard/non-leaderboard choice prompt
    function showInitialChoicePrompt() {
        if (Game.Prompt) {
            Game.Prompt(
                '<id InitialChoice><h3>Welcome to ' + modName + '!</h3><div class="block">' +
                tinyIcon(modIcon) + '<div class="line"></div>' +
                'Do you want to install in Competition or Full Experience Mode<br><br>' +
                '<div style="text-align: left;">' +
                '<b>Competition:</b> Achievements are Shadow Achievements and don\'t award milk, no new upgrades are added, Gameplay is not changed. Safe for competitive play, if not a bit boring.<br><br>' +
                '<b>Full Experience:</b> Achievements award milk. New upgrades, items, and gameplay features are added. Your CPS may change.' +
                '</div><br><br>' +
                'These settings can be changed at any time in the Options Menu.</div>',
                [
                    ['Competition', 'Game.ClosePrompt(); showInitialChoiceLeaderboard();', 'float:left'],
                    ['Full Experience', 'Game.ClosePrompt(); showInitialChoiceFullMod();', 'float:right']
                ]
            );
        } else {
            // Fallback if Game.Prompt is not available
            console.warn('Game.Prompt not available, using default leaderboard mode');
            shadowAchievementMode = true;
            enableCookieUpgrades = false;
            enableBuildingUpgrades = false;
            enableKittenUpgrades = false;
            modSettings.hasMadeInitialChoice = true;
            continueModInitialization();
        }
    }
    
    // Helper function for leaderboard mode choice
    window.showInitialChoiceLeaderboard = function() {
        // User chose Leaderboard Mode
        shadowAchievementMode = true;
        enableCookieUpgrades = false;
        enableBuildingUpgrades = false;
        enableKittenUpgrades = false;
        
        // Update modSettings to match
        modSettings.shadowAchievements = true;
        modSettings.enableCookieUpgrades = false;
        modSettings.enableBuildingUpgrades = false;
        modSettings.enableKittenUpgrades = false;
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
        
        // Update modSettings to match
        modSettings.shadowAchievements = false;
        modSettings.enableCookieUpgrades = true;
        modSettings.enableBuildingUpgrades = true;
        modSettings.enableKittenUpgrades = true;
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
    
    // Function to continue mod initialization after user choice
    function continueModInitialization() {
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

        // Create upgrade definitions only once
        createUpgrades();
        
        // Check for upgrades that are already unlocked on mod load
                                // Create upgrades respecting current toggle flags (do NOT create disabled categories)
        addUpgradesToGame();
        
        
        // Initialize tracking variables
        initializeSeasonalReindeerTracking();
        initializeShinyWrinklerTracking();
        initializeTempleSwapTracking();
        
        // Initialize session baselines with current game state
        initializeSessionBaselines();
        initializeSoilChangeTracking();
        initializeWrathCookieTracking();
        
        // Register all hooks with centralized system
        registerAllHooks();
        
        // Create achievements and other mod features
        initAchievements();
        
        // Set up custom building multipliers (after game is fully loaded)
        setTimeout(addCustomBuildingMultipliers, 2000);
        
        // Initialize menu system
        injectMenus();
        
        // Mark mod as initialized after all setup is complete
        setTimeout(function() {
            modInitialized = true;
            

            
            // Apply any deferred save data now that initialization is complete
            if (deferredSaveData) {
                applyDeferredSaveData();
            }
            
            // Sync mod settings to ensure they're properly applied
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
            
            // Update menu buttons to reflect loaded settings
            updateMenuButtons();
            
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
                    return [
                        'News : People all over the globe are suddenly feeling much less accomplished. Scientists baffled.',
                        'News : Things seem different—no one can place a finger on it—but everything looks tilted 4 degrees to the left, or maybe it is to the right.',
                        'News : Reports from all over the globe of new kittens being spotted. Early reports suggest they are much lazier than normal.',
                        'News : What in the name of our grandmas just happened? The cookies are acting strange.',
                        'News : Whispers in the shadows suggest there are now... more shadows.',
                        'News : Hundreds of new challenges quietly arrive. No one told the cookies or those who click them. People seem utterly unprepared, but generally gleeful.',
                        'News : Unconfirmed reports claim at least 450 new ways to feel inadequate. People all over the world are putting on their best clicking gloves.',
                        'News : Stock market instability linked to unnatural upgrade inflation. Everything just seems more expensive these days says everyone.',
                        'News : Pantheon activity spikes as gods are swapped at alarming rates. Gods are confused. People are more confused, unsure who they are even worshipping anymore.',
                        'News : Soil composition changes detected. Gardeners report "increased anxiety and delight."',
                        'News : Wrath cookies are being clicked at unprecedented rates. Scientists concerned.',
                        'News : Stock market profits are soaring. Economists confused. Some traders seem inclined to lose all their money for no apparent reason.',
                        'News : Garden sacrifices are on the rise. Plants are nervous, sugar hornets seem pleased.',
                        'News : Cookie clicks are reaching new heights. Fingers are tired, but the cookies are happy.',
                        'News : Wrinklers are being popped at record rates. Eldritch beings are annoyed. Rumors of a new wrinkler in the universe, though no one has actually seen it.',
                        'News : Elder covenants are increasing. Grandmas are confused and becoming bipolar, things are getting weird in here.',
                        'News : Seasonal reindeer are being clicked more often. Santa is concerned, but says elf spirits remain high at the North Pole.',
                        'News : Temple swaps are happening more frequently. Gods are dizzy. People interviewed unable to confirm their own religion.',
                        'News : General tribalism and competition increase. People proudly stating how many challenges they have completed, earth being divided into camps.',
                        'News : Rumors that the Secret Society of the Cookies are resurfacing, spreading like wildfire around the world.',
                        'News : Mystery figures wearing cloaks and performing strange cookie rituals in the shadows spotted in multiple cities worldwide.',
                        'News : Spell abuse on the rise, people seem to be casting spells at a record rate. Judgement and safety concerns are rising.',
                        'News : Holiday seasons seem to be flipping around randomly and in quick succession. Many people are not noticing but this reporter is frankly concerned and alarmed.',
                        'News : New cookie clicker mod rumored to be appearing everywhere. Many people are citing bouts of good luck for spreading the word.',
                        'News : The words Just Natural Expansion are being whispered in the shadows. No one is sure what it means, but people seem to be happy to hear it.',
                        'News : Despite all of the world changes as of late, scientist confirm cookies remain the most delicious food in the universe.',
                        'News : Soil changes are becoming more common. Gardeners are confused. Rumors of a new soil in the universe.'
                    ];
                });
            }
        }, 3000); // Give extra time for everything to settle
    }
    
    // Register the mod using the proper Cookie Clicker Modding API (like upgrades.js)
    // Log when Cookie Clicker interacts with our mod's save system
    debugLog('Registering mod with Cookie Clicker save system...');
    
    Game.registerMod('JustNaturalExpansionMod', {
        name: modName,
        version: modVersion,
        
        // init() is called when the mod is first loaded
        init: function() {
            // Show mod loaded notification
            new Game.Note(modName + ' v' + modVersion + ' Mod Loaded!', 'Use the options menu to configure settings for ' + modName + '.', modIcon, 999);
            // Start initialization but defer choice check until save data loads
            // If there's no save data, load() won't be called, so we need to trigger the check
            setTimeout(function() {
                checkAndShowInitialChoice();
            }, 100); // Small delay to let load() run if it's going to
            
            // Initial check for all upgrades after achievements are loaded
            var self = this; // Capture 'this' reference
            setTimeout(function() {
                self.checkAndUnlockAllUpgrades();
            }, 1000);
            
            // Register the check hook for ongoing upgrade monitoring
            registerHook('check', function() {
                self.checkAndUnlockAllUpgrades();
            }, 'Check and unlock all upgrades based on their requirements');
            
            // Hook into the vanilla game's upgrade purchase process to maintain unlock states
            // This prevents the vanilla game from resetting our carefully managed unlock states
            var originalBuyFunction = Game.Upgrades.__proto__.buy || Game.Upgrades.__proto__.Buy;
            if (originalBuyFunction) {
                Game.Upgrades.__proto__.buy = function() {
                    // Call the original buy function
                    var result = originalBuyFunction.apply(this, arguments);
                    
                    // Immediately restore our unlock states after purchase
                    // This prevents the vanilla game from showing all upgrades as unlocked
                    setTimeout(function() {
                        self.checkAndUnlockAllUpgrades();
                    }, 0);
                    
                    return result;
                };
            }
            
            // Also hook into the game's store refresh system
            if (Game.RefreshStore) {
                var originalRefreshStore = Game.RefreshStore;
                Game.RefreshStore = function() {
                    // Call the original refresh function
                    var result = originalRefreshStore.apply(this, arguments);
                    
                    // Immediately restore our unlock states after store refresh
                    setTimeout(function() {
                        self.checkAndUnlockAllUpgrades();
                    }, 0);
                    
                    return result;
                };
            }
        },
        
        // save() is called automatically by the game when saving
        save: function() {
            debugLog('mod.saveSystem.save: ===== BEGIN SAVE FUNCTION =====');
            // Minimal save diagnostics
            debugLog('mod.saveSystem.save: start');
            
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
            
            // Check if this is an ascension (Game.OnAscend > 0)
            // If ascending, don't save upgrade data so they reset to unpurchased state
            
            
            // Combine achievements and lifetime data
            const achievementsData = JSON.parse(saveAchievementsData());
            
            // Always save upgrade data (ascension reset is handled separately in handleReincarnate)
            var upgradesData = JSON.parse(saveUpgradesData());
            
            // Create a copy of lifetime data without the sacrifice time
            // Debug log removed for clean console
            var lifetimeDataToSave = {
                reindeerClicked: lifetimeData.reindeerClicked || 0,
                stockMarketAssets: lifetimeData.stockMarketAssets || 0,
                shinyWrinklersPopped: lifetimeData.shinyWrinklersPopped || 0,
                wrathCookiesClicked: lifetimeData.wrathCookiesClicked || 0,
                totalGardenSacrifices: lifetimeData.totalGardenSacrifices || 0,
                totalCookieClicks: lifetimeData.totalCookieClicks || 0,
                wrinklersPopped: lifetimeData.wrinklersPopped || 0,
                elderCovenantToggles: lifetimeData.elderCovenantToggles || 0,
                pledges: lifetimeData.pledges || 0,
                gardenSacrifices: lifetimeData.gardenSacrifices || 0,
                totalSpellsCast: lifetimeData.totalSpellsCast || 0,
                godUsageTime: lifetimeData.godUsageTime || {}
                // Note: lastGardenSacrificeTime is intentionally excluded
            };
            // Debug log removed for clean console
            
            // Merge the data
            const combinedData = {
                version: modVersion,
                gameSignature: {
                    bakeryName: Game.bakeryName || '',
                    startDate: Game.startDate || 0,
                    resets: Game.resets || 0
                },
                baseSaveHash: upgradesData.baseSaveHash || computeBaseSaveHash(), // Include the hash!
                saveTimestamp: currentTime,  // Add timestamp to detect save-before-load cycles
                runtimeSessionId: runtimeSessionId,
                upgrades: upgradesData.upgrades || {},
                achievements: achievementsData.achievements || {},
                lifetime: lifetimeDataToSave,
                settings: modSettings,
                modTracking: {
                    shinyWrinklersPopped: modTracking.shinyWrinklersPopped || 0,
                    wrathCookiesClicked: modTracking.wrathCookiesClicked || 0,
                    templeSwapsTotal: modTracking.templeSwapsTotal || 0,
                    soilChangesTotal: modTracking.soilChangesTotal || 0,
                    // cookie click/reindeer baselines tracked via sessionBaselines
                    lastSeasonalReindeerCheck: modTracking.lastSeasonalReindeerCheck || 0,
                    godUsageTime: modTracking.godUsageTime || {},
                    currentSlottedGods: modTracking.currentSlottedGods || {}
                }
            };
            
            var saveString = JSON.stringify(combinedData);
            debugLog('mod.saveSystem.save: end len=', saveString.length);
            
            return saveString;
        },
        
        // load() is called automatically by the game when loading
        load: function(str) {
            // IMMEDIATELY set loading flag to prevent save loops
            isLoadingModData = true;
            
            debugLog('mod.saveSystem.load: begin len=', str ? str.length : 0);
            
            // ALWAYS reset garden sacrifice timer on any load operation to prevent save scumming
            lifetimeData.lastGardenSacrificeTime = 0;
            // Reset soil baseline on load so first observed soil does not count as a change
            modTracking.previousSoilType = null;
            
            // Skip loading saved data in reset mode to maintain clean state
            if (!resetMode) {
                try {
                    if (!str || str.trim() === '' || str === '{}') {
                        debugLog('mod.saveSystem.load: empty/minimal, skipping');
                        isLoadingModData = false;
                        return;
                    }
                    
                    const modData = JSON.parse(str);
                    debugLog('mod.saveSystem.load: parsed keys=', Object.keys(modData||{}).join(','));
                    
                    // Simple check: do we have any meaningful data?
                    const hasData = modData && (
                        (modData.upgrades && Object.keys(modData.upgrades).length > 0) ||
                        (modData.achievements && Object.keys(modData.achievements).length > 0) ||
                        (modData.lifetime && Object.keys(modData.lifetime).length > 0)
                    );
                    
                    if (!hasData) {
                        debugLog('mod.saveSystem.load: no meaningful data');
                        isLoadingModData = false;
                        return;
                    }
                    
                    // Check if this is fresh data from a save-before-load cycle
                    let isRecentlyGeneratedData = false;
                    if (modData.saveTimestamp) {
                        const dataAge = Date.now() - modData.saveTimestamp;
                        debugLog('mod.saveSystem.load: age=', dataAge, 'ms');
                        
                        // If data was generated very recently (within 1 second), it's likely from save-before-load
                        if (dataAge < 1000) {
                            isRecentlyGeneratedData = true;
                            debugLog('mod.saveSystem.load: recent save-before-load detected');
                        }
                    } else {
                        debugLog('mod.saveSystem.load: no timestamp present');
                    }
                    
                    // Don't restore data generated by this same runtime session (save-before-load cycle)
                    if (isRecentlyGeneratedData || (modData.runtimeSessionId && modData.runtimeSessionId === runtimeSessionId)) {
                        debugLog('mod.saveSystem.load: ignoring current-session data');
                        isLoadingModData = false;
                        return;
                    }
                    
                    debugLog('mod.saveSystem.load: staging legitimate data');
                    
                    // Reset everything first
                    resetAllModDataForNewSave();
                    
                    // Store for later application
                    deferredSaveData = modData;
                    
                    // Load settings immediately
                    if (modData.settings) {
                        Object.keys(modData.settings).forEach(key => {
                            if (key in modSettings) {
                                modSettings[key] = modData.settings[key];
                            }
                        });
                    }
                    
                    // If mod is already initialized, apply immediately
                    if (modInitialized) {
                        debugLog('mod.saveSystem.load: applying now');
                        applyDeferredSaveData();
                    }
                    
                } catch (error) {
                    console.warn('Error parsing mod save data:', error);
                }
            }
            
            // Clear loading flag at the very end
            isLoadingModData = false;
            debugLog('mod.saveSystem.load: end');
        },
        
        /**
         * ORDER UPGRADE UNLOCKING SYSTEM
         * =================================
         * 
         * This system manages the unlocking of ALL upgrades based on their requirements.
         * The approach is simple and consistent:
         * 
         * TIMING:
         * - Launch: Check once after 1 second (when achievements are loaded) - via mod init
         * - Ongoing: Check every 5 seconds via the game's check hook
         * 
         * UNLOCK LOGIC:
         * - All upgrades start locked on creation
         * - Our function checks unlock conditions and sets unlocked state
         * - No property overrides - vanilla game handles the rest
         * - Consistent behavior across all upgrade types
         */
        checkAndUnlockAllUpgrades: function() {
            
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
            
            // Check Order upgrades
            for (var i = 0; i < orderUpgrades.length; i++) {
                var upgradeName = orderUpgrades[i];
                var upgrade = Game.Upgrades[upgradeName];
                
                if (!upgrade || !upgrade.unlockCondition) {
                    continue;
                }
                
                try {
                    var shouldUnlock = upgrade.unlockCondition();
                    var currentlyUnlocked = upgrade.unlocked;
                    
                    if (shouldUnlock && currentlyUnlocked != 1) {
                        upgrade.unlocked = 1;
                        unlockChanged = true;
                    } else if (!shouldUnlock && currentlyUnlocked == 1) {
                        // Lock the upgrade if it no longer meets requirements
                        upgrade.unlocked = 0;
                        unlockChanged = true;
                    }
                } catch (error) {
                    // Silently continue if there's an error
                }
            }
            
            // Check all other upgrades with unlock conditions
            var allUpgradeNames = getModUpgradeNames();
            
            for (var i = 0; i < allUpgradeNames.length; i++) {
                var upgradeName = allUpgradeNames[i];
                var upgrade = Game.Upgrades[upgradeName];
                
                // Skip Order upgrades (already handled above)
                if (upgradeName.startsWith('Order of the ')) {
                    continue;
                }
                
                if (!upgrade || !upgrade.unlockCondition) {
                    continue;
                }
                
                try {
                    var shouldUnlock = upgrade.unlockCondition();
                    var currentlyUnlocked = upgrade.unlocked;
                    
                    if (shouldUnlock && currentlyUnlocked != 1) {
                        upgrade.unlocked = 1;
                        unlockChanged = true;
                    } else if (!shouldUnlock && currentlyUnlocked == 1) {
                        // Lock the upgrade if it no longer meets requirements
                        upgrade.unlocked = 0;
                        unlockChanged = true;
                    }
                } catch (error) {
                    // Silently continue if there's an error
                }
            }
            
            // Refresh store only when upgrades are newly unlocked or locked
            // This prevents unnecessary store refreshes when no changes occur
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
            { building: 'Cursor', level10: 'Freaky jazz hands', level15: 'Spastic jazz hands', level20: 'Epileptic jazz hands' },
            { building: 'Grandma', level10: 'Methuselah', level15: 'Noah', level20: 'Adam' },
            { building: 'Farm', level10: 'Huge tracts of land', level15: 'Massive tracts of land', level20: 'Colossal tracts of land' },
            { building: 'Mine', level10: 'D-d-d-d-deeper', level15: 'D-d-d-d-d-deeper', level20: 'D-d-d-d-d-d-deeper' },
            { building: 'Factory', level10: 'Patently genius', level15: 'Patent pending', level20: 'Patent granted' },
            { building: 'Bank', level10: 'A capital idea', level15: 'A capital notion', level20: 'A capital concept' },
            { building: 'Temple', level10: 'It belongs in a bakery', level15: 'It belongs in a cathedral', level20: 'It belongs in a basilica' },
            { building: 'Wizard tower', level10: 'Motormouth', level15: 'Chatterbox', level20: 'Blabbermouth' },
            { building: 'Shipment', level10: 'Been there done that', level15: 'Been everywhere done everything', level20: 'Been everywhere done everything twice' },
            { building: 'Alchemy lab', level10: 'Phlogisticated substances', level15: 'Phlogisticated compounds', level20: 'Phlogisticated elements' },
            { building: 'Portal', level10: 'Bizarro world', level15: 'Bizarro universe', level20: 'Bizarro multiverse' },
            { building: 'Time machine', level10: 'The long now', level15: 'The longer now', level20: 'The longest now' },
            { building: 'Antimatter condenser', level10: 'Chubby hadrons', level15: 'Plump hadrons', level20: 'Obese hadrons' },
            { building: 'Prism', level10: 'Palettable', level15: 'Palettastic', level20: 'Palettacular' },
            { building: 'Chancemaker', level10: 'Let\'s leaf it at that', level15: 'Lucky stars', level20: 'Lucky numbers' },
            { building: 'Fractal engine', level10: 'Sierpinski rhomboids', level15: 'Fractaliciousest', level20: 'Fractalicious' },
            { building: 'Javascript console', level10: 'Alexandria', level15: 'Debuggerer', level20: 'Debuggerest' },
            { building: 'Idleverse', level10: 'Strange topologies', level15: 'Idleverse implosion', level20: 'Idleverse explosion' },
            { building: 'Cortex baker', level10: 'Gifted', level15: 'Brain feast', level20: 'Brain banquet' },
            { building: 'You', level10: 'Self-improvement', level15: 'Copy that and a half', level20: 'Copy that twice' }
        ];
        
        for (var i = 0; i < levelAchievements.length; i++) {
            var ach = levelAchievements[i];
            var vanilla = findLastVanillaAchievement(ach.level10);
            
            if (vanilla.order > 0) {
                // Level 15 achievement
                createAchievement(
                    ach.level15,
                    "Reach Level <b>15</b> " + ach.building.toLowerCase() + "s.",
                    vanilla.icon,
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
                    vanilla.icon,
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
            { building: 'Cursor', name: 'Click (starring Adam Sandler)', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from cursors.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from cursors.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from cursors.', mult: 7, vanillaTarget: 'Click (starring Adam Sandler)' },
            { building: 'Grandma', name: 'Frantiquities', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from grandmas.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from grandmas.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from grandmas.', mult: 6, vanillaTarget: 'Frantiquities' },
            { building: 'Farm', name: 'Overgrowth', tier4Desc: 'Make <b>1 quattuordecillion cookies</b> just from farms.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from farms.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from farms.', mult: 0, vanillaTarget: 'Overgrowth' },
            { building: 'Mine', name: 'Sedimentalism', tier4Desc: 'Make <b>10 quattuordecillion cookies</b> just from mines.', tier5Desc: 'Make <b>10 quindecillion cookies</b> just from mines.', tier6Desc: 'Make <b>10 sexdecillion cookies</b> just from mines.', mult: 0, vanillaTarget: 'Sedimentalism' },
            { building: 'Factory', name: 'Labor of love', tier4Desc: 'Make <b>100 quattuordecillion cookies</b> just from factories.', tier5Desc: 'Make <b>100 quindecillion cookies</b> just from factories.', tier6Desc: 'Make <b>100 sexdecillion cookies</b> just from factories.', mult: 0, vanillaTarget: 'Labor of love' },
            { building: 'Bank', name: 'Reverse funnel system', tier4Desc: 'Make <b>1 quindecillion cookies</b> just from banks.', tier5Desc: 'Make <b>1 sexdecillion cookies</b> just from banks.', tier6Desc: 'Make <b>1 septendecillion cookies</b> just from banks.', mult: 0, vanillaTarget: 'Reverse funnel system' },
            { building: 'Temple', name: 'Thus spoke you', tier4Desc: 'Make <b>10 quindecillion cookies</b> just from temples.', tier5Desc: 'Make <b>10 sexdecillion cookies</b> just from temples.', tier6Desc: 'Make <b>10 septendecillion cookies</b> just from temples.', mult: 0, vanillaTarget: 'Thus spoke you' },
            { building: 'Wizard tower', name: 'Manafest destiny', tier4Desc: 'Make <b>100 quindecillion cookies</b> just from wizard towers.', tier5Desc: 'Make <b>100 sexdecillion cookies</b> just from wizard towers.', tier6Desc: 'Make <b>100 septendecillion cookies</b> just from wizard towers.', mult: 0, vanillaTarget: 'Manafest destiny' },
            { building: 'Shipment', name: 'Neither snow nor rain nor heat nor gloom of night', tier4Desc: 'Make <b>1 sexdecillion cookies</b> just from shipments.', tier5Desc: 'Make <b>1 septendecillion cookies</b> just from shipments.', tier6Desc: 'Make <b>1 octodecillion cookies</b> just from shipments.', mult: 0, vanillaTarget: 'Neither snow nor rain nor heat nor gloom of night' },
            { building: 'Alchemy lab', name: 'I\'ve got the Midas touch', tier4Desc: 'Make <b>10 sexdecillion cookies</b> just from alchemy labs.', tier5Desc: 'Make <b>10 septendecillion cookies</b> just from alchemy labs.', tier6Desc: 'Make <b>10 octodecillion cookies</b> just from alchemy labs.', mult: 0, vanillaTarget: 'I\'ve got the Midas touch' },
            { building: 'Portal', name: 'Which eternal lie', tier4Desc: 'Make <b>100 sexdecillion cookies</b> just from portals.', tier5Desc: 'Make <b>100 septendecillion cookies</b> just from portals.', tier6Desc: 'Make <b>100 octodecillion cookies</b> just from portals.', mult: 0, vanillaTarget: 'Which eternal lie' },
            { building: 'Time machine', name: 'D&eacute;j&agrave; vu', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from time machines.', tier5Desc: 'Make <b>1 octodecillion cookies</b> just from time machines.', tier6Desc: 'Make <b>1 novemdecillion cookies</b> just from time machines.', mult: 0, vanillaTarget: 'D&eacute;j&agrave; vu' },
            { building: 'Antimatter condenser', name: 'Powers of Ten', tier4Desc: 'Make <b>10 septendecillion cookies</b> just from antimatter condensers.', tier5Desc: 'Make <b>10 octodecillion cookies</b> just from antimatter condensers.', tier6Desc: 'Make <b>10 novemdecillion cookies</b> just from antimatter condensers.', mult: 0, vanillaTarget: 'Powers of Ten' },
            { building: 'Prism', name: 'Now the dark days are gone', tier4Desc: 'Make <b>100 septendecillion cookies</b> just from prisms.', tier5Desc: 'Make <b>100 octodecillion cookies</b> just from prisms.', tier6Desc: 'Make <b>100 novemdecillion cookies</b> just from prisms.', mult: 0, vanillaTarget: 'Now the dark days are gone' },
            { building: 'Chancemaker', name: 'Murphy\'s wild guess', tier4Desc: 'Make <b>1 octodecillion cookies</b> just from chancemakers.', tier5Desc: 'Make <b>1 novemdecillion cookies</b> just from chancemakers.', tier6Desc: 'Make <b>1 vigintillion cookies</b> just from chancemakers.', mult: 0, vanillaTarget: 'Murphy\'s wild guess' },
            { building: 'Fractal engine', name: 'We must go deeper', tier4Desc: 'Make <b>10 octodecillion cookies</b> just from fractal engines.', tier5Desc: 'Make <b>10 novemdecillion cookies</b> just from fractal engines.', tier6Desc: 'Make <b>10 vigintillion cookies</b> just from fractal engines.', mult: 0, vanillaTarget: 'We must go deeper' },
            { building: 'Javascript console', name: 'First-class citizen', tier4Desc: 'Make <b>100 octodecillion cookies</b> just from javascript consoles.', tier5Desc: 'Make <b>100 novemdecillion cookies</b> just from javascript consoles.', tier6Desc: 'Make <b>100 vigintillion cookies</b> just from javascript consoles.', mult: 0, vanillaTarget: 'First-class citizen' },
            { building: 'Idleverse', name: 'Earth-616', tier4Desc: 'Make <b>1 novemdecillion cookies</b> just from idleverses.', tier5Desc: 'Make <b>100 vigintillion cookies</b> just from idleverses.', tier6Desc: 'Make <b>10 duovigintillion cookies</b> just from idleverses.', mult: 0, vanillaTarget: 'Earth-616' },
            { building: 'Cortex baker', name: 'Unthinkable', tier4Desc: 'Make <b>10 novemdecillion cookies</b> just from cortex bakers.', tier5Desc: 'Make <b>10 vigintillion cookies</b> just from cortex bakers.', tier6Desc: 'Make <b>10 unvigintillion cookies</b> just from cortex bakers.', mult: 0, vanillaTarget: 'Unthinkable' },
            { building: 'You', name: 'That\'s all you', tier4Desc: 'Make <b>100 novemdecillion cookies</b> just from You.', tier5Desc: 'Make <b>100 vigintillion cookies</b> just from You.', tier6Desc: 'Make <b>100 unvigintillion cookies</b> just from You.', mult: 0, vanillaTarget: 'That\'s all you' }
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
                
                // Tier 4 achievement (100 quintillion times more than tier 3 - 10^20 increase)
                var tier4Threshold = Math.pow(10, vanillaBaseN + 20);
                createAchievement(
                    ach.name + " II",
                    ach.tier4Desc,
                    vanilla.icon,
                    vanilla.order + 0.00001,
                    (function(buildingName, threshold) {
                        return function() { 
                            return Game.Objects[buildingName] && 
                                   Game.Objects[buildingName].totalCookies >= threshold; 
                        };
                    })(ach.building, tier4Threshold)
                );
                
                // Tier 5 achievement (1000x more than tier 4 - 10^3 increase)
                var tier5Threshold = Math.pow(10, vanillaBaseN + 29);
                createAchievement(
                    ach.name + " III",
                    ach.tier5Desc,
                    vanilla.icon,
                    vanilla.order + 0.00002,
                    (function(buildingName, threshold) {
                        return function() { 
                            return Game.Objects[buildingName] && 
                                   Game.Objects[buildingName].totalCookies >= threshold; 
                        };
                    })(ach.building, tier5Threshold)
                );
                
                // Tier 6 achievement (1000x more than tier 5 - 10^3 increase)
                var tier6Threshold = Math.pow(10, vanillaBaseN + 32);
                createAchievement(
                    ach.name + " IV",
                    ach.tier6Desc,
                    vanilla.icon,
                    vanilla.order + 0.00003,
                    (function(buildingName, threshold) {
                        return function() { 
                            return Game.Objects[buildingName] && 
                                   Game.Objects[buildingName].totalCookies >= threshold; 
                        };
                    })(ach.building, tier6Threshold)
                );
            }
        }
        
        // Create "Beyond the Leaderboard" achievement - awarded when mod has been used outside shadow mode
        var beyondLeaderboardAchievement = createAchievement(
            'Beyond the Leaderboard',
            'Natural Expansion Mod has been used outside of Leaderboard/Competition mode.',
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
            'Unlock all vanilla shadow achievements, except that one.<q>You know the one I meant</q>',
            [17, 5], // Custom icon
            400000.2, // Order as requested
            function() {
                // Check if "Cheated cookies taste awful" has been earned - if so, don't award this achievement
                if (Game.Achievements['Cheated cookies taste awful'] && Game.Achievements['Cheated cookies taste awful'].won) {
                    return false;
                }
                
                // List of required vanilla shadow achievements
                var requiredAchievements = [
                    'Four‑leaf cookie',
                    'Seven horseshoes', 
                    'All‑natural cane sugar',
                    'Endless cycle',
                    'God complex',
                    'Third‑party',
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
                    if (!Game.Achievements[achievementName] || !Game.Achievements[achievementName].won) {
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
    
    }
    
    function checkModAchievements() {
        if (!Game || !Game.Achievements) return;
        
        // Check all mod achievements 
        for (var achId in Game.Achievements) {
            var ach = Game.Achievements[achId];
            if (ach && ach.requirement && !ach.won) {
                try {
                    if (ach.requirement()) {
                        //console.log('🎯 Achievement requirement met:', ach.name);
                        markAchievementWon(ach.name);
                    }
                } catch (e) {
                    console.warn('Error checking achievement requirement:', ach.name, e);
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
        // Check seasonal drops time achievement
        if (Game.startDate) {
            var currentTime = Date.now();
            var timeElapsed = currentTime - Game.startDate;
            var sixtyMinutesInMs = 60 * 60 * 1000;
            
            // Check if within time limit first
            if (timeElapsed <= sixtyMinutesInMs) {
                // Check Easter condition
                var easterComplete = Game.easterEggs && Game.easterEggs.length >= 20;
                
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
                
                // Check Valentine's condition
                var valentinesComplete = Game.Has('Prism heart biscuits');
                
                if (easterComplete && halloweenComplete && christmasComplete && valentinesComplete) {
                    var achievementName = 'Holiday Hoover';
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
            if (Game.cookiesEarned >= 1e12 && Game.cookieClicks <= 0 && Game.UpgradesOwned <= 0) {
                var achievementName = 'Hardercorest';
                if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                    markAchievementWon(achievementName);
                }
            }
        }
        
        // Check hardercorest-er achievement
        if ((Game.ascensionMode == 1 || Game.resets == 0)) {
            if (Game.cookiesEarned >= 1e9) {
                // Check if no more than 15 cookie clicks
                if (Game.cookieClicks <= 15) {
                    // Check if no more than 15 buildings owned
                    let totalBuildingsOwned = 0;
                    for (let buildingName in Game.Objects) {
                        totalBuildingsOwned += Game.Objects[buildingName].amount || 0;
                    }
                    if (totalBuildingsOwned <= 15) {
                        // Check if no more than 15 upgrades owned
                        if (Game.UpgradesOwned <= 15) {
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
                // Check if player has at least 500 of every building type
                var allBuildingsHave500 = true;
                for (var buildingName in Game.Objects) {
                    var building = Game.Objects[buildingName];
                    if (!building || building.amount < 500) {
                        allBuildingsHave500 = false;
                        break;
                    }
                }
                
                if (allBuildingsHave500) {
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
                // Define the exact building counts required (20 down to 1)
                var requiredCounts = FINAL_COUNTDOWN_REQUIRED_COUNTS;
                
                // Check if each building has exactly the required amount
                var allBuildingsCorrect = true;
                for (var buildingName in requiredCounts) {
                    var building = Game.Objects[buildingName];
                    if (!building || building.amount !== requiredCounts[buildingName]) {
                        allBuildingsCorrect = false;
                        break;
                    }
                }
                
                if (allBuildingsCorrect) {
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
        
        // Check sugar lumps achievement
        var sugarLumps = Game.lumps || 0;
        if (sugarLumps >= 100) {
            var achievementName = 'Sweet Child of Mine';
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
            // Count unique mature plant types
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
        
        // Check God of All Gods achievement (24 hours per god)
        if (Game.Objects['Temple'] && Game.Objects['Temple'].minigame && Game.Objects['Temple'].minigame.godsById) {
            var pantheon = Game.Objects['Temple'].minigame;
            
            // Safety check: ensure there are actually gods available
            if (pantheon.godsById && pantheon.godsById.length > 0) {
                var allGodsUsed = true;
                var requiredTime = 86400 * 1000; // 24 hours in milliseconds
                
                for (var i = 0; i < pantheon.godsById.length; i++) {
                    var god = pantheon.godsById[i];
                    if (god && god.name) {
                        var godTime = modTracking.godUsageTime[god.name] || 0;
                        if (godTime < requiredTime) {
                            allGodsUsed = false;
                            break;
                        }
                    }
                }
                
                if (allGodsUsed) {
                    var achievementName = 'God of All Gods';
                    if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                        markAchievementWon(achievementName);
                    }
                }
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
        
        if (buildingsSoldTotal >= 10000) {
            var achievementName = 'Asset Liquidator';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (buildingsSoldTotal >= 25000) {
            var achievementName = 'Flip City';
            if (Game.Achievements[achievementName] && !Game.Achievements[achievementName].won) {
                markAchievementWon(achievementName);
            }
        }
        
        if (buildingsSoldTotal >= 50000) {
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
                
                        // Force upgrade check after earning The Final Challenger
        setTimeout(function() {
            // Force our upgrades to be recognized by the vanilla game
            var orderUpgrades = [
                'Order of the Golden Crumb',
                'Order of the Impossible Batch', 
                'Order of the Shining Spoon',
                'Order of the Cookie Eclipse',
                'Order of the Enchanted Whisk',
                'Order of the Eternal Cookie'
            ];
            
            for (var i = 0; i < orderUpgrades.length; i++) {
                var upgradeName = orderUpgrades[i];
                var upgrade = Game.Upgrades[upgradeName];
                if (upgrade && upgrade.unlockCondition) {
                    // Force the upgrade to check its unlock condition
                    var shouldUnlock = upgrade.unlockCondition();
                    if (shouldUnlock && upgrade.unlocked !== 1) {
                        upgrade.unlocked = 1;
                        console.log('🔓 Forced unlock of:', upgradeName);
                    }
                }
            }
            
            if (Game.CheckUpgrades) Game.CheckUpgrades();
            if (Game.updateUpgradesMenu) Game.updateUpgradesMenu();
            if (Game.RebuildStore) Game.RebuildStore();
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

})();
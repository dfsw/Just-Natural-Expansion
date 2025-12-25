// Just Natural Expansion - Heavenly Upgrades
(function() {
    'use strict';
    
    const SIMPLE_MOD_NAME = 'Just Natural Expansion';
    const MOD_HU_VERSION = '1.0.0';
    var isInitialized = false;
    const MOD_ICON = [15, 7];
    const CUSTOM_SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/updatedSpriteSheet.png';
    const GARDEN_SPRITE_SHEET_URL = 'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png';
    const MOD_PLANT_KEYS = ['sparklingSugarCane', 'krazyKudzu', 'magicMushroom'];
    const WEAKEST_LINK_UPGRADES = [
        { name: 'Weakest link', mult: 16 },
        { name: 'The next weakest link', mult: 12 },
        { name: 'No more weak links', mult: 8 }
    ];

    function isModPlant(plantKey) {
        if (!plantKey) return false;
        return MOD_PLANT_KEYS.indexOf(plantKey) !== -1;
    }

    function getSpriteSheet(sheetName) {
        if (typeof window.getSpriteSheet === 'function') return window.getSpriteSheet(sheetName);
        if (sheetName === 'custom') return CUSTOM_SPRITE_SHEET_URL;
        if (sheetName === 'garden') return GARDEN_SPRITE_SHEET_URL;
        return '';
    }

    function jneEvery(prop, ms) {
        var now = Date.now();
        if (!Game[prop] || (now - Game[prop]) >= ms) {
            Game[prop] = now;
            return now;
        }
        return 0;
    }

    function jneHasAny(list) {
        for (var i = 0; i < list.length; i++) {
            if (Game.Has(list[i])) return true;
        }
        return false;
    }

    //condensed into unreadable mess to save space
    function runUpgradeSetups() {
        if (!Game.JNE) Game.JNE = {};
        if (!Game.JNE._upgradeSetups) {
            Game.JNE._upgradeSetups = [
                { id: 'Custom buff types', owned: function() { return true; }, ready: function() { return !!Game.buffType; }, done: function() { return !!Game._jneCustomBuffTypesCreated; }, setup: setupCustomBuffTypes },
                { id: 'Sugar frenzy II', owned: function() { return Game.Has('Sugar frenzy II'); }, ready: function() { return !!Game.Upgrades && !!Game.Upgrades['Sugar frenzy']; }, done: function() { var up = Game.Upgrades && Game.Upgrades['Sugar frenzy']; return !!(up && up._sugarFrenzyII); }, setup: setupSugarFrenzyII },
                { id: 'Sugar for sugar trading', owned: function() { return Game.Has('Sugar for sugar trading'); }, ready: function() { return !!Game.Upgrade && !!Game.Upgrades; }, done: function() { return !!(Game.Upgrades && Game.Upgrades['Sugar trade']); }, setup: setupSugarForSugarTrading },
                { id: 'Wallstreet bets', owned: function() { return Game.Has('Wallstreet bets'); }, ready: function() { return !!(Game.Objects && Game.Objects['Bank'] && Game.Objects['Bank'].minigame); }, done: function() { var M = Game.Objects && Game.Objects['Bank'] && Game.Objects['Bank'].minigame; return !!(M && M.getGoodMaxStock && M.getGoodMaxStock._wallstreetBetsHooked); }, setup: setupWallstreetBets },
                { id: 'Box of overpriced donuts', owned: function() { return Game.Has('Box of overpriced donuts'); }, ready: function() { return !!Game.Upgrade && !!Game.Upgrades; }, done: function() { return !!(Game.Upgrades && Game.Upgrades['Maple frosted donut']); }, setup: setupBoxOfDonuts },
                { id: 'Toy box', owned: function() { return Game.Has('Toy box'); }, ready: function() { return !!Game.Upgrades && !!Game.Upgrades['Toy box']; }, done: function() { return !!(Game.Upgrades && Game.Upgrades['Toy mode [on]']); }, setup: createToyBoxToggle },
                { id: 'Pink stuff', owned: function() { return Game.Has('Pink stuff'); }, ready: function() { return !!Game.Upgrades && !!Game.Upgrades['Pink stuff']; }, done: function() { return !!(Game.Upgrades && Game.Upgrades['Pink stuff [on]']); }, setup: createPinkStuffToggle },
                { id: 'Magic mushroom drops', owned: function() { return Game.Has('Magic mushroom'); }, ready: function() { return !!Game.Upgrade && !!Game.Upgrades; }, done: function() { return !!Game._magicMushroomDropsHooked; }, setup: setupMagicMushroomDrops },
                { id: 'Sugar predictor', owned: function() { return Game.Has('Sugar predictor'); }, ready: function() { return !!Game.registerHook; }, done: function() { return !!Game._sugarPredictorHooked; }, setup: setupSugarPredictor },
                { id: 'Lump tooltip enhancements', owned: function() { return Game.Has('Sugar insight') || Game.Has('Sugar predictor'); }, ready: function() { if (!Game.lumpTooltip) return false; if (Game.Has('Sugar predictor')) return !!Game._sugarPredictorHooked || typeof Game.getLumpPredictions === 'function'; return true; }, done: function() { return !!Game._lumpTooltipHooked; }, setup: setupLumpTooltipEnhancements },
                { id: 'Big cookie image selector unlock', owned: function() { return Game.Has('Big cookie image selector'); }, ready: function() { return !!Game.Upgrades && !!Game.Upgrades['Cookie image selector']; }, done: function() { var up = Game.Upgrades && Game.Upgrades['Cookie image selector']; return !!(up && up.unlocked); }, setup: unlockBigCookieImageSelector },
                { id: 'Garden save hook immediate', owned: function() { return true; }, ready: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M.save && M.plantsById); }, done: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M.save && M.save._heavenlyUpgradesHooked); }, setup: setupGardenSaveHookImmediate },
                { id: 'Aerated soil', owned: function() { return Game.Has('Aerated soil'); }, ready: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M.soils && M.plants && (typeof l === 'function')); }, done: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M._aeratedSoilHooked); }, setup: setupAeratedSoil },
                { id: 'Heavenly plant unlocks', owned: function() { return true; }, ready: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M.getUnlockedN && M.plants); }, done: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M._heavenlyPlantUnlocksHooked); }, setup: setupHeavenlyPlantUnlocks },
                { id: 'Garden new plants', owned: function() { return true; }, ready: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(M && M.plants && M.plantsById && M.plants['bakerWheat']); }, done: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(M && M._gardenPlantsInjected); }, setup: setupNewPlants },
                { id: 'Plant all', owned: function() { return Game.Has('Plant all'); }, ready: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(farm && farm.minigameLoaded && M && M.clickTile && M.useTool && M.plantsById); }, done: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(M && M._plantAllHooked); }, setup: setupPlantAll },
                { id: 'Soil inspector', owned: function() { return Game.Has('Soil inspector'); }, ready: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(farm && farm.minigameLoaded && M && M.tileTooltip && M.getMuts && M.getTile && M.plants && M.plantsById && M.soilsById && M.plotBoost); }, done: function() { var farm = Game.Objects && Game.Objects['Farm']; var M = farm && farm.minigame; return !!(M && M._soilInspectorHooked); }, setup: setupSoilInspector },
                { id: 'Golden cookie predictor overlay', owned: function() { return true; }, ready: function() { var st = Game.shimmerTypes && Game.shimmerTypes['golden']; return !!(Game.registerHook && st && st.popFunc); }, done: function() { return !!Game._goldenCookiePredictorHooked; }, setup: setupGoldenCookiePredictor },
                { id: 'Seasonal duration', owned: function() { return true; }, ready: function() { return !!Game.getSeasonDuration; }, done: function() { return !!(Game.getSeasonDuration && Game.getSeasonDuration._heavenlyUpgradesHooked); }, setup: setupSeasonalDuration },
                { id: 'Cookie display unit', owned: function() { return true; }, ready: function() { return !!Game.Draw; }, done: function() { return !!(Game.Draw && Game.Draw._jneCookieDisplayHooked); }, setup: setupCookieDisplayUnit },
                { id: 'Shiny wrinklers spawn', owned: function() { return true; }, ready: function() { return !!Game.SpawnWrinkler; }, done: function() { return !!(Game.SpawnWrinkler && Game.SpawnWrinkler._jneShinyHooked); }, setup: setupShinyWrinklers },
                { id: 'Improved cookie chains', owned: function() { return Game.Has('Improved cookie chains'); }, ready: function() { var st = Game.shimmerTypes && Game.shimmerTypes['golden']; return !!(st && st.popFunc); }, done: function() { var st = Game.shimmerTypes && Game.shimmerTypes['golden']; return !!(st && st._improvedChainsHooked); }, setup: setupImprovedCookieChains },
                { id: 'Pantheon spirit effects', owned: function() { return true; }, ready: function() { var M = Game.Objects && Game.Objects['Temple'] && Game.Objects['Temple'].minigame; var st = Game.shimmerTypes && Game.shimmerTypes.golden; return !!(M && M.slotGod && st && st.popFunc && st.spawnConditions); }, done: function() { var M = Game.Objects && Game.Objects['Temple'] && Game.Objects['Temple'].minigame; return !!(M && M._spiritEffectsSetup); }, setup: setupPantheonSpiritEffects },
                { id: 'Pantheon restore from save', owned: function() { return true; }, ready: function() { var M = Game.Objects && Game.Objects['Temple'] && Game.Objects['Temple'].minigame; var saveData = Game.JNE && Game.JNE.heavenlyUpgradesSavedData; return !!(M && saveData && saveData.pantheon && M.slot && M.slotGod && M.gods && M.godsById); }, done: function() { var M = Game.Objects && Game.Objects['Temple'] && Game.Objects['Temple'].minigame; return !!(M && M._heavenlyUpgradesRestored); }, setup: setupPantheonRestoreFromSave },
                { id: 'Garden restore from save', owned: function() { return true; }, ready: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; var saveData = Game.JNE && Game.JNE.heavenlyUpgradesSavedData; return !!(M && saveData && saveData.garden && M.plot && M.plants && M.plantsById && M._gardenPlantsInjected); }, done: function() { var M = Game.Objects && Game.Objects['Farm'] && Game.Objects['Farm'].minigame; return !!(M && M._heavenlyUpgradesRestored); }, setup: setupGardenRestoreFromSave },
                { id: 'Cyclius swatch', owned: function() { return Game.Has('Cyclius swatch'); }, ready: function() { var M = Game.Objects && Game.Objects['Temple'] && Game.Objects['Temple'].minigame; return !!(Game.registerHook && M && M.gods && M.gods['ages']); }, done: function() { return !!Game._cycliusSwatchHooked; }, setup: setupCycliusSwatch },
                { id: 'Shiny wrinkler spell', owned: function() { return Game.Has('Skitter skatter skrum ahh') || Game.Has('Abra-Ka-Wiggle') || Game.Has('Alakazoodle evil noodle'); }, ready: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M.castSpell); }, done: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M._shinyWrinklerHooked); }, setup: setupShinyWrinklerSpell },
                { id: 'Gilded allure spell', owned: function() { return Game.Has('Gilded allure'); }, ready: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M.spells && M.spellsById && typeof l === 'function' && l('grimoireSpells')); }, done: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M._gildedAllureHooked); }, setup: setupGildedAllureSpell },
                { id: 'Wizardly accomplishments', owned: function() { return Game.Has('Wizardly accomplishments'); }, ready: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M.spells && typeof l === 'function'); }, done: function() { var M = Game.Objects && Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame; return !!(M && M._wizardlyAccomplishmentsHooked); }, setup: setupWizardlyAccomplishments },
                { id: 'Golden stopwatch', owned: function() { return Game.Has('Golden stopwatch'); }, ready: function() { return !!(Game.registerHook && Game.LeftBackground && typeof l === 'function' && l('backgroundLeftCanvas')); }, done: function() { return !!(Game.UpdateSpecial && Game.UpdateSpecial._goldenStopwatchHooked); }, setup: setupGoldenStopwatch }
            ];
        }
        var entries = Game.JNE._upgradeSetups;
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (!e || e.ran) continue;
            try {
                if (e.done && e.done()) { e.ran = true; continue; }
                if (e.owned && !e.owned()) continue;
                if (e.ready && !e.ready()) continue;
                if (e.setup) e.setup();
                if (!e.done || e.done()) e.ran = true;
            } catch (err) {
                console.error('[Heavenly Upgrades] Setup failed:', e.id, err);
            }
        }

        if (!Game._jneSeasonTooltipsHooked && typeof LocalizeUpgradesAndAchievs === 'function') {
            var orig = LocalizeUpgradesAndAchievs;
            LocalizeUpgradesAndAchievs = function() { orig.apply(this, arguments); updateSeasonDescs(); };
            Game._jneSeasonTooltipsHooked = true;
        }
        if (Game.Upgrades) updateSeasonDescs();

        if (!Game._jneLegacyIntervalsCleared) {
            ['_jneBingoCenterSlotsInterval', '_fortuneCookieRegenerationInterval', '_jneCheckboxInterval'].forEach(function(k) {
                if (Game[k]) { clearInterval(Game[k]); Game[k] = 0; }
            });
            Game._jneLegacyIntervalsCleared = true;
        }

        var ownedSetups = [
            [['Fortune tolls for you'], setupFortuneTolls],
            [['Blackfriday special'], setupBlackfridaySpecial],
            [['Fading payout', 'Lucky fading payout'], setupFadingPayout],
            [['All is well', 'Six bells'], setupTimedGoldenCookies],
            [['Weakest link', 'The next weakest link', 'No more weak links'], setupWeakestLink],
            [['Turtles all the way down', 'Self employed realtor'], setupBuildingPriceModifications],
            [['Wholesale discount club'], setupWholesaleDiscountClub],
            [['Cockroaches', 'Infestation', 'The prize at the bottom of the box', 'Double box prize', 'Mail in sweepstake winner'], setupWrinklerPopSpawn],
            [['Regifting'], setupRegifting],
            [['Peaking under the tree'], setupPeakingUnderTheTree],
            [['Distilled essence of retripled luck'], setupRetripledLuck],
            [['Unlucky luckier', 'Even more unlucky luckier', 'Slightly less bitter wrath', 'Flavor enhanced wrath'], setupCookieReduction],
            [['Fish tank', 'Sunken treasure', 'Aquaculturist', 'Hatchery effect'], setupFishShimmers],
            [['Erasable pens'], setupErasablePens],
            [['Frenziered elders', 'Godzmak\'s Headstart', 'Creative tax evasion'], setupBuffModifiers],
            [['Mega clicks', 'Lucky mega clicks', 'Extreme mega clicks'], setupMegaClicks]
        ];
        for (var i = 0; i < ownedSetups.length; i++) {
            if (jneHasAny(ownedSetups[i][0])) ownedSetups[i][1]();
        }
        if (Game.Has('Bingo center slots')) {
            var now = jneEvery('_jneBingoCenterSlotsLast', 60000); ///60000 
            if (now && Game.OnAscend !== 1 && Game.Has('Bingo center/Research facility') && Game.Objects['Grandma']) {
                var grandmas = Game.Objects['Grandma'].amount;
                if (grandmas > 0 && Math.random() < grandmas / 2000000) { //one in 2 million per grandma per minute
                    Game.JNE.bingoJackpotWins = (Game.JNE.bingoJackpotWins || 0) + 1;
                    var bingoSlotsIcon = (Game.Upgrades && Game.Upgrades['Bingo center slots'] && Game.Upgrades['Bingo center slots'].icon) ? Game.Upgrades['Bingo center slots'].icon : [31, 12];
                    var roll = Math.random() * 100;
                    if (roll < 70) {
                        var exp = Math.floor(Math.log10(Game.cookiesPsRaw || 1));
                        var cookiesEarned = 7.77 * Math.pow(10, exp + 4);
                        Game.Earn(cookiesEarned);
                        Game.Notify('Jackpot!', 'A grandma has hit the jackpot in slots and earned <b>' + Beautify(cookiesEarned) + '</b> cookies!', bingoSlotsIcon);
                    } else if (roll < 85) {
                        new Game.shimmer('golden');
                        Game.Notify('Jackpot!', 'A grandma won a <b>golden cookie</b> while playing slots!', bingoSlotsIcon);
                    } else if (roll < 98) {
                        Game.Earn(Game.cookies * 0.1);
                        Game.Notify('Jackpot!', 'A grandma won the mega jackpot while playing slots and your cookie bank has been <b>increased by 10%!</b>', bingoSlotsIcon);
                    } else {
                        Game.gainLumps(1);
                        Game.Notify('Jackpot!', 'A grandma hit the mega sugar jackpot in slots and won a <b>free sugar lump!</b>', bingoSlotsIcon);
                    }
                }
            }
        }
        if (Game.Has('Doordashing every day') || Game.Has('Second day takeout') || Game.Has('Chinese leftovers')) {
            if (!Game.JNE.heavenlyUpgradesSavedData) Game.JNE.heavenlyUpgradesSavedData = {};
            var now = jneEvery('_fortuneCookieRegenLastCheck', 60000);
            if (now) {
                var interval = Game.Has('Doordashing every day') ? 24 * 60 * 60 * 1000 : (Game.Has('Second day takeout') ? 2 * 24 * 60 * 60 * 1000 : (Game.Has('Chinese leftovers') ? 3 * 24 * 60 * 60 * 1000 : null));
                if (interval) {
                    var lastReset = Game.JNE.heavenlyUpgradesSavedData.fortuneCookieLastResetTime;
                    if (!lastReset || (now - lastReset >= interval)) {
                        Game.fortuneGC = 0;
                        Game.fortuneCPS = 0;
                        Game.JNE.heavenlyUpgradesSavedData.fortuneCookieLastResetTime = now;
                    }
                }
            }
        }
        if (Game.Upgrades && Game.Upgrades['The checkbox']) {
            var now = jneEvery('_jneCheckboxLastRoll', 3600000);//3600000
            if (now && Game.Upgrades['The checkbox'].bought && Math.random() < 0.01)
                {
                    //ok so it does do something but how disappointed are you in what it does?
                    Game.Earn(1);
                }
        }

        if (Game.Upgrades && ((Game.Upgrades['Morrowen, Spirit of Procrastination'] && Game.Upgrades['Morrowen, Spirit of Procrastination'].bought) || (Game.Upgrades['Solgreth, Spirit of Selfishness'] && Game.Upgrades['Solgreth, Spirit of Selfishness'].bought))) {
            addNewPantheonSpirits();
        }
    }

    function setupLumpTooltipEnhancements() {
        if (!Game.lumpTooltip || Game._lumpTooltipHooked || (!Game.Has('Sugar insight') && !Game.Has('Sugar predictor'))) return;
        if (Game.Has('Sugar predictor') && !Game._sugarPredictorHooked && typeof Game.getLumpPredictions !== 'function') return;

        var origTooltip = Game.lumpTooltip;
        var typeIcons = [[29, 14], [29, 15], [29, 16], [29, 17], [29, 27]];
        var typeNames = ['Normal', 'Bifurcated', 'Golden', 'Meaty', 'Caramelized'];
        var keys = ['bifurcated', 'golden', 'meaty', 'caramelized'];
        Game.lumpTooltip = function() {
            var str = origTooltip.call(this);
            var helpStart = str.indexOf('&bull;');
            if (helpStart !== -1) {
                var helpEnd = str.indexOf('</div>', helpStart);
                var lineStart = str.lastIndexOf('<div class="line"></div>', helpStart);
                if (helpEnd !== -1 && lineStart !== -1) {
                    str = str.substring(0, lineStart) + str.substring(helpEnd + 6);
                }
            }

            if (Game.Has('Sugar insight') && Game.lumpCurrentType !== undefined) {
                var currentLumpType = Game.lumpCurrentType;
                var currentLumpIcon = typeIcons[currentLumpType];
                str += '<div class="line"></div>';
                str += '<div style="text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;color:#aaa;"><span>Current growing lump:</span> ' +
                       '<div style="display:inline-block;width:24px;height:24px;overflow:hidden;margin-left:-10px;">' +
                       '<div class="icon" style="background-position:-' + (currentLumpIcon[0]*48) + 'px -' + (currentLumpIcon[1]*48) + 'px;transform:scale(0.5);transform-origin:0 0;"></div></div> ' +
                       '<span>' + typeNames[currentLumpType] + '</span></div>';
            }

            if (!Game.Has('Sugar predictor')) return str;
            if (typeof Game.getLumpPredictions !== 'function') return str;

            var pred = Game.getLumpPredictions();
            var lookupTableValid = Game._lumpGameStates && Game._lumpGameStates.length > 0 &&
                                  Game._lumpGameStates[0].predictedType !== undefined &&
                                  Game._lumpGameStatesLumpT === Game.lumpT;
            if (!pred || !lookupTableValid) {
                str += '<div class="line"></div><div class="green"><b>Calculating predictions...</b></div>';
                return str;
            }

            var current = {
                grandmas: Game.Objects['Grandma'].amount,
                rigidel: detectRigidelSlot(),
                dragonsCurve: detectDragonsCurve(),
                realityBending: detectRealityBending(),
                wrath: Game.elderWrath || 0
            };

            var currentType = Game.predictLumpTypeWithState(Game.lumpT, current.grandmas, current.rigidel, current.dragonsCurve, current.realityBending, current.wrath);
            var icon = typeIcons[currentType];

            str += '<div class="line"></div>';
            str += '<div style="text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;"><b>Predicted next lump on auto-harvest:</b> ' +
                   '<div style="display:inline-block;width:24px;height:24px;overflow:hidden;margin-left:-10px;">' +
                   '<div class="icon" style="background-position:-' + (icon[0]*48) + 'px -' + (icon[1]*48) + 'px;transform:scale(0.5);transform-origin:0 0;"></div></div> ' +
                   '<b class="green">' + typeNames[currentType] + '</b></div>';

            var showDebug = !!Game._sugarPredictorDebug || !!(Game.keys && Game.keys[16]);
            if (showDebug) {
                var auraMult = (Game.auraMult ? (Game.auraMult('Dragon\'s Curve') || 0) : 0);
                var curveMultDerived = (current.dragonsCurve ? 1 : 0) + (current.realityBending ? 0.1 : 0);
                var ripeAge = Game.calculateLumpRipeAgeWithState(current.grandmas, current.rigidel, current.dragonsCurve, current.realityBending);
                var overripeAge = ripeAge + (Game.Has('Glucose-charged air') ? (3600000 / 2000) : 3600000);
                var harvestTime = (Game.lumpT + overripeAge);
                var byWrath = Game.predictLumpTypesByWrathWithState(Game.lumpT, current.grandmas, current.rigidel, current.dragonsCurve, current.realityBending);
                var mod10 = (Game.BuildingsOwned || 0) % 10;
                var tableSig = (Game._lumpGameStatesLumpT === Game.lumpT ? 'ok' : 'stale') +
                    ', upg=' + (Game.getLumpPredictorUpgradeSig ? Game.getLumpPredictorUpgradeSig() : '');

                str += '<div class="line"></div>';
                str += '<div style="font-size:10px;line-height:1.2;color:#bbb;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
                        '<div><b>Predictor debug</b></div>' +
                        '<div></div>' +
                    '</div>' +
                    '<div>lumpT: <b>' + Game.lumpT + '</b> | harvestTime: <b>' + harvestTime + '</b></div>' +
                    '<div>grandmas: <b>' + Math.floor(current.grandmas) + '</b> | wrath: <b>' + current.wrath + '</b> | buildingsmod: <b>' + mod10 + '</b></div>' +
                    '<div>rigidel: <b>' + current.rigidel + '</b> | dc: <b>' + current.dragonsCurve + '</b> | rb: <b>' + current.realityBending + '</b></div>' +
                    '<div>curve: <b>' + curveMultDerived.toFixed(1) + '</b> | auraMult: <b>' + (auraMult + '').replace(/\.0+$/, '') + '</b></div>' +
                    '<div>ripeAge(ms): <b>' + Math.floor(ripeAge) + '</b></div>' +
                    '<div>tableSig: <b>' + tableSig + '</b></div>' +
                    '<div>predictedByWrath: <b>[' + byWrath[0] + ',' + byWrath[1] + ',' + byWrath[2] + ',' + byWrath[3] + ']</b></div>' +
                '</div>';
            }

            for (var i = 0; i < 4; i++) {
                var res = pred[keys[i]];
                icon = typeIcons[i + 1];

                var allMet = false;
                if (res.found && res.solution) {
                    var sol = res.solution;
                    var met = Game.evaluateLumpSolutionMet ? Game.evaluateLumpSolutionMet(current, sol) : null;
                    allMet = !!(met && met.allMet);
                }

                var isCurrentType = currentType === i + 1;
                var showGreen = allMet && isCurrentType;

                if (showGreen) {
                    str += '<div class="listing" style="padding:4px 6px;margin:4px 0px;border-radius:4px;background:#2e7d32;border:2px solid #4caf50;display:flex;align-items:center;justify-content:space-between;">';
                } else {
                    str += '<div class="listing" style="padding:4px 6px;margin:4px 0px;opacity:0.8;border-radius:4px;background:#333;display:flex;align-items:center;justify-content:space-between;">';
                }

                str += '<div style="display:flex;align-items:center;gap:6px;"><div style="display:inline-block;width:26px;height:24px;overflow:hidden;">' +
                      '<div class="icon" style="background-position:-' + (icon[0]*48) + 'px -' + (icon[1]*48) + 'px;transform:scale(0.5);transform-origin:0 0;"></div></div>' +
                      '<b' + (showGreen ? ' class="green"' : '') + '>' + typeNames[i + 1] + '</b></div>' +
                      '<div style="display:flex;align-items:center;gap:4px;">' +
                      (res.found ? Game.formatLumpSolution(res.solution) : '<span class="red">Not possible</span>') +
                      '</div></div>';
            }

            return str;
        };
        Game._lumpTooltipHooked = true;
    }
    
    if (!Game.Upgrade) {
        var checkGame = setInterval(function() {
            if (Game.Upgrade) {
                clearInterval(checkGame);
                initializeHeavenlyUpgrades();
            }
        }, 100);
        setTimeout(function() {
            clearInterval(checkGame);
            if (!isInitialized) {
                console.error('[Heavenly Upgrades] Failed to initialize');
            }
        }, 10000);
        return;
    }
    
    setTimeout(initializeHeavenlyUpgrades, 50);

    function initializeHeavenlyUpgrades() {
        if (isInitialized || !Game.Upgrade || !Game.UpgradesById) {
            if (!isInitialized && Game.Upgrade) {
                setTimeout(initializeHeavenlyUpgrades, 100);
            }
            return;
        }

        isInitialized = true;
        setupAscensionStateHooks();
        setupOverheadItems();
        createUpgrades();
        if (Game.registerHook && !Game._jneUpgradeSetupsCheckHooked) {
            Game.registerHook('check', runUpgradeSetups, 'JNE upgrade setups');
            Game._jneUpgradeSetupsCheckHooked = true;
        }
        if (Game.JNE?.heavenlyUpgradesSavedData) {
            var saveData = Game.JNE.heavenlyUpgradesSavedData;
            if (saveData && typeof saveData === 'object' && (saveData.version || saveData.upgrades || saveData.pantheon || saveData.garden)) {
                if (saveData.upgrades) {
                    var restoredCount = restoreUpgradesBoughtOnly(saveData.upgrades);
                    if (restoredCount > 0) {
                        console.log('[Heavenly Upgrades] Restored', restoredCount, 'upgrades on initialization');
                    }
                }
            }
        }
        runUpgradeSetups();
        
        setupGameEffModifiers();
        setupCpsModifiers();
        Game.registerHook('logic', function() {
            var M = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
            if (M && M.plants) {
                if (M.plants['sparklingSugarCane'] && !Game.Has('Sparkling sugar cane')) {
                    M.plants['sparklingSugarCane'].unlocked = 0;
                }
                if (M.plants['krazyKudzu'] && !Game.Has('Krazy kudzu')) {
                    M.plants['krazyKudzu'].unlocked = 0;
                }
                if (M.plants['magicMushroom'] && !Game.Has('Magic mushroom')) {
                    M.plants['magicMushroom'].unlocked = 0;
                }
            }
            
            var jneParent = Game.Upgrades['Just natural expansion heavenly upgrades'];
            if (jneParent && !jneParent.bought) {
                jneParent.unlocked = Game.Has('Unshackled You') ? 1 : 0;
            }
        });

        setupBigCookieImageSelector();
        addNewPantheonSpirits();
    }

    function setupAscensionStateHooks() {
        if (!Game.registerHook || Game._jneAscensionStateHooksHooked) return;
        Game._jneAscensionStateHooksHooked = true;

        var ensureSugarTradeAvailable = function() {
            if (!Game.Has || !Game.Has('Sugar for sugar trading')) return;
            var st = Game.Upgrades && Game.Upgrades['Sugar trade'];
            if (!st) {
                try { runUpgradeSetups(); } catch (e) {}
                st = Game.Upgrades && Game.Upgrades['Sugar trade'];
            }
            if (st) {
                st.unlocked = 1;
                st.bought = 0;
            }
        };

        var resetSugarFrenzyIIState = function() {
            if (!Game.Has || !Game.Has('Sugar frenzy II')) return;
            Game.sugarFrenzyPrice = 1;
            Game.sugarFrenzyLastUse = 0;
        };

        Game.registerHook('reset', function(hard) {
            if (hard) return;
            resetSugarFrenzyIIState();
            ensureSugarTradeAvailable();
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
        }, 'JNE ascension state reset');

        Game.registerHook('reincarnate', function() {
            // custom toggle upgrades exist and are unlocked after the new run starts.
            setTimeout(function() {
                try { runUpgradeSetups(); } catch (e) {}
                resetSugarFrenzyIIState();
                ensureSugarTradeAvailable();
                Game.storeToRefresh = 1;
                Game.upgradesToRebuild = 1;
                if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
                if (Game.RefreshStore) { Game.RefreshStore(); }
            }, 0);
        }, 'JNE ascension state reincarnate');
    }

    function setupOverheadItems() {
        if (Game._jneOverheadItemsSetup) return;
        Game._jneOverheadItemsSetup = true;
        if (!Game._achievementWinCallbacks) Game._achievementWinCallbacks = [];
        if (Game.Win && !Game._achievementWinExtended) {
            var originalWin = Game.Win;
            Game.Win = function(what) {
                var wasWon = false;
                var achievement = null;
                if (typeof what === 'string' && Game.Achievements[what]) {
                    achievement = Game.Achievements[what];
                    wasWon = achievement.won === 1;
                }
                var result = originalWin.apply(this, arguments);
                if (achievement && !wasWon && achievement.won === 1) {
                    for (var i = 0; i < Game._achievementWinCallbacks.length; i++) {
                        try {
                            Game._achievementWinCallbacks[i](achievement);
                        } catch (e) {
                            console.error('[JNE] Error in achievement callback:', e);
                        }
                    }
                }
                
                return result;
            };
            
            // Mark as extended to prevent multiple extensions
            Game._achievementWinExtended = true;
        }
        var positiveFeedbackLoopIcon = [15, 13, getSpriteSheet('custom')];
        setupCustomBuffTypes();
        Game._achievementWinCallbacks.push(function(achievement) {
            if (Game.Has('Positive feedback loop') && Game.gainBuff) {
                Game.gainBuff('feedback loop', 3600, 1);
                Game.Notify('Positive feedback loop!', 'Golden cookies appear 10% more often for the next hour.', positiveFeedbackLoopIcon);
            }
        });
    }

    function setupCustomBuffTypes() {
        if (Game._jneCustomBuffTypesCreated) return;
        if (!Game.buffType || typeof Game.buffType !== 'function') return;

        if (Game.buffTypesByName && !Game.buffTypesByName['feedback loop']) {
            var positiveFeedbackLoopIcon = [15, 13, getSpriteSheet('custom')];
            new Game.buffType('feedback loop', function(time, pow) {
                return {
                    name: 'Feedback loop',
                    desc: 'You find 10% more golden cookies for the next ' + Game.sayTime(time * Game.fps, -1) + '.',
                    icon: positiveFeedbackLoopIcon,
                    time: time * Game.fps
                };
            });
        }

        if (Game.buffTypesByName && !Game.buffTypesByName['jam filling']) {
            new Game.buffType('jam filling', function(time, pow) {
                return { name: 'Jam filling', desc: 'Cookie production x' + pow + ' for ' + Game.sayTime(time * Game.fps, -1) + '!', icon: [19, 8], multCpS: pow, time: time * Game.fps };
            });
        }

        Game._jneCustomBuffTypesCreated = true;
    }

    function setupErasablePens() {
        if (!Game.Has('Erasable pens') || !Game.Upgrades || !Game.AssignPermanentSlot) return;
        var slotNames = ['Permanent upgrade slot I', 'Permanent upgrade slot II', 'Permanent upgrade slot III', 'Permanent upgrade slot IV', 'Permanent upgrade slot V'];
        for (var i = 0; i < slotNames.length; i++) {
            var upgrade = Game.Upgrades[slotNames[i]];
            if (upgrade && !upgrade._erasablePensModified) {
                var originalActivate = upgrade.activateFunction;
                upgrade.activateFunction = (function(slot) {
                    return function() {
                        var savedOnAscend = Game.OnAscend;
                        try {
                            if (Game.OnAscend !== 1) Game.OnAscend = 1;
                            if (originalActivate && typeof originalActivate === 'function') {
                                originalActivate.call(this);
                            } else if (Game.AssignPermanentSlot) {
                                Game.AssignPermanentSlot(slot);
                            }
                        } finally {
                            Game.OnAscend = savedOnAscend;
                        }
                    };
                })(i);
                upgrade._erasablePensModified = true;
            }
        }
    }
    
    if (Game.UpdateMenu && !Game.UpdateMenu._erasablePensHooked) {
        Game.UpdateMenu._erasablePensHooked = true;
        var originalUpdateMenu = Game.UpdateMenu;
        Game.UpdateMenu = function() {
            var result = originalUpdateMenu.apply(this, arguments);
            if (Game.Has('Erasable pens')) {
                setTimeout(function() {
                    var slotNames = ['Permanent upgrade slot I', 'Permanent upgrade slot II', 'Permanent upgrade slot III', 'Permanent upgrade slot IV', 'Permanent upgrade slot V'];
                    var allCrates = document.querySelectorAll('div.crate.upgrade.heavenly');
                    for (var i = 0; i < slotNames.length; i++) {
                        var upgrade = Game.Upgrades[slotNames[i]];
                        if (!upgrade) continue;
                        for (var j = 0; j < allCrates.length; j++) {
                            var crate = allCrates[j];
                            if ((crate.getAttribute('onmouseover') || '').indexOf('UpgradesById[' + upgrade.id + ']') !== -1 && !crate._erasablePensHandlerAdded) {
                                crate.addEventListener('click', (function(slot) {
                                    return function(e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (Game.AssignPermanentSlot) Game.AssignPermanentSlot(slot);
                                        return false;
                                    };
                                })(i), true);
                                crate._erasablePensHandlerAdded = true;
                                break;
                            }
                        }
                    }
                }, 100);
            }
            return result;
        };
    }
    
    var origDescs = {};
    function updateSeasonDescs() {
        var h = 24 + (Game.Has('Seasonal hours') ? 6 : 0) + (Game.Has('Seasonal overtime') ? 6 : 0) + (Game.Has('Seasonal time off') ? 6 : 0) + (Game.Has('Seasonal retirement') ? 6 : 0);
        ['Festive biscuit', 'Ghostly biscuit', 'Lovesick biscuit', 'Fool\'s biscuit', 'Bunny biscuit'].forEach(function(n) {
            var u = Game.Upgrades[n];
            if (u) {
                if (!origDescs[n]) {
                    var src = (typeof u.baseDesc === 'string' && u.baseDesc.indexOf('24') !== -1) ? u.baseDesc :
                        ((typeof u.ddesc === 'string' && u.ddesc.indexOf('24') !== -1) ? u.ddesc :
                        ((typeof u.desc === 'string' && u.desc.indexOf('24') !== -1) ? u.desc : null));
                    if (src) origDescs[n] = src;
                }
                if (origDescs[n]) {
                    var d = origDescs[n].replace('24', h);
                    if (typeof u.baseDesc === 'string') u.baseDesc = d;
                    if (typeof u.ddesc === 'string') u.ddesc = d;
                    if (typeof u.desc === 'string') u.desc = d;
                }
            }
        });
    }
    
    function setupSeasonalDuration() {
        if (Game.getSeasonDuration && !Game.getSeasonDuration._heavenlyUpgradesHooked) {
            var originalGetSeasonDuration = Game.getSeasonDuration;
            Game.getSeasonDuration = function() {
                var raw = originalGetSeasonDuration.apply(this, arguments);
                var baseDuration = Number(raw);
                if (!isFinite(baseDuration) || baseDuration <= 0) return raw;
                var extraHours = 0;
                if (Game.Has('Seasonal hours')) extraHours += 6;
                if (Game.Has('Seasonal overtime')) extraHours += 6;
                if (Game.Has('Seasonal time off')) extraHours += 6;
                if (Game.Has('Seasonal retirement')) extraHours += 6;
                var fps = Game.fps || 30;
                updateSeasonDescs();
                return baseDuration + (fps * 60 * 60 * extraHours);
            };
            Game.getSeasonDuration._heavenlyUpgradesHooked = true;
            setTimeout(updateSeasonDescs, 500);
        }
    }
    
    function setupBuildingPriceModifications() {
        if (Game._buildingPriceModificationsHooked) {
            return;
        }
        
        if (!Game.modifyBuildingPrice) {
            Game.modifyBuildingPrice = function(building, price) {
                return price;
            };
        }
        
        var originalModifyBuildingPrice = Game.modifyBuildingPrice;
        
        Game.modifyBuildingPrice = function(building, price) {
            var modifiedPrice = originalModifyBuildingPrice.call(this, building, price);
            
            // Apply Self employed discount
            if (Game.Has('Self employed realtor')) {
                modifiedPrice *= 0.9;
            }
            
            // Apply Turtles discount (level-based max 25%)
            if (Game.Has('Turtles all the way down') && building && building.level !== undefined) {
                var level = Math.min(building.level || 0, 25); // Cap at level 25
                var discount = 1 - (level * 0.01); 
                modifiedPrice *= discount;
            }
            
            return modifiedPrice;
        };
        Game._buildingPriceModificationsHooked = true;
    }
    
    function setupWholesaleDiscountClub() {
        if (!Game.Upgrade || !Game.Upgrade.prototype) return;
        if (Game.Upgrade.prototype.getPrice && Game.Upgrade.prototype.getPrice._jneWholesaleDiscountClubHooked) return;
        
        var originalGetPrice = Game.Upgrade.prototype.getPrice;
        Game.Upgrade.prototype.getPrice = function() {
            var price = originalGetPrice.call(this);
            if (this.pool !== 'prestige' && this.name !== 'Wholesale discount club' && Game.Has('Wholesale discount club')) {
                price *= 0.9;
            }
            return price;
        };
        Game.Upgrade.prototype.getPrice._jneWholesaleDiscountClubHooked = true;
    }
    
    function setupCookieDisplayUnit() {
        if (!Game.Draw) return;
        if (Game.Draw._jneCookieDisplayHooked) return;
        var originalDraw = Game.Draw;
        Game.Draw = function() {
            var result = originalDraw.apply(this, arguments);
            if (Game.Has('Cookie calculations') && l('cookies')) {
                if (window.modSettings && window.modSettings.cpsDisplayUnit && window.modSettings.cpsDisplayUnit !== 'seconds') {
                    var cpsElement = document.getElementById('cookiesPerSecond');
                    if (cpsElement) {
                        var baseCps = Game.cookiesPs * (1 - (Game.cpsSucked || 0));
                        var multipliers = { 'minutes': 60, 'hours': 3600, 'days': 86400 };
                        var unitLabels = { 'minutes': 'per minute:', 'hours': 'per hour:', 'days': 'per day:' };
                        var unit = window.modSettings.cpsDisplayUnit;
                        if (!multipliers[unit] || !unitLabels[unit]) return result;
                        var convertedValue = baseCps * multipliers[unit];
                        var className = cpsElement.className || '';
                        cpsElement.innerHTML = unitLabels[unit] + ' ' + Beautify(convertedValue, 1);
                        cpsElement.className = className;
                    }
                }
            }
            return result;
        };
        Game.Draw._jneCookieDisplayHooked = true;
    }

    function setupGameEffModifiers() {
        if (!Game.eff || Game.eff._jneAllEffModifiersHooked) return;
        var originalEff = Game.eff;
        Game.eff = function(what) {
            var val = originalEff.apply(this, arguments);
            if (what === 'wrinklerEat') {
                if (Game.Has('Ravenous leeches')) val *= 1.2;
                else if (Game.Has('Hellish hunger')) val *= 1.1;
            } else if (what === 'wrinklerSpawn') {
                if (Game.Has('Wide open door of hell')) val *= 1.2;
                else if (Game.Has('Unlocked gates of hell')) val *= 1.1;
            } else if (what === 'goldenCookieFreq' || what === 'wrathCookieFreq') {
                if (Game.hasBuff('Gilded allure')) val *= 1.3;
                if (Game.hasBuff('Midas curse')) val /= 4;
                if (Game.hasBuff('Feedback loop')) val *= 1.1;
                var M = Game.Objects['Temple']?.minigame;
                if (M?.gods['selfishness']) {
                    var l = Game.hasGod('selfishness');
                    if (l) {
                        var r = Math.min((M._selfishnessClickCount || 0) * [0, 0.03, 0.02, 0.01][l], 1);
                        if (r < 1) val *= [1, 2, 1.5, 1.25][l];
                    }
                }
            }
            return val;
        };
        Game.eff._jneAllEffModifiersHooked = true;
    }
    
    function setupCpsModifiers() {
        if (!Game.registerHook || Game._jneCpsModifiersHooked) return;
        Game.registerHook('cps', function(cps) {
            var mult = 1;
            if (Game.Has('Divine uninspiration') && Game.Objects['Temple']?.minigame?.slot) {
                var s = Game.Objects['Temple'].minigame.slot;
                mult *= 1 + (s[2] === -1 ? 0.01 : 0) + (s[1] === -1 ? 0.02 : 0) + (s[0] === -1 ? 0.03 : 0);
            }
            if (Game.Has('Improved sugar crystal cookies')) {
                for (var i in Game.Objects) if (Game.Objects[i].level >= 15) mult += 0.01;
            }
            if (Game.Has('Gilded sugar crystal cookies')) {
                for (var i in Game.Objects) if (Game.Objects[i].level >= 20) mult += 0.01;
            }
            if (Game.lumps > 100) {
                var cap = Game.Has('Sugar baking VI') ? 150 : Game.Has('Sugar baking V') ? 140 : Game.Has('Sugar baking IV') ? 130 : Game.Has('Sugar baking III') ? 120 : Game.Has('Sugar baking II') ? 110 : 0;
                if (cap > 0) mult *= (1 + (Math.min(Game.lumps, cap) - 100) * 0.01);
            }
            if (Game.Has('Stacks on stacks on stacks') && Game.goldenClicksLocal) {
                mult *= 1 + (Game.goldenClicksLocal * 0.0005);
            }
            var M = Game.Objects['Temple']?.minigame;
            if (M?.gods['procrastination']) {
                var l = Game.hasGod('procrastination');
                if (l && M._procrastinationSlotTime) {
                    var h = (Date.now() - M._procrastinationSlotTime) / 3600000, d = Math.min(Math.floor(h / 24), 365), b = [0, 0.015, 0.010, 0.005][l], t = 0;
                    for (var i = 0; i < d; i++) t += b * Math.pow(0.99, i);
                    if (d < 365) t += b * Math.pow(0.99, d) * (h % 24) / 24;
                    mult *= (1 + t);
                }
            }
            if (M?.gods['selfishness']) {
                var l = Game.hasGod('selfishness');
                if (l) mult *= (1 - Math.min((M._selfishnessClickCount || 0) * [0, 0.03, 0.02, 0.01][l], 1));
            }
            return cps * mult;
        }, 'Centralized CPS modifiers');
        Game._jneCpsModifiersHooked = true;
    }
    
    function setupBuffModifiers() {
        if (!Game.gainBuff || Game._jneBuffModifiersHooked) return;

        var origGainBuff = Game.gainBuff;
        Game.gainBuff = function(type, time, arg1, arg2, arg3) {
            var alreadyApplying = !!Game._jneApplyingBuffModifiers;
            if (!alreadyApplying) Game._jneApplyingBuffModifiers = true;
            try {
                if (!alreadyApplying) {
                    // Frenziered elders - elder frenzy (blood frenzy) buffs last 25% longer
                    if (type === 'blood frenzy' && Game.Has && Game.Has('Frenziered elders')) {
                        time = Math.ceil(time * 1.25);
                    }
                    // Godzmak's Headstart - devastation buffs last 10% longer
                    if (type === 'devastation' && Game.Has && Game.Has("Godzmak's Headstart")) {
                        time = Math.ceil(time * 1.1);
                    }
                    // Creative tax evasion - loan interest buffs last 10% less long
                    if ((type === 'loan 1 interest' || type === 'loan 2 interest' || type === 'loan 3 interest') && 
                        Game.Has && Game.Has('Creative tax evasion')) {
                        time = time * 0.9;
                    }
                }
                return origGainBuff.call(this, type, time, arg1, arg2, arg3);
            } finally {
                if (!alreadyApplying) Game._jneApplyingBuffModifiers = false;
            }
        };
        Game._jneBuffModifiersHooked = true;
    }

    function setupMegaClicks() {
        if (Game.registerHook && !Game._megaClicksHookRegistered) {
            Game.registerHook('click', function() {
                if (Game.Has && Game.Has('Mega clicks')) {
                    var megaClickChance = Game.Has('Lucky mega clicks') ? 0.015 : 0.01;
                    var isMegaClick = Math.random() < megaClickChance; 
                    if (isMegaClick) {
                        var clickAmount = Game.computedMouseCps || 0;
                        var multiplier = Game.Has('Extreme mega clicks') ? 14 : 9;
                        var bonusAmount = clickAmount * multiplier;
                        var totalAmount = clickAmount * (multiplier + 1); 
                        Game.Earn(bonusAmount);
                        Game.Popup('<span style="font-size:80%">Mega Click Bonus!<br>+' + Beautify(totalAmount, 1) + '</span>', Game.mouseX, Game.mouseY);
                    }
                }
            });
            Game._megaClicksHookRegistered = true;
        }
    }
    
    function setupShinyWrinklers() {
        if (!Game.SpawnWrinkler) return;
        if (Game.SpawnWrinkler._jneShinyHooked) return;
        var originalSpawn = Game.SpawnWrinkler;
        Game.SpawnWrinkler = function() {
            var me = originalSpawn.apply(this, arguments);
            if (!me) return me;
            if (me.type === 0) {
                var base = 0.0001;
                var mult = 1;
                if (Game.Has('Species bounceback')) mult *= 2.0;
                else if (Game.Has('Indigenous tracker')) mult *= 1.5;
                else if (Game.Has('Rare game hunter')) mult *= 1.25;
                if (Game.Has('Slimy pheromones')) {
                    var hasShiny = false;
                    if (Game.wrinklers) {
                        for (var i = 0; i < Game.wrinklers.length; i++) {
                            if (Game.wrinklers[i] && Game.wrinklers[i].type === 1 && Game.wrinklers[i].phase > 0) {
                                hasShiny = true;
                                break;
                            }
                        }
                    }
                    if (hasShiny) mult *= 5.0;
                }
                var p = base * mult;
                if (Math.random() < p) me.type = 1;
            }
            return me;
        };
        Game.SpawnWrinkler._jneShinyHooked = true;
    }
    
    function setupWrinklerPopSpawn() {
        if (Game._wrinklerPopSpawnHooked || !Game.UpdateGrandmapocalypse) return;
        Game._wrinklerPopSpawnHooked = true;
        Game._jneJamFillingHandled = true;
        var originalUpdate = Game.UpdateGrandmapocalypse;
        Game.UpdateGrandmapocalypse = function() {
            var oldCount = Game.wrinklersPopped || 0;
            var result = originalUpdate.apply(this, arguments);
            var newCount = Game.wrinklersPopped || 0;
            if (newCount > oldCount) {
                var popped = newCount - oldCount;
                if ((Game.Has('Cockroaches') || Game.Has('Infestation')) && Game.SpawnWrinkler) {
                    var chance = Game.Has('Infestation') ? 0.02 : Game.Has('Cockroaches') ? 0.01 : 0;
                    for (var k = 0; k < popped; k++) {
                        if (chance > 0 && Math.random() < chance) {
                            Game.SpawnWrinkler();
                        }
                    }
                }

                if ((Game.Has('The prize at the bottom of the box') || Game.Has('Double box prize') || Game.Has('Mail in sweepstake winner')) && Game.gainBuff) {
                    var jamChance = Game.Has('Mail in sweepstake winner') ? 0.03 : Game.Has('Double box prize') ? 0.02 : Game.Has('The prize at the bottom of the box') ? 0.01 : 0;
                    if (jamChance > 0 && !Game._jneCustomBuffTypesCreated) setupCustomBuffTypes();
                    if (jamChance > 0 && Game.buffTypesByName && Game.buffTypesByName['jam filling']) {
                        for (var j = 0; j < popped; j++) {
                            if (Math.random() < jamChance) {
                                var buff = Game.buffs && Game.buffs['Jam filling'];
                                if (buff) {
                                    var currentTime = buff.time / Game.fps;
                                    Game.gainBuff('jam filling', currentTime + 6, 66);
                                } else {
                                    Game.gainBuff('jam filling', 6, 66);
                                }
                                if (Game.Notify) Game.Notify('Jam filling!', 'Cookie production x66 for 6 seconds!', [19, 8]);
                                break;
                            }
                        }
                    }
                }
            }
            return result;
        };
    }
    
    function setupCycliusSwatch() {
        if (!Game.registerHook || Game._cycliusSwatchHooked) return;
        if (!Game.Has('Cyclius swatch')) return;
        var M = Game.Objects['Temple']?.minigame;
        if (!M?.gods?.['ages']) return;
        var cyclius = M.gods['ages'];
        if (!cyclius._originalDescs) {
            cyclius._originalDescs = {
                desc1: cyclius.desc1,
                desc2: cyclius.desc2,
                desc3: cyclius.desc3
            };
        }
        var update = function() {
            if (!Game.Has('Cyclius swatch')) return;
            var M = Game.Objects['Temple']?.minigame;
            if (!M?.gods?.['ages']) return;
            var cyclius = M.gods['ages'];
            if (!cyclius._originalDescs) return;
            function getBuffInfo(period) {
                var t = Date.now() / 1000;
                var a = (t / period) * Math.PI * 2;
                var v = 0.15 * Math.sin(a);
                var inc = Math.cos(a) > 0;
                var pos = v >= 0;
                return {
                    arrowClass: inc ? 'green' : 'red',
                    arrow: inc ? '▲' : '▼',
                    textClass: pos ? 'green' : 'red',
                    text: (pos ? '+' : '-') + (Math.abs(v) * 100).toFixed(2) + '%'
                };
            }
            var info1 = getBuffInfo(3 * 60 * 60);
            var info2 = getBuffInfo(12 * 60 * 60);
            var info3 = getBuffInfo(24 * 60 * 60);
            cyclius.desc1 = cyclius._originalDescs.desc1 +
                ` Currently: <span class="${info1.arrowClass}">${info1.arrow}</span> <span class="${info1.textClass}">${info1.text}</span>`;
            cyclius.desc2 = cyclius._originalDescs.desc2 +
                ` Currently: <span class="${info2.arrowClass}">${info2.arrow}</span> <span class="${info2.textClass}">${info2.text}</span>`;
            cyclius.desc3 = cyclius._originalDescs.desc3 +
                ` Currently: <span class="${info3.arrowClass}">${info3.arrow}</span> <span class="${info3.textClass}">${info3.text}</span>`;
            if (Game.tooltip?.draw && Game.tooltip.matches?.('.framed')) {
                Game.tooltip.draw(undefined, 'this');
            }
        };
        Game.registerHook('check', update, 'Cyclius Swatch Update');
        Game._cycliusSwatchHooked = true;
    }

    function setupPantheonSaveLoadHooks() {
        var M = Game.Objects['Temple']?.minigame;
        if (!M || !M.save || M.save._heavenlyUpgradesHooked) return;
        var originalSave = M.save;
        M.save = function() {
            var customGodIds = [];
            if (M.gods?.['procrastination']?.id !== undefined) customGodIds.push(M.gods['procrastination'].id);
            if (M.gods?.['selfishness']?.id !== undefined) customGodIds.push(M.gods['selfishness'].id);
            var savedSlots = [];
            if (M.slot) {
                for (var i = 0; i < M.slot.length; i++) {
                    if (customGodIds.indexOf(M.slot[i]) !== -1) {
                        savedSlots[i] = M.slot[i];
                        M.slot[i] = -1;
                    }
                }
            }
            var result = originalSave.apply(this, arguments);
            for (var i = 0; i < savedSlots.length; i++) {
                if (savedSlots[i] !== undefined) M.slot[i] = savedSlots[i];
            }
            return result;
        };
        M.save._heavenlyUpgradesHooked = true;
    }
    
    function addNewPantheonSpirits() {
        if (!Game.Objects['Temple']?.minigame) return;
        var M = Game.Objects['Temple'].minigame;

        if (M._pantheonSpiritsCheckInterval) {
            clearInterval(M._pantheonSpiritsCheckInterval);
            M._pantheonSpiritsCheckInterval = 0;
        }
        
        // Set up save/load hooks early
        setupPantheonSaveLoadHooks();

        var spirits = {
            procrastination: {key: 'procrastination', name: 'Morrowen, Spirit of Procrastination', icon: [21, 20, getSpriteSheet('custom')], upgrade: 'Morrowen, Spirit of Procrastination',
                activeDescFunc: function() {
                    if (!M.gods['procrastination']) return '';
                    var lvl = Game.hasGod('procrastination'); if (!lvl) return '';
                    var hrs = (M._procrastinationSlotTime ? (Date.now() - M._procrastinationSlotTime) / 3600000 : 0), days = Math.min(Math.floor(hrs / 24), 365), base = [0, 0.03, 0.02, 0.01][lvl], boost = 0;
                    for (var d = 0; d < days; d++) boost += base * Math.pow(0.99, d);
                    if (days < 365) boost += base * Math.pow(0.99, days) * (hrs % 24) / 24;
                    return 'Current Bonus: <span class="green">+' + (boost * 100).toFixed(3) + '%</span>';
                }, desc1: '<span class="green">CpS increases noticeably over time.</span>', desc2: '<span class="green">CpS increases moderately over time.</span>', desc3: '<span class="green">CpS increases slightly over time.</span>', descAfter: '<span class="red">Changing slots resets CpS gain.</span>', quote: 'Unable to bear the weight of its doings, this spirit split apart, reminiscing the forbidden and beautiful. In this eternal flash of inaction, its form melted and folded, as to atone as stone.'},
            selfishness: {key: 'selfishness', name: 'Solgreth, Spirit of Selfishness', icon: [20, 20, getSpriteSheet('custom')], upgrade: 'Solgreth, Spirit of Selfishness',
                activeDescFunc: function() {
                    if (!M.gods['selfishness']) return '';
                    var lvl = Game.hasGod('selfishness'); if (!lvl) return '';
                    var red = Math.min((M._selfishnessClickCount || 0) * [0, 0.03, 0.02, 0.01][lvl], 1);
                    return 'Current penalty: <span class="red">-' + (red * 100).toFixed(2) + '% CpS</span>';
                }, desc1: '<span class="green">Golden cookies appear twice as often.</span> <span class="red">Each golden cookie clicked reduces CpS by 3% additively.</span>', desc2: '<span class="green">Golden cookies appear 50% more often.</span> <span class="red">Each golden cookie clicked reduces CpS by 2% additively.</span>', desc3: '<span class="green">Golden cookies appear 25% more often.</span> <span class="red">Each golden cookie clicked reduces CpS by 1% additively.</span>', descAfter: '<span class="red">When this spirit is unslotted, all beneficial golden cookie buffs are ended. When CpS penalty reaches -100% golden cookies will no longer spawn.</span>', quote: 'This spirit latches and leeches onto all that it can find, consuming them in paralytic obsession.'}
        };

        for (var key in spirits) {
            var spirit = spirits[key], hasUpgrade = Game.Upgrades[spirit.upgrade]?.bought;
            if (hasUpgrade && !M.gods[key]) {
                M.gods[key] = spirit; M.godsById = []; var n = 0;
                for (var i in M.gods) {var god = M.gods[i]; god.id = n; god.slot = -1; M.godsById[n++] = god;}
                var me = M.gods[key], icon = me.icon || [0, 0], godDiv = document.createElement('div'), parentId = M.parent.id;
                godDiv.className = 'ready templeGod templeGod' + (me.id % 4) + ' titleFont'; godDiv.id = 'templeGod' + me.id;
                godDiv.setAttribute('onmouseover', 'Game.tooltip.dynamic=1;Game.tooltip.draw(this,Game.ObjectsById[' + parentId + '].minigame.godTooltip(' + me.id + '),\'this\');');
                godDiv.setAttribute('onmouseout', 'Game.tooltip.shouldHide=1;');
                var iconDiv = document.createElement('div'); iconDiv.className = 'usesIcon shadowFilter templeIcon'; iconDiv.style.backgroundPosition = (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px';
                if (icon[2]) iconDiv.style.backgroundImage = 'url(' + icon[2] + ')';
                var dragDiv = document.createElement('div'); dragDiv.className = 'templeSlotDrag'; dragDiv.id = 'templeGodDrag' + me.id;
                godDiv.appendChild(iconDiv); godDiv.appendChild(dragDiv); l('templeGods').appendChild(godDiv);
                var placeholderDiv = document.createElement('div'); placeholderDiv.className = 'templeGodPlaceholder'; placeholderDiv.id = 'templeGodPlaceholder' + me.id; placeholderDiv.style.display = 'none'; l('templeGods').appendChild(placeholderDiv);
                (function(god) {AddEvent(l('templeGodDrag' + god.id), 'mousedown', function(e) {if (e.button == 0) M.dragGod(god);}); AddEvent(l('templeGodDrag' + god.id), 'mouseup', function(e) {if (e.button == 0) M.dropGod(god);});}(me));
            }
            if (M.gods[key]) {var el = l('templeGod' + M.gods[key].id); if (el) el.style.display = hasUpgrade ? '' : 'none';}
        }
        if (!M._spiritEffectsSetup && (M.gods['procrastination'] || M.gods['selfishness'])) {setupPantheonSpiritEffects(); M._spiritEffectsSetup = true;}

        if (!M.godTooltip._hooked) {
            var origGodTooltip = M.godTooltip;
            M.godTooltip = function(id) {
                return function() {
                    var me = M.godsById[id];
                    if (me && me.icon && me.icon[2]) {
                        var result = origGodTooltip(id)();
                        var searchStr = '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-me.icon[0]*48) + 'px ' + (-me.icon[1]*48) + 'px;">';
                        result = result.replace(
                            searchStr,
                            '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-me.icon[0]*48) + 'px ' + (-me.icon[1]*48) + 'px;background-image:url(' + me.icon[2] + ');">'
                        );
                        return result;
                    }
                    return origGodTooltip(id)();
                };
            };
            M.godTooltip._hooked = true;
        }

        if (!M.slotTooltip._hooked) {
            var origSlotTooltip = M.slotTooltip;
            M.slotTooltip = function(id) {
                return function() {
                    var result = origSlotTooltip(id)();
                    if (M.slot[id] != -1) {
                        var me = M.godsById[M.slot[id]];
                        if (me && me.icon && me.icon[2]) {
                            result = result.replace(
                                '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-me.icon[0]*48) + 'px ' + (-me.icon[1]*48) + 'px;">',
                                '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-me.icon[0]*48) + 'px ' + (-me.icon[1]*48) + 'px;background-image:url(' + me.icon[2] + ');">'
                            );
                        }
                    }
                    return result;
                };
            };
            M.slotTooltip._hooked = true;
        }
    }

    function setupPantheonSpiritEffects() {
        if (!Game.Objects['Temple']?.minigame) return;
        var M = Game.Objects['Temple'].minigame;
        if (M._spiritEffectsSetup) return;
        M._procrastinationSlotTime = M._procrastinationSlotTime || null;
        M._selfishnessClickCount = M._selfishnessClickCount || 0;

        if (M.slotGod && !M.slotGod._hooked) {
            var orig = M.slotGod;
            M.slotGod = function(god, slot) {
                if (!god) return orig.apply(this, arguments);
                var prev = god.slot, result = orig.apply(this, arguments);
                var proc = M.gods['procrastination'], self = M.gods['selfishness'];
                
                if (slot !== prev) {
                    Game.recalculateGains = true;
                }
                
                if (proc && god.id === proc.id) {
                    var oldTime = M._procrastinationSlotTime;
                    var newTime = (slot !== -1 && prev !== slot) ? Date.now() : (slot === -1 ? null : M._procrastinationSlotTime);
                    if (newTime !== oldTime) {
                        M._procrastinationSlotTime = newTime;
                        Game.recalculateGains = true;
                    }
                }
                if (self && god.id === self.id) {
                    var endBuffs = ['frenzy', 'lucky', 'blood frenzy', 'clot', 'click frenzy', 'cookie storm', 'building buff', 'dragon harvest', 'dragonflight'];
                    if (slot === -1 && prev !== -1) {
                        for (var i in Game.buffs) if (Game.buffs[i]?.type && endBuffs.indexOf(Game.buffs[i].type.name) !== -1) Game.buffs[i].time = 0;
                        M._selfishnessClickCount = 0;
                        Game.recalculateGains = true;
                    } else if (slot !== -1 && prev !== -1 && prev !== slot) {
                        for (var i in Game.buffs) if (Game.buffs[i]?.type && endBuffs.indexOf(Game.buffs[i].type.name) !== -1) Game.buffs[i].time = 0;
                        M._selfishnessClickCount = 0;
                    } else if (slot !== -1 && prev === -1) {
                        M._selfishnessClickCount = 0;
                    }
                }
                return result;
            };
            M.slotGod._hooked = true;
        }

        var st = Game.shimmerTypes && Game.shimmerTypes.golden;
        if (st && !st._hooked) {
            var o = st.popFunc;
            st.popFunc = function(me) {
                if (M.gods['selfishness'] && Game.hasGod('selfishness') && me && me.type === 'golden') {
                    if (me.force === 'cookie storm drop' || (me.forceObj && me.forceObj.type === 'cookie storm drop')) {
                        return o.apply(this, arguments);
                    }
                    if (!me._jneSelfishnessCounted) {
                        me._jneSelfishnessCounted = true;
                        M._selfishnessClickCount = (M._selfishnessClickCount || 0) + 1;
                        Game.recalculateGains = true;
                    }
                }
                return o.apply(this, arguments);
            };
            st._hooked = true;
        }

        if (st && !st._selfishnessSpawnConditionsHooked) {
            var originalSpawnConditions = st.spawnConditions;
            st.spawnConditions = function() {
                if (!originalSpawnConditions || !originalSpawnConditions()) return false;
                if (M.gods['selfishness'] && Game.hasGod('selfishness')) {
                    var l = Game.hasGod('selfishness');
                    if (l) {
                        var r = Math.min((M._selfishnessClickCount || 0) * [0, 0.03, 0.02, 0.01][l], 1);
                        if (r >= 1) return false;
                    }
                }
                return true;
            };
            st._selfishnessSpawnConditionsHooked = true;
        }

        if (Game.registerHook && !Game._jneProcrastinationRecalcHooked) {
            Game.registerHook('check', function() {
                var M = Game.Objects['Temple']?.minigame;
                if (!M?.gods?.['procrastination']) return;
                if (!Game.hasGod('procrastination')) return;
                if (!M._procrastinationSlotTime) return;
                if (Game.T % (Game.fps * 5) === 0) Game.recalculateGains = true;
            }, 'Morrowen CpS refresh');
            Game._jneProcrastinationRecalcHooked = true;
        }

        if (M.slotGod?._hooked && st?._hooked && st?._selfishnessSpawnConditionsHooked) M._spiritEffectsSetup = true;
    }

    function setupRegifting() {
        if (!Game.registerHook || Game._regiftingHooked) return;
        Game._regiftingHooked = true;
        Game.registerHook('reset', function(hard) {
            if (hard) return;

            if (!Game.seasonDrops || !Array.isArray(Game.seasonDrops)) return;

            var unlockChanged = false;
            for (var id in Game.UpgradesById) {
                var upgrade = Game.UpgradesById[id];

                if (upgrade &&
                    upgrade.pool !== 'prestige' &&
                    !upgrade.lasting &&
                    !upgrade.unlocked &&
                    Game.seasonDrops.indexOf(upgrade.name) !== -1) {
                    if (Math.random() < 0.1) {
                        upgrade.unlocked = 1;
                        unlockChanged = true;
                    }
                }
            }

            if (unlockChanged) {
                Game.storeToRefresh = 1;
                Game.upgradesToRebuild = 1;
            }
        }, 'Regifting Seasonal Drops');
    }

    function setupCookieReduction() {
        if (typeof choose !== 'function' || choose._jneCookieReductionHooked) return;
        
        var originalChoose = choose;
            choose = function(arr) {
                if (Array.isArray(arr)) {
                    if (arr.indexOf('multiply cookies') !== -1) {
                        var reduction = Game.Has('Even more unlucky luckier') ? 0.01 : Game.Has('Unlucky luckier') ? 0.05 : 0;
                    
                    if (reduction > 0 && Math.random() < reduction) {
                        arr = arr.filter(function(item) {
                            return item !== 'multiply cookies';
                        });
                        if (arr.length === 0) {
                            arr = ['frenzy']; //add something to the poolif we have nothing
                        }
                    }
                }
                    if (arr.indexOf('ruin cookies') !== -1) {
                        var reduction = Game.Has('Flavor enhanced wrath') ? 0.01 : Game.Has('Slightly less bitter wrath') ? 0.05 : 0;
                    
                    if (reduction > 0 && Math.random() < reduction) {
                        arr = arr.filter(function(item) {
                            return item !== 'ruin cookies';
                        });
                        if (arr.length === 0) {
                            arr = ['clot']; 
                        }
                    }
                }
            }
            
            return originalChoose.call(this, arr);
        };
        choose._jneCookieReductionHooked = true;
    }
    
    function setupFishShimmers() {
        if (Game.shimmerTypes && !Game.shimmerTypes['fish']) {
            Game.shimmerTypes['fish'] = {
                reset: function() {
                    this.n = 0;
                    this.time = 0;
                    this.spawned = 0;
                    this.minTime = this.getMinTime(this);
                    this.maxTime = this.getMaxTime(this);
                },
                initFunc: function(me) {
                    me.direction = Math.random() < 0.5 ? -1 : 1;
                    var milkHeight = Game.milkHd * Game.LeftBackground.canvas.height;
                    var milkTop = Game.LeftBackground.canvas.height - milkHeight;
                    me.y = Math.floor(Math.random() * (milkHeight - 100)) + milkTop + 50;
                    
                    var leftPanelWidth = Game.LeftBackground.canvas.width;
                    me.x = me.direction === -1 ? leftPanelWidth + 48 : -48;
                    
                    var iconChoice = Math.floor(Math.random() * 4);
                    var spriteSheetUrl, bgX, bgY;
                    if (iconChoice === 0) {
                        spriteSheetUrl = Game.resPath + 'img/icons.png';
                        bgX = -1104;
                        bgY = -1584;
                    } else {
                        spriteSheetUrl = getSpriteSheet('custom');
                        var customX = (iconChoice - 1) * 48;
                        bgX = -customX;
                        bgY = -1200;
                    }
                    
                    me.l.style.cssText = 'width:48px;height:48px;position:absolute;display:block;opacity:1;background:url(' + spriteSheetUrl + ') ' + bgX + 'px ' + bgY + 'px/auto;pointer-events:auto;';
                    var initialX = me.direction === -1 ? (Game.LeftBackground ? Game.LeftBackground.canvas.width : 300) + 48 : -48;
                    me.l.style.transform = 'translate(' + initialX + 'px,' + me.y + 'px) rotate(0deg) scaleX(' + (me.direction === 1 ? -1 : 1) + ')';
                    
                    if (Game._fishClipBounds) {
                        var clipRight = Math.max(0, (initialX + 48) - Game._fishClipBounds.right);
                        if (clipRight > 0) me.l.style.clipPath = (me.direction === 1 ? 'inset(0px 0px 0px ' + clipRight + 'px)' : 'inset(0px ' + clipRight + 'px 0px 0px)');
                    }
                    
                    me.life = Game.fps * 8;
                    me.swimSpeed = 125;
                    me.baseY = me.y;
                    for (var i = 1; i <= 2; i++) {
                        me['swimAmp' + i] = Math.random() * 10 + (i === 1 ? 10 : 5);
                        me['swimFreq' + i] = Math.random() * 0.04 + (i === 1 ? 0.03 : 0.08);
                        me['swimPhase' + i] = Math.random() * Math.PI * 2;
                    }
                },
                updateFunc: function(me) {
                    if (me.life <= 0) return;
                    
                    // Movement and clipping
                    var leftPanelWidth = Game.LeftBackground.canvas.width;
                    var elapsed = (Game.fps * 8 - me.life) / Game.fps;
                    var xOffset = me.direction === -1 ? leftPanelWidth + 48 - elapsed * me.swimSpeed : -48 + elapsed * me.swimSpeed;
                    
                    // Swimming motion
                    var yOffset = 0;
                    for (var i = 1; i <= 2; i++) yOffset += Math.sin(me.life * me['swimFreq' + i] + me['swimPhase' + i]) * me['swimAmp' + i];
                    var milkTop = Game.LeftBackground.canvas.height - Game.milkHd * Game.LeftBackground.canvas.height;
                    var actualY = Math.max(milkTop + 30, Math.min(milkTop + Game.milkHd * Game.LeftBackground.canvas.height - 30, me.baseY + yOffset));
                    
                    // Transform and clip
                    me.l.style.transform = 'translate(' + xOffset + 'px,' + actualY + 'px) rotate(' + (Math.sin(me.life * 0.1) * 5) + 'deg) scaleX(' + (me.direction === 1 ? -1 : 1) + ')';
                    if (Game._fishClipBounds) {
                        var clipRight = Math.max(0, (xOffset + 48) - Game._fishClipBounds.right);
                        me.l.style.clipPath = clipRight > 0 ? (me.direction === 1 ? 'inset(0px 0px 0px ' + clipRight + 'px)' : 'inset(0px ' + clipRight + 'px 0px 0px)') : 'none';
                        if ((me.direction === 1 && xOffset > Game._fishClipBounds.right + 48) || (me.direction === -1 && xOffset < Game._fishClipBounds.left - 48)) {
                            this.missFunc(me); me.die(); return;
                        }
                    }
                    
                    me.life--;
                    if (me.life <= 0) { this.missFunc(me); me.die(); }
                },
                popFunc: function(me) {
                    if (!Game.Has('Sunken treasure')) {
                        return;
                    }
                    
                    if (me.popped) {
                        return;
                    }
                    me.popped = true;
                    me.die();
                    
                    if (!Game.JNE) Game.JNE = {};
                    Game.JNE.cookieFishCaught = (Game.JNE.cookieFishCaught || 0) + 1;
                    
                    var val = Game.cookiesPs * 60;
                    var moni = Math.max(25, val);
                    Game.Earn(moni);
                    Game.Popup('<div style="font-size:80%;">' + Beautify(moni) + '</div>', Game.mouseX, Game.mouseY);
                    
                    if (typeof PlaySound === 'function') {
                        PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3');
                    }
                },
                missFunc: function(me) {
                },
                spawnConditions: function() {
                    return Game.Has('Fish tank') && Game.prefs.milk != 0;
                },
                spawnsOnTimer: true,
                getMinTime: function(me) {
                    var baseTime = Math.ceil(Game.fps * 180);
                    return Game.Has('Aquaculturist') ? Math.ceil(baseTime * 0.75) : baseTime;
                },
                getMaxTime: function(me) {
                    var baseTime = Math.ceil(Game.fps * 600);
                    return Game.Has('Aquaculturist') ? Math.ceil(baseTime * 0.75) : baseTime;
                },
                n: 0,
                time: 0,
                spawned: 0
            };
            
            Game.shimmerTypes['fish'].reset();
        } else {
            if (Game.shimmerTypes && !Game.shimmerTypes['fish'].initialized) {
                Game.shimmerTypes['fish'].reset();
                Game.shimmerTypes['fish'].initialized = true;
            }
        }
        
        if (Game.registerHook && !Game._milkDebugBoxHooked) {
            Game._milkDebugBoxHooked = true;
            Game.registerHook('draw', function() {
                if (Game.prefs.milk == 0) return;
                if (Game.Has('Fish tank') && Game.LeftBackground) {
                    var milkHeight = Game.milkHd * Game.LeftBackground.canvas.height;
                    var milkTop = Game.LeftBackground.canvas.height - milkHeight;
                    var leftPanelWidth = Game.LeftBackground.canvas.width;
                    
                    Game._fishClipBounds = {
                        top: milkTop,
                        bottom: milkTop + milkHeight,
                        left: 0,
                        right: leftPanelWidth
                    };
                }
            });
        }
        
        if (Game.registerHook && !Game._hatcheryEffectHooked && Game.shimmerTypes && Game.shimmerTypes['fish']) {
            Game._hatcheryEffectHooked = true;
            var originalInitFunc = Game.shimmerTypes['fish'].initFunc;
            Game.shimmerTypes['fish'].initFunc = function(me) {
                originalInitFunc.call(this, me);
                if (Game.Has('Hatchery effect') && Math.random() < 0.1 && !me._hatcheryPair) {
                    me._hatcheryPair = true;
                    if (Game.Shimmer && Game.shimmerTypes && Game.shimmerTypes['fish'] && Game.shimmerTypes['fish'].spawnConditions()) {
                        new Game.Shimmer('fish');
                    }
                }
            };
        }
    }
    
    function setupPeakingUnderTheTree() {
        if (!Game.dropRateMult) return;
        if (Game.dropRateMult._peakingUnderTheTreeHooked) return;
        
        var originalDropRateMult = Game.dropRateMult;
        Game.dropRateMult = function() {
            var mult = originalDropRateMult.call(this);
             if (Game.Has('Peaking under the tree')) mult *= 1.1;
            
            return mult;
        };
        Game.dropRateMult._peakingUnderTheTreeHooked = true;
    }
    
    function setupWallstreetBets() {
        if (!Game.Objects['Bank'] || !Game.Objects['Bank'].minigame) return;
        var M = Game.Objects['Bank'].minigame;
        if (!M.getGoodMaxStock || M.getGoodMaxStock._wallstreetBetsHooked) return;
        
        var originalGetGoodMaxStock = M.getGoodMaxStock;
          M.getGoodMaxStock = function(id) {
              var max = originalGetGoodMaxStock.call(this, id);
              if (Game.Has('Wallstreet bets')) max *= 1.5;
            return max;
        };
        M.getGoodMaxStock._wallstreetBetsHooked = true;
    }
    
    function setupFadingPayout() {
        if (Game._jneFadingPayoutHooked) return;
        Game._jneFadingPayoutHooked = true;
        if (Game.registerHook) {
            var scheduledTimers = {};
            var fadeThreshold = Game.fps * 1.0; //tried to line up the fade but fps varies so shrug
            Game.registerHook('check', function() {
                if (Game.shimmers && (Game.Has('Fading payout') || Game.Has('Lucky fading payout'))) {
                    for (var i in Game.shimmers) {
                        var me = Game.shimmers[i];
                        if (me && me.type === 'golden' && !scheduledTimers[me.id]) {
                            var shimmerId = me.id;
                            var framesUntilFading = me.life - fadeThreshold;
                            var fadeTime = Math.max(0, ((framesUntilFading + 2) / Game.fps) * 1000);
                            scheduledTimers[shimmerId] = setTimeout(function(id) {
                                if (!scheduledTimers[id]) return;
                                scheduledTimers[id] = null;
                                if (Game.shimmers) {
                                    for (var j in Game.shimmers) {
                                        var shimmer = Game.shimmers[j];
                                        if (shimmer && shimmer.id === id && shimmer.type === 'golden' && shimmer.life > 0) {
                                            if (shimmer.force === 'cookie storm drop' || (shimmer.forceObj && shimmer.forceObj.type === 'cookie storm drop')) {
                                                break;
                                            }
                                            var chance = Game.Has('Lucky fading payout') ? 0.02 : 0.01;
                                            if (Math.random() < chance) {
                                                var popupText = 'Fading payout';
                                                var x = shimmer.x+45;
                                                var y = shimmer.y-50;
                                                Game.Popup('<div style="font-size:80%;">' + popupText + '</div>', x, y);
                                                Game.shimmerTypes['golden'].popFunc(shimmer);
                                            }
                                            break;
                                        }
                                    }
                                }
                                delete scheduledTimers[id];
                            }, fadeTime, shimmerId);
                        }
                    }
                }
            }, 'Fading payout auto-click');
        }
    }
    
    function setupTimedGoldenCookies() {
        if (Game._jneTimedGoldenCookiesHooked) return;
        Game._jneTimedGoldenCookiesHooked = true;
        if (Game._jneTimedGoldenCookiesTimeoutId) {
            clearTimeout(Game._jneTimedGoldenCookiesTimeoutId);
            Game._jneTimedGoldenCookiesTimeoutId = 0;
        }
        if (Game._jneTimedGoldenCookiesLastMinuteStamp === undefined) {
            Game._jneTimedGoldenCookiesLastMinuteStamp = { top: -1, bottom: -1 };
        }
        
        function scheduleHalfHour(fn) {
            var now = new Date();
            var next = new Date(now);
            next.setSeconds(0, 0);
            if (now.getMinutes() < 30) {
                next.setMinutes(30);
            } else {
                next.setHours(next.getHours() + 1);
                next.setMinutes(0);
            }
            Game._jneTimedGoldenCookiesTimeoutId = setTimeout(function() {
                fn();
                scheduleHalfHour(fn);
            }, next - now);
        }
        
          function checkAndSpawn() {
             var now = new Date();
             var minutes = now.getMinutes();
             var minuteStamp = Math.floor(now.getTime() / 60000);
             if (minutes === 0 && Game.Has('All is well')) {
                 if (Game._jneTimedGoldenCookiesLastMinuteStamp.top !== minuteStamp) {
                     Game._jneTimedGoldenCookiesLastMinuteStamp.top = minuteStamp;
                     new Game.shimmer('golden', {noWrath: true});
                 }
             }
             if (minutes === 30 && Game.Has('Six bells')) {
                 if (Game._jneTimedGoldenCookiesLastMinuteStamp.bottom !== minuteStamp) {
                     Game._jneTimedGoldenCookiesLastMinuteStamp.bottom = minuteStamp;
                     new Game.shimmer('golden', {noWrath: true});
                 }
             }
         }
        
        scheduleHalfHour(checkAndSpawn);
    }
    
    function setupWeakestLink() {
        if (Game._jneWeakestLinkHooked) return;
        var upgrades = [
            { name: 'Weakest link', rank: 1, mult: 16 },
            { name: 'The next weakest link', rank: 2, mult: 12 },
            { name: 'No more weak links', rank: 3, mult: 8 }
        ];
        
        if (!Game._weakestLinkCache) Game._weakestLinkCache = { assignments: {}, lastRecalc: 0 };
        
        // Store current GetTieredCpsMult (it will probably be cookie.js's override) and chain our multiplier
        var previousGetTieredCpsMult = Game.GetTieredCpsMult;
        Game.GetTieredCpsMult = function(me) {
            if (!me || !me.name) return previousGetTieredCpsMult ? previousGetTieredCpsMult(me) : 1;
            var mult = previousGetTieredCpsMult ? previousGetTieredCpsMult(me) : 1;
            
            var owned = upgrades.filter(function(u) { return Game.Has(u.name); });
            if (owned.length > 0) {
                var cache = Game._weakestLinkCache;
                if (!cache.assignments['Weakest link'] || (Date.now() - cache.lastRecalc) > 1000) {
                    var oldAssignments = {};
                    for (var k in cache.assignments) oldAssignments[k] = cache.assignments[k];
                    
                    var buildings = [];
                    for (var i = 0; i < Game.ObjectsById.length; i++) {
                        var b = Game.ObjectsById[i];
                        if (b && b.amount > 0) {
                            var cps = (b.storedTotalCps || 0) * (Game.globalCpsMult || 1);
                            for (var k in oldAssignments) {
                                if (oldAssignments[k].buildingName === b.name) {
                                    for (var u = 0; u < upgrades.length; u++) {
                                        if (upgrades[u].name === k) {
                                            cps /= upgrades[u].mult;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            buildings.push({ name: b.name, cps: cps });
                        }
                    }
                    
                    buildings.sort(function(a, b) { return a.cps - b.cps; });
                    cache.assignments = {};
                    var used = [];
                    owned.sort(function(a, b) { return a.rank - b.rank; });
                    
                    for (var i = 0; i < owned.length && i < buildings.length; i++) {
                        var idx = owned[i].rank - 1;
                        var found = null;
                        if (idx < buildings.length && used.indexOf(buildings[idx].name) === -1) {
                            found = buildings[idx];
                        } else {
                            for (var j = idx + 1; j < buildings.length; j++) {
                                if (used.indexOf(buildings[j].name) === -1) {
                                    found = buildings[j];
                                    break;
                                }
                            }
                        }
                        if (found) {
                            cache.assignments[owned[i].name] = { buildingName: found.name };
                            used.push(found.name);
                        }
                    }
                    cache.lastRecalc = Date.now();
                }
                
                for (var i = 0; i < owned.length; i++) {
                    var a = cache.assignments[owned[i].name];
                    if (a && a.buildingName === me.name) {
                        mult *= owned[i].mult;
                        break;
                    }
                }
            }
            
            return mult;
        };
        Game._jneWeakestLinkHooked = true;
    }

    function setupPlantAll() {
        var farm = Game.Objects['Farm'];
        if (!farm || !farm.minigameLoaded) return;
        var M = farm.minigame;
        if (!M || M._plantAllHooked || !M.clickTile || !M.useTool) return;
        M._plantAllHooked = true;
        var originalClickTile = M.clickTile;
        M.clickTile = function(x, y) {
            if (Game.Has('Plant all') && Game.keys[16] && Game.keys[17] && M.seedSelected >= 0) {
                var seedId = M.seedSelected;
                var seed = M.plantsById[seedId];
                if (!seed || !M.canPlant(seed)) return originalClickTile.call(M, x, y);
                var planted = M.useTool(seedId, x, y);
                M.toCompute = true;
                if (planted) {
                    for (var yy = 0; yy < 6; yy++) {
                        for (var xx = 0; xx < 6; xx++) {
                            if ((xx === x && yy === y) || !M.isTileUnlocked(xx, yy)) continue;
                            var tile = M.getTile(xx, yy);
                            if (tile && tile[0] === 0 && M.canPlant(seed)) {
                                M.useTool(seedId, xx, yy);
                            }
                        }
                    }
                }
                return;
            }
            return originalClickTile.call(M, x, y);
        };
    }
    
    function setupSoilInspector() {
        if (!Game.Objects['Farm'] || !Game.Objects['Farm'].minigameLoaded) return;
        var M = Game.Objects['Farm'].minigame;
        if (!M || M._soilInspectorHooked) return;
        M._soilInspectorHooked = true;
        
        if (!M.originalTileTooltip) {
            M.originalTileTooltip = M.tileTooltip;
        }
        
        function getPlantGrowthChances(x, y) {
            if (!M || !M.getMuts || !M.getTile || !M.plants || !M.plantsById || !M.soilsById || !M.plotBoost) return null;
            var n = {}, nm = {}, k, t, p, r = [], probs = {}, dirs = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
            for (k in M.plants) { n[k] = 0; nm[k] = 0; }
            for (var i = 0; i < dirs.length; i++) {
                t = M.getTile(x + dirs[i][0], y + dirs[i][1]);
                if (t && t[0] > 0) { var pl = M.plantsById[t[0]-1]; if (pl && pl.key) { n[pl.key]++; if (t[1] >= pl.mature) nm[pl.key]++; } }
            }
            var muts = M.getMuts(n, nm) || [], weedMult = (M.soilsById[M.soil] && M.soilsById[M.soil].weedMult) || 1, repel = (M.plotBoost[y] && M.plotBoost[y][x] ? M.plotBoost[y][x][2] : 1), any = false;
            for (k in n) if (n[k] > 0) { any = true; break; }
            for (i = 0; i < muts.length; i++) {
                var key = muts[i][0], base = muts[i][1], def = M.plants[key];
                if (!def) continue; p = base; if (def.weed) p *= weedMult; if (def.weed || def.fungus) p *= repel; if (p > 0) probs[key] = (probs[key] || 0) + p;
            }
            if (!any) { p = 0.002 * weedMult * repel; if (p > 0) probs.meddleweed = (probs.meddleweed || 0) + p; }
            var total = 0; for (k in probs) total += probs[k]; if (total > 1) { var s = 1 / total; for (k in probs) probs[k] *= s; total = 1; }
            var pNothing = 1 - total; if (pNothing > 0.0001) r.push({ id: '__nothing__', name: 'Nothing', chance: pNothing * 100 });
            for (k in probs) { var def2 = M.plants[k]; if (!def2) continue; p = probs[k] * 100; if (p > 0.01) r.push({ id: k, name: def2.name, chance: p }); }
            r.sort(function(a, b) { return b.chance - a.chance; });
            return r;
        }
        
        M.tileTooltip = function(x, y) {
            var originalTooltip = M.originalTileTooltip(x, y);
            
            if (Game.Has('Soil inspector') && 
                typeof originalTooltip === 'function') {
                
                return function() {
                    var originalHtml = originalTooltip();
                    if (originalHtml && originalHtml.includes('Empty tile')) {
                        var chances = getPlantGrowthChances(x, y);
                        if (chances && chances.length > 0) {
                            var body = chances.map(function(p){return '<div>'+p.name+': <b>'+p.chance.toFixed(1)+'%</b></div>';}).join('');
                            var block = '<div class="line"></div><div style="margin-top: 8px; font-size: 11px;"><div style="margin-bottom: 4px; font-weight: bold;">Natural growth chances (per tick)</div>'+body+'</div>';
                            originalHtml = originalHtml.replace('</div>', block + '</div>');
                        }
                    }
                    return originalHtml;
                };
            }
            
            return originalTooltip;
        };
    }
    
    function setupGardenSaveHookImmediate() {
        var M = Game.Objects['Farm']?.minigame;
        if (!M?.save || M.save._heavenlyUpgradesHooked) return;
        M.save._heavenlyUpgradesHooked = true;
        var originalSave = M.save;
        M.save = function() {
            var savedPlants = [], savedSoil = M.soil, isAerated = M.soils?.aerated && M.soil === M.soils.aerated.id;
            if (M.plot) {
                var plotH = M.h || M.plot.length, plotW = M.w || (M.plot[0]?.length || 0);
                for (var y = 0; y < plotH; y++) {
                    if (!M.plot[y]) continue;
                    for (var x = 0; x < plotW; x++) {
                        var tile = M.plot[y][x];
                        if (tile && tile[0] > 0) {
                            var plant = M.plantsById[tile[0] - 1];
                            if (plant && plant.key && isModPlant(plant.key)) {
                                savedPlants.push({x: x, y: y, tile: [tile[0], tile[1]]});
                                tile[0] = 0;
                            }
                        }
                    }
                }
            }
            if (isAerated) M.soil = 0;
            var result = originalSave.apply(this, arguments);
            savedPlants.forEach(function(p) { if (M.plot[p.y] && M.plot[p.y][p.x]) M.plot[p.y][p.x] = p.tile; });
            if (isAerated) M.soil = savedSoil;
            return result;
        };
    }
    
        
    function setupAeratedSoil() {
        var M = Game.Objects['Farm']?.minigame;
        if (!M) return;
        function isAeratedSelected() {
            return M.soilsById?.[M.soil]?.key === 'aerated';
        }
        if (!M._aeratedSoilLoadHooked && M.load) {
            M._aeratedSoilLoadHooked = true;
            var originalLoad = M.load;
            M.load = function(str) {
                originalLoad.call(this, str);
                if (typeof modSaveData !== 'undefined' && modSaveData.aeratedSoilSelected && Game.Has('Aerated soil') && M.soils.aerated) {
                    M.soil = M.soils.aerated.id;
                }
            };
        }
        if (Game.Has('Aerated soil') && !M.soils.aerated && l('gardenSoils')) {
            M.soils.aerated = {
                    name: 'Aerated soil',
                    icon: 5,
                    customIcon: [15, 24],
                    customIconSheet: getSpriteSheet('custom'),
                    tick: 10,
                    effMult: 1,
                    weedMult: 1.25,
                    req: 500,
                    effsStr: '<div class="gray">&bull; tick every <b>'+Game.sayTime(10*60*Game.fps)+'</b></div><div class="green">&bull; plant aging variance -50%</div><div class="red">&bull; weed growth <b>+25%</b></div>',
                    q: 'Soil enriched with tiny air pockets that help regulate plant growth patterns. Plants grow more predictably while maintaining steady development.'
            };
            
            M.soilsById = [];
            var n = 0;
            for (var i in M.soils) {
                M.soils[i].id = n;
                M.soils[i].key = i;
                M.soilsById[n] = M.soils[i];
                n++;
            }
            if (M.buildPanel && !M._aeratedSoilIconHooked) {
                M._aeratedSoilIconHooked = true;
                var originalBuildPanel = M.buildPanel;
                M.buildPanel = function() {
                    originalBuildPanel.call(this);
                    
                    if (M.soils.aerated && M.soils.aerated.customIcon && l('gardenSoilIcon-' + M.soils.aerated.id)) {
                        var iconEl = l('gardenSoilIcon-' + M.soils.aerated.id);
                        if (iconEl) {
                            iconEl.style.backgroundImage = 'url(\'' + M.soils.aerated.customIconSheet + '\')';
                            iconEl.style.backgroundPosition = (-M.soils.aerated.customIcon[0] * 48) + 'px ' + (-M.soils.aerated.customIcon[1] * 48) + 'px';
                        }
                    }
                };
            }
            if (M.soilTooltip && !M._aeratedSoilTooltipHooked) {
                M._aeratedSoilTooltipHooked = true;
                var originalSoilTooltip = M.soilTooltip;
                M.soilTooltip = function(id) {
                    var tooltipFunc = originalSoilTooltip.call(this, id);
                    var me = M.soilsById[id];
                    
                    if (me && me.key === 'aerated' && me.customIcon && me.customIconSheet) {
                        return function() {
                            var str = '<div style="padding:8px 4px;min-width:350px;" id="tooltipGardenSoil">' +
                                (M.parent.amount < me.req ? (
                                    '<div style="text-align:center;">' + (typeof loc === 'function' ? loc("Soil unlocked at %1 farms.", me.req) : ("Soil unlocked at " + me.req + " farms.")) + '</div>'
                                ) : ('<div class="icon" style="background:url(\'' + me.customIconSheet + '\');float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-me.customIcon[0] * 48) + 'px ' + (-me.customIcon[1] * 48) + 'px;"></div>' +
                                '<div><div class="name">' + me.name + '</div><div><small>' + ((M.soil == me.id) ? (typeof loc === 'function' ? loc("Your field is currently using this soil.") : "Your field is currently using this soil.") : (M.nextSoil > Date.now()) ? (typeof loc === 'function' ? loc("You will be able to change your soil again in %1.", Game.sayTime((M.nextSoil - Date.now()) / 1000 * 30 + 30, -1)) : ("You will be able to change your soil again in " + Game.sayTime((M.nextSoil - Date.now()) / 1000 * 30 + 30, -1) + ".")) : (typeof loc === 'function' ? loc("Click to use this type of soil for your whole field.") : "Click to use this type of soil for your whole field.")) + '</small></div></div>' +
                                '<div class="line"></div>' +
                                '<div class="description">' +
                                    '<div style="margin:6px 0px;"><b>' + (typeof loc === 'function' ? loc("Effects:") : "Effects:") + '</b></div>' +
                                    '<div style="font-size:11px;font-weight:bold;">' + me.effsStr + '</div>' +
                                    (me.q ? ('<q>' + me.q + '</q>') : '') +
                                '</div>')) +
                            '</div>';
                            return str;
                        };
                    }
                    return tooltipFunc;
                };
            }
            
            if (M.buildPanel) M.buildPanel();
            if (typeof modSaveData !== 'undefined' && modSaveData.aeratedSoilSelected) {
                M.soil = M.soils.aerated.id;
            }
        }
        if (Game.Has('Aerated soil') && !M._aeratedSoilHooked) {
            M._aeratedSoilHooked = true;
            if (!M._originalLogic) M._originalLogic = M.logic;
            var originalAgeTickRs = {};
            for (var i in M.plants) {
                if (M.plants[i].ageTickR !== undefined) originalAgeTickRs[i] = M.plants[i].ageTickR;
            }
            M.logic = function() {
                var shouldReduceVariance = isAeratedSelected() && !M.freeze && Date.now() >= M.nextStep;
                if (shouldReduceVariance) {
                    for (var i in originalAgeTickRs) M.plants[i].ageTickR = originalAgeTickRs[i] * 0.5;
                    try {
                        M._originalLogic.call(this);
                    } finally {
                        for (var i in originalAgeTickRs) M.plants[i].ageTickR = originalAgeTickRs[i];
                    }
                } else {
                    M._originalLogic.call(this);
                }
            };
        }
    }

    function setupHeavenlyPlantUnlocks() {
        var M = Game.Objects['Farm']?.minigame;
        if (!M?.getUnlockedN || M._heavenlyPlantUnlocksHooked) return;
        M._heavenlyPlantUnlocksHooked = true;
        M.getUnlockedN = function() {
            var unlockedN = 0;
            var plantsN = 0;
            for (var i in M.plants) {
                if (MOD_PLANT_KEYS.indexOf(i) === -1) {
                    plantsN++;
                    if (M.plants[i].unlocked) unlockedN++;
                }
            }
            M.plantsN = plantsN;
            M.plantsUnlockedN = unlockedN;

            var tool = l('gardenTool-3');
            if (unlockedN >= plantsN) {
                Game.Win('Keeper of the conservatory');
                if (tool) tool.classList.remove('locked');
            } else {
                if (tool) tool.classList.add('locked');
            }
            return unlockedN;
        };
        M.getUnlockedN();
    }

    function setupNewPlants() {
        if (!Game.Objects['Farm']) return;

        var M = Game.Objects['Farm'].minigame;
        if (!M || !M.plants || !M.plantsById) return;
        
        if (M._gardenPlantsInjected) return;
        
        if (!M.plants['bakerWheat']) return;
        
        M._gardenPlantsInjected = true;

        function kudzuOnDie(x, y) {
            if (Math.random() < 0.10) new Game.shimmer('golden');
        }
        function mushroomOnHarvest(x, y, age) {
            if (age >= this.mature) {
                //going back and forth on 1% and 1.5% but with drop multiplers 1% feels better
                var rate = 0.010 * Game.dropRateMult() * (Game.HasAchiev('Seedless to nay') ? 1.05 : 1);
                
                if (Math.random() < rate) {
                    var upgrades = [];
                    var cookieStates = {
                        'Hearty farm biscuit': Game.Upgrades['Hearty farm biscuit'] ? Game.Upgrades['Hearty farm biscuit'].unlocked : false,
                        'Astronaut cookie': Game.Upgrades['Astronaut cookie'] ? Game.Upgrades['Astronaut cookie'].unlocked : false,
                        'The chemist cookie': Game.Upgrades['The chemist cookie'] ? Game.Upgrades['The chemist cookie'].unlocked : false
                    };
                    
                    if (!cookieStates['Hearty farm biscuit']) {
                        upgrades.push('Hearty farm biscuit');
                    }
                    if (!cookieStates['Astronaut cookie']) {
                        upgrades.push('Astronaut cookie');
                    }
                    if (!cookieStates['The chemist cookie']) {
                        upgrades.push('The chemist cookie');
                    }
                    
                    if (upgrades.length > 0) {
                        var chosen = upgrades[Math.floor(Math.random() * upgrades.length)];
                        
                        var wasLocked = !cookieStates[chosen];
                        
                        if (wasLocked && Game.Upgrades[chosen]) {
                            Game.Upgrades[chosen].unlocked = 1;
                            
                            if (Game && Game.UpdateMenu) {
                                Game.UpdateMenu();
                            }
                            
                            var cookieIcons = {
                                'Hearty farm biscuit': [10, 18],
                                'Astronaut cookie': [21, 16],
                                'The chemist cookie': [24, 17]
                            };
                            
                            Game.Notify('New Cookie Found!', chosen, cookieIcons[chosen]);
                        }
                    }
                }
            }
        }

        M.plants['sparklingSugarCane'] = {
            name: 'Sparkling sugar cane',
            icon: 34,
            cost: 8 * 60,
            costM: 5000000000000,
            ageTick: 0.75,
            ageTickR: 0.5,
            mature: 80,
            unlocked: 0,
            children: [],
            effsStr: '<div class="green">&bull; sugar lumps have 1% chance to double when gained</div><div class="red">&bull; CpS -2%</div><div class="red">&bull; cannot handle cold climates; 95% chance to die when frozen</div>',
            q: 'A tropical variant of sugar cane that produces exceptionally sweet crystals. Its delicate nature makes it vulnerable to cold, but the sugary bounty is worth the risk.'
        };

        M.plants['krazyKudzu'] = {
            name: 'Krazy kudzu',
            icon: 35,
            cost: 5 * 60,
            costM: 1000000000000,
            ageTick: 0.1,
            ageTickR: 2.0,
            mature: 8,
            unlocked: 0,
            children: [],
            effsStr: '<div class="green">&bull; has 10% chance to spawn a golden cookie on decay</div><div class="red">&bull; golden cookie frequency -1%</div><div class="red">&bull; may overtake nearby plants</div>',
            q: 'An invasive vine that grows with reckless abandon. Though it chokes out other plants, its flowers attract rare butterflies that some say bring good fortune.',
            weed: true,
            contam: 0.50,
            detailsStr: 'Spreads aggressively and grows extraordinarily unpredictably.',
            onDie: kudzuOnDie
        };

        M.plants['magicMushroom'] = {
            name: 'Magic mushroom',
            icon: 36,
            cost: 10,
            costM: 100000000,
            ageTick: 2,
            ageTickR: 0.2,
            mature: 30,
            unlocked: 0,
            children: [],
            effsStr: '<div class="green">&bull; your least productive building is 100% more effective</div><div class="red">&bull; golden cookie frequency -1%</div>',
            q: 'A psychotropic fungus known for its peculiar effect on perception.',
            fungus: true,
            onHarvest: mushroomOnHarvest
        };
        
        var nextId = M.plantsById.length;
        for (var key in M.plants) {
            var it = M.plants[key];
            if (isModPlant(key) && !it.id) {
                it.id = nextId;
                it.key = key;
                if (!it.matureBase) it.matureBase = it.mature;
                M.plantsById[nextId] = it;
                if (typeof it.plantable === 'undefined') it.plantable = true;
                var requiredUpgrade = it.name;
                if (!Game.Has(requiredUpgrade)) {
                    it.unlocked = 0;
                }
                if (typeof it.q === 'string') {
                    it.q = loc(FindLocStringByPart(it.name + ' quote')) || it.q;
                }
                if (typeof it.name === 'string') {
                    it.name = loc(it.name);
                }
                nextId++;
            }
        }
        M._realPlantsN = M.plantsById.length;
        
        for (var i in M.plants) {
            if (M.plants[i].contam && !M.plantContam[M.plants[i].key]) {
                M.plantContam[M.plants[i].key] = M.plants[i].contam;
            }
        }
        
        if (M.computeMatures) M.computeMatures();
        
        setupPlantHooks(M);
        
        var gardenSeedsEl = l('gardenSeeds');
        if (gardenSeedsEl) {
            for (var key in M.plants) {
                var me = M.plants[key];
                if (isModPlant(key) && me.id !== undefined) {
                    var existingEl = l('gardenSeed-' + me.id);
                    if (!existingEl) {
                        var bgPosX = -(me.icon - 34) * 240;
                        var bgPosY = -1152;

                        var str = '<div id="gardenSeed-' + me.id + '" class="gardenSeed' + (M.seedSelected == me.id ? ' on' : '') + (me.unlocked ? '' : ' locked') + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.seedTooltip(' + me.id + ')', 'this') + '>';
                        str += '<div id="gardenSeedIcon-' + me.id + '" class="gardenSeedIcon shadowFilter" data-custom-plant="true" style="background-position:' + bgPosX + 'px ' + bgPosY + 'px;"></div>';
                        str += '</div>';
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = str;
                        var seedDiv = tempDiv.firstChild;
                        gardenSeedsEl.appendChild(seedDiv);
                        me.l = l('gardenSeed-' + me.id);
                        AddEvent(me.l, 'click', function(me) {
                            return function() {
                                if (/* !M.freeze && */Game.keys[16] && Game.keys[17]) { // shift & ctrl
                                    // harvest all mature of type
                                    M.harvestAll(me, 1);
                                    return false;
                                }
                                if (!me.plantable && !Game.sesame) return false;
                                if (M.seedSelected == me.id) {
                                    M.seedSelected = -1;
                                    M.cursor = -1;
                                } else {
                                    M.seedSelected = me.id;
                                    M.cursor = me.id;
                                    PlaySound('snd/toneTick.mp3');
                                }
                                for (var i in M.plants) {
                                    var it = M.plants[i];
                                    if (it.l) {
                                        if (it.id == M.seedSelected) {
                                            it.l.classList.add('on');
                                        } else {
                                            it.l.classList.remove('on');
                                        }
                                    }
                                }
                            };
                        }(me));
                        
                        AddEvent(me.l, 'mouseover', M.hideCursor);
                        AddEvent(me.l, 'mouseout', M.showCursor);
                        
                        if (me.unlocked) me.l.classList.remove('locked');
                    }
                }
            }
        }
        
        if (M.reset && !M._resetHooked) {
            M._resetHooked = true;
            var origReset = M.reset;
            M.reset = function(hard) {
                origReset.call(this, hard);
            };
        }
        
        if (M.load && !M._loadHooked) {
            M._loadHooked = true;
            var origLoad = M.load;
            M.load = function(str) {
                origLoad.call(this, str);
            };
        }
        
        if (M.init && !M._initSwapped) {
            M._initSwapped = true;
            var originalInit = M.init;
            M.init = function(div) {
                originalInit.call(this, div);
                if (M.plants && M.plantsById && !M.plants['sparklingSugarCane']) {
                    var wasInjected = M._gardenPlantsInjected;
                    M._gardenPlantsInjected = false;
                    setupNewPlants();
                    M._gardenPlantsInjected = wasInjected || true;
                }
            };
        }
    }
    
    function setupPlantHooks(M) {
        if (!M || M._plantHooksSetup) return;
        M._plantHooksSetup = true;

        if (!M._iconFixSetup) {
            M._iconFixSetup = true;
            var customSheet = getSpriteSheet('custom');
            var vanillaSheet = Game.resPath + 'img/gardenPlants.png?v=' + Game.version;
            var iconMap = {
                34: { baseX: 0, baseY: -1152 },
                35: { baseX: -240, baseY: -1152 },
                36: { baseX: -480, baseY: -1152 }
            };

            if (!document.getElementById('customGardenPlantsCSS')) {
                var style = document.createElement('style');
                style.id = 'customGardenPlantsCSS';
                var css = '';

                for (var i = 0; i < 34; i++) {
                    css += '#gardenSeedIcon-' + i + ' { background-image: url(\'' + vanillaSheet + '\') !important; }\n';
                }

                css += '.gardenSeedIcon[data-custom-plant="true"] { background-image: url(\'' + customSheet + '\') !important; }\n';
                css += '.gardenTileIcon[data-custom-plant="true"] { background-image: url(\'' + customSheet + '\') !important; }\n';
                css += '#gardenCursor[data-custom-plant="true"] { background-image: url(\'' + customSheet + '\') !important; }\n';
                css += '.gardenSeedIcon[data-vanilla-plant="true"] { background-image: url(\'' + vanillaSheet + '\') !important; }\n';
                css += '.gardenTileIcon[data-vanilla-plant="true"] { background-image: url(\'' + vanillaSheet + '\') !important; }\n';
                css += '#gardenCursor[data-vanilla-plant="true"] { background-image: url(\'' + vanillaSheet + '\') !important; }\n';

                style.textContent = css;
                document.head.appendChild(style);
            }

            function addCustomPlantCSSRules() {
                var style = document.getElementById('customGardenPlantsCSS');
                if (!style || M._customPlantCSSAdded) return;
                M._customPlantCSSAdded = true;

                var css = style.textContent;
                for (var key in M.plants) {
                    var me = M.plants[key];
                    if (me && (key === 'sparklingSugarCane' || key === 'krazyKudzu' || key === 'magicMushroom')) {
                        if (me.id !== undefined) {
                            css += '.gardenSeedIcon#gardenSeedIcon-' + me.id + ' { background-image: url(\'' + customSheet + '\') !important; }\n';
                        }
                    }
                }
                style.textContent = css;
            }

            function markVanillaSeeds() {
                for (var i = 0; i < 34; i++) {
                    var el = l('gardenSeedIcon-' + i);
                    if (el) {
                        el.setAttribute('data-vanilla-plant', 'true');
                    }
                }
            }

            function markCustomSeeds() {
                for (var key in M.plants) {
                    var me = M.plants[key];
                    if (me && (key === 'sparklingSugarCane' || key === 'krazyKudzu' || key === 'magicMushroom')) {
                        if (me.id !== undefined) {
                            var el = l('gardenSeedIcon-' + me.id);
                            if (el) {
                                el.setAttribute('data-custom-plant', 'true');
                                el.removeAttribute('data-vanilla-plant');
                            }
                        }
                    }
                }
            }

            function fixPlantIcon(el, plantIcon, stage, plantKey) {
                if (!el || !el.style || !plantKey) return;
                if (plantKey !== 'sparklingSugarCane' && plantKey !== 'krazyKudzu' && plantKey !== 'magicMushroom') return;
                if (!M.plants || !M.plants[plantKey]) return;
                if (plantIcon !== 34 && plantIcon !== 35 && plantIcon !== 36) return;
                if (!iconMap[plantIcon]) return;

                el.setAttribute('data-custom-plant', 'true');
                el.removeAttribute('data-vanilla-plant');

                var map = iconMap[plantIcon];
                el.style.backgroundPosition = (map.baseX - stage * 48) + 'px ' + map.baseY + 'px';
                if (el.style.display === 'none') el.style.display = 'block';
            }

            function getPlantStage(age, mature) {
                if (age >= mature) return 4;
                if (age >= mature * 0.666) return 3;
                if (age >= mature * 0.333) return 2;
                return 1;
            }

            if (M.draw && !M._drawHookedForIcons) {
                M._drawHookedForIcons = true;
                var origDraw = M.draw;
                M.draw = function() {
                    origDraw.call(this);
                    var customPlantKeys = ['sparklingSugarCane', 'krazyKudzu', 'magicMushroom'];
                    for (var y = 0; y < 6; y++) {
                        for (var x = 0; x < 6; x++) {
                            var tile = M.plot[y][x];
                            if (tile && tile[0] > 0) {
                                var me = M.plantsById[tile[0] - 1];
                                
                                if (!me || typeof me.key !== 'string') continue;
                                
                                var isCustomKey = false;
                                for (var k = 0; k < customPlantKeys.length; k++) {
                                    if (me.key === customPlantKeys[k]) {
                                        isCustomKey = true;
                                        break;
                                    }
                                }
                                if (!isCustomKey) continue;
                                
                                if (!M.plants || typeof M.plants[me.key] !== 'object') continue;
                                
                                if (typeof me.icon !== 'number') continue;
                                if (me.icon !== 34 && me.icon !== 35 && me.icon !== 36) continue;
                                
                                var el = l('gardenTileIcon-' + x + '-' + y);
                                if (el && el.style.display !== 'none') {
                                    el.setAttribute('data-custom-plant', 'true');
                                    el.removeAttribute('data-vanilla-plant');
                                    fixPlantIcon(el, me.icon, getPlantStage(tile[1], me.mature), me.key);
                                }
                            } else if (tile && tile[0] > 0) {
                                var el = l('gardenTileIcon-' + x + '-' + y);
                                if (el) {
                                    el.setAttribute('data-vanilla-plant', 'true');
                                    el.removeAttribute('data-custom-plant');
                                }
                            }
                        }
                    }
                    if (M.cursorL && M.cursor && M.seedSelected >= 0) {
                        var seed = M.plantsById[M.seedSelected];
                        if (seed && seed.key && (seed.key === 'sparklingSugarCane' || seed.key === 'krazyKudzu' || seed.key === 'magicMushroom')) {
                            if (seed.icon && (seed.icon === 34 || seed.icon === 35 || seed.icon === 36)) {
                                M.cursorL.setAttribute('data-custom-plant', 'true');
                                M.cursorL.removeAttribute('data-vanilla-plant');
                                fixPlantIcon(M.cursorL, seed.icon, 0, seed.key);
                            }
                        } else if (seed) {
                            M.cursorL.setAttribute('data-vanilla-plant', 'true');
                            M.cursorL.removeAttribute('data-custom-plant');
                        }
                    }
                };
            }

            if (M.buildPanel) {
                var orig = M.buildPanel;
                M.buildPanel = function() {
                    orig.call(this);

                    addCustomPlantCSSRules();
                    markVanillaSeeds();
                    markCustomSeeds();

                    for (var i in M.plants) {
                        var me = M.plants[i];
                        if (me && me.key && (me.key === 'sparklingSugarCane' || me.key === 'krazyKudzu' || me.key === 'magicMushroom')) {
                            if (me.icon && (me.icon === 34 || me.icon === 35 || me.icon === 36)) {
                                var el = l('gardenSeedIcon-' + me.id);
                                if (el) {
                                    fixPlantIcon(el, me.icon, 0, me.key);
                                }
                            }
                        }
                    }
                };
            }

            if (M.buildPlot && !M._buildPlotHookedForData) {
                M._buildPlotHookedForData = true;
                var origBuildPlot = M.buildPlot;
                M.buildPlot = function() {
                    origBuildPlot.call(this);

                    for (var y = 0; y < 6; y++) {
                        for (var x = 0; x < 6; x++) {
                            var tile = M.plot[y][x];
                            var el = l('gardenTileIcon-' + x + '-' + y);
                            if (el && tile && tile[0] > 0) {
                                var me = M.plantsById[tile[0] - 1];
                                if (me && me.key && (me.key === 'sparklingSugarCane' || me.key === 'krazyKudzu' || me.key === 'magicMushroom')) {
                                    el.setAttribute('data-custom-plant', 'true');
                                    el.removeAttribute('data-vanilla-plant');
                                } else {
                                    el.setAttribute('data-vanilla-plant', 'true');
                                    el.removeAttribute('data-custom-plant');
                                }
                            }
                        }
                    }
                };
            }
            if (M.seedTooltip) {
                var origSeedTooltip = M.seedTooltip;
                M.seedTooltip = function(id) {
                    var func = origSeedTooltip.call(this, id);
                    if (typeof func === 'function') {
                        return function() {
                            var result = func();
                            var me = M.plantsById[id];
                            if (me && me.key && (me.key === 'sparklingSugarCane' || me.key === 'krazyKudzu' || me.key === 'magicMushroom')) {
                                if (me.icon && (me.icon === 34 || me.icon === 35 || me.icon === 36) && iconMap[me.icon] && result) {
                                    var map = iconMap[me.icon];
                                    var iconY = -me.icon * 48;
                                    
                                    result = result.replace(/background:url\(([^)]+gardenPlants\.png[^)]*)\)/g, function(match, url) {
                                        var nextPos = result.indexOf('background-position:', result.indexOf(match));
                                        if (nextPos !== -1) {
                                            var posMatch = result.substring(nextPos).match(/background-position:\s*(-?\d+)\s*px\s+(-?\d+)\s*px/);
                                            if (posMatch && parseInt(posMatch[2]) === iconY) {
                                                return 'background:url(\'' + customSheet + '\')';
                                            }
                                        }
                                        return match;
                                    });
                                    
                                    result = result.replace(/background-position:\s*(-?\d+)\s*px\s+(-?\d+)\s*px/g, function(match, x, y) {
                                        if (parseInt(y) === iconY) {
                                            var newX = map.baseX - ((parseInt(x) / -48) * 48);
                                            return 'background-position:' + newX + 'px ' + map.baseY + 'px';
                                        }
                                        return match;
                                    });
                                }
                            }
                            return result;
                        };
                    }
                    return func;
                };
            }
            
            if (M.tileTooltip) {
                var origTileTooltip = M.tileTooltip;
                M.tileTooltip = function(x, y) {
                    var func = origTileTooltip.call(this, x, y);
                    if (typeof func === 'function') {
                        return function() {
                            var result = func();
                            var tile = M.plot[y][x];
                            if (tile && tile[0] > 0) {
                                var me = M.plantsById[tile[0] - 1];
                                if (me && me.key && (me.key === 'sparklingSugarCane' || me.key === 'krazyKudzu' || me.key === 'magicMushroom')) {
                                    if (me.icon && (me.icon === 34 || me.icon === 35 || me.icon === 36) && iconMap[me.icon] && result) {
                                        var map = iconMap[me.icon];
                                        var iconY = -me.icon * 48;
                                        
                                        result = result.replace(/background:url\(([^)]+gardenPlants\.png[^)]*)\)/g, function(match, url) {
                                            var nextPos = result.indexOf('background-position:', result.indexOf(match));
                                            if (nextPos !== -1) {
                                                var posMatch = result.substring(nextPos).match(/background-position:\s*(-?\d+)\s*px\s+(-?\d+)\s*px/);
                                                if (posMatch && parseInt(posMatch[2]) === iconY) {
                                                    return 'background:url(\'' + customSheet + '\')';
                                                }
                                            }
                                            return match;
                                        });
                                        
                                        result = result.replace(/background-position:\s*(-?\d+)\s*px\s+(-?\d+)\s*px/g, function(match, x, y) {
                                            if (parseInt(y) === iconY) {
                                                var tooltipStage = parseInt(x) / -48;
                                                var newX = map.baseX - (tooltipStage * 48);
                                                return 'background-position:' + newX + 'px ' + map.baseY + 'px';
                                            }
                                            return match;
                                        });
                                    }
                                }
                            }
                            return result;
                        };
                    }
                    return func;
                };
            }

            if (M.toolTooltip) {
                var origToolTooltip = M.toolTooltip;
                M.toolTooltip = function(id) {
                    var func = origToolTooltip.call(this, id);
                    if (typeof func === 'function') {
                        return function() {
                            var result = func();
                            
                            var tool = M.toolsById && M.toolsById[id];
                            if (tool && tool.name && tool.name.indexOf('Garden information') !== -1 && result) {
                                var customInfo = '';
                                
                                if (M.effs && M.effs.magicMushroomMult > 0) {
                                    var mult = M.effs.magicMushroomMult;
                                    
                                    if (!Game._weakestLinkCache) Game._weakestLinkCache = { assignments: {}, lastRecalc: 0 };
                                    var cache = Game._weakestLinkCache;
                                    
                                    var buildings = [];
                                    for (var i = 0; i < Game.ObjectsById.length; i++) {
                                        var b = Game.ObjectsById[i];
                                        if (b && b.amount > 0) {
                                            var cps = (b.storedTotalCps || 0) * (Game.globalCpsMult || 1);
                                            
                                            if (cache.assignments) {
                                                for (var k in cache.assignments) {
                                                    if (cache.assignments[k].buildingName === b.name) {
                                                        for (var u = 0; u < WEAKEST_LINK_UPGRADES.length; u++) {
                                                            if (WEAKEST_LINK_UPGRADES[u].name === k && Game.Has(k)) {
                                                                cps /= WEAKEST_LINK_UPGRADES[u].mult;
                                                                break;
                                                            }
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                            
                                            if (cache.magicMushroomAssignment === b.name) {
                                                cps /= (1 + M.effs.magicMushroomMult);
                                            }
                                            
                                            buildings.push({ name: b.name, cps: cps });
                                        }
                                    }
                                    buildings.sort(function(a, b) { return a.cps - b.cps; });

                                    var boostedBuilding = buildings.length > 0 ? buildings[0].name : null;
                                    var multPercent = Math.round(mult * 100);
                                    
                                    if (boostedBuilding && Game.Objects[boostedBuilding]) {
                                        customInfo += '<div style="font-size:10px;margin-left:64px;"><b>&bull; ' + Game.Objects[boostedBuilding].single + ' CpS </b><span class="green">+' + multPercent + '%</span></div>';
                                    }
                                }
                                
                                var totalMult = 0;
                                var soilMult = M.soilsById[M.soil].effMult;

                                for (var y = 0; y < 6; y++) {
                                    for (var x = 0; x < 6; x++) {
                                        var tile = M.plot[y][x];
                                        if (tile && tile[0] > 0) {
                                            var plant = M.plantsById[tile[0] - 1];
                                            if (plant && plant.key === 'sparklingSugarCane') {
                                                var stage = 0;
                                                if (tile[1] >= plant.mature) stage = 4;
                                                else if (tile[1] >= plant.mature * 0.666) stage = 3;
                                                else if (tile[1] >= plant.mature * 0.333) stage = 2;
                                                else stage = 1;

                                                var mult = soilMult;
                                                if (stage == 1) mult *= 0.1;
                                                else if (stage == 2) mult *= 0.25;
                                                else if (stage == 3) mult *= 0.5;
                                                else mult *= 1;

                                                mult *= M.plotBoost[y][x][1];
                                                totalMult += mult;
                                            }
                                        }
                                    }
                                }

                                if (totalMult > 0) {
                                    var actualChance = totalMult * 0.01;
                                    var chancePercent = (actualChance * 100).toFixed(2);
                                    customInfo += '<div style="font-size:10px;margin-left:64px;"><b>&bull; sugar lump doubling</b><span class="green"> +' + chancePercent + '%</span></div>';
                                }
                                
                                if (customInfo) {
                                    result = result.replace(
                                        /(<div>Combined effects of all your plants:<\/div>)/,
                                        '$1' + customInfo
                                    );
                                }
                            }
                            
                            return result;
                        };
                    }
                    return func;
                };
            }
        }
        
        if (M.getMuts && !M._newPlantMutsHooked) {
            M._newPlantMutsHooked = true;
            var originalGetMuts = M.getMuts;
            M.getMuts = function(neighs, neighsM) {
                var muts = originalGetMuts.call(this, neighs, neighsM);

                if (Game.Has('Sparkling sugar cane')) {
                    if (neighsM['bakeberry'] >= 1 && neighsM['thumbcorn'] >= 1) muts.push(['sparklingSugarCane', 0.01]);
                }

                if (Game.Has('Krazy kudzu')) {
                    if (neighsM['meddleweed'] >= 1 && neighsM['greenRot'] >= 1) muts.push(['krazyKudzu', 0.02]);
                    if (neighsM['meddleweed'] >= 1 && neighsM['clover'] >= 1) muts.push(['krazyKudzu', 0.005]);
                    if (neighsM['krazyKudzu'] >= 1 && neighs['krazyKudzu'] < 2) muts.push(['krazyKudzu', 0.25]);
                    else if (neighsM['krazyKudzu'] >= 2 && neighs['krazyKudzu'] < 4) muts.push(['krazyKudzu', 0.30]);
                    else if (neighsM['krazyKudzu'] >= 4) muts.push(['krazyKudzu', 0.30]);
                }

                if (Game.Has('Magic mushroom')) {
                    if (neighsM['ichorpuff'] >= 1 && neighsM['doughshroom'] >= 1) muts.push(['magicMushroom', 0.003]);
                }

                return muts;
            };
        }

        if (M.computeEffs && !M._newPlantEffsHooked) {
            M._newPlantEffsHooked = true;
            var originalComputeEffs = M.computeEffs;
            M.computeEffs = function() {
                originalComputeEffs.call(this);

                if (!M.freeze) {
                    var soilMult = M.soilsById[M.soil].effMult;
                    var magicMushroomMult = 0;

                    for (var y = 0; y < 6; y++) {
                        for (var x = 0; x < 6; x++) {
                            var tile = M.plot[y][x];
                            if (tile[0] > 0) {
                                var me = M.plantsById[tile[0] - 1];
                                var name = me.key;
                                var stage = 0;
                                if (tile[1] >= me.mature) stage = 4;
                                else if (tile[1] >= me.mature * 0.666) stage = 3;
                                else if (tile[1] >= me.mature * 0.333) stage = 2;
                                else stage = 1;

                                var mult = soilMult;
                                if (stage == 1) mult *= 0.1;
                                else if (stage == 2) mult *= 0.25;
                                else if (stage == 3) mult *= 0.5;
                                else mult *= 1;

                                mult *= M.plotBoost[y][x][1];

                                if (name == 'sparklingSugarCane') {
                                    M.effs.cps *= 1 - 0.02 * mult;
                                }
                                else if (name == 'krazyKudzu') {
                                    M.effs.goldenCookieFreq *= 1 - 0.01 * mult;
                                    if (M.effs.wrathCookieFreq !== undefined) M.effs.wrathCookieFreq *= 1 - 0.01 * mult;
                                }
                                else if (name == 'magicMushroom') {
                                    M.effs.goldenCookieFreq *= 1 - 0.01 * mult;
                                    if (M.effs.wrathCookieFreq !== undefined) M.effs.wrathCookieFreq *= 1 - 0.01 * mult;
                                    magicMushroomMult += mult;
                                }
                            }
                        }
                    }

                    if (!M.effs.buildingBoosts) M.effs.buildingBoosts = {};
                    M.effs.magicMushroomMult = magicMushroomMult;
                }

                Game.recalculateGains = 1;
            };
        }

        if (!Game._magicMushroomHooked) {
            Game._magicMushroomHooked = true;
            var previousGetTieredCpsMult = Game.GetTieredCpsMult;
            Game.GetTieredCpsMult = function(me) {
                if (!me || !me.name) return previousGetTieredCpsMult ? previousGetTieredCpsMult(me) : 1;
                var mult = previousGetTieredCpsMult ? previousGetTieredCpsMult(me) : 1;

                var M = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
                if (M && M.effs && M.effs.magicMushroomMult > 0) {
                    if (!Game._weakestLinkCache) Game._weakestLinkCache = { assignments: {}, lastRecalc: 0 };
                    var cache = Game._weakestLinkCache;

                    if (!cache.magicMushroomAssignment || (Date.now() - cache.lastRecalc) > 1000) {
                        var buildings = [];
                        
                        for (var i = 0; i < Game.ObjectsById.length; i++) {
                            var b = Game.ObjectsById[i];
                            if (b && b.amount > 0) {
                                var cps = (b.storedTotalCps || 0) * (Game.globalCpsMult || 1);
                                
                                if (cache.assignments) {
                                    for (var k in cache.assignments) {
                                        if (cache.assignments[k].buildingName === b.name) {
                                            for (var u = 0; u < WEAKEST_LINK_UPGRADES.length; u++) {
                                                if (WEAKEST_LINK_UPGRADES[u].name === k && Game.Has(k)) {
                                                    cps /= WEAKEST_LINK_UPGRADES[u].mult;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                                
                                if (cache.magicMushroomAssignment === b.name) {
                                    cps /= (1 + M.effs.magicMushroomMult);
                                }
                                
                                buildings.push({ name: b.name, cps: cps });
                            }
                        }
                        buildings.sort(function(a, b) { return a.cps - b.cps; });

                        if (buildings.length > 0) {
                            cache.magicMushroomAssignment = buildings[0].name;
                        }
                    }

                    if (cache.magicMushroomAssignment === me.name) {
                        mult *= 1 + M.effs.magicMushroomMult;
                    }
                }

                return mult;
            };
        }

        if (M.freeze !== undefined && !M._newPlantFreezeHooked) {
            M._newPlantFreezeHooked = true;

            var checkFreeze = function() {
                var currentFreeze = M.freeze;
                if (typeof M._lastFreezeState === 'undefined') M._lastFreezeState = currentFreeze;

                if (currentFreeze && !M._lastFreezeState) {
                    for (var y = 0; y < 6; y++) {
                        for (var x = 0; x < 6; x++) {
                            var tile = M.plot[y][x];
                            if (tile && tile[0] > 0) {
                                var me = M.plantsById[tile[0] - 1];
                                if (me.key === 'sparklingSugarCane' && Math.random() < 0.95) {
                                    M.plot[y][x] = [0, 0];
                                    M.toRebuild = true;
                                }
                            }
                        }
                    }
                }

                M._lastFreezeState = currentFreeze;
            };

            if (Game.registerHook) {
                Game.registerHook('logic', checkFreeze);
            }
        }

        if (Game.harvestLumps && !Game._sugarCaneHooked) {
            Game._sugarCaneHooked = true;
            var originalHarvestLumps = Game.harvestLumps;
            Game.harvestLumps = function(amount, silent) {
                var M = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
                if (M && M.plants && M.plants['sparklingSugarCane'] && M.plot) {
                    var totalMult = 0;
                    var soilMult = M.soilsById[M.soil].effMult;

                    for (var y = 0; y < 6; y++) {
                        for (var x = 0; x < 6; x++) {
                            var tile = M.plot[y][x];
                            if (tile && tile[0] > 0) {
                                var plant = M.plantsById[tile[0] - 1];
                                if (plant && plant.key === 'sparklingSugarCane') {
                                    var stage = 0;
                                    if (tile[1] >= plant.mature) stage = 4;
                                    else if (tile[1] >= plant.mature * 0.666) stage = 3;
                                    else if (tile[1] >= plant.mature * 0.333) stage = 2;
                                    else stage = 1;

                                    var mult = soilMult;
                                    if (stage == 1) mult *= 0.1;
                                    else if (stage == 2) mult *= 0.25;
                                    else if (stage == 3) mult *= 0.5;
                                    else mult *= 1;

                                    mult *= M.plotBoost[y][x][1];
                                    totalMult += mult;
                                }
                            }
                        }
                    }

                    if (totalMult > 0) {
                        var chance = totalMult * 0.01;
                        if (Math.random() < chance) {
                            amount *= 2;
                            if (!silent) {
                                Game.Notify('Sugar cane doubled your sugar lumps!', 'Your sparkling sugar cane plants triggered a lucky doubling!', [4, 24, getSpriteSheet('custom')], 6);
                            }
                        }
                    }
                }
                return originalHarvestLumps.call(this, amount, silent);
            };
        }

        
    }
    
    if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
        var M = Game.Objects['Farm'].minigame;
        if (M && M.plants && M.plants['sparklingSugarCane']) {
            setupPlantHooks(M);
        }
    }

    function setupMagicMushroomDrops() {
        if (!Game.Has('Magic mushroom')) return;

        var upgrades = [
            [
                'Hearty farm biscuit',
                [10, 18],
                'Farm',
                'Farms',
                'A fairly unappealing biscuit made from leftover droppings from your farm. Taste aside, they are heavily subsidized by the government.'
            ],
            [
                'Astronaut cookie',
                [21, 16],
                'Shipment',
                'Shipments',
                'Space-age technology, which in all honesty is really just dehydration. Lies in cookie form sold to gullible children who were told they could grow up to be anything.'
            ],
            [
                'The chemist cookie',
                [24, 17],
                'Alchemy lab',
                'Alchemy labs',
                'Legend holds this cookie was created by a pharmacist mixing expired compounds together and selling them to uninsured patients in the hope it might do some good. Tastes like cough syrup, but good for the profit margins.'
            ]
        ];

        for (var i = 0; i < upgrades.length; i++) {
            var u = upgrades[i];
            if (!Game.Upgrades[u[0]]) {
                var desc = u[3] + ' are <b>twice</b> as efficient.<br>Cost scales with CpS.<q>' + u[4] + '</q>';
                var basePrice = 600;
                new Game.Upgrade(u[0], desc, basePrice, u[1]);
                Game.last.ddesc = desc;
                Game.last.pool = 'cookie';
                Game.last.power = 0;
                Game.last.lasting = true;
                Game.last._heavenlyUpgrade = true;
                Game.last.priceFunc = function(cost) { return function() { return cost * Game.cookiesPs * 60; }; }(Game.last.basePrice);
                Game.last.buyFunction = function() {
                    this.unlocked = 1;
                };
            }
        }

        if (!Game._magicMushroomDropsHooked) {
            Game._magicMushroomDropsHooked = true;
            var prev = Game.GetTieredCpsMult;
            Game.GetTieredCpsMult = function(me) {
                if (!me || !me.name) return prev ? prev(me) : 1;
                var mult = prev ? prev(me) : 1;
                if ((me.name === 'Farm' && Game.Has('Hearty farm biscuit')) ||
                    (me.name === 'Shipment' && Game.Has('Astronaut cookie')) ||
                    (me.name === 'Alchemy lab' && Game.Has('The chemist cookie'))) mult *= 2;
                return mult;
            };
        }
    }

    function setupShinyWrinklerSpell() {
        var M = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
        if (!M || !M.castSpell || M._shinyWrinklerHooked) return;
        var originalCastSpell = M.castSpell;
        M.castSpell = function(spell) {
            var before = new Set();
            if (spell && spell.name === 'Resurrect Abomination') {
                for (var i in Game.wrinklers) {
                    var w = Game.wrinklers[i];
                    if (w && w.phase > 0) before.add(w);
                }
            }
            var result = originalCastSpell.call(this, spell);
            if (spell && spell.name === 'Resurrect Abomination' && result !== -1) {
                var chance = 0, upgrade = null;
                if (Game.Has('Alakazoodle evil noodle')) { chance = 0.03; upgrade = Game.Upgrades['Alakazoodle evil noodle']; }
                else if (Game.Has('Abra-Ka-Wiggle')) { chance = 0.02; upgrade = Game.Upgrades['Abra-Ka-Wiggle']; }
                else if (Game.Has('Skitter skatter skrum ahh')) { chance = 0.01; upgrade = Game.Upgrades['Skitter skatter skrum ahh']; }
                if (chance > 0 && Math.random() < chance) {
                    var found = false;
                    var check = function() {
                        if (found) return;
                        for (var i in Game.wrinklers) {
                            var w = Game.wrinklers[i];
                            if (w && w.phase > 0 && !before.has(w) && w.type === 0) {
                                w.type = 1;
                                found = true;
                                if (upgrade && Game.Notify) Game.Notify(upgrade.name, 'A shiny wrinkler has been summoned!', upgrade.icon || [0, 0]);
                                return;
                            }
                        }
                    };
                    check();
                    setTimeout(check, 25);
                    setTimeout(check, 100);
                }
            }
            return result;
        };
        M._shinyWrinklerHooked = true;
    }
    
    function setupGildedAllureSpell() {
        if (Game.buffType && !Game._gildedAllureBuffTypesCreated) {
            Game._gildedAllureBuffTypesCreated = true;
            new Game.buffType('gilded allure', (t,p)=>({name:'Gilded allure',desc:'Golden cookies appear 30% more often for the next '+Game.sayTime(t*Game.fps,-1)+'.',icon:[20,19,getSpriteSheet('custom')],time:t*Game.fps}));
            new Game.buffType('midas curse', (t,p)=>({name:'Midas curse',desc:'Golden cookies appear 75% less often for the next '+Game.sayTime(t*Game.fps,-1)+'.',icon:[20,19,getSpriteSheet('custom')],time:t*Game.fps}));
        }

        if (!Game.Has('Gilded allure')) return;
        var M = Game.Objects['Wizard tower']?.minigame;
        if (!M || M._gildedAllureHooked || !M.spells || !M.spellsById || typeof l !== 'function' || !l('grimoireSpells')) return;
        var me={name:loc("Gilded Allure"),desc:loc("Golden Cookies appear 30% more often for the next 10 minutes."),failDesc:loc("Golden Cookies appear 75% less often for the next hour."),icon:[20,19],customIconSheet:getSpriteSheet('custom'),costMin:15,costPercent:0.5,
            win:()=>{Game.killBuff('Gilded allure');Game.killBuff('Midas curse');Game.gainBuff('gilded allure',600,1);Game.Popup(loc("Golden allure!"),Game.mouseX,Game.mouseY);},
            fail:()=>{Game.killBuff('Gilded allure');Game.killBuff('Midas curse');Game.gainBuff('midas curse',3600,1);Game.Popup(loc("Backfire!")+'<br>'+loc("Midas curse!"),Game.mouseX,Game.mouseY);}};
        M.spells['gilded allure']=me; me.id=M.spellsById.length; M.spellsById[me.id]=me; M._gildedAllureHooked=true;
        var div = document.createElement('div');
        div.innerHTML = '<div class="grimoireSpell titleFont" id="grimoireSpell'+me.id+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.spellTooltip('+me.id+')','this')+'><div class="usesIcon shadowFilter grimoireIcon" style="background-image:url(\''+me.customIconSheet+'\');background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div><div class="grimoirePrice" id="grimoirePrice'+me.id+'">-</div></div>';
        var d = div.firstChild;
        l('grimoireSpells').appendChild(d); AddEvent(d,'click',()=>{PlaySound('snd/tick.mp3');M.castSpell(me);});

        if (M.spellTooltip && !M._gildedAllureTooltipHooked) {
            M._gildedAllureTooltipHooked = true;
            var originalSpellTooltip = M.spellTooltip;
            M.spellTooltip = function(id) {
                var tooltipFunc = originalSpellTooltip.call(this, id);
                var spell = M.spellsById[id];
                
                if (spell && spell.name === loc("Gilded Allure") && spell.customIconSheet) {
                    return function() {
                        spell.icon = spell.icon || [20, 19];
                        var cost = Beautify(M.getSpellCost(spell));
                        var costBreakdown = M.getSpellCostBreakdown(spell);
                        if (cost != costBreakdown) costBreakdown = ' <small>(' + costBreakdown + ')</small>'; else costBreakdown = '';
                        var backfire = M.getFailChance(spell);
                        var str = '<div style="padding:8px 4px;min-width:350px;" id="tooltipSpell">' +
                            '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-image:url(\'' + spell.customIconSheet + '\');background-position:' + (-spell.icon[0] * 48) + 'px ' + (-spell.icon[1] * 48) + 'px;"></div>' +
                            '<div class="name">' + spell.name + '</div>' +
                            '<div>' + (typeof loc === 'function' ? loc("Magic cost:") : "Magic cost:") + ' <b style="color:#' + (cost <= M.magic ? '6f6' : 'f66') + ';">' + cost + '</b>' + costBreakdown + '</div>' +
                            (spell.fail ? ('<div><small>' + (typeof loc === 'function' ? loc("Chance to backfire:") : "Chance to backfire:") + ' <b style="color:#f66">' + Math.ceil(100 * backfire) + '%</b></small></div>') : '') +
                            '<div class="line"></div><div class="description"><b>' + (typeof loc === 'function' ? loc("Effect:") : "Effect:") + '</b> <span class="green">' + (spell.descFunc ? spell.descFunc() : spell.desc) + '</span>' + (spell.failDesc ? ('<div style="height:8px;"></div><b>' + (typeof loc === 'function' ? loc("Backfire:") : "Backfire:") + '</b> <span class="red">' + spell.failDesc + '</span>') : '') + '</div></div>';
                        return str;
                    };
                }
                return tooltipFunc;
            };
        }
    }

    function setupWizardlyAccomplishments() {
        if (!Game.Has('Wizardly accomplishments')) return;
        var M = Game.Objects['Wizard tower']?.minigame;
        if (!M || M._wizardlyAccomplishmentsHooked) return;
        if (typeof l !== 'function') return;

        M.logic = function() {
            if (Game.T%5==0) {M.computeMagicM();}
            var towerLevel = Math.min(M.parent.level, 20);
            var bonus = (towerLevel * 0.001) / Game.fps; // level 4 6&% increase, level 10 16.7%, level 20 33%
            M.magicPS = Math.max(0.002, Math.pow(M.magic/Math.max(M.magicM,100),0.5))*0.002 + bonus;
            M.magic += M.magicPS;
            M.magic = Math.min(M.magic, M.magicM);
            if (Game.T%5==0) for (var i in M.spells) {
                var me = M.spells[i], cost = M.getSpellCost(me);
                var priceEl = l('grimoirePrice' + me.id);
                if (priceEl) priceEl.innerHTML = Beautify(cost);
                var spellEl = l('grimoireSpell' + me.id);
                if (spellEl) spellEl.className = M.magic < cost ? 'grimoireSpell titleFont' : 'grimoireSpell titleFont ready';
            }
        };

        M.draw = function() {
            if (Game.drawT%5==0) {
                if (M.magicBarTextL) M.magicBarTextL.innerHTML=Math.min(Math.floor(M.magicM),Beautify(M.magic))+'/'+Beautify(Math.floor(M.magicM))+(M.magic<M.magicM?(' ('+loc("+%1/s",Beautify((M.magicPS||0)*Game.fps,3))+')'):'');
                if (M.magicBarFullL) M.magicBarFullL.style.width=((M.magic/M.magicM)*100)+'%';
                if (M.magicBarL) M.magicBarL.style.width=(M.magicM*3)+'px';
                if (M.infoL) M.infoL.innerHTML=loc("Spells cast: %1 (total: %2)",[Beautify(M.spellsCast),Beautify(M.spellsCastTotal)]);
            }
            if (M.magicBarFullL) M.magicBarFullL.style.backgroundPosition=(-Game.T*0.5)+'px';
        };

        M._wizardlyAccomplishmentsHooked = true;
    }
    
    function setupBlackfridaySpecial() {
        if (Game.computeSeasonPrices && !Game.computeSeasonPrices._blackfridayHooked) {
            var original = Game.computeSeasonPrices;

            var wrapTriggerPriceFunc = function(trigger) {
                if (!trigger || !trigger.priceFunc) return;

                if (trigger.priceFunc === trigger._blackfridayWrappedFunc) return;

                trigger._blackfridayOriginal = trigger.priceFunc;
                trigger._blackfridayWrappedFunc = function() {
                    var price = trigger._blackfridayOriginal.apply(this, arguments);
                    return Game.Has('Blackfriday special') ? price * 0.75 : price;
                };
                trigger.priceFunc = trigger._blackfridayWrappedFunc;
            };

            Game.computeSeasonPrices = function() {
                original.apply(this, arguments);
                if (Game.seasons) {
                    for (var i in Game.seasons) {
                        var trigger = Game.seasons[i].triggerUpgrade;
                        wrapTriggerPriceFunc(trigger);
                    }
                }
            };
            Game.computeSeasonPrices._blackfridayHooked = true;

            try {
                Game.computeSeasonPrices();
            } catch (e) {}
        }
    }
    
 /**
     * Improved Cookie Chains
     * 
     * At high cookie counts, vanilla chains end immediately because the starting level
     * (based on log10(cookies)) exceeds maxPayout. This fix calculates a starting level
     * based on maxPayout instead, giving ~7 chain clicks that end with maxPayout. End result is
	 * player gets the same amount from the cookie chain but gets more spawns on it feeling more like the vanilla approach
     */
 function setupImprovedCookieChains() {
    if (!Game.shimmerTypes) return;
    
    var shimmerType = Game.shimmerTypes['golden'];
    if (!shimmerType || !shimmerType.popFunc || shimmerType._improvedChainsHooked) return;
    
    var originalPopFunc = shimmerType.popFunc;
    
    shimmerType.popFunc = function(me) {
        if (!Game.Has || !Game.Has('Improved cookie chains')) { //we dont have upgrade let vanilla do everything
            return originalPopFunc.call(this, me);
        }
        
        var isChainCookie = this.chain > 0 || me.force === 'chain cookie'; //This isnt a cookie chain let vanilla do everything
        if (!isChainCookie) {
            return originalPopFunc.call(this, me);
        }
        
        // Vanilla logic to award achievements and such
        if (me.spawnLead) {
            Game.goldenClicks++;
            Game.goldenClicksLocal++;
            if (Game.goldenClicks >= 1) Game.Win('Golden cookie');
            if (Game.goldenClicks >= 7) Game.Win('Lucky cookie');
            if (Game.goldenClicks >= 27) Game.Win('A stroke of luck');
            if (Game.goldenClicks >= 77) Game.Win('Fortune');
            if (Game.goldenClicks >= 777) Game.Win('Leprechaun');
            if (Game.goldenClicks >= 7777) Game.Win('Black cat\'s paw');
            if (Game.goldenClicks >= 27777) Game.Win('Seven horseshoes');
            if (Game.goldenClicks >= 7) Game.Unlock('Lucky day');
            if (Game.goldenClicks >= 27) Game.Unlock('Serendipity');
            if (Game.goldenClicks >= 77) Game.Unlock('Get lucky');
            if ((me.life / Game.fps) > (me.dur - 1)) Game.Win('Early bird');
            if (me.life < Game.fps) Game.Win('Fading luck');
            if (me.wrath) Game.Win('Wrath cookie');
        }
        if (Game.forceUnslotGod && Game.forceUnslotGod('asceticism')) Game.useSwap(1000000);
        
        // Effect multiplier
        var mult = 1;
        if (me.wrath > 0) mult *= 1 + Game.auraMult('Unholy Dominion') * 0.1;
        else mult *= 1 + Game.auraMult('Ancestral Metamorphosis') * 0.1;
        if (Game.Has('Green yeast digestives')) mult *= 1.01;
        if (Game.Has('Dragon fang')) mult *= 1.03;
        mult *= me.wrath ? Game.eff('wrathCookieGain') : Game.eff('goldenCookieGain');
        
        if (this.chain === 0) this.totalFromChain = 0;
        this.chain++;
        var digit = me.wrath ? 6 : 7;
        var maxPayout = Math.min(Game.cookiesPs * 60 * 60 * 6, Game.cookies * 0.5) * mult;
        
        if (this.chain === 1) {
            var finalLevel = Math.floor(Math.log(maxPayout * 9 / digit / mult) / Math.LN10);
            var idealStart = Math.max(0, finalLevel - 7);
            var vanillaStart = Math.max(0, Math.ceil(Math.log(Game.cookies) / Math.LN10) - 10);
            this.chain += Math.min(vanillaStart, idealStart);
        }
        
        var moni = Math.max(digit, Math.min(Math.floor(1 / 9 * Math.pow(10, this.chain) * digit * mult), maxPayout));
        var nextMoni = Math.max(digit, Math.min(Math.floor(1 / 9 * Math.pow(10, this.chain + 1) * digit * mult), maxPayout));
        var randomBreak = Math.random() < 0.01;
        var maxPayoutReached = nextMoni >= maxPayout;
        
        if (maxPayoutReached && !randomBreak) moni = maxPayout;
        
        this.totalFromChain += moni;
        Game.Earn(moni);
        
        var popup;
        if (randomBreak || maxPayoutReached) {
            this.chain = 0;
            popup = loc("Cookie chain") + '<br><small>' + loc("+%1!", loc("%1 cookie", LBeautify(moni))) + '<br>' + loc("Cookie chain over. You made %1.", loc("%1 cookie", LBeautify(this.totalFromChain))) + '</small>';
        } else {
            popup = loc("Cookie chain") + '<br><small>' + loc("+%1!", loc("%1 cookie", LBeautify(moni))) + '</small>';
        }
        
        Game.Popup(popup, me.x + me.l.offsetWidth / 2, me.y);
        Game.DropEgg(0.9);
        Game.SparkleAt(me.x + 48, me.y + 48);
        PlaySound('snd/shimmerClick.mp3');
        me.die();
        
        if (this.chain > 0) {
            this.minTime = this.getMinTime(me);
            this.maxTime = this.getMaxTime(me);
            this.time = 0;
        }
    };
    
    shimmerType._improvedChainsHooked = true;
}

    function setupGoldenCookiePredictor() {
        if (!Game.registerHook || Game._goldenCookiePredictorHooked) return;
        Game._goldenCookiePredictorHooked = true;
        if (!Game.shimmerTypes || !Game.shimmerTypes['golden'] || !Game.shimmerTypes['golden'].popFunc) return;
        
        var shimmerCache = {};
        var overlay = null;
        function noop() {}
        function noopReturnNull() { return null; }
        
        function getOverlay() {
            if (overlay) return overlay;
            var gameDiv = document.getElementById('game');
            if (!gameDiv) return null;
            overlay = document.createElement('div');
            overlay.id = 'gcp-overlay';
            overlay.style.position = 'absolute';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '2147483647';
            if (window.getComputedStyle(gameDiv).position === 'static') {
                gameDiv.style.position = 'relative';
            }
            gameDiv.appendChild(overlay);
            return overlay;
        }
        
        function getPredictorChance() {
            if (Game.Has('Perfected golden cookie predictor')) return 0.65;
            if (Game.Has('Improved golden cookie predictor')) return 0.50;
            if (Game.Has('Tweaked golden cookie predictor')) return 0.25;
            if (Game.Has('Golden cookie predictor')) return 0.10;
            return 0;
        }
        
        function wrapPopFunc() {
            var shimmerType = Game.shimmerTypes && Game.shimmerTypes['golden'];
            if (!shimmerType || !shimmerType.popFunc || shimmerType._gcpWrapped) return;
            
            var originalPopFunc = shimmerType.popFunc;
            
            shimmerType.popFunc = function(me) {
                if (me && me._predictionMode) {
                    var savedLast = this.last;
                    var savedChain = this.chain;
                    var savedTotalFromChain = this.totalFromChain;
                    
                    var originals = {
                        gainBuff: Game.gainBuff,
                        Earn: Game.Earn,
                        Spend: Game.Spend,
                        Popup: Game.Popup,
                        SparkleAt: Game.SparkleAt,
                        DropEgg: Game.DropEgg,
                        Win: Game.Win,
                        Unlock: Game.Unlock,
                        gainLumps: Game.gainLumps,
                        killBuff: Game.killBuff,
                        useSwap: Game.useSwap,
                        PlaySound: typeof PlaySound === 'function' ? PlaySound : null
                    };
                    
                    Game.gainBuff = noopReturnNull;
                    Game.Earn = noop;
                    Game.Spend = noop;
                    Game.Popup = noop;
                    Game.SparkleAt = noop;
                    Game.DropEgg = noop;
                    Game.Win = noop;
                    Game.Unlock = noop;
                    Game.gainLumps = noop;
                    Game.killBuff = noop;
                    if (Game.useSwap) Game.useSwap = noop;
                    if (originals.PlaySound) window.PlaySound = noop;
                    
                    var capturedChoice = null;
                    
                    try {
                        originalPopFunc.call(this, me);
                        capturedChoice = this.last || null;
                    } catch (e) {
                        console.error('[Heavenly Upgrades] Error in prediction:', e);
                    } finally {
                        Game.gainBuff = originals.gainBuff;
                        Game.Earn = originals.Earn;
                        Game.Spend = originals.Spend;
                        Game.Popup = originals.Popup;
                        Game.SparkleAt = originals.SparkleAt;
                        Game.DropEgg = originals.DropEgg;
                        Game.Win = originals.Win;
                        Game.Unlock = originals.Unlock;
                        Game.gainLumps = originals.gainLumps;
                        Game.killBuff = originals.killBuff;
                        if (Game.useSwap) Game.useSwap = originals.useSwap;
                        if (originals.PlaySound) window.PlaySound = originals.PlaySound;
                        
                        this.last = savedLast;
                        this.chain = savedChain;
                        if (savedTotalFromChain !== undefined) {
                            this.totalFromChain = savedTotalFromChain;
                        }
                    }
                    
                    me._predictedChoice = capturedChoice;
                    return;
                }
                
                return originalPopFunc.call(this, me);
            };
            
            shimmerType._gcpWrapped = true;
        }

        wrapPopFunc();
        
        function predictGoldenCookieResult(shimmer) {
            if (!shimmer || shimmer.type !== 'golden') return null;

            if (shimmer.force && shimmer.force !== '') {
                return shimmer.force;
            }
            
            var shimmerType = Game.shimmerTypes && Game.shimmerTypes['golden'];
            if (!shimmerType || !shimmerType.popFunc) return null;
            
            if (shimmerType.chain > 0) {
                return null;
            }
            
            var fakeShimmer = {
                id: shimmer.id,
                type: shimmer.type,
                wrath: shimmer.wrath || 0,
                life: shimmer.life || 0,
                dur: shimmer.dur || 0,
                spawnLead: false,
                force: shimmer.force || '',
                x: shimmer.x || 0,
                y: shimmer.y || 0,
                l: { offsetWidth: 48, offsetHeight: 48 },
                die: noop,
                _predictionMode: true
            };
            
            try {
                shimmerType.popFunc.call(shimmerType, fakeShimmer);
                return fakeShimmer._predictedChoice || null;
            } catch (e) {
                console.error('[Heavenly Upgrades] Error predicting:', e);
                return null;
            }
        }
        
        function formatResultName(result) {
            if (!result || result === '') return result;
            
            if (result === 'multiply cookies') {
                return 'Lucky Cookie';
            }

            if (result === 'blood frenzy') {
                return 'Elder Frenzy';
            }
            
            return result.split(' ').map(function(word) {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
        }
        
        function ensureListeners(shimmer) {
            if (shimmerCache[shimmer.id]) return;
            shimmerCache[shimmer.id] = { div: null, prediction: null, predictedForce: null };
            
            shimmer.l.addEventListener('mouseenter', function() {
                var chance = getPredictorChance();
                if (chance === 0) return;
                var rec = shimmerCache[shimmer.id];
                if (!rec) return;
                
                if (rec.prediction === null) {
                    rec.prediction = Math.random() < chance;
                }
                if (!rec.prediction) return;
                
                var displayText = shimmer.force || '';
                if (!displayText || displayText === '') {
                    if (rec.predictedForce === null) {
                        rec.predictedForce = predictGoldenCookieResult(shimmer);
                        if (rec.predictedForce) {
                            shimmer.force = rec.predictedForce;
                        }
                    }
                    displayText = rec.predictedForce || '';
                }
                
                if (displayText === 'cookie storm drop' || !displayText || displayText === '') return;
                
                if (!rec.div) {
                    var d = document.createElement('div');
                    d.className = 'framed';
                    d.style.position = 'absolute';
                    d.style.transform = 'translate(-50%, -50%)';
                    d.style.padding = '4px 8px';
                    d.style.font = '14px Merriweather, serif';
                    d.style.color = '#fff';
                    d.style.pointerEvents = 'none';
                    getOverlay().appendChild(d);
                    rec.div = d;
                }
                
                rec.div.textContent = formatResultName(displayText);
                
                var b = shimmer.l.getBounds();
                rec.div.style.left = (b.left + b.width / 2 - 3) + 'px';
                rec.div.style.top = b.top + (b.height / 4) + 'px';
                rec.div.style.display = 'block';
            });
            
            shimmer.l.addEventListener('mouseleave', function() {
                var rec = shimmerCache[shimmer.id];
                if (rec && rec.div) {
                    rec.div.style.display = 'none';
                }
            });
        }
        
        Game.registerHook('draw', function() {
            var chance = getPredictorChance();
            if (!Game.shimmers || chance === 0) return;
            
            var activeIds = {};
            for (var i in Game.shimmers) {
                var s = Game.shimmers[i];
                if (s && s.type === 'golden' && s.life > 0) {
                    activeIds[s.id] = true;
                    ensureListeners(s);
                }
            }
            
            for (var id in shimmerCache) {
                if (!activeIds[id]) {
                    var rec = shimmerCache[id];
                    if (rec.div) rec.div.remove();
                    delete shimmerCache[id];
                }
            }
        }, 'Golden cookie predictor draw');
    }
    
    
    

    function setupSugarFrenzyII() {
        if (!Game.Has('Sugar frenzy II')) return;

        var button = Game.Upgrades['Sugar frenzy'];
        if (!button || button._sugarFrenzyII) return;

        button._sugarFrenzyII = true;
        if (!Game.sugarFrenzyLastUse) Game.sugarFrenzyLastUse = 0;
        if (!Game.sugarFrenzyPrice) Game.sugarFrenzyPrice = 1;

        if ((Game.sugarFrenzyLastUse || 0) === 0 && button.bought) {
            Game.sugarFrenzyLastUse = Date.now();
            if ((Game.sugarFrenzyPrice || 1) < 2) Game.sugarFrenzyPrice = 2;
        }

        if (button.bought) {
            if (typeof button.unearn === 'function') button.unearn();
            else button.bought = 0;
        }

        var cooldown = 24 * 60 * 60 * 1000;
        var baseDesc = 'Activating this will <b>triple your CpS</b> for 1 hour.<br><br>May be used <b>once every 24 hours</b>. Each use in an ascension increases the cost by <b>one additional sugar lump</b>.';

        button.desc = baseDesc;
        Object.defineProperty(button, 'ddesc', {
            get: function() {
                var timeSinceLastUse = Date.now() - (Game.sugarFrenzyLastUse || 0);
                if (timeSinceLastUse < cooldown) {
                    var timeStr = Game.sayTime(Math.ceil((cooldown - timeSinceLastUse) / 1000 * Game.fps), -1);
                    return '<div style="text-align:center;margin-bottom:8px;"><b>Cooldown remaining: ' + timeStr + '</b></div><div class="line"></div>' + baseDesc;
                }
                return baseDesc;
            },
            configurable: true
        });
        Object.defineProperty(button, 'priceLumps', {
            get: function() {
                return Game.sugarFrenzyPrice || 1;
            },
            configurable: true
        });

        button.canBuyFunc = function() {
            var price = Game.sugarFrenzyPrice || 1;
            if (Game.lumps < price) return false;
            return Date.now() - (Game.sugarFrenzyLastUse || 0) >= cooldown;
        };

        button.clickFunction = function() {
            var price = Game.sugarFrenzyPrice || 1;
            if (Game.lumps < price) return;
            if (Date.now() - (Game.sugarFrenzyLastUse || 0) < cooldown) return;

            var priceText = price + ' sugar lump' + (price !== 1 ? 's' : '');
            var newPrice = price + 1;
            Game.Prompt('<id SugarFrenzyPrompt><h3>Activate the sugar frenzy?</h3><div class="block">' +
                'Spend ' + priceText + ' to activate Sugar frenzy (triple CpS for 1 hour).</div>', [
                ['Activate', 'Game.ClosePrompt();Game.sugarFrenzyLastUse = Date.now();Game.lumps -= ' + price + ';Game.sugarFrenzyPrice = ' + newPrice + ';Game.gainBuff(\'sugar frenzy\', 60 * 60, 3);Game.Notify("Sugar frenzy!", "CpS x3 for 1 hour!", [29, 14]);Game.storeToRefresh=1;Game.upgradesToRebuild=1;if(Game.RefreshStore)Game.RefreshStore();if(Game.RebuildUpgrades)Game.RebuildUpgrades();'],
                'Cancel'
            ]);
        };

        button.displayFuncWhenOwned = function() {
            var timeSinceLastUse = Date.now() - (Game.sugarFrenzyLastUse || 0);
            if (timeSinceLastUse < cooldown) {
                var timeStr = Game.sayTime(Math.ceil((cooldown - timeSinceLastUse) / 1000 * Game.fps), -1);
                return '<div style="text-align:center;">Cooldown remaining:<br><b>' + timeStr + '</b></div>';
            }
            return '<div style="text-align:center;">Click to activate!</div>';
        };

        button.timerDisplay = function() {
            var timeSinceLastUse = Date.now() - (Game.sugarFrenzyLastUse || 0);
            if (Game.sugarFrenzyLastUse === 0 || timeSinceLastUse >= cooldown) return -1;
            return timeSinceLastUse / cooldown;
        };
    }

    function setupSugarForSugarTrading() {
        if (!Game.Has('Sugar for sugar trading') || Game.Upgrades['Sugar trade']) return;

        var desc = 'Spend a <b>sugar lump</b> to summon a <b>Golden Cookie</b>.<br>May be used once per ascension.';
        new Game.Upgrade('Sugar trade', desc, 0, [21, 17]);
        var button = Game.last;
        button.pool = 'toggle';
        button.toggleInto = 0;
        button.order = 40051;
        button.priceLumps = 1;
        button.desc = button.ddesc = desc;
        button.canBuyFunc = function() {
            return Game.lumps >= 1 && this.bought === 0;
        };
        button.clickFunction = Game.spendLump(1, "summon a golden cookie", function() {
            button.buy(1);
            new Game.shimmer('golden');
            Game.Notify("Sugar trade", "Summoned a golden cookie.", [21, 17]);
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            if (Game.RefreshStore) { Game.RefreshStore(); }
            if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
        });
        Game.Unlock('Sugar trade');
    }

    // Helper functions to detect current state 
    var detectRigidelSlot = function() {
        if (Game.BuildingsOwned % 10 !== 0) return 0;
        if (Game.hasGod && typeof Game.hasGod === 'function') {
            try {
                var slot = Game.hasGod('order');
                if (slot && typeof slot === 'number' && slot >= 1 && slot <= 3) return slot;
            } catch (e) {}
        }
        return 0;
    };

    var detectDragonsCurve = function() {
        if (Game.auraMult) {
            var mult = Game.auraMult('Dragon\'s Curve');
            return mult >= 1.0 ? 1 : 0;
        }
        return 0;
    };

    var detectRealityBending = function() {
        if (Game.dragonAuras && (Game.dragonAura || Game.dragonAura2)) {
            if (Game.dragonAura && Game.dragonAuras[Game.dragonAura] && Game.dragonAuras[Game.dragonAura].name === 'Reality Bending') return 1;
            if (Game.dragonAura2 && Game.dragonAuras[Game.dragonAura2] && Game.dragonAuras[Game.dragonAura2].name === 'Reality Bending') return 1;
        }
        return 0;
    };

    // Sugar Lump Prediction System
    function setupSugarPredictor() {
        if (!Game.Has('Sugar predictor') || Game._sugarPredictorHooked) return;
        Game._sugarPredictorHooked = true;

        if (Game._sugarPredictorDebug === undefined) Game._sugarPredictorDebug = false;

        if (!Game.toggleSugarPredictorDebug) {
            Game.toggleSugarPredictorDebug = function() {
                Game._sugarPredictorDebug = !Game._sugarPredictorDebug;
                return Game._sugarPredictorDebug;
            };
        }

        if (!Game.getLumpPredictorUpgradeSig) {
            Game.getLumpPredictorUpgradeSig = function() {
                // Any change here MUST invalidate the precomputed table.
                // Keep this limited to the exact inputs used by our timing/type RNG.
                var h = function(name) { return Game.Has && Game.Has(name) ? 1 : 0; };
                return [
                    h('Stevia Caelestis'),
                    h('Sugar aging process'),
                    h('Glucose-charged air'),
                    h('Sucralosia Inutilis')
                ].join(',');
            };
        }

        Game._lumpPredictionCache = null;

        if (!Game._lumpGameStates) {
            var total = 2 * 2 * 4 * (601 + 400 * 3);
            Game._lumpGameStates = new Array(total);
            var idx = 0;
            for (var dc = 0; dc < 2; dc++) {
                for (var rb = 0; rb < 2; rb++) {
                    for (var r = 0; r < 4; r++) {
                        for (var w = 0; w < 4; w++) {
                            var minG = (r === 0) ? 0 : 201;
                            var maxG = 600;
                            for (var g = minG; g <= maxG; g++) {
                                Game._lumpGameStates[idx++] = {
                                    elderWrath: w,
                                    grandmas: g,
                                    rigidelSlot: r,
                                    dragonsCurve: dc,
                                    realityBending: rb
                                };
                            }
                        }
                    }
                }
            }
            if (idx !== total) Game._lumpGameStates.length = idx;
        }

        Game.calculateLumpRipeAgeWithState = function(grandmas, rigidel, dragonsCurve, realityBending) {
            var hour = 3600000;
            var age = hour * 23;

            if (Game.Has('Stevia Caelestis')) age -= hour;
            if (Game.Has('Sugar aging process')) age -= 6000 * Math.min(600, grandmas);
            if (rigidel > 0) {
                if (rigidel === 1) age -= hour;
                else if (rigidel === 2) age -= hour * 2/3;
                else if (rigidel === 3) age -= hour / 3;
            }
            var curveMult = (dragonsCurve ? 1 : 0) + (realityBending ? 0.1 : 0);
            age /= 1 + curveMult * 0.05;
            if (Game.Has('Glucose-charged air')) age /= 2000;
            return age;
        };

        Game.predictLumpTypesByWrathWithState = function(startTime, grandmas, rigidel, dragonsCurve, realityBending, type1Chance) {
            var ripeAge = Game.calculateLumpRipeAgeWithState(grandmas, rigidel, dragonsCurve, realityBending);
            var overripeExtra = Game.Has('Glucose-charged air') ? (3600000 / 2000) : 3600000;
            var harvestTime = (startTime + ripeAge + overripeExtra);
            var oldRandom = Math.random;
            try {
                Math.seedrandom(Game.seed + '/' + harvestTime);
                var t0 = [0], t1 = [0], t2 = [0], t3 = [0];
                var curveMult = (dragonsCurve ? 1 : 0) + (realityBending ? 0.1 : 0);
                var loop = 1 + curveMult;
                var loops = ((loop % 1) < Math.random()) ? Math.floor(loop) : Math.ceil(loop);
                var chance1 = (type1Chance !== undefined) ? type1Chance : (Game.Has('Sucralosia Inutilis') ? 0.15 : 0.1);

                for (var i = 0; i < loops; i++) {
                    if (Math.random() < chance1) { t0.push(1); t1.push(1); t2.push(1); t3.push(1); }
                    if (Math.random() < 0.003) { t0.push(2); t1.push(2); t2.push(2); t3.push(2); }
                    var meatyRoll = Math.random();
                    if (meatyRoll < 0.1 * 0) t0.push(3);
                    if (meatyRoll < 0.1 * 1) t1.push(3);
                    if (meatyRoll < 0.1 * 2) t2.push(3);
                    if (meatyRoll < 0.1 * 3) t3.push(3);
                    if (Math.random() < 0.02) { t0.push(4); t1.push(4); t2.push(4); t3.push(4); }
                }

                var pick = Math.random();
                return [
                    t0[Math.floor(pick * t0.length)],
                    t1[Math.floor(pick * t1.length)],
                    t2[Math.floor(pick * t2.length)],
                    t3[Math.floor(pick * t3.length)]
                ];
            } finally {
                Math.random = oldRandom;
            }
        };

        Game.predictLumpTypeWithState = function(startTime, grandmas, rigidel, dragonsCurve, realityBending, wrath) {
            var types = Game.predictLumpTypesByWrathWithState(startTime, grandmas, rigidel, dragonsCurve, realityBending);
            return types[wrath | 0] || 0;
        };

        Game.precomputeAllLumpTypes = function(callback) {
            var startTime = Game.lumpT;
            Game._lumpGameStatesLumpT = startTime;
            Game._lumpGameStatesUpgradeSig = Game.getLumpPredictorUpgradeSig ? Game.getLumpPredictorUpgradeSig() : '';
            var type1Chance = Game.Has('Sucralosia Inutilis') ? 0.15 : 0.1;

            var index = 0;
            var chunkSize = 4000;

            var process = function() {
                var processed = 0;
                while (index < Game._lumpGameStates.length && processed < chunkSize) {
                    var s0 = Game._lumpGameStates[index];
                    var lenG = (s0.rigidelSlot === 0) ? 601 : 400;
                    var end = index + lenG;
                    for (var i = index; i < end; i++) {
                        var s = Game._lumpGameStates[i];
                        var res = Game.predictLumpTypesByWrathWithState(startTime, s.grandmas, s.rigidelSlot, s.dragonsCurve, s.realityBending, type1Chance);
                        s.predictedType = res[0];
                        Game._lumpGameStates[i + lenG].predictedType = res[1];
                        Game._lumpGameStates[i + 2 * lenG].predictedType = res[2];
                        Game._lumpGameStates[i + 3 * lenG].predictedType = res[3];
                    }
                    index += 4 * lenG;
                    processed += lenG;
                }
                if (index < Game._lumpGameStates.length) setTimeout(process, 0);
                else {
                    if (callback) callback();
                }
            };
            process();
        };

        Game.findBestStatesForAllLumpTypes = function(startTime) {
            var t = (typeof startTime === 'number') ? startTime : Game.lumpT;
            var current = {
                grandmas: Game.Objects['Grandma'].amount,
                rigidel: detectRigidelSlot(),
                dragonsCurve: detectDragonsCurve(),
                realityBending: detectRealityBending()
            };

            var best = [null, null, null, null, null];
            var bestPoints = [Infinity, Infinity, Infinity, Infinity, Infinity];

            for (var i = 0; i < Game._lumpGameStates.length; i++) {
                var s = Game._lumpGameStates[i];
                var type = s.predictedType;
                if (type < 1 || type > 4) continue;

                var points = 0;
                if (s.grandmas !== current.grandmas) {
                    points += Math.abs(s.grandmas - current.grandmas);
                }
                if (s.dragonsCurve !== current.dragonsCurve) {
                    points += 1000;
                }
                if (s.realityBending !== current.realityBending) {
                    points += 1000;
                }
                if (s.rigidelSlot !== current.rigidel) {
                    points += 2500;
                }

                if (points < bestPoints[type]) {
                    bestPoints[type] = points;
                    best[type] = {
                        grandmas: s.grandmas,
                        rigidelSlot: s.rigidelSlot,
                        dragonsCurve: s.dragonsCurve,
                        realityBending: s.realityBending,
                        elderWrath: s.elderWrath,
                        points: points
                    };
                }
            }

            var makeRes = function(type) {
                var sol = best[type];
                if (!sol) return {found: false, possibleElderWraths: [false, false, false, false]};

                var res = Game.predictLumpTypesByWrathWithState(t, sol.grandmas, sol.rigidelSlot, sol.dragonsCurve, sol.realityBending);
                var possibleWraths = [res[0] === type, res[1] === type, res[2] === type, res[3] === type];
                sol.possibleElderWraths = possibleWraths;
                return {found: true, solution: sol};
            };

            return {
                bifurcated: makeRes(1),
                golden: makeRes(2),
                meaty: makeRes(3),
                caramelized: makeRes(4)
            };
        };

        Game.calculateLumpPredictions = function(forceRecalculate) {
            if (!Game.Has('Sugar predictor')) return;

            if (Game._lumpPredictionInProgress) {
                Game._lumpPredictionPending = Game._lumpPredictionPending || !!forceRecalculate;
                return;
            }
            Game._lumpPredictionInProgress = true;

            var upgradeSig = Game.getLumpPredictorUpgradeSig ? Game.getLumpPredictorUpgradeSig() : '';
            var needsRecalc = forceRecalculate || 
                             !Game._lumpGameStates || 
                             Game._lumpGameStates.length === 0 || 
                             Game._lumpGameStates[0].predictedType === undefined ||
                             Game._lumpGameStatesLumpT !== Game.lumpT ||
                             Game._lumpGameStatesUpgradeSig !== upgradeSig;

            var finish = function() {
                Game._lumpPredictionInProgress = false;
                var pending = Game._lumpPredictionPending;
                Game._lumpPredictionPending = false;
                if (pending) setTimeout(function() { Game.calculateLumpPredictions(true); }, 0);
            };
            if (needsRecalc) {
                Game.precomputeAllLumpTypes(function() {
                    Game._lumpPredictionCache = Game.findBestStatesForAllLumpTypes(Game._lumpGameStatesLumpT);
                    // Validate solutions for overlaps
                    finish();
                });
            } else {
                Game._lumpPredictionCache = Game.findBestStatesForAllLumpTypes(Game._lumpGameStatesLumpT);
                finish();
            }
        };

        Game.getLumpPredictions = function() {
            return Game._lumpPredictionCache;
        };

        Game.makeElderWrathIcon = function(stage, faded) {
            var pos = [0, -64, 0, -128, -64, -128, -128, -128][stage * 2] + 'px ' + 
                      [0, -64, 0, -128, -64, -128, -128, -128][stage * 2 + 1] + 'px';
            var opacity = faded ? 'opacity:0.2;' : '';
            return '<div style="display:inline-block;width:24px;height:24px;vertical-align:middle;overflow:hidden;">' +
                   '<div style="width:64px;height:64px;background-image:url(img/buildings.png);background-position:' + pos + ';' + opacity + 
                   'transform:scale(0.375);transform-origin:0 0;"></div></div>';
        };

        Game.makeRigidelIcon = function(slot) {
            var positions = ['', '-1104px -720px', '-1128px -720px', '-1104px -744px'];
            var gemPos = slot === 0 ? '-1128px -744px' : positions[slot];
            var opacity = slot === 0 ? 'opacity:0.2;' : '';
            return '<div style="height:48px;width:48px;position:relative;display:inline-block;vertical-align:middle;' + opacity + '">' +
                   '<div style="position:absolute;left:4px;top:0;transform:scale(0.8);transform-origin:0 0;width:48px;height:48px;">' +
                       '<div class="icon" style="background-position:-1056px -912px"></div>' +
                       '<div class="icon" style="width:24px;height:24px;position:absolute;top:34px;left:12px;background-position:' + gemPos + ';"></div>' +
                   '</div>' +
                   '</div>';
        };

        Game.evaluateLumpSolutionMet = function(cur, sol) {
            if (!cur || !sol) return null;
            var possibleWraths = (sol.possibleElderWraths && Array.isArray(sol.possibleElderWraths)) ? sol.possibleElderWraths : [false, false, false, false];
            var wrath = (typeof cur.wrath === 'number') ? cur.wrath : 0;
            var grandmasMet = Math.floor(cur.grandmas) === Math.floor(sol.grandmas);
            var wrathMet = !!possibleWraths[wrath];
            var rigidelMet = (cur.rigidel === sol.rigidelSlot) && (sol.rigidelSlot === 0 || Game.BuildingsOwned % 10 === 0);
            var dcMet = (cur.dragonsCurve === sol.dragonsCurve);
            var rbMet = (cur.realityBending === (sol.realityBending || 0));
            return {
                possibleWraths: possibleWraths,
                grandmasMet: grandmasMet,
                wrathMet: wrathMet,
                rigidelMet: rigidelMet,
                dcMet: dcMet,
                rbMet: rbMet,
                allMet: (grandmasMet && wrathMet && rigidelMet && dcMet && rbMet)
            };
        };

        Game.formatLumpSolution = function(sol) {
            if (!sol) return '<span class="red">Not possible</span>';

            var curGrandmas = Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0;
            var curRigidel = detectRigidelSlot();
            var curDragonsCurve = detectDragonsCurve();
            var curRealityBending = detectRealityBending();
            var curWrath = Game.elderWrath || 0;

            var checkmark = function(met) {
                if (!met) return '';
                return '<div style="position:absolute;bottom:-4px;right:-6px;width:15px;height:15px;border-radius:50%;background:#5dff5d;display:flex;align-items:center;justify-content:center;z-index:10;"><span style="color:#000;font-size:12px;font-weight:bold;line-height:12px;">✓</span></div>';
            };

            var grandmaCheckmark = function(met) {
                if (!met) return '';
                return '<div style="position:absolute;bottom:-11px;right:-4px;width:15px;height:15px;border-radius:50%;background:#5dff5d;display:flex;align-items:center;justify-content:center;z-index:10;"><span style="color:#000;font-size:12px;font-weight:bold;line-height:12px;">✓</span></div>';
            };

            var met = Game.evaluateLumpSolutionMet ? Game.evaluateLumpSolutionMet({
                grandmas: curGrandmas,
                rigidel: curRigidel,
                dragonsCurve: curDragonsCurve,
                realityBending: curRealityBending,
                wrath: curWrath
            }, sol) : null;

            var possibleWraths = (met && met.possibleWraths) ? met.possibleWraths : [false, false, false, false];
            var grandmasMet = !!(met && met.grandmasMet);
            var wrathMet = !!(met && met.wrathMet);
            var rigidelMet = !!(met && met.rigidelMet);
            var dcMet = !!(met && met.dcMet);
            var rbMet = !!(met && met.rbMet);

            var parts = [];
            
            var count = sol.grandmas >= 600 ? '600+' : sol.grandmas;
            parts.push('<div style="display:inline-block;text-align:center;vertical-align:middle;position:relative;width:48px;">' +
                '<div style="width:48px;height:48px;background:url(img/grandma.png);background-size:48px 48px;margin:0 auto;position:relative;">' +
                    grandmaCheckmark(grandmasMet) +
                '</div>' +
                '<div style="font-weight:bold;font-size:11px;">' + count + '</div></div>');
            
            var wrathGrid = '<div style="display:inline-block;width:48px;height:48px;vertical-align:middle;position:relative;">' +
                '<div style="display:flex;">' + 
                    Game.makeElderWrathIcon(0, !possibleWraths[0]) + 
                    Game.makeElderWrathIcon(1, !possibleWraths[1]) + 
                '</div>' +
                '<div style="display:flex;">' + 
                    Game.makeElderWrathIcon(2, !possibleWraths[2]) + 
                    Game.makeElderWrathIcon(3, !possibleWraths[3]) + 
                '</div>' +
                checkmark(wrathMet) + 
                '</div>';
            parts.push(wrathGrid);

            parts.push('<div style="position:relative;display:inline-block;vertical-align:middle;width:48px;height:48px;">' + 
                Game.makeRigidelIcon(sol.rigidelSlot > 0 ? sol.rigidelSlot : 0) + 
                checkmark(rigidelMet) + '</div>');
            
            var dcPos = [20 * 48, 25 * 48];
            var rbPos = [32 * 48, 25 * 48];
            var dcOpacity = sol.dragonsCurve === 0 ? 'opacity:0.2;' : '';
            var rbOpacity = (sol.realityBending || 0) === 0 ? 'opacity:0.2;' : '';
            parts.push('<div style="position:relative;display:inline-block;vertical-align:middle;width:48px;height:48px;"><div class="icon" style="background-position:-' + dcPos[0] + 'px -' + dcPos[1] + 'px;' + dcOpacity + '"></div>' + checkmark(dcMet) + '</div>');
            parts.push('<div style="position:relative;display:inline-block;vertical-align:middle;width:48px;height:48px;"><div class="icon" style="background-position:-' + rbPos[0] + 'px -' + rbPos[1] + 'px;' + rbOpacity + '"></div>' + checkmark(rbMet) + '</div>');

            return parts.join(' ');
        };


        if (Game.registerHook) {
            Game._lastLumpPredictionState = null;
            Game.registerHook('check', function() {
                if (!Game.Has('Sugar predictor')) return;

                var state = {
                    lumpT: Game.lumpT,
                    grandmas: Game.Objects['Grandma'] ? Game.Objects['Grandma'].amount : 0,
                    rigidel: detectRigidelSlot(),
                    dragonsCurve: detectDragonsCurve(),
                    realityBending: detectRealityBending(),
                    wrath: Game.elderWrath || 0,
                    upgradeSig: Game.getLumpPredictorUpgradeSig ? Game.getLumpPredictorUpgradeSig() : ''
                };

                var last = Game._lastLumpPredictionState;
                var lumpTChanged = !last || last.lumpT !== state.lumpT;
                var upgradeChanged = !last || last.upgradeSig !== state.upgradeSig;
                var otherChanged = !last ||
                    last.grandmas !== state.grandmas ||
                    last.rigidel !== state.rigidel ||
                    last.dragonsCurve !== state.dragonsCurve ||
                    last.realityBending !== state.realityBending ||
                    last.wrath !== state.wrath;

                // Recalculate if lumpT changed OR any other state changed
                if (!lumpTChanged && !upgradeChanged && !otherChanged) return;

                Game._lastLumpPredictionState = state;
                Game._lumpPredictionCache = null;
                Game.calculateLumpPredictions(lumpTChanged || upgradeChanged);
            }, 'Sugar Predictor Auto-Calculate');
        }
    }
    
    function setupFortuneTolls() {
        if (Game._fortuneTollsHooked) return;
        if (Game._fortuneTollsInterval) {
            clearInterval(Game._fortuneTollsInterval);
            Game._fortuneTollsInterval = 0;
        }
        
        if (!Game._fortuneTollsTickerEffectHooked) {
            var originalTickerEffect = Game.TickerEffect;
            Object.defineProperty(Game, 'TickerEffect', {
                get: function() {
                    return this._tickerEffect;
                },
                set: function(value) {
                    this._tickerEffect = value;
                    if (!Game.Has || !Game.Has('Fortune tolls for you')) {
                        Game._fortuneTollsLastTickerEffectKey = null;
                        return;
                    }

                    var currentTickerEffect = value || this._tickerEffect;
                    if (currentTickerEffect && currentTickerEffect.type === 'fortune') {
                        var effectKey = null;
                        var sub = currentTickerEffect.sub;
                        if (sub === undefined || sub === null) {
                            effectKey = 'fortune';
                        } else if (typeof sub === 'string' || typeof sub === 'number') {
                            effectKey = String(sub);
                        } else if (typeof sub === 'object') {
                            if (sub.name) effectKey = String(sub.name);
                            else if (sub.id !== undefined) effectKey = String(sub.id);
                            else {
                                try { effectKey = JSON.stringify(sub); } catch (e) { effectKey = 'fortune'; }
                            }
                        } else {
                            effectKey = 'fortune';
                        }
                        if (effectKey && effectKey !== Game._fortuneTollsLastTickerEffectKey) {
                            if (Game.playGoldenCookieChime) {
                                try { Game.playGoldenCookieChime(); } catch (e) {}
                            } else if (typeof PlaySound === 'function') {
                                try { PlaySound('snd/click3.mp3'); } catch (e) {}
                            }
                            Game._fortuneTollsLastTickerEffectKey = effectKey;
                        }
                    } else {
                        Game._fortuneTollsLastTickerEffectKey = null;
                    }
                },
                configurable: true
            });
            Game._tickerEffect = originalTickerEffect;
            Game._fortuneTollsTickerEffectHooked = true;
        }
        Game._fortuneTollsHooked = true;
    }
    
    function setupRetripledLuck() {
        // wrap Game.shimmer and handle all double spawn logic here
        if (Game.shimmer && !Game.shimmer._retripledLuckHooked) {
            var originalShimmer = Game.shimmer;
            Game.shimmer = function(type, options) {
                var hasVanillaLuck = Game.Has('Distilled essence of redoubled luck');
                var hasRetripledLuck = Game.Has('Distilled essence of retripled luck');
                var shouldMaskVanilla = (type === 'golden' && (!options || !options._retripledLuckExtra) && hasVanillaLuck && hasRetripledLuck);
                var originalHas = null;
                if (shouldMaskVanilla) {
                    originalHas = Game.Has;
                    Game.Has = function(what) { //not patching the vanilla bug for cookie chains here, maybe we should though?
                        if (what === 'Distilled essence of redoubled luck') return false;
                        return originalHas.apply(this, arguments);
                    };
                }
                var shimmer;
                try {
                    shimmer = new originalShimmer(type, options);
                } finally {
                    if (shouldMaskVanilla) Game.Has = originalHas;
                }
                
                // Don't double cookie chain cookies as it breaks chain mechanics, also fixes this from the vanilla upgrade
                var isChainCookie = (options && options.force === 'chain cookie') || (shimmer && shimmer.chain > 0);
                var shouldDouble = shimmer && type !== 'fish' && (!options || !options._retripledLuckExtra) && !isChainCookie; //fish double from their own seperate upgrade
                
                if (shouldDouble) {
                    var chance = 0;
                    if (hasVanillaLuck && hasRetripledLuck) {
                        chance = 0.02; // Both upgrades: 2% total
                    } else if (hasRetripledLuck) {
                        chance = 0.01; // Retripled luck only: 1% this really isnt possible but it was useful for testing
                    }
                    
                    if (chance > 0 && Math.random() < chance) {
                        var extraOptions = options ? Object.assign({}, options, {_retripledLuckExtra: true}) : {_retripledLuckExtra: true};
                        var extraShimmer = new originalShimmer(type, extraOptions);
                        if (extraShimmer) {
                            extraShimmer.spawnLead = 1;
                        }
                    }
                }
                
                return shimmer;
            };
            Game.shimmer._retripledLuckHooked = true;
        }
    }
    
    function setupGoldenStopwatch() {
        if (!Game.registerHook || Game._goldenStopwatchHooked) return;
        if (!Game.Has('Golden stopwatch')) return;
        if (!Game.LeftBackground || typeof l !== 'function' || !l('backgroundLeftCanvas')) return;
        if (Game.UpdateSpecial && Game.UpdateSpecial._goldenStopwatchHooked) { Game._goldenStopwatchHooked = true; return; }
        Game._goldenStopwatchHooked = true;
        var colors = {golden: '#FFD700', reindeer: '#8f0101', fish: '#0096C7', Frenzy: '#00e35b', 'Dragon Harvest': '#d1690f', 'Elder frenzy': '#ffae00', Clot: '#ff0000', 'Click frenzy': '#4bf0d5', Dragonflight: '#005eff', 'Cursed finger': '#b81634', 'Sugar blessing': '#fbff00', default: '#e600ff'};

        Game.UpdateSpecial = function() {
            Game.specialTabs = [];
            if (Game.Has('A festive hat')) Game.specialTabs.push('santa');
            if (Game.Has('A crumbly egg')) Game.specialTabs.push('dragon');
            Game.specialTabs.push('stopwatch');
            if (Game.specialTabs.length === 0) { Game.ToggleSpecialMenu(0); return; }
            if (Game.LeftBackground) {
                Game.specialTabHovered = '';
                var len = Game.specialTabs.length, y = Game.LeftBackground.canvas.height - 24 - 48 * len;
                for (var i = 0; i < Game.specialTabs.length; i++) {
                    var sel = (Game.specialTab === Game.specialTabs[i]) ? 1 : 0, x = sel ? 48 : 24, s = sel ? 2 : 1;
                    if (Math.abs(Game.mouseX - x) <= 24 * s && Math.abs(Game.mouseY - y) <= 24 * s) {
                        Game.specialTabHovered = Game.specialTabs[i];
                        Game.mousePointer = 1;
                        Game.CanClick = 0;
                        if (Game.Click && Game.lastClickedEl === l('backgroundLeftCanvas')) {
                            PlaySound('snd/press.mp3');
                            Game.specialTab === Game.specialTabs[i] ? Game.ToggleSpecialMenu(0) : (Game.specialTab = Game.specialTabs[i], Game.ToggleSpecialMenu(1));
                        }
                    }
                    y += 48;
                }
            }
        };
        Game.UpdateSpecial._goldenStopwatchHooked = true;

        Game.DrawSpecial = function() {
            var len = Game.specialTabs.length;
            if (len === 0 || !Game.LeftBackground) return;
            Game.LeftBackground.globalAlpha = 1;
            var y = Game.LeftBackground.canvas.height - 24 - 48 * len, tabI = 0;
            for (var i in Game.specialTabs) {
                var tab = Game.specialTabs[i], sel = (Game.specialTab === tab) ? 1 : 0, hov = (Game.specialTabHovered === tab) ? 1 : 0, x = sel ? 48 : 24;
                if (hov || sel) {
                    var ss = 64, r = Math.floor((Game.T * 0.5) % 360);
                    Game.LeftBackground.save();
                    Game.LeftBackground.translate(x, y);
                    if (Game.prefs.fancy) Game.LeftBackground.rotate((r / 360) * Math.PI * 2);
                    Game.LeftBackground.globalAlpha = 0.75;
                    Game.LeftBackground.drawImage(Pic('shine.png'), -ss / 2, -ss / 2, ss, ss);
                    Game.LeftBackground.restore();
                }
                var pic, sx, sy, srcW = 96, srcH = 96;
                if (tab === 'santa') { pic = Pic('santa.png?v=' + Game.version); sx = 96 * Game.santaLevel; sy = 0; }
                else if (tab === 'dragon') { pic = Pic('dragon.png?v=' + Game.version); sx = 96 * Game.dragonLevels[Game.dragonLevel].pic; sy = 0; }
                else if (tab === 'stopwatch') {
                    var up = Game.Upgrades['Golden stopwatch'];
                    if (up && up.icon) { pic = Pic(up.icon[2] || (typeof getSpriteSheet === 'function' ? getSpriteSheet('custom') : CUSTOM_SPRITE_SHEET_URL)); sx = up.icon[0] * 48; sy = up.icon[1] * 48; srcW = srcH = 48; }
                }
                if (pic) {
                    if (Game.prefs.fancy) {
                        Game.LeftBackground.drawImage(pic, sx, sy, srcW, srcH, x + (sel ? 0 : Math.sin(Game.T * 0.2 + tabI) * 3) - 24, y - (sel ? 6 : Math.abs(Math.cos(Game.T * 0.2 + tabI) * 6)) - 24, 48, 48);
                    } else {
                        Game.LeftBackground.drawImage(pic, sx, sy, srcW, srcH, x - 24, y - 24, 48, 48);
                    }
                }
                tabI++; y += 48;
            }
        };
        Game.DrawSpecial._goldenStopwatchHooked = true;

        var origToggle = Game.ToggleSpecialMenu;
        Game.ToggleSpecialMenu = function(on) {
            if (on && Game.specialTab === 'stopwatch') {
                var up = Game.Upgrades['Golden stopwatch'];
                if (up && up.icon) {
                    var c = document.createElement('canvas'), ctx = c.getContext('2d'), img = new Image();
                    c.width = c.height = 96;
                    img.crossOrigin = 'anonymous';
                    img.onload = function() {
                        ctx.drawImage(img, up.icon[0] * 48, up.icon[1] * 48, 48, 48, 0, 0, 96, 96);
                        if (l('specialPic')) l('specialPic').style.backgroundImage = 'url(' + c.toDataURL() + ')';
                    };
                    img.src = up.icon[2] || (typeof getSpriteSheet === 'function' ? getSpriteSheet('custom') : CUSTOM_SPRITE_SHEET_URL);
                }
                l('specialPopup').innerHTML = '<div id="specialPic" style="position:absolute;left:-16px;top:-64px;width:96px;height:96px;background-repeat:no-repeat;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);background-size:96px 96px;"></div><div class="close" onclick="PlaySound(\'snd/press.mp3\');Game.ToggleSpecialMenu(0);">x</div><h3>Golden Stopwatch</h3><div class="line"></div><div id="TimerBar" style="text-align:left;margin-bottom:4px;"></div>';
                l('specialPopup').className = 'framed prompt onScreen';
                return;
            }
            return origToggle.apply(this, arguments);
        };
        Game.ToggleSpecialMenu._goldenStopwatchHooked = true;
        
        Game.registerHook('draw', function() {
            if (Game.specialTab !== 'stopwatch' || !l('TimerBar')) return;
            var tb = l('TimerBar'), w = tb.getBoundingClientRect().width - 185;
            tb.innerHTML = '';
            for (var k in Game.shimmerTypes) {
                var st = Game.shimmerTypes[k];
                if (!st || !st.spawnConditions || !st.spawnConditions() || st.spawned === 1 || !st.spawnsOnTimer) continue;
                var d = document.createElement('div');
                d.style.cssText = 'height:12px;margin:0 10px;position:relative;';
                d.innerHTML = '<span style="display:inline-block;text-align:right;width:117px;margin-right:5px;">Next ' + k + '</span><span id="' + k + 'MinBar" style="display:inline-block;height:10px;background:#292828;"></span><span id="' + k + 'Bar" style="display:inline-block;height:10px;background:' + (colors[k] || colors.default) + ';border-top-right-radius:10px;border-bottom-right-radius:10px;"></span><span id="' + k + 'Time" style="margin-left:5px;"></span>';
                tb.appendChild(d);
                var mb = l(k + 'MinBar'), vb = l(k + 'Bar');
                mb.style.width = Math.round(Math.max(0, st.minTime - st.time) * w / st.maxTime) + 'px';
                if (st.minTime === st.maxTime) mb.style.borderTopRightRadius = mb.style.borderBottomRightRadius = '10px';
                vb.style.width = Math.round(Math.min(st.maxTime - st.minTime, st.maxTime - st.time) * w / st.maxTime) + 'px';
                var timeUntilMin = Math.max(0, st.minTime - st.time);
                var timeInSpawnWindow = Math.max(0, st.time - st.minTime);
                var spawnWindowDuration = st.maxTime - st.minTime;
                
                var spawnProbability = 0;
                if (timeInSpawnWindow > 0 && spawnWindowDuration > 0) {
                    var ticksPerSecond = Game.fps || 30;
                    var survival = 1;
                    for (var j = 1; j <= ticksPerSecond; j++) {
                        var t = st.time + j;
                        var progress = (t - st.minTime) / (st.maxTime - st.minTime);
                        var perTickProbability = Math.pow(Math.max(0, progress), 5);
                        perTickProbability = Math.min(1, perTickProbability);
                        survival *= (1 - perTickProbability);
                    }
                    spawnProbability = 1 - survival;
                }
                
                var displayText;
                if (timeUntilMin > 0) {
                    displayText = Math.ceil(timeUntilMin / Game.fps);
                } else {
                    displayText = (Math.ceil(spawnProbability * 1000) / 10).toFixed(1) + '%/sec';
                }
                
                l(k + 'Time').textContent = displayText;
            }
            if (Game.Has('Countdown complications')) {
                var hasBuffs = false;
                for (var i in Game.buffs) {
                    hasBuffs = true;
                    break;
                }
                if (hasBuffs) {
                    var divider = document.createElement('div');
                    divider.style.cssText = 'height:1px;margin:8px 10px;background:#444;';
                    tb.appendChild(divider);
                }
                for (var i in Game.buffs) {
                    var bf = Game.buffs[i];
                    var d = document.createElement('div');
                    d.style.cssText = 'height:12px;margin:0 10px;position:relative;';
                    d.innerHTML = '<span style="display:inline-block;text-align:right;width:117px;margin-right:5px;">' + bf.name + '</span><span id="Buff' + i + 'Bar" style="display:inline-block;height:10px;background:' + (colors[bf.name] || colors.default) + ';border-top-right-radius:10px;border-bottom-right-radius:10px;"></span><span id="Buff' + i + 'Time" style="margin-left:5px;"></span>';
                    tb.appendChild(d);
                    l('Buff' + i + 'Bar').style.width = Math.round(bf.time * w / bf.maxTime) + 'px';
                    l('Buff' + i + 'Time').textContent = Math.ceil(bf.time / Game.fps);
                }
            }
        });
    }
    function createToyBoxToggle() {
        if (Game.Upgrades['Toy mode [on]']) return;
        var upgrade = Game.Upgrades['Toy box'];
        if (!upgrade || !Game.Has('Toy box')) return;

        var desc = 'Toggles toy mode on and off, adding playful cookie toys to the game.<br><br>Note: There is a bug where toys can interfer with the ability to pop wrinklers, this is a vanilla game bug and has nothing to do with the mod. You can reload after disabling toy mode to fix the issue if encountered.<q>Don\'t forget to toss them around!</q>';
        var toys = Game.TOYS || 0;
        var icon = upgrade.icon || [34, 9];
        
        new Game.Upgrade('Toy mode [on]', desc, 0, icon);
        var toggleOff = Game.last;
        toggleOff.pool = 'toggle';
        toggleOff.toggleInto = 'Toy mode [off]';
        toggleOff.order = 51000;
        toggleOff.unlocked = 1;
        toggleOff.bought = toys === 0 ? 1 : 0;
        toggleOff.desc = toggleOff.ddesc = desc;
        var buyOff = toggleOff.buy;
        toggleOff.buy = function() {
            if (buyOff.call(this)) Game.TOYS = 0;
        };
        
        new Game.Upgrade('Toy mode [off]', desc, 0, icon);
        var toggleOn = Game.last;
        toggleOn.pool = 'toggle';
        toggleOn.toggleInto = 'Toy mode [on]';
        toggleOn.order = 51000;
        toggleOn.unlocked = 1;
        toggleOn.bought = toys === 1 ? 1 : 0;
        toggleOn.desc = toggleOn.ddesc = desc;
        var buyOn = toggleOn.buy;
        toggleOn.buy = function() {
            if (buyOn.call(this)) Game.TOYS = 1;
        };

        Game.storeToRefresh = 1;
        Game.upgradesToRebuild = 1;
        setTimeout(function() {
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
            if (Game.RefreshStore) { Game.RefreshStore(); }
        }, 0);
    }
    
    function createPinkStuffToggle() {
        if (Game.Upgrades['Pink stuff [on]']) return;
        var upgrade = Game.Upgrades['Pink stuff'];
        if (!upgrade || !Game.Has('Pink stuff')) return;
        
        var desc = 'Toggles pink mode on and off, adding playful winklers to the game.<q>O M G SO CUTEEEEEEE!!!</q>';
        var winklers = Game.WINKLERS || 0;
        var icon = upgrade.icon || [22, 20, getSpriteSheet('custom')];
        
        new Game.Upgrade('Pink stuff [on]', desc, 0, icon);
        var toggleOff = Game.last;
        toggleOff.pool = 'toggle';
        toggleOff.toggleInto = 'Pink stuff [off]';
        toggleOff.order = 51001;
        toggleOff.unlocked = 1;
        toggleOff.bought = winklers === 0 ? 1 : 0;
        toggleOff.desc = toggleOff.ddesc = desc;
        var buyOff = toggleOff.buy;
        toggleOff.buy = function() {
            if (buyOff.call(this)) Game.WINKLERS = 0;
        };
        
        new Game.Upgrade('Pink stuff [off]', desc, 0, icon);
        var toggleOn = Game.last;
        toggleOn.pool = 'toggle';
        toggleOn.toggleInto = 'Pink stuff [on]';
        toggleOn.order = 51001;
        toggleOn.unlocked = 1;
        toggleOn.bought = winklers === 1 ? 1 : 0;
        toggleOn.desc = toggleOn.ddesc = desc;
        var buyOn = toggleOn.buy;
        toggleOn.buy = function() {
            if (buyOn.call(this)) Game.WINKLERS = 1;
        };

        Game.storeToRefresh = 1;
        Game.upgradesToRebuild = 1;
        setTimeout(function() {
            Game.storeToRefresh = 1;
            Game.upgradesToRebuild = 1;
            if (Game.RebuildUpgrades) { Game.RebuildUpgrades(); }
            if (Game.RefreshStore) { Game.RefreshStore(); }
        }, 0);
    }

    function setupBigCookieImageSelector() {
        if (Game.Upgrades['Cookie image selector']) return;
        if (Game.cookieImageType === undefined) Game.cookieImageType = 0;
        if (!Game.CookiesByChoice) Game.CookiesByChoice = {0: {name: 'Perfect cookie', icon: [0, 3], pic: 'perfectCookie.png'}, 1: {name: 'Imperfect cookie', icon: [9, 3], pic: 'imperfectCookie.png'}, 2: {name: 'Snickerdoodle', icon: [29, 10], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/snickerdoodle.png'}, 3: {name: 'Chocolate Cookie', icon: [10, 3], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/chocolate.png'}, 4: {name: 'Oatmeal Raisin Cookie', icon: [6, 3], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/oatmeal.png'}, 5: {name: 'Thumbprint Cookie', icon: [25, 32], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/sugarjam.png'}, 6: {name: 'Oreo Cookie', icon: [16, 3], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/oreo.png'}, 7: {name: 'Heart Cookie', icon: [20, 3], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/heartcookie.png'}, 8: {name: 'Pixel Cookie', icon: [20, 33], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/pixel.png'}, 9: {name: 'Eaten Cookie', icon: [22, 16], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/eaten.png'}, 10: {name: 'Gingerbread Cookie', icon: [18, 4], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/gingerbread.png'}, 11: {name: 'Smiley Cookie', icon: [24, 18], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/smiley.png'}, 12: {name: 'Jam Cookie', icon: [26, 33], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/jamcookie.png'}, 13: {name: 'Red Velvet Cookie', icon: [15, 5], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/velvet.png'}, 14: {name: 'Sugar Cookie', icon: [2, 4], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/sugar.png'}, 15: {name: 'Macaron', icon: [22, 3], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/macaron.png'}, 16: {name: 'Sprinkle Cookie', icon: [21, 14], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/sprinkle.png'}, 17: {name: 'Winter Biscuit', icon: [13, 10], pic: 'https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@main/assets/CookieImg/snow.png'}};
        new Game.Upgrade('Cookie image selector', 'Lets you pick which cookie image to display.', 0, [5, 3]);
        Game.last.pool = 'toggle';
        Game.last.order = 51002;
        Game.last.ddesc = 'Lets you pick which cookie image to display.';
        Game.last.descFunc = function() { var choice = this.choicesFunction()[Game.cookieImageType] || this.choicesFunction()[0]; return '<div style="text-align:center;">'+loc("Current:")+' '+tinyIcon(choice.icon)+' <b>'+choice.name+'</b></div><div class="line"></div>'+this.ddesc; };
        Game.last.choicesFunction = function() { var choices = []; for (var i in Game.CookiesByChoice) { choices[i] = {name: Game.CookiesByChoice[i].name, icon: Game.CookiesByChoice[i].icon, order: parseInt(i)}; } if (choices[Game.cookieImageType]) choices[Game.cookieImageType].selected = 1; return choices; };
        Game.last.choicesPick = function(id) { Game.cookieImageType = id; if (Game.CookiesByChoice[id] && Game.Loader && Game.Loader.Replace) Game.Loader.Replace('perfectCookie.png', Game.CookiesByChoice[id].pic); };
        if (Game.Has('Big cookie image selector')) Game.Unlock('Cookie image selector');
    }
    
    function unlockBigCookieImageSelector() {
        if (Game.Has('Big cookie image selector') && Game.Upgrades['Cookie image selector']) { Game.Unlock('Cookie image selector'); Game.storeToRefresh = 1; }
    }
    
    function setupBoxOfDonuts() {
        if (!Game.Upgrade) return;
        if (!Game.Has('Box of overpriced donuts')) return;
        
        var boxIcon = [27, 29];
        var basePrice = Math.pow(10, 75);
        var donuts = [
            {name: 'Maple frosted donut', desc: 'Popular both inside of Canada and outside, a delicious treat covered in sweet maple syrup flavored frosting, taste more like autumn than pumpkin spice.', icon: [6, 25, getSpriteSheet('custom')]},
            {name: 'Boston creme donut', desc: 'A donut filled with vanilla custard and topped with chocolate glaze. Named after the city, not the cream.', icon: [5, 25, getSpriteSheet('custom')]},
            {name: 'Strawberry jelly donut', desc: 'A donut filled with sweet strawberry jelly. Watch out for dripping jelly on your pants!', icon: [27, 28]},
            {name: 'Chocolate frosted donut', desc: 'A donut topped with rich chocolate frosting. Simple, yet satisfying.', icon: [4, 25, getSpriteSheet('custom')]},
            {name: 'Donut holes', desc: 'The holes from donuts fried and served warm, donuts aren\'t actually made by punching a hole out, but these are so delicious you won\'t actually care.', icon: [30, 3]},
            {name: 'Chocolate filled donut', desc: 'A donut filled with rich chocolate cream. Double the chocolate, double the fun.', icon: [10, 25, getSpriteSheet('custom')]},
            {name: 'Powdered sugar jelly donut', desc: 'A jelly donut dusted with powdered sugar. The powder gets everywhere, but it\'s totally worth it even if you look like a messy cocaine addict.', icon: [9, 25, getSpriteSheet('custom')]},
            {name: 'Plain glazed donut', desc: 'Absolutely gooey with sugar glaze. You won\'t even mind the sticky fingers.', icon: [28, 28]},
            {name: 'Blueberry jelly filled donut', desc: 'A donut filled with sweet blueberry jelly. Blue colored sugar counts as a fruit right?', icon: [3, 25, getSpriteSheet('custom')]},
            {name: 'Pink frosted donut', desc: 'A donut topped with pink frosting. Perfect for special occasions or just because.', icon: [30, 32]},
            {name: 'Chocolate sprinkle donut', desc: 'A chocolate frosted donut covered in colorful sprinkles. The sprinkles add texture and joy.', icon: [8, 25, getSpriteSheet('custom')]},
            {name: 'Bear claw', desc: 'A sweet pastry shaped like a bear\'s claw, filled with almond paste and topped with sliced almonds.', icon: [23, 36]},
            {name: 'Chocolate eclair', desc: 'An elongated pastry filled with cream and topped with chocolate. Elegant, delicious, and French in origin just like this game.', icon: [7, 25, getSpriteSheet('custom')]}
        ];
        
        var sourceText = '<div style="font-size:80%;text-align:center;">From ' + tinyIcon(boxIcon) + ' Box of overpriced donuts</div>' +
                        '<div style="height:2px;"></div>' +
                        '<div style="font-size:80%;text-align:center;margin-top:2px;">Part of <span style="margin: 0 4px;">' + tinyIcon(MOD_ICON) + '</span> ' + SIMPLE_MOD_NAME + '</div>' +
                        '<div class="line"></div>';
        
        for (var i = 0; i < donuts.length; i++) {
            if (Game.Upgrades[donuts[i].name]) continue;
            
            var price = basePrice * Math.pow(2.5, i);
            var prodDesc = 'Cookie production multiplier <b>+3%</b>.<q>' + donuts[i].desc + '</q>';
            var upgrade = new Game.Upgrade(donuts[i].name, prodDesc, price, donuts[i].icon);
            
            upgrade.power = 3;
            upgrade.pool = 'cookie';
            upgrade.ddesc = prodDesc;
            upgrade.desc = prodDesc;
            
            if (Game.UnlockAt) {
                var toPush = {cookies: price / 20, name: donuts[i].name, require: 'Box of overpriced donuts'};
                Game.UnlockAt.push(toPush);
            }
            
            upgrade.ddesc = sourceText + upgrade.ddesc;
            upgrade.desc = sourceText + upgrade.desc;
            
            if (Game.cookieUpgrades && Game.cookieUpgrades.indexOf(upgrade) === -1) {
                Game.cookieUpgrades.push(upgrade);
            }
            if (Game.UpgradesByPool) {
                if (!Game.UpgradesByPool['cookie']) Game.UpgradesByPool['cookie'] = [];
                if (Game.UpgradesByPool['cookie'].indexOf(upgrade) === -1) {
                    Game.UpgradesByPool['cookie'].push(upgrade);
                }
            }
        }
    }

    function addHeavenlySourceText(upgrade) {
        var sourceText = '<div style="font-size:80%;text-align:center;">From <span style="margin: 0 4px;">' + tinyIcon(MOD_ICON) + '</span> ' + SIMPLE_MOD_NAME + '</div><div class="line"></div>';
        upgrade.ddesc = sourceText + upgrade.ddesc;
        upgrade.desc = sourceText + upgrade.desc;
    }

    function createHeavenlyUpgrade(upgradeInfo) {
        if (!upgradeInfo || !upgradeInfo.name) return null;
        
        try {
            new Game.Upgrade(
                upgradeInfo.name,
                upgradeInfo.ddesc || upgradeInfo.desc,
                upgradeInfo.price,
                upgradeInfo.icon || [0, 0]
            );
            
            var upgrade = Game.last;
            if (!upgrade || !upgrade.id) return null;
            
            var require = upgradeInfo.require || [];
            upgrade.unlocked = require.length ? 0 : 1;
            
            upgrade.pool = 'prestige';
            upgrade._heavenlyUpgrade = true; // Mark as our upgrade for save/load
            if (upgradeInfo.power !== undefined) {
                upgrade.power = upgradeInfo.power;
                upgrade.pseudoCookie = true;
            }
            upgrade.desc = upgradeInfo.desc || upgradeInfo.ddesc;
            upgrade.ddesc = upgradeInfo.ddesc || upgradeInfo.desc;
            
            upgrade.price = upgradeInfo.price;
            upgrade.basePrice = upgradeInfo.price;
            
            if (upgradeInfo.posX !== undefined && upgradeInfo.posY !== undefined) {
                upgrade.posX = upgradeInfo.posX;
                upgrade.posY = upgradeInfo.posY;
                upgrade.x = undefined;
                upgrade.y = undefined;
            } else if (upgradeInfo.x !== undefined && upgradeInfo.y !== undefined) {
                upgrade.x = upgradeInfo.x;
                upgrade.y = upgradeInfo.y;
                upgrade.posX = undefined;
                upgrade.posY = undefined;
            }
            
            if (require.length > 0) {
                upgrade.require = require;
                if (!upgrade.parents) upgrade.parents = [];
                for (var i = 0; i < require.length; i++) {
                    var reqUpgrade = Game.Upgrades[require[i]];
                    if (reqUpgrade) {
                        if (!reqUpgrade.children) reqUpgrade.children = [];
                        if (reqUpgrade.children.indexOf(upgrade) === -1) reqUpgrade.children.push(upgrade);
                        if (upgrade.parents.indexOf(reqUpgrade) === -1) upgrade.parents.push(reqUpgrade);
                    }
                }
                
            }
            
            upgrade.isVaulted = function() { return false; };
            upgrade.isBought = function() { return this.bought > 0; };
            upgrade.getPrice = function() {
                var price = this.price || this.basePrice || 0;
                return isFinite(price) ? price : 0;
            };
            upgrade.priceLumps = 0;
            upgrade.vanilla = 0;
            upgrade.order = upgrade.order || (1050 + (upgrade.id / 1000));
            if (upgradeInfo.seasonPriceMult !== undefined) upgrade.seasonPriceMult = upgradeInfo.seasonPriceMult;
            if (upgradeInfo.descFunc) upgrade.descFunc = upgradeInfo.descFunc;
            if (upgradeInfo.showIf) upgrade.showIf = upgradeInfo.showIf;
            
            if (upgrade.pseudoCookie && Array.isArray(Game.cookieUpgrades) && Game.cookieUpgrades.indexOf(upgrade) === -1) Game.cookieUpgrades.push(upgrade);
            
            if (!Game.PrestigeUpgrades) Game.PrestigeUpgrades = [];
            if (Game.PrestigeUpgrades.indexOf(upgrade) === -1) Game.PrestigeUpgrades.push(upgrade);
            
            if (Game.UpgradesByPool) {
                if (!Game.UpgradesByPool['prestige']) Game.UpgradesByPool['prestige'] = [];
                if (Game.UpgradesByPool['prestige'].indexOf(upgrade) === -1) Game.UpgradesByPool['prestige'].push(upgrade);
            }
            
            addHeavenlySourceText(upgrade);
            
            if (Game.BuildAscendTree && !Game.BuildAscendTree._heavenlyUpgradesHooked) {
                var originalBuildAscendTree = Game.BuildAscendTree;
                Game.BuildAscendTree = function(justBought) {
                    if (!Game.PrestigeUpgrades) Game.PrestigeUpgrades = [];
                    
                    var jneParent = Game.Upgrades['Just natural expansion heavenly upgrades'];
                    var shouldCenterOnJNE = false;
                    if (jneParent && !jneParent.bought && jneParent.showIf && jneParent.showIf()) {
                        shouldCenterOnJNE = true;
                    }
                    
                    var iconBackups = {};
                    
                    for (var i = 0; i < Game.PrestigeUpgrades.length; i++) {
                        var upg = Game.PrestigeUpgrades[i];
                        if (upg && upg.vanilla === 0 && upg.require && upg.require.length > 0) {
                            var allMet = true;
                            for (var j = 0; j < upg.require.length; j++) {
                                var req = Game.Upgrades[upg.require[j]];
                                if (!req || !req.bought) {
                                    allMet = false;
                                    break;
                                }
                            }
                            upg.unlocked = allMet ? 1 : 0;
                        }
                    }
                    
                    // Hide custom sprite sheet icons for locked/ghosted upgrades
                    for (var i in Game.PrestigeUpgrades) {
                        var me = Game.PrestigeUpgrades[i];
                        me.canBePurchased = 1;
                        if (!me.bought && !Game.DebuggingPrestige) {
                            if (me.showIf && !me.showIf()) me.canBePurchased = 0;
                            else {
                                for (var ii in me.parents) {
                                    if (me.parents[ii] != -1 && !me.parents[ii].bought) me.canBePurchased = 0;
                                }
                            }
                        }
                    }
                    
                    function hasUnpurchasedAncestor(upgrade) {
                        if (!upgrade || !upgrade.parents) return false;
                        for (var p = 0; p < upgrade.parents.length; p++) {
                            var parent = upgrade.parents[p];
                            if (parent && parent !== -1) {
                                if (!parent.bought) return true;
                                if (hasUnpurchasedAncestor(parent)) return true;
                            }
                        }
                        return false;
                    }
                    
                    for (var i = 0; i < Game.PrestigeUpgrades.length; i++) {
                        var upg = Game.PrestigeUpgrades[i];
                        if (upg && upg.vanilla === 0 && upg.icon && Array.isArray(upg.icon) && upg.icon.length === 3) {
                            if (!iconBackups[upg.id]) {
                                iconBackups[upg.id] = upg.icon.slice();
                            }
                            
                            if (!Game.Has('Neuromancy') && (!upg.canBePurchased || hasUnpurchasedAncestor(upg))) {
                                upg.icon = [upg.icon[0], upg.icon[1]];
                            }
                        }
                    }
                    
                    var result = originalBuildAscendTree.apply(this, arguments);
                    
                    if (shouldCenterOnJNE && jneParent && jneParent.posX !== undefined && jneParent.posY !== undefined) {
                        var targetOffX = -jneParent.posX - 28;
                        var targetOffY = -jneParent.posY - 28;
                        
                        if (targetOffX > -Game.heavenlyBounds.left) targetOffX = -Game.heavenlyBounds.left;
                        if (targetOffX < -Game.heavenlyBounds.right) targetOffX = -Game.heavenlyBounds.right;
                        if (targetOffY > -Game.heavenlyBounds.top) targetOffY = -Game.heavenlyBounds.top;
                        if (targetOffY < -Game.heavenlyBounds.bottom) targetOffY = -Game.heavenlyBounds.bottom;
                        
                        Game.AscendOffXT = targetOffX;
                        Game.AscendOffYT = targetOffY;
                    }
                    
                    for (var id in iconBackups) {
                        var upg = Game.UpgradesById && Game.UpgradesById[id];
                        if (upg && upg.icon && Array.isArray(upg.icon) && upg.icon.length === 2 && iconBackups[id].length === 3) {
                            upg.icon = iconBackups[id].slice();
                        }
                    }
                    
                    return result;
                };
                Game.BuildAscendTree._heavenlyUpgradesHooked = true;
            }
            
            return upgrade;
        } catch (e) {
            console.error('[Heavenly Upgrades] Error:', e);
            return null;
        }
    }


    function createUpgrades() {
        var parentUpgrade = createHeavenlyUpgrade({
            name: 'Just natural expansion heavenly upgrades',
            desc: 'Cookie production multiplier <b>+5%</b>. Also unlocks the Just Natural Expansion heavenly upgrade tree.',
            ddesc: 'Cookie production multiplier <b>+5%</b>. Also unlocks the Just Natural Expansion heavenly upgrade tree.<q>Now available in the afterlife. You know what also made it to the afterlife? Runaway inflation, so that\'s just swell.</q>',
            price: 20e15, 
            icon: [15, 7],
            posX: -2222,
            posY: -748,
            require: [],
            power: 5,
            showIf: function() { return Game.Has('Unshackled You'); }
        });
        
        createHeavenlyUpgrade({
            name: 'Wallstreet bets',
            desc: '<b>+50% base</b> warehouse space for all goods in the Stock Market minigame.',
            ddesc: '<b>+50% base</b> warehouse space for all goods in the Stock Market minigame.<q>A group of very special friends have discovered leverage and options trading, this is surely going to end well for everyone involved.</q>',
            price: 15e15,
            icon: [23, 0, getSpriteSheet('custom')],
            posX: -1987,
            posY: -688,
            require: ['Just natural expansion heavenly upgrades']
        });
        
        createHeavenlyUpgrade({
            name: 'Cyclius swatch',
            desc: 'Cyclius displays the <b>buff amounts</b> for the current time in the tooltip.',
            ddesc: 'Cyclius displays the <b>buff amounts</b> for the current time in the tooltip.<q>You mean all this time we just needed to buy him a cheap watch?</q>',
            price: 20e15,
            icon: [19, 24, getSpriteSheet('custom')],
            posX: -1773,
            posY: -454,
            require: ['Wallstreet bets']
        });
        
        var morrowenUpgrade = createHeavenlyUpgrade({
            name: 'Morrowen, Spirit of Procrastination',
            desc: 'Adds a new god to the Pantheon.',
            ddesc: 'Adds a new god to the Pantheon.<q>You should probably be studying right now instead of playing idle games.</q>',
            price: 35e15,
            icon: [21, 20, getSpriteSheet('custom')],
            posX: -1566,
            posY: -358,
            require: ['Cyclius swatch']
        });
        var solgrethUpgrade = createHeavenlyUpgrade({
            name: 'Solgreth, Spirit of Selfishness',
            desc: 'Adds a new god to the Pantheon.',
            ddesc: 'Adds a new god to the Pantheon.<q>If that\'s a veiled criticism of me, I won\'t hear it and I won\'t respond to it.</q>',
            price: 35e15,
            icon: [20, 20, getSpriteSheet('custom')],
            posX: -1725,
            posY: -232,
            require: ['Cyclius swatch']
        });
        [morrowenUpgrade, solgrethUpgrade].forEach(function(upgrade) {
            if (upgrade) {
                var orig = upgrade.buyFunction;
                upgrade.buyFunction = function() { if (orig) orig.call(this); addNewPantheonSpirits(); };
            }
        });
        
        createHeavenlyUpgrade({
            name: 'Divine uninspiration',
            desc: 'CpS boost per empty spirit slot in the Pantheon, <b>1%</b> for jade, <b>2%</b> for ruby, <b>3%</b> for diamond.',
            ddesc: 'CpS boost per empty spirit slot in the Pantheon, <b>1%</b> for jade, <b>2%</b> for ruby, <b>3%</b> for diamond.<q>Finally, a reward for not having my life figured out. Honestly, why didn\'t we think of this sooner?</q>',
            price: 400e15,
            icon: [0, 8],
            posX: -1536,
            posY: -172,
            require: ['Solgreth, Spirit of Selfishness', 'Morrowen, Spirit of Procrastination']
        });
        
        createHeavenlyUpgrade({
            name: 'Soil inspector',
            desc: 'The tooltip for an empty soil spot will <b>reveal the odds</b> of each plant growing there.',
            ddesc: 'The tooltip for an empty soil spot will <b>reveal the odds</b> of each plant growing there.<q>Modern gardening is more science than voodoo.</q>',
            price: 20e15,
            icon: [3, 35, getSpriteSheet('garden')],
            posX: -1636,
            posY: -579,
            require: ['Wallstreet bets']
        });
        
        createHeavenlyUpgrade({
            name: 'Plant all',
            desc: 'Hold <b>control shift</b> when planting a seed to plant that seed in all empty soil spots.',
            ddesc: 'Hold <b>control shift</b> when planting a seed to plant that seed in all empty soil spots. <q>Modern farming tools sure do cut down on the manual labor, next thing you know and we will have robots doing the work for us.</q>',
            price: 25e15,
            icon: [11, 16, getSpriteSheet('custom')],
            posX: -1455,
            posY: -508,
            require: ['Soil inspector']
        });
        
        var sparklingUpgrade = createHeavenlyUpgrade({
            name: 'Sparkling sugar cane',
            desc: 'Adds a new seed to the garden minigame.',
            ddesc: 'Adds a new seed to the garden minigame. A cross between Bakeberry and Thumbcorn.<q>GMOs are finally paying off, especially when powered by Just Natural Expansion.</q>',
            price: 85e15,
            icon: [4, 24, getSpriteSheet('custom')],
            posX: -1246,
            posY: -567,
            require: ['Plant all']
        });

        var kudzuUpgrade = createHeavenlyUpgrade({
            name: 'Krazy kudzu',
            desc: 'Adds a new seed to the garden minigame.',
            ddesc: 'Adds a new seed to the garden minigame. A cross between Meddleweed and Green rot or less commonly Ordinary Clover.<q>An invasive species that spreads like wildfire. We\'re not sure if introducing this to our garden was a good idea.</q>',
            price: 90e15,
            icon: [9, 24, getSpriteSheet('custom')],
            posX: -1271,
            posY: -418,
            require: ['Plant all']
        });

        var mushroomUpgrade = createHeavenlyUpgrade({
            name: 'Magic mushroom',
            desc: 'Adds a new seed to the garden minigame.',
            ddesc: 'Adds a new seed to the garden minigame. A fairly rare cross between Ichor Puff and Doughshroom.<q>Caution: ingesting may alter your perception of reality. Results may vary, only to be taken orally.</q>',
            price: 95e15,
            icon: [14, 24, getSpriteSheet('custom')],
            posX: -1413,
            posY: -311,
            require: ['Plant all']
        });

        [sparklingUpgrade, kudzuUpgrade, mushroomUpgrade].forEach(function(upgrade) {
            if (upgrade) {
                var orig = upgrade.buyFunction;
                upgrade.buyFunction = function() {
                    if (orig) orig.call(this);
                    
                    
                    var M = Game.Objects['Farm']?.minigame;
                    if (M && M.buildPanel) {
                        M.buildPanel();
                    }
                };
            }
        });

        createHeavenlyUpgrade({
            name: 'Aerated soil',
            desc: 'Adds a new soil to the garden minigame.',
            ddesc: 'Adds a new soil to the garden minigame.<q>It seems like plants like air, have we considered adding more air to the soil?</q>',
            price: 100e15,
            icon: [15, 24, getSpriteSheet('custom')],
            posX: -1343,
            posY: -687,
            require: ['Plant all']
        });
        
        createHeavenlyUpgrade({
            name: 'Wizardly accomplishments',
            desc: 'Each level of wizard tower increases <b>magic regeneration</b> slightly up to <b>level 20</b>.',
            ddesc: 'Each level of wizard tower increases <b>magic regeneration</b> slightly up to <b>level 20</b>.<q>Mana enhancing supplements are suspected, drug test are scheduled for next week.</q>',
            price: 100e15,
            icon: [16, 15, getSpriteSheet('custom')],
            posX: -1715,
            posY: -765,
            require: ['Wallstreet bets']
        });
        
        createHeavenlyUpgrade({
            name: 'Gilded allure',
            desc: 'Adds a new spell to the Grimoire minigame.',
            ddesc: 'Adds a new spell to the Grimoire minigame.<q>Our scholars discovered a new spell but it took a really long time to write down since everyone who cast it was immediately hit in the head by flying objects.</q>',
            price: 150e15,
            icon: [20, 19, getSpriteSheet('custom')],
            posX: -1543,
            posY: -753,
            require: ['Wizardly accomplishments']
        });
        
        createHeavenlyUpgrade({
            name: 'Erasable pens',
            desc: 'Edit <b>permanent upgrade slots</b> between ascensions.',
            ddesc: 'Edit <b>permanent upgrade slots</b> between ascensions.<q>Nothing wrong with a little tweaking.</q>',
            price: 5e15,
            icon: [12, 15, getSpriteSheet('custom')],
            posX: -2116,
            posY: -579,
            require: ['Just natural expansion heavenly upgrades']
        });
        
        createHeavenlyUpgrade({
            name: 'Self employed realtor',
            desc: 'Buildings are <b>10%</b> cheaper.',
            ddesc: 'Buildings are <b>10%</b> cheaper.<q>Cut out the middlemen by becoming the middleman.</q>',
            price: 35e15,
            icon: [10, 14, getSpriteSheet('custom')],
            posX: -1934,
            posY: -492,
            require: ['Erasable pens']
        });
        
        createHeavenlyUpgrade({
            name: 'Wholesale discount club',
            desc: 'Upgrades are <b>10%</b> cheaper.',
            ddesc: 'Upgrades are <b>10%</b> cheaper.<q>Costco membership fee not included.</q>',
            price: 30e15,
            icon: [16, 7],
            posX: -2127,
            posY: -395,
            require: ['Erasable pens']
        });
        
        createHeavenlyUpgrade({
            name: 'Turtles all the way down',
            desc: 'Buildings are <b>1%</b> cheaper per building level up to <b>level 25</b>.',
            ddesc: 'Buildings are <b>1%</b> cheaper per building level up to <b>level 25</b>.<q>Okay yes I understand, but then what is the turtle sitting on?</q>',
            price: 250e15,
            icon: [13, 17, getSpriteSheet('custom')],
            posX: -2054,
            posY: -194,
            require: ['Self employed realtor', 'Wholesale discount club']
        });
        
        createHeavenlyUpgrade({
            name: 'Improved sugar crystal cookies',
            desc: 'You gain <b>1% CpS</b> for each building <b>level 15</b> or higher.',
            ddesc: 'You gain <b>1% CpS</b> for each building <b>level 15</b> or higher.<q>There is room for improvement in everything.</q>',
            price: 250000e15,
            icon: [10, 25],
            posX: -1942,
            posY: -39,
            require: ['Turtles all the way down']
        });
        
        createHeavenlyUpgrade({
            name: 'Gilded sugar crystal cookies',
            desc: 'You gain <b>1% CpS</b> for each building <b>level 20</b> or higher.',
            ddesc: 'You gain <b>1% CpS</b> for each building <b>level 20</b> or higher.<q>Look, I\'m going to level with you here, we put some gold flakes in them, they don\'t taste any different but the influencers go crazy for them.</q>',
            price: 500000e15,
            icon: [10, 14],
            posX: -1934,
            posY: 118,
            require: ['Improved sugar crystal cookies']
        });
        
        createHeavenlyUpgrade({
            name: 'Weakest link',
            desc: 'Your <b>least productive</b> building is <b>16x</b> more powerful.',
            ddesc: 'Your <b>least productive</b> building is <b>16x</b> more powerful.<q>Zero times sixteen is still zero but it\'s the thought that counts.</q>',
            price: 35e15,
            icon: [0, 33],
            posX: -2117,
            posY: -36,
            require: ['Turtles all the way down'],
            descFunc: function() {
                var cache = Game._weakestLinkCache;
                var assignment = cache && cache.assignments ? cache.assignments['Weakest link'] : null;
                var buildingName = assignment ? assignment.buildingName : 'None';
                return '<div style="text-align:center;">Current: <b>' + buildingName + '</b><div class="line"></div></div>' + this.ddesc;
            }
        });
        
        createHeavenlyUpgrade({
            name: 'The next weakest link',
            desc: 'Your <b>second least productive</b> building is <b>12x</b> more powerful.',
            ddesc: 'Your <b>second least productive</b> building is <b>12x</b> more powerful.',
            price: 70e15,
            icon: [9, 33],
            posX: -2111,
            posY: 125,
            require: ['Weakest link'],
            descFunc: function() {
                var cache = Game._weakestLinkCache;
                var assignment = cache && cache.assignments ? cache.assignments['The next weakest link'] : null;
                var buildingName = assignment ? assignment.buildingName : 'None';
                return '<div style="text-align:center;">Current: <b>' + buildingName + '</b><div class="line"></div></div>' + this.ddesc;
            }
        });
        
        createHeavenlyUpgrade({
            name: 'No more weak links',
            desc: 'Your <b>third least productive</b> building is <b>8x</b> more powerful.',
            ddesc: 'Your <b>third least productive</b> building is <b>8x</b> more powerful.',
            price: 500e15,
            icon: [10, 33],
            posX: -2110,
            posY: 298,
            require: ['The next weakest link'],
            descFunc: function() {
                var cache = Game._weakestLinkCache;
                var assignment = cache && cache.assignments ? cache.assignments['No more weak links'] : null;
                var buildingName = assignment ? assignment.buildingName : 'None';
                return '<div style="text-align:center;">Current: <b>' + buildingName + '</b><div class="line"></div></div>' + this.ddesc;
            }
        });
        
        createHeavenlyUpgrade({
            name: 'Box of overpriced donuts',
            desc: 'Contains an assortment of overpriced donuts.',
            ddesc: 'Contains an assortment of overpriced donuts.<q>We found a way to make donuts more expensive, it turns out you just need to make them more expensive. We know they aren\'t cookies but they taste so good no one is complaining, except for you, stop complaining.</q>',
            price: 250e15,
            icon: [27, 29],
            posX: -1864,
            posY: -268,
            require: ['Self employed realtor', 'Wholesale discount club']
        });

        var sugarFrenzyIIUpgrade = createHeavenlyUpgrade({
            name: 'Sugar frenzy II',
            desc: 'Sugar frenzy may be used <b>once every 24 hours</b> instead of once an ascension. Each use per ascension cost one additional sugar lump.',
            ddesc: 'Sugar frenzy may be used <b>once every 24 hours</b> instead of once an ascension. Each use per ascension cost <b>one additional sugar lump</b>.<q>Nothing like a good night\'s sleep to get over a killer sugar headache and be ready to hit the ground again. Just remember you aren\'t as young as you use to be.</q>',
            price: 100e15,
            icon: [22, 17],
            posX: -2285,
            posY: -540,
            require: ['Just natural expansion heavenly upgrades']
        });
        
        var sugarTradingUpgrade = createHeavenlyUpgrade({
            name: 'Sugar for sugar trading',
			desc: 'Spend a <b>sugar lump</b> to summon a <b>Golden Cookie</b>. May be used once per ascension.',
			ddesc: 'Spend a <b>sugar lump</b> to summon a <b>Golden Cookie</b>. May be used once per ascension.<q>Turning sugar into sugar, what a concept!</q>',
            price: 250e15,
            icon: [21, 17],
            posX: -2421,
            posY: -286,
            require: ['Sugar frenzy II']
        });

        createHeavenlyUpgrade({
            name: 'Sugar insight',
            desc: 'Shows what type of sugar lump is currently growing instantly.',
            ddesc: 'Shows what type of sugar lump is currently growing instantly.<q>It is like sexing a chicken, once you have been doing it long enough you can just tell.</q>',
            price: 500e15,
            icon: [29, 16],
            posX: -2259,
            posY: -189,
            require: ['Sugar frenzy II']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar predictor',
            desc: 'Predict your <b>next sugar lump</b>. Get clear guidance on the simplest changes needed to guarantee each of the 4 specialty lump types.',
            ddesc: 'Predict your <b>next sugar lump</b>. Get clear guidance on the simplest changes needed to guarantee each of the 4 specialty lump types.<q>Inspired by Choose Your Own Lump (CYOL) and modernized with love and care, we hope you enjoy a new era of choosing the lump you want.</q>',
            price: 850e15,
            icon: [19, 7],
            posX: -2345,
            posY: -4,
            require: ['Sugar insight']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar baking II',
            desc: 'Each unspent sugar lump (up to <b>110</b>) gives <b>+1% CpS</b>.',
            ddesc: 'Each unspent sugar lump (up to <b>110</b>) gives <b>+1% CpS</b>.<q>When your neigherbors come looking to borrow a cup of sugar, you aren\'t home.</q>',
            price: 300e15,
            icon: [10, 36],
            posX: -2526,
            posY: -83,
            require: ['Sugar predictor', 'Sugar for sugar trading']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar baking III',
            desc: 'Each unspent sugar lump (up to <b>120</b>) gives <b>+1% CpS</b>.',
            ddesc: 'Each unspent sugar lump (up to <b>120</b>) gives <b>+1% CpS</b>.<q>Sugar sugar everywhere but not a drop to eat.</q>',
            price: 400e15,
            icon: [10, 35],
            posX: -2781,
            posY: -84,
            require: ['Sugar baking II']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar baking IV',
            desc: 'Each unspent sugar lump (up to <b>130</b>) gives <b>+1% CpS</b>.',
            ddesc: 'Each unspent sugar lump (up to <b>130</b>) gives <b>+1% CpS</b>.<q>A Scrouge McDuck level of sugar hoarding.</q>',
            price: 1e21,
            icon: [18, 7],
            posX: -3095,
            posY: 26,
            require: ['Sugar baking III']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar baking V',
            desc: 'Each unspent sugar lump (up to <b>140</b>) gives <b>+1% CpS</b>.',
            ddesc: 'Each unspent sugar lump (up to <b>140</b>) gives <b>+1% CpS</b>.<q>Sugar (noun): a sweet crystalline substance obtained from various plants, especially sugar cane and sugar beet, consisting essentially of sucrose, and used as a sweetener in food and drink.</q>',
            price: 5e21,
            icon: [17, 7],
            posX: -3373,
            posY: -80,
            require: ['Sugar baking IV']
        });
        
        createHeavenlyUpgrade({
            name: 'Sugar baking VI',
            desc: 'Each unspent sugar lump (up to <b>150</b>) gives <b>+1% CpS</b>.',
            ddesc: 'Each unspent sugar lump (up to <b>150</b>) gives <b>+1% CpS</b>.<q>On the next episode of Hoarders, they\'ll be featuring your sugar lump collection.</q>',
            price: 25e21,
            icon: [20, 7],
            posX: -3559,
            posY: -305,
            require: ['Sugar baking V']
        });
        
        createHeavenlyUpgrade({
            name: 'Blackfriday special',
            desc: 'Changing seasons is <b>25%</b> cheaper.',
            ddesc: 'Changing seasons is <b>25%</b> cheaper.<q>Black Friday use to have actually good deals that made you want to buy things, now its just marking up things to mark them back down, even seasons are cheaper.</q>',
            price: 10e15,
            icon: [17, 9],
            posX: -2001,
            posY: -886,
            require: ['Just natural expansion heavenly upgrades'],
            seasonPriceMult: 0.75
        });
        
        createHeavenlyUpgrade({
            name: 'Peaking under the tree',
            desc: 'Random drops are <b>10%</b> more common.',
            ddesc: 'Random drops are <b>10%</b> more common.<q>Ruining Christmas morning surprises since 1988</q>',
            price: 50e15,
            icon: [12, 10],
            posX: -1787,
            posY: -1038,
            require: ['Blackfriday special']
        });
        
        createHeavenlyUpgrade({
            name: 'Seasonal hours',
            desc: 'Seasons last <b>6 hours</b> longer.',
            ddesc: 'Seasons last <b>6 hours</b> longer.',
            price: 5e15,
            icon: [14, 10],
            posX: -1592,
            posY: -965,
            require: ['Blackfriday special']
        });
        
        createHeavenlyUpgrade({
            name: 'Seasonal overtime',
            desc: 'Seasons last <b>12 hours</b> longer.',
            ddesc: 'Seasons last <b>12 hours</b> longer.',
            price: 8e15,
            icon: [15, 10],
            posX: -1550,
            posY: -1114,
            require: ['Seasonal hours']
        });
        
        createHeavenlyUpgrade({
            name: 'Seasonal time off',
            desc: 'Seasons last <b>18 hours</b> longer.',
            ddesc: 'Seasons last <b>18 hours</b> longer.',
            price: 15e15,
            icon: [18, 4],
            posX: -1538,
            posY: -1253,
            require: ['Seasonal overtime']
        });
        
        createHeavenlyUpgrade({
            name: 'Seasonal retirement',
            desc: 'Seasons last <b>twice</b> as long.',
            ddesc: 'Seasons last <b>twice</b> as long.<q>Lets just leave the tree up till March this year.</q>',
            price: 20e15,
            icon: [16, 10],
            posX: -1660,
            posY: -1392,
            require: ['Seasonal time off']
        });
        
        var toyBoxUpgrade = createHeavenlyUpgrade({
            name: 'Toy box',
            desc: 'Adds a switch to toggle <b>Toy mode</b> on and off.',
            ddesc: 'Adds a switch to toggle <b>Toy mode</b> on and off.<q>A virtual KB Toy Store just for you.</q>',
            price: 350e15,  
            icon: [34, 9],
            posX: -1638,
            posY: -1567,
            require: ['Seasonal retirement']
        });

        createHeavenlyUpgrade({
            name: 'Regifting',
            desc: 'Seasonal drops have a <b>30%</b> chance to carry over between ascensions.',
            ddesc: 'Seasonal drops have a <b>30%</b> chance to carry over between ascensions.<q>Didn\'t I get you this label maker last year?</q>',
            price: 75e15,
            icon: [16, 9],
            posX: -1713,
            posY: -1212,
            require: ['Peaking under the tree']
        });
        
        createHeavenlyUpgrade({
            name: 'Cookie calculations',
            desc: 'Display <b>CpS</b> in minutes, hours, or days.',
            ddesc: 'Display <b>CpS</b> in minutes, hours, or days.<q>The kittens have been up all night pouring over spreadsheets to bring you these reports</q>',
            price: 25e15,
            icon: [11, 10],
            posX: -1936,
            posY: -1096,
            require: ['Blackfriday special']
        });
        
        createHeavenlyUpgrade({
            name: 'Annualized returns',
            desc: 'Display cookie bank in <b>years of CpS</b> in stats.',
            ddesc: 'Display cookie bank in <b>years of CpS</b> in stats.<q>Crunching the big numbers now.</q>',
            price: 35e15,
            icon: [31, 8],
            posX: -1921,
            posY: -1282,
            require: ['Cookie calculations']
        });
        
        createHeavenlyUpgrade({
            name: 'Fish tank',
            desc: 'Cookie fish have found their way into your milk.',
            ddesc: 'Cookie fish have found their way into your milk.<q>Please do not tap the glass.</q>',
            price: 100e15,
            icon: [23, 33],
            posX: -2025,
            posY: -1395,
            require: ['Annualized returns']
        });
        
        createHeavenlyUpgrade({
            name: 'Sunken treasure',
            desc: 'You can now collect your milk fish for a small reward.',
            ddesc: 'You can now collect your milk fish for a small reward.<q>There\'s gold in them there milk.</q>',
            price: 500e15,
            icon: [7, 15, getSpriteSheet('custom')],
            posX: -2065,
            posY: -1544,
            require: ['Fish tank']
        });
        
        createHeavenlyUpgrade({
            name: 'Aquaculturist',
            desc: 'Fish appear <b>25%</b> more often.',
            ddesc: 'Fish appear <b>25%</b> more often.<q>With proper care and feeding, your fish population thrives.</q>',
            price: 2000e15,
            icon: [1, 25, getSpriteSheet('custom')],
            posX: -2202,
            posY: -1658,
            require: ['Sunken treasure']
        });
        
        createHeavenlyUpgrade({
            name: 'Hatchery effect',
            desc: 'Fish have a <b>10%</b> chance to appear in pairs.',
            ddesc: 'Fish have a <b>10%</b> chance to appear in pairs.<q>Double the fish, double the fun!</q>',
            price: 30000e15,
            icon: [2, 25, getSpriteSheet('custom')],
            posX: -2076,
            posY: -1766,
            require: ['Aquaculturist']
        });
        
        var bigCookieImageSelectorUpgrade = createHeavenlyUpgrade({
            name: 'Big cookie image selector',
            desc: 'Change the image of the <b>Big Cookie</b>.',
            icon: [5, 3],
            posX: -1832,
            posY: -1505,
            require: ['Annualized returns', 'Seasonal retirement', 'Regifting']
        });
        
        createHeavenlyUpgrade({
            name: 'Improved cookie chains',
            desc: 'Cookie chains last longer, especially at higher levels.',
            ddesc: 'Cookie chains last longer, especially at higher levels.<q>Is this a bug fix with the original forumla or an upgrade? No one can ever be totally sure, what we can be sure of is those pesky one cookie chain long chains are a thing of the past, mostly anyways.</q>',
            price: 35e15,
            icon: [3, 5],
            posX: -2464,
            posY: -796,
            require: ['Just natural expansion heavenly upgrades']
        });
        
        createHeavenlyUpgrade({
            name: 'Fading payout',
            desc: '<b>1%</b> chance to auto click a fading golden cookie.',
            ddesc: '<b>1%</b> chance to auto click a fading golden cookie.<q>Counting sheep is for suckers and fools, in this house we count golden cookies while you drift off to sleep.</q>',
            price: 250e15,
            icon: [15, 6],
            posX: -2734,
            posY: -853,
            require: ['Improved cookie chains']
        });
        
        createHeavenlyUpgrade({
            name: 'Lucky fading payout',
            desc: '<b>2%</b> chance to auto click a fading golden cookie.',
            ddesc: '<b>2%</b> chance to auto click a fading golden cookie.<q>Twice the chance, still less reliable than just clicking the cookie though.</q>',
            price: 1000e15,
            icon: [23, 2, getSpriteSheet('custom')],
            posX: -2982,
            posY: -784,
            require: ['Fading payout']
        });
        
        createHeavenlyUpgrade({
            name: 'Distilled essence of retripled luck',
            desc: 'Golden Cookies have a <b>2% chance of being doubled.</b>',
            ddesc: 'Golden Cookies have a <b>2% chance of being doubled.</b>',
            price: 5000e15,
            icon: [27, 12],
            posX: -2795,
            posY: -668,
            require: ['Improved cookie chains']
        });
        
        createHeavenlyUpgrade({
            name: 'Golden stopwatch',
            desc: 'Adds a shimmer timer that displays spawn time for <b>golden cookies</b> and other shimmers.',
            ddesc: 'Adds a shimmer timer that displays spawn time for <b>golden cookies</b> and other shimmers.<q>I wish I could take credit for this idea but it was implemented with love from the work of Timer Widget by Klattmose.</q>',
            price: 50000e15,
            icon: [14, 15, getSpriteSheet('custom')],
            posX: -3104,
            posY: -557,
            require: ['Distilled essence of retripled luck', 'Lucky fading payout']
        });
        
        createHeavenlyUpgrade({
            name: 'Countdown complications',
            desc: 'Shows the remaining duration of buffs in your golden stopwatch.',
            ddesc: 'Shows the remaining duration of buffs in your golden stopwatch.<q>A watch complication is any function beyond telling the hours, minutes, and seconds, adding mechanical complexity like chronographs or a buff countdown timer.</q>',
            price: 35000e15,
            icon: [16, 24, getSpriteSheet('custom')],
            posX: -2964,
            posY: -450,
            require: ['Golden stopwatch']
        });
          
        createHeavenlyUpgrade({
            name: 'Golden cookie predictor',
            desc: 'Show the expected result of a <b>Golden Cookie 10%</b> of the time.',
            ddesc: 'Show the expected result of a <b>Golden Cookie 10%</b> of the time.<q>They told us we were mad to try but who is laughing now?</q>',
            price: 500000e15,
            icon: [3, 17, getSpriteSheet('custom')],
            posX: -3077,
            posY: -189,
            require: ['Golden stopwatch']
        });
        
        createHeavenlyUpgrade({
            name: 'Tweaked golden cookie predictor',
            desc: 'Show the expected result of a <b>Golden Cookie 25%</b> of the time.',
            ddesc: 'Show the expected result of a <b>Golden Cookie 25%</b> of the time.<q>Who are we kidding anyways, you are going to click the cookie anyway.</q>',
            price: 500000e16,
            icon: [4, 17, getSpriteSheet('custom')],
            posX: -3289,
            posY: -314,
            require: ['Golden cookie predictor']
        });
        
        createHeavenlyUpgrade({
            name: 'Improved golden cookie predictor',
            desc: 'Show the expected result of a <b>Golden Cookie 50%</b> of the time.',
            ddesc: 'Show the expected result of a <b>Golden Cookie 50%</b> of the time.<q>We improved it by making improvements to the dohicky that makes it work.</q>',
            price: 500000e17,
            icon: [10, 23, getSpriteSheet('custom')],
            posX: -3304,
            posY: -528,
            require: ['Tweaked golden cookie predictor']
        });
        
        createHeavenlyUpgrade({
            name: 'Perfected golden cookie predictor',
            desc: 'Show the expected result of a <b>Golden Cookie 65%</b> of the time.',
            ddesc: 'Show the expected result of a <b>Golden Cookie 65%</b> of the time.<q>We are approaching absolute peak efficiency in our algorithms, to get any better results we would need to be able to see the inside of a black hole.</q>',
            price: 800000e17,
            icon: [9, 17, getSpriteSheet('custom')],
            posX: -3166,
            posY: -763,
            require: ['Improved golden cookie predictor']
        });
        
        createHeavenlyUpgrade({
            name: 'All is well',
            desc: 'A golden cookie spawns at the <b>top</b> of every hour.',
            ddesc: 'A golden cookie spawns at the <b>top</b> of every hour.<q>Because nothing says \'all is well\' like a cookie appearing right on schedule</q>',
            price: 1000000e17,
            icon: [14, 14, getSpriteSheet('custom')],
            posX: -3318,
            posY: -885,
            require: ['Perfected golden cookie predictor']
        });
        
        createHeavenlyUpgrade({
            name: 'Six bells',
            desc: 'A golden cookie spawns at the <b>bottom</b> of every hour.',
            ddesc: 'A golden cookie spawns at the <b>bottom</b> of every hour.<q>Perfect timing for anyone who believes the universe should deliver sugar twice as often.</q>',
            price: 2000000e17,
            icon: [17, 17, getSpriteSheet('custom')],
            posX: -3414,
            posY: -744,
            require: ['All is well']
        });
        
        createHeavenlyUpgrade({
            name: 'Fortune tolls for you',
            desc: 'Fortune cookies make <b>noise</b> when they appear.',
            ddesc: 'Fortune cookies make <b>noise</b> when they appear.<q>When destiny arrives, it refuses to do so quietly.</q>',
            price: 50e15,
            icon: [23, 20, getSpriteSheet('custom')],
            posX: -2569,
            posY: -535,
            require: ['Improved cookie chains']
        });
        
        createHeavenlyUpgrade({
            name: 'Chinese leftovers',
            desc: 'Consumable Fortune Cookies regenerate once every <b>3 days</b>.',
            ddesc: 'Consumable Fortune Cookies regenerate once every <b>3 days</b>.<q>Everyone knows Chinese leftovers mysteriously multiply in the fridge like they\'re running a shadow franchise.</q>',
            price: 100e15,
            icon: [17, 24, getSpriteSheet('custom')],
            posX: -2797,
            posY: -490,
            require: ['Fortune tolls for you']
        });
        
        createHeavenlyUpgrade({
            name: 'Second day takeout',
            desc: 'Consumable Fortune Cookies regenerate once every <b>2 days</b>.',
            ddesc: 'Consumable Fortune Cookies regenerate once every <b>2 days</b>.<q>Marinated overnight in pure, unfiltered refrigerator funk and wisdom too I guess.</q>',
            price: 2500e15,
            icon: [31, 9],
            posX: -2837,
            posY: -280,
            require: ['Chinese leftovers']
        });
        
        createHeavenlyUpgrade({
            name: 'Doordashing every day',
            desc: 'Consumable Fortune Cookies regenerate once every <b>day</b>.',
            ddesc: 'Consumable Fortune Cookies regenerate once every <b>day</b>.<q>You can practically smell the financial irresponsibility.</q>',
            price: 50000e15,
            icon: [28, 30],
            posX: -2581,
            posY: -320,
            require: ['Second day takeout']
        });
        
        createHeavenlyUpgrade({
            name: 'Rare game hunter',
            desc: 'Shiny Wrinklers are <b>25%</b> more common.',
            ddesc: 'Shiny Wrinklers are <b>25%</b> more common.',
            price: 10e15,
            icon: [21, 13, getSpriteSheet('custom')],
            posX: -2245,
            posY: -952,
            require: ['Just natural expansion heavenly upgrades']
        });
        
        createHeavenlyUpgrade({
            name: 'Hellish hunger',
            desc: 'Wrinklers suck <b>10%</b> more.',
            ddesc: 'Wrinklers suck <b>10%</b> more.',
            price: 15e15,
            icon: [21, 16, getSpriteSheet('custom')],
            posX: -2506,
            posY: -1096,
            require: ['Rare game hunter']
        });
        
        createHeavenlyUpgrade({
            name: 'Ravenous leeches',
            desc: 'Wrinklers suck <b>20%</b> more.',
            ddesc: 'Wrinklers suck <b>20%</b> more.<q>Sluuuurrrp.</q>',
            price: 15e15,
            icon: [21, 17, getSpriteSheet('custom')],
            posX: -2647,
            posY: -1157,
            require: ['Hellish hunger']
        });
        
        createHeavenlyUpgrade({
            name: 'Unlocked gates of hell',
            desc: 'Wrinklers spawn <b>10%</b> faster.',
            ddesc: 'Wrinklers spawn <b>10%</b> faster.',
            price: 20e15,
            icon: [21, 19, getSpriteSheet('custom')],
            posX: -2406,
            posY: -1202,
            require: ['Rare game hunter']
        });
        createHeavenlyUpgrade({
            name: 'Wide open door of hell',
            desc: 'Wrinklers spawn <b>20%</b> faster.',
            ddesc: 'Wrinklers spawn <b>20%</b> faster.',
            price: 20e15,
            icon: [22, 19, getSpriteSheet('custom')],
            posX: -2489,
            posY: -1324,
            require: ['Unlocked gates of hell']
        });

        createHeavenlyUpgrade({
            name: 'Indigenous tracker',
            desc: 'Shiny Wrinklers are <b>50%</b> more common.',
            ddesc: 'Shiny Wrinklers are <b>50%</b> more common.',
            price: 25e15,
            icon: [21, 14, getSpriteSheet('custom')],
            posX: -2684,
            posY: -1334,
            require: ['Ravenous leeches', 'Wide open door of hell']
        });
        createHeavenlyUpgrade({
            name: 'Species bounceback',
            desc: 'Shiny Wrinklers are <b>twice</b> as common.',
            ddesc: 'Shiny Wrinklers are <b>twice</b> as common.<q>Good news, shiny wrinklers have been removed from the critically endangered list, bad news if you keep popping them they will end up right back on it.</q>',
            price: 250e15,
            icon: [21, 15, getSpriteSheet('custom')],
            posX: -2846,
            posY: -1451,
            require: ['Indigenous tracker']
        });

        createHeavenlyUpgrade({
            name: 'The prize at the bottom of the box',
            desc: 'Wrinklers have a <b>1%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.',
            ddesc: 'Wrinklers have a <b>1%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.<q>Just like old cereal boxes, dig through enough weird, crunchy horrors and eventually you\'ll find something shiny and powerful.</q>',
            price: 80e15,
            icon: [20, 9],
            posX: -2489,
            posY: -933,
            require: ['Rare game hunter']
        });
        
        createHeavenlyUpgrade({
            name: 'Double box prize',
            desc: 'Wrinklers have a <b>2%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.',
            ddesc: 'Wrinklers have a <b>2%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.<q>Turns out the real prize wasn\'t a decoder ring.</q>',
            price: 150e15,
            icon: [33, 3],
            posX: -2705,
            posY: -992,
            require: ['The prize at the bottom of the box']
        });
        
        createHeavenlyUpgrade({
            name: 'Mail in sweepstake winner',
            desc: 'Wrinklers have a <b>3%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.',
            ddesc: 'Wrinklers have a <b>3%</b> chance of a <b>66x</b> buff for <b>6 seconds</b> on pop.<q>As powerful as mail away x-ray specs.</q>',
            price: 250e15,
            icon: [34, 8],
            posX: -2925,
            posY: -1247,
            require: ['Double box prize']
        });
                
        createHeavenlyUpgrade({
            name: 'Unlucky luckier',
            desc: 'Lucky Golden Cookies are <b>5%</b> less common.',
            ddesc: 'Lucky Golden Cookies are <b>5%</b> less common.<q>Lucky cookies are good but not that good.</q>',
            price: 500e15,
            icon: [23, 17, getSpriteSheet('custom')],
            posX: -3160,
            posY: -1038,
            require: ['Mail in sweepstake winner', 'Fading payout']
        });
        
        createHeavenlyUpgrade({
            name: 'Even more unlucky luckier',
            desc: 'Lucky Golden Cookies are <b>10%</b> less common.',
            ddesc: 'Lucky Golden Cookies are <b>10%</b> less common.<q>Your younger self would be so disappointed to learn you wanted to get less lucky cookies.</q>',
            price: 8000e15,
            icon: [23, 15, getSpriteSheet('custom')],
            posX: -3469,
            posY: -1015,
            require: ['Unlucky luckier']
        });
        
        createHeavenlyUpgrade({
            name: 'Positive feedback loop',
            desc: 'After earning an achievement golden cookies appear <b>10%</b> more often for an hour.',
            ddesc: 'After earning an achievement golden cookies appear <b>10%</b> more often for an hour.<q>Scientists call it \'operant conditioning\'. You call it \'Ooh, another shiny widget to click on.\'</q>',
            price: 5000000e17,
            icon: [15, 13, getSpriteSheet('custom')],
            posX: -3577,
            posY: -849,
            require: ['Six bells', 'Even more unlucky luckier']
        });
        
        createHeavenlyUpgrade({
            name: 'Stacks on stacks on stacks',
            desc: 'Each golden cookie clicked this ascension increases <b>CpS</b> by <b>0.05%</b>.',
            ddesc: 'Each golden cookie clicked this ascension increases <b>CpS</b> by <b>0.05%</b>.<q>If you stack cookies high enough, they eventually start generating their own gravitational field. Useful!</q>',
            price: 1000e21,
            icon: [12, 36],
            posX: -3651,
            posY: -595,
            require: ['Positive feedback loop', 'Sugar baking VI']
        });
        
        createHeavenlyUpgrade({
            name: 'Skitter skatter skrum ahh',
            desc: 'Resurrect Abomination spell has a <b>1%</b> chance to summon a shiny wrinkler.',
            ddesc: 'Resurrect Abomination spell has a <b>1%</b> chance to summon a shiny wrinkler.<q>oooooh it sparkles!</q>',
            price: 25e15,
            icon: [28, 11],
            posX: -2116,
            posY: -1139,
            require: ['Rare game hunter']
        });
        
        createHeavenlyUpgrade({
            name: 'Abra-Ka-Wiggle',
            desc: 'Resurrect Abomination spell has a <b>2%</b> chance to summon a shiny wrinkler.',
            ddesc: 'Resurrect Abomination spell has a <b>2%</b> chance to summon a shiny wrinkler.',
            price: 250e15,
            icon: [6, 16, getSpriteSheet('custom')],
            posX: -2258,
            posY: -1406,
            require: ['Skitter skatter skrum ahh']
        });
        
        createHeavenlyUpgrade({
            name: 'Alakazoodle evil noodle',
            desc: 'Resurrect Abomination spell has a <b>3%</b> chance to summon a shiny wrinkler.',
            ddesc: 'Resurrect Abomination spell has a <b>3%</b> chance to summon a shiny wrinkler.<q>I think I missed this day at Hogwarts.</q>',
            price: 750e15,
            icon: [14, 16, getSpriteSheet('custom')],
            posX: -2448,
            posY: -1653,
            require: ['Abra-Ka-Wiggle']
        });
        
        createHeavenlyUpgrade({
            name: 'Cockroaches',
            desc: 'Popping a wrinkler has a <b>1%</b> chance to summon another wrinkler immediately.',
            ddesc: 'Popping a wrinkler has a <b>1%</b> chance to summon another wrinkler immediately.<q>You know what they say, if you see one cockroach there are a thousand more just out of sight.</q>',
            price: 50000e15,
            icon: [15, 12],
            posX: -2423,
            posY: -1838,
            require: ['Alakazoodle evil noodle']
        });
        
        createHeavenlyUpgrade({
            name: 'Infestation',
            desc: 'Popping a wrinkler has a <b>2%</b> chance to summon another wrinkler immediately.',
            ddesc: 'Popping a wrinkler has a <b>2%</b> chance to summon another wrinkler immediately.<q>Some say Wrinklers are the only thing that will survive a nuclear apocalypse, I disagree I don\'t think nuclear weapons can nurt Nokia phones either.</q>',
            price: 250000e15,
            icon: [15, 12],
            posX: -2328,
            posY: -1990,
            require: ['Cockroaches']
        });
        
        createHeavenlyUpgrade({
            name: 'Slimy pheromones',
            desc: 'If you have a shiny wrinkler on your cookie, you are <b>5x</b> as likely to attract another.',
            ddesc: 'If you have a shiny wrinkler on your cookie, you are <b>5x</b> as likely to attract another.<q>Here we find a rare shiny wrinkler, its skin catching the light in a way its species has no right to. Naturally, this peculiarity attracts the rest, who approach like scientists inspecting a colleague who has made a questionable life choice.</q>',
            price: 5000e15,
            icon: [30, 5],
            posX: -2609,
            posY: -1505,
            require: ['Alakazoodle evil noodle', 'Species bounceback']
        });
        
        createHeavenlyUpgrade({
            name: 'Bingo center slots',
            desc: 'Add slot machines to your bingo centers. If you own the Bingo center/Research facility upgrade your grandmas can now play the slots. The more grandmas you own the more plays they make. Jackpots are rare but you can win fabulous prizes such as cookies, golden cookies, and sugar lumps!',
            ddesc: 'Add slot machines to your bingo centers. If you own the Bingo center/Research facility upgrade, your grandmas can now play the slots. The more grandmas you own, the more pulls they make. Jackpots are rare, but you can win fabulous prizes such as cookies, golden cookies, and sugar lumps!<q>They just love sitting there all day feeding quarters into the machines. Despite the zombie-like appearance, it actually keeps them more docile.</q>',   
            price: 75e19,
            icon: [18, 24, getSpriteSheet('custom')],
            posX: -2440,
            posY: -1461,
            require: ['Slimy pheromones']
        });
        
        var pinkStuffUpgrade = createHeavenlyUpgrade({
            name: 'Pink stuff',
            desc: 'Adds a switch to toggle on <b>Winklers</b> (note: <b>not</b> Wrinklers).',
            ddesc: 'Adds a switch to toggle on <b>Winklers</b> (note: <b>not</b> Wrinklers).<q>O M G SO CUTEEEEEEE!!!</q>',
            price: 800e15,
            icon: [22, 20, getSpriteSheet('custom')],
            posX: -2977,
            posY: -1563,
            require: ['Mail in sweepstake winner', 'Alakazoodle evil noodle']
        });
        
        createHeavenlyUpgrade({
            name: 'Frenziered elders',
            desc: 'Your elder frenzies last <b>25%</b> longer.',
            ddesc: 'Your elder frenzies last <b>25%</b> longer. <q>The elders are really getting out of control, perhaps we should cut back on their sugar intake?</q>',
            price: 1500e17,
            icon: [2, 9],
            posX: -3197,
            posY: -1635,
            require: ['Pink stuff']
        });
        
        createHeavenlyUpgrade({
            name: 'Creative tax evasion',
            desc: 'Negative loan effects don\'t last as long.',
            ddesc: 'Negative loan effects don\'t last as long.<q>Reducing downside exposure through aggressive imagination and creative bookkeeping.</q>',
            price: 75e15,
            icon: [34, 12],
            posX: -1874,
            posY: -820,
            require: ['Wallstreet bets']
        });
        
        createHeavenlyUpgrade({
            name: 'The checkbox',
            desc: 'This upgrade doesn\'t do anything.',
            ddesc: 'This upgrade doesn\'t do anything.<q>Or does it...? Nope, it doesn\'t... really for sure, believe me. Well maybe I lied, maybe it does. Does it really matter in the end?</q>',
            price: 500e15,
            icon: [22, 24, getSpriteSheet('custom')],
            posX: -2340,
            posY: 164,
            require: ['Sugar predictor']
        });
        
        createHeavenlyUpgrade({
            name: 'Water cooled processors',
            desc: 'Terminal minigame cooldown is reduced by 1 hour.',
            ddesc: 'Terminal minigame cooldown is reduced by 1 hour.<q>Water and delicate electronics together at last, what\'s the worst that can happen?</q>',
            price: 250e15,
            icon: [21, 24, getSpriteSheet('custom')],
            posX: -1371,
            posY: -870,
            require: ['Gilded allure', 'Aerated soil']
        });
        
        createHeavenlyUpgrade({
            name: 'Overclocked GPUs',
            desc: 'Terminal minigame has one extra slot.',
            ddesc: 'Terminal minigame has one extra slot.<q>Triple the price for 3.5% more power, now with flashing LEDs.</q>',
            price: 500e15,
            icon: [20, 24, getSpriteSheet('custom')],
            posX: -1368,
            posY: -1027,
            require: ['Water cooled processors']
        });
        
        createHeavenlyUpgrade({
            name: 'Mega clicks',
            desc: '<b>1%</b> of cookie clicks are mega clicks and are <b>10x</b> more powerful than regular old clicks.',
            ddesc: '<b>1%</b> of cookie clicks are mega clicks and are <b>10x</b> more powerful than regular old clicks.<q>MEGA CLICK!!!!</q>',
            price: 50e19,
            icon: [11, 35],
            posX: -1805,
            posY: -118,
            require: ['Box of overpriced donuts']
        });
        
        createHeavenlyUpgrade({
            name: 'Lucky mega clicks',
            desc: 'Mega clicks are now <b>50%</b> more common.',
            ddesc: 'Mega clicks are now <b>50%</b> more common.<q>We can\'t believe they found a way to make mega clicks even more awesome either.</q>',
            price: 500e19,
            icon: [9, 9, getSpriteSheet('custom')],
            posX: -1719,
            posY: 17,
            require: ['Mega clicks']
        });
        
        createHeavenlyUpgrade({
            name: 'Extreme mega clicks',
            desc: 'Mega clicks are now <b>50%</b> more powerful.',
            ddesc: 'Mega clicks are now <b>50%</b> more powerful.<q>Extreme power for extreme clicks!</q>',
            price: 5000e19,
            icon: [9, 10, getSpriteSheet('custom')],
            posX: -1626,
            posY: 155,
            require: ['Lucky mega clicks']
        });
        
        createHeavenlyUpgrade({
            name: 'Godzmak\'s Headstart',
            desc: 'Godzmak buffs last <b>10%</b> longer.',
            ddesc: 'Godzmak\'s buff last <b>10%</b> longer.<q>We shouldn\'t be encouraging his destructive behavior, but he is kinda cute.</q>',
            price: 50000e15,
            icon: [23, 18],
            posX: -1418,
            posY: -25,
            require: ['Divine uninspiration']
        });
        
        createHeavenlyUpgrade({
            name: 'Slightly less bitter wrath',
            desc: 'Ruin cookies are found <b>5%</b> less often in wrath cookies.',
            ddesc: 'Ruin cookies are found <b>5%</b> less often in wrath cookies.<q>The cookies are still ruined, but at least they are a bit less ruined.</q>',
            price: 50000e15,
            icon: [10, 29],
            posX: -3528,
            posY: -1151,
            require: ['Even more unlucky luckier']
        });
        
        createHeavenlyUpgrade({
            name: 'Flavor enhanced wrath',
            desc: 'Ruin cookies are found <b>10%</b> less often in wrath cookies.',
            ddesc: 'Ruin cookies are found <b>10%</b> less often in wrath cookies.<q>We found a way to improve the flavor of the wrath cookies, it turns out you just need a pinch of essence of evil not the whole tablespoon we had been using.</q>',
            price: 300000e15,
            icon: [15, 5],
            posX: -3372,
            posY: -1146,
            require: ['Slightly less bitter wrath']
        });
        
        return parentUpgrade;
    }
    
    // ===== SAVE/LOAD SYSTEM =====
    
    function getHeavenlyUpgradeNames() {
        var upgradeNames = [];
        if (!Game.Upgrades) return upgradeNames;
        
        // Find upgrades marked as ours, or toggle upgrades we create
        for (var name in Game.Upgrades) {
            var upgrade = Game.Upgrades[name];
            if (upgrade && (upgrade._heavenlyUpgrade || 
                name === 'Toy mode [on]' || name === 'Toy mode [off]' ||
                name === 'Pink stuff [on]' || name === 'Pink stuff [off]' ||
                name === 'Sugar trade')) {
                upgradeNames.push(name);
            }
        }
        
        return upgradeNames;
    }

    // Helper to restore upgrades
    function restoreUpgrades(upgrades) {
        if (!upgrades) return 0;
        var restoredCount = 0;
        Object.keys(upgrades).forEach(function(name) {
            var upgrade = Game.Upgrades[name];
            if (upgrade) {
                var savedBought = upgrades[name].bought || 0;
                if (upgrade.bought !== savedBought) {
                    upgrade.bought = savedBought;
                    restoredCount++;
                }
                // Restore unlocked status for lasting upgrades
                if (upgrade.lasting && upgrades[name].unlocked !== undefined) {
                    var savedUnlocked = upgrades[name].unlocked || 0;
                    if (upgrade.unlocked !== savedUnlocked) {
                        upgrade.unlocked = savedUnlocked;
                    }
                }
            }
        });
        return restoredCount;
    }

    // Helper to restore upgrades
    function restoreUpgradesBoughtOnly(upgrades) {
        if (!upgrades) return 0;
        var restoredCount = 0;
        Object.keys(upgrades).forEach(function(name) {
            var upgrade = Game.Upgrades[name];
            if (upgrade && upgrades[name] && upgrades[name].bought !== undefined) {
                var savedBought = upgrades[name].bought || 0;
                var currentBought = upgrade.bought || 0;
                if (savedBought !== currentBought) {
                    upgrade.bought = savedBought;
                    restoredCount++;
                }
            }
        });
        return restoredCount;
    }
    
    function getSaveData() {
        try {
            if (!Game.JNE) Game.JNE = {};
            if (!Game.JNE.heavenlyUpgradesSavedData) Game.JNE.heavenlyUpgradesSavedData = {};
            
            var saveData = {
                version: MOD_HU_VERSION,
                upgrades: {},
                pantheon: {},
                garden: {},
                buffs: [],
                switches: {},
                settings: {},
                timers: {},
                stats: {},
                bigCookieImage: 0
            };
            
            // Save upgrades
            var upgradeNames = getHeavenlyUpgradeNames();
            upgradeNames.forEach(function(name) {
                var upgrade = Game.Upgrades[name];
                if (upgrade) {
                    var bought = upgrade.bought || 0;
                    saveData.upgrades[name] = {
                        bought: bought
                    };
                    // Save unlocked status for lasting upgrades
                    if (upgrade.lasting && upgrade.unlocked) {
                        saveData.upgrades[name].unlocked = upgrade.unlocked;
                    }
                }
            });
            
            var temple = Game.Objects['Temple'];
            if (temple && temple.minigameLoaded && temple.minigame) {
                var M = temple.minigame;
                if (M.slot && Array.isArray(M.slot) && M.godsById && M.gods) {
                    saveData.pantheon.slots = [];
                    var customGodKeys = ['procrastination', 'selfishness'];
                    for (var i = 0; i < M.slot.length; i++) {
                        var godId = M.slot[i];
                        if (godId !== undefined && godId !== -1 && M.godsById[godId] && M.godsById[godId].key) {
                            var godKey = M.godsById[godId].key;
                            if (customGodKeys.indexOf(godKey) !== -1) {
                                saveData.pantheon.slots[i] = godKey;
                            } else {
                                saveData.pantheon.slots[i] = -1; // Not our god, don't save
                            }
                        } else {
                            saveData.pantheon.slots[i] = -1;
                        }
                    }
                }
                if (M._procrastinationSlotTime !== undefined && M._procrastinationSlotTime !== null) {
                    saveData.pantheon.procrastinationSlotTime = M._procrastinationSlotTime;
                }
                if (M._selfishnessClickCount !== undefined) {
                    saveData.pantheon.selfishnessClickCount = M._selfishnessClickCount || 0;
                }
            }
            
            // Save garden data
            var farm = Game.Objects['Farm'];
            if (farm && farm.minigameLoaded && farm.minigame) {
                var M = farm.minigame;
                saveData.garden.soil = M.soil || 0;
                var modPlants = [];
                if (M.plants && M.plot && M.plantsById) {
                    var plotH = M.h || M.plot.length, plotW = M.w || (M.plot[0]?.length || 0);
                    for (var y = 0; y < plotH; y++) {
                        if (!M.plot[y]) continue;
                        for (var x = 0; x < plotW; x++) {
                            var tile = M.plot[y][x];
                            if (tile && tile[0] > 0) {
                                var plant = M.plantsById[tile[0] - 1];
                                if (plant && plant.key && isModPlant(plant.key)) {
                                    modPlants.push({x: x, y: y, plantKey: plant.key, age: tile[1] || 0});
                                }
                            }
                        }
                    }
                }
                saveData.garden.modPlants = modPlants;
                saveData.garden.modSeedsUnlocked = {};
                if (M.plants) {
                    if (M.plants['sparklingSugarCane']) saveData.garden.modSeedsUnlocked['sparklingSugarCane'] = M.plants['sparklingSugarCane'].unlocked || 0;
                    if (M.plants['krazyKudzu']) saveData.garden.modSeedsUnlocked['krazyKudzu'] = M.plants['krazyKudzu'].unlocked || 0;
                    if (M.plants['magicMushroom']) saveData.garden.modSeedsUnlocked['magicMushroom'] = M.plants['magicMushroom'].unlocked || 0;
                }
            }
            
            // Save custom buffs
            if (Game.buffs) {
                var customBuffTypes = ['feedback loop', 'jam filling', 'gilded allure', 'midas curse'];
                for (var i in Game.buffs) {
                    var buff = Game.buffs[i];
                    if (buff && buff.type && buff.type.name && customBuffTypes.indexOf(buff.type.name) !== -1) {
                        var timeRemaining = buff.time ? (buff.time / Game.fps) : 0; 
                        var power = buff.power || 1;
                        saveData.buffs.push({
                            type: buff.type.name,
                            time: timeRemaining,
                            power: power
                        });
                    }
                }
            }
            
            // Save switches
            saveData.switches.sugarFrenzyLastUse = Game.sugarFrenzyLastUse || 0;
            saveData.switches.sugarFrenzyPrice = Game.sugarFrenzyPrice || 1;
            
            var sugarTrade = Game.Upgrades['Sugar trade'];
            if (sugarTrade) {
                saveData.switches.sugarTradeBought = sugarTrade.bought || 0;
            }
            
            saveData.switches.toys = Game.TOYS || 0;
            saveData.switches.winklers = Game.WINKLERS || 0;
            
            // Save settings
            if (window.modSettings && window.modSettings.cpsDisplayUnit !== undefined) {
                saveData.settings.cpsDisplayUnit = window.modSettings.cpsDisplayUnit;
            }
            
            // Save timers
            if (Game.JNE.heavenlyUpgradesSavedData.fortuneCookieLastResetTime) {
                saveData.timers.fortuneCookieLastResetTime = Game.JNE.heavenlyUpgradesSavedData.fortuneCookieLastResetTime;
            }
            
            saveData.stats.cookieFishCaught = Game.JNE.cookieFishCaught || 0;
            saveData.stats.bingoJackpotWins = Game.JNE.bingoJackpotWins || 0;
            
            saveData.bigCookieImage = Game.cookieImageType !== undefined ? Game.cookieImageType : 0;
            
            return saveData;
        } catch (e) {
            console.error('[Heavenly Upgrades] Error in getSaveData:', e);
            return {
                version: MOD_HU_VERSION,
                upgrades: {},
                pantheon: {},
                garden: {},
                buffs: [],
                switches: {},
                settings: {},
                timers: {},
                stats: {},
                bigCookieImage: 0
            };
        }
    }
    
    // Apply save data
    function applySaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') return;
        
        try {
            // Restore upgrades immediately (before other systems depend on them)
            var restoredCount = restoreUpgrades(saveData.upgrades);
            if (restoredCount > 0) {
                console.log('[Heavenly Upgrades] Restored', restoredCount, 'upgrades');
            }

            if (Game.registerHook && !Game._jneUpgradeSetupsCheckHooked) {
                Game.registerHook('check', runUpgradeSetups, 'JNE upgrade setups');
                Game._jneUpgradeSetupsCheckHooked = true;
            }
            if (Game.JNE && Game.JNE._upgradeSetups) {
                for (var i = 0; i < Game.JNE._upgradeSetups.length; i++) {
                    if (Game.JNE._upgradeSetups[i]) Game.JNE._upgradeSetups[i].ran = false;
                }
            }
            runUpgradeSetups();
            
            // Restore settings
            if (saveData.settings) {
                if (saveData.settings.cpsDisplayUnit !== undefined) {
                    if (!window.modSettings) window.modSettings = {};
                    window.modSettings.cpsDisplayUnit = saveData.settings.cpsDisplayUnit;
                }
            }
            
            // Restore buffs
            if (saveData.buffs && Array.isArray(saveData.buffs) && Game.gainBuff) {
                saveData.buffs.forEach(function(buffData) {
                    try {
                        if (buffData.type && buffData.time > 0) {
                            Game.gainBuff(buffData.type, buffData.time, buffData.power || 1);
                        }
                    } catch (e) {}
                });
            }
            
            // Restore switches
            if (saveData.switches) {
                if (saveData.switches.sugarFrenzyLastUse !== undefined) Game.sugarFrenzyLastUse = saveData.switches.sugarFrenzyLastUse;
                if (saveData.switches.sugarFrenzyPrice !== undefined) {
                    Game.sugarFrenzyPrice = saveData.switches.sugarFrenzyPrice || 1;
                }
                if (saveData.switches.sugarTradeBought !== undefined) {
                    if (Game.Upgrades['Sugar trade']) {
                        Game.Upgrades['Sugar trade'].bought = saveData.switches.sugarTradeBought || 0;
                    }
                }
                if (saveData.switches.toys !== undefined) {
                    Game.TOYS = saveData.switches.toys || 0;
                    var toyOn = Game.Upgrades['Toy mode [on]'], toyOff = Game.Upgrades['Toy mode [off]'];
                    if (toyOn && toyOff) {
                        toyOn.bought = (Game.TOYS === 1) ? 0 : 1;
                        toyOff.bought = (Game.TOYS === 1) ? 1 : 0;
                    }
                }
                if (saveData.switches.winklers !== undefined) {
                    Game.WINKLERS = saveData.switches.winklers || 0;
                    var pinkOn = Game.Upgrades['Pink stuff [on]'], pinkOff = Game.Upgrades['Pink stuff [off]'];
                    if (pinkOn && pinkOff) {
                        pinkOn.bought = (Game.WINKLERS === 1) ? 0 : 1;
                        pinkOff.bought = (Game.WINKLERS === 1) ? 1 : 0;
                    }
                }
            }
            
            // Restore timers and stats
            if (saveData.timers && saveData.timers.fortuneCookieLastResetTime !== undefined) {
                if (!Game.JNE) Game.JNE = {};
                if (!Game.JNE.heavenlyUpgradesSavedData) Game.JNE.heavenlyUpgradesSavedData = {};
                Game.JNE.heavenlyUpgradesSavedData.fortuneCookieLastResetTime = saveData.timers.fortuneCookieLastResetTime;
            }
            if (saveData.stats && saveData.stats.cookieFishCaught !== undefined) {
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.cookieFishCaught = Number(saveData.stats.cookieFishCaught) || 0;
                if (Game.onMenu === 'stats' && Game.UpdateMenu) {
                    setTimeout(function() {
                        // Remove existing mod stats section so it re-injects with updated values
                        var existingSection = document.getElementById('mod-stats-section');
                        if (existingSection && existingSection.parentNode) {
                            existingSection.parentNode.removeChild(existingSection);
                        }
                        if (Game.UpdateMenu) Game.UpdateMenu();
                    }, 100);
                }
            }
            if (saveData.stats && saveData.stats.bingoJackpotWins !== undefined) {
                if (!Game.JNE) Game.JNE = {};
                Game.JNE.bingoJackpotWins = Number(saveData.stats.bingoJackpotWins) || 0;
                // Refresh stats menu if it's open to show the restored value
                if (Game.onMenu === 'stats' && Game.UpdateMenu) {
                    setTimeout(function() {
                        // Remove existing mod stats section so it re-injects with updated values
                        var existingSection = document.getElementById('mod-stats-section');
                        if (existingSection && existingSection.parentNode) {
                            existingSection.parentNode.removeChild(existingSection);
                        }
                        if (Game.UpdateMenu) Game.UpdateMenu();
                    }, 100);
                }
            }
            
            // Restore big cookie image
            if (saveData.bigCookieImage !== undefined && Game.cookieImageType !== undefined) {
                Game.cookieImageType = saveData.bigCookieImage;
                if (Game.CookiesByChoice && Game.CookiesByChoice[saveData.bigCookieImage] && Game.Loader && Game.Loader.Replace) {
                    Game.Loader.Replace('perfectCookie.png', Game.CookiesByChoice[saveData.bigCookieImage].pic);
                }
            }
            
            setupGardenRestoreFromSave();
            setupPantheonRestoreFromSave();            
            
        } catch (e) {
            console.error('[Heavenly Upgrades] Error in applySaveData:', e);
        }
    }

    function setupGardenRestoreFromSave() {
        var M = Game.Objects['Farm']?.minigame;
        if (!M) return;
        
        var saveData = Game.JNE?.heavenlyUpgradesSavedData;
        if (!saveData?.garden) return;
        
        M._heavenlyUpgradesRestored = true;

        // Restore soil
        if (saveData.garden.soil !== undefined && M.soilsById?.[saveData.garden.soil]) {
            M.soil = saveData.garden.soil;
        }

        // Restore seeds
        if (saveData.garden.modSeedsUnlocked) {
            var modSeeds = ['sparklingSugarCane', 'krazyKudzu', 'magicMushroom'];
            modSeeds.forEach(function(key) {
                var shouldBeUnlocked = saveData.garden.modSeedsUnlocked[key];
                
                if (shouldBeUnlocked && M.plants && M.plants[key]) {
                    M.plants[key].unlocked = 1;
                    if (M.unlockSeed) {
                        M.unlockSeed(M.plants[key]);
                    }
                }
            });
            
            if (M.buildPanel) {
                M.buildPanel();
            }
        }
        
        if (saveData.garden.modPlants && saveData.garden.modPlants.length > 0) {
            var upgradeMap = {'sparklingSugarCane': 'Sparkling sugar cane', 'krazyKudzu': 'Krazy kudzu', 'magicMushroom': 'Magic mushroom'};
            saveData.garden.modPlants.forEach(function(p) {
                var plant = M.plants[p.plantKey];
                
                if (plant && plant.id !== undefined && Game.Has(upgradeMap[p.plantKey])) {
                    var tile = M.plot[p.y] && M.plot[p.y][p.x];
                    if (tile) {
                        tile[0] = plant.id + 1;
                        if (p.age !== undefined) tile[1] = p.age;
                    }
                }
            });
            if (M.getUnlockedN) M.getUnlockedN();
            M.toRebuild = true;
            if (M.draw) M.draw();
        }
    }
    
    function setupPantheonRestoreFromSave() {
        var M = Game.Objects['Temple']?.minigame;
        if (!M) return;
        
        var saveData = Game.JNE?.heavenlyUpgradesSavedData;
        if (!saveData?.pantheon) return;
        
        if (!M.slot || !M.slotGod || !M.gods || !M.godsById) return;

        M._heavenlyUpgradesRestored = true;
        setupPantheonSaveLoadHooks();

        if (Game.Upgrades?.['Morrowen, Spirit of Procrastination'] || Game.Upgrades?.['Solgreth, Spirit of Selfishness']) {
            addNewPantheonSpirits();
        }

        var savedProcrastinationTime = saveData.pantheon.procrastinationSlotTime;
        var savedSelfishnessCount = saveData.pantheon.selfishnessClickCount;

        if (saveData.pantheon.slots) {
            for (var i = 0; i < Math.min(saveData.pantheon.slots.length, M.slot.length); i++) {
                var savedSlot = saveData.pantheon.slots[i];
                if (!savedSlot || savedSlot === -1) continue;
                var god = (typeof savedSlot === 'string' && M.gods[savedSlot]) || (typeof savedSlot === 'number' && M.godsById[savedSlot]);
                if (!god) continue;

                var currentGod = M.slot[i] !== -1 ? M.godsById[M.slot[i]] : null;
                if (currentGod?.key !== savedSlot && M.slotGod) {
                    if (god.slot === undefined) god.slot = -1;
                    M.slotGod(god, i);
                }

                var godDiv = l('templeGod' + god.id), slotDiv = l('templeSlot' + i);
                if (godDiv && slotDiv && godDiv.parentNode !== slotDiv) {
                    if (godDiv.parentNode) godDiv.parentNode.removeChild(godDiv);
                    slotDiv.appendChild(godDiv);
                    godDiv.className = 'ready templeGod titleFont templeGod' + (god.id % 4);
                    godDiv.style.transform = 'none';
                }
            }
        }

        if (savedProcrastinationTime !== undefined && savedProcrastinationTime !== null) {
            M._procrastinationSlotTime = savedProcrastinationTime;
        }
        if (savedSelfishnessCount !== undefined) {
            M._selfishnessClickCount = savedSelfishnessCount || 0;
        }
    }
    
    //registered once globally, not inside applySaveData
    if (typeof Game !== 'undefined' && !Game._heavenlyUpgradesMinigameHooksRegistered) {
        Game._heavenlyUpgradesMinigameHooksRegistered = true;
    }
    
    if (typeof Game !== 'undefined') {
        if (!Game.JNE) Game.JNE = {};
        if (!Game.JNE.HeavenlyUpgrades) {
            Game.JNE.HeavenlyUpgrades = {
                create: createHeavenlyUpgrade,
                version: MOD_HU_VERSION,
                initialized: function() { return isInitialized; },
                getSaveData: getSaveData,
                applySaveData: applySaveData
            };
        } else {
            // Add save/load functions to existing object
            Game.JNE.HeavenlyUpgrades.getSaveData = getSaveData;
            Game.JNE.HeavenlyUpgrades.applySaveData = applySaveData;
        }
        
        // This handles the case where heavenlyUpgrades.js loads after cookie.js tries to restore
        setTimeout(function() {
            if (Game.JNE && Game.JNE.heavenlyUpgradesSavedData && isInitialized) {
                var saveData = Game.JNE.heavenlyUpgradesSavedData;
                if (saveData && typeof saveData === 'object' && (saveData.version || saveData.upgrades || saveData.pantheon || saveData.garden)) {
                    applySaveData(saveData);
                }
            }
        }, 500);
    }
})();

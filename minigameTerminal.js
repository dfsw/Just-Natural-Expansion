//Just Natural Expansion Terminal minigame
//version 1.0.3

var M = {};
M.parent = Game.Objects && Game.Objects['Javascript console'] ? Game.Objects['Javascript console'] : {
    id: 0,
    level: 10,
    minigameName: 'Terminal',
    minigameLoaded: false,
    minigameLoading: false,
    minigameDiv: null,
    l: null,
    refresh: function() {}
};
M.parent.minigame = M;

const UPDATED_CUSTOM_SPRITE_URL = 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/updatedSpriteSheet.png';

var terminalAchievementNames = [
    '10x Full-Stack rockstar ninja wizard engineer',
    'Agile hacker samurai jedi-craftsman engineer'
];

var terminalAchievementThresholds = [100,500]; //programs run for our two achievements

var terminalAchievementState = {
    achievementsCreated: false
};

M.launch = function () {
    var M = this;
    M.name = M.parent.minigameName;
    M.maxSlots = 12; 

    const TERMINAL_BACKGROUND_URL = 'https://raw.githubusercontent.com/dfsw/Cookies/main/TerminalBG.png';
    const TERMINAL_DIRECTIONAL_URL = 'https://raw.githubusercontent.com/dfsw/Cookies/main/directional.png';
    const DRAGON_AURA_BASE_OPTIONS = [
        { value: 0, label: 'No aura', icon: [0, 7] },
        { value: 1, label: 'Breath of Milk', icon: [18, 25] },
        { value: 2, label: 'Dragon Cursor', icon: [0, 25] },
        { value: 3, label: 'Elder Battalion', icon: [1, 25] },
        { value: 4, label: 'Reaper of Fields', icon: [2, 25] },
        { value: 5, label: 'Earth Shatterer', icon: [3, 25] },
        { value: 6, label: 'Master of the Armory', icon: [4, 25] },
        { value: 7, label: 'Fierce Hoarder', icon: [15, 25] },
        { value: 8, label: 'Dragon God', icon: [16, 25] },
        { value: 9, label: 'Arcane Aura', icon: [17, 25] },
        { value: 10, label: 'Dragonflight', icon: [5, 25] },
        { value: 11, label: 'Ancestral Metamorphosis', icon: [6, 25] },
        { value: 12, label: 'Unholy Dominion', icon: [7, 25] },
        { value: 13, label: 'Epoch Manipulator', icon: [8, 25] },
        { value: 14, label: 'Mind Over Matter', icon: [13, 25] },
        { value: 15, label: 'Radiant Appetite', icon: [14, 25] },
        { value: 16, label: "Dragon's Fortune", icon: [19, 25] },
        { value: 17, label: "Dragon's Curve", icon: [20, 25] },
        { value: 18, label: 'Reality Bending', icon: [32, 25] },
        { value: 19, label: 'Dragon Orbs', icon: [33, 25] },
        { value: 20, label: 'Supreme Intellect', icon: [34, 25] },
        { value: 21, label: 'Dragon Guts', icon: [35, 25] }
    ];

    function getGameObject(objectName) {
        if (!Game.Objects) return null;
        return Game.Objects[objectName];
    }

    function getMinigame(objectName) {
        var object = getGameObject(objectName);
        return object && object.minigame;
    }

    function findOptionLabel(options, value, fallback) {
        var target = '' + value;
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if ('' + option.value === target) {
                return option.label;
            }
        }
        return fallback;
    }

    function firstOptionValue(options, fallback) {
        return options.length ? options[0].value : fallback;
    }

    function setIconBackground(element, icon) {
        if (!element) return;
        icon = icon || [0, 0];
        var sheet = icon && icon.length > 2 ? icon[2] : null;
        var width = icon && icon.length > 3 ? icon[3] : null;
        var height = icon && icon.length > 4 ? icon[4] : null;
        if (sheet) {
            if (!element.dataset.defaultBgImage && typeof window !== 'undefined' && window.getComputedStyle) {
                var computed = window.getComputedStyle(element).backgroundImage;
                element.dataset.defaultBgImage = computed && computed !== 'none' ? computed : '';
            }
            element.style.backgroundImage = 'url("' + sheet + '")';
            element.dataset.usingCustomSheet = '1';
        } else if (element.dataset.usingCustomSheet) {
            element.style.backgroundImage = element.dataset.defaultBgImage || '';
            delete element.dataset.usingCustomSheet;
        }
        if (!element.dataset.defaultWidth) element.dataset.defaultWidth = element.style.width || '';
        if (!element.dataset.defaultHeight) element.dataset.defaultHeight = element.style.height || '';
        if (!element.dataset.defaultMinWidth) element.dataset.defaultMinWidth = element.style.minWidth || '';
        if (!element.dataset.defaultMinHeight) element.dataset.defaultMinHeight = element.style.minHeight || '';
        if (width) {
            element.style.width = width + 'px';
            element.style.minWidth = width + 'px';
        } else {
            element.style.width = element.dataset.defaultWidth;
            element.style.minWidth = element.dataset.defaultMinWidth;
        }
        if (height) {
            element.style.height = height + 'px';
            element.style.minHeight = height + 'px';
        } else {
            element.style.height = element.dataset.defaultHeight;
            element.style.minHeight = element.dataset.defaultMinHeight;
        }
        element.style.backgroundPosition = (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px';
    }

    M.renderProgramIcon = function (program, extraClass) {
        if (!program) return '';
        var icon = program.icon || [0, 0];
        var sheet = (icon.length > 2 && icon[2]) ? icon[2] : null;
        var tileSize = (icon.length > 3 && icon[3]) ? icon[3] : 48;
        var classNames = 'usesIcon shadowFilter' + (extraClass ? ' ' + extraClass : '');
        var style = '';
        if (sheet) {
            style += 'background-image:url(' + sheet + ');';
        }
        if (tileSize !== 48) {
            var scale = 48 / tileSize;
            var scaledSheetWidth = (icon.length > 5 && icon[5]) ? (icon[5] * scale) : 'auto';
            var scaledSheetHeight = (icon.length > 6 && icon[6]) ? (icon[6] * scale) : 'auto';
            style += 'background-size:' + scaledSheetWidth + 'px ' + scaledSheetHeight + 'px;';
            var scaledPosX = (-icon[0] * tileSize * scale);
            var scaledPosY = (-icon[1] * tileSize * scale);
            style += 'background-position:' + scaledPosX + 'px ' + scaledPosY + 'px;';
        } else {
            var posX = (-icon[0] * tileSize);
            var posY = (-icon[1] * tileSize);
            style += 'background-position:' + posX + 'px ' + posY + 'px;';
        }
        return '<div class="' + classNames + '" style="' + style + '"></div>';
    };

    function getGardenSpriteSheet() {
        if (typeof getSpriteSheet === 'function') {
            var sheet = getSpriteSheet('gardenPlants');
            if (sheet) return sheet;
        }
        if (Game.resPath) {
            return Game.resPath + 'img/gardenPlants.png';
        }
        return '';
    }

    function shouldIncludeGardenPlant(plantKey) {
        if (plantKey === 'sparklingSugarCane') return Game.Has('Sparkling sugar cane');
        if (plantKey === 'krazyKudzu') return Game.Has('Krazy kudzu');
        if (plantKey === 'magicMushroom') return Game.Has('Magic mushroom');
        return true;
    }

    function buildGardenSeedIcon(iconIndex) {
        var index = parseInt(iconIndex, 10);
        if (isNaN(index) || index < 0) return null;
        if (index >= 34 && index <= 36) {
            var customSheet = '';
            if (typeof getSpriteSheet === 'function') customSheet = getSpriteSheet('custom') || '';
            if (!customSheet) customSheet = UPDATED_CUSTOM_SPRITE_URL;
            if (!customSheet) return null;
            return [(index - 34) * 5, 24, customSheet];
        }
        var sheet = getGardenSpriteSheet();
        if (!sheet) return null;
        return [0, index, sheet];
    }

    function buildGardenSoilIcon(iconIndex) {
        var index = parseInt(iconIndex, 10);
        if (isNaN(index) || index < 0) index = 0;
        var sheet = getGardenSpriteSheet();
        if (!sheet) return null;
        return [index, 34, sheet];
    }

    function buildGardenToolIcon(iconIndex) {
        var index = parseInt(iconIndex, 10);
        if (isNaN(index) || index < 0) index = 0;
        var sheet = getGardenSpriteSheet();
        if (!sheet) return null;
        return [index, 35, sheet];
    }

    function resolveMinigameItem(minigame, value, collectionKey, byIdKey) {
        if (!minigame || value === undefined || value === null) return null;
        var id = parseInt(value, 10);
        var byId = minigame[byIdKey];
        if (!isNaN(id) && byId && byId[id]) return byId[id];
        var str = '' + value;
        var collection = minigame[collectionKey];
        if (collection) {
            if (collection[str]) return collection[str];
            for (var key in collection) {
                if (!collection.hasOwnProperty(key)) continue;
                var item = collection[key];
                if (!item) continue;
                if ((item.id !== undefined && '' + item.id === str) ||
                    (item.key !== undefined && '' + item.key === str) ||
                    (item.name && item.name === str)) {
                    return item;
                }
            }
        }
        if (!isNaN(id) && byId) {
            for (var i = 0; i < byId.length; i++) {
                var candidate = byId[i];
                if (candidate && candidate.id === id) return candidate;
            }
        }
        return null;
    }

    function resolveGardenPlant(minigame, value) {
        return resolveMinigameItem(minigame, value, 'plants', 'plantsById');
    }

    function resolveGardenSoil(minigame, value) {
        return resolveMinigameItem(minigame, value, 'soils', 'soilsById');
    }

    function getBuildingOptions() {
        var list = [];
        var iconCoords = [
            [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
            [15, 0], [16, 0], [17, 0],
            [5, 0], [6, 0], [7, 0], [8, 0],
            [13, 0], [14, 0],
            [19, 0], [20, 0],
            [32, 0], [33, 0], [34, 0], [35, 0]
        ];
        if (Game.ObjectsById) {
            for (var i = 0; i < Game.ObjectsById.length; i++) {
                var building = Game.ObjectsById[i];
                if (!building) continue;
                var icon = iconCoords[i] || [i % 36, 0];
                list.push({
                    value: building.id,
                    label: building.dname || building.name,
                    icon: icon
                });
            }
        }
        if (!list.length) {
            for (var j = 0; j < 36; j++) {
                list.push({
                    value: j,
                    label: 'Building ' + (j + 1),
                    icon: [j, 0]
                });
            }
        }
        return list;
    }

    function getPantheonGodOptions() {
        var baseIcons = [
            [21, 18], [22, 18], [23, 18], [24, 18], [25, 18],
            [26, 18], [27, 18], [28, 18], [29, 18],
            [21, 19], [22, 19]
        ];
        var list = [];
        var minigame = getMinigame('Temple');
        if (minigame) {
            if (minigame.godsById && minigame.godsById.length) {
                for (var i = 0; i < minigame.godsById.length; i++) {
                    var god = minigame.godsById[i];
                    if (!god) continue;
                    var value = god.id !== undefined ? god.id : i;
                    var icon = (god.icon && god.icon.length) ? god.icon : (baseIcons[i] || [21 + i, 18]);
                    list.push({ value: value, label: god.name, icon: icon });
                }
            } else if (minigame.gods) {
                var index = 0;
                for (var key in minigame.gods) {
                    if (!minigame.gods.hasOwnProperty(key)) continue;
                    var g = minigame.gods[key];
                    if (!g) continue;
                    var valueKey = g.id !== undefined ? g.id : (g.key !== undefined ? g.key : key);
                    var iconFallback = (g.icon && g.icon.length) ? g.icon : (baseIcons[index] || [21 + index, 18]);
                    list.push({ value: valueKey, label: g.name, icon: iconFallback });
                    index++;
                }
            }
        }
        if (!list.length) {
            for (var j = 0; j < baseIcons.length; j++) {
                list.push({ value: j, label: 'God ' + (j + 1), icon: baseIcons[j] });
            }
        }
        return list;
    }

    //orteil and his mini icons, annoying, just put them centered in a full size slot dude, come on.
    function getPantheonSlotOptions() {
        return [
            { value: 0, label: 'Diamond slot', icon: [23, 15, null, 24, 24] },
            { value: 1, label: 'Ruby slot', icon: [23.5, 15, null, 24, 24] },
            { value: 2, label: 'Jade slot', icon: [23, 15.5, null, 24, 24] }
        ];
    }

    function getPantheonSlotLabel(index) {
        var parsed = parseInt(index, 10);
        if (isNaN(parsed)) parsed = 0;
        return findOptionLabel(getPantheonSlotOptions(), parsed, 'slot ' + (parsed + 1));
    }

    function getGrimoireSpellOptions() {
        var list = [];
        var minigame = getMinigame('Wizard tower');
        var baseIconX = 21;
        var baseIconY = 11;
        if (minigame) {
            if (minigame.spellsById && minigame.spellsById.length) {
                for (var i = 0; i < minigame.spellsById.length; i++) {
                    var spell = minigame.spellsById[i];
                    if (!spell) continue;
                    var value = spell.id !== undefined ? spell.id : (spell.key || spell.name || i);
                    var icon = [baseIconX + i, baseIconY];
                    if (spell.customIconSheet && spell.icon && spell.icon.length >= 2) {
                        icon = [spell.icon[0], spell.icon[1], spell.customIconSheet];
                    } else if (spell.icon && spell.icon.length) {
                        icon = spell.icon;
                    }
                    list.push({ value: value, label: spell.name, icon: icon });
                }
            } else if (minigame.spells) {
                var index = 0;
                for (var key in minigame.spells) {
                    if (!minigame.spells.hasOwnProperty(key)) continue;
                    var s = minigame.spells[key];
                    if (!s) continue;
                    var sIcon = [baseIconX + index, baseIconY];
                    if (s.customIconSheet && s.icon && s.icon.length >= 2) {
                        sIcon = [s.icon[0], s.icon[1], s.customIconSheet];
                    } else if (s.icon && s.icon.length) {
                        sIcon = s.icon;
                    }
                    list.push({ value: key, label: s.name, icon: sIcon });
                    index++;
                }
            }
        }
        return list;
    }

    function getGardenTargetOptions(action) {
        var list = [];
        var minigame = getMinigame('Farm');
        if (minigame) {
            if (minigame.plantsById && minigame.plantsById.length) {
                for (var i = 0; i < minigame.plantsById.length; i++) {
                    var plantById = minigame.plantsById[i];
                    if (!plantById) continue;
                    var plantValue = plantById.key !== undefined ? plantById.key : (plantById.id !== undefined ? plantById.id : i);
                    if (!shouldIncludeGardenPlant('' + plantValue)) continue;
                    var plantIcon = buildGardenSeedIcon(plantById.icon);
                    var option = { value: plantValue, label: plantById.name };
                    if (plantIcon) option.icon = plantIcon;
                    list.push(option);
                }
            } else if (minigame.plants) {
                for (var key in minigame.plants) {
                    if (!minigame.plants.hasOwnProperty(key)) continue;
                    var plant = minigame.plants[key];
                    if (!plant) continue;
                    if (!shouldIncludeGardenPlant(key)) continue;
                    var value = plant.key !== undefined ? plant.key : (plant.id !== undefined ? plant.id : key);
                    var icon = buildGardenSeedIcon(plant.icon);
                    var item = { value: value, label: plant.name };
                    if (icon) item.icon = icon;
                    list.push(item);
                }
            }
        }
        if ((action || 'plant') === 'harvest') {
            var harvestIcon = buildGardenToolIcon(0);
            var entry = { value: 'allMature', label: 'All mature plants' };
            if (harvestIcon) entry.icon = harvestIcon;
            list.unshift(entry);
        }
        return list;
    }

    function getGardenSoilOptions() {
        var list = [];
        var minigame = getMinigame('Farm');
        if (minigame && minigame.soilsById) {
            for (var i = 0; i < minigame.soilsById.length; i++) {
                var soil = minigame.soilsById[i];
                if (!soil) continue;
                var soilValue = soil.key !== undefined ? soil.key : (soil.id !== undefined ? soil.id : i);
                var soilIcon = null;
                if (soil.customIconSheet && soil.customIcon && soil.customIcon.length >= 2) {
                    soilIcon = [soil.customIcon[0], soil.customIcon[1], soil.customIconSheet];
                } else {
                    soilIcon = buildGardenSoilIcon(soil.icon);
                }
                var option = { value: soilValue, label: soil.name };
                if (soilIcon) option.icon = soilIcon;
                list.push(option);
            }
        }
        return list;
    }

    function getDragonAuraOptions() {
        var auraSource = Game.dragonAuras || null;
        return DRAGON_AURA_BASE_OPTIONS.map(function (option) {
            var label = option.label;
            if (auraSource && auraSource[option.value] && auraSource[option.value].name) {
                label = auraSource[option.value].name;
            }
            return {
                value: option.value,
                label: label,
                icon: option.icon
            };
        });
    }

    function getDragonAuraLabel(auraId) {
        return findOptionLabel(getDragonAuraOptions(), auraId, 'Unknown aura');
    }

    function getLoanDisplayName(index, market) {
        var ordinals = ['1st Loan', '2nd Loan', '3rd Loan'];
        var base = ordinals[index] || ('Loan #' + (index + 1));
        if (market && market.loanTypes && market.loanTypes[index] && market.loanTypes[index][0]) {
            return base + ' - ' + market.loanTypes[index][0];
        }
        return base;
    }

    function getLoanOptions() {
        var list = [];
        var minigame = getMinigame('Bank');
        if (minigame) {
            if (minigame.loansById && minigame.loansById.length) {
                for (var i = 0; i < minigame.loansById.length; i++) {
                    var loan = minigame.loansById[i];
                    if (!loan) continue;
                    var label = getLoanDisplayName(i, minigame);
                    list.push({ value: i, label: label, icon: [i, 10] });
                }
            } else if (minigame.loans && minigame.loans.length) {
                for (var j = 0; j < minigame.loans.length; j++) {
                    var loanObj = minigame.loans[j];
                    if (!loanObj) continue;
                    var labelAlt = getLoanDisplayName(j, minigame);
                    list.push({ value: j, label: labelAlt, icon: [j, 10] });
                }
            } else if (minigame.loanTypes) {
                var idx = 0;
                for (var key in minigame.loanTypes) {
                    if (!minigame.loanTypes.hasOwnProperty(key)) continue;
                    var loanType = minigame.loanTypes[key];
                    if (!loanType) continue;
                    var labelName = getLoanDisplayName(idx, minigame);
                    list.push({ value: idx, label: labelName, icon: [idx, 10] });
                    idx++;
                }
            }
        }
        if (!list.length) {
            list = [
                { value: 0, label: getLoanDisplayName(0), icon: [0, 10] },
                { value: 1, label: getLoanDisplayName(1), icon: [1, 10] },
                { value: 2, label: getLoanDisplayName(2), icon: [2, 10] }
            ];
        }
        return list;
    }

    function getSwitchTargetOptions() {
        return [
            { value: 'golden', label: 'Golden switch', icon: [21, 10] },
            { value: 'veil', label: 'Shimmering veil', icon: [9, 10] },
            { value: 'covenant', label: 'Elder covenant', icon: [8, 9] },
            { value: 'pledge', label: 'Elder pledge', icon: [9, 9] },
            { value: 'season:valentines', label: "Valentine's Day season", icon: [20, 3] },
            { value: 'season:business', label: 'Business Day season', icon: [17, 6] },
            { value: 'season:easter', label: 'Easter season', icon: [0, 12] },
            { value: 'season:halloween', label: 'Halloween season', icon: [13, 8] },
            { value: 'season:christmas', label: 'Christmas season', icon: [12, 10] }
        ];
    }

    function getSugarFrenzyLumpCost() {
        var up = Game.Upgrades ? Game.Upgrades['Sugar frenzy'] : null;
        var cost = 1;
        // Prefer the live runtime value (Sugar frenzy II updates this immediately);
        // upgrade.priceLumps may not be updated until the upgrade UI/tooltip is rebuilt.
        if (Game.sugarFrenzyPrice !== undefined) cost = Game.sugarFrenzyPrice;
        else if (up && up.priceLumps !== undefined) cost = up.priceLumps;
        cost = parseInt(cost, 10);
        if (isNaN(cost) || cost < 1) cost = 1;
        return cost;
    }

    function getSweetRuntimeOptions() {
        var frenzyCost = getSugarFrenzyLumpCost();
        var list = [
            { value: 'sugarFrenzy', label: 'Activate sugar frenzy<br>(Warning: cost ' + frenzyCost + ' sugar lump' + (frenzyCost === 1 ? '' : 's') + ')', icon: [22, 17] }
        ];
        if (Game.Has('Sugar for sugar trading')) {
            list.push({ value: 'sugarTrade', label: 'Activate sugar trade<br>(Warning: cost 1 sugar lump)', icon: [21, 17] });
        }
        list.push(
            { value: 'refreshMana', label: 'Refresh grimoire mana<br>(Warning: cost 1 sugar lump)', icon: [17, 0] },
            { value: 'refreshPantheon', label: 'Refresh pantheon swaps cooldown<br>(Warning: cost 1 sugar lump)', icon: [16, 0] },
            { value: 'harvestLump', label: 'Harvest sugar lump', icon: [29, 27] },
            { value: 'clickGolden', label: 'Click all on screen golden cookies', icon: [23, 6] }
        );
        return list;
    }

    function createSellBuyProgram() {
        return {
            key: 'sellBuy',
            name: 'Property Exchange Daemon',
            desc: 'Buy or sell buildings of a specified type.',
            icon: [11, 33],
            config: [
                {
                    id: 'mode',
                    label: 'Action',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        return [
                            { value: 'buy', label: 'Buy', icon: [32, 12] },
                            { value: 'sell', label: 'Sell', icon: [31, 8] }
                        ];
                    },
                    default: 'buy'
                },
                {
                    id: 'building',
                    label: 'Building',
                    type: 'choice',
                    display: 'iconCarousel',
                    valueType: 'number',
                    options: function () {
                        return getBuildingOptions();
                    },
                    default: function () {
                        return firstOptionValue(getBuildingOptions(), 0);
                    }
                },
                {
                    id: 'amount',
                    label: 'Quantity',
                    type: 'number',
                    display: 'digitStepper',
                    min: 0,
                    max: 9999,
                    default: 0
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var amount = parseInt(config.amount, 10);
                if (isNaN(amount)) amount = 0;
                amount = Math.max(0, Math.min(9999, amount));
                var amountLabel = amount === 0 ? '0' : Beautify(amount);
                var mode = (config.mode === 'sell') ? 'Sell' : 'Buy';
                var buildingName = findOptionLabel(getBuildingOptions(), config.building, 'Unknown building');
                return mode + ' ' + amountLabel + ' ' + buildingName;
            }
        };
    }

    function createSwapGodsProgram() {
        return {
            key: 'swapGods',
            name: 'Divine Thread Swapper',
            desc: 'Swap a Pantheon god.',
            icon: [22, 18],
            config: [
                {
                    id: 'god',
                    label: 'God',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        return getPantheonGodOptions();
                    },
                    default: function () {
                        return firstOptionValue(getPantheonGodOptions(), '');
                    }
                },
                {
                    id: 'slot',
                    label: 'Slot',
                    type: 'choice',
                    display: 'iconCarousel',
                    valueType: 'number',
                    options: function () {
                        return getPantheonSlotOptions();
                    },
                    default: 0
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var godName = findOptionLabel(getPantheonGodOptions(), config.god, 'unknown god');
                var slotIndex = parseInt(config.slot, 10);
                if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) slotIndex = 0;
                return 'Swap ' + godName + ' into the ' + getPantheonSlotLabel(slotIndex);
            }
        };
    }

    function createCastSpellProgram() {
        return {
            key: 'castSpell',
            name: 'Spellcast Process Handler',
            desc: 'Cast a spell from Grimoire.',
            icon: [22, 11],
            config: [
                {
                    id: 'spell',
                    label: 'Spell',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        return getGrimoireSpellOptions();
                    },
                    default: function () {
                        return firstOptionValue(getGrimoireSpellOptions(), '');
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var spellName = findOptionLabel(getGrimoireSpellOptions(), config.spell, 'Unknown spell');
                return 'Cast ' + spellName;
            }
        };
    }

    function createGardenProgram() {
        return {
            key: 'gardenAction',
            name: 'Garden Task Executor',
            desc: 'Automatically plant or harvest plants in the garden.',
            icon: [28, 20],
            config: [
                {
                    id: 'action',
                    label: 'Action',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        var plantIcon = buildGardenSoilIcon(0);
                        var harvestIcon = buildGardenToolIcon(0);
                        var swapSoilIcon = [11, 16, UPDATED_CUSTOM_SPRITE_URL];
                        return [
                            { value: 'plant', label: 'Plant', icon: plantIcon },
                            { value: 'harvest', label: 'Harvest', icon: harvestIcon },
                            { value: 'swapSoil', label: 'Swap Soil', icon: swapSoilIcon }
                        ];
                    },
                    default: 'plant',
                    refreshOnChange: true
                },
                {
                    id: 'target',
                    label: 'Target',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function (M, program, config) {
                        var action = config && config.action ? config.action : 'plant';
                        if (action === 'swapSoil') {
                            return getGardenSoilOptions();
                        }
                        return getGardenTargetOptions(action);
                    },
                    default: function (M, program, config) {
                        var action = config && config.action ? config.action : 'plant';
                        if (action === 'swapSoil') {
                            return firstOptionValue(getGardenSoilOptions(), '');
                        }
                        return firstOptionValue(getGardenTargetOptions('plant'), '');
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                if (config.action === 'swapSoil') {
                    var soilLabel = findOptionLabel(getGardenSoilOptions(), config.target, 'Unknown soil');
                    return 'Change soil to ' + soilLabel;
                }
                if (config.action === 'harvest' && config.target === 'allMature') {
                    return 'Harvest all mature plants';
                }
                var targetLabel = findOptionLabel(getGardenTargetOptions(config.action), config.target, 'Unknown plant');
                if (config.action === 'harvest') {
                    return 'Harvest all ' + targetLabel + ' plants';
                }
                return 'Plant ' + targetLabel + ' in all empty garden tiles';
            }
        };
    }

    function createChangeAuraProgram() {
        return {
            key: 'changeAura',
            name: 'Aura Heap Controller',
            desc: 'Switch dragon auras.',
            icon: [6, 17, UPDATED_CUSTOM_SPRITE_URL],
            config: [
                {
                    id: 'slot',
                    label: 'Slot',
                    type: 'choice',
                    display: 'iconCarousel',
                    valueType: 'number',
                    options: function () {
                        return [
                            //these are backwards from what most reasonable people would expect, I refuse to catch grief from it though
                            { value: 0, label: 'Primary slot', icon: [0, 10] },
                            { value: 1, label: 'Secondary slot', icon: [1, 10] }
                        ];
                    },
                    default: 0
                },
                {
                    id: 'aura',
                    label: 'Aura',
                    type: 'choice',
                    display: 'iconCarousel',
                    valueType: 'number',
                    options: function () {
                        return getDragonAuraOptions();
                    },
                    default: function () {
                        return firstOptionValue(getDragonAuraOptions(), 0);
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var auraName = getDragonAuraLabel(config.aura);
                var slotIndex = parseInt(config.slot, 10);
                if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 1) slotIndex = 0;
                var slotLabel = slotIndex === 0 ? 'primary slot' : 'secondary slot';
                return 'Set ' + auraName + ' aura on the ' + slotLabel;
            }
        };
    }

    function createAsyncSleepThreadProgram() {
        return {
            key: 'asyncSleepThread',
            name: 'Async Sleep Thread',
            desc: 'Pause the execution queue for a specified duration.',
            icon: [23, 11],
            config: [
                {
                    id: 'seconds',
                    label: 'Seconds',
                    type: 'number',
                    display: 'digitStepper',
                    min: 0,
                    max: 99,
                    digits: 2,
                    default: 10
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var seconds = parseInt(config.seconds, 10);
                if (isNaN(seconds)) seconds = 0;
                seconds = Math.max(0, Math.min(99, seconds));
                if (seconds === 1) return 'Wait for 1 second';
                return 'Wait for ' + Beautify(seconds) + ' seconds';
            }
        };
    }

    function createClickProgram() {
        return {
            key: 'clickCookie',
            name: 'Click Pulse Generator',
            desc: 'Perform clicks on the big cookie.',
            icon: [1, 6],
            config: [],
            summarizeConfig: function () {
                var level = 0;
                if (M.parent && typeof M.parent.level === 'number') level = M.parent.level;
                var clicks = Math.max(0, Math.floor(level)) * 5;
                return 'Click the cookie ' + clicks + ' times';
            }
        };
    }

    function createLoanProgram() {
        return {
            key: 'activateLoans',
            name: 'Credit Cycle Routine',
            desc: 'Take out a loan from the stock market minigame.',
            icon: [1, 33],
            config: [
                {
                    id: 'loan',
                    label: 'Loan',
                    type: 'choice',
                    display: 'iconCarousel',
                    valueType: 'number',
                    options: function () {
                        return getLoanOptions();
                    },
                    default: function () {
                        return firstOptionValue(getLoanOptions(), 0);
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var loanLabel = findOptionLabel(getLoanOptions(), config.loan, 'Loan 1');
                return 'Activate ' + loanLabel;
            }
        };
    }

    function createSwitchSeasonProgram() {
        return {
            key: 'switchSeason',
            name: 'Toggle Switcher Module',
            desc: 'Toggle a switch from one state to another.',
            icon: [18, 9],
            config: [
                {
                    id: 'target',
                    label: 'Target',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        return getSwitchTargetOptions();
                    },
                    default: function () {
                        return firstOptionValue(getSwitchTargetOptions(), 'golden');
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var targetValue = config.target || firstOptionValue(getSwitchTargetOptions(), 'golden');
                if (targetValue.indexOf('season:') === 0) {
                    var seasonKey = targetValue.split(':')[1] || 'valentines';
                    var seasonName = findOptionLabel(getSwitchTargetOptions(), targetValue, "Valentine's Day season");
                    return 'Switch to ' + seasonName;
                }
                if (targetValue === 'golden') return 'Toggle the golden switch';
                if (targetValue === 'veil') return 'Toggle the shimmering veil';
                if (targetValue === 'covenant') return 'Pledge or revoke the elder covenant';
                if (targetValue === 'pledge') return 'Activate the elder pledge';
                return 'Toggle the switch';
            }
        };
    }

    function createSweetRuntimeSwizzleProgram() {
        return {
            key: 'sweetRuntimeSwizzle',
            name: 'Sweet Runtime Swizzler',
            desc: 'Execute sugar-fueled runtime actions.',
            icon: [29, 27],
            config: [
                {
                    id: 'action',
                    label: 'Action',
                    type: 'choice',
                    display: 'iconCarousel',
                    options: function () {
                        return getSweetRuntimeOptions();
                    },
                    default: function () {
                        return firstOptionValue(getSweetRuntimeOptions(), 'sugarFrenzy');
                    }
                }
            ],
            summarizeConfig: function (config) {
                config = config || {};
                var label = findOptionLabel(getSweetRuntimeOptions(), config.action, 'Sugar frenzy');
                return 'Execute ' + label;
            }
        };
    }

    function buildProgramDefinitions() {
        return [
            createSellBuyProgram(),
            createSwapGodsProgram(),
            createCastSpellProgram(),
            createGardenProgram(),
            createChangeAuraProgram(),
            createAsyncSleepThreadProgram(),
            createClickProgram(),
            createLoanProgram(),
            createSwitchSeasonProgram(),
            createSweetRuntimeSwizzleProgram()
        ];
    }

    var PROGRAM_DATA = buildProgramDefinitions();

    function setSlot(slotIndex, programId, config) {
        M.slot[slotIndex] = programId;
        M.slotSettings[slotIndex] = config ? M.cloneConfig(config) : null;
    }

    function clearSlot(slotIndex) {
        setSlot(slotIndex, -1, null);
    }

    M.resolveFieldOptions = function (field, program, config) {
        config = config || {};
        if (!field || field.type !== 'choice') return [];
        if (typeof field.options === 'function') {
            try {
                return field.options.call(field, M, program, config) || [];
            } catch (err) {
                return [];
            }
        }
        return field.options || [];
    };

    M.getFieldFallbackValue = function (field, program, config) {
        if (!field) return null;
        if (field.type === 'choice') {
            var options = M.resolveFieldOptions(field, program, config);
            return options.length ? options[0].value : '';
        }
        if (field.type === 'number') {
            if (field.default !== undefined) return field.default;
            if (field.min !== undefined) return field.min;
            return 0;
        }
        return field.default !== undefined ? field.default : null;
    };

    M.buildDefaultConfig = function (program) {
        var config = {};
        if (!program || !program.config) return config;
        for (var i = 0; i < program.config.length; i++) {
            var field = program.config[i];
            if (!field) continue;
            var value;
            if (typeof field.default === 'function') {
                value = field.default.call(field, M, program, config);
            } else {
                value = field.default;
            }
            if (value === undefined || value === null) {
                value = M.getFieldFallbackValue(field, program, config);
            }
            config[field.id] = value;
        }
        return config;
    };

    M.cloneConfig = function (config) {
        if (!config) return null;
        var copy = {};
        for (var key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                var value = config[key];
                if (value && typeof value === 'object') copy[key] = JSON.parse(JSON.stringify(value));
                else copy[key] = value;
            }
        }
        return copy;
    };

    M.normalizeConfig = function (program, existingConfig, clone) {
        if (!program || !program.config) return existingConfig || {};
        var config = existingConfig || {};
        if (clone || !config) config = M.cloneConfig(config) || {};
        for (var i = 0; i < program.config.length; i++) {
            var field = program.config[i];
            if (!field) continue;
            if (field.shouldRender && field.shouldRender(M, program, config) === false) {
                if (config.hasOwnProperty(field.id)) delete config[field.id];
                continue;
            }
            var value = config.hasOwnProperty(field.id) ? config[field.id] : undefined;
            if (value === undefined || value === null) {
                if (typeof field.default === 'function') value = field.default.call(field, M, program, config);
                else value = field.default;
            }
            if (value === undefined || value === null) {
                value = M.getFieldFallbackValue(field, program, config);
            }
            if (field.valueType === 'number' && value !== '' && value !== null && value !== undefined) {
                var parsed = parseInt(value, 10);
                if (!isNaN(parsed)) value = parsed;
            }
            if (field.type === 'number') {
                value = M.sanitizeNumberValue(value, field);
            }
            if (field.type === 'choice') {
                var options = M.resolveFieldOptions(field, program, config);
                var match = false;
                for (var oi = 0; oi < options.length; oi++) {
                    if ('' + options[oi].value === '' + value) {
                        match = true;
                        value = options[oi].value;
                        break;
                    }
                }
                if (!match) {
                    if (options.length) value = options[0].value;
                    else value = '';
                }
                if (field.valueType === 'number' && value !== '' && value !== null && value !== undefined) {
                    var parsedChoice = parseInt(value, 10);
                    if (!isNaN(parsedChoice)) value = parsedChoice;
                }
            }
            config[field.id] = value;
        }
        if (program.key === 'switchSeason') {
            var legacySwitch = existingConfig && existingConfig.switch;
            var legacySeason = existingConfig && existingConfig.season;
            if ((config.target === undefined || config.target === null) && legacySwitch) {
                if (legacySwitch === 'seasons') {
                    config.target = 'season:' + (legacySeason || 'valentines');
                } else {
                    config.target = legacySwitch;
                }
            }
            delete config.switch;
            delete config.season;
        }
        return config;
    };

    M.getProgramField = function (program, fieldId) {
        if (!program || !program.config) return null;
        for (var i = 0; i < program.config.length; i++) {
            if (program.config[i].id === fieldId) return program.config[i];
        }
        return null;
    };

    M.getProgramSummary = function (program, config) {
        if (!program || !program.summarizeConfig) return '';
        try {
            var normalized = M.normalizeConfig(program, config || {}, true);
            return program.summarizeConfig.call(program, normalized || {});
        } catch (err) {
        }
        return '';
    };

    M.sanitizeNumberValue = function (value, field) {
        var num = parseInt(value, 10);
        if (isNaN(num)) num = field && field.min !== undefined ? field.min : 0;
        if (field && field.min !== undefined && num < field.min) num = field.min;
        if (field && field.max !== undefined && num > field.max) num = field.max;
        return num;
    };

    M.ensureProgramConfig = function (program) {
        if (!program) return {};
        var current = M.programConfigs[program.id];
        current = M.normalizeConfig(program, current);
        M.programConfigs[program.id] = current;
        return current;
    };

    M.programHandlers = {};
    M.programConfigs = [];
    M.programs = {};
    M.programsById = [];
    for (var i = 0; i < PROGRAM_DATA.length; i++) {
        var data = PROGRAM_DATA[i];
        var program = {
            id: i,
            key: data.key,
            name: data.name,
            desc: data.desc,
            icon: data.icon,
            config: data.config || [],
            summarizeConfig: data.summarizeConfig
        };
        M.programs[data.key] = program;
        M.programsById[i] = program;
        M.programConfigs[i] = M.normalizeConfig(program, M.buildDefaultConfig(program));
    }

    M.registerProgramHandler = function (key, handler) {
        if (!key) return;
        if (typeof handler !== 'function') return;
        M.programHandlers[key] = handler;
    };

    M.getProgramHandler = function (program) {
        if (!program || !program.key) return null;
        return M.programHandlers[program.key] || null;
    };

    M.getSlotConfig = function (slotIndex, program) {
        if (!program) return {};
        var stored = M.slotSettings[slotIndex];
        var baseConfig;
        if (stored) {
            baseConfig = M.cloneConfig(stored);
        } else {
            baseConfig = M.cloneConfig(M.ensureProgramConfig(program));
        }
        return M.normalizeConfig(program, baseConfig, true);
    };

    M.persistSlotConfig = function (slotIndex, program, config) {
        if (!program) return;
        var normalized = M.normalizeConfig(program, config || {}, true);
        M.slotSettings[slotIndex] = normalized ? M.cloneConfig(normalized) : null;
    };

    M.executeProgram = function (program, slotIndex) {
        if (!program) return err('Invalid program.');
        var handler = M.getProgramHandler(program);
        var config = M.getSlotConfig(slotIndex, program);
        if (!handler) {
            M.persistSlotConfig(slotIndex, program, config);
            return err(program.name + ': no handler defined.');
        }
        var result;
        try {
            result = handler.call(M, config, { slotIndex: slotIndex, program: program });
        } catch (e) {
            result = err(program.name + ': error while executing.');
        }
        if (!result || typeof result !== 'object') {
            result = err(program.name + ': no result.');
        }
        M.persistSlotConfig(slotIndex, program, config);
        return result;
    };

    function getBuildingDisplayName(building, count) {
        if (!building) return 'building';
        if (count === 1) return building.single || building.name;
        return building.plural || (building.name ? building.name + 's' : 'buildings');
    }

    function resolvePantheonGod(minigame, value) {
        return resolveMinigameItem(minigame, value, 'gods', 'godsById');
    }

    function resolveGrimoireSpell(minigame, value) {
        return resolveMinigameItem(minigame, value, 'spells', 'spellsById');
    }

    function getHighestOwnedBuilding() {
        if (!Game || !Game.ObjectsById) return null;
        var highest = null;
        for (var i = 0; i < Game.ObjectsById.length; i++) {
            var building = Game.ObjectsById[i];
            if (building && building.amount > 0) highest = building;
        }
        return highest;
    }

    function placePantheonGodElement(temple, god) {
        if (!god) return;
        var godDiv = typeof l === 'function' ? l('templeGod' + god.id) : null;
        if (!godDiv || !godDiv.parentNode) return;

        if (god.slot === -1) {
            var placeholder = typeof l === 'function' ? l('templeGodPlaceholder' + god.id) : null;
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(godDiv, placeholder);
                placeholder.style.display = 'none';
            }
        } else {
            var slotDiv = typeof l === 'function' ? l('templeSlot' + god.slot) : null;
            if (slotDiv) {
                slotDiv.appendChild(godDiv);
                var placeholderNode = typeof l === 'function' ? l('templeGodPlaceholder' + god.id) : null;
                if (placeholderNode) placeholderNode.style.display = 'none';
            }
        }
    }

    M.registerProgramHandler('sellBuy', function (config) {
        config = config || {};
        var mode = (config.mode === 'sell') ? 'sell' : 'buy';
        var rawAmount = parseInt(config.amount, 10);
        if (isNaN(rawAmount) || rawAmount <= 0) {
            return {
                success: true,
                message: mode === 'sell' ? 'No buildings sold.' : 'No buildings purchased.'
            };
        }
        var amount = Math.min(9999, Math.max(0, rawAmount));
        var buildingId = parseInt(config.building, 10);
        var building = (typeof buildingId === 'number' && !isNaN(buildingId) && Game && Game.ObjectsById) ? Game.ObjectsById[buildingId] : null;
        if (!building) return err('Building is not available.');

        var changed = 0;
        var cookiesBefore = Game.cookies;
        var prevBuyBulk;
        var prevBuyMode;

        if (mode === 'buy') {
            if (!building.buy || typeof building.buy !== 'function') {
                return err('Cannot buy ' + (building.dname || building.name || 'building') + '.');
            }
            prevBuyBulk = Game.buyBulk;
            prevBuyMode = Game.buyMode;
            Game.buyBulk = 1;
            Game.buyMode = 1;
            try {
                for (var i = 0; i < amount; i++) {
                    var ownedBefore = building.amount;
                    building.buy(1);
                    var delta = building.amount - ownedBefore;
                    if (delta <= 0) break;
                    changed += delta;
                    if (changed >= amount) break;
                }
            } finally {
                Game.buyBulk = prevBuyBulk;
                Game.buyMode = prevBuyMode;
            }
        } else {
            if (!building.sell || typeof building.sell !== 'function') {
                return err('Cannot sell ' + (building.dname || building.name || 'building') + '.');
            }
            for (var j = 0; j < amount; j++) {
                if (building.amount <= 0) break;
                var before = building.amount;
                building.sell(1);
                var sold = before - building.amount;
                if (sold <= 0) break;
                changed += sold;
                if (changed >= amount) break;
            }
        }

        var cookiesDelta = Game.cookies - cookiesBefore;
        var displayName = getBuildingDisplayName(building, changed || 1);
        if (!changed) return err(mode === 'sell' ? 'No ' + displayName.toLowerCase() + ' sold.' : 'Unable to buy ' + displayName.toLowerCase() + '.');
        var actionWord = mode === 'sell' ? 'Sold' : 'Bought';
        var summary = actionWord + ' ' + Beautify(changed) + ' ' + displayName;
        if (mode === 'buy' && cookiesDelta < 0) summary += ' (spent ' + Beautify(-cookiesDelta) + ' cookies)';
        else if (mode === 'sell' && cookiesDelta > 0) summary += ' (refunded ' + Beautify(cookiesDelta) + ' cookies)';
        return ok(summary);
    });

    M.registerProgramHandler('swapGods', function (config) {
        config = config || {};
        var temple = getMinigame('Temple');
        if (!temple) return err('Pantheon unavailable.');
        var slotIndex = parseInt(config.slot, 10);
        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) return err('Invalid Pantheon slot.');
        var god = resolvePantheonGod(temple, config.god);
        if (!god) return err('Unknown god.');

        var currentSlot = (god.slot !== undefined) ? god.slot : -1;
        var slotLabel = getPantheonSlotLabel(slotIndex);
        if (currentSlot === slotIndex) return ok(god.name + ' remains in the ' + slotLabel + '.');
        if (temple.swaps <= 0) return err('No worship swaps available.');
        if (typeof temple.slotGod !== 'function' || typeof temple.useSwap !== 'function') return err('Pantheon controls unavailable.');

        var previousGodId = temple.slot && temple.slot[slotIndex] !== undefined ? temple.slot[slotIndex] : -1;
        var previousGod = (previousGodId !== -1 && temple.godsById) ? temple.godsById[previousGodId] : null;

        var result = temple.slotGod(god, slotIndex);
        if (result === false) return ok(god.name + ' remains in the ' + slotLabel + '.');

        temple.useSwap(1);
        temple.lastSwapT = 0;
        if (temple.toRedraw !== undefined) {
            temple.toRedraw = Math.max(temple.toRedraw || 0, 2);
        }

        if (previousGod && previousGod !== god) {
            placePantheonGodElement(temple, previousGod);
        }
        placePantheonGodElement(temple, god);

        var message = 'Slotted ' + god.name + ' into the ' + slotLabel + '.';
        if (previousGod && previousGod !== god) {
            var destinationLabel;
            if (previousGod.slot === -1) {
                destinationLabel = 'back to the roster';
            } else {
                destinationLabel = 'to the ' + getPantheonSlotLabel(previousGod.slot);
            }
            message += ' ' + previousGod.name + ' moved ' + destinationLabel + '.';
        }
        return ok(message);
    });

    M.registerProgramHandler('castSpell', function (config) {
        config = config || {};
        var grimoire = getMinigame('Wizard tower');
        if (!grimoire) return err('Grimoire unavailable.');
        var spell = resolveGrimoireSpell(grimoire, config.spell);
        if (!spell) return err('Unknown spell.');
        var cost = 0;
        if (typeof grimoire.getSpellCost === 'function') {
            cost = grimoire.getSpellCost(spell);
        } else if (spell.costMin !== undefined) {
            cost = spell.costMin;
        }
        cost = Math.floor(Math.max(0, cost || 0));

        if (grimoire.magic !== undefined && grimoire.magic < cost) return err(spell.name + ': not enough magic (' + Beautify(grimoire.magic) + '/' + Beautify(cost) + ').');
        if (typeof grimoire.castSpell !== 'function') return err('Cannot cast ' + spell.name + '.');
        var result = grimoire.castSpell(spell);
        return result ? ok('Cast ' + spell.name + '.') : err(spell.name + ' fizzled.');
    });

    function performGardenHarvest(garden, options) {
        options = options || {};
        var harvested = 0;
        for (var pass = 0; pass < 2; pass++) {
            for (var y = 0; y < 6; y++) {
                for (var x = 0; x < 6; x++) {
                    if (!garden.plot[y] || !garden.plot[y][x] || garden.plot[y][x][0] < 1) continue;
                    var tile = garden.plot[y][x];
                    var plant = garden.plantsById ? garden.plantsById[tile[0] - 1] : null;
                    if (!plant) continue;
                    if (options.type && plant !== options.type) continue;
                    if (options.mortal && plant.immortal) continue;
                    if (options.mature && tile[1] < plant.mature) continue;
                    if (garden.harvest(x, y, 1)) harvested++;
                }
            }
        }
        if (harvested > 0 && typeof PlaySound === 'function') {
            setTimeout(function () { PlaySound('snd/harvest1.mp3', 1, 0.2); }, 50);
            if (harvested > 2) setTimeout(function () { PlaySound('snd/harvest2.mp3', 1, 0.2); }, 150);
            if (harvested > 6) setTimeout(function () { PlaySound('snd/harvest3.mp3', 1, 0.2); }, 250);
        }
        return harvested;
    }

    M.registerProgramHandler('gardenAction', function (config) {
        config = config || {};
        var garden = getMinigame('Farm');
        if (!garden) return err('Garden unavailable.');
        var action = config.action || 'plant';
        if (action === 'plant') {
            var seed = resolveGardenPlant(garden, config.target);
            if (!seed || typeof seed.id === 'undefined') return err('Unknown seed selected.');
            if (!seed.unlocked) return err(seed.name + ' seed is not unlocked.');
            if (seed.plantable === false && !Game.sesame) return err(seed.name + ' cannot be planted.');
            if (typeof garden.canPlant === 'function' && !garden.canPlant(seed)) return err('Cannot afford to plant ' + seed.name + '.');
            var planted = 0;
            var insufficient = false;
            var emptyTiles = 0;
            for (var y = 0; y < 6; y++) {
                for (var x = 0; x < 6; x++) {
                    if (!garden.isTileUnlocked || !garden.isTileUnlocked(x, y)) continue;
                    if (!garden.plot[y] || !garden.plot[y][x]) continue;
                    if (garden.plot[y][x][0] !== 0) continue;
                    emptyTiles++;
                    if (typeof garden.canPlant === 'function' && !garden.canPlant(seed)) {
                        insufficient = true;
                        break;
                    }
                    if (typeof garden.useTool === 'function') {
                        if (garden.useTool(seed.id, x, y)) planted++;
                        else if (typeof garden.canPlant === 'function' && !garden.canPlant(seed)) {
                            insufficient = true;
                            break;
                        }
                    }
                }
                if (insufficient) break;
            }
            if (planted > 0) {
                if (typeof garden.computeBoostPlot === 'function') garden.computeBoostPlot();
                if (typeof garden.computeEffs === 'function') garden.computeEffs();
                else garden.toCompute = true;
                return ok('Planted ' + Beautify(planted) + ' ' + seed.name + (planted === 1 ? '' : 's') + '.');
            }
            if (!emptyTiles) return err('No empty garden tiles available.');
            if (insufficient) return err('Cannot afford to plant more ' + seed.name + '.');
            return err('Failed to plant ' + seed.name + '.');
        }

        if (action === 'harvest') {
            var target = config.target || 'allMature';
            var harvested = 0;
            var messageLabel = '';
            if (target === 'allMature') {
                harvested = performGardenHarvest(garden, { mature: true, mortal: true });
                messageLabel = 'mature plants';
            } else {
                var targetPlant = resolveGardenPlant(garden, target);
                if (!targetPlant) return err('Unknown plant to harvest.');
                harvested = performGardenHarvest(garden, { type: targetPlant });
                messageLabel = targetPlant.name;
            }
            if (harvested > 0) {
                if (typeof garden.computeBoostPlot === 'function') garden.computeBoostPlot();
                if (typeof garden.computeEffs === 'function') garden.computeEffs();
                else garden.toCompute = true;
                return ok('Harvested ' + Beautify(harvested) + ' ' + messageLabel + (harvested === 1 ? '' : 's') + '.');
            }
            return err('No plants matched the harvest parameters.');
        }

        if (action === 'swapSoil') {
            var soil = resolveGardenSoil(garden, config.target);
            if (!soil) return err('Unknown soil selection.');
            if (garden.freeze) return err('Garden is frozen; soil cannot be changed.');
            if (garden.soil === soil.id) return ok(soil.name + ' is already active.');
            if (garden.nextSoil && garden.nextSoil > Date.now()) return err('Soil change is on cooldown.');
            if (garden.parent && garden.parent.amount < (soil.req || 0)) return err('Not enough farms to use ' + soil.name + '.');
            garden.nextSoil = Date.now() + (Game.Has('Turbo-charged soil') ? 1 : (1000 * 60 * 10));
            garden.toCompute = true;
            garden.soil = soil.id;
            if (typeof garden.computeStepT === 'function') garden.computeStepT();
            if (typeof PlaySound === 'function') PlaySound('snd/toneTick.mp3');
            if (typeof l === 'function' && garden.soils) {
                for (var key in garden.soils) {
                    if (!garden.soils.hasOwnProperty(key)) continue;
                    var entry = garden.soils[key];
                    var el = l('gardenSoil-' + entry.id);
                    if (el) {
                        if (entry.id === garden.soil) el.classList.add('on');
                        else el.classList.remove('on');
                    }
                }
            }
            return ok('Changed garden soil type to ' + soil.name + '.');
        }
        return err('Unknown garden action.');
    });

    function formatPrice(price) {
        return Beautify(Math.max(0, Math.round(price || 0)));
    }

    function haveSugarLumps(count) {
        return (Game.lumps || 0) >= count;
    }

    function spendSugarLumps(count) {
        Game.lumps = Math.max(0, (Game.lumps || 0) - count);
        Game.recalculateGains = 1;
    }

    function err(msg) {
        return { success: false, message: msg };
    }

    function ok(msg) {
        return { success: true, message: msg };
    }

    function toggleSwitch(baseName, displayName) {
        if (!Game.Has(baseName)) return err(displayName + ' is not unlocked.');
        var offUpgrade = Game.Upgrades[baseName + ' [off]'];
        var onUpgrade = Game.Upgrades[baseName + ' [on]'];
        var candidate = null;
        var costMessage = '';
        if (offUpgrade && offUpgrade.unlocked && !offUpgrade.bought) {
            if (!offUpgrade.canBuy()) costMessage = 'Need ' + formatPrice(offUpgrade.getPrice()) + ' cookies to enable the ' + displayName.toLowerCase() + '.';
            else candidate = offUpgrade;
        } else if (onUpgrade && onUpgrade.unlocked && !onUpgrade.bought) {
            if (!onUpgrade.canBuy()) costMessage = 'Need ' + formatPrice(onUpgrade.getPrice()) + ' cookies to disable the ' + displayName.toLowerCase() + '.';
            else candidate = onUpgrade;
        }
        if (!candidate) return err(costMessage || displayName + ' cannot be toggled.');
        if (typeof candidate.click === 'function') candidate.click();
        else candidate.buy();
        var nowOn = Game.Has(baseName + ' [off]');
        return ok(nowOn ? displayName + ' enabled.' : displayName + ' disabled.');
    }

    function toggleGoldenSwitch() {
        return toggleSwitch('Golden switch', 'Golden switch');
    }

    function toggleShimmeringVeil() {
        return toggleSwitch('Shimmering veil', 'Shimmering veil');
    }

    function toggleElderCovenant() {
        var covenant = Game.Upgrades['Elder Covenant'];
        var revoke = Game.Upgrades['Revoke Elder Covenant'];
        if (!covenant) return err('Elder Covenant upgrade is unavailable.');
        if (Game.Has('Elder Covenant')) {
            if (!revoke) return err('Revoke Elder Covenant upgrade is unavailable.');
            if (!revoke.unlocked) return err('Revoke Elder Covenant is not available right now.');
            if (revoke.bought) return err('Elder Covenant is already revoked.');
            if (!revoke.canBuy()) return err('Need ' + formatPrice(revoke.getPrice()) + ' cookies to revoke the Elder Covenant.');
            if (typeof revoke.click === 'function') revoke.click();
            else revoke.buy();
            return ok('Revoked the Elder Covenant.');
        } else {
            if (!covenant.unlocked) return err('Elder Covenant is not yet available.');
            if (covenant.bought) return err('Elder Covenant is already enacted.');
            if (!covenant.canBuy()) return err('Need ' + formatPrice(covenant.getPrice()) + ' cookies to enact the Elder Covenant.');
            if (typeof covenant.click === 'function') covenant.click();
            else covenant.buy();
            return Game.Has('Elder Covenant') ? ok('Enacted the Elder Covenant.') : err('Failed to enact the Elder Covenant.');
        }
    }

    function activateElderPledge() {
        var pledge = Game.Upgrades['Elder Pledge'];
        if (!pledge) return err('Elder Pledge upgrade is unavailable.');
        if (!pledge.unlocked) return err('Elder Pledge cannot be performed right now.');
        if (pledge.bought) {
            if (Game.pledgeT > 0) return err('An Elder Pledge is already active.');
            return err('Elder Pledge cannot be performed at the moment.');
        }
        if (!pledge.canBuy()) return err('Need ' + formatPrice(pledge.getPrice()) + ' cookies to perform the Elder Pledge.');
        if (typeof pledge.click === 'function') pledge.click();
        else pledge.buy();
        var remaining = Game.sayTime(Game.pledgeT, -1);
        return ok('Performed the Elder Pledge' + (remaining ? ' (Time remaining: ' + remaining + ')' : '.'));
    }

    function switchSeasonTo(seasonKey) {
        if (!Game.seasons || !Game.seasons[seasonKey]) return err('Unknown season.');
        if (Game.season === seasonKey) return ok(Game.seasons[seasonKey].name + ' is already active.');
        var info = Game.seasons[seasonKey];
        var upgrade = Game.Upgrades[info.trigger];
        if (!upgrade) return err('Season trigger upgrade is unavailable.');
        if (!upgrade.unlocked) return err(info.name + ' cannot be triggered right now.');
        if (upgrade.bought) return err(info.name + ' is already in effect.');
        if (!upgrade.canBuy()) return err('Need ' + formatPrice(upgrade.getPrice()) + ' cookies to trigger ' + info.name + '.');
        if (typeof upgrade.click === 'function') upgrade.click();
        else upgrade.buy();
        return Game.season === seasonKey ? ok('Triggered ' + info.name + '.') : err('Failed to switch to ' + info.name + '.');
    }

    M.registerProgramHandler('switchSeason', function (config) {
        config = config || {};
        var target = config.target || '';
        if (target === 'golden') return toggleGoldenSwitch();
        if (target === 'veil') return toggleShimmeringVeil();
        if (target === 'covenant') return toggleElderCovenant();
        if (target === 'pledge') return activateElderPledge();
        if (target.indexOf('season:') === 0) {
            var key = target.split(':')[1] || '';
            var map = { valentines: 'valentines', business: 'fools', easter: 'easter', halloween: 'halloween', christmas: 'christmas' };
            return switchSeasonTo(map[key] || key);
        }
        return err('Unknown switch action.');
    });

    function activateSugarFrenzy() {
        var upgrade = Game.Upgrades['Sugar frenzy'];
        if (!upgrade) return err('Sugar frenzy is unavailable.');
        if (!upgrade.unlocked) return err('Sugar frenzy is not unlocked yet.');

        if (upgrade._sugarFrenzyII) {
            var cooldown = 24 * 60 * 60 * 1000;
            var lastUse = Game.sugarFrenzyLastUse || 0;
            var elapsed = Date.now() - lastUse;
            if (elapsed < cooldown) {
                var remainingMs = cooldown - elapsed;
                var remainingText = '';
                if (typeof Game.sayTime === 'function' && typeof Game.fps === 'number') {
                    remainingText = Game.sayTime((remainingMs / 1000 + 1) * Game.fps, -1);
                } else {
                    remainingText = Beautify(Math.ceil(remainingMs / 1000)) + 's';
                }
                return err('Sugar frenzy is cooling down. Usable again in ' + remainingText + '.');
            }

            var price = getSugarFrenzyLumpCost();
            if (!haveSugarLumps(price)) return err('Not enough sugar lumps to activate Sugar frenzy.');
            Game.sugarFrenzyLastUse = Date.now();
            spendSugarLumps(price);
            Game.sugarFrenzyPrice = (parseInt(price, 10) || 1) + 1;
            Game.gainBuff('sugar frenzy', 60 * 60, 3);
            Game.Notify(loc("Sugar frenzy!"), loc("CpS x%1 for 1 hour!", 3), [29, 14]);
            return ok('Sugar frenzy activated.');
        }

        if (upgrade.bought) return err('Sugar frenzy has already been used this ascension.');
        var lumpCost = getSugarFrenzyLumpCost();
        if (!haveSugarLumps(lumpCost)) return err('Not enough sugar lumps to activate Sugar frenzy.');
        spendSugarLumps(lumpCost);
        upgrade.buy(1);
        Game.gainBuff('sugar frenzy', 60 * 60, 3);
        Game.Notify(loc("Sugar frenzy!"), loc("CpS x%1 for 1 hour!", 3), [29, 14]);
        return ok('Sugar frenzy activated.');
    }

    function activateSugarTrade() {
        var upgrade = Game.Upgrades ? Game.Upgrades['Sugar trade'] : null;
        if (!upgrade) return err('Sugar trade is unavailable.');
        if (!upgrade.unlocked) return err('Sugar trade is not unlocked yet.');
        if (upgrade.bought) return err('Sugar trade has already been used this ascension.');
        if (!haveSugarLumps(1)) return err('Not enough sugar lumps to activate Sugar trade.');

        // Bypass the in-game confirmation prompt by applying the effect directly.
        spendSugarLumps(1);
        upgrade.buy(1);
        if (typeof Game.shimmer === 'function') {
            new Game.shimmer('golden');
        } else if (typeof Game.shimmerTypes !== 'undefined' && Game.shimmerTypes && Game.shimmerTypes.golden) {
            new Game.shimmer('golden');
        }
        Game.Notify("Sugar trade", "Summoned a golden cookie.", [21, 17]);
        return ok('Sugar trade activated.');
    }

    function refreshGrimoireMana() {
        var grimoire = getMinigame('Wizard tower');
        if (!grimoire) return err('Grimoire unavailable.');
        if (grimoire.magic >= grimoire.magicM) return err('Mana already full.');
        if (!Game.canRefillLump()) return err('Grimoire lump refill is on cooldown.');
        if (!haveSugarLumps(1)) return err('Not enough sugar lumps to refill Grimoire.');
        spendSugarLumps(1);
        if (!Game.sesame) Game.lumpRefill = Game.getLumpRefillMax();
        grimoire.magic = Math.min(grimoire.magic + 100, grimoire.magicM);
        if (typeof PlaySound === 'function') PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
        return ok('Grimoire mana refilled.');
    }

    function refreshPantheonSwaps() {
        var pantheon = getMinigame('Temple');
        if (!pantheon) return err('Pantheon unavailable.');
        if (pantheon.swaps >= 3) return err('Worship swaps are already full.');
        if (!Game.canRefillLump()) return err('Sugar lump refill is on cooldown.');
        if (!haveSugarLumps(1)) return err('Not enough sugar lumps.');
        spendSugarLumps(1);
        if (!Game.sesame) Game.lumpRefill = Game.getLumpRefillMax();
        pantheon.swaps = 3;
        pantheon.swapT = Date.now();
        pantheon.toRedraw = Math.max(pantheon.toRedraw || 0, 2);
        if (typeof PlaySound === 'function') PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
        return ok('Pantheon swaps refreshed.');
    }

    function harvestSugarLump() {
        if (!Game.canLumps()) return err('Sugar lumps are not available yet.');
        var age = Date.now() - Game.lumpT;
        if (age < Game.lumpMatureAge) {
            var remaining = Math.max(0, Game.lumpMatureAge - age);
            return err('Sugar lump is not ready to harvest. Remaining time: ' + Game.sayTime(Math.ceil(remaining / 1000) * Game.fps, -1) + '.');
        }
        var before = Game.lumps;
        var warningMsg = '';
        if (age < Game.lumpRipeAge) {
            var remaining = Math.max(0, Game.lumpRipeAge - age);
            warningMsg = ' (Warning: still needs ' + Game.sayTime(Math.ceil(remaining / 1000) * Game.fps, -1) + ', 50% failure to harvest chance)';
        }
        Game.clickLump();
        var diff = (Game.lumps || 0) - before;
        if (diff > 0) return ok('Harvested ' + Beautify(diff) + ' sugar lump' + (diff === 1 ? '' : 's') + '.');
        return err('Sugar lump harvest failed' + (age < Game.lumpRipeAge ? ' (50% failure to harvest chance when not fully ripe)' : '') + '.');
    }

    function clickAllGoldenCookies() {
        if (!Game.shimmers || !Game.shimmers.length) return err('No golden cookies were found to click.');
        var popped = 0;
        var snapshot = Game.shimmers.slice();
        for (var i = 0; i < snapshot.length; i++) {
            var shimmer = snapshot[i];
            if (shimmer && shimmer.type === 'golden' && typeof shimmer.pop === 'function') {
                //This prevents the function from harvesting cookie storm drops outside of the spell effect ones, but it can be triggered after the buff is over and pop them all at once, its an edge case I dont feel like solving right now.
                if ((Game.hasBuff && Game.hasBuff('Cookie storm')) && shimmer.force === 'cookie storm drop') continue;
                if (typeof shimmer.x === 'number' && typeof shimmer.y === 'number') {
                    Game.mouseX = shimmer.x;
                    Game.mouseY = shimmer.y;
                    Game.mouseMoved = 1;
                }
                shimmer.pop();
                popped++;
            }
        }
        return popped > 0 ? ok('Clicked ' + Beautify(popped) + ' golden cookie' + (popped === 1 ? '' : 's') + '.') : err('No golden cookies were found to click.');
    }

    M.registerProgramHandler('sweetRuntimeSwizzle', function (config) {
        config = config || {};
        var action = config.action || 'sugarFrenzy';
        if (action === 'sugarFrenzy') return activateSugarFrenzy();
        if (action === 'sugarTrade') return activateSugarTrade();
        if (action === 'refreshMana') return refreshGrimoireMana();
        if (action === 'refreshPantheon') return refreshPantheonSwaps();
        if (action === 'harvestLump') return harvestSugarLump();
        if (action === 'clickGolden') return clickAllGoldenCookies();
        return err('Unknown runtime action.');
    });

    M.registerProgramHandler('changeAura', function (config) {
        config = config || {};
        if (!Game || !Game.dragonAuras) return err('Dragon mechanics unavailable.');
        var slot = parseInt(config.slot, 10);
        if (isNaN(slot) || (slot !== 0 && slot !== 1)) return err('Invalid dragon aura slot.');
        var dragonLevel = Game.dragonLevel || 0;
        if (slot === 0 && dragonLevel < 5) return err('Primary aura slot not unlocked yet.');
        if (slot === 1 && dragonLevel < 27) return err('Secondary aura slot not unlocked yet.');
        var auraId = parseInt(config.aura, 10);
        if (isNaN(auraId)) auraId = 0;
        var auraData = Game.dragonAuras[auraId];
        if (!auraData) return err('Unknown dragon aura.');
        if (dragonLevel < auraId + 4) return err(auraData.dname + ' is not unlocked yet.');
        var currentAura = slot === 0 ? Game.dragonAura : Game.dragonAura2;
        var otherAura = slot === 0 ? Game.dragonAura2 : Game.dragonAura;
        if (auraId !== 0 && auraId === otherAura) {
            var otherLabel = slot === 0 ? 'secondary aura slot' : 'primary aura slot';
            return err(auraData.dname + ' is already assigned to the ' + otherLabel + '.');
        }
        var slotLabel = slot === 0 ? 'primary aura slot' : 'secondary aura slot';
        if (currentAura === auraId) return ok(auraData.dname + ' is already active on the ' + slotLabel + '.');

        var highestBuilding = getHighestOwnedBuilding();
        var sacrificeNeeded = highestBuilding && currentAura !== auraId;
        if (sacrificeNeeded && highestBuilding.amount <= 0) return err('Cannot switch aura; no building available to sacrifice.');

        if (slot === 0) Game.dragonAura = auraId;
        else Game.dragonAura2 = auraId;

        var sacrificeNote = '';
        if (sacrificeNeeded) {
            highestBuilding.sacrifice(1);
            var buildingName = highestBuilding.bsingle || highestBuilding.single || highestBuilding.name || 'building';
            sacrificeNote = ' Sacrificed one ' + buildingName + '.';
        }

        if (typeof Game.ToggleSpecialMenu === 'function') {
            Game.ToggleSpecialMenu(1);
        }

        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
        return ok('Set ' + auraData.dname + ' on the ' + slotLabel + '.' + sacrificeNote);
    });

    M.registerProgramHandler('activateLoans', function (config) {
        config = config || {};
        var market = getMinigame('Bank');
        if (!market) return err('Stock market unavailable.');
        var selectedValue = config.loan;
        var loanId = parseInt(selectedValue, 10);
        var maxLoans = (market.loanTypes && market.loanTypes.length) ? market.loanTypes.length : 3;
        if (!isNaN(loanId) && loanId >= 0 && loanId < maxLoans) {
            loanId = loanId + 1;
        } else if (typeof selectedValue === 'string') {
            var normalized = selectedValue.toLowerCase();
            if (normalized.indexOf('1st') !== -1 || normalized.indexOf('first') !== -1) loanId = 1;
            else if (normalized.indexOf('2nd') !== -1 || normalized.indexOf('second') !== -1) loanId = 2;
            else if (normalized.indexOf('3rd') !== -1 || normalized.indexOf('third') !== -1) loanId = 3;
        }
        if (isNaN(loanId) || loanId < 1 || loanId > maxLoans) return err('Invalid loan selection.');

        var officeLevel = market.officeLevel || 0;
        var requiredLevel = loanId === 1 ? 2 : (loanId === 2 ? 4 : 5);
        if (officeLevel < requiredLevel) return err(getLoanDisplayName(loanId - 1, market) + ' is not unlocked yet.');
        if (Game.hasBuff('Loan ' + loanId) || Game.hasBuff('Loan ' + loanId + ' (interest)')) return err(getLoanDisplayName(loanId - 1, market) + ' is already active.');
        if (typeof Game.takeLoan !== 'function') return err('Loan system unavailable.');
        var loanDisplay = getLoanDisplayName(loanId - 1, market);
        if (!Game.takeLoan(loanId)) return err('Unable to take ' + loanDisplay + '.');
        market.toRedraw = Math.max(market.toRedraw || 0, 2);
        return ok('Activated ' + loanDisplay + '.');
    });

    M.registerProgramHandler('asyncSleepThread', function (config) {
        config = config || {};
        var seconds = Math.max(0, Math.min(99, parseInt(config.seconds, 10) || 0));
        if (seconds === 0) return ok('Sleep skipped.');
        return { success: true, message: 'Sleeping for ' + Beautify(seconds) + ' second' + (seconds === 1 ? '' : 's') + '.', delay: seconds * 1000 };
    });

    M.registerProgramHandler('clickCookie', function () {
        var level = 0;
        if (M.parent && typeof M.parent.level === 'number') {
            level = Math.max(0, Math.floor(M.parent.level));
        }
        var effectiveLevel = Math.min(level, 20);
        var clicks = effectiveLevel * 5;
        if (clicks <= 0) return ok('No clicks performed (Javascript Console level too low).'); //how did they do this, pretty impressive really
        var interval = 35, targetX = null, targetY = null;
        var bigCookie = (typeof l === 'function') ? l('bigCookie') : null;
        if (bigCookie && typeof bigCookie.getBounds === 'function') {
            //make sure the click popups appear on the cookie not on the terminal
            var bounds = bigCookie.getBounds();
            if (bounds) {
                targetX = bounds.left + bounds.width / 2;
                targetY = bounds.top + bounds.height / 2;
            }
        }
        for (let i = 0; i < clicks; i++) {
            setTimeout(function () {
                if (targetX !== null && targetY !== null) {
                    Game.mouseX = Game.mouseX2 = targetX;
                    Game.mouseY = Game.mouseY2 = targetY;
                    Game.mouseMoved = 1;
                }
                if (typeof Game.recalculateGains === 'function') Game.recalculateGains();
                if (typeof Game.ClickCookie === 'function') Game.ClickCookie();
                else if (typeof Game.Earn === 'function') Game.Earn(Game.cookiesPs / Game.fps);
            }, i * interval);
        }
        return { success: true, message: 'Clicked the big cookie ' + Beautify(clicks) + ' times.', delay: clicks * interval + 250 }; //250ms pause after all clicks complete before next program
    });

    M.slot = [];
    M.slotSettings = [];
    M.currentProgramIndex = 0;

    M.dragging = null;
    M.slotHovered = -1;
    M.launched = false;
    M.programsRun = 0;
    M.programsRunTotal = 0;
    M.executingSlot = -1;

    M.executionCooldownDuration = 1000 * 60 * 60 * 8;
    M.executionCooldownStart = 0;
    M.isExecutingSequence = false;

    M.getExecutionCooldownRemaining = function () {
        var start = M.executionCooldownStart || 0;
        if (!start) return 0;
        var duration = M.executionCooldownDuration - (Game.Has('Water cooled processors') ? 1000 * 60 * 60 : 0);
        var end = start + duration;
        return Math.max(0, end - Date.now());
    };

    M.isExecutionReady = function () {
        return M.getExecutionCooldownRemaining() <= 0;
    };

    M.startExecutionCooldown = function () {
        M.executionCooldownStart = Date.now();
        M.updateCooldownDisplay();
    };

    M.clearExecutionCooldown = function () {
        M.executionCooldownStart = 0;
        M.updateCooldownDisplay();
    };

    M.updateExecuteButtonState = function () {
        var executeBtn = M.executeBtn || l('terminalExecute');
        if (!executeBtn) return;
        var ready = M.isExecutionReady() && !M.isExecutingSequence;
        if (ready) {
            executeBtn.classList.remove('disabled');
            executeBtn.setAttribute('aria-disabled', 'false');
            executeBtn.tabIndex = 0;
        } else {
            executeBtn.classList.add('disabled');
            executeBtn.setAttribute('aria-disabled', 'true');
            executeBtn.tabIndex = -1;
        }
    };

    M.updateCooldownDisplay = function () {
        M.updateExecuteButtonState();
        if (!M.cooldownL) return;
        var remaining = M.getExecutionCooldownRemaining();
        if (remaining > 0) {
            var readyText = '';
            if (typeof Game.sayTime === 'function' && typeof Game.fps === 'number') {
                readyText = Game.sayTime((remaining / 1000 + 1) * Game.fps, -1);
            } else {
                var seconds = Math.max(1, Math.ceil(remaining / 1000));
                var secondsValue = (typeof Beautify === 'function') ? Beautify(seconds) : '' + seconds;
                readyText = secondsValue + ' second' + (seconds === 1 ? '' : 's');
            }
            M.cooldownL.innerHTML = 'Program execution cooldown: Cooling down — <span style="color:#f66;">ready in ' + readyText + '</span>.';
        } else {
            M.cooldownL.innerHTML = 'Program execution cooldown: <span style="color:#6f6;">Ready</span>.';
        }
    };

    M.updateProgramsRunDisplay = function () {
        if (!M.programsRunL) return;
        var current = (typeof Beautify === 'function') ? Beautify(M.programsRun) : '' + M.programsRun;
        var total = (typeof Beautify === 'function') ? Beautify(M.programsRunTotal) : '' + M.programsRunTotal;
        M.programsRunL.textContent = 'Programs run: ' + current + ' (total: ' + total + ')';
    };

    M.refillTooltip = function () {
        var tooltip = '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipRefill">';
        var lumpAmount = (typeof Beautify === 'function') ? Beautify(1) : '1';
        tooltip += 'Click to reset the program execution cooldown for <span class="price lump">' + lumpAmount + ' sugar lump</span>.';
        var canRefill = (typeof Game.canRefillLump === 'function') ? Game.canRefillLump() : false;
        if (canRefill && typeof Game.getLumpRefillMax === 'function' && typeof Game.sayTime === 'function') {
            tooltip += '<br><small>(Can be done once every ' + Game.sayTime(Game.getLumpRefillMax(), -1) + '.)</small>';
        } else if (!canRefill && typeof Game.getLumpRefillRemaining === 'function' && typeof Game.fps === 'number') {
            var remaining = Game.getLumpRefillRemaining() + Game.fps;
            if (typeof Game.sayTime === 'function') {
                tooltip += '<br><small class="red">(Usable again in ' + Game.sayTime(remaining, -1) + '.)</small>';
            } else {
                var seconds = Math.max(1, Math.ceil(remaining / Game.fps));
                var secondsValue = (typeof Beautify === 'function') ? Beautify(seconds) : '' + seconds;
                tooltip += '<br><small class="red">(Usable again in ' + secondsValue + ' seconds.)</small>';
            }
        }
        tooltip += '</div>';
        return tooltip;
    };

    M.getExecuteButtonPopupPosition = function () {
        var executeBtn = l('terminalExecute');
        if (executeBtn && typeof executeBtn.getBounds === 'function') {
            var rect = executeBtn.getBounds();
            if (rect) {
                var x = (rect.left + rect.right) / 2;
                var y = (rect.top + rect.bottom) / 2;
                return { x: x, y: y };
            }
        }
        var fallbackX = (typeof Game.mouseX === 'number') ? Game.mouseX : 0;
        var fallbackY = (typeof Game.mouseY === 'number') ? Game.mouseY : 0;
        return { x: fallbackX, y: fallbackY };
    };

    M.getSupremeIntellectBonus = function () {
        if (typeof Game.hasAura === 'function') {
            return Game.hasAura('Supreme Intellect') ? 1 : 0;
        }
        if (Game.dragonAuras) {
            var id1 = (typeof Game.dragonAura === 'number') ? Game.dragonAura : -1;
            var id2 = (typeof Game.dragonAura2 === 'number') ? Game.dragonAura2 : -1;
            var a1 = (id1 >= 0 && Game.dragonAuras[id1]) ? Game.dragonAuras[id1] : null;
            var a2 = (id2 >= 0 && Game.dragonAuras[id2]) ? Game.dragonAuras[id2] : null;
            if ((a1 && (a1.name === 'Supreme Intellect' || a1.dname === 'Supreme Intellect')) ||
                (a2 && (a2.name === 'Supreme Intellect' || a2.dname === 'Supreme Intellect'))) {
                return 1;
            }
        }
        return 0;
    };

    M.setExecutingSlot = function (slotIndex) {
        var target = (typeof slotIndex === 'number' && slotIndex >= 0) ? Math.floor(slotIndex) : -1;
        if (M.executingSlot !== -1) {
            var prev = l('terminalSlot' + M.executingSlot);
            if (prev) {
                prev.classList.remove('executing');
            }
        }
        M.executingSlot = target;
        if (M.executingSlot !== -1) {
            var slot = l('terminalSlot' + M.executingSlot);
            if (slot) {
                slot.classList.add('executing');
            }
        }
    };

    M.getUnlockedSlotCount = function () {
        var level = (M.parent && typeof M.parent.level === 'number') ? M.parent.level : 0;
        var baseUnlocked = Math.max(0, Math.floor(level));
        var auraBonus = M.getSupremeIntellectBonus();
        var upgradeBonus = Game.Has('Overclocked GPUs') ? 1 : 0;
        var result = Math.min(M.maxSlots, baseUnlocked + auraBonus + upgradeBonus);
        return result;
    };

    M.dragonBoostTooltip = function () {
        var bonus = M.getSupremeIntellectBonus();
        if (bonus <= 0) bonus = 1;
        return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>' + loc("Supreme Intellect") + '</b><div class="line"></div>' + loc("Grants an extra execution queue.", [Beautify(bonus), (bonus === 1 ? '' : 's')]) + '</div>';
    };

    M.buildProgramIcon = function (commandId) {
        var template = M.programsById[commandId];
        return M.renderProgramIcon(template, 'terminalIcon');
    };

    M.updateSlots = function () {
        var unlocked = M.getUnlockedSlotCount();
        for (var i = 0; i < M.maxSlots; i++) {
            var slotDiv = l('terminalSlot' + i);
            var contentDiv = l('terminalSlotContent' + i);
            if (!slotDiv || !contentDiv) continue;
            slotDiv.style.display = (i < unlocked) ? '' : 'none';
            if (i < M.slot.length && M.slot[i] !== -1 && M.slot[i] !== undefined) {
                contentDiv.innerHTML = M.buildProgramIcon(M.slot[i]);
            } else {
                contentDiv.innerHTML = '';
            }
        }
    };

    M.initIconCarousel = function (program, field, data) {
        if (!data) return;
        var container = l(data.containerId);
        if (!container) return;
        var options = data.options || [];
        if (!options.length) return;

        var labelText = container.getAttribute('data-label');
        if (labelText) {
            container.setAttribute('title', labelText);
            container.setAttribute('aria-label', labelText);
        }

        var iconElement = container.querySelector('.terminalCarouselIconInner') || container.querySelector('.terminalCarouselIcon');
        var nameElement = container.querySelector('.terminalCarouselName');
        var updateDisplay = function (index) {
            if (!options.length) return;
            if (index < 0 || index >= options.length) index = 0;
            var option = options[index];
            setIconBackground(iconElement, option.icon);
            if (nameElement) nameElement.innerHTML = option.label || '';
            container.dataset.currentIndex = index;
        };

        var currentIndex = -1;
        var target = '' + data.value;
        for (var i = 0; i < options.length; i++) {
            if ('' + options[i].value === target) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex === -1) currentIndex = 0;
        updateDisplay(currentIndex);

        var step = function (delta) {
            if (!options.length) return;
            var idx = parseInt(container.dataset.currentIndex, 10);
            if (isNaN(idx)) idx = 0;
            idx = (idx + delta + options.length) % options.length;
            var option = options[idx];
            updateDisplay(idx);
            M.setProgramConfigValue(program.id, field.id, option.value);
            M.renderProgramConfig(program);
        };

        var prevBtn = container.querySelector('.terminalCarouselPrev');
        var nextBtn = container.querySelector('.terminalCarouselNext');
        if (prevBtn) {
            AddEvent(prevBtn, 'click', function () { step(-1); });
        }
        if (nextBtn) {
            AddEvent(nextBtn, 'click', function () { step(1); });
        }
    };

    M.initDigitStepper = function (program, field, data) {
        if (!data) return;
        var container = l(data.containerId);
        if (!container) return;
        var labelText = container.getAttribute('data-label');
        if (labelText) {
            container.setAttribute('title', labelText);
            container.setAttribute('aria-label', labelText);
        }

        var min = (field && field.min !== undefined) ? field.min : 0;
        var max = (field && field.max !== undefined) ? field.max : 9999;
        min = Math.max(0, Math.floor(min));
        max = Math.min(9999, Math.floor(max));
        if (max < min) max = min;

        var digitColumns = container.querySelectorAll('.terminalDigitColumn');
        var digitCount = digitColumns.length || ((data && data.digits !== undefined) ? Math.floor(data.digits) : 4);
        if (isNaN(digitCount) || digitCount < 1) digitCount = 4;
        digitCount = Math.max(1, Math.min(4, digitCount));

        var formatDigits = function (value) {
            var str = '' + Math.floor(Math.max(min, Math.min(max, value)));
            while (str.length < digitCount) str = '0' + str;
            if (str.length > digitCount) str = str.slice(-digitCount);
            return str;
        };

        var digitsElements = container.querySelectorAll('.terminalDigitValue');

        var applyDigits = function (digitsStr) {
            for (var i = 0; i < digitsElements.length; i++) {
                var el = digitsElements[i];
                if (!el) continue;
                el.textContent = digitsStr.charAt(i) || '0';
            }
        };

        var setValue = function (value) {
            value = Math.floor(value);
            if (isNaN(value)) value = min;
            value = Math.max(min, Math.min(max, value));
            var digitsStr = formatDigits(value);
            container.dataset.value = value;
            container.dataset.digits = digitsStr;
            applyDigits(digitsStr);
            M.setProgramConfigValue(program.id, field.id, value);
        };

        var initialValue = data.value !== undefined ? data.value : min;
        setValue(initialValue);

        var adjustDigit = function (index, delta) {
            var digitsStr = container.dataset.digits || formatDigits(container.dataset.value || min);
            if (digitsStr.length !== digitCount) digitsStr = formatDigits(parseInt(digitsStr, 10) || min);
            var digits = digitsStr.split('');
            index = Math.max(0, Math.min(digitCount - 1, index));
            var currentDigit = parseInt(digits[index], 10);
            if (isNaN(currentDigit)) currentDigit = 0;
            currentDigit = (currentDigit + delta + 10) % 10;
            digits[index] = '' + currentDigit;
            var newValue = parseInt(digits.join(''), 10);
            if (isNaN(newValue)) newValue = min;
            setValue(newValue);
        };

        for (let c = 0; c < digitColumns.length; c++) {
            const column = digitColumns[c];
            if (!column) continue;
            const indexAttr = parseInt(column.getAttribute('data-index'), 10);
            const digitIndex = isNaN(indexAttr) ? 0 : indexAttr;
            const up = column.querySelector('.terminalDigitArrow--up');
            const down = column.querySelector('.terminalDigitArrow--down');
            if (up) {
                AddEvent(up, 'click', function () {
                    adjustDigit(digitIndex, 1);
                });
            }
            if (down) {
                AddEvent(down, 'click', function () {
                    adjustDigit(digitIndex, -1);
                });
            }
        }
    };

    M.setProgramConfigValue = function (programId, fieldId, value) {
        var program = M.programsById[programId];
        if (!program) return;
        var config = M.ensureProgramConfig(program);
        config[fieldId] = value;
        M.normalizeConfig(program, config);
    };

    M.renderProgramConfig = function (program) {
        var container = l('terminalProgramConfig');
        if (!container) return;
        if (!program || !program.config || !program.config.length) {
            container.innerHTML = '<div class="terminalProgramConfigNone">No additional parameters required.<br>The cookie will be clicked 5 times per Javascript Console Level, up to level 20.</div>';
            return;
        }

        var config = M.ensureProgramConfig(program);
        M.normalizeConfig(program, config);
        var html = '';
        var iconFieldData = {};
        var digitStepperData = {};

        for (var i = 0; i < program.config.length; i++) {
            var field = program.config[i];
            if (!field) continue;
            if (field.shouldRender && field.shouldRender(M, program, config) === false) continue;
            var fieldId = 'terminalConfig_' + program.id + '_' + field.id;
            var value = config[field.id];
            var labelText = field.label || '';
            var labelAttr = labelText.replace(/"/g, '&quot;');

            if (field.type === 'choice' && field.display === 'iconCarousel') {
                var iconOptions = M.resolveFieldOptions(field, program, config);
                var selectedIndex = -1;
                var targetValue = '' + value;
                for (var si = 0; si < iconOptions.length; si++) {
                    if ('' + iconOptions[si].value === targetValue) {
                        selectedIndex = si;
                        break;
                    }
                }
                if (selectedIndex === -1 && iconOptions.length) {
                    selectedIndex = 0;
                    value = iconOptions[0].value;
                    config[field.id] = value;
                }
                var selectedOption = iconOptions[selectedIndex] || null;
                var containerId = 'terminalCarousel_' + program.id + '_' + field.id;
                html += '<div class="terminalConfigField terminalConfigField--carousel" id="' + containerId + '" data-label="' + labelAttr + '">';
                html += '<div class="terminalCarouselContent">';
                html += '<div class="terminalCarouselIcon"><div class="terminalCarouselIconInner usesIcon shadowFilter"></div></div>';
                html += '<div class="terminalCarouselName">' + (selectedOption ? selectedOption.label : 'Unknown') + '</div>';
                html += '<div class="terminalCarouselControls">';
                html += '<div class="terminalCarouselButton terminalCarouselPrev" data-dir="-1"></div>';
                html += '<div class="terminalCarouselButton terminalCarouselNext" data-dir="1"></div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                iconFieldData[field.id] = {
                    containerId: containerId,
                    options: iconOptions,
                    value: value
                };
                continue;
            }

            if (field.type === 'number' && field.display === 'digitStepper') {
                var numericValue = M.sanitizeNumberValue(value, field);
                if (field.min !== undefined) numericValue = Math.max(field.min, numericValue);
                if (field.max !== undefined) numericValue = Math.min(field.max, numericValue);
                numericValue = Math.floor(Math.max(0, Math.min(9999, numericValue)));
                config[field.id] = numericValue;
                var digitCount = field && field.digits !== undefined ? Math.floor(field.digits) : 4;
                if (isNaN(digitCount)) digitCount = 4;
                digitCount = Math.max(1, Math.min(4, digitCount));
                var digitsString = '' + numericValue;
                while (digitsString.length < digitCount) digitsString = '0' + digitsString;
                if (digitsString.length > digitCount) digitsString = digitsString.slice(-digitCount);
                var digitContainerId = 'terminalDigits_' + program.id + '_' + field.id;
                html += '<div class="terminalConfigField terminalConfigField--digits" id="' + digitContainerId + '" data-label="' + labelAttr + '">';
                html += '<div class="terminalDigitStepper">';
                for (var d = 0; d < digitCount; d++) {
                    html += '<div class="terminalDigitColumn" data-index="' + d + '">';
                    html += '<div class="terminalDigitArrow terminalDigitArrow--up" data-dir="1"></div>';
                    html += '<div class="terminalDigitValue">' + digitsString.charAt(d) + '</div>';
                    html += '<div class="terminalDigitArrow terminalDigitArrow--down" data-dir="-1"></div>';
                    html += '</div>';
                }
                html += '</div>';
                html += '</div>';
                digitStepperData[field.id] = {
                    containerId: digitContainerId,
                    value: numericValue,
                    digits: digitCount
                };
                continue;
            }

            html += '<div class="terminalConfigField" data-label="' + labelAttr + '">';

            if (field.type === 'choice') {
                var options = M.resolveFieldOptions(field, program, config);
                var hasMatch = false;
                for (var oi = 0; oi < options.length; oi++) {
                    if (options[oi].value === value || ('' + options[oi].value) === ('' + value)) {
                        hasMatch = true;
                        break;
                    }
                }
                if (!hasMatch && options.length) {
                    value = options[0].value;
                    config[field.id] = value;
                }
                html += '<select id="' + fieldId + '" data-program="' + program.id + '" data-field="' + field.id + '">';
                for (var o = 0; o < options.length; o++) {
                    var opt = options[o];
                    var optValueStr = '' + opt.value;
                    var selected = ('' + value === optValueStr) ? ' selected' : '';
                    html += '<option value="' + optValueStr + '"' + selected + '>' + opt.label + '</option>';
                }
                html += '</select>';
            } else if (field.type === 'number') {
                var numericValue = M.sanitizeNumberValue(value, field);
                config[field.id] = numericValue;
                html += '<input type="number" id="' + fieldId + '" data-program="' + program.id + '" data-field="' + field.id + '" value="' + numericValue + '"';
                if (field.min !== undefined) html += ' min="' + field.min + '"';
                if (field.max !== undefined) html += ' max="' + field.max + '"';
                html += '>';
            }

            html += '</div>';
        }

        container.innerHTML = html;

        for (let fi = 0; fi < program.config.length; fi++) {
            const field = program.config[fi];
            if (!field) continue;
            if (field.shouldRender && field.shouldRender(M, program, config) === false) continue;
            if (field.type === 'choice' && field.display === 'iconCarousel') {
                const iconData = iconFieldData[field.id];
                if (iconData) M.initIconCarousel(program, field, iconData);
                continue;
            }
            if (field.type === 'number' && field.display === 'digitStepper') {
                const digitData = digitStepperData[field.id];
                if (digitData) M.initDigitStepper(program, field, digitData);
                continue;
            }
            const elementId = 'terminalConfig_' + program.id + '_' + field.id;
            const element = l(elementId);
            if (!element) continue;
            if (field.label) {
                element.setAttribute('aria-label', field.label);
                element.setAttribute('title', field.label);
                if (field.type === 'number') {
                    element.setAttribute('placeholder', field.placeholder || field.label);
                }
            }
            const handler = function () {
                var rawValue = element.value;
                var valueToStore = rawValue;
                if (field.type === 'number') {
                    valueToStore = M.sanitizeNumberValue(rawValue, field);
                    element.value = valueToStore;
                } else if (field.valueType === 'number') {
                    var parsed = parseInt(rawValue, 10);
                    if (isNaN(parsed)) parsed = field.min !== undefined ? field.min : 0;
                    valueToStore = parsed;
                }
                M.setProgramConfigValue(program.id, field.id, valueToStore);
                if (field.refreshOnChange) {
                    M.renderProgramConfig(program);
                }
            };
            AddEvent(element, 'change', handler);
        }
    };

    M.showCurrentProgram = function () {
        if (!M.programsById.length) return;
        if (M.currentProgramIndex < 0 || M.currentProgramIndex >= M.programsById.length) {
            M.currentProgramIndex = 0;
        }
        var activeProgram = M.programsById[M.currentProgramIndex];
        var total = M.programsById.length;
        for (var i = 0; i < total; i++) {
            var program = M.programsById[i];
            var dom = l('terminalProgram' + program.id);
            if (!dom) continue;
            dom.style.display = (program.id === activeProgram.id) ? 'inline-block' : 'none';
        }
        var prev = l('terminalProgramPrev');
        var next = l('terminalProgramNext');
        var navDisabled = total <= 1;
        if (prev) {
            if (navDisabled) prev.classList.add('disabled');
            else prev.classList.remove('disabled');
        }
        if (next) {
            if (navDisabled) next.classList.add('disabled');
            else next.classList.remove('disabled');
        }
        var functionLabel = l('terminalProgramFunctionLabel');
        if (functionLabel) {
            var formattedName = (activeProgram.name || 'Unknown').trim().replace(/\s+/g, '_');
            if (formattedName.length) {
                formattedName = formattedName.charAt(0).toLowerCase() + formattedName.slice(1);
            }
            functionLabel.innerHTML = '<b>function ' + formattedName + '();</b>';
        }
        var paramsLabel = l('terminalProgramParamsLabel');
        if (paramsLabel) {
            var paramNames = [];
            var configState = M.ensureProgramConfig(activeProgram);
            if (activeProgram.config && activeProgram.config.length) {
                for (var pi = 0; pi < activeProgram.config.length; pi++) {
                    var field = activeProgram.config[pi];
                    if (!field) continue;
                    if (field.shouldRender && field.shouldRender(M, activeProgram, configState) === false) continue;
                    if (field.label) paramNames.push(field.label.toLowerCase());
                }
            }
            if (!paramNames.length) paramNames.push('null');
            paramsLabel.innerHTML = '<b>parameters</b>(' + paramNames.join(', ') + ');';
        }
        M.renderProgramConfig(activeProgram);
    };

    M.stepProgram = function (direction) {
        var total = M.programsById.length;
        if (!total) return;
        if (total === 1) {
            M.showCurrentProgram();
            return;
        }
        var nextIndex = (M.currentProgramIndex + direction) % total;
        if (nextIndex < 0) nextIndex += total;
        if (nextIndex === M.currentProgramIndex) return;
        M.currentProgramIndex = nextIndex;
        M.showCurrentProgram();
    };

    M.programTooltip = function (id) {
        return function () {
            var program = M.programsById[id];
            if (!program) return '';
            var str = '<div style="padding:8px 4px;min-width:300px;" id="tooltipProgram">';
            str += '<div class="tooltipProgramIcon">';
            str += M.renderProgramIcon(program, 'tooltipIcon');
            str += '</div>';
            str += '<div class="name">' + program.name + '</div>';
            str += '<div class="line"></div>';
            str += '<div class="description">' + program.desc + '</div>';
            var summary = M.getProgramSummary(program, M.ensureProgramConfig(program));
            if (summary) {
                str += '<div class="line"></div>';
                str += '<div class="description">' + summary + '</div>';
            }
            str += '</div>';
            return str;
        };
    };

    M.slotTooltip = function (slot) {
        return function () {
            var unlocked = M.getUnlockedSlotCount();
            var level = (M.parent && typeof M.parent.level === 'number') ? M.parent.level : 0;
            var baseUnlocked = Math.min(M.maxSlots, Math.max(0, Math.floor(level)));
            var auraBonus = M.getSupremeIntellectBonus();
            var unlockedByAura = (auraBonus > 0 && slot < unlocked && slot >= baseUnlocked);
            var str = '<div style="padding:8px 4px;min-width:260px;" id="tooltipTerminalSlot">';
            if (slot >= unlocked) {
                str += '<div class="name">Execution queue ' + (slot + 1) + ' (locked)</div><div class="line"></div>' +
                    '<div class="description">Reach Javascript console level ' + (slot + 1) + ' to unlock this queue.</div>';
                if (auraBonus > 0) {
                    str += '<div class="description">' + loc("Supreme Intellect currently grants an extra execution queue.", [Beautify(auraBonus), (auraBonus === 1 ? '' : 's')]) + '</div>';
                }
            } else if (M.slot[slot] !== -1) {
                var program = M.programsById[M.slot[slot]];
                var humanName = program.name || 'Unknown';
                str += '<div class="name">Execution queue ' + (slot + 1) + '</div><div class="line"></div>';
                str += '<div class="tooltipProgramIcon">';
                str += M.renderProgramIcon(program, 'tooltipIcon');
                str += '</div>';
                str += '<div class="name tooltipFunctionName">' + humanName + '</div>';
                var slotConfig = M.slotSettings[slot] ? M.cloneConfig(M.slotSettings[slot]) : null;
                var normalizedConfig = M.normalizeConfig(program, slotConfig || M.cloneConfig(M.ensureProgramConfig(program)), true);
                var summary = M.getProgramSummary(program, normalizedConfig);
                if (summary) {
                    str += '<div class="description">' + summary + '.</div>';
                } else {
                    str += '<div class="description">This function has no additional parameters.</div>';
                }

            } else {
                str += '<div class="name">Execution queue ' + (slot + 1) + ' (empty)</div><div class="line"></div>' +
                    '<div class="description">Drag a function here to queue it.</div>' +
                    '<div class="description">Queues run in order; user errors are skipped. Upgrade your Javascript console level to run more queues (Up to level 10).</div>';
            }
            str += '</div>';
            return str;
        };
    };

    function attachSlotEventHandlers(slotIndex) {
        var slotElement = l('terminalSlot' + slotIndex);
        var dragElement = l('terminalSlotDrag' + slotIndex);
        if (!slotElement || !dragElement) return;

        AddEvent(slotElement, 'mouseover', function () {
            M.hoverSlot(slotIndex);
        });
        AddEvent(slotElement, 'mouseout', function () {
            M.hoverSlot(-1);
        });
        AddEvent(dragElement, 'mousedown', function (e) {
            if (e.button === 0) {
                M.startSlotDrag(slotIndex);
                e.preventDefault();
            }
        });
    }

    function attachProgramTemplateHandlers(program) {
        if (!program) return;
        var dragElement = l('terminalProgramDrag' + program.id);
        if (!dragElement) return;

        AddEvent(dragElement, 'mousedown', function (e) {
            if (e.button === 0) {
                M.startTemplateDrag(program.id);
                e.preventDefault();
            }
        });
        AddEvent(dragElement, 'mouseup', function (e) {
            if (e.button === 0) {
                M.dropProgram();
                e.preventDefault();
            }
        });
    }

    M.initializeSlots = function () {
        var slotsContainer = l('terminalSlots');
        if (!slotsContainer) return;
        var unlocked = M.getUnlockedSlotCount();
        var html = '';
        for (let i = 0; i < M.maxSlots; i++) {
            var display = i < unlocked ? '' : 'display:none;';
            html += '<div class="ready terminalProgram terminalProgram' + (i % 4) + ' terminalSlot titleFont" id="terminalSlot' + i + '" style="' + display + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.slotTooltip(' + i + ')', 'this') + '>' +
                '<div class="terminalSlotContent" id="terminalSlotContent' + i + '"></div>' +
                '<div class="terminalSlotDrag" id="terminalSlotDrag' + i + '"></div>' +
                '</div>';
        }
        slotsContainer.innerHTML = html;

        for (let si = 0; si < M.maxSlots; si++) {
            attachSlotEventHandlers(si);
        }
    };

    M.ensureUnlockedSlots = function () {
        // we need to rebuild the slot DOM; otherwise the extra slot never appears.
        if (!l('terminalSlot' + (M.maxSlots - 1))) {
            M.initializeSlots();
        }
        var unlocked = M.getUnlockedSlotCount();
        if (M.slot.length < unlocked) {
            while (M.slot.length < unlocked) M.slot.push(-1);
        } else if (M.slot.length > unlocked) {
            M.slot.length = unlocked;
        }
        if (M.slotSettings.length < unlocked) {
            while (M.slotSettings.length < unlocked) M.slotSettings.push(null);
        } else if (M.slotSettings.length > unlocked) {
            M.slotSettings.length = unlocked;
        }
        if (M.executingSlot !== -1 && M.executingSlot >= unlocked) {
            M.setExecutingSlot(-1);
        }
        if (M.unlockedSlots !== unlocked) {
            M.unlockedSlots = unlocked;
            for (var i = 0; i < M.maxSlots; i++) {
                var slotDiv = l('terminalSlot' + i);
                if (!slotDiv) continue;
                slotDiv.style.display = (i < unlocked) ? '' : 'none';
            }
            M.updateSlots();
        }
    };

    M.startTemplateDrag = function (commandId) {
        var source = l('terminalProgram' + commandId);
        if (!source) return;

        var dragDiv = document.createElement('div');
        dragDiv.className = 'ready terminalProgram terminalProgram' + (commandId % 4) + ' titleFont terminalDragged';
        dragDiv.innerHTML = M.buildProgramIcon(commandId);

        var dragLayer = l('terminalDrag');
        var sourceBox = source.getBounds();
        var layerBox = dragLayer.getBounds();
        dragLayer.appendChild(dragDiv);
        var x = sourceBox.left - layerBox.left;
        var y = sourceBox.top - layerBox.top;
        dragDiv.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        var programConfig = M.cloneConfig(M.ensureProgramConfig(M.programsById[commandId]));

        M.dragging = {
            source: 'template',
            commandId: commandId,
            fromSlot: null,
            dragDiv: dragDiv,
            config: programConfig
        };
        M.hoverSlot(-1);
        PlaySound('snd/tick.mp3');
    };

    M.startSlotDrag = function (slotIndex) {
        if (slotIndex >= M.slot.length) return;
        var commandId = M.slot[slotIndex];
        if (commandId === -1 || commandId === undefined) return;

        var program = M.programsById[commandId];

        var slotDiv = l('terminalSlot' + slotIndex);
        if (!slotDiv) return;

        var dragDiv = document.createElement('div');
        dragDiv.className = 'ready terminalProgram terminalProgram' + (commandId % 4) + ' titleFont terminalDragged';
        dragDiv.innerHTML = M.buildProgramIcon(commandId);

        var dragLayer = l('terminalDrag');
        var slotBox = slotDiv.getBounds();
        var layerBox = dragLayer.getBounds();
        dragLayer.appendChild(dragDiv);
        var x = slotBox.left - layerBox.left;
        var y = slotBox.top - layerBox.top;
        dragDiv.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        M.dragging = {
            source: 'slot',
            commandId: commandId,
            fromSlot: slotIndex,
            dragDiv: dragDiv,
            config: M.cloneConfig(M.slotSettings[slotIndex] || M.ensureProgramConfig(program))
        };

        // Temporarily clear the slot while dragging
        clearSlot(slotIndex);
        M.updateSlots();
        M.hoverSlot(-1);
        PlaySound('snd/tick.mp3');
    };

    M.dropProgram = function () {
        if (!M.dragging) return;

        var target = M.slotHovered;
        var commandId = M.dragging.commandId;
        var program = M.programsById[commandId];
        var configToAssign = M.cloneConfig(M.dragging.config || M.ensureProgramConfig(program));
        configToAssign = M.normalizeConfig(program, configToAssign, true);

        if (M.dragging.source === 'slot' && M.dragging.fromSlot != null && M.dragging.fromSlot >= M.slot.length) {
            M.slot.length = M.dragging.fromSlot + 1;
        }

        if (target !== -1) {
            if (M.dragging.source === 'slot') {
                var from = M.dragging.fromSlot;
                if (target === from) {
                    setSlot(target, commandId, configToAssign);
                } else {
                    var previousProgram = M.slot[target];
                    var previousSettings = M.slotSettings[target];
                    setSlot(target, commandId, configToAssign);
                    if (from != null && from !== undefined) {
                        if (previousProgram !== -1 && previousProgram !== undefined) {
                            setSlot(from, previousProgram, previousSettings);
                        } else {
                            clearSlot(from);
                        }
                    }
                }
            } else {
                setSlot(target, commandId, configToAssign);
            }
            PlaySound('snd/tick.mp3');
            PlaySound('snd/spirit.mp3', 0.5);
        } else if (M.dragging.source === 'slot') {
            var fromSlot = M.dragging.fromSlot;
            if (fromSlot != null && fromSlot !== undefined) {
                clearSlot(fromSlot);
            }
            PlaySound('snd/sell1.mp3', 0.75);
        }

        M.updateSlots();

        if (M.dragging.dragDiv && M.dragging.dragDiv.parentNode) {
            M.dragging.dragDiv.parentNode.removeChild(M.dragging.dragDiv);
        }

        M.dragging = null;
        if (M.slotHovered !== -1) {
            var hoveredDiv = l('terminalSlot' + M.slotHovered);
            if (hoveredDiv) hoveredDiv.classList.remove('hovered');
            M.slotHovered = -1;
        }
    };

    M.hoverSlot = function (slot) {
        if (!M.dragging) {
            M.slotHovered = slot;
            return;
        }

        if (M.slotHovered !== -1 && M.dragging) {
            var prevDiv = l('terminalSlot' + M.slotHovered);
            if (prevDiv) prevDiv.classList.remove('hovered');
        }

        M.slotHovered = slot;

        if (M.slotHovered !== -1 && M.dragging) {
            var current = l('terminalSlot' + M.slotHovered);
            if (current) current.classList.add('hovered');
        }

        PlaySound('snd/clickb' + Math.floor(Math.random() * 7 + 1) + '.mp3', 0.75);
    };

    M.execute = function () {
        if (M.isExecutingSequence) return;
        if (!M.isExecutionReady()) {
            var cooldownPos = M.getExecuteButtonPopupPosition();
            var remaining = M.getExecutionCooldownRemaining();
            if (remaining < 0) remaining = 0;
            var readyText = '';
            if (typeof Game.sayTime === 'function' && typeof Game.fps === 'number') {
                readyText = Game.sayTime((remaining / 1000 + 1) * Game.fps, -1);
            } else {
                readyText = Beautify(Math.ceil(remaining / 1000)) + 's';
            }
            Game.Popup('<div style="font-size:80%;">Terminal: Program execution cooling down. Ready in ' + readyText + '.</div>', cooldownPos.x, cooldownPos.y);
            return;
        }
        var unlocked = M.getUnlockedSlotCount();
        var queue = [];
        for (var i = 0; i < unlocked; i++) {
            var progId = M.slot[i];
            if (progId === undefined || progId === -1) continue;
            var program = M.programsById[progId];
            if (!program) continue;
            queue.push({ slotIndex: i, program: program });
        }
        M.setExecutingSlot(-1);
        if (!queue.length) {
            var emptyPopupPos = M.getExecuteButtonPopupPosition();
            Game.Popup('<div style="font-size:80%;">Terminal: Queue is empty.</div>', emptyPopupPos.x, emptyPopupPos.y);
            return;
        }

        M.isExecutingSequence = true;
        M.updateExecuteButtonState();

        var basePopupPos = M.getExecuteButtonPopupPosition();
        var popupStep = 50;
        var popupOffset = 0;

        var finalize = function () {
            M.isExecutingSequence = false;
            M.programsRun += 1;
            M.programsRunTotal += 1;
            M.setExecutingSlot(-1);
            M.startExecutionCooldown();
            M.updateProgramsRunDisplay();
            checkAndAwardTerminalAchievements();
            if (typeof M.showCurrentProgram === 'function') {
                M.showCurrentProgram();
            }
        };

        var DEFAULT_DELAY = 250;

        if (typeof Game.textParticlesY === 'number') {
            Game.textParticlesY = 0;
        }

        var runNext = function (index) {
            if (index >= queue.length) {
                finalize();
                return;
            }
            var item = queue[index];
            M.setExecutingSlot(item.slotIndex);
            var result = M.executeProgram(item.program, item.slotIndex);
            var message = (result && result.message) ? result.message : (item.program.name + ' executed.');
            var popupPosY = basePopupPos.y - popupOffset;
            var popupText;
            if (result && result.success === false) {
                var errorTypes = ['ERR', 'WRN', 'DBG', 'SYS', 'CRIT', 'ALRT', 'FAIL', 'HALT'];
                var errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
                var c = 'BCDFGHJKLMNPQRSTVWXYZ';
                var h = '0123456789ABCDEF';
                var s = [...Array(2)].map(function(_) { return c[Math.random() * c.length | 0]; }).join('') + [...Array(2)].map(function(_) { return h[Math.random() * h.length | 0]; }).join('');
                var errorCode = s + String.fromCharCode(65 + (s.split('').reduce(function(a, b) { return a + b.charCodeAt(0); }, 0) % 26));
                popupText = '<div style="font-size:80%;"><span style="color:red;">' + errorType + ' (' + errorCode + ') </span> ' + message + '</div>';
            } else {
                popupText = '<div style="font-size:80%;">' + message + '</div>';
            }
            Game.Popup(popupText, basePopupPos.x, popupPosY);
            popupOffset += popupStep;
            var delay = DEFAULT_DELAY;
            if (result && typeof result.delay === 'number' && result.delay >= 0) {
                delay = result.delay;
            }
            // Removed override that was causing clickCookie to advance too quickly
            // The delay from the handler ensures all clicks complete before next program runs
            if (index + 1 < queue.length) {
                setTimeout(function () {
                    runNext(index + 1);
                }, delay);
            } else {
                setTimeout(function () {
                    finalize();
                }, Math.max(50, delay));
            }
        };

        runNext(0);
    };

    M.init = function (div) {
        M.l = div;

        var str = '<style>' +
            '#terminalBG{background:url(' + Game.resPath + 'img/shadedBorders.png),url(' + TERMINAL_BACKGROUND_URL + ');background-size:100% 100%,auto;background-repeat:no-repeat,repeat;position:absolute;left:0;right:0;top:0;bottom:16px;}' +
            '#terminalContent{position:relative;padding:8px 24px;text-align:center;}' +
            '#terminalDrag{position:absolute;left:0;top:0;z-index:1000000000000;pointer-events:none;}' +
            '#terminalDrag .terminalProgram{position:absolute;left:0;top:0;}' +
            '#terminalSlots{margin:4px auto;text-align:center;}' +
            '#terminalPrograms{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;padding:8px;}' +
            '#terminalProgramFunctionLabel,#terminalProgramParamsLabel{font-size:12px;color:rgba(255,255,255,0.9);letter-spacing:0.05em;font-weight:bold;}' +
            '#terminalProgramFunctionLabel{margin-bottom:6px;}' +
            '#terminalProgramParamsLabel{text-align:center;margin-bottom:6px;}' +
            '#terminalProgramDisplay{display:flex;justify-content:center;flex:1;}' +
            '#terminalProgramNavBar{display:flex;gap:6px;margin-top:6px;}' +
            '#terminalProgramParameters{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin-top:12px;width:100%;max-width:520px;padding:12px 0px;}' +
            '#terminalProgramConfig{display:flex;flex-wrap:wrap;gap:27px;justify-content:center;align-items:center;width:100%;min-height:120px;}' +
            '.terminalProgramConfigNone{font-size:11px;color:rgba(255,255,255,0.65);text-align:center;padding:6px 0;width:100%;}' +
            '#tooltipProgram .tooltipProgramIcon,#tooltipTerminalSlot .tooltipProgramIcon{float:left;margin:-8px 8px 0 -8px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;}' +
            '#tooltipProgram .tooltipProgramIcon .tooltipIcon,#tooltipTerminalSlot .tooltipProgramIcon .tooltipIcon,.tooltipIcon{width:48px;height:48px;}' +
            '#tooltipProgram .line,#tooltipTerminalSlot .line{clear:both;}' +
            '#tooltipTerminalSlot .tooltipFunctionName{font-weight:bold;margin:0;}' +
            '.terminalConfigField{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:80px;}' +
            '.terminalConfigField--carousel,.terminalConfigField--digits{align-items:center;}' +
            '.terminalConfigField--digits{min-width:auto;}' +
            '.terminalConfigField select,.terminalConfigField input{width:100%;background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:6px;padding:6px;font-size:11px;}' +
            '.terminalConfigField select:focus,.terminalConfigField input:focus{outline:none;border-color:rgba(0,200,255,0.75);box-shadow:0 0 6px rgba(0,200,255,0.45);}' +
            '.terminalCarouselContent{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
            '.terminalCarouselIcon{width:48px;height:48px;display:flex;align-items:center;justify-content:center;}' +
            '.terminalCarouselIconInner{width:48px;height:48px;}' +
            '.terminalCarouselName{font-size:11px;color:rgba(255,255,255,0.85);}' +
            '.terminalCarouselControls{display:flex;gap:6px;margin-top:4px;}' +
            '.terminalCarouselButton{cursor:pointer;width:38px;height:28px;background-image:url(' + TERMINAL_DIRECTIONAL_URL + ');background-repeat:no-repeat;border:none;position:relative;}' +
            '.terminalCarouselButton:active{top:2px;}' +
            '.terminalCarouselPrev{background-position:0px -56px;}' +
            '.terminalCarouselNext{background-position:0px -84px;}' +
            '.terminalDigitStepper{display:flex;gap:2px;}' +
            '.terminalDigitColumn{display:flex;flex-direction:column;align-items:center;gap:4px;}' +
            '.terminalDigitArrow{width:38px;height:28px;cursor:pointer;background-image:url(' + TERMINAL_DIRECTIONAL_URL + ');background-repeat:no-repeat;border:none;position:relative;}' +
            '.terminalDigitArrow:active{top:2px;}' +
            '.terminalDigitArrow--up{background-position:0px -28px;}' +
            '.terminalDigitArrow--down{background-position:0px 0px;}' +
            '.terminalDigitValue{width:36px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;color:#7fb57e;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.35);border-radius:8px;}' +
            '.terminalProgramNav{cursor:pointer;width:38px;height:28px;background-image:url(' + TERMINAL_DIRECTIONAL_URL + ');background-repeat:no-repeat;border:none;position:relative;}' +
            '.terminalProgramNav:active{top:2px;}' +
            '.terminalProgramNav.disabled{opacity:0.4;cursor:default;pointer-events:none;}' +
            '#terminalProgramPrev{background-position:0px -56px;}' +
            '#terminalProgramNext{background-position:0px -84px;}' +
            '.terminalIcon{pointer-events:none;margin:12px 6px 0 6px;width:48px;height:48px;opacity:0.8;position:relative;}' +
            '.terminalSlot .terminalIcon{margin:10px 6px 0 6px;}' +
            '.terminalProgram{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0 0 4px #000,0 0 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url(' + Game.resPath + 'img/spellBG.png);}' +
            '.terminalProgram.ready{color:rgba(255,255,255,0.8);opacity:1;}' +
            '.terminalProgram.ready:hover{color:#fff;}' +
            '.terminalProgram.ready .terminalIcon{opacity:1;}' +
            '.terminalProgram:hover{background-position:0 -74px;box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}' +
            '.terminalSlot.executing{background-position:0 -74px;box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}' +
            '.terminalProgram:active{background-position:0 74px;top:1px;}' +
            '.terminalProgram:hover .terminalIcon{top:-1px;}' +
            '.terminalSlot.executing .terminalIcon{top:-1px;}' +
            '.terminalProgram1{background-position:-60px 0;}' +
            '.terminalProgram1:hover{background-position:-60px -74px;}' +
            '.terminalSlot.executing.terminalProgram1{background-position:-60px -74px;}' +
            '.terminalProgram1:active{background-position:-60px 74px;}' +
            '.terminalProgram2{background-position:-120px 0;}' +
            '.terminalProgram2:hover{background-position:-120px -74px;}' +
            '.terminalSlot.executing.terminalProgram2{background-position:-120px -74px;}' +
            '.terminalProgram2:active{background-position:-120px 74px;}' +
            '.terminalProgram3{background-position:-180px 0;}' +
            '.terminalProgram3:hover{background-position:-180px -74px;}' +
            '.terminalSlot.executing.terminalProgram3{background-position:-180px -74px;}' +
            '.terminalProgram3:active{background-position:-180px 74px;}' +
            '.terminalDragged{pointer-events:none;box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}' +
            '.terminalSlotContent{width:60px;height:74px;position:relative;}' +
            '.terminalSlot .terminalProgram,.terminalSlot .terminalProgram:hover,.terminalSlot .terminalProgram:active{background:none;}' +
            '.terminalSlotDrag{position:absolute;left:0;top:0;right:0;bottom:0;background:#999;opacity:0;cursor:pointer;}' +
            '#terminalExecute{margin:16px auto 0;padding:10px 24px;display:inline-block;background:rgba(0,180,0,0.45);border:2px solid rgba(0,255,0,0.6);border-radius:12px;cursor:pointer;color:#fff;font-weight:bold;text-shadow:0 0 6px #000;}' +
            '#terminalExecute:hover{background:rgba(0,220,0,0.65);border-color:rgba(0,255,0,0.85);}' +
            '#terminalExecute.disabled{background:rgba(80,80,80,0.65);border-color:rgba(130,130,130,0.75);color:rgba(255,255,255,0.45);cursor:default;pointer-events:none;}' +
            '#terminalExecute.disabled:hover{background:rgba(80,80,80,0.65);border-color:rgba(130,130,130,0.75);}' +
            '#terminalCooldownRow{margin:8px auto 0;text-align:center;}' +
            '#terminalCooldownWrap{position:relative;display:inline-block;padding:8px 16px;padding-left:32px;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}' +
            '#terminalCooldown{display:inline-block;}' +
            '#terminalProgramsRun{margin:4px auto 0;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}' +
            '#terminalLumpRefill{position:absolute;left:-6px;top:-10px;cursor:pointer;}' +
            '</style>';

        str += '<div id="terminalBG"></div>';
        str += '<div id="terminalContent">';
        str += '<div id="terminalDrag"></div>';
        str += '<div id="terminalSlots"></div>';
        str += '<div id="terminalPrograms">';
        str += '<div id="terminalProgramFunctionLabel">Function()</div>';
        str += '<div id="terminalProgramDisplay">';
        for (var p = 0; p < M.programsById.length; p++) {
            var prog = M.programsById[p];
            str += '<div class="ready terminalProgram terminalProgram' + (prog.id % 4) + ' titleFont" id="terminalProgram' + prog.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.programTooltip(' + prog.id + ')', 'this') + ' style="display:none;">' +
                M.renderProgramIcon(prog, 'terminalIcon') +
                '<div class="terminalSlotDrag" id="terminalProgramDrag' + prog.id + '"></div>' +
                '</div>';
        }
        str += '</div>';
        str += '<div id="terminalProgramNavBar">';
        str += '<div class="terminalProgramNav" id="terminalProgramPrev"></div>';
        str += '<div class="terminalProgramNav" id="terminalProgramNext"></div>';
        str += '</div>';
        str += '<div id="terminalProgramParameters" class="framed">';
        str += '<div id="terminalProgramParamsLabel">Parameters</div>';
        str += '<div id="terminalProgramConfig"></div>';
        str += '</div>';
        str += '</div>';
        str += '<div id="terminalExecute">Execute sequence</div>';
        str += '<div id="terminalCooldownRow"><div id="terminalCooldownWrap"><div ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.refillTooltip', 'this') + ' id="terminalLumpRefill" class="usesIcon shadowFilter lumpRefill" style="background-position:' + (-29 * 48) + 'px ' + (-14 * 48) + 'px;"></div><div id="terminalCooldown"></div></div></div>';
        str += '<div id="terminalProgramsRun"></div>';
        str += '</div>';

        div.innerHTML = str;

        M.lumpRefill = l('terminalLumpRefill');
        M.cooldownL = l('terminalCooldown');
        M.programsRunL = l('terminalProgramsRun');

        if (M.lumpRefill) {
            AddEvent(M.lumpRefill, 'click', function () {
                if (M.isExecutionReady()) return;
                if (typeof Game.refillLump !== 'function') return;
                Game.refillLump(1, function () {
                    M.clearExecutionCooldown();
                    if (typeof PlaySound === 'function') {
                        PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
                    }
                });
            });
        }

        M.updateCooldownDisplay();
        M.updateProgramsRunDisplay();

        var prevBtn = l('terminalProgramPrev');
        if (prevBtn) {
            AddEvent(prevBtn, 'click', function () {
                M.stepProgram(-1);
            });
        }
        var nextBtn = l('terminalProgramNext');
        if (nextBtn) {
            AddEvent(nextBtn, 'click', function () {
                M.stepProgram(1);
            });
        }

        for (let ii = 0; ii < M.programsById.length; ii++) {
            attachProgramTemplateHandlers(M.programsById[ii]);
        }

        M.initializeSlots();
        M.showCurrentProgram();
        AddEvent(document, 'mouseup', function () { M.dropProgram(); });
        var executeBtn = l('terminalExecute');
        if (executeBtn) {
            M.executeBtn = executeBtn;
            AddEvent(executeBtn, 'click', function () { M.execute(); });
            M.updateExecuteButtonState();
        }
        M.ensureUnlockedSlots();
    };

    M.logic = function () {
        M.ensureUnlockedSlots();
    };

    M.draw = function () {
        if (Game.drawT % 5 === 0) {
            M.updateCooldownDisplay();
            M.updateProgramsRunDisplay();
        }
        if (M.dragging && M.dragging.dragDiv) {
            var box = l('terminalDrag').getBounds();
            var x = Game.mouseX - box.left - 60 / 2;
            var y = Game.mouseY - box.top - 32 + TopBarOffset;
            if (M.slotHovered !== -1) {
                var box2 = l('terminalSlot' + M.slotHovered).getBounds();
                x = box2.left - box.left;
                y = box2.top - box.top;
            }
            M.dragging.dragDiv.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        }
    };

    M.buildSaveString = function () {
        var unlocked = M.getUnlockedSlotCount();
        var data = [];
        var settings = [];
        for (var i = 0; i < unlocked; i++) {
            var slotValue = (M.slot[i] !== undefined && M.slot[i] !== null) ? parseInt(M.slot[i]) : -1;
            if (isNaN(slotValue)) slotValue = -1;
            data.push(slotValue);
            var cfg = M.slotSettings[i];
            var progId = M.slot[i];
            if (progId !== undefined && progId !== -1 && M.programsById[progId]) {
                cfg = M.normalizeConfig(M.programsById[progId], cfg || {}, true);
            }
            if (cfg && Object.keys(cfg).length) {
                settings.push(encodeURIComponent(JSON.stringify(cfg)));
            } else {
                settings.push('');
            }
        }
        var slotPart = data.length ? data.join('/') : '-';
        var settingsPart = settings.length ? settings.join('~') : '-';
        var runCount = Math.max(0, Math.floor(M.programsRun) || 0);
        var runTotal = Math.max(0, Math.floor(M.programsRunTotal) || 0);
        var cooldownStamp = M.executionCooldownStart ? Math.max(0, Math.floor(M.executionCooldownStart)) : 0;
        var isVisible = 0;
        if (M.parent && typeof M.parent.onMinigame !== 'undefined') {
            isVisible = M.parent.onMinigame ? 1 : 0;
        }
        var saveParts = [
            Math.max(0, unlocked),
            slotPart,
            settingsPart,
            runCount,
            runTotal,
            cooldownStamp,
            isVisible
        ];
        return saveParts.join(' ');
    };

    M.save = function () {
        var saveString = M.buildSaveString();

        if (window.TerminalMinigame && typeof window.TerminalMinigame.writeCache === 'function') {
            window.TerminalMinigame.writeCache(saveString);
        }

        return saveString;
    };

    M.load = function (str) {
        if (!str || str === '') {
            M.slot.length = 0;
            M.slotSettings.length = 0;
            M.programsRun = 0;
            M.programsRunTotal = 0;
            M.executionCooldownStart = 0;
            M.isExecutingSequence = false;
            M.setExecutingSlot(-1);
            M.ensureUnlockedSlots();
            M.updateProgramsRunDisplay();
            M.updateCooldownDisplay();
            return;
        }

        try {
            var legacyFormat = str.indexOf(';') !== -1;
            var unlocked;
            var assignments = [];
            var settingsData = [];
            var runCount = 0;
            var runTotal = 0;
            var cooldownStamp = 0;
            var isVisible = 0;

            if (legacyFormat) {
                var legacyParts = str.split(';');
                unlocked = Math.min(M.maxSlots, parseInt(legacyParts[0]) || 0);
                assignments = legacyParts[1] ? legacyParts[1].split(',') : [];
                if (legacyParts[2]) {
                    if (legacyParts[2].indexOf('~') !== -1) settingsData = legacyParts[2].split('~');
                    else settingsData = legacyParts[2].split('|');
                }
                runCount = parseInt(legacyParts[3] || 0) || 0;
                runTotal = parseInt(legacyParts[4] || 0) || 0;
                cooldownStamp = parseFloat(legacyParts[5] || 0) || 0;
                isVisible = parseInt(legacyParts[6] || 0) || 0;
            } else {
                var parts = str.split(' ');
                unlocked = Math.min(M.maxSlots, parseInt(parts[0]) || 0);
                var assignmentsPart = parts[1] || '-';
                if (assignmentsPart !== '-' && assignmentsPart !== '') {
                    assignments = assignmentsPart.split('/');
                }
                var settingsPart = parts[2] || '-';
                if (settingsPart !== '-' && settingsPart !== '') {
                    settingsData = settingsPart.split('~');
                }
                runCount = parseInt(parts[3] || 0) || 0;
                runTotal = parseInt(parts[4] || 0) || 0;
                cooldownStamp = parseFloat(parts[5] || 0) || 0;
                isVisible = parseInt(parts[6] || 0) || 0;
            }

            M.slot.length = unlocked;
            M.slotSettings.length = unlocked;
            for (var i = 0; i < unlocked; i++) {
                var progId = parseInt(assignments[i]);
                if (!isNaN(progId) && M.programsById[progId]) {
                    M.slot[i] = progId;
                    var program = M.programsById[progId];
                    var cfgStr = settingsData[i] || '';
                    if (cfgStr) {
                        try {
                            var parsed = JSON.parse(decodeURIComponent(cfgStr));
                            M.slotSettings[i] = M.normalizeConfig(program, parsed, true);
                        } catch (err) {
                            M.slotSettings[i] = M.cloneConfig(M.ensureProgramConfig(program));
                        }
                    } else {
                        M.slotSettings[i] = M.cloneConfig(M.ensureProgramConfig(program));
                    }
                } else {
                    M.slot[i] = -1;
                    M.slotSettings[i] = null;
                }
            }
            M.programsRun = runCount;
            M.programsRunTotal = runTotal;
            M.executionCooldownStart = cooldownStamp;
            M.updateSlots();
            M.setExecutingSlot(-1);
            M.updateProgramsRunDisplay();
            M.updateCooldownDisplay();

            // Restore minigame visibility state
            if (M.parent && typeof M.parent.onMinigame !== 'undefined' && isVisible) {
                // Use a short delay to ensure game is fully ready, then use proper switchMinigame method
                setTimeout(function() {
                    if (M.parent && !M.parent.onMinigame) {
                        if (typeof M.parent.switchMinigame === 'function') {
                            M.parent.switchMinigame(true);
                        } else {
                            // Fallback if switchMinigame not available
                            M.parent.onMinigame = 1;
                            if (M.parent.minigameDiv && M.parent.minigameDiv.parentNode) {
                                M.parent.minigameDiv.parentNode.classList.add('onMinigame');
                            }
                            if (typeof M.parent.refresh === 'function') {
                                M.parent.refresh();
                            }
                        }
                    }
                }, 50);
            }

            checkAndAwardTerminalAchievements();

            if (window.TerminalMinigame && typeof window.TerminalMinigame.writeCache === 'function') {
                var cacheString = legacyFormat ? M.buildSaveString() : str;
                window.TerminalMinigame.writeCache(cacheString);
            }
        } catch (e) {
            M.slot.length = 0;
            M.slotSettings.length = 0;
            M.programsRun = 0;
            M.programsRunTotal = 0;
            M.executionCooldownStart = 0;
            M.setExecutingSlot(-1);
            M.ensureUnlockedSlots();
            M.updateProgramsRunDisplay();
            M.updateCooldownDisplay();
        }
    };

    M.reset = function (hard) {
        M.slot.length = 0;
        M.slotSettings.length = 0;
        M.dragging = null;
        M.slotHovered = -1;
        M.programsRun = 0;
        M.executionCooldownStart = 0;
        M.setExecutingSlot(-1);
        M.ensureUnlockedSlots();
        M.updateProgramsRunDisplay();
        M.updateCooldownDisplay();
    };
};

function createTerminalAchievements() {
    if (!Game.JNE || !Game.JNE.createAchievement) {
        return;
    }

    if (Game.JNE.enableJSMiniGame === false) {
        return;
    }

    var needsCreation = false;
    for (var i = 0; i < terminalAchievementNames.length; i++) {
        var originalName = terminalAchievementNames[i];
        var hiddenName = originalName + ' [DISABLED]';
        if (!Game.Achievements[originalName] && !Game.Achievements[hiddenName]) {
            needsCreation = true;
            break;
        }
    }

    if (!needsCreation) {
        for (var i = 0; i < terminalAchievementNames.length; i++) {
            var originalName = terminalAchievementNames[i];
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
        terminalAchievementState.achievementsCreated = true;
        return;
    }

    var baseOrder = 61618;
    var terminalAchievements = [
        {
            name: '10x Full-Stack rockstar ninja wizard engineer',
            desc: 'Execute <b>100 Programs</b> in the Terminal minigame.<q>Human Resources is adding another adjective to your job title as we speak. Technically, they\'re nouns masquerading as adjectives, just like recruiters masquerading as engineers.</q>',
            icon: [19, 9, UPDATED_CUSTOM_SPRITE_URL],
            order: baseOrder + 0.1
        },
        {
            name: 'Agile hacker samurai jedi-craftsman engineer',
            desc: 'Execute <b>500 Programs</b> in the Terminal minigame.<q>Your LinkedIn job title history now reads like the opening chapter of a J.R.R. Tolkien novel, complete with wizards, jedi, ninjas, and at least one guru.</q>',
            icon: [19, 10, UPDATED_CUSTOM_SPRITE_URL],
            order: baseOrder + 0.2
        }
    ];

    var currentProgramCount = Math.floor(M.programsRunTotal || 0);

    for (var index = 0; index < terminalAchievements.length; index++) {
        var achData = terminalAchievements[index];
        var threshold = terminalAchievementThresholds[index];
        var shouldBeWon = currentProgramCount >= threshold;
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

    terminalAchievementState.achievementsCreated = true;
}

function removeTerminalAchievements() {
    if (!Game || !Game.Achievements) {
        return;
    }

    terminalAchievementNames.forEach(function(achievementName) {
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

    terminalAchievementState.achievementsCreated = false;

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

function checkAndAwardTerminalAchievements() {
    if (!terminalAchievementState.achievementsCreated) {
        return;
    }

    var currentProgramCount = Math.floor(M.programsRunTotal || 0);

    for (var i = 0; i < terminalAchievementThresholds.length; i++) {
        var threshold = terminalAchievementThresholds[i];
        var achievementName = terminalAchievementNames[i];
        if (currentProgramCount >= threshold) {
            if (Game.Achievements[achievementName]) {
                if (!Game.Achievements[achievementName].won) {
                    if (Game.Achievements[achievementName]._restoredFromSave) {
                        Game.Achievements[achievementName]._restoredFromSave = false;
                    }
                    try {
                        if (Game.JNE && Game.JNE.markAchievementWon) {
                            Game.JNE.markAchievementWon(achievementName);
                        } else if (Game.Win) {
                            Game.Win(achievementName);
                        }
                    } catch (e) {
                    }
                }
            }
        }
    }
}

M.onResize = function () {
    M.updateSlots();
};

M.createAchievements = function() {
    createTerminalAchievements();
    checkAndAwardTerminalAchievements();
};

M.removeAchievements = function() {
    removeTerminalAchievements();
};

if (typeof window !== 'undefined') {
    window.removeTerminalAchievements = removeTerminalAchievements;
    window.createTerminalAchievements = createTerminalAchievements;
    
    // Preserve existing API functions from cookie.js while adding M's properties
    var existingAPI = window.TerminalMinigame || {};
    window.TerminalMinigame = M;
    
    // Restore the API functions that cookie.js set up
    if (typeof existingAPI.getSaveData === 'function') {
        window.TerminalMinigame.getSaveData = existingAPI.getSaveData;
    }
    if (typeof existingAPI.applySaveData === 'function') {
        window.TerminalMinigame.applySaveData = existingAPI.applySaveData;
    }
    if (typeof existingAPI.writeCache === 'function') {
        window.TerminalMinigame.writeCache = existingAPI.writeCache;
    }
    if (typeof existingAPI.requestSave === 'function') {
        window.TerminalMinigame.requestSave = existingAPI.requestSave;
    }
    
    // DEBUG: Manual test function for visibility restoration
    // Call from console: TerminalMinigame.testVisibilityRestore()
    window.TerminalMinigame.testVisibilityRestore = function() {
        // Test save string with isVisible = 1
        var testSaveString = '10 -1/-1/-1/-1/-1/-1/-1/-1/-1/-1 ~~~~~~~~~ 10 10 0 1';
        M.load(testSaveString);
        return 'Test complete - minigame should open in 50ms';
    };
    
    // DEBUG: Force open the minigame right now
    window.TerminalMinigame.forceOpen = function() {
        if (M.parent && typeof M.parent.switchMinigame === 'function') {
            M.parent.switchMinigame(true);
        } else if (M.parent) {
            M.parent.onMinigame = 1;
            if (M.parent.minigameDiv && M.parent.minigameDiv.parentNode) {
                M.parent.minigameDiv.parentNode.classList.add('onMinigame');
            }
            if (typeof M.parent.refresh === 'function') {
                M.parent.refresh();
            }
        }
        return 'Force open complete';
    };
}

if (Game.Objects && Game.Objects['Javascript console']) {
    var jsConsole = Game.Objects['Javascript console'];
    var flagDefined = !!(Game.JNE && Game.JNE.enableJSMiniGame !== undefined);
    // Force enabled when loading via console (main mod not loaded or not initialized)
    var isConsoleLoading = !flagDefined;
    var isEnabled = flagDefined ? !!Game.JNE.enableJSMiniGame : true;

    function ensureMinigameDiv() {
        if (jsConsole.minigameDiv) return;
        var existingDiv = l('rowSpecial' + jsConsole.id);
        if (existingDiv) {
            jsConsole.minigameDiv = existingDiv;
        } else {
            jsConsole.minigameDiv = document.createElement('div');
            jsConsole.minigameDiv.id = 'rowSpecial' + jsConsole.id;
            jsConsole.minigameDiv.className = 'rowSpecial';
            if (jsConsole.l) jsConsole.l.appendChild(jsConsole.minigameDiv);
        }
    }

    function bootMinigame() {
        if (!jsConsole) return;
        if (!jsConsole.minigameLoaded) {
            jsConsole.minigameLoaded = true;
            jsConsole.minigameName = jsConsole.minigameName || 'Terminal';
            jsConsole.minigameLoading = false;
        }

        ensureMinigameDiv();
        M.launch();
        M.init(jsConsole.minigameDiv);

        if (Game.JNE && Game.JNE.terminalSavedData) {
            M.load(Game.JNE.terminalSavedData);
        }

        if (typeof M.createAchievements === 'function') {
            M.createAchievements();
        }

        if (!jsConsole.minigame) {
            jsConsole.minigame = M;
        }

        if (isConsoleLoading && !jsConsole.minigameUrl) {
            jsConsole.minigameUrl = 'terminal';
            jsConsole.minigameIcon = [19, 11];
        }

        if (typeof jsConsole.refresh === 'function') {
            jsConsole.refresh();
        }
        if (isConsoleLoading && Game.ObjectsById && Game.ObjectsById[jsConsole.id] && typeof Game.ObjectsById[jsConsole.id].draw === 'function') {
            Game.ObjectsById[jsConsole.id].draw();
        }
    }

    if (isEnabled) {
        try {
            if (!jsConsole.minigameLoaded) {
                bootMinigame();
            } else if (jsConsole.minigameLoaded && !M.launched) {
                M.launch();
                M.launched = true;
                if (typeof M.createAchievements === 'function') {
                    M.createAchievements();
                }
            }
        } catch (e) {
            jsConsole.minigameLoading = false;
            throw e;
        }
        jsConsole.minigameLoading = false;
    } else {
        jsConsole.minigameLoading = false;
        if (typeof M.removeAchievements === 'function') {
            M.removeAchievements();
        } else {
            removeTerminalAchievements();
        }
    }
}


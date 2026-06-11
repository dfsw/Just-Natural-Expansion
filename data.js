window.JNEData = {
    upgradeData: {
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
                icon: [14, 13, 'custom'],
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
                icon: [15, 13, 'custom'],
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
                icon: [18, 13, 'custom'],
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
                icon: [17, 13, 'custom'],
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
                icon: [16, 13, 'custom'],
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
                icon: [19, 13, 'custom'],
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
                icon: [1, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [1, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [1, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [1, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [1, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [1, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [2, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [2, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [2, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [2, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [2, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [2, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [3, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [3, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [3, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [3, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [3, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [3, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [4, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [4, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [4, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [4, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [4, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [4, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [13, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [13, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [13, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [13, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [13, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [13, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [14, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [14, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [14, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [14, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [14, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [14, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [15, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [15, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [15, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [15, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [15, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [15, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [5, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [5, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [5, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [5, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [5, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [5, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [6, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [6, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [6, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [6, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [6, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [6, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [7, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [7, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [7, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [7, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [7, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [7, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [8, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [8, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [8, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [8, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [8, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [8, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [11, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [11, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [11, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [11, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [11, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [11, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [12, 0, 'custom'], // Matches 750 threshold (index 0)
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
                icon: [12, 2, 'custom'], // Matches 850 threshold (index 2)
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
                icon: [12, 4, 'custom'], // Matches 950 threshold (index 4)
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
                icon: [12, 6, 'custom'], // Matches 1050 threshold (index 6)
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
                icon: [12, 8, 'custom'], // Matches 1150 threshold (index 8)
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
                icon: [12, 10, 'custom'], // Matches 1250 threshold (index 10)
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
                icon: [17, 0, 'custom'], // Matches 750 threshold
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
                icon: [17, 2, 'custom'], // Matches 850 threshold
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
                icon: [17, 4, 'custom'], // Matches 950 threshold
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
                icon: [17, 6, 'custom'], // Matches 1050 threshold
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
                icon: [17, 8, 'custom'], // Matches 1150 threshold
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
                icon: [17, 10, 'custom'], // Matches 1250 threshold
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
                icon: [18, 0, 'custom'], // Matches 750 threshold
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
                icon: [18, 2, 'custom'], // Matches 850 threshold
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
                icon: [18, 4, 'custom'], // Matches 950 threshold
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
                icon: [18, 6, 'custom'], // Matches 1050 threshold
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
                icon: [18, 8, 'custom'], // Matches 1150 threshold
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
                icon: [18, 10, 'custom'], // Matches 1250 threshold
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
                icon: [19, 0, 'custom'], // Matches 750 threshold
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
                icon: [19, 2, 'custom'], // Matches 850 threshold
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
                icon: [19, 4, 'custom'], // Matches 950 threshold
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
                icon: [19, 6, 'custom'], // Matches 1050 threshold
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
                icon: [19, 8, 'custom'], // Matches 1150 threshold
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
                icon: [19, 10, 'custom'], // Matches 1250 threshold
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
                icon: [20, 0, 'custom'], // Matches 750 threshold
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
                icon: [20, 2, 'custom'], // Matches 850 threshold
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
                icon: [20, 4, 'custom'], // Matches 950 threshold
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
                icon: [20, 6, 'custom'], // Matches 1050 threshold
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
                icon: [20, 8, 'custom'], // Matches 1150 threshold
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
                icon: [20, 10, 'custom'], // Matches 1250 threshold
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
                icon: [21, 0, 'custom'], // Matches 750 threshold
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
                icon: [21, 2, 'custom'], // Matches 850 threshold
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
                icon: [21, 4, 'custom'], // Matches 950 threshold
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
                icon: [21, 6, 'custom'], // Matches 1050 threshold
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
                icon: [21, 8, 'custom'], // Matches 1150 threshold
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
                icon: [21, 10, 'custom'], // Matches 1250 threshold
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
                icon: [22, 0, 'custom'], // Matches 750 threshold
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
                icon: [22, 2, 'custom'], // Matches 850 threshold
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
                icon: [22, 4, 'custom'], // Matches 950 threshold
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
                icon: [22, 6, 'custom'], // Matches 1050 threshold
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
                icon: [22, 8, 'custom'], // Matches 1150 threshold
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
                icon: [22, 10, 'custom'], // Matches 1250 threshold
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
                icon: [16, 0, 'custom'],
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
                icon: [16, 1, 'custom'],
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
                icon: [16, 2, 'custom'],
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
                icon: [16, 3, 'custom'],
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
                icon: [16, 4, 'custom'],
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
                icon: [10, 8, 'custom'],
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
                icon: [10, 9, 'custom'],
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
                icon: [10, 10, 'custom'],
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
                icon: [16, 8, 'custom'],
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
                icon: [16, 9, 'custom'],
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
                icon: [16, 10, 'custom'],
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
                icon: [1, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [1, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [1, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [1, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [1, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [2, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [2, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [2, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [2, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [2, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [3, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [3, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [3, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [3, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [3, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [4, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [4, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [4, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [4, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [4, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [13, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [13, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [13, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [13, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [13, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [14, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [14, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [14, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [14, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [14, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [15, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [15, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [15, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [15, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [15, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [5, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [5, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [5, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [5, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [5, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [6, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [6, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [6, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [6, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [6, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [7, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [7, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [7, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [7, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [7, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [8, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [8, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [8, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [8, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [8, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [11, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [11, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [11, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [11, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [11, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [12, 1, 'custom'], // Matches 800 threshold (index 1)
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
                icon: [12, 3, 'custom'], // Matches 900 threshold (index 3)
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
                icon: [12, 5, 'custom'], // Matches 1000 threshold (index 5)
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
                icon: [12, 7, 'custom'], // Matches 1100 threshold (index 7)
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
                icon: [12, 9, 'custom'], // Matches 1200 threshold (index 9)
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
                icon: [17, 1, 'custom'], // Matches 800 threshold
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
                icon: [17, 3, 'custom'], // Matches 900 threshold
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
                icon: [17, 5, 'custom'], // Matches 1000 threshold
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
                icon: [17, 7, 'custom'], // Matches 1100 threshold
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
                icon: [17, 9, 'custom'], // Matches 1200 threshold
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
                icon: [18, 1, 'custom'], // Matches 800 threshold
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
                icon: [18, 3, 'custom'], // Matches 900 threshold
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
                icon: [18, 5, 'custom'], // Matches 1000 threshold
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
                icon: [18, 7, 'custom'], // Matches 1100 threshold
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
                icon: [18, 9, 'custom'], // Matches 1200 threshold
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
                icon: [19, 1, 'custom'], // Matches 800 threshold
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
                icon: [19, 3, 'custom'], // Matches 900 threshold
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
                icon: [19, 5, 'custom'], // Matches 1000 threshold
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
                icon: [19, 7, 'custom'], // Matches 1100 threshold
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
                icon: [19, 9, 'custom'], // Matches 1200 threshold
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
                icon: [20, 1, 'custom'], // Matches 800 threshold
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
                icon: [20, 3, 'custom'], // Matches 900 threshold
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
                icon: [20, 5, 'custom'], // Matches 1000 threshold
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
                icon: [20, 7, 'custom'], // Matches 1100 threshold
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
                icon: [20, 9, 'custom'], // Matches 1200 threshold
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
                icon: [21, 1, 'custom'], // Matches 800 threshold
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
                icon: [21, 3, 'custom'], // Matches 900 threshold
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
                icon: [21, 5, 'custom'], // Matches 1000 threshold
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
                icon: [21, 7, 'custom'], // Matches 1100 threshold
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
                icon: [21, 9, 'custom'], // Matches 1200 threshold
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
                icon: [22, 1, 'custom'], // Matches 800 threshold
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
                icon: [22, 3, 'custom'], // Matches 900 threshold
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
                icon: [22, 5, 'custom'], // Matches 1000 threshold
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
                icon: [22, 7, 'custom'], // Matches 1100 threshold
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
                icon: [22, 9, 'custom'], // Matches 1200 threshold
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
    },
    achievementData: {
        buildings: {
            cursor: {
                names: ["Carpal diem", "Hand over fist", "Finger guns", "Thumbs up, buttercup", "Pointer sisters", "Knuckle sandwich", "Phalanx formation", "Manual override", "Clickbaiter-in-chief", "With flying digits", "Palm before the storm"],
                thresholds: [1100, 1150, 1250, 1300, 1400, 1450, 1550, 1600, 1700, 1750, 1850],
                customIcons: [[0, 0, 'custom'], [0, 1, 'custom'], [0, 2, 'custom'], [0, 3, 'custom'], [0, 4, 'custom'], [0, 5, 'custom'], [0, 6, 'custom'], [0, 7, 'custom'], [0, 8, 'custom'], [0, 9, 'custom'], [0, 10, 'custom']],
                orders: [1050.652, 1050.662, 1050.672, 1050.682, 1050.692, 1050.702, 1050.712, 1050.722, 1050.732, 1050.742, 1050.752]
            },
            'grandma': {
                names: ["All rise for Nana", "The crinkle collective", "Okay elder", "Wrinkle monarchy", "The wrinkling hour", "Matriarchal meltdown", "Cookies before crones", "Dust to crust", "Bingo bloodbath", "Supreme doughmother", "The last custodian"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[1, 0, 'custom'], [1, 1, 'custom'], [1, 2, 'custom'], [1, 3, 'custom'], [1, 4, 'custom'], [1, 5, 'custom'], [1, 6, 'custom'], [1, 7, 'custom'], [1, 8, 'custom'], [1, 9, 'custom'], [1, 10, 'custom']],
                orders: [1100.628, 1100.638, 1100.648, 1100.658, 1100.668, 1100.678, 1100.688, 1100.698, 1100.708, 1100.718, 1100.728]
            },
            'farm': {
                names: ["Little house on the dairy", "The plow thickens", "Cabbage patch dynasty", "Grazing amazement", "Field of creams", "Barn to be wild", "Crops and robbers", "Shoveling it in", "Seed syndicate", "Harvest high table", "Emperor of dirt"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[2, 0, 'custom'], [2, 1, 'custom'], [2, 2, 'custom'], [2, 3, 'custom'], [2, 4, 'custom'], [2, 5, 'custom'], [2, 6, 'custom'], [2, 7, 'custom'], [2, 8, 'custom'], [2, 9, 'custom'], [2, 10, 'custom']],
                orders: [1200.629, 1200.639, 1200.649, 1200.659, 1200.669, 1200.679, 1200.689, 1200.699, 1200.709, 1200.719, 1200.729]
            },
            'mine': {
                names: ["Shafted", "Shiny object syndrome", "Ore what?", "Rubble without a cause", "Tunnel visionaries", "Stalag-might", "Pyrite and prejudice", "Bedrock 'n roll", "Mantle management", "Hollow crown jewels", "Emperor of ore"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[3, 0, 'custom'], [3, 1, 'custom'], [3, 2, 'custom'], [3, 3, 'custom'], [3, 4, 'custom'], [3, 5, 'custom'], [3, 6, 'custom'], [3, 7, 'custom'], [3, 8, 'custom'], [3, 9, 'custom'], [3, 10, 'custom']],
                orders: [1300.630, 1300.640, 1300.650, 1300.660, 1300.670, 1300.680, 1300.690, 1300.700, 1300.710, 1300.720, 1300.730]
            },
            'factory': {
                names: ["Assembly required", "Quality unassured", "Error 404-manpower not found", "Spare parts department", "Conveyor belters", "Planned obsolescence", "Punch-card prophets", "Rust in peace", "Algorithm and blues", "Profit motive engine", "Lord of the assembly"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[4, 0, 'custom'], [4, 1, 'custom'], [4, 2, 'custom'], [4, 3, 'custom'], [4, 4, 'custom'], [4, 5, 'custom'], [4, 6, 'custom'], [4, 7, 'custom'], [4, 8, 'custom'], [4, 9, 'custom'], [4, 10, 'custom']],
                orders: [1400.631, 1400.641, 1400.651, 1400.661, 1400.671, 1400.681, 1400.691, 1400.701, 1400.711, 1400.721, 1400.731]
            },
            'bank': {
                names: ["Petty cash splash", "The Invisible Hand That Feeds", "Under-mattress banking", "Interest-ing times", "Fee-fi-fo-fund", "Liquidity theater", "Risk appetite: unlimited", "Quantitative cheesing", "Number go up economics", "Sovereign cookie fund", "Seigniorage supreme"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[13, 0, 'custom'], [13, 1, 'custom'], [13, 2, 'custom'], [13, 3, 'custom'], [13, 4, 'custom'], [13, 5, 'custom'], [13, 6, 'custom'], [13, 7, 'custom'], [13, 8, 'custom'], [13, 9, 'custom'], [13, 10, 'custom']],
                orders: [1425.632, 1425.642, 1425.652, 1425.662, 1425.672, 1425.682, 1425.692, 1425.702, 1425.712, 1425.722, 1425.732]
            },
            'temple': {
                names: ["Monk mode", "Ritual and error", "Chant and deliver", "Incensed and consecrated", "Shrine of the times", "Hallowed be thy grain", "Relic and roll", "Pilgrimage of crumbs", "The cookie pantheon", "Tithes and cookies", "Om-nom-nipotent"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[14, 0, 'custom'], [14, 1, 'custom'], [14, 2, 'custom'], [14, 3, 'custom'], [14, 4, 'custom'], [14, 5, 'custom'], [14, 6, 'custom'], [14, 7, 'custom'], [14, 8, 'custom'], [14, 9, 'custom'], [14, 10, 'custom']],
                orders: [1450.633, 1450.643, 1450.653, 1450.663, 1450.673, 1450.683, 1450.693, 1450.703, 1450.713, 1450.723, 1450.733]
            },
            'wizard tower': {
                names: ["Is this your cardamom?", "Rabbit optional, hat mandatory", "Wand and done", "Critical spellcheck failed", "Tome Raider", "Prestidigitation station", "Counterspell culture", "Glitter is a material component", "Evocation nation", "Sphere of influence", "The Last Archmage"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[15, 0, 'custom'], [15, 1, 'custom'], [15, 2, 'custom'], [15, 3, 'custom'], [15, 4, 'custom'], [15, 5, 'custom'], [15, 6, 'custom'], [15, 7, 'custom'], [15, 8, 'custom'], [15, 9, 'custom'], [15, 10, 'custom']],
                orders: [1475.634, 1475.644, 1475.654, 1475.664, 1475.674, 1475.684, 1475.694, 1475.704, 1475.714, 1475.724, 1475.734]
            },
            'shipment': {
                names: ["Door-to-airlock", "Contents may shift in zero-G", "Fragile: vacuum inside", "Cosmic courier service", "Porch pirates of Andromeda", "Tracking number: ∞", "Relativistic courier", "Orbital rendezvous only", "Return to sender: event horizon", "Address: Unknown Quadrant", "Postmaster Galactic"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[5, 0, 'custom'], [5, 1, 'custom'], [5, 2, 'custom'], [5, 3, 'custom'], [5, 4, 'custom'], [5, 5, 'custom'], [5, 6, 'custom'], [5, 7, 'custom'], [5, 8, 'custom'], [5, 9, 'custom'], [5, 10, 'custom']],
                orders: [1500.635, 1500.645, 1500.655, 1500.665, 1500.675, 1500.685, 1500.695, 1500.705, 1500.715, 1500.725, 1500.735]
            },
            'alchemy lab': {
                names: ["Stir-crazy crucible", "Flask dance", "Beaker than fiction", "Alloy-oop", "Distill my beating heart", "Lead Zeppelin", "Hg Wells", "Fe-fi-fo-fum", "Breaking bread with Walter White", "Prima materia manager", "The Philosopher's Scone"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[6, 0, 'custom'], [6, 1, 'custom'], [6, 2, 'custom'], [6, 3, 'custom'], [6, 4, 'custom'], [6, 5, 'custom'], [6, 6, 'custom'], [6, 7, 'custom'], [6, 8, 'custom'], [6, 9, 'custom'], [6, 10, 'custom']],
                orders: [1600.636, 1600.646, 1600.656, 1600.666, 1600.676, 1600.686, 1600.696, 1600.706, 1600.716, 1600.726, 1600.736]
            },
            'portal': {
                names: ["Open sesameseed", "Mind the rift", "Doorway to s'moreway", "Contents may phase in transit", "Wormhole warranty voided", "Glitch in the Crumbatrix", "Second pantry to the right", "Liminal sprinkles", "Please do not feed the void", "Echoes from the other oven", "Out past the exit sign"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[7, 0, 'custom'], [7, 1, 'custom'], [7, 2, 'custom'], [7, 3, 'custom'], [7, 4, 'custom'], [7, 5, 'custom'], [7, 6, 'custom'], [7, 7, 'custom'], [7, 8, 'custom'], [7, 9, 'custom'], [7, 10, 'custom']],
                orders: [1700.637, 1700.647, 1700.657, 1700.667, 1700.677, 1700.687, 1700.697, 1700.707, 1700.717, 1700.727, 1700.737]
            },
            'time machine': {
                names: ["Yeasterday", "Tick-tock, bake o'clock", "Back to the batter", "Déjà chewed", "Borrowed thyme", "Second breakfast paradox", "Next week's news, fresh today", "Live, die, bake, repeat", "Entropy-proof frosting", "Past the last tick", "Emperor of when"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[8, 0, 'custom'], [8, 1, 'custom'], [8, 2, 'custom'], [8, 3, 'custom'], [8, 4, 'custom'], [8, 5, 'custom'], [8, 6, 'custom'], [8, 7, 'custom'], [8, 8, 'custom'], [8, 9, 'custom'], [8, 10, 'custom']],
                orders: [1800.638, 1800.648, 1800.658, 1800.668, 1800.678, 1800.688, 1800.698, 1800.708, 1800.718, 1800.728, 1800.738]
            },
            'antimatter condenser': {
                names: ["Up and atom!", "Boson buddies", "Schrödinger's snack", "Quantum foam party", "Twenty years away (always)", "Higgs and kisses", "Zero-point frosting", "Some like it dark (matter)", "Vacuum energy bar", "Singularity of flavor", "Emperor of mass"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[11, 0, 'custom'], [11, 1, 'custom'], [11, 2, 'custom'], [11, 3, 'custom'], [11, 4, 'custom'], [11, 5, 'custom'], [11, 6, 'custom'], [11, 7, 'custom'], [11, 8, 'custom'], [11, 9, 'custom'], [11, 10, 'custom']],
                orders: [1900.639, 1900.649, 1900.659, 1900.669, 1900.679, 1900.689, 1900.699, 1900.709, 1900.719, 1900.729, 1900.739]
            },
            'prism': {
                names: ["Light reading", "Refraction action", "Snacktrum of light", "My cones and rods", "Prism break", "Prism prelate", "Glare force one", "Hues Your Own Adventure", "Devour the spectrum", "Crown of rainbows", "Radiant consummation"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[12, 0, 'custom'], [12, 1, 'custom'], [12, 2, 'custom'], [12, 3, 'custom'], [12, 4, 'custom'], [12, 5, 'custom'], [12, 6, 'custom'], [12, 7, 'custom'], [12, 8, 'custom'], [12, 9, 'custom'], [12, 10, 'custom']],
                orders: [2000.640, 2000.650, 2000.660, 2000.670, 2000.680, 2000.690, 2000.700, 2000.710, 2000.720, 2000.730, 2000.740]
            },
            'chancemaker': {
                names: ["Beginner's lucked-in", "Risk it for the biscuit", "Roll, baby, roll", "Luck be a ladyfinger", "RNG on the range", "Monte Carlo kitchen", "Gambler's fallacy, baker's edition", "Schrödinger's jackpot", "RNGesus take the wheel", "Hand of Fate: Full House", "RNG seed of fortune"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[17, 0, 'custom'], [17, 1, 'custom'], [17, 2, 'custom'], [17, 3, 'custom'], [17, 4, 'custom'], [17, 5, 'custom'], [17, 6, 'custom'], [17, 7, 'custom'], [17, 8, 'custom'], [17, 9, 'custom'], [17, 10, 'custom']],
                orders: [2100.641, 2100.651, 2100.661, 2100.671, 2100.681, 2100.691, 2100.701, 2100.711, 2100.721, 2100.731, 2100.741]
            },
            'fractal engine': {
                names: ["Copy-paste-ry", "Again, but smaller", "Edge-case frosting", "Mandelbread set", "Strange attractor, stranger baker", "Recursive taste test", "Zoom & enhance & enhance", "The limit does not exist", "Halting? Never heard of it", "The set contains you", "Emperor of self-similarity"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[18, 0, 'custom'], [18, 1, 'custom'], [18, 2, 'custom'], [18, 3, 'custom'], [18, 4, 'custom'], [18, 5, 'custom'], [18, 6, 'custom'], [18, 7, 'custom'], [18, 8, 'custom'], [18, 9, 'custom'], [18, 10, 'custom']],
                orders: [2200.642, 2200.652, 2200.662, 2200.672, 2200.682, 2200.692, 2200.702, 2200.712, 2200.722, 2200.732, 2200.742]
            },
            'javascript console': {
                names: ["F12, open sesame", "console.log('crumbs')", "Semicolons optional, sprinkles mandatory", "Undefined is not a function (nor a cookie)", "await fresh_from_oven()", "Event loop-de-loop", "Regexorcism", "Infinite scroll of dough", "Unhandled promise confection", "Single-threaded, single-minded", "Emperor of Runtime"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[19, 0, 'custom'], [19, 1, 'custom'], [19, 2, 'custom'], [19, 3, 'custom'], [19, 4, 'custom'], [19, 5, 'custom'], [19, 6, 'custom'], [19, 7, 'custom'], [19, 8, 'custom'], [19, 9, 'custom'], [19, 10, 'custom']],
                orders: [2300.643, 2300.653, 2300.663, 2300.673, 2300.683, 2300.693, 2300.703, 2300.713, 2300.723, 2300.733, 2300.743]
            },
            'idleverse': {
                names: ["Pick-a-verse, any verse", "Open in new universe", "Meanwhile, in a parallel tab", "Idle hands, infinite plans", "Press any world to continue", "NPC in someone else's save", "Cookie of Theseus", "Crossover episode", "Cosmic load balancer", "Prime instance", "The bakery at the end of everything"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[20, 0, 'custom'], [20, 1, 'custom'], [20, 2, 'custom'], [20, 3, 'custom'], [20, 4, 'custom'], [20, 5, 'custom'], [20, 6, 'custom'], [20, 7, 'custom'], [20, 8, 'custom'], [20, 9, 'custom'], [20, 10, 'custom']],
                orders: [2400.644, 2400.654, 2400.664, 2400.674, 2400.684, 2400.694, 2400.704, 2400.714, 2400.724, 2400.734, 2400.744]
            },
            'cortex baker': {
                names: ["Gray matter batter", "Outside the cookie box", "Prefrontal glaze", "Snap, crackle, synapse", "Temporal batch processing", "Cogito, ergo crumb", "Galaxy brain, local oven", "The bicameral ovens", "Theory of crumb", "Lobe service", "Mind the monarch"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[21, 0, 'custom'], [21, 1, 'custom'], [21, 2, 'custom'], [21, 3, 'custom'], [21, 4, 'custom'], [21, 5, 'custom'], [21, 6, 'custom'], [21, 7, 'custom'], [21, 8, 'custom'], [21, 9, 'custom'], [21, 10, 'custom']],
                orders: [2500.645, 2500.655, 2500.665, 2500.675, 2500.685, 2500.695, 2500.705, 2500.715, 2500.725, 2500.735, 2500.745]
            },
            'You': {
                names: ["Me, myself, and Icing", "Copy of a copy", "Echo chamber", "Self checkout", "You v2.0", "You v2.0.1 emergency hot fix", "Me, Inc.", "Council of Me", "I, Legion", "The one true you", "Sovereign of the self"],
                thresholds: [750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
                customIcons: [[22, 0, 'custom'], [22, 1, 'custom'], [22, 2, 'custom'], [22, 3, 'custom'], [22, 4, 'custom'], [22, 5, 'custom'], [22, 6, 'custom'], [22, 7, 'custom'], [22, 8, 'custom'], [22, 9, 'custom'], [22, 10, 'custom']],
                orders: [2600.646, 2600.656, 2600.666, 2600.676, 2600.686, 2600.696, 2600.706, 2600.716, 2600.726, 2600.736, 2600.746]
            }
        },
        other: {
			cps: {
                names: ["Beyond the speed of dough", "Speed of sound", "Speed of light", "Faster than light", "Speed of thought", "Faster than speed of thought", "Plaid", "Somehow faster than plaid", "Transcending the very concept of speed itself"],
    thresholds: [1e57, 1e58, 1e59, 1e60, 1e61, 1e62, 1e63, 1e64, 1e65],
                descs: ["Bake <b>1 octodecillion</b> per second.", "Bake <b>10 octodecillion</b> per second.", "Bake <b>100 octodecillion</b> per second.", "Bake <b>1 novemdecillion</b> per second.", "Bake <b>10 novemdecillion</b> per second.", "Bake <b>100 novemdecillion</b> per second.", "Bake <b>1 vigintillion</b> per second.<q>They've gone to plaid!</q>", "Bake <b>10 vigintillion</b> per second.<q>Ah, buckle this! LUDICROUS SPEED! GO!</q>", "Bake <b>100 vigintillion</b> per second.<q>Everything else is frozen, we’re breaking physics, so, uh... should we actually do something with that?</q>"],
                customIcons: [[0, 12, 'custom'], [1, 12, 'custom'], [2, 12, 'custom'], [3, 12, 'custom'], [4, 12, 'custom'], [5, 12, 'custom'], [6, 12, 'custom'], [7, 12, 'custom'], [8, 12, 'custom']],
                orders: [200.48, 200.49, 200.50, 200.51, 200.52, 200.53, 200.54, 200.55, 200.56]
            },
            click: {
                names: ["Clickbait & Switch", "Click to the Future", "Clickety Clique", "Clickonomicon", "Clicks and Stones", "Click It Till You Make It", "One Does Not Simply Click Once", "Lord of the Clicks", "Click of the Titans"],
                thresholds: [1e63, 1e69, 1e75, 1e81, 1e87, 1e93, 1e99, 1e105, "clickOfTitans"],
                descs: ["Make <b>1 vigintillion</b> from clicking.<q>Tired finger yet?</q>", "Make <b>1 duovigintillion</b> from clicking.", "Make <b>1 quattuorvigintillion</b> from clicking.", "Make <b>1 sexvigintillion</b> from clicking.", "Make <b>1 octovigintillion</b> from clicking.", "Make <b>1 trigintillion</b> from clicking.", "Make <b>1 duotrigintillion</b> from clicking.", "Make <b>1 quattuortrigintillion</b> from clicking.", "Generate <b>1 year of raw CpS</b> in a single cookie click.<q>One click to rule them all!</q>"],
                customIcons: [[9, 0, 'custom'], [9, 1, 'custom'], [9, 2, 'custom'], [9, 3, 'custom'], [9, 4, 'custom'], [9, 5, 'custom'], [9, 6, 'custom'], [9, 7, 'custom'], [9, 8, 'custom']],
                orders: [1000.650, 1000.660, 1000.670, 1000.680, 1000.690, 1000.700, 1000.710, 1000.720, 7004]
            },
            wrinkler: {
                names: ["Wrinkler annihilator", "Wrinkler eradicator", "Wrinkler extinction event", "Wrinkler apocalypse", "Wrinkler armageddon"],
                thresholds: [666, 2666, 6666, 16666, 26666],
                descs: ["Burst <b>666 wrinklers</b> across all ascensions.<q>Pop goes the creepy.</q>", "Burst <b>2,666 wrinklers</b> across all ascensions.<q>That wasn't cream filling.</q>", "Burst <b>6,666 wrinklers</b> across all ascensions.<q>If it wrinkles, you pop it.</q>", "Burst <b>16,666 wrinklers</b> across all ascensions.<q>So much juice. So little remorse.</q>", "Burst <b>26,666 wrinklers</b> across all ascensions.<q>One squish closer to immortality.</q>"],
                customIcons: [[21, 16, 'custom'], [21, 17, 'custom'], [21, 18, 'custom'], [22, 19, 'custom'], [22, 18, 'custom']],
                orders: [21000.117, 21000.127, 21000.137, 21000.147, 21000.157]
            },
            goldenWrinkler: {
                names: ["Golden wrinkler"],
                thresholds: [210000000], // 6.66 years in seconds (6.66 * 365.25 * 24 * 60 * 60)
                descs: ["Burst a wrinkler worth <b>6.66 years of CpS</b>.<q>That's not cream filling, that's a retirement fund!</q>"],
                customIcons: [[23, 19, 'custom']],
                orders: [21000.168]
            },
            shinyWrinkler: {
                names: ["Rare specimen collector", "Endangered species hunter", "Extinction event architect"],
                thresholds: [2, 5, 10],
                descs: ["Burst <b>2 shiny wrinklers</b> across all ascensions.<q>You're a monster, do you know that?</q>", "Burst <b>5 shiny wrinklers</b> across all ascensions.<q>You really have to stop here, there aren\'t many of these left in the world.</q>", "Burst <b>10 shiny wrinklers</b> across all ascensions.<q>People like you are evil, no one will ever see another one of these, you ruined it for everyone.</q>"],
                customIcons: [[21, 13, 'custom'], [21, 14, 'custom'], [21, 15, 'custom']],
                orders: [35000.272, 35000.282, 35000.292]
            },
            reindeer: {
                names: ["Reindeer destroyer", "Reindeer obliterator", "Reindeer extinction event", "Reindeer apocalypse"],
                thresholds: [500, 1000, 2000, 5000],
                descs: ["Pop <b>500 reindeer</b> across all ascensions.<q>You are become Claus, destroyer of hooves.</q>", "Pop <b>1,000 reindeer</b> across all ascensions.<q>That one had a red nose…</q>", "Pop <b>2,000 reindeer</b> across all ascensions.<q>Comet, Vixen, Toasted.</q>", "Pop <b>5,000 reindeer</b> across all ascensions.<q>Legends say the sky still smells like cinnamon and regret.</q>"],
                customIcons: [[19, 17, 'custom'], [19, 16, 'custom'], [19, 15, 'custom'], [19, 14, 'custom']],
                orders: [22100.124, 22100.134, 22100.144, 22100.154]
            },
            goldenCookies: {
                names: ["Find a penny, pick it up", "Four-leaf overkill", "Rabbit's footnote", "Knock on wood", "Jackpot jubilee", "Black cat's seventh paw"],
                thresholds: [17777, 37777, 47777, 57777, 67777, 77777],
                descs: ["Click <b>17,777 golden cookies</b> across all ascensions.<q>A copper start for a golden habit. Heads you click, tails you click anyway.</q>", "Click <b>37,777 golden cookies</b> across all ascensions.<q>One clover is luck; an entire lawn is a logistics problem. You industrialized superstition.</q>", "Click <b>47,777 golden cookies</b> across all ascensions.<q>Citation needed: 'luck significantly increased.' Footnote: the hare disagrees; the stats don't.</q>", "Click <b>57,777 golden cookies</b> across all ascensions.<q>Knock knock. Who's there? Luck. Luck who? Luck you're not superstitious... or are you?</q>", "Click <b>67,777 golden cookies</b> across all ascensions.<q>House edge? You are the house. Confetti budget exceeded; no one complained.</q>", "Click <b>77,777 golden cookies</b> across all ascensions.<q>Golden luck, plan a trip to Las Vegas and cash in on it.</q>"],
                customIcons: [[0, 13, 'custom'],  [1, 13, 'custom'],  [2, 13, 'custom'],  [3, 13, 'custom'],[4, 13, 'custom'], [5, 13, 'custom']],
                orders: [10000.095, 10000.105, 10000.115, 10000.125, 10000.135, 10000.145]
            },
            spell: {
                names: ["Archwizard", "Spellmaster", "Cookieomancer", "Spell lord", "Magic emperor", "Sweet Sorcery"],
                thresholds: [1999, 2999, 3999, 4999, 9999, "freeSugarLump"],
                descs: ["Cast <b>1,999</b> spells across all ascensions.<q>Zim zam zap!</q>", "Cast <b>2,999</b> spells across all ascensions.<q>Pew pew pew!</q>", "Cast <b>3,999</b> spells across all ascensions.", "Cast <b>4,999</b> spells across all ascensions.", "Cast <b>9,999</b> spells across all ascensions.<q>Yea well, how many backfired?</q>", "Get the <b>Free Sugar Lump</b> outcome from a magically spawned golden cookie.<q>Sweet sorcery indeed!</q>"],
                customIcons: [[22, 12], [20, 14, 'custom'], [20, 13, 'custom'], [28, 12], [27, 12], [20, 15, 'custom']],
                orders: [61495.333, 61495.343, 61495.353, 61495.363, 61495.373, 61496.004]
            },
            templeSwaps: {
                names: ["Faithless Loyalty", "God of All Gods"],
            thresholds: [100, 86400], // 100 temple swaps, 24 hours (86400 seconds) per god
            descs: ["Swap gods in the Pantheon <b>100 times</b> in one ascension.<q>You know you can\'t just pick a religion to suit your mood for the day right?</q>", "Use each pantheon god for at least <b>24 hours</b> total across all ascensions.<q>Variety is the spice of divine life.</q>"],
            customIcons: [[21, 18], [22, 18]],
            orders: [61490, 61490.01]
        },
            gardenHarvest: {
                names: ["Greener, aching thumb", "Greenest, aching thumb", "Photosynthetic prodigy", "Garden master", "Plant whisperer"],
                thresholds: [2000, 3000, 5000, 7500, 10000],
                descs: ["Harvest <b>2,000</b> mature garden plants across all ascensions.<q>Pluck pluck pluck, all day every day.</q>", "Harvest <b>3,000</b> mature garden plants across all ascensions.", "Harvest <b>5,000</b> mature garden plants across all ascensions.", "Harvest <b>7,500</b> mature garden plants across all ascensions.", "Harvest <b>10,000</b> mature garden plants across all ascensions.<q>The plants fear you when your shadow casts over them.</q>"],
                customIcons: [[4, 2, 'gardenPlants'], [4, 10, 'gardenPlants'], [4, 17, 'gardenPlants'], [4, 18, 'gardenPlants'], [4, 19, 'gardenPlants']],
                orders: [61515.3791, 61515.3792, 61515.3793, 61515.3794, 61515.3795]
            },
            cookiesAscension: {
                names: ["The Doughpocalypse", "The Flour Flood", "The Ovenverse", "The Crumb Crusade", "The Final Batch", "The Ultimate Ascension", "The Transcendent Rise"],
                thresholds: [1e73, 1e75, 1e77, 1e79, 1e81, 1e83, 1e85],
                descs: ["Bake <b>10 trevigintillion</b> cookies in one ascension.<q>Did you know it went higher? Neat.</q>", "Bake <b>1 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>100 quattuorvigintillion</b> cookies in one ascension.", "Bake <b>10 quinvigintillion</b> cookies in one ascension.", "Bake <b>1 sexvigintillion</b> cookies in one ascension.", "Bake <b>100 sexvigintillion</b> cookies in one ascension.<q>I don't think you should be here.</q>", "Bake <b>10 septenvigintillion</b> cookies in one ascension.<q>Okay for real, it doesn't go any higher.</q>"],
                customIcons: [[0, 12, 'custom'], [1, 12, 'custom'], [2, 12, 'custom'], [3, 12, 'custom'], [4, 12, 'custom'], [5, 12, 'custom'], [6, 12, 'custom'], [7, 12, 'custom'], [8, 12, 'custom']],
                orders: [100.48, 100.49, 100.50, 100.51, 100.52, 100.53, 100.54]
            },
            forfeited: {
                names: ["Dante's unwaking dream", "The abyss gazes back", "Charon's final toll", "Cerberus's third head", "Minos's eternal judgment", "The river Styx flows backward", "Ixion's wheel spins faster", "Sisyphus's boulder crumbles", "Tantalus's eternal thirst", "The ninth circle's center", "Lucifer's frozen tears", "Beyond the void's edge", "The final descent's end"],
                thresholds: [1e60, 1e63, 1e66, 1e69, 1e72, 1e75, 1e78, 1e81, 1e84, 1e87, 1e90, 1e93, 1e96],
                descs: ["Forfeit <b>1 novemdecillion</b> cookies total across all ascensions.", "Forfeit <b>1 vigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 unvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 duovigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 trevigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 quattuorvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 quinvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 sexvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 septenvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 octovigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 novemvigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 trigintillion</b> cookies total across all ascensions.", "Forfeit <b>1 untrigintillion</b> cookies total across all ascensions."],
                customIcons: [[0, 11], [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11]],
                orders: [30050.606, 30050.616, 30050.626, 30050.636, 30050.646, 30050.656, 30050.666, 30050.676, 30050.686, 30050.696, 30050.706, 30050.716, 30050.726]
            },
            totalBuildings: {
                names: ["Building behemoth", "Construction colossus", "Architectural apex"],
                thresholds: [15000, 20000, 25000],
                descs: ["Own <b>15,000 buildings</b>.<q>You have more real estate than sense.</q>", "Own <b>20,000 buildings</b>.<q>That's not a skyline. That's a warning sign.</q>", "Own <b>25,000 buildings</b>.<q>Your shadow blocks out the sun, and the competition.</q>"],
                customIcons: [[22, 12, 'custom'], [22, 13, 'custom'], [22, 14, 'custom']],
                orders: [5000.591, 5000.601, 5000.611]
            },
            buildingsSold: {
                names: ["Asset Liquidator", "Flip City", "Ghost Town Tycoon"],
                thresholds: [25000, 50000, 100000],
                descs: ["Sell <b>25,000 buildings</b> in one ascension.<q>A thousand dreams bulldozed for a golden cookie.</q>", "Sell <b>50,000 buildings</b> in one ascension.<q>Your economic model is just 'wreck and repeat.'</q>", "Sell <b>100,000 buildings</b> in one ascension.<q>You called it 'liquidating assets.' They called it 'eviction.'</q>"],
                customIcons: [[28, 26], [15, 9], [32, 33]],
                orders: [5001.1, 5001.11, 5001.12]
            },
            everything: {
                names: ["Septcentennial and a half", "Octcentennial", "Octcentennial and a half", "Nonacentennial", "Nonacentennial and a half", "Millennial"],
                thresholds: [750, 800, 850, 900, 950, 1000],
                descs: ["Have at least <b>750 of everything</b>.", "Have at least <b>800 of everything</b>.", "Have at least <b>850 of everything</b>.", "Have at least <b>900 of everything</b>.", "Have at least <b>950 of everything</b>.", "Have at least <b>1,000 of everything</b>."],
                customIcons: [[16, 12, 'custom'], [17, 12, 'custom'], [18, 12, 'custom'], [19, 12, 'custom'], [20, 12, 'custom'], [21, 12, 'custom']],
                orders: [7002.609, 7002.619, 7002.629, 7002.639, 7002.649, 7002.659]
            },
          
            seedlog: {
                names: ["Seedless to eternity", "Seedless to infinity", "Seedless to beyond"],
                thresholds: [5, 10, 25],
                descs: ["Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>5 times</b>.<q>Fertilizer? Nah, I prefer fire.</q>", "Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>10 times</b>.<q>Sugar hornets are pleased.</q>", "Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets <b>25 times</b>.<q>How many times must you kill Eden?</q>"],
                customIcons: [[0, 34, 'gardenPlants'], [1, 34, 'gardenPlants'], [2, 34, 'gardenPlants']],
                orders: [61515.38201, 61515.38202, 61515.38203]
            },
            allKittensOwned: {
                names: ["Kitten jamboree", "Kitten Fiesta"],
                thresholds: [18, 29],
                descs: ["Own all <b>18 original kittens</b>.<q>Kittens stacked on kittens until total kitten collapse is imminent.</q>", "Own all <b>18 original kittens</b> and all <b>11 expansion kittens</b> at once.<q>Okay that's really just too many cats.</q>"],
                customIcons: [[18, 14], [18, 13]],
                orders: [10000.475, 10000.485]
            },
            reincarnate: {
                names: ["Ascension master", "Ascension legend", "Ascension deity"],
                thresholds: [250, 500, 999],
                descs: ["Ascend <b>250 times</b>.", "Ascend <b>500 times</b>.", "Ascend <b>999 times</b>."],
                customIcons: [[17, 16, 'custom'], [17, 15, 'custom'], [17, 14, 'custom']],
                orders: [30000.216, 30000.226, 30000.236]
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
                customIcons: [[17, 6], [26, 7], [33, 33], [28, 29], [31, 8], [15, 8]],
                orders: [61616.547, 61616.557, 61616.567, 61616.577, 61616.587, 61616.597]
            },
            seasonalReindeer: {
                names: ["Cupid's Reindeer", "Business Reindeer", "Bundeer", "Ghost Reindeer"],
                thresholds: [1, 1, 1, 1],
                descs: ["Pop a reindeer during <b>Valentine's Day season.</b><q>Love is fleeting. So was that reindeer.</q>", "Pop a reindeer during <b>Business Day season.</b><q>His KPI was 'don't get popped.'</q>", "Pop a reindeer during <b>Easter season.</b><q>Wrong holiday, right target.</q>", "Pop a reindeer during <b>Halloween season.</b><q>Was that ectoplasm or caramel?</q>"],
                customIcons: [[18, 16, 'custom'], [18, 15, 'custom'], [18, 14, 'custom'], [18, 17, 'custom']],
                orders: [22100.275, 22100.285, 22100.295, 22100.305]
            },
            gardenSeedsTime: {
                names: ["I feel the need for seed"],
                thresholds: [5 * 24 * 60 * 60 * 1000], // 5 days in milliseconds
                descs: ["Unlock all garden seeds within <b>5 days</b> of your last garden sacrifice. Look this one is tricky, if you reload or load a save the 5 day timer is invalidated, so you can\'t load in a completed garden."],
                customIcons: [[25, 15]],
                orders: [61515.430]
            },
            seasonalDropsTime: {
                names: ["Holiday Hoover", "Merry Mayhem"],
                thresholds: [90 * 60 * 1000, 60 * 60 * 1000], // 90 minutes and 60 minutes in milliseconds
                descs: ["Collect all seasonal drops within <b>90 minutes</b> of an Ascension start.<q>Santa is watching and he thinks you need to chill out.</q>", "Collect all seasonal drops within <b>60 minutes</b> of an Ascension start.<q>See it is possible, ye of little faith.</q>"],
                customIcons: [[18, 4], [17, 9]],
                orders: [22400.179, 22400.189]
            },
                    hardercorest: {
            names: ["Hardercorest"],
            thresholds: [3e9], // 3 billion cookies
            descs: ["Bake <b>3 billion cookies</b> with no cookie clicks and no upgrades bought in Born Again mode.<q>Do you hate me or yourself after that one?</q>"],
            customIcons: [[13, 6]],
            orders: [30500.102]
        },
                    hardercorester: {
            names: ["Hardercorest-er"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> with no more than 20 clicks, no more than 20 buildings (no selling), and no more than 20 upgrades in Born Again mode.<q>Bet you thought that wouldn't be as bad as it was eh?</q>"],
            customIcons: [[14, 6]],
            orders: [30500.112]
        },
        allBuildingsLevel10: {
            names: ["Have your sugar and eat it too"],
            thresholds: [10], // Level 10,
            descs: ["Have every building reach <b>level 10</b>."],
            customIcons: [[26, 27]],
            orders: [400000.143]
        },
        sugarLumps: {
            names: ["Sweet Child of Mine"],
            thresholds: [100], // 100 sugar lumps
            descs: ["Own <b>100 sugar lumps</b> at once."],
            customIcons: [[29, 16]],
            orders: [21100.406]
        },
        seasonSwitches: {
            names: ["Calendar Abuser"],
            thresholds: [50], // 50 season switches
            descs: ["Switch seasons <b>50 times</b> in one ascension.<q>What month even is it?</q>"],
            customIcons: [[16, 6]],
            orders: [21100.416]
        },
        vanillaAchievements: {
            names: ["Vanilla Star"],
            thresholds: [622], // All 622 vanilla achievements
            descs: ["Own all <b>622 original achievements.</b><q>Wow congratulations 100% achievements! Now just 459 more to go.</q>"],
            customIcons: [[22, 7]],
            orders: [400000.143]
        },
        botanicalPerfection: {
            names: ["Botanical Perfection", "Duketater Salad"],
            thresholds: [34, 12], // All 34 plant types, 12 duketaters
            descs: ["Have one of every type of plant in the mature stage at once.<q>I have become the plants now, I am the master of the garden, bow before my hoe.</q>", "Harvest <b>12 mature Duketaters</b> simultaneously.<q>Timing your salad is everything otherwise the mayo goes bad and you kill all your friends.</q>"],
            customIcons: [[27, 15], [0, 19, 'gardenPlants']],
            orders: [61515.431, 61515.440]
        },

        soilChanges: {
            names: ["Fifty Shades of Clay"],
            thresholds: [100], // 100 soil changes
            descs: ["Change the soil type of your Garden <b>100 times</b> in one ascension.<q>This is not how gardening works.</q>"],
            customIcons: [[3, 34, 'gardenPlants']],
            orders: [61515.433]
        },
        tickerClicks: {
            names: ["News ticker addict"],
            thresholds: [1000], // 1000 ticker clicks
            descs: ["Click on the news ticker <b>1,000 times</b> in one ascension.<q>Hey dummy you are clicking on the wrong thing.</q>"],
            customIcons: [[10, 12, 'custom']],
            orders: [11000.548]

        },
        wrathCookies: {
            names: ["Warm-Up Ritual", "Deal of the Slightly Damned", "Baker of the Beast"],
            thresholds: [66, 666, 6666], // Wrath cookie clicks
            descs: ["Click <b>66 wrath cookies</b> across all ascensions.", "Click <b>666 wrath cookies</b> across all ascensions.", "Click <b>6,666 wrath cookies</b> across all ascensions."],
            customIcons: [[20, 18, 'custom'], [20, 17, 'custom'], [20, 16, 'custom']],
            orders: [19990.605, 19990.615, 19990.625]
        },
        goldenCookieTime: {
            names: ["Second Life, First Click"],
            thresholds: [120 * 1000], // 120 seconds in milliseconds
            descs: ["Click a golden cookie within <b>120 seconds</b> of ascending."],
            customIcons: [[0, 9, 'custom']],
            orders: [10000.274]
        },
        wrinklerTime: {
            names: ["Wrinkler Rush"],
            thresholds: [930 * 1000], // 930 seconds (15 minutes 30 seconds) in milliseconds
            descs: ["Pop a wrinkler within <b>15 minutes and 30 seconds</b> of ascending.<q>The Grandmatriarchs barely had time to wake up!</q>"],
            customIcons: [[23, 18, 'custom']],
            orders: [21000.170]
        },
        wrinklerBankDouble: {
            names: ["Wrinkler Windfall"],
            thresholds: [6], // 6x bank value (sextupled)
            descs: ["Sextuple your bank with a single wrinkler pop.<q>Talk about a return on investment!</q>"],
            customIcons: [[21, 19, 'custom']],
            orders: [21000.169]
        },
        hardcoreNoHeavenly: {
            names: ["We don't need no heavenly chips"],
            thresholds: [333], // 333 of every building
            descs: ["Own at least <b>333 of every building type</b>, without owning the 'Heavenly chip secret' upgrade.<q>Well that was a little different wasn't it?</q>"],
            customIcons: [[12, 7]],
            orders: [30500.102]
        },
        hardcoreFinalCountdown: {
            names: ["The Final Countdown"],
            thresholds: [1], // Just a placeholder, we'll check exact counts in the requirement function
            descs: ["Own exactly 15 Cursors, 14 Grandmas, 13 Farms, yada yada yada, down to 1 Chancemaker. No selling or sacrificing any buildings. Must be earned in Born Again mode.<q>Is that song stuck in your head now, it\'s pretty catchy.</q>"],
            customIcons: [[13, 7]],
            orders: [30500.102]
        },
        hardcoreNoKittens: {
            names: ["Really more of a dog person"],
            thresholds: [1e9], // 1 billion cookies per second
            descs: ["Bake <b>1 billion cookies per second</b> without buying any kitten upgrades in Born Again mode.<q>Turns out cookies taste just fine without cat hair in them.</q>"],
            customIcons: [[14, 7]],
            orders: [30500.102]
        },
        hardcoreNoGoldenCookies: {
            names: ["Gilded Restraint"],
            thresholds: [1e12], // 1 trillion cookies
            descs: ["Bake <b>1 trillion cookies</b> without ever clicking a golden cookie, must be done in Born Again mode.<q>Patience is its own buff.</q>"],
            customIcons: [[23, 9, 'custom']],
            orders: [30500.102]
        },
        hardcoreCursorsAndGrandmas: {
            names: ["Back to Basic Bakers"],
            thresholds: [1e6], // 1 million cookies per second
            descs: ["Reach <b>1 million cookies per second</b> using only Cursors and Grandmas (no other buildings), must be done in Born Again mode.<q>Turns out Grandma really is the backbone of the empire.</q>"],
            customIcons: [[23, 10, 'custom']],
            orders: [30500.102]
        },
        hardcoreModestPortfolio: {
            names: ["Modest Portfolio"],
            thresholds: [1e15], // 1 quadrillion cookies
            descs: ["Reach <b>1 quadrillion cookies</b> without ever owning more than 10 of any building type (no selling), must be done in Born Again mode.<q>Breadth over depth.</q>"],
            customIcons: [[23, 11, 'custom']],
            orders: [30500.102]
        },
        hardcoreDifficultDecisions: {
            names: ["Difficult Decisions"],
            thresholds: [1e9], // 1 billion cookies
            descs: ["Bake <b>1 billion cookies</b> without ever having more than <b>25 combined upgrades or buildings</b> at any given time, must be done in Born Again mode.<q>Some decisions leave no right answer, only consequences.</q>"],
            customIcons: [[23, 3, 'custom']],
            orders: [30500.102]
        },
        hardcoreLaidInPlainSight: {
            names: ["Laid in Plain Sight"],
            thresholds: [10], // 10 cookies per second
            descs: ["Bake <b>10 cookies per second</b> without purchasing any buildings, must be done in Born Again mode.<q>Eggsactly where you weren't looking!</q>"],
            customIcons: [[23, 4, 'custom']],
            orders: [30500.102]
        },
        hardcorePrecisionNerd: {
            names: ["Precision Nerd"],
            thresholds: [1234567890], // Exactly 1,234,567,890 cookies
            descs: ["Have exactly <b>1234567890 cookies</b> in your bank and hold it for <b>60 seconds</b>.<q>Last night's 'Itchy & Scratchy' was, without a doubt, the worst episode ever. Rest assured I was on the Internet within minutes registering my disgust throughout the world.</q>"],
            customIcons: [[23, 5, 'custom']],
            orders: [30500.102]
        },
        hardcoreTreadingWater: {
            names: ["Treading water"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Have a CPS of 0 while owning more than 1000 buildings with no active buffs, debuffs, or help from Solgreth<q>Sometimes it really feels like you are just not being very productive here.</q>"],
            customIcons: [[23, 12, 'custom']],
            orders: [30500.102]
        },
        hardcoreBouncingLastCheque: {
            names: ["Bouncing the last cheque"],
            thresholds: [0], // Dummy threshold, actual logic handled in requirement function
            descs: ["Reach less than 10 cookies in your bank after having at least 1 million cookies.<q>The very last cheque I write in my life I want to bounce.</q>"],
            customIcons: [[23, 14, 'custom']],
            orders: [30500.102]
        },
        hardcoreMassiveInheritance: {
            names: ["Massive Inheritance"],
            thresholds: [0],
            descs: ["Have a bank of at least <b>1 Novemdecillion cookies</b> within 10 minutes of ascending.<q>Well, look at you, a Heavenly Chips trust fund baby. Ever thought about earning your keep like the rest of us?</q>"],
            customIcons: [[23, 13, 'custom']],
            orders: [30500.102]
        },
        
        theFinalChallenger: {
            names: ["The Final Challenger"],
            thresholds: [10], // 10 out of 17 challenge achievements
            descs: ["Win <b>10</b> of the Just Natural Expansion <b>Challenge Achievements</b>.<q>You didn't just rise to the challenge… you baked it into a 12-layer cake.</q>"],
            customIcons: [[14, 12, 'custom']],
            orders: [30501]
        },
        
        // Stock market achievements
        stockBrokers: {
            names: ["Broiler room"],
            thresholds: [100], // 100 stockbrokers
            descs: ["Hire at least <b>100</b> stockbrokers in the Stock Market.<q>And there is no such thing as a no sale call. A sale is made on every call you make. Either you sell the client some stock or he sells you a reason he can't. Either way a sale is made, who's gonna close? You or him?</q>"],
            customIcons: [[23, 1, 'custom']],
            orders: [61616.358]
        },
        cookieClicks: {
            names: ["Buff Finger"],
            thresholds: [250000], // 250,000 cookie clicks
            descs: ["Click the cookie <b>250,000 times</b> across all ascensions.<q>I bet your index finger is bigger than the others now.</q>"],
            customIcons: [[12, 30]],
            orders: [7003]
        },
        pledges: {
            names: ["Deep elder nap"],
            thresholds: [666], // 666 pledges
            descs: ["Quash the grandmatriarchs one way or another <b>666 times</b> across all ascensions.<q>Those grandmatriarchs are really out, I can hear them snoring from the next town over.</q>"],
            customIcons: [[2, 9]],
            orders: [20000.090]
        },
        buffs: {
            names: ["Trifecta Combo", "Combo Initiate", "Combo God", "Combo Hacker", "Frenzy frenzy", "Double Dragon Clicker", "Frenzy Marathon", "Hogwarts Graduate", "Hogwarts Dropout", "Spell Slinger"],
            thresholds: [3, 6, 9, 12, 0, 0, 0, 0, 0, 0], // 3, 6, 9, 12 buffs active, frenzy frenzy, double dragon, frenzy marathon, wizard achievements, and spell slinger (handled separately)
            descs: ["Have <b>3 buffs</b> active at once.<q>Hey that was pretty neat!</q>", "Have <b>6 buffs</b> active at once.<q>Okay that was downright impressive clicking.</q>", "Have <b>9 buffs</b> active at once.<q>I can't even follow what you did there but it looked really cool.</q>", "Have <b>12 buffs</b> active at once.<q>I don't believe you, but for like real congrats if you did that.</q>", "Have all three frenzy buffs active at once.<q>Like pizza pizza but with more wrath.</q>", "Have a dragon flight and a click frenzy active at the same time.<q>Double the dragons, double the clicking!</q>", "Have a frenzy buff with a total duration of at least 10 minutes.<q>Who needs coffee when you have this much energy?</q>", "Have <b>3 positive Grimoire spell effects</b> active at once.<q>Merlin would be proud of your spellcraft!</q>", "Have <b>3 negative Grimoire spell effects</b> active at once.<q>The Sorting Hat made a terrible mistake!</q>", "Cast <b>10 spells</b> within a 10-second window.<q>Speed casting at its finest!</q>"],
            customIcons: [[25, 36], [26, 11], [22, 11], [23, 11], [23, 2, 'custom'], [30, 12], [22, 13], [30, 20], [31, 20], [32, 4]],
            orders: [25000.232, 25000.242, 25000.252, 25000.262, 25000.272, 25000.282, 25000.292, 25000.302, 25000.312, 25000.322]
        },
        prestigeUpgrades: {
            names: ["Beyond Prestige"],
            thresholds: [129], // All 129 prestige upgrades
            descs: ["Own all <b>129</b> original heavenly upgrades.<q>Prestige is just a stepping stone to whatever the hell this is.</q>"],
            customIcons: [[20, 7]],
            orders: [6001.598]
        },
        completionism: {
            names: ["Bearer of the Cookie Sigil"],
            thresholds: ["orderEternalCookie"],
            descs: ["Fully initiate into the Great Orders of the Cookie Age. Owning this achievement causes research to go <b>25%</b> faster, and random drops to appear <b>10%</b> more often.<q>A golden cookie sigil is forever affixed to your lapel, you refuse to elaborate further, if someone says the words strawberry milk and peanut butter cookies you immediately leave the room.</q>"],
            customIcons: [[19, 13, 'custom']],
            orders: [400000.3]
        }
        }
    },
    cookieUpgradeNames: [
        'Box of improved cookies', 'Order of the Golden Crumb', 'Order of the Impossible Batch', 'Order of the Shining Spoon', 'Order of the Cookie Eclipse', 'Order of the Enchanted Whisk', 'Order of the Eternal Cookie',
        'Improved Plain cookies', 'Improved Milk chocolate butter biscuit', 'Improved Dark chocolate butter biscuit', 'Improved White chocolate butter biscuit', 'Improved Ruby chocolate butter biscuit', 'Improved Lavender chocolate butter biscuit', 'Improved Synthetic chocolate green honey butter biscuit', 'Improved Sugar cookies', 'Improved Oatmeal raisin cookies', 'Improved Peanut butter cookies', 'Improved Coconut cookies', 'Improved Macadamia nut cookies', 'Improved Almond cookies', 'Improved Hazelnut cookies', 'Improved Walnut cookies', 'Improved Cashew cookies', 'Improved White chocolate cookies', 'Improved Milk chocolate cookies', 'Improved Double-chip cookies', 'Improved White chocolate macadamia nut cookies', 'Improved All-chocolate cookies', 'Improved Dark chocolate-coated cookies', 'Improved White chocolate-coated cookies', 'Improved Eclipse cookies', 'Improved Zebra cookies', 'Improved Snickerdoodles', 'Improved Stroopwafels', 'Improved Macaroons', 'Improved Empire biscuits', 'Improved Madeleines', 'Improved Palmiers'
    ],
    buildingUpgradeNames: [
        'Advanced knitting techniques', 'Bingo night optimization', 'Tea time efficiency', 'Gossip-powered baking', 'Senior discount mastery', 'Hydroponic cookie cultivation', 'Vertical farming revolution', 'Quantum crop rotation', 'Sentient soil enhancement', 'Temporal harvest acceleration', 'Quantum tunneling excavation', 'Neutron star compression', 'Dimensional rift mining', 'Singularity core extraction', 'Temporal paradox drilling', 'Quantum assembly optimization', 'Temporal manufacturing loops', 'Dimensional cookie synthesis', 'Singularity production cores', 'Reality-warping assembly', 'Quantum banking protocols', 'Temporal interest compounding', 'Dimensional currency exchange', 'Singularity financial algorithms', 'Reality-warping economics', 'Quantum divine intervention', 'Temporal prayer loops', 'Dimensional deity summoning', 'Singularity divine consciousness', 'Reality-warping divinity', 'Arcane resonance', 'Spell weaving', 'Mystical attunement', 'Ethereal manifestation', 'Transcendent thaumaturgy', 'Hypervelocity transport', 'Spatial compression', 'Dimensional routing', 'Quantum teleportation', 'Causality manipulation', 'Essence distillation', 'Molecular gastronomy', 'Flavor alchemy', 'Culinary transmutation', 'Gastronomic enlightenment', 'Dimensional gateways', 'Reality bridges', 'Spatial conduits', 'Interdimensional highways', 'Cosmic gateways', 'Temporal engineering', 'Chronological optimization', 'Historical preservation', 'Temporal synchronization', 'Chronological mastery', 'Particle synthesis', 'Matter transmutation', 'Quantum baking', 'Particle optimization', 'Matter manipulation', 'Light crystallization', 'Spectral baking', 'Optical alchemy', 'Luminous confectionery', 'Radiant gastronomy', 'Probability manipulation', 'Fortune optimization', 'Serendipity engineering', 'Random enhancement', 'Luck amplification', 'Infinite recursion', 'Self-similar baking', 'Fractal optimization', 'Recursive enhancement', 'Fractal gastronomy', 'Code optimization', 'Programmatic baking', 'Algorithmic enhancement', 'Computational gastronomy', 'Digital confectionery', 'Reality real estate', 'Dimensional franchising', 'Cosmic supply chains', 'Reality marketplaces', 'Multiverse headquarters', 'Neural plasticity', 'Synaptic pruning', 'Cognitive load balancing', 'Metacognitive awareness', 'Neural synchronization', 'Mitotic mastery', 'Epigenetic programming', 'Cellular differentiation', 'Telomere regeneration', 'Quantum entanglement', 'Increased Social Security Checks', 'Off-Brand Eyeglasses', 'Plastic Walkers', 'Bulk Discount Hearing Aids', 'Generic Arthritis Medication', 'Wholesale Denture Adhesive', 'Biodiesel fueled tractors', 'Free manure from clone factories', 'Solar-powered irrigation systems', 'Bulk seed purchases', 'Robot farm hands', 'Vertical farming subsidies', 'Clearance shaft kits', 'Punch-card TNT club', 'Hand-me-down hardhats', 'Lease-back drill rigs', 'Ore cartel coupons', 'Cave-in insurance kickbacks', 'Flat-pack factory frames', 'BOGO rivet bins', 'Off-brand gear grease', 'Misprint warning labels', 'Pallet-jack rebates', 'Prefab cookie modules', 'Piggy buyback bonanza', 'Vault door floor-models', 'Pen-on-a-chain procurement', 'Complimentary complimentary mints', 'Fee waiver wavers', 'Dough Jones clearance', 'Tithe punch cards', 'Relic replica racks', 'Incense refill program', 'Chant-o-matic hymn reels', 'Pew-per-view sponsorships', 'Sacred site tax amnesty', 'Wand warranty returns', 'Grimoire remainder sale', 'Robes with "character"', 'Familiar foster program', 'Council scroll stipends', 'Broom-sharing scheme', 'Retired cargo pods', 'Container co-op cards', 'Reusable launch crates', 'Autodocker apprentices', 'Route rebate vouchers', 'Free-trade cookie ports', 'Beaker buybacks', 'Philosopher\'s pebbles', 'Cool-running crucibles', 'Batch homunculi permits', 'Guild reagent rates', '"Mostly lead" gold grants', 'Pre-owned ring frames', 'Anchor warehouse club', 'Passive rift baffles', 'Volunteer gatekeepers', 'Interrealm stipend scrolls', 'Multiversal enterprise zone', 'Pre-loved hourglasses', 'Depreciated timeline scraps', 'Off-season flux valves', 'Weekend paradox passes', 'Department of When grants', 'Antique warranty loopholes', 'Certified negamatter cans', 'Matter swap rebates', 'Low-idle annihilators', 'Grad-lab particle labor', 'Institute endowment match', 'Void-zone incentives', 'Lens co-op exchange', 'Spectral seconds', 'Sleep-mode rainbows', 'Apprentice refractioneers', 'Arts-of-Optics grants', 'Rainbow renewal credits', 'Misprinted fortunes', 'Reroll refund policy', 'Economy-grade omens', 'Volunteer augury nights', 'Lottery board matching', 'Lucky district waivers', 'Iteration liquidation', 'Self-similar spare parts', 'Recursion rebates', 'Autogenerator residencies', 'Grant-funded proofs', 'Infinite-lot variances', 'Refurb dev boards', 'Compiler credit program', 'Idle-friendly runtimes', 'Peer-review co-ops', 'Open-source grants', 'Cloud credit vouchers', 'Interdimensional tax breaks', 'Reality consolidation discounts', 'Cosmic bulk purchasing', 'Multiverse supplier networks', 'Dimensional economies of scale', 'Reality monopoly pricing', 'Neural bulk purchasing', 'Synaptic wholesale networks', 'Cerebral mass production', 'Mind monopoly pricing', 'Neural economies of scale', 'Synaptic supply dominance', 'Clone factory economies', 'Replica production lines', 'Mirror manufacturing mastery', 'Twin tycoon pricing', 'Doppelganger discount networks', 'Clone supply dominance'
    ],
    achievementFlavorText: {
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
    },
    productionAchievements: [
        { building: 'Cursor', name: 'Click (starring Adam Sandler)', tier4Name: 'Click II: the sequel', tier5Name: 'Click III: we couldn\'t get Adam Sandler so it stars Jerry Seinfeld for some reason', tier6Name: 'Click IV: 3% fresh on rotten tomatoes', tier4Desc: 'Make <b>100 quindecillion cookies</b> just from cursors.', tier5Desc: 'Make <b>100 sexdecillion cookies</b> just from cursors.', tier6Desc: 'Make <b>100 septendecillion cookies</b> just from cursors.', mult: 7, tier4Order: 1070.337, tier5Order: 1070.338, tier6Order: 1070.339 },
        { building: 'Grandma', name: 'Frantiquities', tier4Name: 'Scone with the wind', tier5Name: 'The flour of youth', tier6Name: 'Bake-ageddon', tier4Desc: 'Make <b>100 quindecillion cookies</b> just from grandmas.', tier5Desc: 'Make <b>100 sexdecillion cookies</b> just from grandmas.', tier6Desc: 'Make <b>100 septendecillion cookies</b> just from grandmas.', mult: 6, tier4Order: 1120.338, tier5Order: 1120.339, tier6Order: 1120.340 },
        { building: 'Farm', name: 'Overgrowth', tier4Name: 'Rake in the greens', tier5Name: 'The great threshering', tier6Name: 'Bushels of burden', tier4Desc: 'Make <b>1 quattuordecillion cookies</b> just from farms.', tier5Desc: 'Make <b>1 quindecillion cookies</b> just from farms.', tier6Desc: 'Make <b>1 sexdecillion cookies</b> just from farms.', mult: 0, tier4Order: 1220.339, tier5Order: 1220.340, tier6Order: 1220.341 },
        { building: 'Mine', name: 'Sedimentalism', tier4Name: 'Ore d\'oeuvres', tier5Name: 'Seismic yield', tier6Name: 'Billionaire\'s bedrock', tier4Desc: 'Make <b>10 quattuordecillion cookies</b> just from mines.', tier5Desc: 'Make <b>10 quindecillion cookies</b> just from mines.', tier6Desc: 'Make <b>10 sexdecillion cookies</b> just from mines.', mult: 0, tier4Order: 1320.340, tier5Order: 1320.341, tier6Order: 1320.342 },
        { building: 'Factory', name: 'Labor of love', tier4Name: 'Sweatshop symphony', tier5Name: 'Cookieconomics 101', tier6Name: 'Mass production messiah', tier4Desc: 'Make <b>100 quattuordecillion cookies</b> just from factories.', tier5Desc: 'Make <b>100 quindecillion cookies</b> just from factories.', tier6Desc: 'Make <b>100 sexdecillion cookies</b> just from factories.', mult: 0, tier4Order: 1420.341, tier5Order: 1420.342, tier6Order: 1420.343 },
        { building: 'Bank', name: 'Reverse funnel system', tier4Name: 'Compound interest, compounded', tier5Name: 'Arbitrage avalanche', tier6Name: 'Ponzi à la mode', tier4Desc: 'Make <b>1 quindecillion cookies</b> just from banks.', tier5Desc: 'Make <b>1 sexdecillion cookies</b> just from banks.', tier6Desc: 'Make <b>1 septendecillion cookies</b> just from banks.', mult: 0, tier4Order: 1445.342, tier5Order: 1445.343, tier6Order: 1445.344 },
        { building: 'Temple', name: 'Thus spoke you', tier4Name: 'Temple treasury overflow', tier5Name: 'Pantheon payout', tier6Name: 'Sacred surplus', tier4Desc: 'Make <b>10 quindecillion cookies</b> just from temples.', tier5Desc: 'Make <b>10 sexdecillion cookies</b> just from temples.', tier6Desc: 'Make <b>10 septendecillion cookies</b> just from temples.', mult: 0, tier4Order: 1470.343, tier5Order: 1470.344, tier6Order: 1470.345 },
        { building: 'Wizard tower', name: 'Manafest destiny', tier4Name: 'Rabbits per minute', tier5Name: 'Hocus bonus', tier6Name: 'Magic dividends', tier4Desc: 'Make <b>100 quindecillion cookies</b> just from wizard towers.', tier5Desc: 'Make <b>100 sexdecillion cookies</b> just from wizard towers.', tier6Desc: 'Make <b>100 septendecillion cookies</b> just from wizard towers.', mult: 0, tier4Order: 1495.344, tier5Order: 1495.345, tier6Order: 1495.346 },
        { building: 'Shipment', name: 'Neither snow nor rain nor heat nor gloom of night', tier4Name: 'Cargo cult classic', tier5Name: 'Universal basic shipping', tier6Name: 'Comet-to-consumer', tier4Desc: 'Make <b>1 sexdecillion cookies</b> just from shipments.', tier5Desc: 'Make <b>1 septendecillion cookies</b> just from shipments.', tier6Desc: 'Make <b>1 octodecillion cookies</b> just from shipments.', mult: 0, tier4Order: 1520.345, tier5Order: 1520.346, tier6Order: 1520.347 },
        { building: 'Alchemy lab', name: 'I\'ve got the Midas touch', tier4Name: 'Lead into bread', tier5Name: 'Philosopher\'s yield', tier6Name: 'Auronomical returns', tier4Desc: 'Make <b>10 sexdecillion cookies</b> just from alchemy labs.', tier5Desc: 'Make <b>10 septendecillion cookies</b> just from alchemy labs.', tier6Desc: 'Make <b>10 octodecillion cookies</b> just from alchemy labs.', mult: 0, tier4Order: 1620.346, tier5Order: 1620.347, tier6Order: 1620.348 },
        { building: 'Portal', name: 'Which eternal lie', tier4Name: 'Spacetime surcharge', tier5Name: 'Interdimensional yield farming', tier6Name: 'Event-horizon markup', tier4Desc: 'Make <b>100 sexdecillion cookies</b> just from portals.', tier5Desc: 'Make <b>100 septendecillion cookies</b> just from portals.', tier6Desc: 'Make <b>100 octodecillion cookies</b> just from portals.', mult: 0, tier4Order: 1720.347, tier5Order: 1720.348, tier6Order: 1720.349 },
        { building: 'Time machine', name: 'D&eacute;j&agrave; vu', tier4Name: 'Future Profits, Past Tense', tier5Name: 'Infinite Loop, Infinite Loot', tier6Name: 'Back Pay from the Big Bang', tier4Desc: 'Make <b>1 septendecillion cookies</b> just from time machines.', tier5Desc: 'Make <b>1 octodecillion cookies</b> just from time machines.', tier6Desc: 'Make <b>1 novemdecillion cookies</b> just from time machines.', mult: 0, tier4Order: 1820.348, tier5Order: 1820.349, tier6Order: 1820.350 },
        { building: 'Antimatter condenser', name: 'Powers of Ten', tier4Name: 'Pair production payout', tier5Name: 'Cross-section surplus', tier6Name: 'Powers of crumbs', tier4Desc: 'Make <b>10 septendecillion cookies</b> just from antimatter condensers.', tier5Desc: 'Make <b>10 octodecillion cookies</b> just from antimatter condensers.', tier6Desc: 'Make <b>10 novemdecillion cookies</b> just from antimatter condensers.', mult: 0, tier4Order: 1920.349, tier5Order: 1920.350, tier6Order: 1920.351 },
        { building: 'Prism', name: 'Now the dark days are gone', tier4Name: 'Photons pay dividends', tier5Name: 'Spectral surplus', tier6Name: 'Dawn of plenty', tier4Desc: 'Make <b>100 septendecillion cookies</b> just from prisms.', tier5Desc: 'Make <b>100 octodecillion cookies</b> just from prisms.', tier6Desc: 'Make <b>100 novemdecillion cookies</b> just from prisms.', mult: 0, tier4Order: 2020.350, tier5Order: 2020.351, tier6Order: 2020.352 },
        { building: 'Chancemaker', name: 'Murphy\'s wild guess', tier4Name: 'Against all odds & ends', tier5Name: 'Monte Carlo windfall', tier6Name: 'Fate-backed securities', tier4Desc: 'Make <b>1 octodecillion cookies</b> just from chancemakers.', tier5Desc: 'Make <b>1 novemdecillion cookies</b> just from chancemakers.', tier6Desc: 'Make <b>1 vigintillion cookies</b> just from chancemakers.', mult: 0, tier4Order: 2120.356, tier5Order: 2120.357, tier6Order: 2120.358 },
        { building: 'Fractal engine', name: 'We must go deeper', tier4Name: 'Infinite series surplus', tier5Name: 'Geometric mean feast', tier6Name: 'Fractal jackpot', tier4Desc: 'Make <b>10 octodecillion cookies</b> just from fractal engines.', tier5Desc: 'Make <b>10 novemdecillion cookies</b> just from fractal engines.', tier6Desc: 'Make <b>10 vigintillion cookies</b> just from fractal engines.', mult: 0, tier4Order: 2220.447, tier5Order: 2220.448, tier6Order: 2220.449 },
        { building: 'Javascript console', name: 'First-class citizen', tier4Name: 'Cookies per second()++', tier5Name: 'Promise.all(paydays)', tier6Name: 'Async and ye shall receive', tier4Desc: 'Make <b>100 octodecillion cookies</b> just from javascript consoles.', tier5Desc: 'Make <b>100 novemdecillion cookies</b> just from javascript consoles.', tier6Desc: 'Make <b>100 vigintillion cookies</b> just from javascript consoles.', mult: 0, tier4Order: 2320.467, tier5Order: 2320.468, tier6Order: 2320.469 },
        { building: 'Idleverse', name: 'Earth-616', tier4Name: 'Crossover dividends', tier5Name: 'Many-Worlds ROI', tier6Name: 'Continuity bonus', tier4Desc: 'Make <b>1 novemdecillion cookies</b> just from idleverses.', tier5Desc: 'Make <b>1 vigintillion cookies</b> just from idleverses.', tier6Desc: 'Make <b>1 unvigintillion cookies</b> just from idleverses.', mult: 0, tier4Order: 2420.545, tier5Order: 2420.546, tier6Order: 2420.547 },
        { building: 'Cortex baker', name: 'Unthinkable', tier4Name: 'Brainstorm dividend', tier5Name: 'Thought economy boom', tier6Name: 'Neural net worth', tier4Desc: 'Make <b>10 novemdecillion cookies</b> just from cortex bakers.', tier5Desc: 'Make <b>10 vigintillion cookies</b> just from cortex bakers.', tier6Desc: 'Make <b>10 unvigintillion cookies</b> just from cortex bakers.', mult: 0, tier4Order: 2520.575, tier5Order: 2520.576, tier6Order: 2520.577 },
        { building: 'You', name: 'That\'s all you', tier4Name: 'Personal growth', tier5Name: 'Economies of selves', tier6Name: 'Self-sustaining singularity', tier4Desc: 'Make <b>100 novemdecillion cookies</b> just from You.', tier5Desc: 'Make <b>100 vigintillion cookies</b> just from You.', tier6Desc: 'Make <b>100 unvigintillion cookies</b> just from You.', mult: 0, tier4Order: 2620.637, tier5Order: 2620.638, tier6Order: 2620.639 }
    ],
    vanillaThresholds: {
        'Cursor': 33,
        'Grandma': 33,
        'Farm': 28,
        'Mine': 29,
        'Factory': 30,
        'Bank': 31,
        'Temple': 32,
        'Wizard tower': 33,
        'Shipment': 34,
        'Alchemy lab': 35,
        'Portal': 36,
        'Time machine': 37,
        'Antimatter condenser': 38,
        'Prism': 39,
        'Chancemaker': 40,
        'Fractal engine': 41,
        'Javascript console': 42,
        'Idleverse': 43,
        'Cortex baker': 44,
        'You': 45
    },
    levelAchievements: [
        { building: 'Cursor', level10: 'Freaky jazz hands', level15: 'Rowdy shadow puppets', level15Order: 1070.317, level20: 'Frantic finger guns', level20Order: 1070.327 },
        { building: 'Grandma', level10: 'Methuselah', level15: 'Loaf & behold', level15Order: 1120.318, level20: 'Forbidden fruitcake', level20Order: 1120.328 },
        { building: 'Farm', level10: 'Huge tracts of land', level15: 'Huge-er tracts of land', level15Order: 1220.319, level20: 'Hoedown showdown', level20Order: 1220.329 },
        { building: 'Mine', level10: 'D-d-d-d-deeper', level15: 'Cave-in king', level15Order: 1320.32, level20: 'Digging destiny', level20Order: 1320.33 },
        { building: 'Factory', level10: 'Patently genius', level15: 'Boilerplate overlord', level15Order: 1420.321, level20: 'Cookie standard time', level20Order: 1420.331 },
        { building: 'Bank', level10: 'A capital idea', level15: 'Credit conjurer', level15Order: 1445.322, level20: 'Master of the Mint', level20Order: 1445.332 },
        { building: 'Temple', level10: 'It belongs in a bakery', level15: 'Acolyte ascendant', level15Order: 1470.323, level20: 'Grand hierophant', level20Order: 1470.333 },
        { building: 'Wizard tower', level10: 'Motormouth', level15: 'Archmage of Meringue', level15Order: 1495.324, level20: 'Chronomancer emeritus', level20Order: 1495.334 },
        { building: 'Shipment', level10: 'Been there done that', level15: 'Quartermaster of Orbits', level15Order: 1520.325, level20: 'Docking director', level20Order: 1520.335 },
        { building: 'Alchemy lab', level10: 'Phlogisticated substances', level15: 'Retort wrangler', level15Order: 1620.326, level20: 'Circle of Quintessence', level20Order: 1620.336 },
        { building: 'Portal', level10: 'Bizarro world', level15: 'Non-Euclidean doorman', level15Order: 1720.327, level20: 'Warden of Elsewhere', level20Order: 1720.337 },
        { building: 'Time machine', level10: 'The long now', level15: 'Minute handler', level15Order: 1820.328, level20: 'Chronarch supreme', level20Order: 1820.338 },
        { building: 'Antimatter condenser', level10: 'Chubby hadrons', level15: 'Quark wrangler', level15Order: 1920.329, level20: 'Symmetry breaker', level20Order: 1920.339 },
        { building: 'Prism', level10: 'Palettable', level15: 'Master of refraction', level15Order: 2020.33, level20: 'Keeper of the seven hues', level20Order: 2020.34 },
        { building: 'Chancemaker', level10: 'Let\'s leaf it at that', level15: 'Seedkeeper of Fortune', level15Order: 2120.346, level20: 'Master of Maybe', level20Order: 2120.356 },
        { building: 'Fractal engine', level10: 'Sierpinski rhomboids', level15: 'Archfractal', level15Order: 2220.437, level20: 'Lord of Infinite Detail', level20Order: 2220.447 },
        { building: 'Javascript console', level10: 'Alexandria', level15: 'Stack tracer', level15Order: 2320.457, level20: 'Event-loop overlord', level20Order: 2320.467 },
        { building: 'Idleverse', level10: 'Strange topologies', level15: 'Canon custodian', level15Order: 2420.535, level20: 'Keeper of the Uncountable', level20Order: 2420.545 },
        { building: 'Cortex baker', level10: 'Gifted', level15: 'Chief Thinker Officer', level15Order: 2520.565, level20: 'Mind over batter', level20Order: 2520.575 },
        { building: 'You', level10: 'Self-improvement', level15: 'Identity custodian', level15Order: 2620.627, level20: 'First Person Plural', level20Order: 2620.637 }
    ]
};

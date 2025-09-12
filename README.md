# Just Natural Expansion
### A Cookie Clicker Mod

## Table of Contents
* [Installation Directions](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#installation-directions)
* [Mod Compatibility](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#mod-compatibility)
* [New Achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-achievements)
* [New Upgrades](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-upgrades)
* [Changelog](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#changelog)

**The Just Natural Expansion Mod** enhances the Cookie Clicker endgame without disrupting core gameplay, staying true to the spirit of the vanilla experience. It introduces over **450 achievements**, **250 upgrades**, new goals, new stories, and deeply rooted hidden elements, all specifically designed for late-game progression, so early or mid-game players may not immediately notice changes. 

By default, the mod adds no upgrades and marks new achievements as shadow, allowing leaderboard and competition focused players to pursue extra challenges without affecting their current gameplay. 

Players aiming for higher scores and a more rewarding late-game can enable Cookie, Kitten, and Building upgrades, while also converting shadow achievements into regular ones to gain extra milk for their efforts. These upgrades can be disabled at any time, and shadow achievements can be re-enabled via the options menu. However, a permanent shadow achievement will be awarded to mark that you have used the mod outside of leaderboard/competition mode.

Many achievements are tracked across multiple ascensions or involve progress that the base game does not normally record, such as popping Shiny Wrinklers. While you may have already completed some of these, there is no way to determine your progress on them unless the mod was installed at the time they were achieved. Progress on items not tracked by the vanilla game or not carried across ascensions will only start being recorded once the mod is active. You can view additional tracked stats and their current values in the Stats menu.

**All new achievements are designed to be attainable, though some require significant effort, some even taking weeks of focused effort to earn. Thank you for playing! If you enjoy the mod, please spread the word!**

#### Special Thanks
Extra gooey gratitude to the mysterious hero who uploaded the custom Cookie Clicker icons I stumbled upon on [Imgur](https://imgur.com/3jNJJNw). If you ever reveal yourself, I will shower you with credit (and maybe a few billion cookies). Those icons patched up some stubborn gaps that were giving me dough-induced headaches.

Big, chocolate-covered thanks to the amazing folks in the [Cookie Clicker Discord](https://discord.com/invite/cookie), whose late-game wisdom and strategic tips helped shape this mod into the crunchy masterpiece it is today. 

Thank you to the beta testers who were willing to help me balance and test, I have now struck a balance between people saying these achivements are too hard and these achievements are too easy, which I suspect is the sweet middle ground. 

#### Why This Mod Exists

When I reached the late game of Cookie Clicker, I felt a real sense of loss. I was running out of meaningful goals. I looked for mods that could extend the experience without radically changing the core gameplay.

Most of what I found didn’t fit. Many end-game mods added flashy new buildings or mechanics that didn’t feel true to vanilla and often weren’t balanced. Others offered extremely difficult, sometimes nearly impossible, achievements. Those were closer to what I wanted, but I wasn’t looking for “impossible.” I wanted more of what made the base game fun.

So I set out to imagine what Cookie Clicker would feel like if it simply lasted longer with deeper goals to chase. Achievements are challenging but not unreasonable, designed for active players who like having long-term targets. Nothing breaks the existing formula (though I had to heavily nerf the new kittens to keep them balanced). The intent was always to extend the game, not reinvent it. Do not expect to knock out these achievements or upgrades in a few days. Many require weeks of planning and patience. The idea is to add lasting goals, not hand out free milk and CPS.

I hope this mod hits that mark and gives you years more clicking, planning, and cookie glory. If not, I’ll still enjoy it myself, since I built what I wanted to play. If you do find something broken or unreasonable, reach out on Discord (User: DFSW). I am always happy to discuss and evaluate.

## Installation Directions

Installing mods and add-ons for Cookie Clicker can feel intimidating if you’ve never done it before. To get some background, check out this [guide from the wiki](https://cookieclicker.fandom.com/wiki/Add-Ons) Below, you’ll find specific instructions to help you get everything set up.

#### Web (Preferred)

##### [CookieClickerModManager](https://github.com/klattmose/CookieClickerModManager) - Recommended
`https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@latest/JustNaturalExpansion.js`

##### [Bookmarklet](https://www.freecodecamp.org/news/what-are-bookmarklets/)
```javascript
javascript:(function(){Game.LoadMod('https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@latest/JustNaturalExpansion.js');})();
```

##### Direct Console Loading
```javascript
Game.LoadMod('https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@latest/JustNaturalExpansion.js');
```

#### Steam
Can be found by searching for "Just Natural Expansion" in the Steam Workshop for Cookie Clicker

#### Console (untested - but should work in theory)
```javascript
Game.LoadMod('https://cdn.jsdelivr.net/gh/dfsw/Just-Natural-Expansion@latest/JustNaturalExpansion.js');
```

#### Mobile
The mobile version of Cookie Clicker does not support mods at this time.

#### Compatibility Notes
- **CCSE Compatible**: Works with Cookie Clicker Script Extender
- **CCMM Compatible**: Works with Cookie Clicker Mod Manager
- **Load Order**: For best compatibility, load CCSE first, then this mod
- **Browser Support**: Works in all modern browsers 

#### Mod Compatibility

Just Natural Expansion uses Cookie Clicker’s documented API layer to extend the core game. As a result, Just Natural Expansion should remain functional for years to come—even if I get hit by a bus. However this API is fairly limited, so many modders rely on [CCSE](https://klattmose.github.io/CookieClicker/CCSE-POCs/). 

Unfortunately, CCSE uses code injection to make fundamental changes to the vanilla game’s source code, which breaks the built-in modding API in a handful of places. To address this, I’ve written a CCSE Bridge that allows CCSE mods and Just Natural Expansion to run together. The catch: **CCSE must be loaded before** Just Natural Expansion, so make sure JNE is last in your load order. Other modders are welcome to use my bridge code (located in the same repo) if they prefer a more vanilla mod approach. 

I’ve tested compatibility with many popular [CCSE mods](https://klattmose.github.io/CookieClicker/). If you encounter specific incompatibilities, please let me know so I can look into possible workarounds.

# New Achievements

### Challenge Achievements (19 achievements)
*Note: Yes, these challenges are all doable, and no, none of them are absurdly impossible (No [ECM Style](https://lookas123.github.io/ECM/) Here). But don’t expect a free ride. These achievements will not hold your hand, and they will not go easy on you. Think of them less as a grind and more as puzzles that demand clever planning, precise timing, and maybe a lucky cookie or a well-placed upgrade. This is late-game content meant to extend your playtime, not something to finish in a single week.*

##### Requires Born Again Mode
- **Hardercorest**: Bake **3 billion cookies** with no cookie clicks and no upgrades bought in Born Again mode
- **Hardercorest-er**: Bake **1 billion cookies** with no more than 20 clicks, no more than 20 buildings (no selling), and no more than 20 upgrades in Born Again mode
- **The Final Countdown**: Own exactly 20 Cursors, 19 Grandmas, 18 Farms, yada yada yada, down to 1 You. No selling or sacrificing any buildings. Must be earned in Born Again mode
- **Really more of a dog person**: Bake **1 billion cookies per second** without buying any kitten upgrades in Born Again mode
- **Gilded Restraint**: Bake **1 trillion cookies** without ever clicking a golden cookie, must be done in Born Again mode
- **Back to Basic Bakers**: Reach **1 million cookies per second** using only Cursors and Grandmas (no other buildings), must be done in Born Again mode
- **Modest Portfolio**: Reach **1 quadrillion cookies** without ever owning more than 10 of any building type (no selling), must be done in Born Again mode
- **Difficult Decisions**: Bake **1 billion cookies** without ever having more than **25 combined upgrades or buildings** at any given time, must be done in Born Again mode
- **Laid in Plain Sight**: Bake **10 cookies per second** without purchasing any buildings, must be done in Born Again mode

##### Can Be Done In Any Mode
- **I feel the need for seed**: Unlock all garden seeds within **5 days** of your last garden sacrifice. Look this one is tricky, if you reload or load a save the 5 day timer is invalidated, so you cant load in a completed garden.
- **Holiday Hoover**: Collect all seasonal drops within **60 minutes** of an Ascension start
- **Merry Mayhem**: Collect all seasonal drops within **40 minutes** of an Ascension start
- **Second Life, First Click**: Click a golden cookie within **120 seconds** of ascending
- **We dont need no heavenly chips**: Own at least **333 of every building type**, without owning the 'Heavenly chip secret' upgrade
- **Precision Nerd**: Have exactly **1,234,567,890 cookies** in your bank and hold it for **60 seconds**
- **Treading water**: Have a CPS of 0 while owning more than 1000 buildings with no active buffs or debuffs
- **Bouncing the last cheque**: Reach less than 10 cookies in your bank after having at least 1 million cookies
- **Massive Inheritance**: Have a bank of at least **1 Novemdecillion cookies** within 10 minutes of ascending
- **The Final Challenger**: Win **10** of the Just Natural Expansion **Challenge Achievements** 

### Minigame Achievements (29 achievements)

#### Stock Market
- **Doughfolio Debut**: Have **$25 million** in stock market profits across all ascensions
- **Crumb Fund Manager**: Have **$100 million** in stock market profits across all ascensions
- **Biscuit Market Baron**: Have **$250 million** in stock market profits across all ascensions
- **Fortune Cookie Tycoon**: Have **$500 million** in stock market profits across all ascensions
- **Dough Jones Legend**: Have **$1 billion** in stock market profits across all ascensions
- **The Dough Jones Plunge**: Have **$1 million** in stock market losses in one ascension
- **Broiler room**: Hire at least **100** stockbrokers in the Stock Market

#### Garden
- **Seedless to eternity**: Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **5 times**
- **Seedless to infinity**: Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **10 times**
- **Seedless to beyond**: Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **25 times**
- **Greener, aching thumb**: Harvest **2,000 mature garden plants** across all ascensions
- **Greenest, aching thumb**: Harvest **3,000 mature garden plants** across all ascensions
- **Photosynthetic prodigy**: Harvest **5,000 mature garden plants** across all ascensions
- **Garden master**: Harvest **7,500 mature garden plants** across all ascensions
- **Plant whisperer**: Harvest **10,000 mature garden plants** across all ascensions
- **Botanical Perfection**: Have one of every type of plant in the mature stage at once
- **Duketater Salad**: Harvest **12 mature Duketaters** simultaneously
- **Fifty Shades of Clay**: Change the soil type of your Garden **100 times** in one ascension
- See also **I feel the need for seed**

#### Grimoire
- **Archwizard**: Cast **1,999 spells** across all ascensions
- **Spellmaster**: Cast **2,999 spells** across all ascensions
- **Cookieomancer**: Cast **3,999 spells** across all ascensions
- **Spell lord**: Cast **4,999 spells** across all ascensions
- **Magic emperor**: Cast **9,999 spells** across all ascensions
- **Hogwarts Graduate**: Have **3 positive Grimoire spell effects** active at once
- **Hogwarts Dropout**: Have **3 negative Grimoire spell effects** active at once
- **Spell Slinger**: Cast **10 spells** within a 10-second window
- **Sweet Sorcery**: Get the **Free Sugar Lump** outcome from a magically spawned golden cookie

#### Pantheon
- **Faithless Loyalty**: Swap gods in the Pantheon **100 times** in one ascension
- **God of All Gods**: Use each pantheon god for at least **24 hours** total across all ascensions

### Seasonal Achievements (9 achievements)
- **Calendar Abuser**: Switch seasons **50 times** in one ascension
- **Reindeer destroyer**: Pop **500 reindeer** across all ascensions
- **Reindeer obliterator**: Pop **1,000 reindeer** across all ascensions
- **Reindeer extinction event**: Pop **2,000 reindeer** across all ascensions
- **Reindeer apocalypse**: Pop **5,000 reindeer** across all ascensions
- **Cupid's Reindeer**: Pop a reindeer during **Valentine's Day season**
- **Business Reindeer**: Pop a reindeer during **Business Day season**
- **Bundeer**: Pop a reindeer during **Easter season**
- **Ghost Reindeer**: Pop a reindeer during **Halloween season**
- See also **Holiday Hoover** and **Merry Mayhem**

### Completionist Achievements (7 achievements)
- **Vanilla Star**: Own all **622 original achievements**
- **Sweet Child of Mine**: Own **100 sugar lumps** at once
- **Beyond Prestige**: Own all **129 original heavenly upgrades**
- **Kitten jamboree**: Own all **18 original kittens**
- **Kitten Fiesta**: Own all **18 original kittens** and all **11 expansion kittens** at once
- **Bearer of the Cookie Sigil**: Fully initiate into the Great Orders of the Cookie Age. Provides **25% faster research** and **10% more random drops** (See Upgrades Section for More Info)
- **In the Shadows**: Unlock all vanilla shadow achievements, except that one.
- See also **The Final Challenger**

### Combo Achievements (7 achievements)
- **Trifecta Combo**: Have **3 buffs** active at once
- **Combo Initiate**: Have **6 buffs** active at once
- **Combo God**: Have **9 buffs** active at once
- **Combo Hacker**: Have **12 buffs** active at once
- **Frenzy frenzy**: Have all three frenzy buffs active at once
- **Double Dragon Clicker**: Have a dragon flight and a click frenzy active at the same time
- **Frenzy Marathon**: Have a frenzy buff with a total duration of at least **10 minutes**

### CPS Achievements (6 achievements)
- **Beyond the speed of dough**: Bake **1 octodecillion** per second
- **Speed of sound**: Bake **10 octodecillion** per second
- **Speed of light**: Bake **100 octodecillion** per second
- **Faster than light**: Bake **1 novemdecillion** per second
- **Speed of thought**: Bake **10 novemdecillion** per second
- **Faster than speed of thought**: Bake **100 novemdecillion** per second

### Click Achievements (9 achievements)
- **Click of the Titans**: Generate **1 year of raw CPS** in a single cookie click 
- **Buff Finger**: Click the cookie **250,000 times** across all ascensions
- **News ticker addict**: Click on the news ticker **1,000 times** in one ascension
- **Click god**: Make **1 vigintillion** from clicking
- **Click emperor**: Make **1 duovigintillion** from clicking
- **Click overlord**: Make **1 quattuorvigintillion** from clicking
- **Click sovereign**: Make **1 sexvigintillion** from clicking
- **Click monarch**: Make **1 octovigintillion** from clicking
- **Click deity supreme**: Make **1 trigintillion** from clicking

### Grandmapocalypse Achievements (15 achievements)
- **Wrinkler annihilator**: Burst **666 wrinklers** across all ascensions
- **Wrinkler eradicator**: Burst **2,666 wrinklers** across all ascensions
- **Wrinkler extinction event**: Burst **6,666 wrinklers** across all ascensions
- **Wrinkler apocalypse**: Burst **16,666 wrinklers** across all ascensions
- **Wrinkler armageddon**: Burst **26,666 wrinklers** across all ascensions
- **Rare specimen collector**: Burst **2 shiny wrinklers** across all ascensions
- **Endangered species hunter**: Burst **5 shiny wrinklers** across all ascensions
- **Extinction event architect**: Burst **10 shiny wrinklers** across all ascensions
- **Golden wrinkler**: Burst a wrinkler worth **6.66 years of CPS**
- **Wrinkler Rush**: Pop a wrinkler within **15 minutes and 30 seconds** of ascending
- **Wrinkler Windfall**: Sextuple (6x) your bank with a single wrinkler pop
- **Deep elder nap**: Quash the grandmatriarchs one way or another **666 times** across all ascensions
- **Warm-Up Ritual**: Click **66 wrath cookies** across all ascensions
- **Deal of the Slightly Damned**: Click **666 wrath cookies** across all ascensions
- **Baker of the Beast**: Click **6,666 wrath cookies** across all ascensions

### Golden Cookie Achievements (6 achievements)
- **Black cat's other paw**: Click **17,777 golden cookies** across all ascensions
- **Black cat's third paw**: Click **37,777 golden cookies** across all ascensions
- **Black cat's fourth paw**: Click **47,777 golden cookies** across all ascensions
- **Black cat's fifth paw**: Click **57,777 golden cookies** across all ascensions
- **Black cat's sixth paw**: Click **67,777 golden cookies** across all ascensions
- **Black cat's seventh paw**: Click **77,777 golden cookies** across all ascensions
- See also **Gilded Restraint** and **Second Life, First Click**

### Cookies Baked In Ascension Achievements (7 achievements)
- **The Doughpocalypse**: Bake **10 trevigintillion cookies** in one ascension
- **The Flour Flood**: Bake **1 quattuorvigintillion cookies** in one ascension
- **The Ovenverse**: Bake **100 quattuorvigintillion cookies** in one ascension
- **The Crumb Crusade**: Bake **10 quinvigintillion cookies** in one ascension
- **The Final Batch**: Bake **1 sexvigintillion cookies** in one ascension
- **The Ultimate Ascension**: Bake **100 sexvigintillion cookies** in one ascension
- **The Transcendent Rise**: Bake **10 septenvigintillion cookies** in one ascension

### Forfeited Cookies Achievements (13 achievements)
- **Dante's unwaking dream**: Forfeit **1 novemdecillion cookies** total across all ascensions
- **The abyss gazes back**: Forfeit **1 vigintillion cookies** total across all ascensions
- **Charon's final toll**: Forfeit **1 unvigintillion cookies** total across all ascensions
- **Cerberus's third head**: Forfeit **1 duovigintillion cookies** total across all ascensions
- **Minos's eternal judgment**: Forfeit **1 trevigintillion cookies** total across all ascensions
- **The river Styx flows backward**: Forfeit **1 quattuorvigintillion cookies** total across all ascensions
- **Ixion's wheel spins faster**: Forfeit **1 quinvigintillion cookies** total across all ascensions
- **Sisyphus's boulder crumbles**: Forfeit **1 sexvigintillion cookies** total across all ascensions
- **Tantalus's eternal thirst**: Forfeit **1 septenvigintillion cookies** total across all ascensions
- **The ninth circle's center**: Forfeit **1 octovigintillion cookies** total across all ascensions
- **Lucifer's frozen tears**: Forfeit **1 novemvigintillion cookies** total across all ascensions
- **Beyond the void's edge**: Forfeit **1 trigintillion cookies** total across all ascensions
- **The final descent's end**: Forfeit **1 untrigintillion cookies** total across all ascensions

### Building Ownership Achievements (13 achievements)
- **Septcentennial and a half**: Have at least **750 of everything**
- **Octcentennial**: Have at least **800 of everything**
- **Octcentennial and a half**: Have at least **850 of everything**
- **Nonacentennial**: Have at least **900 of everything**
- **Nonacentennial and a half**: Have at least **950 of everything**
- **Millennial**: Have at least **1,000 of everything**
- **Building behemoth**: Own **15,000 buildings**
- **Construction colossus**: Own **20,000 buildings**
- **Architectural apex**: Own **25,000 buildings**
- **Asset Liquidator**: Sell **25,000 buildings** in one ascension
- **Flip City**: Sell **50,000 buildings** in one ascension
- **Ghost Town Tycoon**: Sell **100,000 buildings** in one ascension
- **Have your sugar and eat it too**: Have every building reach **level 10**
- See also **The Final Countdown**, **Back to Basic Bakers**, **Modest Portfolio**, **Difficult Decisions**, and **Treading water**

### Reincarnation Achievements (3 achievements)
- **Ascension master**: Ascend **250 times**
- **Ascension legend**: Ascend **500 times**
- **Ascension deity**: Ascend **999 times**

### Building Achievements (220 achievements)
**Total: 220 achievements**

*Note: All achievements require owning the specified number of buildings.*

- **Cursor**: Carpal diem (1,100 cursors), Hand over fist (1,150 cursors), Finger guns (1,250 cursors), Thumbs up, buttercup (1,300 cursors), Pointer sisters (1,400 cursors), Knuckle sandwich (1,450 cursors), Phalanx formation (1,550 cursors), Manual override (1,600 cursors), Clickbaiter-in-chief (1,700 cursors), With flying digits (1,750 cursors), Palm before the storm (1,850 cursors)
- **Grandma**: Doughy doyenne (750 grandmas), Batter nana (800 grandmas), Crust custodian (850 grandmas), Oven oracle (900 grandmas), Whisk whisperer (950 grandmas), Proofing matriarch (1,000 grandmas), Rolling-pin regent (1,050 grandmas), Larder luminary (1,100 grandmas), Hearth highness (1,150 grandmas), Biscotti baroness (1,200 grandmas), Panjandrum of pastry (1,250 grandmas)
- **Farm**: Till titan (750 farms), Mulch magnate (800 farms), Loam lord (850 farms), Furrow foreman (900 farms), Compost captain (950 farms), Acre archon (1,000 farms), Silo sovereign (1,050 farms), Bushel baron (1,100 farms), Seed syndicate (1,150 farms), Harvest high table (1,200 farms), Soil sultan supreme (1,250 farms)
- **Mine**: Vein viceroy (750 mines), Shaft superintendent (800 mines), Bedrock baron (850 mines), Lantern lord (900 mines), Ore orchestrator (950 mines), Strata strategist (1,000 mines), Pit prefect (1,050 mines), Pickaxe paragon (1,100 mines), Gravel governor (1,150 mines), Fault-line foreman (1,200 mines), Core sample czar (1,250 mines)
- **Factory**: Gear grandee (750 factories), Conveyor commissioner (800 factories), Sprocket sovereign (850 factories), Blueprint boss (900 factories), Forge forecaster (950 factories), Lathe luminary (1,000 factories), Press primarch (1,050 factories), QA queen/king (1,100 factories), Throughput theocrat (1,150 factories), Assembly autarch (1,200 factories), Production paramount (1,250 factories)
- **Bank**: Ledger luminary (750 banks), Vault vanguard (800 banks), Interest idol (850 banks), Bond baron (900 banks), Hedge high priest (950 banks), Dividend duke (1,000 banks), Capital chancellor (1,050 banks), Liquidity laureate (1,100 banks), Spread sovereign (1,150 banks), Reserve regent (1,200 banks), Seigniorage supreme (1,250 banks)
- **Temple**: Biscuit beatified (750 temples), Piety pâtissier (800 temples), Relic ringmaster (850 temples), Canticle captain (900 temples), Pilgrim provost (950 temples), Parable patriarch (1,000 temples), Litany laureate (1,050 temples), Censer sentinel (1,100 temples), Basilica bigwig (1,150 temples), Tithe tsar (1,200 temples), Beatific baker (1,250 temples)
- **Wizard Tower**: Rune registrar (750 wizard towers), Hex headmaster (800 wizard towers), Sigil steward (850 wizard towers), Scroll shepherd (900 wizard towers), Wand warden (950 wizard towers), Cauldron chancellor (1,000 wizard towers), Thaumaturge tribune (1,050 wizard towers), Cantrip curator (1,100 wizard towers), Leyline lord (1,150 wizard towers), Familiar field marshal (1,200 wizard towers), Archwizard emeritus (1,250 wizard towers)
- **Shipment**: Manifest maestro (750 shipments), Hull highlord (800 shipments), Dockyard director (850 shipments), Orbital outfitter (900 shipments), Freight field marshal (950 shipments), Warpway warden (1,000 shipments), Cargo cartographer (1,050 shipments), Starport sahib (1,100 shipments), Payload patriarch (1,150 shipments), Customs czar (1,200 shipments), Interstellar impresario (1,250 shipments)
- **Alchemy Lab**: Alembic adjudicator (750 alchemy labs), Crucible custodian (800 alchemy labs), Reagent regent (850 alchemy labs), Retort ringleader (900 alchemy labs), Tincture tycoon (950 alchemy labs), Catalyst chancellor (1,000 alchemy labs), Elixir elder (1,050 alchemy labs), Precipitate prefect (1,100 alchemy labs), Distillate duke (1,150 alchemy labs), Sublimate sovereign (1,200 alchemy labs), Magnum opus magnate (1,250 alchemy labs)
- **Portal**: Gate gauger (750 portals), Rift rector (800 portals), Threshold thaum (850 portals), Liminal lawgiver (900 portals), Tesseract trustee (950 portals), Nth-entrance envoy (1,000 portals), Event-horizon emir (1,050 portals), Portal provost (1,100 portals), Keymaster kingpin (1,150 portals), Waystone warden (1,200 portals), Multidoor magistrate (1,250 portals)
- **Time Machine**: Tick-tock trustee (750 time machines), Chrono chieftain (800 time machines), Paradox provost (850 time machines), Epoch executor (900 time machines), Aeon alderman (950 time machines), Timeline tactician (1,000 time machines), Loop legislator (1,050 time machines), Era eminence (1,100 time machines), Causality constable (1,150 time machines), Continuum custodian (1,200 time machines), Grandfather-clause governor (1,250 time machines)
- **Antimatter Condenser**: Vacuum vicar (750 antimatter condensers), Negamass nabob (800 antimatter condensers), Quark quartermaster (850 antimatter condensers), Hadron high bailiff (900 antimatter condensers), Singularity steward (950 antimatter condensers), Boson baron (1,000 antimatter condensers), Lepton lieutenant (1,050 antimatter condensers), Isotope imperator (1,100 antimatter condensers), Reactor regnant (1,150 antimatter condensers), Nullspace notary (1,200 antimatter condensers), Entropy esquire (1,250 antimatter condensers)
- **Prism**: Photon prefect (750 prisms), Spectrum superintendent (800 prisms), Refraction regent (850 prisms), Rainbow registrar (900 prisms), Lumen laureate (950 prisms), Prism prelate (1,000 prisms), Chromatic chancellor (1,050 prisms), Beam baronet (1,100 prisms), Halo highlord (1,150 prisms), Diffraction duke (1,200 prisms), Radiance regnant (1,250 prisms)
- **Chancemaker**: Odds officer (750 chancemakers), Fortune foreman (800 chancemakers), Serendipity superintendent (850 chancemakers), Gambit governor (900 chancemakers), Probability provost (950 chancemakers), Fate facilitator (1,000 chancemakers), Draw director (1,050 chancemakers), Jackpot jurist (1,100 chancemakers), Pips preceptor (1,150 chancemakers), Stochastic sovereign (1,200 chancemakers), Luck laureate (1,250 chancemakers)
- **Fractal Engine**: Mandel monarch (750 fractal engines), Koch kingpin (800 fractal engines), Cantor custodian (850 fractal engines), Julia jurist (900 fractal engines), Sierpiński steward (950 fractal engines), Iteration imperator (1,000 fractal engines), Recursion regent (1,050 fractal engines), Self-similarity sheriff (1,100 fractal engines), Pattern praetor (1,150 fractal engines), Infinite indexer (1,200 fractal engines), Depth-first demigod (1,250 fractal engines)
- **Javascript Console**: Lint lord (750 javascript consoles), Closure captain (800 javascript consoles), Async archon (850 javascript consoles), Promise prelate (900 javascript consoles), Scope sovereign (950 javascript consoles), Hoist highness (1,000 javascript consoles), Node notable (1,050 javascript consoles), Regex regent (1,100 javascript consoles), Bundle baron (1,150 javascript consoles), Sandbox seer (1,200 javascript consoles), Runtime regnant (1,250 javascript consoles)
- **Idleverse**: Multiverse marshal (750 idleverses), Replica rector (800 idleverses), Shard shepherd (850 idleverses), Universe underwriter (900 idleverses), Realm regent (950 idleverses), Cosmos comptroller (1,000 idleverses), Omniverse ombuds (1,050 idleverses), Dimension director (1,100 idleverses), Reality registrar (1,150 idleverses), Plane provost (1,200 idleverses), Horizon high steward (1,250 idleverses)
- **Cortex Baker**: Synapse superintendent (750 cortex bakers), Cortex commissioner (800 cortex bakers), Gyrus governor (850 cortex bakers), Lobe luminary (900 cortex bakers), Neuron notable (950 cortex bakers), Axon adjudicator (1,000 cortex bakers), Myelin magistrate (1,050 cortex bakers), Thalamus thegn (1,100 cortex bakers), Cerebellum chancellor (1,150 cortex bakers), Prefrontal prelate (1,200 cortex bakers), Mind monarch (1,250 cortex bakers)
- **You**: Me manager (750 You), Doppel director (800 You), Mirror minister (850 You), Clone commissioner (900 You), Copy chieftain (950 You), Echo executor (1,000 You), Facsimile foreman (1,050 You), Reflection regent (1,100 You), Duplicate duke (1,150 You), Replica regnant (1,200 You), Self supreme (1,250 You)

### Building Production Achievements (60 achievements)

- **Cursor**: Click (starring Adam Sandler) II - Make **1 septendecillion cookies** just from cursors
- **Cursor**: Click (starring Adam Sandler) III - Make **1 quindecillion cookies** just from cursors
- **Cursor**: Click (starring Adam Sandler) IV - Make **1 sexdecillion cookies** just from cursors
- **Grandma**: Frantiquities II - Make **1 septendecillion cookies** just from grandmas
- **Grandma**: Frantiquities III - Make **1 quindecillion cookies** just from grandmas
- **Grandma**: Frantiquities IV - Make **1 sexdecillion cookies** just from grandmas
- **Farm**: Overgrowth II - Make **1 quattuordecillion cookies** just from farms
- **Farm**: Overgrowth III - Make **1 quindecillion cookies** just from farms
- **Farm**: Overgrowth IV - Make **1 sexdecillion cookies** just from farms
- **Mine**: Sedimentalism II - Make **10 quattuordecillion cookies** just from mines
- **Mine**: Sedimentalism III - Make **10 quindecillion cookies** just from mines
- **Mine**: Sedimentalism IV - Make **10 sexdecillion cookies** just from mines
- **Factory**: Labor of love II - Make **100 quattuordecillion cookies** just from factories
- **Factory**: Labor of love III - Make **100 quindecillion cookies** just from factories
- **Factory**: Labor of love IV - Make **100 sexdecillion cookies** just from factories
- **Bank**: Reverse funnel system II - Make **1 quindecillion cookies** just from banks
- **Bank**: Reverse funnel system III - Make **1 sexdecillion cookies** just from banks
- **Bank**: Reverse funnel system IV - Make **1 septendecillion cookies** just from banks
- **Temple**: Thus spoke you II - Make **10 quindecillion cookies** just from temples
- **Temple**: Thus spoke you III - Make **10 sexdecillion cookies** just from temples
- **Temple**: Thus spoke you IV - Make **10 septendecillion cookies** just from temples
- **Wizard Tower**: Manafest destiny II - Make **100 quindecillion cookies** just from wizard towers
- **Wizard Tower**: Manafest destiny III - Make **100 sexdecillion cookies** just from wizard towers
- **Wizard Tower**: Manafest destiny IV - Make **100 septendecillion cookies** just from wizard towers
- **Shipment**: Neither snow nor rain nor heat nor gloom of night II - Make **1 sexdecillion cookies** just from shipments
- **Shipment**: Neither snow nor rain nor heat nor gloom of night III - Make **1 septendecillion cookies** just from shipments
- **Shipment**: Neither snow nor rain nor heat nor gloom of night IV - Make **1 octodecillion cookies** just from shipments
- **Alchemy Lab**: I've got the Midas touch II - Make **10 sexdecillion cookies** just from alchemy labs
- **Alchemy Lab**: I've got the Midas touch III - Make **10 septendecillion cookies** just from alchemy labs
- **Alchemy Lab**: I've got the Midas touch IV - Make **10 octodecillion cookies** just from alchemy labs
- **Portal**: Which eternal lie II - Make **100 sexdecillion cookies** just from portals
- **Portal**: Which eternal lie III - Make **100 septendecillion cookies** just from portals
- **Portal**: Which eternal lie IV - Make **100 octodecillion cookies** just from portals
- **Time Machine**: Déjà vu II - Make **1 septendecillion cookies** just from time machines
- **Time Machine**: Déjà vu III - Make **1 octodecillion cookies** just from time machines
- **Time Machine**: Déjà vu IV - Make **1 novemdecillion cookies** just from time machines
- **Antimatter Condenser**: Powers of Ten II - Make **10 septendecillion cookies** just from antimatter condensers
- **Antimatter Condenser**: Powers of Ten III - Make **10 octodecillion cookies** just from antimatter condensers
- **Antimatter Condenser**: Powers of Ten IV - Make **10 novemdecillion cookies** just from antimatter condensers
- **Prism**: Now the dark days are gone II - Make **100 septendecillion cookies** just from prisms
- **Prism**: Now the dark days are gone III - Make **100 octodecillion cookies** just from prisms
- **Prism**: Now the dark days are gone IV - Make **100 novemdecillion cookies** just from prisms
- **Chancemaker**: Murphy's wild guess II - Make **1 octodecillion cookies** just from chancemakers
- **Chancemaker**: Murphy's wild guess III - Make **1 novemdecillion cookies** just from chancemakers
- **Chancemaker**: Murphy's wild guess IV - Make **1 vigintillion cookies** just from chancemakers
- **Fractal Engine**: We must go deeper II - Make **10 octodecillion cookies** just from fractal engines
- **Fractal Engine**: We must go deeper III - Make **10 novemdecillion cookies** just from fractal engines
- **Fractal Engine**: We must go deeper IV - Make **10 vigintillion cookies** just from fractal engines
- **Javascript Console**: First-class citizen II - Make **100 octodecillion cookies** just from javascript consoles
- **Javascript Console**: First-class citizen III - Make **100 novemdecillion cookies** just from javascript consoles
- **Javascript Console**: First-class citizen IV - Make **100 vigintillion cookies** just from javascript consoles
- **Idleverse**: Earth-616 II - Make **1 novemdecillion cookies** just from idleverses
- **Idleverse**: Earth-616 III - Make **100 vigintillion cookies** just from idleverses
- **Idleverse**: Earth-616 IV - Make **10 duovigintillion cookies** just from idleverses
- **Cortex Baker**: Unthinkable II - Make **10 novemdecillion cookies** just from cortex bakers
- **Cortex Baker**: Unthinkable III - Make **10 vigintillion cookies** just from cortex bakers
- **Cortex Baker**: Unthinkable IV - Make **10 unvigintillion cookies** just from cortex bakers
- **You**: That's all you II - Make **100 novemdecillion cookies** just from You
- **You**: That's all you III - Make **100 vigintillion cookies** just from You
- **You**: That's all you IV - Make **100 unvigintillion cookies** just from You

### Building Level Achievements (40 achievements)

##### Cursor
- **Spastic jazz hands**: Reach **level 15** Cursors  
- **Epileptic jazz hands**: Reach **level 20** Cursors

##### Grandma
- **Noah**: Reach **level 15** Grandmas
- **Adam**: Reach **level 20** Grandmas

##### Farm
- **Massive tracts of land**: Reach **level 15** Farms
- **Colossal tracts of land**: Reach **level 20** Farms

##### Mine
- **D-d-d-d-d-deeper**: Reach **level 15** Mines
- **D-d-d-d-d-d-deeper**: Reach **level 20** Mines

##### Factory
- **Patent pending**: Reach **level 15** Factories
- **Patent granted**: Reach **level 20** Factories

##### Bank
- **A capital notion**: Reach **level 15** Banks
- **A capital concept**: Reach **level 20** Banks

##### Temple
- **It belongs in a cathedral**: Reach **level 15** Temples
- **It belongs in a basilica**: Reach **level 20** Temples

##### Wizard Tower
- **Chatterbox**: Reach **level 15** Wizard Towers
- **Blabbermouth**: Reach **level 20** Wizard Towers

##### Shipment
- **Been everywhere done everything**: Reach **level 15** Shipments
- **Been everywhere done everything twice**: Reach **level 20** Shipments

##### Alchemy Lab
- **Phlogisticated compounds**: Reach **level 15** Alchemy Labs
- **Phlogisticated elements**: Reach **level 20** Alchemy Labs

##### Portal
- **Bizarro universe**: Reach **level 15** Portals
- **Bizarro multiverse**: Reach **level 20** Portals

##### Time Machine
- **The longer now**: Reach **level 15** Time Machines
- **The longest now**: Reach **level 20** Time Machines

##### Antimatter Condenser
- **Plump hadrons**: Reach **level 15** Antimatter Condensers
- **Obese hadrons**: Reach **level 20** Antimatter Condensers

##### Prism
- **Palettastic**: Reach **level 15** Prisms
- **Palettacular**: Reach **level 20** Prisms

##### Chancemaker
- **Lucky stars**: Reach **level 15** Chancemakers
- **Lucky numbers**: Reach **level 20** Chancemakers

##### Fractal Engine
- **Fractaliciousest**: Reach **level 15** Fractal Engines
- **Fractalicious**: Reach **level 20** Fractal Engines

##### Javascript Console
- **Debuggerer**: Reach **level 15** Javascript Consoles
- **Debuggerest**: Reach **level 20** Javascript Consoles

##### Idleverse
- **Idleverse implosion**: Reach **level 15** Idleverses
- **Idleverse explosion**: Reach **level 20** Idleverses

##### Cortex Baker
- **Brain feast**: Reach **level 15** Cortex Bakers
- **Brain banquet**: Reach **level 20** Cortex Bakers

##### You
- **Copy that and a half**: Reach **level 15** Yous
- **Copy that twice**: Reach **level 20** Yous

# New Upgrades

### The Great Orders of the Cookie Age
*Long before ovens were kindled and sugar knew its name, there arose six Orders, bakers, mystics, and crumb-guardians whose deeds shaped the fate of cookies forevermore. Each sworn to a creed, each guarding secrets older than the dough itself. - Transcribed by Crumblekeeper Thryce, 3rd Sifter of the Sacred Pantry*

- **Order of the Golden Crumb**: Golden cookies appear **5%** more often. (requires [Vanilla Star achievement](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#completionist-achievements-7-achievements))
- **Order of the Impossible Batch**: Golden cookies appear **5%** more often. (requires The [Final Challenger achievement](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#challenge-achievements-19-achievements))
- **Order of the Shining Spoon**: Golden cookie effects last **5%** longer. (requires all [Combo achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#combo-achievements-7-achievements))
- **Order of the Cookie Eclipse**: Golden cookie effects last **5%** longer. (requires all [Grandmapocalypse achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#grandmapocalypse-achievements-15-achievements)) 
- **Order of the Enchanted Whisk**: Frenzy, Click Frenzy, and Elder Frenzy buffs are **5%** more powerful. (requires all [Grimoire achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#grimoire))
- **Order of the Eternal Cookie**: Golden cookies appear **5%** more often and effects last **5%** longer.(requires all previous Great Orders of the Cookie Age upgrades) 

### Kitten Upgrades (11 New Kitten Upgrades)
*Note: Expansion Kittens are the knock-off brand: cute, cuddly, and noticeably worse at their job. Don’t expect them to pull their weight like original vanilla flavored kittens, but they sure as heck do try hard.*

- **Kitten unpaid interns**: Provides small production bonus (requires 500 achievements)
- **Kitten overpaid "temporary" contractors**: Provides small production bonus (requires 550 achievements)
- **Kitten remote workers**: Provides small production bonus (requires 600 achievements)
- **Kitten scrum masters**: Provides small production bonus (requires 650 achievements)
- **Kitten UX designers**: Provides small production bonus (requires 700 achievements)
- **Kitten janitors**: Provides small production bonus (requires 750 achievements)
- **Kitten coffee fetchers**: Provides small production bonus (requires 800 achievements)
- **Kitten personal assistants**: Provides small production bonus (requires 850 achievements)
- **Kitten vice presidents**: Provides small production bonus (requires 900 achievements)
- **Kitten board members**: Provides small production bonus (requires 950 achievements)
- **Kitten founders**: Provides small production bonus (requires 1000 achievements)

### Generic Upgrades
- **Box of improved cookies**: Contains an assortment of scientifically improved cookies, 25 cookies to a box.

### Cookie Production Upgrades (25 New Cookies)
- **Improved Plain cookies**: 2% cookie production increase
- **Improved Sugar cookies**: 2% cookie production increase
- **Improved Oatmeal raisin cookies**: 2% cookie production increase
- **Improved Peanut butter cookies**: 2% cookie production increase
- **Improved Coconut cookies**: 2% cookie production increase
- **Improved Macadamia nut cookies**: 2% cookie production increase
- **Improved Almond cookies**: 2% cookie production increase
- **Improved Hazelnut cookies**: 2% cookie production increase
- **Improved Walnut cookies**: 2% cookie production increase
- **Improved Cashew cookies**: 2% cookie production increase
- **Improved White chocolate cookies**: 2% cookie production increase
- **Improved Milk chocolate cookies**: 2% cookie production increase
- **Improved Double-chip cookies**: 2% cookie production increase
- **Improved White chocolate macadamia nut cookies**: 2% cookie production increase
- **Improved All-chocolate cookies**: 2% cookie production increase
- **Improved Dark chocolate-coated cookies**: 2% cookie production increase
- **Improved White chocolate-coated cookies**: 2% cookie production increase
- **Improved Eclipse cookies**: 2% cookie production increase
- **Improved Zebra cookies**: 2% cookie production increase
- **Improved Snickerdoodles**: 2% cookie production increase
- **Improved Stroopwafels**: 2% cookie production increase
- **Improved Macaroons**: 2% cookie production increase
- **Improved Empire biscuits**: 2% cookie production increase
- **Improved Madeleines**: 2% cookie production increase
- **Improved Palmiers**: 2% cookie production increase

### Building Count Reward Cookies
- **Improved Milk chocolate butter biscuit**: 10% cookie production increase (requires at least 750 of every building type)
- **Improved Dark chocolate butter biscuit**: 10% cookie production increase (requires at least 800 of every building type)
- **Improved White chocolate butter biscuit**: 10% cookie production increase (requires at least 850 of every building type)
- **Improved Ruby chocolate butter biscuit**: 10% cookie production increase (requires at least 900 of every building type)
- **Improved Lavender chocolate butter biscuit**: 10% cookie production increase (requires at least 950 of every building type)
- **Improved Synthetic chocolate green honey butter biscuit**: 10% cookie production increase (requires at least 1,000 of every building type)

### Building Upgrades (Efficiency + Cost Reductions) (209 Upgrades)
*Note: These upgrades provide cumulative 5% cost reductions for their respective buildings. Each upgrade applies a 5% discount to the remaining cost, so owning all 6 upgrades for a building provides approximately a 26.5% total discount.*

##### Grandma
- **Increased Social Security Checks**: Grandmas cost **5%** less (requires 750 grandmas)
- **Advanced knitting techniques**: Grandmas are **8%** more efficient (requires 800 grandmas)
- **Off-Brand Eyeglasses**: Grandmas cost **5%** less (requires 850 grandmas)
- **Bingo night optimization**: Grandmas are **8%** more efficient (requires 900 grandmas)
- **Plastic Walkers**: Grandmas cost **5%** less (requires 950 grandmas)
- **Tea time efficiency**: Grandmas are **8%** more efficient (requires 1000 grandmas)
- **Bulk Discount Hearing Aids**: Grandmas cost **5%** less (requires 1050 grandmas)
- **Gossip-powered baking**: Grandmas are **8%** more efficient (requires 1100 grandmas)
- **Generic Arthritis Medication**: Grandmas cost **5%** less (requires 1150 grandmas)
- **Senior discount mastery**: Grandmas are **8%** more efficient (requires 1200 grandmas)
- **Wholesale Denture Adhesive**: Grandmas cost **5%** less (requires 1250 grandmas)

##### Farm
- **Biodiesel fueled tractors**: Farms cost **5%** less (requires 750 farms)
- **Hydroponic cookie cultivation**: Farms are **8%** more efficient (requires 800 farms)
- **Free manure from clone factories**: Farms cost **5%** less (requires 850 farms)
- **Vertical farming revolution**: Farms are **8%** more efficient (requires 900 farms)
- **Solar-powered irrigation systems**: Farms cost **5%** less (requires 950 farms)
- **Quantum crop rotation**: Farms are **8%** more efficient (requires 1000 farms)
- **Bulk seed purchases**: Farms cost **5%** less (requires 1050 farms)
- **Sentient soil enhancement**: Farms are **8%** more efficient (requires 1100 farms)
- **Robot farm hands**: Farms cost **5%** less (requires 1150 farms)
- **Temporal harvest acceleration**: Farms are **8%** more efficient (requires 1200 farms)
- **Vertical farming subsidies**: Farms cost **5%** less (requires 1250 farms)

##### Mine
- **Clearance shaft kits**: Mines cost **5%** less (requires 750 mines)
- **Quantum tunneling excavation**: Mines are **8%** more efficient (requires 800 mines)
- **Punch-card TNT club**: Mines cost **5%** less (requires 850 mines)
- **Neutron star compression**: Mines are **8%** more efficient (requires 900 mines)
- **Hand-me-down hardhats**: Mines cost **5%** less (requires 950 mines)
- **Dimensional rift mining**: Mines are **8%** more efficient (requires 1000 mines)
- **Lease-back drill rigs**: Mines cost **5%** less (requires 1050 mines)
- **Singularity core extraction**: Mines are **8%** more efficient (requires 1100 mines)
- **Ore cartel coupons**: Mines cost **5%** less (requires 1150 mines)
- **Temporal paradox drilling**: Mines are **8%** more efficient (requires 1200 mines)
- **Cave-in insurance kickbacks**: Mines cost **5%** less (requires 1250 mines)

##### Factory
- **Flat-pack factory frames**: Factories cost **5%** less (requires 750 factories)
- **Quantum assembly optimization**: Factories are **8%** more efficient (requires 800 factories)
- **BOGO rivet bins**: Factories cost **5%** less (requires 850 factories)
- **Temporal manufacturing loops**: Factories are **8%** more efficient (requires 900 factories)
- **Off-brand gear grease**: Factories cost **5%** less (requires 950 factories)
- **Dimensional cookie synthesis**: Factories are **8%** more efficient (requires 1000 factories)
- **Misprint warning labels**: Factories cost **5%** less (requires 1050 factories)
- **Singularity production cores**: Factories are **8%** more efficient (requires 1100 factories)
- **Pallet-jack rebates**: Factories cost **5%** less (requires 1150 factories)
- **Reality-warping assembly**: Factories are **8%** more efficient (requires 1200 factories)
- **Prefab cookie modules**: Factories cost **5%** less (requires 1250 factories)

##### Bank
- **Piggy buyback bonanza**: Banks cost **5%** less (requires 750 banks)
- **Quantum banking protocols**: Banks are **8%** more efficient (requires 800 banks)
- **Vault door floor-models**: Banks cost **5%** less (requires 850 banks)
- **Temporal interest compounding**: Banks are **8%** more efficient (requires 900 banks)
- **Pen-on-a-chain procurement**: Banks cost **5%** less (requires 950 banks)
- **Dimensional currency exchange**: Banks are **8%** more efficient (requires 1000 banks)
- **Complimentary complimentary mints**: Banks cost **5%** less (requires 1050 banks)
- **Singularity financial algorithms**: Banks are **8%** more efficient (requires 1100 banks)
- **Fee waiver wavers**: Banks cost **5%** less (requires 1150 banks)
- **Reality-warping economics**: Banks are **8%** more efficient (requires 1200 banks)
- **Dough Jones clearance**: Banks cost **5%** less (requires 1250 banks)

##### Temple
- **Tithe punch cards**: Temples cost **5%** less (requires 750 temples)
- **Quantum divine intervention**: Temples are **8%** more efficient (requires 800 temples)
- **Relic replica racks**: Temples cost **5%** less (requires 850 temples)
- **Temporal prayer loops**: Temples are **8%** more efficient (requires 900 temples)
- **Incense refill program**: Temples cost **5%** less (requires 950 temples)
- **Dimensional deity summoning**: Temples are **8%** more efficient (requires 1000 temples)
- **Chant-o-matic hymn reels**: Temples cost **5%** less (requires 1050 temples)
- **Singularity divine consciousness**: Temples are **8%** more efficient (requires 1100 temples)
- **Pew-per-view sponsorships**: Temples cost **5%** less (requires 1150 temples)
- **Reality-warping divinity**: Temples are **8%** more efficient (requires 1200 temples)
- **Sacred site tax amnesty**: Temples cost **5%** less (requires 1250 temples)

##### Wizard Tower
- **Wand warranty returns**: Wizard towers cost **5%** less (requires 750 wizard towers)
- **Arcane resonance**: Wizard towers are **8%** more efficient (requires 800 wizard towers)
- **Grimoire remainder sale**: Wizard towers cost **5%** less (requires 850 wizard towers)
- **Spell weaving**: Wizard towers are **8%** more efficient (requires 900 wizard towers)
- **Robes with “character”**: Wizard towers cost **5%** less (requires 950 wizard towers)
- **Mystical attunement**: Wizard towers are **8%** more efficient (requires 1000 wizard towers)
- **Familiar foster program**: Wizard towers cost **5%** less (requires 1050 wizard towers)
- **Ethereal manifestation**: Wizard towers are **8%** more efficient (requires 1100 wizard towers)
- **Council scroll stipends**: Wizard towers cost **5%** less (requires 1150 wizard towers)
- **Transcendent thaumaturgy**: Wizard towers are **8%** more efficient (requires 1200 wizard towers)
- **Broom-sharing scheme**: Wizard towers cost **5%** less (requires 1250 wizard towers)

##### Shipment
- **Retired cargo pods**: Shipments cost **5%** less (requires 750 shipments)
- **Hypervelocity transport**: Shipments are **8%** more efficient (requires 800 shipments)
- **Container co-op cards**: Shipments cost **5%** less (requires 850 shipments)
- **Spatial compression**: Shipments are **8%** more efficient (requires 900 shipments)
- **Reusable launch crates**: Shipments cost **5%** less (requires 950 shipments)
- **Dimensional routing**: Shipments are **8%** more efficient (requires 1000 shipments)
- **Autodocker apprentices**: Shipments cost **5%** less (requires 1050 shipments)
- **Quantum teleportation**: Shipments are **8%** more efficient (requires 1100 shipments)
- **Route rebate vouchers**: Shipments cost **5%** less (requires 1150 shipments)
- **Causality manipulation**: Shipments are **8%** more efficient (requires 1200 shipments)
- **Free-trade cookie ports**: Shipments cost **5%** less (requires 1250 shipments)

##### Alchemy Lab
- **Beaker buybacks**: Alchemy labs cost **5%** less (requires 750 alchemy labs)
- **Essence distillation**: Alchemy labs are **8%** more efficient (requires 800 alchemy labs)
- **Philosopher’s pebbles**: Alchemy labs cost **5%** less (requires 850 alchemy labs)
- **Molecular gastronomy**: Alchemy labs are **8%** more efficient (requires 900 alchemy labs)
- **Cool-running crucibles**: Alchemy labs cost **5%** less (requires 950 alchemy labs)
- **Flavor alchemy**: Alchemy labs are **8%** more efficient (requires 1000 alchemy labs)
- **Batch homunculi permits**: Alchemy labs cost **5%** less (requires 1050 alchemy labs)
- **Culinary transmutation**: Alchemy labs are **8%** more efficient (requires 1100 alchemy labs)
- **Guild reagent rates**: Alchemy labs cost **5%** less (requires 1150 alchemy labs)
- **Gastronomic enlightenment**: Alchemy labs are **8%** more efficient (requires 1200 alchemy labs)
- **“Mostly lead” gold grants**: Alchemy labs cost **5%** less (requires 1250 alchemy labs)

##### Portal
- **Pre-owned ring frames**: Portals cost **5%** less (requires 750 portals)
- **Dimensional gateways**: Portals are **8%** more efficient (requires 800 portals)
- **Anchor warehouse club**: Portals cost **5%** less (requires 850 portals)
- **Reality bridges**: Portals are **8%** more efficient (requires 900 portals)
- **Passive rift baffles**: Portals cost **5%** less (requires 950 portals)
- **Spatial conduits**: Portals are **8%** more efficient (requires 1000 portals)
- **Volunteer gatekeepers**: Portals cost **5%** less (requires 1050 portals)
- **Interdimensional highways**: Portals are **8%** more efficient (requires 1100 portals)
- **Interrealm stipend scrolls**: Portals cost **5%** less (requires 1150 portals)
- **Cosmic gateways**: Portals are **8%** more efficient (requires 1200 portals)
- **Multiversal enterprise zone**: Portals cost **5%** less (requires 1250 portals)

##### Time Machine
- **Pre-loved hourglasses**: Time machines cost **5%** less (requires 750 time machines)
- **Temporal engineering**: Time machines are **8%** more efficient (requires 800 time machines)
- **Depreciated timeline scraps**: Time machines cost **5%** less (requires 850 time machines)
- **Chronological optimization**: Time machines are **8%** more efficient (requires 900 time machines)
- **Off-season flux valves**: Time machines cost **5%** less (requires 950 time machines)
- **Historical preservation**: Time machines are **8%** more efficient (requires 1000 time machines)
- **Weekend paradox passes**: Time machines cost **5%** less (requires 1050 time machines)
- **Temporal synchronization**: Time machines are **8%** more efficient (requires 1100 time machines)
- **Department of When grants**: Time machines cost **5%** less (requires 1150 time machines)
- **Chronological mastery**: Time machines are **8%** more efficient (requires 1200 time machines)
- **Antique warranty loopholes**: Time machines cost **5%** less (requires 1250 time machines)

##### Antimatter Condenser
- **Certified negamatter cans**: Antimatter condensers cost **5%** less (requires 750 antimatter condensers)
- **Particle synthesis**: Antimatter condensers are **8%** more efficient (requires 800 antimatter condensers)
- **Matter swap rebates**: Antimatter condensers cost **5%** less (requires 850 antimatter condensers)
- **Matter transmutation**: Antimatter condensers are **8%** more efficient (requires 900 antimatter condensers)
- **Low-idle annihilators**: Antimatter condensers cost **5%** less (requires 950 antimatter condensers)
- **Quantum baking**: Antimatter condensers are **8%** more efficient (requires 1000 antimatter condensers)
- **Grad-lab particle labor**: Antimatter condensers cost **5%** less (requires 1050 antimatter condensers)
- **Particle optimization**: Antimatter condensers are **8%** more efficient (requires 1100 antimatter condensers)
- **Institute endowment match**: Antimatter condensers cost **5%** less (requires 1150 antimatter condensers)
- **Matter manipulation**: Antimatter condensers are **8%** more efficient (requires 1200 antimatter condensers)
- **Void-zone incentives**: Antimatter condensers cost **5%** less (requires 1250 antimatter condensers)

##### Prism
- **Lens co-op exchange**: Prisms cost **5%** less (requires 750 prisms)
- **Light crystallization**: Prisms are **8%** more efficient (requires 800 prisms)
- **Spectral seconds**: Prisms cost **5%** less (requires 850 prisms)
- **Spectral baking**: Prisms are **8%** more efficient (requires 900 prisms)
- **Sleep-mode rainbows**: Prisms cost **5%** less (requires 950 prisms)
- **Optical alchemy**: Prisms are **8%** more efficient (requires 1000 prisms)
- **Apprentice refractioneers**: Prisms cost **5%** less (requires 1050 prisms)
- **Luminous confectionery**: Prisms are **8%** more efficient (requires 1100 prisms)
- **Arts-of-Optics grants**: Prisms cost **5%** less (requires 1150 prisms)
- **Radiant gastronomy**: Prisms are **8%** more efficient (requires 1200 prisms)
- **Rainbow renewal credits**: Prisms cost **5%** less (requires 1250 prisms)

##### Chancemaker
- **Misprinted fortunes**: Chancemakers cost **5%** less (requires 750 chancemakers)
- **Probability manipulation**: Chancemakers are **8%** more efficient (requires 800 chancemakers)
- **Reroll refund policy**: Chancemakers cost **5%** less (requires 850 chancemakers)
- **Fortune optimization**: Chancemakers are **8%** more efficient (requires 900 chancemakers)
- **Economy-grade omens**: Chancemakers cost **5%** less (requires 950 chancemakers)
- **Serendipity engineering**: Chancemakers are **8%** more efficient (requires 1000 chancemakers)
- **Volunteer augury nights**: Chancemakers cost **5%** less (requires 1050 chancemakers)
- **Random enhancement**: Chancemakers are **8%** more efficient (requires 1100 chancemakers)
- **Lottery board matching**: Chancemakers cost **5%** less (requires 1150 chancemakers)
- **Luck amplification**: Chancemakers are **8%** more efficient (requires 1200 chancemakers)
- **Lucky district waivers**: Chancemakers cost **5%** less (requires 1250 chancemakers)

##### Fractal Engine
- **Iteration liquidation**: Fractal engines cost **5%** less (requires 750 fractal engines)
- **Infinite recursion**: Fractal engines are **8%** more efficient (requires 800 fractal engines)
- **Self-similar spare parts**: Fractal engines cost **5%** less (requires 850 fractal engines)
- **Self-similar baking**: Fractal engines are **8%** more efficient (requires 900 fractal engines)
- **Recursion rebates**: Fractal engines cost **5%** less (requires 950 fractal engines)
- **Fractal optimization**: Fractal engines are **8%** more efficient (requires 1000 fractal engines)
- **Autogenerator residencies**: Fractal engines cost **5%** less (requires 1050 fractal engines)
- **Recursive enhancement**: Fractal engines are **8%** more efficient (requires 1100 fractal engines)
- **Grant-funded proofs**: Fractal engines cost **5%** less (requires 1150 fractal engines)
- **Fractal gastronomy**: Fractal engines are **8%** more efficient (requires 1200 fractal engines)
- **Infinite-lot variances**: Fractal engines cost **5%** less (requires 1250 fractal engines)

##### Javascript Console
- **Refurb dev boards**: Javascript consoles cost **5%** less (requires 750 javascript consoles)
- **Code optimization**: Javascript consoles are **8%** more efficient (requires 800 javascript consoles)
- **Compiler credit program**: Javascript consoles cost **5%** less (requires 850 javascript consoles)
- **Programmatic baking**: Javascript consoles are **8%** more efficient (requires 900 javascript consoles)
- **Idle-friendly runtimes**: Javascript consoles cost **5%** less (requires 950 javascript consoles)
- **Algorithmic enhancement**: Javascript consoles are **8%** more efficient (requires 1000 javascript consoles)
- **Peer-review co-ops**: Javascript consoles cost **5%** less (requires 1050 javascript consoles)
- **Computational gastronomy**: Javascript consoles are **8%** more efficient (requires 1100 javascript consoles)
- **Open-source grants**: Javascript consoles cost **5%** less (requires 1150 javascript consoles)
- **Digital confectionery**: Javascript consoles are **8%** more efficient (requires 1200 javascript consoles)
- **Cloud credit vouchers**: Javascript consoles cost **5%** less (requires 1250 javascript consoles)

##### Idleverse
- **Interdimensional tax breaks**: Idleverses cost **5%** less (requires 750 idleverses)
- **Reality real estate**: Idleverses are **8%** more efficient (requires 800 idleverses)
- **Reality consolidation discounts**: Idleverses cost **5%** less (requires 850 idleverses)
- **Dimensional franchising**: Idleverses are **8%** more efficient (requires 900 idleverses)
- **Cosmic bulk purchasing**: Idleverses cost **5%** less (requires 950 idleverses)
- **Cosmic supply chains**: Idleverses are **8%** more efficient (requires 1000 idleverses)
- **Multiverse supplier networks**: Idleverses cost **5%** less (requires 1050 idleverses)
- **Reality marketplaces**: Idleverses are **8%** more efficient (requires 1100 idleverses)
- **Dimensional economies of scale**: Idleverses cost **5%** less (requires 1150 idleverses)
- **Multiverse headquarters**: Idleverses are **8%** more efficient (requires 1200 idleverses)
- **Reality monopoly pricing**: Idleverses cost **5%** less (requires 1250 idleverses)

##### Cortex Baker
- **Neural bulk purchasing**: Cortex bakers cost **5%** less (requires 750 cortex bakers)
- **Neural plasticity**: Cortex bakers are **8%** more efficient (requires 800 cortex bakers)
- **Synaptic wholesale networks**: Cortex bakers cost **5%** less (requires 850 cortex bakers)
- **Synaptic pruning**: Cortex bakers are **8%** more efficient (requires 900 cortex bakers)
- **Cerebral mass production**: Cortex bakers cost **5%** less (requires 950 cortex bakers)
- **Cognitive load balancing**: Cortex bakers are **8%** more efficient (requires 1000 cortex bakers)
- **Mind monopoly pricing**: Cortex bakers cost **5%** less (requires 1050 cortex bakers)
- **Metacognitive awareness**: Cortex bakers are **8%** more efficient (requires 1100 cortex bakers)
- **Neural economies of scale**: Cortex bakers cost **5%** less (requires 1150 cortex bakers)
- **Neural synchronization**: Cortex bakers are **8%** more efficient (requires 1200 cortex bakers)
- **Synaptic supply dominance**: Cortex bakers cost **5%** less (requires 1250 cortex bakers)

##### You
- **Clone factory economies**: You cost **5%** less (requires 750 You)
- **Mitotic mastery**: You are **8%** more efficient (requires 800 You)
- **Replica production lines**: You cost **5%** less (requires 850 You)
- **Epigenetic programming**: You are **8%** more efficient (requires 900 You)
- **Mirror manufacturing mastery**: You cost **5%** less (requires 950 You)
- **Cellular differentiation**: You are **8%** more efficient (requires 1000 You)
- **Twin tycoon pricing**: You cost **5%** less (requires 1050 You)
- **Telomere regeneration**: You are **8%** more efficient (requires 1100 You)
- **Doppelganger discount networks**: You cost **5%** less (requires 1150 You)
- **Quantum entanglement**: You are **8%** more efficient (requires 1200 You)
- **Clone supply dominance**: You cost **5%** less (requires 1250 You)


## Changelog 

### Version 0.0.9
* Flavor text now with more punctuation. 
* Regression in minigame achievement check fixed

### Version 0.0.8
* Fix for Frenzy Marathon achievement that could cause it not to trigger when chaining low time remaining frenzy buffs together. 
* Fixed some bugs with first run experience when not running against any other CCSE Mods installed. 

### Version 0.0.7
* Price updates for improved cookies to be more balanced and fair. 

### Version 0.0.6
* Just more work on building a robust saving/loading system. Clearly my last version was a bit optimistic about being bullet proof. 

### Version 0.0.5
* More saving/loading fixes but I think everything is finally bullet proof, I probably made that way harder than it needed to be. 

### Version 0.0.4
* Fixed a bug that could cause God of All Gods to unlock if your Pantheon wasnt fully loaded yet.
* Store lifetime stock market data even if the stock market mini game hasnt been unlocked yet
* Wrath cookie storm drops no longer count towards total wrath cookie clicks
* Rethinking and refactoring some logic around saving and loading data 
* Tweaking some achivement requirements for balance 
* Various small bug fixes throughout

### Version 0.0.3
* Back to Basic Bakers Achievement is now easier 
* Fixed a bug that could mark achivements as won improperly when loading an older save

### Version 0.0.2
* Improvements to the save/load system
* Tweaking the requirements of some achievements, mostly in the challenges section
* Fixed a bug that may have prevented option settings from working when CCSE was installed  

### Version 0.0.1
* initial version
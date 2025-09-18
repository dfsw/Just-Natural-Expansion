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
- **The Final Countdown**: Own exactly 15 Cursors, 14 Grandmas, 13 Farms, yada yada yada, down to 1 Chancemaker. No selling or sacrificing any buildings. Must be earned in Born Again mode. See [Changelog](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#version-0011) for Version 0.0.11 for more info. 
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

### CPS Achievements (9 achievements)
- **Beyond the speed of dough**: Bake **1 octodecillion** per second
- **Speed of sound**: Bake **10 octodecillion** per second
- **Speed of light**: Bake **100 octodecillion** per second
- **Faster than light**: Bake **1 novemdecillion** per second
- **Speed of thought**: Bake **10 novemdecillion** per second
- **Faster than speed of thought**: Bake **100 novemdecillion** per second
- **Plaid**: Bake **1 vigintillion** per second
- **Somehow faster than plaid**: Bake **10 vigintillion** per second
- **Transcending the very concept of speed itself**: Bake **100 vigintillion** per second

### Click Achievements (9 achievements)
- **Click of the Titans**: Generate **1 year of raw CPS** in a single cookie click 
- **Buff Finger**: Click the cookie **250,000 times** across all ascensions
- **News ticker addict**: Click on the news ticker **1,000 times** in one ascension
- **Clickbait & Switch**: Make **1 vigintillion** from clicking
- **Click to the Future**: Make **1 duovigintillion** from clicking
- **Clickety Clique**: Make **1 quattuorvigintillion** from clicking
- **Clickonomicon**: Make **1 sexvigintillion** from clicking
- **Clicks and Stones**: Make **1 octovigintillion** from clicking
- **Click It Till You Make It**: Make **1 trigintillion** from clicking

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
- **Find a penny, pick it up**: Click **17,777 golden cookies** across all ascensions
- **Four-leaf overkill**: Click **37,777 golden cookies** across all ascensions
- **Rabbit's footnote**: Click **47,777 golden cookies** across all ascensions
- **Knock on wood**: Click **57,777 golden cookies** across all ascensions
- **Jackpot jubilee**: Click **67,777 golden cookies** across all ascensions
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
- **Grandma**: All rise for Nana (750 grandmas), The crinkle collective (800 grandmas), Okay elder (850 grandmas), Wrinkle monarchy (900 grandmas), The wrinkling hour (950 grandmas), Matriarchal meltdown (1,000 grandmas), Cookies before crones (1,050 grandmas), Dust to crust (1,100 grandmas), Bingo bloodbath (1,150 grandmas), Supreme doughmother (1,200 grandmas), The last custodian (1,250 grandmas)
- **Farm**: Little house on the dairy (750 farms), The plow thickens (800 farms), Cabbage patch dynasty (850 farms), Grazing amazement (900 farms), Field of creams (950 farms), Barn to be wild (1,000 farms), Crops and robbers (1,050 farms), Shoveling it in (1,100 farms), Seed syndicate (1,150 farms), Harvest high table (1,200 farms), Emperor of dirt (1,250 farms)
- **Mine**: Shafted (750 mines), Shiny object syndrome (800 mines), Ore what? (850 mines), Rubble without a cause (900 mines), Tunnel visionaries (950 mines), Stalag-might (1,000 mines), Pyrite and prejudice (1,050 mines), Bedrock 'n roll (1,100 mines), Mantle management (1,150 mines), Hollow crown jewels (1,200 mines), Emperor of ore (1,250 mines)
- **Factory**: Assembly required (750 factories), Quality unassured (800 factories), Error 404-manpower not found (850 factories), Spare parts department (900 factories), Conveyor belters (950 factories), Planned obsolescence (1,000 factories), Punch-card prophets (1,050 factories), Rust in peace (1,100 factories), Algorithm and blues (1,150 factories), Profit motive engine (1,200 factories), Lord of the assembly (1,250 factories)
- **Bank**: Petty cash splash (750 banks), The Invisible Hand That Feeds (800 banks), Under-mattress banking (850 banks), Interest-ing times (900 banks), Fee-fi-fo-fund (950 banks), Liquidity theater (1,000 banks), Risk appetite: unlimited (1,050 banks), Quantitative cheesing (1,100 banks), Number go up economics (1,150 banks), Sovereign cookie fund (1,200 banks), Seigniorage supreme (1,250 banks)
- **Temple**: Monk mode (750 temples), Ritual and error (800 temples), Chant and deliver (850 temples), Incensed and consecrated (900 temples), Shrine of the times (950 temples), Hallowed be thy grain (1,000 temples), Relic and roll (1,050 temples), Pilgrimage of crumbs (1,100 temples), The cookie pantheon (1,150 temples), Tithes and cookies (1,200 temples), Om-nom-nipotent (1,250 temples)
- **Wizard Tower**: Is this your cardamom? (750 wizard towers), Rabbit optional, hat mandatory (800 wizard towers), Wand and done (850 wizard towers), Critical spellcheck failed (900 wizard towers), Tome Raider (950 wizard towers), Prestidigitation station (1,000 wizard towers), Counterspell culture (1,050 wizard towers), Glitter is a material component (1,100 wizard towers), Evocation nation (1,150 wizard towers), Sphere of influence (1,200 wizard towers), The Last Archmage (1,250 wizard towers)
- **Shipment**: Door-to-airlock (750 shipments), Contents may shift in zero-G (800 shipments), Fragile: vacuum inside (850 shipments), Cosmic courier service (900 shipments), Porch pirates of Andromeda (950 shipments), Tracking number: ∞ (1,000 shipments), Relativistic courier (1,050 shipments), Orbital rendezvous only (1,100 shipments), Return to sender: event horizon (1,150 shipments), Address: Unknown Quadrant (1,200 shipments), Postmaster Galactic (1,250 shipments)
- **Alchemy Lab**: Stir-crazy crucible (750 alchemy labs), Flask dance (800 alchemy labs), Beaker than fiction (850 alchemy labs), Alloy-oop (900 alchemy labs), Distill my beating heart (950 alchemy labs), Lead Zeppelin (1,000 alchemy labs), Hg Wells (1,050 alchemy labs), Fe-fi-fo-fum (1,100 alchemy labs), Breaking bread with Walter White (1,150 alchemy labs), Prima materia manager (1,200 alchemy labs), The Philosopher's Scone (1,250 alchemy labs)
- **Portal**: Open sesameseed (750 portals), Mind the rift (800 portals), Doorway to s'moreway (850 portals), Contents may phase in transit (900 portals), Wormhole warranty voided (950 portals), Glitch in the Crumbatrix (1,000 portals), Second pantry to the right (1,050 portals), Liminal sprinkles (1,100 portals), Please do not feed the void (1,150 portals), Echoes from the other oven (1,200 portals), Out past the exit sign (1,250 portals)
- **Time Machine**: Yeasterday (750 time machines), Tick-tock, bake o'clock (800 time machines), Back to the batter (850 time machines), Déjà chewed (900 time machines), Borrowed thyme (950 time machines), Second breakfast paradox (1,000 time machines), Next week's news, fresh today (1,050 time machines), Live, die, bake, repeat (1,100 time machines), Entropy-proof frosting (1,150 time machines), Past the last tick (1,200 time machines), Emperor of when (1,250 time machines)
- **Antimatter Condenser**: Up and atom! (750 antimatter condensers), Boson buddies (800 antimatter condensers), Schrödinger's snack (850 antimatter condensers), Quantum foam party (900 antimatter condensers), Twenty years away (always) (950 antimatter condensers), Higgs and kisses (1,000 antimatter condensers), Zero-point frosting (1,050 antimatter condensers), Some like it dark (matter) (1,100 antimatter condensers), Vacuum energy bar (1,150 antimatter condensers), Singularity of flavor (1,200 antimatter condensers), Emperor of mass (1,250 antimatter condensers)
- **Prism**: Light reading (750 prisms), Refraction action (800 prisms), Snacktrum of light (850 prisms), My cones and rods (900 prisms), Prism break (950 prisms), Prism prelate (1,000 prisms), Glare force one (1,050 prisms), Hues Your Own Adventure (1,100 prisms), Devour the spectrum (1,150 prisms), Crown of rainbows (1,200 prisms), Radiant consummation (1,250 prisms)
- **Chancemaker**: Beginner's lucked-in (750 chancemakers), Risk it for the biscuit (800 chancemakers), Roll, baby, roll (850 chancemakers), Luck be a ladyfinger (900 chancemakers), RNG on the range (950 chancemakers), Monte Carlo kitchen (1,000 chancemakers), Gambler's fallacy, baker's edition (1,050 chancemakers), Schrödinger's jackpot (1,100 chancemakers), RNGesus take the wheel (1,150 chancemakers), Hand of Fate: Full House (1,200 chancemakers), RNG seed of fortune (1,250 chancemakers)
- **Fractal Engine**: Copy-paste-ry (750 fractal engines), Again, but smaller (800 fractal engines), Edge-case frosting (850 fractal engines), Mandelbread set (900 fractal engines), Strange attractor, stranger baker (950 fractal engines), Recursive taste test (1,000 fractal engines), Zoom & enhance & enhance (1,050 fractal engines), The limit does not exist (1,100 fractal engines), Halting? Never heard of it (1,150 fractal engines), The set contains you (1,200 fractal engines), Emperor of self-similarity (1,250 fractal engines)
- **Javascript Console**: F12, open sesame (750 javascript consoles), console.log('crumbs') (800 javascript consoles), Semicolons optional, sprinkles mandatory (850 javascript consoles), Undefined is not a function (nor a cookie) (900 javascript consoles), await fresh_from_oven() (950 javascript consoles), Event loop-de-loop (1,000 javascript consoles), Regexorcism (1,050 javascript consoles), Infinite scroll of dough (1,100 javascript consoles), Unhandled promise confection (1,150 javascript consoles), Single-threaded, single-minded (1,200 javascript consoles), Emperor of Runtime (1,250 javascript consoles)
- **Idleverse**: Pick-a-verse, any verse (750 idleverses), Open in new universe (800 idleverses), Meanwhile, in a parallel tab (850 idleverses), Idle hands, infinite plans (900 idleverses), Press any world to continue (950 idleverses), NPC in someone else's save (1,000 idleverses), Cookie of Theseus (1,050 idleverses), Crossover episode (1,100 idleverses), Cosmic load balancer (1,150 idleverses), Prime instance (1,200 idleverses), The bakery at the end of everything (1,250 idleverses)
- **Cortex Baker**: Gray matter batter (750 cortex bakers), Outside the cookie box (800 cortex bakers), Prefrontal glaze (850 cortex bakers), Snap, crackle, synapse (900 cortex bakers), Temporal batch processing (950 cortex bakers), Cogito, ergo crumb (1,000 cortex bakers), Galaxy brain, local oven (1,050 cortex bakers), The bicameral ovens (1,100 cortex bakers), Theory of crumb (1,150 cortex bakers), Lobe service (1,200 cortex bakers), Mind the monarch (1,250 cortex bakers)
- **You**: Me, myself, and Icing (750 You), Copy of a copy (800 You), Echo chamber (850 You), Self checkout (900 You), You v2.0 (950 You), You v2.0.1 emergency hot fix (1,000 You), Me, Inc. (1,050 You), Council of Me (1,100 You), I, Legion (1,150 You), The one true you (1,200 You), Sovereign of the self (1,250 You)

### Building Production Achievements (60 achievements)

- **Cursor**: Click II: the sequel - Make **1 septendecillion cookies** just from cursors
- **Cursor**: Click III: we couldn't get Adam so it stars Jerry Seinfeld for some reason - Make **1 quindecillion cookies** just from cursors
- **Cursor**: Click IV: 3% on rotten tomatoes - Make **1 sexdecillion cookies** just from cursors
- **Grandma**: Scone with the wind - Make **1 septendecillion cookies** just from grandmas
- **Grandma**: The flour of youth - Make **1 quindecillion cookies** just from grandmas
- **Grandma**: Bake-ageddon - Make **1 sexdecillion cookies** just from grandmas
- **Farm**: Rake in the greens - Make **1 quattuordecillion cookies** just from farms
- **Farm**: The great threshering - Make **1 quindecillion cookies** just from farms
- **Farm**: Bushels of burden - Make **1 sexdecillion cookies** just from farms
- **Mine**: Ore d'oeuvres - Make **10 quattuordecillion cookies** just from mines
- **Mine**: Seismic yield - Make **10 quindecillion cookies** just from mines
- **Mine**: Billionaire's bedrock - Make **10 sexdecillion cookies** just from mines
- **Factory**: Sweatshop symphony - Make **100 quattuordecillion cookies** just from factories
- **Factory**: Cookieconomics 101 - Make **100 quindecillion cookies** just from factories
- **Factory**: Mass production messiah - Make **100 sexdecillion cookies** just from factories
- **Bank**: Compound interest, compounded - Make **1 quindecillion cookies** just from banks
- **Bank**: Arbitrage avalanche - Make **1 sexdecillion cookies** just from banks
- **Bank**: Ponzi à la mode - Make **1 septendecillion cookies** just from banks
- **Temple**: Temple treasury overflow - Make **10 quindecillion cookies** just from temples
- **Temple**: Pantheon payout - Make **10 sexdecillion cookies** just from temples
- **Temple**: Sacred surplus - Make **10 septendecillion cookies** just from temples
- **Wizard Tower**: Rabbits per minute - Make **100 quindecillion cookies** just from wizard towers
- **Wizard Tower**: Hocus bonus - Make **100 sexdecillion cookies** just from wizard towers
- **Wizard Tower**: Magic dividends - Make **100 septendecillion cookies** just from wizard towers
- **Shipment**: Cargo cult classic - Make **1 sexdecillion cookies** just from shipments
- **Shipment**: Universal basic shipping - Make **1 septendecillion cookies** just from shipments
- **Shipment**: Comet-to-consumer - Make **1 octodecillion cookies** just from shipments
- **Alchemy Lab**: Lead into bread - Make **10 sexdecillion cookies** just from alchemy labs
- **Alchemy Lab**: Philosopher's yield - Make **10 septendecillion cookies** just from alchemy labs
- **Alchemy Lab**: Auronomical returns - Make **10 octodecillion cookies** just from alchemy labs
- **Portal**: Spacetime surcharge - Make **100 sexdecillion cookies** just from portals
- **Portal**: Interdimensional yield farming - Make **100 septendecillion cookies** just from portals
- **Portal**: Event-horizon markup - Make **100 octodecillion cookies** just from portals
- **Time Machine**: Future Profits, Past Tense - Make **1 septendecillion cookies** just from time machines
- **Time Machine**: Infinite Loop, Infinite Loot - Make **1 octodecillion cookies** just from time machines
- **Time Machine**: Back Pay from the Big Bang - Make **1 novemdecillion cookies** just from time machines
- **Antimatter Condenser**: Pair production payout - Make **10 septendecillion cookies** just from antimatter condensers
- **Antimatter Condenser**: Cross-section surplus - Make **10 octodecillion cookies** just from antimatter condensers
- **Antimatter Condenser**: Powers of crumbs - Make **10 novemdecillion cookies** just from antimatter condensers
- **Prism**: Photons pay dividends - Make **100 septendecillion cookies** just from prisms
- **Prism**: Spectral surplus - Make **100 octodecillion cookies** just from prisms
- **Prism**: Dawn of plenty - Make **100 novemdecillion cookies** just from prisms
- **Chancemaker**: Against all odds & ends - Make **1 octodecillion cookies** just from chancemakers
- **Chancemaker**: Monte Carlo windfall - Make **1 novemdecillion cookies** just from chancemakers
- **Chancemaker**: Fate-backed securities - Make **1 vigintillion cookies** just from chancemakers
- **Fractal Engine**: Infinite series surplus - Make **10 octodecillion cookies** just from fractal engines
- **Fractal Engine**: Geometric mean feast - Make **10 novemdecillion cookies** just from fractal engines
- **Fractal Engine**: Fractal jackpot - Make **10 vigintillion cookies** just from fractal engines
- **Javascript Console**: Cookies per second()++ - Make **100 octodecillion cookies** just from javascript consoles
- **Javascript Console**: Promise.all(paydays) - Make **100 novemdecillion cookies** just from javascript consoles
- **Javascript Console**: Async and ye shall receive - Make **100 vigintillion cookies** just from javascript consoles
- **Idleverse**: Crossover dividends - Make **1 novemdecillion cookies** just from idleverses
- **Idleverse**: Many-Worlds ROI - Make **100 vigintillion cookies** just from idleverses
- **Idleverse**: Continuity bonus - Make **10 duovigintillion cookies** just from idleverses
- **Cortex Baker**: Brainstorm dividend - Make **10 novemdecillion cookies** just from cortex bakers
- **Cortex Baker**: Thought economy boom - Make **10 vigintillion cookies** just from cortex bakers
- **Cortex Baker**: Neural net worth - Make **10 unvigintillion cookies** just from cortex bakers
- **You**: Personal growth - Make **100 novemdecillion cookies** just from You
- **You**: Economies of selves - Make **100 vigintillion cookies** just from You
- **You**: Self-sustaining singularity - Make **100 unvigintillion cookies** just from You

### Building Level Achievements (40 achievements)

##### Cursor
- **Rowdy shadow puppets**: Reach **level 15** Cursors  
- **Frantic finger guns**: Reach **level 20** Cursors

##### Grandma
- **Loaf & behold**: Reach **level 15** Grandmas
- **Forbidden fruitcake**: Reach **level 20** Grandmas

##### Farm
- **Huge-er tracts of land**: Reach **level 15** Farms
- **Hoedown showdown**: Reach **level 20** Farms

##### Mine
- **Cave-in king**: Reach **level 15** Mines
- **Digging destiny**: Reach **level 20** Mines

##### Factory
- **Boilerplate overlord**: Reach **level 15** Factories
- **Cookie standard time**: Reach **level 20** Factories

##### Bank
- **Credit conjurer**: Reach **level 15** Banks
- **Master of the Mint**: Reach **level 20** Banks

##### Temple
- **Acolyte ascendant**: Reach **level 15** Temples
- **Grand hierophant**: Reach **level 20** Temples

##### Wizard Tower
- **Archmage of Meringue**: Reach **level 15** Wizard Towers
- **Chronomancer emeritus**: Reach **level 20** Wizard Towers

##### Shipment
- **Quartermaster of Orbits**: Reach **level 15** Shipments
- **Docking director**: Reach **level 20** Shipments

##### Alchemy Lab
- **Retort wrangler**: Reach **level 15** Alchemy Labs
- **Circle of Quintessence**: Reach **level 20** Alchemy Labs

##### Portal
- **Non-Euclidean doorman**: Reach **level 15** Portals
- **Warden of Elsewhere**: Reach **level 20** Portals

##### Time Machine
- **Minute handler**: Reach **level 15** Time Machines
- **Chronarch supreme**: Reach **level 20** Time Machines

##### Antimatter Condenser
- **Quark wrangler**: Reach **level 15** Antimatter Condensers
- **Symmetry breaker**: Reach **level 20** Antimatter Condensers

##### Prism
- **Master of refraction**: Reach **level 15** Prisms
- **Keeper of the seven hues**: Reach **level 20** Prisms

##### Chancemaker
- **Seedkeeper of Fortune**: Reach **level 15** Chancemakers
- **Master of Maybe**: Reach **level 20** Chancemakers

##### Fractal Engine
- **Archfractal**: Reach **level 15** Fractal Engines
- **Lord of Infinite Detail**: Reach **level 20** Fractal Engines

##### Javascript Console
- **Stack tracer**: Reach **level 15** Javascript Consoles
- **Event-loop overlord**: Reach **level 20** Javascript Consoles

##### Idleverse
- **Canon custodian**: Reach **level 15** Idleverses
- **Keeper of the Uncountable**: Reach **level 20** Idleverses

##### Cortex Baker
- **Chief Thinker Officer**: Reach **level 15** Cortex Bakers
- **Mind over batter**: Reach **level 20** Cortex Bakers

##### You
- **Identity custodian**: Reach **level 15** Yous
- **First Person Plural**: Reach **level 20** Yous

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

### Version 0.0.11
* Ask and you shall receive, the "mid" achievement names have been replaced with more interesting ones. No save data will be lost as the old achievements automatically map to the updated ones. 
* [The Final Countdown](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-achievements) was widely criticized for being too hard. It has been made easier, HOWEVER the original unlock conditions still exists so it may be unlocked starting with 20 Cursors and counting down to 1 You, or with 15 Cursors counting down to 5 Chancemakers. I thank our beta testers especially those who have completed the harder challenge for their feedback. 

### Version 0.0.10
* Added more bake X cookies per second achievements 
* Big graphics update also prestaging the graphics for next major revision

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
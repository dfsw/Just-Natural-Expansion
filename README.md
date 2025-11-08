# Just Natural Expansion
### A Cookie Clicker Mod

## Table of Contents
* [Installation Directions](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#installation-directions)
* [Mod Compatibility](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#mod-compatibility)
* [New Achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-achievements)
* [New Upgrades](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-upgrades)
* [Mysteries of the Cookie Age](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#Mysteries-of-the-Cookie-Age)
* [Changelog](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#changelog)

**The Just Natural Expansion Mod** enhances the Cookie Clicker endgame without disrupting core gameplay, staying true to the spirit of the vanilla experience. It introduces over **450 achievements**, **250 upgrades**, new goals, new stories, and deeply rooted hidden elements, all specifically designed for late-game progression, so early or mid-game players may not immediately notice changes. 

By default, the mod adds no upgrades and marks new achievements as shadow, allowing leaderboard and competition focused players to pursue extra challenges without affecting their current gameplay. 

Players aiming for higher scores and a more rewarding late-game can enable Cookie, Kitten, and Building upgrades, while also converting shadow achievements into regular ones to gain extra milk for their efforts. These upgrades can be disabled at any time, and shadow achievements can be re-enabled via the options menu. However, a permanent shadow achievement will be awarded to mark that you have used the mod outside of leaderboard/competition mode.

Many achievements are tracked across multiple ascensions or involve progress that the base game does not normally record, such as popping Shiny Wrinklers. While you may have already completed some of these, there is no way to determine your progress on them unless the mod was installed at the time they were achieved. Progress on items not tracked by the vanilla game or not carried across ascensions will only start being recorded once the mod is active. You can view additional tracked stats and their current values in the Stats menu.

**All new achievements are designed to be attainable, though some require significant effort, some even taking weeks of focused effort to earn. Thank you for playing! If you enjoy the mod, please spread the word!**

#### Special Thanks

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
Link to [Mod Loader](https://steamcommunity.com/sharedfiles/filedetails/?id=3572744159) on Steam. You can also search for Just Natural Expansion in the Cookie Clicker Steam Workshop.

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
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla1306.png" alt="Hardercorest" width="24" height="24"> | **Hardercorest** | Bake **3 billion cookies** with no cookie clicks and no upgrades bought in Born Again mode |
| <img src="assets/generated-icons/SheetVanilla1406.png" alt="Hardercorest-er" width="24" height="24"> | **Hardercorest-er** | Bake **1 billion cookies** with no more than 20 clicks, no more than 20 buildings (no selling), and no more than 20 upgrades in Born Again mode |
| <img src="assets/generated-icons/SheetVanilla1307.png" alt="The Final Countdown" width="24" height="24"> | **The Final Countdown** | Own exactly 15 Cursors, 14 Grandmas, 13 Farms, yada yada yada, down to 1 Chancemaker. No selling or sacrificing any buildings. Must be earned in Born Again mode. See [Changelog](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#version-0011) for Version 0.0.11 for more info. |
| <img src="assets/generated-icons/SheetVanilla1407.png" alt="Really more of a dog person" width="24" height="24"> | **Really more of a dog person** | Bake **1 billion cookies per second** without buying any kitten upgrades in Born Again mode |
| <img src="assets/generated-icons/SheetCustom2309.png" alt="Gilded Restraint" width="24" height="24"> | **Gilded Restraint** | Bake **1 trillion cookies** without ever clicking a golden cookie, must be done in Born Again mode |
| <img src="assets/generated-icons/SheetCustom2310.png" alt="Back to Basic Bakers" width="24" height="24"> | **Back to Basic Bakers** | Reach **1 million cookies per second** using only Cursors and Grandmas (no other buildings), must be done in Born Again mode |
| <img src="assets/generated-icons/SheetCustom2311.png" alt="Modest Portfolio" width="24" height="24"> | **Modest Portfolio** | Reach **1 quadrillion cookies** without ever owning more than 10 of any building type (no selling), must be done in Born Again mode |
| <img src="assets/generated-icons/SheetCustom2303.png" alt="Difficult Decisions" width="24" height="24"> | **Difficult Decisions** | Bake **1 billion cookies** without ever having more than **25 combined upgrades or buildings** at any given time, must be done in Born Again mode |
| <img src="assets/generated-icons/SheetCustom2304.png" alt="Laid in Plain Sight" width="24" height="24"> | **Laid in Plain Sight** | Bake **10 cookies per second** without purchasing any buildings, must be done in Born Again mode |

##### Can Be Done In Any Mode
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2515.png" alt="I feel the need for seed" width="24" height="24"> | **I feel the need for seed** | Unlock all garden seeds within **5 days** of your last garden sacrifice. Look this one is tricky, if you reload or load a save the 5 day timer is invalidated, so you cant load in a completed garden. |
| <img src="assets/generated-icons/SheetVanilla1804.png" alt="Holiday Hoover" width="24" height="24"> | **Holiday Hoover** | Collect all seasonal drops within **60 minutes** of an Ascension start |
| <img src="assets/generated-icons/SheetVanilla1709.png" alt="Merry Mayhem" width="24" height="24"> | **Merry Mayhem** | Collect all seasonal drops within **40 minutes** of an Ascension start |
| <img src="assets/generated-icons/SheetCustom0009.png" alt="Second Life, First Click" width="24" height="24"> | **Second Life, First Click** | Click a golden cookie within **120 seconds** of ascending |
| <img src="assets/generated-icons/SheetVanilla1207.png" alt="We dont need no heavenly chips" width="24" height="24"> | **We dont need no heavenly chips** | Own at least **333 of every building type**, without owning the 'Heavenly chip secret' upgrade |
| <img src="assets/generated-icons/SheetCustom2305.png" alt="Precision Nerd" width="24" height="24"> | **Precision Nerd** | Have exactly **1,234,567,890 cookies** in your bank and hold it for **60 seconds** |
| <img src="assets/generated-icons/SheetCustom2312.png" alt="Treading water" width="24" height="24"> | **Treading water** | Have a CPS of 0 while owning more than 1000 buildings with no active buffs or debuffs |
| <img src="assets/generated-icons/SheetCustom2314.png" alt="Bouncing the last cheque" width="24" height="24"> | **Bouncing the last cheque** | Reach less than 10 cookies in your bank after having at least 1 million cookies |
| <img src="assets/generated-icons/SheetCustom2313.png" alt="Massive Inheritance" width="24" height="24"> | **Massive Inheritance** | Have a bank of at least **1 Novemdecillion cookies** within 10 minutes of ascending |
| <img src="assets/generated-icons/SheetCustom1412.png" alt="The Final Challenger" width="24" height="24"> | **The Final Challenger** | Win **10** of the Just Natural Expansion **Challenge Achievements** |

### Minigame Achievements (29 achievements)

#### Stock Market
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla1706.png" alt="Doughfolio Debut" width="24" height="24"> | **Doughfolio Debut** | Have **$25 million** in stock market profits across all ascensions |
| <img src="assets/generated-icons/SheetVanilla2607.png" alt="Crumb Fund Manager" width="24" height="24"> | **Crumb Fund Manager** | Have **$100 million** in stock market profits across all ascensions |
| <img src="assets/generated-icons/SheetVanilla3333.png" alt="Biscuit Market Baron" width="24" height="24"> | **Biscuit Market Baron** | Have **$250 million** in stock market profits across all ascensions |
| <img src="assets/generated-icons/SheetVanilla2829.png" alt="Fortune Cookie Tycoon" width="24" height="24"> | **Fortune Cookie Tycoon** | Have **$500 million** in stock market profits across all ascensions |
| <img src="assets/generated-icons/SheetVanilla3108.png" alt="Dough Jones Legend" width="24" height="24"> | **Dough Jones Legend** | Have **$1 billion** in stock market profits across all ascensions |
| <img src="assets/generated-icons/SheetVanilla1508.png" alt="The Dough Jones Plunge" width="24" height="24"> | **The Dough Jones Plunge** | Have **$1 million** in stock market losses in one ascension |
| <img src="assets/generated-icons/SheetCustom2301.png" alt="Broiler room" width="24" height="24"> | **Broiler room** | Hire at least **100** stockbrokers in the Stock Market |

#### Garden
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetGarden0034.png" alt="Seedless to eternity" width="24" height="24"> | **Seedless to eternity** | Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **5 times** |
| <img src="assets/generated-icons/SheetGarden0134.png" alt="Seedless to infinity" width="24" height="24"> | **Seedless to infinity** | Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **10 times** |
| <img src="assets/generated-icons/SheetGarden0234.png" alt="Seedless to beyond" width="24" height="24"> | **Seedless to beyond** | Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets **25 times** |
| <img src="assets/generated-icons/SheetGarden0402.png" alt="Greener, aching thumb" width="24" height="24"> | **Greener, aching thumb** | Harvest **2,000 mature garden plants** across all ascensions |
| <img src="assets/generated-icons/SheetGarden0410.png" alt="Greenest, aching thumb" width="24" height="24"> | **Greenest, aching thumb** | Harvest **3,000 mature garden plants** across all ascensions |
| <img src="assets/generated-icons/SheetGarden0417.png" alt="Photosynthetic prodigy" width="24" height="24"> | **Photosynthetic prodigy** | Harvest **5,000 mature garden plants** across all ascensions |
| <img src="assets/generated-icons/SheetGarden0418.png" alt="Garden master" width="24" height="24"> | **Garden master** | Harvest **7,500 mature garden plants** across all ascensions |
| <img src="assets/generated-icons/SheetGarden0419.png" alt="Plant whisperer" width="24" height="24"> | **Plant whisperer** | Harvest **10,000 mature garden plants** across all ascensions |
| <img src="assets/generated-icons/SheetVanilla2715.png" alt="Botanical Perfection" width="24" height="24"> | **Botanical Perfection** | Have one of every type of plant in the mature stage at once |
| <img src="assets/generated-icons/SheetGarden0019.png" alt="Duketater Salad" width="24" height="24"> | **Duketater Salad** | Harvest **12 mature Duketaters** simultaneously |
| <img src="assets/generated-icons/SheetGarden0334.png" alt="Fifty Shades of Clay" width="24" height="24"> | **Fifty Shades of Clay** | Change the soil type of your Garden **100 times** in one ascension |
- See also **I feel the need for seed**

#### Grimoire
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2212.png" alt="Archwizard" width="24" height="24"> | **Archwizard** | Cast **1,999 spells** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2014.png" alt="Spellmaster" width="24" height="24"> | **Spellmaster** | Cast **2,999 spells** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2013.png" alt="Cookieomancer" width="24" height="24"> | **Cookieomancer** | Cast **3,999 spells** across all ascensions |
| <img src="assets/generated-icons/SheetVanilla2812.png" alt="Spell lord" width="24" height="24"> | **Spell lord** | Cast **4,999 spells** across all ascensions |
| <img src="assets/generated-icons/SheetVanilla2712.png" alt="Magic emperor" width="24" height="24"> | **Magic emperor** | Cast **9,999 spells** across all ascensions |
| <img src="assets/generated-icons/SheetVanilla3020.png" alt="Hogwarts Graduate" width="24" height="24"> | **Hogwarts Graduate** | Have **3 positive Grimoire spell effects** active at once |
| <img src="assets/generated-icons/SheetVanilla3120.png" alt="Hogwarts Dropout" width="24" height="24"> | **Hogwarts Dropout** | Have **3 negative Grimoire spell effects** active at once |
| <img src="assets/generated-icons/SheetVanilla3204.png" alt="Spell Slinger" width="24" height="24"> | **Spell Slinger** | Cast **10 spells** within a 10-second window |
| <img src="assets/generated-icons/SheetCustom2015.png" alt="Sweet Sorcery" width="24" height="24"> | **Sweet Sorcery** | Get the **Free Sugar Lump** outcome from a magically spawned golden cookie |

#### Pantheon
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2118.png" alt="Faithless Loyalty" width="24" height="24"> | **Faithless Loyalty** | Swap gods in the Pantheon **100 times** in one ascension |
| <img src="assets/generated-icons/SheetVanilla2218.png" alt="God of All Gods" width="24" height="24"> | **God of All Gods** | Use each pantheon god for at least **24 hours** total across all ascensions |

### Seasonal Achievements (9 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla1606.png" alt="Calendar Abuser" width="24" height="24"> | **Calendar Abuser** | Switch seasons **50 times** in one ascension |
| <img src="assets/generated-icons/SheetCustom1917.png" alt="Reindeer destroyer" width="24" height="24"> | **Reindeer destroyer** | Pop **500 reindeer** across all ascensions |
| <img src="assets/generated-icons/SheetCustom1916.png" alt="Reindeer obliterator" width="24" height="24"> | **Reindeer obliterator** | Pop **1,000 reindeer** across all ascensions |
| <img src="assets/generated-icons/SheetCustom1915.png" alt="Reindeer extinction event" width="24" height="24"> | **Reindeer extinction event** | Pop **2,000 reindeer** across all ascensions |
| <img src="assets/generated-icons/SheetCustom1914.png" alt="Reindeer apocalypse" width="24" height="24"> | **Reindeer apocalypse** | Pop **5,000 reindeer** across all ascensions |
| <img src="assets/generated-icons/SheetCustom1816.png" alt="Cupid's Reindeer" width="24" height="24"> | **Cupid's Reindeer** | Pop a reindeer during **Valentine's Day season** |
| <img src="assets/generated-icons/SheetCustom1815.png" alt="Business Reindeer" width="24" height="24"> | **Business Reindeer** | Pop a reindeer during **Business Day season** |
| <img src="assets/generated-icons/SheetCustom1814.png" alt="Bundeer" width="24" height="24"> | **Bundeer** | Pop a reindeer during **Easter season** |
| <img src="assets/generated-icons/SheetCustom1817.png" alt="Ghost Reindeer" width="24" height="24"> | **Ghost Reindeer** | Pop a reindeer during **Halloween season** |
- See also **Holiday Hoover** and **Merry Mayhem**

### Completionist Achievements (7 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2207.png" alt="Vanilla Star" width="24" height="24"> | **Vanilla Star** | Own all **622 original achievements** |
| <img src="assets/generated-icons/SheetVanilla2916.png" alt="Sweet Child of Mine" width="24" height="24"> | **Sweet Child of Mine** | Own **100 sugar lumps** at once |
| <img src="assets/generated-icons/SheetVanilla2007.png" alt="Beyond Prestige" width="24" height="24"> | **Beyond Prestige** | Own all **129 original heavenly upgrades** |
| <img src="assets/generated-icons/SheetVanilla1814.png" alt="Kitten jamboree" width="24" height="24"> | **Kitten jamboree** | Own all **18 original kittens** |
| <img src="assets/generated-icons/SheetVanilla1813.png" alt="Kitten Fiesta" width="24" height="24"> | **Kitten Fiesta** | Own all **18 original kittens** and all **11 expansion kittens** at once |
| <img src="assets/generated-icons/SheetCustom1913.png" alt="Bearer of the Cookie Sigil" width="24" height="24"> | **Bearer of the Cookie Sigil** | Fully initiate into the Great Orders of the Cookie Age. Provides **25% faster research** and **10% more random drops** (See Upgrades Section for More Info) |
| <img src="assets/generated-icons/SheetVanilla1705.png" alt="In the Shadows" width="24" height="24"> | **In the Shadows** | Unlock all vanilla shadow achievements, except that one. |
- See also **The Final Challenger**

### Combo Achievements (7 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2536.png" alt="Trifecta Combo" width="24" height="24"> | **Trifecta Combo** | Have **3 buffs** active at once |
| <img src="assets/generated-icons/SheetVanilla2611.png" alt="Combo Initiate" width="24" height="24"> | **Combo Initiate** | Have **6 buffs** active at once |
| <img src="assets/generated-icons/SheetVanilla2211.png" alt="Combo God" width="24" height="24"> | **Combo God** | Have **9 buffs** active at once |
| <img src="assets/generated-icons/SheetVanilla2311.png" alt="Combo Hacker" width="24" height="24"> | **Combo Hacker** | Have **12 buffs** active at once |
| <img src="assets/generated-icons/SheetCustom2302.png" alt="Frenzy frenzy" width="24" height="24"> | **Frenzy frenzy** | Have all three frenzy buffs active at once |
| <img src="assets/generated-icons/SheetVanilla3012.png" alt="Double Dragon Clicker" width="24" height="24"> | **Double Dragon Clicker** | Have a dragon flight and a click frenzy active at the same time |
| <img src="assets/generated-icons/SheetVanilla2213.png" alt="Frenzy Marathon" width="24" height="24"> | **Frenzy Marathon** | Have a frenzy buff with a total duration of at least **10 minutes** |

### CPS Achievements (9 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0012.png" alt="Beyond the speed of dough" width="24" height="24"> | **Beyond the speed of dough** | Bake **1 octodecillion** per second |
| <img src="assets/generated-icons/SheetCustom0112.png" alt="Speed of sound" width="24" height="24"> | **Speed of sound** | Bake **10 octodecillion** per second |
| <img src="assets/generated-icons/SheetCustom0212.png" alt="Speed of light" width="24" height="24"> | **Speed of light** | Bake **100 octodecillion** per second |
| <img src="assets/generated-icons/SheetCustom0312.png" alt="Faster than light" width="24" height="24"> | **Faster than light** | Bake **1 novemdecillion** per second |
| <img src="assets/generated-icons/SheetCustom0412.png" alt="Speed of thought" width="24" height="24"> | **Speed of thought** | Bake **10 novemdecillion** per second |
| <img src="assets/generated-icons/SheetCustom0512.png" alt="Faster than speed of thought" width="24" height="24"> | **Faster than speed of thought** | Bake **100 novemdecillion** per second |
| <img src="assets/generated-icons/SheetCustom0612.png" alt="Plaid" width="24" height="24"> | **Plaid** | Bake **1 vigintillion** per second |
| <img src="assets/generated-icons/SheetCustom0712.png" alt="Somehow faster than plaid" width="24" height="24"> | **Somehow faster than plaid** | Bake **10 vigintillion** per second |
| <img src="assets/generated-icons/SheetCustom0812.png" alt="Transcending the very concept of speed itself" width="24" height="24"> | **Transcending the very concept of speed itself** | Bake **100 vigintillion** per second |

### Click Achievements (9 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0908.png" alt="Click of the Titans" width="24" height="24"> | **Click of the Titans** | Generate **1 year of raw CPS** in a single cookie click |
| <img src="assets/generated-icons/SheetVanilla1230.png" alt="Buff Finger" width="24" height="24"> | **Buff Finger** | Click the cookie **250,000 times** across all ascensions |
| <img src="assets/generated-icons/SheetCustom1012.png" alt="News ticker addict" width="24" height="24"> | **News ticker addict** | Click on the news ticker **1,000 times** in one ascension |
| <img src="assets/generated-icons/SheetCustom0900.png" alt="Clickbait &amp; Switch" width="24" height="24"> | **Clickbait & Switch** | Make **1 vigintillion** from clicking |
| <img src="assets/generated-icons/SheetCustom0901.png" alt="Click to the Future" width="24" height="24"> | **Click to the Future** | Make **1 duovigintillion** from clicking |
| <img src="assets/generated-icons/SheetCustom0902.png" alt="Clickety Clique" width="24" height="24"> | **Clickety Clique** | Make **1 quattuorvigintillion** from clicking |
| <img src="assets/generated-icons/SheetCustom0903.png" alt="Clickonomicon" width="24" height="24"> | **Clickonomicon** | Make **1 sexvigintillion** from clicking |
| <img src="assets/generated-icons/SheetCustom0904.png" alt="Clicks and Stones" width="24" height="24"> | **Clicks and Stones** | Make **1 octovigintillion** from clicking |
| <img src="assets/generated-icons/SheetCustom0905.png" alt="Click It Till You Make It" width="24" height="24"> | **Click It Till You Make It** | Make **1 trigintillion** from clicking |

### Grandmapocalypse Achievements (15 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2116.png" alt="Wrinkler annihilator" width="24" height="24"> | **Wrinkler annihilator** | Burst **666 wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2117.png" alt="Wrinkler eradicator" width="24" height="24"> | **Wrinkler eradicator** | Burst **2,666 wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2118.png" alt="Wrinkler extinction event" width="24" height="24"> | **Wrinkler extinction event** | Burst **6,666 wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2219.png" alt="Wrinkler apocalypse" width="24" height="24"> | **Wrinkler apocalypse** | Burst **16,666 wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2218.png" alt="Wrinkler armageddon" width="24" height="24"> | **Wrinkler armageddon** | Burst **26,666 wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2113.png" alt="Rare specimen collector" width="24" height="24"> | **Rare specimen collector** | Burst **2 shiny wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2114.png" alt="Endangered species hunter" width="24" height="24"> | **Endangered species hunter** | Burst **5 shiny wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2115.png" alt="Extinction event architect" width="24" height="24"> | **Extinction event architect** | Burst **10 shiny wrinklers** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2319.png" alt="Golden wrinkler" width="24" height="24"> | **Golden wrinkler** | Burst a wrinkler worth **6.66 years of CPS** |
| <img src="assets/generated-icons/SheetCustom2318.png" alt="Wrinkler Rush" width="24" height="24"> | **Wrinkler Rush** | Pop a wrinkler within **15 minutes and 30 seconds** of ascending |
| <img src="assets/generated-icons/SheetCustom2119.png" alt="Wrinkler Windfall" width="24" height="24"> | **Wrinkler Windfall** | Sextuple (6x) your bank with a single wrinkler pop |
| <img src="assets/generated-icons/SheetVanilla0209.png" alt="Deep elder nap" width="24" height="24"> | **Deep elder nap** | Quash the grandmatriarchs one way or another **666 times** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2018.png" alt="Warm-Up Ritual" width="24" height="24"> | **Warm-Up Ritual** | Click **66 wrath cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2017.png" alt="Deal of the Slightly Damned" width="24" height="24"> | **Deal of the Slightly Damned** | Click **666 wrath cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom2016.png" alt="Baker of the Beast" width="24" height="24"> | **Baker of the Beast** | Click **6,666 wrath cookies** across all ascensions |

### Golden Cookie Achievements (6 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0013.png" alt="Find a penny, pick it up" width="24" height="24"> | **Find a penny, pick it up** | Click **17,777 golden cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom0113.png" alt="Four-leaf overkill" width="24" height="24"> | **Four-leaf overkill** | Click **37,777 golden cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom0213.png" alt="Rabbit's footnote" width="24" height="24"> | **Rabbit's footnote** | Click **47,777 golden cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom0313.png" alt="Knock on wood" width="24" height="24"> | **Knock on wood** | Click **57,777 golden cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom0413.png" alt="Jackpot jubilee" width="24" height="24"> | **Jackpot jubilee** | Click **67,777 golden cookies** across all ascensions |
| <img src="assets/generated-icons/SheetCustom0513.png" alt="Black cat's seventh paw" width="24" height="24"> | **Black cat's seventh paw** | Click **77,777 golden cookies** across all ascensions |
- See also **Gilded Restraint** and **Second Life, First Click**

### Cookies Baked In Ascension Achievements (7 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0012.png" alt="The Doughpocalypse" width="24" height="24"> | **The Doughpocalypse** | Bake **10 trevigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0112.png" alt="The Flour Flood" width="24" height="24"> | **The Flour Flood** | Bake **1 quattuorvigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0212.png" alt="The Ovenverse" width="24" height="24"> | **The Ovenverse** | Bake **100 quattuorvigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0312.png" alt="The Crumb Crusade" width="24" height="24"> | **The Crumb Crusade** | Bake **10 quinvigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0412.png" alt="The Final Batch" width="24" height="24"> | **The Final Batch** | Bake **1 sexvigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0512.png" alt="The Ultimate Ascension" width="24" height="24"> | **The Ultimate Ascension** | Bake **100 sexvigintillion cookies** in one ascension |
| <img src="assets/generated-icons/SheetCustom0612.png" alt="The Transcendent Rise" width="24" height="24"> | **The Transcendent Rise** | Bake **10 septenvigintillion cookies** in one ascension |

### Forfeited Cookies Achievements (13 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla0011.png" alt="Dante's unwaking dream" width="24" height="24"> | **Dante's unwaking dream** | Forfeit **1 novemdecillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0111.png" alt="The abyss gazes back" width="24" height="24"> | **The abyss gazes back** | Forfeit **1 vigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0211.png" alt="Charon's final toll" width="24" height="24"> | **Charon's final toll** | Forfeit **1 unvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0311.png" alt="Cerberus's third head" width="24" height="24"> | **Cerberus's third head** | Forfeit **1 duovigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0411.png" alt="Minos's eternal judgment" width="24" height="24"> | **Minos's eternal judgment** | Forfeit **1 trevigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0511.png" alt="The river Styx flows backward" width="24" height="24"> | **The river Styx flows backward** | Forfeit **1 quattuorvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0611.png" alt="Ixion's wheel spins faster" width="24" height="24"> | **Ixion's wheel spins faster** | Forfeit **1 quinvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0711.png" alt="Sisyphus's boulder crumbles" width="24" height="24"> | **Sisyphus's boulder crumbles** | Forfeit **1 sexvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0811.png" alt="Tantalus's eternal thirst" width="24" height="24"> | **Tantalus's eternal thirst** | Forfeit **1 septenvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla0911.png" alt="The ninth circle's center" width="24" height="24"> | **The ninth circle's center** | Forfeit **1 octovigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla1011.png" alt="Lucifer's frozen tears" width="24" height="24"> | **Lucifer's frozen tears** | Forfeit **1 novemvigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla1111.png" alt="Beyond the void's edge" width="24" height="24"> | **Beyond the void's edge** | Forfeit **1 trigintillion cookies** total across all ascensions |
| <img src="assets/generated-icons/SheetVanilla1211.png" alt="The final descent's end" width="24" height="24"> | **The final descent's end** | Forfeit **1 untrigintillion cookies** total across all ascensions |

### Building Ownership Achievements (13 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1612.png" alt="Septcentennial and a half" width="24" height="24"> | **Septcentennial and a half** | Have at least **750 of everything** |
| <img src="assets/generated-icons/SheetCustom1712.png" alt="Octcentennial" width="24" height="24"> | **Octcentennial** | Have at least **800 of everything** |
| <img src="assets/generated-icons/SheetCustom1812.png" alt="Octcentennial and a half" width="24" height="24"> | **Octcentennial and a half** | Have at least **850 of everything** |
| <img src="assets/generated-icons/SheetCustom1912.png" alt="Nonacentennial" width="24" height="24"> | **Nonacentennial** | Have at least **900 of everything** |
| <img src="assets/generated-icons/SheetCustom2012.png" alt="Nonacentennial and a half" width="24" height="24"> | **Nonacentennial and a half** | Have at least **950 of everything** |
| <img src="assets/generated-icons/SheetCustom2112.png" alt="Millennial" width="24" height="24"> | **Millennial** | Have at least **1,000 of everything** |
| <img src="assets/generated-icons/SheetCustom2212.png" alt="Building behemoth" width="24" height="24"> | **Building behemoth** | Own **15,000 buildings** |
| <img src="assets/generated-icons/SheetCustom2213.png" alt="Construction colossus" width="24" height="24"> | **Construction colossus** | Own **20,000 buildings** |
| <img src="assets/generated-icons/SheetCustom2214.png" alt="Architectural apex" width="24" height="24"> | **Architectural apex** | Own **25,000 buildings** |
| <img src="assets/generated-icons/SheetVanilla2826.png" alt="Asset Liquidator" width="24" height="24"> | **Asset Liquidator** | Sell **25,000 buildings** in one ascension |
| <img src="assets/generated-icons/SheetVanilla1509.png" alt="Flip City" width="24" height="24"> | **Flip City** | Sell **50,000 buildings** in one ascension |
| <img src="assets/generated-icons/SheetVanilla3233.png" alt="Ghost Town Tycoon" width="24" height="24"> | **Ghost Town Tycoon** | Sell **100,000 buildings** in one ascension |
| <img src="assets/generated-icons/SheetVanilla2627.png" alt="Have your sugar and eat it too" width="24" height="24"> | **Have your sugar and eat it too** | Have every building reach **level 10** |
- See also **The Final Countdown**, **Back to Basic Bakers**, **Modest Portfolio**, **Difficult Decisions**, and **Treading water**

### Reincarnation Achievements (3 achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1716.png" alt="Ascension master" width="24" height="24"> | **Ascension master** | Ascend **250 times** |
| <img src="assets/generated-icons/SheetCustom1715.png" alt="Ascension legend" width="24" height="24"> | **Ascension legend** | Ascend **500 times** |
| <img src="assets/generated-icons/SheetCustom1714.png" alt="Ascension deity" width="24" height="24"> | **Ascension deity** | Ascend **999 times** |

### Building Achievements by Building

#### Cursor (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0000.png" alt="Carpal diem" width="24" height="24"> | **Carpal diem** | Own **1,100 cursors** |
| <img src="assets/generated-icons/SheetCustom0001.png" alt="Hand over fist" width="24" height="24"> | **Hand over fist** | Own **1,150 cursors** |
| <img src="assets/generated-icons/SheetCustom0002.png" alt="Finger guns" width="24" height="24"> | **Finger guns** | Own **1,250 cursors** |
| <img src="assets/generated-icons/SheetCustom0003.png" alt="Thumbs up, buttercup" width="24" height="24"> | **Thumbs up, buttercup** | Own **1,300 cursors** |
| <img src="assets/generated-icons/SheetCustom0004.png" alt="Pointer sisters" width="24" height="24"> | **Pointer sisters** | Own **1,400 cursors** |
| <img src="assets/generated-icons/SheetCustom0005.png" alt="Knuckle sandwich" width="24" height="24"> | **Knuckle sandwich** | Own **1,450 cursors** |
| <img src="assets/generated-icons/SheetCustom0006.png" alt="Phalanx formation" width="24" height="24"> | **Phalanx formation** | Own **1,550 cursors** |
| <img src="assets/generated-icons/SheetCustom0007.png" alt="Manual override" width="24" height="24"> | **Manual override** | Own **1,600 cursors** |
| <img src="assets/generated-icons/SheetCustom0008.png" alt="Clickbaiter-in-chief" width="24" height="24"> | **Clickbaiter-in-chief** | Own **1,700 cursors** |
| <img src="assets/generated-icons/SheetCustom0009.png" alt="With flying digits" width="24" height="24"> | **With flying digits** | Own **1,750 cursors** |
| <img src="assets/generated-icons/SheetCustom0010.png" alt="Palm before the storm" width="24" height="24"> | **Palm before the storm** | Own **1,850 cursors** |
| <img src="assets/generated-icons/SheetCustom0021.png" alt="Click II: the sequel" width="24" height="24"> | **Click II: the sequel** | Make **1 septendecillion cookies** just from cursors |
| <img src="assets/generated-icons/SheetCustom0022.png" alt="Click III: we couldn't get Adam so it stars Jerry Seinfeld for some reason" width="24" height="24"> | **Click III: we couldn't get Adam so it stars Jerry Seinfeld for some reason** | Make **1 quindecillion cookies** just from cursors |
| <img src="assets/generated-icons/SheetCustom0023.png" alt="Click IV: 3% on rotten tomatoes" width="24" height="24"> | **Click IV: 3% on rotten tomatoes** | Make **1 sexdecillion cookies** just from cursors |
| <img src="assets/generated-icons/SheetCustom0019.png" alt="Rowdy shadow puppets" width="24" height="24"> | **Rowdy shadow puppets** | Reach **level 15** Cursors |
| <img src="assets/generated-icons/SheetCustom0020.png" alt="Frantic finger guns" width="24" height="24"> | **Frantic finger guns** | Reach **level 20** Cursors |

#### Grandma (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0100.png" alt="All rise for Nana" width="24" height="24"> | **All rise for Nana** | Own **750 grandmas** |
| <img src="assets/generated-icons/SheetCustom0101.png" alt="The crinkle collective" width="24" height="24"> | **The crinkle collective** | Own **800 grandmas** |
| <img src="assets/generated-icons/SheetCustom0102.png" alt="Okay elder" width="24" height="24"> | **Okay elder** | Own **850 grandmas** |
| <img src="assets/generated-icons/SheetCustom0103.png" alt="Wrinkle monarchy" width="24" height="24"> | **Wrinkle monarchy** | Own **900 grandmas** |
| <img src="assets/generated-icons/SheetCustom0104.png" alt="The wrinkling hour" width="24" height="24"> | **The wrinkling hour** | Own **950 grandmas** |
| <img src="assets/generated-icons/SheetCustom0105.png" alt="Matriarchal meltdown" width="24" height="24"> | **Matriarchal meltdown** | Own **1,000 grandmas** |
| <img src="assets/generated-icons/SheetCustom0106.png" alt="Cookies before crones" width="24" height="24"> | **Cookies before crones** | Own **1,050 grandmas** |
| <img src="assets/generated-icons/SheetCustom0107.png" alt="Dust to crust" width="24" height="24"> | **Dust to crust** | Own **1,100 grandmas** |
| <img src="assets/generated-icons/SheetCustom0108.png" alt="Bingo bloodbath" width="24" height="24"> | **Bingo bloodbath** | Own **1,150 grandmas** |
| <img src="assets/generated-icons/SheetCustom0109.png" alt="Supreme doughmother" width="24" height="24"> | **Supreme doughmother** | Own **1,200 grandmas** |
| <img src="assets/generated-icons/SheetCustom0110.png" alt="The last custodian" width="24" height="24"> | **The last custodian** | Own **1,250 grandmas** |
| <img src="assets/generated-icons/SheetCustom0121.png" alt="Scone with the wind" width="24" height="24"> | **Scone with the wind** | Make **1 septendecillion cookies** just from grandmas |
| <img src="assets/generated-icons/SheetCustom0122.png" alt="The flour of youth" width="24" height="24"> | **The flour of youth** | Make **1 quindecillion cookies** just from grandmas |
| <img src="assets/generated-icons/SheetCustom0123.png" alt="Bake-ageddon" width="24" height="24"> | **Bake-ageddon** | Make **1 sexdecillion cookies** just from grandmas |
| <img src="assets/generated-icons/SheetCustom0119.png" alt="Loaf &amp; behold" width="24" height="24"> | **Loaf & behold** | Reach **level 15** Grandmas |
| <img src="assets/generated-icons/SheetCustom0120.png" alt="Forbidden fruitcake" width="24" height="24"> | **Forbidden fruitcake** | Reach **level 20** Grandmas |

#### Farm (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0200.png" alt="Little house on the dairy" width="24" height="24"> | **Little house on the dairy** | Own **750 farms** |
| <img src="assets/generated-icons/SheetCustom0201.png" alt="The plow thickens" width="24" height="24"> | **The plow thickens** | Own **800 farms** |
| <img src="assets/generated-icons/SheetCustom0202.png" alt="Cabbage patch dynasty" width="24" height="24"> | **Cabbage patch dynasty** | Own **850 farms** |
| <img src="assets/generated-icons/SheetCustom0203.png" alt="Grazing amazement" width="24" height="24"> | **Grazing amazement** | Own **900 farms** |
| <img src="assets/generated-icons/SheetCustom0204.png" alt="Field of creams" width="24" height="24"> | **Field of creams** | Own **950 farms** |
| <img src="assets/generated-icons/SheetCustom0205.png" alt="Barn to be wild" width="24" height="24"> | **Barn to be wild** | Own **1,000 farms** |
| <img src="assets/generated-icons/SheetCustom0206.png" alt="Crops and robbers" width="24" height="24"> | **Crops and robbers** | Own **1,050 farms** |
| <img src="assets/generated-icons/SheetCustom0207.png" alt="Shoveling it in" width="24" height="24"> | **Shoveling it in** | Own **1,100 farms** |
| <img src="assets/generated-icons/SheetCustom0208.png" alt="Seed syndicate" width="24" height="24"> | **Seed syndicate** | Own **1,150 farms** |
| <img src="assets/generated-icons/SheetCustom0209.png" alt="Harvest high table" width="24" height="24"> | **Harvest high table** | Own **1,200 farms** |
| <img src="assets/generated-icons/SheetCustom0210.png" alt="Emperor of dirt" width="24" height="24"> | **Emperor of dirt** | Own **1,250 farms** |
| <img src="assets/generated-icons/SheetCustom0221.png" alt="Rake in the greens" width="24" height="24"> | **Rake in the greens** | Make **1 quattuordecillion cookies** just from farms |
| <img src="assets/generated-icons/SheetCustom0222.png" alt="The great threshering" width="24" height="24"> | **The great threshering** | Make **1 quindecillion cookies** just from farms |
| <img src="assets/generated-icons/SheetCustom0223.png" alt="Bushels of burden" width="24" height="24"> | **Bushels of burden** | Make **1 sexdecillion cookies** just from farms |
| <img src="assets/generated-icons/SheetCustom0219.png" alt="Huge-er tracts of land" width="24" height="24"> | **Huge-er tracts of land** | Reach **level 15** Farms |
| <img src="assets/generated-icons/SheetCustom0220.png" alt="Hoedown showdown" width="24" height="24"> | **Hoedown showdown** | Reach **level 20** Farms |

#### Mine (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0300.png" alt="Shafted" width="24" height="24"> | **Shafted** | Own **750 mines** |
| <img src="assets/generated-icons/SheetCustom0301.png" alt="Shiny object syndrome" width="24" height="24"> | **Shiny object syndrome** | Own **800 mines** |
| <img src="assets/generated-icons/SheetCustom0302.png" alt="Ore what?" width="24" height="24"> | **Ore what?** | Own **850 mines** |
| <img src="assets/generated-icons/SheetCustom0303.png" alt="Rubble without a cause" width="24" height="24"> | **Rubble without a cause** | Own **900 mines** |
| <img src="assets/generated-icons/SheetCustom0304.png" alt="Tunnel visionaries" width="24" height="24"> | **Tunnel visionaries** | Own **950 mines** |
| <img src="assets/generated-icons/SheetCustom0305.png" alt="Stalag-might" width="24" height="24"> | **Stalag-might** | Own **1,000 mines** |
| <img src="assets/generated-icons/SheetCustom0306.png" alt="Pyrite and prejudice" width="24" height="24"> | **Pyrite and prejudice** | Own **1,050 mines** |
| <img src="assets/generated-icons/SheetCustom0307.png" alt="Bedrock 'n roll" width="24" height="24"> | **Bedrock 'n roll** | Own **1,100 mines** |
| <img src="assets/generated-icons/SheetCustom0308.png" alt="Mantle management" width="24" height="24"> | **Mantle management** | Own **1,150 mines** |
| <img src="assets/generated-icons/SheetCustom0309.png" alt="Hollow crown jewels" width="24" height="24"> | **Hollow crown jewels** | Own **1,200 mines** |
| <img src="assets/generated-icons/SheetCustom0310.png" alt="Emperor of ore" width="24" height="24"> | **Emperor of ore** | Own **1,250 mines** |
| <img src="assets/generated-icons/SheetCustom0321.png" alt="Ore d'oeuvres" width="24" height="24"> | **Ore d'oeuvres** | Make **10 quattuordecillion cookies** just from mines |
| <img src="assets/generated-icons/SheetCustom0322.png" alt="Seismic yield" width="24" height="24"> | **Seismic yield** | Make **10 quindecillion cookies** just from mines |
| <img src="assets/generated-icons/SheetCustom0323.png" alt="Billionaire's bedrock" width="24" height="24"> | **Billionaire's bedrock** | Make **10 sexdecillion cookies** just from mines |
| <img src="assets/generated-icons/SheetCustom0319.png" alt="Cave-in king" width="24" height="24"> | **Cave-in king** | Reach **level 15** Mines |
| <img src="assets/generated-icons/SheetCustom0320.png" alt="Digging destiny" width="24" height="24"> | **Digging destiny** | Reach **level 20** Mines |

#### Factory (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0400.png" alt="Assembly required" width="24" height="24"> | **Assembly required** | Own **750 factories** |
| <img src="assets/generated-icons/SheetCustom0401.png" alt="Quality unassured" width="24" height="24"> | **Quality unassured** | Own **800 factories** |
| <img src="assets/generated-icons/SheetCustom0402.png" alt="Error 404-manpower not found" width="24" height="24"> | **Error 404-manpower not found** | Own **850 factories** |
| <img src="assets/generated-icons/SheetCustom0403.png" alt="Spare parts department" width="24" height="24"> | **Spare parts department** | Own **900 factories** |
| <img src="assets/generated-icons/SheetCustom0404.png" alt="Conveyor belters" width="24" height="24"> | **Conveyor belters** | Own **950 factories** |
| <img src="assets/generated-icons/SheetCustom0405.png" alt="Planned obsolescence" width="24" height="24"> | **Planned obsolescence** | Own **1,000 factories** |
| <img src="assets/generated-icons/SheetCustom0406.png" alt="Punch-card prophets" width="24" height="24"> | **Punch-card prophets** | Own **1,050 factories** |
| <img src="assets/generated-icons/SheetCustom0407.png" alt="Rust in peace" width="24" height="24"> | **Rust in peace** | Own **1,100 factories** |
| <img src="assets/generated-icons/SheetCustom0408.png" alt="Algorithm and blues" width="24" height="24"> | **Algorithm and blues** | Own **1,150 factories** |
| <img src="assets/generated-icons/SheetCustom0409.png" alt="Profit motive engine" width="24" height="24"> | **Profit motive engine** | Own **1,200 factories** |
| <img src="assets/generated-icons/SheetCustom0410.png" alt="Lord of the assembly" width="24" height="24"> | **Lord of the assembly** | Own **1,250 factories** |
| <img src="assets/generated-icons/SheetCustom0421.png" alt="Sweatshop symphony" width="24" height="24"> | **Sweatshop symphony** | Make **100 quattuordecillion cookies** just from factories |
| <img src="assets/generated-icons/SheetCustom0422.png" alt="Cookieconomics 101" width="24" height="24"> | **Cookieconomics 101** | Make **100 quindecillion cookies** just from factories |
| <img src="assets/generated-icons/SheetCustom0423.png" alt="Mass production messiah" width="24" height="24"> | **Mass production messiah** | Make **100 sexdecillion cookies** just from factories |
| <img src="assets/generated-icons/SheetCustom0419.png" alt="Boilerplate overlord" width="24" height="24"> | **Boilerplate overlord** | Reach **level 15** Factories |
| <img src="assets/generated-icons/SheetCustom0420.png" alt="Cookie standard time" width="24" height="24"> | **Cookie standard time** | Reach **level 20** Factories |

#### Bank (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1300.png" alt="Petty cash splash" width="24" height="24"> | **Petty cash splash** | Own **750 banks** |
| <img src="assets/generated-icons/SheetCustom1301.png" alt="The Invisible Hand That Feeds" width="24" height="24"> | **The Invisible Hand That Feeds** | Own **800 banks** |
| <img src="assets/generated-icons/SheetCustom1302.png" alt="Under-mattress banking" width="24" height="24"> | **Under-mattress banking** | Own **850 banks** |
| <img src="assets/generated-icons/SheetCustom1303.png" alt="Interest-ing times" width="24" height="24"> | **Interest-ing times** | Own **900 banks** |
| <img src="assets/generated-icons/SheetCustom1304.png" alt="Fee-fi-fo-fund" width="24" height="24"> | **Fee-fi-fo-fund** | Own **950 banks** |
| <img src="assets/generated-icons/SheetCustom1305.png" alt="Liquidity theater" width="24" height="24"> | **Liquidity theater** | Own **1,000 banks** |
| <img src="assets/generated-icons/SheetCustom1306.png" alt="Risk appetite: unlimited" width="24" height="24"> | **Risk appetite: unlimited** | Own **1,050 banks** |
| <img src="assets/generated-icons/SheetCustom1307.png" alt="Quantitative cheesing" width="24" height="24"> | **Quantitative cheesing** | Own **1,100 banks** |
| <img src="assets/generated-icons/SheetCustom1308.png" alt="Number go up economics" width="24" height="24"> | **Number go up economics** | Own **1,150 banks** |
| <img src="assets/generated-icons/SheetCustom1309.png" alt="Sovereign cookie fund" width="24" height="24"> | **Sovereign cookie fund** | Own **1,200 banks** |
| <img src="assets/generated-icons/SheetCustom1310.png" alt="Seigniorage supreme" width="24" height="24"> | **Seigniorage supreme** | Own **1,250 banks** |
| <img src="assets/generated-icons/SheetCustom1521.png" alt="Compound interest, compounded" width="24" height="24"> | **Compound interest, compounded** | Make **1 quindecillion cookies** just from banks |
| <img src="assets/generated-icons/SheetCustom1522.png" alt="Arbitrage avalanche" width="24" height="24"> | **Arbitrage avalanche** | Make **1 sexdecillion cookies** just from banks |
| <img src="assets/generated-icons/SheetCustom1523.png" alt="Ponzi à la mode" width="24" height="24"> | **Ponzi à la mode** | Make **1 septendecillion cookies** just from banks |
| <img src="assets/generated-icons/SheetCustom1119.png" alt="Credit conjurer" width="24" height="24"> | **Credit conjurer** | Reach **level 15** Banks |
| <img src="assets/generated-icons/SheetCustom1120.png" alt="Master of the Mint" width="24" height="24"> | **Master of the Mint** | Reach **level 20** Banks |

#### Temple (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1400.png" alt="Monk mode" width="24" height="24"> | **Monk mode** | Own **750 temples** |
| <img src="assets/generated-icons/SheetCustom1401.png" alt="Ritual and error" width="24" height="24"> | **Ritual and error** | Own **800 temples** |
| <img src="assets/generated-icons/SheetCustom1402.png" alt="Chant and deliver" width="24" height="24"> | **Chant and deliver** | Own **850 temples** |
| <img src="assets/generated-icons/SheetCustom1403.png" alt="Incensed and consecrated" width="24" height="24"> | **Incensed and consecrated** | Own **900 temples** |
| <img src="assets/generated-icons/SheetCustom1404.png" alt="Shrine of the times" width="24" height="24"> | **Shrine of the times** | Own **950 temples** |
| <img src="assets/generated-icons/SheetCustom1405.png" alt="Hallowed be thy grain" width="24" height="24"> | **Hallowed be thy grain** | Own **1,000 temples** |
| <img src="assets/generated-icons/SheetCustom1406.png" alt="Relic and roll" width="24" height="24"> | **Relic and roll** | Own **1,050 temples** |
| <img src="assets/generated-icons/SheetCustom1407.png" alt="Pilgrimage of crumbs" width="24" height="24"> | **Pilgrimage of crumbs** | Own **1,100 temples** |
| <img src="assets/generated-icons/SheetCustom1408.png" alt="The cookie pantheon" width="24" height="24"> | **The cookie pantheon** | Own **1,150 temples** |
| <img src="assets/generated-icons/SheetCustom1409.png" alt="Tithes and cookies" width="24" height="24"> | **Tithes and cookies** | Own **1,200 temples** |
| <img src="assets/generated-icons/SheetCustom1410.png" alt="Om-nom-nipotent" width="24" height="24"> | **Om-nom-nipotent** | Own **1,250 temples** |
| <img src="assets/generated-icons/SheetCustom1621.png" alt="Temple treasury overflow" width="24" height="24"> | **Temple treasury overflow** | Make **10 quindecillion cookies** just from temples |
| <img src="assets/generated-icons/SheetCustom1622.png" alt="Pantheon payout" width="24" height="24"> | **Pantheon payout** | Make **10 sexdecillion cookies** just from temples |
| <img src="assets/generated-icons/SheetCustom1623.png" alt="Sacred surplus" width="24" height="24"> | **Sacred surplus** | Make **10 septendecillion cookies** just from temples |
| <img src="assets/generated-icons/SheetCustom1219.png" alt="Acolyte ascendant" width="24" height="24"> | **Acolyte ascendant** | Reach **level 15** Temples |
| <img src="assets/generated-icons/SheetCustom1220.png" alt="Grand hierophant" width="24" height="24"> | **Grand hierophant** | Reach **level 20** Temples |

#### Wizard Tower (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1500.png" alt="Is this your cardamom?" width="24" height="24"> | **Is this your cardamom?** | Own **750 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1501.png" alt="Rabbit optional, hat mandatory" width="24" height="24"> | **Rabbit optional, hat mandatory** | Own **800 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1502.png" alt="Wand and done" width="24" height="24"> | **Wand and done** | Own **850 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1503.png" alt="Critical spellcheck failed" width="24" height="24"> | **Critical spellcheck failed** | Own **900 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1504.png" alt="Tome Raider" width="24" height="24"> | **Tome Raider** | Own **950 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1505.png" alt="Prestidigitation station" width="24" height="24"> | **Prestidigitation station** | Own **1,000 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1506.png" alt="Counterspell culture" width="24" height="24"> | **Counterspell culture** | Own **1,050 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1507.png" alt="Glitter is a material component" width="24" height="24"> | **Glitter is a material component** | Own **1,100 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1508.png" alt="Evocation nation" width="24" height="24"> | **Evocation nation** | Own **1,150 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1509.png" alt="Sphere of influence" width="24" height="24"> | **Sphere of influence** | Own **1,200 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1510.png" alt="The Last Archmage" width="24" height="24"> | **The Last Archmage** | Own **1,250 wizard towers** |
| <img src="assets/generated-icons/SheetCustom1721.png" alt="Rabbits per minute" width="24" height="24"> | **Rabbits per minute** | Make **100 quindecillion cookies** just from wizard towers |
| <img src="assets/generated-icons/SheetCustom1722.png" alt="Hocus bonus" width="24" height="24"> | **Hocus bonus** | Make **100 sexdecillion cookies** just from wizard towers |
| <img src="assets/generated-icons/SheetCustom1723.png" alt="Magic dividends" width="24" height="24"> | **Magic dividends** | Make **100 septendecillion cookies** just from wizard towers |
| <img src="assets/generated-icons/SheetCustom1319.png" alt="Archmage of Meringue" width="24" height="24"> | **Archmage of Meringue** | Reach **level 15** Wizard Towers |
| <img src="assets/generated-icons/SheetCustom1320.png" alt="Chronomancer emeritus" width="24" height="24"> | **Chronomancer emeritus** | Reach **level 20** Wizard Towers |

#### Shipment (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0500.png" alt="Door-to-airlock" width="24" height="24"> | **Door-to-airlock** | Own **750 shipments** |
| <img src="assets/generated-icons/SheetCustom0501.png" alt="Contents may shift in zero-G" width="24" height="24"> | **Contents may shift in zero-G** | Own **800 shipments** |
| <img src="assets/generated-icons/SheetCustom0502.png" alt="Fragile: vacuum inside" width="24" height="24"> | **Fragile: vacuum inside** | Own **850 shipments** |
| <img src="assets/generated-icons/SheetCustom0503.png" alt="Cosmic courier service" width="24" height="24"> | **Cosmic courier service** | Own **900 shipments** |
| <img src="assets/generated-icons/SheetCustom0504.png" alt="Porch pirates of Andromeda" width="24" height="24"> | **Porch pirates of Andromeda** | Own **950 shipments** |
| <img src="assets/generated-icons/SheetCustom0505.png" alt="Tracking number: ∞" width="24" height="24"> | **Tracking number: ∞** | Own **1,000 shipments** |
| <img src="assets/generated-icons/SheetCustom0506.png" alt="Relativistic courier" width="24" height="24"> | **Relativistic courier** | Own **1,050 shipments** |
| <img src="assets/generated-icons/SheetCustom0507.png" alt="Orbital rendezvous only" width="24" height="24"> | **Orbital rendezvous only** | Own **1,100 shipments** |
| <img src="assets/generated-icons/SheetCustom0508.png" alt="Return to sender: event horizon" width="24" height="24"> | **Return to sender: event horizon** | Own **1,150 shipments** |
| <img src="assets/generated-icons/SheetCustom0509.png" alt="Address: Unknown Quadrant" width="24" height="24"> | **Address: Unknown Quadrant** | Own **1,200 shipments** |
| <img src="assets/generated-icons/SheetCustom0510.png" alt="Postmaster Galactic" width="24" height="24"> | **Postmaster Galactic** | Own **1,250 shipments** |
| <img src="assets/generated-icons/SheetCustom0521.png" alt="Cargo cult classic" width="24" height="24"> | **Cargo cult classic** | Make **1 sexdecillion cookies** just from shipments |
| <img src="assets/generated-icons/SheetCustom0522.png" alt="Universal basic shipping" width="24" height="24"> | **Universal basic shipping** | Make **1 septendecillion cookies** just from shipments |
| <img src="assets/generated-icons/SheetCustom0523.png" alt="Comet-to-consumer" width="24" height="24"> | **Comet-to-consumer** | Make **1 octodecillion cookies** just from shipments |
| <img src="assets/generated-icons/SheetCustom0519.png" alt="Quartermaster of Orbits" width="24" height="24"> | **Quartermaster of Orbits** | Reach **level 15** Shipments |
| <img src="assets/generated-icons/SheetCustom0520.png" alt="Docking director" width="24" height="24"> | **Docking director** | Reach **level 20** Shipments |

#### Alchemy Lab (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0600.png" alt="Stir-crazy crucible" width="24" height="24"> | **Stir-crazy crucible** | Own **750 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0601.png" alt="Flask dance" width="24" height="24"> | **Flask dance** | Own **800 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0602.png" alt="Beaker than fiction" width="24" height="24"> | **Beaker than fiction** | Own **850 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0603.png" alt="Alloy-oop" width="24" height="24"> | **Alloy-oop** | Own **900 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0604.png" alt="Distill my beating heart" width="24" height="24"> | **Distill my beating heart** | Own **950 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0605.png" alt="Lead Zeppelin" width="24" height="24"> | **Lead Zeppelin** | Own **1,000 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0606.png" alt="Hg Wells" width="24" height="24"> | **Hg Wells** | Own **1,050 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0607.png" alt="Fe-fi-fo-fum" width="24" height="24"> | **Fe-fi-fo-fum** | Own **1,100 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0608.png" alt="Breaking bread with Walter White" width="24" height="24"> | **Breaking bread with Walter White** | Own **1,150 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0609.png" alt="Prima materia manager" width="24" height="24"> | **Prima materia manager** | Own **1,200 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0610.png" alt="The Philosopher's Scone" width="24" height="24"> | **The Philosopher's Scone** | Own **1,250 alchemy labs** |
| <img src="assets/generated-icons/SheetCustom0621.png" alt="Lead into bread" width="24" height="24"> | **Lead into bread** | Make **10 sexdecillion cookies** just from alchemy labs |
| <img src="assets/generated-icons/SheetCustom0622.png" alt="Philosopher's yield" width="24" height="24"> | **Philosopher's yield** | Make **10 septendecillion cookies** just from alchemy labs |
| <img src="assets/generated-icons/SheetCustom0623.png" alt="Auronomical returns" width="24" height="24"> | **Auronomical returns** | Make **10 octodecillion cookies** just from alchemy labs |
| <img src="assets/generated-icons/SheetCustom0619.png" alt="Retort wrangler" width="24" height="24"> | **Retort wrangler** | Reach **level 15** Alchemy Labs |
| <img src="assets/generated-icons/SheetCustom0620.png" alt="Circle of Quintessence" width="24" height="24"> | **Circle of Quintessence** | Reach **level 20** Alchemy Labs |

#### Portal (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0700.png" alt="Open sesameseed" width="24" height="24"> | **Open sesameseed** | Own **750 portals** |
| <img src="assets/generated-icons/SheetCustom0701.png" alt="Mind the rift" width="24" height="24"> | **Mind the rift** | Own **800 portals** |
| <img src="assets/generated-icons/SheetCustom0702.png" alt="Doorway to s'moreway" width="24" height="24"> | **Doorway to s'moreway** | Own **850 portals** |
| <img src="assets/generated-icons/SheetCustom0703.png" alt="Contents may phase in transit" width="24" height="24"> | **Contents may phase in transit** | Own **900 portals** |
| <img src="assets/generated-icons/SheetCustom0704.png" alt="Wormhole warranty voided" width="24" height="24"> | **Wormhole warranty voided** | Own **950 portals** |
| <img src="assets/generated-icons/SheetCustom0705.png" alt="Glitch in the Crumbatrix" width="24" height="24"> | **Glitch in the Crumbatrix** | Own **1,000 portals** |
| <img src="assets/generated-icons/SheetCustom0706.png" alt="Second pantry to the right" width="24" height="24"> | **Second pantry to the right** | Own **1,050 portals** |
| <img src="assets/generated-icons/SheetCustom0707.png" alt="Liminal sprinkles" width="24" height="24"> | **Liminal sprinkles** | Own **1,100 portals** |
| <img src="assets/generated-icons/SheetCustom0708.png" alt="Please do not feed the void" width="24" height="24"> | **Please do not feed the void** | Own **1,150 portals** |
| <img src="assets/generated-icons/SheetCustom0709.png" alt="Echoes from the other oven" width="24" height="24"> | **Echoes from the other oven** | Own **1,200 portals** |
| <img src="assets/generated-icons/SheetCustom0710.png" alt="Out past the exit sign" width="24" height="24"> | **Out past the exit sign** | Own **1,250 portals** |
| <img src="assets/generated-icons/SheetCustom0721.png" alt="Spacetime surcharge" width="24" height="24"> | **Spacetime surcharge** | Make **100 sexdecillion cookies** just from portals |
| <img src="assets/generated-icons/SheetCustom0722.png" alt="Interdimensional yield farming" width="24" height="24"> | **Interdimensional yield farming** | Make **100 septendecillion cookies** just from portals |
| <img src="assets/generated-icons/SheetCustom0723.png" alt="Event-horizon markup" width="24" height="24"> | **Event-horizon markup** | Make **100 octodecillion cookies** just from portals |
| <img src="assets/generated-icons/SheetCustom0719.png" alt="Non-Euclidean doorman" width="24" height="24"> | **Non-Euclidean doorman** | Reach **level 15** Portals |
| <img src="assets/generated-icons/SheetCustom0720.png" alt="Warden of Elsewhere" width="24" height="24"> | **Warden of Elsewhere** | Reach **level 20** Portals |

#### Time Machine (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0800.png" alt="Yeasterday" width="24" height="24"> | **Yeasterday** | Own **750 time machines** |
| <img src="assets/generated-icons/SheetCustom0801.png" alt="Tick-tock, bake o'clock" width="24" height="24"> | **Tick-tock, bake o'clock** | Own **800 time machines** |
| <img src="assets/generated-icons/SheetCustom0802.png" alt="Back to the batter" width="24" height="24"> | **Back to the batter** | Own **850 time machines** |
| <img src="assets/generated-icons/SheetCustom0803.png" alt="Déjà chewed" width="24" height="24"> | **Déjà chewed** | Own **900 time machines** |
| <img src="assets/generated-icons/SheetCustom0804.png" alt="Borrowed thyme" width="24" height="24"> | **Borrowed thyme** | Own **950 time machines** |
| <img src="assets/generated-icons/SheetCustom0805.png" alt="Second breakfast paradox" width="24" height="24"> | **Second breakfast paradox** | Own **1,000 time machines** |
| <img src="assets/generated-icons/SheetCustom0806.png" alt="Next week's news, fresh today" width="24" height="24"> | **Next week's news, fresh today** | Own **1,050 time machines** |
| <img src="assets/generated-icons/SheetCustom0807.png" alt="Live, die, bake, repeat" width="24" height="24"> | **Live, die, bake, repeat** | Own **1,100 time machines** |
| <img src="assets/generated-icons/SheetCustom0808.png" alt="Entropy-proof frosting" width="24" height="24"> | **Entropy-proof frosting** | Own **1,150 time machines** |
| <img src="assets/generated-icons/SheetCustom0809.png" alt="Past the last tick" width="24" height="24"> | **Past the last tick** | Own **1,200 time machines** |
| <img src="assets/generated-icons/SheetCustom0810.png" alt="Emperor of when" width="24" height="24"> | **Emperor of when** | Own **1,250 time machines** |
| <img src="assets/generated-icons/SheetCustom0821.png" alt="Future Profits, Past Tense" width="24" height="24"> | **Future Profits, Past Tense** | Make **1 septendecillion cookies** just from time machines |
| <img src="assets/generated-icons/SheetCustom0822.png" alt="Infinite Loop, Infinite Loot" width="24" height="24"> | **Infinite Loop, Infinite Loot** | Make **1 octodecillion cookies** just from time machines |
| <img src="assets/generated-icons/SheetCustom0823.png" alt="Back Pay from the Big Bang" width="24" height="24"> | **Back Pay from the Big Bang** | Make **1 novemdecillion cookies** just from time machines |
| <img src="assets/generated-icons/SheetCustom0819.png" alt="Minute handler" width="24" height="24"> | **Minute handler** | Reach **level 15** Time Machines |
| <img src="assets/generated-icons/SheetCustom0820.png" alt="Chronarch supreme" width="24" height="24"> | **Chronarch supreme** | Reach **level 20** Time Machines |

#### Antimatter Condenser (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1100.png" alt="Up and atom!" width="24" height="24"> | **Up and atom!** | Own **750 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1101.png" alt="Boson buddies" width="24" height="24"> | **Boson buddies** | Own **800 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1102.png" alt="Schrödinger's snack" width="24" height="24"> | **Schrödinger's snack** | Own **850 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1103.png" alt="Quantum foam party" width="24" height="24"> | **Quantum foam party** | Own **900 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1104.png" alt="Twenty years away (always)" width="24" height="24"> | **Twenty years away (always)** | Own **950 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1105.png" alt="Higgs and kisses" width="24" height="24"> | **Higgs and kisses** | Own **1,000 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1106.png" alt="Zero-point frosting" width="24" height="24"> | **Zero-point frosting** | Own **1,050 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1107.png" alt="Some like it dark (matter)" width="24" height="24"> | **Some like it dark (matter)** | Own **1,100 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1108.png" alt="Vacuum energy bar" width="24" height="24"> | **Vacuum energy bar** | Own **1,150 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1109.png" alt="Singularity of flavor" width="24" height="24"> | **Singularity of flavor** | Own **1,200 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1110.png" alt="Emperor of mass" width="24" height="24"> | **Emperor of mass** | Own **1,250 antimatter condensers** |
| <img src="assets/generated-icons/SheetCustom1321.png" alt="Pair production payout" width="24" height="24"> | **Pair production payout** | Make **10 septendecillion cookies** just from antimatter condensers |
| <img src="assets/generated-icons/SheetCustom1322.png" alt="Cross-section surplus" width="24" height="24"> | **Cross-section surplus** | Make **10 octodecillion cookies** just from antimatter condensers |
| <img src="assets/generated-icons/SheetCustom1323.png" alt="Powers of crumbs" width="24" height="24"> | **Powers of crumbs** | Make **10 novemdecillion cookies** just from antimatter condensers |
| <img src="assets/generated-icons/SheetCustom0919.png" alt="Quark wrangler" width="24" height="24"> | **Quark wrangler** | Reach **level 15** Antimatter Condensers |
| <img src="assets/generated-icons/SheetCustom0920.png" alt="Symmetry breaker" width="24" height="24"> | **Symmetry breaker** | Reach **level 20** Antimatter Condensers |

#### Prism (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1200.png" alt="Light reading" width="24" height="24"> | **Light reading** | Own **750 prisms** |
| <img src="assets/generated-icons/SheetCustom1201.png" alt="Refraction action" width="24" height="24"> | **Refraction action** | Own **800 prisms** |
| <img src="assets/generated-icons/SheetCustom1202.png" alt="Snacktrum of light" width="24" height="24"> | **Snacktrum of light** | Own **850 prisms** |
| <img src="assets/generated-icons/SheetCustom1203.png" alt="My cones and rods" width="24" height="24"> | **My cones and rods** | Own **900 prisms** |
| <img src="assets/generated-icons/SheetCustom1204.png" alt="Prism break" width="24" height="24"> | **Prism break** | Own **950 prisms** |
| <img src="assets/generated-icons/SheetCustom1205.png" alt="Prism prelate" width="24" height="24"> | **Prism prelate** | Own **1,000 prisms** |
| <img src="assets/generated-icons/SheetCustom1206.png" alt="Glare force one" width="24" height="24"> | **Glare force one** | Own **1,050 prisms** |
| <img src="assets/generated-icons/SheetCustom1207.png" alt="Hues Your Own Adventure" width="24" height="24"> | **Hues Your Own Adventure** | Own **1,100 prisms** |
| <img src="assets/generated-icons/SheetCustom1208.png" alt="Devour the spectrum" width="24" height="24"> | **Devour the spectrum** | Own **1,150 prisms** |
| <img src="assets/generated-icons/SheetCustom1209.png" alt="Crown of rainbows" width="24" height="24"> | **Crown of rainbows** | Own **1,200 prisms** |
| <img src="assets/generated-icons/SheetCustom1210.png" alt="Radiant consummation" width="24" height="24"> | **Radiant consummation** | Own **1,250 prisms** |
| <img src="assets/generated-icons/SheetCustom1421.png" alt="Photons pay dividends" width="24" height="24"> | **Photons pay dividends** | Make **100 septendecillion cookies** just from prisms |
| <img src="assets/generated-icons/SheetCustom1422.png" alt="Spectral surplus" width="24" height="24"> | **Spectral surplus** | Make **100 octodecillion cookies** just from prisms |
| <img src="assets/generated-icons/SheetCustom1423.png" alt="Dawn of plenty" width="24" height="24"> | **Dawn of plenty** | Make **100 novemdecillion cookies** just from prisms |
| <img src="assets/generated-icons/SheetCustom1019.png" alt="Master of refraction" width="24" height="24"> | **Master of refraction** | Reach **level 15** Prisms |
| <img src="assets/generated-icons/SheetCustom1020.png" alt="Keeper of the seven hues" width="24" height="24"> | **Keeper of the seven hues** | Reach **level 20** Prisms |

#### Chancemaker (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1700.png" alt="Beginner's lucked-in" width="24" height="24"> | **Beginner's lucked-in** | Own **750 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1701.png" alt="Risk it for the biscuit" width="24" height="24"> | **Risk it for the biscuit** | Own **800 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1702.png" alt="Roll, baby, roll" width="24" height="24"> | **Roll, baby, roll** | Own **850 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1703.png" alt="Luck be a ladyfinger" width="24" height="24"> | **Luck be a ladyfinger** | Own **900 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1704.png" alt="RNG on the range" width="24" height="24"> | **RNG on the range** | Own **950 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1705.png" alt="Monte Carlo kitchen" width="24" height="24"> | **Monte Carlo kitchen** | Own **1,000 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1706.png" alt="Gambler's fallacy, baker's edition" width="24" height="24"> | **Gambler's fallacy, baker's edition** | Own **1,050 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1707.png" alt="Schrödinger's jackpot" width="24" height="24"> | **Schrödinger's jackpot** | Own **1,100 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1708.png" alt="RNGesus take the wheel" width="24" height="24"> | **RNGesus take the wheel** | Own **1,150 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1709.png" alt="Hand of Fate: Full House" width="24" height="24"> | **Hand of Fate: Full House** | Own **1,200 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1710.png" alt="RNG seed of fortune" width="24" height="24"> | **RNG seed of fortune** | Own **1,250 chancemakers** |
| <img src="assets/generated-icons/SheetCustom1821.png" alt="Against all odds &amp; ends" width="24" height="24"> | **Against all odds & ends** | Make **1 octodecillion cookies** just from chancemakers |
| <img src="assets/generated-icons/SheetCustom1822.png" alt="Monte Carlo windfall" width="24" height="24"> | **Monte Carlo windfall** | Make **1 novemdecillion cookies** just from chancemakers |
| <img src="assets/generated-icons/SheetCustom1823.png" alt="Fate-backed securities" width="24" height="24"> | **Fate-backed securities** | Make **1 vigintillion cookies** just from chancemakers |
| <img src="assets/generated-icons/SheetCustom1419.png" alt="Seedkeeper of Fortune" width="24" height="24"> | **Seedkeeper of Fortune** | Reach **level 15** Chancemakers |
| <img src="assets/generated-icons/SheetCustom1420.png" alt="Master of Maybe" width="24" height="24"> | **Master of Maybe** | Reach **level 20** Chancemakers |

#### Fractal Engine (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1800.png" alt="Copy-paste-ry" width="24" height="24"> | **Copy-paste-ry** | Own **750 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1801.png" alt="Again, but smaller" width="24" height="24"> | **Again, but smaller** | Own **800 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1802.png" alt="Edge-case frosting" width="24" height="24"> | **Edge-case frosting** | Own **850 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1803.png" alt="Mandelbread set" width="24" height="24"> | **Mandelbread set** | Own **900 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1804.png" alt="Strange attractor, stranger baker" width="24" height="24"> | **Strange attractor, stranger baker** | Own **950 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1805.png" alt="Recursive taste test" width="24" height="24"> | **Recursive taste test** | Own **1,000 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1806.png" alt="Zoom &amp; enhance &amp; enhance" width="24" height="24"> | **Zoom & enhance & enhance** | Own **1,050 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1807.png" alt="The limit does not exist" width="24" height="24"> | **The limit does not exist** | Own **1,100 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1808.png" alt="Halting? Never heard of it" width="24" height="24"> | **Halting? Never heard of it** | Own **1,150 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1809.png" alt="The set contains you" width="24" height="24"> | **The set contains you** | Own **1,200 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1810.png" alt="Emperor of self-similarity" width="24" height="24"> | **Emperor of self-similarity** | Own **1,250 fractal engines** |
| <img src="assets/generated-icons/SheetCustom1921.png" alt="Infinite series surplus" width="24" height="24"> | **Infinite series surplus** | Make **10 octodecillion cookies** just from fractal engines |
| <img src="assets/generated-icons/SheetCustom1922.png" alt="Geometric mean feast" width="24" height="24"> | **Geometric mean feast** | Make **10 novemdecillion cookies** just from fractal engines |
| <img src="assets/generated-icons/SheetCustom1923.png" alt="Fractal jackpot" width="24" height="24"> | **Fractal jackpot** | Make **10 vigintillion cookies** just from fractal engines |
| <img src="assets/generated-icons/SheetCustom1519.png" alt="Archfractal" width="24" height="24"> | **Archfractal** | Reach **level 15** Fractal Engines |
| <img src="assets/generated-icons/SheetCustom1520.png" alt="Lord of Infinite Detail" width="24" height="24"> | **Lord of Infinite Detail** | Reach **level 20** Fractal Engines |

#### Javascript Console (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1900.png" alt="F12, open sesame" width="24" height="24"> | **F12, open sesame** | Own **750 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1901.png" alt="console.log('crumbs')" width="24" height="24"> | **console.log('crumbs')** | Own **800 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1902.png" alt="Semicolons optional, sprinkles mandatory" width="24" height="24"> | **Semicolons optional, sprinkles mandatory** | Own **850 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1903.png" alt="Undefined is not a function (nor a cookie)" width="24" height="24"> | **Undefined is not a function (nor a cookie)** | Own **900 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1904.png" alt="await fresh_from_oven()" width="24" height="24"> | **await fresh_from_oven()** | Own **950 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1905.png" alt="Event loop-de-loop" width="24" height="24"> | **Event loop-de-loop** | Own **1,000 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1906.png" alt="Regexorcism" width="24" height="24"> | **Regexorcism** | Own **1,050 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1907.png" alt="Infinite scroll of dough" width="24" height="24"> | **Infinite scroll of dough** | Own **1,100 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1908.png" alt="Unhandled promise confection" width="24" height="24"> | **Unhandled promise confection** | Own **1,150 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1909.png" alt="Single-threaded, single-minded" width="24" height="24"> | **Single-threaded, single-minded** | Own **1,200 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom1910.png" alt="Emperor of Runtime" width="24" height="24"> | **Emperor of Runtime** | Own **1,250 javascript consoles** |
| <img src="assets/generated-icons/SheetCustom2021.png" alt="Cookies per second()++" width="24" height="24"> | **Cookies per second()++** | Make **100 octodecillion cookies** just from javascript consoles |
| <img src="assets/generated-icons/SheetCustom2022.png" alt="Promise.all(paydays)" width="24" height="24"> | **Promise.all(paydays)** | Make **100 novemdecillion cookies** just from javascript consoles |
| <img src="assets/generated-icons/SheetCustom2023.png" alt="Async and ye shall receive" width="24" height="24"> | **Async and ye shall receive** | Make **100 vigintillion cookies** just from javascript consoles |
| <img src="assets/generated-icons/SheetCustom1619.png" alt="Stack tracer" width="24" height="24"> | **Stack tracer** | Reach **level 15** Javascript Consoles |
| <img src="assets/generated-icons/SheetCustom1620.png" alt="Event-loop overlord" width="24" height="24"> | **Event-loop overlord** | Reach **level 20** Javascript Consoles |

#### Idleverse (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2000.png" alt="Pick-a-verse, any verse" width="24" height="24"> | **Pick-a-verse, any verse** | Own **750 idleverses** |
| <img src="assets/generated-icons/SheetCustom2001.png" alt="Open in new universe" width="24" height="24"> | **Open in new universe** | Own **800 idleverses** |
| <img src="assets/generated-icons/SheetCustom2002.png" alt="Meanwhile, in a parallel tab" width="24" height="24"> | **Meanwhile, in a parallel tab** | Own **850 idleverses** |
| <img src="assets/generated-icons/SheetCustom2003.png" alt="Idle hands, infinite plans" width="24" height="24"> | **Idle hands, infinite plans** | Own **900 idleverses** |
| <img src="assets/generated-icons/SheetCustom2004.png" alt="Press any world to continue" width="24" height="24"> | **Press any world to continue** | Own **950 idleverses** |
| <img src="assets/generated-icons/SheetCustom2005.png" alt="NPC in someone else's save" width="24" height="24"> | **NPC in someone else's save** | Own **1,000 idleverses** |
| <img src="assets/generated-icons/SheetCustom2006.png" alt="Cookie of Theseus" width="24" height="24"> | **Cookie of Theseus** | Own **1,050 idleverses** |
| <img src="assets/generated-icons/SheetCustom2007.png" alt="Crossover episode" width="24" height="24"> | **Crossover episode** | Own **1,100 idleverses** |
| <img src="assets/generated-icons/SheetCustom2008.png" alt="Cosmic load balancer" width="24" height="24"> | **Cosmic load balancer** | Own **1,150 idleverses** |
| <img src="assets/generated-icons/SheetCustom2009.png" alt="Prime instance" width="24" height="24"> | **Prime instance** | Own **1,200 idleverses** |
| <img src="assets/generated-icons/SheetCustom2010.png" alt="The bakery at the end of everything" width="24" height="24"> | **The bakery at the end of everything** | Own **1,250 idleverses** |
| <img src="assets/generated-icons/SheetCustom2121.png" alt="Crossover dividends" width="24" height="24"> | **Crossover dividends** | Make **1 novemdecillion cookies** just from idleverses |
| <img src="assets/generated-icons/SheetCustom2122.png" alt="Many-Worlds ROI" width="24" height="24"> | **Many-Worlds ROI** | Make **100 vigintillion cookies** just from idleverses |
| <img src="assets/generated-icons/SheetCustom2123.png" alt="Continuity bonus" width="24" height="24"> | **Continuity bonus** | Make **10 duovigintillion cookies** just from idleverses |
| <img src="assets/generated-icons/SheetCustom1719.png" alt="Canon custodian" width="24" height="24"> | **Canon custodian** | Reach **level 15** Idleverses |
| <img src="assets/generated-icons/SheetCustom1720.png" alt="Keeper of the Uncountable" width="24" height="24"> | **Keeper of the Uncountable** | Reach **level 20** Idleverses |

#### Cortex Baker (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2100.png" alt="Gray matter batter" width="24" height="24"> | **Gray matter batter** | Own **750 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2101.png" alt="Outside the cookie box" width="24" height="24"> | **Outside the cookie box** | Own **800 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2102.png" alt="Prefrontal glaze" width="24" height="24"> | **Prefrontal glaze** | Own **850 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2103.png" alt="Snap, crackle, synapse" width="24" height="24"> | **Snap, crackle, synapse** | Own **900 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2104.png" alt="Temporal batch processing" width="24" height="24"> | **Temporal batch processing** | Own **950 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2105.png" alt="Cogito, ergo crumb" width="24" height="24"> | **Cogito, ergo crumb** | Own **1,000 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2106.png" alt="Galaxy brain, local oven" width="24" height="24"> | **Galaxy brain, local oven** | Own **1,050 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2107.png" alt="The bicameral ovens" width="24" height="24"> | **The bicameral ovens** | Own **1,100 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2108.png" alt="Theory of crumb" width="24" height="24"> | **Theory of crumb** | Own **1,150 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2109.png" alt="Lobe service" width="24" height="24"> | **Lobe service** | Own **1,200 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2110.png" alt="Mind the monarch" width="24" height="24"> | **Mind the monarch** | Own **1,250 cortex bakers** |
| <img src="assets/generated-icons/SheetCustom2221.png" alt="Brainstorm dividend" width="24" height="24"> | **Brainstorm dividend** | Make **10 novemdecillion cookies** just from cortex bakers |
| <img src="assets/generated-icons/SheetCustom2222.png" alt="Thought economy boom" width="24" height="24"> | **Thought economy boom** | Make **10 vigintillion cookies** just from cortex bakers |
| <img src="assets/generated-icons/SheetCustom2223.png" alt="Neural net worth" width="24" height="24"> | **Neural net worth** | Make **10 unvigintillion cookies** just from cortex bakers |
| <img src="assets/generated-icons/SheetCustom1819.png" alt="Chief Thinker Officer" width="24" height="24"> | **Chief Thinker Officer** | Reach **level 15** Cortex Bakers |
| <img src="assets/generated-icons/SheetCustom1820.png" alt="Mind over batter" width="24" height="24"> | **Mind over batter** | Reach **level 20** Cortex Bakers |

#### You (16 Achievements)
| Icon | Achievement | Requirement |
| --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2200.png" alt="Me, myself, and Icing" width="24" height="24"> | **Me, myself, and Icing** | Own **750 You** |
| <img src="assets/generated-icons/SheetCustom2201.png" alt="Copy of a copy" width="24" height="24"> | **Copy of a copy** | Own **800 You** |
| <img src="assets/generated-icons/SheetCustom2202.png" alt="Echo chamber" width="24" height="24"> | **Echo chamber** | Own **850 You** |
| <img src="assets/generated-icons/SheetCustom2203.png" alt="Self checkout" width="24" height="24"> | **Self checkout** | Own **900 You** |
| <img src="assets/generated-icons/SheetCustom2204.png" alt="You v2.0" width="24" height="24"> | **You v2.0** | Own **950 You** |
| <img src="assets/generated-icons/SheetCustom2205.png" alt="You v2.0.1 emergency hot fix" width="24" height="24"> | **You v2.0.1 emergency hot fix** | Own **1,000 You** |
| <img src="assets/generated-icons/SheetCustom2206.png" alt="Me, Inc." width="24" height="24"> | **Me, Inc.** | Own **1,050 You** |
| <img src="assets/generated-icons/SheetCustom2207.png" alt="Council of Me" width="24" height="24"> | **Council of Me** | Own **1,100 You** |
| <img src="assets/generated-icons/SheetCustom2208.png" alt="I, Legion" width="24" height="24"> | **I, Legion** | Own **1,150 You** |
| <img src="assets/generated-icons/SheetCustom2209.png" alt="The one true you" width="24" height="24"> | **The one true you** | Own **1,200 You** |
| <img src="assets/generated-icons/SheetCustom2210.png" alt="Sovereign of the self" width="24" height="24"> | **Sovereign of the self** | Own **1,250 You** |
| <img src="assets/generated-icons/SheetCustom2321.png" alt="Personal growth" width="24" height="24"> | **Personal growth** | Make **100 novemdecillion cookies** just from You |
| <img src="assets/generated-icons/SheetCustom2322.png" alt="Economies of selves" width="24" height="24"> | **Economies of selves** | Make **100 vigintillion cookies** just from You |
| <img src="assets/generated-icons/SheetCustom2323.png" alt="Self-sustaining singularity" width="24" height="24"> | **Self-sustaining singularity** | Make **100 unvigintillion cookies** just from You |
| <img src="assets/generated-icons/SheetCustom1919.png" alt="Identity custodian" width="24" height="24"> | **Identity custodian** | Reach **level 15** Yous |
| <img src="assets/generated-icons/SheetCustom1920.png" alt="First Person Plural" width="24" height="24"> | **First Person Plural** | Reach **level 20** Yous |

# New Upgrades

### The Great Orders of the Cookie Age
*Long before ovens were kindled and sugar knew its name, there arose six Orders, bakers, mystics, and crumb-guardians whose deeds shaped the fate of cookies forevermore. Each sworn to a creed, each guarding secrets older than the dough itself. - Transcribed by Crumblekeeper Thryce, 3rd Sifter of the Sacred Pantry*

| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1413.png" alt="Order of the Golden Crumb" width="24" height="24"> | **Order of the Golden Crumb** | - Requires [Vanilla Star achievement](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#completionist-achievements-7-achievements) | 250 years of base CpS, but no less than 1 duovigintillion cookies | Golden cookies appear **5%** more often. |
| <img src="assets/generated-icons/SheetCustom1513.png" alt="Order of the Impossible Batch" width="24" height="24"> | **Order of the Impossible Batch** | - Requires The [Final Challenger achievement](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#challenge-achievements-19-achievements) | 250 years of base CpS, but no less than 1 duovigintillion cookies | Golden cookies appear **5%** more often. |
| <img src="assets/generated-icons/SheetCustom1813.png" alt="Order of the Shining Spoon" width="24" height="24"> | **Order of the Shining Spoon** | - Requires all [Combo achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#combo-achievements-7-achievements) | 250 years of base CpS, but no less than 1 duovigintillion cookies | Golden cookie effects last **5%** longer. |
| <img src="assets/generated-icons/SheetCustom1713.png" alt="Order of the Cookie Eclipse" width="24" height="24"> | **Order of the Cookie Eclipse** | - Requires all [Grandmapocalypse achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#grandmapocalypse-achievements-15-achievements) | 250 years of base CpS, but no less than 1 duovigintillion cookies | Golden cookie effects last **5%** longer. |
| <img src="assets/generated-icons/SheetCustom1613.png" alt="Order of the Enchanted Whisk" width="24" height="24"> | **Order of the Enchanted Whisk** | - Requires all [Grimoire achievements](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#grimoire) | 250 years of base CpS, but no less than 1 duovigintillion cookies | Frenzy, Click Frenzy, and Elder Frenzy buffs are **5%** more powerful. |
| <img src="assets/generated-icons/SheetCustom1913.png" alt="Order of the Eternal Cookie" width="24" height="24"> | **Order of the Eternal Cookie** | - Requires all previous Great Orders of the Cookie Age upgrades | 1000 years of base CpS, but no less than 1 trevigintillion cookies | Golden cookies appear **5%** more often and effects last **5%** longer. |

### Kitten Upgrades (11 New Kitten Upgrades)
*Note: Expansion Kittens are the knock-off brand: cute, cuddly, and noticeably worse at their job. Don’t expect them to pull their weight like original vanilla flavored kittens, but they sure as heck do try hard.*

| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1600.png" alt="Kitten unpaid interns" width="24" height="24"> | **Kitten unpaid interns** | - Requires 500 achievements | **900 sexdecillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1601.png" alt="Kitten overpaid &quot;temporary&quot; contractors" width="24" height="24"> | **Kitten overpaid "temporary" contractors** | - Requires 550 achievements | **900 septendecillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1602.png" alt="Kitten remote workers" width="24" height="24"> | **Kitten remote workers** | - Requires 600 achievements | **900 octodecillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1603.png" alt="Kitten scrum masters" width="24" height="24"> | **Kitten scrum masters** | - Requires 650 achievements | **900 novemdecillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1604.png" alt="Kitten UX designers" width="24" height="24"> | **Kitten UX designers** | - Requires 700 achievements | **900 vigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1008.png" alt="Kitten janitors" width="24" height="24"> | **Kitten janitors** | - Requires 750 achievements | **900 unvigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1009.png" alt="Kitten coffee fetchers" width="24" height="24"> | **Kitten coffee fetchers** | - Requires 800 achievements | **900 duovigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1010.png" alt="Kitten personal assistants" width="24" height="24"> | **Kitten personal assistants** | - Requires 850 achievements | **900 trevigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1608.png" alt="Kitten vice presidents" width="24" height="24"> | **Kitten vice presidents** | - Requires 900 achievements | **900 quattuorvigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1609.png" alt="Kitten board members" width="24" height="24"> | **Kitten board members** | - Requires 950 achievements | **900 quinvigintillion cookies** | Provides small production bonus |
| <img src="assets/generated-icons/SheetCustom1610.png" alt="Kitten founders" width="24" height="24"> | **Kitten founders** | - Requires 1000 achievements | **900 sexvigintillion cookies** | Provides small production bonus |

### Generic Upgrades
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla3404.png" alt="Box of improved cookies" width="24" height="24"> | **Box of improved cookies** | - Requires 25 unvigintillion cookies baked | **25 unvigintillion cookies** | Contains an assortment of scientifically improved cookies, 25 cookies to a box. |

### Cookie Production Upgrades (25 New Cookies)
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla0203.png" alt="Improved Plain cookies" width="24" height="24"> | **Improved Plain cookies** | - Requires Box of improved cookies<br>- Requires 250 unvigintillion cookies baked | **500 unvigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0703.png" alt="Improved Sugar cookies" width="24" height="24"> | **Improved Sugar cookies** | - Requires Box of improved cookies<br>- Requires 500 unvigintillion cookies baked | **1 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0003.png" alt="Improved Oatmeal raisin cookies" width="24" height="24"> | **Improved Oatmeal raisin cookies** | - Requires Box of improved cookies<br>- Requires 1 duovigintillion cookies baked | **2 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0103.png" alt="Improved Peanut butter cookies" width="24" height="24"> | **Improved Peanut butter cookies** | - Requires Box of improved cookies<br>- Requires 2 duovigintillion cookies baked | **4 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0303.png" alt="Improved Coconut cookies" width="24" height="24"> | **Improved Coconut cookies** | - Requires Box of improved cookies<br>- Requires 4 duovigintillion cookies baked | **8 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0503.png" alt="Improved Macadamia nut cookies" width="24" height="24"> | **Improved Macadamia nut cookies** | - Requires Box of improved cookies<br>- Requires 8 duovigintillion cookies baked | **16 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2127.png" alt="Improved Almond cookies" width="24" height="24"> | **Improved Almond cookies** | - Requires Box of improved cookies<br>- Requires 16 duovigintillion cookies baked | **32 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2227.png" alt="Improved Hazelnut cookies" width="24" height="24"> | **Improved Hazelnut cookies** | - Requires Box of improved cookies<br>- Requires 32.5 duovigintillion cookies baked | **65 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2327.png" alt="Improved Walnut cookies" width="24" height="24"> | **Improved Walnut cookies** | - Requires Box of improved cookies<br>- Requires 65 duovigintillion cookies baked | **130 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla3207.png" alt="Improved Cashew cookies" width="24" height="24"> | **Improved Cashew cookies** | - Requires Box of improved cookies<br>- Requires 130 duovigintillion cookies baked | **260 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0403.png" alt="Improved White chocolate cookies" width="24" height="24"> | **Improved White chocolate cookies** | - Requires Box of improved cookies<br>- Requires 260 duovigintillion cookies baked | **520 duovigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla3307.png" alt="Improved Milk chocolate cookies" width="24" height="24"> | **Improved Milk chocolate cookies** | - Requires Box of improved cookies<br>- Requires 500 duovigintillion cookies baked | **1 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0603.png" alt="Improved Double-chip cookies" width="24" height="24"> | **Improved Double-chip cookies** | - Requires Box of improved cookies<br>- Requires 1 trevigintillion cookies baked | **2 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0803.png" alt="Improved White chocolate macadamia nut cookies" width="24" height="24"> | **Improved White chocolate macadamia nut cookies** | - Requires Box of improved cookies<br>- Requires 2 trevigintillion cookies baked | **4 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0903.png" alt="Improved All-chocolate cookies" width="24" height="24"> | **Improved All-chocolate cookies** | - Requires Box of improved cookies<br>- Requires 4 trevigintillion cookies baked | **8 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla1003.png" alt="Improved Dark chocolate-coated cookies" width="24" height="24"> | **Improved Dark chocolate-coated cookies** | - Requires Box of improved cookies<br>- Requires 8 trevigintillion cookies baked | **16 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla1103.png" alt="Improved White chocolate-coated cookies" width="24" height="24"> | **Improved White chocolate-coated cookies** | - Requires Box of improved cookies<br>- Requires 16 trevigintillion cookies baked | **32 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0004.png" alt="Improved Eclipse cookies" width="24" height="24"> | **Improved Eclipse cookies** | - Requires Box of improved cookies<br>- Requires 32.5 trevigintillion cookies baked | **65 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0104.png" alt="Improved Zebra cookies" width="24" height="24"> | **Improved Zebra cookies** | - Requires Box of improved cookies<br>- Requires 65 trevigintillion cookies baked | **130 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0204.png" alt="Improved Snickerdoodles" width="24" height="24"> | **Improved Snickerdoodles** | - Requires Box of improved cookies<br>- Requires 130 trevigintillion cookies baked | **260 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0304.png" alt="Improved Stroopwafels" width="24" height="24"> | **Improved Stroopwafels** | - Requires Box of improved cookies<br>- Requires 260 trevigintillion cookies baked | **520 trevigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0404.png" alt="Improved Macaroons" width="24" height="24"> | **Improved Macaroons** | - Requires Box of improved cookies<br>- Requires 500 trevigintillion cookies baked | **1 quattuorvigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla0504.png" alt="Improved Empire biscuits" width="24" height="24"> | **Improved Empire biscuits** | - Requires Box of improved cookies<br>- Requires 1 quattuorvigintillion cookies baked | **2 quattuorvigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla1203.png" alt="Improved Madeleines" width="24" height="24"> | **Improved Madeleines** | - Requires Box of improved cookies<br>- Requires 2 quattuorvigintillion cookies baked | **4 quattuorvigintillion cookies** | 2% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla1303.png" alt="Improved Palmiers" width="24" height="24"> | **Improved Palmiers** | - Requires Box of improved cookies<br>- Requires 5 quattuorvigintillion cookies baked | **10 quattuorvigintillion cookies** | 2% cookie production increase |

### Building Count Reward Cookies
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetVanilla2708.png" alt="Improved Milk chocolate butter biscuit" width="24" height="24"> | **Improved Milk chocolate butter biscuit** | - Requires at least 750 of every building type | **1 duovigintillion cookies** | 10% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2709.png" alt="Improved Dark chocolate butter biscuit" width="24" height="24"> | **Improved Dark chocolate butter biscuit** | - Requires at least 800 of every building type | **1 trevigintillion cookies** | 10% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2809.png" alt="Improved White chocolate butter biscuit" width="24" height="24"> | **Improved White chocolate butter biscuit** | - Requires at least 850 of every building type | **1 quattuorvigintillion cookies** | 10% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2808.png" alt="Improved Ruby chocolate butter biscuit" width="24" height="24"> | **Improved Ruby chocolate butter biscuit** | - Requires at least 900 of every building type | **1 quinvigintillion cookies** | 10% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2610.png" alt="Improved Lavender chocolate butter biscuit" width="24" height="24"> | **Improved Lavender chocolate butter biscuit** | - Requires at least 950 of every building type | **1 sexvigintillion cookies** | 10% cookie production increase |
| <img src="assets/generated-icons/SheetVanilla2426.png" alt="Improved Synthetic chocolate green honey butter biscuit" width="24" height="24"> | **Improved Synthetic chocolate green honey butter biscuit** | - Requires at least 1,000 of every building type | **1 septenvigintillion cookies** | 10% cookie production increase |

### Building Upgrades (Efficiency + Cost Reductions) (209 Upgrades)
*Note: These upgrades provide cumulative 5% cost reductions for their respective buildings. Each upgrade applies a 5% discount to the remaining cost, so owning all 6 upgrades for a building provides approximately a 26.5% total discount.*

##### Grandma
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0100.png" alt="Increased Social Security Checks" width="24" height="24"> | **Increased Social Security Checks** | - Requires 750 grandmas | **50 quintillion cookies** | Grandmas cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0101.png" alt="Advanced knitting techniques" width="24" height="24"> | **Advanced knitting techniques** | - Requires 800 grandmas | **50 quintillion cookies** | Grandmas are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0102.png" alt="Off-Brand Eyeglasses" width="24" height="24"> | **Off-Brand Eyeglasses** | - Requires 850 grandmas | **50 sextillion cookies** | Grandmas cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0103.png" alt="Bingo night optimization" width="24" height="24"> | **Bingo night optimization** | - Requires 900 grandmas | **50 sextillion cookies** | Grandmas are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0104.png" alt="Plastic Walkers" width="24" height="24"> | **Plastic Walkers** | - Requires 950 grandmas | **50 septillion cookies** | Grandmas cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0105.png" alt="Tea time efficiency" width="24" height="24"> | **Tea time efficiency** | - Requires 1000 grandmas | **50 septillion cookies** | Grandmas are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0106.png" alt="Bulk Discount Hearing Aids" width="24" height="24"> | **Bulk Discount Hearing Aids** | - Requires 1050 grandmas | **50 octillion cookies** | Grandmas cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0107.png" alt="Gossip-powered baking" width="24" height="24"> | **Gossip-powered baking** | - Requires 1100 grandmas | **50 octillion cookies** | Grandmas are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0108.png" alt="Generic Arthritis Medication" width="24" height="24"> | **Generic Arthritis Medication** | - Requires 1150 grandmas | **50 nonillion cookies** | Grandmas cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0109.png" alt="Senior discount mastery" width="24" height="24"> | **Senior discount mastery** | - Requires 1200 grandmas | **50 nonillion cookies** | Grandmas are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0110.png" alt="Wholesale Denture Adhesive" width="24" height="24"> | **Wholesale Denture Adhesive** | - Requires 1250 grandmas | **50 decillion cookies** | Grandmas cost **5%** less |

##### Farm
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0200.png" alt="Biodiesel fueled tractors" width="24" height="24"> | **Biodiesel fueled tractors** | - Requires 750 farms | **50 sextillion cookies** | Farms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0201.png" alt="Hydroponic cookie cultivation" width="24" height="24"> | **Hydroponic cookie cultivation** | - Requires 800 farms | **5.5 quattuordecillion cookies** | Farms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0202.png" alt="Free manure from clone factories" width="24" height="24"> | **Free manure from clone factories** | - Requires 850 farms | **50 septillion cookies** | Farms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0203.png" alt="Vertical farming revolution" width="24" height="24"> | **Vertical farming revolution** | - Requires 900 farms | **5.5 quindecillion cookies** | Farms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0204.png" alt="Solar-powered irrigation systems" width="24" height="24"> | **Solar-powered irrigation systems** | - Requires 950 farms | **50 octillion cookies** | Farms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0205.png" alt="Quantum crop rotation" width="24" height="24"> | **Quantum crop rotation** | - Requires 1000 farms | **5.5 sexdecillion cookies** | Farms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0206.png" alt="Bulk seed purchases" width="24" height="24"> | **Bulk seed purchases** | - Requires 1050 farms | **50 nonillion cookies** | Farms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0207.png" alt="Sentient soil enhancement" width="24" height="24"> | **Sentient soil enhancement** | - Requires 1100 farms | **5.5 septendecillion cookies** | Farms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0208.png" alt="Robot farm hands" width="24" height="24"> | **Robot farm hands** | - Requires 1150 farms | **50 decillion cookies** | Farms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0209.png" alt="Temporal harvest acceleration" width="24" height="24"> | **Temporal harvest acceleration** | - Requires 1200 farms | **5.5 octodecillion cookies** | Farms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0210.png" alt="Vertical farming subsidies" width="24" height="24"> | **Vertical farming subsidies** | - Requires 1250 farms | **50 undecillion cookies** | Farms cost **5%** less |

##### Mine
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0300.png" alt="Clearance shaft kits" width="24" height="24"> | **Clearance shaft kits** | - Requires 750 mines | **50 septillion cookies** | Mines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0301.png" alt="Quantum tunneling excavation" width="24" height="24"> | **Quantum tunneling excavation** | - Requires 800 mines | **6 quattuordecillion cookies** | Mines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0302.png" alt="Punch-card TNT club" width="24" height="24"> | **Punch-card TNT club** | - Requires 850 mines | **50 octillion cookies** | Mines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0303.png" alt="Neutron star compression" width="24" height="24"> | **Neutron star compression** | - Requires 900 mines | **6 quindecillion cookies** | Mines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0304.png" alt="Hand-me-down hardhats" width="24" height="24"> | **Hand-me-down hardhats** | - Requires 950 mines | **50 nonillion cookies** | Mines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0305.png" alt="Dimensional rift mining" width="24" height="24"> | **Dimensional rift mining** | - Requires 1000 mines | **6 sexdecillion cookies** | Mines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0306.png" alt="Lease-back drill rigs" width="24" height="24"> | **Lease-back drill rigs** | - Requires 1050 mines | **50 decillion cookies** | Mines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0307.png" alt="Singularity core extraction" width="24" height="24"> | **Singularity core extraction** | - Requires 1100 mines | **6 septendecillion cookies** | Mines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0308.png" alt="Ore cartel coupons" width="24" height="24"> | **Ore cartel coupons** | - Requires 1150 mines | **50 undecillion cookies** | Mines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0309.png" alt="Temporal paradox drilling" width="24" height="24"> | **Temporal paradox drilling** | - Requires 1200 mines | **6 octodecillion cookies** | Mines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0310.png" alt="Cave-in insurance kickbacks" width="24" height="24"> | **Cave-in insurance kickbacks** | - Requires 1250 mines | **50 duodecillion cookies** | Mines cost **5%** less |

##### Factory
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0400.png" alt="Flat-pack factory frames" width="24" height="24"> | **Flat-pack factory frames** | - Requires 750 factories | **50 octillion cookies** | Factories cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0401.png" alt="Quantum assembly optimization" width="24" height="24"> | **Quantum assembly optimization** | - Requires 800 factories | **65 quindecillion cookies** | Factories are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0402.png" alt="BOGO rivet bins" width="24" height="24"> | **BOGO rivet bins** | - Requires 850 factories | **50 nonillion cookies** | Factories cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0403.png" alt="Temporal manufacturing loops" width="24" height="24"> | **Temporal manufacturing loops** | - Requires 900 factories | **65 sexdecillion cookies** | Factories are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0404.png" alt="Off-brand gear grease" width="24" height="24"> | **Off-brand gear grease** | - Requires 950 factories | **50 decillion cookies** | Factories cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0405.png" alt="Dimensional cookie synthesis" width="24" height="24"> | **Dimensional cookie synthesis** | - Requires 1000 factories | **65 septendecillion cookies** | Factories are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0406.png" alt="Misprint warning labels" width="24" height="24"> | **Misprint warning labels** | - Requires 1050 factories | **50 undecillion cookies** | Factories cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0407.png" alt="Singularity production cores" width="24" height="24"> | **Singularity production cores** | - Requires 1100 factories | **65 octodecillion cookies** | Factories are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0408.png" alt="Pallet-jack rebates" width="24" height="24"> | **Pallet-jack rebates** | - Requires 1150 factories | **50 duodecillion cookies** | Factories cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0409.png" alt="Reality-warping assembly" width="24" height="24"> | **Reality-warping assembly** | - Requires 1200 factories | **65 novemdecillion cookies** | Factories are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0410.png" alt="Prefab cookie modules" width="24" height="24"> | **Prefab cookie modules** | - Requires 1250 factories | **50 tredecillion cookies** | Factories cost **5%** less |

##### Bank
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1300.png" alt="Piggy buyback bonanza" width="24" height="24"> | **Piggy buyback bonanza** | - Requires 750 banks | **50 nonillion cookies** | Banks cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1301.png" alt="Quantum banking protocols" width="24" height="24"> | **Quantum banking protocols** | - Requires 800 banks | **700 quindecillion cookies** | Banks are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1302.png" alt="Vault door floor-models" width="24" height="24"> | **Vault door floor-models** | - Requires 850 banks | **50 decillion cookies** | Banks cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1303.png" alt="Temporal interest compounding" width="24" height="24"> | **Temporal interest compounding** | - Requires 900 banks | **700 sexdecillion cookies** | Banks are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1304.png" alt="Pen-on-a-chain procurement" width="24" height="24"> | **Pen-on-a-chain procurement** | - Requires 950 banks | **50 undecillion cookies** | Banks cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1305.png" alt="Dimensional currency exchange" width="24" height="24"> | **Dimensional currency exchange** | - Requires 1000 banks | **700 septendecillion cookies** | Banks are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1306.png" alt="Complimentary complimentary mints" width="24" height="24"> | **Complimentary complimentary mints** | - Requires 1050 banks | **50 duodecillion cookies** | Banks cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1307.png" alt="Singularity financial algorithms" width="24" height="24"> | **Singularity financial algorithms** | - Requires 1100 banks | **700 octodecillion cookies** | Banks are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1308.png" alt="Fee waiver wavers" width="24" height="24"> | **Fee waiver wavers** | - Requires 1150 banks | **50 tredecillion cookies** | Banks cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1309.png" alt="Reality-warping economics" width="24" height="24"> | **Reality-warping economics** | - Requires 1200 banks | **700 novemdecillion cookies** | Banks are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1310.png" alt="Dough Jones clearance" width="24" height="24"> | **Dough Jones clearance** | - Requires 1250 banks | **50 quattuordecillion cookies** | Banks cost **5%** less |

##### Temple
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1400.png" alt="Tithe punch cards" width="24" height="24"> | **Tithe punch cards** | - Requires 750 temples | **50 decillion cookies** | Temples cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1401.png" alt="Quantum divine intervention" width="24" height="24"> | **Quantum divine intervention** | - Requires 800 temples | **10 sexdecillion cookies** | Temples are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1402.png" alt="Relic replica racks" width="24" height="24"> | **Relic replica racks** | - Requires 850 temples | **50 undecillion cookies** | Temples cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1403.png" alt="Temporal prayer loops" width="24" height="24"> | **Temporal prayer loops** | - Requires 900 temples | **10 septendecillion cookies** | Temples are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1404.png" alt="Incense refill program" width="24" height="24"> | **Incense refill program** | - Requires 950 temples | **50 duodecillion cookies** | Temples cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1405.png" alt="Dimensional deity summoning" width="24" height="24"> | **Dimensional deity summoning** | - Requires 1000 temples | **10 octodecillion cookies** | Temples are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1406.png" alt="Chant-o-matic hymn reels" width="24" height="24"> | **Chant-o-matic hymn reels** | - Requires 1050 temples | **50 tredecillion cookies** | Temples cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1407.png" alt="Singularity divine consciousness" width="24" height="24"> | **Singularity divine consciousness** | - Requires 1100 temples | **10 novemdecillion cookies** | Temples are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1408.png" alt="Pew-per-view sponsorships" width="24" height="24"> | **Pew-per-view sponsorships** | - Requires 1150 temples | **50 quattuordecillion cookies** | Temples cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1409.png" alt="Reality-warping divinity" width="24" height="24"> | **Reality-warping divinity** | - Requires 1200 temples | **10 vigintillion cookies** | Temples are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1410.png" alt="Sacred site tax amnesty" width="24" height="24"> | **Sacred site tax amnesty** | - Requires 1250 temples | **50 quindecillion cookies** | Temples cost **5%** less |

##### Wizard Tower
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1500.png" alt="Wand warranty returns" width="24" height="24"> | **Wand warranty returns** | - Requires 750 wizard towers | **50 undecillion cookies** | Wizard towers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1501.png" alt="Arcane resonance" width="24" height="24"> | **Arcane resonance** | - Requires 800 wizard towers | **165 sexdecillion cookies** | Wizard towers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1502.png" alt="Grimoire remainder sale" width="24" height="24"> | **Grimoire remainder sale** | - Requires 850 wizard towers | **50 duodecillion cookies** | Wizard towers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1503.png" alt="Spell weaving" width="24" height="24"> | **Spell weaving** | - Requires 900 wizard towers | **165 septendecillion cookies** | Wizard towers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1504.png" alt="Robes with “character”" width="24" height="24"> | **Robes with “character”** | - Requires 950 wizard towers | **50 tredecillion cookies** | Wizard towers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1505.png" alt="Mystical attunement" width="24" height="24"> | **Mystical attunement** | - Requires 1000 wizard towers | **165 octodecillion cookies** | Wizard towers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1506.png" alt="Familiar foster program" width="24" height="24"> | **Familiar foster program** | - Requires 1050 wizard towers | **50 quattuordecillion cookies** | Wizard towers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1507.png" alt="Ethereal manifestation" width="24" height="24"> | **Ethereal manifestation** | - Requires 1100 wizard towers | **165 novemdecillion cookies** | Wizard towers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1508.png" alt="Council scroll stipends" width="24" height="24"> | **Council scroll stipends** | - Requires 1150 wizard towers | **50 quindecillion cookies** | Wizard towers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1509.png" alt="Transcendent thaumaturgy" width="24" height="24"> | **Transcendent thaumaturgy** | - Requires 1200 wizard towers | **165 vigintillion cookies** | Wizard towers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1510.png" alt="Broom-sharing scheme" width="24" height="24"> | **Broom-sharing scheme** | - Requires 1250 wizard towers | **50 sexdecillion cookies** | Wizard towers cost **5%** less |

##### Shipment
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0500.png" alt="Retired cargo pods" width="24" height="24"> | **Retired cargo pods** | - Requires 750 shipments | **50 duodecillion cookies** | Shipments cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0501.png" alt="Hypervelocity transport" width="24" height="24"> | **Hypervelocity transport** | - Requires 800 shipments | **2.55 septendecillion cookies** | Shipments are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0502.png" alt="Container co-op cards" width="24" height="24"> | **Container co-op cards** | - Requires 850 shipments | **50 tredecillion cookies** | Shipments cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0503.png" alt="Spatial compression" width="24" height="24"> | **Spatial compression** | - Requires 900 shipments | **2.55 octodecillion cookies** | Shipments are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0504.png" alt="Reusable launch crates" width="24" height="24"> | **Reusable launch crates** | - Requires 950 shipments | **50 quattuordecillion cookies** | Shipments cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0505.png" alt="Dimensional routing" width="24" height="24"> | **Dimensional routing** | - Requires 1000 shipments | **2.55 novemdecillion cookies** | Shipments are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0506.png" alt="Autodocker apprentices" width="24" height="24"> | **Autodocker apprentices** | - Requires 1050 shipments | **50 quindecillion cookies** | Shipments cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0507.png" alt="Quantum teleportation" width="24" height="24"> | **Quantum teleportation** | - Requires 1100 shipments | **2.55 vigintillion cookies** | Shipments are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0508.png" alt="Route rebate vouchers" width="24" height="24"> | **Route rebate vouchers** | - Requires 1150 shipments | **50 sexdecillion cookies** | Shipments cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0509.png" alt="Causality manipulation" width="24" height="24"> | **Causality manipulation** | - Requires 1200 shipments | **2.55 unvigintillion cookies** | Shipments are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0510.png" alt="Free-trade cookie ports" width="24" height="24"> | **Free-trade cookie ports** | - Requires 1250 shipments | **50 septendecillion cookies** | Shipments cost **5%** less |

##### Alchemy Lab
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0600.png" alt="Beaker buybacks" width="24" height="24"> | **Beaker buybacks** | - Requires 750 alchemy labs | **50 tredecillion cookies** | Alchemy labs cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0601.png" alt="Essence distillation" width="24" height="24"> | **Essence distillation** | - Requires 800 alchemy labs | **37.5 septendecillion cookies** | Alchemy labs are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0602.png" alt="Philosopher’s pebbles" width="24" height="24"> | **Philosopher’s pebbles** | - Requires 850 alchemy labs | **50 quattuordecillion cookies** | Alchemy labs cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0603.png" alt="Molecular gastronomy" width="24" height="24"> | **Molecular gastronomy** | - Requires 900 alchemy labs | **37.5 octodecillion cookies** | Alchemy labs are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0604.png" alt="Cool-running crucibles" width="24" height="24"> | **Cool-running crucibles** | - Requires 950 alchemy labs | **50 quindecillion cookies** | Alchemy labs cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0605.png" alt="Flavor alchemy" width="24" height="24"> | **Flavor alchemy** | - Requires 1000 alchemy labs | **37.5 novemdecillion cookies** | Alchemy labs are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0606.png" alt="Batch homunculi permits" width="24" height="24"> | **Batch homunculi permits** | - Requires 1050 alchemy labs | **50 sexdecillion cookies** | Alchemy labs cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0607.png" alt="Culinary transmutation" width="24" height="24"> | **Culinary transmutation** | - Requires 1100 alchemy labs | **37.5 vigintillion cookies** | Alchemy labs are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0608.png" alt="Guild reagent rates" width="24" height="24"> | **Guild reagent rates** | - Requires 1150 alchemy labs | **50 septendecillion cookies** | Alchemy labs cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0609.png" alt="Gastronomic enlightenment" width="24" height="24"> | **Gastronomic enlightenment** | - Requires 1200 alchemy labs | **37.5 unvigintillion cookies** | Alchemy labs are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0610.png" alt="“Mostly lead” gold grants" width="24" height="24"> | **“Mostly lead” gold grants** | - Requires 1250 alchemy labs | **50 octodecillion cookies** | Alchemy labs cost **5%** less |

##### Portal
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0700.png" alt="Pre-owned ring frames" width="24" height="24"> | **Pre-owned ring frames** | - Requires 750 portals | **50 quattuordecillion cookies** | Portals cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0701.png" alt="Dimensional gateways" width="24" height="24"> | **Dimensional gateways** | - Requires 800 portals | **500 septendecillion cookies** | Portals are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0702.png" alt="Anchor warehouse club" width="24" height="24"> | **Anchor warehouse club** | - Requires 850 portals | **50 quindecillion cookies** | Portals cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0703.png" alt="Reality bridges" width="24" height="24"> | **Reality bridges** | - Requires 900 portals | **500 octodecillion cookies** | Portals are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0704.png" alt="Passive rift baffles" width="24" height="24"> | **Passive rift baffles** | - Requires 950 portals | **50 sexdecillion cookies** | Portals cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0705.png" alt="Spatial conduits" width="24" height="24"> | **Spatial conduits** | - Requires 1000 portals | **500 novemdecillion cookies** | Portals are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0706.png" alt="Volunteer gatekeepers" width="24" height="24"> | **Volunteer gatekeepers** | - Requires 1050 portals | **50 septendecillion cookies** | Portals cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0707.png" alt="Interdimensional highways" width="24" height="24"> | **Interdimensional highways** | - Requires 1100 portals | **500 vigintillion cookies** | Portals are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0708.png" alt="Interrealm stipend scrolls" width="24" height="24"> | **Interrealm stipend scrolls** | - Requires 1150 portals | **50 octodecillion cookies** | Portals cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0709.png" alt="Cosmic gateways" width="24" height="24"> | **Cosmic gateways** | - Requires 1200 portals | **500 unvigintillion cookies** | Portals are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0710.png" alt="Multiversal enterprise zone" width="24" height="24"> | **Multiversal enterprise zone** | - Requires 1250 portals | **50 novemdecillion cookies** | Portals cost **5%** less |

##### Time Machine
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom0800.png" alt="Pre-loved hourglasses" width="24" height="24"> | **Pre-loved hourglasses** | - Requires 750 time machines | **50 quindecillion cookies** | Time machines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0801.png" alt="Temporal engineering" width="24" height="24"> | **Temporal engineering** | - Requires 800 time machines | **7 octodecillion cookies** | Time machines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0802.png" alt="Depreciated timeline scraps" width="24" height="24"> | **Depreciated timeline scraps** | - Requires 850 time machines | **50 sexdecillion cookies** | Time machines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0803.png" alt="Chronological optimization" width="24" height="24"> | **Chronological optimization** | - Requires 900 time machines | **7 novemdecillion cookies** | Time machines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0804.png" alt="Off-season flux valves" width="24" height="24"> | **Off-season flux valves** | - Requires 950 time machines | **50 septendecillion cookies** | Time machines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0805.png" alt="Historical preservation" width="24" height="24"> | **Historical preservation** | - Requires 1000 time machines | **7 vigintillion cookies** | Time machines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0806.png" alt="Weekend paradox passes" width="24" height="24"> | **Weekend paradox passes** | - Requires 1050 time machines | **50 octodecillion cookies** | Time machines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0807.png" alt="Temporal synchronization" width="24" height="24"> | **Temporal synchronization** | - Requires 1100 time machines | **7 unvigintillion cookies** | Time machines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0808.png" alt="Department of When grants" width="24" height="24"> | **Department of When grants** | - Requires 1150 time machines | **50 novemdecillion cookies** | Time machines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom0809.png" alt="Chronological mastery" width="24" height="24"> | **Chronological mastery** | - Requires 1200 time machines | **7 duovigintillion cookies** | Time machines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom0810.png" alt="Antique warranty loopholes" width="24" height="24"> | **Antique warranty loopholes** | - Requires 1250 time machines | **50 vigintillion cookies** | Time machines cost **5%** less |

##### Antimatter Condenser
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1100.png" alt="Certified negamatter cans" width="24" height="24"> | **Certified negamatter cans** | - Requires 750 antimatter condensers | **50 sexdecillion cookies** | Antimatter condensers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1101.png" alt="Particle synthesis" width="24" height="24"> | **Particle synthesis** | - Requires 800 antimatter condensers | **85 octodecillion cookies** | Antimatter condensers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1102.png" alt="Matter swap rebates" width="24" height="24"> | **Matter swap rebates** | - Requires 850 antimatter condensers | **50 septendecillion cookies** | Antimatter condensers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1103.png" alt="Matter transmutation" width="24" height="24"> | **Matter transmutation** | - Requires 900 antimatter condensers | **85 novemdecillion cookies** | Antimatter condensers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1104.png" alt="Low-idle annihilators" width="24" height="24"> | **Low-idle annihilators** | - Requires 950 antimatter condensers | **50 octodecillion cookies** | Antimatter condensers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1105.png" alt="Quantum baking" width="24" height="24"> | **Quantum baking** | - Requires 1000 antimatter condensers | **85 vigintillion cookies** | Antimatter condensers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1106.png" alt="Grad-lab particle labor" width="24" height="24"> | **Grad-lab particle labor** | - Requires 1050 antimatter condensers | **50 novemdecillion cookies** | Antimatter condensers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1107.png" alt="Particle optimization" width="24" height="24"> | **Particle optimization** | - Requires 1100 antimatter condensers | **85 unvigintillion cookies** | Antimatter condensers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1108.png" alt="Institute endowment match" width="24" height="24"> | **Institute endowment match** | - Requires 1150 antimatter condensers | **50 vigintillion cookies** | Antimatter condensers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1109.png" alt="Matter manipulation" width="24" height="24"> | **Matter manipulation** | - Requires 1200 antimatter condensers | **85 duovigintillion cookies** | Antimatter condensers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1110.png" alt="Void-zone incentives" width="24" height="24"> | **Void-zone incentives** | - Requires 1250 antimatter condensers | **50 unvigintillion cookies** | Antimatter condensers cost **5%** less |

##### Prism
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1200.png" alt="Lens co-op exchange" width="24" height="24"> | **Lens co-op exchange** | - Requires 750 prisms | **50 septendecillion cookies** | Prisms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1201.png" alt="Light crystallization" width="24" height="24"> | **Light crystallization** | - Requires 800 prisms | **1.05 novemdecillion cookies** | Prisms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1202.png" alt="Spectral seconds" width="24" height="24"> | **Spectral seconds** | - Requires 850 prisms | **50 octodecillion cookies** | Prisms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1203.png" alt="Spectral baking" width="24" height="24"> | **Spectral baking** | - Requires 900 prisms | **1.05 vigintillion cookies** | Prisms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1204.png" alt="Sleep-mode rainbows" width="24" height="24"> | **Sleep-mode rainbows** | - Requires 950 prisms | **50 novemdecillion cookies** | Prisms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1205.png" alt="Optical alchemy" width="24" height="24"> | **Optical alchemy** | - Requires 1000 prisms | **1.05 unvigintillion cookies** | Prisms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1206.png" alt="Apprentice refractioneers" width="24" height="24"> | **Apprentice refractioneers** | - Requires 1050 prisms | **50 vigintillion cookies** | Prisms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1207.png" alt="Luminous confectionery" width="24" height="24"> | **Luminous confectionery** | - Requires 1100 prisms | **1.05 duovigintillion cookies** | Prisms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1208.png" alt="Arts-of-Optics grants" width="24" height="24"> | **Arts-of-Optics grants** | - Requires 1150 prisms | **50 unvigintillion cookies** | Prisms cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1209.png" alt="Radiant gastronomy" width="24" height="24"> | **Radiant gastronomy** | - Requires 1200 prisms | **1.05 trevigintillion cookies** | Prisms are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1210.png" alt="Rainbow renewal credits" width="24" height="24"> | **Rainbow renewal credits** | - Requires 1250 prisms | **50 duovigintillion cookies** | Prisms cost **5%** less |

##### Chancemaker
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1700.png" alt="Misprinted fortunes" width="24" height="24"> | **Misprinted fortunes** | - Requires 750 chancemakers | **50 octodecillion cookies** | Chancemakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1701.png" alt="Probability manipulation" width="24" height="24"> | **Probability manipulation** | - Requires 800 chancemakers | **13 novemdecillion cookies** | Chancemakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1702.png" alt="Reroll refund policy" width="24" height="24"> | **Reroll refund policy** | - Requires 850 chancemakers | **50 novemdecillion cookies** | Chancemakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1703.png" alt="Fortune optimization" width="24" height="24"> | **Fortune optimization** | - Requires 900 chancemakers | **13 vigintillion cookies** | Chancemakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1704.png" alt="Economy-grade omens" width="24" height="24"> | **Economy-grade omens** | - Requires 950 chancemakers | **50 vigintillion cookies** | Chancemakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1705.png" alt="Serendipity engineering" width="24" height="24"> | **Serendipity engineering** | - Requires 1000 chancemakers | **13 unvigintillion cookies** | Chancemakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1706.png" alt="Volunteer augury nights" width="24" height="24"> | **Volunteer augury nights** | - Requires 1050 chancemakers | **50 unvigintillion cookies** | Chancemakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1707.png" alt="Random enhancement" width="24" height="24"> | **Random enhancement** | - Requires 1100 chancemakers | **13 duovigintillion cookies** | Chancemakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1708.png" alt="Lottery board matching" width="24" height="24"> | **Lottery board matching** | - Requires 1150 chancemakers | **50 duovigintillion cookies** | Chancemakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1709.png" alt="Luck amplification" width="24" height="24"> | **Luck amplification** | - Requires 1200 chancemakers | **13 trevigintillion cookies** | Chancemakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1710.png" alt="Lucky district waivers" width="24" height="24"> | **Lucky district waivers** | - Requires 1250 chancemakers | **50 trevigintillion cookies** | Chancemakers cost **5%** less |

##### Fractal Engine
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1800.png" alt="Iteration liquidation" width="24" height="24"> | **Iteration liquidation** | - Requires 750 fractal engines | **50 novemdecillion cookies** | Fractal engines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1801.png" alt="Infinite recursion" width="24" height="24"> | **Infinite recursion** | - Requires 800 fractal engines | **155 novemdecillion cookies** | Fractal engines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1802.png" alt="Self-similar spare parts" width="24" height="24"> | **Self-similar spare parts** | - Requires 850 fractal engines | **50 vigintillion cookies** | Fractal engines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1803.png" alt="Self-similar baking" width="24" height="24"> | **Self-similar baking** | - Requires 900 fractal engines | **155 vigintillion cookies** | Fractal engines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1804.png" alt="Recursion rebates" width="24" height="24"> | **Recursion rebates** | - Requires 950 fractal engines | **50 unvigintillion cookies** | Fractal engines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1805.png" alt="Fractal optimization" width="24" height="24"> | **Fractal optimization** | - Requires 1000 fractal engines | **155 unvigintillion cookies** | Fractal engines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1806.png" alt="Autogenerator residencies" width="24" height="24"> | **Autogenerator residencies** | - Requires 1050 fractal engines | **50 duovigintillion cookies** | Fractal engines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1807.png" alt="Recursive enhancement" width="24" height="24"> | **Recursive enhancement** | - Requires 1100 fractal engines | **155 duovigintillion cookies** | Fractal engines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1808.png" alt="Grant-funded proofs" width="24" height="24"> | **Grant-funded proofs** | - Requires 1150 fractal engines | **50 trevigintillion cookies** | Fractal engines cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1809.png" alt="Fractal gastronomy" width="24" height="24"> | **Fractal gastronomy** | - Requires 1200 fractal engines | **155 trevigintillion cookies** | Fractal engines are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1810.png" alt="Infinite-lot variances" width="24" height="24"> | **Infinite-lot variances** | - Requires 1250 fractal engines | **50 quattuorvigintillion cookies** | Fractal engines cost **5%** less |

##### Javascript Console
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom1900.png" alt="Refurb dev boards" width="24" height="24"> | **Refurb dev boards** | - Requires 750 javascript consoles | **50 vigintillion cookies** | Javascript consoles cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1901.png" alt="Code optimization" width="24" height="24"> | **Code optimization** | - Requires 800 javascript consoles | **35.5 vigintillion cookies** | Javascript consoles are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1902.png" alt="Compiler credit program" width="24" height="24"> | **Compiler credit program** | - Requires 850 javascript consoles | **50 unvigintillion cookies** | Javascript consoles cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1903.png" alt="Programmatic baking" width="24" height="24"> | **Programmatic baking** | - Requires 900 javascript consoles | **35.5 unvigintillion cookies** | Javascript consoles are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1904.png" alt="Idle-friendly runtimes" width="24" height="24"> | **Idle-friendly runtimes** | - Requires 950 javascript consoles | **50 duovigintillion cookies** | Javascript consoles cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1905.png" alt="Algorithmic enhancement" width="24" height="24"> | **Algorithmic enhancement** | - Requires 1000 javascript consoles | **35.5 duovigintillion cookies** | Javascript consoles are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1906.png" alt="Peer-review co-ops" width="24" height="24"> | **Peer-review co-ops** | - Requires 1050 javascript consoles | **50 trevigintillion cookies** | Javascript consoles cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1907.png" alt="Computational gastronomy" width="24" height="24"> | **Computational gastronomy** | - Requires 1100 javascript consoles | **35.5 trevigintillion cookies** | Javascript consoles are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1908.png" alt="Open-source grants" width="24" height="24"> | **Open-source grants** | - Requires 1150 javascript consoles | **50 quattuorvigintillion cookies** | Javascript consoles cost **5%** less |
| <img src="assets/generated-icons/SheetCustom1909.png" alt="Digital confectionery" width="24" height="24"> | **Digital confectionery** | - Requires 1200 javascript consoles | **35.5 quattuorvigintillion cookies** | Javascript consoles are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom1910.png" alt="Cloud credit vouchers" width="24" height="24"> | **Cloud credit vouchers** | - Requires 1250 javascript consoles | **50 quinvigintillion cookies** | Javascript consoles cost **5%** less |

##### Idleverse
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2000.png" alt="Interdimensional tax breaks" width="24" height="24"> | **Interdimensional tax breaks** | - Requires 750 idleverses | **6 unvigintillion cookies** | Idleverses cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2001.png" alt="Reality real estate" width="24" height="24"> | **Reality real estate** | - Requires 800 idleverses | **6 unvigintillion cookies** | Idleverses are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2002.png" alt="Reality consolidation discounts" width="24" height="24"> | **Reality consolidation discounts** | - Requires 850 idleverses | **6 duovigintillion cookies** | Idleverses cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2003.png" alt="Dimensional franchising" width="24" height="24"> | **Dimensional franchising** | - Requires 900 idleverses | **6 duovigintillion cookies** | Idleverses are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2004.png" alt="Cosmic bulk purchasing" width="24" height="24"> | **Cosmic bulk purchasing** | - Requires 950 idleverses | **6 trevigintillion cookies** | Idleverses cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2005.png" alt="Cosmic supply chains" width="24" height="24"> | **Cosmic supply chains** | - Requires 1000 idleverses | **6 trevigintillion cookies** | Idleverses are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2006.png" alt="Multiverse supplier networks" width="24" height="24"> | **Multiverse supplier networks** | - Requires 1050 idleverses | **6 quattuorvigintillion cookies** | Idleverses cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2007.png" alt="Reality marketplaces" width="24" height="24"> | **Reality marketplaces** | - Requires 1100 idleverses | **6 quattuorvigintillion cookies** | Idleverses are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2008.png" alt="Dimensional economies of scale" width="24" height="24"> | **Dimensional economies of scale** | - Requires 1150 idleverses | **6 quinvigintillion cookies** | Idleverses cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2009.png" alt="Multiverse headquarters" width="24" height="24"> | **Multiverse headquarters** | - Requires 1200 idleverses | **6 quinvigintillion cookies** | Idleverses are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2010.png" alt="Reality monopoly pricing" width="24" height="24"> | **Reality monopoly pricing** | - Requires 1250 idleverses | **6 sexvigintillion cookies** | Idleverses cost **5%** less |

##### Cortex Baker
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2100.png" alt="Neural bulk purchasing" width="24" height="24"> | **Neural bulk purchasing** | - Requires 750 cortex bakers | **950 unvigintillion cookies** | Cortex bakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2101.png" alt="Neural plasticity" width="24" height="24"> | **Neural plasticity** | - Requires 800 cortex bakers | **950 unvigintillion cookies** | Cortex bakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2102.png" alt="Synaptic wholesale networks" width="24" height="24"> | **Synaptic wholesale networks** | - Requires 850 cortex bakers | **950 duovigintillion cookies** | Cortex bakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2103.png" alt="Synaptic pruning" width="24" height="24"> | **Synaptic pruning** | - Requires 900 cortex bakers | **950 duovigintillion cookies** | Cortex bakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2104.png" alt="Cerebral mass production" width="24" height="24"> | **Cerebral mass production** | - Requires 950 cortex bakers | **950 trevigintillion cookies** | Cortex bakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2105.png" alt="Cognitive load balancing" width="24" height="24"> | **Cognitive load balancing** | - Requires 1000 cortex bakers | **950 trevigintillion cookies** | Cortex bakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2106.png" alt="Mind monopoly pricing" width="24" height="24"> | **Mind monopoly pricing** | - Requires 1050 cortex bakers | **950 quattuorvigintillion cookies** | Cortex bakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2107.png" alt="Metacognitive awareness" width="24" height="24"> | **Metacognitive awareness** | - Requires 1100 cortex bakers | **950 quattuorvigintillion cookies** | Cortex bakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2108.png" alt="Neural economies of scale" width="24" height="24"> | **Neural economies of scale** | - Requires 1150 cortex bakers | **950 quinvigintillion cookies** | Cortex bakers cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2109.png" alt="Neural synchronization" width="24" height="24"> | **Neural synchronization** | - Requires 1200 cortex bakers | **950 quinvigintillion cookies** | Cortex bakers are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2110.png" alt="Synaptic supply dominance" width="24" height="24"> | **Synaptic supply dominance** | - Requires 1250 cortex bakers | **950 sexvigintillion cookies** | Cortex bakers cost **5%** less |

##### You
| Icon | Upgrade | Requirement | Cost | Description |
| --- | --- | --- | --- | --- |
| <img src="assets/generated-icons/SheetCustom2200.png" alt="Clone factory economies" width="24" height="24"> | **Clone factory economies** | - Requires 750 You | **27 duovigintillion cookies** | You cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2201.png" alt="Mitotic mastery" width="24" height="24"> | **Mitotic mastery** | - Requires 800 You | **27 duovigintillion cookies** | You are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2202.png" alt="Replica production lines" width="24" height="24"> | **Replica production lines** | - Requires 850 You | **27 trevigintillion cookies** | You cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2203.png" alt="Epigenetic programming" width="24" height="24"> | **Epigenetic programming** | - Requires 900 You | **27 trevigintillion cookies** | You are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2204.png" alt="Mirror manufacturing mastery" width="24" height="24"> | **Mirror manufacturing mastery** | - Requires 950 You | **27 quattuorvigintillion cookies** | You cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2205.png" alt="Cellular differentiation" width="24" height="24"> | **Cellular differentiation** | - Requires 1000 You | **27 quattuorvigintillion cookies** | You are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2206.png" alt="Twin tycoon pricing" width="24" height="24"> | **Twin tycoon pricing** | - Requires 1050 You | **27 quinvigintillion cookies** | You cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2207.png" alt="Telomere regeneration" width="24" height="24"> | **Telomere regeneration** | - Requires 1100 You | **27 quinvigintillion cookies** | You are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2208.png" alt="Doppelganger discount networks" width="24" height="24"> | **Doppelganger discount networks** | - Requires 1150 You | **27 sexvigintillion cookies** | You cost **5%** less |
| <img src="assets/generated-icons/SheetCustom2209.png" alt="Quantum entanglement" width="24" height="24"> | **Quantum entanglement** | - Requires 1200 You | **27 sexvigintillion cookies** | You are **8%** more efficient |
| <img src="assets/generated-icons/SheetCustom2210.png" alt="Clone supply dominance" width="24" height="24"> | **Clone supply dominance** | - Requires 1250 You | **27 septenvigintillion cookies** | You cost **5%** less |

## Mysteries of the Cookie Age

*Slip a note under the door. Burn a secret message. Unearth hidden treasures and buried truths. Decode secret ciphers. Count the lamps when the watchman passes. You may even do the unforgivable to stay alive. The Orders are ancient and powerful. Their eyes are everywhere, their actions are sinister. Uncover what they hide—before they decide who you are, and what you’re really doing.*

This story add-on layers an occult mystery over your Cookie Clicker run: riddles to solve, ciphers to break, puzzles to test your wits, and secret rites to perform—**all inside the world you’re already playing**.

### What to expect *(spoiler-free)*
- **Diegetic puzzles.** Clues arrive in-world and puzzles are solved in game, no seperated gameplay or isolated minigames, just careful observation and precise actions.
- **Escalating difficulty.** As the story unfolds, puzzles grow sharper and more demanding. Some will click; others will test your patience.
- **Intrigue and mystery.** Early nudges become hard asks. Your cover tightens; your choices start to matter. 
- **Unfolding lore.** The signs, taboos, and symbols of an ancient and mystical Order emerge piece by piece, if you’re paying attention.
- **Deep gameplay.** With dozens of puzzles, ciphers, riddles, and tasks to carry out, days, weeks, even months of mystery adventure awaits you. There *is* an end to the mystery, but not everyone will make it. 

### How to begin
1. Open **Options** → toggle **“Mysteries of the Cookie”** to **ON**.  
2. Play as normal, but keep a **watchful eye**—things may seem ordinary at first, but everything is different now. Track progress in **Stats**.  
3. Read carefully, observe everything. Act precisely and diligently. Everything has meaning, no word, clue, or mark is incidental. Trust no one, not even me. 

### Hints
Hints can be purchased with sugar lumps; each hint you reveal increases the cost of the next by +1 lump. You may reveal one hint every 24 hours (global cooldown). A hint for a puzzle won’t be available until that puzzle has been unlocked for at least 2 hours, so you get a fair shot first. Hints are nudges, not walkthroughs: we can’t know exactly where you’re stuck, but we’ve targeted the most common snags. Later puzzles are harder than early ones, so buy hints sparingly.

### A note on game design
Cookie Clicker has natural downtime while you wait for cycles, combos, and the occasional shiny wrinkler. *Mysteries of the Cookie Age* is designed to be **lightweight and in-world**, giving you a parallel mystery to unravel between bursts of action. Some steps may ask for temporary, even disruptive changes, but nothing breaks your save or playstyle, you can return to normal once a puzzle is complete. There are **no time limits**, and you can tackle clues at your pace.

Don’t be discouraged if a puzzle doesn’t fall immediately. Like the rest of **Just Natural Expansion**, this isn’t meant to be finished in a day. It’s weeks of discovery. Resist the urge to seek help right away; try to solve it yourself (or with a friend). If you do get stuck, help exists—but your victories will mean more if you earn them.

### How much progress do you need
*Mysteries of the Cookie Age* is designed as a late-game expansion. When you activate it, the game will warn you if you haven’t progressed far enough to complete all the puzzles, and it will outline the milestones you still need to reach. You might be able to tackle some puzzles early, but without the right tools, the experience can quickly become frustrating.

### Achievements
There are six new Achievements for working your way through *Mysteries of the Cookie Age*, they respect the toggle settings for Shadow Achievements so they only effect milk levels if you have them turned on. They will also disappear from your stats if you disable *Mysteries of the Cookie Age*. 

## Changelog

### Version 0.1.1
* There is a longstanding vanilla game issue/bug/feature with sugar lumps being harvested during lag, which caused Choose Your Own Lump Mod (CYOL) to be inaccurate and unreliable. The Spiced Cookies mod fixed this, but it’s no longer being updated or maintained. That was the only reason I used the Spiced Cookies mod. Now, JNE quietly fixes this issue, and CYOL will show a discrepancy of 0 for planning purposes. It’s one of those small quality-of-life tweaks that probably only I care about, but now everyone is forced to live with anyways.
* Fixed a bug that made some Just Natural Expansion cookie upgrades stronger than they should have been. 
* Fixed a bug that could cause unbought upgrades to quickly flash for one frame as available for purchase even if they aren't, also the season cooldown bar doesn't blink every few seconds anymore as a byproduct of this fix. 

### **Major Version 0.1.0 - Mysteries of the Cookie Age**
* [Mysteries of the Cookie Age](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#Mysteries-of-the-Cookie-Age) Expansion Patch. May you enjoy your puzzling.
* Fixed a bug that would prevent users from using Just Natural Expansion upgrades in Permanent Upgrade Slots. 
* Made several fixes and improvements to the first run/install system to be a much more smooth experience.

### Version 0.0.11
* Ask and you shall receive, the "mid" achievement names have been replaced with more interesting ones. No save data will be lost as the old achievements automatically map to the updated ones. 
* [The Final Countdown](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#new-achievements) was widely criticized for being too hard. It has been made easier, HOWEVER the original unlock conditions still exists so it may be unlocked starting with 20 Cursors and counting down to 1 You, or with 15 Cursors counting down to 1 Chancemakers. I thank our beta testers especially those who have completed the harder challenge for their feedback. 

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
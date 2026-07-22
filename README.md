# Just Natural Expansion

[Visit the offical Wiki for all the information on new Minigames, Achievements, Upgrades, Heavenly Upgrades, and Puzzle packs.](https://github.com/dfsw/Just-Natural-Expansion/wiki)

**The Just Natural Expansion Mod** enhances the Cookie Clicker endgame without disrupting core gameplay, staying true to the spirit of the vanilla experience. It introduces new achievements, upgrades, goals, stories, puzzles, and minigames, all specifically designed for late/mid-game progression, so early players may not immediately notice many changes. 

By default, the mod adds no upgrades and marks new achievements as shadow, allowing leaderboard and competition focused players to pursue extra challenges without affecting their current gameplay. 

Players aiming for higher scores and a more rewarding late-game can enable mod features one by one, while also converting shadow achievements into regular ones to gain extra milk for their efforts. These upgrades can be disabled at any time, and shadow achievements can be re-enabled via the options menu. However, a permanent shadow achievement will be awarded to mark that you have used the mod outside of leaderboard/competition mode.

#### Special Thanks

Big thanks to the amazing folks in the [Cookie Clicker Discord](https://discord.com/invite/cookie), whose late-game wisdom and strategic tips helped shape this mod into what it is today. 

Thank you to the "beta" testers who were willing to help me balance and test, I have now struck a balance between people saying things are too hard and things are too easy, which I suspect is the sweet middle ground. 

Special thanks to CursedSliver, The_1_Shadow, Fractyl, and Narhard GD for donating art to the mod, anyone who wants to improve and donate art is more than welcome as it is not my skillset, all art is temporary until someone donates something improved. 

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
- **Cookie Monster Compatible**: In order to get Cookie Monster cost calculations to reflect correctly please load it first. 
- **Spell Planners**: Just Natural Expansion should work with all spell planners, if you find any exceptions please report them.
- **Load Order**: For best compatibility, load other mods first

## Changelog    

### Version 0.6.2

* Lots of new/updated art as the ground work is being laid for the next major version. 
* Fixed several upgrade/achievement descriptions that had typos or other issues in them. 
* If for any reason the custom sprite sheet fails to load from github the mod will try a fallback address now. 
* Added a cooldown to the popup for Mega Clicks so autoclicker users arent spammed by it. Defaults to 50ms but customizable via Game.JNE.megaClickCooldown = 50; in browser
* Minor bug fixes, performance improvements, and other fixes. 


### Version 0.6.1
* New artwork for tiers and cookies baked all time and some other ones. 
* Building and Kitten upgrades now have proper named tiers. 
* Fix for Morroween not storing his start time the first time he is used in a game. 
* Fix for Balm of Merlin not retaining its mana hook when a new save is loaded into the game without reloading the browser. 
* Fixed several potions that would lose their effect when reloading a save without reloading the game. 
* Fixed a bug that would result in reagents being lost on save/load if they were in the brew slots but not yet used to make a potion. Reagents in the brew slots are now preserved in the save. 
* Fix for some vanilla minigame reagent drops when savescumming.
* JNE Kittens no longer make assumptions about the gender of the player <3.
* In this weeks edition of CursedSliver forces me to nerfs things. Blood of the Craftsman is now capped at an acension max of 50 buildings of each type gained. This should likely never effect most people but does prevent someone from exploiting it. You would need to consume >100 of these to be capped per ascension (owning all 20 buildings). 
* Also thanks to the aforementioned exploit professional Extract of Cadence can now only ever add 1 minute total to any individual buff. This means casting it multiple times may be capped for buffs that were already extended by the full minute. It will still effect all buffs but no single buff may be continously extended. 
* Minor bug fixes and improvements.


**Major Version 0.6.0 - Potions, Balance, and Bugs!**
* Potions Lab now has its own Prestige system, accessible after unlocking all potions, if you can find the slightly hidden access. There’s a lot more to discover, and even more alchemy fun awaits.
* Refactored a bunch of stuff to hopefully make compatibility with other mods more stable, so we see fewer crashes, lockups, and performance issues. It is still recommended to load Just Natural Expansion last in your mod list if you are running multiple mods. While this makes things more stable, it touches a lot of different code points. I believe I have tested thoroughly, but please report anything that is not working right.
* Fixed a bug with Balm of Merlin not applying correctly.
* Updated the tooltip for Sparkling Sugar Cane and made it a little less cheeseable.
* Fixed some potential exploit mechanics around the Bingo Center Slot Machines that CursedSliver ruined for everyone.
* Hopefully, the bug where Guilded Allure shows up twice on reload has been fixed, though it has always been kind of a pain to reproduce exactly how to get it to break for testing.
* Downline Rebranding has had its requirements reduced. There’s really no reason Rebranding has requirements other than to hide the action until the player has started a run.
* Minor Downline balance tweaks.
* Multiple fixes and improvements to running in Born Again mode.
* The building upgrades that provide cost discounts are now more powerful. The vanilla game is very stingy with handing out building discounts, so I have always been very careful about providing discounts that are too powerful here.
* The building upgrades that provide efficiency boosts are now more powerful as well. These should have been more powerful from the start.
* Removed some mod achievements that weren’t really useful or fun, such as ascending X times or cursor ownership. Also added a couple of new ones.
* Revised Make X from Clicking achievements to be more in line with expected game progression. This means you may be awarded some achievements as soon as the new version loads.
* Seasonal Reindeer achievements have been combined into a single achievement for finding a reindeer in all non-Christmas seasons. If you have already earned any of these achievements, your progress is remembered.
* Minor bug fixes, improvements, and balance tweaks.
* Remember to back up your save frequently!

### Version 0.5.8
* Fix for data loss issue with heavenly upgrades. If you lost purchase status for heavenly upgrades ping DFSW on discord and I can restore them for you. Sorry about that!

### Version 0.5.7
* Fixed a bug with God of All Gods that would only track the time a god was slotted when they became unslotted. 
* Eagled eyed Downline players may find its now slightly easier to see how much boredom an action is creating. 
* Updated the wording on a couple of early Mysteries of the Cookie Age puzzles to hopefully fix up some common snags people were having. 
* Fixed a bug when buying buildings in order to sell them in certain puzzles that would result in a win not being registered under specific conditions. 
* Holobore was not told what the Golden Cookie Predictor was and as such he reacted poorly to it, we have put him through a weekend seminar on it and he now behaves much better. 
* Solvent of Substitution is smarter about awarding reagents. 
* Minor bug fixes and improvements. 


### Version 0.5.6
* Fixed a potential crash if a saved game was loaded while lunar new year season had expired without the mod installed.
* Cleaned up and redid some icons that had been bothering me for a while.
* Slightly increased the drop rate for Dragon Harvest and Flight in Lunar New Year.
* Fixed the ordering of some achievments that got messed up in some migration a while back. 
* Minor bug fixes and improvements. 

### Version 0.5.5
* Fixed some bugs with lantern count displays in stats. 
* The data file is never cached anymore, because that was stupid and painted me into a corner. 
* Refactoring how building upgrades work to make the mod more compatible with Cookie Monster Mod.  

### Version 0.5.4
* Lunar New Year! Come celebrate with Just Natural Expansion with this brand new holiday season just released. Find your lucky year and collect lanterns and blessings, may your path be prosperous this year. 
* Support for new season through terminal, cookie age, potions class, etc. 
* Fixed a bug that would cause Cookie Monster to enter an infinite loop when using potions that touched the Effs array. 
* Option O loading should no longer break some Grimoire related heavenly upgrades
* Minor tweaks to Potions Class Reagent drop conditions/rates for balance. 
* Pivot! in Downline may now only be used once an hour. 
* Downline prestiage releases are now sped up in the golden ratio, which honestly makes more sense than what we were doing before. 
* Additional bug fixes, stability improvements, and general code cleanup and 
simplification.

### Version 0.5.3
* Updated the logic of how aerated soil works to make it more inline with the intention of the upgrade. 
* Fixed a whole bunch of issues that could be caused by rapid save scumming before the mod had fully had a chance to load. 
* Fixed a bug that would prevent plant all from working after loading a new save. 
* Spell Slinger achievement now properly awards again.


### Version 0.5.2
* Fixed a bug in Potions Class that could allow you to get a 6th reagent if you had unused items in the brew area.
* Fixed a bug in Potions Class that could forget a discovered potion if a save was reloaded while it was in a "use to discover" state.
* Tweaked multiple reagent drop rates, mostly to be more generous.
* Tweaked some potion brew times; this wasn't as generous.
* Drop conditions for the Pure Cane Sugar reagent have been updated.
* The total number of potions consumed now appears in the Potions Class UI.
* The "unknown potions you can make with current reagents" label now properly understands discovered but unused potions.
* Essence of Cheer potion is now neater and more interesting.
* Extract of Cadence is now a bit less overpowered, but still crazy strong.
* Fixed a bug with Reduction of Silica that caused terminal cooldown to be cancelled instead of reduced.
* Slimy Pheromones heavenly upgrade has been slightly nerfed.
* Downline prestige speed-up has been toned down a little.
* Downline now shows bar direction hint indicators to give an idea of rise/fall.
* Downline now provides 1 action slot per level up to level 10, with a minimum of 3 slots.
* Fixed a bug that could forget the purchased status of plant heavenly upgrades.
* Fixed an ascension-related exploit for Morroween.
* Fixed a bug that could prevent some reindeer-related achievements from being awarded.
* Mod upgrades now count toward vanilla "total number of upgrades owned" achievements.
* Additional bug fixes and stability improvements.

### **Major Version 0.5.0 - Potions Class, an Alchemy Labs Minigame**
* Introducing the third new Just Natural Expansion minigame! Enter the [Alchemy Labs Potions Class](https://github.com/dfsw/Just-Natural-Expansion/wiki/Alchemy-Labs-Minigame-Potion-Class) and learn to gather rare reagents, brew powerful potions, and discover dozens of strange new recipes. Search throughout the world for more than 20 exotic ingredients, experiment with unusual mixtures, and uncover an entirely new branch of cookie science. Potions Class unlocks at level 1 Alchemy Labs when minigames are enabled in the Options menu.
* Terminal minigame support for Potions Class. 
* For a certain Mysteries of the Cookie Age puzzle "heart" now accepts two different meanings, thank you for the feedback!

### Version 0.4.5
* Fixed a bug in Downline that would pretty much always give a user 10 action slots regardless of building level.  
* Downline now supports Reality Bending for a 1/10th Supreme Intellect bonus to its gameplay. 
* Downline has a nice new shiny background image, it really ties the whole game together I think. 
* Improvements to the Sugar Predictor heavenly upgrade with much appeciation for staticvariablejames research and feedback. It is now more accurate and supports Rigidel in more creative ways such as with supreme intellect. 
* There was a bug that could cause disabling minigames to lose minigame specific achievement won states, this has been fixed. 
* Cleaned up some code and improved stability in several places.
* Fixed some heavenly upgrade wonkiness mostly around UI stuff but everything should be a bit better there now. 
* Fixed a bug that could have resulted in lost mod saved data if the game crashed during loading, still please back up regularly. 
* Staging of functionality to implement future minigames.

### Version 0.4.4
* Due to some merging issues I undid a couple of previous fixes, this update restores those fixes. 

### Version 0.4.3
* Tooltips should behave a little better in Downline Minigame and Mysteries of the Cookie Age statuses now. 
* Fixed a bug in the heavenly ugrades which may have caused the consumable fortunes to be restored more often then they were suppose to. 
* Fixed a bug that could have caused unexpected behavior when trying to edit a perm upgrade slot with Edible Pens. 
* Fixed various heavenly upgrade garden plant issues, garden minigame sure is a royal pain to work with. 
* A couple of updated icons thanks to Fractyl for the donation of improved art. 
* Various other small bug fixes and improvements to stuff that probably only I noticed. 

### Version 0.4.2
* Fixed various and surprisingly widespread issues that crept in with the last major update that interfered with proper spell casting and prediction. Everything should be compatible with other mods and FTHOF Planners again. My bad.

### Version 0.4.1
* Downline should now have better background support for continuing to run when the minigame is closed or the tab isnt frontmost. If the garden continues to tick Downline should as well. 
* Fixed a bug that caused some odd behaviors with pantheon god unslotting and worship swap consumption.  
* Updated some Cookie Age puzzle wording to clear up common sources of confusion.

### **Major Version 0.4.0 - Downline a Fractal Engine Minigame**
* Introducing a whole new minigame for Cookie Clicker! The [Fractal Engine Minigame: Downline](https://github.com/dfsw/Just-Natural-Expansion/wiki/Fractal-Engine-Minigame-Downline) get to experience what its like to run your own version of Cookie Clicker, recruit players, release features, engage in shady marketing, and hype up your game to make it the best idle game ever. Unlocked at Level 1 Fractal Engines when Minigames are toggled on/off in the Options Menu. 

### Version 0.3.7
* Fixed a bug that could miscount total wrinklers and stock totals on ascension. 
* Fixed modded kittens from not being able to be used in permanent upgrade slots.
* The Holiday Hoover and Merry Mayhem achievements have been given more time to account for the vanilla game changes to drop rates for those achievements. 
* Fixed a bug where vanilla pantheon gods would get stuck in slots after being unslotted following a custom god restoration.
* getTimeMod now hooks in a more friendly way to other mods as per request from CursedSliver.
* Various Mysteries of the Cookie Age puzzle fixes, tweaks, and improvements.
* Mod save data is now much more compact and efficent 
* You now have the option to set a different sound effect for Fortune Cookies appearing than you use for Golden Cookies when you own the Fortune Tolls for You heavenly upgrade. 
* The Sugar Predictor heavenly upgrade now works much better after ascensions without needing to reload. It also works better before Bingo Center is purchased. 
* Simplified logic and code in several areas, improved stability

### Version 0.3.6
* Fixed a bug that could cause Heavenly Upgrade custom plant seeds unlock not to save properly. 
* Fixed a regression that would cause Doordashing every day, Second day takeout, and Chinese leftovers to not reliably work as intended. 
* Fixed a UI bug with Sugar Predictor when having more than 600 Grandmas owned on a lump that requires 600+. 
* Fixed a bug that could cause sugar predictor to be inaccurate if a lump was harvested while computer was asleep. 
* Tweaking Slot Machine Jackpot win rates and making the notification for them a bit more sticky.
* Seasonal reindeer achievements are now more stable and reliable. 
* Fixed a bug that prevented the item in the expanded (Heavenly upgrade/aura) 11th and 12th slots of the terminal minigame from saving and restoring on load.
* Updated Fortune Tolls For You heavenly upgrade to take advantage of the new ticker hook added with the last vanilla version update. 
* Improved pantheon custom god save restortation logic to fix some funky behavior that was bothering mostly me. 
* Various other small bugs and fixes.

### Version 0.3.5
* Heavenly upgrade Mega Clicks can no longer consume RNG generation values.
* Fixed a regression that could allow a user to harvest multiple sugar lumps at once. This was a byproduct of the fix for sugar lump harvesting that rerolled the random seed.
* Fixed a crash that could be caused by the setup of Wholesale Discount Club and CCSE.
* Added more robust awarding logic for the Ascension Forfeited achievements to deal with third-party mod conflicts.
* Fixed a bug that could prevent Box of Donuts upgrades from saving their purchase state.
* Fixed a bug that would allow unintentional low mana cycling of Gambler’s Fever Dream to enable infinite spell cycling.

### Version 0.3.4
* Hotfix

### Version 0.3.3
* Fixed a sugar harvesting bug that would allow a user to reroll the random seed unintentionally.
* Fixed a bug that would cause Doordashing every day, Second day takeout, and Chinese leftovers to regenerate fortunes too often.
* Fixed a bug that could cause a conflict with CCSE based mods and not restore saved god info. 
* Additional Cookie Clicker 2.057 Beta fixes and support. 

### Version 0.3.2
* Improvements to make JNE heavenly upgrades and CYOL (3rd party mod) more compatiable. 
* Treading water achievement now exempts using Solgreth, Spirit of Selfishness as a win condition.
* Adjusted values for Hellish hunger and Ravenous leeches upgrades. 
* Fixed a bug that caused Cookie Fish not to be clickable in Cookie Clicker 2.057 Beta. 

### Version 0.3.1
* The heavenly upgrade patch is now fully compatible with FTHOF Planner v1-6, Clairvoyance, and Fortune Cookie mods. As a design choice Gilded Allure spells will not shuffle into GFD anymore. 
* Fixed a bug that would crash old saves with permanent upgrade slots items that were created before our previous fix. 

### **Major Version 0.3.0 - Heavenly Upgrades**
* Introducing 97 new heavenly upgrades for your clicking pleasure. Unlocked after purchasing the Unshackled You vanilla heavenly upgrade. You can find the new upgrade tree to the left of the existing vanilla tree. Existing players will need to turn on Heavenly Upgrades in options.
* Fixed an exploit in the terminal minigame that allowed the user to spam execute radpidly to get the program to execute multiple times in a row. 
* Compatibility updates for Cookie Clicker 2.057 Beta. 


### Version 0.2.1
* Updated several production achievement descriptions to correct the use of wrong notation numbers. The logic was always correct, but the descriptions were incorrect. Thanks to Reddit user mei_ch.
* Cleaned up some outdated code that was hanging around.
* Several quality-of-life fixes to the terminal minigame to improve layout and behavior.
* Terminal minigame: fixed a bug that could cause Shimmering Veil to break if placed after click generators on laggy computers. 
* Fixed Garden Sacrifice achievements to track the existing sacrifice counter.
* Fixed an exploit that could award Spellslinger via save-scumming.
* Fixed a bug with In the Shadows not being awarded due to character encoding mismatches.
* Holding down the Shift key while viewing a completed Mysteries of the Cookie Age puzzle will now display the original clue you solved. Thanks to CursedSliver for the idea.
* Various puzzle tweaks in Mysteries of the Cookie Age to reduce tolerance and make things more fair to solve; no puzzle logic has been updated.
* Fixed the vanilla bug that could corrupt a save file if two spirits are swapped before a save. Many thanks to Fillexs and CursedSliver for the code and guidance on the fix.
* Fixed a bug that would apply mod upgrades in permanent upgrade slots in Born Again mode when they shouldn’t have been.
* Many additional small fixes and UI improvements.


### **Major Version 0.2.0 - Terminal a Javascript Console Minigame**
* Introducing a whole new minigame for Cookie Clicker! The [Javascript Console Minigame: Terminal](https://github.com/dfsw/Just-Natural-Expansion/wiki/Javascript-Console-Minigame-Terminal) allows the player to write programs for Cookie Clicker to automate actions and create perfect combos or crash the system and ruin their setups. Unlocked at Level 1 Javascript Consoles are toggled on/off in the Options Menu. 

### Version 0.1.2
* Updated pricing on building upgrades.
* Fixed some kitten icons to be less melty and sad.

### Version 0.1.1
* There is a longstanding vanilla game issue/bug/feature with sugar lumps being harvested during lag, which caused Choose Your Own Lump Mod (CYOL) to be inaccurate and unreliable. The Spiced Cookies mod fixed this, but it’s no longer being updated or maintained. That was the only reason I used the Spiced Cookies mod. Now, JNE quietly fixes this issue, and CYOL will show a discrepancy of 0 for planning purposes. It’s one of those small quality-of-life tweaks that probably only I care about, but now everyone is forced to live with anyways.
* Fixed a bug that made some Just Natural Expansion cookie upgrades stronger than they should have been. 
* Fixed a bug that could cause unbought upgrades to quickly flash for one frame as available for purchase even if they aren't, also the season cooldown bar doesn't blink every few seconds anymore as a byproduct of this fix. 

### **Major Version 0.1.0 - Mysteries of the Cookie Age**
* [Mysteries of the Cookie Age](https://github.com/dfsw/Just-Natural-Expansion/wiki/Mysteries-of-the-Cookie-Age) Expansion Patch. May you enjoy your puzzling.
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
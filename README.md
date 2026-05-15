# Just Natural Expansion

[Visit the offical Wiki for all the information on new Minigames, Achievements, Upgrades, Heavenly Upgrades, and Puzzle packs.](https://github.com/dfsw/Just-Natural-Expansion/wiki)

**The Just Natural Expansion Mod** enhances the Cookie Clicker endgame without disrupting core gameplay, staying true to the spirit of the vanilla experience. It introduces new achievements, upgrades, goals, stories, puzzles, and minigames, all specifically designed for late/mid-game progression, so early players may not immediately notice many changes. 

By default, the mod adds no upgrades and marks new achievements as shadow, allowing leaderboard and competition focused players to pursue extra challenges without affecting their current gameplay. 

Players aiming for higher scores and a more rewarding late-game can enable mod features one by one, while also converting shadow achievements into regular ones to gain extra milk for their efforts. These upgrades can be disabled at any time, and shadow achievements can be re-enabled via the options menu. However, a permanent shadow achievement will be awarded to mark that you have used the mod outside of leaderboard/competition mode.

#### Special Thanks

Big thanks to the amazing folks in the [Cookie Clicker Discord](https://discord.com/invite/cookie), whose late-game wisdom and strategic tips helped shape this mod into what it is today. 

Thank you to the "beta" testers who were willing to help me balance and test, I have now struck a balance between people saying things are too hard and things are too easy, which I suspect is the sweet middle ground. 

Special thanks to CursedSliver, The_1_Shadow, and Fractyl for donating art to the mod, anyone who wants to improve and donate art is more than welcome as it is not my skillset, all art is temporary until someone donates something improved. 

#### Why This Mod Exists

When I reached the late game of Cookie Clicker, I felt a real sense of loss. I was running out of meaningful goals. I looked for mods that could extend the experience without radically changing the core gameplay.

Most of what I found didn’t fit. Many end-game mods added flashy new buildings or mechanics that didn’t feel true to vanilla and often weren’t balanced. Others offered extremely difficult, sometimes nearly impossible, achievements. Those were closer to what I wanted, but I wasn’t looking for “impossible.” I wanted more of what made the base game fun.

So I set out to imagine what Cookie Clicker would feel like if it simply lasted longer with deeper goals to chase. Achievements are challenging but not unreasonable, designed for active players who like having long-term targets. Nothing breaks the existing formula (though I had to heavily nerf the new kittens to keep them balanced). The intent was always to extend the game, not reinvent it. Do not expect to knock out these features in a few days. Many require weeks of planning and patience. The idea is to add lasting goals, not hand out free milk and CpS.

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

## Changelog

### Version 0.4.5
* Fixed a bug in Downline that would pretty much always give a user 10 action slots regardless of building level.  
* Downline now supports Reality Bending for a 1/10th Supreme Intellect bonus to its gameplay. 
* Improvements to the Sugar Predictor heavenly upgrade with much appeciation for staticvariablejames research and feedback. It is now more accurate and supports Rigidel in more creative ways such as with supreme intellect. 
* There was a bug that could cause disabling minigames to lose minigame specific achievement won states, this has been fixed. 
* Cleaned up some code and improved stability in several places.
* Fixed some heavenly upgrade wonkiness mostly around UI stuff but everything should be a bit better there now. 
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
* Introducing a whole new minigame for Cookie Clicker! The [Fractal Engine Minigame: Downline](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#fractal-engine-minigame-downline) get to experience what its like to run your own version of Cookie Clicker, recruit players, release features, engage in shady marketing, and hype up your game to make it the best idle game ever. Unlocked at Level 1 Fractal Engines when Minigames are toggled on/off in the Options Menu. 

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
* Introducing a whole new minigame for Cookie Clicker! The [Javascript Console Minigame: Terminal](https://github.com/dfsw/Just-Natural-Expansion?tab=readme-ov-file#javascript-console-minigame-terminal) allows the player to write programs for Cookie Clicker to automate actions and create perfect combos or crash the system and ruin their setups. Unlocked at Level 1 Javascript Consoles are toggled on/off in the Options Menu. 

### Version 0.1.2
* Updated pricing on building upgrades.
* Fixed some kitten icons to be less melty and sad.

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
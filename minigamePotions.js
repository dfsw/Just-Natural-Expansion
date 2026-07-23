// Potions Class Minigame

(function() {
'use strict';

const POTIONS_VERSION = '1.1.3';

// =====================================================================
// Potions 
//
// Look I get you want to look up how to make potions and it can be frusterating, but 
// potion discovery is a big part of the game and once they are unlocked they do stay
// unlocked forever, but I get it, let me throw you a bone. There is a potion that can 
// help you discover a potion before you dive into the spoilers below. Try mixing together
// Divine Extraction, Cat Whiskers, and Captured Auroras. If you then still want to deprive
// yourself of a "fun" game mechanic I can't stop you
// =====================================================================
var POTIONS = [
    {
        id: 'oil_of_hephaestus',
        name: "Oil of Hephaestus",
        icon: [6, 26, 'custom'],
        desc: "Sip sip sip, clickity clickity clickity.",
        effect: "Clicking is 15% more powerful for 3 minutes.",
        brewTime: 60*15,
        duration: 180,
        misbrew: "Clicking is 50% less powerful for 10 minutes.",
        reagents: { nectar_of_effort: 1, dragon_scales: 1, golden_flour: 1 },
        unlocked: false
    },
    {
        id: 'arcana_of_the_finger',
        name: "Arcana of the Finger",
        icon: [9, 36, 'main'],
        desc: "The finger must flow.",
        effect: "Cursors are 20% more effective for the next 15 minutes.",
        brewTime: 60*45,
        duration: 900,
        misbrew: "Cursors are 50% less effective for the next 30 minutes.",
        reagents: { nectar_of_effort: 1, dragon_scales: 1, cats_whiskers: 1 },
    },
    {
        id: 'tincture_of_purpose',
        name: "Tincture of Purpose",
        icon: [12, 26, 'custom'],
        desc: "Now I am become Speed, the destroyer of worlds.",
        effect: "+30% CpS for 2 minutes.",
        brewTime: 60*60*2,
        duration: 120,
        misbrew: "-70% CpS for 10 minutes.",
        reagents: { nectar_of_effort: 1, extract_of_entrepreneurship: 1, dragon_scales: 1 },
    },
    {
        id: 'infusion_of_chance',
        name: "Infusion of Chance",
        icon: [9, 31, 'main'],
        desc: "After drinking this, my yard was overgrown with four-leaf clovers made entirely out of lucky pennies.",        
        effect: "Random drops (including reagents) are 30% more common for 30 minutes.",
        brewTime: 60*45,
        duration: 1800,
        misbrew: "Random drops are 50% less common for an hour.",
        reagents: { rabbit_feet: 1, cats_whiskers: 1, nectar_of_effort: 1 },
    },
    {
        id: 'ointment_of_plenty',
        name: "Ointment of Plenty",
        icon: [23, 25, 'custom'], 
        desc: "Rub directly into the hands for best results, also known to help with arthritis.",
        effect: "Reagents drop 100% more often for the next 10 minutes.",
        brewTime: 60*60*1,
        duration: 600,
        misbrew: "Reagent drops are 50% less common for the next 30 minutes.",
        reagents: { nectar_of_effort: 1, terra: 1, reindeer_fur: 1 },
    },
    {
        id: 'ether_of_serendipity',
        name: "Ether of Serendipity",
        icon: [22, 26, 'custom'],
        desc: "50/50 until the coin lands on its edge then the world ends.",
        effect: "+50% CpS for 1 minute.",
        brewTime: 60*50,
        duration: 60,
        misbrewChance: 0.5,
        misbrew: "-50% CpS for 1 minute.",
        reagents: { rabbit_feet: 1, golden_flour: 1, magical_blight: 1 },
    },
    {
        id: 'tonic_of_ebisu',
        name: "Tonic of Ebisu",
        icon: [8, 7, 'main'],
        desc: "Never tell me the odds. Actually, do. No wait that was a terrible idea, how do I take it back?",
        effect: "Golden cookies appear 10% more often for 15 minutes.",
        brewTime: 60*60,
        duration: 900,
        misbrew: "Golden cookies appear 30% less often for an hour.",
        reagents: { golden_flour: 1, divine_extraction: 1, captured_auroras: 1 },
    },
    {
        id: 'distillate_of_kala',
        name: "Distillate of Kala",
        icon: [6, 7, 'main'],
        desc: "Time stretches pleasantly in its presence, but it smells like wet dog.",
        effect: "Golden cookie effects last 15% longer for 15 minutes.",
        brewTime: 60*60*1.5,
        duration: 900,
        misbrew: "Golden cookie effects last 30% less for 30 minutes.",
        reagents: { golden_flour: 1, reindeer_fur: 1, culture_of_time: 1 },
    },
    {
        id: 'cordial_of_tyche',
        name: "Cordial of Tyche",
        icon: [10, 26, 'custom'],
        desc: "What are the odds? No, really, I want to know the actual odds, like the numbers and math and stuff.",
        effect: "Rare golden cookie chances are increased for 15 minutes.",
        brewTime: 60*60*2,
        duration: 900,
        misbrew: "Rare golden cookie chances are decreased for 30 minutes.",
        reagents: { rabbit_feet: 1, golden_flour: 1, captured_auroras: 1 },
    },
    {
        id: 'vapor_of_luck',
        name: "Vapor of Luck",
        icon: [15, 25, 'custom'],
        desc: "Can you drink a vapor? I\'m not sure either but we\'re going to find out together, bottoms up!",
        effect: "Additional golden cookies may randomly appear for the next 10 minutes.",
        brewTime: 60*60*4,
        duration: 600,
        misbrew: "Rare golden cookie chances are decreased for an hour.",
        reagents: { rabbit_feet: 1, captured_auroras: 1, pure_cane_sugar: 1 },
    },
    {
        id: 'ichor_of_destiny',
        name: "Ichor of Destiny",
        icon: [9, 32, 'main'],
        desc: "Concentrated fortune flows through it like a river of inevitability.",
        effect: "Causes an uncollected fortune to appear immediately.",
        brewTime: 60*45,
        misbrew: "A fortune you already own is lost and must be collected again.",
        reagents: { divine_extraction: 1, golden_flour: 1, nectar_of_effort: 1 },
    },
    {
        id: 'transmutation_of_dough',
        name: "Transmutation of Dough",
        icon: [9, 34, 'main'],
        desc: "Equivalent exchange rates may apply.",
        effect: "Summon a random golden cookie.",
        brewTime: 60*60*4,
        misbrewChance: 0.3,
        misbrew: "A random positive buff is ended immediately.",
        reagents: { golden_flour: 1, captured_auroras: 1, pure_cane_sugar: 1 },
    },
    {
        id: 'ember_of_dragon_fire',
        name: "Ember of Dragon Fire",
        icon: [23, 26, 'custom'],
        desc: "A cinder that never cools. Krumblor has been giving you the side eye ever since you bottled it.",
        effect: "Golden cookie gains are increased by 10% for an hour.",
        brewTime: 60*60,
        duration: 60 * 60,
        misbrew: "Golden cookie gains are reduced by 30% for an hour.",
        reagents: { dragon_scales: 1, golden_flour: 1, wrath_sugar: 1 },
    },
    {
        id: 'ambrosia_of_the_leech',
        name: "Ambrosia of the Leech",
        icon: [9, 29, 'main'],
        desc: "Before consuming ask your doctor if parasites are right for you.",
        effect: "Wrinkler consumption increased by 20% for 15 minutes.",
        brewTime: 60*30,
        duration: 900,
        misbrew: "2 wrinklers explode instantly while not giving any cookies in return.",
        reagents: { sample_of_goo: 1, magical_infusion: 1, terra: 1 },
    },
    {
        id: 'nectar_of_summoning',
        name: "Nectar of Summoning",
        icon: [14, 26, 'custom'],
        desc: "If you brew it, they will come.",
        effect: "Wrinklers spawn 100% faster for 10 minutes.",
        brewTime: 60*25,
        duration: 600,
        misbrew: "Wrinklers suck 50% less for 30 minutes.",
        reagents: { sample_of_goo: 1, magical_infusion: 1, immortal_essence: 1},
    },
    {
        id: 'philter_of_worms',
        name: "Philter of Worms",
        icon: [20, 26, 'custom'],
        desc: "A love potion for wrinklers? Gross who thought of this anyway?",
        effect: "Summon 6 wrinklers instantly.",
        brewTime: 60*60*1,
        misbrew: "Wrinklers spawn 50% less often for the next 15 minutes.",
        reagents: { sample_of_goo: 1, magical_infusion: 1, flower_petals: 1 },
    },
    {
        id: 'emulsion_of_sinful_greed',
        name: "Emulsion of Sinful Greed",
        icon: [13, 26, 'custom'],
        desc: "That\'s specious reasoning, Dad.<br>Thank you, dear.<br>By your logic I could claim that this rock keeps tigers away.<br>How does it work?<br>It doesn\'t work. It\'s just a stupid rock. But I don\'t see any tigers around, do you?<br>Lisa, I would like to to buy your rock.",        
        effect: "Your chances of summoning a shiny wrinkler are tripled for the next 30 minutes.",
        brewTime: 60*60*4,
        duration: 1800,
        misbrew: "The amount your wrinklers have already sucked is reduced by 20%.",
        reagents: { sample_of_goo: 1, wrath_sugar: 1, distilled_greed: 1 },
    },
    {
        id: 'venom_of_the_basilisk',
        name: "Venom of the Basilisk",
        icon: [18, 25, 'custom'],
        desc: "Fans of Harry Potter, Dungeons and Dragons, and Magic the Gathering can\'t agree on what the hell a basilisk even is.",
        effect: "Wrinklers explode with 10% more cookies for 30 seconds.",
        brewTime: 60*30,
        duration: 30,
        misbrew: "All wrinklers explode with 10% less cookies instantly.",
        reagents: { sample_of_goo: 1, dragon_scales: 1, roots: 1 },
    },
    {
        id: 'poison_of_the_matriarchs',
        name: "Poison of the Matriarchs",
        icon: [22, 25, 'custom'],
        desc: "Grandma's dark secret, bottled, labeled, priced, and fit for general consumption, now available at your local megastore.",
        effect: "Summon a random wrath cookie.",
        brewTime: 60*90,
        misbrew: "Golden cookies appear 30% less for the next 10 minutes.",
        reagents: { wrath_sugar: 1, sample_of_goo: 1, cats_whiskers: 1 },
    },
    {
        id: 'toxin_of_elders',
        name: "Toxin of Elders",
        icon: [18, 26, 'custom'],
        desc: "Distilled from the resentment of a thousand grandmas. Handle with extreme care, this is one gift from grandma you don\'t want to drop.",
        effect: "Wrath cookies appear 20% more often for 10 minutes.",
        brewTime: 60*45,
        duration: 600,
        misbrew: "Wrath cookies appear 50% less for an hour.",
        reagents: { wrath_sugar: 1, sample_of_goo: 1, magical_blight: 1 },
    },
    {
        id: 'corruption_of_sin',
        name: "Corruption of Sin",
        icon: [8, 26, 'custom'],
        desc: "If you are going to sin once you might as well get in a few thousands, what\'s the difference anyways at that point?",
        effect: "Negative wrath cookie effects reduced for 30 minutes.",
        brewTime: 60*60*1.5,
        duration: 1800,
        misbrew: "Negative wrath cookie effects increased for an hour.",
        reagents: { wrath_sugar: 1, magical_blight: 1, immortal_essence: 1 },
    },
    {
        id: 'potion_of_gaia',
        name: "Potion of Gaia",
        icon: [4, 7, 'main'],
        desc: "Tastes like truffles, but like too many truffles.",
        effect: "Plant mutation rate is increased for 15 minutes.",
        brewTime: 60*60*1,
        duration: 900,
        misbrew: "20% of your plants die.",
        reagents: { terra: 1, fungus_culture: 1, flower_petals: 1 },
    },
    {
        id: 'precipitate_of_chronos',
        name: "Precipitate of Chronos",
        icon: [15, 26, 'custom'],
        desc: "Raw, unadulterated time compressed into a flask. Use promptly, or don\'t this concept of time is kinda losing all meaning with this one anyway.",
        effect: "The Garden ticks 10 times.",
        brewTime: 60*60*2,
        duration: 1800,
        misbrew: "Plant effects are reduced by 50% for 30 minutes.",
        reagents: { terra: 1, fungus_culture: 1, culture_of_time: 1 },
    },
    {
        id: 'tears_of_landis',
        name: "Tears of Landis",
        icon: [4, 26, 'custom'],
        desc: "A rare mixture that has the power to bend the nature of sugar itself.",
        effect: "Reroll your currently growing sugar lump type.",
        brewTime: 60*60*6,
        misbrew: "Your current sugar lump is botched and lost.",
        reagents: { immortal_essence: 1, roots: 1, pure_cane_sugar: 1 },
    },
    {
        id: 'resin_of_the_cane',
        name: "Resin of the Cane",
        icon: [20, 25, 'custom'],
        desc: "Time and sugar come together in this sticky resin which should taste sweet but for some reason tastes like burnt coffee, the flower petals didn\'t help.",
        effect: "Your current sugar lump grows 1 hour faster.",
        brewTime: 60*60*8,
        misbrew: "Your current sugar lump grows 4 hours slower.",
        reagents: { pure_cane_sugar: 1, culture_of_time: 1, flower_petals: 1 },
    },
    {
        id: 'vitae_of_the_mother',
        name: "Vitae of the Mother",
        icon: [1, 8, 'main'],
        desc: "Warm and nurturing, it hums with a motherly energy.",
        effect: "Milk is 3% more powerful for 15 minutes.",
        brewTime: 60*60 * 3,
        duration: 900,
        misbrew: "Milk is 15% weaker for an hour.",
        reagents: { pure_cane_sugar: 1, flower_petals: 1, cats_whiskers: 1 },
    },
    {
        id: 'mercury_of_age',
        name: "Mercury of Age",
        icon: [9, 17, 'main'],
        desc: "Grandma\'s secret sauce, apply generously to neck folds.",
        effect: "Grandmas are 25% more effective for 15 minutes.",
        brewTime: 60*60*1,
        duration: 900,
        misbrew: "Grandmas are 50% as effective for an hour.",
        reagents: { cats_whiskers: 1, immortal_essence: 1, sample_of_goo: 1 },
    },
    {
        id: 'balm_of_merlin',
        name: "Balm of Merlin",
        icon: [21, 25, 'custom'],
        desc: "Smells of old books, some alchemists have been known to apply it to their necks before dates with librarians, it has proved <b>highly</b> effective in that regard.",
        effect: "Mana recharges faster for 10 minutes.",
        brewTime: 60*60*1,
        duration: 600,
        misbrew: "Mana recharges slower for 20 minutes.",
        reagents: { magical_infusion: 1, dragon_scales: 1, pure_cane_sugar: 1 },
    },
    {
        id: 'liqueur_of_rincewind',
        name: "Liqueur of Rincewind",
        icon: [9, 7, 'main'],
        desc: "A wizard would run from this, which is how you know it works.",
        effect: "Cast a random Grimoire spell for free.",
        brewTime: 60*60*3,
        misbrew: "Lose 50% of your current magic.",
        reagents: { magical_infusion: 1, magical_blight: 1, rabbit_feet: 1 },
    },
    {
        id: 'extract_of_cadence',
        name: "Extract of Cadence",
        icon: [9, 26, 'custom'],
        desc: "Time stretches and pulls upon consumption, also provides a mildly trippy feel in which walls are known to melt. Overall worth it though.",
        effect: "Triples the remaining duration of all active buffs. Each buff can gain no more than <b>1 additional minute</b> in total from this effect, regardless of how many separate potions are used.",
        brewTime: 60*90,
        misbrew: "All existing buff durations are halved.",
        reagents: { culture_of_time: 1, magical_infusion: 1, golden_flour: 1 },
    },
    {
        id: 'salve_of_fortune',
        name: "Salve of Fortune",
        icon: [19, 25, 'custom'],
        desc: "The alchemist's insurance policy, often taken as a nighttime treatment to assure good dreams.",
        effect: "Potions misbrew 80% less for the next hour.",
        brewTime: 60*60*1,
        duration: 3600,
        misbrewChance: 0,
        misbrew: null,
        reagents: { rabbit_feet: 1, divine_extraction: 1, magical_infusion: 1 },
    },
    {
        id: 'syrup_of_insight',
        name: "Syrup of Insight",
        icon: [17, 26, 'custom'],
        desc: "That wasn\'t nearly as helpful as you were expecting it to be.",
        effect: "Highlight two potion ingredients that go together in an unknown potion.",
        brewTime: 60*45,
        misbrew: "Unknown potions take twice as long to discover for the next hour.",
        reagents: { cats_whiskers: 1, captured_auroras: 1, divine_extraction: 1 },
    },  
    {
        id: 'spirit_of_protection',
        name: "Spirit of Protection",
        icon: [3, 26, 'custom'],
        desc: "A shimmering guardian in liquid form, tastes like electricity though, you know what I mean, like stinging pennies.",
        effect: "The shimmering veil's reinforced membrane has a 90% chance to not shatter for the next 30 seconds.",
        brewTime: 60*20,
        duration: 30,
        misbrew: "The shimmering veil shatters instantly.",
        reagents: { captured_auroras: 1, divine_extraction: 1, dragon_scales: 1 },
    },
    {
        id: 'shadow_of_remorse',
        name: "Shadow of Remorse",
        icon: [16, 25, 'custom'],
        desc: "A favorite potion of those who plan ahead.",
        effect: "Remove a random negative buff. (A negative buff is defined as any buff that adds the red aura around the Big Cookie)",
        brewTime: 60*90,
        misbrew: "Gain a random negative potion effect.",
        reagents: { magical_blight: 1, divine_extraction: 1, immortal_essence: 1 },
    },
    {
        id: 'elixir_of_chaos',
        name: "Elixir of Chaos",
        icon: [10, 7, 'main'],
        desc: "Every sip is a surprise.",
        effect: "A completely random potion effect with half the normal misbrew chance. This may trigger a potion you have not yet discovered.",
        brewTime: 60*30,
        misbrewChance: 0.1,
        misbrew: "A random negative potion effect.",
        reagents: { magical_blight: 1, captured_auroras: 1, fungus_culture: 1 },
    },
    {
        id: 'serum_of_progress',
        name: "Serum of Progress",
        icon: [9, 27, 'main'],
        desc: "For when the wheels of progress need greasing, apply liberally and directly to the forehead.",
        effect: "Upgrades are 5% cheaper for 3 minutes.",
        brewTime: 60*30,
        duration: 180,
        misbrew: "Upgrades are 20% more expensive for an hour.",
        reagents: { distilled_greed: 1, extract_of_entrepreneurship: 1, technojuice: 1 },
    },
    {
        id: 'concoction_of_the_mason',
        name: "Concoction of the Mason",
        icon: [9, 26, 'main'],
        desc: "Smells of concrete and ambition.",
        effect: "Buildings are 5% cheaper for 3 minutes.",
        brewTime: 60*15,
        duration: 180,
        misbrew: "Buildings are 20% more expensive for an hour.",
        reagents: { distilled_greed: 1, terra: 1, roots: 1 },
    },
    {
        id: 'bloom_of_industry',
        name: "Bloom of Industry",
        icon: [7, 26, 'custom'],
        desc: "Every gear turns just a little faster.",
        effect: "Buildings are 10% more effective for 10 minutes.",
        brewTime: 60*60*1,
        duration: 600,
        misbrew: "Buildings are 30% less effective for 30 minutes.",
        reagents: { terra: 1, distilled_greed: 1, flower_petals: 1 },
    },
    {
        id: 'blood_of_the_craftsman',
        name: "Blood of the Craftsman",
        icon: [17, 25, 'custom'],
        desc: "Don\'t think too hard about the name, color, or taste. Just hold your nose and chug it quick.",
        effect: "Gain 10 random free buildings (that you already own at least one of, per ascension you can gain a maximum of 50 of each building type using this potion).",
        brewTime: 60*60*4.5,
        misbrewChance: 0.25,
        misbrew: "Lose 50 random buildings.",
        reagents: { distilled_greed: 1, terra: 1, extract_of_entrepreneurship: 1 },
    },
    {
        id: 'concentrate_of_saturn',
        name: "Concentrate of Saturn",
        icon: [0, 26, 'custom'],
        desc: "A potion infused with the power of Saturn himself, more Roman with just as much lightning.", 
        effect: "Gain 1 hour of CpS, capped at 8% of your bank.",
        brewTime: 60*60*2.5,
        misbrew: "Lose 2 hours of CpS.",
        reagents: { distilled_greed: 1, wrath_sugar: 1, culture_of_time: 1 },
    },
    {
        id: 'essence_of_cheer',
        name: "Essence of Cheer",
        icon: [16, 26, 'custom'],
        desc: "Festive warmth bottled up, taste just like eggnog with nutmeg.",
        effect: "Changing seasons is 80% cheaper for the next minute, and 5 seasons previously switched this ascension are forgotten.",
        brewTime: 60*60*1,
        duration: 60,
        misbrew: "Changing seasons is 300% more expensive for the next 30 minutes.",
        reagents: { culture_of_time: 1, reindeer_fur: 1, rabbit_feet: 1 },
    },
    {
        id: 'decoction_of_winter',
        name: "Decoction of Winter",
        icon: [21, 26, 'custom'],
        desc: "Winter is coming. What a waste that whole thing ended up being. Is this a good platform to rant about an old TV show on? I don\'t really care if it is or not, I am still bitter and pissed off about the whole thing.",
        effect: "Reindeer and lanterns are 25% more common for the next hour.",
        brewTime: 60*15,
        duration: 3600,
        misbrew: "Reindeer and lanterns do not spawn for the next hour.",
        reagents: { reindeer_fur: 1, culture_of_time: 1, captured_auroras: 1 },
    },
    {
        id: 'catalyst_of_yule',
        name: "Catalyst of Yule",
        icon: [2, 26, 'custom'],
        desc: "This potion is the essence of the phrase, \'I am so over the holidays, just give me my presents so I can go play in my room alone.\'",
        effect: "Unlock a random seasonal drop.",
        brewTime: 60*60,
        misbrew: "Lose a random seasonal drop.",
        reagents: { reindeer_fur: 1, rabbit_feet: 1, cats_whiskers: 1 },
    },
    {
        id: 'whisper_of_boreas',
        name: "Whisper of Boreas",
        icon: [19, 26, 'custom'],
        desc: "The North remembers. Okay, thats my seconds Game of Thrones reference in this minigame, I\'m done I promise.",
        effect: "Reindeer and lantern gains are increased by 20% for 30 minutes.",
        brewTime: 60*45,
        duration: 1800,
        misbrew: "Reindeer and lantern gains are reduced by 50% for an hour.",
        reagents: { reindeer_fur: 1, flower_petals: 1, roots: 1 },
    },
    {
        id: 'breath_of_growth',
        name: "Breath of Growth",
        icon: [1, 26, 'custom'],
        desc: "The air of opportunity, captured and bottled.",
        effect: "Newly started Downline actions last twice as long for 60 seconds.",
        brewTime: 60*25,
        misbrew: "A random downline action is stopped immediately.",
        reagents: { extract_of_entrepreneurship: 1, technojuice: 1, nectar_of_effort: 1 },
    },
    {
        id: 'reduction_of_silica',
        name: "Reduction of Silica",
        icon: [9, 35, 'main'],
        desc: "Computational lubricant of the highest grade. It\'s safe to drink, we promise.",
        effect: "Remove 2 hours of cooldown from terminal.",
        brewTime: 60*45,
        misbrew: "Adds 4 hours of cooldown to terminal.",
        reagents: { technojuice: 1, magical_infusion: 1, distilled_greed: 1 },
    },
    {
        id: 'draught_of_urgency',
        name: "Draught of Urgency",
        icon: [5, 26, 'custom'],
        desc: "It\'s the fastest who gets paid and it\'s the fastest who gets laid.",
        effect: "Potions brew 25% faster for the next 2 hours.",
        brewTime: 60*30,
        duration: 7200,
        misbrew: "Potions brew 50% slower for the next 2 hours.",
        reagents: { technojuice: 1, culture_of_time: 1, nectar_of_effort: 1 },
    },
    {
        id: 'solvent_of_substitution',
        name: "Solvent of Substitution",
        icon: [7, 7, 'main'], 
        desc: "Turns things you had into things you might need, but probably don\'t.",
        effect: "Gain 5 random reagents you have unlocked.",
        brewTime: 60*60,
        misbrew: "Lose 3 random reagents.",
        reagents: { technojuice: 1, fungus_culture: 1, extract_of_entrepreneurship: 1 },
    },
    {
        id: 'unguent_of_hades',
        name: "Unguent of Hades",
        icon: [9, 25, 'main'],
        desc: "Too dangerous for most alchemists to even consider brewing...",
        effect: "Lose 10% of your bank.",
        brewTime: 60*60*8,
        misbrewChance: 0.1,
        misbrew: "Gain a sugar lump.",
        reagents: { wrath_sugar: 1, distilled_greed: 1, divine_extraction: 1 },
    },
    {
        id: 'suspension_of_hallucinogenic',
        name: "Suspension of Hallucinogenic",
        icon: [11, 26, 'custom'],
        desc: "Dude, what if buildings could dream?",
        effect: "Doubles the effectiveness of a random building for the next 15 minutes.",
        brewTime: 60*25,
        duration: 900,
        misbrew: "The effectiveness of a random building is reduced by half for the next hour.",
        reagents: { fungus_culture: 1, wrath_sugar: 1, roots: 1 },
    },
   {
        id: 'wassail_of_bedlam',
        name: "Wassail of Bedlam",
        icon: [0, 27, 'custom'],
        desc: "A toast to beautiful, absolute chaos. Cheers!",
        effect: "Immediately spawn 3 wrinklers (if able), 3 lanterns, and 3 reindeer regardless of season.",
        brewTime: 60*40,
        misbrew: "Randomly switches between 3 different seasons sequentially, each at full cost.",
        prestige: true,
        prestigeLocked: true
    },
    {
        id: 'liniment_of_warlocks',
        name: "Liniment of Warlocks",
        icon: [3, 27, 'custom'],
        desc: "Warlock (1989) - A warlock flees from the 17th to the 20th century, with a witch-hunter in hot pursuit. It was okay, all the sequels not so much. Honestly if you haven\'t seen it by now you probably never will.",
        effect: "If you have at least 50% mana remaining, restore your mana to full.",
        brewTime: 60*60*3,
        misbrew: "Lose all your mana.",
        prestige: true,
        prestigeLocked: true
    },

    {
        id: 'nepenthe_of_undoing',
        name: "Nepenthe of Undoing",
        icon: [4, 27, 'custom'],
        desc: "This is the long awaited combo piece you didn\'t know you needed, now you just need to figure out how to deploy it.",
        effect: "Remove up to 6 positive buff effects, gain +100% CpS for each removed for 10 minutes per buff removed. (Positive buff effects are defined as those that add the golden aura around the big cookie when active.)",
        brewTime: 60*60*1.5,
        misbrew: "Positive buff effects are removed with no CpS benefit.",
        prestige: true,
        prestigeLocked: true
    },
     {
        id: 'poultice_of_overgrowth',
        name: "Poultice of Overgrowth",
        icon: [9, 27, 'custom'],
        desc: "Like mana from the heavens, reagents rain down upon you.",
        effect: "Any reagent found is doubled for the next 30 minutes.",
        brewTime: 60*45,
        duration: 1800,
        misbrew: "The chance to find reagents is reduced by half for 60 minutes.",
        prestige: true,
        prestigeLocked: true
    },
    {
        id: 'hydrosol_of_refraction',
        name: "Hydrosol of Refraction",
        icon: [7, 27, 'custom'],
        desc: "What are the odds of getting 100 golden cookies in a row with this? Oh… thats bleak might as well buy lottery tickets.",
        effect: "Clicking a golden cookie has a 30% chance to summon another (storms and chains excluded) for the next 20 seconds.",
        brewTime: 60*60*4,
        duration: 20,
        misbrewChance: .30,
        misbrew: "Golden cookies appear 50% less often for the next 5 minutes.",
        prestige: true,
        prestigeLocked: true
    },
    {
        id: 'retort_of_logic',
        name: "Retort of Logic",
        icon: [5, 27, 'custom'],
        desc: "Chaos, chaos everywhere and not a drop to drink",
        effect: "Fill all empty potion slots with ready-to-use Elixirs of Chaos.",
        brewTime: 60*30,
        misbrew: "Empty all your potion slots.",
        prestige: true,
        prestigeLocked: true
    },
    {
        id: 'attar_of_the_gambler',
        name: "Attar of the Gambler",
        icon: [6, 27, 'custom'],
        desc: "But why… mostly to make save scummers work harder, it doesn\'t actually solve the problem but its more annoying at least.",
        effect: "Spawns a golden cookie with a chance of Dragon Harvest and Dragon Flight. Results of the golden cookie are predetermined when brewed.",
        brewTime: 60*60*2,
        misbrewChance: 0.30,
        misbrew: "Spawns a golden cookie. The results contain Clots instead of Dragon Harvest and Dragon Flight.",
        prestige: true,
        prestigeLocked: true
    },
    {
        id: 'alkahest_of_the_pantry',
        name: "Alkahest of the Pantry",
        icon: [8, 27, 'custom'],
        desc: "I want a clean cup, let\'s all move one place on.",
        effect: "Lose all your stored reagents and gain an equal number of random unlocked ones back.",
        brewTime: 60*60,
        misbrew: "Lose all your stored reagents and gain only half the amount of random ones back.",
        prestige: true,
        prestigeLocked: true
    },
        {
        id: 'oxymel_of_insanity',
        name: "Oxymel of Insanity",
        icon: [1, 27, 'custom'],
        desc: "Stability is overrated trait, when you are insane you always have someone to talk to.",
        effect: "Every second, CpS flips between +100% or -90% for 60 seconds.",
        brewTime: 60*60*1.5,
        duration: 60,
        misbrewChance: 0,
        misbrew: "Does not misbrew.",
        prestige: true,
        prestigeLocked: true
    },



    {
        id: 'dew_of_secrets',
        name: "Dew of Secrets",
        icon: [2, 27, 'custom'],
        desc: "You\'ll discover this last anyways.",
        effect: "Begins an 18-hour brew with a 50% chance of discovering a random unknown potion.",
        brewTime: 60*30,
        misbrew: "You forget this potion and its recipe is randomized.",
        prestige: true,
        prestigeLocked: true
    }
];
// =====================================================================
// Reagents
// =====================================================================
var REAGENTS = [
    {
        id: 'nectar_of_effort',
        name: "Nectar of Effort",
        icon: [11, 25, 'custom'],
        flavor: "Your hard work, rendered into a golden liquid. Somehow still unpaid, but you are having fun right?",
        gather: "Clicking the big cookie will sometimes reward you with the nectar of effort.",
        dropChance: 0.008,
        unlocked: true
    },
    {
        id: 'dragon_scales',
        name: "Dragon Scales",
        icon: [30, 14, 'main'],
        flavor: "Gathering dragon scales is risky business, but you are pretty sure Krumblor is your friend.",
        gather: "Vigorously petting your dragon has a chance to break off a scale.",
        dropChance: 0.02,
        unlocked: true
    },
    {
        id: 'golden_flour',
        name: "Golden Flour",
        icon: [2, 33, 'main'],
        flavor: "Shed from the shimmer of the elusive golden cookie. A fleeting but potent ingredient.",
        gather: "Golden cookies will occasionally leave behind some of their special flour when collected.",
        dropChance: 0.12,
        unlocked: true
    },
    {
        id: 'captured_auroras',
        name: "Captured Auroras",
        icon: [17, 16, 'custom'],
        flavor: "Captured Auroras!? At this time of year, at this time of day, in this part of the country, localized entirely within your vial!? May I see them?",
        gather: "Swap dragon auras for a chance to capture an aurora.",
        dropChance: 0.38,
    },
    {
        id: 'divine_extraction',
        name: "Divine Extraction",
        icon: [14, 12, 'custom'],
        flavor: "The holy residue of celestial paperwork.",
        gather: "Swap gods in the Pantheon for a chance to capture some divine extraction.",
        dropChance: 0.38,
    },
    {
        id: 'rabbit_feet',
        name: "Rabbit's Foot",
        icon: [13, 25, 'custom'],
        flavor: "Lucky for you, unlucky for at least one rabbit.",
        gather: "Collected by clicking on rabbit cookies during Easter.",
        dropChance: 0.15,
    },
    {
        id: 'cats_whiskers',
        name: "Cat's Whiskers",
        icon: [32, 3, 'main'],
        flavor: "Nine lives worth of mystical sensitivity, compressed into a tight bundle of strands.",
        gather: "Found on some spooky kitten cookies during the Halloween season.",
        dropChance: 0.15,
    },
    {
        id: 'culture_of_time',
        name: "Culture of Time",
        icon: [16, 6, 'main'],
        flavor: "Aged for several seconds over many years, or for several years in a few seconds. It's getting really hard to keep track.",
        gather: "Culture of time is found by advancing through seasons, naturally or artificially. It may also randomly appear as time passes.",
        dropChance: 0.25, //also randomly 1 in 60000 seconds or so. 
    },
    {
        id: 'pure_cane_sugar',
        name: "Pure Cane Sugar",
        icon: [29, 16, 'main'],
        flavor: "Crystalline sweetness harvested from the source. Pure and unrefined.",
        gather: "Gain or spend sugar lumps through any manner for a chance to find pure cane sugar.",
        dropChance: 0.65,
    },
    {
        id: 'reindeer_fur',
        name: "Tuft of Reindeer Fur",
        icon: [12, 25, 'custom'],
        flavor: "Obtenu à partir de rennes, comme lors du combat dit Lumeçon du Doudou.",
        gather: "Each reindeer you find will have a chance to leave you with a tuft of their magical fur.",
        dropChance: 0.18,
    },
    {
        id: 'distilled_greed',
        name: "Distilled Greed",
        icon: [16, 14, 'custom'],
        flavor: "It is rumored it can also be obtained by squeezing billionaires in a vice over a cup.",
        gather: "Hire brokers, buy, or sell stocks in the Stock Market for a chance to collect distilled greed.",
        dropChance: 0.0003,
    },
    {
        id: 'sample_of_goo',
        name: "Sample of Goo",
        icon: [15, 8, 'main'],
        flavor: "Formerly part of a wrinkler, currently part of alchemy, which is like science.",
        gather: "Each wrinkler popped has a chance to leave behind a sample of, well lets just say \'goo\'.",
        dropChance: 0.08,
    },
    {
        id: 'wrath_sugar',
        name: "Wrath Sugar",
        icon: [14, 25, 'custom'],
        flavor: "Sweet, bitter, and slightly judgmental about your frequency of phone calls.",
        gather: "Wrath cookies will occasionally leave behind the deep red sugar used in their baking.",
        dropChance: 0.17,
    },
    {
        id: 'magical_blight',
        name: "Magical Blight",
        icon: [18, 6, 'main'],
        flavor: "The scorched residue of a spell gone wrong. At least there was a silver lining.",
        gather: "Experience spell backfires in Grimoire for a chance to capture pure magical blight.",
        dropChance: 0.4,
    },
    {
        id: 'magical_infusion',
        name: "Magical Infusion",
        icon: [14, 16, 'custom'],
        flavor: "By Merlin's shiny beard!",
        gather: "Successfully cast spells in Grimoire for a chance to harvest magical infusion.",
        dropChance: 0.18,
    },
    {
        id: 'terra',
        name: "Terra",
        icon: [0, 34, 'garden'],
        flavor: "Skeptics will call it just dirt, but you need to find dirt with high aspirations.",
        gather: "Harvesting mature plants and changing soil will leave you with terra.",
        dropChance: 0.03,
    },
    {
        id: 'flower_petals',
        name: "Flower Petals",
        icon: [4, 13, 'garden'],
        flavor: "Pressed petals from the garden's most benevolent blooms.",
        gather: "Found by harvesting mature Shimmerlily, Nursetulip, Chimrose, Everdaisy, or any clover variant in the Garden.",
        dropChance: 0.07,
    },
    {
        id: 'roots',
        name: "Roots",
        icon: [0, 19, 'garden'],
        flavor: "Gnarled tubers that pulse with subterranean cookie energy.",
        gather: "Found by harvesting mature Chocoroots, Queenbeets, or Duketater in the Garden.",
        dropChance: 0.11,
    },
    {
        id: 'fungus_culture',
        name: "Fungus Culture",
        icon: [14, 24, 'custom'],
        flavor: "It has opinions now, rudimentary as they might be.",
        gather: "Found by harvesting any mature fungus in the Garden.",
        dropChance: 0.03,
    },
    {
        id: 'immortal_essence',
        name: "Immortal Essence",
        icon: [19, 7, 'main'],
        flavor: "Distilled from a plant that refused to die. Does harvesting it kill it? The question remains eternal.",
        gather: "Found by harvesting any mature immortal plant in the Garden.",
        dropChance: 0.25,
    },
    {
        id: 'extract_of_entrepreneurship',
        name: "Extract of Entrepreneurship",
        icon: [17, 6, 'main'],
        flavor: "Has also been called concentrate of hustle.",
        gather: "Performing any actions in the Downline has a chance to reward you with extract of entrepreneurship.",
        dropChance: 0.10,
    },
    {
        id: 'technojuice',
        name: "Technojuice",
        icon: [20, 24, 'custom'],
        flavor: "Compiled from caffeine and regrettable life choices.",
        gather: "Run programs in the Terminal for a chance to find pure technojuice.",
        dropChance: 0.30,
    }
];

// Apply default values
for (var i = 0; i < POTIONS.length; i++) {
    if (POTIONS[i].duration === undefined) POTIONS[i].duration = 0;
    if (POTIONS[i].unlocked === undefined) POTIONS[i].unlocked = false;
}
for (var i = 0; i < REAGENTS.length; i++) {
    if (REAGENTS[i].unlocked === undefined) REAGENTS[i].unlocked = false;
}

// Snapshot of original fixed recipes — used to restore on hard reset (new game)
var ORIGINAL_RECIPES = (function() {
    var snap = {};
    for (var i = 0; i < POTIONS.length; i++) {
        if (POTIONS[i].reagents) {
            snap[POTIONS[i].id] = {};
            for (var rk in POTIONS[i].reagents) snap[POTIONS[i].id][rk] = POTIONS[i].reagents[rk];
        }
    }
    return snap;
}());

// =====================================================================
// Tried-Recipes Bitset
// =====================================================================
var TriedRecipes = (function() {
    var NUM_INGREDIENTS = 22;
    var NUM_COMBOS = 1540;        
    var NUM_BYTES = 193;           
    var UNUSED_BITS = 4;         

    // Precompute C(n,2) and C(n,1) for the index formula.
    // recipe_index requires 0 <= a < b < c < 22.
    // index  = sum_{i=0}^{a-1} C(22-i-1, 2)
    //        + sum_{j=a+1}^{b-1} C(22-j-1, 1)
    //        + (c - b - 1)
    function _c2(n) { return n > 1 ? (n * (n - 1) / 2) : 0; }
    function _c1(n) { return n > 0 ? n : 0; }

    function recipe_index(a, b, c) {
        var ids = [a, b, c].sort(function(x, y) { return x - y; });
        a = ids[0]; b = ids[1]; c = ids[2];
        if (a < 0 || c >= NUM_INGREDIENTS) return -1;
        if (a === b || b === c) return -1;
        var idx = 0;
        for (var i = 0; i < a; i++) idx += _c2(NUM_INGREDIENTS - i - 1);
        for (var j = a + 1; j < b; j++) idx += _c1(NUM_INGREDIENTS - j - 1);
        idx += c - b - 1;
        return idx;
    }

    function create_empty() {
        var bs = new Array(NUM_BYTES);
        for (var i = 0; i < NUM_BYTES; i++) bs[i] = 0;
        return bs;
    }

    function mark_tried(bitset, a, b, c) {
        var idx = recipe_index(a, b, c);
        if (idx < 0 || idx >= NUM_COMBOS) return;
        var byte_i = Math.floor(idx / 8);
        var bit_i  = idx % 8;
        bitset[byte_i] = (bitset[byte_i] | (1 << bit_i)) & 0xFF;
    }

    function is_tried(bitset, a, b, c) {
        var idx = recipe_index(a, b, c);
        if (idx < 0 || idx >= NUM_COMBOS) return false;
        var byte_i = Math.floor(idx / 8);
        var bit_i  = idx % 8;
        return (bitset[byte_i] & (1 << bit_i)) !== 0;
    }

    function encode(bitset) {
        if (!bitset || bitset.length !== NUM_BYTES) return null;
        var out = bitset.slice();
        out[NUM_BYTES - 1] = out[NUM_BYTES - 1] & (0xFF >> UNUSED_BITS);
        var hex = '';
        for (var i = 0; i < NUM_BYTES; i++) {
            hex += ('0' + (out[i] & 0xFF).toString(16)).slice(-2);
        }
        return hex;
    }

    function decode(hex_string) {
        if (typeof hex_string !== 'string' || hex_string.length !== NUM_BYTES * 2) return null;
        if (!/^[0-9a-fA-F]+$/.test(hex_string)) return null;
        var bs = new Array(NUM_BYTES);
        for (var i = 0; i < NUM_BYTES; i++) {
            bs[i] = parseInt(hex_string.substr(i * 2, 2), 16);
        }
        return bs;
    }

    function count_tried(bitset) {
        var count = 0;
        for (var i = 0; i < NUM_COMBOS; i++) {
            if ((bitset[Math.floor(i / 8)] & (1 << (i % 8))) !== 0) count++;
        }
        return count;
    }

    return {
        create:      create_empty,
        index:       recipe_index,
        mark:        mark_tried,
        isTried:     is_tried,
        encode:      encode,
        decode:      decode,
        count:       count_tried,
        NUM_BYTES:   NUM_BYTES,
        NUM_COMBOS:  NUM_COMBOS
    };
}());

// =====================================================================
// Potion Effects
// =====================================================================
function getIconArray(p) {
    return [p.icon[0], p.icon[1], ICON_SHEETS[p.icon[2]] || ICON_SHEETS.main];
}

function updatePotionEffects() {
    if (PotionsM._updateEffs) PotionsM._updateEffs();
    Game.recalculateGains = 1;
}

(function() {
    function def(id, e, m) { for (var i = 0; i < POTIONS.length; i++) { if (POTIONS[i].id === id) { if (e) POTIONS[i].doEffect = e; if (m) POTIONS[i].doMisbrew = m; break; } } }

    def('oil_of_hephaestus',
        function(p) { Game.killBuff('Oil of Hephaestus (misbrewed)'); Game.gainBuff('Oil of Hephaestus', 180, 1.15); Game.Notify(p.name + ' consumed', 'Clicking is 15% more powerful for 3 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Oil of Hephaestus'); Game.gainBuff('Oil of Hephaestus (misbrewed)', 600, 0.5); Game.Notify(p.name + ' misbrewed', 'Clicking is 50% less powerful for 10 minutes.', getIconArray(p), 6); }
    );
    def('serum_of_progress',
        function(p) { Game.killBuff('Serum of Progress (misbrewed)'); Game.gainBuff('Serum of Progress', 180, 0.95); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Upgrades are 5% cheaper for 3 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Serum of Progress'); Game.gainBuff('Serum of Progress (misbrewed)', 3600, 1.2); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Upgrades are 20% more expensive for an hour.', getIconArray(p), 6); }
    );
    def('concoction_of_the_mason',
        function(p) { Game.killBuff('Concoction of the Mason (misbrewed)'); Game.gainBuff('Concoction of the Mason', 180, 0.95); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Buildings are 5% cheaper for 3 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Concoction of the Mason'); Game.gainBuff('Concoction of the Mason (misbrewed)', 3600, 1.2); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Buildings are 20% more expensive for an hour.', getIconArray(p), 6); }
    );
    def('tonic_of_ebisu',
        function(p) { Game.killBuff('Tonic of Ebisu (misbrewed)'); Game.gainBuff('Tonic of Ebisu', 900, 1.1); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Golden cookies appear 10% more often for 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Tonic of Ebisu'); Game.gainBuff('Tonic of Ebisu (misbrewed)', 3600, 0.7); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Golden cookies appear 30% less often for an hour.', getIconArray(p), 6); }
    );
    def('distillate_of_kala',
        function(p) { Game.killBuff('Distillate of Kala (misbrewed)'); Game.gainBuff('Distillate of Kala', 900, 1.15); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Golden cookie effects last 15% longer for 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Distillate of Kala'); Game.gainBuff('Distillate of Kala (misbrewed)', 1800, 0.7); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Golden cookie effects last 30% less for 30 minutes.', getIconArray(p), 6); }
    );
    def('arcana_of_the_finger',
        function(p) { Game.killBuff('Arcana of the Finger (misbrewed)'); Game.gainBuff('Arcana of the Finger', 900, 1.2); Game.Notify(p.name + ' consumed', 'Cursor CpS +20% for the next 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Arcana of the Finger'); Game.gainBuff('Arcana of the Finger (misbrewed)', 1800, 0.5); Game.Notify(p.name + ' misbrewed', 'Cursors are 50% less effective for the next 30 minutes.', getIconArray(p), 6); }
    );
    def('mercury_of_age',
        function(p) { Game.killBuff('Mercury of Age (misbrewed)'); Game.gainBuff('Mercury of Age', 900, 1.25); Game.Notify(p.name + ' consumed', 'Grandmas are 25% more effective for 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Mercury of Age'); Game.gainBuff('Mercury of Age (misbrewed)', 3600, 0.5); Game.Notify(p.name + ' misbrewed', 'Grandmas are 50% as effective for an hour.', getIconArray(p), 6); }
    );
    def('suspension_of_hallucinogenic',
        function(p) {
            Game.killBuff('Suspension of Hallucinogenic (misbrewed)');
            var buildings = Object.keys(Game.Objects).filter(function(id) { return Game.Objects[id].amount > 0; });
            var rb = buildings.length > 0 ? buildings[Math.floor(Math.random() * buildings.length)] : 'Cursor';
            var bn = Game.Objects[rb] ? Game.Objects[rb].name : rb;
            _suspBuildingKey = rb;
            Game.gainBuff('Suspension of Hallucinogenic', 900);
            _suspBuildingKey = null;
            var buff = Game.buffs['Suspension of Hallucinogenic'];
            if (buff) {
                Object.defineProperty(buff, 'buildingName', {
                    value: rb,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            }
            Game.Notify(p.name + ' consumed', bn + ' effectiveness doubled for the next 15 minutes.', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Suspension of Hallucinogenic');
            var buildings = Object.keys(Game.Objects).filter(function(id) { return Game.Objects[id].amount > 0; });
            var rb = buildings.length > 0 ? buildings[Math.floor(Math.random() * buildings.length)] : 'Cursor';
            var bn = Game.Objects[rb] ? Game.Objects[rb].name : rb;
            _suspBuildingKey = rb;
            Game.gainBuff('Suspension of Hallucinogenic (misbrewed)', 3600);
            _suspBuildingKey = null;
            var buff = Game.buffs['Suspension of Hallucinogenic (misbrewed)'];
            if (buff) {
                Object.defineProperty(buff, 'buildingName', {
                    value: rb,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            }
            Game.Notify(p.name + ' misbrewed', 'The effectiveness of ' + bn + ' is reduced by half for the next hour.', getIconArray(p), 6);
        }
    );
    def('bloom_of_industry',
        function(p) { Game.killBuff('Bloom of Industry (misbrewed)'); Game.gainBuff('Bloom of Industry', 600); Game.Notify(p.name + ' consumed', 'Buildings are 10% more effective for 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Bloom of Industry'); Game.gainBuff('Bloom of Industry (misbrewed)', 1800); Game.Notify(p.name + ' misbrewed', 'Buildings are 30% less effective for 30 minutes.', getIconArray(p), 6); }
    );
    def('tincture_of_purpose',
        function(p) { Game.killBuff('Tincture of Purpose (misbrewed)'); Game.gainBuff('Tincture of Purpose', 120, 1.3); Game.Notify(p.name + ' consumed', '+30% CpS for 2 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Tincture of Purpose'); Game.gainBuff('Tincture of Purpose (misbrewed)', 600, 0.3); Game.Notify(p.name + ' misbrewed', '-70% CpS for 10 minutes.', getIconArray(p), 6); }
    );
    def('ambrosia_of_the_leech',
        function(p) { Game.killBuff('Ambrosia of the Leech (misbrewed)'); Game.gainBuff('Ambrosia of the Leech', 900, 1.2); Game.Notify(p.name + ' consumed', 'Wrinkler consumption increased by 20% for 15 minutes.', getIconArray(p), 6); },
        function(p) {
            var exploded = 0;
            for (var i = 0; i < Game.wrinklers.length; i++) { if (Game.wrinklers[i].phase == 2 && exploded < 2) { Game.playWrinklerSquishSound(); PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75); Game.wrinklers[i].phase = 0; Game.wrinklers[i].hp = -10; Game.wrinklers[i].sucked = 0; exploded++; } }
            Game.Notify(p.name + ' misbrewed', '2 wrinklers explode with no gains.', getIconArray(p), 6);
        }
    );
    def('nectar_of_summoning',
        function(p) { Game.killBuff('Nectar of Summoning (misbrewed)'); Game.gainBuff('Nectar of Summoning', 600, 2.0); Game.Notify(p.name + ' consumed', 'Wrinklers spawn 100% faster for 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Nectar of Summoning'); Game.gainBuff('Nectar of Summoning (misbrewed)', 1800, 0.5); Game.Notify(p.name + ' misbrewed', 'Wrinklers suck 50% less for 30 minutes.', getIconArray(p), 6); }
    );
    def('philter_of_worms',
        function(p) {
            var spawned = 0;
            for (var i = 0; i < 6; i++) {
                if (Game.SpawnWrinkler && Game.SpawnWrinkler()) spawned++;
            }
            Game.Notify(p.name + ' consumed', spawned + ' wrinklers summoned.', getIconArray(p), 6);
        },
        function(p) {
            Game.gainBuff('Philter of Worms (misbrewed)', 900, 0.5);
            Game.Notify(p.name + ' misbrewed', 'Wrinklers spawn 50% less often for the next 15 minutes.', getIconArray(p), 6);
        }
    );
    def('emulsion_of_sinful_greed',
        function(p) {
            Game.killBuff('Emulsion of Sinful Greed (misbrewed)');
            Game.gainBuff('Emulsion of Sinful Greed', 1800);
            Game.Notify(p.name + ' consumed', 'Shiny wrinkler spawn rate tripled for 30 minutes.', getIconArray(p), 6);
        },
        function(p) {
            var reduced = 0;
            if (Game.wrinklers) {
                for (var i = 0; i < Game.wrinklers.length; i++) {
                    var w = Game.wrinklers[i];
                    if (w && w.sucked > 0) { w.sucked *= 0.8; reduced++; }
                }
            }
            Game.Notify(p.name + ' misbrewed', reduced + ' wrinklers lost 20% of their sucked cookies.', getIconArray(p), 6);
        }
    );
    def('vitae_of_the_mother',
        function(p) { Game.killBuff('Vitae of the Mother (misbrewed)'); Game.gainBuff('Vitae of the Mother', 900, 1.03); Game.Notify(p.name + ' consumed', 'Milk is 3% more powerful for 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Vitae of the Mother'); Game.gainBuff('Vitae of the Mother (misbrewed)', 3600, 0.85); Game.Notify(p.name + ' misbrewed', 'Milk is 15% weaker for an hour.', getIconArray(p), 6); }
    );
    def('infusion_of_chance',
        function(p) { Game.killBuff('Infusion of Chance (misbrewed)'); Game.gainBuff('Infusion of Chance', 1800, 1.3); Game.Notify(p.name + ' consumed', 'Random drops are 30% more common for 30 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Infusion of Chance'); Game.gainBuff('Infusion of Chance (misbrewed)', 3600, 0.5); Game.Notify(p.name + ' misbrewed', 'Random drops are 50% less common for an hour.', getIconArray(p), 6); }
    );
    def('elixir_of_chaos',
        function(p, si) {
            var rp = PotionsM._getRandomPotion();
            if (rp) { var mb = PotionsM._random() < 0.1; if (mb && rp.doMisbrew) rp.doMisbrew(rp, si); else if (rp.doEffect) rp.doEffect(rp, si); }
            else { Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6); }
        },
        function(p, si) {
            var rp = PotionsM._getRandomPotion();
            if (rp && rp.doMisbrew) rp.doMisbrew(rp, si); else Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6);
        }
    );
    def('concentrate_of_saturn',
        function(p) {
            var gain = Math.min(Game.cookies * 0.08, Game.cookiesPs * 3600);
            if (gain > 0) { Game.Earn(gain); Game.Notify(p.name + ' consumed', 'Gained ' + Beautify(gain) + ' cookies (1 hour of CpS, capped at 8% of bank).', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6); }
        },
        function(p) {
            var loss = Game.cookiesPs * 7200;
            if (loss > 0) { Game.Earn(-loss); Game.Notify(p.name + ' misbrewed', 'Lost ' + Beautify(loss) + ' cookies (2 hours of CpS).', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6); }
        }
    );
    def('decoction_of_winter',
        function(p) { Game.killBuff('Decoction of Winter (misbrewed)'); Game.gainBuff('Decoction of Winter', 3600, 1.25); Game.Notify(p.name + ' consumed', 'Reindeer and lanterns are 25% more common for the next hour.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Decoction of Winter'); Game.gainBuff('Decoction of Winter (misbrewed)', 3600, 0); Game.Notify(p.name + ' misbrewed', 'Reindeer and lanterns do not spawn for the next hour.', getIconArray(p), 6); }
    );
    def('blood_of_the_craftsman',
        function(p) {
            var obs = [];
            for (var i in Game.Objects) {
                if (Game.Objects[i].amount > 0 && (G.craftsmanGrants[Game.Objects[i].id] || 0) < 50) {
                    obs.push(Game.Objects[i]);
                }
            }
            if (obs.length > 0) {
                var granted = 0;
                for (var i = 0; i < 10; i++) {
                    if (obs.length === 0) break;
                    var ri = Math.floor(Math.random() * obs.length);
                    var b = obs[ri];
                    if ((G.craftsmanGrants[b.id] || 0) < 50) {
                        b.getFree(1);
                        G.craftsmanGrants[b.id] = (G.craftsmanGrants[b.id] || 0) + 1;
                        granted++;
                        if (G.craftsmanGrants[b.id] >= 50) {
                            obs.splice(ri, 1);
                        }
                    } else {
                        obs.splice(ri, 1);
                    }
                }
                Game.recalculateGains = 1;
                if (granted > 0) {
                    Game.Notify(p.name + ' consumed', 'Gained ' + granted + ' random free buildings.', getIconArray(p), 6);
                } else {
                    Game.Notify(p.name + ' consumed', 'All building types already at 50 free grants this ascension.', getIconArray(p), 6);
                }
            } else {
                Game.Notify(p.name + ' consumed', 'All building types already at 50 free grants this ascension.', getIconArray(p), 6);
            }
        },
        function(p) {
            var obs = []; for (var i in Game.Objects) { if (Game.Objects[i].amount > 0) obs.push(Game.Objects[i]); }
            if (obs.length > 0) {
                var lost = 0; var max = Math.min(50, Game.BuildingsOwned);
                for (var i = 0; i < max; i++) {
                    if (obs.length === 0) break;
                    var ri = Math.floor(Math.random() * obs.length); var b = obs[ri];
                    if (b.amount > 0) { b.amount--; Game.BuildingsOwned--; lost++; b.refresh(); if (b.amount === 0) obs.splice(ri, 1); }
                }
                Game.recalculateGains = 1; Game.Notify(p.name + ' misbrewed', 'Lost ' + lost + ' random buildings.', getIconArray(p), 6);
            } else { Game.Notify(p.name + ' misbrewed', 'No buildings to lose.', getIconArray(p), 6); }
        }
    );
    def('salve_of_fortune',
        function(p) { Game.gainBuff('Salve of Fortune', 3600, 1); Game.Notify(p.name + ' consumed', 'Potions misbrew 80% less for the next hour.', getIconArray(p), 6); }
    );
    def('spirit_of_protection',
        function(p) {
            Game.gainBuff('Spirit of Protection', 30, 0.9);
            Game.Notify(p.name + ' consumed', 'The shimmering veil has a 90% chance to not shatter for the next 30 seconds.', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Spirit of Protection');
            Game.Notify(p.name + ' misbrewed', 'The shimmering veil shatters instantly.', getIconArray(p), 6);
            // Directly turn off the veil like vanilla does
            var me = Game.Upgrades['Shimmering veil [on]'];
            if (me) {
                me.bought = 1;
                Game.Lock(me.toggleInto);
                Game.Unlock(me.toggleInto);
                Game.Notify('The shimmering veil disappears...', '', [9, 10]);
                Game.upgradesToRebuild = 1;
                Game.recalculateGains = 1;
                if (typeof PlaySound === 'function') PlaySound('snd/spellFail.mp3', 0.75);
            }
        }
    );
    def('essence_of_cheer',
        function(p) {
            Game.killBuff('Essence of Cheer (misbrewed)'); Game.gainBuff('Essence of Cheer', 60, 0.2);
            Game.seasonUses = Math.max(0, (Game.seasonUses || 0) - 5);
            Game.Notify(p.name + ' consumed', 'Changing seasons is 80% cheaper for the next minute.', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Essence of Cheer'); Game.gainBuff('Essence of Cheer (misbrewed)', 1800, 4.0);
            Game.Notify(p.name + ' misbrewed', 'Changing seasons is 300% more expensive for the next 30 minutes.', getIconArray(p), 6);
        }
    );
    def('liqueur_of_rincewind',
        function(p) {
            var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
            if (!GM || !GM.spells) {
                Game.Notify(p.name + ' consumed', 'Grimoire not available.', getIconArray(p), 6);
                return;
            }

            var spells = [];
            for (var i in GM.spells) { spells.push(GM.spells[i]); }
            if (spells.length === 0) {
                Game.Notify(p.name + ' consumed', 'No spells to cast.', getIconArray(p), 6);
                return;
            }

            var spell = spells[Math.floor(Math.random() * spells.length)];
            var oldMagic = GM.magic;
            GM.magic = GM.magicM;

            var success = false;
            var origWin = spell.win;
            var origFail = spell.fail;
            if (origWin) {
                spell.win = function() { success = true; return origWin.apply(this, arguments); };
            }
            if (origFail) {
                spell.fail = function() { success = false; return origFail.apply(this, arguments); };
            }

            GM.castSpell(spell);

            if (origWin) spell.win = origWin;
            if (origFail) spell.fail = origFail;
            GM.magic = oldMagic;

            if (success) {
                Game.Notify(p.name + ' consumed', 'Successfully cast ' + spell.name + ' for free!', getIconArray(p), 6);
            } else {
                Game.Notify(p.name + ' consumed', spell.name + ' backfired, but at no cost.', getIconArray(p), 6);
            }
        },
        function(p) {
            var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
            if (GM) { GM.magic = Math.floor(GM.magic / 2); }
            Game.Notify(p.name + ' misbrewed', 'Half of your magic vanished.', getIconArray(p), 6);
        }
    );
    def('extract_of_cadence',
        function(p) {
            var extendedCount = 0;
            for (var i in Game.buffs) {
                var buff = Game.buffs[i];
                if (buff && buff.time > 0) {
                    var extendedSoFar = G.cadenceExtensions[buff.name] || 0;
                    var remainingAllowed = 60 - extendedSoFar;
                    if (remainingAllowed <= 0) continue;
                    var originalTimeSeconds = buff.maxTime / Game.fps;
                    var desiredExtensionSeconds = Math.min(originalTimeSeconds * 2, 60);
                    var actualExtensionSeconds = Math.min(desiredExtensionSeconds, remainingAllowed);
                    if (actualExtensionSeconds > 0) {
                        var extensionFrames = actualExtensionSeconds * Game.fps;
                        buff.time += extensionFrames;
                        buff.maxTime += extensionFrames;
                        G.cadenceExtensions[buff.name] = extendedSoFar + actualExtensionSeconds;
                        extendedCount++;
                    }
                }
            }
            Game.Notify(p.name + ' consumed', 'Extended ' + extendedCount + ' buff(s).', getIconArray(p), 6);
        },
        function(p) {
            for (var i in Game.buffs) { var buff = Game.buffs[i]; if (buff && buff.time > 0) { buff.time = Math.floor(buff.time / 2); } }
            Game.Notify(p.name + ' misbrewed', 'Halved remaining duration of buffs.', getIconArray(p), 6);
        }
    );
    def('draught_of_urgency',
        function(p) { Game.killBuff('Draught of Urgency (misbrewed)'); Game.gainBuff('Draught of Urgency', 7200); Game.Notify(p.name + ' consumed', 'Potions brew 25% faster for the next 2 hours.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Draught of Urgency'); Game.gainBuff('Draught of Urgency (misbrewed)', 7200); Game.Notify(p.name + ' misbrewed', 'Potions brew 50% slower for the next 2 hours.', getIconArray(p), 6); }
    );
    def('reduction_of_silica',
        function(p) {
            var TM = Game.Objects['Javascript console'] && Game.Objects['Javascript console'].minigame;
            if (TM) {
                if (TM.executionCooldownStart && TM.getExecutionCooldownRemaining() > 0) {
                    var duration = TM.executionCooldownDuration - (Game.Has('Water cooled processors') ? 1000 * 60 * 60 : 0);
                    var currentEnd = TM.executionCooldownStart + duration;
                    var newEnd = currentEnd - 7200000;
                    if (newEnd > Date.now()) {
                        TM.executionCooldownStart = newEnd - duration;
                        TM.updateCooldownDisplay();
                        Game.Notify(p.name + ' consumed', 'Removed 2 hours from terminal cooldown.', getIconArray(p), 6);
                    } else {
                        TM.executionCooldownStart = 0;
                        TM.updateCooldownDisplay();
                        Game.Notify(p.name + ' consumed', 'Terminal cooldown reduced!', getIconArray(p), 6);
                    }
                } else { Game.Notify(p.name + ' consumed', 'No terminal cooldown to reduce.', getIconArray(p), 6); }
            } else { Game.Notify(p.name + ' consumed', 'Terminal minigame not available.', getIconArray(p), 6); }
        },
        function(p) {
            var TM = Game.Objects['Javascript console'] && Game.Objects['Javascript console'].minigame;
            if (TM) {
                if (TM.executionCooldownStart && TM.getExecutionCooldownRemaining() > 0) {
                    var duration = TM.executionCooldownDuration - (Game.Has('Water cooled processors') ? 1000 * 60 * 60 : 0);
                    var currentEnd = TM.executionCooldownStart + duration;
                    var newEnd = currentEnd + 14400000;
                    TM.executionCooldownStart = newEnd - duration;
                    TM.updateCooldownDisplay();
                    Game.Notify(p.name + ' misbrewed', 'Added 4 hours to terminal cooldown.', getIconArray(p), 6);
                } else { Game.Notify(p.name + ' misbrewed', 'No terminal cooldown to extend.', getIconArray(p), 6); }
            } else { Game.Notify(p.name + ' misbrewed', 'Terminal minigame not available.', getIconArray(p), 6); }
        }
    );
    def('poison_of_the_matriarchs',
        function(p) {
            if (Game.shimmer) { new Game.shimmer('golden', {wrath: true}); Game.Notify(p.name + ' consumed', 'A wrath cookie has been summoned.', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' consumed', 'Could not summon wrath cookie.', getIconArray(p), 6); }
        },
        function(p) { Game.killBuff('Poison of the Matriarchs (misbrewed)'); Game.gainBuff('Poison of the Matriarchs (misbrewed)', 600, 0.7); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Golden cookies appear 30% less for the next 10 minutes.', getIconArray(p), 6); }
    );
    def('transmutation_of_dough',
        function(p) {
            if (Game.shimmer) { new Game.shimmer('golden', {noWrath: true}); Game.Notify(p.name + ' consumed', 'A golden cookie has been summoned.', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' consumed', 'Could not summon golden cookie.', getIconArray(p), 6); }
        },
        function(p) {
            var pbs = []; for (var i in Game.buffs) { if (Game.buffs[i] && Game.buffs[i].aura === 1) pbs.push(Game.buffs[i].name); }
            if (pbs.length > 0) { var rb = pbs[Math.floor(Math.random() * pbs.length)]; Game.killBuff(rb); Game.Notify(p.name + ' misbrewed', 'Ended the ' + rb + ' buff.', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' misbrewed', 'No positive buffs to remove.', getIconArray(p), 6); }
        }
    );
    def('unguent_of_hades',
        function(p) { var loss = Game.cookies * 0.1; Game.Spend(loss); Game.Notify(p.name + ' consumed', 'Lost ' + Beautify(loss) + ' cookies (10% of bank).', getIconArray(p), 6); },
        function(p) { Game.gainLumps(1); Game.Notify(p.name + ' misbrewed', 'Gained a sugar lump!', getIconArray(p), 6); }
    );
    def('balm_of_merlin',
        function(p) { Game.killBuff('Balm of Merlin (misbrewed)'); Game.gainBuff('Balm of Merlin', 600, 1); Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6); },
        function(p) { Game.killBuff('Balm of Merlin'); Game.gainBuff('Balm of Merlin (misbrewed)', 1200, 1); Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6); }
    );
    def('shadow_of_remorse',
        function(p) {
            var nbs = []; for (var i in Game.buffs) { if (Game.buffs[i] && Game.buffs[i].aura === 2) nbs.push(Game.buffs[i].name); }
            if (nbs.length > 0) { var rb = nbs[Math.floor(Math.random() * nbs.length)]; Game.killBuff(rb); Game.Notify(p.name + ' consumed', 'Removed ' + rb + '.', getIconArray(p), 6); }
            else { Game.Notify(p.name + ' consumed', 'No negative buffs to remove.', getIconArray(p), 6); }
        },
        function(p, si) {
            var rp = PotionsM._getRandomPotion();
            if (rp && rp.doMisbrew) rp.doMisbrew(rp, si); else Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6);
        }
    );
    def('toxin_of_elders',
        function(p) { Game.killBuff('Toxin of Elders (misbrewed)'); Game.gainBuff('Toxin of Elders', 600, 1.2); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Wrath cookies appear 20% more often for 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Toxin of Elders'); Game.gainBuff('Toxin of Elders (misbrewed)', 3600, 0.5); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Wrath cookies appear 50% less for an hour.', getIconArray(p), 6); }
    );
    def('ether_of_serendipity',
        function(p) { Game.killBuff('Ether of Serendipity (misbrewed)'); Game.gainBuff('Ether of Serendipity', 60, 1.5); Game.Notify(p.name + ' consumed', '+50% CpS for 1 minute.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Ether of Serendipity'); Game.gainBuff('Ether of Serendipity (misbrewed)', 60, 0.5); Game.Notify(p.name + ' misbrewed', '-50% CpS for 1 minute.', getIconArray(p), 6); }
    );
    def('corruption_of_sin',
        function(p) { Game.killBuff('Corruption of Sin (misbrewed)'); Game.gainBuff('Corruption of Sin', 1800, 0.5); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Negative wrath cookie effects reduced for 30 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Corruption of Sin'); Game.gainBuff('Corruption of Sin (misbrewed)', 3600, 1.5); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Negative wrath cookie effects increased for an hour.', getIconArray(p), 6); }
    );
    def('vapor_of_luck',
        function(p) { Game.killBuff('Vapor of Luck (misbrewed)'); Game.gainBuff('Vapor of Luck', 600); Game.Notify(p.name + ' consumed', 'Additional golden cookies may randomly spawn for the next 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Vapor of Luck'); Game.gainBuff('Vapor of Luck (misbrewed)', 3600); Game.Notify(p.name + ' misbrewed', 'Rare golden cookie chances are decreased for an hour.', getIconArray(p), 6); }
    );
    def('venom_of_the_basilisk',
        function(p) { 
            Game.killBuff('Venom of the Basilisk'); 
            // Multiply all attached wrinkler.sucked by 1.1
            if (Game.wrinklers) {
                for (var i = 0; i < Game.wrinklers.length; i++) {
                    if (Game.wrinklers[i].phase == 2) {
                        Game.wrinklers[i].sucked *= 1.1;
                    }
                }
            }
            Game.gainBuff('Venom of the Basilisk', 30, 1.1); 
            updatePotionEffects(); 
            Game.Notify(p.name + ' consumed', 'Wrinklers explode 10% more for 30 seconds.', getIconArray(p), 6); 
        },
        function(p) {
            for (var i = 0; i < Game.wrinklers.length; i++) { if (Game.wrinklers[i].phase == 2) { Game.wrinklers[i].sucked *= 0.9; Game.wrinklers[i].hp = 0; } }
            Game.Notify(p.name + ' misbrewed', 'All wrinklers exploded for 10% less.', getIconArray(p), 6);
        }
    );
    def('ember_of_dragon_fire',
        function(p) { Game.killBuff('Ember of Dragon Fire (misbrewed)'); Game.gainBuff('Ember of Dragon Fire', 3600, 1.1); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Golden cookie gains increased by 10% for 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Ember of Dragon Fire'); Game.gainBuff('Ember of Dragon Fire (misbrewed)', 3600, 0.7); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Golden cookie gains reduced by 30% for 30 minutes.', getIconArray(p), 6); }
    );
    def('whisper_of_boreas',
        function(p) { Game.killBuff('Whisper of Boreas (misbrewed)'); Game.gainBuff('Whisper of Boreas', 1800, 1.2); updatePotionEffects(); Game.Notify(p.name + ' consumed', 'Reindeer and lantern gains increased by 20% for 30 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Whisper of Boreas'); Game.gainBuff('Whisper of Boreas (misbrewed)', 3600, 0.5); updatePotionEffects(); Game.Notify(p.name + ' misbrewed', 'Reindeer and lantern gains reduced by 50% for an hour.', getIconArray(p), 6); }
    );
    def('breath_of_growth',
        function(p) {
            var fractalEngine = Game.Objects['Fractal engine'];
            var DM = fractalEngine && fractalEngine.minigame;
            if (DM) {
                Game.gainBuff('Breath of Growth', 60, 2.0);
                Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6);
            } else { Game.Notify(p.name + ' consumed', 'Downline minigame not available.', getIconArray(p), 6); }
        },
        function(p) {
            var fractalEngine = Game.Objects['Fractal engine'];
            var DM = fractalEngine && fractalEngine.minigame;
            if (DM && DM.cancelRandomAction) {
                var action = DM.cancelRandomAction();
                if (action) {
                    Game.Notify(p.name + ' misbrewed', 'Stopped the ' + action.name + ' action.', getIconArray(p), 6);
                } else {
                    Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6);
                }
            } 
        }
    );
    def('precipitate_of_chronos',
        function(p) {
            if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
                var M = Game.Objects['Farm'].minigame; var wf = M.freeze; M.freeze = 0;
                for (var i = 0; i < 10; i++) { M.nextStep = Date.now(); M.logic(); } M.freeze = wf;
            }
            Game.Notify(p.name + ' consumed', 'The Garden ticks 10 times instantly.', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Precipitate of Chronos'); Game.gainBuff('Precipitate of Chronos (misbrewed)', 1800, 0.5);
            var M2 = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
            if (M2) { M2.toCompute = true; M2.computeEffs(); }
            Game.Notify(p.name + ' misbrewed', 'Plant effects are reduced by 50% for 30 minutes.', getIconArray(p), 6);
        }
    );
    def('tears_of_landis',
        function(p) {
            if (typeof Game.lumpCurrentType !== 'undefined') {
                var types=[0];
                var loop=1;
                loop+=Game.auraMult('Dragon\'s Curve');
                loop=randomFloor(loop);
                for (var i=0;i<loop;i++)
                {
                    if (Math.random()<(Game.Has('Sucralosia Inutilis')?0.15:0.1)) types.push(1);
                    if (Math.random()<3/1000) types.push(2);
                    if (Math.random()<0.1*Game.elderWrath) types.push(3);
                    if (Math.random()<1/50) types.push(4);
                }
                Game.lumpCurrentType=choose(types);
                Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6);
            } 
        },
        function(p) {
            // Reset the lump timer directly this is just easier to do then harvest and botch 
            Game.lumpT = Date.now();
            Game.computeLumpType();
            Game.Notify(p.name + ' misbrewed', 'Botched harvest! Your sugar lump disappears.', getIconArray(p), 6);
        }
    );
    def('resin_of_the_cane',
        function(p) {
            if (typeof Game.lumpT !== 'undefined') {
                Game.lumpT -= 3600000; 
                Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6);
            }
        },
        function(p) {
            if (typeof Game.lumpT !== 'undefined') {
                Game.lumpT = Math.min(Game.lumpT + 14400000, Date.now());
                Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6);
            }
        }
    );
    def('potion_of_gaia',
        function(p) { Game.killBuff('Potion of Gaia (misbrewed)'); Game.gainBuff('Potion of Gaia', 900, 1); Game.Notify(p.name + ' consumed', 'Plant mutation rate increased for 15 minutes.', getIconArray(p), 6); },
        function(p) {
            var killed = 0;
            if (Game.Objects['Farm'] && Game.Objects['Farm'].minigame) {
                var M = Game.Objects['Farm'].minigame;
                for (var y = 0; y < 6; y++) { for (var x = 0; x < 6; x++) { if (M.plot[y][x][0] > 0 && Math.random() < 0.2) { var ot = M.plot[y][x]; var me = M.plantsById[ot[0]-1]; M.plot[y][x] = [0,0]; if (me && me.onKill) me.onKill(x, y, ot[1]); killed++; } } }
                M.toRebuild = true; M.toCompute = true; M.buildPlot(); M.computeEffs();
            }
            Game.Notify(p.name + ' misbrewed', killed + ' plants died.', getIconArray(p), 6);
        }
    );
    def('catalyst_of_yule',
        function(p) {
            var drops = PotionsM._getAllSeasonalDrops().filter(function(d) { return Game.Upgrades[d] && !Game.Upgrades[d].unlocked && !Game.Upgrades[d].bought; });
            if (drops.length > 0) { var fd = drops[Math.floor(Math.random() * drops.length)]; Game.Upgrades[fd].unlocked = true; Game.Notify(loc('You found a seasonal drop!'), '<b>' + fd + '</b>', Game.Upgrades[fd].icon); Game.recalculateGains = 1; Game.storeToRefresh = 1; Game.upgradesToRebuild = 1; }
            else { Game.Notify(p.name + ' consumed', 'No unowned seasonal drops to find!', getIconArray(p), 6); }
        },
        function(p) {
            var drops = PotionsM._getAllSeasonalDrops().filter(function(d) { return Game.Upgrades[d] && Game.Upgrades[d].unlocked && Game.Upgrades[d].bought; });
            if (drops.length > 0) { var ld = drops[Math.floor(Math.random() * drops.length)]; Game.Upgrades[ld].unlocked = false; Game.Upgrades[ld].bought = false; Game.Notify(p.name + ' misbrewed', 'Lost ' + ld + '!', Game.Upgrades[ld].icon, 6); Game.recalculateGains = 1; Game.storeToRefresh = 1;Game.upgradesToRebuild = 1; }
            else { Game.Notify(p.name + ' misbrewed', 'No owned seasonal drops to lose!', [2, 26, 'custom'], 6); }
        }
    );
    def('ichor_of_destiny',
        function(p) {
            var fortunes = PotionsM._getFortunes().filter(function(f) { return f && !f.unlocked && !f.bought; });
            if (!Game.fortuneGC) fortunes.push('fortuneGC'); if (!Game.fortuneCPS) fortunes.push('fortuneCPS');
            if (fortunes.length > 0) {
                var ff = fortunes[Math.floor(Math.random() * fortunes.length)];
                Game.TickerEffect = {type: 'fortune', sub: ff}; Game.Ticker = PotionsM._getFortuneTickerText(ff); Game.TickerAge = Game.fps * 10; if (Game.TickerDraw) Game.TickerDraw();
                Game.Notify(p.name + ' consumed', 'A fortune appears in the news ticker!', getIconArray(p), 6);
            } else { Game.Notify(p.name + ' consumed', 'No uncollected fortunes to reveal!', getIconArray(p), 6); }
        },
        function(p) {
            var fortunes = PotionsM._getFortunes().filter(function(f) { return f && f.unlocked && f.bought; });
            if (fortunes.length > 0) { var lf = fortunes[Math.floor(Math.random() * fortunes.length)]; lf.unlocked = false; lf.bought = false; Game.Notify(p.name + ' misbrewed', 'Lost ' + lf.name + '!', lf.icon, 6); Game.recalculateGains = 1; Game.storeToRefresh = 1; }
            else { Game.Notify(p.name + ' misbrewed', 'No owned fortunes to lose!', [9, 32, 'main'], 6); }
        }
    );
    def('cordial_of_tyche',
        function(p) { Game.killBuff('Cordial of Tyche (misbrewed)'); Game.gainBuff('Cordial of Tyche', 900); Game.Notify(p.name + ' consumed', 'Rare golden cookie effects are increased for 15 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Cordial of Tyche'); Game.gainBuff('Cordial of Tyche (misbrewed)', 1800); Game.Notify(p.name + ' misbrewed', 'Rare golden cookie effects are decreased for 30 minutes.', getIconArray(p), 6); }
    );
    def('solvent_of_substitution',
        function(p) {
            var candidates = [];
            for (var i = 0; i < REAGENTS.length; i++) {
                var r = REAGENTS[i];
                var count = G.reagents[r.id] || 0;
                if (r.unlocked && count < 5) candidates.push(r.id);
            }
            var gained = 0;
            var allowDuplicates = false;
            for (var i = 0; i < 5; i++) {
                if (candidates.length === 0) {
                    if (allowDuplicates) break;
                    allowDuplicates = true;
                    candidates = [];
                    for (var j = 0; j < REAGENTS.length; j++) {
                        var r = REAGENTS[j];
                        var count = G.reagents[r.id] || 0;
                        if (r.unlocked && count < G.maxReagents) candidates.push(r.id);
                    }
                    if (candidates.length === 0) break;
                }
                var idx = Math.floor(Math.random() * candidates.length);
                var rid = candidates[idx];
                var current = G.reagents[rid] || 0;
                if (current < G.maxReagents) {
                    G.reagents[rid] = current + 1;
                    gained++;
                }
                if (!allowDuplicates) {
                    candidates.splice(idx, 1);
                }
            }
            Game.Notify(p.name + ' consumed', 'Gained ' + gained + ' random reagent(s).', getIconArray(p), 6);
            PotionsM._buildReagents();
        },
        function(p) {
            var candidates = [];
            for (var i = 0; i < REAGENTS.length; i++) {
                var r = REAGENTS[i];
                var count = G.reagents[r.id] || 0;
                if (count > 0) candidates.push(r.id);
            }
            var lost = 0;
            for (var i = 0; i < 3; i++) {
                if (candidates.length === 0) break;
                var idx = Math.floor(Math.random() * candidates.length);
                var rid = candidates[idx];
                G.reagents[rid]--;
                lost++;
                candidates.splice(idx, 1);
            }
            Game.Notify(p.name + ' misbrewed', 'Lost ' + lost + ' random reagent(s).', getIconArray(p), 6);
            PotionsM._buildReagents();
        }
    );
    def('ointment_of_plenty',
        function(p) { Game.killBuff('Ointment of Plenty (misbrewed)'); Game.gainBuff('Ointment of Plenty', 600, 2.0); Game.Notify(p.name + ' consumed', 'Reagents drop 100% more often for 10 minutes.', getIconArray(p), 6); },
        function(p) { Game.killBuff('Ointment of Plenty'); Game.gainBuff('Ointment of Plenty (misbrewed)', 1800, 0.5); Game.Notify(p.name + ' misbrewed', 'Reagent drops are 50% less common for 30 minutes.', getIconArray(p), 6); }
    );
    // =====================================================================
    // Prestige potion effects
    // =====================================================================
    def('liniment_of_warlocks',
        function(p) {
            var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
            if (!GM) { Game.Notify(p.name + ' consumed', 'Grimoire not available.', getIconArray(p), 6); return; }
            var maxMana = (typeof GM.magicM === 'function') ? GM.magicM() : GM.magicM;
            if (GM.magic >= maxMana * 0.5) {
                GM.magic = maxMana;
                Game.Notify(p.name + ' consumed', 'All mana restored.', getIconArray(p), 6);
            } else {
                Game.Notify(p.name + ' consumed', 'Nothing happened.', getIconArray(p), 6);
            }
        },
        function(p) {
            var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
            if (!GM) { Game.Notify(p.name + ' misbrewed', 'Grimoire not available.', getIconArray(p), 6); return; }
            GM.magic = 0;
            Game.Notify(p.name + ' misbrewed', 'All mana drained!', getIconArray(p), 6);
        }
    );
    def('oxymel_of_insanity',
        function(p) {
            Game.killBuff('Oxymel of Insanity');
            if (PotionsM._oxymeltTimer) clearInterval(PotionsM._oxymeltTimer);
            PotionsM._oxymeltMult = 2.0;
            Game.gainBuff('Oxymel of Insanity', 60, 2.0);
            Game.recalculateGains = 1;
            PotionsM._oxymeltTimer = setInterval(function() {
                var buff = Game.hasBuff('Oxymel of Insanity');
                if (buff) {
                    PotionsM._oxymeltMult = PotionsM._oxymeltMult === 2.0 ? 0.1 : 2.0;
                    buff.multCpS = PotionsM._oxymeltMult;
                    Game.recalculateGains = 1;
                }
            }, 1000);
            Game.Notify(p.name + ' consumed', 'CPS begins to behave erratically.', getIconArray(p), 6);
        },
        null
    );
    def('nepenthe_of_undoing',
        function(p) {
            var pos = [];
            for (var bn in Game.buffs) { if (Game.buffs[bn] && Game.buffs[bn].aura === 1) pos.push(bn); }
            var n = Math.min(pos.length, 6);
            if (n === 0) { Game.Notify(p.name + ' consumed', 'No positive buffs to remove. Nothing happened.', getIconArray(p), 6); return; }
            for (var i = 0; i < n; i++) Game.killBuff(pos[i]);
            var existing = Game.hasBuff('Nepenthe of Undoing');
            var prevPower = existing ? (existing.multCpS || 1) : 1;
            var prevTime = existing ? (existing.time / (Game.fps || 30)) : 0;
            Game.killBuff('Nepenthe of Undoing');
            delete Game.buffs['Nepenthe of Undoing'];
            var newPower = prevPower + n;
            var newTime = prevTime + n * 600;
            Game.gainBuff('Nepenthe of Undoing', newTime, newPower);
            Game.Notify(p.name + ' consumed', 'Removed ' + n + ' positive buff' + (n !== 1 ? 's' : '') + '. CpS ×' + newPower + ' for ' + Math.round(newTime / 60) + ' minutes.', getIconArray(p), 6);
        },
        function(p) {
            var pos = [];
            for (var bn in Game.buffs) { if (Game.buffs[bn] && Game.buffs[bn].aura === 1) pos.push(bn); }
            var n = Math.min(pos.length, 6);
            if (n === 0) { Game.Notify(p.name + ' misbrewed', 'No positive buffs to remove.', getIconArray(p), 6); return; }
            for (var i = 0; i < n; i++) Game.killBuff(pos[i]);
            Game.Notify(p.name + ' misbrewed', 'Removed ' + n + ' positive buff' + (n !== 1 ? 's' : '') + ' with no benefit.', getIconArray(p), 6);
        }
    );
    def('hydrosol_of_refraction',
        function(p) {
            Game.killBuff('Hydrosol of Refraction (misbrewed)');
            Game.gainBuff('Hydrosol of Refraction', 20, 1);
            Game.Notify(p.name + ' consumed', 'Clicking a golden cookie has a 30% chance to summon another for 20 seconds!', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Hydrosol of Refraction');
            Game.gainBuff('Hydrosol of Refraction (misbrewed)', 300, 0.5);
            Game.Notify(p.name + ' misbrewed', 'Golden cookies appear 50% less for the next 5 minutes.', getIconArray(p), 6);
        }
    );
    def('attar_of_the_gambler',
        function(p) {
            var s = new Game.shimmer('golden', {noWrath: true});
            s.force = PotionsM._attarPendingForced || 'frenzy';
            PotionsM._attarPendingForced = null;
            Game.Notify(p.name + ' consumed', 'A golden cookie appears, it is mysterious.', getIconArray(p), 6);
        },
        function(p) {
            var s = new Game.shimmer('golden', {noWrath: true});
            s.force = PotionsM._attarPendingForced || 'frenzy';
            PotionsM._attarPendingForced = null;
            Game.Notify(p.name + ' consumed', 'A golden cookie appears, it is mysterious.', getIconArray(p), 6);
        }
    );
    def('alkahest_of_the_pantry',
        function(p) {
            var total = 0, unlocked = [];
            for (var i = 0; i < REAGENTS.length; i++) {
                total += G.reagents[REAGENTS[i].id] || 0;
                if (REAGENTS[i].unlocked) unlocked.push(REAGENTS[i].id);
            }
            for (var i = 0; i < REAGENTS.length; i++) G.reagents[REAGENTS[i].id] = 0;
            var distributed = 0;
            for (var i = 0; i < total; i++) {
                var available = unlocked.filter(function(rid) { return (G.reagents[rid] || 0) < G.maxReagents; });
                if (available.length === 0) break;
                var rid = available[Math.floor(PotionsM._random() * available.length)];
                G.reagents[rid] = (G.reagents[rid] || 0) + 1;
                distributed++;
            }
            PotionsM._buildReagents();
            Game.Notify(p.name + ' consumed', 'Exchanged ' + total + ' reagent' + (total !== 1 ? 's' : '') + ' for ' + distributed + ' random one' + (distributed !== 1 ? 's' : '') + '.', getIconArray(p), 6);
        },
        function(p) {
            var total = 0, unlocked = [];
            for (var i = 0; i < REAGENTS.length; i++) {
                total += G.reagents[REAGENTS[i].id] || 0;
                if (REAGENTS[i].unlocked) unlocked.push(REAGENTS[i].id);
            }
            for (var i = 0; i < REAGENTS.length; i++) G.reagents[REAGENTS[i].id] = 0;
            var half = Math.ceil(total / 2);
            var distributed = 0;
            for (var i = 0; i < half; i++) {
                var available = unlocked.filter(function(rid) { return (G.reagents[rid] || 0) < G.maxReagents; });
                if (available.length === 0) break;
                var rid = available[Math.floor(PotionsM._random() * available.length)];
                G.reagents[rid] = (G.reagents[rid] || 0) + 1;
                distributed++;
            }
            PotionsM._buildReagents();
            Game.Notify(p.name + ' misbrewed', 'Exchanged ' + total + ' reagent' + (total !== 1 ? 's' : '') + ' for only ' + distributed + ' random one' + (distributed !== 1 ? 's' : '') + '.', getIconArray(p), 6);
        }
    );
    def('wassail_of_bedlam',
        function(p) {
            for (var k = 0; k < 3; k++) {
                setTimeout(function() {
                    new Game.shimmer('reindeer');
                    var savedSeason = Game.season;
                    Game.season = 'lunarnewyear';
                    var lantern = new Game.shimmer('lantern');
                    Game.season = savedSeason;
                    if (lantern) lantern.delay = 0;
                    if (Game.elderWrath > 0) Game.SpawnWrinkler();
                }, k * 300);
            }
            Game.Notify(p.name + ' consumed', 'Mayhem descends upon you.', getIconArray(p), 6);
        },
        function(p) {
            var pool = [];
            for (var s in Game.seasons) { if (s && s !== Game.season) pool.push(s); }
            for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(PotionsM._random() * (i+1)); var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
            var picks = pool.slice(0, 3);
            for (var i = 0; i < picks.length; i++) {
                setTimeout(function(idx) {
                    var info = Game.seasons[picks[idx]];
                    var upgrade = Game.Upgrades[info.trigger];
                    if (upgrade && !upgrade.bought) upgrade.buy();
                }, i * 300, i);
            }
            Game.Notify(p.name + ' misbrewed', 'Seasons fly around randomly and chaotically.', getIconArray(p), 6);
        }
    );
    def('poultice_of_overgrowth',
        function(p) {
            Game.killBuff('Poultice of Overgrowth (misbrewed)');
            Game.gainBuff('Poultice of Overgrowth', 1800, 2.0);
            Game.Notify(p.name + ' consumed', 'All reagents found will be doubled for 30 minutes!', getIconArray(p), 6);
        },
        function(p) {
            Game.killBuff('Poultice of Overgrowth');
            Game.gainBuff('Poultice of Overgrowth (misbrewed)', 3600, 0.5);
            Game.Notify(p.name + ' misbrewed', 'Reagent drop chance halved for 60 minutes.', getIconArray(p), 6);
        }
    );
    def('retort_of_logic',
        function(p) {
            var now = Date.now() / 1000, filled = 0;
            for (var i = 0; i < 3; i++) {
                if (!G.slots[i]) {
                    G.slots[i] = { potionId: 'elixir_of_chaos', startTime: now - 1, endTime: now - 1, reagents: [] };
                    filled++;
                }
            }
            PotionsM._refreshSlots(); PotionsM._renderSelectedReagents();
            Game.Notify(p.name + ' consumed', filled > 0 ? 'Placed ' + filled + ' Elixir(s) of Chaos in empty slots.' : 'No empty slots.', getIconArray(p), 6);
        },
        function(p) {
            var wiped = 0;
            for (var i = 0; i < 3; i++) { if (G.slots[i]) { G.slots[i] = null; wiped++; } }
            PotionsM._refreshSlots(); PotionsM._renderSelectedReagents();
            Game.Notify(p.name + ' misbrewed', 'All ' + wiped + ' slot(s) emptied.', getIconArray(p), 6);
        }
    );
    def('dew_of_secrets',
        function(p) {
            var emptySlot = -1;
            for (var i = 0; i < 3; i++) { if (!G.slots[i]) { emptySlot = i; break; } }
            if (emptySlot === -1) { Game.Notify(p.name + ' consumed', 'No empty brew slot available.', getIconArray(p), 6); return; }
            var now = Date.now() / 1000;
            G.slots[emptySlot] = { potionId: 'dew_discovering', startTime: now, endTime: now + 64800, reagents: [] };
            PotionsM._refreshSlots();
            Game.Notify(p.name + ' consumed', 'A long and painful discovery brew has begun.', getIconArray(p), 6);
        },
        function(p) {
            p.discovered = false; p.unlocked = false;
            var activePots = POTIONS.filter(isActivePotion);
            var newMap = generateRandomRecipes(activePots);
            applyRecipeMap(newMap);
            G.recipeMap = encodeRecipeMap(newMap, activePots);
            PotionsM._buildCatalog();
            Game.Notify(p.name + ' misbrewed', 'You have forgotten this potion. Its recipe has changed.', getIconArray(p), 6);
        }
    );

    def('syrup_of_insight',
        function(p) {
            PotionsM._clearReagentHighlights();
            
            var unknownPotions = POTIONS.filter(function(pot) { return isActivePotion(pot) && !pot.unlocked; });
            var candidates = [];
            
            for (var i = 0; i < unknownPotions.length; i++) {
                var pot = unknownPotions[i];
                var reagentIds = Object.keys(pot.reagents);
                if (reagentIds.length !== 3) continue;
                
                var allUnlocked = true;
                for (var j = 0; j < reagentIds.length; j++) {
                    var rDef = PotionsM._getReagentDef(reagentIds[j]);
                    if (!rDef || !rDef.unlocked) { allUnlocked = false; break; }
                }
                if (!allUnlocked) continue;
                
                var storedCount = 0;
                var storedReagents = [];
                var missingReagents = [];
                for (var j = 0; j < reagentIds.length; j++) {
                    var count = G.reagents[reagentIds[j]] || 0;
                    if (count > 0) { storedCount++; storedReagents.push(reagentIds[j]); }
                    else missingReagents.push(reagentIds[j]);
                }
                
                candidates.push({ storedCount: storedCount, stored: storedReagents, missing: missingReagents, all: reagentIds });
            }
            
            if (candidates.length === 0) {
                Game.Notify(p.name + ' consumed', 'No unknown potion can be made from unlocked ingredients.', getIconArray(p), 6);
                return;
            }
            
            candidates.sort(function(a, b) { return b.storedCount - a.storedCount; });
            var pick = candidates[0];
            var highlighted = [];
            
            if (pick.storedCount === 3) {
                highlighted = pick.stored.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 2);
            } else if (pick.storedCount === 2) {
                highlighted = pick.missing.slice();
                highlighted.push(pick.stored[Math.floor(Math.random() * pick.stored.length)]);
            } else if (pick.storedCount === 1) {
                highlighted = pick.missing.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 1);
                highlighted.push(pick.stored[0]);
            } else {
                highlighted = pick.all.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 2);
            }
            
            PotionsM._highlightReagents(highlighted, 60);
            Game.Notify(p.name + ' consumed', 'Reagents highlighted for 60 seconds.', getIconArray(p), 6);
        },
        function(p) {
            Game.gainBuff('Syrup of Insight (misbrewed)', 3600, 2.0);
            Game.Notify(p.name + ' misbrewed', 'Unknown potions take twice as long to test for the next hour.', getIconArray(p), 6);
        }
    );
})();

// =====================================================================
// State
// =====================================================================
var G = {
    slots: [null, null, null],   // brew slot contents: null or { potionId, startTime, endTime }
    reagents: {},                  // reagentId -> count
    maxReagents: 5,                // max storage per reagent
    selectedReagents: [],          // selected reagent IDs for brewing (max 3)
    highlightedReagents: [],       // reagent IDs currently highlighted by syrup_of_insight
    highlightEndTime: 0,           // timestamp when highlight expires
    highlightTimeout: null,        // timeout ID for clearing highlights
    unlockedReagents: {},         // reagentId >> true, permanently unlocked once first awarded
    totalReagentsCollected: 0,    // total reagents collected
    totalPotionsBrewed: 0,        // total successful potions brewed across all ascensions
    potionsBrewed: 0,             // potions brewed this ascension
    totalFailedDiscoveries: 0,    // total failed discoveries
    debugMode: false,             // debug mode flag
    prestigeCount: 0,             // total prestiges performed (unbounded)
    unlockedPrestige: [],         // IDs of prestige potions that have been unlocked
    recipeMap: null,              // encoded recipe map string; null = use fixed base recipes
    feverNightmareStart: 0,       // timestamp when fever nightmare started (for Fever without dawn achievement)
    craftsmanGrants: {},          // buildingIndex -> count granted by Blood of the Craftsman this ascension (max 50 per building)
    cadenceExtensions: {}         // buff.name -> seconds extended by Extract of Cadence (max 60 per buff type per ascension)
};

// =====================================================================
// Failed Mixture Types
// =====================================================================
var MIXTURE_TYPES = {
    useless: {
        id: 'useless',
        name: 'Useless mixture',
        desc: 'This combination produced nothing but an unstable and useless concoction, it doesn\'t appear any of the reagents combine at all. You can safely discard it.',
        flavor: 'I would not drink this if I was you, maybe make a note that this mixture wasn\'t a good idea.',
        icon: [33, 11, 'main']
    },
    promising: {
        id: 'promising',
        name: 'Promising mixture',
        desc: 'This combination proves promising! Maybe a small change would result in something more stable.',
        flavor: 'This potion bubbles differently than the others, hmm you might be onto something here, close but not quite there yet. Hey don\'t drink that!',
        icon: [32, 11, 'main']
    },
    very_promising: {
        id: 'very_promising',
        name: 'Very promising mixture',
        desc: 'This combination shows great promise! Multiple reagents combine and swirl together in graceful compatibility.',
        flavor: 'The mixture glows with an unusual intensity. Multiple paths to discovery lie before you.',
        icon: [32, 11, 'main']
    },
    extraordinary_promising: {
        id: 'extraordinary_promising',
        name: 'Extraordinarily promising mixture',
        desc: 'An extraordinary discovery! Every pair of ingredients hints at a different unknown potion. The possibilities are endless!',
        flavor: 'A truly remarkable concoction! You should probably make note of these combinations each pair begs for just a single change.',
        icon: [32, 11, 'main']
    }
};

// =====================================================================
// Helper Functions and other misc stuff
// =====================================================================
var PotionsM = {};
window.PotionsM = PotionsM; // expose so persistent check hook can find current instance after reloads
PotionsM._loading = false;
PotionsM._loadTimer = null;
PotionsM._potionsBrewedL = null;
PotionsM._syncBaselines = function(target) {
    var P = target || PotionsM;
    P._lastWrinklersPopped  = Game.wrinklersPopped  || 0;
    P._lastReindeerClicked  = Game.reindeerClicked  || 0;
    P._lastLumpsTotal       = Game.lumpsTotal       || 0;
    P._lastLumps            = Game.lumps            || 0;
    P._lastSeason           = Game.season           || '';
    P._lastDragonAura       = Game.dragonAura       || 0;
    P._lastDragonAura2      = Game.dragonAura2      || 0;
    P._lastDragonPet        = Game.lastClickedSpecialPic || 0;
    var TM = Game.Objects['Temple'] && Game.Objects['Temple'].minigame;
    P._lastPantheonSlots    = TM && TM.slot ? [TM.slot[0], TM.slot[1], TM.slot[2]] : [-1, -1, -1];
    var FM = Game.Objects['Farm']  && Game.Objects['Farm'].minigame;
    if (FM) P._lastGardenSoil = FM.soil || 0;
    var MM = Game.Objects['Bank']  && Game.Objects['Bank'].minigame;
    if (MM) P._lastBrokers = MM.brokers || 0;
};

PotionsM.updatePotionsBrewedDisplay = function() {
    if (!PotionsM._potionsBrewedL) return;
    var current = (typeof Beautify === 'function') ? Beautify(G.potionsBrewed) : '' + G.potionsBrewed;
    var total = (typeof Beautify === 'function') ? Beautify(G.totalPotionsBrewed) : '' + G.totalPotionsBrewed;
    PotionsM._potionsBrewedL.textContent = 'Potions consumed: ' + current + ' (total: ' + total + ')';
};
// Clear minigame hook flags so they re-register on each script reload
Game._potionsGardenHooked = false;
Game._potionsMarketHooked = false;
Game._potionsGrimoireHooked = false;
Game._potionsGrimoireLogicHooked = false;
Game._potionsTerminalHooked = false;
Game._potionsDownlineHooked = false;
Game._potionsCadenceCleanupHookRegistered = false;
PotionsM.parent = Game.Objects && Game.Objects['Alchemy lab'] ? Game.Objects['Alchemy lab'] : {
    id: 0,
    level: 10,
    minigameName: 'Potions class',
    minigameLoaded: false,
    minigameLoading: false,
    minigameDiv: null,
    l: null,
    refresh: function() {}
};

PotionsM.G = G;

if (Game.Objects && Game.Objects['Alchemy lab']) {
    PotionsM.parent.minigame = PotionsM;
}

// Temporary building name passed to customDesc during Suspension of Hallucinogenic gainBuff
var _suspBuildingKey = null;

// Get all seasonal drops from vanilla game arrays
PotionsM._getAllSeasonalDrops = function() {
    var seasonalDrops = [];
    if (Game.halloweenDrops) seasonalDrops = seasonalDrops.concat(Game.halloweenDrops);
    if (Game.easterEggs) seasonalDrops = seasonalDrops.concat(Game.easterEggs);
    if (Game.heartDrops) seasonalDrops = seasonalDrops.concat(Game.heartDrops);
    if (Game.reindeerDrops) seasonalDrops = seasonalDrops.concat(Game.reindeerDrops);
    return seasonalDrops;
};

PotionsM._getFortunes = function() {
    if (Game.Tiers && Game.Tiers['fortune'] && Game.Tiers['fortune'].upgrades) {
        return Object.values(Game.Tiers['fortune'].upgrades);
    }
    return [];
};

// Build the  styled fortune ticker HTML 
PotionsM._getFortuneTickerText = function(fortune) {
    var text = '';
    if (fortune === 'fortuneGC') {
        text = loc("Today is your lucky day!");
    } else if (fortune === 'fortuneCPS') {
        Math.seedrandom(Game.seed + '-fortune');
        text = loc("Your lucky numbers are:") + ' ' + Math.floor(Math.random() * 100) + ' ' + Math.floor(Math.random() * 100) + ' ' + Math.floor(Math.random() * 100) + ' ' + Math.floor(Math.random() * 100);
        Math.seedrandom();
    } else {
        var quote = fortune.desc || '';
        if (quote.indexOf('<q>') !== -1) {
            quote = quote.substring(quote.indexOf('<q>') + 3);
            if (quote.lastIndexOf('</q>') !== -1) quote = quote.substring(0, quote.lastIndexOf('</q>'));
        }
        text = fortune.name + ' : ' + quote;
    }
    return '<span class="fortune"><div class="icon" style="vertical-align:middle;display:inline-block;background-position:' + (-29*48) + 'px ' + (-8*48) + 'px;transform:scale(0.5);margin:-16px;position:relative;left:-4px;top:-2px;"></div>' + text + '</span>';
};

function $(id) { return document.getElementById(id); }

function getSupremeIntellectBonus() {
    var bonus = 0;
    if (Game.hasAura('Supreme Intellect')) bonus += 1;
    if (Game.hasAura('Reality Bending')) bonus += 0.1;
    return bonus;
}

function formatDuration(sec) {
    if (!sec || sec <= 0) return 'instant';
    if (sec < 60) return sec + ' second' + (sec !== 1 ? 's' : '');
    if (sec < 3600) {
        var m = Math.round(sec / 60);
        return m + ' minute' + (m !== 1 ? 's' : '');
    }
    var h = sec / 3600;
    var hStr = (h % 1 ? h.toFixed(1) : h);
    return hStr + ' hour' + (h !== 1 ? 's' : '');
}

function formatRemaining(sec) {
    sec = Math.max(0, Math.floor(sec));
    if (sec === 0) return '0s';
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var parts = [];
    if (h > 0) parts.push(h + 'h');
    if (m > 0) parts.push(m + 'm');
    if (s > 0 || parts.length === 0) parts.push(s + 's');
    return parts.join(' ');
}

function getSpriteSheet(sheetName) {
    return window.getSpriteSheet(sheetName);
}

function getPotionById(id) {
    for (var i = 0; i < POTIONS.length; i++) {
        if (POTIONS[i].id === id) return POTIONS[i];
    }
    return null;
}

// Returns true if the potion is active (not a locked prestige potion).
// Locked prestige potions don't exist for any game mechanic purpose.
function isActivePotion(p) {
    return !p.prestigeLocked;
}

// =====================================================================
// Recipe map encode / decode (15 bits per recipe packed into 2 bytes)
// =====================================================================
function encodeRecipeMap(recipeMap, activePotions) {
    var bits = [];
    var count = 0;
    for (var i = 0; i < activePotions.length; i++) {
        var recipe = recipeMap[activePotions[i].id];
        if (!recipe || recipe.length !== 3) continue;
        count++;
        var sorted = recipe.slice().sort(function(a, b) { return a - b; });
        for (var j = 0; j < 3; j++) {
            var v = sorted[j] & 0x1F;
            for (var k = 4; k >= 0; k--) bits.push((v >> k) & 1);
        }
    }
    while (bits.length % 8 !== 0) bits.push(0);
    var hex = ('0' + count.toString(16)).slice(-2);
    for (var i = 0; i < bits.length; i += 8) {
        var byte = 0;
        for (var j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
        hex += ('0' + byte.toString(16)).slice(-2);
    }
    return hex;
}

function decodeRecipeMap(hexStr, activePotions) {
    if (!hexStr || hexStr.length < 2) return {};
    var count = parseInt(hexStr.substring(0, 2), 16);
    var hexData = hexStr.substring(2);
    var bits = [];
    for (var i = 0; i < hexData.length; i += 2) {
        var byte = parseInt(hexData.substring(i, i + 2), 16);
        for (var k = 7; k >= 0; k--) bits.push((byte >> k) & 1);
    }
    var map = {};
    var bitIdx = 0;
    for (var i = 0; i < activePotions.length && i < count; i++) {
        var recipe = [];
        for (var j = 0; j < 3; j++) {
            var v = 0;
            for (var k = 0; k < 5; k++) v = (v << 1) | (bits[bitIdx++] || 0);
            recipe.push(v);
        }
        map[activePotions[i].id] = recipe.sort(function(a, b) { return a - b; });
    }
    return map;
}

// Generates a unique random recipe for every active potion.
// Uses a distribution-based approach for balanced reagent usage.
function generateRandomRecipes(activePotions) {
    var n = REAGENTS.length;
    var numPotions = activePotions.length;
    var totalSlots = numPotions * 3;

    // Calculate target usage per reagent (balanced with slight variance)
    var targets = [];
    var baseTarget = totalSlots / n;
    for (var ri = 0; ri < n; ri++) {
        // Add small random variance to targets for natural feel
        targets.push(Math.floor(baseTarget + (PotionsM._random() * 2 - 1)));
    }
    // Adjust targets to sum exactly to totalSlots
    var targetSum = 0;
    for (var ri = 0; ri < n; ri++) targetSum += targets[ri];
    var diff = totalSlots - targetSum;
    if (diff !== 0) {
        // Distribute the difference across reagents
        for (var ri = 0; ri < n && diff !== 0; ri++) {
            targets[ri] += (diff > 0 ? 1 : -1);
            diff += (diff > 0 ? -1 : 1);
        }
    }

    var uses = [];
    for (var ri = 0; ri < n; ri++) uses.push(0);

    var potionOrder = activePotions.slice();
    for (var i = potionOrder.length - 1; i > 0; i--) {
        var j = Math.floor(PotionsM._random() * (i + 1));
        var t = potionOrder[i]; potionOrder[i] = potionOrder[j]; potionOrder[j] = t;
    }

    var usedCombos = {};
    var map = {};

    // Precompute all possible 3-reagent combos
    var allCombos = [];
    for (var a = 0; a < n; a++)
        for (var b = a + 1; b < n; b++)
            for (var c = b + 1; c < n; c++)
                allCombos.push([a, b, c]);

    // Shuffle all combos
    for (var ci = allCombos.length - 1; ci > 0; ci--) {
        var cj = Math.floor(PotionsM._random() * (ci + 1));
        var ct = allCombos[ci]; allCombos[ci] = allCombos[cj]; allCombos[cj] = ct;
    }

    // Greedy assignment: pick combo that best balances reagent usage
    for (var pi = 0; pi < potionOrder.length; pi++) {
        var bestCombo = null;
        var bestScore = -Infinity;

        // Score each available combo based on how much it helps balance usage
        for (var ci = 0; ci < allCombos.length; ci++) {
            var combo = allCombos[ci];
            var key = combo.join(',');
            if (usedCombos[key]) continue;

            var score = 0;
            for (var rj = 0; rj < 3; rj++) {
                var ri = combo[rj];
                // Higher score for reagents that are further below target
                var deficit = targets[ri] - uses[ri];
                score += deficit;
            }
            // Slight randomness to break ties and add variety
            score += PotionsM._random() * 0.5;

            if (score > bestScore) {
                bestScore = score;
                bestCombo = combo;
            }
        }

        if (bestCombo) {
            var key = bestCombo.join(',');
            usedCombos[key] = true;
            map[potionOrder[pi].id] = bestCombo;
            for (var rj = 0; rj < 3; rj++) uses[bestCombo[rj]]++;
        } else {
            // Fallback: any unused combo
            for (var ci = 0; ci < allCombos.length; ci++) {
                var combo = allCombos[ci];
                var key = combo.join(',');
                if (!usedCombos[key]) {
                    usedCombos[key] = true;
                    map[potionOrder[pi].id] = combo;
                    for (var rj = 0; rj < 3; rj++) uses[combo[rj]]++;
                    break;
                }
            }
        }
    }

    return map;
}

// Writes decoded recipeMap indices back onto POTIONS[].reagents.
function applyRecipeMap(recipeMap) {
    for (var i = 0; i < POTIONS.length; i++) {
        var pot = POTIONS[i];
        if (pot.prestigeLocked) continue;
        var recipe = recipeMap[pot.id];
        if (!recipe || recipe.length !== 3) continue;
        var newR = {};
        for (var j = 0; j < 3; j++) {
            if (REAGENTS[recipe[j]]) newR[REAGENTS[recipe[j]].id] = 1;
        }
        pot.reagents = newR;
    }
}

function getUnlockedCount() {
    var n = 0;
    for (var i = 0; i < POTIONS.length; i++) {
        if (POTIONS[i].unlocked && isActivePotion(POTIONS[i])) n++;
    }
    return n;
}

// Returns count of active (non-locked-prestige) potions in the pool
function getActivePotionCount() {
    var n = 0;
    for (var i = 0; i < POTIONS.length; i++) { if (isActivePotion(POTIONS[i])) n++; }
    return n;
}

function getReagentUnlockedCount() {
    var n = 0;
    for (var i = 0; i < REAGENTS.length; i++) { if (REAGENTS[i].unlocked) n++; }
    return n;
}

function getPotionsUsingReagentHtml(reagentId) {
    var html = '';
    for (var i = 0; i < POTIONS.length; i++) {
        var p = POTIONS[i];
        if (!isActivePotion(p)) continue;
        if (p.reagents && p.reagents[reagentId]) {
            if (p.unlocked) {
                var sheetUrl = ICON_SHEETS[p.icon[2] || 'main'] || ICON_SHEETS.main;
                html += '<div class="shadowFilter" style="display:inline-block;transform:scale(0.5,0.5);margin:-20px -16px;width:48px;height:48px;background-image:url(' + sheetUrl + ');background-position:' + (-p.icon[0] * 48) + 'px ' + (-p.icon[1] * 48) + 'px;opacity:1;"></div>';
            } else {
                html += '<div class="shadowFilter" style="display:inline-block;transform:scale(0.5,0.5);margin:-20px -16px;width:48px;height:48px;background-image:url(' + ICON_SHEETS.main + ');background-position:0px -336px;opacity:0.35;"></div>';
            }
        }
    }
    return html || '<span style="font-size:11px;opacity:0.5;">None</span>';
}

function getDiscoverablePotionsCount() {
    // selectedReagents are already deducted from G.reagents but not yet committed to a brew, so add them back to get the true available supply
    var inStaging = {};
    for (var i = 0; i < G.selectedReagents.length; i++) {
        var rid = G.selectedReagents[i];
        inStaging[rid] = (inStaging[rid] || 0) + 1;
    }

    var count = 0;
    for (var i = 0; i < POTIONS.length; i++) {
        var p = POTIONS[i];
        if (!isActivePotion(p)) continue;
        if (!p.unlocked && !p.discovered) {
            var canBrew = true;
            for (var reagentId in p.reagents) {
                var required = p.reagents[reagentId];
                var available = (G.reagents[reagentId] || 0) + (inStaging[reagentId] || 0);
                if (available < required) {
                    canBrew = false;
                    break;
                }
            }
            if (canBrew) count++;
        }
    }
    return count;
}
// =====================================================================
// Custom buff types for potion effects
// =====================================================================
function createPotionBuffType(buffName, potionId, isMisbrewed, options) {
    options = options || {};
    var powerProp = options.powerProp || 'power';
    var onDie = options.onDie || null;
    var extraProps = options.extraProps || {};
    var customDesc = options.customDesc || null;
    var noPower = options.noPower || false;
    var aura = options.aura !== undefined ? options.aura : (isMisbrewed ? 2 : 1);

    new Game.buffType(buffName, function(time, mult, arg1, arg2, arg3) {
        var potion = getPotionById(potionId);
        var icon = [potion.icon[0], potion.icon[1], getSpriteSheet(potion.icon[2])];
        var base = {
            name: potion ? (isMisbrewed ? potion.name + ' (misbrewed)' : potion.name) : buffName,
            desc: customDesc ? customDesc(potion, mult, time, isMisbrewed, arg1, arg2, arg3) : (isMisbrewed ? potion.misbrew : potion.effect),
            icon: icon,
            time: time * Game.fps,
            add: true,
            aura: aura
        };
        if (!noPower) {
            base[powerProp] = mult;
        }
        if (onDie) {
            base.onDie = onDie;
        }
        for (var k in extraProps) {
            base[k] = extraProps[k];
        }
        // If arg1 is provided and extraProps has buildingName, use arg1 as buildingName
        // Make it non-enumerable to prevent conflicts with other mods that iterate over buff properties
        if (arg1 && extraProps.buildingName !== undefined) {
            Object.defineProperty(base, 'buildingName', {
                value: arg1,
                writable: true,
                enumerable: false,
                configurable: true
            });
        }
        return base;
    });
}

createPotionBuffType('Oil of Hephaestus', 'oil_of_hephaestus', false, { powerProp: 'multClick' });
createPotionBuffType('Oil of Hephaestus (misbrewed)', 'oil_of_hephaestus', true, { powerProp: 'multClick' });

createPotionBuffType('Serum of Progress', 'serum_of_progress', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Serum of Progress (misbrewed)', 'serum_of_progress', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });

createPotionBuffType('Concoction of the Mason', 'concoction_of_the_mason', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Concoction of the Mason (misbrewed)', 'concoction_of_the_mason', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });

createPotionBuffType('Arcana of the Finger', 'arcana_of_the_finger', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Arcana of the Finger (misbrewed)', 'arcana_of_the_finger', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Mercury of Age', 'mercury_of_age', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Mercury of Age (misbrewed)', 'mercury_of_age', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });

createPotionBuffType('Suspension of Hallucinogenic', 'suspension_of_hallucinogenic', false, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        var bn = _suspBuildingKey ? (Game.Objects[_suspBuildingKey] ? Game.Objects[_suspBuildingKey].name : _suspBuildingKey) : 'A random building';
        return bn + ' is more effective for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    extraProps: { buildingName: null },
    noPower: true
});
createPotionBuffType('Suspension of Hallucinogenic (misbrewed)', 'suspension_of_hallucinogenic', true, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        var bn = _suspBuildingKey ? (Game.Objects[_suspBuildingKey] ? Game.Objects[_suspBuildingKey].name : _suspBuildingKey) : 'A random building';
        return 'The effectiveness of ' + bn + ' is reduced by half for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    extraProps: { buildingName: null },
    noPower: true
});

createPotionBuffType('Bloom of Industry', 'bloom_of_industry', false, { noPower: true, onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Bloom of Industry (misbrewed)', 'bloom_of_industry', true, { noPower: true, onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });

createPotionBuffType('Tincture of Purpose', 'tincture_of_purpose', false, { powerProp: 'multCpS', onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Tincture of Purpose (misbrewed)', 'tincture_of_purpose', true, { powerProp: 'multCpS', onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Ambrosia of the Leech', 'ambrosia_of_the_leech', false);
createPotionBuffType('Nectar of Summoning', 'nectar_of_summoning', false);
createPotionBuffType('Nectar of Summoning (misbrewed)', 'nectar_of_summoning', true);
createPotionBuffType('Philter of Worms (misbrewed)', 'philter_of_worms', true);
createPotionBuffType('Emulsion of Sinful Greed', 'emulsion_of_sinful_greed', false, { noPower: true });
createPotionBuffType('Vitae of the Mother', 'vitae_of_the_mother', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Vitae of the Mother (misbrewed)', 'vitae_of_the_mother', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Infusion of Chance', 'infusion_of_chance', false);
createPotionBuffType('Infusion of Chance (misbrewed)', 'infusion_of_chance', true);

createPotionBuffType('Decoction of Winter', 'decoction_of_winter', false);
createPotionBuffType('Decoction of Winter (misbrewed)', 'decoction_of_winter', true, {
    onDie: function() {
        if (PotionsM._updateEffs) PotionsM._updateEffs();
        // vanilla really doesnt like shimmer timers to be set to infinite so in order to break it we just force spawn a reindeer onDie.
        if (Game.shimmerTypes && Game.shimmerTypes['reindeer'] && Game.season === 'christmas') {
            var newShimmer = new Game.shimmer('reindeer');
            newShimmer.spawnLead = 1;
        }
        // Also force spawn a lantern if in Lunar New Year season
        if (Game.shimmerTypes && Game.shimmerTypes['lantern'] && Game.season === 'lunarnewyear') {
            var newLantern = new Game.shimmer('lantern');
            newLantern.spawnLead = 1;
        }
    }
});
createPotionBuffType('Tonic of Ebisu', 'tonic_of_ebisu', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Tonic of Ebisu (misbrewed)', 'tonic_of_ebisu', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Distillate of Kala', 'distillate_of_kala', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Distillate of Kala (misbrewed)', 'distillate_of_kala', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Poison of the Matriarchs (misbrewed)', 'poison_of_the_matriarchs', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Salve of Fortune', 'salve_of_fortune', false);
createPotionBuffType('Toxin of Elders', 'toxin_of_elders', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Toxin of Elders (misbrewed)', 'toxin_of_elders', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Ether of Serendipity', 'ether_of_serendipity', false, { powerProp: 'multCpS', onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Ether of Serendipity (misbrewed)', 'ether_of_serendipity', true, { powerProp: 'multCpS', onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Corruption of Sin', 'corruption_of_sin', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Corruption of Sin (misbrewed)', 'corruption_of_sin', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Vapor of Luck', 'vapor_of_luck', false, { noPower: true, onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Vapor of Luck (misbrewed)', 'vapor_of_luck', true, { noPower: true });
createPotionBuffType('Venom of the Basilisk', 'venom_of_the_basilisk', false, { 
    onDie: function() { 
        // Restore wrinkler.sucked values by dividing by 1.1
        if (Game.wrinklers) {
            for (var i = 0; i < Game.wrinklers.length; i++) {
                if (Game.wrinklers[i].phase == 2) {
                    Game.wrinklers[i].sucked /= 1.1;
                }
            }
        }
        if (PotionsM._updateEffs) PotionsM._updateEffs(); 
    } 
});
createPotionBuffType('Ember of Dragon Fire', 'ember_of_dragon_fire', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Ember of Dragon Fire (misbrewed)', 'ember_of_dragon_fire', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Whisper of Boreas', 'whisper_of_boreas', false, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Breath of Growth', 'breath_of_growth', false);
createPotionBuffType('Whisper of Boreas (misbrewed)', 'whisper_of_boreas', true, { onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); } });
createPotionBuffType('Essence of Cheer', 'essence_of_cheer', false);
createPotionBuffType('Essence of Cheer (misbrewed)', 'essence_of_cheer', true);
createPotionBuffType('Spirit of Protection', 'spirit_of_protection', false);
createPotionBuffType('Draught of Urgency', 'draught_of_urgency', false, { noPower: true });
createPotionBuffType('Draught of Urgency (misbrewed)', 'draught_of_urgency', true, { noPower: true });
createPotionBuffType('Balm of Merlin', 'balm_of_merlin', false, { noPower: true });
createPotionBuffType('Balm of Merlin (misbrewed)', 'balm_of_merlin', true, { noPower: true });
createPotionBuffType('Cordial of Tyche', 'cordial_of_tyche', false, { noPower: true });
createPotionBuffType('Cordial of Tyche (misbrewed)', 'cordial_of_tyche', true, { noPower: true });
createPotionBuffType('Ointment of Plenty', 'ointment_of_plenty', false, { powerProp: 'mult' });
createPotionBuffType('Ointment of Plenty (misbrewed)', 'ointment_of_plenty', true, { powerProp: 'mult' });
createPotionBuffType('Syrup of Insight (misbrewed)', 'syrup_of_insight', true, { powerProp: 'mult' });
// =====================================================================
// Prestige potion buff types
// =====================================================================
createPotionBuffType('Oxymel of Insanity', 'oxymel_of_insanity', false, {
    powerProp: 'multCpS',
    customDesc: function(potion, mult, time) {
        return 'Every second CPS flips between either +100% or - 90% for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    onDie: function() { if (PotionsM._oxymeltTimer) clearInterval(PotionsM._oxymeltTimer); PotionsM._oxymeltTimer = null; if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Nepenthe of Undoing', 'nepenthe_of_undoing', false, {
    powerProp: 'multCpS',
    customDesc: function(potion, mult, time) {
        return 'CpS ×' + Math.round((mult||1)*10)/10 + ' for ' + Game.sayTime(time * Game.fps, -1) + '.';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Hydrosol of Refraction', 'hydrosol_of_refraction', false, {
    noPower: true,
    customDesc: function(potion, mult, time) {
        return 'Golden cookie clicks may echo for ' + Game.sayTime(time * Game.fps, -1) + '!';
    }
});
createPotionBuffType('Hydrosol of Refraction (misbrewed)', 'hydrosol_of_refraction', true, {
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Poultice of Overgrowth', 'poultice_of_overgrowth', false, {
    powerProp: 'mult',
    customDesc: function(potion, mult, time) {
        return 'Reagent drops are doubled for ' + Game.sayTime(time * Game.fps, -1) + '.';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Poultice of Overgrowth (misbrewed)', 'poultice_of_overgrowth', true, {
    powerProp: 'mult',
    customDesc: function(potion, mult, time, isMisbrewed) {
        return 'Reagent drop chance halved for ' + Game.sayTime(time * Game.fps, -1) + '.';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
// =====================================================================
// PotionsM.launch
// =====================================================================
PotionsM.launch = function() {
    var alchemyLab = Game.Objects['Alchemy lab'];
    PotionsM.name = (alchemyLab && alchemyLab.minigameName) || 'Potions Class';
    
    if (!G.reagents || Object.keys(G.reagents).length === 0) {
        G.reagents = {};
        for (var i = 0; i < REAGENTS.length; i++) {
            G.reagents[REAGENTS[i].id] = G.reagents[REAGENTS[i].id] || 0;
        }
    }
    if (!G.triedRecipes) G.triedRecipes = TriedRecipes.create();
    // Sync pre-unlocked reagents into unlockedReagents map
    if (!G.unlockedReagents) G.unlockedReagents = {};
    for (var i = 0; i < REAGENTS.length; i++) {
        if (REAGENTS[i].unlocked) G.unlockedReagents[REAGENTS[i].id] = true;
    }
    
    // Inject Essence of Cheer buff detection into computeSeasonPrices using eval
    // This works alongside Blackfriday's eval injection - both add code to the same function
    if (Game.computeSeasonPrices && !Game.computeSeasonPrices._essenceOfCheerInjected) {
        var funcStr = Game.computeSeasonPrices.toString();
        
        // Check if our code is already present to prevent double injection
        if (funcStr.indexOf("Game.hasBuff('Essence of Cheer')") !== -1) {
            Game.computeSeasonPrices._essenceOfCheerInjected = true;
        }
        
        // Inject Essence of Cheer check before the return statement
        var injection = "if(Game.hasBuff('Essence of Cheer'))m*=0.2;if(Game.hasBuff('Essence of Cheer (misbrewed)'))m*=4.0;";
        var returnPattern = "return Game.seasonTriggerBasePrice+Game.unbuffedCps*60*Math.pow(1.5,Game.seasonUses)*m;";
        
        if (funcStr.indexOf(returnPattern) !== -1) {
            funcStr = funcStr.replace(returnPattern, injection + returnPattern);
            Game.computeSeasonPrices = eval('(' + funcStr + ')');
            Game.computeSeasonPrices._essenceOfCheerInjected = true;
            
            try {
                Game.computeSeasonPrices();
            } catch (e) {}
        }
    }
    
    // Inject into Game.getVeilDefense to update tooltip with Spirit of Protection buff
    if (Game.getVeilDefense && !Game.getVeilDefense._spiritOfProtectionInjected) {
        var funcStr = Game.getVeilDefense.toString();
        
        if (funcStr.indexOf("Game.hasBuff('Spirit of Protection')") !== -1) {
            Game.getVeilDefense._spiritOfProtectionInjected = true;
        }
        
        var injection = "if(Game.hasBuff('Spirit of Protection'))return 0.9;";
        var returnPattern = "return n;";
        
        if (funcStr.indexOf(returnPattern) !== -1) {
            funcStr = funcStr.replace(returnPattern, injection + returnPattern);
            Game.getVeilDefense = eval('(' + funcStr + ')');
            Game.getVeilDefense._spiritOfProtectionInjected = true;
        }
    }
    
    PotionsM._registerHooks();
    PotionsM._syncBaselines();
};

// =====================================================================
// Assorted hooks
// =====================================================================
PotionsM._cleanupCadenceExtensions = function() {
    if (PotionsM._loading) return;
    for (var buffName in G.cadenceExtensions) {
        if (!Game.buffs[buffName]) {
            delete G.cadenceExtensions[buffName];
        }
    }
};

PotionsM._registerHooks = function() {
    try {
    if (!Game._potionsCadenceCleanupHookRegistered) {
        Game.registerHook('check', PotionsM._cleanupCadenceExtensions);
        Game._potionsCadenceCleanupHookRegistered = true;
    }

    if (!Game._potionsClickHookRegistered) {
        Game.registerHook('click', PotionsM._onCookieClick);
        Game._potionsClickHookRegistered = true;
    }
    
    // Hook into Game.magicCpS
    if (!Game._potionsMagicCpSHooked) {
        if (!Game._jneOriginalMagicCpSPotions) Game._jneOriginalMagicCpSPotions = Game.magicCpS;
        var wrapper = function(what) {
            var mult = Game._jneOriginalMagicCpSPotions.call(this, what);

            if (Game.hasBuff('Bloom of Industry')) {
                mult *= 1.1;
            }
            if (Game.hasBuff('Bloom of Industry (misbrewed)')) {
                mult *= 0.7;
            }

            var suspBuff = Game.hasBuff('Suspension of Hallucinogenic');
            if (suspBuff && suspBuff.buildingName === what) {
                mult *= 2.0;
            }
            var suspCurse = Game.hasBuff('Suspension of Hallucinogenic (misbrewed)');
            if (suspCurse && suspCurse.buildingName === what) {
                mult *= 0.5;
            }

            return mult;
        };
        Game.magicCpS = wrapper;
        Game._potionsMagicCpSHooked = true;
    }

    // Golden cookie pop modifications are now handled centrally in JustNaturalExpansion
    
    // Consolidated logic hooks
    if (!Game._potionsLogicHookRegistered) {
        Game.registerHook('logic', function() {
            // While loading, sync trackers to current state without awarding anything
            if (PotionsM._loading) {
                PotionsM._syncBaselines();
                return;
            }
            
            // Wrinkler pops sample_of_goo
            var wrinklers = Game.wrinklersPopped || 0;
            var wrinklerDelta = wrinklers - PotionsM._lastWrinklersPopped;
            if (wrinklerDelta > 0) {
                for (var k = 0; k < wrinklerDelta; k++) {
                    if (PotionsM.reagentRoll('sample_of_goo')) PotionsM._addReagent('sample_of_goo', 1, 'wrinkler');
                }
                PotionsM._lastWrinklersPopped = wrinklers;
            }
            
            // Reindeer clicks reindeer_fur
            var reindeer = Game.reindeerClicked || 0;
            var reindeerDelta = reindeer - PotionsM._lastReindeerClicked;
            if (reindeerDelta > 0) {
                for (var k = 0; k < reindeerDelta; k++) {
                    if (PotionsM.reagentRoll('reindeer_fur')) PotionsM._addReagent('reindeer_fur', 1, 'reindeer');
                }
                PotionsM._lastReindeerClicked = reindeer;
            }
            
            // Sugar lumps harvested pure_cane_sugar
            var lumpsTotal = Game.lumpsTotal || 0;
            var lumpsTotalDelta = lumpsTotal - PotionsM._lastLumpsTotal;
            if (lumpsTotalDelta > 0) {
                for (var k = 0; k < lumpsTotalDelta; k++) {
                    if (PotionsM.reagentRoll('pure_cane_sugar')) PotionsM._addReagent('pure_cane_sugar', 1, 'lump');
                }
                PotionsM._lastLumpsTotal = lumpsTotal;
            }
            
            // Sugar lumps spent pure_cane_sugar
            var lumps = Game.lumps || 0;
            var lumpsDelta = lumps - PotionsM._lastLumps;
            if (lumpsDelta < 0) {
                for (var k = 0; k < Math.abs(lumpsDelta); k++) {
                    if (PotionsM.reagentRoll('pure_cane_sugar')) PotionsM._addReagent('pure_cane_sugar', 1, 'lump');
                }
                PotionsM._lastLumps = lumps;
            } else {
                PotionsM._lastLumps = lumps;
            }
            
            // Season change  culture_of_time
            var season = Game.season || '';
            if (season !== PotionsM._lastSeason) {
                if (PotionsM.reagentRoll('culture_of_time')) PotionsM._addReagent('culture_of_time', 1, 'season');
                PotionsM._lastSeason = season;
            }
            
            // Dragon pet dragon_scales
            var petTime = Game.lastClickedSpecialPic || 0;
            if (petTime !== PotionsM._lastDragonPet) {
                if (PotionsM.reagentRoll('dragon_scales')) PotionsM._addReagent('dragon_scales', 1, 'dragon_pet');
                PotionsM._lastDragonPet = petTime;
            }
            
            // Dragon aura swap captured_auroras
            var aura1 = Game.dragonAura  || 0;
            var aura2 = Game.dragonAura2 || 0;
            if (aura1 !== PotionsM._lastDragonAura || aura2 !== PotionsM._lastDragonAura2) {
                if (PotionsM.reagentRoll('captured_auroras')) PotionsM._addReagent('captured_auroras', 1, 'dragon_aura');
                PotionsM._lastDragonAura  = aura1;
                PotionsM._lastDragonAura2 = aura2;
            }
            
            // Pantheon spirit swap divine_extraction
            var PM = Game.Objects['Temple'] && Game.Objects['Temple'].minigame;
            if (PM && PM.slot && Array.isArray(PM.slot) && PM.slot.length >= 3) {
                for (var s = 0; s < 3; s++) {
                    if (PM.slot[s] !== PotionsM._lastPantheonSlots[s]) {
                        if (PotionsM.reagentRoll('divine_extraction')) PotionsM._addReagent('divine_extraction', 1, 'pantheon');
                    }
                }
                PotionsM._lastPantheonSlots = [PM.slot[0], PM.slot[1], PM.slot[2]];
            }
        });
        Game._potionsLogicHookRegistered = true;
    }
    
    // Hook Grimoire castSpell for magical_infusion / magical_blight drops
    PotionsM._hookGrimoire();
    if (!Game._potionsGrimoireHooked) {
        Game.registerHook('check', function() {

            var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
            if (GM && GM.castSpell && !GM.castSpell._potionsHooked) PotionsM._hookGrimoire();
        });
    }
    
    // Hook Garden harvest for plant-based reagent drops/soil change tracking
    PotionsM._hookGarden();
    if (!Game._potionsGardenHooked) {
        Game.registerHook('check', function() {
            if (!Game._potionsGardenHooked) PotionsM._hookGarden();
        });
    }
    
    // Hook Stock Market buy/sell for distilled_greed drops
    PotionsM._hookMarket();
    if (!Game._potionsMarketHooked) {
        Game.registerHook('check', function() {
            if (!Game._potionsMarketHooked) PotionsM._hookMarket();
        });
    }
    
    // Hook Terminal programsRunTotal for technojuice drops
    PotionsM._hookTerminal();
    if (!Game._potionsTerminalHooked) {
        Game.registerHook('check', function() {
            if (!Game._potionsTerminalHooked) PotionsM._hookTerminal();
        });
    }
    
    // Hook Downline for extract_of_entrepreneurship drops
    Game.registerHook('check', function() {
        PotionsM._hookDownline();
    });

    // Random culture_of_time drop
    if (!Game._potionsCultureOfTimeHooked) {
        Game.registerHook('check', function() {
            if (PotionsM._loading) return;
            if (Math.random() < 1/7500) {
                PotionsM._addReagent('culture_of_time', 1, 'random');
            }
        });
        Game._potionsCultureOfTimeHooked = true;
    }

    // Vapor of Luck golden cookie spawn
    if (!Game._potionsVaporOfLuckHooked) {
        Game.registerHook('check', function() {
            if (PotionsM._loading) return;
            if (Game.hasBuff('Vapor of Luck') && Math.random() < 0.0125) {
                if (Game.shimmer) {
                    new Game.shimmer('golden', {noWrath: true});
                }
            }
        });
        Game._potionsVaporOfLuckHooked = true;
    }

    // Hook SpawnWrinkler for shiny wrinkler buff from Emulsion of Sinful Greed
    PotionsM._hookWrinklerSpawn();
    if (!Game._potionsWrinklerSpawnHooked) {
        Game.registerHook('check', function() {
            var PM = window.PotionsM;
            if (PM && !Game._potionsWrinklerSpawnHooked) PM._hookWrinklerSpawn();
        });
    }

    // Hook reset to prevent reagent awards during ascensions/resets Use window.PotionsM so this still works correctly after script reloads
    if (!Game._potionsResetHooked) {
        Game.registerHook('reset', function(hard) {
            var PM = window.PotionsM; if (!PM) return;
            PM._loading = true;
            if (PM._loadTimer) clearTimeout(PM._loadTimer);
            PM._loadTimer = setTimeout(function() {
                var PM2 = window.PotionsM; if (!PM2) return;
                PM2._syncBaselines(PM2);
                PM2._loading = false;
                PM2._loadTimer = null;
            }, 1500); //make sure we don't award reagents from loading for state shifts probably a better way but I hate CC loading and im tired of finding ways to get it to work right
        });
        Game._potionsResetHooked = true;
    }

    if (!Game._potionsTickerHooked) {
        if (Game.modHooks && Game.modHooks['ticker']) {
            Game.modHooks['ticker'].push(function() {
                var newsItems = [];
                var syrupOfInsight = getPotionById('syrup_of_insight');
                if (syrupOfInsight && !syrupOfInsight.discovered) {
                    var threshold = (G.prestigeCount > 0) ? (25 + (G.prestigeCount * 5)) : 20;
                    if (G.totalFailedDiscoveries > threshold) {
                        var reagentIds = Object.keys(syrupOfInsight.reagents);
                        var reagentQuips = {
                            'cats_whiskers': 'a pinch of whiskers',
                            'captured_auroras': 'a scoop of auroras',
                            'divine_extraction': 'a sprinkling of divine extract',
                            'nectar_of_effort': 'a dash of nectar',
                            'dragon_scales': 'some shimmering scales',
                            'rabbit_feet': 'one lucky rabbit foot',
                            'golden_flour': 'a cupful of flour',
                            'pure_cane_sugar': 'a barspoon of pure sugar',
                            'flower_petals': 'some fragrant petals',
                            'immortal_essence': 'one immortal drop',
                            'magical_infusion': 'a touch of magic',
                            'culture_of_time': 'a few well-aged seconds',
                            'reindeer_fur': 'a tuft of festive fur',
                            'distilled_greed': 'a small hint of greed',
                            'sample_of_goo': 'an ounce of goo',
                            'wrath_sugar': 'a bitter spoonful of wrath sugar',
                            'magical_blight': 'just a trace of magical blight',
                            'fungus_culture': 'one opinionated spore',
                            'terra': 'a clump of ambitious dirt',
                            'roots': 'a knot of hardy roots',
                            'extract_of_entrepreneurship': 'a splash of hustle',
                            'technojuice': 'a shot of technojuice'
                        };
                        var quips = [];
                        for (var i = 0; i < reagentIds.length; i++) {
                            var rId = reagentIds[i];
                            var rDef = PotionsM._getReagentDef(rId);
                            var quip = reagentQuips[rId] || ('some ' + (rDef ? rDef.name : rId));
                            quips.push(quip);
                        }
                        var recipeText = '';
                        if (quips.length === 3) {
                            recipeText = quips[0] + ', ' + quips[1] + ', and topping with ' + quips[2];
                        } else if (quips.length === 2) {
                            recipeText = quips[0] + ' and ' + quips[1];
                        } else if (quips.length === 1) {
                            recipeText = quips[0];
                        } else {
                            recipeText = quips.slice(0, -1).join(', ') + ', and ' + quips[quips.length - 1];
                        }
                        
                        var newsTemplates = [
                            'News : Latest alchemy craze sweeps blogosphere deemed "mostly edible"; recipe calls for ' + recipeText + '.',
                            'News : Miracle recipe hits trendy bakeries; officials question the use of ' + recipeText + '.',
							'News : Bakers alarmed by new potion fad involving ' + recipeText + ' "downright dangerous" claimed by many.',
                            'News : Alchemists defend controversial recipe involving ' + recipeText + ' "Look someone was going to do it eventually" says unnamed baker.'
                        ];
                        newsItems.push(newsTemplates[Math.floor(Math.random() * newsTemplates.length)]);
                    }
                }
                return newsItems;
            });
            Game._potionsTickerHooked = true;
        }
    }
    } catch(e) { console.error('[Potions] _registerHooks error:', e); }
};

PotionsM._hookTerminal = function() {
    var TM = Game.Objects['Javascript console'] && Game.Objects['Javascript console'].minigame;
    if (!TM) return;

    // If already hooked update reference
    if (TM.onExecuteComplete && TM.onExecuteComplete._potionsHooked) {
        TM.onExecuteComplete._potionsM = PotionsM;
        Game._potionsTerminalHooked = true;
        return;
    }

    TM.onExecuteComplete = function(count) {
        var TM = Game.Objects['Javascript console'].minigame;
        var PM = TM.onExecuteComplete._potionsM || PotionsM;
        if (PM._loading) return;
        for (var k = 0; k < count; k++) {
            if (PotionsM.reagentRoll('technojuice')) { PotionsM._addReagent('technojuice', 1, 'terminal'); }
        }
    };
    TM.onExecuteComplete._potionsHooked = true;
    TM.onExecuteComplete._potionsM = PotionsM;
    Game._potionsTerminalHooked = true;
};

PotionsM._hookDownline = function() {
    var fractalEngine = Game.Objects['Fractal engine'];
    var DM = fractalEngine && fractalEngine.minigame;
    if (!DM) return;

    // If already hooked update reference
    if (DM.onActionAdd && DM.onActionAdd._potionsHooked) {
        DM.onActionAdd._potionsM = PotionsM;
        Game._potionsDownlineHooked = true;
        return;
    }

    // Only set the callback if it's not already our hook
    if (!DM.onActionAdd || DM.onActionAdd.name !== 'potionsDownlineHook') {
        DM.onActionAdd = function potionsDownlineHook(count) {
            var DM = Game.Objects['Fractal engine'].minigame;
            var PM = DM.onActionAdd._potionsM || PotionsM;
            if (PM._loading) return;
            for (var k = 0; k < count; k++) {
                if (PotionsM.reagentRoll('extract_of_entrepreneurship')) { PotionsM._addReagent('extract_of_entrepreneurship', 1, 'downline'); break; }
            }
        };
        DM.onActionAdd._potionsHooked = true;
        DM.onActionAdd._potionsM = PotionsM;
    }
    Game._potionsDownlineHooked = true;

    // Register onRelease callback to drop a reagent on release
    if (!DM.onRelease || !DM.onRelease._potionsHooked) {
        var existingOnRelease = DM.onRelease;
        DM.onRelease = function() {
            if (existingOnRelease) existingOnRelease.apply(this, arguments);
            var PM = DM.onRelease._potionsM || PotionsM;
            if (!PM._loading) {
                PM._addReagent('extract_of_entrepreneurship', 1, 'downline_release');
            }
        };
        DM.onRelease._potionsHooked = true;
        DM.onRelease._potionsM = PotionsM;
    }
};

PotionsM._hookGarden = function() {
    var FM = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
    if (!FM || !FM.harvest) return;

    var FLOWERS  = {shimmerlily:1,nursetulip:1,chimerose:1,everdaisy:1,clover:1,goldenClover:1};
    var ROOTS    = {chocoroot:1,whiteChocoroot:1,queenbeet:1,queenbeetLump:1,duketater:1};
    var IMMORTAL = {elderwort:1,everdaisy:1};
    
    // If already hooked update reference
    if (FM.harvest && FM.harvest._potionsHooked) {
        FM.harvest._potionsM = PotionsM;
        Game._potionsGardenHooked = true;
        return;
    }
    if (!FM._jneOriginalHarvest) FM._jneOriginalHarvest = FM.harvest;
    var wrapper = function(x, y, manual) {
        var FM = Game.Objects['Farm'].minigame;
        var PM = FM.harvest._potionsM || PotionsM;
        var tile = FM.plot[y][x];
        var result = FM._jneOriginalHarvest.apply(this, arguments);
        if (PM._loading) return result;
        if (result && tile[0] > 0) {
            var me = FM.plantsById[tile[0] - 1];
            var key = me.key;
            var isMature = tile[1] >= me.mature;
            if (isMature) {
                var candidates = [];
                if (me.fungus && (G.reagents['fungus_culture'] || 0) < 5)    candidates.push('fungus_culture');
                if (FLOWERS[key] && (G.reagents['flower_petals'] || 0) < 5) candidates.push('flower_petals');
                if (ROOTS[key] && (G.reagents['roots'] || 0) < 5)   candidates.push('roots');
                if (IMMORTAL[key] && (G.reagents['immortal_essence'] || 0) < 5)candidates.push('immortal_essence');
                if ((G.reagents['terra'] || 0) < 5) candidates.push('terra');
                PotionsM.reagentRollOne(candidates, 'garden');
            }
        }
        return result;
    };
    FM.harvest = wrapper;

    // Track soil changes for terra
    PotionsM._lastGardenSoil = FM.soil || 0;
    Game.registerHook('logic', function() {
        if (PotionsM._loading) return;
        var FM2 = Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
        if (!FM2) return;
        var soil = FM2.soil || 0;
        if (soil !== PotionsM._lastGardenSoil) {
            for (var x = 0; x < 15; x++) { //soil changes get X extra rolls
                if (PotionsM.reagentRoll('terra')) { PotionsM._addReagent('terra', 1, 'soil_change'); break; }
            }
            PotionsM._lastGardenSoil = soil;
        }
    });
    
    FM.harvest._potionsHooked = true;
    FM.harvest._potionsM = PotionsM;
    Game._potionsGardenHooked = true;
};

PotionsM._hookMarket = function() {
    var MM = Game.Objects['Bank'] && Game.Objects['Bank'].minigame;
    if (!MM || !MM.buyGood || !MM.sellGood) return;

    // If already hooked, update closure references
    if (MM.buyGood && MM.buyGood._potionsHooked) {
        MM.buyGood._potionsM = PotionsM;
        MM.sellGood._potionsM = PotionsM;
        Game._potionsMarketHooked = true;
        return;
    }

    if (!MM._jneOriginalBuyGood) MM._jneOriginalBuyGood = MM.buyGood;
    var wrapperBuy = function(id, n) {
        var MM = Game.Objects['Bank'].minigame;
        var PM = MM.buyGood._potionsM || PotionsM;
        var me = MM.goodsById[id];
        var before = me ? me.stock : 0;
        var result = MM._jneOriginalBuyGood.apply(this, arguments);
        if (PM._loading) return result;
        if (result && me) {
            var shares = me.stock - before;
            for (var k = 0; k < shares; k++) {
                if (PotionsM.reagentRoll('distilled_greed')) { PotionsM._addReagent('distilled_greed', 1, 'market_buy'); break; }
            }
        }
        return result;
    };
    wrapperBuy._potionsHooked = true;
    wrapperBuy._potionsM = PotionsM;
    MM.buyGood = wrapperBuy;

    if (!MM._jneOriginalSellGood) MM._jneOriginalSellGood = MM.sellGood;
    var wrapperSell = function(id, n) {
        var MM = Game.Objects['Bank'].minigame;
        var PM = MM.sellGood._potionsM || PotionsM;
        var me = MM.goodsById[id];
        var before = me ? me.stock : 0;
        var result = MM._jneOriginalSellGood.apply(this, arguments);
        if (PM._loading) return result;
        if (result && me) {
            var shares = before - me.stock;
            for (var k = 0; k < shares; k++) {
                if (PotionsM.reagentRoll('distilled_greed')) { PotionsM._addReagent('distilled_greed', 1, 'market_sell'); break; }
            }
        }
        return result;
    };
    wrapperSell._potionsM = PotionsM;
    MM.sellGood = wrapperSell;

    // Track broker hires via logic hook delta — 1000 rolls per broker hired
    PotionsM._lastBrokers = MM.brokers || 0;
    Game.registerHook('logic', function() {
        if (PotionsM._loading) return;
        var MM2 = Game.Objects['Bank'] && Game.Objects['Bank'].minigame;
        if (!MM2) return;
        var brokers = MM2.brokers || 0;
        var delta = brokers - PotionsM._lastBrokers;
        if (delta > 0) {
            for (var k = 0; k < delta * 1000; k++) { //hiring a broker gets 1000 rolls
                if (PotionsM.reagentRoll('distilled_greed')) { PotionsM._addReagent('distilled_greed', 1, 'broker'); break; }
            }
            PotionsM._lastBrokers = brokers;
        }
    });

    MM.buyGood._potionsHooked = true;
    MM.buyGood._potionsM = PotionsM;
    MM.sellGood._potionsM = PotionsM;
    Game._potionsMarketHooked = true;
};

PotionsM._hookGrimoire = function() {
    var GM = Game.Objects['Wizard tower'] && Game.Objects['Wizard tower'].minigame;
    if (!GM || !GM.castSpell) return;

    // Wrap castSpell if it is not already wrapped by us, and always update the current PotionsM reference
    if (!GM.castSpell._potionsHooked) {

        var originalCastSpell = GM.castSpell;
        var wrapper = function(spell, obj) {
            var GM = Game.Objects['Wizard tower'].minigame;
            var PM = GM.castSpell._potionsM || PotionsM;
            if (!Game._potionsGrimoireReady) return originalCastSpell.apply(this, arguments);
            // Detect misbrew by temporarily wrapping spell.fail and spell.win
            var origFail = spell.fail;
            var origWin  = spell.win;
            PM._grimoireLastFail = null;
            if (origFail) {
                spell.fail = function() { PM._grimoireLastFail = true;  return origFail.apply(this, arguments); };
            }
            if (origWin) {
                spell.win  = function() { PM._grimoireLastFail = false; return origWin.apply(this, arguments); };
            }
            var result = originalCastSpell.apply(this, arguments);
            if (origFail) spell.fail = origFail;
            if (origWin)  spell.win  = origWin;
            if (PM._loading) return result;
            if (result === true && PM._grimoireLastFail !== null) {
                if (PM._grimoireLastFail) {
                    if (PotionsM.reagentRoll('magical_blight')) PotionsM._addReagent('magical_blight', 1, 'grimoire_misbrew');
                } else {
                    if (PotionsM.reagentRoll('magical_infusion')) PotionsM._addReagent('magical_infusion', 1, 'grimoire_success');
                }
            }
            return result;
        };
        GM.castSpell = wrapper;
        GM.castSpell._potionsHooked = true;
    }
    GM.castSpell._potionsM = PotionsM;
    Game._potionsGrimoireHooked = true;

    // Hook into grimoire logic to modify mana regen for Balm of Merlin
    if (GM.logic && !GM.logic._potionsLogicHooked) {
        // An existing wrapper from a previous load does not have _potionsLogicHooked; mark it instead of double-wrapping
        if (GM.logic._original && typeof GM.logic._original === 'function' && GM.logic._original !== GM.logic) {
            GM.logic._potionsLogicHooked = true;
        } else {
            var wrapper2 = function() {
                var GM = Game.Objects['Wizard tower'].minigame;
                var balmBuff = Game.hasBuff('Balm of Merlin');
                var balmCurse = Game.hasBuff('Balm of Merlin (misbrewed)');
                var multiplier = balmBuff ? 2 : (balmCurse ? 0.5 : 1);

                // Call original logic first
                if (wrapper2._original) wrapper2._original.apply(this, arguments);

                // Check if heavenlyUpgrades has added a tower level bonus
                var hasWizardlyBonus = Game.Has && Game.Has('Wizardly accomplishments');
                var towerLevel = hasWizardlyBonus ? Math.min(GM.parent.level, 20) : 0;
                var wizardlyBonus = hasWizardlyBonus ? (towerLevel * 0.001) / Game.fps : 0;

                // Add heavenlyUpgrades bonus first
                GM.magicPS += wizardlyBonus;

                // Apply Balm of Merlin multiplier to mana regen
                if (multiplier !== 1) {
                    GM.magicPS *= multiplier;
                }
            };
            wrapper2._original = GM.logic;
            wrapper2._potionsLogicHooked = true;
            GM.logic = wrapper2;
        }
        Game._potionsGrimoireLogicHooked = true;
    }

    Game._potionsGrimoireHooked = true;
    setTimeout(function() { Game._potionsGrimoireReady = true; }, 0);
};

PotionsM._hookWrinklerSpawn = function() {
    if (!Game.SpawnWrinkler) return;

    // If already hooked update reference
    if (Game.SpawnWrinkler._potionsHooked) {
        Game.SpawnWrinkler._potionsM = PotionsM;
        Game._potionsWrinklerSpawnHooked = true;
        return;
    }

    if (!Game._jneOriginalSpawnWrinklerPotions) Game._jneOriginalSpawnWrinklerPotions = Game.SpawnWrinkler;
    var wrapper = function() {
        var me = Game._jneOriginalSpawnWrinklerPotions.apply(this, arguments);
        if (me && me.type === 0 && Game.buffs['Emulsion of Sinful Greed']) {
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
                            hasShiny = true; break;
                        }
                    }
                }
                if (hasShiny) mult *= 5.0;
            }
            mult *= 3.0;
            var p = base * mult;
            if (Math.random() < p) me.type = 1;
        }
        return me;
    };
    wrapper._potionsHooked = true;
    wrapper._potionsM = PotionsM;
    Game.SpawnWrinkler = wrapper;
    Game._potionsWrinklerSpawnHooked = true;
};

PotionsM.dragonBoostTooltip = function() {
    var bonus = getSupremeIntellectBonus();
    if (bonus === 0) return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>Supreme Intellect</b><div class="line"></div>No aura bonus active for reagent drops.</div>';
    var percent = (bonus * 10) + '%';
    return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>Supreme Intellect</b><div class="line"></div>Reagent drop rates increased by ' + percent + '.</div>';
};

// =====================================================================
// PotionsM.init — builds DOM
// =====================================================================
PotionsM.init = function(div) {
    if (!div) return;
    PotionsM.div = div;

    var resPath = Game.resPath || 'https://orteil.dashnet.org/cookieclicker/';
    var spellBG = resPath + 'img/spellBG.png';

    var styleId = 'potions-minigame-style';
    var oldStyle = document.getElementById(styleId);
    if (oldStyle) oldStyle.remove();
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
    /* === layout wrapper === */
    '#potions-bg{background:url(' + resPath + 'img/shadedBorders.png),url(' + resPath + 'img/BGmarket.jpg);background-size:100% 100%,auto;position:absolute;inset:0;bottom:16px;pointer-events:none;}','#potions-wrap{box-sizing:border-box;max-width:1200px;width:100%;margin:0 auto;padding:8px;position:relative;background:transparent;overflow:visible;container-type:inline-size;container-name:potions-wrap;}','#potions-drag{position:absolute;inset:0;z-index:1000000000000;pointer-events:none;} #potions-drag .potions-brew-tile{position:absolute;inset:0;}','#potions-wrap .potions-main{display:flex;flex-direction:column;gap:10px;align-items:stretch;}',
    /* === sections === */
    '.potions-slots-section,.potions-reagents-section{flex:1;display:flex;flex-direction:column;}','.potions-brew-slots{display:flex;flex-wrap:nowrap;gap:6px;align-items:center;justify-content:center;min-width:198px;}','.potions-brew-content{display:flex;gap:0;align-items:stretch;min-height:104px;}','.potions-brew-half{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:4px;}','.potions-brew-selection{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:6px;width:100%;}','.potions-selected-reagents{display:flex;gap:6px;align-items:center;justify-content:center;}','.potions-selected-reagent{cursor:pointer;display:inline-block;width:40px;height:40px;position:relative;}','.potions-selected-reagent-icon,.potions-catalog-seed-icon,.potions-reagent-item-icon{pointer-events:none;display:inline-block;position:absolute;left:-4px;top:-4px;width:48px;height:48px;background-repeat:no-repeat;}','.potions-reagent-slot-outline{display:inline-block;width:40px;height:40px;border:2px dashed rgba(255,255,255,0.25);border-radius:4px;box-sizing:border-box;}','@container potions-wrap (max-width:400px){.potions-brew-content{flex-direction:column;}}',
    /*=== Brew tiles ===*/
    '.potions-brew-tile{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0 0 4px #000,0 0 6px #000;font-weight:bold;font-size:12px;flex-shrink:0;width:60px;height:74px;background:url(' + spellBG + ');}','.potions-brew-tile.ready{color:rgba(255,255,255,0.8);opacity:1;} .potions-brew-tile.ready:hover{color:#fff;}','.potions-brew-tile:hover{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;} .potions-brew-tile:active{top:1px;}','.potions-brew-tile0{background-position:0 0;} .potions-brew-tile0:hover,.potions-brew-tile0.hovered{background-position:0 -74px;} .potions-brew-tile0:active{background-position:0 74px;}','.potions-brew-tile1{background-position:-60px 0;} .potions-brew-tile1:hover,.potions-brew-tile1.hovered{background-position:-60px -74px;} .potions-brew-tile1:active{background-position:-60px 74px;}','.potions-brew-tile2{background-position:-120px 0;} .potions-brew-tile2:hover,.potions-brew-tile2.hovered{background-position:-120px -74px;} .potions-brew-tile2:active{background-position:-120px 74px;}','.potions-brew-tile.hovered{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}','.potions-brew-tile-content{width:60px;height:74px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;}','.potions-tile-icon{pointer-events:none;width:48px;height:48px;opacity:0.8;background-repeat:no-repeat;position:relative;z-index:1;}','.potions-brew-tile.ready .potions-tile-icon{opacity:1;} .potions-brew-tile.ready:hover .potions-tile-icon{animation:bounce 0.8s;}','.noFancy .potions-brew-tile.ready:hover .potions-tile-icon{animation:none;}','.potions-brewing-overlay{position:absolute;inset:0;width:60px;height:74px;pointer-events:none;background:url(' + Game.resPath + 'img/pieFill.png) no-repeat;background-size:1080px 592px;opacity:0.6;z-index:2;}','.potions-slots-hint{font-size:10px;color:rgba(255,255,255,0.35);text-align:center;margin-top:4px;font-style:italic;}','#potionsPotionsBrewed{margin:14px auto 0;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}',
    /* === catalog column === */
    '.potions-mid-col{flex:1;min-width:180px;display:flex;flex-direction:column;}','.potions-catalog-seed,.potions-reagent-item{cursor:pointer;display:inline-block;width:40px;height:40px;position:relative;margin:1px 8px 8px 1px;}','.potions-catalog-seed.undiscovered{opacity:0;pointer-events:none;cursor:default;}','.potions-catalog-seed:hover .potions-catalog-seed-icon{animation:bounce 0.8s;z-index:1000000001;} .potions-catalog-seed:active .potions-catalog-seed-icon{animation:pucker 0.2s;}','.noFancy .potions-catalog-seed:hover .potions-catalog-seed-icon,.noFancy .potions-catalog-seed:active .potions-catalog-seed-icon,.noFancy .potions-reagent-item:hover .potions-reagent-item-icon,.noFancy .potions-reagent-item:active .potions-reagent-item-icon{animation:none;}','.potions-catalog-seed.on:before{pointer-events:none;content:\'\';display:block;position:absolute;left:-10px;top:-10px;width:60px;height:60px;background:url(' + resPath + 'img/selectTarget.png);animation:wobble 0.2s ease-out;z-index:10;}',
    /* === reagents column === */
    '#potions-reagents-list{display:flex;flex-wrap:wrap;gap:0;padding:2px 20px 20px 2px;}','.potions-reagent-item.empty .potions-reagent-item-icon{opacity:0.2;} .potions-reagent-item:hover .potions-reagent-item-icon{animation:bounce 0.8s;} .potions-reagent-item:active .potions-reagent-item-icon{animation:pucker 0.2s;}','.potions-reagent-item .potions-reagent-shine{pointer-events:none;display:none;position:absolute;left:-12px;top:-12px;width:64px;height:64px;background:url(https://orteil.dashnet.org/cookieclicker/img/shine.png);background-size:64px 64px;z-index:0;opacity:0.4}','.potions-reagent-item.highlighted .potions-reagent-shine{display:block;animation:spin 4s linear infinite;} .potions-reagent-item.highlighted .potions-reagent-item-icon{z-index:1;position:relative;}',
    /* === icon base === */
    '.potions-icon{display:inline-block;width:48px;height:48px;background-repeat:no-repeat;pointer-events:none;}',
    /* === section labels === */
    '.gardenPanelLabel{font-size:12px;width:100%;padding:2px;margin-top:4px;margin-bottom:-4px;text-align:center;}',
    /* === responsive === */
    '@container potions-wrap (max-width:649px){#potions-wrap .potions-main{flex-direction:column;}#potions-wrap .potions-left-col{flex:1 1 auto;width:100%;flex-direction:column;min-width:0;}#potions-wrap .potions-brew-slots{flex-direction:row;flex-wrap:wrap;justify-content:flex-start;}#potions-wrap .potions-mid-col{min-width:0;width:100%;}}']
    .join('');
    document.head.appendChild(style);

    var slotsHtml = '';
    for (var si = 0; si < 3; si++) {
        slotsHtml += '<div class="potions-brew-tile potions-brew-tile' + si + '" id="potionsSlot' + si + '"><div class="potions-brew-tile-content" id="potionsSlotContent' + si + '"></div></div>';
    }

    var prestigeBtnHtml = '<div id="potions-prestige-btn" style="display:none;position:absolute;bottom:14px;right:14px;z-index:10;cursor:pointer;width:24px;height:24px;overflow:hidden;">'
        + '<div style="width:48px;height:48px;background-image:url(https://orteil.dashnet.org/cookieclicker/img/icons.png);background-position:-480px -528px;transform:scale(0.5);transform-origin:top left;opacity:0.6;"></div>'
        + '</div>';
    div.innerHTML = '<div id="potions-bg"></div><div id="potions-wrap" style="position:relative;">'
        + '<div class="potions-main"><div class="potions-slots-section"><div class="potions-brew-content"><div class="potions-brew-half"><div class="potions-brew-slots" id="potions-brew-slots">' + slotsHtml + '</div><div id="potionsPotionsBrewed"></div></div><div class="potions-brew-half"><div class="potions-brew-selection"><div class="potions-selected-reagents" id="potions-selected-reagents"></div><div class="potions-brew-actions" id="potions-brew-actions"></div></div></div></div></div>'
        + '<div class="potions-reagents-section framed"><div id="potions-reagents-label" class="title gardenPanelLabel">Reagents Discovered (' + getReagentUnlockedCount() + '/' + REAGENTS.length + ')</div><div class="line"></div><div id="potions-reagents-list"></div><div id="potions-discoverable-label" style="margin-top:-10px;text-align:center;font-size:11px;opacity:0.8;"></div></div>'
        + '<div class="potions-mid-col"><div class="potions-catalog-section framed"><div id="potions-catalog-label" class="title gardenPanelLabel">Potions Book</div><div class="line"></div><div id="potions-catalog-grid"></div></div></div>'
        + '</div>'
        + prestigeBtnHtml
        + '</div>';

    PotionsM._buildCatalog();
    PotionsM._buildReagents();
    PotionsM._refreshSlots();
    PotionsM._renderSelectedReagents();
    PotionsM._checkPrestigeButton();


    PotionsM._potionsBrewedL = l('potionsPotionsBrewed');
    PotionsM.updatePotionsBrewedDisplay();

    // Wire prestige button — bare icon click → Game.Prompt (vanilla Ascend layout)
    var prestigeBtn = $('potions-prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', function() {
            var remaining = 10 - ((G.unlockedPrestige && G.unlockedPrestige.length) || 0);
            var prestigeNote = '';
            if (remaining > 0) {
                if (G.prestigeCount === 0) {
                    prestigeNote = '<br><br>Each fever nightmare permanently adds one new powerful prestige potion to the discovery pool. There are <b>10</b> prestige potions remaining to unlock.';
                } else {
                    prestigeNote = '<br><br>There ' + (remaining === 1 ? 'is <b>1</b> more prestige potion' : 'are <b>' + remaining + '</b> more prestige potions') + ' to unlock.';
                }
            }
            var drinkBtnStyle = 'margin:16px;padding:8px 16px;animation:rainbowCycle 5s infinite ease-in-out,pucker 0.2s ease-out;box-shadow:0px 0px 0px 1px #000,0px 0px 1px 2px currentcolor;background:linear-gradient(to bottom,transparent 0%,currentColor 500%);width:auto;text-align:center;';
            var drinkBtnHtml = '<div class="optionBox"><a class="option smallFancyButton" style="' + drinkBtnStyle + '" onclick="Game.ClosePrompt();if(window.PotionsM)PotionsM._performPrestige();">Enter Fever Nightmare</a></div>';
            Game.Prompt(
                '<h3>Fever Nightmare</h3>'
                + '<div class="block">'
                + 'Combine everything randomly and chaotically, reagents, potions, and strange debris recovered from beneath the couch. Disregard safety entirely, throw common sense into the nearest fire, and charge ahead with reckless confidence. This is an exceptionally bad idea.'
                + '<br><br>'
                + 'You will slip into a deep fever nightmare. When you awaken, all <b>discovered potions will be forgotten</b>, all brewed potions will be lost, and every <b>recipe will be randomized</b>.<br><br>Your unlocked reagents and stores will remain untouched.'
                + prestigeNote
                + drinkBtnHtml
                + '</div>',
                [['Yes', 'Game.ClosePrompt();if(window.PotionsM)PotionsM._performPrestige();', 'float:left;display:none;'], ['Cancel', 0, 'float:right']]
            );
        });
    }

    // Add click handlers and tooltips to slots
    for (var si = 0; si < 3; si++) {
        (function(idx) {
            var slotEl = $('potionsSlot' + idx);
            if (slotEl) {
                slotEl.addEventListener('click', function() {
                    PotionsM._usePotionSlot(idx);
                });
                PotionsM._addTooltip(slotEl, PotionsM.slotTooltip(idx), 'this');
            }
        })(si);
    }

    PotionsM.launched = true;
    
    // Defer achievement creation 
    setTimeout(function() {
        if (createPotionsAchievements) createPotionsAchievements();
    }, 0);
};

// =====================================================================
// Icon builder 
// =====================================================================
var ICON_SHEETS = {};
Object.defineProperty(ICON_SHEETS, 'main', {
    get: function() { return getSpriteSheet('main'); }
});
Object.defineProperty(ICON_SHEETS, 'garden', {
    get: function() { return getSpriteSheet('garden'); }
});
Object.defineProperty(ICON_SHEETS, 'custom', {
    get: function() { return getSpriteSheet('custom'); }
});

PotionsM._makeIcon = function(col, row, sheet, size) {
    size = size || 48;
    var sheetName = sheet || 'custom';
    var sheetUrl = ICON_SHEETS[sheetName] || ICON_SHEETS.custom;
    var el = document.createElement('span');
    el.className = 'potions-icon';
    el.style.backgroundImage = 'url(' + sheetUrl + ')';
    el.style.backgroundPosition = (-col * 48) + 'px ' + (-row * 48) + 'px';
    if (size !== 48) {
        el.style.width = size + 'px';
        el.style.height = size + 'px';
    }
    return el;
};

// =====================================================================
// Tooltip helpers
// =====================================================================
PotionsM._addTooltip = function(el, htmlFn, side) {
    side = side || 'bottom';
    if (Game.tooltip && Game.tooltip.draw) {
        el.addEventListener('mouseenter', function() {
            Game.tooltip.dynamic = 1;
            Game.tooltip.draw(el, htmlFn, side);
            if (Game.tooltip.wobble) Game.tooltip.wobble();
        });
        el.addEventListener('mouseleave', function() {
            Game.tooltip.shouldHide = 1;
        });
    }
};

PotionsM.slotTooltip = function(slot) {
    return function() {
        var brew = G.slots[slot];
        var str = '<div style="padding:8px 4px;min-width:350px;" id="tooltipPotionsSlot">';
        
        // Helper to generate ingredients HTML
        var getIngredientsHtml = function(reagents) {
            if (!reagents || reagents.length === 0) return '';
            var ingredientsHtml = [];
            for (var ri = 0; ri < reagents.length; ri++) {
                var rId = reagents[ri];
                var rDef = PotionsM._getReagentDef(rId);
                if (rDef) {
                    var sheetUrl = ICON_SHEETS[rDef.icon[2] || 'main'] || ICON_SHEETS.main;
                    ingredientsHtml.push('<div class="shadowFilter" style="display:inline-block;transform:scale(0.5,0.5);margin:-20px -13px;width:48px;height:48px;background-image:url(' + sheetUrl + ');background-position:' + (-rDef.icon[0] * 48) + 'px ' + (-rDef.icon[1] * 48) + 'px;"></div>');
                }
            }
            return '<div class="line"></div><div style="padding-top:8px;"><small><b>Ingredients used:</b> ' + ingredientsHtml.join('') + '</small></div>';
        };
        
        if (!brew) {
            str += '<div class="name">Brew slot ' + (slot + 1) + '</div><div class="line"></div><div class="description">Select three reagents to begin brewing a potion. You may use the potions book to find a potion you already know, or mix reagents together to try and discover new potions.</div>';
        } else if (MIXTURE_TYPES[brew.potionId]) {
            var mixture = MIXTURE_TYPES[brew.potionId];
            var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-mixture.icon[0] * 48) + 'px ' + (-mixture.icon[1] * 48) + 'px;';
            var sheetUrl = ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main;
            iconStyle += 'background-image:url(' + sheetUrl + ');';
            str += '<div class="icon" style="' + iconStyle + '"></div>';
            str += '<div class="name">' + mixture.name + '</div><div class="line"></div><div class="description">' + mixture.desc + '</div>';
            str += getIngredientsHtml(brew.reagents);
            str += '<q>' + mixture.flavor + '</q>';
        } else {
            var p = brew.potionId === 'dew_discovering' ? getPotionById('dew_of_secrets') : getPotionById(brew.potionId);
            var remaining = Math.max(0, brew.endTime - Date.now() / 1000);
            if (p) {
                var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-p.icon[0] * 48) + 'px ' + (-p.icon[1] * 48) + 'px;';
                if (p.icon[2] && p.icon[2] !== 'main') {
                    var sheetUrl = ICON_SHEETS[p.icon[2]] || ICON_SHEETS.main;
                    iconStyle += 'background-image:url(' + sheetUrl + ');';
                }
                str += '<div class="icon" style="' + iconStyle + '"></div>';
            } else if (brew.potionId === 'discovering') {
                var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:0px -336px;';
                iconStyle += 'background-image:url(' + ICON_SHEETS.main + ');';
                str += '<div class="icon" style="' + iconStyle + '"></div>';
            }
            if (brew.potionId === 'dew_discovering') {
                str += '<div class="name">Dew of Secrets (Steeping)</div>';
                str += remaining > 0
                    ? '<div class="description">Dew of Secrets is steeping a new potion it will appear here when ready.<br><br>Remaining: <span class="green">' + formatRemaining(remaining) + '</span></div>'
                    : '<div class="description"><span class="green">Brew complete!</span></div>';
                str += '</div>';
                return str;
            }
            str += '<div class="name">' + (brew.potionId === 'discovering' ? 'Mixing ingredients' : (brew.potionId === 'useless_brew' ? MIXTURE_TYPES['useless'].name : (brew.potionId === 'dew_failed' ? 'Failed Brew' : (p ? p.name : brew.potionId)))) + '</div>';

            if (brew.potionId === 'discovering') {
                str += remaining > 0
                    ? '<div class="description">Mixing ingredients and checking for potion stability. <br><br>Remaining brew time: <span class="green">' + formatRemaining(remaining) + '</span></div>'
                    : '<div class="description"><span class="green">Analysis complete!</span></div>';
                str += getIngredientsHtml(brew.reagents);
                str += '<q>The cauldron bubbles and fizzes as the reagents interact. Who knows what will emerge from this chaotic mixture?</q>';
            } else if (brew.potionId === 'useless_brew') {
                var mixture = MIXTURE_TYPES['useless'];
                var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-mixture.icon[0] * 48) + 'px ' + (-mixture.icon[1] * 48) + 'px;';
                var sheetUrl = ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main;
                iconStyle += 'background-image:url(' + sheetUrl + ');';
                str += '<div class="icon" style="' + iconStyle + '"></div>';
                str += '<div class="line"></div><div class="description">' + mixture.desc + '</div>';
                str += '<q>' + mixture.flavor + '</q>';
            } else if (brew.potionId === 'dew_failed') {
                var mixture = MIXTURE_TYPES['useless'];
                var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-mixture.icon[0] * 48) + 'px ' + (-mixture.icon[1] * 48) + 'px;';
                var sheetUrl = ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main;
                iconStyle += 'background-image:url(' + sheetUrl + ');';
                str += '<div class="icon" style="' + iconStyle + '"></div>';
                str += '<div class="line"></div><div class="description">The Dew of Secrets brew revealed nothing useful. This vial contains only disappointment.</div>';
                str += '<q>A murky, bitter liquid with no magical properties. Perhaps next time will be more fruitful.</q>';
            } else if (p && p.discovered && !p.unlocked) {
                str += '<div class="description">You have discovered a new stable formula! However you have no idea what it actually does. Try using this potion to discover its effects on the world.</div>';
                str += getIngredientsHtml(brew.reagents);
                str += '<q>An unknown concoction shimmers in the vial. Its properties remain a mystery until you dare to drink it.</q>';
            } else if (p) {
                var misbrewChance = PotionsM._getMisbrewChance(p);
                var misbrewChanceStr = Math.round(misbrewChance * 100) + '%';
                str += '<div><small>Chance to misbrew: <b style="color:#f66">' + misbrewChanceStr + '</b></small></div>';
                
                var readyLine = remaining > 0
                    ? '<b>Brewing</b> &mdash; <span class="green">' + formatRemaining(remaining) + ' remaining</span><br><br>'
                    : '<span class="green">Ready to use. Click to consume your potion.</span><br><br>';
                
                str += '<div class="line"></div><div class="description">' + readyLine + '<b>Effect:</b> <span class="green">' + p.effect + '</span>' + (p.misbrew ? '<div style="height:8px;"></div><b>Misbrew:</b> <span class="red">' + p.misbrew + '</span>' : '') + '</div>';
                str += '<div class="line"></div>';
                
                // Only show brew time and ingredients while brewing
                if (remaining > 0) {
                    str += '<div><small><b>Brew time:</b> ' + formatDuration(p.brewTime) + '</small></div>';
                    str += getIngredientsHtml(brew.reagents);
                    str += '<div class="line"></div>';
                }
                
                str += '<q>' + p.desc + '</q>';
            }
        }
        str += '</div>';
        return str;
    };
};

// =====================================================================
// Build potion catalog 
// =====================================================================
PotionsM._buildCatalog = function() {
    var grid = $('potions-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.minHeight = '';

    for (var i = 0; i < POTIONS.length; i++) {
        var p = POTIONS[i];
        if (!p.unlocked) continue; // Skip locked potions
        
        var seed = document.createElement('div');
        seed.className = 'potions-catalog-seed';
        seed.dataset.potionId = p.id;
        seed.id = 'potionsSeed-' + p.id;

        var sheetUrl = ICON_SHEETS[p.icon[2] || 'main'] || ICON_SHEETS.main;
        var iconEl = document.createElement('div');
        iconEl.className = 'potions-catalog-seed-icon shadowFilter';
        iconEl.style.backgroundImage = 'url(' + sheetUrl + ')';
        iconEl.style.backgroundPosition = (-p.icon[0] * 48) + 'px ' + (-p.icon[1] * 48) + 'px';
        seed.appendChild(iconEl);
        grid.appendChild(seed);

        // Add click handler to auto-populate reagents (IIFE to capture p correctly)
        (function(potion) {
            seed.addEventListener('click', function() {
                PotionsM._autoPopulateReagents(potion);
            });
        })(p);

        if (p.unlocked) {
            (function(el, potion) {
                var tooltipFn = function() {
                    var ingredientsHtml = [];
                    for (var rk in potion.reagents) {
                        var rDef = null;
                        for (var ri = 0; ri < REAGENTS.length; ri++) { if (REAGENTS[ri].id === rk) { rDef = REAGENTS[ri]; break; } }
                        if (rDef) {
                            var sheetUrl = ICON_SHEETS[rDef.icon[2] || 'main'] || ICON_SHEETS.main;
                            for (var i = 0; i < potion.reagents[rk]; i++) {
                                ingredientsHtml.push('<div class="shadowFilter" style="display:inline-block;transform:scale(0.5,0.5);margin:-20px -13px;width:48px;height:48px;background-image:url(' + sheetUrl + ');background-position:' + (-rDef.icon[0] * 48) + 'px ' + (-rDef.icon[1] * 48) + 'px;"></div>');
                            }
                        }
                    }
                    var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-potion.icon[0] * 48) + 'px ' + (-potion.icon[1] * 48) + 'px;';
                    if (potion.icon[2] && potion.icon[2] !== 'main') {
                        var sheetUrl = ICON_SHEETS[potion.icon[2]] || ICON_SHEETS.main;
                        iconStyle += 'background-image:url(' + sheetUrl + ');';
                    }
                    var misbrewChance = PotionsM._getMisbrewChance(potion);
                    var misbrewChanceStr = Math.round(misbrewChance * 100) + '%';
                    var prestigeTag = '';
                    if (potion.prestige) {
                        var uniqueInUse = false;
                        for (var si = 0; si < 3; si++) {
                            var slot = G.slots[si];
                            if (slot && slot.potionId === potion.id) {
                                uniqueInUse = true;
                                break;
                            }
                        }
                        var color = uniqueInUse ? '#f66' : '#fc6';
                        prestigeTag = '<div class="meta" style="color:' + color + '">&#9733; Prestige potion</div>';
                    }
                    return '<div style="padding:8px 4px;min-width:350px;" id="tooltipPotionsCatalog"><div class="icon" style="' + iconStyle + '"></div><div class="name">' + potion.name + '</div>' + prestigeTag + '<div><small>Chance to misbrew: <b style="color:#f66">' + misbrewChanceStr + '</b></small></div><div class="line"></div><div class="description"><b>Effect:</b> <span class="green">' + potion.effect + '</span>' + (potion.misbrew ? '<div style="height:8px;"></div><b>Misbrew:</b> <span class="red">' + potion.misbrew + '</span>' : '') + '</div><div class="line"></div><div><small><b>Brew time:</b> ' + formatDuration(potion.brewTime) + '</small></div><div style="padding-top:8px;"><small><b>Ingredients:</b> ' + ingredientsHtml.join('') + '</small></div><q>' + potion.desc + '</q></div>';
                };
                PotionsM._addTooltip(el, tooltipFn, 'this');
            })(seed, p);
        }
    }

    // Set min-height if no potions are unlocked (same height as 1 potion item)
    if (grid.children.length === 0) {
        grid.style.minHeight = '48px';
    }

    var labelEl = $('potions-catalog-label');
    if (labelEl) labelEl.innerHTML = 'Potions Book <small>(' + getUnlockedCount() + '/' + getActivePotionCount() + ')</small>';
    if (PotionsM._checkPrestigeButton) PotionsM._checkPrestigeButton();
    
};

// =====================================================================
// Build reagents list 
// =====================================================================
PotionsM._buildReagents = function() {
    var list = $('potions-reagents-list');
    if (!list) return;
    list.innerHTML = '';

    for (var i = 0; i < REAGENTS.length; i++) {
        var r = REAGENTS[i];
        if (!r.unlocked) continue; // Only show unlocked reagents
        
        var item = document.createElement('div');
        item.className = 'potions-reagent-item';
        if (!G.reagents[r.id] || G.reagents[r.id] <= 0) {
            item.className += ' empty';
        }
        item.id = 'potions-reagent-item-' + r.id;

        var sheetUrl = ICON_SHEETS[r.icon[2] || 'main'] || ICON_SHEETS.main;
        
        // Add shine element then hide it
        var shineEl = document.createElement('div');
        shineEl.className = 'potions-reagent-shine';
        item.appendChild(shineEl);
        
        var iconEl = document.createElement('div');
        iconEl.className = 'potions-reagent-item-icon shadowFilter';
        iconEl.style.backgroundImage = 'url(' + sheetUrl + ')';
        iconEl.style.backgroundPosition = (-r.icon[0] * 48) + 'px ' + (-r.icon[1] * 48) + 'px';
        iconEl.style.zIndex = '1';

        item.appendChild(iconEl);
        
        // Apply highlight if active
        if (G.highlightedReagents.indexOf(r.id) !== -1 && Date.now() < G.highlightEndTime) {
            item.className += ' highlighted';
        }
        
        list.appendChild(item);

        (function(el, rDef) {
            PotionsM._addTooltip(el, function() {
                var count = G.reagents[rDef.id] || 0;
                var iconStyle = 'float:left;margin-left:-8px;margin-top:-8px;background-position:' + (-rDef.icon[0] * 48) + 'px ' + (-rDef.icon[1] * 48) + 'px;';
                if (rDef.icon[2] && rDef.icon[2] !== 'main') {
                    var sheetUrl = ICON_SHEETS[rDef.icon[2]] || ICON_SHEETS.main;
                    iconStyle += 'background-image:url(' + sheetUrl + ');';
                }
                var potionsHtml = getPotionsUsingReagentHtml(rDef.id);
                return '<div style="padding:8px 4px;min-width:300px;" id="tooltipPotionsReagent"><div class="icon" style="' + iconStyle + '"></div><div class="name">' + rDef.name + '</div><div><small><b>Stocked:</b> ' + count + '/' + G.maxReagents + '</small></div><div class="line"></div><div style="vertical-align:middle;"><small><b>Used in:</b> ' + potionsHtml + '</small></div><div class="line"></div><div class="description">' + rDef.gather + '</div><q>' + rDef.flavor + '</q></div>';
            }, 'this');
            
            // Click to select reagent for brewing
            el.addEventListener('click', function(e) {
                if (G.reagents[rDef.id] > 0) PlaySound('snd/press.mp3');
                if (Game.keys[16] && G.debugMode) {
                    // Shift-click to add 1 reagent (for testing)
                    if (!G.reagents[rDef.id]) G.reagents[rDef.id] = 0;
                    if (G.reagents[rDef.id] < G.maxReagents) {
                        G.reagents[rDef.id]++;
                        PotionsM._buildReagents();
                    }
                } else {
                    PotionsM._selectReagentForBrew(rDef.id);
                }
            });
        })(item, r);
    }
    
    var labelEl = $('potions-reagents-label');
    if (labelEl) labelEl.innerHTML = 'Reagents Discovered <small>(' + getReagentUnlockedCount() + '/' + REAGENTS.length + ')</small>';
    
    var discoverableEl = $('potions-discoverable-label');
    if (discoverableEl) discoverableEl.innerHTML = 'Your current reagent supply can discover ' + getDiscoverablePotionsCount() + ' unknown potions';
    
    PotionsM._buildCatalog();
};

// =====================================================================
// Auto-populate reagents from potion catalog
// =====================================================================
PotionsM._autoPopulateReagents = function(potion) {
    for (var i = 0; i < G.selectedReagents.length; i++) {
        var rid = G.selectedReagents[i];
        G.reagents[rid] = (G.reagents[rid] || 0) + 1;
    }
    G.selectedReagents = [];
    
    for (var rk in potion.reagents) {
        var needed = potion.reagents[rk];
        var have = G.reagents[rk] || 0;
        if (have < needed) {
            var mx = Game.mouseX, my = Game.mouseY;
            Game.Popup('<div style="font-size:80%;">Not enough reagents to brew this potion!</div>', mx, my);
            PotionsM._renderSelectedReagents();
            PotionsM._buildReagents();
            return;
        }
    }
    
    for (var rk in potion.reagents) {
        var count = potion.reagents[rk];
        for (var i = 0; i < count; i++) {
            G.reagents[rk]--;
            G.selectedReagents.push(rk);
        }
    }
    
    PlaySound('snd/tick.mp3');
    PotionsM._renderSelectedReagents();
    PotionsM._buildReagents();
};

// =====================================================================
// Use potion from slot
// =====================================================================
PotionsM._usePotionSlot = function(slotIndex) {
    var brew = G.slots[slotIndex];
    if (!brew) return;
    if (brew.potionId === 'useless' || brew.potionId === 'promising' || brew.potionId === 'very_promising' || brew.potionId === 'extraordinary_promising' || brew.potionId === 'useless_brew' || brew.potionId === 'dew_failed') {
        PlaySound('snd/buyHeavenly.mp3');
        G.slots[slotIndex] = null;
        PotionsM._refreshSlots();
        PotionsM._renderSelectedReagents();
        return;
    }
    if (brew.potionId === 'dew_discovering') return; // completes automatically, no click interaction
    var p = getPotionById(brew.potionId);
    if (!p) return;
    var remaining = brew.endTime - Date.now() / 1000;
    if (remaining > 0) return;
    // For Attar of the Gambler: capture forced outcome before clearing slot
    if (p.id === 'attar_of_the_gambler') {
        var misbrewChanceCheck = PotionsM._getMisbrewChance(p);
        var willMisbrew = (G.debugMode && Game.keys[16]) || Math.random() < misbrewChanceCheck;
        PotionsM._attarPendingForced = willMisbrew ? (brew.fom || null) : (brew.fo || null);
        PotionsM._attarWillMisbrew = willMisbrew;
    }
    G.slots[slotIndex] = null;
    PotionsM._refreshSlots();
    PotionsM._renderSelectedReagents();
    if (p.discovered && !p.unlocked) { p.unlocked = true; PotionsM._buildCatalog(); }
    
    // Track potions brewed (both successful and misbrewed)
    G.totalPotionsBrewed = (G.totalPotionsBrewed || 0) + 1;
    G.potionsBrewed = (G.potionsBrewed || 0) + 1;
    PotionsM.updatePotionsBrewedDisplay();
    
    var misbrewChance = PotionsM._getMisbrewChance(p);
    var didMisbrew = (p.id === 'attar_of_the_gambler' && PotionsM._attarWillMisbrew !== undefined)
        ? PotionsM._attarWillMisbrew
        : ((G.debugMode && Game.keys[16]) || Math.random() < misbrewChance);
    if (p.id === 'attar_of_the_gambler') { PotionsM._attarWillMisbrew = undefined; }
    if (didMisbrew && p.misbrew) {
        PlaySound('snd/thud.mp3');
        if (p.doMisbrew && typeof p.doMisbrew === 'function') {
            try { p.doMisbrew(p, slotIndex); }
            catch(e) { console.error('Error in doMisbrew for ' + p.id + ':', e); Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6); }
        }
        else Game.Notify(p.name + ' misbrewed', p.misbrew, getIconArray(p), 6);
    } else {
        PlaySound('snd/upgrade.mp3');
        if (p.doEffect && typeof p.doEffect === 'function') {
            try { p.doEffect(p, slotIndex); }
            catch(e) { console.error('Error in doEffect for ' + p.id + ':', e); Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6); }
        }
        else Game.Notify(p.name + ' consumed', p.effect, getIconArray(p), 6);
    }
};

// =====================================================================
// Helper functions
// =====================================================================
// dont consume random slots from main game
PotionsM._random = function() {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
};

PotionsM._getReagentDef = function(reagentId) {
    for (var i = 0; i < REAGENTS.length; i++) {
        if (REAGENTS[i].id === reagentId) return REAGENTS[i];
    }
    return null;
};

PotionsM.reagentRoll = function(reagentId) {
    // Don't award reagents if minigame isn't loaded
    if (!PotionsM.parent || !Game._potionsGrimoireReady || Game.ascensionMode == 1) return false;
    var rDef = PotionsM._getReagentDef(reagentId);
    if (!rDef) return false;
    var dropChance = rDef.dropChance || 0;
    if (typeof Game.dropRateMult === 'function') {
        dropChance *= Game.dropRateMult();
    }
    // Apply aura bonuses (Supreme Intellect: 10%, Reality Bending: 1%)
    var auraBonus = getSupremeIntellectBonus();
    if (auraBonus > 0) {
        dropChance *= (1 + (auraBonus * 0.1));
    }
    // Apply Ointment of Plenty buffs
    if (Game.buffs['Ointment of Plenty']) {
        dropChance *= 2;
    } else if (Game.buffs['Ointment of Plenty (misbrewed)']) {
        dropChance *= 0.5;
    }
    // Apply Poultice of Overgrowth misbrew (reduces drop chance to 50%)
    if (Game.buffs['Poultice of Overgrowth (misbrewed)']) {
        dropChance *= 0.5;
    }
    return PotionsM._random() < dropChance;
};

// Rolls all candidates independently, then awards one random winner.
PotionsM.reagentRollOne = function(candidates, source) {
    var winners = [];
    for (var k = 0; k < candidates.length; k++) {
        if (PotionsM.reagentRoll(candidates[k])) winners.push(candidates[k]);
    }
    if (winners.length === 0) return null;
    var pick = winners[Math.floor(PotionsM._random() * winners.length)];
    PotionsM._addReagent(pick, 1, source);
    return pick;
};

PotionsM._onCookieClick = function() {
    if (PotionsM._loading) return;
    if (PotionsM.reagentRoll('nectar_of_effort')) {
        PotionsM._addReagent('nectar_of_effort', 1, 'click');
    }
};

PotionsM._addReagent = function(reagentId, amount, source) {
    // Don't award reagents if minigame isn't loaded
    if (!PotionsM.parent || !Game._potionsGrimoireReady || Game.ascensionMode == 1) return;
    if (PotionsM._loading) return;
    if (Game.buffs['Poultice of Overgrowth']) amount *= 2;
    var current = G.reagents[reagentId] || 0;
    var inBrew = G.selectedReagents.filter(function(r) { return r === reagentId; }).length;
    if (current + inBrew >= G.maxReagents) return; // Maxed out (counting staged reagents), suppress

    // Cap amount to not exceed maxReagents
    var maxAdd = G.maxReagents - current - inBrew;
    if (amount > maxAdd) amount = maxAdd;
    if (amount <= 0) return;

    G.reagents[reagentId] = current + amount;
    G.totalReagentsCollected = (G.totalReagentsCollected || 0) + amount;

    // Permanently unlock the reagent on first award
    var wasUnlocked = G.unlockedReagents[reagentId];
    G.unlockedReagents[reagentId] = true;
    var rDef = PotionsM._getReagentDef(reagentId);
    if (rDef) rDef.unlocked = true;

    var name = rDef ? (rDef.name || reagentId) : reagentId;
    var isNew = !wasUnlocked;

    // Defer UI work outside the logic hook call stack
    setTimeout(function() {
        if (isNew && rDef && rDef.icon) {
            var sheetUrl = ICON_SHEETS[rDef.icon[2] || 'main'] || ICON_SHEETS.main;
            var icon = [rDef.icon[0], rDef.icon[1], sheetUrl];
            Game.Notify('New reagent discovered!', name, icon, 6);
        } else {
            var msg = 'Reagent found: ' + name + '!';
            // Position popup at bottom of screen to avoid vanilla popups at cursor
            var px = Game.windowW / 2;
            var py = Game.windowH - 100;
            Game.Popup(msg, px, py);
        }
        PotionsM._buildReagents();
        PotionsM._buildCatalog();
    }, 0);
};

PotionsM._highlightReagents = function(reagentIds, durationSeconds) {
    // Clear any existing timeout to prevent old timer from wiping new highlights
    if (G.highlightTimeout) {
        clearTimeout(G.highlightTimeout);
        G.highlightTimeout = null;
    }
    G.highlightedReagents = reagentIds.slice();
    G.highlightEndTime = Date.now() + (durationSeconds * 1000);
    PotionsM._buildReagents();
    
    // clear after duration
    G.highlightTimeout = setTimeout(function() {
        PotionsM._clearReagentHighlights();
    }, durationSeconds * 1000);
};

PotionsM._clearReagentHighlights = function() {
    if (G.highlightTimeout) {
        clearTimeout(G.highlightTimeout);
        G.highlightTimeout = null;
    }
    G.highlightedReagents = [];
    G.highlightEndTime = 0;
    PotionsM._buildReagents();
};

PotionsM._getRandomPotion = function() {
    var allPotions = [];
    for (var i = 0; i < POTIONS.length; i++) {
        if (!isActivePotion(POTIONS[i])) continue;
        // Prestige potions must be unlocked to be selectable by Elixir of Chaos
        if (POTIONS[i].prestige && !POTIONS[i].unlocked) continue;
        // Exclude Elixir of Chaos, Unguent of Hades, and Tears of Landis from random selection also known as fun killers
        if (POTIONS[i].id !== 'elixir_of_chaos' && POTIONS[i].id !== 'unguent_of_hades' && POTIONS[i].id !== 'tears_of_landis') {
            allPotions.push(POTIONS[i]);
        }
    }
    if (allPotions.length > 0) {
        var randomIndex = Math.floor(PotionsM._random() * allPotions.length);
        return allPotions[randomIndex];
    }
    return null;
};

// =====================================================================
// Reagents
// =====================================================================

PotionsM._selectReagentForBrew = function(reagentId) {
    // Check if reagent has stock
    var count = G.reagents[reagentId] || 0;
    if (count <= 0) return;
    
    if (G.selectedReagents.length >= 3) return;
    
    // Check if reagent is already selected 
    if (G.selectedReagents.indexOf(reagentId) !== -1) return;
    
    // Add to selection and deduct from store
    G.selectedReagents.push(reagentId);
    G.reagents[reagentId]--;
    PotionsM._renderSelectedReagents();
    PotionsM._buildReagents(); // Update reagents display to show deduction
};

PotionsM._removeReagentFromBrew = function(index) {
    var reagentId = G.selectedReagents[index];
    G.selectedReagents.splice(index, 1);
    // Return reagent to store
    G.reagents[reagentId] = (G.reagents[reagentId] || 0) + 1;
    PotionsM._renderSelectedReagents();
    PotionsM._buildReagents(); // Update reagents display to show returned reagent
};

PotionsM._findMatchingPotion = function(reagentArray) {
    var reagents = reagentArray || G.selectedReagents;
    if (reagents.length !== 3) return null;

    // Count reagents in selection
    var selectedCounts = {};
    for (var ri = 0; ri < reagents.length; ri++) {
        var rid = reagents[ri];
        selectedCounts[rid] = (selectedCounts[rid] || 0) + 1;
    }

    for (var i = 0; i < POTIONS.length; i++) {
        var p = POTIONS[i];
        if (!isActivePotion(p)) continue;
        var match = true;

        // Compare with potion's reagent requirements
        for (var rk in p.reagents) {
            if (selectedCounts[rk] !== p.reagents[rk]) {
                match = false;
                break;
            }
        }

        // Ensure we have exactly the right reagents 
        if (match) {
            for (var rk in selectedCounts) {
                if (!p.reagents[rk]) {
                    match = false;
                    break;
                }
            }
        }

        if (match) {
            return p;
        }
    }

    return null;
};

// Helper to calculate misbrew chance for a potion
PotionsM._getMisbrewChance = function(p) {
    var misbrewChance = p.misbrewChance !== undefined ? p.misbrewChance : 0.2;
    if (Game.hasBuff('Salve of Fortune')) misbrewChance *= 0.2;
    return misbrewChance;
};

// Helper to retry a function until a condition is met
PotionsM._retryUntilReady = function(checkFn, callbackFn, delay) {
    if (!checkFn()) {
        setTimeout(function() { PotionsM._retryUntilReady(checkFn, callbackFn, delay); }, delay);
        return;
    }
    callbackFn();
};

// =====================================================================
// Render selected reagents in brew section
// =====================================================================
PotionsM._renderSelectedReagents = function() {
    var container = $('potions-selected-reagents');
    var actionsContainer = $('potions-brew-actions');
    if (!container || !actionsContainer) {
        console.log('[Potions Debug] _renderSelectedReagents: missing containers', !!container, !!actionsContainer);
        return;
    }
    container.innerHTML = '';
    actionsContainer.innerHTML = '';
    
    // Always render 3 slots: filled if a reagent is selected, empty outline otherwise
    for (var i = 0; i < 3; i++) {
        var rid = G.selectedReagents[i] || null;
        var rDef = null;
        if (rid) {
            for (var ri = 0; ri < REAGENTS.length; ri++) {
                if (REAGENTS[ri].id === rid) { rDef = REAGENTS[ri]; break; }
            }
        }
        
        var slot = document.createElement('div');
        
        if (rDef) {
            slot.className = 'potions-selected-reagent';
            var sheetUrl = ICON_SHEETS[rDef.icon[2] || 'main'] || ICON_SHEETS.main;
            var iconEl = document.createElement('div');
            iconEl.className = 'potions-selected-reagent-icon shadowFilter';
            iconEl.style.backgroundImage = 'url(' + sheetUrl + ')';
            iconEl.style.backgroundPosition = (-rDef.icon[0] * 48) + 'px ' + (-rDef.icon[1] * 48) + 'px';
            slot.appendChild(iconEl);
            // Click to remove
            (function(idx) {
                slot.addEventListener('click', function() {
                    PotionsM._removeReagentFromBrew(idx);
                });
            })(i);
        } else {
            slot.className = 'potions-reagent-slot-outline';
        }
        
        container.appendChild(slot);
    }
    
    // show brew button
    var hasEmptySlot = G.slots.some(function(slot) { return !slot; });
    var matchingPotion = PotionsM._findMatchingPotion();
    var brewBtn = document.createElement('a');
    brewBtn.className = 'option smallFancyButton';
    brewBtn.id = 'potions-brew-button';
    
    if (G.selectedReagents.length === 3 && hasEmptySlot) {
        if (!matchingPotion || !matchingPotion.unlocked) {
            brewBtn.textContent = 'Experiment with this combination';
        } else {
            brewBtn.textContent = 'Brew ' + matchingPotion.name;
        }
        brewBtn.addEventListener('click', function() {
            PlaySound('snd/press.mp3');
            PotionsM._startBrew();
        });
    } else {
        brewBtn.textContent = 'Add 3 unique reagents to brew a potion';
        brewBtn.style.opacity = '0.5';
        brewBtn.style.pointerEvents = 'none';
    }
    
    actionsContainer.appendChild(brewBtn);
};

// =====================================================================
// Brew button handler
// =====================================================================
PotionsM._startBrew = function() {
    var matchingPotion = PotionsM._findMatchingPotion();
    
    for (var i = 0; i < 3; i++) {
        var slot = G.slots[i];
        if (slot && slot.potionId === 'discovering') {
            var currentReagents = G.selectedReagents.slice().sort();
            var slotReagents = slot.reagents.slice().sort();
            var isSame = currentReagents.length === slotReagents.length &&
                        currentReagents.every(function(val, index) { return val === slotReagents[index]; });
            
            if (isSame) {
                Game.Popup('<div style="font-size:80%;">This experiment is already being conducted</div>', Game.mouseX, Game.mouseY);
                return;
            }
        }
    }
    
    // Prevent duplicate prestige potions in brew slots
    if (matchingPotion && matchingPotion.prestige) {
        for (var i = 0; i < 3; i++) {
            var slot = G.slots[i];
            if (slot && slot.potionId === matchingPotion.id) {
                Game.Popup('<div style="font-size:80%;">You may only have one of each type of prestige potion at a time</div>', Game.mouseX, Game.mouseY);
                return;
            }
            // Dew of Secrets special case: prevent stacking dew_discovering state
            if (slot && matchingPotion.id === 'dew_of_secrets' && slot.potionId === 'dew_discovering') {
                Game.Popup('<div style="font-size:80%;">You may only have one of each type of prestige potion at a time</div>', Game.mouseX, Game.mouseY);
                return;
            }
        }
    }
    var emptySlot = -1;
    for (var i = 0; i < 3; i++) {
        if (!G.slots[i]) {
            emptySlot = i;
            break;
        }
    }
    if (emptySlot === -1) return;
    if (matchingPotion && matchingPotion.unlocked) {
        var brewTime = matchingPotion.brewTime;
        var speedMultiplier = 1;

        // Apply Draught of Urgency
        if (Game.buffs['Draught of Urgency']) {
            speedMultiplier *= 0.75;
        }

        // Apply Draught of Urgency curse
        if (Game.buffs['Draught of Urgency (misbrewed)']) {
            speedMultiplier *= 1.5;
        }
        brewTime *= speedMultiplier;
        
        // Override brew time to 5 seconds in debug mode
        if (G.debugMode) brewTime = 5;
        
        var newSlot = {
            potionId: matchingPotion.id,
            startTime: Date.now() / 1000,
            endTime: Date.now() / 1000 + brewTime,
            reagents: G.selectedReagents.slice()
        };
        // Attar of the Gambler: roll forced outcomes at brew-start
        if (matchingPotion.id === 'attar_of_the_gambler') {
            var rollForced = function() {
                var r = PotionsM._random() * 100;
                if (r < 25) return 'frenzy';
                if (r < 50) return 'multiply cookies';
                if (r < 65) return 'dragonflight';
                if (r < 80) return 'dragon harvest';
                if (r < 90) return 'building special';
                if (r < 95) return 'cookie storm';
                return 'chain cookie';
            };
            var rollMisbrew = function() {
                var r = PotionsM._random() * 100;
                if (r < 25) return 'frenzy';
                if (r < 50) return 'multiply cookies';
                if (r < 80) return 'clot';
                if (r < 90) return 'building special';
                if (r < 95) return 'cookie storm';
                return 'chain cookie';
            };
            newSlot.fo  = rollForced();
            newSlot.fom = rollMisbrew();
        }
        G.slots[emptySlot] = newSlot;
    } else {
        var rIds = G.selectedReagents.map(function(rid) {
            for (var ri = 0; ri < REAGENTS.length; ri++) {
                if (REAGENTS[ri].id === rid) return ri;
            }
            return -1;
        });
        if (rIds.length === 3 && rIds[0] !== -1 && rIds[1] !== -1 && rIds[2] !== -1) {
            if (!matchingPotion && TriedRecipes.isTried(G.triedRecipes, rIds[0], rIds[1], rIds[2])) {
                var mixtureTier = PotionsM._calculateMixtureTier(G.selectedReagents);
                var resultMessage = '';
                if (mixtureTier === 'useless') {
                    resultMessage = 'it was fairly useless';
                } else if (mixtureTier === 'promising') {
                    resultMessage = 'it was promising';
                } else if (mixtureTier === 'very_promising') {
                    resultMessage = 'it was very promising';
                } else if (mixtureTier === 'extraordinary_promising') {
                    resultMessage = 'it was extraordinarily promising';
                }
                Game.Popup('<div style="font-size:80%;">You seem to have a vague memory of this experiment, ' + resultMessage + '.</div>', Game.mouseX, Game.mouseY);
                return;
            }
            TriedRecipes.mark(G.triedRecipes, rIds[0], rIds[1], rIds[2]);
        }
        
        var discoveryTime = 300;
        
        // Apply Syrup of Insight misbrew to discovery time 
        if (Game.hasBuff('Syrup of Insight (misbrewed)')) {
            discoveryTime *= 2;
        }
        
        // Override discovery time to 5 seconds in debug mode
        if (G.debugMode) discoveryTime = 5;
        
        G.slots[emptySlot] = {
            potionId: 'discovering',
            startTime: Date.now() / 1000,
            endTime: Date.now() / 1000 + discoveryTime,
            reagents: G.selectedReagents.slice()
        };
    }
    
    G.selectedReagents = [];
    PotionsM._renderSelectedReagents();
    PotionsM._refreshSlots();
    PotionsM._buildReagents(); 
    PotionsM._buildCatalog();  
};

PotionsM._refreshSlots = function() {
    var now = Date.now() / 1000;
    for (var i = 0; i < 3; i++) {
        var content = $('potionsSlotContent' + i);
        if (!content) continue;
        var tile = $('potionsSlot' + i);
        var brew = G.slots[i];
        if (!brew) {
            content.innerHTML = '';
            if (tile) tile.classList.remove('ready');
        } else {
            var remaining = brew.endTime - now;
            var done = remaining <= 0;

            content.innerHTML = '';

            // Check for completed discovery / dew
            if (done && brew.potionId === 'discovering') {
                PotionsM._completeDiscovery(i);
                continue;
            }
            if (done && brew.potionId === 'dew_discovering') {
                PotionsM._completeDewDiscovery(i);
                continue;
            }
            
            if (brew.potionId === 'dew_discovering') {
                if (tile) tile.classList.remove('ready');
                var iconDiv = document.createElement('div');
                iconDiv.className = 'potions-tile-icon usesIcon shadowFilter';
                iconDiv.style.backgroundImage = 'url(' + ICON_SHEETS.main + ')';
                iconDiv.style.backgroundPosition = '0px -336px'; // [0, 7] question mark
                content.appendChild(iconDiv);
                var overlay = document.createElement('div');
                overlay.className = 'potions-brewing-overlay';
                overlay.id = 'potionsOverlay' + i;
                var _total = brew.endTime - brew.startTime;
                if (_total > 0) { var _pct = 1 - (remaining / _total); var _f = Math.floor((_pct * 144) % 144); overlay.style.backgroundPosition = (-(_f % 18) * 60) + 'px ' + (-Math.floor(_f / 18) * 74) + 'px'; }
                content.appendChild(overlay);
            } else if (brew.potionId === 'discovering') {
                if (tile) tile.classList.remove('ready');
                var iconDiv = document.createElement('div');
                iconDiv.className = 'potions-tile-icon usesIcon shadowFilter';
                iconDiv.style.backgroundImage = 'url(' + ICON_SHEETS.main + ')';
                iconDiv.style.backgroundPosition = '0px -336px'; // [0, 7]
                content.appendChild(iconDiv);
                var overlay = document.createElement('div');
                overlay.className = 'potions-brewing-overlay';
                overlay.id = 'potionsOverlay' + i;
                var _total = brew.endTime - brew.startTime;
                if (_total > 0) { var _pct = 1 - (remaining / _total); var _f = Math.floor((_pct * 144) % 144); overlay.style.backgroundPosition = (-(_f % 18) * 60) + 'px ' + (-Math.floor(_f / 18) * 74) + 'px'; }
                content.appendChild(overlay);
            } else if (brew.potionId === 'useless_brew' || brew.potionId === 'dew_failed') {
                if (tile) tile.classList.add('ready');
                var mixture = MIXTURE_TYPES['useless'];
                var iconDiv = document.createElement('div');
                iconDiv.className = 'potions-tile-icon usesIcon shadowFilter';
                var sheetUrl = ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main;
                iconDiv.style.backgroundImage = 'url(' + sheetUrl + ')';
                iconDiv.style.backgroundPosition = (-mixture.icon[0] * 48) + 'px ' + (-mixture.icon[1] * 48) + 'px';
                content.appendChild(iconDiv);
            } else if (MIXTURE_TYPES[brew.potionId]) {
                if (tile) tile.classList.add('ready');
                var mixture = MIXTURE_TYPES[brew.potionId];
                var iconDiv = document.createElement('div');
                iconDiv.className = 'potions-tile-icon usesIcon shadowFilter';
                var sheetUrl = ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main;
                iconDiv.style.backgroundImage = 'url(' + sheetUrl + ')';
                iconDiv.style.backgroundPosition = (-mixture.icon[0] * 48) + 'px ' + (-mixture.icon[1] * 48) + 'px';
                content.appendChild(iconDiv);
            } else {
                var p = getPotionById(brew.potionId);
                if (p) {
                    if (tile) tile.classList.toggle('ready', done);
                    var iconDiv = document.createElement('div');
                    iconDiv.className = 'potions-tile-icon usesIcon shadowFilter';
                    iconDiv.style.backgroundImage = 'url(' + (ICON_SHEETS[p.icon[2] || 'main'] || ICON_SHEETS.main) + ')';
                    iconDiv.style.backgroundPosition = (-p.icon[0] * 48) + 'px ' + (-p.icon[1] * 48) + 'px';
                    content.appendChild(iconDiv);
                    if (!done) {
                        var overlay = document.createElement('div');
                        overlay.className = 'potions-brewing-overlay';
                        overlay.id = 'potionsOverlay' + i;
                        var _total = brew.endTime - brew.startTime;
                        if (_total > 0) { var _pct = 1 - (remaining / _total); var _f = Math.floor((_pct * 144) % 144); overlay.style.backgroundPosition = (-(_f % 18) * 60) + 'px ' + (-Math.floor(_f / 18) * 74) + 'px'; }
                        content.appendChild(overlay);
                    }
                }
            }
        }
    }
};

// =====================================================================
// Calculate mixture tier for a set of reagents
// =====================================================================
PotionsM._calculateMixtureTier = function(reagents) {
    var matchingPairsCount = 0;
    
    // Generate all possible pairs from the reagents
    var pairs = [];
    for (var i = 0; i < reagents.length; i++) {
        for (var j = i + 1; j < reagents.length; j++) {
            pairs.push([reagents[i], reagents[j]]);
        }
    }
    
    // For each pair, check if it matches 2/3 reagents of any unknown potion
    for (var pi = 0; pi < pairs.length; pi++) {
        var pair = pairs[pi];
        var pairMatches = false;
        
        for (var i = 0; i < POTIONS.length; i++) {
            var p = POTIONS[i];
            if (!isActivePotion(p)) continue;
            if (p.unlocked) continue; // Skip known potions
            
            var requiredReagents = Object.keys(p.reagents);
            if (requiredReagents.length !== 3) continue;
            
            // Count how many reagents from this potion are in our pair
            var matchingCount = 0;
            for (var rk in p.reagents) {
                if (pair.indexOf(rk) !== -1) {
                    matchingCount++;
                }
            }
            
            if (matchingCount === 2) {
                pairMatches = true;
                break;
            }
        }
        
        if (pairMatches) {
            matchingPairsCount++;
        }
    }
    
    // Determine the tier based on matching pairs
    if (matchingPairsCount >= 3) {
        return 'extraordinary_promising';
    } else if (matchingPairsCount >= 2) {
        return 'very_promising';
    } else if (matchingPairsCount >= 1) {
        return 'promising';
    }
    return 'useless';
};

// =====================================================================
// Complete discovery
// =====================================================================
PotionsM._completeDiscovery = function(slotIndex) {
    var brew = G.slots[slotIndex];
    if (!brew || brew.potionId !== 'discovering') return;
    var silent = PotionsM._loading;

    G.slots[slotIndex] = null;

    var matchingPotion = PotionsM._findMatchingPotion(brew.reagents);

    if (matchingPotion) {
        if (!matchingPotion.discovered) {
            matchingPotion.discovered = true;
            if (!silent && Game.Notify) {
                var sheetUrl = ICON_SHEETS[matchingPotion.icon[2] || 'main'] || ICON_SHEETS.main;
                var icon = [matchingPotion.icon[0], matchingPotion.icon[1], sheetUrl];
                PlaySound('snd/cymbalRev.mp3');
                new Game.Notify('Potion discovered!', 'You have discovered: ' + matchingPotion.name, icon, 6);
            }
            PotionsM._buildReagents();
        }
        
        // immediately ready (discovery phase counted as brew time)
        G.slots[slotIndex] = {
            potionId: matchingPotion.id,
            startTime: Date.now() / 1000,
            endTime: Date.now() / 1000 - 1, // Already done
            reagents: brew.reagents // Preserved for save/load reconstruction
        };
    } else {
        var mixtureTier = PotionsM._calculateMixtureTier(brew.reagents);
        var mixture = MIXTURE_TYPES[mixtureTier];
        G.totalFailedDiscoveries = (G.totalFailedDiscoveries || 0) + 1;
        
        // Randomly return reagents duirng failed muxtures
        var recoveredCount = 0;
        if (!silent) {
            for (var ri = 0; ri < brew.reagents.length; ri++) {
                var rid = brew.reagents[ri];
                if (Math.random() < 0.65 && (G.reagents[rid] || 0) < G.maxReagents) {
                    G.reagents[rid] = (G.reagents[rid] || 0) + 1;
                    recoveredCount++;
                }
            }
        }
        
        G.slots[slotIndex] = {
            potionId: mixtureTier,
            reagents: brew.reagents, // Store the reagents for display
            startTime: Date.now() / 1000,
            endTime: Date.now() / 1000
        };

        PotionsM._buildReagents();
        
        if (!silent) {
            var notificationIcon = [mixture.icon[0], mixture.icon[1], ICON_SHEETS[mixture.icon[2]] || ICON_SHEETS.main];
            var notificationDesc = mixture.desc + (recoveredCount > 0 ? '<br><br>Some reagents have been recovered from this experiment and can be reused.</span>' : '');
            if (Game.Notify) {
                PlaySound('snd/thud.mp3');
                new Game.Notify(mixture.name, notificationDesc, notificationIcon, 6);
            }
        }
    }
    
    PotionsM._refreshSlots();
};

// =====================================================================
// PotionsM.logic — tick
// =====================================================================
PotionsM.logic = function() {
    PotionsM._refreshSlotTimers();
    PotionsM._checkDiscoveryTimers();
    PotionsM._updateEffs();
};

PotionsM._updateEffs = function() {
    // Guard against recursive calls that can cause exponential setTimeout loops with CookieMonster
    if (PotionsM._updatingEffs) return;
    PotionsM._updatingEffs = true;

    var effs = {};
    var changed = false;
    var b;

    try {
        if ((b = Game.hasBuff('Serum of Progress'))) { effs.upgradeCost = (effs.upgradeCost || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Serum of Progress (misbrewed)'))) { effs.upgradeCost = (effs.upgradeCost || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Concoction of the Mason'))) { effs.buildingCost = (effs.buildingCost || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Concoction of the Mason (misbrewed)'))) { effs.buildingCost = (effs.buildingCost || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Arcana of the Finger'))) { effs.cursorCps = (effs.cursorCps || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Arcana of the Finger (misbrewed)'))) { effs.cursorCps = (effs.cursorCps || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Mercury of Age'))) { effs.grandmaCps = (effs.grandmaCps || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Mercury of Age (misbrewed)'))) { effs.grandmaCps = (effs.grandmaCps || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Ambrosia of the Leech'))) { effs.wrinklerEat = (effs.wrinklerEat || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Ambrosia of the Leech (misbrewed)'))) { effs.wrinklerEat = (effs.wrinklerEat || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Nectar of Summoning'))) { effs.wrinklerSpawn = (effs.wrinklerSpawn || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Nectar of Summoning (misbrewed)'))) { effs.wrinklerSpawn = (effs.wrinklerSpawn || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Philter of Worms (misbrewed)'))) { effs.wrinklerSpawn = (effs.wrinklerSpawn || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Vitae of the Mother'))) { effs.milk = (effs.milk || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Vitae of the Mother (misbrewed)'))) { effs.milk = (effs.milk || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Infusion of Chance'))) { effs.itemDrops = (effs.itemDrops || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Infusion of Chance (misbrewed)'))) { effs.itemDrops = (effs.itemDrops || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Decoction of Winter'))) { effs.reindeerFreq = (effs.reindeerFreq || 1) * b.power; effs.reindeerGain = (effs.reindeerGain || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Decoction of Winter (misbrewed)'))) { effs.reindeerFreq = 0; changed = true; }
        if ((b = Game.hasBuff('Tonic of Ebisu'))) { effs.goldenCookieFreq = (effs.goldenCookieFreq || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Tonic of Ebisu (misbrewed)'))) { effs.goldenCookieFreq = (effs.goldenCookieFreq || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Distillate of Kala'))) { effs.goldenCookieEffDur = (effs.goldenCookieEffDur || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Distillate of Kala (misbrewed)'))) { effs.goldenCookieEffDur = (effs.goldenCookieEffDur || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Poison of the Matriarchs (misbrewed)'))) { effs.goldenCookieFreq = (effs.goldenCookieFreq || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Toxin of Elders'))) { effs.wrathCookieFreq = (effs.wrathCookieFreq || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Toxin of Elders (misbrewed)'))) { effs.wrathCookieFreq = (effs.wrathCookieFreq || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Venom of the Basilisk'))) { effs.wrinklerPop = (effs.wrinklerPop || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Ember of Dragon Fire'))) { effs.goldenCookieGain = (effs.goldenCookieGain || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Ember of Dragon Fire (misbrewed)'))) { effs.goldenCookieGain = (effs.goldenCookieGain || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Whisper of Boreas'))) { effs.reindeerGain = (effs.reindeerGain || 1) * b.power; changed = true; }
        if ((b = Game.hasBuff('Whisper of Boreas (misbrewed)'))) { effs.reindeerGain = (effs.reindeerGain || 1) * b.power; changed = true; }
        // Prestige potion effs
        // Note: multCpS buffs (Oxymel of Insanity, Nepenthe of Undoing, Tincture of Purpose, Ether of Serendipity)
        // are handled directly by vanilla's CpS calculation - no need to aggregate into PotionsM.effs
        if ((b = Game.hasBuff('Hydrosol of Refraction (misbrewed)'))) { effs.goldenCookieFreq = (effs.goldenCookieFreq || 1) * b.power; changed = true; }

        // Only update effs and trigger recalculation if values actually changed
        var actuallyChanged = false;
        var oldEffs = PotionsM.effs || {};
        for (var key in effs) {
            if (oldEffs[key] !== effs[key]) {
                actuallyChanged = true;
                break;
            }
        }
        // Check if any keys were removed
        if (!actuallyChanged) {
            for (var key in oldEffs) {
                if (!(key in effs)) {
                    actuallyChanged = true;
                    break;
                }
            }
        }

        if (actuallyChanged) {
            PotionsM.effs = effs;
            Game.recalculateGains = 1;
        }
    } finally {
        PotionsM._updatingEffs = false;
    }
};

PotionsM._checkDiscoveryTimers = function() {
    var now = Date.now() / 1000;
    for (var i = 0; i < 3; i++) {
        var brew = G.slots[i];
        if (!brew) continue;
        var remaining = brew.endTime - now;
        if (remaining <= 0) {
            if (brew.potionId === 'discovering') PotionsM._completeDiscovery(i);
            else if (brew.potionId === 'dew_discovering') PotionsM._completeDewDiscovery(i);
        }
    }
};

PotionsM._completeDewDiscovery = function(slotIndex) {
    var silent = PotionsM._loading;
    var discovered = false;
    var now = Date.now() / 1000;

    if (PotionsM._random() < 0.50) {
        var candidates = [];
        for (var i = 0; i < POTIONS.length; i++) {
            if (isActivePotion(POTIONS[i]) && !POTIONS[i].discovered && !POTIONS[i].unlocked) {
                candidates.push(POTIONS[i]);
            }
        }
        if (candidates.length > 0) {
            var pick = candidates[Math.floor(PotionsM._random() * candidates.length)];
            pick.discovered = true;
            pick.unlocked = true;
            discovered = true;
            // Place discovered potion in slot as if it was just discovered
            G.slots[slotIndex] = { potionId: pick.id, startTime: now - 1, endTime: now - 1, reagents: [] };
            if (!silent) {
                var icon = getIconArray(getPotionById('dew_of_secrets'));
                PlaySound('snd/cymbalRev.mp3');
                Game.Notify('Dew of Secrets', 'Discovered: ' + pick.name, icon, 6);
                PotionsM._buildCatalog();
            }
        }
    }

    if (!discovered) {
        // Place useless placeholder potion in slot on failure
        G.slots[slotIndex] = { potionId: 'dew_failed', startTime: now - 1, endTime: now - 1, reagents: [] };
        if (!silent) {
            var icon = getIconArray(getPotionById('dew_of_secrets'));
            Game.Notify('Dew of Secrets', 'The brew finished but revealed nothing new.', icon, 6);
        }
    }

    PotionsM._refreshSlots();
};

PotionsM._refreshSlotTimers = function() {
    var now = Date.now() / 1000;
    for (var i = 0; i < 3; i++) {
        var brew = G.slots[i];
        if (!brew) continue;
        
        var remaining = brew.endTime - now;
        var done = remaining <= 0;
        
        var overlay = $('potionsOverlay' + i);
        if (overlay) {
            if (done) {
                overlay.remove();
            } else {
                overlay.style.display = 'block';
                var total = brew.endTime - brew.startTime;
                var pct = 1 - (remaining / total);
                var T = (pct * 144) % 144;
                var frame = Math.floor(T);
                var cw = 60, ch = 74;
                overlay.style.backgroundPosition = (-(frame % 18) * cw) + 'px ' + (-Math.floor(frame / 18) * ch) + 'px';
            }
        }
        
        // Apply ready class when potion finishes brewing
        var tile = $('potionsSlot' + i);
        if (tile) {
            tile.classList.toggle('ready', done);
        }
    }
};
// =====================================================================
// Save / Load / Reset
// =====================================================================
PotionsM._buildSaveDataImpl = function() {
    var now = Date.now() / 1000;

    // 1. Reagents: array of 22 integers. -1 = locked, 0-N = store count (unlocked).
    var r = [];
    for (var i = 0; i < REAGENTS.length; i++) {
        var rDef = REAGENTS[i];
        r.push(rDef.unlocked ? (G.reagents[rDef.id] || 0) : -1);
    }

    // 2. Potions: array of 2-bit values per potion. 0=locked, 1=discovered-not-unlocked, 2=unlocked.
    var p = [];
    for (var i = 0; i < POTIONS.length; i++) {
        var pt = POTIONS[i];
        p.push(pt.unlocked ? 2 : (pt.discovered ? 1 : 0));
    }

    // 3. Brew slots: 3 entries, null or compact object.
    var reagentIdToIndex = {};
    for (var i = 0; i < REAGENTS.length; i++) reagentIdToIndex[REAGENTS[i].id] = i;
    var s = [];
    for (var i = 0; i < 3; i++) {
        var slot = G.slots[i];
        if (!slot) { s.push(null); continue; }
        var slotR = [];
        if (slot.reagents) {
            for (var j = 0; j < slot.reagents.length; j++) {
                var idx = reagentIdToIndex[slot.reagents[j]];
                slotR.push(idx !== undefined ? idx : slot.reagents[j]);
            }
        }
        var timeRemaining = Math.max(0, Math.round(slot.endTime - now));
        var slotEntry = { t: timeRemaining, r: slotR };
        if (slot.potionId && slot.potionId !== 'discovering') slotEntry.pid = slot.potionId;
        if (slot.fo) slotEntry.fo = slot.fo;
        if (slot.fom) slotEntry.fom = slot.fom;
        s.push(slotEntry);
    }

    // 4. Active potion buffs.
    // bn = building name (key in Game.Objects), only set by Suspension of Hallucinogenic.
    // m = max time (original duration) for piefill progress calculation.
    var b = [];
    if (Game.buffs) {
        for (var bname in Game.buffs) {
            var buff = Game.buffs[bname];
            if (!buff) continue;
            var entry = { n: bname, t: Math.round(buff.time / (Game.fps || 30)), m: Math.round(buff.maxTime / (Game.fps || 30)) };
            // Save whichever multiplier property this buff type uses (power/mult/multCpS),
            // so its effect strength is preserved across saves for ALL potion buffs, not just special-cased ones.
            var savedPower = (buff.power !== undefined) ? buff.power : (buff.mult !== undefined ? buff.mult : (buff.multCpS !== undefined ? buff.multCpS : undefined));
            if (savedPower !== undefined) entry.pw = savedPower;
            // Save building name for Suspension of Hallucinogenic
            if ((bname === 'Suspension of Hallucinogenic' || bname === 'Suspension of Hallucinogenic (misbrewed)') && buff.buildingName) {
                entry.bn = buff.buildingName;
            }
            b.push(entry);
        }
    }

    // 5. Tried-recipes bitset hex.
    var x = G.triedRecipes ? TriedRecipes.encode(G.triedRecipes) : TriedRecipes.encode(TriedRecipes.create());

    // 6. Achievement won state: array of won indices
    var aw = [];
    for (var ai = 0; ai < potionsAchievementNames.length; ai++) {
        var ach = Game.Achievements && Game.Achievements[potionsAchievementNames[ai]];
        if (ach && ach.won) aw.push(ai);
    }

    // rn/pn: record how many reagents/potions exist at save time.
    // On load, if counts differ a new ingredient/potion was added — safe to ignore extras.
    // Save onMinigame state (0 = closed, 1 = open)
    var alchemyLab = Game.Objects && Game.Objects['Alchemy lab'];
    var isOpen = alchemyLab && alchemyLab.onMinigame ? 1 : 0;
    return { v: 2, rn: REAGENTS.length, pn: POTIONS.length, r: r, p: p, s: s, b: b, x: x,
             tb: G.totalPotionsBrewed || 0, pb: G.potionsBrewed || 0, tr: G.totalReagentsCollected || 0,
             fd: G.totalFailedDiscoveries || 0, aw: aw, o: isOpen,
             pc: G.prestigeCount || 0,
             up: G.unlockedPrestige || [],
             rm: G.recipeMap || null,
             fns: G.feverNightmareStart || 0,
             sr: G.selectedReagents || [],
             cg: G.craftsmanGrants || {},
             ce: G.cadenceExtensions || {} };
};

PotionsM._saveImpl = function() {
    var payload = PotionsM._buildSaveDataImpl();
    var saveString = '';
    try {
        saveString = encodeURIComponent(JSON.stringify(payload));
    } catch (e) { saveString = ''; }
    if (window.PotionsMinigame && typeof window.PotionsMinigame.writeCache === 'function') {
        window.PotionsMinigame.writeCache(saveString);
    }
    return saveString;
};

PotionsM._loadImpl = function(str) {
    PotionsM._loading = true;
    PotionsM._syncBaselines();
    // Always schedule the unlock timer (bail or success) — replaces any prior pending timer
    function scheduleUnlock() {
        if (PotionsM._loadTimer) clearTimeout(PotionsM._loadTimer);
        PotionsM._loadTimer = setTimeout(function() {
            PotionsM._syncBaselines();
            PotionsM._loading = false;
            PotionsM._loadTimer = null;
        }, 1500);
    }
    function bail() { scheduleUnlock(); }
    if (!str || str === '') { bail(); return; }

    var data = null;
    try {
        var decoded = str;
        try { decoded = decodeURIComponent(str); } catch(e2) {}
        data = JSON.parse(decoded);
    } catch (e) { bail(); return; }
    if (!data || typeof data !== 'object' || (data.v !== 1 && data.v !== 2)) { bail(); return; }

    PotionsM._resetImpl(true, true);

    // Prestige state — must be restored BEFORE potions so discovered/unlocked flags make sense
    G.prestigeCount = data.pc || 0;
    G.unlockedPrestige = Array.isArray(data.up) ? data.up.slice() : [];
    for (var pi = 0; pi < G.unlockedPrestige.length; pi++) {
        var unlockPot = getPotionById(G.unlockedPrestige[pi]);
        if (unlockPot) unlockPot.prestigeLocked = false;
    }
    // Apply recipe map if present
    if (data.rm) {
        G.recipeMap = data.rm;
        var activePots = [];
        for (var pi = 0; pi < POTIONS.length; pi++) { if (isActivePotion(POTIONS[pi])) activePots.push(POTIONS[pi]); }
        var decoded = decodeRecipeMap(data.rm, activePots);
        if (Object.keys(decoded).length > 0) applyRecipeMap(decoded);
    } else {
        G.recipeMap = null;
    }

    // Load fever nightmare start timestamp
    G.feverNightmareStart = data.fns || 0;

    // Load abuse prevention tracking
    G.craftsmanGrants = data.cg || {};
    G.cadenceExtensions = data.ce || {};

    // Reagents
    if (Array.isArray(data.r)) {
        for (var i = 0; i < REAGENTS.length && i < data.r.length; i++) {
            var val = data.r[i];
            if (val >= 0) {
                REAGENTS[i].unlocked = true;
                G.unlockedReagents[REAGENTS[i].id] = true;
                G.reagents[REAGENTS[i].id] = Math.min(val, G.maxReagents);
            }
        }
    }

    // Potions
    if (Array.isArray(data.p)) {
        for (var i = 0; i < POTIONS.length && i < data.p.length; i++) {
            var pv = data.p[i];
            if (pv >= 1) POTIONS[i].discovered = true;
            if (pv >= 2) {
                POTIONS[i].unlocked = true;
            }
        }
    }

    // Staged reagents (selected but not yet committed to a brew)
    G.selectedReagents = [];
    if (Array.isArray(data.sr)) {
        for (var i = 0; i < data.sr.length; i++) {
            var rid = data.sr[i];
            var valid = false;
            for (var ri = 0; ri < REAGENTS.length; ri++) {
                if (REAGENTS[ri].id === rid) { valid = true; break; }
            }
            if (valid && G.selectedReagents.length < 3) G.selectedReagents.push(rid);
        }
    }

    // Brew slots — reagents stored as numeric indices, convert back to string IDs
    if (Array.isArray(data.s)) {
        var loadTime = Date.now() / 1000;
        for (var i = 0; i < 3 && i < data.s.length; i++) {
            var sd = data.s[i];
            if (!sd) { G.slots[i] = null; continue; }
            var slotReagents = [];
            if (Array.isArray(sd.r)) {
                for (var j = 0; j < sd.r.length; j++) {
                    var rv = sd.r[j];
                    if (typeof rv === 'number' && REAGENTS[rv]) {
                        slotReagents.push(REAGENTS[rv].id);
                    } else if (typeof rv === 'string') {
                        slotReagents.push(rv);
                    }
                }
            }
            // Prefer saved pid; fall back to inferring from reagents
            var potionId = sd.pid || 'discovering';
            if (!sd.pid) {
                var matching = PotionsM._findMatchingPotion(slotReagents);
                if (matching && matching.discovered) potionId = matching.id;
            }
            var timeRemaining = sd.t || 0;
            var isDew = potionId === 'dew_discovering';
            var potionDef = (potionId !== 'discovering' && !isDew) ? getPotionById(potionId) : null;
            var maxBrewTime = potionDef ? potionDef.brewTime : (isDew ? 64800 : 300);
            var timeElapsed = maxBrewTime - timeRemaining;
            var restoredSlot = {
                potionId:  potionId,
                startTime: Math.round(loadTime - timeElapsed),
                endTime:   Math.round(loadTime + timeRemaining),
                reagents:  slotReagents
            };
            if (sd.fo)  restoredSlot.fo  = sd.fo;
            if (sd.fom) restoredSlot.fom = sd.fom;
            G.slots[i] = restoredSlot;
        }
    }

    // Active buffs - store for restoration after buff types are registered
    if (Array.isArray(data.b)) {
            PotionsM._pendingBuffs = data.b;
    }

    // Tried-recipes bitset
    if (typeof data.x === 'string') {
        var decoded_bs = TriedRecipes.decode(data.x);
        if (decoded_bs) G.triedRecipes = decoded_bs;
    }

    // Totals
    G.totalPotionsBrewed     = data.tb || 0;
    G.potionsBrewed         = data.pb || 0;
    G.totalReagentsCollected = data.tr || 0;
    G.totalFailedDiscoveries     = data.fd || 0;

    // Achievement won state 
    if (Array.isArray(data.aw) && typeof potionsAchievementNames !== 'undefined') {
        var anyPending = false;
        for (var ai = 0; ai < data.aw.length; ai++) {
            var wonIdx = data.aw[ai];
            if (wonIdx < 0 || wonIdx >= potionsAchievementNames.length) continue;
            var achName = potionsAchievementNames[wonIdx];
            var ach = Game.Achievements && Game.Achievements[achName];
            if (!ach) {
                anyPending = true;
            } else {
                ach.won = 1;
                ach._restoredFromSave = true;
            }
        }
        if (anyPending) PotionsM._pendingAchWon = data.aw;
    }

    if (!G.triedRecipes) G.triedRecipes = TriedRecipes.create();
    PotionsM._refreshSlots();
    PotionsM._refreshSlotTimers();
    PotionsM._renderSelectedReagents();
    PotionsM._buildReagents();
    PotionsM._buildCatalog();
    if (PotionsM._updateEffs) PotionsM._updateEffs();
    PotionsM.updatePotionsBrewedDisplay();

    // Restore minigame open/close state
    var shouldOpen = data.o === 1 || (data.o === undefined && Game.JNE && Game.JNE.potionsSavedDataIsOpen === true);
    if (shouldOpen) {
        setTimeout(function() {
            var lab = Game.Objects && Game.Objects['Alchemy lab'];
            if (lab && !lab.onMinigame) {
                if (typeof lab.switchMinigame === 'function') {
                    lab.switchMinigame(true);
                } else {
                    lab.onMinigame = 1;
                }
            }
        }, 50);
    }

    scheduleUnlock();
    PotionsM._hookGrimoire();
};

// Restore pending buffs after all buff types are registered
PotionsM._restorePendingBuffs = function() {
    if (!PotionsM._pendingBuffs || !Array.isArray(PotionsM._pendingBuffs)) return;
    for (var bi = 0; bi < PotionsM._pendingBuffs.length; bi++) {
        var bd = PotionsM._pendingBuffs[bi];
        if (!bd || !bd.n) continue;
        var remainSeconds = Math.max(0, bd.t || 0);
        var maxSeconds = Math.max(remainSeconds, bd.m || remainSeconds);
        if (remainSeconds <= 0) continue;
        try {
            var power = (bd.pw !== undefined) ? bd.pw : 1;
            if (bd.n === 'Nepenthe of Undoing') delete Game.buffs['Nepenthe of Undoing'];
            if (bd.bn && (bd.n === 'Suspension of Hallucinogenic' || bd.n === 'Suspension of Hallucinogenic (misbrewed)')) _suspBuildingKey = bd.bn;
            Game.gainBuff(bd.n, remainSeconds, power, 0);
            _suspBuildingKey = null;
            var restored = Game.buffs[bd.n];
            if (restored) {
                restored.maxTime = maxSeconds * (Game.fps || 30);
                if (bd.bn && (bd.n === 'Suspension of Hallucinogenic' || bd.n === 'Suspension of Hallucinogenic (misbrewed)')) {
                    Object.defineProperty(restored, 'buildingName', {
                        value: bd.bn,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                }
                // Apply Venom multiplier on load (modifies wrinkler.sucked directly)
                if (bd.n === 'Venom of the Basilisk' && Game.wrinklers) {
                    for (var i = 0; i < Game.wrinklers.length; i++) {
                        if (Game.wrinklers[i].phase == 2) {
                            Game.wrinklers[i].sucked *= 1.1;
                        }
                    }
                }
            }
        } catch(e) {}
    }
    PotionsM._pendingBuffs = null;
};

PotionsM._resetImpl = function(hard, _calledFromLoad) {
    if (hard) {
        G.slots = [null, null, null];
        G.reagents = {};
        G.unlockedReagents = {};
        for (var i = 0; i < REAGENTS.length; i++) {
            G.reagents[REAGENTS[i].id] = 0;
            REAGENTS[i].unlocked = false;
        }
        for (var i = 0; i < POTIONS.length; i++) {
            POTIONS[i].unlocked = false;
            POTIONS[i].discovered = false;
            if (POTIONS[i].prestige) POTIONS[i].prestigeLocked = true;
        }
        // Restore original fixed recipes for all base potions
        for (var i = 0; i < POTIONS.length; i++) {
            var orig = ORIGINAL_RECIPES[POTIONS[i].id];
            if (orig) {
                POTIONS[i].reagents = {};
                for (var rk in orig) POTIONS[i].reagents[rk] = orig[rk];
            } else if (POTIONS[i].prestige) {
                POTIONS[i].reagents = {};
            }
        }
        G.triedRecipes = TriedRecipes.create();
        G.totalPotionsBrewed = 0;
        G.totalReagentsCollected = 0;
        G.totalFailedDiscoveries = 0;
        G.selectedReagents = [];
        G.highlightedReagents = [];
        G.highlightEndTime = 0;
        G.prestigeCount = 0;
        G.unlockedPrestige = [];
        G.recipeMap = null;
        G.craftsmanGrants = {};
        G.cadenceExtensions = {};

        // Set baseline unlocked items, fresh game state 
        var baselineReagents = ['nectar_of_effort', 'dragon_scales', 'golden_flour'];
        for (var i = 0; i < baselineReagents.length; i++) {
            var rId = baselineReagents[i];
            G.unlockedReagents[rId] = true;
            var rDef = PotionsM._getReagentDef(rId);
            if (rDef) rDef.unlocked = true;
        }
        var baselinePotion = getPotionById('oil_of_hephaestus');
        // Only unlock as baseline on fresh game/ascension, not when loading from save
        if (baselinePotion && G.prestigeCount === 0 && !_calledFromLoad) {
            baselinePotion.unlocked = true;
        }
    } else {
        // Ascension: clear transient state but preserve unlock progress and lifetime totals.
        // Zero out store counts for unlocked reagents but keep unlocked
        G.slots = [null, null, null];
        G.selectedReagents = [];
        G.highlightedReagents = [];
        G.highlightEndTime = 0;
        G.potionsBrewed = 0;
        G.craftsmanGrants = {};
        G.cadenceExtensions = {};
        for (var i = 0; i < REAGENTS.length; i++) {
            G.reagents[REAGENTS[i].id] = 0;
        }
    }
    // Refresh UI
    PotionsM._refreshSlots();
    PotionsM._renderSelectedReagents();
    PotionsM._buildReagents();
    PotionsM._buildCatalog();
    if (PotionsM._updateEffs) PotionsM._updateEffs();
    PotionsM.updatePotionsBrewedDisplay();
    
};

// =====================================================================
// Prestige
// =====================================================================
PotionsM._oxymeltMult = 1.0; // Oxymel of Insanity random CpS multiplier, updated each second

PotionsM._performPrestige = function() {
    PlaySound('snd/charging.mp3');
    G.prestigeCount = (G.prestigeCount || 0) + 1;
    G.feverNightmareStart = Date.now();

    // Unlock one random locked prestige potion for the first 10 prestiges
    if (G.prestigeCount <= 10) {
        var locked = [];
        for (var i = 0; i < POTIONS.length; i++) {
            if (POTIONS[i].prestige && POTIONS[i].prestigeLocked) locked.push(POTIONS[i]);
        }
        if (locked.length > 0) {
            var pick = locked[Math.floor(PotionsM._random() * locked.length)];
            pick.prestigeLocked = false;
            G.unlockedPrestige = G.unlockedPrestige || [];
            G.unlockedPrestige.push(pick.id);
        }
    }

    // Generate randomized recipes for every active potion and persist
    var activePots = [];
    for (var i = 0; i < POTIONS.length; i++) { if (isActivePotion(POTIONS[i])) activePots.push(POTIONS[i]); }
    var newMap = generateRandomRecipes(activePots);
    G.recipeMap = encodeRecipeMap(newMap, activePots);
    applyRecipeMap(newMap);

    // Forget all potions and wipe brew slots / discovery state
    for (var i = 0; i < POTIONS.length; i++) {
        POTIONS[i].unlocked = false;
        POTIONS[i].discovered = false;
    }
    // Re-ensure previously unlocked prestige potions stay unlocked
    for (var upIdx = 0; upIdx < G.unlockedPrestige.length; upIdx++) {
        var upPot = getPotionById(G.unlockedPrestige[upIdx]);
        if (upPot) upPot.prestigeLocked = false;
    }
    G.slots = [null, null, null];
    G.selectedReagents = [];
    G.triedRecipes = TriedRecipes.create();
    G.highlightedReagents = [];
    G.highlightEndTime = 0;

    PotionsM._refreshSlots();
    PotionsM._renderSelectedReagents();
    PotionsM._buildCatalog();
    PotionsM._buildReagents();
    if (PotionsM._updateEffs) PotionsM._updateEffs();
    PotionsM.updatePotionsBrewedDisplay();
    PotionsM._checkPrestigeButton();
    var prestigeIcon = [10, 11, ICON_SHEETS.main];
    Game.Notify('Fever Nightmare',
        'You have awakened. All recipes have been randomized.' +
        (G.prestigeCount <= 10 ? ' A new prestige potion has been added to the pool.' : ''),
        prestigeIcon, 6);
};

PotionsM._checkPrestigeButton = function() {
    var btn = $('potions-prestige-btn');
    if (!btn) return;
    var activePots = [];
    for (var i = 0; i < POTIONS.length; i++) { if (isActivePotion(POTIONS[i])) activePots.push(POTIONS[i]); }
    var allUnlocked = activePots.length > 0;
    for (var i = 0; i < activePots.length; i++) {
        if (!activePots[i].unlocked) { allUnlocked = false; break; }
    }
    btn.style.display = allUnlocked ? '' : 'none';
};

PotionsM.buildSaveString = function() {
    try { return JSON.stringify(PotionsM._buildSaveDataImpl()); } catch (e) { return ''; }
};
PotionsM.buildSaveData = function() { return PotionsM._buildSaveDataImpl(); };
PotionsM.save = function() { return PotionsM._saveImpl(); };
PotionsM.load = function(str) { PotionsM._loadImpl(str); };
PotionsM.reset = function(hard) { PotionsM._resetImpl(hard); };

PotionsM.createAchievements = createPotionsAchievements;
PotionsM.removeAchievements = removePotionsAchievements;

// =====================================================================
// Bootstrap
// =====================================================================
function initializePotionsMinigame() {
    var alchemyLab = Game.Objects['Alchemy lab'];
    if (!alchemyLab) return;
    var flagDefined = !!(Game.JNE && Game.JNE.enablePotionsMinigame !== undefined);
    var isConsoleLoading = !flagDefined || (Game.JNE && Game.JNE.enablePotionsMinigame === false);
    var isEnabled = flagDefined ? !!Game.JNE.enablePotionsMinigame : true;

    function ensureMinigameDiv() {
        if (alchemyLab.minigameDiv) return;
        var existingDiv = l('rowSpecial' + alchemyLab.id);
        if (existingDiv) {
            alchemyLab.minigameDiv = existingDiv;
        } else {
            alchemyLab.minigameDiv = document.createElement('div');
            alchemyLab.minigameDiv.id = 'rowSpecial' + alchemyLab.id;
            alchemyLab.minigameDiv.className = 'rowSpecial';
            if (alchemyLab.l) alchemyLab.l.appendChild(alchemyLab.minigameDiv);
        }
    }

    function bootMinigame() {
        if (!alchemyLab) return;
        if (!alchemyLab.minigameLoaded) {
            alchemyLab.minigameLoaded = true;
            alchemyLab.minigameName = alchemyLab.minigameName || 'Potions Class';
            alchemyLab.minigameLoading = false;
        }
        ensureMinigameDiv();
        PotionsM.launch();
        PotionsM.init(alchemyLab.minigameDiv);
        if (!alchemyLab.minigame) alchemyLab.minigame = PotionsM;
        // Load saved data (includes restoring onMinigame state in _loadImpl)
        if (Game.JNE && Game.JNE.potionsSavedData) PotionsM.load(Game.JNE.potionsSavedData);

        if (typeof PotionsM.createAchievements === 'function') PotionsM.createAchievements();
        if (!alchemyLab.minigameUrl) {
            alchemyLab.minigameUrl = 'potions';
        }
        if (typeof alchemyLab.refresh === 'function') alchemyLab.refresh();
        if (isConsoleLoading && Game.ObjectsById && Game.ObjectsById[alchemyLab.id] &&
            typeof Game.ObjectsById[alchemyLab.id].draw === 'function') {
            Game.ObjectsById[alchemyLab.id].draw();
        }
    }

    if (isEnabled || isConsoleLoading) {
        try {
            var minigameIsStub = !alchemyLab.minigame || !alchemyLab.minigame.init;
            if (!alchemyLab.minigameLoaded || minigameIsStub) {
                bootMinigame();
            } else if (alchemyLab.minigameLoaded && !PotionsM.launched) {
                PotionsM.launch();
                ensureMinigameDiv();
                PotionsM.init(alchemyLab.minigameDiv);
                if (!alchemyLab.minigame) alchemyLab.minigame = PotionsM;
                // Load saved data (includes restoring onMinigame state in _loadImpl)
                if (Game.JNE && Game.JNE.potionsSavedData) PotionsM.load(Game.JNE.potionsSavedData);
            }
        } catch (e) {
            alchemyLab.minigameLoading = false;
            throw e;
        }
        alchemyLab.minigameLoading = false;
        if (!alchemyLab.minigameUrl) alchemyLab.minigameUrl = 'potions';
    } else {
        alchemyLab.minigameLoading = false;
        removePotionsAchievements();
    }

    if (typeof alchemyLab.switchMinigame === 'function' && !alchemyLab._jnePotionsSwitchPatched) {
        alchemyLab._jnePotionsSwitchOrig = alchemyLab.switchMinigame;
        alchemyLab._jnePotionsSwitchPatched = true;
        alchemyLab.switchMinigame = function(on) {
            var orig = this._jnePotionsSwitchOrig;
            var result = (typeof orig === 'function') ? orig.apply(this, arguments) : undefined;
            var specialEl = document.getElementById('rowSpecial' + this.id);
            if (specialEl && this.onMinigame && specialEl.style.display === 'none') specialEl.style.display = '';
            return result;
        };
    }
}

initializePotionsMinigame();

PotionsM._retryUntilReady(function() {
    return Game.Objects['Alchemy lab'] && Game.Objects['Alchemy lab'].minigame;
}, function() {
    initializePotionsMinigame();
}, 1000);

// =====================================================================
// Public window API
// =====================================================================
var existingAPI = window.PotionsMinigame || {};
var publicAPI = {
    save: function() { return PotionsM._saveImpl(); },
    load: function(str) { PotionsM._loadImpl(str); },
    reset: function(hard) { PotionsM._resetImpl(hard); },
    buildSaveString: function() { return PotionsM.buildSaveString(); },
    buildSaveData: function() { return PotionsM._buildSaveDataImpl(); },
    createAchievements: createPotionsAchievements,
    removeAchievements: removePotionsAchievements,
    getSaveData: function() { return PotionsM._saveImpl(); },
    applySaveData: function(s) {
        if (typeof s !== 'string') return;
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.potionsSavedData = s;
        PotionsM._loadImpl(s);
        PotionsM._restorePendingBuffs();
        PotionsM._hookGrimoire();
    },
    writeCache: function(s) {
        if (typeof s !== 'string') s = '';
        if (!Game.JNE) Game.JNE = {};
        Game.JNE.potionsSavedData = s;
    },
    requestSave: function() { PotionsM._saveImpl(); }
};

for (var key in publicAPI) {
    if (publicAPI[key] === undefined) delete publicAPI[key];
}

Object.defineProperty(window, 'PotionsMinigame', {
    value: Object.assign({ VERSION: POTIONS_VERSION }, Object.freeze(publicAPI)),
    writable: false, enumerable: false, configurable: true
});
Object.defineProperty(window, 'removePotionsAchievements', {
    value: removePotionsAchievements,
    writable: false, enumerable: false, configurable: true
});
Object.defineProperty(window, 'createPotionsAchievements', {
    value: createPotionsAchievements,
    writable: false, enumerable: false, configurable: true
});

// =====================================================================
// Garden buff types
// =====================================================================
createPotionBuffType('Precipitate of Chronos', 'precipitate_of_chronos', false, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        return 'Garden ticks accelerated for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Precipitate of Chronos (misbrewed)', 'precipitate_of_chronos', true, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        return 'Plant effects reduced for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Potion of Gaia', 'potion_of_gaia', false, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        return 'Plant mutation rate increased for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});
createPotionBuffType('Potion of Gaia (misbrewed)', 'potion_of_gaia', true, {
    customDesc: function(potion, mult, time, isMisbrewed) {
        return 'Plant effects reduced for ' + Game.sayTime(time * Game.fps, -1) + '!';
    },
    onDie: function() { if (PotionsM._updateEffs) PotionsM._updateEffs(); }
});

// =====================================================================
// Garden function wrapping
// =====================================================================
PotionsM._setupGardenHooks = function() {
    PotionsM._retryUntilReady(function() {
        return Game.Objects['Farm'] && Game.Objects['Farm'].minigame;
    }, function() {    
        var M = Game.Objects['Farm'].minigame;
        
        // Precipitate of Chronos misbrew (reduces plant effects by 50%)
        if (!PotionsM._originalComputeEffs && M.computeEffs) {
            PotionsM._originalComputeEffs = M.computeEffs;
            M.computeEffs = function() {
                PotionsM._originalComputeEffs.call(this);
                var buff = Game.hasBuff('Precipitate of Chronos (misbrewed)');
                if (buff) {
                    var skipKeys = {buildingBoosts: true, magicMushroomMult: true};
                    for (var k in M.effs) {
                        if (!skipKeys[k] && typeof M.effs[k] === 'number') {
                            M.effs[k] = 1 + (M.effs[k] - 1) * 0.5;
                        }
                    }
                    Game.recalculateGains = 1;
                }
            };
        }
        
        // Wrap M.getMuts for Potion of Gaia
        if (!PotionsM._originalGetMuts && M.getMuts) {
            PotionsM._originalGetMuts = M.getMuts;
            M.getMuts = function(neighs, neighsM) {
                var muts = PotionsM._originalGetMuts.call(this, neighs, neighsM);
                var gaiaBuff = Game.hasBuff('Potion of Gaia');
                
                if (gaiaBuff && muts) {
                    for (var i = 0; i < muts.length; i++) {
                        muts[i][1] *= 5; // 5x mutation rate
                    }
                }
                
                return muts;
            };
        }
    }, 100);
};

// Setup garden hooks when game loads
if (Game.ready) {
    PotionsM._setupGardenHooks();
} else {
    Game.registerHook('ready', function() {
        PotionsM._setupGardenHooks();
    });
}

// =====================================================================
// Achievements
// =====================================================================
var potionsAchievementNames = [
    'The whole pantry',
    'The complete works of questionable medicine',
    'Stir crazy',
    'Hoardiculturalist',
    'Advanced Placement Alchemy',
    'Fever without dawn'
];

var potionsAchievementState = {
    achievementsCreated: false
};

function createPotionsAchievements() {
    if (!Game.JNE || !Game.JNE.createAchievement) {
        return;
    }
    if (Game.JNE.enablePotionsMinigame === false) {
        return;
    }
    if (!potionsAchievementNames || !potionsAchievementNames.length) {
        return;
    }

    var needsCreation = false;
    for (var i = 0; i < potionsAchievementNames.length; i++) {
        var originalName = potionsAchievementNames[i];
        var hiddenName = originalName + ' [DISABLED]';
        if (!Game.Achievements[originalName] && !Game.Achievements[hiddenName]) {
            needsCreation = true;
            break;
        }
    }

    if (!needsCreation) {
        for (var i = 0; i < potionsAchievementNames.length; i++) {
            var originalName = potionsAchievementNames[i];
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
        potionsAchievementState.achievementsCreated = true;
        return;
    }

    var baseOrder = 61638;
  var potionsAchievements = [
    {
        name: 'The whole pantry',
        desc: 'Unlock all reagents in the Potions Class minigame.<q>Everything has been found, labeled, sorted, cataloged, and licked for good measure.</q>',
        icon: Game.JNE.icon(11, 25, 'custom'),
        order: baseOrder + 0.1
    },
    {
        name: 'The complete works of questionable medicine',
        desc: 'Unlock all potions in the Potions Class minigame.<q>Nice little potion book you have collected there. Fancy yourself some sort of Half-Blood Prince?</q>',
        icon: Game.JNE.icon(15, 25, 'custom'),
        order: baseOrder + 0.2
    },
    {
        name: 'Stir crazy',
        desc: 'Brew 250 successful potions in the Potions Class minigame.<q>You have drunk so much questionable material that you will either be immortal or die from poisoning by the weekend.</q>',
        icon: Game.JNE.icon(0, 26, 'custom'),
        order: baseOrder + 0.3
    },
    {
        name: 'Hoardiculturalist',
        desc: 'Collect 1500 reagents in the Potions Class minigame.<q>You have more gunk in your pockets than a \'90s kid returning from an unsupervised afternoon in the woods.</q>',
        icon: Game.JNE.icon(13, 25, 'custom'),
        order: baseOrder + 0.4
    },
    {
        name: 'Advanced Placement Alchemy',
        desc: 'Discover all 10 prestige potions in the Potions Class minigame.<q>You have mastered the forbidden knowledge of the fever nightmare. The universe trembles at your alchemical prowess.</q>',
        icon: Game.JNE.icon(2, 27, 'custom'),
        order: baseOrder + 0.5
    },
    {
        name: 'Fever without dawn',
        desc: 'Unlock 50 potions within 8 hours of a fever nightmare.<q>Sleep is for the weak.</q>',
        icon: Game.JNE.icon(10, 11, 'main'),
        order: baseOrder + 0.6
    }
];

    for (var index = 0; index < potionsAchievements.length; index++) {
        var achData = potionsAchievements[index];
        var achievement = Game.JNE.createAchievement(
            achData.name,
            achData.desc,
            achData.icon,
            achData.order,
            null
        );
        if (achievement) {
            achievement.pool = 'normal';
        }
    }
    potionsAchievementState.achievementsCreated = true;

    // Apply any achievement won state that was stashed during load (load ran before achievements existed)
    if (Array.isArray(PotionsM._pendingAchWon)) {
        var pending = PotionsM._pendingAchWon;
        PotionsM._pendingAchWon = null;
        for (var ai = 0; ai < pending.length; ai++) {
            var wonIdx = pending[ai];
            if (wonIdx < 0 || wonIdx >= potionsAchievementNames.length) continue;
            var achN = potionsAchievementNames[wonIdx];
            var achObj = Game.Achievements && Game.Achievements[achN];
            if (achObj) { achObj.won = 1; achObj._restoredFromSave = true; }
        }
    }
    if (!PotionsM._checkHookRegistered) {
        PotionsM._checkHookRegistered = true;
        setTimeout(function() {
            if (Game.registerHook) Game.registerHook('check', checkAndAwardPotionsAchievements);
        }, 0);
    }
}

function removePotionsAchievements() {
    if (!Game || !Game.Achievements) {
        return;
    }
    potionsAchievementNames.forEach(function(achievementName) {
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
    potionsAchievementState.achievementsCreated = false;
    PotionsM._checkHookRegistered = false;
    if (Game.Achievements) {
        var newAchievementsOwned = 0;
        for (var achName in Game.Achievements) {
            var ach = Game.Achievements[achName];
            if (ach.pool === 'normal' && ach.won) {
                newAchievementsOwned++;
            }
        }
        Game.AchievementsOwned = newAchievementsOwned;
    }
}

function getAchievementState() {
    var unlockedReagentsCount = 0;
    for (var i = 0; i < REAGENTS.length; i++) {
        if (REAGENTS[i].unlocked) unlockedReagentsCount++;
    }
    var unlockedPotionsCount = 0;
    for (var i = 0; i < POTIONS.length; i++) {
        if (POTIONS[i].unlocked) unlockedPotionsCount++;
    }
    return {
        unlockedReagentsCount: unlockedReagentsCount,
        unlockedPotionsCount: unlockedPotionsCount,
        totalPotionsBrewed: G.totalPotionsBrewed || 0,
        totalReagentsCollected: G.totalReagentsCollected || 0
    };
}

function checkAndAwardPotionsAchievements() {
    if (checkAndAwardPotionsAchievements._inProgress) return;
    if (!potionsAchievementState.achievementsCreated) return;
    checkAndAwardPotionsAchievements._inProgress = true;

    try {
        var state = getAchievementState();
        var truffleHunter = state.unlockedReagentsCount >= REAGENTS.length;
        var potionMaster = state.unlockedPotionsCount >= POTIONS.length;
        var transfiguration = state.totalPotionsBrewed >= 250;
        var alchemistCollector = state.totalReagentsCollected >= 1500;

        // Advanced Placement Alchemy: discover all 10 prestige potions
        var prestigeDiscovered = 0;
        for (var i = 0; i < POTIONS.length; i++) {
            if (POTIONS[i].prestige && !POTIONS[i].prestigeLocked && POTIONS[i].discovered) {
                prestigeDiscovered++;
            }
        }
        var advancedPlacement = prestigeDiscovered >= 10;

        // Fever without dawn: unlock 50 potions within 8 hours of fever nightmare
        var feverWithoutDawn = false;
        if (G.feverNightmareStart > 0 && state.unlockedPotionsCount >= 50) {
            var hoursSinceFever = (Date.now() - G.feverNightmareStart) / (1000 * 60 * 60);
            feverWithoutDawn = hoursSinceFever <= 8;
        }

        var conditions = [truffleHunter, potionMaster, transfiguration, alchemistCollector, advancedPlacement, feverWithoutDawn];
        for (var i = 0; i < potionsAchievementNames.length; i++) {
            var achName = potionsAchievementNames[i];
            var ach = Game.Achievements[achName];
            if (ach && conditions[i] && !ach.won) {
                if (Game.JNE && Game.JNE.markAchievementWon) Game.JNE.markAchievementWon(achName);
                if (!Game.Achievements[achName].won) Game.Win(achName);
            }
        }
    } finally {
        checkAndAwardPotionsAchievements._inProgress = false;
    }
}

// =====================================================================
// Debug commands
// =====================================================================
window.potionsDebug = {
    unlockAll: function() {
        G.debugMode = true;
        for (var i = 0; i < REAGENTS.length; i++) {
            var r = REAGENTS[i];
            r.unlocked = true;
            G.unlockedReagents[r.id] = true;
            G.reagents[r.id] = G.maxReagents;
        }
        for (var i = 0; i < POTIONS.length; i++) {
            var p = POTIONS[i];
            if (p.prestigeLocked) continue; // Don't touch locked prestige potions
            p.unlocked = true;
            p.discovered = true;
        }

        PotionsM._buildReagents();
        PotionsM._buildCatalog();
        PotionsM._refreshSlots();
        PotionsM._renderSelectedReagents();
        
        console.log('[Potions Debug] All reagents and potions unlocked, brew times sped up.');
    },
  
    unlockReagentsOnly: function() {
        G.debugMode = true;
        for (var i = 0; i < REAGENTS.length; i++) {
            var r = REAGENTS[i];
            r.unlocked = true;
            G.unlockedReagents[r.id] = true;
        }

        PotionsM._buildReagents();
        PotionsM._buildCatalog();
        PotionsM._refreshSlots();
        PotionsM._renderSelectedReagents();

        console.log('[Potions Debug] All reagents unlocked and filled to ' + G.maxReagents + '! Potions remain locked.');
    },

    unlockPotion: function(potionIdOrName) {
        var potion = POTIONS.find(function(p) { return p.id === potionIdOrName || p.name === potionIdOrName; });
        if (potion) {
            potion.unlocked = true;
            PotionsM._buildCatalog();
            console.log('[Potions Debug] Unlocked potion: ' + potion.name);
        } else {
            console.log('[Potions Debug] Potion not found: ' + potionIdOrName);
        }
    },
    
    unlockPrestige: function() {
        G.unlockedPrestige = G.unlockedPrestige || [];
        for (var i = 0; i < POTIONS.length; i++) {
            var p = POTIONS[i];
            if (!p.prestige) continue;
            p.prestigeLocked = false;
            p.discovered = true;
            p.unlocked = true;
            if (G.unlockedPrestige.indexOf(p.id) === -1) G.unlockedPrestige.push(p.id);
        }
        G.prestigeCount = Math.max(G.prestigeCount || 0, 10);

        // Generate and apply random recipes for all active potions (including newly unlocked prestige)
        var activePots = [];
        for (var i = 0; i < POTIONS.length; i++) { if (isActivePotion(POTIONS[i])) activePots.push(POTIONS[i]); }
        var newMap = generateRandomRecipes(activePots);
        G.recipeMap = encodeRecipeMap(newMap, activePots);
        applyRecipeMap(newMap);

        PotionsM._buildCatalog();
        PotionsM._checkPrestigeButton();
    },

    removeAchievements: removePotionsAchievements,
    createAchievements: createPotionsAchievements,
    getAchievementState: getAchievementState
};


PotionsM._restorePendingBuffs();

})();
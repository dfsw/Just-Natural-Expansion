//=====================================================================================
// CCSE BRIDGE - Cookie Clicker Script Extender Compatibility Layer
// This file provides compatibility between Just Natural Expansion mod and CCSE
// Loaded only when CCSE is detected, completely isolated from core mod logic
//=====================================================================================

(function() {
    'use strict';
    
    // CCSE Bridge namespace
    var CCSEBridge = {
        // Configuration
        config: {
            modName: 'Just Natural Expansion',
            modVersion: '0.0.1',
            debugMode: false
        },
        
        // State tracking
        state: {
            isInitialized: false,
            isCCSELoaded: false,
            ccseVersion: null,
            upgradesProcessed: 0,
            lastProcessTime: 0
        },
        
        // Event listeners for vanilla mod events - store references for cleanup
        eventListeners: {
            upgradeCreated: null,
            modInitialized: null,
            save: null,
            load: null
        },
        
        // Initialize the bridge
        init: function() {
            if (this.state.isInitialized) {
                console.log('CCSE Bridge: Already initialized');
                return;
            }

            console.log('CCSE Bridge: Initializing...');

            try {
                // Detect CCSE
                if (!this.detectCCSE()) {
                    console.log('CCSE Bridge: CCSE not detected, bridge not needed');
                    return;
                }

                // Setup event system
                this.setupEventSystem();

                // Install defensive measures
                this.installDefensiveMeasures();

                // Setup CCSE hooks
                this.setupCCSEHooks();

                // Mark as initialized
                this.state.isInitialized = true;

                console.log('CCSE Bridge: Successfully initialized for CCSE version', this.state.ccseVersion);

            } catch (e) {
                console.error('CCSE Bridge: Failed to initialize:', e);
            }
        },

        // Manual initialization for when CCSE loads after bridge
        initWhenCCSEAvailable: function() {
            if (this.state.isInitialized) {
                return;
            }
            
            if (this.detectCCSE()) {
                this.init();
            }
        },


        
        // Detect if CCSE is present and loaded
        detectCCSE: function() {
            try {
                if (typeof CCSE !== 'undefined' && CCSE.isLoaded) {
                    this.state.isCCSELoaded = true;
                    this.state.ccseVersion = CCSE.version || 'unknown';
                    console.log('CCSE Bridge: CCSE detected, version:', this.state.ccseVersion);
                    return true;
                }
                
                console.log('CCSE Bridge: CCSE not detected');
                return false;
                
            } catch (e) {
                console.error('CCSE Bridge: Error detecting CCSE:', e);
                return false;
            }
        },
        
        // Setup event system for vanilla mod integration
        setupEventSystem: function() {
            try {
                // Ensure Game object exists
                if (typeof Game === 'undefined') {
                    console.error('CCSE Bridge: Game object not found. Ensure Cookie Clicker is fully loaded before the bridge.');
                    return;
                }
                
                // Register our event listeners
                this.registerEventListeners();
                
                console.log('CCSE Bridge: Event system setup complete');
                
            } catch (e) {
                console.error('CCSE Bridge: Failed to setup event system:', e);
            }
        },
        
        // Register event listeners for vanilla mod events
        registerEventListeners: function() {
            try {
                // Store bound function references for later cleanup
                this.eventListeners.upgradeCreated = this.handleUpgradeCreated.bind(this);
                this.eventListeners.modInitialized = this.handleModInitialized.bind(this);
                this.eventListeners.save = this.handleSave.bind(this);
                this.eventListeners.load = this.handleLoad.bind(this);

                // Register the listeners
                Game.on('upgradeCreated', this.eventListeners.upgradeCreated);
                Game.on('modInitialized', this.eventListeners.modInitialized);
                Game.on('save', this.eventListeners.save);
                Game.on('load', this.eventListeners.load);

                console.log('CCSE Bridge: Event listeners registered');

            } catch (e) {
                console.error('CCSE Bridge: Failed to register event listeners:', e);
            }
        },
        
        // Handle upgrade creation events
        handleUpgradeCreated: function(data) {
            if (!this.state.isCCSELoaded || !data || !data.upgrade) return;
            
            try {
                this.applyUpgradeCompatibility(data.upgrade);
                this.state.upgradesProcessed++;
                
                if (this.config.debugMode) {
                    console.log('CCSE Bridge: Applied compatibility to upgrade:', data.upgrade.name);
                }
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to handle upgrade creation:', e);
            }
        },
        
        // Handle mod initialization events
        handleModInitialized: function(data) {
            if (!this.state.isCCSELoaded) return;
            
            try {
                console.log('CCSE Bridge: Mod initialized, applying compatibility to existing upgrades');
                this.applyCompatibilityToAllUpgrades();
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to handle mod initialization:', e);
            }
        },
        
        // Handle save events
        handleSave: function(data) {
            if (!this.state.isCCSELoaded) return;
            
            try {
                // Ensure all upgrades have CCSE compatibility before saving
                this.ensureAllUpgradesCompatible();
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to handle save:', e);
            }
        },
        
        // Handle load events
        handleLoad: function(data) {
            if (!this.state.isCCSELoaded) return;
            
            try {
                // Apply compatibility to upgrades after save load
                setTimeout(function() {
                    this.applyCompatibilityToAllUpgrades();
                }.bind(this), 100);
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to handle load:', e);
            }
        },
        
        // Apply CCSE compatibility to a single upgrade
        applyUpgradeCompatibility: function(upgrade) {
            if (!upgrade || !upgrade.name) return;
            
            try {
                // Add CCSE-expected properties
                upgrade.CCSE = true;
                upgrade.vanilla = 0;
                
                // Ensure text properties are strings (CCSE expects this)
                var textProps = ['name', 'desc', 'ddesc'];
                for (var i = 0; i < textProps.length; i++) {
                    var prop = textProps[i];
                    if (upgrade[prop] !== undefined && upgrade[prop] !== null) {
                        upgrade[prop] = String(upgrade[prop]);
                    } else {
                        upgrade[prop] = '';
                    }
                }
                
                // Add safe string methods if missing (prevents CCSE crashes)
                if (!upgrade.name || typeof upgrade.name.replace !== 'function') {
                    upgrade.name = String(upgrade.name || '');
                }
                
                // Add CCSE-expected methods if missing
                this.addCCSEMethods(upgrade);
                
                // Mark as processed
                upgrade._CCSECompatible = true;
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to apply compatibility to', upgrade.name, ':', e);
            }
        },
        
        // Add CCSE-expected methods to an upgrade
        addCCSEMethods: function(upgrade) {
            try {
                // Add missing methods that CCSE expects
                if (!upgrade.isVaulted) {
                    upgrade.isVaulted = function() { return false; };
                }
                
                if (!upgrade.canVault) {
                    upgrade.canVault = function() { return false; };
                }
                
                if (!upgrade.vault) {
                    upgrade.vault = function() { return false; };
                }
                
                if (!upgrade.visible) {
                    upgrade.visible = function() { return this.unlocked; };
                }
                
                if (!upgrade.hidden) {
                    upgrade.hidden = function() { return !this.unlocked; };
                }
                
                if (!upgrade.available) {
                    upgrade.available = function() { return this.unlocked && !this.bought; };
                }
                
                if (!upgrade.canAfford) {
                    upgrade.canAfford = function() { 
                        return Game.cookies >= (this.getPrice ? this.getPrice() : this.price); 
                    };
                }
                
                // Add CCSE-expected properties
                upgrade.className = 'upgrade';
                upgrade.type = 'upgrade';
                upgrade.poolType = upgrade.pool || 'cookie';
                upgrade.category = 'cookie';
                
                // Ensure identifier properties exist
                if (!upgrade.jsName) {
                    upgrade.jsName = this.safeJSName(upgrade.name);
                }
                
                if (!upgrade.safeName) {
                    upgrade.safeName = this.safeJSName(upgrade.name);
                }
                
                if (!upgrade.identifier) {
                    upgrade.identifier = this.safeJSName(upgrade.name);
                }
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to add CCSE methods to', upgrade.name, ':', e);
            }
        },
        
        // Convert upgrade name to JavaScript-safe identifier
        safeJSName: function(name) {
            if (!name || typeof name !== 'string') return 'upgrade';
            
            return name
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_')            // Replace spaces with underscores
                .replace(/^[0-9]/, '_$&')       // Prefix with underscore if starts with number
                .substring(0, 50);              // Limit length
        },
        
        // Apply compatibility to all existing upgrades
        applyCompatibilityToAllUpgrades: function() {
            if (!this.state.isCCSELoaded) return;
            
            try {
                var count = 0;
                var startTime = Date.now();
                
                // Get mod upgrade names if available
                var modUpgradeNames = [];
                if (typeof getModUpgradeNames === 'function') {
                    modUpgradeNames = getModUpgradeNames();
                }
                
                // Process all upgrades in Game.Upgrades
                for (var name in Game.Upgrades) {
                    var upgrade = Game.Upgrades[name];
                    if (upgrade && !upgrade._CCSECompatible) {
                        this.applyUpgradeCompatibility(upgrade);
                        count++;
                    }
                }
                
                this.state.upgradesProcessed += count;
                this.state.lastProcessTime = Date.now() - startTime;
                
                console.log('CCSE Bridge: Applied compatibility to', count, 'upgrades in', this.state.lastProcessTime, 'ms');
                
            } catch (e) {
                console.error('CCSE Bridge: Failed to apply compatibility to all upgrades:', e);
            }
        },
        
        // Ensure all upgrades are compatible before save
        ensureAllUpgradesCompatible: function() {
            if (!this.state.isCCSELoaded) return;
            
            try {
                var count = 0;
                
                for (var name in Game.Upgrades) {
                    var upgrade = Game.Upgrades[name];
                    if (upgrade && !upgrade._CCSECompatible) {
                        this.applyUpgradeCompatibility(upgrade);
                        count++;
                    }
                }
                
                if (count > 0) {
                    console.log('CCSE Bridge: Ensured compatibility for', count, 'upgrades before save');
                }
                
            } catch (e) {
                console.warn('CCSE Bridge: Failed to ensure all upgrades compatible:', e);
            }
        },
        
        // Setup CCSE post-load hooks
        setupCCSEHooks: function() {
            if (!this.state.isCCSELoaded || !CCSE.postLoadHooks) return;
            
            try {
                var self = this;
                CCSE.postLoadHooks.push(function() {
                    console.log('CCSE Bridge: CCSE postLoadHooks fired');
                    self.handleCCSEPostLoad();
                });
                
                console.log('CCSE Bridge: CCSE hooks setup complete');
                
            } catch (e) {
                console.error('CCSE Bridge: Failed to setup CCSE hooks:', e);
            }
        },
        
        // Handle CCSE post-load events
        handleCCSEPostLoad: function() {
            try {
                console.log('CCSE Bridge: Processing CCSE post-load events');
                
                // Apply compatibility to all upgrades
                this.applyCompatibilityToAllUpgrades();
                
                // Refresh store if available
                if (Game.RefreshStore) {
                    Game.RefreshStore();
                }
                
                console.log('CCSE Bridge: CCSE post-load processing complete');
                
            } catch (e) {
                console.error('CCSE Bridge: Failed to handle CCSE post-load:', e);
            }
        },
        
        // Install defensive measures against CCSE interference
        installDefensiveMeasures: function() {
            if (!this.state.isCCSELoaded) return;
            
            try {
                console.log('CCSE Bridge: Installing defensive measures...');
                
                // Protect BeautifyInText
                this.protectBeautifyInText();
                
                // Protect BeautifyAll
                this.protectBeautifyAll();
                
                // Protect eval against CCSE code generation errors
                this.protectEval();
                
                console.log('CCSE Bridge: Defensive measures installed');
                
            } catch (e) {
                console.error('CCSE Bridge: Failed to install defensive measures:', e);
            }
        },
        
        // Protect BeautifyInText function
        protectBeautifyInText: function() {
            if (typeof BeautifyInText === 'function' && !BeautifyInText._CCSEProtected) {
                var originalBeautifyInText = BeautifyInText;
                
                window.BeautifyInText = function(str, maxLength) {
                    try {
                        // Ensure str is a string with replace method
                        if (str === null || str === undefined) {
                            str = '';
                        } else {
                            str = String(str);
                        }
                        
                        return originalBeautifyInText.call(this, str, maxLength);
                    } catch (e) {
                        console.warn('CCSE Bridge: BeautifyInText error caught and handled:', e);
                        return String(str || '');
                    }
                };
                
                BeautifyInText._CCSEBridgeProtected = true;
                console.log('CCSE Bridge: BeautifyInText protected');
            }
        },
        
        // Protect BeautifyAll function
        protectBeautifyAll: function() {
            if (typeof BeautifyAll === 'function' && !BeautifyAll._CCSEProtected) {
                var originalBeautifyAll = BeautifyAll;
                
                window.BeautifyAll = function() {
                    try {
                        return originalBeautifyAll.apply(this, arguments);
                    } catch (e) {
                        console.warn('CCSE Bridge: BeautifyAll error caught and handled:', e);
                        return {};
                    }
                };
                
                BeautifyAll._CCSEBridgeProtected = true;
                console.log('CCSE Bridge: BeautifyAll protected');
            }
        },
        
        // Protect eval function against CCSE code generation errors
        protectEval: function() {
            if (!window._originalEval) {
                window._originalEval = window.eval;
                window.eval = function(code) {
                    try {
                        return window._originalEval.call(this, code);
                    } catch (e) {
                        if (e instanceof SyntaxError && typeof code === 'string') {
                            console.warn('CCSE Bridge: CCSE syntax error caught and handled');
                            return undefined;
                        }
                        console.error('CCSE Bridge: Eval error caught:', e.name, e.message);
                        return undefined;
                    }
                };
                console.log('CCSE Bridge: eval() protected against CCSE code generation errors');
            }
        },
        
        // Get bridge status information
        getStatus: function() {
            var activeListeners = 0;
            for (var event in this.eventListeners) {
                if (this.eventListeners[event] !== null) {
                    activeListeners++;
                }
            }
            
            return {
                isInitialized: this.state.isInitialized,
                isCCSELoaded: this.state.isCCSELoaded,
                ccseVersion: this.state.ccseVersion,
                upgradesProcessed: this.state.upgradesProcessed,
                lastProcessTime: this.state.lastProcessTime,
                eventListeners: activeListeners
            };
        },
        
        // Enable/disable debug mode
        setDebugMode: function(enabled) {
            this.config.debugMode = enabled;
            console.log('CCSE Bridge: Debug mode', enabled ? 'enabled' : 'disabled');
        },
        
        // Cleanup and reset bridge
        cleanup: function() {
            try {
                this.removeEventListeners();

                // Reset state
                this.state.isInitialized = false;
                this.state.upgradesProcessed = 0;

                // Reset event listeners
                this.eventListeners = {
                    upgradeCreated: null,
                    modInitialized: null,
                    save: null,
                    load: null
                };

                console.log('CCSE Bridge: Cleanup complete');

            } catch (e) {
                console.error('CCSE Bridge: Failed to cleanup:', e);
            }
        },

        // Safely remove event listeners
        removeEventListeners: function() {
            try {
                if (typeof Game === 'undefined' || !Game._listeners) {
                    return;
                }

                for (var event in this.eventListeners) {
                    var listener = this.eventListeners[event];
                    var eventArray = Game._listeners[event];

                    if (listener && eventArray && Array.isArray(eventArray)) {
                        var index = eventArray.indexOf(listener);
                        if (index !== -1) {
                            eventArray.splice(index, 1);
                        }
                    }
                }

            } catch (e) {
                console.warn('CCSE Bridge: Error during event listener cleanup:', e);
            }
        }
    };
    
            // Auto-initialize when loaded
        if (typeof CCSE !== 'undefined' && CCSE.isLoaded) {
            console.log('CCSE Bridge: CCSE detected immediately, initializing...');
            CCSEBridge.init();
        } else {
            console.log('CCSE Bridge: CCSE not detected, will check periodically');
            // Simple periodic check for CCSE availability
            setInterval(function() {
                CCSEBridge.initWhenCCSEAvailable();
            }, 1000);
        }
    
            // Prevent multiple bridge instances
        if (window.CCSEBridge && window.CCSEBridge !== CCSEBridge) {
            console.warn('CCSE Bridge: Multiple bridge instances detected, cleaning up previous instance');
            
            try {
                if (typeof window.CCSEBridge.cleanup === 'function') {
                    window.CCSEBridge.cleanup();
                }
            } catch (e) {
                console.warn('CCSE Bridge: Error cleaning up previous instance:', e);
            }
        }

    // Expose bridge globally for manual initialization if needed
    window.CCSEBridge = CCSEBridge;
    
    console.log('CCSE Bridge: Loaded successfully');
    
})();

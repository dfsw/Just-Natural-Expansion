// Just Natural Expansion - CCMM Loader Wrapper

if(JustNaturalExpansion === undefined) var JustNaturalExpansion = {};

JustNaturalExpansion.name = 'Just Natural Expansion';
JustNaturalExpansion.version = '0.0.1';
JustNaturalExpansion.GameVersion = '2.052';

JustNaturalExpansion.launch = function(){
    JustNaturalExpansion.init = function(){
        JustNaturalExpansion.isLoaded = 1;
        
        // Load the actual mod content
        loadModContent();
        
        if (Game.prefs.popups) Game.Popup('Just Natural Expansion loaded!');
        else Game.Notify('Just Natural Expansion loaded!', '', '', 1, 1);
    }
    
    function loadModContent() {
        // Create script element to load the mod
        var script = document.createElement('script');
        script.src = 'https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/JustNaturalExpansion.js';
        
        script.onload = function() {
            console.log('Just Natural Expansion content loaded successfully');
        };
        
        script.onerror = function() {
            console.error('Failed to load Just Natural Expansion content');
            // Fallback: try to load with different method
            loadModFallback();
        };
        
        // Append to document head
        document.head.appendChild(script);
    }
    
    function loadModFallback() {
        console.log('Trying fallback loading method...');
        
        // Alternative loading method using fetch
        fetch('https://raw.githubusercontent.com/dfsw/Just-Natural-Expansion/refs/heads/main/JustNaturalExpansion.js')
            .then(response => response.text())
            .then(code => {
                console.log('Fetched mod code, executing...');
                try {
                    // Execute the code directly
                    eval(code);
                    console.log('Just Natural Expansion loaded via fallback method');
                } catch (e) {
                    console.error('Failed to execute mod code:', e);
                }
            })
            .catch(error => {
                console.error('Failed to fetch mod code:', error);
            });
            }
    
    JustNaturalExpansion.init();
}

// Register the mod directly since we don't need CCSE
Game.registerMod(JustNaturalExpansion.name, JustNaturalExpansion);

// Launch immediately since we don't need to wait for CCSE
JustNaturalExpansion.launch();
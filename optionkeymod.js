/*
A little lightweight mod that removes the nagging control click issue that plagues Mac players of Cookie Clicker.
Replaces control key input with Option key input. So hold down option and shift + harvest will harvest all mature plants.
This does not extend to things like control S to save as thats a different binding in the vanilla game. 
*/

(function() {
    'use strict';
    
    Game.registerMod('OptionKeyMod', {
        name: 'Option Key Mod',
        version: '1.0.0',
        
        init: function() {
            var optionKeyPressed = false;
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Alt') optionKeyPressed = true;
            });
            
            document.addEventListener('keyup', function(e) {
                if (e.key === 'Alt') optionKeyPressed = false;
            });
            
            Game.registerHook('logic', function() {
                Game.keys[17] = optionKeyPressed;
            });
        }
    });
})();

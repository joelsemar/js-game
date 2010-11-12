var events = function(){
    var eventKeydown = function(event){
        event = event || window.event;
        
		app.firstPlayer.keysPressed[event.keyCode] = true;
        
        // check here so we can stop propogation appropriately
        if (utils.indexOf([utils.code('up'), utils.code('down'), utils.code('right'),
		                   utils.code('left'), utils.code(' '), utils.code('B'), utils.code('F'),
						   utils.code('W'), utils.code('D'), utils.code('S'), utils.code('A')],
						   event.keyCode) != -1) {
            if (event.preventDefault) 
                event.preventDefault();
            return false;
        }
    };
    
    var eventKeypress = function(event){
        event = event || window.event;
        if (utils.indexOf([utils.code('up'), utils.code('down'), utils.code('right'), utils.code('left'), utils.code(' ')], event.keyCode || event.which) != -1) {
            if (event.preventDefault) 
                event.preventDefault();
            return false;
        }
    };
    
    var eventKeyup = function(event){
        event = event || window.event;
        app.firstPlayer.keysPressed[event.keyCode] = false;
        switch (event.keyCode) {
            case utils.code('B'):
                utils.removeStylesheet("ASTEROIDSYEAH");
                break;
        }
        if (utils.indexOf([utils.code('up'), utils.code('down'), utils.code('right'), utils.code('left'), utils.code(' '), utils.code('B')], event.keyCode) != -1) {
            if (event.preventDefault) 
                event.preventDefault();
            return false;
        }
    };
    
    return {
    
        addEvents: function(){
            utils.addEvent(window, 'keyup', eventKeyup);
            utils.addEvent(window, 'keydown', eventKeydown, app);
            utils.addEvent(window, 'keypress', eventKeypress);
			
            
        },
        
        destroy: function destroy(){
            utils.removeEvent(window, 'keydown', eventKeydown);
            utils.removeEvent(window, 'keypress', eventKeypress);
            utils.removeEvent(window, 'keyup', eventKeyup);
            isRunning = false;
            utils.removeStylesheet("ASTEROIDSYEAH");
            utils.removeClass(document.body, 'ASTEROIDSYEAH');
            app.canvas.parentNode.removeChild(app.canvas);
            app.navigation.parentNode.removeChild(app.navigation);
        }
    }
}();

var events = function(){
    var eventKeydown = function(event){
        event = event || window.event;
        app.keysPressed[event.keyCode] = true;
        
        switch (event.keyCode) {
            case utils.code(' '):
                app.firedAt = 1;
                break;
        }
        
        // check here so we can stop propogation appropriately
        if (utils.indexOf([utils.code('up'), utils.code('down'), utils.code('right'), utils.code('left'), utils.code(' '), utils.code('B')], event.keyCode) != -1) {
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
        app.keysPressed[event.keyCode] = false;
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
    
        addEvents: function(scope){
            utils.addEvent(window, 'keyup', eventKeyup);
            utils.addEvent(window, 'keydown', eventKeydown, scope);
            utils.addEvent(window, 'keypress', eventKeypress);
            
        },
        
        destroy: function destroy(scope){
            utils.removeEvent(window, 'keydown', eventKeydown);
            utils.removeEvent(window, 'keypress', eventKeypress);
            utils.removeEvent(window, 'keyup', eventKeyup);
            isRunning = false;
            utils.removeStylesheet("ASTEROIDSYEAH");
            utils.removeClass(document.body, 'ASTEROIDSYEAH');
            scope.canvas.parentNode.removeChild(scope.canvas);
            scope.navigation.parentNode.removeChild(scope.navigation);
        }
    }
}();

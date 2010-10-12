var app;
function Asteroids(){


    // configuration directives are placed in local variables
    var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    this.w = w;
    this.h = h;
    var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS', 'META', 'STYLE', 'LINK'];
    
    this.creepImage = new Image();
    this.creepImage.src = 'static/images/alien.png'
    var FPS = utils.isIE ? 30 : 50;
    var particleSpeed = 400;
    var timeBetweenBlink = 250; // milliseconds between enemy blink
    var timeBetweenEnemyUpdate = 400;
    this.maxBullets = utils.isIE ? 10 : 50;
    
    /*var highscoreURL = "http://asteroids.glonk.se/highscores.html";
     var closeURL = "http://asteroids.glonk.se/close.png";*/
    // points
    this.enemiesKilled = 0;
    
    // generated every 10 ms
    var that = this;
    this.updated = {
        enemies: new Date().getTime(), // the time before the enemyIndex was last updated
        blink: {
            time: 0,
            isActive: false
        }
    };
    this.players = [];
    this.firstPlayer = new Player(1)
    this.players.push(this.firstPlayer);
    this.bullets = [];
    this.bombs = [];
    this.creeps = [];
    this.level = 0;
    this.creep_levels = [5, 7, 10, 15, 20, 25, 32, 41, 55]
    // Particles are created when something is shot
    this.particles = [];
    /*
     == Setup ==
     */
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', w);
    this.canvas.setAttribute('height', h);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.style.position = "fixed"
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.bottom = "0px";
    this.canvas.style.right = "0px";
    this.canvas.style.zIndex = "10000";
    
    /*        with (this.canvas.style) {
     
     width = w + "px";
     height = h + "px";
     position = "fixed";
     top = "0px";
     left = "0px";
     bottom = "0px";
     right = "0px";
     zIndex = "10000";
     }*/
    if (typeof G_vmlCanvasManager != 'undefined') {
        this.canvas = G_vmlCanvasManager.initElement(this.canvas);
        if (!this.canvas.getContext) {
            alert("So... you're using IE?  Please join me at http://github.com/erkie/erkie.github.com if you think you can help");
        }
    }
    else {
        if (!this.canvas.getContext) {
            alert('This program does not yet support your browser. Please join me at http://github.com/erkie/erkie.github.com if you think you can help');
        }
    }
    
    //addEvent(this.canvas, 'mousedown', function(){
    //       destroy.apply(that);
    //      });
    
    document.body.appendChild(this.canvas);
    
    
    // navigation wrapper element
    this.navigation = document.createElement('div');
    this.navigation.className = "ASTEROIDSYEAH";
    with (this.navigation.style) {
        font = "Arial,sans-serif";
        position = "fixed";
        zIndex = "10001";
        bottom = "10px";
        right = "10px";
        textAlign = "right";
    }
    this.navigation.innerHTML = "(click anywhere to exit/press esc to quit) ";
    document.body.appendChild(this.navigation);
    
    // points
    this.points = document.createElement('span');
    this.points.style.font = "28pt Arial, sans-serif";
    this.points.style.fontWeight = "bold";
    this.points.className = "ASTEROIDSYEAH";
    this.navigation.appendChild(this.points);
    
    this.points.innerHTML = "0";
    
    //life
    
    this.life = document.getElementById('life');
    this.life_value = document.getElementById('life-value');
    this.life.style.font = "28pt Arial, sans-serif";
    this.life.style.fontWeight = "bold";
    this.life.className = "ASTEROIDSYEAH";
    this.navigation.appendChild(this.life);
    
    this.kills = document.getElementById('kills');
    this.kills_value = document.getElementById('kills-value');
    this.kills.style.font = "28pt Arial, sans-serif";
    this.kills.style.fontWeight = "bold";
    this.kills.className = "ASTEROIDSYEAH";
    this.navigation.appendChild(this.kills);
    
    this.debug = document.createElement('span');
    this.debug.className = "ASTEROIDSYEAH";
    this.debug.innerHTML = "";
    this.navigation.appendChild(this.debug);
    
    events.addEvents(that);
    addContext(that, h, w)
    
    utils.addClass(document.body, 'ASTEROIDSYEAH');
    
    var isRunning = true;
    var lastUpdate = new Date().getTime();
    var hasKilled = false;
    this.forceChange = false;
    this.update = function(){
        this.now = new Date().getTime();
        this.forceChange = false;
        this.tDelta = (this.now - lastUpdate) / 1000;
        lastUpdate = this.now;
        
        //just a stand in for a 'waves' approach, when there are 0 creeps,.. create 10
        if (!this.creeps.length) {
    		var num_creeps  = this.creep_levels[this.level]
			if (!num_creeps){
				alert("Aren't you special?")
				return;
			}
			for (var i = 0; i < num_creeps; i++) {
                var randX = Math.floor(Math.random() * w);
                var randY = Math.floor(Math.random() * h);
                var newCreepPos = new Vector(randX, randY);
                this.creeps.push(new Creep(newCreepPos, this.firstPlayer));
            }
            
            this.level += 1;
            if (this.level > 1) {
                for (var p = 0, player; player = this.players[p]; p++) {
                    player.life = Math.floor(this.firstPlayer.life * 1.5);
                    player.last_bombed = false;
                }
                
                
            }
            
            
        }
        
        for (var p = 0, player = this.players[p]; p < this.players.length; p++) {
            player.update();
        }
        
        for (var b = 0; b < this.bullets.length; b++) {
            this.bullets[b].update();
        }
        
        for (var b = 0; b < this.bombs.length; b++) {
            this.bombs[b].update();
        }
        
		for (var c = 0; c < this.creeps.length; c++) {
            this.creeps[c].update();
        }        
        
        // update particles position
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * this.tDelta * Math.random()));
            
            if (this.now - this.particles[i].cameAlive > 1000) {
                utils.arrayRemove(this.particles, i);
                i--;
                that.forceChange = true;
                continue;
            }
        }
        // the following is jus there so I can call app.redraw(true) from the console
        this.redraw = function(proceed){
            redraw(app, proceed)
        }
        this.redraw((that.forceChange || this.bullets.length || this.particles.length || this.creeps.length))
        setTimeout(function(){
            app.update.call(app)
        }, 1000 / FPS);
        
    }
}

function init(){
    if (window.ActiveXObject) {
        try {
            var xamlScript = document.createElement('script');
            xamlScript.setAttribute('type', 'text/xaml');
            xamlScript.textContent = '<?xml version="1.0"?><Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas>';
            document.getElementsByTagName('head')[0].appendChild(xamlScript);
        } 
        catch (e) {
        }
        
        var script = document.createElement("script");
        script.setAttribute('type', 'text/javascript');
        script.onreadystatechange = function(){
            if (script.readyState == 'loaded' || script.readyState == 'completed') {
                app = new Asteroids();
            }
        };
        script.src = "excanvas.js";
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    else 
        app = new Asteroids();
    setTimeout(function(){
        app.update.call(app)
    }, 1000);
};

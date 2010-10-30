var app;
function Asteroids(){


    // configuration directives are placed in local variables
    var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    this.w = w;
    this.h = h;
    var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS', 'META', 'STYLE', 'LINK'];
    
    this.creepImage = new Image();
    this.creepImage.src = 'static/images/alien.png'
    var FPS = 32;
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
   
    this.bullets = [];
    this.bombs = [];
    this.creeps = [];
	this.items = [];
    this.level = 0;
    
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
    this.navigation.innerHTML = "(space to fire, 'b' for bombs, click anywhere to exit/press esc to quit) ";
    document.body.appendChild(this.navigation);
    
    //life
    
    this.life = document.getElementById('life');
    this.life_value = document.getElementById('life-value');
    this.life.style.font = "28pt Arial, sans-serif";
    this.life.style.fontWeight = "bold";
    this.navigation.appendChild(this.life);
    
    this.kills = document.getElementById('kills');
    this.kills_value = document.getElementById('kills-value');
    this.kills.style.font = "28pt Arial, sans-serif";
    this.kills.style.fontWeight = "bold";
    this.navigation.appendChild(this.kills);
    
    this.debug = document.createElement('span');
    this.debug.innerHTML = "";
    this.navigation.appendChild(this.debug);
    
    events.addEvents(that);
    addContext(that, h, w)
    
    
    var isRunning = true;
    var lastUpdate = new Date().getTime();
    var hasKilled = false;
    this.forceChange = false;
    this.update = function(){
        this.now = new Date().getTime();
        this.forceChange = false;
        this.tDelta = (this.now - lastUpdate) / 1000;
        lastUpdate = this.now;
        
        if (!this.creeps.length) {
            var num_creeps = this.creep_levels[this.level]
            if (!num_creeps) {
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
		
		for (var i = 0; i < this.items.length; i++) {
            this.items[i].update();
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
        
        
    }
}
function GameManager(){
	
	var FPS = 50;
	app = new Asteroids();
	app.firstPlayer = new Player(1)
    app.players.push(app.firstPlayer);
	app.creep_levels = [7, 10, 15, 20, 25, 32, 41, 55]
	this.run = function(){
		setInterval(function(){
            app.update.call(app)
        }, 1000 / FPS);
	}
}
function init(){
    var gameManager = new GameManager();
	gameManager.run();
    
};

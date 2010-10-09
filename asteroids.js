var app;
function Asteroids(){


    // configuration directives are placed in local variables
    var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    var playerWidth = 20, playerHeight = 30;
    
    
    var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS', 'META', 'STYLE', 'LINK'];
    
    
    var FPS = utils.isIE ? 30 : 50;
    
    // units/second
    var acc = 300;
    var maxSpeed = 700;
    var creepMaxSpeed = 200;
    var rotSpeed = 360; // one rotation per second
    var particleSpeed = 400;
    
    var timeBetweenFire = 150; // how many milliseconds between shots
    var timeBetweenBlink = 250; // milliseconds between enemy blink
    var timeBetweenEnemyUpdate = 400;
    
    function bounceHeight(vec){
    
        var a = -(Math.PI / 2 - vec.angle())
        vec.setAngle(a)
        vec.mul(1.5)
    }
    
    function bounceWidth(vec){
        var a = -(Math.PI / 2 - vec.angle()) + Math.PI;
        vec.setAngle(a)
        vec.mul(1.5)
    }
    var maxBullets = utils.isIE ? 10 : 20;
    
    /*var highscoreURL = "http://asteroids.glonk.se/highscores.html";
     var closeURL = "http://asteroids.glonk.se/close.png";*/
    // points
    this.enemiesKilled = 0;
    
    // generated every 10 ms
    this.flame = {
        r: [],
        y: []
    };
    
    // blink style
    function addBlinkStyle(){
        utils.addStylesheet("ASTEROIDSYEAH", ".ASTEROIDSYEAHENEMY { outline: 2px dotted red; }");
    };
    
    var that = this;
    this.pos = new Vector(100, 100);
    this.lastPos = false;
    this.vel = new Vector(0, 0);
    this.dir = new Vector(0, 1);
    this.keysPressed = {};
    this.firedAt = false;
    this.updated = {
        enemies: new Date().getTime(), // the time before the enemyIndex was last updated
        flame: new Date().getTime(), // the time the flame was last updated
        blink: {
            time: 0,
            isActive: false
        }
    };
    this.scrollPos = new Vector(0, 0);
    
    this.bullets = [];
    this.creeps = [];
    // Enemies lay first in this.enemies, when they are shot they are moved to this.dieing
    this.enemies = [];
    this.dieing = [];
    this.totalEnemies = 0;
    
    // Particles are created when something is shot
    this.particles = [];
    
    this.creepImg = new Image();
    this.creepImg.src = 'static/images/alien.png'
    
    // things to shoot is everything textual and an element of type not specified in types AND not a navigation element (see further down)
    function updateEnemyIndex(){
        for (var i = 0, enemy; enemy = that.enemies[i]; i++) {
            utils.removeClass(enemy, "ASTEROIDSYEAHENEMY");
        }
        
        var all = document.body.getElementsByTagName('*');
        that.enemies = [];
        for (var i = 0; i < all.length; i++) {
            // elements with className ASTEROIDSYEAH are part of the "game"
            if (utils.indexOf(ignoredTypes, all[i].tagName) == -1 && hasOnlyTextualChildren(all[i]) && all[i].className != "ASTEROIDSYEAH") {
                all[i].aSize = utils.size(all[i]);
                that.enemies.push(all[i]);
                
                utils.addClass(all[i], "ASTEROIDSYEAHENEMY");
                
                // this is only for enemycounting
                if (!all[i].aAdded) {
                    all[i].aAdded = true;
                    that.totalEnemies++;
                }
            }
        }
    };
    updateEnemyIndex();
    
    function createFlames(){
        // Firstly create red flames
        that.flame.r = [[0, 0]];
        that.flame.y = [[0, 0]];
        
        var rWidth = playerWidth;
        var rIncrease = playerWidth * 0.1;
        for (var x = 0; x < rWidth; x += rIncrease) 
            that.flame.r.push([x, -utils.random(2, 7)]);
        that.flame.r.push([rWidth, 0]);
        
        // yellow flames
        var yWidth = playerWidth * 0.6;
        var yIncrease = yWidth * 0.2;
        for (var x = 0; x < yWidth; x += yIncrease) 
            that.flame.y.push([x, -utils.random(1, 4)]);
        that.flame.y.push([yWidth, 0]);
        
        // Center 'em
        var halfR = rWidth / 2, halfY = yWidth / 2;
        for (var i = 0; i < that.flame.r.length; i++) {
            that.flame.r[i][0] -= halfR;
            that.flame.r[i][1] -= playerHeight / 2;
        }
        
        for (var i = 0; i < that.flame.y.length; i++) {
            that.flame.y[i][0] -= halfY;
            that.flame.y[i][1] -= playerHeight / 2;
        }
    };
    createFlames();
    
    /*
     Misc operations
     */
    var cushion = 5;
    this.boundsCheck = function(obj){
        if (obj.pos.x > w) {
            //	bounceWidth(obj.dir);
            bounceWidth(obj.vel);
            obj.pos.x = w - cushion;
        }
        else 
            if (obj.pos.x < 0) {
                //	bounceWidth(obj.dir);
                bounceWidth(obj.vel);
                obj.pos.x = 0 + cushion;
            }
        if (obj.pos.y > h) {
            //	bounceHeight(obj.dir);
            bounceHeight(obj.vel);
            obj.pos.y = h + cushion;
        }
        else 
            if (obj.pos.y < 0) {
                //	bounceHeight(obj.dir);
                bounceHeight(obj.vel);
                obj.pos.y = 0 + cushion;
            }
    };
    
    
    function hasOnlyTextualChildren(element){
        return utils.hasOnlyTextualChildren(element);
    }
    
    window.hasOnlyTextualChildren = hasOnlyTextualChildren;
    
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
    
    this.debug = document.createElement('span');
    this.debug.className = "ASTEROIDSYEAH";
    this.debug.innerHTML = "";
    this.navigation.appendChild(this.debug);
    
    events.addEvents(that);
    
    /*
     Context operations
     */
    addContext(that, h, w, playerWidth)
    
    /*
     Game loop
     */
    utils.addParticles(this.pos, this.particles);
    utils.addClass(document.body, 'ASTEROIDSYEAH');
    
    var isRunning = true;
    var lastUpdate = new Date().getTime();
    var hasKilled = false;
    
    this.update = function(){
        that.forceChange = false;
        
        // ==
        // logic
        // ==
        var nowTime = new Date().getTime();
        this.tDelta = (nowTime - lastUpdate) / 1000;
        lastUpdate = nowTime;
        
        // check enemy index timer and update that if needed
        if (nowTime - this.updated.enemies > timeBetweenEnemyUpdate && hasKilled) {
            updateEnemyIndex();
            this.updated.enemies = nowTime;
            hasKilled = false;
        }
        if (this.creeps.length < 1) {
            var randX = Math.floor(Math.random() * 400);
            var randY = Math.floor(Math.random() * 400);
            var newCreepPos = new Vector(randX, randY);
            this.creeps.push(new Creep(newCreepPos, this));
        }
        
        // update flame and timer if needed
        var drawFlame = false;
        if (nowTime - this.updated.flame > 50) {
            createFlames();
            this.updated.flame = nowTime;
        }
        
        this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
        this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
        
        // update player
        // move forward
        if (this.keysPressed[utils.code('up')]) {
            this.vel.add(this.dir.mulNew(acc * this.tDelta));
            
            drawFlame = true;
        }
        else {
            // decrease speed of player
            this.vel.mul(0.96);
        }
        
        // rotate counter-clockwise
        if (this.keysPressed[utils.code('left')]) {
            that.forceChange = true;
            this.dir.rotate(utils.radians(rotSpeed * this.tDelta * -1));
        }
        
        // rotate clockwise
        if (this.keysPressed[utils.code('right')]) {
            that.forceChange = true;
            this.dir.rotate(utils.radians(rotSpeed * this.tDelta));
        }
        
        // fire
        if (this.keysPressed[utils.code(' ')] && nowTime - this.firedAt > timeBetweenFire) {
            this.bullets.push(new Bullet(this, nowTime));
            
            this.firedAt = nowTime;
            
            if (this.bullets.length > maxBullets) {
                utils.arrayRemove(this.bullets, 0);
				forcechange = true;
            }
        }
        
        
        
        if (this.keysPressed[utils.code('esc')]) {
            events.destroy(this);
            return;
        }
        
        // cap speed
        if (this.vel.len() > maxSpeed) {
            this.vel.setLength(maxSpeed);
        }
        // add velocity to player (physics)
        this.pos.add(this.vel.mulNew(this.tDelta));
        
        
        // check bounds X of player, if we go outside we scroll accordingly
        if (this.pos.x > w) {
            bounceWidth(this.vel);
            //window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
            this.pos.x = w - cushion;
        }
        else 
            if (this.pos.x < 0) {
                bounceWidth(this.vel);
                this.pos.x = 0 + cushion;
            }
        
        // check bounds Y
        if (this.pos.y > h) {
            bounceHeight(this.vel);
            this.pos.y = h - cushion;
        }
        else 
            if (this.pos.y < 0) {
                bounceHeight(this.vel);
                this.pos.y = 0 + cushion;
            }
        // update positions of bullets
        bulletHandler(this);
        
        // Remove all dieing elements
        for (var i = 0, enemy; enemy = this.dieing[i]; i++) {
            this.enemiesKilled++;
            
            try {
                enemy.parentNode.removeChild(enemy);
            } 
            catch (e) {
            }
            
            this.points.innerHTML = this.enemiesKilled * 10;
            this.points.title = this.enemiesKilled + "/" + this.totalEnemies;
            
            utils.arrayRemove(this.dieing, i);
            i--;
        }
        
        // update particles position
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * this.tDelta * Math.random()));
            
            if (nowTime - this.particles[i].cameAlive > 1000) {
                utils.arrayRemove(this.particles, i);
                i--;
                that.forceChange = true;
                continue;
            }
        }
        
        for (var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i]
            creep.pos.add(creep.vel.mulNew(this.tDelta));
            this.boundsCheck(creep);
            if (creep.vel.len() > creepMaxSpeed) {
                creep.vel.setLength(creepMaxSpeed);
            }
            
        }
        
        // ==
        // drawing
        // ==
        
        // clear
        
        this.redraw = function(proceed){
            redraw(that, drawFlame, proceed)
        }
        this.redraw((that.forceChange || this.bullets.length || this.particles.length || this.creeps.length || !this.pos.is(this.lastPos) || this.vel.len()))
        this.lastPos = this.pos;
        
        setTimeout(updateFunc, 1000 / FPS);
        
    }
    // Start timer
    var updateFunc = function(){
        that.update();
    };
    setTimeout(updateFunc, 1000 / FPS);
    
    
    
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
                new Asteroids();
            }
        };
        script.src = "excanvas.js";
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    else 
        for (var i = 0; i < 0; i++) {
            var d = document.createElement('div')
            d.className = 'block';
            d.style.width = Math.floor(Math.random() * 400) + 'px';
            d.style.height = Math.floor(Math.random() * 400) + 'px';
            d.style.marginLeft = Math.floor(Math.random() * 1100) + 'px';
            document.body.appendChild(d);
            
        }
    app = new Asteroids();
    
};

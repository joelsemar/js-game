var app;
function Asteroids(){
        
		
        // configuration directives are placed in local variables
		var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
        var playerWidth = 20, playerHeight = 30;
        var playerVerts = [[-1 * playerWidth / 2, -15], [playerWidth / 2, -15], [0, 15]];
        
        var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS', 'META', 'STYLE', 'LINK'];
        
        
        var FPS = utils.isIE ? 30 : 50;
        
        // units/second
        var acc = 300;
        var maxSpeed = 600;
        var rotSpeed = 360; // one rotation per second
        var bulletSpeed = 700;
        var particleSpeed = 400;
        
        var timeBetweenFire = 150; // how many milliseconds between shots
        var timeBetweenBlink = 250; // milliseconds between enemy blink
        var timeBetweenEnemyUpdate = 400;
        var bulletRadius = 2;
        
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
        
        // Enemies lay first in this.enemies, when they are shot they are moved to this.dieing
        this.enemies = [];
        this.dieing = [];
        this.totalEnemies = 0;
        
        // Particles are created when something is shot
        this.particles = [];
        
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
        function boundsCheck(vec){
            if (vec.x > w) 
                vec.x = 0;
            else 
                if (vec.x < 0) 
                    vec.x = w;
            
            if (vec.y > h) 
                vec.y = 0;
            else 
                if (vec.y < 0) 
                    vec.y = h;
        };
        
        function arrayRemove(array, from, to){
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
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
        with (this.canvas.style) {
			
            width = w + "px";
            height = h + "px";
            position = "fixed";
            top = "0px";
            left = "0px";
            bottom = "0px";
            right = "0px";
            zIndex = "10000";
        }
        
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
        this.ctx = this.canvas.getContext("2d");
        
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "black";
        
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
        
        // highscore link
        /*this.highscoreLink = document.createElement('a');
         this.highscoreLink.className = "ASTEROIDSYEAH";
         this.highscoreLink.style.display = "block";
         this.highscoreLink.href = '#';
         this.highscoreLink.innerHTML = "Help/Submit highscore?";
         this.navigation.appendChild(this.highscoreLink);
         
         this.highscoreLink.onclick = function() {
         if ( ! that.highscores ) {
         that.highscores = new Highscores();
         }
         that.highscores.show();
         return false;
         };*/
        this.debug = document.createElement('span');
        this.debug.className = "ASTEROIDSYEAH";
        this.debug.innerHTML = "";
        this.navigation.appendChild(this.debug);
        
		events.addEvents(that);
        
        /*
         Context operations
         */
        this.ctx.clear = function(){
            this.clearRect(0, 0, w, h);
        };
        
        this.ctx.clear();
        
        this.ctx.drawLine = function(xFrom, yFrom, xTo, yTo){
            this.beginPath();
            this.moveTo(xFrom, yFrom);
            this.lineTo(xTo, yTo);
            this.closePath();
            this.stroke();
        };
        
        this.ctx.drawRect = function(rect){
            var old = this.strokeStyle;
            this.strokeStyle = "red";
            this.strokeRect(rect.x, rect.y, rect.width, rect.height);
            this.strokeStyle = old;
        };
        
        this.ctx.drawLineFromLine = function(line){
            var oldC = this.strokeStyle;
            this.strokeStyle = "green";
            this.drawLine(line.p1.x, line.p1.y, line.p2.x, line.p2.y);
            this.strokeStyle = oldC;
        };
        
        this.ctx.tracePoly = function(verts){
            this.beginPath();
            this.moveTo(verts[0][0], verts[0][1]);
            for (var i = 1; i < verts.length; i++) 
                this.lineTo(verts[i][0], verts[i][1]);
            this.closePath();
        };
        
        this.ctx.drawPlayer = function(){
            this.save();
            this.translate(that.pos.x, that.pos.y);
            this.rotate(-that.dir.angle());
            this.tracePoly(playerVerts);
            this.stroke();
            this.restore();
        };
        
        this.ctx.drawBullet = function(pos){
            this.beginPath();
            this.arc(pos.x, pos.y, bulletRadius, 0, Math.PI * 2, true);
            this.closePath();
            this.fill();
        };
        
        var randomParticleColor = function(){
            return (['red', 'yellow'])[utils.random(0, 1)];
        };
        
        this.ctx.drawParticle = function(particle){
            var oldColor = this.strokeStyle;
            this.strokeStyle = randomParticleColor();
            this.drawLine(particle.pos.x, particle.pos.y, particle.pos.x - particle.dir.x * 10, particle.pos.y - particle.dir.y * 10);
            this.strokeStyle = oldColor;
        };
        
        this.ctx.drawFlames = function(flame){
            this.save();
            
            this.translate(that.pos.x, that.pos.y);
            this.rotate(-that.dir.angle());
            
            var oldColor = this.strokeStyle;
            this.strokeStyle = "red";
            this.tracePoly(flame.r);
            this.stroke();
            
            this.strokeStyle = "yellow";
            this.tracePoly(flame.y);
            this.stroke();
            
            this.strokeStyle = oldColor;
            this.restore();
        }
        
        /*
         Game loop
         */
        utils.addParticles(this.pos, this.particles);
        utils.addClass(document.body, 'ASTEROIDSYEAH');
        
        var isRunning = true;
        var lastUpdate = new Date().getTime();
        var hasKilled = false;
        
        this.update = function(){
            var forceChange = false;
            
            // ==
            // logic
            // ==
            var nowTime = new Date().getTime();
            var tDelta = (nowTime - lastUpdate) / 1000;
            lastUpdate = nowTime;
            
            // check enemy index timer and update that if needed
            if (nowTime - this.updated.enemies > timeBetweenEnemyUpdate && hasKilled) {
                updateEnemyIndex();
                this.updated.enemies = nowTime;
                hasKilled = false;
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
                this.vel.add(this.dir.mulNew(acc * tDelta));
                
                drawFlame = true;
            }
            else {
                // decrease speed of player
                this.vel.mul(0.96);
            }
            
            // rotate counter-clockwise
            if (this.keysPressed[utils.code('left')]) {
                forceChange = true;
                this.dir.rotate(utils.radians(rotSpeed * tDelta * -1));
            }
            
            // rotate clockwise
            if (this.keysPressed[utils.code('right')]) {
                forceChange = true;
                this.dir.rotate(utils.radians(rotSpeed * tDelta));
				
            }
            
            // fire
            if (this.keysPressed[utils.code(' ')] && nowTime - this.firedAt > timeBetweenFire) {
                this.bullets.push({
                    'dir': this.dir.cp(),
                    'pos': this.pos.cp(),
                    'startVel': this.vel.cp(),
                    'cameAlive': nowTime
                });
                
                this.firedAt = nowTime;
                
                if (this.bullets.length > maxBullets) {
                    arrayRemove(this.bullets, 0);
                }
            }
            
            // add blink
            if (this.keysPressed[utils.code('B')]) {
                forceChange = true;
                
                this.updated.blink.time += tDelta * 1000;
                if (this.updated.blink.time > timeBetweenBlink) {
                    if (this.updated.blink.isActive) {
                        utils.removeStylesheet("ASTEROIDSYEAH");
                        this.updated.blink.isActive = false;
                    }
                    else {
                        addBlinkStyle();
                        this.updated.blink.isActive = true;
                    }
                    this.updated.blink.time = 0;
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
            this.pos.add(this.vel.mulNew(tDelta));
            
			function bounceHeight(){
				
				var a = -(Math.PI/2 - app.vel.angle())
				//app.dir.setAngle(a)
                app.vel.setAngle(a)
				app.vel.mul(1.2)
			}
			
			function bounceWidth(){
			
				var a = -(Math.PI / 2 - app.vel.angle()) + Math.PI;
               // app.dir.setAngle(a)
                app.vel.setAngle(a)
                app.vel.mul(1.2)
            }
			
			var cushion = 5;
            // check bounds X of player, if we go outside we scroll accordingly
            if (this.pos.x > w) {
				bounceWidth();
                //window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
                this.pos.x = w - cushion;
            }
            else 
                if (this.pos.x < 0) {
                    bounceWidth();
                    this.pos.x = 0 + cushion ;
                }
            
            // check bounds Y
            if (this.pos.y > h) {
                bounceHeight();
                this.pos.y = h - cushion;
            }
            else 
                if (this.pos.y < 0) {
                    bounceHeight();
                    this.pos.y = 0  + cushion;
                }
            
            // update positions of bullets
            for (var i = 0; i < this.bullets.length; i++) {
                // bullets should only live for 2 seconds
                if (nowTime - this.bullets[i].cameAlive > 2000) {
                    arrayRemove(this.bullets, i);
                    i--;
                    continue;
                }
                
                var bulletVel = this.bullets[i].dir.setLengthNew(bulletSpeed * tDelta).add(this.bullets[i].startVel.mulNew(tDelta));
                var ray = new Line(this.bullets[i].pos.cp(), this.bullets[i].pos.addNew(bulletVel));
                ray.shift(this.scrollPos);
                
                this.bullets[i].pos.add(bulletVel);
                boundsCheck(this.bullets[i].pos);
                
                // check collisions
                var didKill = false;
                for (var x = 0, enemy; enemy = this.enemies[x]; x++) {
                    if (ray.intersectsWithRect(enemy.aSize)) {
                        hasKilled = true;
                        
                        // move to dieing
                        this.dieing.push(enemy);
                        arrayRemove(this.enemies, x);
                        
                        // the shot was a kill
                        didKill = true;
                        
                        // create particles at position
                        utils.addParticles(this.bullets[i].pos, this.particles);
                        break;
                    }
                }
                
                // If it hit something the bullet should go down with it
                if (didKill) {
                    arrayRemove(this.bullets, i);
                    i--;
                    continue;
                }
            }
            
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
                
                arrayRemove(this.dieing, i);
                i--;
            }
            
            // update particles position
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * tDelta * Math.random()));
                
                if (nowTime - this.particles[i].cameAlive > 1000) {
                    arrayRemove(this.particles, i);
                    i--;
                    forceChange = true;
                    continue;
                }
            }
            
            // ==
            // drawing
            // ==
            
            // clear
            if (forceChange || this.bullets.length != 0 || this.particles.length != 0 || !this.pos.is(this.lastPos) || this.vel.len() > 0) {
                this.ctx.clear();
                
                // draw player
                this.ctx.drawPlayer();
                
                // draw flames
                if (drawFlame) 
                    this.ctx.drawFlames(that.flame);
                
                // draw bullets
                for (var i = 0; i < this.bullets.length; i++) 
                    this.ctx.drawBullet(this.bullets[i].pos);
                
                // draw particles
                for (var i = 0; i < this.particles.length; i++) 
                    this.ctx.drawParticle(this.particles[i]);
            }
            this.lastPos = this.pos;
            
            setTimeout(updateFunc, 1000 / FPS);
        }
        
        // Start timer
        var updateFunc = function(){
            that.update.call(that);
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
	  for(var i=0;i<40;i++){
	  	var d = document.createElement('div')
		d.className = 'block';
		d.style.width =  Math.floor(Math.random()*400) + 'px';
		d.style.height = Math.floor(Math.random()*400) + 'px';
		d.style.marginLeft = Math.floor(Math.random()*1100) + 'px';
		document.body.appendChild(d);
		
	  }
      app =   new Asteroids();
    
};

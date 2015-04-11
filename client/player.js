function Player(id, width, height){
    var that = this;
    this.id = id;
    this.type = 'player';
    this.width = width || 20, this.height = height || 30;
    this.polyVerts = [[-1 * this.width / 2, -15], [this.width / 2, -15], [0, 15]];
    this.base_damage = 35;
    this.life = 500;
    this.kills = 0;
    
	var timeBetweenFire = 250; // how many milliseconds between shots
    var timeBetweenBombs = 5000;
	this.last_fired = false;
    this.last_bombed = false;
	
	var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    this.pos = new Vector(w/ 2, h / 2);
    this.lastPos = false;
    this.vel = new Vector(0, 0);
    this.dir = new Vector(0, 1);
    this.keysPressed = {};
    this.maxSpeed = 400;
    this.flame = {
        r: [],
        y: []
    };
    
    // units/second
    var acc = 400;
    this.updated = {
        flame: new Date().getTime(), // the time the flame was last updated
    };
    this.rotSpeed = 360; // one rotation per second
    this.createFlames = function(){
    
        // Firstly create red flames
        this.flame.r = [[0, 0]];
        this.flame.y = [[0, 0]];
        
        var rWidth = this.width;
        var rIncrease = this.width * 0.1;
        for (var x = 0; x < rWidth; x += rIncrease) 
            this.flame.r.push([x, -utils.random(2, 7)]);
        this.flame.r.push([rWidth, 0]);
        
        // yellow flames
        var yWidth = this.width * 0.6;
        var yIncrease = yWidth * 0.2;
        for (var x = 0; x < yWidth; x += yIncrease) 
            this.flame.y.push([x, -utils.random(1, 4)]);
        this.flame.y.push([yWidth, 0]);
        
        // Center 'em
        var halfR = rWidth / 2, halfY = yWidth / 2;
        for (var i = 0; i < this.flame.r.length; i++) {
            this.flame.r[i][0] -= halfR;
            this.flame.r[i][1] -= this.height / 2;
        }
        
        for (var i = 0; i < this.flame.y.length; i++) {
            this.flame.y[i][0] -= halfY;
            this.flame.y[i][1] -= this.height / 2;
        }
        
        
    };
    this.createFlames()
    
    this.getRect = function(){
        return {
            x: that.pos.x || 10,
            y: that.pos.y || 10,
            width: that.width,
            height: that.height
        }
        
    }
    
    this.update = function(){
        if (this == app.firstPlayer) {
            app.life_value.innerHTML = this.life;
			app.kills_value.innerHTML = this.kills;
            if (this.life < 1) {
				this.life = 0;
				app.life_value.innerHTML = this.life;
                if (confirm("Dead, play again?")){
				    location.reload(true);	
				}
				else{
					app.destroy();
				}
            }
        }
        this.drawFlame = false;
        var now = app.now
        //apply our velocity
        this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this)
        
        if (now - this.updated.flame > 50) {
            this.createFlames();
            this.updated.flame = now;
        }
        
        // fire
        if ((this.keysPressed[utils.code(' ')] |  this.keysPressed[utils.code('F')]) && now - this.last_fired > timeBetweenFire) {
            app.bullets.push(new Bullet(this, false));
            this.last_fired = now;
            if (app.bullets.length > app.maxBullets) {
                utils.arrayRemove(app.bullets, 0);
                forcechange = true;
            }
        }
        
        if (this.keysPressed[utils.code('up')] | this.keysPressed[utils.code('W')]) {
            this.vel.add(this.dir.mulNew(acc * app.tDelta));
            this.drawFlame = true;
        }
		if (this.keysPressed[utils.code('down')] |  this.keysPressed[utils.code('S')]) {
            this.vel.mul(0.90);
        }
        // rotate counter-clockwise
        if (this.keysPressed[utils.code('left')] | this.keysPressed[utils.code('A')]) {
            this.forceChange = true;
            this.dir.rotate(utils.radians(this.rotSpeed * app.tDelta * -1));
        }
        
        // rotate clockwise
        if (this.keysPressed[utils.code('right')] | this.keysPressed[utils.code('D')]){
            this.forceChange = true;
            this.dir.rotate(utils.radians(this.rotSpeed * app.tDelta));
        }
        
        if (this.keysPressed[utils.code('esc')]) {
            events.destroy(this);
            return;
        }
		
		if (this.keysPressed[utils.code('B')] && now - this.last_bombed > timeBetweenBombs) {
            app.bombs.push(new Bomb(this));
			this.last_bombed = now;
            return;
        }
		
        // cap speed
        if (this.vel.len() > this.maxSpeed) {
            this.vel.setLength(this.maxSpeed);
        }
        if (!this.pos.is(this.lastPos) || this.vel.len()) {
            app.forceChange = true
        }
        for (var i=0;i<app.items.length;i++){
			var item = app.items[i];
			var distance = new Line(item.pos, this.pos);
			if(distance.len() < item.radius){
				item.apply_benefits(this);
                item.used = true;
				
			}
		}
		
    }
}

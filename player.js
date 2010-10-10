function Player(id, width, height){
    var that = this;
    this.id = id;
    this.width = width || 20, this.height = height || 30;
    this.polyVerts = [[-1 * this.width / 2, -15], [this.width / 2, -15], [0, 15]];
    var timeBetweenFire = 150; // how many milliseconds between shots
    this.pos = new Vector(100, 100);
    this.lastPos = false;
    this.vel = new Vector(0, 0);
    this.dir = new Vector(0, 1);
    this.keysPressed = {};
    this.maxSpeed = 700;
	this.flame = {
        r: [],
        y: []
    };
	this.firedAt = false;
	// units/second
    var acc = 300;
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
            that.flame.r.push([x, -utils.random(2, 7)]);
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
    this.update = function(){
        var now = app.now
        //apply our velocity
        this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this)
        
        if (now - this.updated.flame > 50) {
            this.createFlames();
            this.updated.flame = now;
        }
        if (this.keysPressed[utils.code('up')]) {
            this.vel.add(this.dir.mulNew(acc * app.tDelta));
            this.drawFlame = true;
        }
        if (this.keysPressed[utils.code('down')]) {
            // decrease speed of player
            this.vel.mul(0.96);
        }
        
        // rotate counter-clockwise
        if (this.keysPressed[utils.code('left')]) {
            this.forceChange = true;
            this.dir.rotate(utils.radians(this.rotSpeed * app.tDelta * -1));
        }
        
        // rotate clockwise
        if (this.keysPressed[utils.code('right')]) {
            this.forceChange = true;
            this.dir.rotate(utils.radians(this.rotSpeed * app.tDelta));
        }
        
        // fire
        if (this.keysPressed[utils.code(' ')] && now - this.firedAt > timeBetweenFire) {
            app.bullets.push(new Bullet(this));
            
            this.firedAt = now;
            
            if (app.bullets.length > app.maxBullets) {
                utils.arrayRemove(app.bullets, 0);
                forcechange = true;
            }
        }
        
        if (this.keysPressed[utils.code('esc')]) {
            events.destroy(this);
            return;
        }
        
        // cap speed
        if (this.vel.len() > this.maxSpeed) {
            this.vel.setLength(this.maxSpeed);
        }
        if (!this.pos.is(this.lastPos) || this.vel.len()) {
            app.forceChange = true
        }
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}

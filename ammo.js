var bulletSpeed = 700;

function Projectile(type){
	this.type = type;
	this.update = function(){
		this.type.update();
	}
	
}


function Bullet(shooter, speed, options){
	var options = options || {};
    var speed = speed || 500;
    this.shooter_type = shooter.type;
    this.pos = shooter.pos.cp();
    this.dir = shooter.dir.cp();
    this.startVel = shooter.dir.cp();
    this.shooter = shooter;
	this.heatSeeker = options.heatSeeker;
    this.vel = shooter.dir.cp().normalize().mul(speed);
    this.cameAlive = new Date().getTime();
    this.damage = Math.floor(Math.random() * 50 + shooter.base_damage);
	this.radius = 2;
    this.update = function(){
        var now = app.now;
        // bullets should only live for 2 seconds
        if (now - this.cameAlive > 2000) {
            utils.arrayRemove(app.bullets, utils.indexOf(app.bullets, this));
            app.forceChange = true;
            return;
        }
		if (options.heatSeeker){
			this.vel = new Vector(options.target.pos.x - this.pos.x, options.target.pos.y - this.pos.y).normalize().mul(speed *.75);
		}
        this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this);
        
        // check collisions
        var newLength = this.dir.setLengthNew(bulletSpeed * app.tDelta)
        var prediction = this.startVel.mulNew(app.tDelta)
        var bulletVel = newLength.add(prediction);
        var ray = new Line(this.pos.cp(), this.pos.addNew(bulletVel));
        var hit = false;
        
        if (this.shooter_type == 'player') {
            for (var c = 0, creep; creep = app.creeps[c]; c++) {
                if (ray.intersectsWithRect(creep.getRect())) {
                    hit = true;
                    utils.damagePopup(creep.pos, this.damage, this.shooter_type)
                    creep.life -= this.damage;
                    creep.last_hit_by = this.shooter;
                    creep.pos = creep.pos.add(this.vel.mulNew(app.tDelta))
                    break;
                }
            }
            
        }
        
        if (this.shooter_type == 'creep') {
            for (var p = 0, player; player = app.players[p]; p++) {
                if (ray.intersectsWithRect(player.getRect())) {
                    hit = true;
                    utils.damagePopup(player.pos, this.damage, this.shooter_type)
                    player.life -= this.damage;
                    player.pos = player.pos.add(this.vel.mulNew(app.tDelta))
                    break;
                }
            }
        }
        
        
        // If it hit something the bullet should go down with it
        if (hit) {
            utils.arrayRemove(app.bullets, utils.indexOf(app.bullets, this))
            return;
        }
        
    }
}

function Bomb(bomber){
    this.bomber = bomber;
    this.launched = new Date().getTime();
    this.last_damage = false;
    this.pos = bomber.pos.cp();
    this.vel = bomber.dir.cp().normalize().mul(this.speed);
    this.xvel = new Vector(1, 1).mul(this.xspeed); //expansion, or 'explosion' velocity
    this.update = function(){
        var now = app.now;
        if (now - this.launched > this.time_to_die) {
            utils.arrayRemove(app.bombs, utils.indexOf(app.bombs, this));
            app.forceChange = true;
            return;
        }
        this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this);
        if (now - this.launched > this.time_to_blow) {
            this.exploding = true;
        }
        
        if (this.exploding) {
            this.radius += this.xvel.mulNew(app.tDelta).len()
        }
        
        for (var c = 0, creep; creep = app.creeps[c]; c++) {
            var distance = new Line(this.pos, creep.pos);
            if (distance.len() < this.radius && (now - creep.last_bomb > this.time_between_damage | !creep.last_bomb)) {
                var d = Math.abs(Math.floor(Math.random() * this.damage_mul + this.base_damage));
                utils.damagePopup(creep.pos, d, this.bomber.type)
                creep.life -= d;
                creep.last_hit_by = this.bomber;
                creep.vel = new Vector(creep.pos.x - this.pos.x, creep.pos.y - this.pos.y).normalize().mul(this.xspeed * 2)
                creep.last_bomb = now
                break;
            }
            
        }
    }
}


Bomb.prototype = {
    radius: 6,
    base_damage: 5,
    damage_mul: 25,
    speed: 100,
    xspeed: 200,
    exploding: false,
    time_to_blow: 1000, // time before bomb explodes, (ms)
    time_to_die: 2300,
    time_between_damage: 675,
    hit: false

}


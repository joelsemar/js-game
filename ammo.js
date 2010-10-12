var bulletSpeed = 700;

function Bullet(shooter, speed){
    var speed = speed || 500;
    this.shooter_type = shooter.type;
    this.pos = shooter.pos.cp();
    this.dir = shooter.dir.cp();
    this.startVel = shooter.dir.cp();
    this.shooter = shooter;
    this.vel = shooter.dir.cp().normalize().mul(speed);
    this.cameAlive = new Date().getTime();
    this.damage = Math.floor(Math.random() * 50 + shooter.base_damage);
    this.update = function(){
        var now = app.now;
        // bullets should only live for 2 seconds
        if (now - this.cameAlive > 2000) {
            utils.arrayRemove(app.bullets, utils.indexOf(app.bullets, this));
            app.forceChange = true;
            return;
        }
        this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this);
        
        // check collisions
        var newLength = this.dir.setLengthNew(bulletSpeed * app.tDelta)
        var prediction = this.startVel.mulNew(app.tDelta)
        var bulletVel = newLength.add(prediction);
        var ray = new Line(this.pos.cp(), this.pos.addNew(bulletVel));
        var hit = false;
        
        for (var c = 0, creep; creep = app.creeps[c]; c++) {
            if (creep.type == this.shooter_type) {
                break;
            }
            if (ray.intersectsWithRect(creep.getRect())) {
                hit = true;
                utils.damagePopup(creep.pos, this.damage, this.shooter_type)
                creep.life -= this.damage;
                creep.last_hit_by = this.shooter;
                creep.pos = creep.pos.add(this.vel.mulNew(app.tDelta))
                break;
            }
        }
        for (var p = 0, player; player = app.players[p]; p++) {
            if (player.type == this.shooter_type) {
                break;
            }
            if (ray.intersectsWithRect(player.getRect())) {
                hit = true;
                utils.damagePopup(player.pos, this.damage, this.shooter_type)
                player.life -= this.damage;
                player.pos = player.pos.add(this.vel.mulNew(app.tDelta))
                break;
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
    this.vel = bomber.dir.cp().normalize().mul(this.speed)
    this.xvel = new Vector(1, 1).mul(this.xspeed)
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
			var edge_distance = Math.abs(this.radius - distance.len())
            if ((distance.len() < this.radius && (now - this.last_damage > this.time_between_damage))| edge_distance < 2) {
                var d = Math.abs(Math.floor(Math.random() * this.damage_mul + this.base_damage));
                utils.damagePopup(creep.pos, d, this.bomber.type)
                this.hit = true;
                creep.life -= d;
                creep.last_hit_by = this.bomber;
                creep.vel = new Vector(creep.pos.x - this.pos.x, creep.pos.y - this.pos.y).normalize().mul(this.xspeed * 2)
                break;
            }
            
        }
        if (this.hit) {
            this.last_damage = now
            this.hit = false;
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
    time_to_die: 1700,
    time_between_damage: 375,
    hit: false

}

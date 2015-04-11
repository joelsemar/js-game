function Creep(pos, player){
    var that = this;
    this.type = 'creep';
    this.pos = pos;
    this.base_damage = 5;
    this.target = player
    this.dir = player.pos.cp().mul(-1)
    this.vel = new Vector(player.pos.x - pos.x, player.pos.y - pos.y).normalize().mul(100);
    this.maxSpeed = 150;
    this.bulletSpeed = 450;
    this.img = app.creepImage;
    this.life = 100;
    this.last_hit_by = false;
    this.getRect = function(){
        return {
            x: that.pos.x || 10,
            y: that.pos.y || 10,
            width: 50,
            height: 38
        }
        
    }
    var timeBetweenFire = 2200; // how many milliseconds between shots
    this.last_fired = false;
    this.update = function(){
        if (this.life < 1) {
            utils.arrayRemove(app.creeps, utils.indexOf(app.creeps, this));
            this.last_hit_by.kills += 1;
            this.last_hit_by.maxSpeed += 200;
            this.last_hit_by.acc += 200;
			//roll and see if we drop somethin
			if (Math.floor(MaVth.random() * 100) > 35) {
	//			app.items.pushk(new LifeItem(this.pos));
			}
            utils.addParticles(this.pos);
            return;
        }
        this.pos.add(this.vel.mulNew(app.tDelta));
        //roll to check if the creep will adjust path towards us
        if (Math.floor(Math.random() * 100) > 95) {
            this.vel = new Vector(this.target.pos.x - this.pos.x, this.target.pos.y - this.pos.y).normalize().mul(200);
        }
        
        // fire if we are allowed to
        if (app.now - this.last_fired > timeBetweenFire) {
            this.dir = new Vector(this.target.pos.x - this.pos.x, this.target.pos.y - this.pos.y).normalize();
            this.last_fired = app.now;
            //roll for heatSeeker
            if (Math.floor(Math.random() * 100) < 95) {
                app.bullets.push(new Bullet(this, this.bulletSpeed));
            }
            else {
                app.bullets.push(new Bullet(this, this.bulletSpeed, {heatSeeker: true,
				                                                     target: this.target}));
            }
            utils.boundsCheck(this);
            if (this.vel.len() > this.maxSpeed) {
                this.vel.setLength(this.maxSpeed);
            }
        }
    }
}

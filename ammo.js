var bulletSpeed = 700;

function Bullet(shooter, speed, type){
    var speed = speed || 500;
	this.shooter_type = type;
    this.pos = shooter.pos.cp();
    this.dir = shooter.dir.cp();
    this.startVel = shooter.dir.cp();
    this.vel = shooter.dir.cp().normalize().mul(speed);
    this.cameAlive = new Date().getTime();
    this.damage = Math.floor(Math.random() * 50 + shooter.base_damage);
}




function bulletHandler(){
    var nowTime = new Date().getTime()
    for (var i = 0; i < app.bullets.length; i++) {
        var bullet = app.bullets[i];
        
        // bullets should only live for 2 seconds
        if (nowTime - bullet.cameAlive > 2000) {
            utils.arrayRemove(app.bullets, i);
            app.forceChange = true;
            i--;
            continue;
        }
        bullet.pos.add(bullet.vel.mulNew(app.tDelta));
        utils.boundsCheck(bullet);
        
        // check collisions
        var newLength = bullet.dir.setLengthNew(bulletSpeed * app.tDelta)
        var prediction = bullet.startVel.mulNew(app.tDelta)
        var bulletVel = newLength.add(prediction);
        var ray = new Line(bullet.pos.cp(), bullet.pos.addNew(bulletVel));
        var hit = false;
        
        for (var c = 0, creep; creep = app.creeps[c]; c++) {
            if (creep.type == bullet.shooter_type) {
                continue;
            }
            if (ray.intersectsWithRect(creep.getRect())) {
                hit = true;
				utils.damagePopup(creep.pos, bullet.damage)
                creep.life -= bullet.damage;
                creep.pos = creep.pos.add(bullet.vel.mulNew(app.tDelta))
                break;
            }
        }
        for (var p = 0, player; player = app.players[p]; p++) {
            if (player.type == bullet.shooter_type) {
                continue;
            }
            if (ray.intersectsWithRect(player.getRect())) {
                hit = true;
				utils.damagePopup(player.pos, bullet.damage)
                player.life -= bullet.damage;
                player.pos = player.pos.add(bullet.vel.mulNew(app.tDelta))
                break;
            }
        }
        
        
        // If it hit something the bullet should go down with it
        if (hit) {
            utils.arrayRemove(app.bullets, i);
            i--;
            continue;
        }
        
    }
    
    
}

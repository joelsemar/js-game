var bulletSpeed = 700;

function Bullet(player){
    this.pos = player.pos.cp();
    this.dir = player.dir.cp();
    this.startVel = player.dir.cp();
    this.vel = player.dir.cp().normalize().mul(619.2);
    this.cameAlive = new Date().getTime();
}




function bulletHandler(){
    var nowTime = new Date().getTime()
    for (var i = 0; i < app.bullets.length; i++) {
		var bullet = app.bullets[i];
		if (bullet.vel.x == Infinity){
			debugger;
		}
        
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
        var bulletVel = bullet.dir.setLengthNew(bulletSpeed * app.tDelta).add(bullet.startVel.mulNew(app.tDelta));
        var ray = new Line(bullet.pos.cp(), bullet.pos.addNew(bulletVel));
        var didKill = false;
        
        for (var j = 0, creep;creep = app.creeps[j]; j++) {
            if (ray.intersectsWithRect(creep.getRect())) {
               hasKilled = true;
               utils.arrayRemove(app.creeps, j)
               didKill = true
               utils.addParticles(bullet.pos, app.particles);
                 break;
            }
            
       }
        
        // If it hit something the bullet should go down with it
        if (didKill) {
            utils.arrayRemove(app.bullets, i);
            i--;
            continue;
        }
        
    }
    
    
}

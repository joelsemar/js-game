function Creep(pos, player){
	var that = this;
	this.pos = pos;
	this.dir = player.pos.cp().mul(-1)
	this.vel = player.pos.cp().normalize().mul(-120)
	this.maxSpeed = 200;
	this.img = app.creepImage;
	
	this.getRect = function(){
		return {
			x: that.pos.x || 10,
            y: that.pos.y || 10,
            width: 50,
            height: 38
		}
		
	}
    	
	this.update = function(){
		this.pos.add(this.vel.mulNew(app.tDelta));
        utils.boundsCheck(this);
            if (this.vel.len() > this.maxSpeed) {
                this.vel.setLength(this.maxSpeed);
            }
	}
	
}

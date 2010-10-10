function Creep(pos, player){
	var that = this;
	this.pos = pos;
	this.dir = player.pos.cp()
	this.vel = player.pos.cp().normalize().mul(60)
	this.getRect = function(){
		return {
			x: that.pos.x || 10,
            y: that.pos.y || 10,
            width: 50,
            height: 38
		}
		
	}
    	
	
}

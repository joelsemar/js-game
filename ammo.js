function Bullet(player){
	this.pos = player.pos.cp();
	this.dir = player.dir.cp();
	this.startVel = player.dir.cp();
	this.vel = player.dir.cp().normalize().mul(619.2);
	this.cameAlive = new Date().getTime();
}

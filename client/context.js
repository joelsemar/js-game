

function addContext(that, h, w){

    var strokeStyle = 'black'
    var fillStyle = 'red'
    var creepWidth = 40;
    that.ctx = that.canvas.getContext("2d");
    that.ctx.fillStyle = "black";
    that.ctx.strokeStyle = "black";
    
    
    var creepVerts = [[], [], []]
    that.ctx.clear = function(){
        this.clearRect(0, 0, w, h);
    };
    
    that.ctx.clear();
    
    that.ctx.drawLine = function(xFrom, yFrom, xTo, yTo){
        this.beginPath();
        this.moveTo(xFrom, yFrom);
        this.lineTo(xTo, yTo);
        this.closePath();
        this.stroke();
    };
    
    that.ctx.drawRect = function(rect){
        var old = strokeStyle;
        this.strokeStyle = "red";
        this.strokeRect(rect.x, rect.y, rect.width, rect.height);
        this.strokeStyle = old;
    };
    
    that.ctx.drawLineFromLine = function(line){
        var oldC = strokeStyle;
        this.strokeStyle = "green";
        this.drawLine(line.p1.x, line.p1.y, line.p2.x, line.p2.y);
        this.strokeStyle = oldC;
    };
    
    that.ctx.tracePoly = function(verts){
    
        this.beginPath();
        this.moveTo(verts[0][0], verts[0][1]);
        for (var i = 1; i < verts.length; i++) 
            this.lineTo(verts[i][0], verts[i][1]);
        this.closePath();
    };
    
    that.ctx.drawPlayer = function(player){
        this.save();
        this.translate(player.pos.x, player.pos.y);
        this.rotate(-player.dir.angle());
        this.tracePoly(player.polyVerts);
        this.stroke();
        this.restore();
    };
    
    that.ctx.drawCreep = function(creep){
        this.save();
        this.drawImage(creep.img, creep.pos.x, creep.pos.y);
        this.rotate(-creep.dir.angle());
        this.restore();
    }
    
    that.ctx.drawBullet = function(bullet){
		this.save();
        this.beginPath();
        if (bullet.heatSeeker) {
            this.fillStyle = 'red';
            bullet.radius = 5;
            
        }
        this.arc(bullet.pos.x, bullet.pos.y, bullet.radius, 0, Math.PI * 2, true);
        this.closePath();
        this.fill();
		this.restore();
    };
    
    var randomParticleColor = function(){
        return (['red', 'yellow'])[utils.random(0, 1)];
    };
    
    that.ctx.drawParticle = function(particle){
		this.save();
        var oldColor = strokeStyle;
        this.strokeStyle = randomParticleColor();
        this.drawLine(particle.pos.x, particle.pos.y, particle.pos.x - particle.dir.x * 10, particle.pos.y - particle.dir.y * 10);
        this.strokeStyle = oldColor;
		this.restore();
    };
    
    that.ctx.drawFlames = function(player){
        this.save();
        var flame = player.flame
        this.translate(player.pos.x, player.pos.y);
        this.rotate(-player.dir.angle());
        
        var oldColor = strokeStyle;
        this.strokeStyle = "red";
        this.tracePoly(flame.r);
        this.stroke();
        
        this.strokeStyle = "yellow";
        this.tracePoly(flame.y);
        this.stroke();
        
        this.strokeStyle = oldColor;
        this.restore();
    }
    
    that.ctx.drawBomb = function(bomb){
        this.save();
        this.strokeStyle = "rgba(255, 0, 0, 1)";
        this.beginPath();
        this.arc(bomb.pos.x, bomb.pos.y, bomb.radius, 0, Math.PI * 2, true);
        this.closePath();
        this.stroke();
        this.restore();
    }
    that.ctx.drawItem = function(item){
        item.draw(that.ctx);
    }
}

function redraw(app, proceed){
    context = app.ctx
    if (!proceed) {
        return;
    }
    context.clear();
    // items
    for (var i = 0; i < app.items.length; i++) {
        context.drawItem(app.items[i]);  
    }
	// draw player
    context.drawPlayer(app.firstPlayer);
    // draw flames
    if (app.firstPlayer.drawFlame) 
        context.drawFlames(app.firstPlayer);
    
	
    // draw bullets
    for (var i = 0; i < app.bullets.length; i++) {
        context.drawBullet(app.bullets[i]);
    }
    
    // draw bombs
    for (var i = 0; i < app.bombs.length; i++) {
        context.drawBomb(app.bombs[i]);
    }
    //draw creeps
    for (var i = 0; i < app.creeps.length; i++) {
        context.drawCreep(app.creeps[i]);
    }
    
    // draw particles
    for (var i = 0; i < app.particles.length; i++) 
        context.drawParticle(app.particles[i]);
    
	
}


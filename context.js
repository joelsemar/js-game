

function addContext(that, h, w, playerWidth){
	    var bulletRadius = 2;
		var strokeStyle = 'black'
		var fillStyle = 'red'
		that.ctx = that.canvas.getContext("2d");
        
        that.ctx.fillStyle = "black";
        that.ctx.strokeStyle = "black";
		
		 
        var playerVerts = [[-1 * playerWidth / 2, -15], [playerWidth / 2, -15], [0, 15]];
				   
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
        
        that.ctx.drawPlayer = function(){
            this.save();
            this.translate(that.pos.x, that.pos.y);
            this.rotate(-that.dir.angle());
            this.tracePoly(playerVerts);
            this.stroke();
            this.restore();
        };
        
        that.ctx.drawBullet = function(pos){
            this.beginPath();
            this.arc(pos.x, pos.y, bulletRadius, 0, Math.PI * 2, true);
            this.closePath();
            this.fill();
        };
        
        var randomParticleColor = function(){
            return (['red', 'yellow'])[utils.random(0, 1)];
        };
        
        that.ctx.drawParticle = function(particle){
            var oldColor = strokeStyle;
            this.strokeStyle = randomParticleColor();
            this.drawLine(particle.pos.x, particle.pos.y, particle.pos.x - particle.dir.x * 10, particle.pos.y - particle.dir.y * 10);
            this.strokeStyle = oldColor;
        };
        
        that.ctx.drawFlames = function(flame){
            this.save();
            
            this.translate(that.pos.x, that.pos.y);
            this.rotate(-that.dir.angle());
            
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
	
	
	
	
}

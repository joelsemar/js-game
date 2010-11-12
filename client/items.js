function BaseItem(){
    this.benefits = {};
    this.height = 10;
    this.width = 10;
	this.used = false;
    this.apply_benefits = function(target){
        for (k in benefits) {
			if (benefits.hasOwnProperty(k)){
			 target[key] = benefits[k];	
			}
            
        }
        
    };
	
	this.update = function(){
		if (this.used){
			this.remove();
		}
	};
	
    this.remove = function(){
		app.items.splice(utils.indexOf(app.items, this));
		//utils.arrayRemove(app.items, utils.indexOf(app.items, this));
	};
	
    this.draw = function(){
        throw ("Not Implemented");
    };
    
    this.radius = 35;
	this.getRect = function(){
		that = this;
        return {
            x: that.pos.x,
            y: that.pos.y,
            width: that.width,
            height: that.height
        }
        
    }
};



function LifeItem(pos, life){
    this.life = life || 50;
    this.letter = "L";
    this.pos = pos;
    this.apply_benefits = function(target){
        target.life += this.life;
		utils.damagePopup(this.pos, this.life, 'player');
		//this.remove();
    };
    
    this.draw = function(ctx){
		ctx.save();
        ctx.font = "20pt Arial";
		idx = utils.indexOf(app.items, this)
		ctx.fillText(this.letter + idx, this.pos.x, this.pos.y);
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
		ctx.stroke();
		ctx.restore();
    };
}
LifeItem.prototype = new BaseItem();
LifeItem.prototype.constructor = LifeItem;
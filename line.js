function Line(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
};

Line.prototype = {
    shift: function(pos){
        this.p1.add(pos);
        this.p2.add(pos);
    },
    
	len: function(){
        var l = Math.sqrt(Math.pow(this.p2.x - this.p1.x, 2) + Math.pow(this.p2.y - this.p1.y, 2));
        if (l < 0.005 && l > -0.005) 
            return 0;
        return l;
    },
	
    intersectsWithRect: function(rect){
        var LL = new Vector(rect.x, rect.y + rect.height);
        var UL = new Vector(rect.x, rect.y);
        var LR = new Vector(rect.x + rect.width, rect.y + rect.height);
        var UR = new Vector(rect.x + rect.width, rect.y);
        
        if (this.p1.x > LL.x && this.p1.x < UR.x && this.p1.y < LL.y && this.p1.y > UR.y &&
        this.p2.x > LL.x &&
        this.p2.x < UR.x &&
        this.p2.y < LL.y &&
        this.p2.y > UR.y) 
            return true;
        
        if (this.intersectsLine(new Line(UL, LL))) 
            return true;
        if (this.intersectsLine(new Line(LL, LR))) 
            return true;
        if (this.intersectsLine(new Line(UL, UR))) 
            return true;
        if (this.intersectsLine(new Line(UR, LR))) 
            return true;
        return false;
    },
    
    intersectsLine: function(line2){
        var v1 = this.p1, v2 = this.p2;
        var v3 = line2.p1, v4 = line2.p2;
        
        var denom = ((v4.y - v3.y) * (v2.x - v1.x)) - ((v4.x - v3.x) * (v2.y - v1.y));
        var numerator = ((v4.x - v3.x) * (v1.y - v3.y)) - ((v4.y - v3.y) * (v1.x - v3.x));
        
        var numerator2 = ((v2.x - v1.x) * (v1.y - v3.y)) - ((v2.y - v1.y) * (v1.x - v3.x));
        
        if (denom == 0.0) {
            return false;
        }
        var ua = numerator / denom;
        var ub = numerator2 / denom;
        
        return (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0);
    }
};


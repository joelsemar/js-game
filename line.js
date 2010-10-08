function Line(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
};

Line.prototype = {
    shift: function(pos){
        this.p1.add(pos);
        this.p2.add(pos);
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

/*function Highscores() {
         var w = (document.clientWidth || window.innerWidth);
         var h = (document.clientHeight || window.innerHeight);
         
         this.container = document.createElement('div');
         this.container.className = "ASTEROIDSYEAH";
         with ( this.container.style ) {
         position = "fixed";
         top = (h / 2 - 250) + "px";
         left = (w / 2 - 250) + "px";
         width = "500px";
         height = "500px";
         MozBoxShadow = WebkitBoxShadow = "0 0 25px #000";
         zIndex = "10002";
         };
         document.body.appendChild(this.container);
         
         // Create iframe
         this.iframe = document.createElement('iframe');
         this.iframe.className = "ASTEROIDSYEAH";
         this.iframe.width = this.iframe.height = 500;
         this.iframe.src = highscoreURL;
         this.iframe.frameBorder = 0;
         this.container.appendChild(this.iframe);
         
         // Create close button
         this.close = document.createElement('a');
         this.close.href = "#";
         this.close.onclick = function() {
         that.highscores.hide();
         };
         this.close.innerHTML = "X";
         with ( this.close.style ) {
         position = "absolute";
         display = "block";
         width = "24px";
         height = "24px";
         top = "-12px";
         right = "-12px";
         background = "url(" + closeURL + ")";
         textIndent = "-10000px";
         outline = "none";
         textDecoration = "none";
         fontFamily = "Arial";
         zIndex = "10003";
         }
         this.container.appendChild(this.close);
         };
         
         Highscores.prototype = {
         show: function() {
         this.container.style.display = "block";
         this.sendScore();
         },
         
         hide: function() {
         this.container.style.display = "none";
         },
         
         sendScore: function() {
         this.iframe.src = highscoreURL + "#" + (that.enemiesKilled * 10) + ":" + escape(document.location.href);
         }
         };*/
        /*
         end classes, begin code
         */
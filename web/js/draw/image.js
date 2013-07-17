Draw9p.Image = function(refresh, chan, repl, r, clipr, color){
	this.refresh = refresh;
	this.chan = chan;
	this.repl = repl;
	this.r = r;
	this.clipr = clipr;
	this.canvas = document.createElement("canvas");
	this.canvas.width = r.max.x - r.min.x;
	this.canvas.height = r.max.y - r.min.y;
	this.ctx = this.canvas.getContext("2d");

	var red = (color >> 24) & 0xFF;
	var green = (color >> 16) & 0xFF;
	var blue = (color >> 8) & 0xFF;
	var alpha = (color) & 0xFF;

	var data = this.ctx.createImageData(this.canvas.width, this.canvas.height);
	for(var i = 0; i < data.data.length; i += 4){
		data.data[i + 0] = red;
		data.data[i + 1] = green;
		data.data[i + 2] = blue;
		data.data[i + 3] = alpha;
	}

	this.ctx.putImageData(data, 0, 0);
}

/* XXX Creating a new rootwindow object for each connection will probably */
/* break once we start doing more advanced things. */
Draw9p.RootImage = function(){
	this.canvas = Draw9p.rootcanvas;
	this.ctx = this.canvas.getContext("2d")
}
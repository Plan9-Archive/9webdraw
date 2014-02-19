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

/* XXX ScreenImage will not work as a drawing source */
/* due to the assumption that the canvas maps 1-1 to the image data. */
Draw9p.ScreenImage = function(screen, refresh, chan, repl, r, clipr, color){
	if(screen == undefined || screen.backimg == undefined){
		throw("invalid screen");
	}
	this.screen = screen;

	/* if(chan != this.screen.backimg.chan){ */
	/* 	throw("chan mismatch between image and screen"); */
	/* } */

	this.refresh = refresh;
	this.chan = chan;
	this.repl = repl;
	this.r = r;
	this.clipr = clipr;

	/* XXX We should create a backing store, depending on refresh value. */
	this.canvas = this.screen.backimg.canvas;
	this.ctx = this.canvas.getContext("2d");
	this.ctx.beginPath();
	this.ctx.moveTo(r.min.x, r.min.y);
	this.ctx.lineTo(r.max.x, r.min.y);
	this.ctx.lineTo(r.max.x, r.max.y);
	this.ctx.lineTo(r.min.x, r.max.y);
	this.ctx.lineTo(r.min.x, r.min.y);
	this.ctx.clip();

	/* XXX Fill ScreenImage with background colour. */
}

/* XXX Creating a new rootwindow object for each connection will probably */
/* break once we start doing more advanced things. */
Draw9p.RootImage = function(){
	var sz = Draw9p.rootsz;
	var image =  new this.Image(0, "r8g8b8", 0,
		{min: {x: 0, y: 0}, max: {x: sz.w, y: sz.h}},
		{min: {x: 0, y: 0}, max: {x: sz.w, y: sz.h}},
		0xFFFFFFFF);

	image.canvas = Draw9p.rootcanvas;
	image.ctx = image.canvas.getContext("2d");

	return image;
}

CtxWrap = function(ctx){
	ctx.rrect = function(r){
		return ctx.rect(r.min.x, r.min.y, r.max.x, r.max.y);
	}
	ctx.pdrawImage = function(canvas, p){
		return ctx.drawImage(canvas, p.x, p.y);
	}
	ctx.rclearRect = function(r){
		return ctx.clearRect(r.min.x, r.min.y,r.max.x, r.max.y);
	}
	ctx.pmoveTo = function(p){
		return ctx.moveTo(p.x, p.y);
	}
	ctx.plineTo = function(p){
		return ctx.lineTo(p.x, p.y);
	}
	ctx.ptranslate = function(p){
		return ctx.translate(p.x, p.y);
	}
	ctx.rgetImageData = function(r){
		return ctx.getImageData(r.min.x, r.min.y, Dx(r), Dy(r));
	}
	ctx.pputImageData = function(data, p){
		return ctx.putImageData(data, p.x, p.y);
	}
	return ctx;
}

var DNofill = 0xFFFFFF00;

function fill(ctx, w, h, color){
	var red, green, blue, alpha;
	var data;
	var i;

	if(color == DNofill)
		return;

	red = (color >> 24) & 0xFF;
	green = (color >> 16) & 0xFF;
	blue = (color >> 8) & 0xFF;
	alpha = (color) & 0xFF;

	data = ctx.createImageData(w, h);
	for(i = 0; i < data.data.ength; i += 4){
		data.data[i + 0] = red;
		data.data[i + 1] = green;
		data.data[i + 2] = blue;
		data.data[i + 3] = alpha;
	}
	ctx.putImageData(data, 0, 0);
}

Draw9p.Image = function(refresh, chan, repl, r, clipr, color){
	this.refresh = refresh;
	this.chan = chan;
	this.repl = repl;
	this.r = r;
	this.clipr = clipr;
	this.canvas = document.createElement("canvas");
	this.canvas.width = r.max.x - r.min.x;
	this.canvas.height = r.max.y - r.min.y;
	this.ctx = CtxWrap(this.canvas.getContext("2d"));

	fill(this.ctx, this.canvas.width, this.canvas.height, color);
}

Draw9p.ScreenImage = function(screen, refresh, chan, repl, r, clipr, color){
	if(screen == undefined || screen.backimg == undefined){
		throw("invalid screen");
	}

	this.screen = screen;
	this.scrmin = r.min;
	/* XXX remember to update screenr */
	/* XXX should screenr be clipr? */
	this.screenr = r;
	this.clear = false;
	this.delta = subpt(this.screenr.min, r.min);

	/* if(chan != this.screen.backimg.chan){ */
	/* 	throw("chan mismatch between image and screen"); */
	/* } */

	/* refresh methods */
	/* Refbackup = 0, */
	/* Refnone = 1, */
	/* Refmesg = 2 */

	this.refresh = refresh;
	this.chan = chan;
	this.repl = repl;
	this.r = r;
	this.clipr = clipr;

	this.refreshfn = function(){
		throw("you should not be calling refreshfn");
	}

	this.canvas = this.screen.backimg.canvas;
	this.ctx = this.screen.backimg.ctx;
	this.save = new Draw9p.Image(0, Chan.fmts.RGBA32, 0, r, r, DNofill);

	this.screen.imgs.push(this);
	this.front = this.screen.rearmost;
	this.rear = undefined;
	if(this.screen.rearmost != undefined)
		this.screen.rearmost.rear = this;
	this.screen.rearmost = this;
	if(this.screen.frontmost == undefined)
		this.screen.frontmost = this;
	this.clear = false;
	/* XXX calculate fill value correctly */
	memltofrontfill(this, true);
	//this.screen.repaint();
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
	image.ctx = CtxWrap(image.canvas.getContext("2d"));

	return image;
}

/* XXX fix Image inheritance, ``is-a''. */
Draw9p.Image.prototype.getrect =
Draw9p.ScreenImage.prototype.getrect =
Draw9p.RootImage.prototype.getrect =
function(r){
	return this.ctx.rgetImageData(rectsubpt(r, this.r.min));
}

Draw9p.Image.prototype.putrect =
Draw9p.ScreenImage.prototype.putrect =
Draw9p.RootImage.prototype.putrect =
function(data, p){
	return this.ctx.pputImageData(data, subpt(p, this.r.min));
}

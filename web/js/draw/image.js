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

	this.canvas = document.createElement("canvas");
	this.canvas.width = r.max.x - r.min.x;
	this.canvas.height = r.max.y - r.min.y;
	this.ctx = CtxWrap(this.canvas.getContext("2d"));

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
	this.canvas.style.position = "absolute";
	document.getElementById("container").appendChild(this.canvas);
	this.canvas.style.left = this.scrmin.x + "px";
	this.canvas.style.top = this.scrmin.y + "px";
	this.canvas.style.zIndex = this.screen.imgs.length;
}

/* XXX set screenr, delta */
Draw9p.ScreenImage.prototype.scrmove = function(scrmin){
	this.scrmin = scrmin;
	this.canvas.style.left = this.scrmin.x + "px";
	this.canvas.style.top = this.scrmin.y + "px";
	this.screen.dirty = true;
}

Draw9p.ScreenImage.prototype.tofront = function(){
	var i;
	var screen;

	screen = this.screen;

	for(i = 0; i < screen.imgs.length; ++i){
		if(screen.imgs[i] == this){
			delete screen.imgs[i];
			screen.imgs.push(this);
			break;
		}
	}
	this.canvas.style.zIndex = screen.imgs.length;
}

Draw9p.ScreenImage.prototype.torear = function(){
	var i;
	var screen;
	var imgs;

	screen = this.screen;
	imgs = [];
	for(i = 0; i < screen.imgs.length; ++i){
		if(screen.imgs[i] == this){
			delete screen.imgs[i];
			imgs.push(this);
			break;
		}
	}
	for(i = 0; i < screen.imgs.length; ++i){
		if(screen.imgs[i] == undefined)
			continue;
		imgs.push(screen.imgs[i]);
	}

	for(i = 0; i < imgs.length; ++i){
		imgs[i].canvas.style.zIndex = i;
	}

	screen.imgs = imgs;
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

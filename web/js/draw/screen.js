Draw9p.Screen = function(id, backimg, fillimg, public){
	this.id = id;
	this.public = public;
	this.backimg = backimg;
	drawmasked(backimg, backimg.r, fillimg, fillimg.r.min, undefined, undefined, Memdraw.Opdefs.SoverD.key);
	this.dirty = true;
	cons.log("new screen");
	/* Memdraw.draw(this.backimg, this.fillimg); */
	this.imgs = []; /* not sure how this should be represented? */
	this.frontmost = undefined;
	this.rearmost = undefined;
}

Draw9p.Screen.prototype.repaint = function(){
	var i;

	return "repaint disabled";

	if(this.dirty == true)
		this.dirty = false;
	else
		return;

	for(i in this.imgs){
		//rectsubpt(this.imgs[i].r, this.imgs[i].scrmin),
		drawmasked(this.backimg, this.imgs[i].r,
			this.imgs[i], this.imgs[i].r.min,
			undefined, undefined,
			Memdraw.Opdefs.SoverD.key);
	}
}

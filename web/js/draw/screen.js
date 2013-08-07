Draw9p.Screen = function(id, backimg, fillimg, public){
	this.id = id;
	this.public = public;
	this.backimg = backimg;
	/* Memdraw.draw(this.backimg, this.fillimg); */
	this.imgs = []; /* not sure how this should be represented? */
}

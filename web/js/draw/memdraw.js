var icossin2 = function(dx, dy){
	var theta = Math.atan2(dx, dy);
	return {
		cos: Math.cos(theta),
		sin: Math.sin(theta),
		theta: theta
	}
}

/* XXX doesn't work! */
/* XXX ignores op. */
/* XXX XXX XXX DRAWING IS FUZZY! XXX XXX XXX */
var draw = function(dst, r, src, sp, op){
	dst.ctx.save();

	/* XXX what about clipping on src? */
	dst.ctx.fillStyle = dst.ctx.createPattern(src.canvas,
		src.repl? "repeat" : "no-repeat");
	dst.ctx.fill();
	dst.ctx.restore();
	return;
}

var drawmasked = function(dst, r, src, sp, mask, mp, op){
	var img = new Draw9p.Image(0, "r8g8b8a8", 0, r, r, 0);
	/* XXX Hack; we should have a way to create blank images. */
	img.canvas.clearRect(0, 0, r.max.x, r.max.y);

	/* XXX We shouldn't be setting the point in both places. */
	draw(img, r, mask, mp, Memdraw.Ops.S);
	draw(img, r, src, sp, Memdraw.Ops.SatopD);
	draw(dst, r, img, sp, op);
}

Memdraw = {
	/* XXX Implement line endings. */
	/* XXX rectangular line ending is distorted! */
	line: function(dst, p0, p1, end0, end1, radius, src, sp, op){
		var angle = icossin2(p1.y - p0.y, p1.x - p0.x);
		var dx = (angle.sin * (2 * radius + 1))/2;
		var dy = (angle.cos * (2 * radius + 1))/2;

		var q = {
			/* 1/2 is cargo-cult from /sys/src/libmemdraw/line.c ; why? */
			x: p0.x + 1/2 + angle.cos/2,
			y: p0.y + 1/2 + angle.sin/2
		}

		var points = [];
		points = points.concat({x: q.x-dx, y: q.y+dy});
		points = points.concat({x: q.x+dx, y: q.y-dy});

		q = {
			x: p1.x + 1/2 + angle.cos/2,
			y: p1.y + 1/2 + angle.sin/2
		}

		points = points.concat({x: q.x+dx, y: q.y-dy});
		points = points.concat({x: q.x-dx, y: q.y+dy});

		/* XXX setting w incorrectly! */
		return this.fillpoly(dst, points, 0, src, sp, op);
	},
	fillpoly: function(dst, vertices, w, src, sp, op){
		if(vertices.length < 1){
			return;
		}
		dst.ctx.save();
		dst.ctx.beginPath();
		dst.ctx.moveTo(vertices[0].x, vertices[0].y);
		for(var i = 1; i < vertices.length; ++i){
			dst.ctx.lineTo(vertices[i].x, vertices[i].y);
		}
		dst.ctx.clip();
		/* fill background here */
		draw(dst, {min: {x: 0, y: 0}, max: {x: 500, y: 500}}, src, sp, op);
		dst.ctx.restore();
		return;
	},
	poly: function(dst, points, end0, end1, radius, src, sp, op){
		if(points.length < 2){
			return;
		}
		for(var i = 1; i < points.length; ++i){
			/* XXX calculate ends here; see C source. */
			/* XXX calculate change in sp; requires point operations. */
			this.line(dst, points[i-1], points[i], 0, 0, radius, src, sp, op);
		}
	},
	Ops: {
		Clear: 0,
		SinD: 8,
		DinS: 4,
		SoutD: 2,
		DoutS: 1,

		S: this.SinD|this.SoutD,
		SoverD: this.SinD|this.SoutD|this.DoutS,
		SatopD: this.SinD|this.DoutS,
		SxorD: this.SoutD|this.DoutS,

		D: this.DinS|this.DoutS,
		DoverS: this.DinS|this.DoutS|this.SoutD,
		DatopS: this.DinS|this.SoutD,
		DxorS: this.DoutS|this.SoutD,

		Ncomp: 12
	}
}

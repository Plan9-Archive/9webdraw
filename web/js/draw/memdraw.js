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
var draw = function(dst, r, src, sp, op){
	dst.ctx.save();

	/* XXX what about clipping on src? */
	dst.ctx.fillStyle = dst.ctx.createPattern(src.data,
		src.repl? "repeat" : "no-repeat");

	dst.ctx.restore();
	return;
}

Memdraw = {
	/* XXX Implement line endings. */
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
		return;
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
		dst.ctx.restore();
		return;
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

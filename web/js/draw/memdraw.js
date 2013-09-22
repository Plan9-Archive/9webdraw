var icossin2 = function(dx, dy){
	var theta = Math.atan2(dx, dy);
	return {
		cos: Math.cos(theta),
		sin: Math.sin(theta),
		theta: theta
	}
}

/* XXX Seems to misbehave on non-(0,0) src.r.min. */
var draw = function(dst, r, src, sp, op){
	dst.ctx.save();
	dst.ctx.globalCompositeOperation = Memdraw.Ops[op];

	/* XXX what about clipping on src? */
	if(src.repl){
		dst.ctx.fillStyle = dst.ctx.createPattern(src.canvas, "repeat");
		dst.ctx.fill();
	}else{
		dst.ctx.beginPath();
		dst.ctx.rect(r.min.x-dst.r.min.x, r.min.y-dst.r.min.y,
			r.max.x-r.min.x, r.max.y-r.min.y);
		dst.ctx.clip();
		dst.ctx.drawImage(src.canvas, r.min.x-sp.x+src.r.min.x-dst.r.min.x,
			r.min.y-sp.y+src.r.min.y-dst.r.min.y);
	}
	dst.ctx.restore();
	return;
}

var maskalpha = function(img){
	var data = img.ctx.getImageData(0, 0, img.canvas.width, img.canvas.height);
	for(var i = 0; i < data.data.length; i += 4){
		data.data[i + 3] = (data.data[i + 0] + data.data[i + 1] + data.data[i + 2]) /3;
	}
	img.ctx.putImageData(data, 0, 0);
}

var drawmasked = function(dst, r, src, sp, mask, mp, op){
	if(r.max.x == r.min.x || r.max.y == r.min.y){
		return;
	}

	/* XXX Hack: draw() doesn't seem to handle offset images properly. */
	var rdelta = {
		min: {x: 0, y: 0},
		max: {
			x: r.max.x - r.min.x,
			y: r.max.y - r.min.y
		}
	}
	var img = new Draw9p.Image(0, Chan.fmts.CMAP8, 0, rdelta, rdelta, 0xFF00FFFF);

	/* XXX Hack; we should have a way to create blank images. */
	img.ctx.clearRect(0, 0, r.max.x, r.max.y);

	draw(img, rdelta, mask, mp, Memdraw.Opdefs.SoverD.key);
	maskalpha(img);
	draw(img, rdelta, src, sp, Memdraw.Opdefs.SinD.key);
	//document.body.appendChild(img.canvas);
	draw(dst, r, img, {x: 0, y: 0}, op);
}

var load = function(dst, r, data, iscompressed){
	var img = new Draw9p.Image(0, dst.chan, 0, r, r, 0);
	var w = r.max.x - r.min.x;
	var h = r.max.y - r.min.y;
	var arr = img.ctx.createImageData(w, h);

	var offset = Memdraw.Load(arr.data, w, h, img.chan, data, iscompressed);
	img.ctx.putImageData(arr, 0, 0);
	draw(dst, r, img, r.min, Memdraw.Opdefs.SoverD.key);
	/* XXX Append canvas for debugging. */
	document.body.appendChild(dst.canvas);
	return offset;
}

var arrowend = function(tip, points, pp, end, sin, cos, radius){
	var x1, x2, x3;

	if(end == Memdraw.End.arrow){
		x1 = 8;
		x2 = 10;
		x3 = 3;
	}else{
		x1 = (end >> 5) & 0x1FF;
		x2 = (end >>14) & 0x1FF;
		x3 = (end >> 23) & 0x1FF;
	}

	points[pp] = { /* upper side of shaft */
		x: tip.x+((2*radius+1)*sin/2-x1*cos),
		y: tip.y-((2*radius+1)*cos/2+x1*sin)
	};
	++pp;
	points[pp] = { /* upper barb */
		x: tip.x+((2*radius+2*x3+1)*sin/2-x2*cos),
		y: tip.y-((2*radius+2*x3+1)*cos/2+x2*sin)
	};
	++pp;
	points[pp] = {
		x: tip.x,
		y: tip.y
	};
	++pp;
	points[pp] = { /* lower barb */
		x: tip.x+(-(2*radius+2*x3+1)*sin/2-x2*cos),
		y: tip.y-(-(2*radius+2*x3+1)*cos/2+x2*sin)
	};
	++pp;
	points[pp] = { /* lower side of shaft */
		x: tip.x+(-(2*radius+1)*sin/2-x1*cos),
		y: tip.y+((2*radius+1)*cos/2-x1*sin)
	};
}

var discend = function(p, radius, dst, src, dsrc, op){
	Memdraw.fillellipse(dst, p, radius, radius, 0, 2 * Math.PI, src, dsrc, op);
}

var drawchar = function(dst, p, src, sp, font, fc, op){
	var r = {
		min: {
			x: p.x + fc.left,
			y: p.y - (font.ascent - fc.r.min.y)
		},
		max: {
			x: (p.x + fc.left) + (fc.r.max.x - fc.r.min.x),
			y: (p.y - (font.ascent - fc.r.min.y)) + (fc.r.max.y - fc.r.min.y)
		}
	}
	var sp1 = {
		x: sp.x + fc.left,
		y: sp.y + fc.r.min.y
	}

	drawmasked(dst, r, src, sp1, font, fc.r.min, op);
	p.x += fc.width;
	sp.x += fc.width;
	return p;
}

Memdraw = {
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
		var pp = 0;

		switch(end0 & 0x1F){
		case Memdraw.End.disc:
			discend(p0, radius, dst, src, sp, op);
			/* fall through */
		case Memdraw.End.square:
		default:
			points[pp] = {x: q.x-dx, y: q.y+dy};
			++pp;
			points[pp] = {x: q.x+dx, y: q.y-dy};
			++pp;
			break;
		case Memdraw.End.arrow:
			arrowend(q, points, pp, end0, -angle.sin, -angle.cos, radius);
			this.fillpoly(dst, points.slice(0, 5), 0, src, sp, op);
			points[pp+1] = points[pp+4];
			pp += 2;
		}
		q = {
			x: p1.x + 1/2 + angle.cos/2,
			y: p1.y + 1/2 + angle.sin/2
		}

		switch(end1 & 0x1F){
		case Memdraw.End.disc:
			discend(p1, radius, dst, src, sp, op);
			/* fall through */
		case Memdraw.End.square:
		default:
			points[pp] = {x: q.x+dx, y: q.y-dy};
			++pp;
			points[pp] = {x: q.x-dx, y: q.y+dy};
			++pp;
			break;
		case Memdraw.End.arrow:
			arrowend(q, points, pp, end1, angle.sin, angle.cos, radius);
			this.fillpoly(dst, points.slice(pp, pp+5), 0, src, sp, op);
			points[pp+1] = points[pp+4];
			pp += 2;
		}
		/* XXX setting w incorrectly! */
		return this.fillpoly(dst, points.slice(0, pp), 0, src, sp, op);
	},
	/* XXX behaves incorrectly for incomplete (non 2pi) ellipses. */
	fillellipse: function(dst, c, horiz, vert, alpha, phi, src, sp, op){
		dst.ctx.save();
		dst.ctx.save();
		dst.ctx.beginPath();
		dst.ctx.translate(c.x, c.y);
		dst.ctx.scale(horiz, vert);
		dst.ctx.arc(0, 0, 1, alpha, phi, false);
		dst.ctx.restore();
		dst.ctx.clip();
		draw(dst, dst.clipr, src, sp, op);
		dst.ctx.restore();
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
		/* XXX fill background here */
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
			this.line(dst, points[i-1], points[i],
				Memdraw.End.disc, Memdraw.End.disc,
				radius, src, sp, op);
		}
	},
	load: function(dst, r, data, iscompressed){
		return load(dst, r, data, iscompressed);
	},
	string: function(dst, src, font, p, clipr, sp, index, op){
		for(var i = 0; i < index.length; ++i){
			if(index[i] == 0 || index[i] >= font.nchar){
				throw("font cache index out of bounds");
			}cons.log("char: " + index[i]);
			drawchar(dst, p, src, sp, font, font.fchar[index[i]], op);
		}
	},
	Opdefs: {
		Clear: {key: 0, op: undefined},
		SinD: {key: 8, op: "source-in"},
		DinS: {key: 4, op: "destination-in"},
		SoutD: {key: 2, op: "source-out"},
		DoutS: {key: 1, op: "destination-out"},

		S: {key: 10, op: "copy"}, /* SinD | SoutD */
		SoverD: {key: 11, op: "source-over"}, /* SinD | SoutD | DoutS */
		SatopD: {key: 9, op: "source-atop"}, /* SinD | DoutS */
		SxorD: {key: 3, op: "xor"}, /* SoutD | DoutS */

		D: {key: 5, op: undefined}, /* DinS | DoutS */
		DoverS: {key: 7, op: "destination-over"}, /* DinS | DoutS | SoutD */
		DatopS: {key: 6, op: "destination-atop"}, /* DinS | SoutD */
		DxorS: {key: 3, op: "xor"}, /* DoutS | SoutD */

		/* Ncomp: 12 */
	}
}

Memdraw.Ops = (function(o){
	var ops = [];
	for(var k in o){
		ops[o[k].key] = o[k].op;
	}
	return ops;
})(Memdraw.Opdefs);

Memdraw.End = {
	square: 0,
	disc: 1,
	arrow: 2,
	mask: 0x1F
}

Memdraw.ARROW = function(a, b, c){
	return Memdraw.End.arrow | (a << 5) | (b << 14) | (c << 23);
}

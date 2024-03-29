Draw9p.writedrawdata = function(connid, offset, data){
	var conn = this.conns[connid];
	if(conn == undefined){
		throw("invalid draw connection");
	}

	var length = data.length;
	var ai = new ArrayIterator(data);
	while(ai.hasRemainingBytes()){
		var c = String.fromCharCode(ai.getChar());
		//cons.log("writedrawdata: " + c);
		if(this.drawdatahandlers[c] == undefined){
			throw("bad draw command");
		}else{
			this.drawdatahandlers[c](conn, offset, ai);
		}
	}
	return length;
}

var drawcoord = function(ai, old){
	var b, x;

	b = ai.getChar();
	x = b & 0x7F;
	if(b & 0x80){
		x |= ai.getChar() << 7;
		x |= ai.getChar() << 15;
		if(x & (1<<22)){
			/* Not sure how ~0 would work in Javascript. */
			x |= ((1<<31)|((1<<31)-1))<<23;
		}
	}else{
		if(b & 0x40){
			x |= ((1<<31)|((1<<31)-1))<<7;
		}
		x += old;
	}
	return x;
}

with(Draw9p){
Draw9p.drawdatahandlers = {
	"A": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var imageid = ai.getLong();
			var fillid = ai.getLong();
			var public = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		if(conn.screens[id] != undefined){
			throw("screen id in use");
		}
		var image = conn.imgs[imageid];
		if(image == undefined){
			throw("invalid image id");
		}
		var fill = conn.imgs[fillid];
		if(fill == undefined){
			throw("invalid image id");
		}
		conn.screens[id] = new Draw9p.Screen(id, image, fill, public);
	},
	"b": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var screenid = ai.getLong();
			var refresh = ai.getChar();
			var chan = ai.getLong();
			var repl = ai.getChar();
			var r = ai.getRect();
			var clipr = ai.getRect();
			var color = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] != undefined){
			throw("image id in use");
		}
		if(screenid){
			if(conn.screens[screenid] == undefined){
				throw("invalid screen id");
			}
			conn.screens[screenid].imgs[id] = conn.imgs[id] =
				new ScreenImage(conn.screens[screenid],
					refresh, chan, repl, r, clipr, color);
		}else{
			conn.imgs[id] = new Image(refresh, chan, repl, r, clipr, color);
		}
	},
	"c": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var repl = ai.getChar();
			var clipr = ai.getRect();
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		dst.repl = repl;
		dst.clipr = clipr;
	},
	"d": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var maskid = ai.getLong();
			var dstr = ai.getRect();
			var srcp = ai.getPoint();
			var maskp = ai.getPoint();
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		var mask = conn.imgs[maskid];
		if(mask == undefined){
			throw("invalid image id");
		}
		drawmasked(dst, dstr, src, srcp, mask, maskp, conn.op);
	},
	"D": function(conn, offset, ai){
		try{
			var debugon = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
	},
	"e": function(conn, offset, ai){
		cons.log("writedrawdata: 'e' (ellipse outline) unimplemented!");
		try{
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var c = ai.getPoint();
			var a = ai.getLong();
			var b = ai.getLong();
			var thick = ai.getLong();
			var sp = ai.getPoint();
			var alpha = ai.getLong();
			var phi = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
	},
	"E": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var center = ai.getPoint();
			var a = ai.getLong();
			var b = ai.getLong();
			var thick = ai.getLong();
			var sp = ai.getPoint();
			var alpha = ai.getLong();
			var phi = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid destination image");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid source image");
		}
		Memdraw.fillellipse(dst, center, a, b, alpha, phi, src,sp, conn.op);
	},
	"f": function(conn, offset, ai){
		try{
			var id = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		var img = conn.imgs[id];
		if(img == undefined){
			throw("invalid image id");
		}
		var screen = img.screen;
		if(screen){
			delete screen.imgs[id];
		}
		img.canvas.parentNode.removeChild(img.canvas);
		delete conn.imgs[id];
	},
	"F": function(conn, offset, ai){
		cons.log("writedrawdata: 'F' (free screen) unimplemented!");
		try{
			var id = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
	},
	"i": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var n = ai.getLong();
			var ascent = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		var img = conn.imgs[id];
		if(img == undefined){
			throw("invalid image id");
		}
		img.nchar = n;
		img.ascent = ascent;
		img.fchar = [];
		/* document.body.appendChild(img.canvas); */
	},
	"l": function(conn, offset, ai){
		try{
			var cacheid = ai.getLong();
			var srcid = ai.getLong();
			var index = ai.getShort();
			var r = ai.getRect();
			var sp = ai.getPoint();
			var left = signed8dec(ai.getChar());
			var width = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		var cache = conn.imgs[cacheid];
		if(cache == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		cache.fchar[index] = {
			r: r,
			left: left,
			width: width
		};
		drawmasked(cache, r, src, sp, undefined, undefined, Memdraw.Opdefs.SoverD.key);
	},
	"L": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var p0 = ai.getPoint();
			var p1 = ai.getPoint();
			var end0 = ai.getLong();
			var end1 = ai.getLong();
			var thick = ai.getLong();
			var srcid = ai.getLong();
			var sp = ai.getPoint();
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		Memdraw.line(dst, p0, p1, end0, end1, thick,
			src, sp, conn.op);
	},
	"N": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var inp = ai.getChar();
			var j = ai.getChar();
			var name = String.fromUTF8Array(ai.getBytes(j));
		}catch(e){
			throw("short draw message");
		}
		if(inp){
			if(conn.imgs[id] == undefined){
				throw("invalid image id");
			}
			/* XXX Silently overwrites conflicting name. */
			imgnames[name] = conn.imgs[id];
		}else{
			/* XXX Should check if this is the right image. */
			delete imgnames[name];
		}
	},
	"n": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var j = ai.getChar();
			var name = String.fromUTF8Array(ai.getBytes(j));
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] != undefined){
			throw("image id in use");
		}
		if(imgnames[name] == undefined){
			throw("no image by name " + name);
		}
		conn.imgs[id] = imgnames[name];
	},
	"o": function(conn, offset, ai){
		cons.log("writedrawdata: 'o' (translate window) unimplemented!");
		try{
			var id = ai.getLong();
			var rmin = ai.getPoint();
			var scr = ai.getPoint();
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] == undefined){
			throw("invalid image id");
		}
		var img = conn.imgs[id];
		if(img.screen == undefined){
			throw("image is not a window");
		}
		img.r = rectaddpt(img.r, subpt(rmin, img.r.min));
		img.clipr = rectaddpt(img.clipr, subpt(rmin, img.clipr.min));
		img.scrmove(scr);
	},
	"O": function(conn, offset, ai){
		try{
			var op = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		conn.op = op;
	},
	"p": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var n = ai.getShort() + 1;
			var end0 = ai.getLong();
			var end1 = ai.getLong();
			var thick = ai.getLong();
			var srcid = ai.getLong();
			var sp = ai.getPoint();
			var dp = [];
			var o = new Point(0, 0);
			for(var i = 0; i < n; ++i){
				dp[i] = new Point(
					drawcoord(ai, o.x),
					drawcoord(ai, o.y)
				);
				o = dp[i];
			}
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		Memdraw.poly(dst, dp, end0, end1, thick, src, sp, conn.op);
	},
	"P": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var n = ai.getShort() + 1;
			var wind = ai.getLong();
			var ignore = ai.getPoint();
			var srcid = ai.getLong();
			var sp = ai.getPoint();
			var dp = [];
			var o = new Point(0, 0);
			for(var i = 0; i < n; ++i){
				var p = new Point(
					drawcoord(ai, o.x),
					drawcoord(ai, o.y)
				);
				dp[i] = o = p;
			}
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		Memdraw.fillpoly(dst, dp, wind, src, sp, conn.op);
	},
	"r": function(conn, offset, ai){
		cons.log("writedrawdata: 'r' (read back rectangle) unimplemented!");
		try{
			var id = ai.getLong();
			var r = ai.getRect();
		}catch(e){
			throw("short draw message");
		}
	},
	"s": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var fontid = ai.getLong();
			var p = ai.getPoint();
			var clipr = ai.getRect();
			var sp = ai.getPoint();
			var n = ai.getShort();
			var index = [];
			for(var i = 0; i < n; ++i){
				index[i] = ai.getShort();
			}
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		var font = conn.imgs[fontid];
		if(font == undefined){
			throw("invalid image id");
		}
		if(font.fchar == undefined){
			throw("not a font");
		}
		Memdraw.string(dst, src, font, p, clipr, sp, null, null, index, conn.op);
	},
	"x": function(conn, offset, ai){
		try{
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var fontid = ai.getLong();
			var dp = ai.getPoint();
			var clipr = ai.getRect();
			var sp = ai.getPoint();
			var n = ai.getShort();
			var bgid = ai.getLong();
			var bp = ai.getPoint();
			var index = [];
			for(var i = 0; i < n; ++i){
				index[i] = ai.getShort();
			}
		}catch(e){
			throw("short draw message");
		}
		var dst = conn.imgs[dstid];
		if(dst == undefined){
			throw("invalid image id");
		}
		var src = conn.imgs[srcid];
		if(src == undefined){
			throw("invalid image id");
		}
		var font = conn.imgs[fontid];
		if(font == undefined){
			throw("invalid image id");
		}
		if(font.fchar == undefined){
			throw("not a font");
		}
		var bg = conn.imgs[bgid];
		if(bg == undefined){
			throw("invalid image id");
		}
		Memdraw.string(dst, src, font, dp, clipr, sp, bg, bp, index, conn.op);
	},
	"S": function(conn, offset, ai){
		cons.log("writedrawdata: 'S' (screen attach public) unimplemented!");
		try{
			var id = ai.getLong();
			var chan = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
	},
	"t": function(conn, offset, ai){
		var img;
		try{
			var top = ai.getChar();
			var n = ai.getShort();
			var ids = [];
			for(var i = 0; i < n; ++i){
				ids[i] = ai.getShort();
			}
		}catch(e){
			throw("short draw message");
		}
		if(n > 1)
			cons.log("t (windows to top): XXX more than one window!");
		img = conn.imgs[ids[0]];
		if(top)
			img.tofront();
		else
			img.torear();
	},
	"v": function(conn, offset, ai){
		for(var i in conn.screens){
			conn.screens[i].repaint();
		}
	},
	"y": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var r = ai.getRect();
			var buf = ai.peekRemainingBytes();
		}catch(e){
			throw("short draw message");
		}
		var img = conn.imgs[id];
		if(img == undefined){
			throw("invalid image id");
		}
		var seek = Memdraw.load(img, r, buf, false);
		ai.advanceBytes(seek);
	},
	"Y": function(conn, offset, ai){
		try{
			var id = ai.getLong();
			var r = ai.getRect();
			var buf = ai.peekRemainingBytes();
		}catch(e){
			throw("short draw message");
		}
		var img = conn.imgs[id];
		if(img == undefined){
			throw("invalid image id");
		}
		var seek = Memdraw.load(img, r, buf, true);
		ai.advanceBytes(seek);
	},
}
}

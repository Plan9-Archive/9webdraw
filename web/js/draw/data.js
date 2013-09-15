Draw9p.writedrawdata = function(connid, offset, data){
	var conn = this.conns[connid];
	if(conn == undefined){
		throw("invalid draw connection");
	}

	var length = data.length;
	var c = String.fromUTF8Array(data.splice(0, 1));
	cons.log("writedrawdata: " + c);
	if(this.drawdatahandlers[c] == undefined){
		throw("bad draw command");
	}else{
		return this.drawdatahandlers[c](conn, offset, data, length);
	}
}

with(Draw9p){
Draw9p.drawdatahandlers = {
	"A": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"b": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"c": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var dstid = ai.getLong();
			var repl = ai.getChar();
			var clipr = ai.getRect();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"d": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var dstid = ai.getLong();
			var srcid = ai.getLong();
			var maskid = ai.getLong();
			var dstr = ai.getRect();
			var srcp = ai.getPoint();
			var maskp = ai.getPoint();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"D": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var debugon = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"e": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"E": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"f": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"F": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"i": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var n = ai.getLong();
			var ascent = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"l": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var cacheid = ai.getLong();
			var srcid = ai.getLong();
			var index = ai.getShort();
			var r = ai.getRect();
			var sp = ai.getPoint();
			var left = ai.getChar();
			var width = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"L": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"N": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"n": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"o": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var rmin = ai.getPoint();
			var scr = ai.getPoint();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"O": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var op = ai.getChar();
		}catch(e){
			throw("short draw message");
		}
		conn.op = op;
		return length;
	},
	"p": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var dstid = ai.getLong();
			var n = ai.getShort();
			var end0 = ai.getLong();
			var end1 = ai.getLong();
			var thick = ai.getLong();
			var srcid = ai.getLong();
			var sp = ai.getPoint();
			var dp = [];
			for(var i = 0; i < n; ++i){
				dp[i] = ai.getPoint();
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
		return length;
	},
	"P": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var dstid = ai.getLong();
			var n = ai.getShort();
			var wind = ai.getLong();
			var ignore = ai.getPoint();
			var srcid = ai.getLong();
			var sp = ai.getPoint();
			var dp = [];
			for(var i = 0; i < n; ++i){
				dp[i] = ai.getPoint();
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
		return length;
	},
	"r": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var r = ai.getRect();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"s": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"x": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
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
		return length;
	},
	"S": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var chan = ai.getLong();
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"t": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var top = ai.getChar();
			var n = ai.getShort();
			var ids = [];
			for(var i = 0; i < n; ++i){
				ids[i] = ai.getShort();
			}
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"v": function(conn, offset, data, length){
		return length;
	},
	"y": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var r = ai.getRect();
			var buf = ai.getRemainingBytes();
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] == undefined){
			throw("invalid image id");
		}
		Memdraw.load(conn.imgs[id], r, buf, false);
		return length;
	},
	"Y": function(conn, offset, data, length){
		try{
			var ai = new ArrayIterator(data);
			var id = ai.getLong();
			var r = ai.getRect();
			var buf = ai.getRemainingBytes();
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] == undefined){
			throw("invalid image id");
		}
		Memdraw.load(conn.imgs[id], r, buf, true);
		return length;
	},
}
}

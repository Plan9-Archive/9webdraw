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
			var id = DBGLONG(data);
			var imageid = DBGLONG(data);
			var fillid = DBGLONG(data);
			var public = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		if(conn.screens[id] != undefined){
			throw("screen id in use");
		}
		if(conn.imgs[imageid] == undefined){
			throw("invalid image id");
		}
		if(conn.imgs[fillid] == undefined){
			throw("invalid image id");
		}
		var image = conn.imgs[imageid];
		var fill = conn.imgs[fillid];
		conn.screens[id] = new Draw9p.Screen(id, image, fill, public);
		return length;
	},
	"b": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var screenid = DBGLONG(data);
			var refresh = DBGCHAR(data);
			var chan = DBGLONG(data);
			var repl = DBGCHAR(data);
			var r = DGRECT(data);
			var clipr = DGRECT(data);
			var color = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[id] != undefined){
			throw("image id in use");
		}
		/* XXX Change this once we implement screens. */
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
			var dstid = DBGLONG(data);
			var repl = DBGCHAR(data);
			var clipr = DGRECT(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"d": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var maskid = DBGLONG(data);
			var dstr = DGRECT(data);
			var srcp = DGPOINT(data);
			var maskp = DGPOINT(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"D": function(conn, offset, data, length){
		try{
			var debugon = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"e": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var c = DGPOINT(data);
			var a = DBGLONG(data);
			var b = DBGLONG(data);
			var thick = DBGLONG(data);
			var sp = DGPOINT(data);
			var alpha = DBGLONG(data);
			var phi = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"E": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var center = DGPOINT(data);
			var a = DBGLONG(data);
			var b = DBGLONG(data);
			var thick = DBGLONG(data);
			var sp = DGPOINT(data);
			var alpha = DBGLONG(data);
			var phi = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[dstid] == undefined){
			throw("invalid destination image");
		}
		if(conn.imgs[srcid] == undefined){
			throw("invalid source image");
		}
		Memdraw.fillellipse(dst, center, a, b, alpha, phi, src,sp, conn.op);
		return length;
	},
	"f": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"F": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"i": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var n = DBGLONG(data);
			var ascent = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"l": function(conn, offset, data, length){
		try{
			var cacheid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var index = DBGSHORT(data);
			var r = DGRECT(data);
			var sp = DGPOINT(data);
			var left = DBGCHAR(data);
			var width = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"L": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var p0 = DGPOINT(data);
			var p1 = DGPOINT(data);
			var end0 = DBGLONG(data);
			var end1 = DBGLONG(data);
			var thick = DBGLONG(data);
			var srcid = DBGLONG(data);
			var sp = DGPOINT(data);
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[dstid] == undefined){
			throw("invalid image id");
		}
		if(conn.imgs[srcid] == undefined){
			throw("invalid image id");
		}
		Memdraw.line(conn.imgs[dstid], p0, p1, end0, end1, thick,
			conn.imgs[srcid], sp, conn.op);
		return length;
	},
	"N": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var inp = DBGCHAR(data);
			var j = DBGCHAR(data);
			var name = String.fromUTF8Array(data.splice(0, j));
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
			var id = DBGLONG(data);
			var j = DBGCHAR(data);
			var name = String.fromUTF8Array(data.splice(0, j));
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
			var id = DBGLONG(data);
			var rmin = DGPOINT(data);
			var scr = DGPOINT(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"O": function(conn, offset, data, length){
		try{
			var op = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		conn.op = op;
		return length;
	},
	"p": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var n = DBGSHORT(data);
			var end0 = DBGLONG(data);
			var end1 = DBGLONG(data);
			var thick = DBGLONG(data);
			var srcid = DBGLONG(data);
			var sp = DGPOINT(data);
			var dp = [];
			for(var i = 0; i < n; ++i){
				dp[i] = DGPOINT(data);
			}
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[dstid] == undefined){
			throw("invalid image id");
		}
		if(conn.imgs[srcid] == undefined){
			throw("invalid image id");
		}
		var dst = conn.imgs[dstid];
		var src = conn.imgs[srcid];
		Memdraw.poly(dst, dp, end0, end1, thick, src, sp, conn.op);
		return length;
	},
	"P": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var n = DBGSHORT(data);
			var wind = DBGLONG(data);
			var ignore = DGPOINT(data);
			var srcid = DBGLONG(data);
			var sp = DGPOINT(data);
			var dp = [];
			for(var i = 0; i < n; ++i){
				dp[i] = DGPOINT(data);
			}
		}catch(e){
			throw("short draw message");
		}
		if(conn.imgs[dstid] == undefined){
			throw("invalid image id");
		}
		if(conn.imgs[srcid] == undefined){
			throw("invalid image id");
		}
		var dst = conn.imgs[dstid];
		var src = conn.imgs[srcid];
		Memdraw.fillpoly(dst, dp, wind, src, sp, conn.op);
		return length;
	},
	"r": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var r = DGRECT(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"s": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var fontid = DBGLONG(data);
			var p = DGPOINT(data);
			var clipr = DGRECT(data);
			var sp = DGPOINT(data);
			var n = DBGSHORT(data);
			var index = [];
			for(var i = 0; i < n; ++i){
				index[i] = DBGSHORT(data);
			}
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"x": function(conn, offset, data, length){
		try{
			var dstid = DBGLONG(data);
			var srcid = DBGLONG(data);
			var fontid = DBGLONG(data);
			var dp = DGPOINT(data);
			var clipr = DGRECT(data);
			var sp = DGPOINT(data);
			var n = DBGSHORT(data);
			var bgid = DBGLONG(data);
			var bp = DGPOINT(data);
			var index = [];
			for(var i = 0; i < n; ++i){
				index[i] = DBGSHORT(data);
			}
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"S": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var chan = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"t": function(conn, offset, data, length){
		try{
			var top = DBGCHAR(data);
			var n = DBGSHORT(data);
			var ids = [];
			for(var i = 0; i < n; ++i){
				ids[i] = DBGSHORT(data);
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
			var id = DBGLONG(data);
			var r = DGRECT(data);
			var buf = []; /* XXX what is x? */
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
	"Y": function(conn, offset, data, length){
		try{
			var id = DBGLONG(data);
			var r = DGRECT(data);
			var buf = []; /* XXX what is x? */
		}catch(e){
			throw("short draw message");
		}
		return length;
	},
}
}

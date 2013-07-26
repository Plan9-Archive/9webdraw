Draw9p.writedrawdata = function(connid, offset, data){
	var conn = this.conns[connid];
	if(conn == undefined){
		throw("invalid draw connection");
	}

	var c = String.fromUTF8Array(data.splice(0, 1));
	if(this.drawdatahandlers[c] == undefined){
		throw("bad draw command");
	}else{
		return this.drawdatahandlers[c](conn, offset, data);
	}
}

with(Draw9p){
Draw9p.drawdatahandlers = {
	"A": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var imageid = DBGLONG(data);
			var fillid = DBGLONG(data);
			var public = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"b": function(conn, offset, data){
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
			throw("screen does not exist");
		}
		conn.imgs[id] = new Image(refresh, chan, repl, r, clipr, color);
		return offset;
	},
	"c": function(conn, offset, data){
		try{
			var dstid = DBGLONG(data);
			var repl = DBGCHAR(data);
			var clipr = DGRECT(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"d": function(conn, offset, data){
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
		return offset;
	},
	"D": function(conn, offset, data){
		try{
			var debugon = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"e": function(conn, offset, data){
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
		return offset;
	},
	"E": function(conn, offset, data){
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
		return offset;
	},
	"f": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"F": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"i": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var n = DBGLONG(data);
			var ascent = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"l": function(conn, offset, data){
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
		return offset;
	},
	"L": function(conn, offset, data){
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
		return offset;
	},
	"N": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var inp = DBGCHAR(data);
			var j = DBGCHAR(data);
			var name = String.fromUTF8Array(data.split(0, j));
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"n": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var j = DBGCHAR(data);
			var name = String.fromUTF8Array(data.split(0, j));
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"o": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var rmin = DGPOINT(data);
			var scr = DGPOINT(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"O": function(conn, offset, data){
		try{
			var op = DBGCHAR(data);
		}catch(e){
			throw("short draw message");
		}
		conn.op = op;
		return offset;
	},
	"p": function(conn, offset, data){
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
		return offset;
	},
	"P": function(conn, offset, data){
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
		return offset;
	},
	"r": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var r = DGRECT(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"s": function(conn, offset, data){
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
		return offset;
	},
	"x": function(conn, offset, data){
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
		return offset;
	},
	"S": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var chan = DBGLONG(data);
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"t": function(conn, offset, data){
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
		return offset;
	},
	"v": function(conn, offset, data){
		return offset;
	},
	"y": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var r = DGRECT(data);
			var buf = []; /* XXX what is x? */
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
	"Y": function(conn, offset, data){
		try{
			var id = DBGLONG(data);
			var r = DGRECT(data);
			var buf = []; /* XXX what is x? */
		}catch(e){
			throw("short draw message");
		}
		return offset;
	},
}
}

var DBGCHAR = function(p){
	return p.splice(0, 1)[0];
}
var BGSHORT = function(p){
	return (p[0]<<0) | (p[1]<<8);
}
var DBGSHORT = function(p){
	return BGSHORT(p.splice(0, 4));
}
var BGLONG = function(p){
	return (p[0]<<0) | (p[1]<<8) | (p[2]<<16) | (p[3]<<24);
}
var DBGLONG = function(p){
	return BGLONG(p.splice(0, 4));
}
var BPSHORT = function(p, v){
	p[0] = (v) & 0xFF;
	p[1] = (v >> 8) & 0xFF;
	return p;
}
var BPLONG = function(p, v){
	p[0] = (v) & 0xFF;
	p[1] = (v >> 8) & 0xFF;
	p[2] = (v >>16) & 0xFF;
	p[3] = (v >> 24) & 0xFF;
	return p;
}

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
		var id = DBGLONG(data);
		var imageid = DBGLONG(data);
		var fillid = DBGLONG(data);
		var public = DBGCHAR(data);
		return offset;
	},
	"b": function(conn, offset, data){
		var id = DBGLONG(data);
		var screenid = DBGLONG(data);
		var refresh = DBGCHAR(data);
		var chan = DBGLONG(data);
		var repl = DBGCHAR(data);
		var r = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var clipr = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var color = DBGLONG(data);
		return offset;
	},
	"c": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var repl = DBGCHAR(data);
		var clipr = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		return offset;
	},
	"d": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var maskid = DBGLONG(data);
		var dstr = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var srcp = [DBGLONG(data), DBGLONG(data)];
		var maskp = [DBGLONG(data), DBGLONG(data)];
		return offset;
	},
	"D": function(conn, offset, data){
		var debugon = DBGCHAR(data);
		return offset;
	},
	"e": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var c = [DBGLONG(data), DBGLONG(data)];
		var a = DBGLONG(data);
		var b = DBGLONG(data);
		var thick = DBGLONG(data);
		var sp = [DBGLONG(data), DBGLONG(data)];
		var alpha = DBGLONG(data);
		var phi = DBGLONG(data);
		return offset;
	},
	"E": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var center = [DBGLONG(data), DBGLONG(data)];
		var a = DBGLONG(data);
		var b = DBGLONG(data);
		var thick = DBGLONG(data);
		var sp = [DBGLONG(data), DBGLONG(data)];
		var alpha = DBGLONG(data);
		var phi = DBGLONG(data);
		return offset;
	},
	"f": function(conn, offset, data){
		var id = DBGLONG(data);
		return offset;
	},
	"F": function(conn, offset, data){
		var id = DBGLONG(data);
		return offset;
	},
	"i": function(conn, offset, data){
		var id = DBGLONG(data);
		var n = DBGLONG(data);
		var ascent = DBGCHAR(data);
		return offset;
	},
	"l": function(conn, offset, data){
		var cacheid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var index = DBGSHORT(data);
		var r = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var sp = [DBGLONG(data), DBGLONG(data)];
		var left = DBGCHAR(data);
		var width = DBGCHAR(data);
		return offset;
	},
	"L": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var p0 = [DBGLONG(data), DBGLONG(data)];
		var p1 = [DBGLONG(data), DBGLONG(data)];
		var end0 = DBGLONG(data);
		var end1 = DBGLONG(data);
		var thick = DBGLONG(data);
		var srcid = DBGLONG(data);
		var sp = [DBGLONG(data), DBGLONG(data)];
		return offset;
	},
	"N": function(conn, offset, data){
		var id = DBGLONG(data);
		var inp = DBGCHAR(data);
		var j = DBGCHAR(data);
		var name = String.fromUTF8Array(data.split(0, j));
		return offset;
	},
	"n": function(conn, offset, data){
		var id = DBGLONG(data);
		var j = DBGCHAR(data);
		var name = String.fromUTF8Array(data.split(0, j));
		return offset;
	},
	"o": function(conn, offset, data){
		var id = DBGLONG(data);
		var rmin = [DBGLONG(data), DBGLONG(data)];
		var scr = [DBGLONG(data), DBGLONG(data)];
		return offset;
	},
	"O": function(conn, offset, data){
		var op = DBGCHAR(data);
		return offset;
	},
	"p": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var n = DBGSHORT(data);
		var end0 = DBGLONG(data);
		var end1 = DBGLONG(data);
		var thick = DBGLONG(data);
		var srcid = DBGLONG(data);
		var sp = [DBGLONG(data), DBGLONG(data)];
		var dp = [];
		for(var i = 0; i < n; ++i){
			dp[i] = [DBGLONG(data), DBGLONG(data)];
		}
		return offset;
	},
	"P": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var n = DBGSHORT(data);
		var wind = DBGLONG(data);
		var ignore = [DBGLONG(data), DBGLONG(data)];
		var srcid = DBGLONG(data);
		var sp = [DBGLONG(data), DBGLONG(data)];
		var dp = [];
		for(var i = 0; i < n; ++i){
			dp[i] = [DBGSHORT(data), DBGSHORT(data)];
		}
		return offset;
	},
	"r": function(conn, offset, data){
		var id = DBGLONG(data);
		var r = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		return offset;
	},
	"s": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var fontid = DBGLONG(data);
		var p = [DBGLONG(data), DBGLONG(data)];
		var clipr = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var sp = [DBGLONG(data), DBGLONG(data)];
		var n = DBGSHORT(data);
		var index = [];
		for(var i = 0; i < n; ++i){
			index[i] = DBGSHORT(data);
		}
		return offset;
	},
	"x": function(conn, offset, data){
		var dstid = DBGLONG(data);
		var srcid = DBGLONG(data);
		var fontid = DBGLONG(data);
		var dp = [DBGLONG(data), DBGLONG(data)];
		var clipr = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var sp = [DBGLONG(data), DBGLONG(data)];
		var n = DBGSHORT(data);
		var bgid = DBGLONG(data);
		var bp = [DBGLONG(data), DBGLONG(data)];
		var index = [];
		for(var i = 0; i < n; ++i){
			index[i] = DBGSHORT(data);
		}
		return offset;
	},
	"S": function(conn, offset, data){
		var id = DBGLONG(data);
		var chan = DBGLONG(data);
		return offset;
	},
	"t": function(conn, offset, data){
		var top = DBGCHAR(data);
		var n = DBGSHORT(data);
		var ids = [];
		for(var i = 0; i < n; ++i){
			ids[i] = DBGSHORT(data);
		}
		return offset;
	},
	"v": function(conn, offset, data){
		return offset;
	},
	"y": function(conn, offset, data){
		var id = DBGLONG(data);
		var r = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var buf = []; /* XXX what is x? */
		return offset;
	},
	"Y": function(conn, offset, data){
		var id = DBGLONG(data);
		var r = [DBGLONG(data), DBGLONG(data),
			DBGLONG(data), DBGLONG(data)];
		var buf = []; /* XXX what is x? */
		return offset;
	},
}
}

var BGSHORT = function(p){
	return (p[0]<<0) | (p[1]<<8);
}
var BGLONG = function(p){
	return (p[0]<<0) | (p[1]<<8) | (p[2]<<16) | (p[3]<<24);
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

	switch(String.fromUTF8Array([data[0]])){
	case "A":
	case "b":
	case "c":
	case "d":
	case "D":
	case "e":
	case "E":
	case "f":
	case "F":
	case "i":
	case "l":
	case "L":
	case "N":
	case "n":
	case "o":
	case "O":
	case "p":
	case "P":
	case "r":
	case "s":
	case "x":
	case "S":
	case "t":
	case "v":
	case "y":
	case "Y":
		return data.length;
	default:
		throw("bad draw command");
	}
}

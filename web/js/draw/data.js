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

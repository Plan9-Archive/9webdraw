NineP = function(path){
	var that = this;
	this.socket = new Socket(path, function(e){that.rawpktin(e);});
	/* this.write = function(s){ this.socket.write(s);}; */

	this.maxbufsz = 32768;
	this.buffer = [];
};

NineP.NOTAG = (~0) & 0xFFFF;

NineP.packets = {
	Tversion:	100,
	Rversion:	101,
	Tauth:	102,
	Rauth:	103,
	Tattach:	104,
	Rattach:	105,
	Terror:	106,
	Rerror:	107,
	Tflush:	108,
	Rflush:	109,
	Twalk:	110,
	Rwalk:	111,
	Topen:	112,
	Ropen:	113,
	Tcreate:	114,
	Rcreate:	115,
	Tread:	116,
	Rread:	117,
	Twrite:	118,
	Rwrite:	119,
	Tclunk:	120,
	Rclunk:	121,
	Tremove:	122,
	Rremove:	123,
	Tstat:	124,
	Rstat:	125,
	Twstat:	126,
	Rwstat:	127,
	Tmax:	128
}

NineP.GBIT8 = function(p){ return (p[0]); };
NineP.GBIT16 = function(p){ return (p[0])|(p[1]<<8); };
NineP.GBIT32 = function(p){ return (p[0])|(p[1]<<8)|(p[2]<<16)|(p[3]<<24); };
NineP.GBIT64 = function(p){ throw("JAVASCRIPT CANNOT INTO INTEGERS!"); };
NineP.PBIT8 = function(p,v){ p[0] = (v)&0xFF; };
NineP.PBIT16 = function(p,v){ p[0] = (v)&0xFF; p[1] = (v>>8)&0xFF; };
NineP.PBIT32 = function(p,v){
	p[0] = (v)&0xFF; p[1] = (v>>8)&0xFF;
	p[2] = (v>>16)&0xFF; p[3] = (V>>24)&0xFF;
}
NineP.PBIT64 = function(p,v){ throw("JAVASCRIPT CANNOT INTO INTEGERS!"); };

NineP.getpktsize = function(buf){ return NineP.GBIT32(buf.slice(0,4)); };
NineP.getpkttype = function(buf){ return buf[4]; };
NineP.getpkttag = function(buf){ return NineP.GBIT16(buf.slice(5, 7)); };

/* XXX This will die horribly on non-ASCII strings! */
NineP.mkstring = function(str){
	var arr = [];
	NineP.PBIT16(arr, str.length);
	arr.append(str.split());
	return arr;
}

NineP.prototype.rawpktin = function(pkt){
	var pktarr = Uint8Array(pkt);

	//this.buffer.push.apply(this.buffer, pktarr);
	this.buffer.append(pktarr);
	cons.log(this.buffer);

	if(this.buffer.length < 4){
		return;
	}

	var size = NineP.getpktsize(this.buffer);

	if(this.buffer.length >= size){
		this.processpkt(this.buffer.splice(0, size));
	}
}

NineP.prototype.processpkt = function(pkt){
	switch(NineP.getpkttype(pkt)){
		case NineP.packets.Tversion:
			this.Rversion(pkt);
			break;
		case NineP.packets.Tauth:
			this.Rerror(pkt, "no authentication required");
			break;
		case NineP.packets.Tattach:
		case NineP.packets.Terror:
		case NineP.packets.Tflush:
		case NineP.packets.Twalk:
		case NineP.packets.Topen:
		case NineP.packets.Tcreate:
		case NineP.packets.Tread:
		case NineP.packets.Twrite:
		case NineP.packets.Tclunk:
		case NineP.packets.Tremove:
		case NineP.packets.Tstat:
		case NineP.packets.Twstat:
		case NineP.packets.Tmax:
		default:
			this.Rerror(pkt, "request not supported");
	}
}

NineP.prototype.Rversion = function(pkt){
}

NineP.prototype.Rerror = function(pkt, msg){
	var tag = NineP.getpkttag(pkt);
	var buf = [NineP.packets.Rerror];
NineP = function(path){
	var that = this;
	this.socket = new Socket(path, function(e){that.rawpktin(e);});
	/* this.write = function(s){ this.socket.write(s);}; */

	this.maxbufsz = 32768;
	this.buffer = [];
};

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

NineP.prototype.rawpktin = function(pkt){
	var pktarr = Uint8Array(pkt);

	this.buffer.push.apply(this.buffer, pktarr);
	cons.log(this.buffer);

	if(this.buffer.length < 4){
		return;
	}

	var size = NineP.GBIT32(this.buffer.slice(0,4));

	if(this.buffer.length >= size){
		this.processpkt(this.buffer.splice(0, size));
	}
}

NineP.prototype.processpkt = function(pkt){
	cons.log(pkt[4]);
	for(var p in NineP.packets){
		if(pkt[4] == NineP.packets[p]){
			cons.log(p);
			break;
		}
	}
}

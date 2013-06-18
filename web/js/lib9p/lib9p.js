NineP = function(path){
	var that = this;
	this.socket = new Socket(path, function(e){that.rawpktin(e);});
	/* this.write = function(s){ this.socket.write(s);}; */

	this.maxbufsz = 32768;
	this.buffer = [];
	this.fids = [];
	this.qids = [new NineP.Qid(0, 0, NineP.QTDIR)];
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
NineP.PBIT8 = function(p,v){
	p[0] = (v)&0xFF;
	return p;
};
NineP.PBIT16 = function(p,v){
	p[0] = (v)&0xFF;
	p[1] = (v>>8)&0xFF;
	return p;
};
NineP.PBIT32 = function(p,v){
	p[0] = (v)&0xFF;
	p[1] = (v>>8)&0xFF;
	p[2] = (v>>16)&0xFF;
	p[3] = (v>>24)&0xFF;
	return p;
}
/* XXX Javascript will do unpleasant things to integers over 32 bits! */
NineP.PBIT64 = function(p,v){
	p[0] = (v) & 0xFF;
	p[1] = (v>>8) & 0xFF;
	p[2] = (v>>16) & 0xFF;
	p[3] = (v>>24) & 0xFF;
	p[4] = (v>>32) & 0xFF;
	p[5] = (v>>40) & 0xFF;
	p[6] = (v>>48) & 0xFF;
	p[7] = (v>>56) & 0xFF;
	return p;
};

NineP.getpktsize = function(buf){ return NineP.GBIT32(buf.slice(0,4)); };
NineP.getpkttype = function(buf){ return buf[4]; };
NineP.getpkttag = function(buf){ return NineP.GBIT16(buf.slice(5, 7)); };

NineP.mkwirestring = function(str){
	var arr = str.toUTF8Array();
	var len = NineP.PBIT16([], arr.length);
	arr = len.concat(arr);
	return arr;
}

NineP.prototype.rawpktin = function(pkt){
	var pktarr = Uint8Array(pkt);

	this.buffer.push.apply(this.buffer, pktarr);
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
	var tag = NineP.PBIT16([], NineP.getpkttag(pkt));
	switch(NineP.getpkttype(pkt)){
		case NineP.packets.Tversion:
			this.Rversion(pkt, tag);
			break;
		case NineP.packets.Tauth:
			this.Rerror(pkt, tag, "no authentication required");
			break;
		case NineP.packets.Tattach:
			this.Tattach(pkt, tag);
			break;
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
			this.Rerror(pkt, tag, "request not supported");
	}
}

NineP.prototype.Rversion = function(pkt, tag){
	var buf = [0, 0, 0, 0, NineP.packets.Rversion];
	buf.push.apply(buf, tag);
	var msize = NineP.GBIT32(pkt.slice(7));
	this.maxbufsz = Math.min(msize, this.maxbufsz);
	buf = buf.concat(NineP.PBIT32([], this.maxbufsz));
	buf = buf.concat(NineP.mkwirestring("9P2000"));
	NineP.PBIT32(buf, buf.length);
	cons.log(buf);
	this.socket.write(buf);
}

NineP.prototype.Tattach = function(pkt, tag){
	var fid = NineP.GBIT32(pkt.slice(7));

	if(this.fids[fid]){
		this.Rerror(pkt, tag, "fid already in use");
	}else{
		this.fids[fid] = 0;
		this.Rattach(tag, fid);
	}
}

NineP.prototype.Rattach = function(tag, fid){
	var buf = [0, 0, 0, 0, NineP.packets.Rattach];
	buf = buf.concat(tag);
	buf = buf.concat(this.qids[this.fids[fid]].toWireQid());
	NineP.PBIT32(buf, buf.length);
	cons.log(buf);
	this.socket.write(buf);
}
	

NineP.prototype.Rerror = function(pkt, tag, msg){
	var buf = [0,0,0,0, NineP.packets.Rerror];
	buf.push.apply(buf, tag);
	buf = buf.concat(NineP.mkwirestring(msg));
	NineP.PBIT32(buf, buf.length);
	cons.log(buf);
	this.socket.write(buf);
}

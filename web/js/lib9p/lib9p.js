NineP = function(path){
	var that = this;
	this.socket = new Socket(path, function(e){that.rawpktin(e);});

	this.maxbufsz = 32768;
	this.buffer = [];
	this.fids = [];
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
/* XXX Javascript will do unpleasant things to integers over 32 bits! */
NineP.GBIT64 = function(p){
	/* throw("JAVASCRIPT CANNOT INTO INTEGERS!"); */
	return (p[0]) | (p[1]<<8) | (p[2]<<16) | (p[3]<<24) |
		(p[4]<<32) | (p[5]<<40) | (p[6]<<48) | (p[7]<<56);
};
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

NineP.getwirestring = function(pkt){
	var len = NineP.GBIT16(pkt.splice(0,2));
	return String.fromUTF8Array(pkt.splice(0,len));
}

NineP.prototype.rawpktin = function(pkt){
	var pktarr = new Uint8Array(pkt);

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
			return this.Rversion(pkt, tag);
		case NineP.packets.Tauth:
			return this.Rerror(tag, "no authentication required");
		case NineP.packets.Tattach:
			return this.Tattach(pkt, tag);
		case NineP.packets.Terror:
			return this.Rerror(tag, "terror");
		case NineP.packets.Tflush:
			return this.Tflush(pkt, tag);
		case NineP.packets.Twalk:
			return this.Twalk(pkt, tag);
		case NineP.packets.Topen:
			return this.Topen(pkt, tag);
		case NineP.packets.Tcreate:
			return this.Rerror(tag, "cannot create");
		case NineP.packets.Tread:
			return this.Rerror(tag, "cannot read");
		case NineP.packets.Twrite:
			return this.Rerror(tag, "cannot write");
		case NineP.packets.Tclunk:
			return this.Tclunk(pkt, tag);
		case NineP.packets.Tremove:
			return this.Rerror(tag, "cannot remove");
		case NineP.packets.Tstat:
			return this.Tstat(pkt, tag);
		case NineP.packets.Twstat:
		case NineP.packets.Tmax:
		default:
			return this.Rerror(tag, "request not supported");
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
		this.Rerror(tag, "fid already in use");
	}else{
		this.fids[fid] = new NineP.Qid(0, 0, NineP.QTDIR);
		this.Rattach(tag, fid);
	}
}

NineP.prototype.Rattach = function(tag, fid){
	var buf = [0, 0, 0, 0, NineP.packets.Rattach];
	buf = buf.concat(tag);
	buf = buf.concat(this.fids[fid].toWireQid());
	NineP.PBIT32(buf, buf.length);
	cons.log(buf);
	this.socket.write(buf);
}
	

NineP.prototype.Rerror = function(tag, msg){
	var buf = [0,0,0,0, NineP.packets.Rerror];
	buf.push.apply(buf, tag);
	buf = buf.concat(NineP.mkwirestring(msg));
	NineP.PBIT32(buf, buf.length);
	cons.log(buf);
	cons.log("error: " + msg);
	this.socket.write(buf);
}

NineP.prototype.Tflush = function(pkt, tag){
	this.Rerror(tag, "flush not implemented");
}

NineP.prototype.Twalk = function(pkt, tag){
	pkt.splice(0, 7);
	var oldfid = NineP.GBIT32(pkt.splice(0, 4));
	var newfid = NineP.GBIT32(pkt.splice(0, 4));
	var nwname = NineP.GBIT16(pkt.splice(0, 2));
	var names = [];
	var i;
	for(i = 0; i < nwname; ++i){
		names.push(NineP.getwirestring(pkt));
	}
	cons.log("twalk components: " + names + "(" + nwname + ")");

	if(this.fids[oldfid] == undefined){
		return this.Rerror(tag, "invalid fid");
	}
	if(this.fids[newfid] != undefined){
		return this.Rerror(tag, "newfid in use");
	}

	var fakeqid = this.fids[oldfid];
	var interqids = [];

	try{
		for(i = 0; i < nwname; ++i){
			fakeqid = this.walk1(fakeqid, names[i]);
			interqids.push(fakeqid);
		}
		this.fids[newfid] = fakeqid;
	}catch(e){
		if(i == 0){
			return this.Rerror(tag, "could not walk");
		}
	}
	this.Rwalk(tag, interqids.length, interqids);
}

NineP.prototype.Rwalk = function(tag, nwqid, qids){
	var pkt = [0, 0, 0, 0, NineP.packets.Rwalk];
	var i;

	pkt = pkt.concat(tag);
	pkt = pkt.concat(NineP.PBIT16([], nwqid));

	for(i = 0; i < nwqid; ++i){
		pkt = pkt.concat(qids[i].toWireQid());
	}

	NineP.PBIT32(pkt, pkt.length);
	cons.log(pkt);
	this.socket.write(pkt);
}

NineP.prototype.Topen = function(pkt, tag){
	pkt.splice(0, 7);
	var fid = NineP.GBIT32(pkt.splice(0, 4));
	var mode = NineP.GBIT8(pkt.splice(0, 1));

	return this.Ropen(tag, fid, mode);
}

NineP.prototype.Ropen = function(tag, fid, mode){
	return this.Rerror(tag, "open not supported");
}

NineP.prototype.Tclunk = function(pkt, tag){
	pkt.splice(0, 7);
	var fid = NineP.GBIT32(pkt);

	if(this.fids[fid] == undefined){
		return this.Rerror(tag, "fid not in use");
	}

	delete this.fids[fid];

	return this.Rclunk(tag);
}

NineP.prototype.Rclunk = function(tag){
	var buf = [0, 0, 0, 0, NineP.packets.Rclunk].concat(tag);

	cons.log(buf);
	this.socket.write(buf);
}

NineP.prototype.Tstat = function(pkt, tag){
	pkt.splice(0, 7);
	var fid = NineP.GBIT32(pkt);
	if(this.fids[fid] == undefined){
		return this.Rerror(tag, "invalid fid");
	}
	return this.Rstat(tag, this.stat(this.fids[fid]));
}

NineP.prototype.Rstat = function(tag, stat){
	var pkt = [0, 0, 0, 0, NineP.packets.Rstat].concat(tag);
	pkt = pkt.concat(stat.toWireStat());

	NineP.PBIT32(pkt, pkt.length);
	cons.log(pkt);
	this.socket.write(pkt);
}

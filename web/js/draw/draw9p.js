Draw9p = {};

Draw9p.DBGCHAR = function(p){
	if(p.length < 1){
		throw("array too short");
	}
	return p.splice(0, 1)[0];
}
Draw9p.BGSHORT = function(p){
	return (p[0]<<0) | (p[1]<<8);
}
Draw9p.DBGSHORT = function(p){
	if(p.length < 2){
		throw("array too short");
	}
	return this.BGSHORT(p.splice(0, 4));
}
Draw9p.BGLONG = function(p){
	return (p[0]<<0) | (p[1]<<8) | (p[2]<<16) | (p[3]<<24);
}
Draw9p.DBGLONG = function(p){
	if(p.length < 4){
		throw("array too short");
	}
	return this.BGLONG(p.splice(0, 4));
}
Draw9p.BPSHORT = function(p, v){
	p[0] = (v) & 0xFF;
	p[1] = (v >> 8) & 0xFF;
	return p;
}
Draw9p.BPLONG = function(p, v){
	p[0] = (v) & 0xFF;
	p[1] = (v >> 8) & 0xFF;
	p[2] = (v >>16) & 0xFF;
	p[3] = (v >> 24) & 0xFF;
	return p;
}

Draw9p.DGPOINT = function(p){
	return {
		x: this.DBGLONG(p),
		y: this.DBGLONG(p)
	}
}
Draw9p.DGRECT = function(p){
	return {
		min: this.DGPOINT(p),
		max: this.DGPOINT(p)
	}
}

Draw9p.Qids = {
	QROOT: 0,
	QCONS: 1,
	QMOUSE: 2,
	QDRAW: 98,
	QDRAWNEW: 99,
	QDRAWBASE: 100,
	QDRAWCTL: 1,
	QDRAWDATA: 2,
	QDRAWCOLORMAP: 3,
	QDRAWREFRESH: 4,
	QDRAWSTEP: 10
}

Draw9p.drawdir = function(path){
	with(this.Qids){
		return {
			drawfile: (path - QDRAWBASE) % QDRAWSTEP,
			drawdir: Math.floor((path - QDRAWBASE) / QDRAWSTEP)
		}
	}
}


Draw9p.conns = [];
Draw9p.nextconn = 1;
Draw9p.imgnames = {};

Draw9p.Conn = function(connid){
	this.id = connid;
	this.imgs = [Draw9p.RootImage()];
	this.screens = [];
	this.imgid = 0;
	this.op = Memdraw.Opdefs.SoverD.key;
}

Draw9p.connqids = function(){
	var qids = [];
	for(var i = 0; i < this.conns.length; ++i){
		if(this.conns[i] != undefined){
			qids.push(this.Qids.QDRAWBASE + (i * this.Qids.QDRAWSTEP));
		}
	}
	return qids;
}

Draw9p.walk1 = function(qid, name){
	with(this.Qids){
		var path = qid.path;
		if(path == QROOT){
			if(name == ".."){
				return new NineP.Qid(path, 0, NineP.QTDIR);
			}else if(name == "cons"){
				return new NineP.Qid(QCONS, 0, 0);
			}else if(name == "mouse"){
				return new NineP.Qid(QMOUSE, 0, 0);
			}else if(name == "draw"){
				return new NineP.Qid(QDRAW, 0, NineP.QTDIR);
			}else{
				throw("file not found");
			}
		}else if(path == QDRAW){
			if(name == ".."){
				return new NineP.Qid(QROOT, 0, NineP.QTDIR);
			}else if(name == "new"){
				return new NineP.Qid(QDRAWNEW, 0, 0);
			}else if(!/\D/.test(name)){
				return new NineP.Qid(
					QDRAWBASE + (
						parseInt(name, 10) * QDRAWSTEP),
					0, NineP.QTDIR
				);
			}else{
				throw("file not found");
			}
		}else if(path >= QDRAWBASE){
			return this.walk1drawdir(path, name);
		}else{
			throw("file not found");
		}
	}
}

Draw9p.walk1drawdir = function(path, name){
	with(this.Qids){
		var dd = this.drawdir(path);

		if(path < QDRAWBASE){
			throw("could not walk");
		}

		if(this.conns[dd.drawdir] == undefined){
			throw("file not found");
		}
	
		if(dd.drawfile == 0){
			if(name == ".."){
				return new NineP.Qid(QDRAW, 0, NineP.QTDIR);
			}else if(name == "ctl"){
				return new NineP.Qid(QDRAWCTL + path, 0, 0);
			}else if(name == "data"){
				return new NineP.Qid(QDRAWDATA + path, 0, 0);
			}else if(name == "colormap"){
				return new NineP.Qid(QDRAWCOLORMAP + path,
					0, 0);
			}else if(name == "refresh"){
				return new NineP.Qid(QDRAWREFRESH + path,
					0, 0);
			}else{
				throw("file not found");
			}
		}else{
			throw("cannot walk from non-directory");
		}
	}
}

Draw9p.open = function(fid, mode){
	with(this.Qids){
		if(fid.qid.path == QDRAWNEW){
			this.conns[this.nextconn] = new this.Conn(this.nextconn);
			fid.drawconn = this.nextconn;
			this.nextconn += 1;
		}
	}
}

Draw9p.create = function(name, perm, mode){
	throw("creation not implemented");
}

Draw9p.read = function(fid, offset, count, callback){
	with(this.Qids){
		if(fid.qid.path == QDRAWNEW){
			if(offset == 0){
				try{
					return callback.read(this.readdrawnew(fid.drawconn));
				}catch(e){
					return callback.error(e.toString());
				}
			}else{
				return callback.read([]);
			}
		}else if(fid.qid.path >= QDRAWBASE){
			var dd = this.drawdir(fid.qid.path);
			if(dd.drawfile == QDRAWCTL){
				try{
					return callback.read(this.readdrawctl(fid, offset));
				}catch(e){
					return callback.error(e.toString());
				}
			}else if(dd.drawfile == QDRAWREFRESH){
				return this.readdrawrefresh(dd, offset, callback);
			}else{
				return callback.read([]);
			}
		}else{
			return callback.read([]);
		}
	}
}

Draw9p.dirent = function(qid, offset){
	with(this.Qids){
	try{
		if(qid.path == QROOT){
			return this.stat([QCONS, QMOUSE, QDRAW][offset]);
		}else if(qid.path == QDRAW){
			return this.stat([QDRAWNEW].concat(this.connqids())[offset]);
		}else if(qid.path >= QDRAWBASE){
			var dd = this.drawdir(qid.path);

			if(dd.drawfile == 0){
				return this.stat([
					QDRAWCTL, QDRAWDATA,
					QDRAWCOLORMAP, QDRAWREFRESH
				][offset] + (dd.drawdir * QDRAWSTEP) + QDRAWBASE);
			}
		}
		return undefined;
	}catch(e){
		return undefined;
	}
	}
}

Draw9p.write = function(qid, offset, data){
	with(this.Qids){
		if(qid.path >= QDRAWBASE){
			var dd = this.drawdir(qid.path);
			if(dd.drawfile == QDRAWDATA){
				return this.writedrawdata(dd.drawdir, offset, data);
			}else if(dd.drawfile == QDRAWCTL){
				return this.writedrawctl(dd.drawdir, offset, data);
			}else{
				throw("writing impermissible");
			}
		}else{
			throw("cannot write");
		}
	}
}

Draw9p.clunk = function(fid){
	with(this.Qids){
		if(fid.qid.path == QDRAWNEW){
			delete this.conns[fid.drawconn];
		}
	}
}

Draw9p.remove = function(qid){
	throw("cannot remove");
}

Draw9p.stat = function(qid){
	with(this.Qids){
		if(qid == QROOT){
			return new NineP.Stat({
				qid: new NineP.Qid(QROOT, 0, NineP.QTDIR),
				mode: NineP.DMDIR|NineP.DMREAD|NineP.DMEXEC,
				name: "/"
			});
		}else if(qid == QCONS){
			return new NineP.Stat({
				qid: new NineP.Qid(QCONS, 0, 0),
				mode: 0,
				name: "cons"
			});
		}else if(qid == QMOUSE){
			return new NineP.Stat({
				qid: new NineP.Qid(QMOUSE, 0, 0),
				mode: NineP.DMAPPEND,
				length: 49,
				name: "mouse"
			});
		}else if(qid == QDRAW){
			return new NineP.Stat({
				qid: new NineP.Qid(QDRAW, 0, NineP.QTDIR),
				mode: NineP.DMDIR,
				name: "draw"
			});
		}else if(qid == QDRAWNEW){
			return new NineP.Stat({
				qid: new NineP.Qid(QDRAWNEW, this.nextconn, 0),
				mode: 0,
				length: 144,
				name: "new"
			});
		}else if(qid >= QDRAWBASE){
			return this.statdrawdir(qid);
		}else{
			throw("invalid qid");
		}
	}
}

Draw9p.statdrawdir = function(qid){
	with(this.Qids){
		var dd = this.drawdir(qid);
	
		if(qid < QDRAWBASE){
			throw("could not stat");
		}

		if(this.conns[dd.drawdir] == undefined){
			throw("file not found");
		}

		if(dd.drawfile == 0){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, NineP.QTDIR),
				mode: 0,
				name: String(dd.drawdir)
			});
		}
	
		if(dd.drawfile == QDRAWCTL){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "ctl"
			});
		}else if(dd.drawfile == QDRAWDATA){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "data"
			});
		}else if(dd.drawfile == QDRAWCOLORMAP){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "colormap"
			});
		}else if(dd.drawfile == QDRAWREFRESH){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "refresh"
			});
		}else{
			throw("could not stat");
		}
	}
}

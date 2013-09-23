Draw9p = {};

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

Draw9p.drawdir = function(path){
	with(Srv9p.Qids){
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
			qids.push(Srv9p.Qids.QDRAWBASE + (i * Srv9p.Qids.QDRAWSTEP));
		}
	}
	return qids;
}

Draw9p.walk1drawdir = function(path, name){
	with(Srv9p.Qids){
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

Draw9p.read = function(fid, offset, count, callback){
	with(Srv9p.Qids){
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
		}
	}
}

Draw9p.write = function(qid, offset, data){
	with(Srv9p.Qids){
		if(qid.path >= QDRAWBASE){
			var dd = this.drawdir(qid.path);
			if(dd.drawfile == QDRAWDATA){
				return this.writedrawdata(dd.drawdir, offset, data);
			}else if(dd.drawfile == QDRAWCTL){
				return this.writedrawctl(dd.drawdir, offset, data);
			}else{
				throw("writing impermissible");
			}
		}
	}
}

Draw9p.open = function(fid, mode){
	with(Srv9p.Qids){
		if(fid.qid.path == QDRAWNEW){
			this.conns[this.nextconn] = new this.Conn(this.nextconn);
			fid.drawconn = this.nextconn;
			this.nextconn += 1;
		}
	}
}

Draw9p.dirent = function(qid, offset){
	with(Srv9p.Qids){
		if(qid.path == QDRAW){
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
	}
}

Draw9p.clunk = function(fid){
	if(fid.qid.path == Srv9p.Qids.QDRAWNEW){
		delete this.conns[fid.drawconn];
	}
}

Draw9p.stat = function(qid){
	with(Srv9p.Qids){
		if(qid == QDRAW){
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
		}
	}
}

Draw9p.statdrawdir = function(qid){
	with(Srv9p.Qids){
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

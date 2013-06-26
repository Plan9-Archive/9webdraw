Draw9p = {};

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

Draw9p.conns = [];
Draw9p.nextconn = 1;

Draw9p.Conn = function(connid){
	this.id = connid;
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
		var drawfile = (path - QDRAWBASE) % QDRAWSTEP;
		var drawdir = (path - QDRAWBASE) / QDRAWSTEP;

		if(path < QDRAWBASE){
			throw("could not walk");
		}

		if(this.conns[drawdir] == undefined){
			throw("file not found");
		}
	
		if(drawfile == 0){
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

Draw9p.pad11 = function(x){
	var buf = [];
	var s = String(x);
	var i;

	//do{
	//	buf[i] = Math.floor(x % 10);
	//	i += 1;
	//}while(x = Math.floor(x / 10));

	for(i = 0; i < 11 - s.length; ++i){
		buf[i] = " ".charCodeAt(0);
	}

	for(i; i < 11; ++i){
		buf[i] = s.charCodeAt(i - (11 - s.length));
	}

	return buf;
}

Draw9p.read = function(fid, offset, count){
	with(this.Qids){
		if(fid.qid.path == QDRAWNEW){
			if(offset == 0){
				return this.readdrawnew(fid.drawconn);
			}else{
				return [];
			}
		}else{
			return [];
		}
	}
}

Draw9p.readdrawnew = function(conn){
	var buf = [];

	buf = buf.concat(this.pad11(conn)).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11("r8g8b8")).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11(640)).concat(" ");
	buf = buf.concat(this.pad11(480)).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11(0)).concat(" ");
	buf = buf.concat(this.pad11(640)).concat(" ");
	buf = buf.concat(this.pad11(480)).concat(" ");

	return buf;
}

Draw9p.dirent = function(qid, offset){
	with(this.Qids){
	try{
		if(qid.path == QROOT){
			return this.stat([QCONS, QMOUSE, QDRAW][offset]);
		}else if(qid.path == QDRAW){
			/* XXX must dynamically append active draw dirs. */
			return this.stat([QDRAWNEW].concat(this.connqids())[offset]);
		}else if(qid.path >= QDRAWBASE){
			var drawfile = (qid.path - QDRAWBASE) % QDRAWSTEP;
			var drawdir = (qid.path - QDRAWBASE) / QDRAWSTEP;

			if(drawfile == 0){
				return this.stat([
					QDRAWCTL, QDRAWDATA,
					QDRAWCOLORMAP, QDRAWREFRESH
				][offset] + (drawdir * QDRAWSTEP) + QDRAWBASE);
			}
		}
		return undefined;
	}catch(e){
		return undefined;
	}
	}
}

Draw9p.write = function(qid, offset, data){
	throw("cannot write");
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
			return this.statdrawdir(qid, name);
		}else{
			throw("invalid qid");
		}
	}
}

Draw9p.statdrawdir = function(qid, name){
	with(this.Qids){
		var drawfile = (qid - QDRAWBASE) % QDRAWSTEP;
		var drawdir = (qid - QDRAWBASE) / QDRAWSTEP;
	
		if(qid < QDRAWBASE){
			throw("could not stat");
		}

		if(this.conns[drawdir] == undefined){
			throw("file not found");
		}

		if(drawfile == 0){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, NineP.QTDIR),
				mode: 0,
				name: String(drawdir)
			});
		}
	
		if(drawfile == QDRAWCTL){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "ctl"
			});
		}else if(drawfile == QDRAWDATA){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "data"
			});
		}else if(drawfile == QDRAWCOLORMAP){
			return new NineP.Stat({
				qid: new NineP.Qid(qid, 0, 0),
				mode: 0,
				name: "colormap"
			});
		}else if(drawfile == QDRAWREFRESH){
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

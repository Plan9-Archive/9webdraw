NinepLocal = {};

NinepLocal.Qids = {
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

NinepLocal.walk1 = function(qid, name){
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

NinepLocal.walk1drawdir = function(path, name){
	with(this.Qids){
		var drawfile = (path - QDRAWBASE) % QDRAWSTEP;
		var drawdir = (path - QDRAWBASE) / QDRAWSTEP;

		if(path < QDRAWBASE){
			throw("could not walk");
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

NinepLocal.create = function(name, perm, mode){
	throw("creation not implemented");
}

NinepLocal.read = function(fid, offset, count){
	return [];
}

NinepLocal.dirent = function(qid, offset){
	with(this.Qids){
	try{
		if(qid.path == QROOT){
			return this.stat([QCONS, QMOUSE, QDRAW][offset]);
		}else if(qid.path == QDRAW){
			/* XXX must dynamically append active draw dirs. */
			return this.stat([QDRAWNEW][offset]);
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

NinepLocal.remove = function(qid){
	throw("cannot remove");
}

NinepLocal.stat = function(qid){
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
				qid: new NineP.Qid(QDRAWNEW, 0, 0),
				mode: 0,
				name: "new"
			});
		}else if(qid >= QDRAWBASE){
			return this.statdrawdir(qid, name);
		}else{
			throw("invalid qid");
		}
	}
}

NinepLocal.statdrawdir = function(qid, name){
	with(this.Qids){
		var drawfile = (qid - QDRAWBASE) % QDRAWSTEP;
		var drawdir = (qid - QDRAWBASE) / QDRAWSTEP;
	
		if(qid < QDRAWBASE){
			throw("could not stat");
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

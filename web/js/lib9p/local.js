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
			return this.walk1.drawdir(path, name);
		}else{
			throw("could not walk");
		}
	}
}

NinepLocal.walk1.drawdir = function(path, name){
	with(this.Qids){
		var drawfile = path % QDRAWSTEP;
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

NinepLocal.stat = function(qid){
	with(this.Qids){
		var path = qid.path;
		if(path == QROOT){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMDIR,
				name: "/"
			});
		}else if(path == QCONS){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "cons"
			});
		}else if(path == QMOUSE){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMAPPEND,
				length: 49,
				name: "mouse"
			});
		}else if(path == QDRAW){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMDIR,
				name: "draw"
			});
		}else if(path == QDRAWNEW){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "new"
			});
		}else if(path >= QDRAWBASE){
			return this.stat.drawdir(qid, name);
		}else{
			throw("invalid qid");
		}
	}
}

NinepLocal.stat.drawdir = function(qid, name){
	with(this.Qids){
		var path = qid.path;
		var drawfile = (path - QDRAWBASE) % QDRAWSTEP;
		var drawdir = (path - QDRAWBASE) / QDRAWSTEP;
	
		if(path < QDRAWBASE){
			throw("could not stat");
		}
		if(drawfile == 0){
			throw("could not stat");
		}
	
		if(drawfile == QDRAWCTL){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "ctl"
			});
		}else if(drawfile == QDRAWDATA){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "data"
			});
		}else if(drawfile == QDRAWCOLORMAP){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "colormap"
			});
		}else if(drawfile == QDRAWREFRESH){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "refresh"
			});
		}else{
			throw("could not stat");
		}
	}
}

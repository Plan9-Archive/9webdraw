
NineP.initlocal = function(){
	NineP.Qids = {
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

	NineP.prototype.walk1 = function(qid, name){
		var path = qid.path;
		if(path == NineP.Qids.QROOT){
			if(name == ".."){
				return new NineP.Qid(path, 0, NineP.QTDIR);
			}else if(name == "cons"){
				return new NineP.Qid(NineP.Qids.QCONS, 0, 0);
			}else if(name == "mouse"){
				return new NineP.Qid(NineP.Qids.QMOUSE, 0, 0);
			}else if(name == "draw"){
				return new NineP.Qid(NineP.Qids.QDRAW, 0, NineP.QTDIR);
			}else{
				throw("file not found");
			}
		}else if(path == NineP.Qids.QDRAW){
			if(name == ".."){
				return new NineP.Qid(NineP.Qids.QROOT, 0, NineP.QTDIR);
			}else if(name == "new"){
				return new NineP.Qid(NineP.Qids.QDRAWNEW, 0, 0);
			}else if(!/\D/.test(name)){
				return new NineP.Qid(
					NineP.Qids.QDRAWBASE + (
						parseInt(name, 10) * NineP.Qids.QDRAWSTEP),
					0, NineP.QTDIR
				);
			}else{
				throw("file not found");
			}
		}else if(path >= NineP.Qids.QDRAWBASE){
			return this.walk1.drawdir(path, name);
		}else{
			throw("could not walk");
		}
	}

	NineP.prototype.walk1.drawdir = function(path, name){
		var drawfile = path % NineP.Qids.QDRAWSTEP;
		var drawdir = (path - NineP.Qids.QDRAWBASE) /
			NineP.Qids.QDRAWSTEP;

		if(path < NineP.Qids.QDRAWBASE){
			throw("could not walk");
		}

		if(drawfile == 0){
			if(name == ".."){
				return new NineP.Qid(NineP.Qids.QDRAW, 0, NineP.QTDIR);
			}else if(name == "ctl"){
				return new NineP.Qid(NineP.Qids.QDRAWCTL + path, 0, 0);
			}else if(name == "data"){
				return new NineP.Qid(NineP.Qids.QDRAWDATA + path, 0, 0);
			}else if(name == "colormap"){
				return new NineP.Qid(NineP.Qids.QDRAWCOLORMAP + path,
					0, 0);
			}else if(name == "refresh"){
				return new NineP.Qid(NineP.Qids.QDRAWREFRESH + path,
					0, 0);
			}else{
				throw("file not found");
			}
		}else{
			throw("cannot walk from non-directory");
		}
	}

	NineP.prototype.stat = function(qid){
		var path = qid.path;
		if(path == NineP.Qids.QROOT){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMDIR,
				name: "/"
			});
		}else if(path == NineP.Qids.QCONS){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "cons"
			});
		}else if(path == NineP.Qids.QMOUSE){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMAPPEND,
				length: 49,
				name: "mouse"
			});
		}else if(path == NineP.Qids.QDRAW){
			return new NineP.Stat({
				qid: qid,
				mode: NineP.DMDIR,
				name: "draw"
			});
		}else if(path == NineP.Qids.QDRAWNEW){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "new"
			});
		}else if(path >= NineP.Qids.QDRAWBASE){
			return this.stat.drawdir(qid, name);
		}else{
			throw("invalid qid");
		}
	}
	NineP.prototype.stat.drawdir = function(qid, name){
		var path = qid.path;
		var drawfile = (path - NineP.Qids.QDRAWBASE) % NineP.Qids.QDRAWSTEP;
		var drawdir = (path - NineP.Qids.QDRAWBASE) / NineP.Qids.QDRAWSTEP;

		if(path < NineP.Qids.QDRAWBASE){
			throw("could not stat");
		}
		if(drawfile == 0){
			throw("could not stat");
		}

		if(drawfile == NineP.Qids.QDRAWCTL){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "ctl"
			});
		}else if(drawfile == NineP.Qids.QDRAWDATA){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "data"
			});
		}else if(drawfile == NineP.Qids.QDRAWCOLORMAP){
			return new NineP.Stat({
				qid: qid,
				mode: 0,
				name: "colormap"
			});
		}else if(drawfile == NineP.Qids.QDRAWREFRESH){
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

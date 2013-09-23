Srv9p = function(draw9p){
	this.draw9p = draw9p;
	this.label = "webdraw".toUTF8Array();
}

Srv9p.Qids = {
	QROOT: 0,
	QCONS: 1,
	QCONSCTL: 2,
	QMOUSE: 3,
	QCURSOR: 4,
	QWINNAME: 5,
	QLABEL: 6,
	QCONSMAX: 90,
	QDRAW: 98,
	QDRAWNEW: 99,
	QDRAWBASE: 100,
	QDRAWCTL: 1,
	QDRAWDATA: 2,
	QDRAWCOLORMAP: 3,
	QDRAWREFRESH: 4,
	QDRAWSTEP: 10
}

Srv9p.prototype.walk1 = function(qid, name){
	with(Srv9p.Qids){
		var path = qid.path;
		if(path == QROOT){
			if(name == ".."){
				return new NineP.Qid(path, 0, NineP.QTDIR);
			}else if(name == "cons"){
				return new NineP.Qid(QCONS, 0, 0);
			}else if(name == "consctl"){
				return new NineP.Qid(QCONSCTL, 0, 0);
			}else if(name == "mouse"){
				return new NineP.Qid(QMOUSE, 0, 0);
			}else if(name == "cursor"){
				return new NineP.Qid(QCURSOR, 0, 0);
			}else if(name == "winname"){
				return new NineP.Qid(QWINNAME, 0, 0);
			}else if(name == "label"){
				return new NineP.Qid(QLABEL, 0, 0);
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
			return this.draw9p.walk1drawdir(path, name);
		}else{
			throw("file not found");
		}
	}
}

Srv9p.prototype.create = function(name, perm, mode){
	throw("creation not implemented");
}

Srv9p.prototype.read = function(fid, offset, count, callback){
	with(Srv9p.Qids){
		if(fid.qid.path > QCONSMAX){
			return this.draw9p.read(fid, offset, count, callback);
		}else{
			if(fid.qid.path == QCONS){
				/* XXX DISCARD CONS READS */
				return;
			}else if(fid.qid.path == QMOUSE){
				/* XXX DISCARD MOUSE READS */
				return;
			}else if(fid.qid.path == QWINNAME){
				if(offset == 0){
					return callback.read("webdraw".toUTF8Array());
				}else{
					return callback.read([]);
				}
			}else if(fid.qid.path == QLABEL){
				if(offset == 0){
					return callback.read(this.label);
				}else{
					return callback.read([]);
				}
			}else{
				return callback.read([]);
			}
		}
	}
}

Srv9p.prototype.write = function(qid, offset, data){
	with(Srv9p.Qids){
		if(qid.path > QCONSMAX){
			return this.draw9p.write(qid, offset, data);
		}else{
			if(qid.path == QCONSCTL){
				return;
			}else if(qid.path == QCURSOR){
				return;
			}else if(qid.path == QLABEL){
				this.label = data;
				return data.length;
			}else{
				throw("cannot write");
			}
		}
	}
}

Srv9p.prototype.open = function(fid, mode){
	if(fid.qid.path > Srv9p.Qids.QCONSMAX){
		return this.draw9p.open(fid, mode);
	}else{
		return;
	}
}

Srv9p.prototype.dirent = function(qid, offset){
	with(Srv9p.Qids){
	try{
		if(qid.path == QROOT){
			return this.stat([
				QCONS,
				QCONSCTL,
				QMOUSE,
				QCURSOR,
				QWINNAME,
				QLABEL,
				QDRAW
			][offset]);
		}else if(qid.path > QCONSMAX){
			return this.draw9p.dirent(qid, offset);
		}
		return undefined;
	}catch(e){
		return undefined;
	}
	}
}

Srv9p.prototype.clunk = function(fid){
	with(Srv9p.Qids){
		if(fid.qid.path > QCONSMAX){
			return this.draw9p.clunk(fid);
		}
	}
}

Srv9p.prototype.remove = function(qid){
	throw("cannot remove");
}

Srv9p.prototype.stat = function(qid){
	with(Srv9p.Qids){
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
		}else if(qid == QCONSCTL){
			return new NineP.Stat({
				qid: new NineP.Qid(QCONSCTL, 0, 0),
				mode: 0,
				name: "consctl"
			});
		}else if(qid == QMOUSE){
			return new NineP.Stat({
				qid: new NineP.Qid(QMOUSE, 0, 0),
				mode: NineP.DMAPPEND,
				length: 49,
				name: "mouse"
			});
		}else if(qid == QCURSOR){
			return new NineP.Stat({
				qid: new NineP.Qid(QCURSOR, 0, 0),
				mode: 0,
				length: 72,
				name: "cursor"
			});
		}else if(qid == QWINNAME){
			return new NineP.Stat({
				qid: new NineP.Qid(QWINNAME, 0, 0),
				length: "webdraw".length,
				name: "winname"
			});
		}else if(qid == QLABEL){
			return new NineP.Stat({
				qid: new NineP.Qid(QLABEL, 0, 0),
				length: this.label.length,
				name: "label"
			});
		}else if(qid > QCONSMAX){
			return this.draw9p.stat(qid);
		}else{
			throw("invalid qid");
		}
	}
}

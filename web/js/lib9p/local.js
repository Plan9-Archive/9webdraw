NinepLocal = {};

NinepLocal.Qids = {
	QROOT: 0,
	QNEXT: 1
}

NinepLocal.File = function(name, id){
	this.name = name;
	this.data = [];
	this.qid = new NineP.Qid(id, 0, 0);

	this.write = function(offset, data){
		this.data.splice.apply(this.data, [offset, data.length].concat(data));
		this.qid.vers += 1;
	}

	this.read = function(offset, count){
		return this.data.slice(offset, offset+count);
	}
}

NinepLocal.files = {};

NinepLocal.walk1 = function(qid, name){
	with(this.Qids){
		var path = qid.path;
		if(path == QROOT){
			if(name == ".."){
				return new NineP.Qid(path, 0, NineP.QTDIR);
			}else{
				for(var f in this.files){
					if(this.files[f].name == name){
						return this.files[f].qid;
					}
				}
				throw("file not found");
			}
		}else{
			throw("cannot walk from non-directory");
		}
	}
}


NinepLocal.create = function(name, perm){
	for(var f in this.files){
		if(this.files[f].name == name){
			throw("cannot recreate existing file");
		}
	}
	var qid = this.Qids.QNEXT++
	this.files[qid] = new NinepLocal.File(name, qid);
	return this.files[qid].qid;
}

NinepLocal.read = function(fid, offset, count){
	var path = fid.qid.path;
	if(this.files[path] == undefined){
		throw("file not found");
	}
	return this.files[path].read(offset, count);
}

NinepLocal.direntaa = function(qid, offset){
	if(qid.path == this.Qids.QROOT){
		if(offset == 0){
			return this.stat(this.files[1].qid);
		}
	}
	return undefined;
}

NinepLocal.dirent = function(qid, offset){
	with(this.Qids){
	try{
		if(qid.path == QROOT){
			var i = 0;
			/* I hope this has a defined order... */
			for(var f in this.files){
				if(i == offset){
					return this.stat(this.files[f].qid.path);
				}
				i += 1;
			}
		}
		return undefined;
	}catch(e){
		return undefined;
	}
	}
}

NinepLocal.write = function(qid, offset, data){
	return this.files[qid.path].write(offset, data);
}

NinepLocal.remove = function(qid){
	delete this.files[qid.path];
}

NinepLocal.stat = function(qid){
	with(this.Qids){
		if(qid == QROOT){
			return new NineP.Stat({
				qid: new NineP.Qid(QROOT, 0, NineP.QTDIR),
				mode: NineP.DMDIR|NineP.DMREAD|NineP.DMEXEC|0777,
				name: "/"
			});
		}else{
			return new NineP.Stat({
				qid: this.files[qid].qid,
				mode: 0,
				name: this.files[qid].name,
				length: this.files[qid].data.length
			});
		}
	}
}

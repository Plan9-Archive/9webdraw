
NineP.initlocal = function(){
	NineP.prototype.walk1 = function(qid, name){
		var path = qid.path;
		if(path == 0){
			if(name == ".."){
				return new NineP.Qid(0, 0, NineP.QTDIR);
			}else{
				throw("could not walk");
			}
		}else{
			throw("could not walk");
		}
	}
}

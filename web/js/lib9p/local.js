
NineP.initlocal = function(){
	NineP.prototype.walk1 = function(qid, name){
		var qid = this.qids[qid];
		if(qid == 0){
			if(name == ".."){
				return 0;
			}else{
				throw("could not walk");
			}
		}else{
			throw("could not walk");
		}
	}
}

Draw9p.readdrawctl = function(fid, offset){
	var dd = this.drawdir(fid.qid.path);

	if(offset == 0){
		/* XXX Temporary hack until we have something to generate. */
		return this.readdrawnew(dd.drawdir);
	}else{
		return [];
	}
}

Draw9p.writedrawctl = function(connid, offset, data){
	var conn = this.conns[connid];
	if(conn == undefined){
		throw("invalid draw connection");
	}

	conn.imgid = Draw9p.DBGLONG(data);
}
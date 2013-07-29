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

	buf[11] = " ".charCodeAt(0);
	return buf;
}

Draw9p.readdrawnew = function(conn){
	cons.log("readdrawnew");
	var buf = [];

	buf = buf.concat(this.pad11(conn));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11("r8g8b8"));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11(640));
	buf = buf.concat(this.pad11(480));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11(0));
	buf = buf.concat(this.pad11(640));
	buf = buf.concat(this.pad11(480));

	return buf;
}

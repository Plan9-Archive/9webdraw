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

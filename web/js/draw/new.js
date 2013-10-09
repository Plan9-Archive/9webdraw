Draw9p.readdrawnew = function(conn){
	cons.log("readdrawnew");
	var buf = [];

	buf = buf.concat(pad11(conn));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11("r8g8b8"));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11(640));
	buf = buf.concat(pad11(480));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11(0));
	buf = buf.concat(pad11(640));
	buf = buf.concat(pad11(480));

	return buf;
}

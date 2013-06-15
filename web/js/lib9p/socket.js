function Socket(path, read){
	this.sock = new WebSocket(path, "9p");
	this.sock.binaryType = "arraybuffer";

	this.write = function(data){
		this.sock.send(data);
	}

	this.sock.onmessage = function(e){
		read(e.data);
	}
}

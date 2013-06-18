function Socket(path, read){
	this.sock = new WebSocket(path, "9p");
	this.sock.binaryType = "arraybuffer";

	this.write = function(data){
		var u8 = new Uint8Array(data);
		this.sock.send(u8.buffer);
	}

	this.sock.onmessage = function(e){
		read(e.data);
	}
}

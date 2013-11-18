var cons;

function Cons(){
	this.elem = elem("cons");
	this.buf = "";
	this.callbacks = [];
	this.kbd = {down: "down", up: "up"};

	this.log = function(s){
		var span = document.createElement("span");
		span.textContent = s;
		this.elem.appendChild(span);
	}

	this.write = function(s){
		this.log(s);
		/* ninep.write(s); */
	}

	this.showhide = function(b){
		this.elem.style.display = b? "block": "none";
	}

	this.handlekeys = function(e, dir){
		if(!mouse.handlefkeys(e, dir == cons.kbd.down?
			mouse.states.down : mouse.states.up)){
			return 0;
		}

		if(dir == cons.kbd.down){
			this.buf += this.key2str(e);
			this.flushcallbacks();
		}
		return 1;
	}

	this.key2str = function(e){
		if(e.keyCode >= 0x41 && e.keyCode <= 0x5a){
			return String.fromCharCode(e.keyCode | (e.shiftKey? 0: 0x20));
		}
		return String.fromCharCode(e.keyCode);
	}

	this.addcallback = function(callback){
		this.callbacks.push(callback);
		this.flushcallbacks();
	}

	this.flushcallbacks = function(){
		if(this.buf == ""){
			return;
		}

		for(var i in this.callbacks){
			this.callbacks[i].read(this.buf.toUTF8Array());
			this.buf = "";
		}
		this.callbacks = [];
	}

}


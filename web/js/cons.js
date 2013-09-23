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

	this.handlekeys = function(e, dir){
		if(!mouse.handlefkeys(e, dir == cons.kbd.down?
			mouse.states.down : mouse.states.up)){
			return 0;
		}

		if(dir == cons.kbd.down){
			this.buf += String.fromCharCode(e.keyCode);
			this.flushcallbacks();
		}
		return 1;
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


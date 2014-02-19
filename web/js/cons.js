var cons;

function Cons(){
	this.elem = elem("cons");
	this.debug = false;
	this.buf = "";
	this.callbacks = [];
	this.kbd = {down: "down", up: "up", press: "press"};

	var compose = new Compose(this);

	this.log = function(s){
		if(this.debug){
			var span = document.createElement("span");
			span.textContent = s;
			this.elem.appendChild(span);
		}
	}

	this.write = function(s){
		this.log(s);
		/* ninep.write(s); */
	}

	this.showhide = function(b){
		this.debug = b? true: false;
		this.elem.style.display = b? "block": "none";
	}

	this.handlekeys = function(e, dir){
		if(!mouse.handlefkeys(e, dir == cons.kbd.down?
			mouse.states.down : mouse.states.up)){
			return 0;
		}

		if(dir == cons.kbd.press){
			if(compose.getmode()){
				compose.push(String.fromCharCode(e.which));
			}else{
				this.buf += String.fromCharCode(e.which);
				this.flushcallbacks();
			}
			e.preventDefault();
			e.stopPropagation();
			return 0;
		}

		if(dir == cons.kbd.down){
			/* XXX control characters should break compose mode! */
			if(compose.getmode()) return 0;

			var s =  this.key2str(e);
			if(s == "") return 1;
			this.buf += s;
			this.flushcallbacks();
			e.preventDefault();
			e.stopPropagation();
			return 0;
		}
		return 0;
	}

	this.key2str = function(e){

		switch(e.which){
		case 0:
			break;
		case 13:
			return "\n";
		case 18:
			compose.set();
			/* fall through */
		default:
			return "";
		}

		return "[control character]";
	}

	this.take = function(s){
		this.buf += s;
		this.flushcallbacks();
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


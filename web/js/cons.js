var cons;

function Cons(){
	this.elem = elem("cons");
	this.debug = false;
	this.buf = "";
	this.callbacks = [];
	this.kbd = {down: "down", up: "up", press: "press"};

	var compose = new Compose(this);

	this.log = function(s){
		//if(this.debug){
			var span = document.createElement("span");
			span.textContent = s;
			this.elem.appendChild(span);
		//}
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
			e.preventDefault();
			e.stopPropagation();
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
			if(e.ctrlKey){
				if(this.key2str(e) != "")
					return 0;
				compose.reset();
				this.buf += this.ctrl2str(e);
				this.flushcallbacks();
				e.preventDefault();
				e.stopPropagation();
				return 0;
			}
			if(compose.getmode())
				if(this.key2str(e) == "")
					return 0;

			var s =  this.key2str(e);
			if(s == "") return 1;
			this.buf += s;
			this.flushcallbacks();
			e.preventDefault();
			e.stopPropagation();
			return 0;
		}

		if(dir == cons.kbd.up){
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
		case 8:
			return "\b";
		case 9:
			return "\t";
		case 13:
			return "\n";
		case 17:
			return "ctrl";
		case 18:
			compose.set();
			/* fall through */
		default:
			return "";
		}

		return "[control character]";
	}

	this.ctrl2str = function(e){
		return String.fromCharCode(e.which & 0x1F);
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


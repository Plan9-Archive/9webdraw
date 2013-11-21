var cons;

function Cons(){
	this.elem = elem("cons");
	this.buf = "";
	this.callbacks = [];
	this.kbd = {down: "down", up: "up", press: "press"};
	this.compose = false;
	this.composebuf = [];

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

		if(dir == cons.kbd.press){
			if(this.compose){
				this.composebuf.push(String.fromCharCode(e.which));
				this.composehandle();
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
			if(this.compose == true) return 0;

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
			this.compose = true;
			/* fall through */
		default:
			return "";
		}

		return "[control character]";
	}

	this.composereset = function(){
		this.composebuf = [];
		this.compose = false;
	}

	this.composehandle = function(){
		alert(this.composebuf);
		if(this.composebuf.length < 2) return;
		if(this.composebuf[0] == "X"){
			if(this.composebuf.length < 5) return;
			if(this.composebuf.length > 5){
				this.composereset();
			}
			var xdigits = "0123456789ABCDEF";
			var c = 0;
			for(var i = 1; i < 5; ++i){
				var x = xdigits.indexOf(this.composebuf[i].toUpperCase());
				if(x < 0) return this.composereset();
				c |= x << ((4 - i) * 4);
			}
			this.buf += String.fromCharCode(c);
			this.flushcallbacks();
			this.composereset();
		}else{
			this.composereset();
		}
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


var mouse;

function Mouse(){
	var State = function(position, buttons){
		this.position = position;
		this.buttons = buttons;
		this.timestamp = Date.now() - basetime;
	}
	State.prototype.copy = function(){
		return new State(this.position, this.buttons);
	}
	State.prototype.toWireFormat = function(){
		var buf = "m".toUTF8Array();
		buf = buf.concat(pad11(this.position.x));
		buf = buf.concat(pad11(this.position.y));
		buf = buf.concat(pad11(this.buttons.toBits()));
		buf = buf.concat(pad11(this.timestamp));
		return buf;
	}

	this.states = {down: "down", up: "up"};
	this.state = new State({x: 0, y: 0},(function(up){
		var arr = [up, up, up];
		arr.toBits = function(){
			return (this[0] == up? 0: 1) |
				(this[1] == up? 0: 2) |
				(this[2] == up? 0: 4);
		}
		return arr;
	})(this.states.up));

	this.usefkeys = false;
	this.callbacks = [];
	this.buf = [];

	this.handlefkeys = function(e, state){
		if(!this.usefkeys){
		    return true;
		}
		switch(e.keyCode){
		case 112:
		    this.state.buttons[0] = state;
		    break;
		case 113:
		    this.state.buttons[1] = state;
		    break;
		case 114:
		    this.state.buttons[2] = state;
		    break;
		default:
		    return true;
		}
		this.generatemovement(this.state);
		return false;
	}

	this.handlebutton = function(e){
		var button = (function(states){
			return function(b){
				return b? states.down: states.up;
			}
		})(this.states);
		this.state.buttons[0] = button(e.buttons & 1);
		this.state.buttons[1] = button(e.buttons & 2);
		this.state.buttons[2] = button(e.buttons & 4);
		this.state.position = {x: e.clientX, y: e.clientY};
		this.generatemovement(this.state);
		return 0;
	}

	this.generatemovement = function(state){
		cons.write("m " + state.position.x + ", " + state.position.y +
			" : " + state.buttons);
		this.buf.push(this.state.copy());
		this.flushcallbacks();
	}

	this.addcallback = function(callback){
		this.callbacks.push(callback);
		this.flushcallbacks();
	}

	this.flushcallbacks = function(){
		while(this.callbacks.length > 0 && this.buf.length > 0){
			this.callbacks.shift().read(this.buf.shift().toWireFormat());
		}
	}
}

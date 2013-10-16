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
		buf = buf.concat(pad11(this.buttons));
		buf = buf.concat(pad11(this.timestamp));
		return buf;
	}

	this.states = {down: 1, up: 0};
	this.state = new State({x: 0, y: 0}, 0);

	this.usefkeys = false;
	this.callbacks = [];
	this.buf = [];

	this.handlefkeys = function(e, state){
		if(!this.usefkeys){
		    return true;
		}
		switch(e.keyCode){
		case 112:
		    this.state.buttons = (this.state.buttons&~1) | state;
		    break;
		case 113:
		    this.state.buttons = (this.state.buttons&~2) | state;
		    break;
		case 114:
		    this.state.buttons = (this.state.buttons&~4) | state;
		    break;
		default:
		    return true;
		}
		this.generatemovement(this.state);
		return false;
	}

	this.handlebutton = function(e){
		this.state.buttons = e.buttons;
		this.state.position = {x: e.clientX, y: e.clientY};
		this.generatemovement(this.state);
		return false;
	}

	this.handlemove = function(e){
		this.state.position.x +=
			e.movementX ||
			e.mozMovementX ||
			e.webkitMovementX ||
			0;
		if(this.state.position.x > Draw9p.rootcanvas.width){
			this.state.position.x = Draw9p.rootcanvas.width;
		}
		if(this.state.position.x < 0){
			this.state.position.x = 0;
		}
		this.state.position.y +=
			e.movementY ||
			e.mozMovementY ||
			e.webkitMovementY ||
			0;
		if(this.state.position.y > Draw9p.rootcanvas.height){
			this.state.position.y = Draw9p.rootcanvas.height;
		}
		if(this.state.position.y < 0){
			this.state.position.y = 0;
		}

		/* XXX debug cursor */
		Draw9p.rootcanvas.getContext("2d").fillRect(
			this.state.position.x,
			this.state.position.y,
			5, 5);
		this.generatemovement(this.state);
		return false;
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

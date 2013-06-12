var mouse;

function Mouse(){
    this.states = {down: "down", up: "up"};
    this.position = {x: 0, y: 0};
    this.buttons = [this.states.up, this.states.up, this.states.up];
    this.usefkeys = false;

    this.handlefkeys = function(e, state){
	if(!this.usefkeys){
	    return true;
	}

	switch(e.keyCode){
	case 112:
	    this.buttons[0] = state;
	    break;
	case 113:
	    this.buttons[1] = state;
	    break;
	case 114:
	    this.buttons[2] = state;
	    break;
	default:
	    return true;
	}
	this.generatemovement(this.position, this.buttons);
	return false;

    }

    this.handlebutton = function(e, state){

    }

    this.generatemovement = function(position, buttons){
	cons.write("m " + position + " : " + buttons);
    }
}

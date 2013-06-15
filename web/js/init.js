function elem(name){
    return document.getElementById(name);
}

function addevent(elem, evt, handler){
    elem.addEventListener(evt, handler, false);
}

/* this should not be necessary, but */
/* addevent does not seem to let me */
/* keep the F3 key event from propagating */
/* on Firefox 20. */
function setevent(elem, evt, handler){
	elem["on" + evt] = handler;
}

var cons;
var mouse;
var settings;
var ninep;

window.onload = function(){

cons = new Cons();
mouse = new Mouse();
settings = new Settings();
ninep = new NineP("ws://192.168.12.24/9p");

addevent(elem("webdraw"), "click", function(){cons.write("lol clicked whee");});
setevent(document, "keydown", function(e){return mouse.handlefkeys(e, mouse.states.down);});
setevent(document, "keyup", function(e){return mouse.handlefkeys(e, mouse.states.up);});

}

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
var srv9p;

window.onload = function(){
	var wsurl = Socket.wsurl(window.location.toString());

	cons = new Cons();
	mouse = new Mouse();
	settings = new Settings();
	srv9p = new Srv9p(Draw9p);
	ninep = new NineP(wsurl, srv9p, cons);

	/* XXX Draw9p should be instantiated and have a constructor. */
	Draw9p.rootcanvas = elem("webdraw");
	Draw9p.imgnames["webdraw"] = Draw9p.RootImage();

	addevent(elem("webdraw"), "click", function(){
		cons.write("lol clicked whee");
	});
	setevent(document, "keydown", function(e){
		return mouse.handlefkeys(e, mouse.states.down);
	});
	setevent(document, "keyup", function(e){
	return mouse.handlefkeys(e, mouse.states.up);
	});
}

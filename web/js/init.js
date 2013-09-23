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
	var wsurl = Socket.wsurl(window.location.toString());

	cons = new Cons();
	mouse = new Mouse();
	settings = new Settings();
	ninep = new NineP(wsurl, Draw9p, cons);

	/* XXX Draw9p should be instantiated and have a constructor. */
	Draw9p.rootcanvas = elem("webdraw");
	Draw9p.imgnames["webdraw"] = Draw9p.RootImage();
	Draw9p.label = "webdraw".toUTF8Array();

	addevent(elem("webdraw"), "click", function(){
		cons.flushcallbacks();
	});
	setevent(window, "keydown", function(e){
		return cons.handlekeys(e, cons.kbd.down);
	});
	setevent(window, "keyup", function(e){
		return cons.handlekeys(e, cons.kbd.up);
	});
}

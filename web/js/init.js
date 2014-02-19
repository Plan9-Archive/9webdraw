function elem(name){
	return document.getElementById(name);
}

function addevent(elem, evt, handler){
	elem.addEventListener(evt, handler, true);
}

/* this should not be necessary, but */
/* addevent does not seem to let me */
/* keep the F3 key event from propagating */
/* on Firefox 20. */
function setevent(elem, evt, handler){
	elem["on" + evt] = handler;
}

var basetime;
var cons;
var mouse;
var settings;
var ninep;

window.onload = function(){
	var wsurl = Socket.wsurl(window.location.toString());
	var webdraw = elem("webdraw");

	basetime = Date.now();
	cons = new Cons();
	mouse = new Mouse(elem("cursor"));
	settings = new Settings();
	ninep = new NineP(wsurl, Draw9p, cons);

	/* XXX Draw9p should be instantiated and have a constructor. */
	Draw9p.rootcanvas = webdraw;
	Draw9p.rootsz = {
		w: webdraw.width,
		h: webdraw.height
	};
	Draw9p.imgnames["webdraw"] = Draw9p.RootImage();
	Draw9p.label = "webdraw".toUTF8Array();

	addevent(webdraw, "mousedown", function(e){
		return mouse.handlebutton(e, 1);
	});
	addevent(webdraw, "mouseup", function(e){
		return mouse.handlebutton(e, 0);
	});
	addevent(webdraw, "mousemove", function(e){
		return mouse.handlemove(e);
	});
	setevent(window, "keydown", function(e){
		return cons.handlekeys(e, cons.kbd.down);
	});
	setevent(window, "keypress", function(e){
		return cons.handlekeys(e, cons.kbd.press);
	});
	setevent(window, "keyup", function(e){
		return cons.handlekeys(e, cons.kbd.up);
	});

	setevent(webdraw, "click", function(e){
		if(
			document.pointerLockElement !== webdraw &&
			document.mozPointerLockElement !== webdraw &&
			document.webkitPointerLockElement !== webdraw
		){
			webdraw.requestPointerLock =
				webdraw.requestPointerLock ||
				webdraw.mozRequestPointerLock ||
				webdraw.webkitRequestPointerLock;
			webdraw.requestPointerLock();
			return false;
		}else{
			return true;
		}
	});
}

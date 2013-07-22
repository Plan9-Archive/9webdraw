Testdraw = {};

Testdraw.line = function(){
	var root = Draw9p.RootImage();

	var src = new Draw9p.Image(0, "r8g8b8", 1,
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		0x00FF00FF);

	var img = new Draw9p.Image(0, "r8g8b8", 0,
		{min: {x: 0, y: 0}, max: {x: 100, y: 100}},
		{min: {x: 0, y: 0}, max: {x: 100, y: 100}},
		0xFF00FFFF);

	Memdraw.line(img, {x: 45, y: 15}, {x: 0, y: 100}, 0, 0, 10, src, {x: 0, y: 0}, 0);

	Memdraw.line(root, {x: 15, y: 15}, {x: 100, y: 100}, 0, 0, 10, img, {x: 0, y: 0}, 0);
}

Testdraw.poly = function(){
	var root = Draw9p.RootImage();

	var src = new Draw9p.Image(0, "r8g8b8", 1,
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		0x00FF00FF);

	var pts = [
		{x: 20, y: 20},
		{x: 20, y: 200},
		{x: 200, y: 200},
		{x: 200, y: 20},
		{x: 20, y: 20}
	];

	Memdraw.poly(root, pts, 0, 0, 15, src, {x:0, y:0}, 0);
}

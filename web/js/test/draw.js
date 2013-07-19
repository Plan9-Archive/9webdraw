Testdraw = function(){
	var root = Draw9p.RootImage();

	var img = new Draw9p.Image(0, "r8g8b8", 1,
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		{min: {x: 0, y: 0}, max: {x: 1, y: 1}},
		0x00FF00FF);

	Memdraw.line(root, {x: 15, y: 15}, {x: 100, y: 100}, 0, 0, 10, img, {x: 0, y: 0}, 0);
}

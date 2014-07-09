/* See /sys/src/libmemdraw/draw.c */

function MUL(x, y){
	var t;

	t = (x * y) + 128;
	return (t + (t >> 8)) >> 8;
}

function alphacalcfake(dst, src, mask, dx, op){
	var i;

	for(i = 0; i < dst.data.length; ++i)
		dst.data[i] = i%4==3? 255:255-mask.data[i+(4-(i%4))];
		//dst.data[i] = mask.data[i];
	return;
}

function alphacalc11(dst, src, mask, dx, op){
	var i, j;
	var sa, ma;
	var fd;

	sa = 0;
	ma = 0;
	for(i = 0; i < dx; ++i){
		fd = 255 - MUL(src.data[(sa * 4) + 3], mask.data[(ma * 4)]);

		for(j = 0; j < 4; ++j){
			if(j == 3){
				dst.data[(i * 4) + j] = 255;
			}else
			dst.data[(i * 4) + j] =
				MUL(src.data[(sa * 4) + j], mask.data[(ma * 4) + 3]) +
				MUL(dst.data[(i * 4) + j], fd);
		}
		if(++sa >= src.width)
			sa = 0;
		if(++ma >= mask.width)
			ma = 0;
	}
	return dst;
}

function alphacalc(dst, src, mask, dx, op){
	switch(op){
		case 11:
		default:
			return alphacalc11(dst, src, mask, dx, op);
	}
}

function yydata(img, r, y){
	var data;
	var yd;

	yd = img.width * y;
	data = img.data.subarray(yd * 4, (yd + img.width) * 4);
	return {
		width: img.width,
		height: 1,
		name: r,
		y: y,
		data: data
	}
}

function getrect(img, r){

	if(img.repl)
		return img.getrect(img.r);
	else
		return img.getrect(r);
}

function drawY(dst, src, mask, op){

	//if(op == 11)
		return alphacalc11(dst, src, mask, dst.width, op);
}

function clipy(r, y){
	if(y >= Dy(r))
		return 0;
	else
		return y;
}

function drawalpha(dst, r, src, sr, mask, mr, op){
	var dy;
	var dd, sd, md;
	var srcy, masky;
	var i;

	dy = Dy(r);

	sr = Rect.copy(sr);
	mr = Rect.copy(mr);

	rectclip(sr, src.r);
	rectclip(mr, mask.r);
	dd = getrect(dst, r);
	sd = getrect(src, sr);
	md = getrect(mask, mr);
	srcy = 0;
	masky = 0;

	for(i = 0; i < dy; ++i){
		srcy = clipy(src.r, srcy);
		masky = clipy(mask.r, masky);
		drawY(yydata(dd, r, i), yydata(sd, sr, srcy), yydata(md, mr, masky), op);
		srcy += 1;
		masky += 1;
	}

	dst.putrect(dd, r.min);
}

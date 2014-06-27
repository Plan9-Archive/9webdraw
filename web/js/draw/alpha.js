/* See /sys/src/libmemdraw/draw.c */

function MUL(x, y){
	var t;

	t = (x * y) + 128;
	return (t + (t >> 8)) >> 8;
}

// #define MUL(x, y) (((((x)*(y))+128) + ((((x)*(y))+128) >> 8)) >> 8)

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
			dst.data[(i * 4) + j] =
				MUL(src.data[(sa * 4) + j], mask.data[(ma * 4)]) +
				MUL(dst.data[(sa * 4) + j], fd);
				//mask.data[(ma * 4) + 0];
		}
//		dst.data[(i * 4) + 0] = src.data[(sa * 4) + 0] * mask.data[(ma * 4) + 0];
//		dst.data[(i * 4) + 1] = src.data[(sa * 4) + 1] * mask.data[(ma * 4) + 1];
//		dst.data[(i * 4) + 2] = src.data[(sa * 4) + 2] * mask.data[(ma * 4) + 2];
//		dst.data[(i * 4) + 3] = src.data[(sa * 4) + 3] * mask.data[(ma * 4) + 3];
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
	var rr;

	rr = Rect.copy(r);
	if(!img.repl)
		rectclip(rr, img.r);

	return img.getrect(rr);
}

function drawY(dst, src, mask, op){
	var dd, sd, md;

	//if(op == 11)
		return alphacalc11(dst, src, mask, dst.width, op);
}

function clipy(r, y){
	if(y >= Dy(r))
		return 0;
	else
		return y;
}

/* XXX modifies sr, mr! */
function drawalpha(dst, r, src, sr, mask, mr, op){
	var dy;
	var dd, sd, md;
	var srcy, masky;
	var i;

	dy = Dy(r);

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

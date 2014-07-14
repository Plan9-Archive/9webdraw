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

/* XXX should use point manipulation. */
function yzdata(img, r, y){
	var data;
	var line;

	line = img.data.width * (r.min.y - img.r.min.y + y);
	data = img.data.data.subarray((line + r.min.x - img.r.min.x) * 4, (line + r.min.x - img.r.min.x+ Dx(r)) * 4);
	return {
		width: Dx(r),
		height: 1,
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
	else if(y < 0)
		return Dy(r);
	else
		return y;
}

function copysrc(data, srceq){
	if(!srceq)
		return data;

	data.data = new Uint8ClampedArray(data.data);
	return data;
}

function drawalpha(dst, r, src, sr, mask, mr, op){
	var dy;
	var dd, sd, md;
	var dsty, srcy, masky;
	var starty, endy;
	var i;
	var needbuf, dir;

	dy = Dy(r);

	sr = Rect.copy(sr);
	mr = Rect.copy(mr);

	needbuf = src.data == dst.data;
	//if(needbuf && (r.min.y * Dx(dst.r) + r.min.x) > (sr.min.y * Dx(src.r) + sr.min.x))
	if(needbuf && byteaddr(dst, r.min) > byteaddr(src, sr.min))
		dir = -1;
	else
		dir = 1;

	//dir = 1;

	rectclip(sr, src.r);
	rectclip(mr, mask.r);
	//dd = getrect(dst, r);
	//sd = getrect(src, sr);
	//md = getrect(mask, mr);
	if(dir == 1){
		starty = 0;
		endy = dy;
	}else{
		starty = dy - 1;
		endy = -1;
	}
	srcy = starty;//(starty + sr.min.y - src.r.min.y) % Dy(src.r);
	masky = starty;//(starty + mr.min.y - mask.r.min.y) % Dy(mask.r)
	dsty = starty; // + r.min.y - dst.r.min.y;

	for(i = 0; i < dy; ++i){
		dsty = clipy(dst.r, dsty);
		srcy = clipy(src.r, srcy);
		masky = clipy(mask.r, masky);
		//drawY(yydata(dd, r, i), yydata(sd, sr, srcy), yydata(md, mr, masky), op);
		drawY(
			yzdata(dst, r, dsty),
			copysrc(yzdata(src, sr, srcy), needbuf),
			yzdata(mask, mr, masky),
			op);
		dsty += dir;
		srcy += dir;
		masky += dir;
	}

	dst.putrect(dst.data, dst.r.min);
}

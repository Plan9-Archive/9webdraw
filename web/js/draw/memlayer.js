/* /sys/src/libmemlayer/ */

function ldrawop(dst, screenr, clipr, etc, insave){
	var p0, p1;
	var oclipr, srcr, r, mr;
	var ok;

	if(insave && etc.dst.save == undefined)
		return;
	p0 = addpt(screenr.min, etc.deltas);
	p1 = addpt(screenr.min, etc.deltasm);

	if(insave){
		r = rectsubpt(screenr, etc.dst.delta);
		clipr = rectsubpt(clipr, etc.dst.delta);
	}else{
		r = Rect.copy(screenr);
	}

	/* now in logical coordinates */

	if(!rectinrect(r, clipr)){
		oclipr = Rect.copy(dst.clipr);
		dst.clipr = Rect.copy(clipr);
		ok = drawclip(dst, r, etc.src, p0, etc.mask, p1, srcr, mr);
		dst.clipr = oclipr;
		if(!ok)
			return;
	}
	memdraw(dst, r, etc.src, p0, etc.mask, p1, etc.op);
}

function memdraw(dst, r, src, p0, mask, p1, op){
	var d;
	var srcr, tr, mr;

	if(mask == undefined){
		mask = memopaque;
		p1 = new Point(0, 0);
	}
	r = Rect.copy(r);
	p0 = Point.copy(p0);
	p1 = Point.copy(p1);
	srcr = new Rect(new Point(0, 0), new Point(0, 0));
	mr = new Rect(new Point(0, 0), new Point(0, 0));


	if(mask.screen != undefined)
		return;

	Top: do{
		if(dst.screen == undefined && src.screen == undefined)
			return drawmasked(dst, r, src, p0, mask, p1, op);

		if(drawclip(dst, r, src, p0, mask, p1, srcr, mr) == 0)
			return;

		/* convert to screen coordinates */
		if(dst.screen)
			r = rectaddpt(r, dst.delta);

		Clearlayer: do{
			if(dst.screen && dst.clear){
				if(src == dst){
					p0 = addpt(p0, dst.delta);
					src = dst.screen.backimg;
				}
				dst = dst.screen.backimg;
				continue Top;
			}
			if(src.screen){
				p0 = addpt(p0, src.delta);
				srcr = rectaddpt(srcr, src.delta);
			}

			/* Now everything is in screen coordinates. */

			if(dst.screen != undefined && dst == src){
				if(dst.save == undefined)
					return;
				if(rectXrect(r, srcr)){
					tr = Rect.copy(r);
					if(srcr.min.x < tr.min.x){
						p1.x += tr.min.x - srcr.min.x;
						tr.min.x = srcr.min.x;
					}
					if(srcr.min.y < tr.min.y){
						p1.y += tr.min.y - srcr.min.y;
						tr.min.y = srcr.min.y;
					}
					if(srcr.max.x > tr.max.x)
						tr.max.x = srcr.max.x;
					if(srcr.max.y > tr.max.y)
						tr.max.y = srcr.max.y;
					memlhide(dst, tr);
				}else{
					memlhide(dst, r);
					memlhide(dst, srcr);
				}
				memdraw(dst.save, rectsubpt(r, dst.delta), dst.save,
					subpt(srcr.min, src.delta), mask, p1, op);
				memlexpose(dst, r);
				return;
			}
			if(src.screen){
				if(src.clear){
					src = src.screen.backimg;
					if(dst.screen)
						r = rectsubpt(r, dst.delta);
					continue Top;
				}
				/* relatively rare case; use save area */
				if(src.save == undefined)
					return;
				memlhide(src, srcr);
				/* convert back to logical coordinates */
				p0 = subpt(p0, src.delta);
				srcr = rectsubpt(srcr, src.delta);
				src = src.save;
			}
			/* src is now an image.  dst may be an image or a clear layer. */
			if(dst.screen == undefined)
				continue Top;
			if(dst.clear)
				continue Clearlayer;
			/* dst is an obscured layer */
			d = {
				deltas: subpt(p0, r.min),
				deltam: subpt(p1, r.min),
				dst: dst,
				src: src,
				op: op,
				mask: mask
			};
			memlayerop(ldrawop, dst, r, r, d);
			break;
		}while(true);
		break;
	}while(true);
}

function layerop(fn, img, r, clipr, etc, front){
	var fr;

	var RECUR = function(a, b, c, d){
		return layerop(fn, img, new Rect(new Point(a.x, b.y), new Point(c.x, d.y)), clipr, etc, front.rear);
	}

	r = Rect.copy(r);
	for(;;){
		if(front == img){
			fn(img.screen.backimg, r, clipr, etc, 0);
			return;
		}
		fr = front.screenr;
		if(rectXrect(r, fr) == 0)
			front = front.rear;
		else
			break;
	}
	if(fr.max.y < r.max.y){
		RECUR(r.min, fr.max, r.max, r.max);
		r.max.y = fr.max.y;
	}
	if(r.min.y < fr.min.y){
		RECUR(r.min, r.min, r.max, fr.min);
		r.min.y = fr.min.y;
	}
	if(fr.max.x < r.max.x){
		RECUR(fr.max, r.min, r.max, r.max);
		r.max.x = fr.max.x;
	}
	if(r.min.x < fr.min.x){
		RECUR(r.min, r.min, fr.min, r.max);
		r.min.x = fr.min.x;
	}
	fn(img.save, r, clipr, etc, 1);
}

function memlayerop(fn, img, screenr, clipr, etc){
	var r, scr;

	screenr = Rect.copy(screenr);
	if(!rectclip(screenr, img.screenr))
		return;
	if(img.clear){
		fn(screen.backimg, screenr, clipr, etc, 0);
		return;
	}
	r = screenr;
	scr = img.screen.backimg.clipr;
	if(rectclip(screenr, scr))
		layerop(fn, img, screenr, clipr, etc, img.screen.frontmost);
	if(rectinrect(r, scr))
		return;

	if(!rectXrect(r, src)){
		/* completely offscreen */
		fn(img.save, r, clipr, etc, 1);
		return;
	}
	if(r.min.y < scr.min.y){
		/* above screen */
		fn(img.save, new Rect(r.min, new Point(r.max.x, scr.min.y)), clipr, etc, 1);
		r.min.y = scr.min.y;
	}
	if(r.max.y > scr.max.y){
		/* below screen */
		fn(img.save, new Rect(new Point(r.min.x, scr.max.y), r.max), clipr, etc, 1);
		r.max.y = scr.max.y;
	}
	if(r.min.x < scr.min.x){
		/* left of screen */
		fn(img.save, new Rect(r.min, new Point(scr.min.x, r.max.y)), clipr, etc, 1);
		r.min.x = scr.min.x;
	}
	if(r.max.x > scr.max.x){
		/* right of screen */
		fn(img.save, new Rect(new Point(scr.max.x, r.min.y), r.max), clipr, etc, 1);
	}
}

function memldelete(img){
	var screen;

	delete img.save;
	img.save = undefined;
	img.refreshptr = undefined;
	memltorear(img);

	screen = img.screen;
	if(screen.fill){
		img.clipr = img.r;
		memdraw(img, img.r, screen.fill, img.r.min, undefined, img.r.min, Memdraw.Opdefs.S.key);
	}
	if(img.front){
		img.front.rear = undefined;
		screen.rearmost = img.front;
	}else{
		screen.frontmost = undefined;
		screen.rearmost = undefined;
	}
	delete img;
}

function memltofront(img, front, fill){
	var s;
	var f, ff, rr;
	var x;
	var overlap;

	s = img.screen;
	while(img.front != front){
		f = img.front;
		x = Rect.copy(img.screenr);
		overlap = rectclip(x, f.screenr);
		if(overlap){
			memlhide(f, x);
			f.clear = false;
		}
		/* swap img and f in screen's list */
		ff = f.front;
		rr = img.rear;
		if(ff == undefined)
			s.frontmost = img;
		else
			ff.rear = img;
		if(rr == undefined)
			s.rearmost = f;
		else
			rr.front = f;
		img.front = ff;
		img.rear = f;
		f.front = img;
		f.rear = rr;
		if(overlap && fill)
			memlexpose(i, x);
	}
}

function memltofrontfill(img, fill){
	memltofront(img, undefined, fill);
	memlsetclear(img.screen);
}

function memltofrontn(imgs){
	var i;
	var front;

	if(imgs.length == 0)
		return;
	front = undefined;
	for(i = 0; i < imgs.length; ++i){
		memltofront(imgs[i], front, 1);
		front = imgs[i];
	}
	memlsetclear(front.screen);
}

function memltorear(img, rear){
	var s;
	var f, r, rr;
	var x;
	var overlap;

	s = img.screen;
	while(img.rear != rear){
		r = img.rear;
		x = Rect.copy(img.screenr);
		overlap = rectclip(x, r.screenr);
		if(overlap){
			memlhide(img, x);
			img.clear = false;
		}
		/* swap img and r in screen's list */
		rr = r.rear;
		f = img.front;
		if(rr == undefined)
			s.rearmost = img;
		else
			rr.front = img;
		if(f == undefined)
			s.frontmost = r;
		else
			f.rear = r;
		img.rear = rr;
		img.front = r;
		r.rear = img;
		r.front = f;
		if(overlap)
			memlexpose(r, x);
	}
}

function memltorearn(imgs){
	var i;
	var rear;

	if(imgs.length == 0)
		return;
	rear = undefined;
	for(i = 0; i < imgs.length; ++i){
		memltorear(imgs[i], rear);
		rear = i;
	}
	memlsetclear(rear.screen);
}

function memlsetrefresh(img, fn, ptr){
	throw("memlsetrefresh is unimplemented");
}

function lhideop(src, screenr, clipr, img, insave){
	var r;

	if(src != img.save){
		r = rectsubpt(screenr, img.delta);
		memdraw(img.save, r, src, screenr.min, undefined, screenr.min, Memdraw.Opdefs.S.key);
	}
}

function memlhide(img, screenr){
	screenr = Rect.copy(screenr);

	if(img.save == undefined)
		return;
	if(rectclip(screenr, img.screen.backimg.r) == 0)
		return;
	memlayerop(lhideop, img, screenr, screenr, img);
}

function lexposeop(dst, screenr, clipr, img, insave){
	var r;

	if(insave)
		return;
	r = rectsubpt(screenr, img.delta);
	if(img.save != undefined)
		memdraw(dst, screenr, img.save, r.min, undefined, r.min, Memdraw.Opdefs.S);
	else
		img.refreshfn(dst, r, img.refreshptr);
}

function memlexpose(img, screenr){
	screenr = Rect.copy(screenr);

	if(rectclip(screenr, img.screen.backimg.r) == 0)
		return;
	memlayerop(lexposeop, img, screenr, screenr, img);
}

function memlsetclear(screen){
	var i, j;

	for(i = screen.rearmost; i != undefined; i = i.front){
		i.clear = rectinrect(i.screenr, i.screen.backimg.clipr);
		if(i.clear){
			for(j = i.front; j != undefined; j = j.front){
				if(rectXrect(i.screenr, j.screenr)){
					i.clear = 0;
					break;
				}
			}
		}
	}
}

function memlorigin(img, log, scr){
	var s;
	var x, newr, oldr;
	var delta;
	var overlap, eqlog, eqscr, wasclear;

	s = img.screen;
	oldr = Rect.copy(img.screenr);
	newr = new Rect(new Point(scr.x, scr.y), new Point(scr.x+Dx(oldr), scr.y+Dy(oldr)));
	eqsqr = eqpt(scr, oldr.min);
	eqlog = eqpt(log, img.r.min);
	if(eqscr && eqlog)
		return 0;

	/* XXX memlorigin handle save rectangle */

	memltofront(img);
	wasclear = img.clear;

	delta = subpt(log, img.r.min);
	img.r = rectaddpt(img.r, delta);
	img.clipr = rectaddpt(img.clipr, delta);
	img.delta = subpt(img.screenr.min, img.r.min);
	if(eqscr)
		return 0;

	/* XXX clean up background with shadow window. */
}
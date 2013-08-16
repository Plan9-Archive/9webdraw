var getpixel = function(data, depth, w, h, line, col){
	return;
}

var canvaspos = function(w, h, line, col){
	return (line * w) + col;
}

var scalepixel = function(pixel, from, to){
	if(from < to){
		return pixel << (to - from);
	}else{
		return pixel >> (from - to);
	}
}

Memdraw.Load = {
	generic: function(arr, w, h, chan, data){
		var depth = Chan.chantodepth(chan);

		for(var line = 0; line < h; ++line){
			for(var col = 0; col < w; ++col){
				var pixel = getpixel(data, depth, w, h, line, col);
				var cp = canvaspos(w, h, line, col);
				for(var c = chan; c; c >>= 8){
					var nbits = Chan.NBITS(c);
					var px = pixel & ((1<<nbits) - 1);
					var spx = scalepixel(px, nbits, 8);
					switch(Chan.TYPE(c)){
					case Chan.chans.CRed:
						arr[cp + 0] = spx;
						break;
					case Chan.chans.CGreen:
						arr[cp + 1] = spx;
						break;
					case Chan.chans.CBlue:
						arr[cp + 2] = spx;
						break;
					case Chan.chans.CGrey:
						arr[cp + 0] = spx;
						arr[cp + 1] = spx;
						arr[cp + 2] = spx;
						break;
					case Chan.chans.CAlpha:
						arr[cp + 3] = spx;
						break;
					case Chan.chans.CMap:
						throw("color format not supported");
						break;
					case Chan.chans.CIgnore:
						break;
					default:
						throw("color format not implemented");
					}
					pixel >>= nbits;
				}
			}
		}
	return arr;
	}
}

Chan = {
	NBITS: function(c){
		return c & 0xF;
	},
	TYPE: function(c){
		return (c >> 4) & 0xF;
	},
	DC: function(type, nbits){
		return ((type & 0xF) << 4) | (nbits & 0xF);
	},
	channames: ['r', 'g', 'b', 'k', 'a', 'm', 'x'],
	chans: {
		CRed: 0,
		CGreen: 1,
		CBlue: 2,
		CGrey: 3,
		CAlpha: 4,
		CMap: 5,
		CIgnore: 6,
		NChan: 7
	},
	chantostr: function(cc){
		var buf = [];
		var c, rc;

		if(chantodepth(cc) == 0){
			return undefined;
		}

		rc = 0;
		for(c = cc; c; c >>= 8){
			rc <<= 8;
			rc |= c & 0xFF;
		}

		for(c = rc; c; c >>= 8){
			buf.push(this.channames[this.TYPE(c)]);
			buf.push(this.NBITS(c));
		}

		return buf.join("");
	},
	strtochan: function(s){
		throw("strtochan not implemented");
	},
	chantodepth: function(c){
		var n;

		for(n = 0; c; c >>= 8){
			if(this.TYPE(c) >= this.chans.NChan ||
				this.NBITS(c) > 8 ||
				this.NBITS(c) <= 0){
				return 0;
			}
			n += this.NBITS(c);
		}
		if(n == 0 || (n > 8 && n % 8) || (n < 8 && 8 % n)){
			return 0;
		}
		return n;
	}
}

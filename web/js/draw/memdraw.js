Memdraw = {
	line: function(dst, p0, p1, end0, end1, radius, src, sp, op){
		dst.ctx.save();
		dst.ctx.beginPath();
		var dy = p1.y - p0.y;
		var dx = p1.x - p0.x;
		var angle = Math.atan(dy/dx);
		var length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy,2));

		ctx.translate(p0.x, p0.y);
		ctx.rotate(angle);
		ctx.beginPath();
		ctx.moveTo(0, radius/2);
		ctx.lineTo(length, radius/2);
		ctx.lineTo(length, -radius/2);
		ctx.lineTo(0, -radius/2);
		ctx.lineTo(0, radius/2);
		//ctx.clip();
		ctx.fill();

		dst.ctx.restore();
		return;
	},
	Ops: {
		Clear: 0,
		SinD: 8,
		DinS: 4,
		SoutD: 2,
		DoutS: 1,

		S: this.SinD|this.SoutD,
		SoverD: this.SinD|this.SoutD|this.DoutS,
		SatopD: this.SinD|this.DoutS,
		SxorD: this.SoutD|this.DoutS,

		D: this.DinS|this.DoutS,
		DoverS: this.DinS|this.DoutS|this.SoutD,
		DatopS: this.DinS|this.SoutD,
		DxorS: this.DoutS|this.SoutD,

		Ncomp: 12
	}
}

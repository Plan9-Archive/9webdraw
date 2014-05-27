/* See /sys/src/libdraw/arith.c */

var Point = function(x, y){
	this.x = x;
	this.y = y;
}

Point.copy = function(p){
	return new Point(p.x, p.y);
}

Point.prototype.add = function(p){
	this.x += p.x;
	this.y += p.y;
	return this;
}

Point.prototype.sub = function(p){
	this.x -= p.x;
	this.y -= p.y;
	return this;
}

Point.prototype.div = function(n){
	this.x /= n;
	this.y /= n;
	return this;
}

Point.prototype.mul = function(n){
	this.x *= n;
	this.y *= n;
	return this;
}

var Rect = function(min, max){
	this.min = min;
	this.max = max;
}

Rect.copy = function(r){
	var min = Point.copy(r.min);
	var max = Point.copy(r.max);
	return new Rect(min, max);
}

Rect.prototype.inset = function(n){
	this.min.x += n;
	this.min.y += n;
	this.max.x -= n;
	this.max.y -= n;
	return this;
}

Rect.prototype.subpt = function(p){
	this.min.x -= p.x;
	this.min.y -= p.y;
	this.max.x -= p.x;
	this.max.y -= p.y;
	return this;
}

Rect.prototype.addpt = function(p){
	this.min.x += p.x;
	this.min.y += p.y;
	this.max.x += p.x;
	this.max.y += p.y;
	return this;
}

var addpt = function(a, b){
	return Point.copy(a).add(b);
}

var subpt = function(a, b){
	return Point.copy(a).sub(b);
}

var insetrect = function(r, n){
	return Rect.copy(r).inset(n);
}

var divpt = function(a, b){
	return Point.copy(a).div(b);
}

var mulpt = function(a, b){
	return Point.copy(a).mul(b);
}

var rectsubpt = function(r, p){
	return Rect.copy(r).subpt(p);
}

var rectaddpt = function(r, p){
	return Rect.copy(r).addpt(p);
}

var eqpt = function(p, q){
	return p.x == q.x && p.y == q.y;
}

var eqrect = function(r, s){
	return (
		r.min.x == s.min.x &&
		r.max.x == s.max.x &&
		r.min.y == s.min.y &&
		r.max.y == s.max.y
	);
}

var rectXrect = function(r, s){
	return (
		r.min.x < s.max.x &&
		s.min.x < r.max.x &&
		r.min.y < s.max.y &&
		s.min.y < r.max.y
	);
}

var rectinrect = function(r, s){
	return (
		s.min.x <= r.min.x &&
		r.max.x <= s.max.x &&
		s.min.y <= r.min.y &&
		r.max.y <= s.max.y
	);
}

var ptinrect = function(p, r){
	return (
		p.x >= r.min.x &&
		p.x < r.max.x &&
		p.y >= r.min.y &&
		p.y < r.max.y
	);
}

var canonrect = function(r){
	var t;
	r = Rect.copy(r);
	if(r.max.x < r.min.x){
		t = r.min.x;
		r.min.x = r.max.x;
		r.max.x = t;
	}
	if(r.max.y < r.min.y){
		t = r.min.y;
		r.min.y = r.max.y;
		r.max.y = t;
	}
	return r;
}

var combinerect = function(r1, r2){
	if(r1.min.x > r2.min.x)
		r1.min.x = r2.min.x;
	if(r1.min.y > r2.min.y)
		r1.min.y = r2.min.y;
	if(r1.max.x < r2.max.x)
		r1.max.x = r2.max.x;
	if(r1.max.y < r2.max.y)
		r1.max.y = r2.max.y;
}
function ArrayIterator(array){
	this.array = array;
	this.index = 0;
}

ArrayIterator.prototype.getChar = function(){
	if(this.array.length < this.index + 1){
		throw("array too short");
	}
	return ((this.array[this.index++] & 0xFF) << 0);
}

ArrayIterator.prototype.getShort = function(){
	if(this.array.length < this.index + 2){
		throw("array too short");
	}
	return (
		((this.array[this.index++] & 0xFF) << 0) |
		((this.array[this.index++] & 0xFF) << 8)
	);
}

ArrayIterator.prototype.getLong = function(){
	if(this.array.length < this.index + 4){
		throw("array too short");
	}
	return (
		((this.array[this.index++] & 0xFF) << 0) |
		((this.array[this.index++] & 0xFF) << 8) |
		((this.array[this.index++] & 0xFF) << 16) |
		((this.array[this.index++] & 0xFF) << 24)
	);
}

ArrayIterator.prototype.getPoint = function(){
	return {
		x: this.getLong(),
		y: this.getLong()
	}
}

ArrayIterator.prototype.getRect = function(){
	return {
		min: this.getPoint(),
		max: this.getPoint()
	}
}

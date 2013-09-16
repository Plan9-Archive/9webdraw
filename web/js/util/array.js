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

ArrayIterator.prototype.getBytes = function(bytes){
	if(this.array.length < this.index + bytes){
		throw("array too short");
	}
	var begin = this.index;
	this.index += bytes;
	return this.array.slice(begin, this.index);
}

ArrayIterator.prototype.peekBytes = function(bytes){
	if(this.array.length < this.index + bytes){
		throw("array too short");
	}
	var begin = this.index;
	var end = begin + bytes;
	return this.array.slice(begin, end);
}

ArrayIterator.prototype.advanceBytes = function(bytes){
	if(this.array.length < this.index + bytes){
		throw("array too short");
	}
	this.index += bytes;
}

ArrayIterator.prototype.getRemainingBytes = function(){
	return this.getBytes(this.array.length - this.index);
}

ArrayIterator.prototype.peekRemainingBytes = function(){
	return this.peekBytes(this.array.length - this.index);
}

ArrayIterator.prototype.hasRemainingBytes = function(){
	return this.index < this.array.length;
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

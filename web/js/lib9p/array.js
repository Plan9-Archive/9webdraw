Array.prototype.append = function(arr){
	this.push.apply(this, arr);
}

Array.prototype.prepend = function(arr){
	this.unshift.apply(this, arr);
}

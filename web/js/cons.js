var cons;

function Cons(){
    this.elem = elem("cons");

	this.log = function(s){
		var span = document.createElement("span");
		span.textContent = s;
		this.elem.appendChild(span);
	}

	this.write = function(s){
		this.log(s);
		/* ninep.write(s); */
	}
}

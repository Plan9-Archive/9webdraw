var cons;

function Cons(){
    this.elem = elem("cons");

    this.write = function(s){
	var span = document.createElement("span");
	span.textContent = s;
	this.elem.appendChild(span);
    }
}

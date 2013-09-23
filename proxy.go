package main

import (
	"code.google.com/p/go.net/websocket"
	"os/exec"
	"io"
	"net/http"
	"flag"
)

func mksrv9p(usesrv bool, args []string) func(*websocket.Conn){
return func(ws *websocket.Conn){
	defer ws.Close();
	ws.PayloadType = websocket.BinaryFrame;

	var srvcat *exec.Cmd;
	if(usesrv){
		srvcat = exec.Command("srvcat", "webdraw");
	}else if(len(args) > 0){
		srvcat = exec.Command("runweb", args...);
	}else{
		srvcat = exec.Command("runweb", "games/catclock");
	}
	stdin, err := srvcat.StdinPipe();
	stdout, err := srvcat.StdoutPipe();

	defer stdin.Close();
	defer stdout.Close();

	err = srvcat.Start();
	if err != nil {
		return;
	}

	go func(){
		io.Copy(stdin, ws);
		stdout.Close();
		ws.Close();
	}();

	io.Copy(ws, stdout);
}
}

func main(){
	usesrv := flag.Bool("srv", false, "post a file descriptor in srv");
	flag.Parse();
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		http.ServeFile(w, r, "web/9wd.html");
	});
	http.Handle("/js/", http.FileServer(http.Dir("web")));
	http.Handle("/css/", http.FileServer(http.Dir("web")));
	http.Handle("/9p", websocket.Handler(mksrv9p(*usesrv, flag.Args())));
		
	http.ListenAndServe("", nil);
}

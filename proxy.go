package main

import (
	"code.google.com/p/go.net/websocket"
	"os/exec"
/*	"encoding/base64"
	"flag"
*/	"io"
/*	"log"
	"net"
*/	"net/http"
)

func srv9p(ws *websocket.Conn){
	defer ws.Close();

	srvcat := exec.Command("srvcat", "webdraw");
	stdin, err := srvcat.StdinPipe();
	stdout, err := srvcat.StdoutPipe();

	defer stdin.Close()
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

func main(){
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		http.ServeFile(w, r, "web/9wd.html");
	});
	http.Handle("/js/", http.FileServer(http.Dir("web")));
	http.Handle("/css/", http.FileServer(http.Dir("web")));
	http.Handle("/9p", websocket.Handler(srv9p));
	http.ListenAndServe("", nil);
}

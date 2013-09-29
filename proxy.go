package main

import (
	"code.google.com/p/go.net/websocket"
	"os"
	"os/exec"
	"io"
	"net/http"
	"flag"
)

func mkargs(args[] string) ([]string){
	if(len(args) > 0){
		return append([]string{"runweb"}, args...);
	}else{
		return []string{"runweb", "/bin/games/catclock"};
	}
}

func mkrunweb(args[] string) func(ws *websocket.Conn){
	return func(ws *websocket.Conn){
		defer ws.Close();
		ws.PayloadType = websocket.BinaryFrame;
	
		var fd[2] *os.File;
		var err error;
		fd[0], fd[1], err = os.Pipe();
		if(err != nil){
			return;
		}

		var pa os.ProcAttr;
		pa.Files = []*os.File{fd[1], fd[1]};

		var proc *os.Process;
		proc, err = os.StartProcess("runweb", mkargs(args), &pa);
		if(err != nil){
			return;
		}
		defer proc.Kill();

		go func(){
			io.Copy(fd[0], ws);
			fd[0].Close();
			ws.Close();
		}();

		io.Copy(ws, fd[0]);
	}
}

func srv9p(ws *websocket.Conn){
	defer ws.Close();
	ws.PayloadType = websocket.BinaryFrame;

	srvcat := exec.Command("srvcat", "webdraw");
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

func main(){
	usesrv := flag.Bool("srv", false, "post a file descriptor in srv");
	flag.Parse();

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		http.ServeFile(w, r, "web/9wd.html");
	});
	http.Handle("/js/", http.FileServer(http.Dir("web")));
	http.Handle("/css/", http.FileServer(http.Dir("web")));
	if(*usesrv){
		http.Handle("/9p", websocket.Handler(srv9p));
	}else{
		http.Handle("/9p", websocket.Handler(mkrunweb(flag.Args())));
	}
	http.ListenAndServe("", nil);
}

#include <u.h>
#include <libc.h>
#include <thread.h>

int p[2], in[2], out[2];


void relayproc(void *v){
	int n, *fd;
	char buf[65536];

	fd = v;

	while((n = read(fd[0], buf, sizeof(buf))) > 0){
		if(write(fd[1], buf, n) != n){
			sysfatal("write: %r");
		}
	}
	threadexitsall("");
}

void threadmain(int argc, char *argv[]){

	if(argc < 2){
		fprint(2, "Usage: %s command [arg1, arg2, ...]\n", argv[0]);
		exits("no srvname");
	}

	pipe(p);

	in[0] = 0;
	in[1] = p[1];
	out[0] = p[1];
	out[1] = 1;

	proccreate(relayproc, in, 1048576);
	proccreate(relayproc, out, 1048576);

	if(mount(p[0], -1, "/dev/", MBEFORE, nil) == -1){
		fprint(2, "mount: %r\n");
		threadexitsall("mount failed");
	}

	procexec(nil, argv[1], argv + 1);

	threadexitsall("");
}

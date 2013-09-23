#include <u.h>
#include <libc.h>
#include <thread.h>

char path[256] = "/srv/";
Channel *chan;

void relaythread(void *v){
	int n, *fd;
	char buf[1024];
	Ioproc *io;

	fd = v;
	io = ioproc();

	while((n = ioread(io, fd[0], buf, sizeof(buf))) > 0){
		if(iowrite(io, fd[1], buf, n) != n){
			sysfatal("iowrite: %r");
		}
	}
	closeioproc(io);
	send(chan, nil);
}

void threadmain(int argc, char *argv[]){
	int fd, p[2], in[2], out[2];

	if(argc < 2){
		fprint(2, "Usage: %s [srvname]\n", argv[0]);
		exits("no srvname");
	}

	strncat(path, argv[1], 250);

	pipe(p);
	fd = create(path, OWRITE|ORCLOSE, 0666);
	fprint(fd, "%d", p[0]);
	close(fd);
	close(p[0]);

	in[0] = 0;
	in[1] = p[1];
	out[0] = p[1];
	out[1] = 1;

	chan = chancreate(1, 1);

	threadcreate(relaythread, in, 8192);
	threadcreate(relaythread, out, 8192);

	recv(chan, nil);

	exits("");
}

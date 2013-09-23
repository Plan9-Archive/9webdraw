#include <u.h>
#include <libc.h>
#include <thread.h>

Channel *chan;

struct misc {
	int argc;
	char **argv;
	int fd;
} misc;

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
	threadexitsall("");
}

void mountexec(void *arg){
	struct misc *misc = arg;
	if(mount(misc->fd, -1, "/dev/", MBEFORE, nil) == -1){
		fprint(2, "mount: %r\n");
		exits("mount failed");
	}

}

void threadmain(int argc, char *argv[]){
	int p[2], in[2], out[2];

	if(argc < 2){
		fprint(2, "Usage: %s [srvname]\n", argv[0]);
		exits("no srvname");
	}

	pipe(p);
	close(p[0]);

	in[0] = 0;
	in[1] = p[1];
	out[0] = p[1];
	out[1] = 1;

	misc.argc = argc;
	misc.argv = argv;
	misc.fd = p[0];

	chan = chancreate(1, 1);

	threadcreate(relaythread, in, 8192);
	threadcreate(relaythread, out, 8192);


	procrfork(mountexec, &misc, 16384, 0);

	recv(chan, nil);

	threadexitsall("");
}

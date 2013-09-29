#include <u.h>
#include <libc.h>
#include <auth.h>

int main(int argc, char *argv[]){
	if(argc < 2){
		fprint(2, "Usage: %s command [arg1, arg2, ...]\n", argv[0]);
		exits("no srvname");
	}

	newns("drh", nil);

	if(mount(0, -1, "/dev/", MBEFORE, "") == -1){
		fprint(2, "mount: %r\n");
		exits("mount failed");
	}

	exec(argv[1], argv + 1);
	fprint(2, "exec: %r\n");
	exits("exec failed");

	return 0;
}

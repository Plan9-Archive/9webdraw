</$objtype/mkfile

%.$O:	%.c
	$CC $CFLAGS -c $stem.c

all:V:	srvcat proxy

srvcat:	srvcat.$O
	$LD -o srvcat $prereq

proxy:	proxy.go
	go build proxy.go

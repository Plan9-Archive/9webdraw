</$objtype/mkfile

%.$O:	%.c
	$CC $CFLAGS -c $stem.c

all:V:	runweb srvcat proxy

runweb:	runweb.$O
	$LD -o runweb $prereq

srvcat:	srvcat.$O
	$LD -o srvcat $prereq

proxy:	proxy.go
	go build proxy.go

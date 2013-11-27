</$objtype/mkfile

%.$O:	%.c
	$CC $CFLAGS -c $stem.c

all:V:	latin2js runweb srvcat proxy web/js/composetab.js

latin2js:	latin2js.$O
	$LD -o latin2js $prereq

runweb:	runweb.$O
	$LD -o runweb $prereq

srvcat:	srvcat.$O
	$LD -o srvcat $prereq

proxy:	proxy.go
	go build proxy.go

web/js/composetab.js:	latin2js /sys/src/9/port/latin1.h
	latin2js > web/js/composetab.js

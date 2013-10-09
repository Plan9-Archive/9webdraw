# Installing Go and its Websocket Package

## Go

9webdraw is known to work under Go 1.1, on both 9front and the Bell
Labs distribution.  It has not been tested on previous Go releases,
and later Go versions are, as of this writing, problematic on Plan 9.

### Installing Go 1.1

First, we need to build the Go 1.1 distribution:

    term% hget -o src/go1.1.2.src.tar.gz \
    http://go.googlecode.com/files/go1.1.2.src.tar.gz
    term% cd $home/lib
	term% tar xzf $home/src/go1.1.2.src.tar.gz
    term% cd go/src
    term% all.rc
    term% mkdir $home/lib/gopath
Then we need to add the following lines to `$home/lib/profile`:

    bind -a $home/lib/go/bin /bin
    GOPATH=$home/lib/gopath

### Installing SSL certificates needed for `go get`:

We will be adding SSL certificates to the system, which has security
implications.  Don't blindly trust me on this.

    term% hget -o /sys/lib/tls/ca.pem \
    http://curl.haxx.se/ca/cacert.pem

## Installing the Websocket package:

    term% go get code.google.com/p/go.net/websocket

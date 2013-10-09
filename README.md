# 9webdraw

9webdraw is a Web [draw(3)][man3draw] server for Plan 9, using
the HTML5 <canvas> element.

## Prerequisites
* [Plan 9][plan9], of course!
* A functioning [Go 1.1][golang] environment
    + The WebSocket Go package:
        [code.google.com/p/go.net/websocket][gows]
* A modern web browser capable of
    + Binary-mode WebSockets
    + HTML5 Canvas

I have prepared some notes on [setting up the Go environment][gopkg].
## Building
Assuming Go and its Websocket package are correctly installed,

    % mk
will produce the proxy, `proxy` and its helper programs.

## Running
The proxy has two modes of operation: it can either post a file
descriptor to `/srv` to be mounted by hand, or it can set up the
namespace for a graphical program automatically on each
connection.

In either mode, the proxy will serve HTTP on port 80.

When started with the `-srv` flag like so:

    % proxy -srv
the proxy will post a [srv(3)][man3srv] endpoint named `/srv/webdraw`.
To get useful results, manual namespace tweaking is required:

    % unmount /mnt/wsys
    % mount -b /srv/webdraw /dev
    % acme
The proxy does not do anything intelligent when its connection is
closed or when multiple sessions are open at once.  The `/srv/` file
will simply be overwritten, although this will not disturb connections
that are already open.

When started without the `-srv` flag, the proxy takes the name of and
arguments to a program to be run for each session.  If no arguments
are provided, `/games/catclock` will be run by default.  Unfortunately,
for unknown reasons an absolute path must be specified.

    % proxy /bin/acme -l acme.dump

[man3draw]: http://plan9.bell-labs.com/magic/man2html/3/draw
[man3srv]: http://plan9.bell-labs.com/magic/man2html/3/srv
[plan9]: http://plan9.bell-labs.com/plan9/
[golang]: http://golang.org/
[gows]: http://code.google.com/p/go.net/websocket
[gopkg]: src/tip/PREREQ-gopkg.md

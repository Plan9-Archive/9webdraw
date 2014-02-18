# 9webdraw

9webdraw is a Web [draw(3)][man3draw] server for Plan 9, using
the HTML5 <canvas> element.

## Prerequisites
* [Plan 9][plan9], of course!
* The [Weebsocket][weebsocket] 9P-over-WebSocket bridge.
    + Included in [9atom][9atom]
* A modern web browser supporting:
    + Binary-mode WebSockets
    + HTML5 Canvas
    + Pointer Lock

## Building

    % mk install
will install the web application to `/usr/web/9wd/`.

[man3draw]: http://plan9.bell-labs.com/magic/man2html/3/draw
[plan9]: http://plan9.bell-labs.com/plan9/
[weebsocket]: https://bitbucket.org/dhoskin/weebsocket/
[9atom]: http://9atom.org/

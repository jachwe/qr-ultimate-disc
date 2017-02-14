# qr-ultimate-disc
Generator for a ultimate frisbee disc layout including a qr code and team branding

## Dependencies
Depends on [Cairo](http://cairographics.org/) backed [Canvas](https://github.com/Automattic/node-canvas/blob/master/Readme.md) implementation for [NodeJS](http://nodejs.org).
Also following npm modules are used.

* qr-image
* optimist

## usage

Run the canvas.js with node. (*node canvas [-tscf]*)

### Options
> -s Sets the custom string on the border of the disc. Default is empty.
> -c Sets the content of the QR Code (Link, Text, Number, etc). Defaults to *http://www.parkschei.be*
> -f Sets the format. Can be *png* or *jpg*. Defaults to *png*.
> -t Specifies the output folder. Defaults to *./output*


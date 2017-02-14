var Canvas = require('canvas'),
    Image = Canvas.Image,
    qr = require('qr-image'),
    fs = require('fs'),
    argv = require('optimist')
    .default('s', "")
    .default('c', "http://www.parkschei.be")
    .default('f', 'png')
    .argv;

var args = process.argv;

var codecontent = argv.c;

var code = qr.matrix(codecontent, 'H');
var codeBlocks = code.length;
var markerWidth = 7;

var color1 = 'black';
var color2 = 'blue';
var color3 = '#f60';


var margin = 146;

var fullWidth = 2183;

var codeWidth = Math.sqrt(Math.pow(fullWidth - margin * 2, 2) * .5);
var blockWidth = codeWidth / codeBlocks;

var totalBlocks = fullWidth / blockWidth;

var raster = Math.floor(fullWidth / blockWidth);

var blockOriginXY = (raster - codeBlocks) / 2;


var canvas = new Canvas(fullWidth, fullWidth);
var ctx = canvas.getContext('2d');

var isMarker = function(x, y) {

    var markl = markerWidth;
    var markr = codeBlocks - markl - 1;
    if ((x < markl && y < markl) || (x > markr && y < markl) || (x < markl && y > markr)) {
        return true;
    } else {
        return false;
    }

}

var addDot = function(x, y) {

    var cx = x * blockWidth + blockWidth * .5;
    var cy = y * blockWidth + blockWidth * .5;
    var r = blockWidth * .5 - (Math.random() * .15) * blockWidth;
    var color = Math.random() > .5 ? 'black' : 'blue';

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

var textChars = [];
var textStartAngle = -90;
var charAngle = 4;
var maxChars = (360 / charAngle) - 1;

var addText = function(text, bold) {
    var idx = 0;
    while (idx < text.length) {
        textChars.push([text.charAt(idx), bold]);
        idx++;
    }
}

var writeText = function() {

    var radius = fullWidth / 2;
    var outer = radius - 2;
    var inner = radius - margin + margin * .5;
    var spacing = 0.082;
    var textradius = inner + (outer - inner) * .5 - 25;
    var centerXY = fullWidth / 2;
    charAngle *= Math.PI / 180;

    var font = (outer - inner) * 1.4 + 'px BPDots';

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = font;

    var angle = textStartAngle * Math.PI / 180;

    ctx.save();

    for (var idx = 0; idx < textChars.length; idx++) {
        var character = textChars[idx][0];
        var col = textChars[idx][1] || color1;
        character = character.toUpperCase();

        ctx.save();
        ctx.beginPath();
        ctx.translate(centerXY + Math.cos(angle) * textradius, centerXY - Math.sin(angle) * textradius);
        ctx.rotate(Math.PI / 2 - angle);
        ctx.fillStyle = col;
        ctx.fillText(character, 0, 0);
        ctx.restore()

        angle -= charAngle;

    }
    ctx.restore();

}

var isInCircle = function(x, y) {

    x *= blockWidth;
    y *= blockWidth;

    return Math.sqrt(Math.pow(x - fullWidth / 2, 2) + Math.pow(y - fullWidth / 2, 2)) < fullWidth / 2 - margin;
}

var addMarker = function(x, y) {

    x *= blockWidth;
    y *= blockWidth;

    var size = (markerWidth - 2) * blockWidth;

    ctx.beginPath();
    ctx.rect(x, y, blockWidth * markerWidth, blockWidth * markerWidth);
    ctx.fillStyle = 'black';
    ctx.fill();

    if (argv.f == 'jpg') {
        ctx.fillStyle = "white";
        ctx.fillRect(x + blockWidth, y + blockWidth, size, size);
    } else {
        ctx.clearRect(x + blockWidth, y + blockWidth, size, size);
    }
    

    ctx.beginPath();
    ctx.rect(x + blockWidth * 2, y + blockWidth * 2, blockWidth * 3, blockWidth * 3);
    ctx.fillStyle = 'black';
    ctx.fill();
}


if (argv.f == 'jpg') {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, fullWidth, fullWidth);
}

// CODE

for (var x = 0; x < codeBlocks; x++) {
    for (var y = 0; y < codeBlocks; y++) {

        if (!isMarker(x, y) && code[y][x] == 1) {
            addDot(x + blockOriginXY, y + blockOriginXY);

        }
    }
}

//DECO

for (var x = 0; x < totalBlocks; x++) {
    for (var y = 0; y < totalBlocks; y++) {

        var leftDeco = x + 1 < blockOriginXY;
        var rightDeco = x > totalBlocks - blockOriginXY;
        var topDeco = y + 1 < blockOriginXY;
        var bottomDeco = y > totalBlocks - blockOriginXY;

        var validY = y < blockOriginXY || y > blockOriginXY + codeBlocks;

        if ((leftDeco || rightDeco || topDeco || bottomDeco) && isInCircle(x, y) && Math.random() > .5) {
            addDot(x, y);
        }
    }
}

//MARKER

addMarker(blockOriginXY, blockOriginXY);
addMarker(blockOriginXY, blockOriginXY + codeBlocks - markerWidth);
addMarker(blockOriginXY + codeBlocks - markerWidth, blockOriginXY);






//TEXT

var customText = argv.s.length > 0 ? argv.s + " " : "";

addText("Parkscheibe ", color3);
addText("Berlin ", color2);
addText("Kreuzberg ", color1);
addText("Ultimate ", color2);
addText(customText, color3);
var oCount = maxChars - textChars.length - 9;
var fireText = "m";
for (var i = 0; i < oCount; i++) {
    fireText += "o";
}
fireText += "re fire!";
addText(fireText, color2);
writeText();


// BARCODE

// var end = -223 * Math.PI / 180;
// angle += 88 * Math.PI / 180;

// for (var rad = end; rad < angle; rad += 1 * Math.PI / 180) {

//     if (Math.random() < .25) {
//         continue;
//     }

//     var x1 = radius + Math.sin(rad) * inner;
//     var x2 = radius + Math.sin(rad) * outer;
//     var y1 = radius + Math.cos(rad) * inner;
//     var y2 = radius + Math.cos(rad) * outer;

//     ctx.beginPath();
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.lineWidth = Math.random() > .5 ? 6 : 3;
//     ctx.stroke();

// }

//EXPORT

var filename = new Buffer(codecontent).toString('base64')

if (argv.f == 'png') {


    var pngfile = fs.createWriteStream(filename + ".png"),
        stream = canvas.pngStream();

    stream.on("data", function(chunk) {
        pngfile.write(chunk);
    });
    stream.on("end", function() {
        console.log("saved png");
    });
} else if (argv.f == 'jpg') {
    var jpgfile = fs.createWriteStream(filename + '.jpg'),
        stream = canvas.jpegStream({
            bufsize: 4096,
            quality: 100,
            progressive: false // true for progressive compression, default: false
        });

    stream.on("data", function(chunk) {
        jpgfile.write(chunk);
    });
    stream.on("end", function() {
        console.log("saved jpg");
    });
}

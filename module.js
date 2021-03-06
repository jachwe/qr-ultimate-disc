function qrdisc() {

    var Canvas = require('canvas');
    var deasync = require('deasync');
    var Image = Canvas.Image;
    var qr = require('qr-image');
    var fs = require('fs');
    var mkdirp = require('mkdirp');

    this.text = '';
    this.code = 'http://www.parkschei.be';
    this.format = 'pdf';
    this.target = './output/';
    this.color = 'blue';
    this.filename = Date.now() + "_" + Math.round(Math.random() * 9999);
    this.size = 524;

    var busy = false;
    var _cb = null;
    var _fileName = "";

    var colors = {
        yellow: "#DA7100",
        red: "#7E0B27",
        blue: "#2980b9"
    }

    var canvas = null
    var ctx = null;

    this.exportFile = function(callback) {

        _fileName = this.filename;

        if (!fs.existsSync(this.target)) {
            mkdirp.sync(this.target);
        }

        if (this.target[this.target.length - 1] != '/') {
            this.target += '/';
        }


        if (callback && typeof(callback) == 'function') {
            this.callback = callback;
        }

        _cb = callback;

        var cb = function() {
            busy = false;

            if (_cb && typeof(_cb) == 'function') {
                _cb(_fileName);
            }
        }

        var path = this.target + this.filename + '.' + this.format;

        if (this.format == 'png') {


            var pngfile = fs.createWriteStream(path),
                stream = canvas.pngStream();

            stream.on("data", function(chunk) {
                pngfile.write(chunk);
            });
            stream.on("end", cb);

        } else if (this.format == 'jpg') {
            var jpgfile = fs.createWriteStream(path),
                stream = canvas.jpegStream({
                    bufsize: 4096,
                    quality: 100
                });

            stream.on("data", function(chunk) {
                jpgfile.write(chunk);
            });
            stream.on("end", cb);

        } else if (this.format == 'pdf' || this.format == 'svg') {

            fs.writeFile(path, canvas.toBuffer(), cb);
        }
    }

    this.make = function(callback) {

        var codecontent = this.code;

        while (codecontent.length < 80) {
            codecontent += " ";
        }

        var color1 = 'black';
        var color2 = colors[this.color] || this.color;

        var markerWidth = 7;
        var fullWidth = this.size;
        var margin = fullWidth * .04;

        var radius = fullWidth / 2;
        var outer = radius - fullWidth / 1750;
        var textradius = outer - margin;
        var inner = textradius - margin * .75;
        var centerXY = fullWidth / 2;


        if (this.format == 'pdf') {
            canvas = new Canvas(fullWidth, fullWidth, 'pdf');
        } else if (this.format == 'svg') {
            canvas = new Canvas(fullWidth, fullWidth, 'svg');
        } else {
            canvas = new Canvas(fullWidth, fullWidth);
        }

        ctx = canvas.getContext('2d');

        var code = qr.matrix(codecontent, 'L');
        var codeBlocks = code.length;
        var codeWidth = Math.sqrt(Math.pow(inner * 2, 2) * .5);
        var blockWidth = codeWidth / codeBlocks;

        var totalBlocks = fullWidth / blockWidth;

        var raster = fullWidth / blockWidth;
        var blockOriginXY = (raster - codeBlocks) / 2;

        var format = this.format;


        var addDot = function(x, y) {

            var variance = .18;

            var cx = x * blockWidth + blockWidth * .5;
            var cy = y * blockWidth + blockWidth * .5;
            var r = blockWidth * .5 - (Math.random() * variance) * blockWidth;
            var color = Math.random() > .5 ? color1 : color2;

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        }


        var addText = function(text, bold) {
            var idx = 0;
            while (idx < text.length) {
                textChars.push([text.charAt(idx), bold]);
                idx++;
            }
        }

        var isInCircle = function(x, y) {

            x *= blockWidth;
            y *= blockWidth;

            x += blockWidth * .5;
            y += blockWidth * .5;

            return Math.sqrt(Math.pow(x - fullWidth / 2, 2) + Math.pow(y - fullWidth / 2, 2)) < fullWidth / 2 - (radius - inner);
        }

        var addMarker = function(x, y) {

            x *= blockWidth;
            y *= blockWidth;

            var size = (markerWidth - 2) * blockWidth;

            ctx.beginPath();
            ctx.rect(x, y, blockWidth * markerWidth, blockWidth);
            ctx.rect(x, y, blockWidth, blockWidth * markerWidth);
            ctx.rect(x, y + blockWidth * (markerWidth - 1), blockWidth * markerWidth, blockWidth);
            ctx.rect(x + blockWidth * (markerWidth - 1), y, blockWidth, blockWidth * markerWidth);
            ctx.rect(x + blockWidth * 2, y + blockWidth * 2, blockWidth * 3, blockWidth * 3);
            ctx.fillStyle = color1;
            ctx.fill();

        }

        if (this.format == 'jpg') {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, fullWidth, fullWidth);
        }

        // CODE

        var markl = markerWidth;
        var markr = codeBlocks - markl - 1;

        for (var x = 0; x < codeBlocks; x++) {
            for (var y = 0; y < codeBlocks; y++) {

                var isMarker = (x < markl && y < markl) || (x > markr && y < markl) || (x < markl && y > markr);

                if (code[y][x] == 1 && !isMarker) {
                    addDot(x + blockOriginXY, y + blockOriginXY);

                }
            }
        }

        //DECO

            //LEFT

        for( var x = blockOriginXY - 2; x >= 0; x-- ){
            for (var y = 0; y < raster; y++){
               if(isInCircle(x, y) && Math.random() > .5) {
                    addDot(x, y);
               }
            }
        }

            //Right

        for( var x = blockOriginXY + codeBlocks + 1; x <= raster; x++ ){
            for (var y = 0; y < fullWidth; y++){
               if(isInCircle(x, y) && Math.random() > .5) {
                    addDot(x, y);
               }
            }
        }

             //TOP

        for( var x = 0; x <= raster; x++ ){
            for (var y = blockOriginXY - 2; y >=0; y--){
               if(isInCircle(x, y) && Math.random() > .5) {
                    addDot(x, y);
               }
            }
        }

             //Bottom

        for( var x = 0; x <= raster; x++ ){
            for (var y = blockOriginXY + codeBlocks + 1; y <= raster; y++){
               if(isInCircle(x, y) && Math.random() > .5) {
                    addDot(x, y);
               }
            }
        }

        // for (var x = 0; x < totalBlocks; x++) {
        //     for (var y = 0; y < totalBlocks; y++) {

        //         var leftDeco = x + 1 < blockOriginXY;
        //         var rightDeco = x - 1 > totalBlocks - blockOriginXY;
        //         var topDeco = y + 1 < blockOriginXY;
        //         var bottomDeco = y - 1 > totalBlocks - blockOriginXY;

        //         if ((leftDeco || rightDeco || topDeco || bottomDeco) && isInCircle(x, y) && Math.random() > .5) {
        //             addDot(x, y);
        //         }
        //     }
        // }

        //MARKER

        addMarker(blockOriginXY, blockOriginXY);
        addMarker(blockOriginXY, blockOriginXY + codeBlocks - markerWidth);
        addMarker(blockOriginXY + codeBlocks - markerWidth, blockOriginXY);

        //TEXT

        var textChars = [];
        var customText = this.text.substring(0, 50);
        addText(customText, color2);
        addText(" Parkscheibe Berlin Kreuzberg Ultimate ", color1);

        var fontSize = (outer - textradius);
        var font = fontSize + 'px BPDots';

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        ctx.font = font;

        var perimeter = textradius * 2 * Math.PI;
        var charWidth = ctx.measureText("M").width;

        var maxChars = perimeter / (charWidth * 1.1);
        var charAngle = (360 / maxChars) * Math.PI / 180;
        var customTextLength = customText.length;
        var textStartAngle = (customTextLength * charAngle) * .5;

        var angle = textStartAngle - 45 * Math.PI / 180;

        var oCount = maxChars - textChars.length - 9;

        var fireText = "m";
        for (var i = 0; i < oCount; i++) {
            fireText += "o";
        }
        fireText += "re fire ";
        addText(fireText, color1);

        ctx.save();

        for (var idx = 0; idx < textChars.length; idx++) {

            var character = textChars[idx][0];
            var col = textChars[idx][1] || color1;
            if (character != "ß") {
                character = character.toUpperCase();
            }
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


        this.exportFile(callback);
    }

    this.makeSync = function() {
        this.make();
        busy = true;
        while (busy) {
            require('deasync').sleep(50);
        }
        return _fileName;
    }


}


module.exports = qrdisc;

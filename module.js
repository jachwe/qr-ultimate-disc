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
    this.size = 2185;

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
        var margin = fullWidth / 15;


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
        var codeWidth = Math.sqrt(Math.pow(fullWidth - margin * 2, 2) * .5);
        var blockWidth = codeWidth / codeBlocks;

        var totalBlocks = fullWidth / blockWidth;

        var raster = Math.floor(fullWidth / blockWidth);
        var blockOriginXY = (raster - codeBlocks) / 2;

        var format = this.format;

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

        var writeText = function() {

            var radius = fullWidth / 2;
            var outer = radius - 2;
            var inner = radius - margin + margin * .5;
            var textradius = inner + (outer - inner) * .5 - 25;
            var centerXY = fullWidth / 2;
            charAngle *= Math.PI / 180;

            var font = (outer - inner) * 1.3 + 'px BPDots';

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.font = font;

            var angle = textStartAngle * Math.PI / 180;

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

        }

        var isInCircle = function(x, y) {

            x *= blockWidth;
            y *= blockWidth;

            x += blockWidth * .5;
            y += blockWidth * .5;

            return Math.sqrt(Math.pow(x - fullWidth / 2, 2) + Math.pow(y - fullWidth / 2, 2)) < fullWidth / 2 - margin;
        }

        var addMarker = function(x, y) {

            x *= blockWidth;
            y *= blockWidth;

            var size = (markerWidth - 2) * blockWidth;

            ctx.beginPath();
            ctx.rect(x, y, blockWidth * markerWidth, blockWidth * markerWidth);
            ctx.fillStyle = color1;
            ctx.fill();

            if (format == 'jpg' || format == 'pdf') {
                ctx.fillStyle = "white";
                ctx.fillRect(x + blockWidth, y + blockWidth, size, size);
            } else {
                ctx.clearRect(x + blockWidth, y + blockWidth, size, size);
            }


            ctx.beginPath();
            ctx.rect(x + blockWidth * 2, y + blockWidth * 2, blockWidth * 3, blockWidth * 3);
            ctx.fillStyle = color1;
            ctx.fill();
        }

        if (this.format == 'jpg') {
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

        var customText = this.text.length > 0 ? this.text : "";
        customText = customText.substring(0, 50);
        customText += " ";

        var charAngle = 3.5;
        var textStartAngle = (customText.length / 2) * charAngle - 45;
        var textChars = [];
        var maxChars = (360 / charAngle);

        addText(customText, color2);
        addText("Parkscheibe ", color1);
        addText("Berlin ", color1);
        addText("Kreuzberg ", color1);
        addText("Ultimate ", color1);
        var oCount = maxChars - textChars.length - 9;
        var fireText = "m";
        for (var i = 0; i < oCount; i++) {
            fireText += "o";
        }
        fireText += "re fire";
        addText(fireText, color1);
        writeText();

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

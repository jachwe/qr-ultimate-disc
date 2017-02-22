var parse = require('csv-parse/lib/sync'),
    fs = require('fs'),
    QRDisc = require('./module.js'),
    argv = require('optimist')
    .demand(['i'])
    .default('o', './output')
    .default('f', 'pdf')
    .argv;

var input = fs.readFileSync(argv.i);

var records = parse(input, {
    columns: ['time', 'email', 'name', 'team', 'code', 'text', 'count', 'color'],
    relax_column_count: true
});
var c = 0;
var time = Date.now();
var total = 0;

for (var i = 1; i < records.length; i++) {
    var r = records[i];

    if (r.color.length < 1) {
        r.color = blue;
    }

    r.color = r.color.replace("Schwarz-Gelb", "yellow");
    r.color = r.color.replace("Schwarz-Rot", "red");
    r.color = r.color.replace("Schwarz-Blau", "blue");

    var color = r.color;
    var text = r.text;
    var code = r.code;

    for (var x = 0; x < r.count; x++) {
        var disc = new QRDisc();
        disc.text = text;
        disc.color = color;
        disc.code = code;
        disc.format = argv.f;
        disc.target = argv.o;

        disc.makeSync();
        var now = Date.now();
        var delta = now - time;
        total += delta;
        time = now;

        console.log("saved #" + (++c) + " in " + delta + "ms");
    }

}

console.log("\nJob finsished in "+ total +"ms");

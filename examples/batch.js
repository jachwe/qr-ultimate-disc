var parse = require('csv-parse/lib/sync'),
    fs = require('fs'),
    QRDisc = require('../module.js'),
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

var invoice = {};

for (var i = 1; i < records.length; i++) {
    var r = records[i];

    if (r.color.length < 1) {
        r.color = blue;
    }

    if( !invoice[r.email] ){
        invoice[r.email] = {};
        invoice[r.email].name = r.name;
        invoice[r.email].total = 0;
        invoice[r.email].discount = 0;
    }

    r.color = r.color.replace("Schwarz-Gelb", "yellow");
    r.color = r.color.replace("Schwarz-Rot", "red");
    r.color = r.color.replace("Schwarz-Blau", "blue");

    var color = r.color;
    var text = r.text.length > 0 ? r.text : 'http://www.parkschei.be';
    var code = r.code.length > 0 ? r.code : 'http://www.parkschei.be';

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

        invoice[r.email].total++;
        if( r.time.substring(0,2) <= 19 ){
            invoice[r.email].discount++;
        }

        console.log("saved #" + (++c) + " in " + delta + "ms");
    }

}

console.log("\nJob finsished in "+ total +"ms");

var invtext = "";
var mails = Object.keys(invoice);
for( var i = 0; i < mails.length; i++ ){
    var mail = mails[i];
    var row = invoice[mail];
    var fullPrice = row.total - row.discount;
    var pay = fullPrice * 10 + row.discount * 8;
    invtext += mail + "," + row.name + "," + fullPrice + "," + row.discount + "," + row.total + "," + pay +"\n";
}

fs.writeFileSync(argv.o + "/summary.csv",invtext)
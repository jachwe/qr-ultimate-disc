var parse = require('csv-parse/lib/sync'),
    fs = require('fs'),
    childProcess = require('child_process');
argv = require('optimist')
    .default('f', './data.csv')
    .default('o', './output')
    .argv;

var input = fs.readFileSync(argv.f);

var records = parse(input, {
    columns: ['time', 'email', 'name', 'team', 'code', 'text', 'count', 'color'],
    relax_column_count: true
});
var c = 0;

for (var i = 1; i < records.length; i++) {
    var r = records[i];

    if (r.color.length < 1) {
        r.color = blue;
    }

    r.color = r.color.replace("Schwarz-Gelb", "yellow");
    r.color = r.color.replace("Schwarz-Rot", "red");
    r.color = r.color.replace("Schwarz-Blau", "blue");

    r.text = r.text.replace("ß","ß ")


    var cmd = 'node canvas.js';
    cmd += ' -s "' + r.text + '"';

    if (r.code.length > 0) {
        cmd += ' -c "' + r.code + '"';
    }

    cmd += ' -t "' + argv.o + '"';
    cmd += ' --color "' + r.color + '"';

    for (var x = 0; x < r.count; x++) {
        childProcess.execSync(cmd);
        console.log("saved #" + c);
        c++;
    }

}

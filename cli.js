var QRDisc = require('./module.js'),
    argv = require('optimist')
    .string('s')
    .default('s', "")
    .string('c')
    .default('c', "http://www.parkschei.be")
    .default('f', 'pdf')
    .default('out', './output/')
    .string('color')
    .default('color', 'blue')
    .default('size', 5024)
    .argv;

var disc = new QRDisc();
disc.text = argv.s;
disc.code = argv.c;
disc.color = argv.color;
disc.size = parseInt(argv.size,10);
disc.format = argv.f;
disc.target = argv.out

if (argv.n) {
    disc.filename = argv.n;
}

disc.make();

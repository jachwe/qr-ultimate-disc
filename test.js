var qr = require('./module.js');

var d = new qr();
d.text = "TEST YOUR CODE";
d.code = 'http://www.fotos-top.com/items/shakira-4685.jpg';
d.color = 'red';
d.size = 1000;
d.format = 'png';
d.target = './test/rest'
d.filename = "test";

var out = d.makeSync();
console.log("saved sync " + out);

d.make(function(f) {
    console.log("saved async " + f);
});

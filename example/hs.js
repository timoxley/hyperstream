var hyperstream = require('hyperstream');
var fs = require('fs');

var hs = hyperstream({
    '#a': fs.createReadStream(__dirname + '/a.html'),
    '#b': fs.createReadStream(__dirname + '/b.html')
});
var rs = fs.createReadStream(__dirname + '/index.html');
rs.pipe(hs).pipe(process.stdout);

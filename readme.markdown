# hyperstream

stream html into html at a css selector

# example

``` js
var hyperstream = require('hyperstream');
var fs = require('fs');

var hs = hyperstream({
    '#a': fs.createReadStream(__dirname + '/a.html'),
    '#b': fs.createReadStream(__dirname + '/b.html')
});
var rs = fs.createReadStream(__dirname + '/index.html');
rs.pipe(hs).pipe(process.stdout);
```

```
$ node example/hs.js
<html>
  <body>
    <div id="a"><h1>a!!!</h1></div>
    <div id="b"><b>bbbbbbbbbbbbbbbbbbbbbb</b></div>
  </body>
</html>
```


# hyperstream

stream html into html at a css selector

[![build status](https://secure.travis-ci.org/substack/hyperstream.png)](http://travis-ci.org/substack/hyperstream)

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

# methods

``` js
var hyperstream = require('hyperstream')
```

## hyperstream(streamMap)

Return a duplex stream that takes an html stream as input and produces an html
stream as output, inserting the streams given by `streamMap` at the css selector
keys.

# install

With [npm](https://npmjs.org) do:

```
npm install hyperstream
```

# license

MIT

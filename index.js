var trumpet = require('trumpet');
var through = require('through');
var duplexer = require('duplexer');
var resumer = require('resumer');

var upto = require('./lib/upto');

module.exports = function (streamMap) {
    if (!streamMap) streamMap = {};
    
    var tr = trumpet();
    var output = upto();
    //var dup = duplexer(tr, output);
    tr.pipe(output);
    var dup = through(
        function (buf) {
            tr.write(buf);
        },
        function () {
            tr.end();
        }
    );
    output.pipe(through(
        function (buf) { dup.queue(buf) },
        function () { dup.queue(null) }
    ));
    
    tr.on('data', function () {});
    tr.on('end', function () {
        if (!active && stack.length === 0) output.to(-1);
    });
    
    var streams = Object.keys(streamMap).reduce(function (acc, key) {
        var sm = streamMap[key];
        if (sm && typeof sm === 'object') {
            var stream = sm.pipe(through());
            acc[key] = stream.pause();
        }
        if (typeof sm === 'function') {
        }
        if (!sm || typeof sm !== 'object' && typeof sm !== 'function') {
            var stream = through();
            acc[key] = stream.pause();
            stream.queue(String(sm));
            stream.queue(null);
        }
        
        return acc;
    }, {});
    
    var active = false;
    var stack = [];
    
    Object.keys(streamMap).forEach(function (key) {
        tr.select(key, function (node) {
            if (typeof streamMap[key] === 'function') {
                node.update(streamMap[key]);
            }
            else {
                onupdate(tr.parser.position);
            }
        });
        
        function onupdate (pos) {
            if (active) return stack.push(function () { onupdate(pos) });
            
            streams[key].pipe(through(
                function (buf) { output.queue(buf) },
                function () {
                    active = false;
                    if (stack.length) {
                        stack.shift()()
                    }
                    else output.to(-1)
                }
            ));
            active = true;
            
            output.to(pos);
            process.nextTick(function () {
                streams[key].resume();
            });
        }
    });
    
    dup.select = tr.select.bind(tr);
    dup.update = tr.update.bind(tr);
    dup.remove = tr.remove.bind(tr);
    dup.replace = tr.replace.bind(tr);
    
    return dup;
};

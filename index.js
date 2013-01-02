var trumpet = require('trumpet');
var pause = require('pause-stream');
var duplexer = require('duplexer');
var concatStream = require('concat-stream');

var upto = require('./lib/upto');

module.exports = function (streamMap) {
    var tr = trumpet();
    var output = tr.pipe(upto());
    
    var streams = Object.keys(streamMap).reduce(function (acc, key) {
        var stream = streamMap[key].pipe(pause());
        acc[key] = stream.pause();
        return acc;
    }, {});
    
    var active = false;
    var stack = [];
    
    Object.keys(streamMap).forEach(function (key) {
        tr.select(key, function () {
            onupdate(tr.parser.position);
        });
        
        function onupdate (pos) {
            if (active) return stack.push(function () { onupdate(pos) });
            
            streams[key].on('data', function (buf) {
                output.emit('data', buf);
            });
            
            streams[key].on('end', function (buf) {
                active = false;
                if (stack.length) {
                    stack.shift()()
                }
                else output.to(-1)
            });
            
            active = true;
            
            output.to(pos);
            process.nextTick(function () {
                streams[key].resume();
            });
        }
    });
    
    return duplexer(tr, output);
};

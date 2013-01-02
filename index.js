var trumpet = require('trumpet');
var through = require('through');
var pause = require('pause-stream');
var duplexer = require('duplexer');
var concatStream = require('concat-stream');

module.exports = function (streamMap) {
    var tr = trumpet();
    var output = tr.pipe(through(null, end)).pipe(pause());
    
    function end () {
        this.emit('end');
    }
    
    var streams = Object.keys(streamMap).reduce(function (acc, key) {
        var stream = streamMap[key].pipe(pause());
        acc[key] = stream.pause();
        return acc;
    }, {});
    
    Object.keys(streamMap).forEach(function (key) {
        tr.update(key, function (node) {
            streams[key].on('data', function (buf) {
                output.emit('data', buf);
            });
            streams[key].on('end', function (buf) {
                output.resume();
            });
            streams[key].resume();
            
            process.nextTick(function () {
                output.pause();
            });
            
            return '';
        });
    });
    
    return duplexer(tr, output);
};

var trumpet = require('trumpet');
var pause = require('pause-stream');
var duplexer = require('duplexer');

var upto = require('./lib/upto');

module.exports = function (streamMap) {
    if (!streamMap) streamMap = {};
    
    var tr = trumpet();
    var output = tr.pipe(upto());
    tr.on('end', function () {
        if (!active && stack.length === 0) output.to(-1);
    });
    
    var streams = Object.keys(streamMap).reduce(function (acc, key) {
        if (streamMap[key] && typeof streamMap[key] === 'object') {
            var stream = streamMap[key].pipe(pause());
            acc[key] = stream.pause();
        }
        return acc;
    }, {});
    
    var active = false;
    var stack = [];
    
    Object.keys(streamMap).forEach(function (key) {
        if (typeof streamMap[key] === 'function') {
            return tr.update(key, streamMap[key]);
        }
        if (!streamMap[key] || typeof streamMap[key] !== 'object') {
            return tr.update(key, String(streamMap[key]));
        }
        
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
    
    var dup = duplexer(tr, output);
    dup.select = tr.select.bind(tr);
    dup.update = tr.update.bind(tr);
    dup.remove = tr.remove.bind(tr);
    dup.replace = tr.replace.bind(tr);
    return dup;
};

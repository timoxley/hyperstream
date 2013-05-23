var through = require('through');

module.exports = function () {
    var buffer = [];
    var to = 0;
    var bytes = 0;
    var caughtEnd = false;
    
    var tr = through(write, end);
    
    tr.to = function (n) {
        if (n < 0) {
            for (var i = 0; i < buffer.length; i++) {
                if (buffer[i].length) tr.queue(buffer[i]);
            }
            buffer.splice(0);
            if (caughtEnd) tr.queue(null);
            return;
        }
        
        to = n;
        
        for (var i = 0; i < buffer.length && bytes < to; i++) {
            var buf = buffer[i];
            
            if (bytes + buf.length <= to) {
                bytes += buf.length;
                if (buffer[i].length) tr.queue(buffer[i]);
            }
            else {
                bytes = to;
                var b = buf.slice(0, buf.length - to + bytes);
                if (b.length) tr.queue(b);
                buffer.splice(0, i + 1, buf.slice(buf.length - to + bytes));
                return;
            }
        }
        
        buffer.splice(0, i);
    };
    
    return tr;
    
    function write (buf) {
        if (bytes >= to) buffer.push(buf);
        else if (bytes + buf.length > to) {
            bytes = to;
            var b = buf.slice(0, buf.length - to + bytes);
            if (b.length) tr.queue(b);
            buffer.push(buf.slice(buf.length - to + bytes));
        }
        else {
            bytes += buf.length;
            if (buf.length) tr.queue(buf);
        }
    }
    
    function end () {
        caughtEnd = true;
        if (to < 0) tr.queue(null);
    }
};

var test = require('tap').test;
var concat = require('concat-stream');
var through = require('through');
var hyperstream = require('../');

test('glue html streams from disk', function (t) {
    t.plan(1);
    
    var hs = hyperstream({
        '.a': Array(11).join('THEBEST'),
        '.b': Array(11).join('THEBEST')
    });
    var rs = through();
    rs.pipe(hs).pipe(concat(function (err, src) {
        t.equal(src, [
            '<div class="a">' + Array(11).join('THEBEST') + '</div>',
            '<div class="b">' + Array(11).join('THEBEST') + '</div>'
        ].join(''));
    }));;
    rs.queue('<div class="a"></div><div class="b"></div>');
    rs.queue(null);
});

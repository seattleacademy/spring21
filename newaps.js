// based on https://github.com/maxogden/iwlist/

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

module.exports = function (iface) {
    return new IW(iface);
};

function IW (iface) {
    if (!(this instanceof IW)) return new IW();
}

IW.prototype.scan = function (cb) {
    var ps = spawn('iwlist', ['scan']);
    
    var line = '';
    ps.stdout.on('data', function ondata (buf) {
        for (var i = 0; i < buf.length; i++) {
            if (buf[i] === 10) {
                parseLine(line);
                line = '';
            }
            else line += String.fromCharCode(buf[i]);
        }
    });
    
    var stderr = '';
    ps.stderr.on('data', function (buf) { stderr += buf });
    
    ps.on('close', function () {
        if (code !== 0) return cb('code = ' + code + '\n', stderr);
        ap.sort(function(a, b) {
            var x = a['signal']; var y = b['signal'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }).reverse();

        var apWithSSID = [];
        for (i = 0; i < ap.length; i++) {
            if (ap[i].essid) {
                //console.log(ap[i].essid);
                apWithSSID.push(ap[i]);
            }
            //console.log(apWithSSID);
        }

        cb(null, apWithSSID);
    });
    
    var code;
    ps.on('exit', function (c) {
        code = c;
    });
    
    var ap = []
    var current = null;
    function parseLine (line) {
        var m;
        
        if (m = /^\s+Cell \d+ - Address: (\S+)/.exec(line)) {
            current = { address : m[1] };
            ap.push(current);
            return;
        }
        if (!current) return;
        
        if (m = /^\s+ESSID:"(.+)"/.exec(line)) {
            current.essid = m[1];
        }
        if (m = /Channel(.+)\)/.exec(line)) {
            current.channel = +m[1];
        }
        //not all devices present channel in same way
        if (m = /Channel:(.+)/.exec(line)) {
            current.channel = +m[1];
        }
        if (m = /Quality=(.+?)\//.exec(line)) {
          current.quality = +m[1]
        }
        if (m = /Signal level=(.+?)\//.exec(line)) {
          current.signal = +m[1]
        } else {
        if (m = /Signal level=(.+\d)/.exec(line)) {
            qualitydBm = +m[1];
            //http://stackoverflow.com/questions/15797920/how-to-convert-wifi-signal-strength-from-quality-percent-to-rssi-dbm
            current.signal = Math.min(Math.max(2 * (qualitydBm + 100), 0), 100);
            //Such devices give quality as a fraction of 70.  Convert to percentage.
            current.quality = Math.round(current.quality * 100 / 70);
        }
        }
    }

};
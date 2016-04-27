var express = require('express');
var app = express();
var iw = require('./newaps')();
iw.scan(scanresults);
var scanfinalresults;
var counter = 1;

var Compass = require('./Compass');
var compass = new Compass(1);

function scanresults(err, results) {
    if (err) {
        console.log("err", err);
    } else {
        aps = [];
        for (i = 0; i < results.length; i++) {
            ap = results[i].address + ',' + results[i].essid + ',' + results[i].signal +
                ',' + results[i].quality + ',' + results[i].channel;
            aps.push(ap);
        }
        //console.log(aps.join("\n"));
        console.log(counter++);
        scanfinalresults = aps.join("\r")
    }
}
app.use(express.static('snap'));

app.get('/aps', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    iw.scan(scanresults);
    res.send(scanfinalresults);
});

app.get('/heading', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    compass.getHeading('x', 'y', function(err, heading) {
        //heading = 254.33443;
        headingDegrees = heading * 180 / Math.PI;
        console.log(headingDegrees.toFixed(0).toString());
        res.send(headingDegrees.toFixed(0).toString());
    });

});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

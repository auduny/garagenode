var express = require('express');
var router = express.Router();
var state = {state: "unknown", timestamp: 0};
var request = require('request');
var config = require('../config.json');
var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");
var moment = require('moment');
var syslog = require('modern-syslog');
var cameralock = 0;

// Page
router.post('/', function (req, res) {
    res.setHeader('Cache-Control', 'private, max-age=0');
    request.post({
        url: config.basepath + '/api/v1/trigger',
        headers: {"Authorization": auth}
    }, function (err, resp, body) {
        console.log(err, resp);
        state.updatedsince = moment(state.timestamp).fromNow();
        console.log(state);
        res.render('garage', {title: 'Garage', state: state});
    });
});

router.all('/', function (req, res) {
    res.set('Cache-Control', 'private, max-age=0');
    state.updatedsince = moment(state.timestamp).fromNow();
    res.render('garage', {title: 'Garage', state: state});
});


router.all('/api/v1/state:format?', function (req, res) {
    console.log(req.body);
    res.setHeader('Cache-Control', 'private, max-age=0');
    if (req.method == "POST") {
        state.state = req.body.state;
        state.timestamp = Date.now();
        syslog.note("Sensor says: " + state.state)
    }
    state.updated = moment(state.timestamp).format();
    state.updatedsince = moment(state.timestamp).fromNow();

    if (req.params.format == '.json') {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(state, null, 3));
    } else {
        res.send(state.state);
    }
});

router.all('/api/v1/snapshot:format?', function (req, res) {
    res.set('Cache-Control', 'private, max-age=0');
    if (cameralock) {
        res.sendfile("public/img/snapshot.jpg");
    } else {
        cameralock=1;
        var exec = require('child_process').exec;
        exec('raspistill -t 500 -w 800 -h 600 -o public/img/snapshot.jpg -rot 180', function (error, stdout, stderr) {
            if (error) {
                res.sendfile("public/img/404.jpg");
            } else {
                res.sendfile("public/img/snapshot.jpg");
            }
        });
        cameralock=0;
    }
});

router.post('/api/v1/trigger:format?', function (req, res) {
    var gpio = require('pi-gpio');
    res.setHeader('Content-Type', 'application/json');
    syslog.warn("Garagedoor is triggered");
    gpio.open(12, 'output', function (err) {
        gpio.write(12, 1, function (err) {
            if (!err) {
                setTimeout(function () {
                    gpio.write(12, 0, function () {
                        gpio.close(12);
                        res.send(JSON.stringify(state, null, 3));
                    })
                }, 1000);
            }
        });
    });
});


module.exports = router;

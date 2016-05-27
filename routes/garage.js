var express = require('express');
var router = express.Router();
var state = {state: "-", lastUpdated: "-" };
var request = require('request');
var config = require('../config.json');
var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");

// Page
router.post('/',  function(req, res) {
	request.post({url: config.basepath + '/api/v1/trigger', headers: { "Authorization": auth}}, function (err,resp,body) {
		console.log(err, resp);
		res.render('garage', { title: 'Garage', state: state });
	});
});

router.all('/',  function(req, res) {
	res.render('garage', { title: 'Garage', state: state });
});


// API


router.all('/api/v1/state:format?', function(req,res) {
	console.log(req.body);
	res.setHeader('Cache-Control', 'private, max-age=0');
	if (req.method == "POST") {
		consle.log(req.method + " is used");
		state.state = req.body.state;
		state.lastUpdated = Date.now();

	}
	if (req.params.format == '.json') {
		res.send(JSON.stringify(state));
	} else {
		res.send(state.state);
	}
});

router.all('/api/v0/snapshot:format?', function(req,res) {
	res.setHeader('Cache-Control', 'private, max-age=0');
	var exec = require('child_process').exec;
	exec('raspistill -t 1000 -w 800 -h 600 -o public/img/snapshot.jpg -rot 180', function (error,stdout,stderr) {
		if (error) {
			res.sendfile("public/img/404.jpg");
		} else {
			res.sendfile("public/img/snapshot.jpg");
		}
	});
});

router.post('/trigger',  function(req, res) {
	res.send('Garage is clicking');
	var gpio = require('pi-gpio');
	gpio.open(12,'output', function(err) {
		gpio.write(12,1, function(err) {
			setTimeout(function() { gpio.write(12,0, function() {
				gpio.close(12)
			})	}, 1000);
		});
	});
});

router.post('/api/v1/trigger:format?',  function(req, res) {
	var gpio = require('pi-gpio');
	gpio.open(12,'output', function(err) {
		gpio.write(12,1, function(err) {
			if(!err) {
				setTimeout(function() { gpio.write(12,0, function() {
					gpio.close(12);
					res.send('Garage is clicking');
				})	}, 1000);
			}
		});
	});
});


module.exports = router;

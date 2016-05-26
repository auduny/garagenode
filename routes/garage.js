var express = require('express');
var router = express.Router();
var state = {state: "unknown", lastUpdated: "unknown" };

// Page
router.get('/',  function(req, res) {
  res.render('garage', { title: 'Garage' });
	});

// API


router.all('/api/v1/state:format?', function(req,res) {
	res.setHeader('Cache-Control', 'private, max-age=0');
	if (req.params.format == '.json') {
		res.send(JSON.stringify(state));
	} else {
		res.send(state.state);
	}
});

router.all('/api/v1/snapshot:format?', function(req,res) {
	res.setHeader('Cache-Control', 'private, max-age=0');
	var exec = require('child_process').exec;
	exec('raspistill -t 1500 -w 800 -h 600 -o public/img/snapshot.jpg -rot 180', function (error,stdout,stderr) {
		if (error) {
			res.send("I has issues");
		} else {
			res.sendfile("public/img/snapshot.jpg");
		}
	});
});

router.post('/state', function(req,res) {
  console.log(req.body);
	state = req.body.state;
  res.send("New state is: " + state);
})

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

router.all('/api/v1/trigger',  function(req, res) {
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

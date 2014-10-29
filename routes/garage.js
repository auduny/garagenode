var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('garage', { title: 'Garage' });
	});

router.get('/snapshot', function(req,res) {
	var RaspiCam = require('raspicam');
	var cam = new RaspiCam({ mode: "photo", output: "public/snapshot.jpg" });
	cam.start();
	res.send('Taking snapshot');
});

router.get('/trigger', function(req, res) {
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


module.exports = router;

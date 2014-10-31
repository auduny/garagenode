var express = require('express');
var router = express.Router();
//
// Foobar
router.get('/', function(req, res) {
  res.render('garage', { title: 'Garage' });
	});

router.post('/snapshot', function(req,res) {
	var RaspiCam = require('raspicam');
	var cam = new RaspiCam({ mode: "photo", output: "public/img/snapshot.jpg", vf:true, hf:true });
	cam.on("read", function(err, filename) {
		console.log("This happend");
		//res.send('Snapshot saved at foo ' + filename)
	});
	cam.on("exit", function(timestamp) {
		console.log("that happend");
		res.send('Snapshot saved ' + timestamp)
	});
	cam.on("start", function() {
		console.log("whaddafuck");
	});
	cam.start();

});

router.post('/trigger', function(req, res) {
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

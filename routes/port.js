var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	var gpio = require('pi-gpio');
  res.send('respond with a resource');
	gpio.open(12,'output', function(err) {
		gpio.write(12,1, function() {
			setTimeout(function() { gpio.write(12,0, function() {
		 		gpio.close(12)
			})	}, 1000);

		});
	});
});

module.exports = router;

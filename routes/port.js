var express = require('express');
var router = express.Router();
var gpio = require('pi-gpio');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
	gpio.open(12,'output', function(err) {
		gpio.write(12,1, function() {
			gpio.close(12);
		});
	});
});

module.exports = router;

var express = require('express');
var app = express();
var request = require('request');

app.get('/', function (req, res) {
   res.send('Hello World');
})

app.get('/hazards', function (req, res) {
	var hazards;
	request('http://data.livetraffic.com/traffic/hazards/roadwork.json', 
			function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        console.log(body); // Show the HTML for the Modulus homepage.
	        hazards = body;
	        res.send(hazards);
	    } else {
	    	res.send('Fuck all Hazards Cunt!');
	    }
	});
   
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
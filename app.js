var express = require('express');
var app = express();
var request = require('request');

app.get('/', function (req, res) {
   res.send('Hello World');
})

getCoordinates = function(data) {
	var coords, json, features;

	json = JSON.parse(data);

	features = json['features'];

	for (var i = 0; i < features.length; i++ ) {
		coords += features[i]['geometry']['coordinates']
	}

	return coords;
}

app.get('/hazards', function (req, res) {
	// var hazards;
	request('http://data.livetraffic.com/traffic/hazards/roadwork.json', 
			function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        hazards = getCoordinates(body);
	        //console.log('SHITE HAWK DOWN');
	        res.send(hazards);
	    } else {
	    	res.send('Fuck all Hazards Cunt!');
	    }
	});
	//res.send('Test');
   
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
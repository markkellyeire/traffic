var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var fs = require('fs');
var url = 'http://data.livetraffic.com/traffic/hazards/roadwork.json';
var cacheFile = 'cache.json';

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
	        res.send(hazards);
	    } else {
	    	res.send('no hazards.');
	    }
	});
	//res.send('Test');
   
})

app.get('/test', function (req, res) {
	// var hazards;
	
	res.sendFile(__dirname + '/views/pages/hazard.html');
   
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
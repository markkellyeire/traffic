var express = require("express");
var app = express();
var port = 3700;
var routes = require('./controllers/index');

// private variables.
var http = require('http');
var url = 'http://data.livetraffic.com/traffic/hazards/roadwork.json';
var cacheFile = __dirname + '/cache.json';
var fs = require('fs');
var chokidar = require('chokidar');
var hazardJson = {};
var safeJson = {};
var mongoose = require('mongoose');
var Hazard = require('./app/models/hazard');

app.use('/', routes);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));
app.use(express.static('views'));

// Todo this is still watching the entire directory
// It must only watch the cache file
var watcher = chokidar.watch(cacheFile, {
	ignored: /[\/\\]\./, persistent: true
});

/* prviate functions */

function fetchJson() {
	http.get(url, function(res) {
	    body = '';

	    res.on('data', function(data) {
	    	
	        body += data;
	    });

	    res.on('end', function() {

	    	fs.writeFileSync(cacheFile, body);
	    		
	        setTimeout(fetchJson, 100000); // Fetch it again in a second
	    });
	});
}

function getCoordinatesAndTitle(data) {
	var coords = [],
		features;

	try {
    	hazardJson = JSON.parse(data);
    	safeJson = hazardJson;
  	} catch (e) {
  		hazardJson = safeJson;
    	console.error(e);
  	}

	features = hazardJson['features'];

	for (var i = 0; i < features.length; i++ ) {
		features[i]['geometry']['coordinates'].push(features[i]['properties']['headline']);
		coords.push(features[i]['geometry']['coordinates']);
	}

	return coords;
}

/* End prviate functions */

// Pass the express server to sockets io
var io = require('socket.io').listen(app.listen(port));

// When a connection is establish execute...
io.sockets.on('connection', function (socket) {
 	
    fetchJson();

    watcher.add(cacheFile);

    watcher.on('change', function(cacheFile) {

		fs.readFile(cacheFile, 'utf8', function (err, data) {
			var coordinates = [];
			if (err) throw err;
			
			// Format the hazards array for plotting
			coordinates = getCoordinatesAndTitle(data);
			socket.emit('hazard', coordinates);
			
		});
		
	});
});

process.on('uncaughtException', (err) => {
  console.log('Caught exception:' + err);
});
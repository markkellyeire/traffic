var express = require("express");
var router = express.Router();

// private variables.
var http = require('http');
var url = 'http://data.livetraffic.com/traffic/hazards/roadwork.json';
var cacheFile = __dirname + '/cache.json';
var fs = require('fs');
var chokidar = require('chokidar');
var hazardJson = {};
var safeJson = {};

// Todo this is still watching the entire directory
// It must only watch the cache file
var watcher = chokidar.watch(cacheFile, {
	ignored: /[\/\\]\./, persistent: true
});

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    //next(); // make sure we go to the next routes and don't stop here

    /* prviate functions */
	//console.log('Request', req.io);
	function fetchJson() {
		console.log('fetch json');
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
			console.log('coordinates and title');
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

	/* End private functions */
	fetchJson();

    watcher.add(cacheFile);

    watcher.on('change', function(cacheFile, req) {

		fs.readFile(cacheFile, 'utf8', function (err, data) {
			var coordinates = [];
			if (err) throw err;
			console.log('spa brains');
			// Format the hazards array for plotting
			coordinates = getCoordinatesAndTitle(data);
			req.app.io.emit('hazard', coordinates);
			
		});
		
	});

    res.render('index', {});
});

// router.use(function(req, res, next){
	
// });

module.exports = router;
module.exports = function(io) {
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

	var localSocket = io;

	// Todo this is still watching the entire directory
	// It must only watch the cache file
	var watcher = chokidar.watch(cacheFile, {
		ignored: /[\/\\]\./, persistent: true
	});

	return router.get('/hazards', function(req, res){
	    /* prviate functions */
		//console.log('Request', req.io);
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

	    watcher.on('change', function(cacheFile, io) {
			fs.readFile(cacheFile, 'utf8', function (err, data) {
				var coordinates = [];
				if (err) throw err;
				// Format the hazards array for plotting
				coordinates = getCoordinatesAndTitle(data);
				localSocket.emit('hazard', coordinates);
				
			});
		});

	    res.render('index', {});
	});
}
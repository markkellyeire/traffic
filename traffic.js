var express = require("express");
var app = express();
var port = 3700;

// private variables.
var http = require('http');
var url = 'http://data.livetraffic.com/traffic/hazards/roadwork.json';
var cacheFile = __dirname + '/cache.json';
var fs = require('fs');
var chokidar = require('chokidar');

 
app.get("/", function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});


// Todo this is still watching the entire directory
// It must only watch the cache file
var watcher = chokidar.watch(__dirname, {
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
	        setTimeout(fetchJson, 1000); // Fetch it again in a second
	    });
	});
	//return body;
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
			if (err) throw err;
			//var obj = JSON.parse(data);
			console.log('come on');
			socket.emit('hazard', data);
		});
		
	});
});
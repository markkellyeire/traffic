var express = require("express");
var app = express();
var port = 3700;


var mongoose = require('mongoose');
var Hazard = require('./app/models/hazard');
var hazards = require('./controllers/hazards');

// Pass the express server to sockets io
var io = require('socket.io').listen(app.listen(port));
var routes = require('./controllers/index')(io);
// When a connection is establish execute...
io.sockets.on('connection', function (socket) {
 	console.log('socket connection');
    
});

app.io = io; 

app.use('/', routes);
//app.use('/hazards', hazards);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));
app.use(express.static('views'));

process.on('uncaughtException', (err) => {
  console.log('Caught exception:' + err);
});
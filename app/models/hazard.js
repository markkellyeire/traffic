// app/models/hazard.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HazardSchema = new Schema({
	title: String,
	latitude: Number,
	longitude: Number
});

module.exports = mongoose.model('Hazard', HazardSchema)
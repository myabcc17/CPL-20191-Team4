var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
	email : String,
	password : String,
	name : String,
	phone : String,
	registered_date : { type : Date, default : Date.now }
});

module.exports = mongoose.model('member', memberSchema);

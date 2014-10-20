var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String
});


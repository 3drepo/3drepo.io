var log = require('./login');
var User = require('./user.js');

module.exports = function(passport) {

	passport.serializeUser(function(user, callback) {
		callback(null, user._id);
	});

	passport.deserializeUser(function(id, callback) {
		User.findById(id, function(err, user) {
		callback(err, user);
		});
	});

	log(passport);
}


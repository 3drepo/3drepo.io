var LocalStrategy = require('passport-local').Strategy;
var User = require('./user.js');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {

    passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },

    function(req, username, password, callback) {
	
        User.findOne({
            'username': username
        }, function(err, user) {

            if (err) return callback(err);

            if (!user) {
                return callback(null, false, req.flash('message', 'Unknown username'));
            }

            if (!isValidPassword(user, password)) {
                return callback(null, false, req.flash('message', 'Invalid Password'));
            }

            return callback(null, user);
        });
    }));

    var isValidPassword = function(user, password) {
            return bCrypt.compareSync(password, user.password);
        }
}


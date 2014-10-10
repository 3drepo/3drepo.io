var basicAuth = require('basic-auth');

exports.basicAuth = function(usernm, pass) {
    return function(req, res) {
        var user = basicAuth(req);

        if (!user || !(user.name == usernm) || !(user.pass == pass)) {
            res.set('Authentication', 'Not Authorized');
            return res.send(401);
        }
        next();

    };
};


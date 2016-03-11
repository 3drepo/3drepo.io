'use strict';

var app = require("../../services/api.js").app(require('express-session')({ secret: 'testing'}));

var server = app.listen(8080, function () {
	console.log('Example app listening on port 8080!');
});

var request = require('supertest');

describe('Auth', function () {


	it('/login return 401 on fail', function (done) {
		request(server)
		.post('/login')
		.send({ username: 'henry', password: 'password' })
		.expect(401, done);
	});

});
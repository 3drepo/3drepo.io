'use strict';
let expect = require('chai').expect;
var app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);

var server = app.listen(8080, function () {
	console.log('Example app listening on port 8080!');
});

var request = require('supertest');

describe('Auth', function () {


	it('/login return 200 and account name on success', function (done) {
		request(server)
		.post('/login')
		.send({ username: 'testing', password: 'testing' })
		.expect(200, function(err, res){
			expect(res.body.username).to.equal('testing');
			done();
		});
	});

});
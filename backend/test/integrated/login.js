'use strict';

/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

let request = require('supertest');
let expect = require('chai').expect;
let app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);


describe('Login', function () {

	let server;

	before(function(done){
		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');
			done();
		});
	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		})
	});

	it('with correct password and username should login successfully', function (done) {
		request(server)
		.post('/login')
		.send({ username: 'testing', password: 'testing' })
		.expect(200, function(err, res){
			expect(res.body.username).to.equal('testing');
			done(err);
		});
	});

});
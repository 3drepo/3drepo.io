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
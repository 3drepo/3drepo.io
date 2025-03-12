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

const { queue: {purgeQueues}} = require("../../v5/helper/services");
const request = require('supertest');
const SessionTracker = require("../../v5/helper/sessionTracker")
const app = require('../../../src/v4/services/api.js').createApp();

describe('Uploading a model', () => {
	let server;
	let agent;
	const username = 'upload_username';
	const password = 'Str0ngPassword!';
	const model1 = { name: 'model1'};

	before(async () => {

		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});
		});		

		agent = SessionTracker(request(server));
		await agent.login(username, password);
	});

	after(function(done) {
		purgeQueues().then(() => {
			server.close(function() {
				console.log("API test server is closed");
				done();
			});
		});
	});
		it('should not be able to access the endpoint - endpoint decommissioned', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'no_quota')
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(410, () =>  done());
		});
});

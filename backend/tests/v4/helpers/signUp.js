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

"use strict";

const ServiceHelperV5 = require("../../v5/helper/services")
const SessionTracker = require("../../v5/helper/sessionTracker")

function signUpAndLogin(params) {

	const server = params.server;
	const request = params.request;
	const User = params.User;
	const username = params.username;
	const password = params.password;
	const email = params.email;
	const done = params.done;
	let agent = params.agent;
	const expect = params.expect;
	const noBasicPlan = params.noBasicPlan;

	// hack: by starting the server earlier all the mongoose models like User will be connected to db without any configuration
	request(server).get("/info").end(() => {

		agent = SessionTracker(request(server));

		return ServiceHelperV5.db.createUser({user:  username, password, basicData: {email}}).then(() => {
			return ServiceHelperV5.db.createTeamspace(username, [], undefined, false).then(() => {
				// login
				agent.login(username, password).then(() => { done(undefined, agent) });

			})
		}).catch(err => {
			done(err, agent);
		});

	});

}

function signUpAndLoginAndCreateModel(params) {

	const server = params.server;
	const request = params.request;
	const User = params.User;
	const username = params.username;
	const password = params.password;
	const email = params.email;
	const done = params.done;
	let agent = params.agent;
	const type = params.type;
	const desc = params.desc;
	const expect = params.expect;
	const model = params.model;
	const noBasicPlan = params.noBasicPlan;
	const unit = params.unit;

	signUpAndLogin({
		server, request, agent, expect, User,
		username, password, email, noBasicPlan,
		done: function(err, _agent) {

			agent = _agent;

			if(err) {
				return done(err, agent);
			}

			// create a model
			agent.post(`/${username}/${model}`)
				.send({ type, desc, unit })
				.expect(200, function(err, res) {
					done(err, agent);
				});
		}
	});

}

module.exports = {
	signUpAndLogin,
	signUpAndLoginAndCreateModel
};

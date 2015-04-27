/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/***************************************************************************
*  @file Contains the POST routes
****************************************************************************/

var schemaValidator = require('./js/core/db_schema.js')();
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
var responseCodes = require('./js/core/response_codes.js');
var config = require('./js/core/config.js');

function createSession(place, res, req, username)
{
	req.session.regenerate(function(err) {
		if(err)
			responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {account: username});
		else
		{
			logger.log('debug', 'Authenticated ' + username + ' and signed token.')
			req.session.user = username;
			responseCodes.respond(place, responseCodes.OK, res, {account: username});
		}
	});
}

module.exports = function(router, dbInterface, checkAccess){
	this.postMap = [];

	this.post = function(regex, shouldCheckAccess, callback) {
		this.postMap.push({regex: regex, shouldCheckAccess: shouldCheckAccess, callback: callback});
	};

	// Log the user into the API
	this.post('/login', false, function(req, res) {
		var responsePlace = "Login POST";

		this.dbInterface.authenticate(req.body.username, req.body.password, function(err, user)
		{
			logger.log('debug', 'Attempting to log user ' + req.body.username);

			if(err.value) {
				console.log("MESSAGE: " + err.message);
				responseCodes.respond(responsePlace, err, res, {account: req.body.username});
			} else {
				if(user)
				{
					createSession(responsePlace, res, req, user);
				} else {
					responseCodes.respond(responsePlace, responseCodes.USER_NOT_FOUND, res, {account: req.body.username});
				}
			}
		});
	});

	// Log the user out of the API
	this.post('/logout', false, function(req, res) {
		if(!req.session.user)
		{
			return responseCodes.respond("Logout POST", responseCodes.NOT_LOGGED_IN, res, {});
		}

		var username = req.session.user.username;

		req.session.destroy(function() {
			logger.log('debug', 'User ' + username + ' has logged out.')

			responseCodes.respond("Logout POST", responseCodes.OK, res, {account: username});
		});
	});

	// Update or create a user's account
	this.post('/:account', false, function(req, res) {
		var responsePlace = "Account POST";

		logger.log("debug", "Trying to affect user" + req.params["account"]);

		this.dbInterface.getUserInfo( req.params["account"], false, function (err, user)
		{
			if (!user)
			{
				// Trying to sign-up
				logger.log("debug", "Trying to add user " + req.params["account"]);
				this.dbInterface.createUser(req.params["account"], req.body.password, req.body.email, function(err) {
					createSession(responsePlace, res, req, req.params["account"]);
				});
			} else {
				if(!req.session.user)
				{
					return responseCodes.respond(responsePlace, responseCodes.NOT_LOGGED_IN, res, {});
				}

				if (req.session.user.username != req.params['account'])
				{
					responseCodes.respond(responsePlace, responseCodes.NOT_AUTHORIZED, res, {account: req.params["account"]});
				} else {
					// Modify account here
					logger.log("debug", "Updating account for " + req.params["account"]);

					if (req.body.oldPassword)
					{
						this.dbInterface.updatePassword(req.params["account"], req.body, function(err) {
							responseCodes.onError(responsePlace, err, res, {account: req.params["account"]});
						});
					} else {
						this.dbInterface.updateUser(req.params["account"], req.body, function(err) {
							responseCodes.onError(responsePlace, err, res, {account: req.params["account"]});
						});
					}
				}
			}
		});
	});

	// Update or create a user's account
	//this.post('/:account/:project', false, function(req, res) {
	//});

	this.post('/wayfinder/record', false, function(req, res) {
		var resCode = responseCodes.OK;
		var responsePlace = 'Wayfinder record POST';

		logger.log('debug', 'Posting wayfinder record information');

		console.log(JSON.stringify(req.session));

		if (!("user" in req.session)) {
			responseCodes.respond('Wayfinder record POST', responseCodes.NOT_LOGGED_IN, res, {});
		} else {
			var data = JSON.parse(req.body.data);
			var timestamp = JSON.parse(req.body.timestamp);

			this.dbInterface.storeWayfinderInfo(config.wayfinder.democompany, config.wayfinder.demoproject, req.session.user.username, req.sessionID, data, timestamp, function(err) {
				responseCodes.onError('Wayfinder record POST', err, res, {});
			});
		}

	});

	// Register handlers with Express Router
	for(var idx in this.postMap)
	{
		var item = this.postMap[idx];

		console.log('debug', 'Adding POST call for ' + item['regex']);

		var resFunction = schemaValidator.validate(item.regex);

		console.log("REGEX: " + item.regex);
		console.log("RESFUNCTION: " + resFunction.toString());

		if (item.shouldCheckAccess)
			router.post(item.regex.toString(), resFunction, checkAccess, item.callback);
		else
			router.post(item.regex, resFunction, item.callback);
	}

	return this;
};

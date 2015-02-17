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

module.exports = function(router, dbInterface, checkAccess){
	this.postMap = [];

	this.post = function(regex, shouldCheckAccess, callback) {
		this.postMap.push({regex: regex, shouldCheckAccess: shouldCheckAccess, callback: callback});
	};

	// Log the user into the API
	this.post('/login', false, function(req, res) {
		this.dbInterface.authenticate(req.body.username, req.body.password, function(err, user)
		{
			logger.log('debug', 'Attempting to log user ' + req.body.username);

			if(err)
			{
				res.status(400).send('Incorrect usename or password');
			} else {
				if(user)
				{
					req.session.regenerate(function(err) {
						if(err) return res.sendStatus(500);

						req.session.user = user;

						logger.log('debug', 'Authenticated ' + user.username + ' and signed token.')
						res.sendStatus(200);
					});
				} else {
					res.status(400).send('Invalid user');
				}
			}
		});
	});

	// Log the user out of the API
	this.post('/logout', false, function(req, res) {
		var username = req.session.username;

		req.session.destroy(function() {
			logger.log('debug', 'User ' + username + ' has logged out.')
			res.sendStatus(200);
		});
	});

	// Update or create a user's account
	this.post('/:account', true, function(req, res) {
		this.dbInterface.getUserInfo( req.params["account"], function (err, user)
		{
			if (!user)
			{
				// Trying to sign-up
			} else {
				if (req.session.user != req.params['account'])
				{
					res.status(401).send('Can only modify your own account.');
				} else {
					// Modify account here
				}
			}
		});
	});

	this.router.post('/wayfinder/record.:format?', function(req, res) {
		if (!("user" in req.session)) {
			res.sendStatus(401);
		} else {
			var data = JSON.parse(req.body.data);
			var timestamp = JSON.parse(req.body.timestamp);

			this.dbInterface.storeWayfinderInfo(config.wayfinder.democompany, config.wayfinder.demoproject, req.session.user.username, req.sessionID, data, timestamp, function(err) {
				if (err) throw err;

				res.sendStatus(200);
			});
		}
	});

	// Register handlers with Express Router
	for(var idx in this.postMap)
	{
		var item = this.postMap[idx];

		if (item.shouldCheckAccess)
			router.post(item.regex, schemaValidator.validate(item.regex), checkAccess, item.callback);
		else
			router.post(item.regex, schemaValidator.validate(item.regex), item.callback);
	}

	return this;
};

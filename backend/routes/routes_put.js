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
//var log_iface = require('./js/core/logger.js');
//var logger = log_iface.logger;
var responseCodes = require('./js/core/response_codes.js');
//var config = require('./js/core/config.js');

module.exports = function(router, dbInterface, checkAccess){
	this.putMap = [];

	this.put = function(regex, shouldCheckAccess, callback) {
		this.putMap.push({regex: regex, shouldCheckAccess: shouldCheckAccess, callback: callback});
	};

	this.put('/:account/:project/issues/:sid', false, function(req, res) {
		var responsePlace = 'Updating an issue';
		var data = JSON.parse(req.body.data);

		this.dbInterface.hasReadAccessToProject(req.session.user.username, req.params.account, req.params.project, function(err) {
			if (err.value) {
				return callback(err);
			}

			this.dbInterface.updateIssue(req.params.account, req.params.project, req.params.sid, req.session.user.username, data, function(err, result) {
				responseCodes.onError(responsePlace, err, res, result);
			});
		});
	});

	// Register handlers with Express Router
	for(var idx in this.putMap)
	{
		if(this.putMap.hasOwnProperty(idx)){
			var item = this.putMap[idx];
			var resFunction = schemaValidator.validate(item.regex);

			if (item.shouldCheckAccess){
				router.put(item.regex.toString(), resFunction, checkAccess, item.callback);
			} else {
				router.put(item.regex, resFunction, item.callback);
			}
		}
	}

	return this;
};

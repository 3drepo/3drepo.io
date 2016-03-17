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
var _ = require("underscore");

function containsString(value)
{
	return (value.name.indexOf(this.substr) !== -1);
}

function searchCompanies(name, start, end, callback)
{
	dbInterface.getDBList(function(err, dbList)
	{
		if(err) return callback(err);

		var subObj = { substr: name };
		var dbListFiltered = dbList.filter(containsString, subObj)

		// TODO: Don't slice here, but on the database
		var json = {
			companies: dbListFiltered.slice(start - 1, end - 1)
		};

		callback(null, json);
	});
}

function searchUsers(name, start, end, callback)
{
	var nameExp = new RegExp('^.*' + name + '.*', 'i');

	var query = {
		user: nameExp
	};

	var sliceProjection = {
		_id: { $slice: [start, (end - start + 1)]}
	};

	dbInterface.dbConn.filterColl("admin", "system.users", query, sliceProjection, function(err, coll) {
		var userJson = {
			users: coll.map(
				function(user){
					return user["user"];
				}
			)
		};

		callback(null, userJson);
	});
}

function searchFunction(dbInterface, queryParams, callback)
{
	var userName = ("user_name" in queryParams) ? queryParams["user_name"] : null;
	var companyName = ("company_name" in queryParams) ? queryParams["company_name"] : null;
	var userCompanyName = ("user_company_name" in queryParams) ? queryParams["user_company_name"] : null;

	var start = ("start" in queryParams) ? queryParams("start") : 1;
	var end   = ("end" in queryParams) ? queryParams("end") : (start + 5);

	var query = {};
	var json  = {};

	if (userName)
	{
		searchUsers(userName, start, end, function(err, userJson)
		{
			if(err) return callback(err);

			callback(null, _.extend(json, userJson));
		});
	} else if (companyName) {
		searchCompanies(userCompanyName, start, end, function (err, companyJson)
		{
			if(err) return callback(err);

			callback(null, _.extend(json, companyJson));
		});
	} else if (userCompanyName) {
		searchUsers(userCompanyName, start, end, function(err, userJson)
		{
			if(err) return callback(err);

			searchCompanies(userCompanyName, start, end, function(err, companyJson)
			{
				if(err) return callback(err);

				callback(null, _.extend(json, _.extend(companyJson, userJson)));
			});
		});
	}
}

module.exports.search = searchFunction;

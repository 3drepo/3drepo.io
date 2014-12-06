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

var config = require('app-config').config;

exports.route = function(router)
{
	router.get('html', '/:account', function(res, params) {
        router.dbInterface.getUserDBList(params.user, function(err, dbList) {
            if (err) throw err;

            dbList.sort(function(a,b) { return a['project'].localeCompare(b['project']); });

            params.dblist = JSON.stringify(dbList.map(function(db) { return {name:db["project"]}}));

            Object.keys(config.external).forEach(function(key) {
                params[key] = config.external[key];
            });

            res.render("dblist", params);
        });
    });

    router.get('html', '/:account/:project', function(res, params) {
        if (params.rid != null) xml_str = '<inline nameSpaceName=\"model\" onload=\"onLoaded(event);\" url=\"/' + params.account + '/' + params.project + '/revision/' + params.rid + '.x3d.src\"> </inline>';
        else xml_str = '<inline nameSpaceName=\"model\" onload=\"onLoaded(event);\" url=\"/' + params.account + '/' + params.project + '/revision/master/head.x3d.src\"> </inline>';

        params.xml    = xml_str;

        Object.keys(config.external).forEach(function(key) {
            params[key] = config.external[key];
        });

        res.render("index", params);
    });

    router.get('json', '/:account/:project', function(res, params) {
		// FIXME: Fill in
		res.status(415).send("Not supported");
	});

	router.get('json', '/:account/:project/revisions', function(res, params) {
		// FIXME: Fill in.
		res.status(415).send("Not supported");
	});

	router.get('json', '/:account/:project/revision/:rid', function(res, params) {
		// FIXME: Fill in.

	});
};



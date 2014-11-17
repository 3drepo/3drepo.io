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

exports.index = function(xmltemplate, db_name, format, revision, res, err_callback) {

    if (revision != null) xml_str = '<inline nameSpaceName=\"model\" url="' + db_name + '.' + format + '.x3d/' + revision + '"> </inline>';
    else xml_str = '<inline nameSpaceName=\"model\" url="/data/' + db_name + '.' + format + '.x3d"> </inline>';

	var paramJson = {
		xml: xml_str,
		dbname: db_name
	};

	Object.keys(config.external).forEach(function(key) {
		paramJson[key] = config.external[key];
	});

    res.render(xmltemplate, paramJson);
};

exports.proto = function(req, res, err_callback){
    res.render('prototype', {  
        x3domjs: config.external.x3domjs, 
        x3domcss: config.external.x3domcss,
        repouicss: config.external.repouicss,
		jqueryjs: config.external.jqueryjs,
		jqueryuijs: config.external.jqueryuijs,
	});
}

exports.dblist = function(db_interface, req, res, err_callback) {
    db_interface.getUserDBList(null, req.user.username, function(err, db_list) {
        if (err) err_callback(err);
		
		db_list.sort(function(a,b) { return a['name'].localeCompare(b['name']); });

		var paramJson = {
			dblist: JSON.stringify(db_list)
		};

		Object.keys(config.external).forEach(function(key) {
			paramJson[key] = config.external[key];
		});

		res.render("dblist", paramJson);
    });
};



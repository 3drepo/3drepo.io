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

    if (revision != null) xml_str = '<include url="\'' + db_name + '.' + format + '.x3d/' + revision + '\'"/> </include>';
    else xml_str = '<include url="\'/data/' + db_name + '.' + format + '.x3d\'"/> </include>';

    res.render(xmltemplate, {
        xml: xml_str,
        x3domjs: config.external.x3domjs,
        x3domcss: config.external.x3domcss,
        repouicss: config.external.repouicss
    });
};

exports.proto = function(req, res, err_callback){
    res.render('prototype', { 
        repouicss: config.external.repouicss, 
        x3domjs: config.external.x3domjs, 
        x3domcss: config.external.x3domcss 
    });
}

exports.dblist = function(db_interface, res, err_callback) {
    db_interface.get_db_list(null, function(err, db_list) {
        if (err) err_callback(err);
		
		db_list.sort(function(a,b) { return a['name'].localeCompare(b['name']); });

        res.render("dblist", {
            dblist: JSON.stringify(db_list)
        });
    });
};



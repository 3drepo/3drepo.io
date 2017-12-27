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


let DB = function(){}

DB.prototype.admin = function() { return this; };

DB.prototype.authenticate = (username, password) => {
	return Promise.resolve({username, password});
}

DB.prototype.addUser = (username, password, options) => {
	return Promise.resolve(username, password, options);
}

DB.prototype.db = function() { return this; };

DB.prototype.collection = function() { return this; };
DB.prototype.getCollection = function() { return this; };

DB.prototype.command = function() { return this; };

DB.prototype.find = function() { return this; };

DB.prototype.next = function() { return Promise.resolve(); };

DB.prototype.limit = function() { return this; };
module.exports = DB;

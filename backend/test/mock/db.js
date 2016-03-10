'use strict';

let DB = function(){}

DB.prototype.admin = function() { return this; };

DB.prototype.authenticate = (username, password) => {
	return Promise.resolve({username, password});
}

DB.prototype.db = function() { return this; };

DB.prototype.collection = function() { return this; };

DB.prototype.command = function() { return this; };

module.exports = DB;
'use strict';

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

DB.prototype.command = function() { return this; };

DB.prototype.find = function() { return this; };

DB.prototype.next = function() { return Promise.resolve(); };

DB.prototype.limit = function() { return this; };
module.exports = DB;
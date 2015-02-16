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

var Validator = require('jsonschema').Validator;
var v = new Validator();
var log_iface = require('./logger.js');
var logger = log_iface.logger;

module.exports = function() {

	this.schemas = {};

	this.registerSchema = function(regex, schema)
	{
		logger.log('debug', 'Registering POST schema for ' + regex);

		var schemaObj = {
			"id" :  regex,
			"type": "object",
			"properties" : schema
		};

		this.schemas[regex] = schemaObj;
	};

	this.registerSchema('/login',
		{	"username": {"type" : "string"},
			"password": {"type" : "string"}
		}
	);

	this.registerSchema('/logout', {} );

	this.registerSchema('/:account',
		{	"username":  {"type": "string"},
			"firstName": {"type": "string"},
			"lastName":  {"type": "string"},
			"email":     {"type": "string"}
		}
	);

	// Expose the validate function
	this.validate = function(regex)
	{
		if(!(regex in this.schemas))
		{
			logger.log('error', 'Schema not defined for regex :' + regex);
			return function (req, res, next) {
				return res.sendStatus(500); // Internal server error - missing schema
			};
		} else {
			logger.log('error', 'Checking input against ' + regex + ' schema.');

			return function(req, res, next) {
				var validateObj = v.validate(req.body, this.schemas[regex]);

				if (validateObj.errors.length)
					return res.sendStatus(422); // Unprocessable Entity
				else
					next();
			};
		}
	};

	return this;
};


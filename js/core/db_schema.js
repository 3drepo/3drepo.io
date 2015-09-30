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
var responseCodes = require('./response_codes.js');

module.exports = function() {

	this.schemas = {};

	this.registerSchema = function(regex, schema)
	{
		logger.log('debug', 'Registering POST schema for ' + regex);

		var schemaObj = {
			"id": regex,
			"type": "object",
			"properties" : schema
		};

		this.schemas[regex] = schemaObj;
	};

	this.registerSchema('/login',
		{
			"username": {"type" : "string"},
			"password": {"type" : "string"}
		}
	);

	this.registerSchema('/logout', {} );

	this.registerSchema('/:account',
		{
			"username":  {"type": "string"},
			"email":     {"type": "string"},
			"password":  {"type": "string"}
		}
	);

	this.registerSchema('/:account/:project/:branch/viewpoint',
		{
			"name": {"type": "string"},
			"shared_id": {"type": "string"},
			"up": {
				"type": "array",
				"items": { "type" : "number"}
			},
			"look_at": {
				"type": "array",
				"items": { "type" : "number"}
			},
			"position": {
				"type": "array",
				"items": { "type": "number"}
			},
			"fov": {"type" : "number"},
			"aspect_ratio" : {"type": "number"},
			"far" : {"type": "number"},
			"near" : {"type" : "number"}
		}
	);

	this.registerSchema('/:account/:project/issues/:sid',
		{
			"uid" : {"type" : "string" },
			"name" : {"type" : "string" },
			"deadline" : {"type" : "number" },
			"comment" : { "type" : "string" },
			"complete" : { "type": "boolean" }
		}
	);
    
    this.registerSchema('/:account/upload',
        {
           "databaseName" : {"type" : "string"}, 
           "projectName" : {"type" : "string"}
     }
    );

	this.registerSchema('/:account/:project/wayfinder/record',
		{
			"waypoints" : {
				"type" : "array",
				"items" : { "$ref" : "/WaypointRecord" }
			}
		}
	);

	this.customTypes = [
		{ // Waypoint recording entry
			"id" : "/WaypointRecord",
			"type": "object",
			"properties" : {
				"dir" : {
					"type" : "array",
					"items" : { "type" : "number" }
				},
				"pos" : {
					"type" : "array",
					"items" : { "type" : "number" }
				},
				"time": {"type": "number"}
			}
		},
		{ // Comment entry
			"id" : "/Comment",
			"type" : "object",
			"properties" : {
				"author" : { "type" : "string" },
				"text" : { "type" : "string" }
			}
		}
	];

	for(var idx = 0; idx < this.customTypes.length; idx++)
		v.addSchema(this.customTypes[idx], this.customTypes[idx]["id"]);

	// Expose the validate function
	this.validate = function(regex)
	{
		if(!(regex in this.schemas))
		{
			logger.log('error', 'Schema not defined for regex :' + regex);
			return function (req, res, next) {
				responseCodes.respond( 'Schema validation', responseCodes.MISSING_SCHEMA, res, { "regex" : regex });
			};
		} else {
			return function(req, res, next) {
				var validateObj = v.validate(req.body, this.schemas[regex]);

				if (validateObj.errors.length)
					responseCodes.respond('Schema validation', responseCodes.VALIDATION_ERROR(validateObj.errors), res, {} );
				else
					next();
			};
		}
	};

	return this;
};


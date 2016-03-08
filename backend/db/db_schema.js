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
var systemLogger = require('../logger.js').systemLogger;
var responseCodes = require('../response_codes.js');

var C = require("../constants.js");

module.exports = function() {

	this.schemas = {};

	this.registerSchema = function(regex, schema)
	{
		systemLogger.logDebug('Registering POST schema for ' + regex);

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

	this.registerSchema('/:account/:project/issues/:id',
		{
			"uid" : {"type" : "string" },
			"name" : {"type" : "string" },
			"deadline" : {"type" : "number" },
			"comment" : { "type" : "string" },
			"complete" : { "type": "boolean" }
		}
	);
    
    this.registerSchema('/:account/:project/upload',{});

	this.registerSchema('/:account/:project/wayfinder/record',
		{
			"waypoints" : {
				"type" : "array",
				"items" : { "$ref" : "/WaypointRecord" }
			}
		}
	);

    this.registerSchema('/:account/:project/walkthrough', {});

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

	for(var idx = 0; idx < this.customTypes.length; idx++) {
		v.addSchema(this.customTypes[idx], this.customTypes[idx].id);
	}

	// Expose the validate function
	this.validate = function(regex)
	{
		if(!(regex in this.schemas))
		{
			systemLogger.logError('Schema not defined for regex :' + regex);
			return function (req, res, next) {
				req[C.REQ_REPO].processed = true;

				responseCodes.respond( 'Schema validation', req, res, next, responseCodes.MISSING_SCHEMA, { "regex" : regex });
			};
		} else {
			return function(req, res, next) {
				var validateObj = v.validate(req.body, this.schemas[regex]);

				if (validateObj.errors.length) {
					req[C.REQ_REPO].processed = true;

					responseCodes.respond('Schema validation', req, res, next, responseCodes.VALIDATION_ERROR(validateObj.errors), {} );
				} else {
					next();
				}
			};
		}
	};

	return this;
};


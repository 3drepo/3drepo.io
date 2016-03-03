/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) a/exitny later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 var logIface = require("../logger.js");
 var C = require("../constants.js");
 var uuidToString = require("../db/db_interface.js").uuidToString;
 var responseCodes = require("../response_codes.js");

 var utils         = require("../utils.js");

 var dbInterface   = require("../db/db_interface.js");

 var config       = require("app-config").config;


// Set up REST routing calls
exports.route = function(router)
{
	router.get("gltf", "/:account/:project/:uid", function(req, res, params, err_callback) {
        //The Repo IO server has no capability of generating gltfs on the fly.
        //So this is going to call the stash and see if we have a stashed gltf in the database
        //if not, just return a NOT_FOUND

		dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function(callback) {
            err_callback(responseCodes.FILE_DOESNT_EXIST);
		}, err_callback);
	});

    //FIXME: do we need this for GLTF?
	//router.get("src", "/:account/:project/revision/:rid/:sid", function(req, res, params, err_callback) {
	//	// Get object based on revision rid, and object shared_id sid. Check
	//	// whether or not it is a mesh and then output the result.

	//	dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function(callback) {
	//		dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, null, params.rid, params.sid, true, {}, function(err, type, uid, fromStash, obj)
	//		{
	//			if(err.value) {
	//				return callback(err);
	//			}

	//			if (type === C.REPO_NODE_TYPE_MESH)
	//			{
	//				var tex_uuid = null;

	//				if ("tex_uuid" in params.query)
	//				{
	//					tex_uuid = params.query.tex_uuid;
	//				}

	//				render(params.project, obj, tex_uuid, false, params.subformat, req[C.REQ_REPO].logger, function(err, renderedObj) {
	//					if (err.value) {
	//						return err_callback(err);
	//					}

	//					callback(responseCodes.OK, renderedObj);
	//				});
	//			} else {
	//				callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
	//			}
	//		});
	//	}, err_callback);
	//});
};



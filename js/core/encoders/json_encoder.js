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
var repoGraphScene = require('../repoGraphScene.js');
var async = require('async');
var uuidToString = require('../db_interface.js').uuidToString;
var search = require('./helper/search.js').search;
var log_iface = require('../logger.js');
var logger = log_iface.logger;

var responseCodes = require('../response_codes.js');

// Credit goes to http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/*******************************************************************************
 * Append Metadata to child
 *
 * @param {Object} dbInterface - Database module from db_interface.js
 * @param {string} project - name of project containing child
 * @param {JSON} childNode - Child node JSON
 *******************************************************************************/
function treeChildMetadata(dbInterface, dbName, project, childNode, callback)
{
	var sharedId = childNode["key"];

	dbInterface.getMetadata(dbName, project, sharedId, function(err, meta) {
		childNode["meta"] = meta;

		callback(null, childNode);
	});
}

/*******************************************************************************
 * Process child node and convert to tree node for display
 *
 * @param {JSON} child - JSON containing child information
 * @param {string} project - name of project containing child
 * @param {boolean} selected - Is the parent currently selected ?
 * @param {string} namespace - X3DOM Namespace in which the node exists
 * @param {boolean} htmlMode - In this mode HTML characters are escaped
 *******************************************************************************/
function processChild(child, project, selected, namespace, htmlMode)
{
	var childNode = {};

	// If a child is a ref then add project information to allow loading
	// of information from a different database , otherwise if
	// a mesh or a group (transformation) then add it as a normal node.
	if ((child['type'] == 'mesh') || (child['type'] == 'transformation') || child['type'] == 'map')
	{
		var uuid      = uuidToString(child["_id"]);
		var shared_id = uuidToString(child["shared_id"]);
		var name      = "";

		if("name" in child)
			name = child["name"];
		else
			name = uuid;

		childNode["key"]       = shared_id;
		childNode["title"]     = htmlMode ? escapeHtml(name) : name;
		childNode["uuid"]      = uuid;
		childNode["folder"]    = ("children" in child);
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["namespace"] = namespace;
		childNode["dbname"]    = project;

	} else if (child['type'] == 'ref') {

		childNode["project"]   = child["project"];
		childNode["title"]     = htmlMode ? escapeHtml(child["project"]) : child["project"];
		childNode["namespace"] = child["project"] + "__";
		childNode["uuid"]      = uuid;
		childNode["folder"]    = true;
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["dbname"]    = child["project"];
		childNode["key"]       = uuidToString(child["shared_id"]);

	}

	return childNode;
}

function getTree(dbInterface, account, project, branch, revision, sid, namespace, selected, htmlMode, err_callback)
{
		if (sid == "root")
		{
			dbInterface.getScene(account, project, branch, revision, false, function(err, doc) {
				if(err.value) return err_callback(err);

				var head = [{}];
				var node = doc['mRootNode'];

				logger.log('debug', 'Found root node ' + node["id"]);

				head[0]["title"]     = project;
				head[0]["key"]       = htmlMode ? escapeHtml(uuidToString(node["shared_id"])) : uuidToString(node["shared_id"]);
				head[0]["folder"]    = true;
				head[0]["lazy"]      = true;
				head[0]["selected"]  = true;
				head[0]["uuid"]      = node["id"];
				head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
				head[0]["dbname"]    = project;

				if (!("children" in node))
					head[0]["children"] = [];

				err_callback(responseCodes.OK, head);
			});
		} else {
			dbInterface.getChildren(account, project, branch, revision, sid, function(err, doc) {
				if(err.value) return err_callback(err);

				async.map(doc,
					function(child, callback) { // Called for all children
						callback(null, processChild(child, project, selected, namespace, htmlMode));
					},
					function(err, children) { // Called when are children are ready
						async.map(children,
							function(id, callback) { // Called every item
								treeChildMetadata(dbInterface, account, project, id, callback);
							},
							function(err, childrenWithMeta) { // Called when children are ready
								if(err)
									err_callback(responseCodes.EXTERNAL_ERROR(err));
								else
									err_callback(responseCodes.OK, childrenWithMeta);
							}
						);
					}
				);
			});
		}
};

exports.route = function(router)
{
	router.get('json', '/search', function(res, params, err_callback) {
		search(router.dbInterface, params.query, function(err, json)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, json);
		});
	});

	router.get('json', '/:account', function(res, params, err_callback) {
		if(!("getPublic" in params))
		{
			err_callback(responseCodes.GET_PUBLIC_NOT_SPECIFIED);
		} else {
			dbInterface.getUserInfo(params.account, params.getPublic, function(err, user)
			{
				if(err.value) {
					err_callback(err);
				} else {
					if(user)
					{
						user.username = params.account;
						err_callback(responseCodes.OK, user);
					}
					else
						err_callback(responseCodes.USER_NOT_FOUND);
				}
			});
		}
	});

	router.get('json', '/:account/:project', function(res, params, err_callback) {
		dbInterface.getProjectInfo(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get('json', '/:account/:project/revision/:rid', function(res, params, err_callback) {
		router.dbInterface.getRevisionInfo(params.account, params.project, params.rid, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get('json', '/:account/:project/revision/:branch/head', function(res, params, err_callback) {
		router.dbInterface.getHeadOf(params.account, params.project, params.branch, router.dbInterface.getRevisionInfo, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get('json', '/:account/:project/revision/:rid/readme', function(res, params, err_callback) {
		router.dbInterface.getReadme(params.account, params.project, params.rid, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get('json', '/:account/:project/revision/:branch/head/readme', function(res, params, err_callback) {
		router.dbInterface.getHeadOf(params.account, params.project, params.branch, router.dbInterface.getReadme, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get('json', '/:account/:project/branches', function(res, params, err_callback) {
		router.dbInterface.getBranches(params.account, params.project, function(err, branchList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, branchList);
		});
	});

	router.get('json', '/:account/:project/revisions', function(res, params, err_callback) {
		router.dbInterface.getRevisions(params.account, params.project, null, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get('json', '/:account/:project/revisions/:branch', function(res, params, err_callback) {
		router.dbInterface.getRevisions(params.account, params.project, params.branch, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get('json', '/:account/:project/users', function(res, params, err_callback) {
		dbInterface.getProjectUsers(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get('json', '/:account/:project/revision/:branch/head/tree/:sid', function(res, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var sid			= params.sid;

		var branch		= params.branch;

		var namespace	= params.query.namespace;
		var selected	= params.query.selected;

		var htmlMode	= params.query.htmlMode == 'true';

		getTree(dbInterface, account, project, branch, null, sid, namespace, selected, htmlMode, err_callback);
	});


	router.get('json', '/:account/:project/revision/:rid/tree/:sid', function(res, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var sid			= params.sid;

		var revision	= params.rid;

		var namespace	= params.query.namespace;
		var selected	= params.query.selected;

		var htmlMode	= params.query.htmlMode == 'true';

		getTree(dbInterface, account, project, null, revision, sid, namespace, selected, htmlMode, err_callback);
	});
};



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

(() => {
	"use strict";

	const utils = require("./utils.js");

	function define(name, value) {
		Object.defineProperty(module.exports, name, {
			value: value,
			enumerable: true
		});
	}

	//-----------------------------------------------------------------------------
	//
	// New API
	//
	//-----------------------------------------------------------------------------

	// Overall constants
	define("MASTER_BRANCH_NAME", "master");
	define("ADMIN_DB", "admin");
	define("HEAD_REVISION_NAME", "revision");
	define("MASTER_BRANCH", "00000000-0000-0000-0000-000000000000");
	define("MASTER_UUID", utils.stringToUUID(module.exports.MASTER_BRANCH));

	// Main collections (tables) in 3D Repo
	define("REPO_COLLECTION_SCENE", "scene");
	define("REPO_COLLECTION_HISTORY", "history");
	define("REPO_COLLECTION_STASH", "stash");

	//-----------------------------------------------------------------------------
	//
	// Node types
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_TYPE_TRANSFORMATION", "transformation");
	define("REPO_NODE_TYPE_MESH", "mesh");
	define("REPO_NODE_TYPE_MATERIAL", "material");
	define("REPO_NODE_TYPE_TEXTURE", "texture");
	define("REPO_NODE_TYPE_CAMERA", "camera");
	define("REPO_NODE_TYPE_REVISION", "revision");
	define("REPO_NODE_TYPE_REF", "ref");
	define("REPO_NODE_TYPE_META", "meta");
	define("REPO_NODE_TYPE_MAP", "map");

	//-----------------------------------------------------------------------------
	//
	// Shared fields
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_ID", "_id"); // TODO: remove all references to replace with UNIQUE_ID instead
	define("REPO_NODE_LABEL_UNIQUE_ID", "_id");
	define("REPO_NODE_LABEL_SHARED_ID", "shared_id");
	define("REPO_NODE_LABEL_REV_ID", "rev_id");
	define("REPO_NODE_LABEL_API", "api");
	define("REPO_NODE_LABEL_PATH", "paths"); // TODO: remove but make sure all references are fixed!
	define("REPO_NODE_LABEL_PATHS", "paths"); // fixed typo
	define("REPO_NODE_LABEL_TYPE", "type");
	define("REPO_NODE_LABEL_PARENTS", "parents");
	define("REPO_NODE_LABEL_NAME", "name");

	//-----------------------------------------------------------------------------
	//
	// Transformation fields
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_MATRIX", "matrix");

	//-----------------------------------------------------------------------------
	//
	// Mesh fields
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_VERTICES", "vertices");
	define("REPO_NODE_LABEL_VERTICES_COUNT", "vertices_count");
	define("REPO_NODE_LABEL_VERTICES_BYTE_COUNT", "vertices_byte_count");
	define("REPO_NODE_LABEL_NORMALS", "normals");
	define("REPO_NODE_LABEL_FACES", "faces");
	define("REPO_NODE_LABEL_FACES_COUNT", "faces_count");
	define("REPO_NODE_LABEL_FACES_BYTE_COUNT", "faces_byte_count");
	define("REPO_NODE_LABEL_UV_CHANNELS", "uv_channels");
	define("REPO_NODE_LABEL_UV_CHANNELS_COUNT", "uv_channels_count");
	define("REPO_NODE_LABEL_BOUNDING_BOX", "bounding_box");

	//-----------------------------------------------------------------------------
	//
	// Texture fields
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_EXTENSION", "extension");

	//-----------------------------------------------------------------------------
	//
	// Camera fields
	//
	//-----------------------------------------------------------------------------
	
	define("REPO_NODE_LABEL_LOOK_AT", "look_at");
	define("REPO_NODE_LABEL_POSITION", "position");
	define("REPO_NODE_LABEL_UP", "up");
	define("REPO_NODE_LABEL_FOV", "fov");
	define("REPO_NODE_LABEL_NEAR", "near");
	define("REPO_NODE_LABEL_FAR", "far");
	define("REPO_NODE_LABEL_ASPECT_RATIO", "aspect_ratio");

	//-----------------------------------------------------------------------------
	//
	// Revision fields
	//
	//-----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_AUTHOR", "author");
	define("REPO_NODE_LABEL_BRANCH", "branch");
	define("REPO_NODE_LABEL_CURRENT", "current");
	define("REPO_NODE_LABEL_CURRENT_UNIQUE_IDS", "current");
	define("REPO_NODE_LABEL_MESSAGE", "message");
	define("REPO_NODE_LABEL_TIMESTAMP", "timestamp");
	define("REPO_NODE_LABEL_ADDED_SHARED_IDS", "added");
	define("REPO_NODE_LABEL_DELETED_SHARED_IDS", "deleted");
	define("REPO_NODE_LABEL_MODIFIED_SHARED_IDS", "modified");
	define("REPO_NODE_LABEL_UNMODIFIED_SHARED_IDS", "unmodified");

	//-----------------------------------------------------------------------------
	//
	// Merge map
	//
	//-----------------------------------------------------------------------------
	
	define("REPO_NODE_LABEL_MERGED_NODES", "merged_nodes");
	define("REPO_NODE_LABEL_VERTEX_MAP", "v_map");
	define("REPO_NODE_LABEL_TRIANGLE_MAP", "t_map");
	define("REPO_NODE_LABEL_MERGE_MAP_MESH_ID", "map_id");
	define("REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID", "mat_id");
	define("REPO_NODE_LABEL_MERGE_MAP_FROM", "from");
	define("REPO_NODE_LABEL_MERGE_MAP_TO", "to");
	define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM", "v_from");
	define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO", "v_to");
	define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM", "t_from");
	define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO", "t_to");
	define("REPO_NODE_LABEL_COMBINED_MAP", "m_map");
	define("REPO_NODE_LABEL_MERGE_MAP_OFFSET", "offset");

	//-----------------------------------------------------------------------------
	//
	// X3DOM defines
	//
	//-----------------------------------------------------------------------------
	
	define("X3DOM_SRC_BYTE", 5120);
	define("X3DOM_SRC_UBYTE", 5121);
	define("X3DOM_SRC_SHORT", 5122);
	define("X3DOM_SRC_USHORT", 5123);
	define("X3DOM_SRC_INT", 5124);
	define("X3DOM_SRC_UINT", 5125);
	define("X3DOM_SRC_FLOAT", 5126);
	define("X3DOM_SRC_TRIANGLE", 4);

	//-----------------------------------------------------------------------------
	// Following fields are not stored in the repository,
	// they are only implied!
	// TODO: refactor name such as UNUSED_LABEL to distinguishe from DB fields!
	define("REPO_NODE_LABEL_CHILDREN", "children");
	define("REPO_NODE_LABEL_CAMERAS", "cameras");
	define("REPO_SCENE_LABEL_MATERIALS_COUNT", "materials_count");
	define("REPO_SCENE_LABEL_MESHES_COUNT", "meshes_count");
	define("REPO_SCENE_LABEL_TEXTURES_COUNT", "textures_count");
	define("REPO_SCENE_LABEL_CAMERAS_COUNT", "cameras_count");
	define("REPO_HISTORY_LABEL_REVISIONS_COUNT", "revisions_count");
	define("REPO_SCENE_LABEL_REF_COUNT", "ref_count");
	define("REPO_SCENE_LABEL_METAS_COUNT", "meta_count");
	define("REPO_SCENE_LABEL_MAPS_COUNT", "map_count");

	//-----------------------------------------------------------------------------
	//
	// SRC format output
	//
	//-----------------------------------------------------------------------------

	define("SRC_IDX_LIST", "idx_list");
	define("SRC_VERTEX_LIMIT", 65535);

	//-----------------------------------------------------------------------------
	//
	// API server constants
	//
	//-----------------------------------------------------------------------------

	define("REPO_REST_API_ACCOUNT", "account");
	define("REPO_REST_API_PROJECT", "project");
	define("REPO_REST_API_BRANCH", "branch");
	define("REPO_REST_API_ID", "id");
	define("REPO_REST_API_SID", "sid");
	define("REPO_REST_API_FORMAT", "format");

	define("REPO_SESSION_USER", "user");

	define("REQ_REPO", "repo");

	// Filters for the permissions
	define("REPO_ANY", 0);
	define("REPO_READWRITE", 3);
	define("REPO_READ", 1);
	define("REPO_WRITE", 2);

	// Types of API server
	define("POST_API", "post");
	define("GET_API", "all");
	define("MAP_API", "map");

	//-----------------------------------------------------------------------------
	//
	// MongoDB error codes
	//
	//-----------------------------------------------------------------------------

	define("MONGO_AUTH_FAILED", 18);
	define("MONGO_DUPLICATE_KEY", "11000");

	//-----------------------------------------------------------------------------
	//
	// Payment types
	//
	//-----------------------------------------------------------------------------
	define("PRO_RATA_PAYMENT", 'pro-rata');
	define("REGULAR_PAYMENT", 'regular');

	//-----------------------------------------------------------------------------
	//
	// Date format strings
	//
	//-----------------------------------------------------------------------------
	define("DATE_FORMAT", "YYYY-MM-DD");
	define("DATE_TIME_FORMAT", "DD-MM-YYYY HH:mm");

	//-----------------------------------------------------------------------------
	//
	// Permissions
	//
	//-----------------------------------------------------------------------------

	// not sure when to use
	define("PERM_CREATE_TEAM_SPACE", "create_team_space");
	define("PERM_DELETE_TEAM_SPACE", "delete_team_space");

	//team space
	define("PERM_ASSIGN_LICENCE", "assign_licence");
	define("PERM_REVOKE_LICENCE","revoke_licence");
	define("PERM_TEAMSPACE_ADMIN","teamspace_admin"); // have total control for projects and models under its teamspace
	define("PERM_CREATE_PROJECT", "create_project");
	define("PERM_CREATE_JOB","create_job");
	define("PERM_DELETE_JOB","delete_job");
	define("PERM_ASSIGN_JOB","assign_job");


	//project level permission
	define("PERM_CREATE_MODEL", "create_model");
	define("PERM_CREATE_FEDERATION", "create_federation");
	define("PERM_PROJECT_ADMIN", "admin_project");
	define("PERM_EDIT_PROJECT", "edit_project");
	define("PERM_DELETE_PROJECT", "delete_project");

	// models
	define("PERM_CHANGE_MODEL_SETTINGS", "change_model_settings");
	define("PERM_UPLOAD_FILES", "upload_files");
	define("PERM_CREATE_ISSUE", "create_issue");
	define("PERM_COMMENT_ISSUE", "comment_issue");
	define("PERM_VIEW_ISSUE", "view_issue");
	define("PERM_VIEW_MODEL", "view_model");
	define("PERM_DOWNLOAD_MODEL", "download_model");
	define("PERM_EDIT_FEDERATION", "edit_federation");
	define("PERM_DELETE_FEDERATION", "delete_federation");
	define("PERM_DELETE_MODEL", "delete_model");
	define("PERM_MANAGE_MODEL_PERMISSION", "manage_model_permission");
	
	//to be deleted
	define("PERM_VIEW_PROJECT", "view_project"); 
	define("PERM_DOWNLOAD_PROJECT", "download_project");
	define("PERM_CHANGE_PROJECT_SETTINGS", "change_project_settings");

	//all
	define("PERM_LIST", [
		module.exports.PERM_DELETE_PROJECT,
		module.exports.PERM_CHANGE_PROJECT_SETTINGS,
		module.exports.PERM_ASSIGN_LICENCE,
		module.exports.PERM_UPLOAD_FILES,
		module.exports.PERM_CREATE_ISSUE,
		module.exports.PERM_COMMENT_ISSUE,
		module.exports.PERM_VIEW_ISSUE,
		module.exports.PERM_DOWNLOAD_PROJECT,
		module.exports.PERM_VIEW_PROJECT,
		module.exports.PERM_CREATE_PROJECT,
		module.exports.PERM_PROJECT_ADMIN,
		module.exports.PERM_EDIT_PROJECT,
		module.exports.PERM_CREATE_MODEL,
		module.exports.PERM_VIEW_MODEL
	]);

	//team space
	define("ACCOUNT_PERM_LIST", [
		module.exports.PERM_ASSIGN_LICENCE,
		module.exports.PERM_REVOKE_LICENCE,
		module.exports.PERM_TEAMSPACE_ADMIN,
		module.exports.PERM_CREATE_PROJECT,
		module.exports.PERM_CREATE_JOB,
		module.exports.PERM_DELETE_JOB,
		module.exports.PERM_ASSIGN_JOB
	]);

	//project level permission
	define("PROJECT_PERM_LIST", [
		module.exports.PERM_CREATE_MODEL,
		module.exports.PERM_CREATE_FEDERATION,
		module.exports.PERM_PROJECT_ADMIN,
		module.exports.PERM_EDIT_PROJECT,
		module.exports.PERM_DELETE_PROJECT
	]);

	// models
	define("MODEL_PERM_LIST",[
		module.exports.PERM_CHANGE_MODEL_SETTINGS,
		module.exports.PERM_UPLOAD_FILES,
		module.exports.PERM_CREATE_ISSUE,
		module.exports.PERM_COMMENT_ISSUE,
		module.exports.PERM_VIEW_ISSUE,
		module.exports.PERM_VIEW_MODEL,
		module.exports.PERM_DOWNLOAD_MODEL,
		module.exports.PERM_EDIT_FEDERATION,
		module.exports.PERM_DELETE_FEDERATION,
		module.exports.PERM_DELETE_MODEL,
		module.exports.PERM_MANAGE_MODEL_PERMISSION
	]);

	//-----------------------------------------------------------------------------
	//
	// User templates
	//
	//-----------------------------------------------------------------------------

	define("ADMIN_TEMPLATE", "admin");
	define("COLLABORATOR_TEMPLATE", "collaborator");
	define("COMMENTER_TEMPLATE", "commenter");
	define("VIEWER_TEMPLATE", "viewer");

	define("VIEWER_TEMPLATE_PERMISSIONS", [
		module.exports.PERM_VIEW_ISSUE,
		module.exports.PERM_VIEW_MODEL
	]);

	define("COMMENTER_TEMPLATE_PERMISSIONS", [
		module.exports.PERM_CREATE_ISSUE,
		module.exports.PERM_COMMENT_ISSUE,
		module.exports.PERM_VIEW_ISSUE,
		module.exports.PERM_VIEW_MODEL
	]);

	define("COLLABORATOR_TEMPLATE_PERMISSIONS",[
		module.exports.PERM_UPLOAD_FILES,
		module.exports.PERM_CREATE_ISSUE,
		module.exports.PERM_COMMENT_ISSUE,
		module.exports.PERM_VIEW_ISSUE,
		module.exports.PERM_VIEW_MODEL,
		module.exports.PERM_DOWNLOAD_MODEL,
		module.exports.PERM_EDIT_FEDERATION,
	]);

	//-----------------------------------------------------------------------------
	//
	// Blacklist
	//
	//-----------------------------------------------------------------------------

	define("REPO_BLACKLIST_USERNAME", [
		"payment",
		"test",
		"os",
		"info",
		"contact",
		"cookies",
		"passwordChange",
		"passwordForgot",
		"pricing",
		"privacy",
		"registerRequest",
		"registerVerify",
		"signUp",
		"termsAndConditions",
		"false"
	]);

	define("REPO_BLACKLIST_PROJECT", [
		"database",
		"verify",
		"forgot-password",
		"password",
		"subscriptions",
		"billings",
		"projects"
	]);


	//-----------------------------------------------------------------------------
	//
	// Regular expressions
	//
	//-----------------------------------------------------------------------------

	define("USERNAME_REGEXP",  /^[a-zA-Z][\w]{1,19}$/);
	define("EMAIL_REGEXP", /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/);

	//-----------------------------------------------------------------------------
	//
	// Repo subscription plans
	//
	//-----------------------------------------------------------------------------
	define("BASIC_PLAN", "BASIC");
	define("PAID_PLAN", "THE-100-QUID-PLAN");


	//-----------------------------------------------------------------------------
	//
	// Invocie state
	//
	//-----------------------------------------------------------------------------
	define("INV_INIT", "init");
	define("INV_PENDING", "pending");
	define("INV_COMPLETE", "complete");

	//-----------------------------------------------------------------------------
	//
	// Invocie type
	//
	//-----------------------------------------------------------------------------
	define("INV_TYPE_INVOICE", "invoice");
	define("INV_TYPE_REFUND", "refund");

	//-----------------------------------------------------------------------------
	//
	// ipn type
	//
	//-----------------------------------------------------------------------------
	define("IPN_PAYMENT_INIT", "init");
	define("IPN_PAYMENT_SUCCESS", "success");
	define("IPN_PAYMENT_CANCEL", "cancel");
	define("IPN_PAYMENT_SUSPENDED", "suspended");
	define("IPN_PAYMENT_FAILED", "failed");
	define("IPN_PAYMENT_REFUNDED", "refunded");
	define("IPN_UNKONWN", "unkonwn");

	//-----------------------------------------------------------------------------
	//
	// Headers
	//
	//-----------------------------------------------------------------------------
	define("HEADER_SOCKET_ID", "x-socket-id");

	define("PROJECT_DEFAULT_ID", "default");
	
})();

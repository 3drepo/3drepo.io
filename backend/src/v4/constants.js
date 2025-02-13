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

"use strict";
(() => {

	const { uploadSizeLimit } = require("./config.js");
	const utils = require("./utils.js");

	function define(name, value) {
		Object.defineProperty(module.exports, name, {
			value: value,
			enumerable: true
		});
	}

	// -----------------------------------------------------------------------------
	//
	// New API
	//
	// -----------------------------------------------------------------------------

	// Overall constants
	define("MASTER_BRANCH_NAME", "master");
	define("ADMIN_DB", "admin");
	define("HEAD_REVISION_NAME", "revision");
	define("MASTER_BRANCH", "00000000-0000-0000-0000-000000000000");
	define("MASTER_UUID", utils.stringToUUID(module.exports.MASTER_BRANCH));

	define("DEFAULT_ROLE_OBJ", { db: "admin", role: "user" });
	define("DEFAULT_MEMBER_ROLE", "team_member");

	// Main collections (tables) in 3D Repo
	define("REPO_COLLECTION_SCENE", "scene");
	define("REPO_COLLECTION_HISTORY", "history");
	define("REPO_COLLECTION_STASH", "stash");

	// -----------------------------------------------------------------------------
	//
	// Node types
	//
	// -----------------------------------------------------------------------------

	define("REPO_NODE_TYPE_TRANSFORMATION", "transformation");
	define("REPO_NODE_TYPE_MESH", "mesh");
	define("REPO_NODE_TYPE_MATERIAL", "material");
	define("REPO_NODE_TYPE_TEXTURE", "texture");
	define("REPO_NODE_TYPE_CAMERA", "camera");
	define("REPO_NODE_TYPE_REVISION", "revision");
	define("REPO_NODE_TYPE_REF", "ref");
	define("REPO_NODE_TYPE_META", "meta");
	define("REPO_NODE_TYPE_MAP", "map");

	// -----------------------------------------------------------------------------
	//
	// Shared fields
	//
	// -----------------------------------------------------------------------------

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

	// -----------------------------------------------------------------------------
	//
	// Transformation fields
	//
	// -----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_MATRIX", "matrix");

	// -----------------------------------------------------------------------------
	//
	// Mesh fields
	//
	// -----------------------------------------------------------------------------

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

	// -----------------------------------------------------------------------------
	//
	// Texture fields
	//
	// -----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_EXTENSION", "extension");

	// -----------------------------------------------------------------------------
	//
	// Camera fields
	//
	// -----------------------------------------------------------------------------

	define("REPO_NODE_LABEL_LOOK_AT", "look_at");
	define("REPO_NODE_LABEL_POSITION", "position");
	define("REPO_NODE_LABEL_UP", "up");
	define("REPO_NODE_LABEL_FOV", "fov");
	define("REPO_NODE_LABEL_NEAR", "near");
	define("REPO_NODE_LABEL_FAR", "far");
	define("REPO_NODE_LABEL_ASPECT_RATIO", "aspect_ratio");

	// -----------------------------------------------------------------------------
	//
	// Revision fields
	//
	// -----------------------------------------------------------------------------

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

	// -----------------------------------------------------------------------------
	//
	// Merge map
	//
	// -----------------------------------------------------------------------------

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

	// -----------------------------------------------------------------------------
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

	// -----------------------------------------------------------------------------
	//
	// SRC format output
	//
	// -----------------------------------------------------------------------------

	define("SRC_IDX_LIST", "idx_list");
	define("SRC_VERTEX_LIMIT", 65535);

	// -----------------------------------------------------------------------------
	//
	// API server constants
	//
	// -----------------------------------------------------------------------------

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

	// -----------------------------------------------------------------------------
	//
	// MongoDB error codes
	//
	// -----------------------------------------------------------------------------

	define("MONGO_AUTH_FAILED", 18);
	define("MONGO_DUPLICATE_KEY", "11000");

	// -----------------------------------------------------------------------------
	//
	// Payment types
	//
	// -----------------------------------------------------------------------------
	define("PRO_RATA_PAYMENT", "pro-rata");
	define("REGULAR_PAYMENT", "regular");

	// -----------------------------------------------------------------------------
	//
	// Date format strings
	//
	// -----------------------------------------------------------------------------
	define("DATE_FORMAT", "YYYY-MM-DD");
	define("DATE_TIME_FORMAT", "DD-MM-YYYY HH:mm");

	// -----------------------------------------------------------------------------
	//
	// Permissions
	//
	// -----------------------------------------------------------------------------

	// not sure when to use
	define("PERM_CREATE_TEAM_SPACE", "create_team_space");
	define("PERM_DELETE_TEAM_SPACE", "delete_team_space");

	// team space
	define("PERM_ASSIGN_LICENCE", "assign_licence");
	define("PERM_REVOKE_LICENCE","revoke_licence");
	define("PERM_TEAMSPACE_ADMIN","teamspace_admin"); // have total control for projects and models under its teamspace
	define("PERM_CREATE_PROJECT", "create_project");
	define("PERM_VIEW_PROJECTS", "view_projects"),

	// project level permission
	define("PERM_CREATE_MODEL", "create_model");
	define("PERM_CREATE_FEDERATION", "create_federation");
	define("PERM_PROJECT_ADMIN", "admin_project");
	define("PERM_EDIT_PROJECT", "edit_project");
	define("PERM_DELETE_PROJECT", "delete_project");

	define("PERM_UPLOAD_FILES_ALL_MODELS", "upload_files_all_models");
	define("PERM_EDIT_FEDERATION_ALL_MODELS", "edit_federation_all_models");
	define("PERM_CREATE_ISSUE_ALL_MODELS", "create_issue_all_models");
	define("PERM_COMMENT_ISSUE_ALL_MODELS", "comment_issue_all_models");
	define("PERM_VIEW_ISSUE_ALL_MODELS", "view_issue_all_models");
	define("PERM_VIEW_MODEL_ALL_MODELS", "view_model_all_models");
	define("PERM_DOWNLOAD_MODEL_ALL_MODELS", "download_model_all_models");
	define("PERM_CHANGE_MODEL_SETTINGS_ALL_MODELS", "change_model_settings_all_models");

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

	// team space
	define("ACCOUNT_PERM_LIST", [
		module.exports.PERM_ASSIGN_LICENCE,
		module.exports.PERM_REVOKE_LICENCE,
		module.exports.PERM_TEAMSPACE_ADMIN,
		module.exports.PERM_CREATE_PROJECT,
		module.exports.PERM_VIEW_PROJECTS
	]);

	// project level permission
	define("PROJECT_PERM_LIST", [
		module.exports.PERM_CREATE_MODEL,
		module.exports.PERM_CREATE_FEDERATION,
		module.exports.PERM_PROJECT_ADMIN,
		module.exports.PERM_EDIT_PROJECT,
		module.exports.PERM_DELETE_PROJECT,
		module.exports.PERM_UPLOAD_FILES_ALL_MODELS,
		module.exports.PERM_EDIT_FEDERATION_ALL_MODELS,
		module.exports.PERM_CREATE_ISSUE_ALL_MODELS,
		module.exports.PERM_COMMENT_ISSUE_ALL_MODELS,
		module.exports.PERM_VIEW_ISSUE_ALL_MODELS,
		module.exports.PERM_VIEW_MODEL_ALL_MODELS,
		module.exports.PERM_DOWNLOAD_MODEL_ALL_MODELS,
		module.exports.PERM_CHANGE_MODEL_SETTINGS_ALL_MODELS
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

	define("MODEL_PERM_OBJ", {
		PERM_CHANGE_MODEL_SETTINGS : module.exports.PERM_CHANGE_MODEL_SETTINGS,
		PERM_UPLOAD_FILES : module.exports.PERM_UPLOAD_FILES,
		PERM_CREATE_ISSUE : module.exports.PERM_CREATE_ISSUE,
		PERM_COMMENT_ISSUE : module.exports.PERM_COMMENT_ISSUE,
		PERM_VIEW_ISSUE : module.exports.PERM_VIEW_ISSUE,
		PERM_VIEW_MODEL : module.exports.PERM_VIEW_MODEL,
		PERM_DOWNLOAD_MODEL : module.exports.PERM_DOWNLOAD_MODEL,
		PERM_EDIT_FEDERATION : module.exports.PERM_EDIT_FEDERATION,
		PERM_DELETE_FEDERATION : module.exports.PERM_DELETE_FEDERATION,
		PERM_DELETE_MODEL : module.exports.PERM_DELETE_MODEL,
		PERM_MANAGE_MODEL_PERMISSION : module.exports.PERM_MANAGE_MODEL_PERMISSION
	});

	define("IMPLIED_PERM", {
		[module.exports.PERM_TEAMSPACE_ADMIN]:{
			"account": module.exports.ACCOUNT_PERM_LIST,
			"project": module.exports.PROJECT_PERM_LIST,
			"model": module.exports.MODEL_PERM_LIST
		},

		[module.exports.PERM_VIEW_PROJECTS]:{
			"project": [module.exports.PERM_VIEW_ISSUE_ALL_MODELS, module.exports.PERM_VIEW_MODEL_ALL_MODELS],
			"model": [module.exports.PERM_VIEW_MODEL, module.exports.PERM_VIEW_ISSUE]
		},

		[module.exports.PERM_PROJECT_ADMIN]: {
			"project": module.exports.PROJECT_PERM_LIST,
			"model": module.exports.MODEL_PERM_LIST
		},

		[module.exports.PERM_UPLOAD_FILES_ALL_MODELS]: {
			"model": [module.exports.PERM_UPLOAD_FILES]
		},

		[module.exports.PERM_EDIT_FEDERATION_ALL_MODELS]: {
			"model": [module.exports.PERM_EDIT_FEDERATION]
		},

		[module.exports.PERM_CREATE_ISSUE_ALL_MODELS]: {
			"model": [module.exports.PERM_CREATE_ISSUE]
		},

		[module.exports.PERM_COMMENT_ISSUE_ALL_MODELS]: {
			"model": [module.exports.PERM_COMMENT_ISSUE]
		},

		[module.exports.PERM_VIEW_ISSUE_ALL_MODELS]: {
			"model": [module.exports.PERM_VIEW_ISSUE]
		},

		[module.exports.PERM_VIEW_MODEL_ALL_MODELS]: {
			"model": [module.exports.PERM_VIEW_MODEL]
		},

		[module.exports.PERM_DOWNLOAD_MODEL_ALL_MODELS]: {
			"model": [module.exports.PERM_DOWNLOAD_MODEL]
		},

		[module.exports.PERM_CHANGE_MODEL_SETTINGS_ALL_MODELS]: {
			"model": [module.exports.PERM_CHANGE_MODEL_SETTINGS]
		},

		[module.exports.PERM_MANAGE_MODEL_PERMISSION]: {
			"model": module.exports.MODEL_PERM_LIST
		}

	});

	// -----------------------------------------------------------------------------
	//
	// User templates
	//
	// -----------------------------------------------------------------------------

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
		module.exports.PERM_EDIT_FEDERATION
	]);

	define("ADMIN_TEMPLATE_PERMISSIONS",[
		module.exports.PERM_MANAGE_MODEL_PERMISSION
	]);

	// -----------------------------------------------------------------------------
	//
	// Blacklist
	//
	// -----------------------------------------------------------------------------

	define("REPO_BLACKLIST_USERNAME", [
		"payment",
		"test",
		"os",
		"info",
		"contact",
		"cookies",
		"password-change",
		"password-forgot",
		"pricing",
		"privacy",
		"register-request",
		"register-verify",
		"signUp",
		"termsAndConditions",
		"false",
		"admin",
		"local",
		"root",
		"notifications",
		"loginRecords",
		"internal"
	]);

	// -----------------------------------------------------------------------------
	//
	// Regular expressions
	//
	// -----------------------------------------------------------------------------

	define("USERNAME_REGEXP",  /^[a-zA-Z][\w]{1,19}$/);
	define("FILENAME_REGEXP",  /[ *"/\\[\]:;|=,<>$]/g);

	// -----------------------------------------------------------------------------
	//
	// Password requirements
	//
	// -----------------------------------------------------------------------------

	define("MIN_PASSWORD_LENGTH", 8);
	define("MIN_PASSWORD_STRENGTH", 2);

	// -----------------------------------------------------------------------------
	//
	// Repo subscription plans
	//
	// -----------------------------------------------------------------------------
	define("BASIC_PLAN", "BASIC");
	define("PAID_PLAN", "THE-100-QUID-PLAN");

	// -----------------------------------------------------------------------------
	//
	// Invoice state
	//
	// -----------------------------------------------------------------------------
	define("INV_INIT", "init");
	define("INV_PENDING", "pending");
	define("INV_COMPLETE", "complete");

	// -----------------------------------------------------------------------------
	//
	// Invocie type
	//
	// -----------------------------------------------------------------------------
	define("INV_TYPE_INVOICE", "invoice");
	define("INV_TYPE_REFUND", "refund");

	// -----------------------------------------------------------------------------
	//
	// ipn type
	//
	// -----------------------------------------------------------------------------
	define("IPN_PAYMENT_INIT", "init");
	define("IPN_PAYMENT_SUCCESS", "success");
	define("IPN_PAYMENT_CANCEL", "cancel");
	define("IPN_PAYMENT_SUSPENDED", "suspended");
	define("IPN_PAYMENT_FAILED", "failed");
	define("IPN_PAYMENT_REFUNDED", "refunded");
	define("IPN_UNKONWN", "unkonwn");

	// -----------------------------------------------------------------------------
	//
	// Headers
	//
	// -----------------------------------------------------------------------------
	define("HEADER_SOCKET_ID", "x-socket-id");

	define("PROJECT_DEFAULT_ID", "default");

	// min timestamp set to 100000000000
	// this is assumption for smallest millisecond timestamp
	// making this assumption because this is what https://www.epochconverter.com/ does
	// 100000000000 = GMT: Saturday, 3 March 1973 09:46:40
	define("MIN_MS_TIMESTAMP", 100000000000);

	// tickets
	define("LONG_TEXT_CHAR_LIM", 1200);

	// risks
	define("RISK_FILTERS",{
		"ids": {
			"fieldName": "_id" ,
			"type": "UUID"
		},
		"numbers": {
			"fieldName": "number",
			"type": "number"
		},
		"categories": {
			"fieldName": "category"
		},
		"mitigationStatus": {
			"fieldName": "mitigation_status"
		},
		"residualLikelihoods": {
			"fieldName": "residual_likelihood",
			"type": "number"
		},
		"residualConsequences": {
			"fieldName": "residual_consequence",
			"type": "number"
		},
		"consequences": {
			"fieldName": "consequence",
			"type": "number"
		},
		"likelihoods": {
			"fieldName": "likelihood",
			"type": "number"
		},
		"levelOfRisks": {
			"fieldName": "levelOfRisks",
			"type": "number"
		},
		"residualLevelOfRisks": {
			"fieldName": "residualLevelOfRisks",
			"type": "number"
		}
	});

	// issues
	define("ISSUE_FILTERS",{
		"ids": {
			"fieldName": "_id" ,
			"type": "UUID"
		},
		"numbers": {
			"fieldName": "number",
			"type": "number"
		},
		"topicTypes": {
			"fieldName": "topic_type" // if no type is defined string is assumed
		},
		"status": {
			"fieldName": "status"
		},
		"priorities": {
			"fieldName": "priority"
		},
		"owners" : {
			"fieldName": "owner"
		},
		"assignedRoles" : {
			"fieldName": "assigned_roles",
			"type": "array"
		}
	});

	define("ISSUE_STATUS",{
		"OPEN": "open",
		"IN_PROGRESS": "in progress",
		"FOR_APPROVAL": "for approval",
		"VOID": "void",
		"CLOSED": "closed"
	});

	define("MAIL_URLS",{
		"forgotPassword": data => `/password-change?username=${data.username}&token=${data.token}`,
		"verify": data => `/register-verify?username=${data.username}&token=${data.token}` + (data.pay ? "&pay=true" : ""),
		"model": data => `/viewer/${data.model}`,
		"signup": () => "/sign-up"
	});

	define("ACCEPTED_IMAGE_FORMATS",  ["png", "jpg", "jpeg", "gif"]);

	// -----------------------------------------------------------------------------
	//
	// Upload
	//
	// -----------------------------------------------------------------------------
	define("ACCEPTED_FILE_FORMATS", [
		"x","obj","3ds","md3","md2","ply",
		"mdl","ase","hmp","smd","mdc","md5",
		"stl","lxo","nff","raw","off","ac",
		"bvh","irrmesh","irr","q3d","q3s","b3d",
		"dae","ter","csm","3d","lws","xml","ogex",
		"ms3d","cob","scn","blend","pk3","ndo",
		"ifc","xgl","zgl","fbx","assbin", "bim", "dgn",
		"rvt", "rfa", "spm", "dwg", "dxf", "nwd", "nwc"
	]);
	define("MS_CHUNK_BYTES_LIMIT", Math.min(52428800, uploadSizeLimit));
	define("CONTENT_LENGTH_HEADER", "content-length");
	define("MS_TRANSFER_MODE_HEADER", "x-ms-transfer-mode");
	define("MS_CONTENT_LENGTH_HEADER", "x-ms-content-length");
	define("CONTENT_RANGE_HEADER", "content-range");

})();

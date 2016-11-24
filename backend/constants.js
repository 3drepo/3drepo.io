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

	//-----------------------------------------------------------------------------
	//
	// MongoDB error codes
	//
	//-----------------------------------------------------------------------------

	define("MONGO_AUTH_FAILED", 18);

	//-----------------------------------------------------------------------------
	//
	// Roles
	//
	//-----------------------------------------------------------------------------

	define("REPO_ROLE_SUBCONTRACTOR", "SubContractor");
	define("REPO_ROLE_MAINCONTRACTOR", "MainContractor");

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
		"billings"
	]);

})();
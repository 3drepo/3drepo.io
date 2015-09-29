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

module.exports = {
	/** 
	
	define : function(name, value) {
		"use strict";
		Object.module.exports.defineProperty(this, name, {
	     	value:      value,
	     	enumerable: true
	    });
	}
};

//-----------------------------------------------------------------------------
//
// New API
//
//-----------------------------------------------------------------------------

// Main collections (tables) in 3D Repo
module.exports.define("REPO_COLLECTION_SCENE", "scene");
module.exports.define("REPO_COLLECTION_HISTORY", "history");

//-----------------------------------------------------------------------------
// Node types
module.exports.define("REPO_NODE_TYPE_TRANSFORMATION", "transformation");
module.exports.define("REPO_NODE_TYPE_MESH", "mesh");
module.exports.define("REPO_NODE_TYPE_MATERIAL", "material");
module.exports.define("REPO_NODE_TYPE_TEXTURE", "texture");
module.exports.define("REPO_NODE_TYPE_CAMERA", "camera");
module.exports.define("REPO_NODE_TYPE_REVISION", "revision");
module.exports.define("REPO_NODE_TYPE_REF", "ref");
module.exports.define("REPO_NODE_TYPE_META", "meta");
module.exports.define("REPO_NODE_TYPE_MAP", "map");

//-----------------------------------------------------------------------------
// Shared fields
module.exports.define("REPO_NODE_LABEL_UNIQUE_ID", "_id");
module.exports.define("REPO_NODE_LABEL_SHARED_ID", "shared_id");
module.exports.define("REPO_NODE_LABEL_REV_ID", "rev_id");
module.exports.define("REPO_NODE_LABEL_API", "api");
module.exports.define("REPO_NODE_LABEL_PATH", "paths"); // TODO: remove but make sure all references are fixed!
module.exports.define("REPO_NODE_LABEL_PATHS", "paths"); // fixed typo
module.exports.define("REPO_NODE_LABEL_TYPE", "type");
module.exports.define("REPO_NODE_LABEL_PARENTS", "parents");
module.exports.define("REPO_NODE_LABEL_NAME", "name");

//-----------------------------------------------------------------------------
// Transformation fields
module.exports.define("REPO_NODE_LABEL_MATRIX", "matrix");

//-----------------------------------------------------------------------------
// Mesh fields
module.exports.define("REPO_NODE_LABEL_VERTICES", "vertices");
module.exports.define("REPO_NODE_LABEL_VERTICES_COUNT", "vertices_count");
module.exports.define("REPO_NODE_LABEL_VERTICES_BYTE_COUNT", "vertices_byte_count");
module.exports.define("REPO_NODE_LABEL_NORMALS", "normals");
module.exports.define("REPO_NODE_LABEL_FACES", "faces");
module.exports.define("REPO_NODE_LABEL_FACES_COUNT", "faces_count");
module.exports.define("REPO_NODE_LABEL_FACES_BYTE_COUNT", "faces_byte_count");
module.exports.define("REPO_NODE_LABEL_UV_CHANNELS", "uv_channels");
module.exports.define("REPO_NODE_LABEL_UV_CHANNELS_COUNT", "uv_channels_count");
module.exports.define("REPO_NODE_LABEL_BOUNDING_BOX", "bounding_box");

//-----------------------------------------------------------------------------
// Texture fields
module.exports.define("REPO_NODE_LABEL_EXTENSION", "extension");

//-----------------------------------------------------------------------------
// Camera fields
module.exports.define("REPO_NODE_LABEL_LOOK_AT", "look_at");
module.exports.define("REPO_NODE_LABEL_POSITION", "position");
module.exports.define("REPO_NODE_LABEL_UP", "up");
module.exports.define("REPO_NODE_LABEL_FOV", "fov");
module.exports.define("REPO_NODE_LABEL_NEAR", "near");
module.exports.define("REPO_NODE_LABEL_FAR", "far");
module.exports.define("REPO_NODE_LABEL_ASPECT_RATIO", "aspect_ratio");

//-----------------------------------------------------------------------------
// Revision fields
module.exports.define("REPO_NODE_LABEL_AUTHOR", "author");
module.exports.define("REPO_NODE_LABEL_CURRENT", "current");
module.exports.define("REPO_NODE_LABEL_CURRENT_UNIQUE_IDS", "current");
module.exports.define("REPO_NODE_LABEL_MESSAGE", "message");
module.exports.define("REPO_NODE_LABEL_TIMESTAMP", "timestamp");
module.exports.define("REPO_NODE_LABEL_ADDED_SHARED_IDS", "added");
module.exports.define("REPO_NODE_LABEL_DELETED_SHARED_IDS", "deleted");
module.exports.define("REPO_NODE_LABEL_MODIFIED_SHARED_IDS", "modified");
module.exports.define("REPO_NODE_LABEL_UNMODIFIED_SHARED_IDS", "unmodified");

//-----------------------------------------------------------------------------
// Merge map
module.exports.define("REPO_NODE_LABEL_MERGED_NODES", "merged_nodes");
module.exports.define("REPO_NODE_LABEL_VERTEX_MAP", "v_map");
module.exports.define("REPO_NODE_LABEL_TRIANGLE_MAP", "t_map");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_MESH_ID", "map_id");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID", "mat_id");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_FROM", "from");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_TO", "to");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM", "v_from");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO", "v_to");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM", "t_from");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO", "t_to");
module.exports.define("REPO_NODE_LABEL_COMBINED_MAP", "m_map");
module.exports.define("REPO_NODE_LABEL_MERGE_MAP_OFFSET", "offset");

//-----------------------------------------------------------------------------
// X3DOM module.exports.defines
module.exports.define("X3DOM_SRC_BYTE", 5120);
module.exports.define("X3DOM_SRC_UBYTE", 5121);
module.exports.define("X3DOM_SRC_SHORT", 5122);
module.exports.define("X3DOM_SRC_USHORT", 5123);
module.exports.define("X3DOM_SRC_INT", 5124);
module.exports.define("X3DOM_SRC_UINT", 5125);
module.exports.define("X3DOM_SRC_FLOAT", 5126);
module.exports.define("X3DOM_SRC_TRIANGLE", 4);

//-----------------------------------------------------------------------------
// Following fields are not stored in the repository,
// they are only implied!
// TODO: refactor name such as UNUSED_LABEL to distinguishe from DB fields!
module.exports.define("REPO_NODE_LABEL_CHILDREN", "children");
module.exports.define("REPO_NODE_LABEL_CAMERAS", "cameras");
module.exports.define("REPO_SCENE_LABEL_MATERIALS_COUNT", "materials_count");
module.exports.define("REPO_SCENE_LABEL_MESHES_COUNT", "meshes_count");
module.exports.define("REPO_SCENE_LABEL_TEXTURES_COUNT", "textures_count");
module.exports.define("REPO_SCENE_LABEL_CAMERAS_COUNT", "cameras_count");
module.exports.define("REPO_HISTORY_LABEL_REVISIONS_COUNT", "revisions_count");
module.exports.define("REPO_SCENE_LABEL_REF_COUNT", "ref_count");
module.exports.define("REPO_SCENE_LABEL_METAS_COUNT", "meta_count");
module.exports.define("REPO_SCENE_LABEL_MAPS_COUNT", "map_count");

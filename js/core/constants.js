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

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//-----------------------------------------------------------------------------
//
// New API
//
//-----------------------------------------------------------------------------

// Main collections (tables) in 3D Repo
define('REPO_COLLECTION_SCENE', 'scene');
define('REPO_COLLECTION_HISTORY', 'history');

//-----------------------------------------------------------------------------
// Node types
define('REPO_NODE_TYPE_TRANSFORMATION', 'transformation');
define('REPO_NODE_TYPE_MESH', 'mesh');
define('REPO_NODE_TYPE_MATERIAL', 'material');
define('REPO_NODE_TYPE_TEXTURE', 'texture');
define('REPO_NODE_TYPE_CAMERA', 'camera');
define('REPO_NODE_TYPE_REVISION', 'revision');
define('REPO_NODE_TYPE_REF', 'ref');
define('REPO_NODE_TYPE_META', 'meta');

//-----------------------------------------------------------------------------
// Shared fields
define('REPO_NODE_LABEL_ID', '_id'); // TODO: remove all references to replace with UNIQUE_ID instead
define('REPO_NODE_LABEL_UNIQUE_ID', '_id'); 
define('REPO_NODE_LABEL_SHARED_ID', 'shared_id');
define('REPO_NODE_LABEL_API', 'api');
define('REPO_NODE_LABEL_PATH', 'paths'); // TODO: remove but make sure all references are fixed!
define('REPO_NODE_LABEL_PATHS', 'paths'); // fixed typo 
define('REPO_NODE_LABEL_TYPE', 'type');
define('REPO_NODE_LABEL_PARENTS', 'parents');
define('REPO_NODE_LABEL_NAME', 'name');

//-----------------------------------------------------------------------------
// Transformation fields
define('REPO_NODE_LABEL_MATRIX', 'matrix');

//-----------------------------------------------------------------------------
// Mesh fields
define('REPO_NODE_LABEL_VERTICES', 'vertices');
define('REPO_NODE_LABEL_VERTICES_COUNT', 'vertices_count');
define('REPO_NODE_LABEL_VERTICES_BYTE_COUNT', 'vertices_byte_count');
define('REPO_NODE_LABEL_NORMALS', 'normals');
define('REPO_NODE_LABEL_FACES', 'faces');
define('REPO_NODE_LABEL_FACES_COUNT', 'faces_count');
define('REPO_NODE_LABEL_FACES_BYTE_COUNT', 'faces_byte_count');
define('REPO_NODE_LABEL_UV_CHANNELS', 'uv_channels');
define('REPO_NODE_LABEL_UV_CHANNELS_COUNT', 'uv_channels_count');
define('REPO_NODE_LABEL_BOUNDING_BOX', 'bounding_box');

//-----------------------------------------------------------------------------
// Texture fields
define('REPO_NODE_LABEL_EXTENSION', 'extension');

//-----------------------------------------------------------------------------
// Camera fields
define('REPO_NODE_LABEL_LOOK_AT', 'look_at');
define('REPO_NODE_LABEL_POSITION', 'position');
define('REPO_NODE_LABEL_UP', 'up');
define('REPO_NODE_LABEL_FOV', 'fov');
define('REPO_NODE_LABEL_NEAR', 'near');
define('REPO_NODE_LABEL_FAR', 'far');
define('REPO_NODE_LABEL_ASPECT_RATIO', 'aspect_ratio');


//-----------------------------------------------------------------------------
// Revision fields
define('REPO_NODE_LABEL_AUTHOR', 'author');
define('REPO_NODE_LABEL_CURRENT', 'current');
define('REPO_NODE_LABEL_CURRENT_UNIQUE_IDS', 'current');
define('REPO_NODE_LABEL_MESSAGE', 'message');
define('REPO_NODE_LABEL_TIMESTAMP', 'timestamp');
define('REPO_NODE_LABEL_ADDED_SHARED_IDS', 'added');
define('REPO_NODE_LABEL_DELETED_SHARED_IDS', 'deleted');
define('REPO_NODE_LABEL_MODIFIED_SHARED_IDS', 'modified');
define('REPO_NODE_LABEL_UNMODIFIED_SHARED_IDS', 'unmodified');

//-----------------------------------------------------------------------------
// Following fields are not stored in the repository,
// they are only implied!
// TODO: refactor name such as UNUSED_LABEL to distinguishe from DB fields!
define('REPO_NODE_LABEL_CHILDREN', 'children');
define('REPO_NODE_LABEL_CAMERAS', 'cameras');
define('REPO_SCENE_LABEL_MATERIALS_COUNT', 'materials_count');
define('REPO_SCENE_LABEL_MESHES_COUNT', 'meshes_count');
define('REPO_SCENE_LABEL_TEXTURES_COUNT', 'textures_count');
define('REPO_SCENE_LABEL_CAMERAS_COUNT', 'cameras_count');
define('REPO_HISTORY_LABEL_REVISIONS_COUNT', 'revisions_count');
define('REPO_SCENE_LABEL_REF_COUNT', 'ref_count');
define('REPO_SCENE_LABEL_METAS_COUNT', 'meta_count');

//-----------------------------------------------------------------------------
//
// Old API
//
//-----------------------------------------------------------------------------
define('AI_MESH', 'aiMesh');
define('AI_NODE', 'aiNode');
define('AI_MATERIAL', 'aiMaterial');
define('UUID', 'uuid');
define('PATH', 'path');
define('TYPE', 'type');
define('INDEX', 'index');
define('FACES_ARRAY_SIZE', 'facesArraySize');
define('M_PARENT', 'mParent');
define('M_NAME', 'mName');
define('M_MESHES', 'mMeshes');
define('M_TRANSFORMATION', 'mTransformation');
define('M_NUM_VERTICES', 'mNumVertices');
define('M_FACES', 'mFaces');
define('M_MATERIAL_INDEX', 'mMaterialIndex');
define('M_NORMALS', 'mNormals');
define('M_PRIMITIVE_TYPES', 'mPrimitiveTypes');
define('M_TANGENTS', 'mTangents');
define('M_VERTICES', 'mVertices');
define('AI_MATKEY_NAME', 'AI_MATKEY_NAME');
define('AI_MATKEY_COLOR_AMBIENT', 'AI_MATKEY_COLOR_AMBIENT');
define('AI_MATKEY_COLOR_DIFFUSE', 'AI_MATKEY_COLOR_DIFFUSE');
define('AI_MATKEY_COLOR_EMISSIVE', 'AI_MATKEY_COLOR_EMISSIVE');
define('AI_MATKEY_COLOR_SPECULAR', 'AI_MATKEY_COLOR_SPECULAR');
define('AI_MATKEY_ENABLE_WIREFRAME', 'AI_MATKEY_ENABLE_WIREFRAME');
define('AI_MATKEY_SHININESS', 'AI_MATKEY_SHININESS');
define('AI_MATKEY_SHININESS_STRENGTH', 'AI_MATKEY_SHININESS_STRENGTH');
define('AI_MATKEY_TWOSIDED', 'AI_MATKEY_TWOSIDED');

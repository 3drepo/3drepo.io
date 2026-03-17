/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const systemFailureMsg = { message: 'System error occured. Please contact support.', userErr: false };
const ModelSettingConstants = {};
ModelSettingConstants.SETTINGS_COL = 'settings';
// Codes should match with https://github.com/3drepo/3drepobouncer/blob/master/bouncer/src/repo/error_codes.h
const importErrorMapping = {
	0: { success: true },
	1: { ...systemFailureMsg, internalError: 'REPOERR_LAUNCHING_COMPUTE_CLIENT' },
	2: { ...systemFailureMsg, internalError: 'REPOERR_AUTH_FAILED' },
	3: { ...systemFailureMsg, internalError: 'REPOERR_UNKNOWN_CMD' },
	4: { ...systemFailureMsg, internalError: 'REPOERR_UNKNOWN_ERR' },
	5: { ...systemFailureMsg, message: 'Unable to process your model file. Please contact support.', internalError: 'REPOERR_LOAD_SCENE_FAIL' },
	6: { ...systemFailureMsg, internalError: 'REPOERR_STASH_GEN_FAIL' },
	7: { success: true, message: 'One or more textures could not be found.', userErr: true, internalError: 'REPOERR_LOAD_SCENE_MISSING_TEXTURE' },
	8: { ...systemFailureMsg, internalError: 'REPOERR_INVALID_ARG' },
	9: { ...systemFailureMsg, internalError: 'REPOERR_FED_GEN_FAIL' },
	10: { success: true, message: 'Some nodes cannot be processed.', userErr: true, internalError: 'REPOERR_LOAD_SCENE_MISSING_NODES' },
	11: { ...systemFailureMsg, internalError: 'REPOERR_GET_FILE_FAILED' },
	12: { ...systemFailureMsg, internalError: 'REPOERR_CRASHED' },
	13: { ...systemFailureMsg, internalError: 'REPOERR_PARAM_FILE_READ_FAILED' },
	14: { ...systemFailureMsg, internalError: 'REPOERR_BUNDLE_GEN_FAILED' },
	15: { success: true, message: 'One or more meshes were not triangulated.', userErr: true, internalError: 'REPOERR_LOAD_SCENE_INVALID_MESHES' },
	16: { ...systemFailureMsg, internalError: 'REPOERR_ARG_FILE_FAIL' },
	17: { message: 'Cannot find any geometry.', userErr: true, internalError: 'REPOERR_NO_MESHES' },
	18: { message: 'Unsupported file type.', userErr: true, internalError: 'REPOERR_FILE_TYPE_NOT_SUPPORTED' },
	19: { ...systemFailureMsg, internalError: 'REPOERR_MODEL_FILE_READ' },
	20: { ...systemFailureMsg, internalError: 'REPOERR_FILE_ASSIMP_GEN' },
	21: { ...systemFailureMsg, internalError: 'REPOERR_FILE_IFC_GEO_GEN' },
	22: { message: 'The version of BIM file provided is no longer supported. Please update your plugin.', userErr: true, internalError: 'REPOERR_UNSUPPORTED_BIM_VERSION' },
	23: { message: 'The version of FBX file provided is not supported (Supported versions: 2011, 2012, 2013).', userErr: true, internalError: 'REPOERR_UNSUPPORTED_FBX_VERSION' },
	24: { message: 'This version of the file is currently not supported.', userErr: true, internalError: 'REPOERR_UNSUPPORTED_VERSION' },
	25: { message: 'Too many objects, please consider splitting up the model.', userErr: true, internalError: 'REPOERR_MAX_NODES_EXCEEDED' },
	26: { ...systemFailureMsg, internalError: 'REPOERR_ODA_UNAVAILABLE' },
	27: { message: 'Cannot find a view with the specified name in the file. Please check the name of the provided view.', userErr: true, internalError: 'REPOERR_VIEW_NOT_FOUND' },
	28: { ...systemFailureMsg, internalError: 'REPOERR_INVALID_CONFIG_FILE' },
	29: { message: 'Process timed out, please reduce the model size and try again.', internalError: 'REPOERR_TIMEOUT' },
	30: { ...systemFailureMsg, internalError: 'REPOERR_SYNCHRO_UNAVAILABLE' },
	31: { message: 'Sequence is too big. Please simplify and try again.', userErr: true, internalError: 'REPOERR_SYNCHRO_SEQUENCE_TOO_BIG' },
	32: { ...systemFailureMsg, internalError: 'REPOERR_UPLOAD_FAILED' },
	33: { ...systemFailureMsg, internalError: 'REPOERR_TOY_IMPORT_FAILED' },
	34: { message: 'An error occured whilst processing the geometry, please contact support.', internalError: 'REPOERR_GEOMETRY_ERROR' },
	35: { ...systemFailureMsg, internalError: 'REPOERR_UNITY_LICENSE_INVALID' },
	36: { message: 'Failed to validate 3D Repo Server License. Please contact support.', internalError: 'ERRCODE_REPO_LICENCE_INVALID' },
	37: { message: 'The file provided was encrypted or password protected. Please provide a file that can be opened without a password.', userErr: true, internalError: 'REPOERR_FILE_IS_ENCRYPTED' },
	38: { message: 'Failed to generate image file from drawing. If this is unexpected, please contact support.', internalError: 'REPOERR_IMAGE_PROCESSING_FAILED' },
	39: { message: 'The schema of the IFC file provided is not supported (Supported schemas: 2x3, 4, 4x1, 4x2, 4x3 (Add2)).', userErr: true, internalError: 'REPOERR_FILE_IFC_UNSUPPORTED_SCHEMA' },
	40: { message: 'The specified view is not a 3D view. When importing a specific view, only 3D views are supported.', userErr: true, internalError: 'REPOERR_VIEW_NOT_3D' },
};

ModelSettingConstants.processStatuses = {
	OK: 'ok',
	FAILED: 'failed',
	UPLOADING: 'uploading',
	UPLOADED: 'uploaded',
	QUEUED: 'queued',
	PROCESSING: 'processing',
	GENERATING_BUNDLES: 'Generating Bundles',
	QUEUED_FOR_UNITY: 'Queued for Unity',
};

ModelSettingConstants.getInfoFromCode = (code) => (
	importErrorMapping[code] || systemFailureMsg
);

ModelSettingConstants.modelTypes = {
	CONTAINER: 'container',
	FEDERATION: 'federation',
	DRAWING: 'drawing',
};

ModelSettingConstants.MODEL_CATEGORIES = [
	'Architectural',
	'Existing',
	'GIS',
	'Infrastructure',
	'Interior',
	'Landscape',
	'MEP',
	'Mechanical',
	'Structural',
	'Survey',
	'Other',
];

ModelSettingConstants.statusCodes = [
	{ code: 'S0', description: 'Initial status' },
	{ code: 'S1', description: 'Suitable for coordination' },
	{ code: 'S2', description: 'Suitable for information' },
	{ code: 'S3', description: 'Suitable for review and comment' },
	{ code: 'S4', description: 'Suitable for stage approval' },
	{ code: 'S6', description: 'Suitable for PIM authorization' },
	{ code: 'S7', description: 'Suitable for AIM authorization' },
	{ code: 'A1', description: 'Authorized and accepted' },
	{ code: 'A2', description: 'Authorized and accepted' },
	{ code: 'A3', description: 'Authorized and accepted' },
	{ code: 'A4', description: 'Authorized and accepted' },
	{ code: 'A5', description: 'Authorized and accepted' },
	{ code: 'A6', description: 'Authorized and accepted' },
	{ code: 'A7', description: 'Authorized and accepted' },
	{ code: 'A8', description: 'Authorized and accepted' },
	{ code: 'A9', description: 'Authorized and accepted' },
	{ code: 'B1', description: 'Partial sign-off (with comments)' },
	{ code: 'B2', description: 'Partial sign-off (with comments)' },
	{ code: 'B3', description: 'Partial sign-off (with comments)' },
	{ code: 'B4', description: 'Partial sign-off (with comments)' },
	{ code: 'B5', description: 'Partial sign-off (with comments)' },
	{ code: 'B6', description: 'Partial sign-off (with comments)' },
	{ code: 'B7', description: 'Partial sign-off (with comments)' },
	{ code: 'B8', description: 'Partial sign-off (with comments)' },
	{ code: 'B9', description: 'Partial sign-off (with comments)' },
	{ code: 'CR', description: 'As constructed record document' },
];

module.exports = ModelSettingConstants;

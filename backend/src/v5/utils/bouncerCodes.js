/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { toCamelCase, toConstantCase } = require('./helper/strings');

const BouncerCodes = {};

BouncerCodes.templates = {
	0: { message: '0 (REPOERR_OK)', description: 'Success' },
	1: { message: '1 (REPOERR_LAUNCHING_COMPUTE_CLIENT)', description: 'Bouncer failed to start - this never gets returned by bouncer client, but bouncer worker will return this' },
	2: { message: '2 (REPOERR_AUTH_FAILED)', description: 'authentication to database failed' },
	3: { message: '3 (REPOERR_UNKNOWN_CMD)', description: 'unrecognised command' },
	4: { message: '4 (REPOERR_UNKNOWN_ERR)', description: 'unknown error (caught exception)' },
	5: { message: '5 (REPOERR_LOAD_SCENE_FAIL)', description: 'failed to import file to scene' },
	6: { message: '6 (REPOERR_STASH_GEN_FAIL)', description: 'failed to generate stash graph' },
	7: { message: '7 (REPOERR_LOAD_SCENE_MISSING_TEXTURE)', description: 'Scene uploaded, but missing texture' },
	8: { message: '8 (REPOERR_INVALID_ARG)', description: 'invalid arguments to function' },
	9: { message: '9 (REPOERR_FED_GEN_FAIL)', description: 'failed to generate federation' },
	10: { message: '10 (REPOERR_LOAD_SCENE_MISSING_NODES)', description: 'Scene uploaded but missing some nodes' },
	11: { message: '11 (REPOERR_GET_FILE_FAILED)', description: 'Failed to get file from project' },
	12: { message: '12 (REPOERR_CRASHED)', description: 'Failed to finish (i.e. crashed)' },
	13: { message: '13 (REPOERR_PARAM_FILE_READ_FAILED)', description: 'Failed to read import parameters from file (Unity)' },
	14: { message: '14 (REPOERR_BUNDLE_GEN_FAILED)', description: 'Failed to generate asset bundles (Unity)' },
	15: { message: '15 (REPOERR_LOAD_SCENE_INVALID_MESHES)', description: 'Scene loaded, has untriangulated meshes' },
	16: { message: '16 (REPOERR_ARG_FILE_FAIL)', description: 'Failed to read the fail containing model information' },
	17: { message: '17 (REPOERR_NO_MESHES)', description: 'The file loaded has no meshes' },
	18: { message: '18 (REPOERR_FILE_TYPE_NOT_SUPPORTED)', description: 'Unsupported file extension' },
	19: { message: '19 (REPOERR_MODEL_FILE_READ)', description: 'Failed to read model file' },
	20: { message: '20 (REPOERR_FILE_ASSIMP_GEN)', description: 'Failed during assimp generation' },
	21: { message: '21 (REPOERR_FILE_IFC_GEO_GEN)', description: 'Failed during IFC geometry generation' },
	22: { message: '22 (REPOERR_UNSUPPORTED_BIM_VERSION)', description: 'Bim file version unsupported' },
	23: { message: '23 (REPOERR_UNSUPPORTED_FBX_VERSION)', description: 'FBX file version unsupported' },
	24: { message: '24 (REPOERR_UNSUPPORTED_VERSION)', description: 'Unsupported file version (generic)' },
	25: { message: '25 (REPOERR_MAX_NODES_EXCEEDED)', description: 'Exceed the maximum amount fo nodes' },
	26: { message: '26 (REPOERR_ODA_UNAVAILABLE)', description: 'When ODA not compiled in but dgn import requested' },
	27: { message: '27 (REPOERR_VIEW_NOT_FOUND)', description: 'The specified view (if any) was not found (for Revit format)' },
	28: { message: '28 (REPOERR_INVALID_CONFIG_FILE)', description: 'Failed reading configuration file' },
	29: { message: '29 (REPOERR_TIMEOUT)', description: 'Process timed out (only used in bouncer_worker)' },
	30: { message: '30 (REPOERR_SYNCHRO_UNAVAILABLE)', description: 'When Synchro is not compiled within the library' },
	31: { message: '31 (REPOERR_SYNCHRO_SEQUENCE_TOO_BIG)', description: 'Synchro sequence exceed size of bson' },
	32: { message: '32 (REPOERR_UPLOAD_FAILED)', description: 'Imported successfully, but failed to upload it to the database/fileshares' },
	33: { message: '33 (REPOERR_TOY_IMPORT_FAILED)', description: 'Trying to import toy project but failed (only used by bouncer_worker)' },
	34: { message: '34 (REPOERR_GEOMETRY_ERROR)', description: 'The scene was read successfully but failed during geometry processing due to content problem' },
	35: { message: '35 (REPOERR_UNITY_LICENSE_INVALID)', description: 'Used in bouncer worker only' },
	36: { message: '36 (ERRCODE_REPO_LICENCE_INVALID)', description: 'When a component fails a 3drepo license check' },
	37: { message: '37 (REPOERR_FILE_IS_ENCRYPTED)', description: 'When a password protected or encrypted file is provided' },
	38: { message: '38 (REPOERR_IMAGE_PROCESSING_FAILED)', description: 'When image processing failed (only used by bouncer_worker)' },
	39: { message: '39 (REPOERR_FILE_IFC_UNSUPPORTED_SCHEMA)', description: 'When the Ifc file uses a schema that is not supported by the importer' },
	40: { message: '40 (REPOERR_VIEW_NOT_3D)', description: 'The specified view was found, but it is not a 3D view' },
};

Object.keys(BouncerCodes.templates).forEach((key) => {
	BouncerCodes.templates[key].code = toConstantCase(key);
	BouncerCodes.templates[key].value = BouncerCodes.templates[key].code;
});

BouncerCodes.codeExists = (code) => !!BouncerCodes.templates[toCamelCase(code)];

module.exports = BouncerCodes;

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
// Codes should match with https://github.com/3drepo/3drepobouncer/blob/master/bouncer/src/repo/error_codes.h
const importErrorMapping = {
	0: { success: true },
	1: systemFailureMsg,
	2: systemFailureMsg,
	3: systemFailureMsg,
	4: systemFailureMsg,
	5: { ...systemFailureMsg, message: 'Unable to process your model file. Please contact support.' },
	6: systemFailureMsg,
	7: { success: true, message: 'One or more textures could not be found.', userErr: true },
	8: systemFailureMsg,
	9: systemFailureMsg,
	10: { success: true, message: 'Some nodes cannot be processed.', userErr: true },
	11: systemFailureMsg,
	12: systemFailureMsg,
	13: systemFailureMsg,
	14: systemFailureMsg,
	15: { success: true, message: 'One or more meshes were not triangulated.', userErr: true },
	16: systemFailureMsg,
	17: { message: 'Cannot find any geometry.', userErr: true },
	18: { message: 'Unsupported file type.', userErr: true },
	19: systemFailureMsg,
	20: systemFailureMsg,
	21: systemFailureMsg,
	22: { message: 'The version of BIM file provided is no longer supported. Please update your plugin.', userErr: true },
	23: { message: 'The version of FBX file provided is not supported (Supported versions: 2011, 2012, 2013).', userErr: true },
	24: { message: 'This version of the file is currently not supported.', userErr: true },
	25: { message: 'Too many objects, please consider splitting up the model.', userErr: true },
	26: systemFailureMsg,
	27: { message: 'Cannot find a 3D view within the file. Please create one and try again.', userErr: true },
	28: systemFailureMsg,
	29: { message: 'Process timed out, please reduce the model size and try again.' },
	30: systemFailureMsg,
	31: { message: 'Sequence is too big. Please simplify and try again.', userErr: true },
	32: systemFailureMsg,
	33: systemFailureMsg,
	34: { message: 'An error occured whilst processing the geometry, please contact support.' },
	35: systemFailureMsg,
	36: { message: 'Failed to validate 3D Repo Server License. Please contact support.' },
};

ModelSettingConstants.getInfoFromCode = (code) => importErrorMapping[code] || systemFailureMsg;

module.exports = ModelSettingConstants;

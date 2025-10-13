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

const { fromBuffer: fileTypeFromBuffer, fromFile: fileTypeFromFile } = require('file-type');
const UUIDParse = require('uuid-parse');
const _ = require('lodash');
const { existsSync: pathCheck } = require('fs');

const TypeChecker = {};

TypeChecker.isArray = Array.isArray;
TypeChecker.isBuffer = (buf) => !!(buf && Buffer.isBuffer(buf));
TypeChecker.isDate = _.isDate;
TypeChecker.isString = (value) => _.isString(value);
TypeChecker.isObject = (value) => _.isObject(value) && !TypeChecker.isArray(value);
TypeChecker.isNumber = (value) => _.isNumber(value);
TypeChecker.isBooleanString = (value) => value?.toLowerCase() === 'true' || value?.toLowerCase() === 'false';
TypeChecker.isNumberString = (value) => !_.isNaN(Number(value));
TypeChecker.isUUIDString = (uuid) => {
	if (!TypeChecker.isString(uuid)) return false;
	const hasMatch = uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
	return hasMatch?.length > 0;
};
TypeChecker.isUUID = (uuid) => {
	if (!TypeChecker.isObject(uuid)) return false;
	try {
		const uuidString = UUIDParse.unparse(uuid.buffer);
		return TypeChecker.isUUIDString(uuidString);
	} catch {
		return false;
	}
};

const getTypeFromBuffer = (fileBuffer) => (Buffer.isBuffer(fileBuffer) ? fileTypeFromBuffer(fileBuffer) : null);
const getTypeFromPath = (filePath) => (pathCheck(filePath) ? fileTypeFromFile(filePath) : null);
TypeChecker.fileMimeFromBuffer = async (fileBuffer) => {
	const type = await getTypeFromBuffer(fileBuffer);
	return type?.mime;
};
TypeChecker.fileExtensionFromBuffer = async (fileBuffer) => {
	const type = await getTypeFromBuffer(fileBuffer);
	return type?.ext;
};
TypeChecker.fileExtensionFromPath = async (filePath) => {
	const type = await getTypeFromPath(filePath);
	return type?.ext;
};

module.exports = TypeChecker;

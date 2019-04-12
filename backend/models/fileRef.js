/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const DB = require("../handler/db");
const ExternalServices = require("../handler/externalServices");
const ResponseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;

const ORIGINAL_FILE_REF_EXT = ".history.ref";
const UNITY_BUNDLE_REF_EXT = ".stash.unity3d.ref";
const JSON_FILE_REF_EXT = ".stash.json_mpc.ref";

const gridFSMapping = {};
gridFSMapping[ORIGINAL_FILE_REF_EXT] = ".history";
gridFSMapping[UNITY_BUNDLE_REF_EXT] = ".stash.unity3d";
gridFSMapping[JSON_FILE_REF_EXT] = ".stash.json_mpc";

function getRefEntry(account, collection, fileName) {
	return DB.getCollection(account, collection).then((col) => {
		return col ? col.findOne({_id: fileName}) : Promise.reject(ResponseCodes.NO_FILE_FOUND);
	});
}

function fetchFile(account, model, ext, fileName) {
	/*
	const fileArr = fileName.split("/");
	const fullFileName = fileArr.length > 1 ? `/${account}/${model}/revision/${fileName}` :  `/${account}/${model}/${fileName}`;
	return DB.getFileFromGridFS(account, model + gridFSMapping[ext], fullFileName);
	*/
	const collection = model + ext;
	return getRefEntry(account, collection, fileName).then((entry) => {
		if(!entry) {
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
		return ExternalServices.getFile(entry.type, entry.link);
	});
}

function fetchFileStream(account, model, ext, fileName, imposeModelRoute = true) {
	/*
	let fullFileName = fileName;
	if(imposeModelRoute) {
		const fileArr = fileName.split("/");
		fullFileName = fileArr.length > 1 ? `/${account}/${model}/revision/${fileName}` :  `/${account}/${model}/${fileName}`;
	}
	return DB.getFileStreamFromGridFS(account, model + gridFSMapping[ext], fullFileName).then((fileInfo) => {
		return {readStream: fileInfo.stream, size: fileInfo.size};
	});
	*/
	const collection = model + ext;
	return getRefEntry(account, collection, fileName).then((entry) => {
		if(!entry) {
			if (imposeModelRoute) {
				systemLogger.logInfo("imposeModelRoute: ", imposeModelRoute);
			}
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
		return { readStream: ExternalServices.getFileStream(entry.type, entry.link), size: entry.size };
	});
}

function removeAllFiles(account, collection) {
	/*
	return Promise.resolve();
	*/
	return DB.getCollection(account, collection).then((col) => {
		if (col) {
			const query = [
				{
					$group: {
						_id: "$type",
						links: {$addToSet:  "$link"}
					}
				}];
			return col.aggregate(query).toArray().then((results) => {
				const delPromises = [];
				results.forEach((entry) => {
					delPromises.push(ExternalServices.removeFiles(entry._id, entry.links));
				});
				return Promise.all(delPromises);
			});
		}
	});
}

const FileRef = {};

FileRef.getOriginalFile = function(account, model, fileName) {
	return fetchFileStream(account, model, ORIGINAL_FILE_REF_EXT, fileName, false);
};

FileRef.getTotalOrgFileSize = function(account, model) {
	const colName =  `${model}${gridFSMapping[ORIGINAL_FILE_REF_EXT]}.files`;
	return DB.getCollection(account, colName).then((col) => {
		let totalSize = 0;
		if(col) {
			return col.find({},{length : 1}).toArray().then((res) => {
				if (res && res.length) {
					totalSize =  res.reduce((total, current) => total + current.length, 0);
				}
				return totalSize;
			});
		}
		return totalSize;
	});

/*	return DB.getCollection(account, model, ORIGINAL_FILE_REF_EXT).then((col) => {
		let totalSize = 0;
		if(col) {
			return col.find({},{size : 1}).toArray().then((res) => {
				if (res && res.length) {
					totalSize =  res.reduce((total, current) => total + current.size, 0);
				}
				return totalSize;
			});
		}

		return totalSize;
	});
*/
};

FileRef.getUnityBundle = function(account, model, fileName) {
	return fetchFile(account, model, UNITY_BUNDLE_REF_EXT, fileName);
};

FileRef.getJSONFile = function(account, model, fileName) {
	return fetchFile(account, model, JSON_FILE_REF_EXT, fileName);
};

FileRef.getJSONFileStream = function(account, model, fileName) {
	return fetchFileStream(account, model, JSON_FILE_REF_EXT, fileName);
};

FileRef.removeAllFilesFromModel = function(account, model) {
	const promises = [];
	promises.push(removeAllFiles(account, model, ORIGINAL_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model, JSON_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model, UNITY_BUNDLE_REF_EXT));
	return Promise.all(promises);
};

module.exports = FileRef;

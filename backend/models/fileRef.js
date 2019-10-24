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
const Mailer = require("../mailer/mailer");
const ExternalServices = require("../handler/externalServices");
const ResponseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;
const nodeuuid = require("uuid/v1");

const ORIGINAL_FILE_REF_EXT = ".history.ref";
const UNITY_BUNDLE_REF_EXT = ".stash.unity3d.ref";
const JSON_FILE_REF_EXT = ".stash.json_mpc.ref";
const RESOURCES_FILE_REF_EXT = ".resources.ref";

const ISSUES_RESOURCE_PROP = "issueIds";
const RISKS_RESOURCE_PROP = "riskIds";
const attachResourceProps = [ISSUES_RESOURCE_PROP, RISKS_RESOURCE_PROP];

const extensionRe = /\.(\w+)$/;

function getRefEntry(account, collection, fileName) {
	return DB.getCollection(account, collection).then((col) => {
		return col ? col.findOne({_id: fileName}) : Promise.reject(ResponseCodes.NO_FILE_FOUND);
	});
}

function fetchFile(account, model, ext, fileName, metadata = false) {
	const collection = model + ext;

	return getRefEntry(account, collection, fileName).then((entry) => {
		if(!entry) {
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}

		return ExternalServices.getFile(account, collection, entry.type, entry.link).catch (() => {

			systemLogger.logError(`Failed to fetch file from ${entry.type}. Trying GridFS....`);
			Mailer.sendFileMissingError({
				account, model, collection,
				refId: entry._id,
				link: entry.link
			});

			// Temporary fall back - read from gridfs
			const fullName = ext === ORIGINAL_FILE_REF_EXT ?
				fileName :
				`/${account}/${model}/${fileName.split("/").length > 1 ? "revision/" : ""}${fileName}`;
			return ExternalServices.getFile(account, collection, "gridfs", fullName);
		}).then(fileBuffer=> {
			if (metadata) {
				const type = (((entry.name || "").match(extensionRe) || [])[0] || "").toLowerCase();
				return {file:fileBuffer, type, name: entry.name , size: entry.size};
			}
			return fileBuffer;
		});
	});
}

function fetchFileStream(account, model, ext, fileName, imposeModelRoute = true) {
	const collection = model + ext;
	return getRefEntry(account, collection, fileName).then((entry) => {
		if(!entry) {
			if (imposeModelRoute) {
				systemLogger.logInfo("imposeModelRoute: ", imposeModelRoute);
			}
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
		return ExternalServices.getFileStream(account, collection, entry.type, entry.link).then((stream) => {
			return {readStream: stream, size: entry.size };
		}).catch (() => {
			systemLogger.logError(`Failed to fetch file from ${entry.type}. Trying GridFS....`);
			Mailer.sendFileMissingError({
				account, model, collection,
				refId: entry._id,
				link: entry.link
			});

			// Temporary fall back - read from gridfs
			const fullName = ext === ORIGINAL_FILE_REF_EXT ?
				fileName :
				`/${account}/${model}/${fileName.split("/").length > 1 ? "revision/" : ""}${fileName}`;
			return ExternalServices.getFileStream(account, collection, "gridfs", fullName).then((stream) => {
				return {readStream: stream, size: entry.size };
			});
		});
	});
}

function removeAllFiles(account, collection) {
	return DB.getCollection(account, collection).then((col) => {
		if (col) {
			const query = [
				{
					$match: {
						noDelete: {$exists: false}
					}
				},
				{
					$group: {
						_id: "$type",
						links: {$addToSet:  "$link"}
					}
				}];
			return col.aggregate(query).toArray().then((results) => {
				const delPromises = [];
				results.forEach((entry) => {
					delPromises.push(ExternalServices.removeFiles(account, collection, entry._id, entry.links));
				});
				return Promise.all(delPromises);
			});
		}
	});
}

async function insertRefInResources(account, model, user, name, refInfo) {
	const collName = model + RESOURCES_FILE_REF_EXT;

	const ref = { ...refInfo, name, user , createdAt : (new Date()).getTime()};
	const resourcesRef = await DB.getCollection(account, collName);
	await resourcesRef.insertOne(ref);

	return ref;
}

async function removeResource(account, model,  resourceId, property, propertyId) {
	if (!account || !model || !resourceId || !propertyId) {
		throw ResponseCodes.INVALID_ARGUMENTS;
	}

	const collName = model + RESOURCES_FILE_REF_EXT;
	const collection = await DB.getCollection(account, collName);
	const ref = await collection.findOne({_id: resourceId});

	if (!Array.isArray(ref[property]) || ref[property].indexOf(propertyId) === -1) {
		throw ResponseCodes.RESOURCE_NOT_ATTACHED;
	}

	ref[property] = ref[property].filter(entry => entry !== propertyId);

	const refCounts = attachResourceProps.reduce((prev, p) => prev + (ref[p] || []).length, 0);

	if (!refCounts) {
		if (ref.type !== "http") {
			await ExternalServices.removeFiles(account, collection, ref.type, [ref.link]);
		}

		await collection.remove({_id:resourceId});
	} else {
		delete ref._id;
		await collection.update({_id: resourceId}, { $set: ref });
	}

	ref[property] = [propertyId]; // This is to identify from where this ref has been dettached
	return ref;
}

const FileRef = {};

FileRef.getOriginalFile = function(account, model, fileName) {
	return fetchFileStream(account, model, ORIGINAL_FILE_REF_EXT, fileName, false);
};

FileRef.getTotalModelFileSize = function(account, model) {
	return DB.getCollection(account, model + ORIGINAL_FILE_REF_EXT).then((col) => {
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
	}).then(modelVersionsFileSize =>
		DB.getCollection(account, model + RESOURCES_FILE_REF_EXT)
			.then(col =>
				col.find({ size: { $exists: true} }, {size : 1}).toArray())
			.then(res => {
				const resourcesSize =  (res || []).reduce((total, current) => total + current.size, 0);
				return modelVersionsFileSize + resourcesSize;
			})
	);
};

FileRef.getUnityBundle = function(account, model, fileName) {
	return fetchFile(account, model, UNITY_BUNDLE_REF_EXT, fileName);
};

FileRef.getJSONFile = function(account, model, fileName) {
	return fetchFile(account, model, JSON_FILE_REF_EXT, fileName);
};

FileRef.getResourceFile = function(account, model, fileName) {
	return fetchFile(account, model, RESOURCES_FILE_REF_EXT, fileName, true);
};

/**
 * @param {*} account
 * @param {*} model
 * @param {*} fileName
 * @returns { Promise<{readStream: stream.Readable , size: Number}>}
 */
FileRef.getJSONFileStream = function(account, model, fileName) {
	return fetchFileStream(account, model, JSON_FILE_REF_EXT, fileName);
};

FileRef.removeAllFilesFromModel = function(account, model) {
	const promises = [];
	promises.push(removeAllFiles(account, model + ORIGINAL_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + JSON_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + UNITY_BUNDLE_REF_EXT));
	return Promise.all(promises);
};

FileRef.removeResourceFromIssue = async function(account, model, issueId, resourceId) {
	return await removeResource(account, model, resourceId, ISSUES_RESOURCE_PROP, issueId);
};

FileRef.storeFileAsResource = async function(account, model, user, name, data, extraFields = null) {
	const collName = model + RESOURCES_FILE_REF_EXT;
	let refInfo = await ExternalServices.storeFile(account, collName, data);
	refInfo = {...refInfo ,...(extraFields || {}) };

	const ref = await insertRefInResources(account, model, user, name, refInfo);
	return ref;
};

FileRef.storeUrlAsResource = async function(account, model, user, name, link, extraFields = null) {
	const refInfo = {_id: nodeuuid(), link, type: "http", ...extraFields  };
	const ref = await insertRefInResources(account, model, user, name, refInfo);
	return ref;
};

module.exports = FileRef;

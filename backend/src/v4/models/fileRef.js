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
const db = require("../handler/db");
const ExternalServices = require("../handler/externalServices");
const ResponseCodes = require("../response_codes");
const utils = require("../utils");

const ORIGINAL_FILE_REF_EXT = ".history.ref";
const UNITY_BUNDLE_REF_EXT = ".stash.unity3d.ref";
const ACTIVITIES_FILE_REF_EXT = ".activities.ref";
const STATE_FILE_REF_EXT = ".sequences.ref";
const JSON_FILE_REF_EXT = ".stash.json_mpc.ref";
const RESOURCES_FILE_REF_EXT = ".resources.ref";

const ISSUES_FILE_REF_EXT = ".issues.ref";
const RISKS_FILE_REF_EXT = ".risks.ref";

const ISSUES_RESOURCE_PROP = "issueIds";
const RISKS_RESOURCE_PROP = "riskIds";
const attachResourceProps = [ISSUES_RESOURCE_PROP, RISKS_RESOURCE_PROP];

const extensionRe = /\.(\w+)$/;

function getRefEntry(account, collection, fileName) {
	return db.getCollection(account, collection).then((col) => {
		return col ? col.findOne({_id: fileName}) : Promise.reject(ResponseCodes.NO_FILE_FOUND);
	});
}

async function _fetchFile(account, model, ext, fileName, metadata = false) {
	const collection =  model ? `${model}${ext}` : ext;
	const entry = await getRefEntry(account, collection, fileName);
	if(!entry) {
		throw ResponseCodes.NO_FILE_FOUND;
	}

	const fileBuffer = await ExternalServices.getfile(account, collection, entry.type, entry.link);

	if (metadata) {
		const type = (((entry.name || "").match(extensionRe) || [])[0] || "").toLowerCase();
		return {file:fileBuffer, type, name: entry.name , size: entry.size};
	}
	return fileBuffer;

}

async function fetchFileStream(account, model, collection, fileName) {

	const entry = await getRefEntry(account, collection, fileName);
	if(!entry) {
		throw ResponseCodes.NO_FILE_FOUND;
	}

	const stream  = await ExternalServices.getFileStream(account, collection, entry.type, entry.link);

	return {readStream: stream, size: entry.size };
}

function removeAllFiles(account, collection) {
	return db.getCollection(account, collection).then((col) => {
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

async function insertRef(account, collection, user, name, refInfo) {
	const ref = { ...refInfo, name, user , createdAt : (new Date()).getTime()};
	await db.insertOne(account, collection, ref);

	return ref;
}

const FileRef = {};

FileRef.getOriginalFile = function(account, model, fileName) {
	const collection = model + ORIGINAL_FILE_REF_EXT;
	return fetchFileStream(account, model, collection, fileName, false);
};

FileRef.getSRCFile = function(account, model, fileName) {
	return _fetchFile(account, model,  ".stash.src.ref", fileName, true);
};

FileRef.fetchFile = (account, model, collName, ref_id) => {
	return _fetchFile(account, model, "." + collName + ".ref", ref_id);
};

FileRef.removeFile = async (account, model, collName, ref_id) => {
	const refCollName =   model + "." + collName + ".ref";

	const entry = await db.findOne(account, refCollName, {_id: ref_id});

	if (!entry) {
		return [];
	}

	return await Promise.all([
		ExternalServices.removeFiles(account, refCollName, entry.type, [entry.link]),
		db.deleteOne(account, refCollName, {_id:entry._id})
	]);
};

FileRef.getTotalModelFileSize = function(account, model) {
	return db.getCollection(account, model + ORIGINAL_FILE_REF_EXT).then((col) => {
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
		db.getCollection(account, model + RESOURCES_FILE_REF_EXT)
			.then(col =>
				col.find({ size: { $exists: true} }, {size : 1}).toArray())
			.then(res => {
				const resourcesSize =  (res || []).reduce((total, current) => total + current.size, 0);
				return modelVersionsFileSize + resourcesSize;
			})
	);
};

FileRef.getUnityBundle = function(account, model, fileName) {
	return _fetchFile(account, model, UNITY_BUNDLE_REF_EXT, fileName, false, true);
};

FileRef.getSequenceActivitiesFile = function(account, model, fileName) {
	return _fetchFile(account, model, ACTIVITIES_FILE_REF_EXT, fileName, false, false);
};

FileRef.getSequenceStateFile = function(account, model, fileName) {
	return _fetchFile(account, model, STATE_FILE_REF_EXT, fileName, false, false);
};

FileRef.getJSONFile = function(account, model, fileName) {
	return _fetchFile(account, model, JSON_FILE_REF_EXT, fileName, false, true);
};

FileRef.getResourceFile = function(account, model, fileName) {
	return _fetchFile(account, model, RESOURCES_FILE_REF_EXT, fileName, true, false);
};

/**
 * @param {*} account
 * @param {*} model
 * @param {*} fileName
 * @returns { Promise<{readStream: stream.Readable , size: Number}>}
 */
FileRef.getJSONFileStream = function(account, model, fileName) {
	const collection = model + JSON_FILE_REF_EXT;
	return fetchFileStream(account, model, collection, fileName, true);
};

FileRef.removeAllFilesFromModel = function(account, model) {
	const promises = [];
	promises.push(removeAllFiles(account, model + ORIGINAL_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + JSON_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + UNITY_BUNDLE_REF_EXT));
	promises.push(removeAllFiles(account, model + RESOURCES_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + STATE_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + ISSUES_FILE_REF_EXT));
	promises.push(removeAllFiles(account, model + RISKS_FILE_REF_EXT));

	return Promise.all(promises);
};

FileRef.removeResourceFromEntity  = async function(account, model, property, propertyId, resourceId) {
	if (!account || !model || !resourceId || !propertyId) {
		throw ResponseCodes.INVALID_ARGUMENTS;
	}

	const collName = model + RESOURCES_FILE_REF_EXT;
	const collection = await db.getCollection(account, collName);
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

		await collection.deleteOne({_id:resourceId});
	} else {
		delete ref._id;
		await collection.updateOne({_id: resourceId}, { $set: ref });
	}

	ref[property] = [propertyId]; // This is to identify from where this ref has been dettached
	return ref;
};

FileRef.storeFileAsResource = async function(account, model, user, name, data, extraFields = null) {
	const collName = model + RESOURCES_FILE_REF_EXT;

	return await this.storeFile(account, collName, user, name, data, extraFields);
};

FileRef.storeFile = async function(account, collection, user, name, data, extraFields = null) {
	let refInfo = await ExternalServices.storeFile(account, collection, data);
	refInfo = {...refInfo ,...(extraFields || {}) };

	return await insertRef(account, collection, user, name, refInfo);
};

FileRef.storeUrlAsResource = async function(account, model, user, name, link, extraFields = null) {
	const collName = model + RESOURCES_FILE_REF_EXT;
	const refInfo = {_id: utils.generateUUID({string: true}), link, type: "http", ...extraFields  };
	const ref = await insertRef(account, collName, user, name, refInfo);
	return ref;
};

module.exports = FileRef;

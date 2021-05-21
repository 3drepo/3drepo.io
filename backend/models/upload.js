/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const multer = require("multer");
const config = require("../config");
const middlewares = require("../middlewares/middlewares");
const responseCodes = require("../response_codes");
const importQueue = require("../services/queue");
const { modelStatusChanged } = require("./chatEvent");
const { isValidTag } = require("./history");
const { findModelSettingById, createCorrelationId } = require("./modelSetting");

const Upload = {};

Upload.acceptedFormat = [
	"x","obj","3ds","md3","md2","ply",
	"mdl","ase","hmp","smd","mdc","md5",
	"stl","lxo","nff","raw","off","ac",
	"bvh","irrmesh","irr","q3d","q3s","b3d",
	"dae","ter","csm","3d","lws","xml","ogex",
	"ms3d","cob","scn","blend","pk3","ndo",
	"ifc","xgl","zgl","fbx","assbin", "bim", "dgn",
	"rvt", "rfa", "spm"
];

Upload.uploadRequest = async (teamspace, model, username, data) => {
	// check model exists before upload
	const modelSetting = await findModelSettingById(teamspace, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	await isValidTag(teamspace, model, data.tag);

	const corID = await createCorrelationId(teamspace, model);

	await Upload.writeImportData(
		corID,
		teamspace,
		model,
		username,
		data.tag,
		data.desc,
		data.importAnimations
	);

	return { corID };
};

Upload.uploadFile = async (req) => {
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	const account = req.params.account;
	const model = req.params.model;
	const user = req.session.user.username;

	modelStatusChanged(null, account, model, { status: "uploading", user });
	// upload model with tag

	const uploadedFile = await new Promise((resolve, reject) => {
		const upload = multer({
			dest: config.cn_queue.upload_dir,
			fileFilter: function(fileReq, file, cb) {

				let format = file.originalname.split(".");

				if(format.length <= 1) {
					return cb({resCode: responseCodes.FILE_NO_EXT});
				}

				const isIdgn = format[format.length - 1] === "dgn" && format[format.length - 2] === "i";

				format = format[format.length - 1];

				const size = parseInt(fileReq.headers["content-length"]);

				if(isIdgn || Upload.acceptedFormat.indexOf(format.toLowerCase()) === -1) {
					return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
				}

				if(size > config.uploadSizeLimit) {
					return cb({ resCode: responseCodes.SIZE_LIMIT });
				}

				const sizeInMB = size / (1024 * 1024);
				middlewares.freeSpace(account).then(space => {

					if(sizeInMB > space) {
						cb({ resCode: responseCodes.SIZE_LIMIT_PAY });
					} else {
						cb(null, true);
					}
				});
			}
		});

		upload.single("file")(req, null, function (err) {
			if (err) {
				return reject(err);

			} else if(!req.file.size) {
				return reject(responseCodes.FILE_FORMAT_NOT_SUPPORTED);

			} else {
				modelStatusChanged(null, account, model, { status: "uploaded" });
				return resolve(req.file);
			}
		});
	});

	// req.body.tag wont be defined after the file has been uploaded
	await isValidTag(account, model, req.body.tag);

	return uploadedFile;
};

Upload.uploadChunksStart = async (teamspace, model, headers) => {
	if (!headers["x-ms-transfer-mode"] ||
		headers["x-ms-transfer-mode"] !== "chunked" ||
		!headers["x-ms-content-length"] ||
		isNaN(parseInt(headers["x-ms-content-length"]))) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	// check model exists before upload
	const modelSetting = await findModelSettingById(teamspace, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}
};

Upload.uploadFileChunk = async (req) => {
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	const account = req.params.account;
	const model = req.params.model;
	const user = req.session.user.username;

	modelStatusChanged(null, account, model, { status: "uploading", user });
	// upload model with tag

	const uploadedFile = await new Promise((resolve, reject) => {
		const upload = multer({
			dest: config.cn_queue.upload_dir,
			fileFilter: function(fileReq, file, cb) {

				let format = file.originalname.split(".");

				if(format.length <= 1) {
					return cb({resCode: responseCodes.FILE_NO_EXT});
				}

				const isIdgn = format[format.length - 1] === "dgn" && format[format.length - 2] === "i";

				format = format[format.length - 1];

				const size = parseInt(fileReq.headers["content-length"]);

				if(isIdgn || Upload.acceptedFormat.indexOf(format.toLowerCase()) === -1) {
					return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
				}

				if(size > config.uploadSizeLimit) {
					return cb({ resCode: responseCodes.SIZE_LIMIT });
				}

				const sizeInMB = size / (1024 * 1024);
				middlewares.freeSpace(account).then(space => {

					if(sizeInMB > space) {
						cb({ resCode: responseCodes.SIZE_LIMIT_PAY });
					} else {
						cb(null, true);
					}
				});
			}
		});

		upload.single("file")(req, null, function (err) {
			if (err) {
				return reject(err);

			} else if(!req.file.size) {
				return reject(responseCodes.FILE_FORMAT_NOT_SUPPORTED);

			} else {
				modelStatusChanged(null, account, model, { status: "uploaded" });
				return resolve(req.file);
			}
		});
	});

	// req.body.tag wont be defined after the file has been uploaded
	await isValidTag(account, model, req.body.tag);

	return uploadedFile;
};

/** *****************************************************************************
 * @param {corID} corID - correlation ID of upload
 * @param {databaseName} databaseName - name of database to commit to
 * @param {modelName} modelName - name of model to commit to
 * @param {userName} userName - name of user
 * @param {tag} tag - revision tag
 * @param {desc} desc - revison description
 *******************************************************************************/
Upload.writeImportData = async (corID, databaseName, modelName, userName, tag, desc, importAnimations = true) => {
	const sharedSpacePath = importQueue.getSharedSpacePath();
	const sharedSpacePH = importQueue.getSharedSpacePH();

	// const newFilePath = await this._moveFileToSharedSpace(corID, filePath, orgFileName, copy);
	const newFilePath = sharedSpacePath + "/" + corID + "/";

	// await importQueue.mkdir(newFilePath);

	const jsonFilename = `${sharedSpacePath}/${corID}.json`;

	const json = {
		file: `${sharedSpacePH}/${newFilePath}`,
		database: databaseName,
		project: modelName,
		owner: userName
	};

	if (tag) {
		json.tag = tag;
	}

	if (desc) {
		json.desc = desc;
	}

	if (importAnimations) {
		json.importAnimations = importAnimations;
	}

	await importQueue.writeFile(jsonFilename, JSON.stringify(json));
};

module.exports = Upload;

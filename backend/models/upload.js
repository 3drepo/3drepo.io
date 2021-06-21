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

const fs = require("fs");
const multer = require("multer");
const config = require("../config");
const C = require("../constants");
const middlewares = require("../middlewares/middlewares");
const responseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;
const importQueue = require("../services/queue");
const { modelStatusChanged } = require("./chatEvent");
const { isValidTag } = require("./history");
const { findModelSettingById, createCorrelationId } = require("./modelSetting");

const handleChunkStream = async (req, filename) => {
	return new Promise(resolve => {
		const writeStream = fs.createWriteStream(filename, {encoding: "binary"});
		req.on("data", (chunk) => writeStream.write(chunk, "binary"));
		req.on("end", () => {
			writeStream.end();
			resolve();
		});
	});
};

const stitchChunks = (corID, newFilename) => {
	const filePath = `${importQueue.getTaskPath(corID)}/chunks`;

	return new Promise((resolve, reject) => {
		fs.readdir(filePath, (dirErr, files) => {
			if (dirErr) {
				return reject(dirErr);
			}

			(function next() {
				const file = files.shift();
				if (!file) {
					return resolve();
				}

				// for debugging
				const stats = fs.statSync(`${filePath}/${file}`);
				systemLogger.logInfo(`FILE=${filePath}/${file}, SIZE=${stats.size} bytes`);
				// end debugging

				fs.readFile(filePath + "/" + file, (readFileErr, content) => {
					if (readFileErr) {
						return reject(readFileErr);
					}

					fs.appendFile(`${importQueue.getTaskPath(corID)}/${newFilename}`, content, (writeErr) => {
						if (writeErr) {
							return reject(writeErr);
						}

						return next();
					});
				});
			})();
		});
	});
};

const Upload = {};

Upload.uploadRequest = async (teamspace, model, username, data) => {
	// check model exists before upload
	const modelSetting = await findModelSettingById(teamspace, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	if (!data.filename) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const newFileName = data.filename.replace(C.FILENAME_REGEXP, "_");

	await isValidTag(teamspace, model, data.tag);

	const corID = await createCorrelationId(teamspace, model);

	await importQueue.writeImportData(
		corID,
		teamspace,
		model,
		username,
		newFileName,
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

	const { account, model } = req.params;
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

				if(isIdgn || C.ACCEPTED_FILE_FORMATS.indexOf(format.toLowerCase()) === -1) {
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

Upload.initUploadChunks = async (teamspace, model, corID, username, headers) => {
	if (!headers["x-ms-transfer-mode"] ||
		headers["x-ms-transfer-mode"] !== "chunked" ||
		!headers["x-ms-content-length"] ||
		isNaN(headers["x-ms-content-length"])) {
		systemLogger.logInfo(`transfer mode=${headers["x-ms-transfer-mode"]}`);
		systemLogger.logInfo(`content length=${headers["x-ms-content-length"]}`);
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const chunkSize = Math.min(C.MS_CHUNK_BYTES_LIMIT, parseInt(headers["x-ms-content-length"]));

	if (!fs.existsSync(`${importQueue.getTaskPath(corID)}.json`)) {
		throw responseCodes.CORRELATION_ID_NOT_FOUND;
	}

	// upload model with tag
	modelStatusChanged(null, teamspace, model, { status: "uploading", username });

	await importQueue.mkdir(`${importQueue.getTaskPath(corID)}/`);
	await importQueue.mkdir(`${importQueue.getTaskPath(corID)}/chunks/`);

	return { "x-ms-chunk-size": chunkSize };
};

Upload.uploadChunk = async (teamspace, model, corID, req) => {
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	if (!req.headers["content-range"]) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const [contentRange, contentSize] = req.headers["content-range"].split("/");
	const [sizeUnit, contentRangeValue] = contentRange.split(" ");

	if (sizeUnit !== "bytes") {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const contentMax = contentRangeValue.split("-")[1];

	const sizeRemaining = contentSize - contentMax - 1;
	const chunkSize = Math.min(C.MS_CHUNK_BYTES_LIMIT, sizeRemaining);

	await handleChunkStream(req, `${importQueue.getTaskPath(corID)}/chunks/${Date.now()}`);

	systemLogger.logInfo(`CONTENT-RANGE=${req.headers["content-range"]}`);
	systemLogger.logInfo(`CHUNKSIZE=${chunkSize}`);
	if (chunkSize === 0) {
		modelStatusChanged(null, teamspace, model, { status: "uploaded" });
		await stitchChunks(corID, "upload");
		const { filename } = JSON.parse(fs.readFileSync(`${importQueue.getTaskPath(corID)}.json`, "utf8"));
		importQueue.importFile(corID, `${importQueue.getTaskPath(corID)}/upload`, filename, null);
	}

	return {
		"Range": `bytes=0-${contentMax}`,
		"x-ms-chunk-size": chunkSize
	};
};

module.exports = Upload;

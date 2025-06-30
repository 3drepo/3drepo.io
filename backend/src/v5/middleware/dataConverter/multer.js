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

const { codeExists, createResponseCode, templates } = require('../../utils/responseCodes');
const Multer = require('multer');
const Path = require('path');
const { fileExtensionFromBuffer } = require('../../utils/helper/typeCheck');
const { readFile } = require('fs/promises');
const { respond } = require('../../utils/responder');
const { fileUploads: uploadConfig } = require('../../utils/config');

const MulterHelper = {};

const singleFileMulterPromise = (req, fileName, fileFilter, maxSize,
	storeInMemory) => new Promise((resolve, reject) => {
	const options = {
		limits: { fileSize: maxSize },
		fileFilter,
	};

	if (storeInMemory) {
		options.storage = Multer.memoryStorage();
	} else {
		options.storage = Multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, uploadConfig.uploadDir);
			},
			filename: (req, file, cb) => {
				const ext = Path.extname(file.originalname);
				const name = Path.basename(file.originalname, ext);
				const uniqueName = `${name}_${Date.now()}${ext}`;
				cb(null, uniqueName);
			},
		});
	}

	Multer(options).single(fileName)(req, null, (err) => {
		if (err) {
			reject(err);
		} else {
			resolve();
		}
	});
});

const imageFilter = (req, file, cb) => {
	const format = file.originalname.split('.').splice(-1)[0].toLowerCase();

	if (!uploadConfig.imageExtensions.includes(format)) {
		const err = createResponseCode(templates.unsupportedFileFormat, `${format} is not a supported image format`);
		cb(err, false);
		return;
	}

	cb(null, true);
};

const fileMatchesExt = async (buffer, fileName) => {
	const fileExt = Path.extname(fileName).toLowerCase().substring(1);
	const bufferType = await fileExtensionFromBuffer(buffer);
	const extToCheck = [...uploadConfig.imageExtensions, 'pdf'];

	return extToCheck.includes(fileExt) ? fileExt === bufferType : true;
};

MulterHelper.singleFileUpload = (fileName = 'file', fileFilter, maxSize = uploadConfig.uploadSizeLimit, storeInMemory = false) => async (req, res, next) => {
	try {
		await singleFileMulterPromise(req, fileName, fileFilter, maxSize, storeInMemory);

		if (!req.file) throw createResponseCode(templates.invalidArguments, 'A file must be provided');

		if (!storeInMemory) req.file.buffer = await readFile(req.file.path);

		if (!await fileMatchesExt(req.file.buffer, req.file.originalname)) {
			throw templates.unsupportedFileFormat;
		}
		await next();
	} catch (err) {
		let response = err;

		if (err.code === 'LIMIT_FILE_SIZE') {
			response = createResponseCode(templates.maxSizeExceeded, `File cannot be bigger than ${maxSize} bytes.`);
		} else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			response = createResponseCode(templates.invalidArguments, `${fileName} is a required field`);
		} else if (!codeExists(err.code)) {
			response = createResponseCode(templates.invalidArguments, err?.message);
		}

		respond(req, res, response);
	}
};

MulterHelper.singleImageUpload = (fileName, storeInMemory = true) => MulterHelper.singleFileUpload(
	fileName, imageFilter, uploadConfig.imageSizeLimit, storeInMemory);

module.exports = MulterHelper;

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

const Multer = require('multer');
const config = require('../../utils/config');
const { respond } = require('../../utils/responder');

const MulterHelper = {};

const singleFileMulterPromise = (req, fileName, fileFilter) => new Promise((resolve, reject) => {
	Multer({
		dest: config.cn_queue.upload_dir,
		fileFilter,
	}).single(fileName)(req, null, (err) => {
		if (err) {
			reject(err);
		} else {
			resolve();
		}
	});
});

MulterHelper.singleFileUpload = (fileName = 'file', fileFilter) => async (req, res, next) => {
	try {
		await singleFileMulterPromise(req, fileName, fileFilter);
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = MulterHelper;

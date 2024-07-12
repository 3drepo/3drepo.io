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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Path = require('path');
const Yup = require('yup');
const { respond } = require('../../../../../../../utils/responder');
const { sufficientQuota } = require('../../../../../../../utils/quota');

const Revisions = {};

Revisions.validateUpdateRevisionData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().shape({
		void: Yup.bool('void must be of type boolean')
			.required()
			.strict(true),
	});

	try {
		await schema.validate(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Revisions.fileFilter = (acceptedExtensions) => (req, file, cb) => {
	const { originalname } = file;
	const fileExt = Path.extname(originalname).toLowerCase();
	if (!acceptedExtensions.includes(fileExt)) {
		const err = createResponseCode(templates.unsupportedFileFormat, `${fileExt} is not a supported model format`);
		cb(err, false);
	} else {
		cb(null, true);
	}
};

Revisions.checkQuotaIsSufficient = async (req, res, next) => {
	if (!req.file.size) throw createResponseCode(templates.invalidArguments, 'File cannot be empty');
	const { teamspace } = req.params;
	await sufficientQuota(teamspace, req.file.size);
	await next();
};

module.exports = Revisions;

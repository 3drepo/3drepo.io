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

const { checkQuotaIsSufficient, fileFilter } = require('./commons/revisions');
const { createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const { ensureFileIsValid, singleFileUpload } = require('../../../../multer');
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { fileUploads } = require('../../../../../../utils/config');
const { isRevAndStatusCodeUnique } = require('../../../../../../models/revisions');
const { respond } = require('../../../../../../utils/responder');
const { statusCodes } = require('../../../../../../models/modelSettings.constants');
const { validateMany } = require('../../../../../common');

const Drawings = {};

const ACCEPTED_DRAWING_EXT = ['.dwg', '.pdf'];

const validateRevisionUpload = async (req, res, next) => {
	const schemaBase = {
		statusCode: Yup.string().oneOf(statusCodes.map(({ code }) => code)).required(),
		revCode: YupHelper.validators.alphanumeric(Yup.string().required().min(1).max(10)
			.strict(true), true),
		desc: YupHelper.types.strings.shortDescription,
	};

	const schema = Yup.object(schemaBase).noUnknown().required()
		.test('check-status-rev-code-uniqueness', 'The combination of statusCode and revCode needs to be unique', ({ revCode, statusCode }) => {
			if (revCode && statusCode) {
				const { teamspace, drawing } = req.params;
				return isRevAndStatusCodeUnique(teamspace, drawing, revCode, statusCode);
			}

			// If either prop is missing we dont want to throw the test error message
			// thus we are returning true and let it be caught by required()
			return true;
		});

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Drawings.validateNewRevisionData = validateMany([singleFileUpload('file', fileFilter(ACCEPTED_DRAWING_EXT), fileUploads.drawingSizeLimit, true), ensureFileIsValid, checkQuotaIsSufficient, validateRevisionUpload]);

module.exports = Drawings;

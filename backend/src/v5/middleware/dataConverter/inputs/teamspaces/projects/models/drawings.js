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
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { isRevAndStatusCodeUnique } = require('../../../../../../models/revisions');
const { respond } = require('../../../../../../utils/responder');
const { singleFileUpload } = require('../../../../multer');
const { statusCodes } = require('../../../../../../models/modelSettings.constants');
const { validateMany } = require('../../../../../common');

const Drawings = {};

const ACCEPTED_DRAWING_EXT = ['.dwg', '.pdf'];
const DRAWING_MAX_FILE_SIZE = 500000000;

const validateRevisionUpload = async (req, res, next) => {
	const schemaBase = {
		statusCode: YupHelper.validators.alphanumeric(
			Yup.string().oneOf(statusCodes.map(({ code }) => code)).required(),
		).required(),
		revCode: Yup.string().min(1).max(10).matches(/^[\w|_|-|.]*$/,
			// eslint-disable-next-line no-template-curly-in-string
			'${path} can only contain alpha-numeric characters, full stops, hyphens or underscores')
			.required(),
		desc: YupHelper.types.strings.shortDescription,
	};

	const schema = Yup.object().noUnknown().required().shape(schemaBase)
		.test('check-status-rev-code-uniqueness', 'The combination of statusCode and revCode needs to be unique', ({ revCode, statusCode }) => {
			if (revCode && statusCode) {
				const { teamspace, drawing } = req.params;
				return isRevAndStatusCodeUnique(teamspace, drawing, revCode, statusCode);
			}

			return true;
		});

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Drawings.validateNewRevisionData = validateMany([singleFileUpload('file', fileFilter(ACCEPTED_DRAWING_EXT), DRAWING_MAX_FILE_SIZE, true), checkQuotaIsSufficient, validateRevisionUpload]);

module.exports = Drawings;

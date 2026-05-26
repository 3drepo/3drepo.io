/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const Yup = require('yup');
const { respond } = require('../../../../../../../utils/responder');
const { types } = require('../../../../../../../utils/helper/yup');

const Utils = {};

Utils.validateListSortAndFilter = async (req, res, next) => {
	req.listOptions = {};
	if (req.query) {
		const schema = Yup.object({
			filters: Yup.array().of(Yup.string().min(1)).min(1).transform((v, val) => (val?.length ? val.split(',') : v))
				.default(undefined),
			sortBy: Yup.string().min(1),
			sortDesc: Yup.boolean().when('sortBy', {
				is: (val) => val === undefined,
				then: (s) => s.strip(),
				otherwise: (s) => s.default(true),
			}),
			updatedSince: types.date,
			limit: Yup.number().integer().min(1),
			skip: Yup.number().integer().min(0).default(0),
		});
		try {
			req.listOptions = await schema.validate(req.query, { stripUnknown: true });
		} catch (err) {
			respond(req, res, createResponseCode(templates.invalidArguments, err.message));
			return;
		}
	}

	await next();
};

module.exports = Utils;

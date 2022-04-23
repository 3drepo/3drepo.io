/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const Yup = require('yup');
const { getMetadataById } = require('../../../../../../models/metadata');
const { respond } = require('../../../../../../utils/responder');

const Metadata = {};

const metadataSchema = Yup.object().shape({
	key: Yup.string(),
	value: Yup.string().nullable(),
}).required();

const generateSchema = (existingMetadata) => {
	const schema = Yup.object().shape({
		metadata: Yup.array().of(metadataSchema.test('check-metadata-can-be-Updated', (value, { createError, path }) => {
			if (existingMetadata.find((m) => m.key === value.key && !m.custom)) {
				return createError({ path, message: `Metadata ${value.key} already exists and is not custom.` });
			}

			return true;
		})).required(),
	}).required().strict(true)
		.noUnknown();

	return schema;
};

Metadata.validateUpdateMetadata = async (req, res, next) => {
	try {
		const { teamspace, container, metadata } = req.params;
		const containerMetadata = await getMetadataById(teamspace, container, metadata, { metadata: 1 });
		const schema = generateSchema(containerMetadata.metadata);
		req.body = await schema.validate(req.body);

		await next();
	} catch (err) {
		if (err === templates.metadataNotFound) {
			respond(req, res, createResponseCode(templates.metadataNotFound, err?.message));
			return;
		}

		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Metadata;

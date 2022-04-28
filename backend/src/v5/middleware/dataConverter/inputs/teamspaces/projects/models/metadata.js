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
const { getCommonElements } = require('../../../../../../utils/helper/arrays');
const { getMetadataById } = require('../../../../../../models/metadata');
const { respond } = require('../../../../../../utils/responder');
const { types } = require('../../../../../../utils/helper/yup');

const Metadata = {};

const metadataSchema = Yup.object().shape({
	key: types.strings.title.required(),
	value: Yup.lazy((value) => {
		switch (typeof value) {
		case 'number':
			return Yup.number();
		case 'boolean':
			return Yup.bool();
		default:
			return types.strings.title.nullable().test('ensure-value-present', 'Metadata value is a required field', () => value !== undefined);
		}
	}),
}).required().noUnknown();

const generateSchema = (nonCustomMetadataKeys) => {
	const schema = Yup.object().shape({
		metadata: Yup.array().of(metadataSchema).required(),
	}).required().test('check-metadata-can-be-Updated', (value, { createError, path }) => {
		const nonEditableMetadata = getCommonElements(value.metadata.map((m) => m.key), nonCustomMetadataKeys);

		if (nonEditableMetadata.length > 0) {
			return createError({ path, message: `Metadata [${nonEditableMetadata.join(', ')}] already exist and are not editable.` });
		}

		return true;
	})
		.strict(true)
		.noUnknown();

	return schema;
};

Metadata.validateUpdateCustomMetadata = async (req, res, next) => {
	try {
		const { teamspace, container, metadata } = req.params;
		const existingMetadata = await getMetadataById(teamspace, container, metadata,
			{ _id: 0, metadata: 1 });

		const nonCustomMetadataKeys = existingMetadata.metadata.reduce((parsedItems, currItem) => {
			if (!currItem.custom) {
				parsedItems.push(currItem.key);
			}
			return parsedItems;
		}, []);

		const schema = generateSchema(nonCustomMetadataKeys);
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

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

const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const Metadata = {};

const collectionName = (model) => `${model}.scene`;

Metadata.getMetadataById = async (teamspace, model, metadataId, projection) => {
	const metadata = await db.findOne(teamspace, collectionName(model), { _id: metadataId }, projection);

	if (!metadata) {
		throw templates.metadataNotFound;
	}

	return metadata;
};

Metadata.updateCustomMetadata = async (teamspace, model, metadataId, changeSet) => {
	const { metadata } = await Metadata.getMetadataById(teamspace, model, metadataId, { metadata: 1 });
	const metadataKeyIndexLookup = metadata.reduce((parsedItems, currItem, currIndex) => {
		// eslint-disable-next-line no-param-reassign
		parsedItems[currItem.key] = currIndex;
		return parsedItems;
	}, {});

	changeSet.forEach(({ key, value }) => {
		const metadataIndex = metadataKeyIndexLookup[key];
		if (metadataIndex !== undefined) {
			metadata[metadataIndex].value = value;
		} else if (value !== null) {
			metadata.push({ key, value, custom: true });
		}
	});

	const updatedMetadata = metadata.filter((m) => m.value !== null);

	await db.updateOne(teamspace, collectionName(model), { _id: metadataId }, { $set: { metadata: updatedMetadata } });
};

module.exports = Metadata;

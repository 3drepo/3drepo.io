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

const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { cloneDeep } = require('../../../../../utils/helper/objects');
const { getMetadataByQuery } = require('../../../../../models/metadata');
const { isArray } = require('../../../../../utils/helper/typeCheck');
const { updateCustomMetadata } = require('../../../../../models/metadata');

const Metadata = { };

Metadata.updateCustomMetadata = updateCustomMetadata;

const castMetaEntry = (entry) => {
	const castedMetadata = cloneDeep(entry);
	castedMetadata._id = UUIDToString(entry._id);

	if (entry.parents) {
		castedMetadata.parents = entry.parents.map(UUIDToString);
	}

	if (isArray(entry.metadata)) {
		const metaObj = {};

		entry.metadata.forEach(({ key, value }) => {
			metaObj[key] = value;
		});

		castedMetadata.metadata = metaObj;
	}

	return castedMetadata;
};

Metadata.getAllMetadata = async (teamspace, container, revision) => {
	const metadata = await getMetadataByQuery(teamspace, container,
		{ rev_id: revision, type: 'meta' },
		{ metadata: 1, parents: 1 });

	return metadata.map(castMetaEntry);
};

module.exports = Metadata;

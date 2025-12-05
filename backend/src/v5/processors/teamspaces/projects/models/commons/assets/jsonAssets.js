/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { UUIDToString } = require('../../../../../../utils/helper/uuids');
const { getFileAsStream } = require('../../../../../../services/filesManager');
const { getLatestRevision } = require('../../../../../../models/revisions');
const { modelTypes } = require('../../../../../../models/modelSettings.constants');
const { templates } = require('../../../../../../utils/responseCodes');

const JsonAssets = { };

const STASH_JSON_COLLECTION = 'stash.json_mpc.ref';

JsonAssets.getContainerTree = async (teamspace, container, revision) => {
	let revId = revision;

	if (!revId) {
		try {
			const latestRev = await getLatestRevision(teamspace, container, modelTypes.CONTAINER, { _id: 1 });
			revId = UUIDToString(latestRev?._id);
		} catch {
			throw templates.fileNotFound;
		}
	}

	return getFileAsStream(teamspace, `${container}.${STASH_JSON_COLLECTION}`, `${revId}/fulltree.json`);
};

module.exports = JsonAssets;

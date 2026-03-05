/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { v5Path } = require('../../../interop');
const { getTeamspaceList } = require('../../utils');

const { find, replaceOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { getFile } = require(`${v5Path}/services/filesManager`);

function assetsCollection(container) {
	return `${container}.stash.repobundles`;
}

function jsonsCollection(container) {
	return `${container}.stash.json_mpc`;
}

function getNumComponents(mapping) {
	let maxIndex = -1;
	for (const entry of mapping) {
		for (const usage of entry.usage) {
			const parts = usage.split('_');
			const idx = parseInt(parts[1], 10);
			if (idx > maxIndex) {
				maxIndex = idx;
			}
		}
	}
	return maxIndex + 1;
}

const processRevision = async (teamspace, container, revision) => {
	let requiresUpdate = false;
	if (!revision.metadata) {
		// todo: do we have any documents without metadata anymore? need to implement the entire field if so.
		// For now though there is nothing to do...

		return;
	}
	for (let i = 0; i < revision.metadata.length; i++) {
		if (!revision.metadata[i].numSubmeshes) {
			// We can get both the number of submeshes and components/repomeshes
			// from the mpc document.
			const fileName = revision.jsonFiles[i];
			// eslint-disable-next-line no-await-in-loop
			const fileContents = await getFile(teamspace, jsonsCollection(container), fileName);
			const { mapping } = JSON.parse(fileContents.toString());

			// Unfortunately we cannot not rely on the numberOfIds or maxGeoCount as these
			// were broken in bouncer for a short while, so we just get them directly from
			// the array length and usage counts.

			// It is OK to assign to the function parameter here because this
			// document will be written back to the db inside this call.

			// eslint-disable-next-line no-param-reassign
			revision.metadata[i].numSubmeshes = mapping.length;
			// eslint-disable-next-line no-param-reassign
			revision.metadata[i].numComponents = getNumComponents(mapping);

			requiresUpdate = true;
		}
	}
	if (requiresUpdate) {
		await replaceOne(
			teamspace,
			assetsCollection(container),
			{
				_id: revision._id,
			},
			revision,
		);
	}
};

const processContainer = async (teamspace, container) => {
	logger.logInfo(`Updating Repobundles metadata for: ${teamspace}.${container}...`);
	const revisionAssets = await find(teamspace, assetsCollection(container), {});
	await Promise.all(revisionAssets.map((revision) => processRevision(teamspace, container, revision)));
};

const processTeamspace = async (teamspace) => {
	const containers = await find(teamspace, 'settings', { federate: { $ne: true } }, { _id: 1 }); // The not-equal query will match both false and undefined

	// todo: distinguish collections without repobundles

	await Promise.all(containers.map(({ _id }) => processContainer(teamspace, _id)));
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	await Promise.all(teamspaces.map((ts) => processTeamspace(ts)));
};

module.exports = run;

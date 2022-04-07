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

const { v5Path } = require('../../../interop');
const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { find, deleteMany } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const ExternalServices = require(`${v5Path}/handler/externalServices`);

const processCollection = async (teamspace, collection) => {
	const refs = await find(teamspace, collection, { _id: /.*unityAssets.json$/i });
	const ids = await Promise.all(refs.map(async ({ _id, type, link }) => {
		await ExternalServices.removeFiles(teamspace, collection.replace('.ref', ''), type, [link]);
		return _id;
	}));

	await deleteMany(teamspace, collection, { _id: { $in: ids } });
};

const processTeamspace = async (teamspace) => {
	const filesCols = await getCollectionsEndsWith(teamspace, '.json_mpc.ref');
	for (let i = 0; i < filesCols.length; ++i) {
		const collection = filesCols[i].name;
		logger.logInfo(`\t\t\t${collection}`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, collection);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;

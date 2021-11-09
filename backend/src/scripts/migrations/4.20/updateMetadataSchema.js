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

const { v5Path } = require('../../../interop');
const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { find, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, scene) => {
	const meta = await find(teamspace, scene, { type: 'meta' }, { metadata: 1 });
	const proms = meta.map(({ _id, metadata }) => {
		if (!Array.isArray(metadata)) {
			const metaArr = Object.keys(metadata).map((key) => ({ key, value: metadata[key] }));
			return updateOne(teamspace, scene, { _id }, { $set: { metadata: metaArr } });
		}
		return Promise.resolve();
	});
	return Promise.all(proms);
};

const processTeamspace = async (teamspace) => {
	const scenes = await getCollectionsEndsWith(teamspace, '.scene');
	for (const { name } of scenes) {
		logger.logInfo(`\t\t\t${name}`);
		// eslint-disable-next-line no-await-in-loop
		await processModel(teamspace, name);
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

/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { dropCollection, find, insertMany } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { initialise } = require(`${v5Path}/models/views`);

const PROJECTS_COLL = 'projects';
const VIEWS_COLL = 'views';

const viewsExt = '.views';
const refExt = '.ref';

const processCollection = async (teamspace, project, model, collection, destCollection) => {
	const updatedViews = (await find(teamspace, collection, {})).map((entry) => ({
		...entry,
		teamspace,
		project,
		model,
	}));

	if (updatedViews.length) {
		logger.logInfo(`\t\t\t\t-Migrating ${updatedViews.length} ${destCollection}`);
		try {
			await insertMany(teamspace, destCollection, updatedViews, false);
		} catch (err) {
			if (err?.result?.ok) {
				// insert successful, report # inserted (skipping duplicates)
				logger.logInfo(`\t\t\t\t\t-Records inserted: ${err.result.nInserted}`);
			} else {
				throw err;
			}
		}
	}

	// await dropCollection(teamspace, collection);
};

const getModelToProjectMap = async (teamspace) => {
	const projects = await find(teamspace, PROJECTS_COLL, {}, { models: 1 });
	const idMap = {};
	projects.forEach(({ _id, models }) => {
		models.forEach((model) => { idMap[model] = _id; });
	});
	return idMap;
};

const processTeamspace = async (teamspace) => {
	const [viewsCols] = await Promise.all([
		getCollectionsEndsWith(teamspace, viewsExt),
		initialise(teamspace),
	]);

	if (viewsCols.length === 0) {
		logger.logInfo(`\t-No views found in: ${teamspace}`);
		return;
	}

	const modelToProjectMap = await getModelToProjectMap(teamspace);
	for (let i = 0; i < viewsCols.length; ++i) {
		const collection = viewsCols[i].name;
		logger.logInfo(`\t\t\t${collection}`);
		const model = collection.slice(0, -(viewsExt.length));
		// eslint-disable-next-line no-await-in-loop
		await Promise.all([
			processCollection(teamspace, modelToProjectMap[model], model, collection, VIEWS_COLL),
			processCollection(teamspace, modelToProjectMap[model], model, `${collection}${refExt}`, `${VIEWS_COLL}${refExt}`),
		]);
	}
};

const run = async () => {
	const teamspaces = ['charence']; // await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;

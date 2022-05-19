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

const Path = require('path');

const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find, findOne, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const GridFSService = require(`${v5Path}/handler/gridfs`);

const sceneExt = '.scene';
const stashExt = '.stash.3drepo';

const possibleBinaries = ['vertices', 'faces', 'normals', 'uv_channels'];

const projection = { _extRef: 1 };
possibleBinaries.forEach((field) => {
	projection[field] = 1;
});

const shrinkMesh = async (teamspace, collection, meshId) => {
	const mesh = await findOne(teamspace, collection, { _id: meshId }, projection);
	const id = UUIDToString(mesh._id);
	// eslint-disable-next-line no-underscore-dangle
	const extRef = mesh._extRef || {};
	const set = { _extRef: extRef };
	const unset = {};

	await Promise.all(possibleBinaries.map(async (field) => {
		if (mesh[field]) {
			const fileName = `${id}_${field}`;
			await GridFSService.storeFile(teamspace, collection, mesh[field].buffer, fileName);
			extRef[field] = fileName;
			unset[field] = 1;
		}
	}));

	await updateOne(teamspace, collection, { _id: mesh._id }, { $set: set, $unset: unset }, false);
};

const processCollection = async (teamspace, collection) => {
	const baseQuery = { type: 'mesh' };
	const meshes = await find(teamspace, collection,
		{ $or: possibleBinaries.map((field) => ({ ...baseQuery, [field]: { $exists: true } })) }, { _id: 1 });

	for (let i = 0; i < meshes.length; ++i) {
		if (i % 10 === 0 || i === meshes.length - 1) logger.logInfo(`\t\t\t\t${i} of ${meshes.length}`);
		// eslint-disable-next-line no-await-in-loop
		await shrinkMesh(teamspace, collection, meshes[i]._id);
	}
};

const processModel = async (teamspace, model) => {
	await processCollection(teamspace, `${model}${sceneExt}`);
	await processCollection(teamspace, `${model}${stashExt}`);
};

const processTeamspace = async (teamspace) => {
	const scenes = await getCollectionsEndsWith(teamspace, sceneExt);
	for (const { name: scene } of scenes) {
		const model = scene.slice(0, -(sceneExt.length));
		logger.logInfo(`\t\t\t${model}`);
		// eslint-disable-next-line no-await-in-loop
		await processModel(teamspace, model);
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

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	return yargs.command(
		commandName,
		'Extract binary data from meshes and place them in gridfs',
		{},
		(argv) => run(argv._[1], argv._[2], argv._[3], argv.out),
	);
};

module.exports = {
	run,
	genYargs,
};

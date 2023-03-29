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

/**
 * This script is used to extract information aboute the geometry in
 * unoptimised scenes.
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');
const Path = require('path');
const fs = require('fs');

const { find } = require(`${v5Path}/handler/db`);

// In the resulting file, identify each revision by a simple integer
let globalSceneCounter = 0;
let globalMeshCounter = 0;
let globalTeamspaceCounter = 0;
let globalTeamspaceTotal = 0;
let globalFs = null;

const printUpdate = () => {
	logger.logInfo(`Processed ${globalMeshCounter} meshes across ${globalSceneCounter} revisions in ${globalTeamspaceCounter} out of ${globalTeamspaceTotal} teamspaces...`);
};

const processMeshNodes = (meshNodes) => new Promise((resolve) => {
	const buffer = Buffer.alloc(4 * 5 * meshNodes.length);
	let i = 0;
	for (const node of meshNodes) {
		buffer.writeUint32LE(globalSceneCounter, (i++) * 4);
		const x = node.bounding_box[1][0] - node.bounding_box[0][0];
		const y = node.bounding_box[1][1] - node.bounding_box[0][1];
		const z = node.bounding_box[1][2] - node.bounding_box[0][2];
		buffer.writeFloatLE(x, (i++) * 4);
		buffer.writeFloatLE(y, (i++) * 4);
		buffer.writeFloatLE(z, (i++) * 4);
		buffer.writeUint32LE(node.vertices_count, (i++) * 4);
	}
	globalMeshCounter += meshNodes.length;
	if (!globalFs.write(buffer)) {
		globalFs.once('drain', resolve);
	} else {
		resolve();
	}
});

const processScene = async (teamspace, name, rev) => {
	const query = {
		type: { $eq: 'mesh' },
		rev_id: { $eq: rev._id },
	};
	const properties = {
		vertices_count: 1,
		faces_count: 1,
		bounding_box: 1,
		primitive: 1,
	};
	const meshNodes = await find(teamspace, `${name}.scene`, query, properties);
	if (meshNodes.length) {
		logger.logInfo(`Processing scene ${teamspace}.${name}...`);
		await processMeshNodes(meshNodes);
	}
	globalSceneCounter++;
};

const processProject = async (teamspace, name) => {
	const revisions = await find(teamspace, `${name}.history`);
	for (const rev of revisions) {
		// eslint-disable-next-line no-await-in-loop
		await processScene(teamspace, name, rev);
		break; // process only one revision for now
	}
};

const processTeamspace = async (teamspace) => {
	const cols = await getCollectionsEndsWith(teamspace, '.history');
	for (const { name } of cols) {
		// eslint-disable-next-line no-await-in-loop
		await processProject(teamspace, name.slice(0, -('.history'.length)));
	}
	globalTeamspaceCounter++;
};

const run = async (filename) => {
	logger.logInfo('Creating output file...');
	globalFs = fs.createWriteStream(filename, {
		autoClose: true,
		encoding: 'binary',
	});
	setInterval(printUpdate, 3000);
	logger.logInfo('Finding all teamspaces...');
	const teamspaces = await getTeamspaceList();
	globalTeamspaceTotal = teamspaces.length;
	for (const teamspace of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('format', {
		describe: 'The name of the output file',
		type: 'string',
		default: 'meshproperties.bin',
	});
	return yargs.command(commandName,
		'Gathers information about composition of unoptimised scenes',
		argsSpec,
		(argv) => run(argv.format));
};

module.exports = {
	run,
	genYargs,
};

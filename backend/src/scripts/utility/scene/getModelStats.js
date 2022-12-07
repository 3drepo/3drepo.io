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

const Path = require('path');
const { readFileSync, createWriteStream } = require('fs');

const { v5Path } = require('../../../interop');

const { getLatestRevision } = require(`${v5Path}/models/revisions`);
const { getModelById } = require(`${v5Path}/models/modelSettings`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { aggregate, find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { templates } = require(`${v5Path}/utils/responseCodes`);

const readCSV = (file) => {
	const fileBuf = readFileSync(file).toString();
	const [, ...lines] = fileBuf.split(/\r?\n/);
	return lines.map((str) => {
		const [teamspace, project, model, isFed] = str.split(',');
		return teamspace.length && project.length && model.length
			? { teamspace, project, model, isFed: !!isFed } : undefined;
	});
};

const getModelStats = async (teamspace, model) => {
	let vCount = 0;
	let fCount = 0;
	let bundleSize = 0;

	try {
		const bundleNames = [];
		const { _id: revId } = await getLatestRevision(teamspace, model, { _id: 1 });

		const superMeshes = await find(teamspace, `${model}.stash.3drepo`,
			{ rev_id: revId, type: 'mesh' },
			{ _id: 1, m_map: { $slice: -1 } });

		superMeshes.forEach(({ _id, m_map: [{ t_to: faceTo, v_to: vertTo }] }) => {
			fCount += faceTo;
			vCount += vertTo;
			bundleNames.push(`${UUIDToString(_id)}.unity3d`);
		});

		const [{ sum }] = await aggregate(teamspace, `${model}.stash.unity3d.ref`, [
			{ $match: { _id: { $in: bundleNames } } }, { $group:
		{ _id: null, sum: { $sum: '$size' } },
			},
		]);
		bundleSize = sum;
	} catch (err) {
		if (err.code !== templates.revisionNotFound.code) {
			logger.logError(`Failed to fetch model stats for ${teamspace}.${model}: ${err.message}`);
		}
	}

	return { vCount, fCount, bundleSize };
};

const calculateStats = async ({ teamspace, project, model, isFed }) => {
	logger.logInfo(`Fetching stats for ${teamspace}.${project}.${model}`);
	let models = [model];
	if (isFed) {
		const { subModels } = await getModelById(teamspace, model, { subModels: 1 });
		models = subModels ?? [];
	}

	let bundlesSize = 0;
	let vertexCount = 0;
	let faceCount = 0;

	const subModelStats = await Promise.all(
		models.map((modelId) => getModelStats(teamspace, modelId?.model ?? modelId)),
	);
	subModelStats.forEach(({ vCount, fCount, bundleSize }) => {
		bundlesSize += bundleSize;
		vertexCount += vCount;
		faceCount += fCount;
	});

	return { teamspace, project, model, nContainers: models.length, bundlesSize, vertexCount, faceCount };
};

const run = async (inPath, outPath) => {
	const entries = readCSV(inPath);
	const writer = createWriteStream(outPath);

	writer.write('teamspace,project,model,#containers,unity assets,#vertices,#triangles\n');
	for (const entry of entries) {
		if (entry) {
			const { teamspace, project, model, nContainers, bundlesSize, vertexCount, faceCount,
			// eslint-disable-next-line no-await-in-loop
			} = await calculateStats(entry);
			writer.write(`${teamspace},${project},${model},${nContainers},${bundlesSize},${vertexCount},${faceCount}\n`);
		}
	}

	writer.close();
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('inputFile', {
		describe: 'Input file to instruct which model to query',
		type: 'string',
		demand: true,
	}).option('outputFile', {
		describe: 'Path to output',
		type: 'string',
		default: 'modelStats.csv',
	});
	return yargs.command(commandName,
		'Provide model stats',
		argsSpec,
		(argv) => run(argv.inputFile, argv.outputFile));
};

module.exports = {
	run,
	genYargs,
};

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

/**
 * This script identifies all references within the database and checks they have an associated file
 * in the fs
 */
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { open, mkdir } = require('fs/promises');
const { createWriteStream } = require('fs');
const { createInterface } = require('readline');
const Path = require('path');

const initLineReader = async (file) => {
	const input = (await open(file)).createReadStream();
	return createInterface({
		input,
		crlfDelay: Infinity,
	});
};

const run = async (baseFile, targetFile, dbRefFile, outDir) => {
	logger.logInfo(`Compare checksums between base [${baseFile}] and target [${targetFile}]`);

	logger.logInfo('Reading baseFile...');
	const baseLR = await initLineReader(baseFile);

	const linkToRefCheckSum = {};

	for await (const line of baseLR) {
		const [link, checksum] = line.split(',');
		if (link.length && checksum !== 'FAILED') {
			// base fs did not have the file, we ignore.
			linkToRefCheckSum[link] = checksum;
		}
	}

	logger.logInfo('Reading targetFile...');

	const targetLR = await initLineReader(targetFile);
	for await (const line of targetLR) {
		const [link, checksum] = line.split(',');
		if (linkToRefCheckSum[link] && checksum === linkToRefCheckSum[link]) {
			// If there's a match we remove it. so by the end of it we are left with mismatched.
			delete linkToRefCheckSum[link];
		}
	}

	const nMismatches = Object.keys(linkToRefCheckSum).length;
	logger.logInfo(`Comparison completed ${nMismatches} mismatches found`);

	if (nMismatches) {
		const refLR = await initLineReader(dbRefFile);
		// Could fail if folder already exists)
		await mkdir(outDir, { recursive: true }).catch(() => {});
		const outRefStream = createWriteStream(Path.join(outDir, 'refsToRecheck.csv'));
		const outLinksStream = createWriteStream(Path.join(outDir, 'failedLinks.csv'));
		const outSumsStream = createWriteStream(Path.join(outDir, 'expectedCheckSums.csv'));

		for await (const line of refLR) {
			const [link] = line.split(',');
			if (linkToRefCheckSum[link]) {
				outRefStream.write(`${line}\n`);
				outLinksStream.write(`${link}\n`);
				outSumsStream.write(`${link},${linkToRefCheckSum[link]}\n`);
			}
		}

		outRefStream.end();
		outLinksStream.end();
		outSumsStream.end();
		logger.logInfo(`Completed. Output written to ${outDir}`);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('baseFile',
		{
			describe: 'Base files with checksums we expect to be correct',
			type: 'string',
			demandOption: true,
		}).options('targetFile',
		{
			describe: 'Target files with checksums we are checking',
			type: 'string',
			demandOption: true,
		}).options('dbRefFile',
		{
			describe: 'DB ref files that contains entries that generated the checksums',
			type: 'string',
			demandOption: true,
		}).option('outDir',
		{
			describe: 'Path to a directory to output the results',
			type: 'string',
			default: './results',
		});
	return yargs.command(
		commandName,
		'Given 2 files generated from getCheckSumsForFiles, compare them and get a result',
		argsSpec,
		({ baseFile, targetFile, dbRefFile, outDir }) => run(
			baseFile, targetFile, dbRefFile, outDir),
	);
};

module.exports = {
	run,
	genYargs,
};

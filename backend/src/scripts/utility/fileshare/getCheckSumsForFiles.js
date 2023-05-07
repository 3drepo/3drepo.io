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

const { fs: fsConfig } = require(`${v5Path}/utils/config`);
const { path: fsPath } = fsConfig;
const { open, readFile } = require('fs/promises');
const { createHash } = require('crypto');
const { createInterface } = require('readline');
const Path = require('path');

const joinPath = (a, b) => (a && b ? Path.posix.join(a, b) : a || b);

const md5 = (str) => createHash('md5').update(str, 'utf8').digest('hex');

const generateCheckSum = async (link) => {
	const data = await readFile(joinPath(fsPath, link));
	return md5(data);
};

const processLine = async (line) => {
	try {
		return `${line},${await generateCheckSum(line)}`;
	} catch (err) {
		return `${line},FAILED`;
	}
};

const processBatch = async (outStream, processProms) => {
	const lineItems = await Promise.all(processProms);
	outStream.write(`${lineItems.join('\n')}\n`);
};

const run = async (inFile, outFile, maxFiles, maxSize) => {
	logger.logInfo('Generating MD5 sums for all files');
	const input = (await open(inFile)).createReadStream();
	const outFD = await open(outFile, 'w');
	const output = outFD.createWriteStream();

	let processProms = [];
	let processSize = 0;
	let count = 0;

	const lineReader = createInterface({
		input,
		crlfDelay: Infinity,
	});

	for await (const line of lineReader) {
		const [link, sizeStr] = line.split(',');
		const size = Number(sizeStr);

		if (processProms.length === maxFiles || maxSize <= (processSize + size)) {
			logger.logInfo(`Processing ${processProms.length} files (${(processSize / 1024).toFixed(2)})MB. (${count}) files completed`);
			await processBatch(output, processProms);
			processProms = [];
			processSize = 0;
		}

		count++;
		processProms.push(processLine(link));
		processSize += size;
	}

	await processBatch(output, processProms);

	output.end();
	await outFD.close();

	logger.logInfo(`Completed. Output written to ${outFile}`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('maxParallelSizeMB',
		{
			describe: 'Maximum amount of file size to process in parallel',
			type: 'number',
			default: 2048,
		}).options('maxParallelFiles',
		{
			describe: 'Maximum amount of files to process in parallel',
			type: 'number',
			default: 500,
		}).option('inFile',
		{
			describe: 'file path to a list of refs to process',
			type: 'string',
			demandOption: true,
		}).option('outFile',
		{
			describe: 'file path to output the results',
			type: 'string',
			default: './checksums.csv',
		});
	return yargs.command(
		commandName,
		'Given an output of getDbRefs, return their md5 sums',
		argsSpec,
		({ maxParallelSizeMB, maxParallelFiles, inFile, outFile }) => run(
			inFile, outFile, maxParallelFiles, maxParallelSizeMB * 1024),
	);
};

module.exports = {
	run,
	genYargs,
};

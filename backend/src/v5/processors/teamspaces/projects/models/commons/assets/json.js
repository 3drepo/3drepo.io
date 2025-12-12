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

const { PassThrough } = require('stream');
const { UUIDToString } = require('../../../../../../utils/helper/uuids');
const { getFileAsStream } = require('../../../../../../services/filesManager');

const JsonAssets = { };

const STASH_JSON_COLLECTION = 'stash.json_mpc.ref';

const readFileStreamAsync = async (outstream, teamspace, container, filename, injectIdentifier) => {
	const output = await getFileAsStream(teamspace,
		`${container}.${STASH_JSON_COLLECTION}`, filename);

	const { readStream } = output;
	await new Promise((resolve, reject) => {
		let first = true;
		readStream.on('data', (d) => {
			if (injectIdentifier && first) {
				first = false;
				outstream.write(
					`{"account":"${teamspace}","model":"${container}",`);
				outstream.write(d.slice(1));
				first = false;
			} else {
				outstream.write(d);
			}
		});
		readStream.on('end', () => resolve());
		readStream.on('error', reject);
	});

	return output;
};

const streamSubModelData = async (outstream, teamspace, subModels, getFileName, injectIdentifier = false) => {
	let first = true;
	for (const { container: subModel, revision: subModelRev } of subModels) {
		try {
			const subModelStream = PassThrough();

			// eslint-disable-next-line no-await-in-loop
			await readFileStreamAsync(subModelStream, teamspace, subModel, getFileName(subModelRev), injectIdentifier);

			if (first) {
				first = false;
			} else {
				outstream.write(',');
			}
			subModelStream.pipe(outstream, { end: false });

			subModelStream.end();
		} catch (err) {

			// if we failed to fetch model properties for a sub model, just skip it
		}
	}
};

JsonAssets.getTree = async (teamspace, container, revision) => {
	const stream = PassThrough();

	stream.write('{"subTree": [],"mainTree": ');
	await readFileStreamAsync(stream, teamspace, container, `${UUIDToString(revision)}/fulltree.json`);
	stream.end('}');

	return stream;
};

JsonAssets.getAssetProperties = async (teamspace, model, revisions, subModels) => {
	const stream = PassThrough();
	const getFileName = (rev) => `${UUIDToString(rev)}/modelProperties.json`;

	stream.write('{"properties": ');
	try {
		await readFileStreamAsync(stream, teamspace, model, getFileName(revisions));
	} catch (err) {
		stream.write(JSON.stringify({ hiddenNodes: [] }));
	}

	stream.write(',"subModels":[');
	if (subModels?.length) {
		await streamSubModelData(stream, teamspace, subModels, getFileName, true);
	}
	stream.end(']}');

	return stream;
};

JsonAssets.getSupermeshMapping = async (teamspace, model, revisions, subModels) => {
	const outstream = new PassThrough();
	const getFileName = (rev) => `${UUIDToString(rev)}/supermeshes.json`;
	if (subModels) {
		outstream.write('{"submodels":[');
		await streamSubModelData(outstream, teamspace, subModels, getFileName);
		outstream.write(']}');
	} else {
		await readFileStreamAsync(outstream, teamspace, model, getFileName(revisions));
	}
	outstream.end();
	return outstream;
};

module.exports = JsonAssets;

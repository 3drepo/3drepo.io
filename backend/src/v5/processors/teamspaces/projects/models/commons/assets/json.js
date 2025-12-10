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

const readFileStreamAsync = async (outstream, teamspace, container, filename) => {
	const output = await getFileAsStream(teamspace,
		`${container}.${STASH_JSON_COLLECTION}`, filename);

	const { readStream } = output;
	await new Promise((resolve, reject) => {
		readStream.on('data', (d) => outstream.write(d));
		readStream.on('end', () => resolve());
		readStream.on('error', reject);
	});

	return output;
};

JsonAssets.getTree = async (teamspace, container, revision) => {
	const stream = PassThrough();

	stream.write('{"subTrees": [],"mainTree": ');
	await readFileStreamAsync(stream, teamspace, container, `${UUIDToString(revision)}/fulltree.json`);
	stream.end('}');

	return stream;
};

module.exports = JsonAssets;

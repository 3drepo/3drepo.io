/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const FilesManager = require('../../../v5/services/filesManager');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { getFile } = require(`${v5Path}/services/filesManager`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);

const zlib = require('zlib');
const { UUIDLookUpTable } = require('../../../v5/utils/helper/uuids');
const { bulkWrite } = require('../../../v5/handler/db');

const HEADER_LENGTH_START = 16;
const HEADER_DATA_START = 20;

let numTeamspaces = 0;
let numCollections = 0;
let numRevisions = 0;

function getNumComponents(mapping) {
	let maxIndex = -1;
	for (const entry of mapping) {
		for (const usage of entry.usage) {
			const parts = usage.split('_');
			const idx = parseInt(parts[1], 10);
			if (idx > maxIndex) {
				maxIndex = idx;
			}
		}
	}
	return maxIndex + 1;
}

async function getRepoBundleStream(teamspace, collection, bundle) {
	const fileInfo = await FilesManager.getFileAsStream(teamspace, collection, bundle);
	if (fileInfo.encoding === 'gzip') {
		return fileInfo.readStream.pipe(zlib.createGunzip());
	}
	return fileInfo.readStream;
}

async function getRepoBundleHeader(teamspace, collection, bundle) {
	const stream = await getRepoBundleStream(teamspace, collection, bundle);
	return new Promise((resolve, reject) => {
		stream.once('error', reject);
		const chunks = [];
		let bytesRead = 0;
		let bytesToRead = Number.MAX_SAFE_INTEGER;
		let headerLength = 0;
		let hasHeader = false;
		stream.on('data', (chunk) => {
			chunks.push(chunk);
			bytesRead += chunk.length;
			if (bytesRead >= 20 && headerLength === 0) {
				const preamble = Buffer.concat(chunks);
				const view = new DataView(preamble.buffer, preamble.offset, preamble.length);
				headerLength = view.getInt32(HEADER_LENGTH_START, true);
				bytesToRead = headerLength + HEADER_DATA_START;
			}
			if (bytesRead >= bytesToRead) {
				const preamble = Buffer.concat(chunks);
				const header = preamble.subarray(HEADER_DATA_START, HEADER_DATA_START + headerLength);
				const json = header.toString();
				hasHeader = true;
				stream.destroy();
				resolve(JSON.parse(json));
			}
		});
		stream.on('end', () => {
			if (!hasHeader) {
				reject(new Error(`Got to end of bundle before processing header ${teamspace} ${collection} ${bundle}`));
			}
		});
	});
}

async function getMetadataEntryFromBundle(teamspace, collection, bundle) {
	const header = await getRepoBundleHeader(teamspace, collection, bundle);
	const metadata = {
		numVertices: 0,
		numFaces: 0,
		numUVChannels: 0,
		primitive: 3,
		min: {
			x: Number.MAX_VALUE,
			y: Number.MAX_VALUE,
			z: Number.MAX_VALUE,
		},
		max: {
			x: -Number.MAX_VALUE,
			y: -Number.MAX_VALUE,
			z: -Number.MAX_VALUE,
		},
	};
	for (const m of header.meshes) {
		metadata.min.x = Math.min(metadata.min.x, m.bounds.min.x);
		metadata.min.y = Math.min(metadata.min.y, m.bounds.min.y);
		metadata.min.z = Math.min(metadata.min.z, m.bounds.min.z);
		metadata.max.x = Math.max(metadata.max.x, m.bounds.max.x);
		metadata.max.y = Math.max(metadata.max.y, m.bounds.max.y);
		metadata.max.z = Math.max(metadata.max.z, m.bounds.max.z);
		metadata.numVertices += m.vertexCount;
		metadata.primitive = m.type; // The current generation of RepoBundles does not mix primitive types within a bundle
		if (m.vertexLayout.includes(4)) { // The magic number 4 is the layout id for uv0. This is distinct from the id channel, even though to the pipeline they will both be in uv attributes.
			metadata.numUVChannels = 1;
		}
		if (m.type === 2) {
			// RepoBundles always store baked line meshes, where each line
			// consists of two triangles. The metadata document should store
			// the number of original supermesh primitives.
			metadata.numFaces += m.indexCount / 6;
		} else if (m.type === 3) {
			metadata.numFaces += m.indexCount / 3;
		} else {
			throw Error('Unknown primitive type in RepoBundle');
		}
	}
	return metadata;
}

const processRevision = async (teamspace, collection, revision, forceRebuild) => {
	try {
		let revisedMeta = [...(revision.metadata || [])];

		if (forceRebuild || !revision.metadata) {
			// If metadata is missing - this is a v1 import.
			// We can get this information from the bundle header.

			revisedMeta = await Promise.all(
				revision.assets.map((asset) => getMetadataEntryFromBundle(teamspace, collection, asset)));
		}
		for (let i = 0; i < revisedMeta.length; i++) {
			if (!revisedMeta[i].numSubmeshes) {
				// We can get both the number of submeshes and components/repomeshes
				// from the mpc document.
				const fileName = revision.jsonFiles[i];

				// eslint-disable-next-line no-await-in-loop
				const fileContents = await getFile(teamspace, collection.replace('repobundles', 'json_mpc'), fileName);
				const { mapping } = JSON.parse(fileContents.toString());

				// Unfortunately we cannot rely on the numberOfIds or maxGeoCount as these
				// were broken in bouncer for a short while, so we just get them directly from
				// the array length and usage counts.

				// It is OK to assign to the function parameter here because this
				// document will be written back to the db inside this call.

				// eslint-disable-next-line no-param-reassign
				revisedMeta[i].numSubmeshes = mapping.length;
				// eslint-disable-next-line no-param-reassign
				revisedMeta[i].numComponents = getNumComponents(mapping);
			}
		}
		numRevisions++;

		return {
			updateOne: {
				filter: { _id: revision._id },
				update: { $set: { metadata: revisedMeta } },
			},
		};
	} catch (error) {
		logger.logInfo(`Exception processing ${teamspace}/${collection}/${UUIDToString(revision._id)}: ${error.message}`);
		// force the migration to terminate so we can investigate the issue before processing more revisions.
		throw error;
	}
};

const processCollection = async (teamspace, collection) => {
	// If the revision was processed after the date specified, we need
	// to rebuild if so to make the primitive types consistent with older imports.
	const revisionsToRedo = await find(teamspace, collection.replace('stash.repobundles', 'history'),
		{ timestamp: { $gt: new Date(2026, 2, 13) } }, { _id: 1 });

	const requireRebuildRevs = new UUIDLookUpTable(revisionsToRedo.map((r) => r._id));

	// find all entries where at least one metadata element entry is missing the numSubmeshes field
	const revisionAssets = await find(teamspace, collection, {
		metadata: {
			$elemMatch: { numSubmeshes: { $exists: false } },
		},
	});
	const updateInstructions = await Promise.all(revisionAssets.map((revision) => processRevision(
		teamspace, collection, revision, requireRebuildRevs.has(revision._id))));
	if (updateInstructions.length > 0) {
		await bulkWrite(teamspace, collection, updateInstructions);
	}

	logger.logInfo(`\t\tUpdated ${updateInstructions.length} entries`);

	numCollections++;
};

const processTeamspace = async (teamspace) => {
	const collections = await getCollectionsEndsWith(teamspace, '.stash.repobundles');
	for (const { name: collection } of collections) {
		logger.logInfo(`\t- ${collection}`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, collection);
	}
	numTeamspaces++;
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`- ${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
	logger.logInfo(`Processed ${numTeamspaces} teamspaces & ${numCollections} collections. Updated ${numRevisions} revisions.`);
};

module.exports = run;

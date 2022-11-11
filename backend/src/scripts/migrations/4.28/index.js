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

const moveLoginRecords = require('./moveLoginRecords');
const removePermissionTemplates = require('./removePermissionTemplates');
const indexLinksInRef = require('./indexLinksInRef');
const removeUnityAssetsJSON = require('./removeUnityAssetsJSON');
const removeGridFSBackUps = require('./removeGridFSBackUps');
const moveGridFSToFS = require('./moveGridFSToFS');

const scripts = [
	{ script: moveLoginRecords, desc: 'Move login records into a single collection' },
	{ script: removePermissionTemplates, desc: 'Remove permissionTemplates' },
	{ script: removeUnityAssetsJSON, desc: 'Remove redundant UnityAssets.json files' },
	{ script: removeGridFSBackUps, desc: 'Remove GridFS backup entries' },
	{ script: indexLinksInRef, desc: 'Add index for quicker query for the next script' },
	{ script: moveGridFSToFS, desc: 'Move gridFS documents to fileshare' },
	{ script: removeGridFSBackUps, desc: 'Remove redundant GridFS files (due to last script)' },
];

const argsDef = (yargs) => yargs.option('maxParallelSizeMB',
	{
		describe: 'Maximum amount of file size to process in parallel',
		type: 'number',
		default: 2048,
	}).option('maxParallelFiles',
	{
		describe: 'Maximum amount of files to process in parallel',
		type: 'number',
		default: 2000,
	});

module.exports = { scripts, argsDef };

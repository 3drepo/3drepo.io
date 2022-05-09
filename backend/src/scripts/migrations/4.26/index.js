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

const addAdminJob = require('./addAdminJob');
const removeUnityAssetsJSON = require('./removeUnityAssetsJSON');
const removeGridFSBackUps = require('./removeGridFSBackUps');
const moveGridFSToFS = require('./moveGridFSToFS');
const addAndAssignDefaultRole = require('./addAndAssignDefaultRole');

const scripts = [
	{ script: addAdminJob, desc: 'Add Admin job and assign the teamspace owner' },
	{ script: addAndAssignDefaultRole, desc: 'Add Default role and assign it to all users' },
	{ script: removeUnityAssetsJSON, desc: 'Remove redundant UnityAssets.json files' },
	{ script: removeGridFSBackUps, desc: 'Remove GridFS backup entries' },
	{ script: moveGridFSToFS, desc: 'Move gridFS documents to fileshare' },
	{ script: removeGridFSBackUps, desc: 'Remove redundant GridFS files (due to last script)' },
];

module.exports = scripts;

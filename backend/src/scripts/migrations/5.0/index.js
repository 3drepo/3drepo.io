/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const addVertexCountsToMeshBSONs = require('./addVertexCountsToMeshBSONs');
const addVertexCountsToSuperMeshBSONs = require('../5.0.2/addVertexCountsToSuperMeshBSONs');
const moveTSDataToTSSettings = require('./moveTSDataToTSSettings');
const updateFedSettingSubModels = require('./updateFedSettingSubModels');

const scripts = [
	{ script: addVertexCountsToMeshBSONs, desc: 'Add vertex counts to mesh BSONs for streaming' },
	{ script: addVertexCountsToSuperMeshBSONs, desc: 'Add vertex counts to super mesh BSONs for streaming' },
	{ script: moveTSDataToTSSettings, desc: 'Move team data in system.users to teamspace settings' },
	{ script: updateFedSettingSubModels, desc: 'Update subModels in federation settings' },
];

module.exports = scripts;

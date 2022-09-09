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

const instantiateSystemRoles = require('./instantiateSystemRoles');
const removeIndex = require('./removeIndices');
const addRevId = require('./addRevIdToNodes');
const removeCurrentIds = require('./removeCurrentIds');
const updateMetaSchema = require('./updateMetadataSchema');
const addIndex = require('./addIndices');

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

logger.logInfo('This migration adds the system roles for administration endpoint.');
logger.logWarning('This migration changes the schema of the scene graph. Please ensure there are no active bouncer processes');

const scripts = [
	{ script: instantiateSystemRoles, desc: 'Instantiate System Roles' },
	{ script: removeIndex, desc: 'Remove deprecated index' },
	{ script: addRevId, desc: 'Add revision id to all scene nodes' },
	{ script: updateMetaSchema, desc: 'Update metadata schema' },
	{ script: addIndex, desc: 'Add new indices to scene graph' },
	{ script: removeCurrentIds, desc: 'Remove current id array from revision nodes' },
];

module.exports = scripts;

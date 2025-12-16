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

const FSHandler = require('../handler/fs');
const { FileStorageTypes } = require('../utils/config.constants');
const config = require('../utils/config');
const { init: initFrontegg } = require('./sso/frontegg');
const { initialise: initFronteggCache } = require('../models/frontegg.cache');
const { initialise: initInvites } = require('../models/invitations');
const { init: initJournalingService } = require('./journaling');
const { initialise: initLoginRecs } = require('../models/loginRecords');
const { init: initNotificationService } = require('./notifications');

const Initialiser = {};

Initialiser.initialiseSystem = () => Promise.all([
	initLoginRecs(),
	initInvites(),
	initJournalingService(),
	initNotificationService(),
	initFrontegg(),
	initFronteggCache(),
]);

const checkFSHandler = async (storageType) => {
	if (!config[storageType]) {
		throw new Error(`Filesystem configuration for ${storageType} is missing`);
	}

	const handler = FSHandler.getHandler(storageType);
	await handler.testFilesystem();
};

Initialiser.checkSystem = async (requireExternalFS = false) => {
	await Promise.all([
		checkFSHandler(FileStorageTypes.FS),
		requireExternalFS && config[FileStorageTypes.EXTERNAL_FS]
			? checkFSHandler(FileStorageTypes.EXTERNAL_FS) : Promise.resolve(),
	]);
};

module.exports = Initialiser;

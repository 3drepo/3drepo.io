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

const { FileStorageTypes } = require('../../../../src/v5/utils/config.constants');
const { src } = require('../../helper/path');

const { determineTestGroup } = require('../../helper/services');

jest.mock('../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

jest.mock('../../../../src/v5/services/journaling');
const JournalingService = require(`${src}/services/journaling`);

jest.mock('../../../../src/v5/services/notifications');
const NotificationService = require(`${src}/services/notifications`);

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

jest.mock('../../../../src/v5/models/invitations');
const Invitations = require(`${src}/models/invitations`);

jest.mock('../../../../src/v5/models/frontegg.cache');
const FronteggCache = require(`${src}/models/frontegg.cache`);

jest.mock('../../../../src/v5/handler/fs', () => ({
	getHandler: jest.fn().mockReturnValue({
		testFilesystem: jest.fn(),

	}),
}));

const FSHandler = require(`${src}/handler/fs`);
const handlerMock = FSHandler.getHandler(FileStorageTypes.FS);

const config = require(`${src}/utils/config`);

const Initialiser = require(`${src}/services/initialiser`);

const testInitialiseSystem = () => {
	describe('Initialise System', () => {
		test('All initialising functions should be called', async () => {
			await Initialiser.initialiseSystem();

			expect(LoginRecords.initialise).toHaveBeenCalledTimes(1);
			expect(Invitations.initialise).toHaveBeenCalledTimes(1);
			expect(JournalingService.init).toHaveBeenCalledTimes(1);
			expect(NotificationService.init).toHaveBeenCalledTimes(1);
			expect(FronteggService.init).toHaveBeenCalledTimes(1);
			expect(FronteggCache.initialise).toHaveBeenCalledTimes(1);
		});
	});
};

const testCheckSystem = () => {
	describe('Check System', () => {
		test('FSHandler testFilesystem should be called for both FS and EXTERNAL_FS', async () => {
			await Initialiser.checkSystem(true);

			expect(FSHandler.getHandler).toHaveBeenCalledTimes(2);
			expect(FSHandler.getHandler).toHaveBeenCalledWith(FileStorageTypes.FS);
			expect(FSHandler.getHandler).toHaveBeenCalledWith(FileStorageTypes.EXTERNAL_FS);
			expect(handlerMock.testFilesystem).toHaveBeenCalledTimes(2);
		});

		test('FSHandler testFilesystem should be called only for FS', async () => {
			await Initialiser.checkSystem(false);

			expect(FSHandler.getHandler).toHaveBeenCalledTimes(1);
			expect(FSHandler.getHandler).toHaveBeenCalledWith(FileStorageTypes.FS);
			expect(handlerMock.testFilesystem).toHaveBeenCalledTimes(1);
		});

		test('Should throw if storage config is not configured', async () => {
			const originalConfig = config[FileStorageTypes.FS];
			delete config[FileStorageTypes.FS];

			await expect(Initialiser.checkSystem()).rejects.not.toBeUndefined();
			expect(FSHandler.getHandler).not.toHaveBeenCalled();

			// Restore config
			config[FileStorageTypes.EXTERNAL_FS] = originalConfig;
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testInitialiseSystem();
	testCheckSystem();
});

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

const {
	determineTestGroup,
	generateRandomString,
} = require('../../helper/services');
const { utilScripts, src } = require('../../helper/path');

const config = require(`${src}/utils/config`);
const LicenseCheck = require(`${utilScripts}/licensing/checkLicense`);
jest.mock('cryptolens');
const CryptoLens = require('cryptolens');

CryptoLens.Helpers.GetMachineCode.mockReturnValue(generateRandomString());

const runTest = () => {
	describe('License Check', () => {
		beforeEach(() => {
			delete config.repoLicense;
		});

		test('Should execute without errors if repoLicense is not defined', async () => {
			await expect(LicenseCheck.run()).resolves.toBeUndefined();
		});

		test('Should execute without errors if the key is invalid', async () => {
			CryptoLens.Key.Activate.mockRejectedValueOnce(new Error(generateRandomString()));
			config.repoLicense = generateRandomString();
			await expect(LicenseCheck.run()).resolves.toBeUndefined();
			expect(CryptoLens.Key.Activate).toHaveBeenCalledTimes(1);
			expect(CryptoLens.Key.Deactivate).not.toHaveBeenCalled();
		});

		test('Should execute without errors if the key is valid', async () => {
			config.repoLicense = generateRandomString();
			CryptoLens.Key.Activate.mockResolvedValueOnce({
				Key: config.repoLicense,
				Created: new Date(),
				Expires: new Date(),
				ActivatedMachines: [],
			});

			await expect(LicenseCheck.run()).resolves.toBeUndefined();

			expect(CryptoLens.Key.Activate).toHaveBeenCalledTimes(1);
			expect(CryptoLens.Key.Deactivate).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
});

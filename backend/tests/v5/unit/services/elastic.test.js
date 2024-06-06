/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { src, srcV4 } = require('../../helper/path');
const config = require('../../../../src/v5/utils/config');
const { generateRandomString, generateRandomNumber } = require('../../helper/services');

jest.mock('../../../../src/v4/handler/elastic');
const { createElasticRecord } = require(`${srcV4}/handler/elastic`);

const Elastic = require(`${src}/services/elastic`);

const testCreateActivityRecord = () => {
	describe('Create Elastic activity record', () => {
		beforeAll(() => {
			jest.useFakeTimers('modern');
			jest.setSystemTime(new Date(2020, 3, 1));
		});

		test('Should call createElasticRecord', () => {
			const status = generateRandomNumber();
			const code = generateRandomString();
			const latency = generateRandomNumber();
			const contentLength = generateRandomNumber();
			const user = generateRandomString();
			const method = generateRandomString();
			const originalUrl = generateRandomString();

			const { host } = config;
			const timestamp = new Date();
			const id = `${host}-${user}-${timestamp.valueOf()}`;

			const elasticBody = {
				status: parseInt(status, 10),
				code,
				latency: parseInt(latency, 10),
				contentLength: parseInt(contentLength, 10),
				user,
				method,
				originalUrl,
				timestamp,
				host,
			};

			Elastic.createActivityRecord(
				status,
				code,
				latency,
				contentLength,
				user,
				method,
				originalUrl,
			);

			expect(createElasticRecord).toHaveBeenCalledTimes(1);
			expect(createElasticRecord).toHaveBeenCalledWith(
				'io-activity', elasticBody, id);
		});
	});

	afterAll(() => {
		jest.useRealTimers();
	});
};

describe('services/elastic', () => {
	testCreateActivityRecord();
});

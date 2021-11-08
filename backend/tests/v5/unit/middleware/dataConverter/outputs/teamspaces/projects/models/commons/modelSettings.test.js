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

const { src } = require('../../../../../../../../helper/path');
const { generateRandomModelProperties } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const ModelSettingsOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings`);

// Mock respond function to just return the resCode
const respondFn = Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testFormatModelSettings = () => {
	const withTimestamp = { ...generateRandomModelProperties(), timestamp: new Date() };
	const withErrorReason = { ...generateRandomModelProperties(),
		errorReason: {
			message: 'error message',
			errorCode: 1,
			timestamp: new Date(),
		},
	};
	const withErrorReasonNoTimestamp = { ...generateRandomModelProperties(),
		errorReason: {
			message: 'error message',
			errorCode: 1,
		},
	};
	describe.each([
		[generateRandomModelProperties(), 'no timestamp, no errorReason'],
		[withTimestamp, 'timestamp'],
		[withErrorReason, 'errorReason'],
		[withErrorReasonNoTimestamp, 'errorReason without timestamp'],
	])('Format model settings data', (data, desc) => {
		test(`should format correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				ModelSettingsOutputMiddlewares.formatModelSettings({ outputData: cloneDeep(data) }, {}, () => {});
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const formattedSettings = {
					...data,
					timestamp: data.timestamp ? data.timestamp.getTime() : undefined,
					code: data.properties.code,
					unit: data.properties.unit,
					errorReason: data.errorReason ? {
						message: data.errorReason.message,
						errorCode: data.errorReason.errorCode,
						timestamp: data.errorReason.timestamp ? data.errorReason.timestamp.getTime() : undefined,
					} : undefined,
				};
				delete formattedSettings.properties;

				expect(respondFn.mock.calls[nextIdx][3]).toEqual({ ...formattedSettings });
			});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings', () => {
	testFormatModelSettings();
});

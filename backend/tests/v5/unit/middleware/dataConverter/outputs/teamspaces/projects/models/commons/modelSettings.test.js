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

const { MODEL_TYPES } = require('../../../../../../../../../../src/v5/models/modelSettings.constants');
const { src } = require('../../../../../../../../helper/path');
const { determineTestGroup, generateRandomModelProperties, generateUUID } = require('../../../../../../../../helper/services');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const ModelSettingsOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings`);

// Mock respond function to just return the resCode
const respondFn = Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testFormatModelSettings = () => {
	const withoutDefaultView = { ...generateRandomModelProperties(), defaultView: undefined };
	const withoutDefaultLegend = { ...generateRandomModelProperties(), defaultLegend: undefined };
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
	const withUuidDefaultView = { ...generateRandomModelProperties(),
		defaultView: generateUUID(),
	};

	const withUuidDefaultLegend = { ...generateRandomModelProperties(),
		defaultLegend: generateUUID(),
	};

	describe.each([
		[generateRandomModelProperties(), 'no timestamp, no errorReason'],
		[withoutDefaultView, 'no defaultView'],
		[withoutDefaultLegend, 'no defaultLegend'],
		[withTimestamp, 'timestamp'],
		[withErrorReason, 'errorReason'],
		[withErrorReasonNoTimestamp, 'errorReason without timestamp'],
		[withUuidDefaultView, 'with defaultView that is UUID'],
		[withUuidDefaultLegend, 'with defaultLegend that is UUID'],
	])('Format model settings data', (data, desc) => {
		test(`should format correctly with ${desc}`,
			() => {
				const req = { outputData: cloneDeep(data) };
				const res = {};
				ModelSettingsOutputMiddlewares.formatModelSettings(req, res, () => {});
				const formattedSettings = {
					...data,
					defaultView: UUIDToString(data.defaultView),
					defaultLegend: UUIDToString(data.defaultLegend),
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

				expect(respondFn).toHaveBeenCalledTimes(1);
				expect(respondFn).toHaveBeenCalledWith(req, res, templates.ok, formattedSettings);
			});
	});
};

const testFormatModelStats = () => {
	describe.each([
		[MODEL_TYPES.FEDERATION, { lastUpdated: new Date() }, 'lastUpdated field'],
		[MODEL_TYPES.FEDERATION, {}, 'no lastUpdated field'],
		[MODEL_TYPES.CONTAINER, { revisions: {} }, 'no data to convert'],
		[MODEL_TYPES.CONTAINER, { revisions: {
			lastUpdated: new Date(),
			latestRevision: generateUUID(),
		},
		errorReason: { timestamp: new Date() } }, 'data to convert'],
	])('Format model stats data', (modelType, data, desc) => {
		test(`[${modelType ? 'Federation' : 'Container'}] should format correctly with ${desc}`,
			async () => {
				const req = { outputData: cloneDeep(data) };
				const res = {};
				await ModelSettingsOutputMiddlewares.formatModelStats(modelType)(req, res);

				const formattedStats = {
					...data,
				};

				if (modelType === MODEL_TYPES.FEDERATION) {
					formattedStats.lastUpdated = data.lastUpdated ? data.lastUpdated.getTime() : undefined;
				} else {
					formattedStats.revisions.lastUpdated = formattedStats.revisions.lastUpdated
						? formattedStats.revisions.lastUpdated.getTime() : undefined;
					if (formattedStats.errorReason?.timestamp) {
						formattedStats.errorReason.timestamp = formattedStats.errorReason.timestamp.getTime();
					}
					formattedStats.revisions.latestRevision = UUIDToString(formattedStats.revisions.latestRevision);
				}

				expect(respondFn).toHaveBeenCalledTimes(1);
				expect(respondFn).toHaveBeenCalledWith(req, res, templates.ok, formattedStats);
			});
	});
};

describe(determineTestGroup(__filename), () => {
	testFormatModelSettings();
	testFormatModelStats();
});

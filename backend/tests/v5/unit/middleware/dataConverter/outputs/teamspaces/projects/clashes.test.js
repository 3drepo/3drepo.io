/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { src } = require('../../../../../../helper/path');
const { generateRandomNumber, generateRandomString, generateUUID, generateRandomDate } = require('../../../../../../helper/services');

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { clashRunStatus } = require(`${src}/models/clashes.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const ClashOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/clashes`);

const testSerialiseClashPlans = () => {
	describe('Serialise clash plans', () => {
		test('should convert UUID and date fields in plans list output', () => {
			const createdAt = generateRandomDate();
			const updatedAt = generateRandomDate();
			const req = {
				outputData:
					[
						{
							_id: generateUUID(),
							name: generateRandomString(),
							createdAt,
							updatedAt,
							selectionA: { container: generateUUID() },
							selectionB: { container: generateUUID() },
						},
					],

			};

			ClashOutputMiddleware.serialiseClashPlans(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, {
				plans: [
					{
						...req.outputData[0],
						_id: UUIDToString(req.outputData[0]._id),
						createdAt: createdAt.getTime(),
						updatedAt: updatedAt.getTime(),
						selectionA: { container: UUIDToString(req.outputData[0].selectionA.container) },
						selectionB: { container: UUIDToString(req.outputData[0].selectionB.container) },
					},
				],
			});
		});
	});
};

const testSerialiseClashPlan = () => {
	describe('Serialise clash plan', () => {
		test('should convert nested UUID fields and createdAt/updatedAt dates', () => {
			const createdAt = generateRandomDate();
			const updatedAt = generateRandomDate();
			const req = {
				outputData: {
					_id: generateUUID(),
					name: generateRandomString(),
					createdAt,
					updatedAt,
					tickets: {
						template: generateUUID(),
						federation: generateUUID(),
					},
					selectionA: {
						container: generateUUID(),
					},
					selectionB: {
						container: generateUUID(),
					},
				},
			};

			ClashOutputMiddleware.serialiseClashPlan(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, {
				...req.outputData,
				_id: UUIDToString(req.outputData._id),
				createdAt: createdAt.getTime(),
				updatedAt: updatedAt.getTime(),
				tickets: {
					template: UUIDToString(req.outputData.tickets.template),
					federation: UUIDToString(req.outputData.tickets.federation),
				},
				selectionA: {
					container: UUIDToString(req.outputData.selectionA.container),
				},
				selectionB: {
					container: UUIDToString(req.outputData.selectionB.container),
				},
			});
		});
	});
};

const testSerialiseClashRuns = () => {
	describe('Serialise clash runs', () => {
		test('should serialise completed, failed and default statuses into expected output shape', () => {
			const completedRun = {
				_id: generateUUID(),
				status: clashRunStatus.COMPLETED,
				triggeredAt: generateRandomDate(),
				triggeredBy: generateRandomString(),
				completedAt: generateRandomDate(),
				result: {
					stats: {
						new: generateRandomNumber(),
						current: generateRandomNumber(),
						resolved: generateRandomNumber(),
					},
				},
			};
			const failedRun = {
				_id: generateUUID(),
				status: clashRunStatus.FAILED,
				triggeredAt: generateRandomDate(),
				triggeredBy: generateRandomString(),
				errorCode: generateRandomString(),
				message: generateRandomString(),
			};
			const plannedRun = {
				_id: generateUUID(),
				status: clashRunStatus.PLANNED,
				triggeredAt: generateRandomDate(),
				triggeredBy: generateRandomString(),
				completedAt: generateRandomDate(),
				result: { ignored: true },
				errorCode: generateRandomString(),
				message: generateRandomString(),
			};
			const req = { outputData: [completedRun, failedRun, plannedRun] };

			ClashOutputMiddleware.serialiseClashRuns(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, {
				runs: [
					{
						_id: UUIDToString(completedRun._id),
						status: completedRun.status,
						triggeredAt: completedRun.triggeredAt.getTime(),
						triggeredBy: completedRun.triggeredBy,
						completedAt: completedRun.completedAt.getTime(),
						result: {
							stats: {
								...completedRun.result.stats,
							},
						},
					},
					{
						_id: UUIDToString(failedRun._id),
						status: failedRun.status,
						triggeredAt: failedRun.triggeredAt.getTime(),
						triggeredBy: failedRun.triggeredBy,
						result: { error: { code: failedRun.errorCode, reason: failedRun.message } },
					},
					{
						_id: UUIDToString(plannedRun._id),
						status: plannedRun.status,
						triggeredAt: plannedRun.triggeredAt.getTime(),
						triggeredBy: plannedRun.triggeredBy,
					},
				],
			});
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/clashes', () => {
	testSerialiseClashPlans();
	testSerialiseClashPlan();
	testSerialiseClashRuns();
});

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
const ServiceHelper = require('../../../../../../helper/services');
const { determineTestGroup } = require('../../../../../../helper/utils');
const { omit, times } = require('lodash');

const { generateRandomString, generateUUIDString } = ServiceHelper;

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { clashRunStatus } = require(`${src}/models/clashes.constants`);
const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const ClashOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/clashes`);

const deserialisePlan = ({ _id, selectionA, selectionB, tickets, ...plan }, template) => {
	const dateProperties = new Set((template?.properties || [])
		.filter(({ type }) => [propTypes.DATE, propTypes.PAST_DATE].includes(type))
		.map(({ name }) => name));

	return {
		...plan,
		_id: stringToUUID(_id),
		selectionA: selectionA.map(({ container, revision, ...selection }) => ({
			...selection,
			container: stringToUUID(container),
			...(revision ? { revision: stringToUUID(revision) } : {}),
		})),
		selectionB: selectionB.map(({ container, revision, ...selection }) => ({
			...selection,
			container: stringToUUID(container),
			...(revision ? { revision: stringToUUID(revision) } : {}),
		})),
		...(tickets ? {
			tickets: {
				...tickets,
				federation: stringToUUID(tickets.federation),
				template: stringToUUID(tickets.template),
				valuesAtCreation: tickets.valuesAtCreation?.map((entry) => ({
					...entry,
					value: dateProperties.has(entry.property) ? new Date(entry.value) : entry.value,
				})),
			},
		} : {}),
	};
};

const deserialiseRun = ({ _id, clashResults, plan, triggeredAt, updatedAt, ...run }, template) => ({
	...run,
	_id: stringToUUID(_id),
	triggeredAt: new Date(triggeredAt),
	...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
	...(plan ? { plan: deserialisePlan(plan, template) } : {}),
});

const testSerialiseClashPlans = () => {
	describe('Serialise clash plans', () => {
		test('should convert UUID fields in plans list output', () => {
			const plans = times(3,
				() => ServiceHelper.generateClashPlan(generateUUIDString(), generateUUIDString()));
			const req = { outputData: plans.map(deserialisePlan) };

			ClashOutputMiddleware.serialiseClashPlans(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, {
				plans,
			});
		});
	});
};

const testSerialiseClashPlan = () => {
	describe('Serialise clash plan', () => {
		test('should convert nested UUID fields and ticket dates', () => {
			const template = ServiceHelper.generateTemplate();
			const plan = ServiceHelper.generateClashPlan(generateUUIDString(), generateUUIDString(), {
				federation: { _id: generateUUIDString() },
				template,
				creator: generateRandomString(),
			});
			const req = { outputData: deserialisePlan(plan, template) };

			ClashOutputMiddleware.serialiseClashPlan(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, plan);
		});
	});
};

const testSerialiseClashRuns = () => {
	describe('Serialise clash runs', () => {
		test('should serialise projected run UUID/date fields without reshaping run data', () => {
			const clashResults = {
				new: [generateRandomString()],
				active: [generateRandomString()],
				resolved: [generateRandomString()],
			};
			const runs = [
				ServiceHelper.generateClashRun(undefined, clashResults),
				ServiceHelper.generateClashRun(undefined, undefined, {
					status: clashRunStatus.FAILED,
					results: { error: { reason: generateRandomString() } },
				}),
				ServiceHelper.generateClashRun(undefined, undefined, {
					queueId: generateRandomString(),
				}),
			].map((run) => omit(run, 'clashResults'));
			const req = { outputData: runs.map(deserialiseRun) };

			ClashOutputMiddleware.serialiseClashRuns(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, {
				runs,
			});
		});
	});
};

const testSerialiseClashRun = () => {
	describe('Serialise clash run', () => {
		test('should serialise run and nested plan UUID/date fields without reshaping run data', () => {
			const template = ServiceHelper.generateTemplate();
			const plan = ServiceHelper.generateClashPlan(generateUUIDString(), generateUUIDString(), {
				federation: { _id: generateUUIDString() },
				template,
				creator: generateRandomString(),
			});
			const planSnapshot = {
				...plan,
				selectionA: plan.selectionA.map((selection) => ({ ...selection, revision: generateUUIDString() })),
				selectionB: plan.selectionB.map((selection) => ({ ...selection, revision: generateUUIDString() })),
			};
			const clashResults = {
				new: [generateRandomString()],
				active: [generateRandomString()],
				resolved: [generateRandomString()],
			};
			const run = omit(ServiceHelper.generateClashRun(planSnapshot, clashResults), 'clashResults');
			const req = { outputData: deserialiseRun(run, template) };

			ClashOutputMiddleware.serialiseClashRun(req, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, run);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testSerialiseClashPlans();
	testSerialiseClashPlan();
	testSerialiseClashRuns();
	testSerialiseClashRun();
});

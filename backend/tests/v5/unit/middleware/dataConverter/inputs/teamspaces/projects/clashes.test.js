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

const { determineTestGroup } = require('../../../../../../helper/utils');
const { times, isEqual } = require('lodash');
const { src } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/models/projectSettings');
const ProjectSettingsModel = require(`${src}/models/projectSettings`);

jest.mock('../../../../../../../../src/v5/utils/permissions');
const PermUtils = require(`${src}/utils/permissions`);

jest.mock('../../../../../../../../src/v5/models/tickets.templates');
const TicketTemplateModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

const Clashes = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/clashes`);

const { templates } = require(`${src}/utils/responseCodes`);
const {
	generateRandomString,
	generateRandomObject,
	generateRandomNumber,
	generateUUIDString,
} = require('../../../../../../helper/services');
const { stringToUUID, UUIDToString, generateUUID } = require('../../../../../../../../src/v5/utils/helper/uuids');
const { createResponseCode } = require('../../../../../../../../src/v5/utils/responseCodes');

const { fieldOperators, valueOperators } = require(`${src}/models/metadata.rules.constants`);

const { CLASH_PLAN_TYPES, SELF_INTERSECTIONS_CHECK_OPTIONS, TRIGGER_OPTIONS } = require(`${src}/models/clashes.constants`);
const { presetModules } = require(`${src}/schemas/tickets/templates.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateNewPlanData = () => {
	const standardRule = {
		name: generateRandomString(),
		field: { operator: fieldOperators.IS.name, values: [generateRandomString()] },
		operator: valueOperators.IS.name,
		values: [generateRandomString()],
	};

	const recognisedContainer = times(3, () => generateUUIDString());
	const containerNotInProject = recognisedContainer[2];

	const recognisedFederation = generateUUIDString();
	const federationNotInProject = generateUUIDString();
	const templateInTeamspace = generateUUIDString();
	const knownUsername = generateRandomString();

	const deprecatedTemplate = generateUUIDString();
	const templateWithoutCloudClash = generateUUIDString();
	const templateWithDeprecatedCloudClash = generateUUIDString();
	const validTemplate = { modules: [{ type: presetModules.CLOUD_CLASH, properties: [] }] };

	const planData = {
		name: generateRandomString(),
		type: CLASH_PLAN_TYPES[0],
		tolerance: generateRandomNumber(0),
		selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		trigger: [TRIGGER_OPTIONS[0]],
		selectionA: { container: recognisedContainer[0], rules: [standardRule] },
		selectionB: { container: recognisedContainer[1], rules: [standardRule] },
	};

	const ticketData = {
		federation: recognisedFederation,
		template: templateInTeamspace,
		creator: knownUsername,
		valuesAtCreation: times(3,
			() => ({
				property: generateRandomString(),
				module: generateRandomString(),
				value: generateRandomString(),
			})),
	};

	const expectedTicketFormat = {};
	ticketData.valuesAtCreation.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';
		expectedTicketFormat[moduleName] = expectedTicketFormat[moduleName] ?? {};
		expectedTicketFormat[moduleName][property] = value;
	});

	const testCases = [
		['with no object (undefined)', false, undefined],
		['with no object (null)', false, null],
		['with valid data', true, planData],
		['with empty name', false, { ...planData, name: '' }],
		['with too long name', false, { ...planData, name: generateRandomString(1201) }],
		['with undefined name', false, { ...planData, name: undefined }],
		['with invalid type', false, { ...planData, type: generateRandomString() }],
		['with undefined type', false, { ...planData, type: undefined }],
		['with invalid tolerance', false, { ...planData, tolerance: generateRandomString() }],
		['with negative tolerance', false, { ...planData, tolerance: generateRandomNumber(-10, -1) }],
		['with undefined tolerance', false, { ...planData, tolerance: undefined }],
		['with invalid selfIntersectionsCheck', false, { ...planData, selfIntersectionsCheck: generateRandomString() }],
		['with undefined selfIntersectionsCheck', true, { ...planData, selfIntersectionsCheck: undefined }, { ...planData, selfIntersectionsCheck: false }],
		['with selfIntersectionsCheck set to true', true, { ...planData, selfIntersectionsCheck: true }],
		['with selfIntersectionsCheck set to false', true, { ...planData, selfIntersectionsCheck: false }],
		['with invalid trigger', false, { ...planData, trigger: generateRandomString() }],
		['with undefined trigger', false, { ...planData, trigger: undefined }],
		['with duplicate trigger', true, { ...planData, trigger: [TRIGGER_OPTIONS[0], TRIGGER_OPTIONS[0]] }, { ...planData, trigger: [TRIGGER_OPTIONS[0]] }],
		['with empty trigger', false, { ...planData, trigger: [] }],
		['with valid trigger', true, { ...planData, trigger: [TRIGGER_OPTIONS[0], TRIGGER_OPTIONS[1]] }],
		['with selections without container', false, { ...planData, selectionA: { rules: [standardRule] }, selectionB: { rules: [standardRule] } }],
		['with selections with null container', false, { ...planData, selectionA: { container: null }, selectionB: { container: null } }],
		['with selections with container that does not exist', false, { ...planData, selectionA: { container: generateRandomString() } }],
		['with selections with container not in project', false, { ...planData, selectionA: { container: containerNotInProject } }],
		['with valid data (with ticket config)', true, { ...planData, tickets: ticketData }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace) } }],
		['with invalid federation', false, { ...planData, tickets: { ...ticketData, federation: generateRandomString() } }],
		['with federation not belonging to the project', false, { ...planData, tickets: { ...ticketData, federation: federationNotInProject } }],
		['with unrecognised creator', false, { ...planData, tickets: { ...ticketData, creator: generateRandomString() } }],
		['without creator specified', false, { ...planData, tickets: { ...ticketData, creator: undefined } }, { tickets: ticketData }],
		['with unknown template', false, { ...planData, tickets: { ...ticketData, template: generateRandomString() } }],
		['with deprecated template', false, { ...planData, tickets: { ...ticketData, template: deprecatedTemplate } }],
		['with template that does not contain cloud clash module', false, { ...planData, tickets: { ...ticketData, template: templateWithoutCloudClash } }],
		['with template that has deprecated cloud clash module', false, { ...planData, tickets: { ...ticketData, template: templateWithDeprecatedCloudClash } }],
		['with erroneous creation values', false, { ...planData, tickets: { ...ticketData, valuesAtCreation: generateRandomObject() } }],
	];

	describe.each(testCases)('Validate new plan data', (desc, success, data, expectedData) => {
		const teamspace = generateRandomString();
		const project = generateRandomString();

		test(`should ${success ? 'succeed' : 'fail'} ${desc}`, async () => {
			ModelSettingsModel.getContainerById.mockImplementation(
				(t, containerId) => (recognisedContainer.includes(containerId)
					? Promise.resolve({}) : Promise.reject()));
			ModelSettingsModel.getFederationById.mockImplementation(
				(t, federationId) => ([recognisedFederation, federationNotInProject].includes(federationId)
					? Promise.resolve({}) : Promise.reject()),
			);
			ProjectSettingsModel.modelsExistInProject.mockImplementation(
				(t, p, modelIds) => Promise.resolve(modelIds.every(
					(id) => recognisedContainer.includes(id) || recognisedFederation === id)
							&& !modelIds.includes(containerNotInProject)));
			PermUtils.hasCommenterAccessToFederation.mockImplementation(
				(t, p, f, username) => Promise.resolve(username === knownUsername));
			TicketSchema.validateTicket.mockImplementation((t, p, f, tem, updateData) => {
				if (isEqual(updateData, expectedTicketFormat)) return Promise.resolve();
				return Promise.reject(createResponseCode(templates.invalidArguments, 'Ticket values at creation do not match expected format'));
			});

			TicketTemplateModel.getTemplateById.mockImplementation((t, templateId) => {
				if (UUIDToString(templateId) === templateInTeamspace) {
					return Promise.resolve(validTemplate);
				}

				if (UUIDToString(templateId) === deprecatedTemplate) {
					return Promise.resolve({ ...validTemplate, deprecated: true });
				}

				if (UUIDToString(templateId) === templateWithoutCloudClash) {
					return Promise.resolve({ modules: [] });
				}

				if (UUIDToString(templateId) === templateWithDeprecatedCloudClash) {
					return Promise.resolve({ modules: [{ type: presetModules.CLOUD_CLASH,
						deprecated: true,
						properties: [] }] });
				}
				return Promise.reject(createResponseCode(templates.templateNotFound));
			});

			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace, project },
				body: data,
			};
			const res = {};

			await Clashes.validateNewPlanData(req, res, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				expect(req.body).toEqual(expectedData ?? data);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				const { message, ...others } = templates.invalidArguments;
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expect.objectContaining(others));
			}
		});
	});
};

const testValidateUpdatePlanData = () => {
	const standardRule = {
		name: generateRandomString(),
		field: { operator: fieldOperators.IS.name, values: [generateRandomString()] },
		operator: valueOperators.IS.name,
		values: [generateRandomString()],
	};

	const recognisedContainer = times(3, () => generateUUIDString());
	const containerNotInProject = recognisedContainer[2];

	const recognisedFederations = times(2, () => generateUUIDString());
	const federationNotInProject = generateUUIDString();
	const templatesInTeamspace = times(2, () => generateUUIDString());
	const knownUsernames = times(2, () => generateRandomString());

	const deprecatedTemplate = generateUUIDString();
	const templateWithoutCloudClash = generateUUIDString();
	const templateWithDeprecatedCloudClash = generateUUIDString();
	const validTemplate = { modules: [{ type: presetModules.CLOUD_CLASH, properties: [] }] };

	const knownPlanId = generateUUID();
	const planWithTemplateWithoutCloudClash = generateUUID();

	const ticketData = {
		federation: recognisedFederations[0],
		template: stringToUUID(templatesInTeamspace[0]),
		creator: knownUsernames[0],
		valuesAtCreation: times(3,
			() => ({
				property: generateRandomString(),
				module: generateRandomString(),
				value: generateRandomString(),
			})),
	};

	const oldPlanData = {
		name: generateRandomString(),
		type: CLASH_PLAN_TYPES[0],
		tolerance: generateRandomNumber(0),
		selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		trigger: [TRIGGER_OPTIONS[0]],
		selectionA: { container: recognisedContainer[0], rules: [standardRule] },
		selectionB: { container: recognisedContainer[1], rules: [standardRule] },
		tickets: ticketData,
	};

	const expectedValueAtCreationUpdate = times(3,
		() => ({
			property: generateRandomString(),
			module: generateRandomString(),
			value: generateRandomString(),
		}));
	const expectedTicketFormat = {};
	expectedValueAtCreationUpdate.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';
		expectedTicketFormat[moduleName] = expectedTicketFormat[moduleName] ?? {};
		expectedTicketFormat[moduleName][property] = value;
	});

	const oldTicketFormat = {};
	ticketData.valuesAtCreation.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';
		oldTicketFormat[moduleName] = oldTicketFormat[moduleName] ?? {};
		oldTicketFormat[moduleName][property] = value;
	});

	const updateStr = generateRandomString();

	const testCases = [
		['with unknown clash plan', false, { name: updateStr }, templates.clashPlanNotFound, generateUUID()],
		['with no object (undefined)', false, undefined],
		['with no object (null)', false, null],
		['with no updates', false, {}],
		['with new name', true, { name: updateStr }],
		['with same name', false, { name: oldPlanData.name }],
		['with empty name', false, { name: '' }],
		['with null name', false, { name: null }],
		['with too long name', false, { name: generateRandomString(1201) }],
		['with invalid type', false, { type: generateRandomString() }],
		['with same type', false, { type: CLASH_PLAN_TYPES[0] }],
		['with null type', false, { type: null }],
		['with a different type', true, { type: CLASH_PLAN_TYPES[1] }],
		['with same tolerance', false, { tolerance: oldPlanData.tolerance }],
		['with invalid tolerance', false, { tolerance: generateRandomString() }],
		['with new tolerance', true, { tolerance: generateRandomNumber(1, 100) }],
		['with negative tolerance', false, { tolerance: generateRandomNumber(-10, -1) }],
		['with null tolerance', false, { tolerance: null }],
		['with invalid selfIntersectionsCheck', false, { selfIntersectionsCheck: generateRandomString() }],
		['with same selfIntersectionsCheck', false, { selfIntersectionsCheck: oldPlanData.selfIntersectionsCheck }],
		['with null selfIntersectionsCheck', false, { selfIntersectionsCheck: null }],
		['with new selfIntersectionsCheck', true, { selfIntersectionsCheck: !oldPlanData.selfIntersectionsCheck }],
		['with invalid trigger', false, { trigger: generateRandomString() }],
		['with undefined trigger', false, { trigger: undefined }],
		['with same trigger', false, { trigger: oldPlanData.trigger }],
		['with empty trigger', false, { trigger: [] }],
		['with null trigger', false, { trigger: null }],
		['with duplicate trigger', true, { trigger: [TRIGGER_OPTIONS[1], TRIGGER_OPTIONS[1]] }, { trigger: [TRIGGER_OPTIONS[1]] }],
		['with duplicate old trigger', false, { trigger: [TRIGGER_OPTIONS[0], TRIGGER_OPTIONS[0]] }],
		['with selections without container', false, { selectionA: { rules: [standardRule] }, selectionB: { rules: [standardRule] } }],
		['with selections with null container', false, { selectionA: { container: null }, selectionB: { container: null } }],
		['with selections with container that does not exist', false, { selectionA: { container: generateRandomString() } }],
		['with selections with container not in project', false, { selectionA: { container: containerNotInProject } }],
		['with null selections', false, { selectionA: null }],
		['with same selections', false, { selectionA: oldPlanData.selectionA, selectionB: oldPlanData.selectionB }],
		['with one set of same selection', true, { selectionA: oldPlanData.selectionA, selectionB: oldPlanData.selectionA }, { selectionB: oldPlanData.selectionA }],
		['with null ticket config', true, { tickets: null }],
		['with same ticket config', false, { tickets: oldPlanData.tickets }],
		['with invalid federation', false, { tickets: { federation: generateRandomString() } }],
		['with federation not belonging to the project', false, { tickets: { federation: federationNotInProject } }],
		['with different federation ', true, { tickets: { federation: recognisedFederations[1] } }],
		['with null federation ', false, { tickets: { federation: null } }],
		['with unrecognised creator', false, { tickets: { creator: generateRandomString() } }],
		['with new creator', true, { tickets: { creator: knownUsernames[1] } }],
		['with null creator', false, { tickets: { creator: null } }],
		['with same creator', false, { tickets: { creator: oldPlanData.tickets.creator } }],
		['with unknown template', false, { tickets: { template: generateRandomString() } }],
		['with deprecated template', false, { tickets: { template: deprecatedTemplate } }],
		['with template that does not contain cloud clash module', false, { tickets: { template: templateWithoutCloudClash } }],
		['with template that has deprecated cloud clash module', false, { tickets: { template: templateWithDeprecatedCloudClash } }],
		['with same template', false, { tickets: { template: oldPlanData.tickets.template } }],
		['with null template', false, { tickets: { template: null } }],
		['with new template', true, { tickets: { template: templatesInTeamspace[1] } }, { tickets: { template: stringToUUID(templatesInTeamspace[1]) } }],
		['with existing template that does not contain cloud clash module', false, { tickets: { creator: knownUsernames[1] } }, undefined, planWithTemplateWithoutCloudClash],
		['with null creation values', true, { tickets: { valuesAtCreation: null } }],
		['with invalid creation values', false, { tickets: { valuesAtCreation: [{ property: generateRandomString(), value: generateRandomString() }] } }],
		['with same creation values', false, { tickets: { valuesAtCreation: oldPlanData.tickets.valuesAtCreation } }],
		['with new creation values', true, { tickets: { valuesAtCreation: expectedValueAtCreationUpdate } }],
	];

	describe.each(testCases)('Validate update plan data', (desc, success, data, expectedData, planId = knownPlanId) => {
		const teamspace = generateRandomString();
		const project = generateRandomString();

		test(`should ${success ? 'succeed' : 'fail'} ${desc}`, async () => {
			ModelSettingsModel.getContainerById.mockImplementation(
				(t, containerId) => (recognisedContainer.includes(containerId)
					? Promise.resolve({}) : Promise.reject()));
			ModelSettingsModel.getFederationById.mockImplementation(
				(t, federationId) => ([...recognisedFederations, federationNotInProject].includes(federationId)
					? Promise.resolve({}) : Promise.reject()));
			ProjectSettingsModel.modelsExistInProject.mockImplementation(
				(t, pro, modelIds) => Promise.resolve(modelIds.every(
					(id) => recognisedContainer.includes(id) || recognisedFederations.includes(id))
							&& !modelIds.includes(containerNotInProject)));
			PermUtils.hasCommenterAccessToFederation.mockImplementation(
				(t, pro, f, username) => Promise.resolve(knownUsernames.includes(username)));
			TicketSchema.validateTicket.mockImplementation((t, pro, f, tem, updateData) => {
				if (isEqual(updateData, expectedTicketFormat)
					|| isEqual(updateData, oldTicketFormat)) return Promise.resolve();
				return Promise.reject(createResponseCode(templates.invalidArguments,
					'Ticket values at creation do not match expected format'));
			});
			ClashPlansModel.getPlanById.mockImplementation((t, p, id) => {
				if (UUIDToString(id) === UUIDToString(knownPlanId)) {
					return Promise.resolve(oldPlanData);
				}
				if (UUIDToString(id) === UUIDToString(planWithTemplateWithoutCloudClash)) {
					return Promise.resolve({
						...oldPlanData,
						tickets: { ...oldPlanData.tickets, template: stringToUUID(templateWithoutCloudClash) },
					});
				}
				return Promise.reject(templates.clashPlanNotFound);
			});

			TicketTemplateModel.getTemplateById.mockImplementation((t, templateId) => {
				if (templatesInTeamspace.includes(UUIDToString(templateId))) {
					return Promise.resolve(validTemplate);
				}

				if (UUIDToString(templateId) === deprecatedTemplate) {
					return Promise.resolve({ ...validTemplate, deprecated: true });
				}

				if (UUIDToString(templateId) === templateWithoutCloudClash) {
					return Promise.resolve({ modules: [] });
				}

				if (UUIDToString(templateId) === templateWithDeprecatedCloudClash) {
					return Promise.resolve({ modules: [{ type: presetModules.CLOUD_CLASH,
						deprecated: true,
						properties: [] }] });
				}
				return Promise.reject(createResponseCode(templates.templateNotFound));
			});

			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace, project, planId },
				body: data,
			};
			const res = {};

			await Clashes.validateUpdatePlanData(req, res, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				expect(req.body).toEqual(expectedData ?? data);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				if (expectedData) {
					expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedData);
				} else {
					const { message, ...others } = templates.invalidArguments;
					expect(Responder.respond).toHaveBeenCalledWith(req, res, expect.objectContaining(others));
				}
			}
		});
	});
};

const testPlanExists = () => {
	describe('Check if plan exists', () => {
		test('should respond with error if plan does not exist', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
			};
			ClashPlansModel.getPlanById.mockRejectedValueOnce(templates.clashPlanNotFound);

			await Clashes.planExists(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.params.planId);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.clashPlanNotFound);
		});

		test('next() should be called if the plan exists', async () => {
			const mockCB = jest.fn(() => {});
			const plan = generateRandomObject();
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			await Clashes.planExists(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalled();
			expect(req.planData).toEqual(plan);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.params.planId);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testPlanContainersHaveRevs = () => {
	describe('planContainersHaveRevs', () => {
		test('should assign latest revisions to selectionA and selectionB and call next()', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const revA = generateRandomString();
			const revB = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};
			RevisionsModel.getLatestRevision
				.mockResolvedValueOnce({ _id: revA })
				.mockResolvedValueOnce({ _id: revB });

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerB, modelTypes.CONTAINER, { _id: 1 });
			expect(req.planData.selectionA.revision).toEqual(revA);
			expect(req.planData.selectionB.revision).toEqual(revB);

			expect(mockCB).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with error if a revisionNotFound error is thrown', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};
			RevisionsModel.getLatestRevision.mockRejectedValueOnce(templates.revisionNotFound);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			const { message, ...invalidArgRes } = templates.invalidArguments;
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, expect.objectContaining(invalidArgRes));

			expect(mockCB).not.toHaveBeenCalled();
		});

		test('should respond with error if another error is thrown', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};

			const error = new Error(generateRandomString());
			RevisionsModel.getLatestRevision.mockRejectedValueOnce(error);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerB, modelTypes.CONTAINER, { _id: 1 });

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, error);

			expect(mockCB).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewPlanData();
	testValidateUpdatePlanData();
	testPlanExists();
	testPlanContainersHaveRevs();
});

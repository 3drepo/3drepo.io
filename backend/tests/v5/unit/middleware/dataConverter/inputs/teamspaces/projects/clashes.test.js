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

const { times, isEqual } = require('lodash');
const { determineTestGroup } = require('../../../../../../helper/utils');
const { src } = require('../../../../../../helper/path');

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

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

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/clashes');
const ClashesProcessor = require(`${src}/processors/teamspaces/projects/clashes`);

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

const { CLASH_TYPES, SELF_INTERSECTIONS_CHECK_OPTIONS, triggerOptions } = require(`${src}/models/clashes.constants`);
const { presetModules, statuses: templateDefaultStatuses } = require(`${src}/schemas/tickets/templates.constants`);

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
	const templateWithCustomStatuses = generateUUIDString();
	const customStatusValues = times(3, () => ({ name: generateRandomString(10) }));
	const knownUsername = generateRandomString();

	const deprecatedTemplate = generateUUIDString();
	const templateWithoutCloudClash = generateUUIDString();
	const templateWithDeprecatedCloudClash = generateUUIDString();
	const validTemplate = { modules: [{ type: presetModules.CLOUD_CLASH, properties: [] }] };

	const planData = {
		name: generateRandomString(),
		type: CLASH_TYPES.HARD,
		tolerance: generateRandomNumber(0),
		selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		trigger: [triggerOptions.MANUAL],
		selectionA: { container: recognisedContainer[0], rules: [standardRule] },
		selectionB: { container: recognisedContainer[1], rules: [standardRule] },
	};

	const ticketData = {
		federation: recognisedFederation,
		template: templateInTeamspace,
		creator: knownUsername,
		valuesAtCreation: [
			{
				property: generateRandomString(),
				value: generateRandomString(),
			},
			...times(2, () => ({
				property: generateRandomString(),
				module: generateRandomString(),
				value: generateRandomString(),
			})),
		],
	};

	const expectedTicketFormat = {};
	ticketData.valuesAtCreation.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';

		if (moduleName === 'properties') {
			expectedTicketFormat.properties = expectedTicketFormat.properties ?? {};
			expectedTicketFormat.properties[property] = value;
		} else {
			expectedTicketFormat.modules = expectedTicketFormat.modules ?? {};
			expectedTicketFormat.modules[moduleName] = expectedTicketFormat.modules[moduleName] ?? {};
			expectedTicketFormat.modules[moduleName][property] = value;
		}
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
		['with duplicate trigger', true, { ...planData, trigger: [triggerOptions.MANUAL, triggerOptions.MANUAL] }, { ...planData, trigger: [triggerOptions.MANUAL] }],
		['with empty trigger', false, { ...planData, trigger: [] }],
		['with valid trigger', true, { ...planData, trigger: [triggerOptions.MANUAL, triggerOptions.NEW_REVISION] }],
		['with selections without container', false, { ...planData, selectionA: { rules: [standardRule] }, selectionB: { rules: [standardRule] } }],
		['with selections with null container', false, { ...planData, selectionA: { container: null }, selectionB: { container: null } }],
		['with selections with container that does not exist', false, { ...planData, selectionA: { container: generateRandomString() } }],
		['with selections with container not in project', false, { ...planData, selectionA: { container: containerNotInProject } }],
		['with valid data (with ticket config)', true, { ...planData, tickets: ticketData }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace) } }],
		['with valid data (with ticket config and built in default statuses)', true, { ...planData, tickets: { ...ticketData, defaultStatuses: { onNew: templateDefaultStatuses.OPEN, onResolved: templateDefaultStatuses.CLOSED, onReopened: templateDefaultStatuses.IN_PROGRESS } } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace), defaultStatuses: { onNew: templateDefaultStatuses.OPEN, onResolved: templateDefaultStatuses.CLOSED, onReopened: templateDefaultStatuses.IN_PROGRESS } } }],
		['with valid data (with ticket config and custom default statuses)', true, { ...planData, tickets: { ...ticketData, template: templateWithCustomStatuses, defaultStatuses: { onNew: customStatusValues[0].name, onResolved: customStatusValues[1].name, onReopened: customStatusValues[2].name } } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateWithCustomStatuses), defaultStatuses: { onNew: customStatusValues[0].name, onResolved: customStatusValues[1].name, onReopened: customStatusValues[2].name } } }],
		['with empty default statuses', true, { ...planData, tickets: { ...ticketData, defaultStatuses: {} } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace) } }],
		['with null default statuses', true, { ...planData, tickets: { ...ticketData, defaultStatuses: { onResolved: null } } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace) } }],
		['with invalid default status value', false, { ...planData, tickets: { ...ticketData, defaultStatuses: { onNew: generateRandomString() } } }],
		['with invalid default status type', false, { ...planData, tickets: { ...ticketData, defaultStatuses: { onNew: generateRandomNumber() } } }],
		['with unrecognised default status field', true, { ...planData, tickets: { ...ticketData, defaultStatuses: { [generateRandomString()]: templateDefaultStatuses.OPEN } } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace) } }],
		['with valid and unrecognised default status fields', true, { ...planData, tickets: { ...ticketData, defaultStatuses: { onNew: templateDefaultStatuses.OPEN, [generateRandomString()]: templateDefaultStatuses.CLOSED } } }, { ...planData, tickets: { ...ticketData, template: stringToUUID(templateInTeamspace), defaultStatuses: { onNew: templateDefaultStatuses.OPEN } } }],
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
			TicketSchema.validateTickets.mockImplementation((t, p, f, tem, updateData) => {
				if (isEqual(updateData[0], expectedTicketFormat)) return Promise.resolve();
				return Promise.reject(createResponseCode(templates.invalidArguments, 'Ticket values at creation do not match expected format'));
			});

			TicketTemplateModel.getTemplateById.mockImplementation((t, templateId) => {
				if (UUIDToString(templateId) === templateInTeamspace) {
					return Promise.resolve(validTemplate);
				}

				if (UUIDToString(templateId) === templateWithCustomStatuses) {
					return Promise.resolve({ ...validTemplate, config: { status: { values: customStatusValues } } });
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
	const templateWithCustomStatuses = generateUUIDString();
	const customStatusValues = times(3, () => ({ name: generateRandomString(10) }));
	const knownUsernames = times(2, () => generateRandomString());

	const deprecatedTemplate = generateUUIDString();
	const templateWithoutCloudClash = generateUUIDString();
	const templateWithDeprecatedCloudClash = generateUUIDString();
	const validTemplate = { modules: [{ type: presetModules.CLOUD_CLASH, properties: [] }] };

	const knownPlanId = generateUUID();
	const planWithTemplateWithoutCloudClash = generateUUID();
	const planWithoutDefaultStatusesId = generateUUID();
	const planWithAllTriggersId = generateUUID();

	const ticketData = {
		federation: recognisedFederations[0],
		template: stringToUUID(templatesInTeamspace[0]),
		creator: knownUsernames[0],
		defaultStatuses: {
			onNew: templateDefaultStatuses.OPEN,
			onResolved: templateDefaultStatuses.CLOSED,
			onReopened: templateDefaultStatuses.IN_PROGRESS,
		},
		valuesAtCreation: [
			{
				property: generateRandomString(),
				value: generateRandomString(),
			},
			...times(2, () => ({
				property: generateRandomString(),
				module: generateRandomString(),
				value: generateRandomString(),
			})),
		],
	};

	const oldPlanData = {
		name: generateRandomString(),
		type: CLASH_TYPES.HARD,
		tolerance: generateRandomNumber(0),
		selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		trigger: [triggerOptions.MANUAL],
		selectionA: { container: recognisedContainer[0], rules: [standardRule] },
		selectionB: { container: recognisedContainer[1], rules: [standardRule] },
		tickets: ticketData,
	};
	const oldPlanDataWithoutDefaultStatuses = {
		...oldPlanData,
		tickets: { ...ticketData, defaultStatuses: undefined },
	};
	const oldPlanDataWithAllTriggers = {
		...oldPlanData,
		trigger: [triggerOptions.MANUAL, triggerOptions.NEW_REVISION],
	};

	const expectedValueAtCreationUpdate = [
		{
			property: generateRandomString(),
			value: generateRandomString(),
		},
		...times(2, () => ({
			property: generateRandomString(),
			module: generateRandomString(),
			value: generateRandomString(),
		})),
	];
	const expectedTicketFormat = {};
	expectedValueAtCreationUpdate.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';

		if (moduleName === 'properties') {
			expectedTicketFormat.properties = expectedTicketFormat.properties ?? {};
			expectedTicketFormat.properties[property] = value;
		} else {
			expectedTicketFormat.modules = expectedTicketFormat.modules ?? {};
			expectedTicketFormat.modules[moduleName] = expectedTicketFormat.modules[moduleName] ?? {};
			expectedTicketFormat.modules[moduleName][property] = value;
		}
	});

	const oldTicketFormat = {};
	ticketData.valuesAtCreation.forEach(({ property, module, value }) => {
		const moduleName = module ?? 'properties';

		if (moduleName === 'properties') {
			oldTicketFormat.properties = oldTicketFormat.properties ?? {};
			oldTicketFormat.properties[property] = value;
		} else {
			oldTicketFormat.modules = oldTicketFormat.modules ?? {};
			oldTicketFormat.modules[moduleName] = oldTicketFormat.modules[moduleName] ?? {};
			oldTicketFormat.modules[moduleName][property] = value;
		}
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
		['with same type', false, { type: CLASH_TYPES.HARD }],
		['with null type', false, { type: null }],
		['with a different type', true, { type: CLASH_TYPES.CLEARANCE }],
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
		['with same trigger in a different order', false, { trigger: [triggerOptions.NEW_REVISION, triggerOptions.MANUAL] }, undefined, planWithAllTriggersId],
		['with an added trigger', true, { trigger: [triggerOptions.MANUAL, triggerOptions.NEW_REVISION] }],
		['with a removed trigger', true, { trigger: [triggerOptions.MANUAL] }, undefined, planWithAllTriggersId],
		['with empty trigger', false, { trigger: [] }],
		['with null trigger', false, { trigger: null }],
		['with duplicate trigger', true, { trigger: [triggerOptions.NEW_REVISION, triggerOptions.NEW_REVISION] }, { trigger: [triggerOptions.NEW_REVISION] }],
		['with duplicate old trigger', false, { trigger: [triggerOptions.MANUAL, triggerOptions.MANUAL] }],
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
		['with invalid default status value', false, { tickets: { defaultStatuses: { onNew: generateRandomString() } } }],
		['with invalid reopened default status value', false, { tickets: { defaultStatuses: { onReopened: generateRandomString() } } }],
		['with invalid default status type', false, { tickets: { defaultStatuses: { onNew: generateRandomNumber() } } }],
		['with unrecognised default status field', false, { tickets: { defaultStatuses: { [generateRandomString()]: templateDefaultStatuses.OPEN } } }],
		['with valid and unrecognised default status fields', true, { tickets: { defaultStatuses: { onNew: templateDefaultStatuses.IN_PROGRESS, [generateRandomString()]: templateDefaultStatuses.CLOSED } } }, { tickets: { defaultStatuses: { onNew: templateDefaultStatuses.IN_PROGRESS } } }],
		['with new default statuses', true, { tickets: { defaultStatuses: { onNew: templateDefaultStatuses.IN_PROGRESS } } }],
		['with same default statuses', false, { tickets: { defaultStatuses: oldPlanData.tickets.defaultStatuses } }],
		['with empty default statuses', false, { tickets: { defaultStatuses: {} } }],
		['with a null default status leaving another default status', true, { tickets: { defaultStatuses: { onResolved: null } } }],
		['with null default statuses', true, { tickets: { defaultStatuses: null } }],
		['with null default statuses and no stored default statuses', false, { tickets: { defaultStatuses: null } }, undefined, planWithoutDefaultStatusesId],
		['with null default statuses fields resulting in an empty object', true, { tickets: { defaultStatuses: { onNew: null, onResolved: null, onReopened: null } } }, { tickets: { defaultStatuses: null } }],
		['with custom default statuses', true, { tickets: { template: templateWithCustomStatuses, defaultStatuses: { onNew: customStatusValues[0].name, onResolved: customStatusValues[1].name, onReopened: customStatusValues[2].name } } }, { tickets: { template: stringToUUID(templateWithCustomStatuses), defaultStatuses: { onNew: customStatusValues[0].name, onResolved: customStatusValues[1].name, onReopened: customStatusValues[2].name } } }],
		['with new template that invalidates stored default statuses', false, { tickets: { template: templateWithCustomStatuses } }],
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
			TicketSchema.validateTickets.mockImplementation((t, pro, f, tem, updateData) => {
				if (isEqual(updateData[0], expectedTicketFormat)
					|| isEqual(updateData[0], oldTicketFormat)) return Promise.resolve();
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
				if (UUIDToString(id) === UUIDToString(planWithoutDefaultStatusesId)) {
					return Promise.resolve(oldPlanDataWithoutDefaultStatuses);
				}
				if (UUIDToString(id) === UUIDToString(planWithAllTriggersId)) {
					return Promise.resolve(oldPlanDataWithAllTriggers);
				}
				return Promise.reject(templates.clashPlanNotFound);
			});

			TicketTemplateModel.getTemplateById.mockImplementation((t, templateId) => {
				if (templatesInTeamspace.includes(UUIDToString(templateId))) {
					return Promise.resolve(validTemplate);
				}

				if (UUIDToString(templateId) === templateWithCustomStatuses) {
					return Promise.resolve({ ...validTemplate, config: { status: { values: customStatusValues } } });
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
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.setLastRevForSelections)
				.toHaveBeenCalledWith(teamspace, req.planData.selectionA, req.planData.selectionB);

			expect(mockCB).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with error if revisionNotFound error is thrown', async () => {
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

			ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(templates.revisionNotFound);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.setLastRevForSelections)
				.toHaveBeenCalledWith(teamspace, req.planData.selectionA, req.planData.selectionB);

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
			ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(error);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.setLastRevForSelections)
				.toHaveBeenCalledWith(teamspace, req.planData.selectionA, req.planData.selectionB);

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

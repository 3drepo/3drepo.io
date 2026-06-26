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

const { CLASH_TYPES, SELF_INTERSECTIONS_CHECK_OPTIONS, triggerOptions } = require('../../../../../models/clashes.constants');
const { cloneDeep, deleteIfUndefined, isEmpty, isEqual } = require('../../../../../utils/helper/objects');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getContainerById, getFederationById } = require('../../../../../models/modelSettings');
const { isArray, isObject } = require('../../../../../utils/helper/typeCheck');
const { types, transformer: { uniqueArray }, utils: { stripWhen } } = require('../../../../../utils/helper/yup');
const Yup = require('yup');
const { statuses: defaultStatuses } = require('../../../../../schemas/tickets/templates.constants');
const { getClashRunByQuery } = require('../../../../../models/clashes.runs');
const { getPlanById } = require('../../../../../models/clashes.plans');
const { getTemplateById } = require('../../../../../models/tickets.templates');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { hasCommenterAccessToFederation } = require('../../../../../utils/permissions');
const { modelsExistInProject } = require('../../../../../models/projectSettings');
const { presetModules } = require('../../../../../schemas/tickets/templates.constants');
const { respond } = require('../../../../../utils/responder');
const { schema: rulesSchema } = require('../../../../../schemas/rules');
const { setLastRevForSelections } = require('../../../../../processors/teamspaces/projects/clashes');
const { stringToUUID } = require('../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../common');
const { validateTickets } = require('../../../../../schemas/tickets');

const Clashes = {};

const statusEvents = ['onNew', 'onResolved', 'onReopened'];

const generatePlanSchema = (teamspace, project, user, isUpdate) => {
	const modelExistsTest = (isFederation) => async (id) => {
		if (!id) {
			return true;
		}
		const fn = isFederation ? getFederationById : getContainerById;

		const modelExists = await fn(teamspace, id, { _id: 1 }).catch(() => false);
		return modelExists ? modelsExistInProject(teamspace, project, [id]) : false;
	};

	const imposeCondition = (schema, required, canRemove) => {
		if (isUpdate) {
			const nullableChecked = canRemove ? schema.nullable() : schema;
			return nullableChecked.default(undefined);
		}
		return required ? schema.required() : schema;
	};

	const selectionEntrySchema = Yup.object().shape({
		container: types.id.test('container-validation', 'Container must exist within the project', modelExistsTest(false)).required(),
		rules: rulesSchema,
	});
	const selectionSchema = Yup.array().of(selectionEntrySchema.required()).min(1);

	const defaultStatusesObject = {};
	statusEvents.forEach((event) => {
		defaultStatusesObject[event] = imposeCondition(Yup.string().nullable().default(undefined), false, true);
	});

	const ticketSchema = Yup.object().shape({
		federation: imposeCondition(types.id.test('federation-validation', 'Federation must exist within the project', modelExistsTest(true)), true, false),
		template: imposeCondition(types.id, true, false),
		creator: imposeCondition(Yup.string().default(user), true, false),
		valuesAtCreation: imposeCondition(Yup.array().of(Yup.object().shape({
			property: Yup.string().required(),
			module: Yup.string(),
			value: Yup.mixed().required(),
		}).noUnknown(true)).min(1).default(undefined), false, true),
		defaultStatuses: imposeCondition(Yup.object().shape(defaultStatusesObject).default(undefined), false, true),
		hideOtherObjects: stripWhen(
			imposeCondition(Yup.boolean().strict().default(undefined), false, true),
			(value) => value === false,
		),
	}).noUnknown(true);

	return Yup.object().shape({
		name: imposeCondition(types.strings.title, true, false),
		type: imposeCondition(Yup.string().oneOf(Object.values(CLASH_TYPES)), true, false),
		tolerance: imposeCondition(Yup.number().min(0), true, false),
		selfIntersectionsCheck: imposeCondition(
			Yup.mixed().oneOf(SELF_INTERSECTIONS_CHECK_OPTIONS).default(false), false, false),
		trigger: imposeCondition(uniqueArray(Yup.array().of(Yup.string()
			.oneOf(Object.values(triggerOptions))).min(1)), true, false),
		selectionA: imposeCondition(selectionSchema, true, false),
		selectionB: imposeCondition(selectionSchema, true, false),
		tickets: imposeCondition(ticketSchema.default(undefined), false, true),
	}).noUnknown(true).required();
};

const validateTicketConfiguration = async (teamspace, project, newTicketData, oldTicketData = {}) => {
	const updateData = cloneDeep(newTicketData);
	const ticketData = cloneDeep({ ...oldTicketData, ...updateData });
	const hasDefaultStatusesUpdate = Object.hasOwn(updateData, 'defaultStatuses');

	if (hasDefaultStatusesUpdate) {
		if (updateData.defaultStatuses === null) {
			delete ticketData.defaultStatuses;
			if (!oldTicketData.defaultStatuses) {
				delete updateData.defaultStatuses;
			}
		} else {
			const effectiveDefaultStatuses = { ...oldTicketData.defaultStatuses };

			statusEvents.forEach((event) => {
				const status = updateData.defaultStatuses?.[event];
				if (status === undefined) return;

				if (status === null) {
					delete effectiveDefaultStatuses[event];
				} else {
					effectiveDefaultStatuses[event] = status;
				}

				if (status === oldTicketData.defaultStatuses?.[event]) {
					delete updateData.defaultStatuses[event];
				}
			});

			if (isEmpty(effectiveDefaultStatuses)) {
				delete ticketData.defaultStatuses;
				if (oldTicketData.defaultStatuses) {
					updateData.defaultStatuses = null;
				} else {
					delete updateData.defaultStatuses;
				}
			} else {
				ticketData.defaultStatuses = effectiveDefaultStatuses;
				if (isEmpty(updateData.defaultStatuses)) {
					delete updateData.defaultStatuses;
				}
			}
		}
	}

	// 1. validate template is an existing template
	// 2. using the template, validate the properties in valuesAtCreation
	// 3. ensure user has permissions to create the ticket on the federation
	const templateId = stringToUUID(ticketData.template);
	const template = await getTemplateById(teamspace, templateId);

	if (template.deprecated) {
		throw createResponseCode(templates.invalidArguments, 'Ticket template is deprecated');
	}

	const cloudClashModule = template.modules?.find(({ type }) => type === presetModules.CLOUD_CLASH);

	if (!cloudClashModule) {
		throw createResponseCode(templates.invalidArguments, `Ticket template provided must contain the preset module "${presetModules.CLOUD_CLASH}"`);
	}

	if (cloudClashModule.deprecated) {
		throw createResponseCode(templates.invalidArguments, `Ticket template provided contains a deprecated preset module "${presetModules.CLOUD_CLASH}"`);
	}
	const creatorHasCommenterAccess = await hasCommenterAccessToFederation(teamspace,
		project, ticketData.federation, ticketData.creator);

	if (!creatorHasCommenterAccess) {
		throw createResponseCode(templates.invalidArguments, 'Creator specified does not have permissions to create ticket on the specified federation');
	}

	if (ticketData.valuesAtCreation?.length) {
		const propertiesToUpdate = {};
		ticketData.valuesAtCreation.forEach(({ property, module, value }) => {
			const targetModule = module ?? 'properties';

			if (targetModule === 'properties') {
				propertiesToUpdate.properties = propertiesToUpdate.properties || {};
				propertiesToUpdate.properties[property] = value;
			} else {
				propertiesToUpdate.modules = propertiesToUpdate.modules || {};
				propertiesToUpdate.modules[targetModule] = propertiesToUpdate.modules[targetModule] || {};
				propertiesToUpdate.modules[targetModule][property] = value;
			}
		});

		// empty object is needed at the end to trigger an update check instead of new ticket validation (i.e. partial ticket validation)
		const [{ newTicket: validatedTicket }] = await validateTickets(teamspace, project, ticketData.federation,
			template, [propertiesToUpdate], { existingData: [{}], processValidatedData: false });

		if (updateData.valuesAtCreation?.length) {
			// Ticket validation may deserialise values, e.g. date fields, so keep the validated values.
			updateData.valuesAtCreation = updateData.valuesAtCreation.map((entry) => {
				const target = entry.module ? validatedTicket.modules[entry.module] : validatedTicket.properties;
				return { ...entry, value: target[entry.property] };
			});
		}
	}

	if (!isEmpty(ticketData.defaultStatuses)) {
		const availableStatuses = template.config?.status?.values
			.map(({ name }) => name) || Object.values(defaultStatuses);

		for (const event of statusEvents) {
			if (ticketData.defaultStatuses[event] != null
				&& !availableStatuses.includes(ticketData.defaultStatuses[event])) {
				throw createResponseCode(templates.invalidArguments,
					`Invalid ${event} default status. Must be one of: ${availableStatuses.join(', ')}`);
			}
		}
	}

	return updateData.template ? { ...updateData, template: templateId } : updateData;
};

const validatePlanData = async (req, res, next) => {
	try {
		const { teamspace, project } = req.params;
		const schema = generatePlanSchema(teamspace, project,
			getUserFromSession(req.session), !!req.planData);
		req.body = deleteIfUndefined(await schema.validate(req.body, { stripUnknown: true }), false);
		if (req.body.tickets) {
			req.body.tickets = await validateTicketConfiguration(
				teamspace, project, req.body.tickets, req.planData?.tickets);
		}

		if (req.planData) {
			Object.keys(req.body).forEach((key) => {
				const bodyVal = req.body[key];
				if (isObject(bodyVal)) {
					const combinedObj = { ...req.planData[key], ...bodyVal };
					if (isEqual({ data: combinedObj }, { data: req.planData[key] })) {
						delete req.body[key];
					}
				} else if (isArray(bodyVal)) {
					if (isEqual(bodyVal, req.planData[key])) {
						delete req.body[key];
					}
				} else if (bodyVal === req.planData[key]) {
					delete req.body[key];
				}
			});

			if (isEmpty(req.body)) {
				throw createResponseCode(templates.invalidArguments, 'No valid properties to update');
			}
		}

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Clashes.planExists = async (req, res, next) => {
	const { teamspace, project, planId } = req.params;

	try {
		req.planData = await getPlanById(teamspace, project, planId);
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Clashes.clashRunInPlan = async (req, res, next) => {
	const { teamspace, project, planId, runId } = req.params;

	try {
		req.outputData = await getClashRunByQuery(
			teamspace, project, { _id: runId, 'plan._id': planId }, { project: 0 });
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Clashes.planContainersHaveRevs = async (req, res, next) => {
	try {
		const { teamspace } = req.params;

		await setLastRevForSelections(teamspace, req.planData.selectionA, req.planData.selectionB);
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Clashes.validateNewPlanData = validatePlanData;
Clashes.validateUpdatePlanData = validateMany([Clashes.planExists, validatePlanData]);

module.exports = Clashes;

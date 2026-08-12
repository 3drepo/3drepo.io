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
const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateUUID, generateUUIDString } = require('../../../../../../helper/services');

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.groups');
const TicketsGroups = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

const {
	basePropertyLabels,
	idTypeLabels,
	modulePropertyLabels,
	presetModules,
	statuses,
	statusTypes,
	viewGroups,
} = require(`${src}/schemas/tickets/templates.constants`);
const { CLASH_TYPES, clashObjectIdTypes } = require(`${src}/models/clashes.constants`);
const { convertArrayUnits, units } = require(`${src}/utils/helper/units`);
const { CameraType } = require(`${src}/schemas/tickets/validators`);
const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);

const { CLOUD_CLASH } = presetModules;
const {
	CLASH_ID,
	CLASH_PLAN_ID,
	CLASH_PLAN_NAME,
	CLASH_RUN_ID,
	CLASH_TYPE,
	DISTANCE_M,
	OBJECT_A_ID,
	OBJECT_A_ID_TYPE,
	OBJECT_B_ID,
	OBJECT_B_ID_TYPE,
} = modulePropertyLabels[CLOUD_CLASH];
const { DEFAULT_VIEW, PIN, STATUS } = basePropertyLabels;

const testProcessClashResults = () => {
	/* Start of dataset generation */
	const teamspace = generateRandomString();
	const project = generateUUID();
	const federation = generateUUIDString();

	const baseContext = {
		planId: generateUUID(),
		planName: generateRandomString(),
		runId: generateUUID(),
		clashType: CLASH_TYPES.HARD,
		creator: generateRandomString(),
		selectionA: [{ container: generateUUIDString(), revision: generateUUID() }],
		selectionB: [{ container: generateUUIDString(), revision: generateUUID() }],
	};

	const getTemplate = (hasCustomStatus = false, defaultStatus = generateRandomString(), doneStatuses = []) => ({
		_id: generateUUID(),
		name: generateRandomString(),
		code: generateRandomString(3),
		...(hasCustomStatus ? {
			config: {
				status: {
					values: [
						{ name: defaultStatus, type: statusTypes.OPEN },
						{ name: generateRandomString(), type: statusTypes.OPEN },
						...doneStatuses.map((name) => ({ name, type: statusTypes.DONE })),
					],
					default: defaultStatus,
				},
			},
		} : {}),
		properties: [],
		modules: [{ type: CLOUD_CLASH, properties: [] }],
	});
	const baseTemplate = getTemplate();

	const generateClashPlan = (context, tickets = {}) => ({
		runId: context.runId,
		plan: {
			_id: context.planId,
			name: context.planName,
			type: context.clashType,
			selectionA: context.selectionA,
			selectionB: context.selectionB,
			tickets: {
				creator: context.creator,
				...tickets,
			},
		},
	});

	const clash = {
		index: generateRandomString(),
		a: {
			container: baseContext.selectionA[0].container,
			idType: clashObjectIdTypes.INTERNAL,
			id: generateUUIDString(),
		},
		b: {
			container: baseContext.selectionB[0].container,
			idType: clashObjectIdTypes.IFC,
			id: generateRandomString(22),
		},
		positions: [
			[1, 2, 3],
			[4, 6, 3],
		],
	};
	const clashWithBbox = { ...clash, bbox: { min: [0, 0, 0], max: [10, 10, 10] } };
	const swappedSelectionClash = {
		...clash,
		index: generateRandomString(),
		a: {
			container: baseContext.selectionB[0].container,
			idType: clashObjectIdTypes.INTERNAL,
			id: generateUUIDString(),
		},
		b: {
			container: baseContext.selectionA[0].container,
			idType: clashObjectIdTypes.IFC,
			id: generateRandomString(22),
		},
	};
	const swappedClashWithBbox = {
		...swappedSelectionClash,
		index: generateRandomString(),
		bbox: clashWithBbox.bbox,
	};
	const sameContainerClashContainer = generateUUIDString();
	const sameContainerClash = {
		...clash,
		a: {
			container: sameContainerClashContainer,
			idType: clashObjectIdTypes.IFC,
			id: generateRandomString(22),
		},
		b: {
			container: sameContainerClashContainer,
			idType: clashObjectIdTypes.IFC,
			id: generateRandomString(22),
		},
	};
	const generateExistingTicket = (
		template = baseTemplate,
		properties = { [STATUS]: statuses.OPEN },
		cloudClash = {},
	) => ({
		_id: generateUUID(),
		type: template._id,
		properties,
		modules: {
			[CLOUD_CLASH]: {
				[CLASH_PLAN_ID]: UUIDToString(baseContext.planId),
				[CLASH_ID]: clash.index,
				...cloudClash,
			},
		},
	});

	const revitClash = {
		...clash,
		a: { container: generateUUIDString(), idType: clashObjectIdTypes.REVIT, id: generateRandomString() },
		b: { container: generateUUIDString(), idType: clashObjectIdTypes.REVIT, id: generateRandomString() },
	};
	const unknownIdTypeClash = {
		...clash,
		a: { container: generateUUIDString(), idType: generateRandomString(), id: generateRandomString() },
		b: { container: generateUUIDString(), id: generateRandomString() },
	};
	const customDefaultStatus = generateRandomString();
	const onNewStatus = statuses.FOR_APPROVAL;
	const priorityValue = generateRandomString();
	const customModule = generateRandomString();
	const customProperty = generateRandomString();
	const customValue = generateRandomString();
	const invalidProperty = generateRandomString();
	const valuesAtCreation = [
		{ property: basePropertyLabels.PRIORITY, value: priorityValue },
		{ module: customModule, property: customProperty, value: customValue },
	];
	const invalidValuesAtCreation = [
		{ property: basePropertyLabels.PRIORITY, value: priorityValue },
		{ property: invalidProperty, value: generateRandomString() },
	];
	const defaultStatuses = { onNew: onNewStatus };
	const defaultValueExpectedRes = {
		properties: { [basePropertyLabels.PRIORITY]: priorityValue },
		modules: { [customModule]: { [customProperty]: customValue } },
	};
	const invalidDefaultValueExpectedRes = {
		properties: { [basePropertyLabels.PRIORITY]: priorityValue },
		invalidDefaultProperty: invalidProperty,
	};
	const onNewExpectedRes = { properties: { [STATUS]: onNewStatus } };
	const combinedExpectedRes = {
		properties: { ...defaultValueExpectedRes.properties, ...onNewExpectedRes.properties },
		modules: defaultValueExpectedRes.modules,
	};
	const defaultViewOnlyTemplate = { ...baseTemplate, config: { defaultView: true } };
	const defaultViewAndPinTemplate = { ...baseTemplate, config: { defaultView: true, pin: true } };
	const defaultViewAndPinUnit = units.M;
	const defaultViewCamera = {
		position: [-17.365799280415647, 18.417875965717393, 19.823315210249056],
		up: [0.3728146553039551, 0.8944026231765747, -0.2470894455909729],
		forward: [0.7455270290374756, -0.4472627639770508, -0.49411076307296753],
		type: CameraType.PERSPECTIVE,
	};
	const getExpectedViewObjects = (clashObjects) => {
		const containerEntries = {};
		clashObjects.forEach(({ container, idType, id }) => {
			const containerKey = UUIDToString(container);
			containerEntries[containerKey] = containerEntries[containerKey] ?? { container };
			containerEntries[containerKey][idType] = containerEntries[containerKey][idType] ?? [];
			containerEntries[containerKey][idType].push(
				idType === clashObjectIdTypes.INTERNAL ? stringToUUID(id) : id,
			);
		});

		return Object.values(containerEntries);
	};
	const getObjectGroup = (name, color, clashObject) => ({
		group: {
			name,
			objects: getExpectedViewObjects([clashObject]),
		},
		color,
	});
	const getContextGroup = (clashData) => ({
		group: {
			name: 'Other Objects',
			excludeDefinedObjects: true,
			objects: getExpectedViewObjects([clashData.a, clashData.b]),
		},
	});
	const getDefaultViewExpectedRes = (clashData, { federationUnit, hideOtherObjects } = {}) => {
		const objectAGroup = getObjectGroup('Object A', [255, 0, 0], clashData.a);
		const objectBGroup = getObjectGroup('Object B', [0, 255, 0], clashData.b);
		const contextGroup = getContextGroup(clashData);
		const state = hideOtherObjects
			? { [viewGroups.COLORED]: [objectAGroup, objectBGroup], [viewGroups.HIDDEN]: [contextGroup] }
			: {
				[viewGroups.COLORED]: [
					objectAGroup,
					objectBGroup,
					{ ...contextGroup, color: [182, 188, 193], opacity: 0.02 },
				],
			};

		return {
			...(federationUnit ? { federationUnit } : {}),
			properties: {
				...(federationUnit ? {
					[PIN]: convertArrayUnits(clashData.positions[0], units.MM, federationUnit),
				} : {}),
				[DEFAULT_VIEW]: {
					...(clashData.bbox ? { camera: defaultViewCamera } : {}),
					state,
				},
			},
		};
	};
	const sameContainerDefaultViewExpectedRes = {
		...getDefaultViewExpectedRes(sameContainerClash),
		modules: { [CLOUD_CLASH]: { [OBJECT_A_ID_TYPE]: idTypeLabels.IFC } },
	};
	const swappedSelectionDefaultViewExpectedRes = {
		...getDefaultViewExpectedRes(swappedSelectionClash),
		meshLookup: {
			container: swappedSelectionClash.a.container,
			revision: baseContext.selectionB[0].revision,
			id: swappedSelectionClash.a.id,
		},
	};
	const defaultViewAndPinExpectedRes = getDefaultViewExpectedRes(
		clashWithBbox, { federationUnit: defaultViewAndPinUnit });
	const hideOtherObjectsExpectedRes = getDefaultViewExpectedRes(
		clashWithBbox, { federationUnit: defaultViewAndPinUnit, hideOtherObjects: true });
	const revitIdExpectedRes = {
		modules: { [CLOUD_CLASH]: { [OBJECT_A_ID_TYPE]: idTypeLabels.REVIT, [OBJECT_B_ID_TYPE]: idTypeLabels.REVIT } },
	};
	const defaultIdExpectedRes = {
		modules: {
			[CLOUD_CLASH]: {
				[OBJECT_A_ID_TYPE]: idTypeLabels['3_D_REPO_ID'],
				[OBJECT_B_ID_TYPE]: idTypeLabels['3_D_REPO_ID'],
			},
		},
	};

	/* End of dataset generation */

	describe('Process clash results', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			TicketsModel.addTicketsWithTemplate.mockImplementation((...args) => {
				const tickets = args[4];
				return Promise.resolve(tickets.map((ticket) => ({ ...ticket, _id: generateUUID() })));
			});
			TicketsModel.updateTickets.mockResolvedValue([]);
			ModelSettingsModel.getFederationById.mockResolvedValue({ properties: { unit: units.MM } });
			Scenes.getMeshesWithParentIds.mockImplementation((ts, p, container, revision, ids) => Promise.resolve(ids));
			TicketsGroups.commitGroupChanges.mockResolvedValue();
			TicketsGroups.processGroupsUpdate.mockImplementation((oldData, newData, fields, groupsState) => {
				fields.forEach((fieldName) => {
					const [, groupType] = fieldName.split('.');
					newData?.state?.[groupType]?.forEach((entry) => {
						groupsState.toAdd.push(entry.group);
					});
				});
			});
			const mockValidation = (t, p, m, tem, tickets, { existingData, processValidatedData = true } = {}) => (
				Promise.resolve(tickets.map((ticket, i) => ({
					newTicket: processValidatedData && !existingData?.[i] ? { ...ticket, type: tem._id } : ticket,
					...(processValidatedData ? { existingData: existingData?.[i] } : {}),
				})))
			);
			TicketSchema.validateTickets.mockImplementation(mockValidation);
		});

		describe('New tickets', () => {
			test.each([
				['Should create tickets for new clashes', baseContext, baseTemplate, {}, { new: [clash], active: [], resolved: [] }],
				['Should create tickets for new clashes with custom statuses', baseContext, getTemplate(true, customDefaultStatus), {}, { new: [clash], active: [], resolved: [] }, { properties: { [STATUS]: customDefaultStatus } }],
				['Should create tickets for active clashes without matching tickets', baseContext, baseTemplate, {}, { new: [], active: [clash], resolved: [] }],
				['Should create tickets with Revit object ID types', baseContext, baseTemplate, {}, { new: [revitClash], active: [], resolved: [] }, revitIdExpectedRes],
				['Should default unknown or missing object ID types to 3D Repo ID', baseContext, baseTemplate, {}, { new: [unknownIdTypeClash], active: [], resolved: [] }, defaultIdExpectedRes],
				['Should create tickets with default value configurations', baseContext, baseTemplate, { valuesAtCreation }, { new: [clash], active: [], resolved: [] }, defaultValueExpectedRes],
				['Should drop invalid default values when creating tickets', baseContext, baseTemplate, { valuesAtCreation: invalidValuesAtCreation }, { new: [clash], active: [], resolved: [] }, invalidDefaultValueExpectedRes],
				['Should create tickets using the configured new clash status', baseContext, baseTemplate, { defaultStatuses }, { new: [clash], active: [], resolved: [] }, onNewExpectedRes],
				['Should create tickets with default values and configured new clash status', baseContext, baseTemplate, { valuesAtCreation, defaultStatuses }, { new: [clash], active: [], resolved: [] }, combinedExpectedRes],
				['Should calculate the distance for new clearance clash tickets', { ...baseContext, clashType: CLASH_TYPES.CLEARANCE }, baseTemplate, {}, { new: [clash], active: [], resolved: [] }, { modules: { [CLOUD_CLASH]: { [DISTANCE_M]: 0.005 } } }],
				['Should merge same-container clash objects in the default view context group', baseContext, defaultViewOnlyTemplate, {}, { new: [sameContainerClash], active: [], resolved: [] }, sameContainerDefaultViewExpectedRes],
				['Should resolve default view object revisions by container', baseContext, defaultViewOnlyTemplate, {}, { new: [swappedSelectionClash], active: [], resolved: [] }, swappedSelectionDefaultViewExpectedRes],
				['Should create tickets with default view and pin if configured', baseContext, defaultViewAndPinTemplate, {}, { new: [clashWithBbox], active: [], resolved: [] }, defaultViewAndPinExpectedRes],
				['Should find default view object revisions by container across both selections', baseContext, defaultViewAndPinTemplate, {}, { new: [swappedClashWithBbox], active: [], resolved: [] }, {
					...getDefaultViewExpectedRes(swappedClashWithBbox, { federationUnit: defaultViewAndPinUnit }),
					meshLookup: {
						container: swappedClashWithBbox.a.container,
						revision: baseContext.selectionB[0].revision,
						id: swappedClashWithBbox.a.id,
					},
				}],
				['Should hide other objects in generated default views if configured', baseContext, defaultViewAndPinTemplate, { hideOtherObjects: true }, { new: [clashWithBbox], active: [], resolved: [] }, hideOtherObjectsExpectedRes],
			])(
				'%s', async (desc, context, template, clashPlanExtras, clashResults, expectedRes = {}) => {
					const { meshLookup, ...expectedTicketData } = expectedRes;
					const [expectedClash] = [...(clashResults.new ?? []), ...(clashResults.active ?? [])];
					const clashPlan = generateClashPlan(context, clashPlanExtras);
					if (expectedTicketData.federationUnit) {
						ModelSettingsModel.getFederationById.mockResolvedValueOnce({
							properties: { unit: expectedTicketData.federationUnit },
						});
					}
					if (expectedTicketData.invalidDefaultProperty) {
						TicketSchema.validateTickets.mockImplementation((t, p, m, tem, tickets, options = {}) => {
							if (options.processValidatedData !== false) {
								return Promise.resolve(tickets.map((ticket) => ({
									newTicket: { ...ticket, type: tem._id },
								})));
							}

							if (tickets[0].properties?.[expectedTicketData.invalidDefaultProperty]) {
								return Promise.reject(new Error());
							}

							return Promise.resolve(tickets.map((ticket) => ({ newTicket: ticket })));
						});
					}
					TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);
					await TicketsClashes.processClashResults(teamspace, project,
						federation, template, clashResults, clashPlan);

					const expectedTicket = {
						title: `[${context.planName}] Clash`,
						properties: {
							[STATUS]: statuses.OPEN,
							...expectedTicketData.properties,
						},
						modules: {
							...expectedTicketData.modules,
							[CLOUD_CLASH]: {
								[CLASH_PLAN_ID]: UUIDToString(context.planId),
								[CLASH_RUN_ID]: UUIDToString(context.runId),
								[CLASH_ID]: expectedClash.index,
								[CLASH_PLAN_NAME]: context.planName,
								[CLASH_TYPE]: context.clashType,
								[DISTANCE_M]: 0,
								[OBJECT_A_ID_TYPE]: '3D Repo ID',
								[OBJECT_A_ID]: expectedClash.a.id,
								[OBJECT_B_ID_TYPE]: 'IFC',
								[OBJECT_B_ID]: expectedClash.b.id,
								...expectedTicketData.modules?.[CLOUD_CLASH],
							},
						},
					};

					expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
					expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project, federation, {
						type: template._id,
						[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: UUIDToString(context.planId),
					}, {
						_id: 1,
						[`properties.${DEFAULT_VIEW}`]: 1,
						[`properties.${PIN}`]: 1,
						[`properties.${STATUS}`]: 1,
						[`modules.${CLOUD_CLASH}`]: 1,
					});

					expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(
						(clashPlanExtras.valuesAtCreation?.length ?? 0) + 1,
					);
					expect(TicketSchema.validateTickets).toHaveBeenLastCalledWith(
						teamspace, project, federation, template, [expectedTicket], { author: context.creator },
					);
					expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
					expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project,
						federation, template._id, [{ ...expectedTicket, type: template._id }]);
					expect(EventsManager.publish).toHaveBeenCalledTimes(1);
					expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
						{
							teamspace,
							project,
							model: federation,
							tickets: [expect.objectContaining({ ...expectedTicket, type: template._id })],
							author: context.creator,
						});
					expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
					if (meshLookup) {
						expect(Scenes.getMeshesWithParentIds).toHaveBeenCalledTimes(2);
						expect(Scenes.getMeshesWithParentIds).toHaveBeenCalledWith(
							teamspace,
							project,
							meshLookup.container,
							meshLookup.revision,
							[stringToUUID(meshLookup.id)],
							true,
						);
					}
				});
		});

		describe('Update tickets', () => {
			const existingTicket = generateExistingTicket();
			const expectedUpdate = { modules: { [CLOUD_CLASH]: { [DISTANCE_M]: 0 } } };
			const resolveExpectedUpdate = { properties: { [STATUS]: statuses.CLOSED } };
			const resolvedTicket = generateExistingTicket(
				baseTemplate, { [STATUS]: statuses.CLOSED }, { [DISTANCE_M]: 0 },
			);
			const configuredReopenedTicket = generateExistingTicket(
				baseTemplate, { [STATUS]: statuses.CLOSED }, { [DISTANCE_M]: 0 },
			);
			const configuredReopenedDefaultStatuses = { onReopened: statuses.FOR_APPROVAL };
			const changedPinTicket = generateExistingTicket(
				baseTemplate, { [STATUS]: statuses.OPEN, [PIN]: [10, 20, 30] }, { [DISTANCE_M]: 1 },
			);
			const defaultViewTemplate = { ...baseTemplate, config: { defaultView: true } };

			const voidTicket = generateExistingTicket(baseTemplate, { [STATUS]: statuses.VOID }, { [DISTANCE_M]: 0 });
			test.each([
				['Should update tickets for active clashes', baseContext, baseTemplate, {}, { new: [], active: [clash], resolved: [] }, existingTicket, expectedUpdate],
				['Should reopen resolved tickets using the template default status', baseContext, baseTemplate, {}, { new: [], active: [clash], resolved: [] }, resolvedTicket, { properties: { [STATUS]: statuses.OPEN } }],
				['Should reopen resolved tickets using the configured reopened status', baseContext, baseTemplate, { defaultStatuses: configuredReopenedDefaultStatuses }, { new: [], active: [clash], resolved: [] }, configuredReopenedTicket, { properties: { [STATUS]: statuses.FOR_APPROVAL } }],
				['Should update changed clash distance and pin', baseContext, { ...baseTemplate, config: { pin: true } }, {}, { new: [], active: [clash], resolved: [] }, changedPinTicket, { properties: { [PIN]: clash.positions[0] }, modules: { [CLOUD_CLASH]: { [DISTANCE_M]: 0 } } }],
				['Should not update tickets when status, distance and pin are unchanged', baseContext, { ...baseTemplate, config: { pin: true } }, {}, { new: [], active: [clash], resolved: [] }, generateExistingTicket(baseTemplate, { [STATUS]: statuses.OPEN, [PIN]: clash.positions[0] }, { [DISTANCE_M]: 0 }), null],
				['Should update the default view camera when clash bounds change', baseContext, defaultViewTemplate, {}, { new: [], active: [clashWithBbox], resolved: [] }, generateExistingTicket(baseTemplate, { [STATUS]: statuses.OPEN }, { [DISTANCE_M]: 0 }), { properties: { [DEFAULT_VIEW]: { camera: defaultViewCamera } } }],
				['Should not update the default view camera when it has not changed', baseContext, defaultViewTemplate, {}, { new: [], active: [clashWithBbox], resolved: [] }, generateExistingTicket(baseTemplate, { [STATUS]: statuses.OPEN, [DEFAULT_VIEW]: { camera: defaultViewCamera } }, { [DISTANCE_M]: 0 }), null],
				['Should not update the default view when clash bounds are missing', baseContext, defaultViewTemplate, {}, { new: [], active: [clash], resolved: [] }, generateExistingTicket(baseTemplate, { [STATUS]: statuses.OPEN }, { [DISTANCE_M]: 0 }), null],
				['Should resolve tickets that are in the resolved column', baseContext, baseTemplate, {}, { new: [], active: [], resolved: [clash] }, generateExistingTicket(), resolveExpectedUpdate],
				['Should resolve tickets found in the system but not mentioned in the results', baseContext, baseTemplate, {}, { new: [], active: [], resolved: [] }, generateExistingTicket(), resolveExpectedUpdate],
				['Should not update unmatched tickets if they are already resolved', baseContext, baseTemplate, {}, { new: [], active: [], resolved: [] }, resolvedTicket, null],
				['Should not update void tickets', baseContext, baseTemplate, {}, { new: [], active: [], resolved: [] }, voidTicket, null],
				['Should update matching tickets for new clashes', baseContext, baseTemplate, {}, { new: [clash], active: [], resolved: [] }, existingTicket, expectedUpdate],
			])(
				'%s', async (desc, context, template, clashPlanExtras, clashResults, existingData, expectedRes) => {
					TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingData]);
					if (expectedRes) {
						TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingData]);
					}

					await TicketsClashes.processClashResults(teamspace, project,
						federation, template, clashResults, generateClashPlan(context, clashPlanExtras));

					expect(TicketsModel.getTicketsByQuery).toHaveBeenNthCalledWith(1, teamspace, project, federation, {
						type: template._id,
						[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: UUIDToString(context.planId),
					}, {
						_id: 1,
						[`properties.${DEFAULT_VIEW}`]: 1,
						[`properties.${PIN}`]: 1,
						[`properties.${STATUS}`]: 1,
						[`modules.${CLOUD_CLASH}`]: 1,
					});
					if (!expectedRes) {
						expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
						expect(TicketSchema.validateTickets).not.toHaveBeenCalled();
						expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
						expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
						expect(EventsManager.publish).not.toHaveBeenCalled();
						return;
					}

					expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(2);
					expect(TicketsModel.getTicketsByQuery).toHaveBeenNthCalledWith(2, teamspace, project, federation, {
						_id: { $in: [existingData._id] },
					});
					expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
					expect(TicketSchema.validateTickets).toHaveBeenCalledWith(teamspace, project, federation, template,
						[expectedRes], { author: context.creator, existingData: [existingData] });
					expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
					expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
						[existingData], [expectedRes], context.creator);
					expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
					expect(EventsManager.publish).not.toHaveBeenCalled();
				});
		});

		describe('Error handling', () => {
			test('Should handle empty results', async () => {
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

				await TicketsClashes.processClashResults(teamspace, project,
					federation, baseTemplate, {}, generateClashPlan(baseContext));

				expect(TicketSchema.validateTickets).not.toHaveBeenCalled();
				expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
				expect(EventsManager.publish).not.toHaveBeenCalled();
			});

			test('Should handle missing ticket options', async () => {
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([{ modules: { [CLOUD_CLASH]: {} } }]);
				const clashRun = {
					runId: baseContext.runId,
					plan: {
						_id: baseContext.planId,
						name: baseContext.planName,
						type: baseContext.clashType,
						selectionA: baseContext.selectionA,
						selectionB: baseContext.selectionB,
					},
				};

				await TicketsClashes.processClashResults(teamspace, project, federation, baseTemplate,
					{ new: [], active: [], resolved: [] }, clashRun);

				expect(TicketSchema.validateTickets).not.toHaveBeenCalled();
				expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
				expect(EventsManager.publish).not.toHaveBeenCalled();
			});

			test('Should not create tickets when validation filters them out', async () => {
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);
				TicketSchema.validateTickets.mockResolvedValueOnce([]);

				await TicketsClashes.processClashResults(teamspace, project, federation, baseTemplate,
					{ new: [clash], active: [], resolved: [] },
					generateClashPlan(baseContext));

				expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
				expect(EventsManager.publish).not.toHaveBeenCalled();
			});

			test('Should not update tickets when validation filters updates out', async () => {
				const existingTicket = generateExistingTicket();
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
				TicketSchema.validateTickets.mockResolvedValueOnce([]);

				await TicketsClashes.processClashResults(teamspace, project, federation, baseTemplate,
					{ new: [], active: [clash], resolved: [] },
					generateClashPlan(baseContext));

				expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
				expect(EventsManager.publish).not.toHaveBeenCalled();
			});

			test('Should fail with a clear error if an internal clash object has no matching selection', async () => {
				const missingSelectionClash = {
					...clashWithBbox,
					a: {
						container: generateUUIDString(),
						idType: clashObjectIdTypes.INTERNAL,
						id: generateUUIDString(),
					},
				};
				TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

				await expect(TicketsClashes.processClashResults(teamspace, project,
					federation, defaultViewAndPinTemplate, { new: [missingSelectionClash] },
					generateClashPlan(baseContext)))
					.rejects.toThrow(`Could not find active revision in clash selection for container ${missingSelectionClash.a.container}`);

				expect(TicketSchema.validateTickets).not.toHaveBeenCalled();
				expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testProcessClashResults();
});

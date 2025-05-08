/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { UUIDToString, generateUUID, stringToUUID } = require('./helper/uuids');
const { addGroups, deleteGroups, getGroupsByIds } = require('../processors/teamspaces/projects/models/commons/tickets.groups');
const { createResponseCode, templates } = require('./responseCodes');
const { getNestedProperty, setNestedProperty } = require('./helper/objects');
const { isBuffer, isUUID } = require('./helper/typeCheck');
const { propTypes, viewGroups } = require('../schemas/tickets/templates.constants');
const { removeFiles, storeFiles } = require('../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../models/tickets.constants');
const { generateFullSchema } = require('../schemas/tickets/templates');
const { getArrayDifference } = require('./helper/arrays');

const ticketGroupsUtils = {};

ticketGroupsUtils.processGroupsUpdate = (oldData, newData, fields, groupsState) => {
	fields.forEach((fieldName) => {
		const oldProp = getNestedProperty(oldData, fieldName) ?? [];
		const newProp = getNestedProperty(newData, fieldName) ?? [];

		oldProp.forEach(({ group }) => {
			groupsState.old.add(UUIDToString(group));

			if (newData === undefined || (newData && newData.state === undefined)) {
				// New data is not specified so we are preserving the old ones
				groupsState.stillUsed.add(UUIDToString(group));
			}
		});

		newProp.forEach((propData) => {
			const { group } = propData;
			if (isUUID(group)) {
				groupsState.stillUsed.add(UUIDToString(group));
			} else {
				const groupId = generateUUID();
				groupsState.toAdd.push({ ...group, _id: groupId });
				// eslint-disable-next-line no-param-reassign
				propData.group = groupId;
			}
		});
	});
};

ticketGroupsUtils.calculateRemoveGroups = ({ groups: { toRemove, old, stillUsed, ...otherGroups }, ...others }) => {
	const toRemoveCalculated = getArrayDifference(Array.from(stillUsed),
		Array.from(old)).map(stringToUUID);

	return { groups: { toRemove: toRemoveCalculated, stillUsed, ...otherGroups }, ...others };
};

ticketGroupsUtils.processCommentGroups = (newView, oldView = undefined) => {
	const externalReferences = {
		binaries: {
			toRemove: [],
			toAdd: [],
		},
		groups: {
			toAdd: [],
			old: new Set(),
			stillUsed: new Set(),
		},
	};

	ticketGroupsUtils.processGroupsUpdate(
		oldView,
		newView,
		Object.values(viewGroups).map((groupName) => `state.${groupName}`),
		externalReferences.groups,
	);

	return ticketGroupsUtils.calculateRemoveGroups(externalReferences);
};

/**
 * Special properties:
 *  Images - images comes in as a base64 string within the JSON object, but we store this separate. A UUID reference is created and replaces thes the image entry, and
 *           the image itself will be stored via filesManager
 *  Groups - Groups will come in embedded, however we will store the group separately with a group id as reference
 */
ticketGroupsUtils.processSpecialProperties = (template, oldTickets, updatedTickets) => {
	const fullTemplate = generateFullSchema(template);

	const res = [];

	const updateReferences = (templateProperties, externalReferences, oldProperties = {}, updatedProperties = {}) => {
		templateProperties.forEach(({ type, name }) => {
			const processImageUpdate = (isArray, field) => {
				const oldProp = field ? getNestedProperty(oldProperties[name], field) : oldProperties[name];
				const newProp = field ? getNestedProperty(updatedProperties[name], field) : updatedProperties[name];

				if (oldProp && newProp !== undefined) {
					const idsToRemove = isArray
						? getArrayDifference(newProp?.map(UUIDToString), oldProp.map(UUIDToString)).map(stringToUUID)
						: [oldProp];

					externalReferences.binaries.toRemove.push(...idsToRemove);
				}

				if (newProp) {
					const getRefFromBuffer = (data) => {
						if (isBuffer(data)) {
							const ref = generateUUID();
							externalReferences.binaries.toAdd.push({ ref, data });
							return ref;
						}

						return data;
					};

					if (isArray) {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = newProp.map(getRefFromBuffer);
					} else if (field) {
						setNestedProperty(updatedProperties[name], field, getRefFromBuffer(newProp));
					} else {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = getRefFromBuffer(newProp);
					}
				}
			};

			if (type === propTypes.IMAGE) {
				processImageUpdate();
			} else if (type === propTypes.VIEW) {
				// Make constants out of these
				processImageUpdate(false, 'screenshot');
				ticketGroupsUtils.processGroupsUpdate(oldProperties[name], updatedProperties[name],
					Object.values(viewGroups).map((groupName) => `state.${groupName}`),
					externalReferences.groups);
			} else if (type === propTypes.IMAGE_LIST) {
				processImageUpdate(true);
			}
		});
	};

	const isUpdate = !!oldTickets?.length;
	updatedTickets.forEach((updateData, i) => {
		const externalReferences = {
			binaries: {
				toRemove: [],
				toAdd: [],
			},
			groups: {
				toAdd: [],
				old: new Set(),
				stillUsed: new Set(),
			},
		};

		updateReferences(fullTemplate.properties, externalReferences,
			isUpdate ? oldTickets[i]?.properties : undefined, updateData.properties);

		res.push(externalReferences);
	});

	fullTemplate.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		updatedTickets.forEach((updateData, i) => {
			updateReferences(properties, res[i],
				isUpdate ? oldTickets[i]?.modules?.[id] : undefined, updateData?.modules?.[id]);
		});
	});

	return res.map(({ groups: { toRemove, old, stillUsed, ...otherGroups }, ...others }) => {
		const toRemoveCalculated = getArrayDifference(Array.from(stillUsed),
			Array.from(old)).map(stringToUUID);

		return { groups: { toRemove: toRemoveCalculated, stillUsed, ...otherGroups }, ...others };
	});
};

ticketGroupsUtils.processExternalData = async (teamspace, project, model, ticketIds, data) => {
	const refsToRemove = [];
	const binariesToSave = [];

	await Promise.all(ticketIds.map(async (ticketId, i) => {
		const { binaries, groups } = data[i];

		if (groups.stillUsed.size) {
			const stillUsed = Array.from(groups.stillUsed);
			const existingGroups = await getGroupsByIds(teamspace, project, model, ticketId,
				stillUsed.map(stringToUUID), { _id: 1 });

			if (existingGroups.length !== stillUsed.length) {
				const notFoundGroups = getArrayDifference(existingGroups.map(({ _id }) => UUIDToString(_id)),
					stillUsed);
				throw createResponseCode(templates.invalidArguments, `The following groups are not found: ${notFoundGroups.join(',')}`);
			}
		}

		refsToRemove.push(...binaries.toRemove);

		binariesToSave.push(...binaries.toAdd.map(({ ref, data: bin }) => ({
			id: ref, data: bin, meta: { teamspace, project, model, ticket: ticketId },
		})));

		await Promise.all([
			groups.toAdd.length ? addGroups(teamspace, project, model, ticketId, groups.toAdd) : Promise.resolve(),
			groups.toRemove.length ? deleteGroups(teamspace, project, model, ticketId,
				groups.toRemove) : Promise.resolve(),
		]);
	}));

	const promsToWait = [];

	if (refsToRemove.length) promsToWait.push(removeFiles(teamspace, TICKETS_RESOURCES_COL, refsToRemove));
	if (binariesToSave.length) promsToWait.push(storeFiles(teamspace, TICKETS_RESOURCES_COL, binariesToSave));

	await Promise.all(promsToWait);
};

module.exports = ticketGroupsUtils;

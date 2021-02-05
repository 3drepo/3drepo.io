/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { isEqual, omit, pick } from 'lodash';
import { select } from 'redux-saga/effects';
import { GROUP_TYPES_ICONS, GROUPS_TYPES } from '../constants/groups';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds } from '../modules/tree';
import { COLOR } from '../styles';
import { getGroupHexColor, hexToArray } from './colors';
import { prepareCriterion } from './criteria';
import { calculateTotalMeshes } from './tree';

export const prepareGroup = (group) => {
	const isSmartGroup = group.rules && group.rules.length;
	const type = isSmartGroup ? GROUPS_TYPES.SMART : GROUPS_TYPES.NORMAL;

	return {
		...omit(group, 'author', 'createdDate', 'description'),
		_id: group._id,
		owner: group.author,
		created: group.createdAt,
		desc: group.description,
		type,
		StatusIconComponent: GROUP_TYPES_ICONS[type],
		statusColor: COLOR.BLACK_54,
		color: getGroupHexColor(group.color),
		rules: (group.rules || []).map(prepareCriterion),
		objects: group.objects || [],
		totalSavedMeshes: calculateTotalMeshes(group.objects) || 0
	};
};

export const normalizeGroup = (group) => {
	const normalizedGroup = {
		color: hexToArray(group.color),
		...pick(group, ['name', 'author']),
		description: group.desc || group.description
	} as any;

	if (group.type === GROUPS_TYPES.SMART) {
		normalizedGroup.rules = group.rules;
	}

	if (group.type === GROUPS_TYPES.NORMAL) {
		normalizedGroup.objects = group.objects;
	}

	return normalizedGroup;
};

export const mergeGroupData = (source, data = source) => {
	return {
		...source,
		...omit(data, ['description']),
		desc: data.description
	};
};

export function* createModelBySharedIdDictionary(sharedIdnodes) {
	// Converts shareIds to nodeIds
	const nodes = yield select(selectGetNodesIdsFromSharedIds([{shared_ids: sharedIdnodes}]));
	const meshesInfo = yield select(selectGetMeshesByIds(nodes));

	// This generates a dictionary to get the teamspace and model from the sharedId: sharedId => {teamspace, modelId}
	return meshesInfo.reduce((dict, meshesByModel) => {
		const { teamspace, modelId } = meshesByModel;
		const model = { teamspace, modelId};
		return meshesByModel.meshes.reduce((d, mesh) => {
			const index = nodes.indexOf(mesh);
			d[sharedIdnodes[index]] = model;
			return d;
		}, dict);
	}, {});
}

export function* createGroupsByColor(overrides) {
	const sharedIdnodes = Object.keys(overrides);
	const modelsDict = yield createModelBySharedIdDictionary(sharedIdnodes);

	// This creates an array of groups grouped by colour
	// // for example:
	// [
	// 	{
	// 		"color": [
	// 			149,
	// 			0,
	// 			255,
	// 			103
	// 		],
	// 		"objects": [
	// 			{
	// 				"shared_ids": [
	// 					"375b918f-0b25-4f3a-8edc-239ef5abf2e4",
	// 					"3a9cfe9d-e96f-4242-979a-26ddbbc5226d",
	// 					"e7a69a79-fe94-4fce-9ce2-60e999e3e1d4"
	// 				],
	// 				"account": "carmen",
	// 				"model": "81b0b900-f80c-11ea-970b-03c55a1e1b3a"
	// 			}
	// 		],
	// 		"totalSavedMeshes": 1
	// 	},
	// 	{
	// 		"color": [
	// 			0,
	// 			255,
	// 			0
	// 		],
	// 		"objects": [
	// 			{
	// 				"shared_ids": [
	// 					"cab0b20f-a0e1-439a-9982-67bf032583ca",
	// 					"997a1909-0cf6-43a9-af2b-bb232ce887c7",
	// 					"525f8fd6-19b4-4739-96f6-cef8c7bac55b"
	// 				],
	// 				"account": "carmen",
	// 				"model": "81b0b900-f80c-11ea-970b-03c55a1e1b3a"
	// 			}
	// 		],
	// 		"totalSavedMeshes": 1
	// 	}
	// ]
	//
	return sharedIdnodes.reduce((arr, objectId, i) =>  {
		const { teamspace, modelId } = modelsDict[objectId];

		// if there is a group with that color already use that one
		let colorGroup = arr.find(({color}) => color.join(',') === hexToArray(overrides[objectId]).join(','));

		if (!colorGroup) {
			// Otherwise create a group with that color
			colorGroup = { color: hexToArray(overrides[objectId]), objects: [] , totalSavedMeshes: 0};

			arr.push(colorGroup);
		}

		let sharedIdsItem =  colorGroup.objects.find(({model, account}) => model === modelId && account === teamspace);

		if (!sharedIdsItem) {
			sharedIdsItem = { shared_ids: [], account: teamspace, model: modelId};
			colorGroup.objects.push(sharedIdsItem);
			colorGroup.totalSavedMeshes ++;
		}

		sharedIdsItem.shared_ids.push(objectId);
		return arr;
	}, []);
}

export function* createGroupsByTransformations(transformations) {
	const sharedIdnodes = Object.keys(transformations);
	const modelsDict = yield createModelBySharedIdDictionary(sharedIdnodes);

	return sharedIdnodes.reduce((arr, objectId, i) =>  {
		const { teamspace, modelId } = modelsDict[objectId];

		// 1 . Use or create the transform group with that transformation value

		// if there is group with that transformation already use that one
		let transformGroup = arr.find(({ transformation }) => isEqual(transformation, transformations[objectId]));

		if (!transformGroup) {
			transformGroup = { transformation: transformations[objectId], objects: [] };
			arr.push(transformGroup);
		}

		// 2. Add to objects the new or existing model/teamspace objects object
		let sharedIdsItem =  transformGroup.objects.find(({model, account}) => model === modelId && account === teamspace);

		if (!sharedIdsItem) {
			sharedIdsItem = { shared_ids: [], account: teamspace, model: modelId};
			transformGroup.objects.push(sharedIdsItem);
		}

		sharedIdsItem.shared_ids.push(objectId);
		return arr;
	}, []);

}

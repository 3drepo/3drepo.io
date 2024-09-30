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

import { UnityUtil } from "@/globals/unity-util";
import { isEqual } from "lodash";
import { getState } from "@/v5/helpers/redux.helpers";
import { selectGetMeshesByIds, selectGetSharedIdsFromNodeIds, selectHiddenGeometryVisible, selectNodesBySharedIdsMap, selectTreeNodesList } from "../modules/tree";
import { selectColorOverrides } from "../modules/viewerGui";
import { Viewer } from "../services/viewer/viewer";
import { selectTransformations } from "../modules/viewpoints/viewpoints.selectors";
import { hexToArray } from "./colors";

// This merges a viewpoint
// TO BE REVIEWED.

const groupPropNameMap = {
	highlighted_group_id : 'highlighted_group',
	hidden_group_id : 'hidden_group',
	shown_group_id : 'shown_group',
	override_group_ids : 'override_groups',
	transformation_group_ids: 'transformation_groups'
};

function createModelBySharedIdDictionary(sharedIdnodes) {
	const state = getState()
	// Converts shareIds to nodeIds
	const nodes = getNodesIdsFromSharedIds([{shared_ids: sharedIdnodes}]);
	const meshesInfo: any[] = selectGetMeshesByIds(nodes)(state);

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

function createGroupsByColor(overrides) {
	const sharedIdnodes = Object.keys(overrides);
	const modelsDict = createModelBySharedIdDictionary(sharedIdnodes);

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
	return sharedIdnodes
		.filter((objectId) => objectId in modelsDict)
		.reduce((arr, objectId, i) =>  {
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


function createGroupsByTransformations(transformations) {
	const sharedIdnodes = Object.keys(transformations);
	const modelsDict = createModelBySharedIdDictionary(sharedIdnodes);

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
export const mergeGroupsDataFromViewpoint = (viewpointTarget, viewpointOrigin) => {

	Object.keys(groupPropNameMap).forEach((groupPropNameById) => {
		const groupPropName =  groupPropNameMap[groupPropNameById];

		if (viewpointTarget[groupPropNameById] && viewpointOrigin[groupPropName]) {
			viewpointTarget[groupPropName] = viewpointOrigin[groupPropName];
		}
	});

};

const createGroupsArray = (groupIds, groupsMaps) => {
	const groupsArray = [];

	groupIds.forEach((id) => {
		if (groupsMaps[id]) {
			groupsArray.push(groupsMaps[id]);
		}
	});

	return groupsArray;
};

// Creates an object with properties: 'highlighted_group', 'hidden_group',
// 'override_groups' or  'transformation_groups' corresponding to the ones defined in the groups ids in viewpoint.
// using the information from groupsMaps
export const setGroupData = (viewpoint, groupsMaps): any => {
	const groupsData = {};

	if (viewpoint) {
		Object.keys(groupPropNameMap).forEach((groupPropNameById) => {
			const groupPropName =  groupPropNameMap[groupPropNameById];
			const propValue = viewpoint[groupPropNameById];
			if (propValue) {
				if (Array.isArray(propValue)) {
					groupsData[groupPropName] = createGroupsArray(propValue, groupsMaps);
				} else if (groupsMaps[propValue]) {
					groupsData[groupPropName] = groupsMaps[propValue];
				}
			}
		});
	}

	return groupsData;
};

export const createGroupsFromViewpoint = (viewpoint, groupsData) => {
	const groups = [];

	Object.keys(groupPropNameMap).forEach((groupPropNameById) => {
		const groupPropName =  groupPropNameMap[groupPropNameById];
		const propValue = viewpoint[groupPropNameById];

		if (propValue && groupsData[groupPropName]) {
			const groupsDataValue = groupsData[groupPropName];

			if (Array.isArray(propValue)) {
				propValue.forEach((id, i) => {
					groups.push({_id: id, ...groupsDataValue[i]});
				});
			} else {
				groups.push({_id: propValue, ...groupsDataValue});
			}
		}
	});

	return groups;
};

export async function generateViewpoint(name = '', withScreenshot = false) {
	const state = getState();

	const hiddenGeometryVisible = selectHiddenGeometryVisible(state);

	const viewpoint = await Viewer.getCurrentViewpoint();

	const generatedObject = {
		name,
		viewpoint:  {
			...viewpoint,
			hideIfc: !hiddenGeometryVisible
		}
	} as any;

	if (withScreenshot) {
		generatedObject.viewpoint.screenshot = await Viewer.getScreenshot();
	}

	const objectInfo: any = await Viewer.getObjectsStatus();

	const colorOverrides = selectColorOverrides(state);
	const newOverrideGroups = createGroupsByColor(colorOverrides);

	const transformations = selectTransformations(state);
	const newTransformationsGroups = createGroupsByTransformations(transformations);

	if (newOverrideGroups.length) {
		generatedObject.viewpoint.override_groups = newOverrideGroups;
	}

	if (newTransformationsGroups.length) {
		generatedObject.viewpoint.transformation_groups = newTransformationsGroups;
	}

	if (objectInfo && (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0)) {
		const { highlightedNodes, hiddenNodes } = objectInfo;

		if (highlightedNodes.length > 0) {
			generatedObject.viewpoint.highlighted_group = {
				objects: highlightedNodes,
				color: UnityUtil.defaultHighlightColor.map((c) => c * 255)
			} ;
		}

		if (hiddenNodes.length > 0) {
			generatedObject.viewpoint.hidden_group = {
				objects: hiddenNodes
			};
		}

	}
	return generatedObject;
}


export const getNodesIdsFromSharedIds = (objects) => {
	const nodesBySharedIds = selectNodesBySharedIdsMap(getState());

	if (!objects.length) {
		return [];
	}

	const ids = new Set<string>();
	objects.forEach((obj) => {
		obj.shared_ids.forEach((sharedId) => {
			const id = nodesBySharedIds[sharedId];
			if (id) {
				ids.add(id);
			}
		});
	});
	return Array.from(ids);
};

export const toSharedIds = (node_ids: string[]) => selectGetSharedIdsFromNodeIds(getState(), node_ids);

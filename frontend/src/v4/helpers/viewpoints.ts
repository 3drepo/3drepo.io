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
import { getState } from "../modules/store";
import { selectHiddenGeometryVisible, selectNodesBySharedIdsMap, selectTreeNodesList } from "../modules/tree";
import { selectColorOverrides, selectTransformations } from "../modules/viewerGui";
import { Viewer } from "../services/viewer/viewer";
import { createGroupsByColor, createGroupsByTransformations } from "./groups";

// This merges a viewpoint
// TO BE REVIEWED.

const groupPropNameMap = {
	highlighted_group_id : 'highlighted_group',
	hidden_group_id : 'hidden_group',
	shown_group_id : 'shown_group',
	override_group_ids : 'override_groups',
	transformation_group_ids: 'transformation_groups'
};

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

export const groupsOfViewpoint = function*(viewpoint) {
	const groupsProperties = ['override_group_ids', 'transformation_group_ids',
	'highlighted_group_id', 'hidden_group_id', 'shown_group_id'];

	// This part discriminates which groups hasnt been loaded yet and add their ids to
	// the groupsToFetch array
	for (let i = 0; i < groupsProperties.length ; i++) {
		const prop = groupsProperties[i];
		if (viewpoint[prop]) {
			if (Array.isArray(viewpoint[prop])) { // if the property is an array of groupId
				const groupsIds: string[] = viewpoint[prop];
				for (let j = 0; j < groupsIds.length; j++ ) {
					yield groupsIds[j];
				}
			} else {// if the property is just a groupId
				yield viewpoint[prop];
			}
		}
	}
};

export const isViewpointLoaded = (viewpoint, groups) => {
	let areGroupsLoaded = true;

	for (const id of groupsOfViewpoint(viewpoint)) {
		if (!groups[id]) {
			areGroupsLoaded = false;
			break;
		}
	}

	return areGroupsLoaded;
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

export const toSharedIds = (node_ids: string[]) => {
	const nodesSet = new Set(node_ids);
	const nodesList = selectTreeNodesList(getState());
	return nodesList.reduce((sharedIds, currentNode) => {
		if (nodesSet.has(currentNode._id)) {
			sharedIds.push(currentNode.shared_id);
		}
		return sharedIds;
	}, []);
};

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

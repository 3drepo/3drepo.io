/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Viewpoint, Group, ViewpointGroupOverrideType, GroupOverride, ViewpointState, V4GroupObjects, OverridesDicts } from '@/v5/store/tickets/tickets.types';
import { formatMessage } from '@/v5/services/intl';
import { isEmpty, isEqual, isString } from 'lodash';
import { selectCurrentTeamspace } from '../store/teamspaces/teamspaces.selectors';
import { ViewpointsActionsDispatchers } from '../services/actionsDispatchers';
import { getState, dispatch } from './redux.helpers';
import { getGroupHexColor, hexToRgb, rgbToHex } from './colors.helper';
import { getGroup as APIgetGroup } from '@/v4/services/api/groups';
import { prepareGroup } from '@/v4/helpers/groups';
import { selectCurrentRevisionId, selectIsFederation } from '@/v4/modules/model/model.selectors';
import { selectGetAllMeshes, selectGetMeshesByIds, selectGetSharedIdsFromNodeIds, selectHiddenGeometryVisible, selectIsTreeProcessed, selectNodesBySharedIdsMap } from '@/v4/modules/tree';
import { selectTransformations, selectViewpointsGroups, selectViewpointsGroupsBeingLoaded } from '../store/viewpoints/viewpoints.selectors';
import { ViewpointsActions } from '../store/viewpoints/viewpoints.redux';
import { IViewpoint } from '../store/viewpoints/viewpoints.types';
import { UnityUtil } from '@/globals/unity-util';
import { selectColorOverrides } from '@/v4/modules/viewerGui';
import { Viewer } from '@/v4/services/viewer/viewer';

const groupPropNameMap = {
	highlighted_group_id : 'highlighted_group',
	hidden_group_id : 'hidden_group',
	shown_group_id : 'shown_group',
	override_group_ids : 'override_groups',
	transformation_group_ids: 'transformation_groups',
};

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

const createModelBySharedIdDictionary = (sharedIdnodes) => {
	const state = getState();
	// Converts shareIds to nodeIds
	const nodes = getNodesIdsFromSharedIds([{ shared_ids: sharedIdnodes }]);
	const meshesInfo: any[] = selectGetMeshesByIds(nodes)(state);

	// This generates a dictionary to get the teamspace and model from the sharedId: sharedId => {teamspace, modelId}
	return meshesInfo.reduce((dict, meshesByModel) => {
		const { teamspace, modelId } = meshesByModel;
		const model = { teamspace, modelId };
		return meshesByModel.meshes.reduce((d, mesh) => {
			const index = nodes.indexOf(mesh);
			d[sharedIdnodes[index]] = model;
			return d;
		}, dict);
	}, {});
};

const createGroupsByColor = (overrides) => {
	const sharedIdnodes = Object.keys(overrides);
	const modelsDict = createModelBySharedIdDictionary(sharedIdnodes);

	/* This creates an array of groups grouped by colour
	for example:
	[
		{
			"color": [
				149,
				0,
				255,
				103
			],
			"objects": [
				{
					"shared_ids": [
						"375b918f-0b25-4f3a-8edc-239ef5abf2e4",
						"3a9cfe9d-e96f-4242-979a-26ddbbc5226d",
						"e7a69a79-fe94-4fce-9ce2-60e999e3e1d4"
					],
					"account": "carmen",
					"model": "81b0b900-f80c-11ea-970b-03c55a1e1b3a"
				}
			],
			"totalSavedMeshes": 1
		},
		{
			"color": [
				0,
				255,
				0
			],
			"objects": [
				{
					"shared_ids": [
						"cab0b20f-a0e1-439a-9982-67bf032583ca",
						"997a1909-0cf6-43a9-af2b-bb232ce887c7",
						"525f8fd6-19b4-4739-96f6-cef8c7bac55b"
					],
					"account": "carmen",
					"model": "81b0b900-f80c-11ea-970b-03c55a1e1b3a"
				}
			],
			"totalSavedMeshes": 1
		}
	]
	 */
	return sharedIdnodes
		.filter((objectId) => objectId in modelsDict)
		.reduce((arr, objectId) =>  {
			const { teamspace, modelId } = modelsDict[objectId];

			// if there is a group with that color already use that one
			let colorGroup = arr.find(({ color }) => color.join(',') === hexToRgb(overrides[objectId]).join(','));

			if (!colorGroup) {
				// Otherwise create a group with that color
				colorGroup = { color: hexToRgb(overrides[objectId]), objects: [], totalSavedMeshes: 0 };

				arr.push(colorGroup);
			}

			let sharedIdsItem =  colorGroup.objects.find(({ model, account }) => model === modelId && account === teamspace);

			if (!sharedIdsItem) {
				sharedIdsItem = { shared_ids: [], account: teamspace, model: modelId };
				colorGroup.objects.push(sharedIdsItem);
				colorGroup.totalSavedMeshes ++;
			}

			sharedIdsItem.shared_ids.push(objectId);
			return arr;
		}, []);
};

const createGroupsByTransformations = (transformations) => {
	const sharedIdnodes = Object.keys(transformations);
	const modelsDict = createModelBySharedIdDictionary(sharedIdnodes);

	return sharedIdnodes.reduce((arr, objectId) =>  {
		const { teamspace, modelId } = modelsDict[objectId];

		// 1 . Use or create the transform group with that transformation value

		// if there is group with that transformation already use that one
		let transformGroup = arr.find(({ transformation }) => isEqual(transformation, transformations[objectId]));

		if (!transformGroup) {
			transformGroup = { transformation: transformations[objectId], objects: [] };
			arr.push(transformGroup);
		}

		// 2. Add to objects the new or existing model/teamspace objects object
		let sharedIdsItem =  transformGroup.objects.find(({ model, account }) => model === modelId && account === teamspace);

		if (!sharedIdsItem) {
			sharedIdsItem = { shared_ids: [], account: teamspace, model: modelId };
			transformGroup.objects.push(sharedIdsItem);
		}

		sharedIdsItem.shared_ids.push(objectId);
		return arr;
	}, []);

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
					groups.push({ _id: id, ...groupsDataValue[i] });
				});
			} else {
				groups.push({ _id: propValue, ...groupsDataValue });
			}
		}
	});

	return groups;
};

export const generateViewpointV4 = async (name = '', withScreenshot = false) => {
	const state = getState();

	const hiddenGeometryVisible = selectHiddenGeometryVisible(state);

	const viewpoint = await Viewer.getCurrentViewpoint();

	const generatedObject = {
		name,
		viewpoint:  {
			...viewpoint,
			hideIfc: !hiddenGeometryVisible,
		},
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
				color: UnityUtil.defaultHighlightColor.map((c) => c * 255),
			} ;
		}

		if (hiddenNodes.length > 0) {
			generatedObject.viewpoint.hidden_group = {
				objects: hiddenNodes,
			};
		}

	}
	return generatedObject;
};

export const toSharedIds = (node_ids: string[]) => selectGetSharedIdsFromNodeIds(getState(), node_ids);

export const convertToV5GroupNodes = (objects) => objects.map((object) => ({
	container: object.model as string,
	_ids: getNodesIdsFromSharedIds([object]),
}));

export const convertToV4GroupNodes = (group?: Group) => {
	if (group?.excludeDefinedObjects) {
		const excludedMeshesByContainer = new Map<string, Set<string>>();
		(group.objects || []).forEach(({ container, _ids }) => {
			const excludedMeshes = excludedMeshesByContainer.get(container) || new Set<string>();
			_ids.forEach((id) => excludedMeshes.add(id));
			excludedMeshesByContainer.set(container, excludedMeshes);
		});

		const allMeshes = selectGetAllMeshes(getState());
		return allMeshes.flatMap(({ teamspace: account, model, meshes }) => {
			const excludedMeshes = excludedMeshesByContainer.get(model) || new Set();
			const filteredMeshes = excludedMeshes.size ? meshes.filter((mesh) => !excludedMeshes.has(mesh)) : meshes;
			if (!filteredMeshes.length) return [];

			return [{
				account,
				model,
				shared_ids: toSharedIds(filteredMeshes),
			}];
		});
	}

	return (group?.objects || []).map(({ container: model, _ids }) => ({
		account: selectCurrentTeamspace(getState()),
		model,
		shared_ids: toSharedIds(_ids),
	}));
};

const convertToV5GroupOverride = (group: any, type: ViewpointGroupOverrideType): GroupOverride => {
	let description = '';
	let name = '';
	switch (type) {
		case ViewpointGroupOverrideType.COLORED:
			const color = rgbToHex(group.color);
			description = formatMessage({ id: 'viewpoint.autogeneratedColoredGroup.description', defaultMessage: 'Autogenerated group from viewer for colour {color}' }, { color });
			name = formatMessage({ id: 'viewpoint.autogeneratedColoredGroup.name', defaultMessage: 'Default {color} group' }, { color });
			break;
		case ViewpointGroupOverrideType.TRANSFORMED:
			description = formatMessage({ id: 'viewpoint.autogeneratedTransformedGroup.description', defaultMessage: 'Autogenerated group from viewer for transform' });
			name = formatMessage({ id: 'viewpoint.autogeneratedTransformedGroup.name', defaultMessage: 'Default transform' });
			break;
		default:
			description = formatMessage({ id: 'viewpoint.autogeneratedHiddenGroup.description', defaultMessage: 'Autogenerated hidden group from viewer' });
			name = formatMessage({ id: 'viewpoint.autogeneratedHiddenGroup.name', defaultMessage: 'Default hidden' });
			break;
	}

	const override:GroupOverride = { group: { description, name } };

	(override.group as Group).objects = convertToV5GroupNodes(group.objects);

	if (group.color) {
		const { color } = group;
		if (color.length > 3) {
			override.opacity = color[3] / 255;
		}
		override.color = color.slice(0, 3);
	}

	if (group.opacity) {
		const { opacity } = group;
		override.opacity = opacity;
	}

	if (group.transformation) {
		const { transformation } = group;
		override.transformation = transformation;
	}


	return override;
};

export const getViewerState = async () => {
	const { viewpoint: viewpointV4 } = await generateViewpointV4();

	const state: ViewpointState = { showHidden: !viewpointV4.hideIfc };

	if (viewpointV4.override_groups?.length) {
		state.colored = viewpointV4.override_groups.map((group) => convertToV5GroupOverride(group, ViewpointGroupOverrideType.COLORED));
	}

	if (viewpointV4.highlighted_group) {
		state.colored = (state.colored || [])
			.concat(convertToV5GroupOverride(viewpointV4.highlighted_group, ViewpointGroupOverrideType.COLORED))
			// eslint-disable-next-line no-underscore-dangle
			.filter(({ group }) => !!(group as Group).objects.filter((obj) => obj._ids.length).length);
	}

	if (viewpointV4.hidden_group) {
		state.hidden = [convertToV5GroupOverride(viewpointV4.hidden_group, ViewpointGroupOverrideType.HIDDEN)];
	}

	if (viewpointV4.transformation_groups) {
		state.transformed = viewpointV4.transformation_groups.map((group) => convertToV5GroupOverride(group, ViewpointGroupOverrideType.TRANSFORMED));
	}

	return state;
};

const convertToV4Group = (groupOverride: GroupOverride) => {
	const { color, opacity, transformation, group: v5Group } = groupOverride;

	if (isString(v5Group)) {
		return { color: [0, 0, 0, 0], objects: [] }; // theres no info yet so I say us an empty group
	}

	const group:any = {
		objects: convertToV4GroupNodes(v5Group),
	};

	if (color) {
		group.color = getGroupHexColor([...color, Math.round((opacity ?? 1) * 255)]);
	}

	if (opacity) {
		group.opacity = opacity;
	}

	if (transformation) {
		group.transformation = transformation;
	}

	return group;
};

const mergeGroups = (groups: any[]) => ({ objects: groups.flatMap((group) => group.objects) });

export const viewpointV5ToV4 = (viewpoint: Viewpoint) => {
	let v4Viewpoint:any = {};
	if (viewpoint.camera) {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { position, up, forward: view_dir, type, size: orthographicSize } = viewpoint.camera;
		v4Viewpoint = { position, up, view_dir, type, orthographicSize, look_at: null, account: null, model: null };
	}

	if (!isEmpty(viewpoint.state)) {
		v4Viewpoint.hideIfc = !viewpoint.state.hidden;
	}

	if (!isEmpty(viewpoint.clippingPlanes)) {
		v4Viewpoint.clippingPlanes = viewpoint.clippingPlanes;
	}

	if (!isEmpty(viewpoint.state?.transformed)) {
		v4Viewpoint.transformation_groups = viewpoint.state.transformed.map(convertToV4Group);
	}


	if (!isEmpty(viewpoint.state?.colored)) {
		v4Viewpoint.override_groups = viewpoint.state.colored.map(convertToV4Group);
	}
	
	if (!isEmpty(viewpoint.state?.hidden)) {
		v4Viewpoint.hidden_group = mergeGroups(viewpoint.state.hidden.map(convertToV4Group));
	}

	return { viewpoint: v4Viewpoint };
};

export const meshObjectsToV5GroupNode = (objects) => objects.map((obj) => ({
	container: obj.model,
	_ids: obj.mesh_ids,
}));

export const toGroupPropertiesDicts = (overrides: GroupOverride[]): OverridesDicts => {
	const toMeshDictionary = (objects: V4GroupObjects, color: string, opacity: number): OverridesDicts => 
		objects.shared_ids.reduce((dict, id) => {
			if (color !== undefined) {
			// eslint-disable-next-line no-param-reassign
				dict.overrides[id] = color;
			} 

			if (opacity !== undefined) {
			// eslint-disable-next-line no-param-reassign
				dict.transparencies[id] = opacity;
			}

			return dict;
		}, { overrides: {}, transparencies: {} } as OverridesDicts);

	return overrides.reduce((acum, current) => {
		const color = current.color ? getGroupHexColor(current.color) : undefined;
		const v4Objects = convertToV4GroupNodes(current.group as Group);

		return v4Objects.reduce((dict, objects) => {
			const overrideDict = toMeshDictionary(objects, color, current.opacity ?? 1);

			// eslint-disable-next-line no-param-reassign
			dict.overrides = { ...dict.overrides, ...overrideDict.overrides };
			// eslint-disable-next-line no-param-reassign
			dict.transparencies = { ...dict.transparencies, ...overrideDict.transparencies };

			return dict;
		}, acum);
	}, { overrides: {}, transparencies: {} } as OverridesDicts);
};

export const goToView = async (view: Viewpoint) => {
	if (
		isEmpty(view?.state?.colored) && 
		isEmpty(view?.state?.hidden) && 
		isEmpty(view?.state?.transformed) && 
		isEmpty(view?.camera) && 
		isEmpty(view?.clippingPlanes)) {
		return;
	}
	// Going to view needs the tree to be loaded so it can converts
	// v5 groups to v4 groups using the loded tree
	await new Promise((resolve) => {
		if (selectIsTreeProcessed(getState())) {
			resolve(true);
			return;
		}

		let intervalId = setInterval(() =>  {
			if (!selectIsTreeProcessed(getState())) {
				return;
			}

			clearInterval(intervalId);
			resolve(true);
		}, 33);
	});
	
	ViewpointsActionsDispatchers.showViewpoint(null, null, viewpointV5ToV4(view));
	// ViewpointsActionsDispatchers.showViewpoint(null, null, view);
};

const getGroupsIDsOfViewpoint = (viewpoint: IViewpoint) => {
	const groupsProperties = ['override_group_ids', 'transformation_group_ids',
		'highlighted_group_id', 'hidden_group_id', 'shown_group_id'];

	const ids = new Set<string>();

	// This part discriminates which groups hasnt been loaded yet and add their ids to
	// the groupsToFetch array
	for (let i = 0; i < groupsProperties.length ; i++) {
		const prop = groupsProperties[i];
		if (viewpoint[prop]) {
			if (Array.isArray(viewpoint[prop])) { // if the property is an array of groupId
				const groupsIds: string[] = viewpoint[prop];
				for (let j = 0; j < groupsIds.length; j++ ) {
					ids.add(groupsIds[j]);
				}
			} else {// if the property is just a groupId
				ids.add(viewpoint[prop]);
			}
		}
	}

	return ids;
};

export const getViewpointWithGroups = async ({ teamspace, modelId, view }) => {
	if (!view.viewpoint) {
		return null;
	}

	const revision = selectIsFederation(getState()) ? null : selectCurrentRevisionId(getState());
	const viewpointsGroups = selectViewpointsGroups(getState());
	const viewpointsGroupsBeingLoaded: Set<string> = selectViewpointsGroupsBeingLoaded(getState());

	const viewpoint = view.viewpoint;

	const groupsToFetch = [];

	// This part discriminates which groups hasnt been loaded yet and add their ids to
	// the groupsToFetch array
	getGroupsIDsOfViewpoint(viewpoint).forEach((id) =>{
		if (!viewpointsGroups[id] && !viewpointsGroupsBeingLoaded.has(id)) {
			groupsToFetch.push(id);
		}
	});

	if (groupsToFetch.length > 0) {
		dispatch(ViewpointsActions.addViewpointGroupsBeingLoaded(groupsToFetch));
		const fetchedGroups =  (await Promise.all(groupsToFetch.map((groupId) =>
			APIgetGroup(teamspace, modelId, groupId, revision))))
			.map(({ data }) => prepareGroup(data));


		fetchedGroups.map((group) => dispatch(ViewpointsActions.fetchGroupSuccess(group)));
	}

	const groupsMap = selectViewpointsGroups(getState());
	return setGroupData(viewpoint, groupsMap);
};

export const getLoadedGroupsIds = (viewpoint: IViewpoint) => {
	const groupsProperties = ['highlighted_group', 'hidden_group', 'shown_group', 'override_groups', 'transformation_groups'];

	const ids = new Set<string>();

	// This part discriminates which groups hasnt been loaded yet and add their ids to
	// the groupsToFetch array
	for (let i = 0; i < groupsProperties.length ; i++) {
		const prop = groupsProperties[i];
		if (viewpoint[prop]) {
			if (Array.isArray(viewpoint[prop])) { // if the property is an array of groupId
				const groupsIds = viewpoint[prop];
				for (let j = 0; j < groupsIds.length; j++ ) {
					ids.add(groupsIds[j]._id);
				}
			} else {// if the property is just a groupId
				ids.add(viewpoint[prop]._id);
			}
		}
	}

	return ids;
};

export const isViewpointReady = (viewpoint: IViewpoint) => {
	const loadedGroupsIds = getLoadedGroupsIds(viewpoint);
	let areGroupsLoaded = true;

	getGroupsIDsOfViewpoint(viewpoint).forEach((id) => {
		areGroupsLoaded =  areGroupsLoaded && loadedGroupsIds.has(id);
	});

	return areGroupsLoaded;
};

export const getScreenshotFromView = (viewpoint: IViewpoint): string | null => {
	const screenshot = viewpoint?.screenshot || viewpoint?.viewpoint?.screenshot;
	if (!screenshot) return null;
	if (screenshot.thumbnailUrl) return screenshot.thumbnailUrl;
	if (!screenshot.startsWith('data:image/png;base64,') && !screenshot.startsWith('https://')) {
		return 'data:image/png;base64,' + screenshot;
	}
	return screenshot;
};

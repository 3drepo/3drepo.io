/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { getState } from '@/v5/helpers/redux.helpers';
import { hexToGLColor } from '@/v5/helpers/colors.helper';
import { isString } from 'lodash';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds,
	selectTreeNodesList } from '../modules/tree';
import { Viewer } from '../services/viewer/viewer';


type MeshId = string;
type HexColor = string;

export type ColorOverrides = Record<MeshId, HexColor>;

// Adds to a dictionary of shared_id -> value a new group with
// its share_ids from 'objects' field pointing to value
export const addToGroupDictionary = (dict, group, value) => {
	group.objects.forEach((object) => {
		object.shared_ids.forEach((sharedId) => {
			dict[sharedId] = value;
		});
	});
	return dict;
};

export const overridesColorAddedOrUpdated = (prev, curr) => {
	const keys = Object.keys(curr);
	const diffDict = {};
	const result = [];
	let value = null;

	keys.forEach((key) => {
		if (curr[key] !== prev[key]) {
			value = curr[key];

			if (!diffDict[value]) {
				const overrideByColor = {color: value, shared_ids: []};
				diffDict[value] = overrideByColor;
				result.push(overrideByColor);
			}

			diffDict[value].shared_ids.push(key);
		}
	});

	return result;
};

export const overridesColorRemoved = (prev, curr) => {
	const keys = Object.keys(prev);
	const removedDict = {};
	const result = [];
	let value = null;

	keys.forEach((key) => {
		if (prev[key] && !curr[key]) {
			value = prev[key];

			if (!removedDict[value]) {
				const changedValue = {color: value, shared_ids: []};
				removedDict[value] = changedValue;
				result.push(changedValue);
			}

			removedDict[value].shared_ids.push(key);
		}
	});

	return result;
};

export const addColorOverrides = async (overrides) => {
	if (!overrides.length) {
		return;
	}
	const state = getState();
	const treeNodes = selectTreeNodesList(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const value = hexToGLColor(override['color']);
		const excludeIds = isString(override['color']) && override['color'].substr(-1) === '-';

		if (treeNodes.length) {
			const selectNodesFn = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodesFn(state);

			if (nodes) {
				const modelsList = selectGetMeshesByIds(nodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					Viewer.overrideMeshOpacity(teamspace, modelId, meshes, value[3], excludeIds);
					Viewer.overrideMeshColor(teamspace, modelId, meshes, value, excludeIds);
				}
			}
		}
	}
};

export const removeColorOverrides = async (overrides) => {
	if (!overrides.length) {
		return;
	}

	const state = getState();
	const treeNodes = selectTreeNodesList(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const excludeIds = isString(override['color']) && override['color'].substr(-1) === '-';

		if (treeNodes.length) {
			const selectNodes = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodes(state);

			if (nodes) {
				const modelsList = selectGetMeshesByIds(nodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					Viewer.resetMeshOpacity(teamspace, modelId, meshes, excludeIds);
					Viewer.resetMeshColor(teamspace, modelId, meshes, excludeIds);
				}
			}
		}
	}
};
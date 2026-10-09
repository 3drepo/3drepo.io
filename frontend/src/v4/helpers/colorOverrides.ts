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
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds,
	selectGetAllMeshes, selectTreeNodesList } from '../modules/tree';
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

// This function return the meshes if the amount is larger than half of the total meshes in the model
// it returns the complement and excludeIds flag set to true if the majority of meshes are included
const getMeshesForOverride = (meshesOverrides, allMeshes) => meshesOverrides.map((modelMeshes) => {
	const modelKey = `${modelMeshes.teamspace}__${modelMeshes.modelId}`;
	const allModelMeshes = allMeshes.find(({ teamspace, model }) =>
		`${teamspace}__${model}` === modelKey
	);

	if (!allModelMeshes || modelMeshes.meshes.length <= allModelMeshes.meshes.length / 2) {
		return { ...modelMeshes, excludeIds: false };
	}

	const meshesToExclude = new Set(modelMeshes.meshes);
	return {
		...modelMeshes,
		meshes: allModelMeshes.meshes.filter((meshId) => !meshesToExclude.has(meshId)),
		excludeIds: true,
	};
});

export const addColorOverrides = async (overrides) => {
	if (!overrides.length) {
		return;
	}
	const state = getState();
	const treeNodes = selectTreeNodesList(state);
	const allMeshes = selectGetAllMeshes(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const value = hexToGLColor(override['color']);

		if (treeNodes.length) {
			const selectNodesFn = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodesFn(state);

			if (nodes) {
				const originalMeshesOverrides = selectGetMeshesByIds(nodes)(state);
				const meshesForOverride = getMeshesForOverride(originalMeshesOverrides, allMeshes);

				for (let j = 0; j < meshesForOverride.length; j++) {
					const { meshes, teamspace, modelId, excludeIds } = meshesForOverride[j] as any;
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
	const allMeshes = selectGetAllMeshes(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];

		if (treeNodes.length) {
			const selectNodes = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodes(state);

			if (nodes) {
				const originalMeshesOverrides = selectGetMeshesByIds(nodes)(state);
				const meshesForOverride = getMeshesForOverride(originalMeshesOverrides, allMeshes);

				for (let j = 0; j < meshesForOverride.length; j++) {
					const { meshes, teamspace, modelId, excludeIds } = meshesForOverride[j] as any;
					Viewer.resetMeshOpacity(teamspace, modelId, meshes, excludeIds);
					Viewer.resetMeshColor(teamspace, modelId, meshes, excludeIds);
				}
			}
		}
	}
};
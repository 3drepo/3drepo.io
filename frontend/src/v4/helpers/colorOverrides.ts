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
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds,
	selectTreeNodesList } from '../modules/tree';
import { Viewer } from '../services/viewer/viewer';
import { hexToGLColor } from './colors';

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

export const overridesDiff = (field) => (overrideA, overrideB) => {
	const keys = Object.keys(overrideA);
	const diff = {};
	const result = [];
	let value = null;

	keys.forEach((key) => {
		if (overrideA[key] !== overrideB[key]) {
			value = overrideA[key];

			if (!diff[value]) {
				const overrideByColor = {[field]: value, shared_ids: []};
				diff[value] = overrideByColor;
				result.push(overrideByColor);
			}

			diff[value].shared_ids.push(key);
		}
	});

	return result;
};

export const overridesColorDiff = overridesDiff('color');

export const overridesTransparencyDiff = overridesDiff('transparency');

export const addOverrides = (field, valueConvert, addOverride) => async (overrides) => {
	if (!overrides.length) {
		return;
	}
	const state = getState();
	const treeNodes = selectTreeNodesList(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const value = valueConvert(override[field]);

		if (treeNodes.length) {
			const selectNodesFn = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodesFn(state);

			if (nodes) {
				const modelsList = selectGetMeshesByIds(nodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					addOverride(teamspace, modelId, meshes, value);
				}
			}
		}
	}
};

export const addColorOverrides = addOverrides('color', hexToGLColor, Viewer.overrideMeshColor.bind(Viewer));

export const addTransparencyOverrides = addOverrides('transparency', parseFloat,
	(teamspace, modelId, meshes, transparency) => {
		if (transparency !== 0) {
			Viewer.overrideMeshOpacity(teamspace, modelId, meshes, transparency);
		}
	});

export const removeOverrides = (resetMesh) => async (overrides) => {
	if (!overrides.length) {
		return;
	}

	const state = getState();
	const treeNodes = selectTreeNodesList(state);

	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];

		if (treeNodes.length) {
			const selectNodes = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodes(state);

			if (nodes) {
				const modelsList = selectGetMeshesByIds(nodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					resetMesh(teamspace, modelId, meshes);
				}
			}
		}
	}
};

export const removeColorOverrides = removeOverrides(Viewer.resetMeshColor.bind(Viewer));
export const removeTransparencyOverrides = removeOverrides((teamspace, modelId, meshes) => {
	Viewer.resetMeshOpacity(teamspace, modelId, meshes);
});

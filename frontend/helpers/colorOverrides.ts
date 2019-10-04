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
import { getState } from '../modules/store';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds, selectTreeNodesList } from '../modules/tree';
import { Viewer } from '../services/viewer/viewer';
import { hexToGLColor } from './colors';

export const getGroupOverride = (overrides, group) => {
	const color = group.color;
	group.objects.forEach((object) => {
		object.shared_ids.forEach((sharedId) => {
			overrides[sharedId] = color;
		});
	});
	return overrides;
};

export const getColorOverrides = (groups) => groups.reduce(getGroupOverride, {});

export const overridesDiff = (overrideA, overrideB) => {
	const keys = Object.keys(overrideA);
	const diff = {};
	const result = [];
	let color = null;

	keys.forEach((key) => {
		if (overrideA[key] !== overrideB[key]) {
			color = overrideA[key];

			if (!diff[color]) {
				const overrideByColor = {color, shared_ids: []};
				diff[color] = overrideByColor;
				result.push(overrideByColor);
			}

			diff[color].shared_ids.push(key);
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
		const color = hexToGLColor(override.color);

		if (treeNodes.length) {
			const selectNodes = selectGetNodesIdsFromSharedIds([override]);
			const nodes = selectNodes(state);

			if (nodes) {
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const modelsList = selectGetMeshesByIds(filteredNodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					Viewer.overrideMeshColor(teamspace, modelId, meshes, color);
				}
			}
		}
	}
};

export const removeColorOverrides =  async (overrides) => {
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
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const modelsList = selectGetMeshesByIds(filteredNodes)(state);

				for (let j = 0; j < modelsList.length; j++) {
					const { meshes, teamspace, modelId } = modelsList[j] as any;
					Viewer.resetMeshColor(teamspace, modelId, meshes);
				}
			}
		}
	}
};

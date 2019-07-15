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
import { getAngularService } from './migration';
import { hexToGLColor } from './colors';
import { Viewer } from '../services/viewer/viewer';

export const getColorOverrides = (groups) => groups.reduce((overrides, group) => {
	const color = group.color;
	group.objects.forEach((object) => {
		object.shared_ids.forEach((sharedId) => {
			overrides[sharedId] = color;
			});
		});
	return overrides;
}, {});

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

	const TreeService = getAngularService('TreeService') as any;
	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const color = hexToGLColor(override.color);
		const treeMap = await TreeService.getMap();

		if (treeMap) {
			const nodes = await TreeService.getNodesFromSharedIds([override]);

			if (nodes) {
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const modelsMap = await TreeService.getMeshMapFromNodes(filteredNodes);
				const modelsList = Object.keys(modelsMap);

				for (let j = 0; j < modelsList.length; j++) {
					const modelKey = modelsList[j];
					const meshIds = modelsMap[modelKey].meshes;
					const [account, model] = modelKey.split('@');
					Viewer.overrideMeshColor(account, model, meshIds, color);
				}
			}
		}
	}
};

export const removeColorOverrides =  async (overrides) => {
	if (!overrides.length) {
		return;
	}

	const TreeService = getAngularService('TreeService') as any;
	for (let i = 0; i < overrides.length; i++) {
		const override = overrides[i];
		const color = hexToGLColor(override.color);
		const treeMap = await TreeService.getMap();

		if (treeMap) {
			const nodes = await TreeService.getNodesFromSharedIds([override]);

			if (nodes) {
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const modelsMap = await TreeService.getMeshMapFromNodes(filteredNodes);
				const modelsList = Object.keys(modelsMap);

				for (let j = 0; j < modelsList.length; j++) {
					const modelKey = modelsList[j];
					const meshIds = modelsMap[modelKey].meshes;
					const [account, model] = modelKey.split('@');
					Viewer.resetMeshColor(account, model, meshIds);
				}
			}
		}
	}
};

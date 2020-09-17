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
import { isEqual } from 'lodash';
import { STEP_SCALE } from '../../constants/sequences';
import { Viewer } from '../../services/viewer/viewer';
import { getState } from '../store';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds } from '../tree';

export const getSelectedFrame = (frames, endingDate) => {
	let frame = null;

	for (let i = frames.length - 1 ; i >= 0 && frame === null; i--) {
		if (frames[i].dateTime <= endingDate) {
			frame = frames[i];
		}
	}

	return frame;
};

export const getDateByStep = (date, stepScale, step) => {
	const newDate = new Date(date);

	if (stepScale === STEP_SCALE.HOUR) {
		newDate.setHours(newDate.getHours() + step);
	}

	if (stepScale === STEP_SCALE.DAY) {
		newDate.setDate(newDate.getDate() + step);
	}

	if (stepScale === STEP_SCALE.MONTH) {
		newDate.setMonth(newDate.getMonth() + step);
	}

	if (stepScale === STEP_SCALE.YEAR) {
		newDate.setFullYear(newDate.getFullYear() + step);
	}

	return newDate;
};

export const getSelectedEndingDate = (startingDate, scale, interval) => getDateByStep(startingDate, scale, interval);

export const transformationDiffChanges = (prevTransformations: any, currentTransformations: any) => {
	return  Object.keys(currentTransformations).reduce((currentChanges, sharedId) => {
		const value = currentTransformations[sharedId];

		if (!isEqual(prevTransformations[sharedId] , value)) {
			let cc = currentChanges.find((change) => isEqual(change.value, value));

			if (!cc) {
				cc = {value, shared_ids: []};
				currentChanges.push(cc);
			}

			cc.shared_ids.push(sharedId);
		}

		return currentChanges;
	}, []);
};

export const transformationDiffRemoves = (prevTransformations: any, currentTransformations: any) => {
	return  Object.keys(prevTransformations).reduce((currentChanges, sharedId) => {
		if (!currentTransformations[sharedId]) {
			currentChanges.push(sharedId);
		}

		return currentChanges;
	}, []);
};

export const moveMeshes = (transformations: any[]) => {
	const state = getState();

	transformations.forEach(({value, shared_ids}) => {

		const selectNodes =  selectGetNodesIdsFromSharedIds([{shared_ids}]);
		const nodes = selectNodes(state);

		if (nodes) {
			const filteredNodes = nodes.filter((n) => n !== undefined);
			const modelsList = selectGetMeshesByIds(filteredNodes)(state);

			for (let j = 0; j < modelsList.length; j++) {
				const { meshes, teamspace, modelId } = modelsList[j] as any;
				Viewer.moveMeshes(teamspace, modelId, meshes, value);
			}
		}
	});
};

export const resetMovedMeshes = (sharedIds: any[]) => {
	const state = getState();

	const selectNodes =  selectGetNodesIdsFromSharedIds([{shared_ids: sharedIds}]);
	const nodes = selectNodes(state);

	if (nodes) {
		const filteredNodes = nodes.filter((n) => n !== undefined);
		const modelsList = selectGetMeshesByIds(filteredNodes)(state);

		for (let j = 0; j < modelsList.length; j++) {
			const { meshes, teamspace, modelId } = modelsList[j] as any;
			Viewer.resetMovedMeshes(teamspace, modelId, meshes);
		}
	}

};

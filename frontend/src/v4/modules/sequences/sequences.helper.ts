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
import { isEqual, partition } from 'lodash';
import { formatMessage } from '@/v5/services/intl';
import { getState } from '@/v5/helpers/redux.helpers';
import { GLToHexColor } from '@/v5/helpers/colors.helper';
import { STEP_SCALE } from '../../constants/sequences';
import { Viewer } from '../../services/viewer/viewer';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds } from '../tree';
import { IStateDefinitions } from './sequences.redux';

export const getSelectedFrame = (frames, endingDate) => {
	const index = getSelectedFrameIndex(frames, endingDate);
	return frames[index];
};

export const getSelectedFrameIndex = (frames, endingDate) => {
	if (!frames.length) {
		return null;
	}

	let leftMargin = 0;
	let rightMargin = frames.length - 1;

	while (leftMargin < rightMargin - 1) {
		const i = Math.floor((rightMargin + leftMargin) / 2);

		if (frames[i].dateTime <= endingDate ) {
			leftMargin = i;
		} else {
			rightMargin = i;
		}
	}

	if (frames[rightMargin].dateTime <= endingDate) {
		return rightMargin;
	}

	return leftMargin;
};

export const getDateWithinBoundaries = (inputDate: Date | number, inputMinDate: Date | number, inputMaxDate: Date | number) => {
	const date = new Date(inputDate);
	const minDate = new Date(inputMinDate);
	const maxDate = new Date(inputMaxDate);

	const dateAsNumber = date.getTime();

	if (dateAsNumber < minDate.getTime()) {
		return minDate;
	}

	if (dateAsNumber > maxDate.getTime()) {
		return maxDate;
	}

	return date;
}

export const MODAL_TODAY_NOT_AVAILABLE_BODY = {
	title: formatMessage({
		id: 'sequences.unavailableDate.today.title',
		defaultMessage: 'Unavailable date',
	}),
	message: formatMessage({
		id: 'sequences.unavailableDate.today.message',
		defaultMessage: 'Today\'s date falls outside of the range of the sequence. The nearest date is selected',
	}),
};

export const MODAL_DATE_NOT_AVAILABLE_BODY = {
	title: formatMessage({
		id: 'sequences.unavailableDate.date.title',
		defaultMessage: 'Unavailable date',
	}),
	message: formatMessage({
		id: 'sequences.unavailableDate.date.message',
		defaultMessage: 'The selected date falls outside of the range of the sequence. The nearest date is selected',
	}),
};

export const getDateByStep = (date, stepScale, step) => {
	const newDate = new Date(date);

	switch (stepScale) {
		case STEP_SCALE.HOUR:
			newDate.setHours(newDate.getHours() + step);
			break;
		case STEP_SCALE.DAY:
			newDate.setDate(newDate.getDate() + step);
			break;
		case STEP_SCALE.WEEK:
			newDate.setDate(newDate.getDate() + step * 7);
			break;
		case STEP_SCALE.MONTH:
			newDate.setMonth(newDate.getMonth() + step);
			break;
		case STEP_SCALE.YEAR:
			newDate.setFullYear(newDate.getFullYear() + step);
			break;
	}

	return newDate;
};

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

type IOverrideGroup = {
	objects: Array<{ shared_ids: string[] }>;
	color?: string;
	opacity?: number;
}

export const convertStateDefToViewpoint = ({ color = [], transparency: hiddenAndTransparent = [], transformation = [] }: IStateDefinitions) => {
	const [hidden, transparency] = partition(hiddenAndTransparent, ({ value }) => value === 0);
	const hidden_group: IOverrideGroup = { objects: [{ shared_ids: hidden[0]?.shared_ids || [] }] };

	const override_groups: IOverrideGroup[] = color.map(({ shared_ids = [], value }) => ({
		color: GLToHexColor(value),
		objects: [{ shared_ids }],
	}));

	transparency.forEach(({ shared_ids = [], value } ) => {
		override_groups.push({ opacity: value, objects: [{ shared_ids }] })
	})

	const transformation_groups: IOverrideGroup[] = transformation.map(({ shared_ids = [], value }) => ({
		transformation: value,
		objects: [{ shared_ids }],
	}));

	return ({
		viewpoint: {
			hidden_group,
			override_groups,
			transformation_groups,
			hideIfc: false,
		},
	})
}

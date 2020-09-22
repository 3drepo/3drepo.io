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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: ActivitiesTypes, Creators: ActivitiesActions } = createActions({
	setPendingState: ['pendingState'],
	fetchActivities: [],
	fetchActivitiesSuccess: ['activities'],
	setSearchQuery: ['searchQuery'],
	setComponentState: ['componentState'],
	fetchDetails: ['activityId']
}, { prefix: 'ACTIVITIES/' });

export interface IViewpointsComponentState {
	details?: any;
	searchEnabled?: boolean;
	searchQuery?: string;
	showDetails: boolean;
	isPending: boolean;
}

export interface IViewpointsState {
	isPending: boolean;
	activitiesList: any[];
	componentState: IViewpointsComponentState;
}

export const INITIAL_STATE: IViewpointsState = {
	isPending: true,
	activitiesList: [],
	componentState: {
		showDetails: false,
		isPending: true,
	},
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return { ...state, isPending: pendingState };
};

const fetchActivitiesSuccess = (state = INITIAL_STATE, { activities = [] }) => {
	return { ...state, activitiesList: activities };
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: {...state.componentState, ...componentState} };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ActivitiesTypes.SET_PENDING_STATE]: setPendingState,
	[ActivitiesTypes.FETCH_ACTIVITIES_SUCCESS]: fetchActivitiesSuccess,
	[ActivitiesTypes.SET_COMPONENT_STATE]: setComponentState,
});

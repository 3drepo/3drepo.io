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

import { sortByField } from '../../helpers/sorting';

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetchSettings: ['teamspace'],
	fetchSettingsSuccess: ['settings'],
	setPendingState: ['pendingState'],
	updateSettings: ['teamspace', 'settings'],
	uploadTreatmentsFileSuccess: ['mitigationsUpdatedAt'],
	uploadTreatmentsFile: ['teamspace', 'file'],
	downloadTreatmentsTemplate: [],
	downloadTreatments: ['teamspace'],
}, { prefix: 'TEAMPSACE/' });

export const INITIAL_STATE = {
	isPending: true,
	settings: {
		riskCategories: [],
		topicTypes: [],
		teamspace: '',
	}
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) =>
		({ ...state, isPending: pendingState });

const uploadTreatmentsFileSuccess = (state = INITIAL_STATE, { mitigationsUpdatedAt }) =>
		({ ...state, settings: { ...state.settings, mitigationsUpdatedAt } });

const fetchSettingsSuccess = (state = INITIAL_STATE, { settings }) => {
	if (settings && settings.topicTypes) {
		settings.topicTypes.sort();
	}
	if (settings && settings.riskCategories) {
		settings.riskCategories.sort();
	}
	return { ...state, settings };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspaceTypes.SET_PENDING_STATE]: setPendingState,
	[TeamspaceTypes.FETCH_SETTINGS_SUCCESS]: fetchSettingsSuccess,
	[TeamspaceTypes.UPLOAD_TREATMENTS_FILE_SUCCESS]: uploadTreatmentsFileSuccess,
});

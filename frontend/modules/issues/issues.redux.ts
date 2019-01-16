/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { keyBy } from 'lodash';

export const { Types: IssuesTypes, Creators: IssuesActions } = createActions({
	fetchIssues: ['teamspace', 'modelId', 'revision'],
	fetchIssuesSuccess: ['issues'],
	setComponentState: ['componentState']
}, { prefix: 'ISSUES_' });

export const INITIAL_STATE = {
	issuesMap: {},
	isPending: true,
	componentState: {
		activeIssue: null,
		showDetails: false
	}
};

export const fetchIssuesSuccess = (state = INITIAL_STATE, { issues = [] }) => {
	const issuesMap = keyBy(issues, '_id');
	return {...state, issuesMap, activeIssue: null, showDetails: false};
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const reducer = createReducer(INITIAL_STATE, {
	[IssuesTypes.FETCH_ISSUES_SUCCESS]: fetchIssuesSuccess,
	[IssuesTypes.SET_COMPONENT_STATE]: setComponentState
});

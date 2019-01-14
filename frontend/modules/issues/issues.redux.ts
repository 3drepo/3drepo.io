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

export const { Types: IssuesTypes, Creators: IssuesActions } = createActions({
	fetchIssues: ['teamspace', 'modelId', 'revision'],
	setActiveIssue: ['issueId'],
	toggleDetails: ['showDetails']
}, { prefix: 'ISSUES_' });

export const INITIAL_STATE = {
	issues: [],
	isPending: true,
	activeIssue: null,
	showDetails: false
};

export const fetchIssuesSuccess = (state = INITIAL_STATE, { issues }) => {
	return {...state, issues, activeIssue: null, showDetails: false};
};

export const setActiveIssue = (state = INITIAL_STATE, { issueId }) => ({ ...state, activeIssue: issueId });

export const toggleDetails = (state = INITIAL_STATE, { showDetails }) => {
	return {...state, showDetails, activeIssue: null};
};

export const reducer = createReducer(INITIAL_STATE, {
	[IssuesTypes.SET_ACTIVE_ISSUE]: setActiveIssue,
	[IssuesTypes.TOGGLE_DETAILS]: toggleDetails
});

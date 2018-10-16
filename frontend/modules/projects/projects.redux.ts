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

export const { Types: ProjectsTypes, Creators: ProjectsActions } = createActions({
	create: ['teamspace', 'project'],
	update: ['teamspace', 'project'],
	remove: ['teamspace', 'project'],
	createSuccess: ['project'],
	updateSuccess: ['project'],
	removeSuccess: ['projectName']
}, { prefix: 'PROJECTS_' });

export const INITIAL_STATE = {
	projects: []
};

export const updateSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

export const createSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

export const removeSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

export const reducer = createReducer(INITIAL_STATE, {
	[ProjectsTypes.UPDATE_SUCCESS]: updateSuccess,
	[ProjectsTypes.CREATE_SUCCESS]: createSuccess,
	[ProjectsTypes.REMOVE_SUCCESS]: removeSuccess
});

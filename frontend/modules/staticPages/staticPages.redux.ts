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

export const { Types: StaticPagesTypes, Creators: StaticPagesActions } = createActions({
	loadTemplate: ['path'],
	setPendingState: ['isPending'],
	loadTemplateSuccess: ['path', 'template']
}, { prefix: 'STATIC_PAGES/' });

export const INITIAL_STATE = {
	templates: {},
	isPending: false
};

export const setPendingState = (state = INITIAL_STATE, { isPending }) => ({...state, isPending });

export const loadTemplateSuccess = (state = INITIAL_STATE, { path, template }) => ({
	...state,
	templates: Object.assign({}, state.templates, { [path]: template })
});

export const reducer = createReducer(INITIAL_STATE, {
	[StaticPagesTypes.SET_PENDING_STATE]: setPendingState,
	[StaticPagesTypes.LOAD_TEMPLATE_SUCCESS]: loadTemplateSuccess
});

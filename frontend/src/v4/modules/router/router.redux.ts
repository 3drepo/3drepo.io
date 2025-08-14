/**
 *  Copyright (C) 2025 3D Repo Ltd
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

export const { Types: RouterTypes, Creators: RouterActions } = createActions({
    setLocation: ['location'],
    navigate: ['to'],
    goBack: [],
    clearNavigation: [],
    removeSearchParams: ['searchParams'],
    resetSearchParamsToRemove: [],
}, { prefix: 'ROUTER/' });

export const INITIAL_STATE = {
    location: { pathname: '' },
    requestedActions: {
        navigationTarget: '',
        goBackRequested: false,
        searchParamsToRemove: [],
    }
};

export const setLocation = (state = INITIAL_STATE, { location }) => ({
    ...state, location
});
export const navigate = (state = INITIAL_STATE, { to }) => ({
    ...state, requestedActions: { ...state.requestedActions, navigationTarget: to }
});
export const goBack = (state = INITIAL_STATE) => ({
    ...state, requestedActions: { ...state.requestedActions, goBackRequested: true, navigationTarget: '' }
});
export const clearNavigation = (state = INITIAL_STATE) => ({
    ...state, requestedActions: { ...state.requestedActions, navigationTarget: '', goBackRequested: false }
});
export const removeSearchParams = (state = INITIAL_STATE, { searchParams }) => ({
    ...state, requestedActions: { ...state.requestedActions, searchParamsToRemove: searchParams }
});
export const resetSearchParamsToRemove = (state = INITIAL_STATE) => ({
    ...state, requestedActions: { ...state.requestedActions, searchParamsToRemove: [] }
});

export const reducer = createReducer(INITIAL_STATE, {
    [RouterTypes.SET_LOCATION]: setLocation,
    [RouterTypes.NAVIGATE]: navigate,
    [RouterTypes.GO_BACK]: goBack,
    [RouterTypes.CLEAR_NAVIGATION]: clearNavigation,
    [RouterTypes.REMOVE_SEARCH_PARAMS]: removeSearchParams,
    [RouterTypes.RESET_SEARCH_PARAMS_TO_REMOVE]: resetSearchParamsToRemove,
});

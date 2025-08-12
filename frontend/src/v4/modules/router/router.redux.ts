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
}, { prefix: 'ROUTER/' });

export const INITIAL_STATE = {
    location: { pathname: '' },
    navigationTarget: '',
    goBackRequested: false,
};

export const setLocation = (state = INITIAL_STATE, { location }) => ({
    ...state, location
});
export const navigate = (state = INITIAL_STATE, { to }) => ({
    ...state, navigationTarget: to, goBackRequested: false
});
export const goBack = (state = INITIAL_STATE) => ({
    ...state, goBackRequested: true, navigationTarget: ''
});
export const clearNavigation = (state = INITIAL_STATE) => ({
    ...state, navigationTarget: '', goBackRequested: false
});

export const reducer = createReducer(INITIAL_STATE, {
    [RouterTypes.SET_LOCATION]: setLocation,
    [RouterTypes.NAVIGATE]: navigate,
    [RouterTypes.GO_BACK]: goBack,
    [RouterTypes.CLEAR_NAVIGATION]: clearNavigation,
});

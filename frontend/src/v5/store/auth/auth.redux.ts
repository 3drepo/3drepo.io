/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { Constants } from '../../helpers/actions.helper';

interface IAuthActions {
	login: (username: string, password: string) => any;
	loginSuccess: () => any;
}

interface IAuthState {
	isAuthenticated: boolean;
}

export const { Types: AuthTypes, Creators: AuthActions } = createActions({
	login: ['username', 'password'],
	loginSuccess: [],
}, { prefix: 'AUTH2/' }) as { Types: Constants<IAuthActions>; Creators: IAuthActions };

export const INITIAL_STATE: IAuthState = {
	isAuthenticated: false,
};

export const loginSuccess = (state = INITIAL_STATE): IAuthState => ({ ...state, isAuthenticated: true });

export const authReducer = createReducer(INITIAL_STATE, {
	[AuthTypes.LOGIN_SUCCESS]: loginSuccess,
});

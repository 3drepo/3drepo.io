/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { Action } from 'redux';

export interface INewUser {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	company: string;
	countryCode: string;
	captcha: string;
	mailListAgreed: boolean;
}
export type RegisterPayload = INewUser;
export type RegisterResponse = INewUser;
export type RegisterSuccessPayload = RegisterResponse;

export type RegisterAction = Action<'REGISTER_USER'> & RegisterPayload;
export type RegisterSuccessAction = Action<'REGISTER_USER_SUCCESS'> & RegisterSuccessPayload;

export interface IAuthActionCreators {
	register: (username: string, data: any) => RegisterAction;
}

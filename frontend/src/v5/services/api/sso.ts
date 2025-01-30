/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { addParams, getCurrentUrl } from '@/v5/helpers/url.helper';
import { AxiosResponse } from 'axios';
import { formatMessage } from '../intl';
import api from './default';

export enum SSOErrorCode {
	EMAIL_EXISTS = '1',
	EMAIL_EXISTS_WITH_SSO = '2',
	NON_SSO_USER = '3',
	USER_NOT_FOUND = '4',
	UNKNOWN = '5',
	EXISTING_USERNAME = '6', // this is created in the frontend
}

export const errorMessages = {
	[SSOErrorCode.EMAIL_EXISTS]: formatMessage({ id: 'ssoerror.Code1', defaultMessage: 'This email is associated with an account that is not linked with Microsoft. Please log in with your username and password.' }),
	[SSOErrorCode.EMAIL_EXISTS_WITH_SSO]: formatMessage({ id: 'ssoerror.Code2', defaultMessage: 'This email is associated with an account that is linked with Microsoft. Please log in with Micorosoft.' }),
	[SSOErrorCode.NON_SSO_USER]: formatMessage({ id: 'ssoerror.Code3', defaultMessage: 'This email is associated with an account that is not linked with Microsoft. Please log in with your username and password.' }),
	[SSOErrorCode.USER_NOT_FOUND]: formatMessage({ id: 'ssoerror.Code4', defaultMessage: 'You are not registered with 3D Repo. Please sign up to proceed.' }),
	[SSOErrorCode.UNKNOWN]: formatMessage({ id: 'ssoerror.Code5', defaultMessage: 'Unknown error.' }),
	[SSOErrorCode.EXISTING_USERNAME]: formatMessage({ id: 'ssoerror.Code6', defaultMessage: 'Existing username.' }),
};

export const postActions = {
	LINK_POST: 'linkPost',
	UNLINK_POST: 'unlinkPost',
	LOGIN_POST: 'loginPost',
	SIGNUP_POST: 'signupPost',
};

const SSO_ROUTE = 'sso';
const AAD_ROUTE = `authentication`;

export const signup = (data): Promise<AxiosResponse<{ link: string }>> => api.post(`${AAD_ROUTE}/signup?redirectUri=${getCurrentUrl(`?${postActions.SIGNUP_POST}=1`)}`, data);

export const signin = (redirect): Promise<AxiosResponse<{ link: string }>> => api.get(`${AAD_ROUTE}/authenticate?redirectUri=${addParams(redirect, `${postActions.LOGIN_POST}=1`)}`);

export const linkAccount = (): Promise<AxiosResponse<{ link: string }>> => api.get(`${AAD_ROUTE}/link?redirectUri=${getCurrentUrl(`?${postActions.LINK_POST}=1`)}`);

export const unlinkAccount = (data): Promise<any> => api.post(`${SSO_ROUTE}/unlink`, data);

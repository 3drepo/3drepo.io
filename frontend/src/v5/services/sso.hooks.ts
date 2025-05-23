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

import { isNull, omitBy, values } from 'lodash';
import { useHistory } from 'react-router-dom';
import { getParams } from '../helpers/url.helper';
import { errorMessages, postActions, ssoLogin } from './api/sso';
import { formatMessage } from './intl';

export const useSSOParams = () => {
	const history = useHistory();
	const allParams = getParams();
	const error = allParams.get('error');
	const action = values(postActions).filter((postAction) => allParams.get(postAction))[0];

	const reset = () => {
		allParams.delete('error');
		allParams.delete(action);
		history.replace({ search: allParams.toString() });
	};

	const actionParamValue = allParams.get(action);
	const searchParams = new URLSearchParams(omitBy({ error, [action]: actionParamValue }, isNull)).toString();

	return [{ searchParams, error, action }, reset] as
	[{ searchParams: string, error: string | null, action: string | null }, () => void ];
};

export const useSSOLogin = () => {
	const [{ error }] = useSSOParams();

	const errorMessage = error
		? formatMessage({
			id: 'auth.ssoerror',
			defaultMessage: 'Error authenticating: {errorMessage}',
		},
		{ errorMessage: errorMessages[error] }) : null;

	return [
		async (redirectUri, email) => {
			const { data } = await ssoLogin(redirectUri, email);
			window.location.href = data.link;
		},
		errorMessage,
	] as [(redirectUri: string, email: string) => void, string | null];
};

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

import { isNull, omitBy } from 'lodash';
import { getParams } from '../helpers/url.helper';
import { errorMessages, signin } from './api/sso';
import { formatMessage } from './intl';
import { AuthHooksSelectors } from './selectorsHooks';

export const useSSOLogin = () => {
	const searchParams = getParams();
	const loginPost = searchParams.get('loginPost');
	const error = searchParams.get('error');
	const returnUrl = AuthHooksSelectors.selectReturnUrl();
	const ssoPArams = new URLSearchParams(omitBy({ loginPost, error }, isNull)).toString();

	const errorMessage = error
		? formatMessage({
			id: 'auth.ssoerror',
			defaultMessage: 'Error authenticating: {errorMessage}',
		},
		{ errorMessage: errorMessages[error] }) : null;

	const { origin } = new URL(window.location.href);
	const redrectUri = `${origin}${returnUrl.pathname}${returnUrl.search}`;

	return [() => signin(redrectUri).then(({ data }) => {
		window.location.href = data.link;
	}), errorMessage, ssoPArams.toString()] as [ ()=> void, string | null, string];
};

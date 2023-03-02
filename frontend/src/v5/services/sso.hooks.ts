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

import { useLocation, useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../ui/routes/routes.constants';
import { errorMessages, signin } from './api/sso';
import { formatMessage } from './intl';

export const useSSOLogin = () => {
	const history = useHistory();
	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);
	const isLogingIn = !!searchParams.get('loginPost') && !searchParams.get('error');

	if (isLogingIn) {
		history.push(DASHBOARD_ROUTE);
	}

	const errorMessage = searchParams.get('error')
		? formatMessage({
			id: 'auth.ssoerror',
			defaultMessage: 'Error authenticating: {errorMessage}',
		},
		{
			errorMessage: errorMessages[searchParams.get('error')],
		}) : null;

	return [() => signin().then(({ data }) => {
		window.location.href = data.link;
	}), errorMessage, isLogingIn] as [ ()=> void, string | null, boolean];
};

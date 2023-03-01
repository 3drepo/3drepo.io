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

import { useLocation } from 'react-router-dom';
import { signin } from './api/sso';
import { formatMessage } from './intl';

const errorMessage = formatMessage({ id: 'auth.authenticate.ssoerror', defaultMessage: 'Error trying to authenticate' });

export const useSSOLogin = () => {
	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);
	const isLogingIn = !!searchParams.get('loginPost') && !searchParams.get('error');

	if (isLogingIn) {
		const { origin } = new URL(window.location.href);
		window.location.href = origin;
	}

	return [() => signin().then(({ data }) => {
		window.location.href = data.link;
	}), searchParams.get('error') ? errorMessage : null, isLogingIn];
};

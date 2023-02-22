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
import { signin } from '@/v5/services/api/sso';
import { useLocation } from 'react-router-dom';

export const LoginSSO = () => {
	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);

	if (searchParams.get('loginPost')) {
		const { origin } = new URL(window.location.href);
		window.location.href = origin;
	}

	if (!searchParams.get('loginPost')) {
		signin().then(({ data }) => {
			console.log(data.link);
			// window.location.href = data.link;
		});
	}

	return null;
};

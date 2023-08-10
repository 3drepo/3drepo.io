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

import { useHistory, useLocation } from 'react-router-dom';

export const useSearchParam = (name: string) => {
	const history = useHistory();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const value = searchParams.get(name);

	const setParam = (newValue = '') => {
		if (newValue) {
			searchParams.set(name, newValue);
		} else {
			searchParams.delete(name);
		}
		history.push({ search: searchParams.toString() });
	};

	return [value, setParam] as [string, (val: string) => void];
};

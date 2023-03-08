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

export const useSSO = () => {
	const { search } = useLocation();
	const history = useHistory();
	const searchParams = new URLSearchParams(search);
	const errorCode = searchParams.get('error');
	const linkPost = searchParams.get('linkPost');
	const unlinkPost = searchParams.get('unlinkPost');

	const reset = () => {
		searchParams.delete('error');
		searchParams.delete('linkPost');
		searchParams.delete('unlinkPost');
		history.replace({ search: searchParams.toString() });
	};

	return { linkPost, unlinkPost, errorCode, reset };
};

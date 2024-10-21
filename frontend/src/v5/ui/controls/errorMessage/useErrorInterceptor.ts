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
import axios from 'axios';
import { useEffect, useState } from 'react';

export const useErrorInterceptor = () => {
	const [error, setError] = useState(null);

	const handleSuccess = (res) => {
		setError(null);
		return res;
	};

	const handleError = (err) => {
		setError(err);
		return Promise.reject(err);
	};

	useEffect(() => {
		const interceptorId = axios.interceptors.response.use(
			handleSuccess,
			handleError,
		);
		return () => axios.interceptors.response.eject(interceptorId);
	}, []);

	return error;
};

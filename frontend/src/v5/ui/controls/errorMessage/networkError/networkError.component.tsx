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
import { FormattedMessage } from 'react-intl';
import { isNetworkError } from '@/v5/validation/errors.helpers';
import { ErrorMessage } from '../errorMessage.component';

type NetworkErrorProps = {
	className?: string;
};

export const NetworkError = ({ className }: NetworkErrorProps) => {
	const [showError, setShowError] = useState(false);
	const [interceptor, setInterceptor] = useState(null);

	const onMount = () => {
		setInterceptor(axios.interceptors.response.use(
			(res) => {
				setShowError(false);
				return res;
			},
			(err) => {
				setShowError(isNetworkError(err));
				return Promise.reject(err);
			},
		));
	};

	const onUnmount = () => axios.interceptors.request.eject(interceptor);

	useEffect(() => {
		onMount();
		return onUnmount;
	}, []);

	return showError && (
		<ErrorMessage className={className}>
			<FormattedMessage id="errorMessage.networkError" defaultMessage="Network Error" />
		</ErrorMessage>
	);
};

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
import { isNetworkError } from '@/v5/validation/errors.helpers';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NetworkError } from './networkError/networkError.component';
import { UnexpectedError } from '../unexpectedError/unexpectedError.component';

type UnhandledErrorProps = {
	expectedErrorValidators?: Array<(err) => boolean>;
	className?: string;
	initialError?: any;
	setError?: (error: any) => void;
};

export const UnhandledError = ({
	expectedErrorValidators = [],
	className,
	initialError,
	setError,
}: UnhandledErrorProps) => {
	const [showNetworkError, setShowNetworkError] = useState(null);
	const [showUnexpectedError, setShowUnexpectedError] = useState(null);
	const [interceptor, setInterceptor] = useState(null);

	const isExpectedError = (err) => expectedErrorValidators.some((test) => test(err));

	const onSuccess = (res) => {
		setError?.(null);
		setShowNetworkError(null);
		setShowUnexpectedError(null);
		return res;
	};

	const onError = (err) => {
		setError?.(err);
		setShowNetworkError(isNetworkError(err));
		setShowUnexpectedError(!isExpectedError(err));
		return Promise.reject(err);
	};

	const onMount = () => {
		setInterceptor(axios.interceptors.response.use(
			onSuccess,
			onError,
		));
	};

	const onUnmount = () => axios.interceptors.request.eject(interceptor);

	useEffect(() => {
		onMount();
		if (initialError) onError(initialError);
		return onUnmount;
	}, []);

	if (showNetworkError) return (<NetworkError className={className} />);
	if (showUnexpectedError) return (<UnexpectedError className={className} />);
	return (<></>);
};

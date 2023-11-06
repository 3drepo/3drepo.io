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
import { NetworkError } from '../networkError/networkError.component';
import { UnexpectedError } from '../unexpectedError/unexpectedError.component';

export type UnhandledErrorProps = {
	error: any;
	expectedErrorValidators?: Array<(err) => boolean>;
	className?: string;
};

export const UnhandledError = ({
	expectedErrorValidators = [],
	className,
	error,
}: UnhandledErrorProps) => {
	const isExpectedError = (err) => expectedErrorValidators.some((test) => test(err));

	if (!error) return (<></>);
	if (isNetworkError(error)) return (<NetworkError className={className} />);
	if (!isExpectedError(error)) return (<UnexpectedError error={error} className={className} />);
	return (<></>);
};

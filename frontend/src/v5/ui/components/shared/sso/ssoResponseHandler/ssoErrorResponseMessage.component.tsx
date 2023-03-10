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

import { useSSO } from '@components/shared/sso/useSSO';
import { formatMessage } from '@/v5/services/intl';
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { SSOErrorCode } from '@/v5/services/api/sso';

const getErroInfo = (errorCode) => {
	switch (errorCode) {
		case SSOErrorCode.EMAIL_EXISTS:
			return {
				title: formatMessage({
					id: 'sso.error.emailExists.action',
					defaultMessage: 'SSO Error - An email is already linked',
				}),
				message: formatMessage({
					id: 'sso.error.emailExists.message',
					defaultMessage: 'Your account cannot be linked with Microsoft because another email is already linked',
				}),
			};
		default:
			return {
				title: formatMessage({
					id: 'sso.error.unkown.action',
					defaultMessage: 'SSO Error - Unknown',
				}),
				message: formatMessage({
					id: 'sso.error.unkown.message',
					defaultMessage: 'An unknown error occurred (CODE: {errorCode})',
				}, { errorCode }),
			};
	}
};

export const SSOErrorResponseMessage = () => {
	const { errorCode } = useSSO();

	if (!errorCode) return (<></>);

	const { title, message } = errorCode && getErroInfo(errorCode);

	return (<ErrorMessage title={title}>{message}</ErrorMessage>);
};

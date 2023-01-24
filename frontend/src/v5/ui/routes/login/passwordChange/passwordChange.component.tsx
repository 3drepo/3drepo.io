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

import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import * as API from '@/v5/services/api';
import { AuthTemplate } from '@components/authTemplate';
import { PasswordChangeSchema } from '@/v5/validation/userSchemes/passwordChangeSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitButton } from '@controls/submitButton';
import { useForm } from 'react-hook-form';
import ErrorIcon from '@assets/icons/twoToned/warning_small-two_toned.svg';
import { AuthHeading, AuthParagraph, ErrorMessage, FormPasswordField } from '../components/components.styles';
import { ReturnLink } from '../components/returnLink.component';
import { LOGIN_PATH } from '../../routes.constants';

export const PasswordChange = () => {
	const { token, username } = queryString.parse(window.location.search);
	const [errorMessage, setErrorMessage] = useState('');
	const { control, handleSubmit, formState: { isValid, isDirty, errors }, trigger } = useForm({
		mode: 'onBlur',
		defaultValues: { newPassword: '', newPasswordConfirm: '' },
		resolver: yupResolver(PasswordChangeSchema),
	});
	const history = useHistory();
	const onSubmit = async ({ newPassword }) => {
		try {
			await API.Auth.changePassword(username, newPassword, token);
			history.push(LOGIN_PATH);
		} catch ({ response: { data: { message } } }) {
			setErrorMessage(message);
		}
	};

	useEffect(() => {
		if (isDirty) trigger('newPasswordConfirm');
	}, [isValid]);

	return (
		<AuthTemplate>
			<form onSubmit={handleSubmit(onSubmit)}>
				<AuthHeading>
					<FormattedMessage id="auth.changePassword.heading" defaultMessage="Create a new password" />
				</AuthHeading>
				{ username && token ? (
					<>
						<FormPasswordField
							control={control}
							name="newPassword"
							label={formatMessage({
								id: 'auth.passwordChange.newPassword',
								defaultMessage: 'New password',
							})}
							formError={errors.newPassword}
							required
						/>
						<FormPasswordField
							control={control}
							name="newPasswordConfirm"
							label={formatMessage({
								id: 'auth.passwordChange.confirmNewPassword',
								defaultMessage: 'Confirm new password',
							})}
							formError={errors.newPasswordConfirm}
							required
						/>
						<SubmitButton disabled={!isValid}>
							<FormattedMessage id="auth.changePassword.buttonText" defaultMessage="Save changes" />
						</SubmitButton>
					</>
				)
					: (
						<AuthParagraph>
							<FormattedMessage
								id="auth.changePassword.missingParams"
								defaultMessage="Cannot change password due to URL is incomplete. Please ensure you have copied the whole link and try again."
							/>
						</AuthParagraph>
					)}
				{errorMessage && <ErrorMessage><ErrorIcon />{errorMessage}</ErrorMessage>}
				<ReturnLink />
			</form>
		</AuthTemplate>
	);
};

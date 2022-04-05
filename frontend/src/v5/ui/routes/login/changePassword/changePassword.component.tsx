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

import { formatMessage } from '@/v5/services/intl';
import { AuthPage } from '@components/authPage';
import { SubmitButton } from '@controls/submitButton';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { AuthHeading, PasswordField } from '../components/components.styles';
import { ReturnLink } from '../components/returnLink.component';

export const ChangePassword = () => {
	const { control, handleSubmit, formState: { isValid } } = useForm({
		mode: 'onSubmit',
		defaultValues: { newPassword: '', newPasswordConfirm: '' },
	});
	const onSubmit = () => { };

	return (
		<AuthPage>
			<form onSubmit={handleSubmit(onSubmit)}>
				<AuthHeading>
					<FormattedMessage id="auth.changePassword.heading" defaultMessage="Create a new password" />
				</AuthHeading>
				<PasswordField
					control={control}
					name="newPassword"
					label={formatMessage({
						id: 'auth.passwordChange.newPassword',
						defaultMessage: 'Password',
					})}
				/>
				<PasswordField
					control={control}
					name="newPasswordConfirm"
					label={formatMessage({
						id: 'auth.passwordChange.confirmNewPassword',
						defaultMessage: 'Confirm new password',
					})}
				/>
				<SubmitButton disabled={!isValid}>
					<FormattedMessage id="auth.changePassword.buttonText" defaultMessage="Save changes" />
				</SubmitButton>
				<ReturnLink />
			</form>
		</AuthPage>
	);
};

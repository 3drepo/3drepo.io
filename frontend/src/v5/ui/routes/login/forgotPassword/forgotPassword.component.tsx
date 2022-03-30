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

import { ForgotPasswordSchema } from '@/v5/validation/auth';
import EmailIcon from '@assets/icons/email.svg';
import { AuthPage } from '@components/authPage';
import { SubmitButton } from '@controls/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { AuthHeading } from '../login.styles';
import { Input, ReturnLink } from './forgotPassword.styles';

export const ForgotPassword = (): JSX.Element => {
	const { control, handleSubmit, formState: { isValid } } = useForm({
		mode: 'onSubmit',
		defaultValues: { username: '' },
		resolver: yupResolver(ForgotPasswordSchema),
	});
	const onSubmit = () => { };

	return (
		<AuthPage>
			<form onSubmit={handleSubmit(onSubmit)}>
				<AuthHeading>
					Forgot Password
				</AuthHeading>

				<Input control={control} />
				<SubmitButton disabled={!isValid} startIcon={<EmailIcon />}> {/* Add pending state? */}
					<FormattedMessage id="auth.forgotPassword.buttonText" defaultMessage="Send request" />
				</SubmitButton>

				<ReturnLink to="/v5/login">
					<FormattedMessage id="auth.forgotPassword.goBack" defaultMessage="Back to login" />
				</ReturnLink>
			</form>
		</AuthPage>
	);
};

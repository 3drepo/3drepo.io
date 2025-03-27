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

import { PasswordForgotSchema } from '@/v5/validation/userSchemes/passwordChangeSchemes';
import EmailIcon from '@assets/icons/filled/email-filled.svg';
import { AuthTemplate } from '@components/authTemplate';
import { SubmitButton } from '@controls/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { Gap } from '@controls/gap';
import { useForm } from 'react-hook-form';
import * as API from '@/v5/services/api';
import { FormattedMessage } from 'react-intl';
import { AuthForm } from '@components/authTemplate/authTemplate.styles';
import { ReturnLink } from '../components/returnLink.component';
import { AuthHeading, AuthParagraph, FormUsernameField } from '../components/components.styles';

export const PasswordForgot = (): JSX.Element => {
	const { control, handleSubmit, formState: { isValid, isSubmitted } } = useForm({
		mode: 'onSubmit',
		defaultValues: { username: '' },
		resolver: yupResolver(PasswordForgotSchema),
	});
	const onSubmit = () => API.Auth.resetPassword();

	return (
		<AuthTemplate>
			<AuthForm onSubmit={handleSubmit(onSubmit)}>
				<AuthHeading>
					<FormattedMessage id="auth.forgotPassword.heading" defaultMessage="Forgot Password" />
				</AuthHeading>
				{
					isSubmitted ? (
						<AuthParagraph>
							<FormattedMessage
								id="auth.forgotPassword.passwordSent.p1"
								defaultMessage="A password change request has been sent. You will receive an email
								shortly with a link to change your password."
							/>
							<Gap />
							<FormattedMessage
								id="auth.forgotPassword.passwordSent.p2"
								defaultMessage="If you have not received this, please check your spam folder or ask
								your email administrator for assistance."
							/>
						</AuthParagraph>
					) : (
						<>
							<FormUsernameField
								control={control}
								name="username"
								required
							/>
							<SubmitButton disabled={!isValid} startIcon={<EmailIcon />}>
								<FormattedMessage id="auth.forgotPassword.buttonText" defaultMessage="Send request" />
							</SubmitButton>
						</>
					)
				}
				<ReturnLink />
			</AuthForm>
		</AuthTemplate>
	);
};

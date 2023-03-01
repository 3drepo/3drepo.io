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
import { formatMessage } from '@/v5/services/intl';
import { UserSignupSchemaSSO, UserSignupSchemaTermsAndSubmit } from '@/v5/validation/userSchemes/userSignupSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { pick } from 'lodash';
import { useState } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { getRedirectUrl, signup, SSOErrorCode } from '@/v5/services/api/sso';
import { isInvalidArguments, usernameAlreadyExists } from '@/v5/validation/errors.helpers';
import { AuthTemplate } from '@components/authTemplate';
import { Container as FormContainer, LoginPrompt, LoginPromptLink, Title } from '../userSignupForm/userSignupForm.styles';
import { UserSignupFormStep } from '../userSignupForm/userSignupFormStep/userSignupFormStep.component';
import { UserSignupFormStepTermsAndSubmit } from '../userSignupForm/userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import { UserSignupFormStepper, UserSignupFormStepperContextValue } from '../userSignupForm/userSignupFormStepper/userSignupFormStepper.component';
import { Container } from './userSignUpSSO.styles';
import { MinUserSignupFormStepAccount } from './minUserSignupFormStepAccount.component';
import { UserSignupSSOError } from './userSignUpSSOError.component';

export interface IAccountFormInput {
	username: string;
	company: string;
	countryCode: string;
	termsAgreed: boolean;
	mailListAgreed: boolean;
}

export const UserSignupSSO = () => {
	const [contextValue, setContextValue] = useState<UserSignupFormStepperContextValue | null>();
	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);

	if (searchParams.get('signupPost')) {
		if (!searchParams.get('error') || searchParams.get('error') === SSOErrorCode.EMAIL_EXISTS_WITH_SSO) {
			return (<Redirect to={{ pathname: '/v5/login-sso' }} />);
		}

		if (searchParams.get('error')) {
			return (<UserSignupSSOError />);
		}
	}

	const DEFAULT_FIELDS: IAccountFormInput = {
		username: '',
		company: '',
		countryCode: 'GB',
		termsAgreed: false,
		mailListAgreed: false,
	};

	let schema = null;

	switch (contextValue?.activeStep) {
		case 0:
			schema = UserSignupSchemaSSO;
			break;
		default:
			schema = UserSignupSchemaSSO.concat(UserSignupSchemaTermsAndSubmit);
			break;
	}

	const formData = useForm({
		resolver: yupResolver(schema),
		mode: 'all',
		defaultValues: DEFAULT_FIELDS,
	});

	const handleInvalidArgumentsError = (error) => {
		let errorParam = SSOErrorCode.UNKNOWN;

		if (usernameAlreadyExists(error)) {
			errorParam = SSOErrorCode.EXISTING_USERNAME;
		}

		window.location.href = `${getRedirectUrl()}?signupPost=1&error=${errorParam}`;
	};

	const onSubmit = async (values) => {
		try {
			const newUser = pick(values, ['username', 'company', 'countryCode', 'mailListAgreed']);
			if (!values.company) delete newUser.company;
			const res = await signup(newUser);
			window.location.href = res.data.link;
		} catch (error) {
			if (isInvalidArguments(error)) {
				handleInvalidArgumentsError(error);
			}
		}

		return null;
	};

	return (
		<AuthTemplate>
			<Container>
				<FormContainer>
					<Title>
						<FormattedMessage id="userSignupSSO.title" defaultMessage="We just need a few more details from you..." />
					</Title>
					<FormProvider {...formData}>
						<form onSubmit={formData.handleSubmit(onSubmit)}>
							<UserSignupFormStepper onContextUpdated={setContextValue}>
								<UserSignupFormStep
									stepIndex={0}
									label={formatMessage({
										id: 'userSignup.step.username',
										defaultMessage: 'Username',
									})}
								>
									<MinUserSignupFormStepAccount />
								</UserSignupFormStep>
								<UserSignupFormStep
									stepIndex={1}
									label={formatMessage({
										id: 'userSignup.step.termsAndSubmit',
										defaultMessage: 'Terms and submit',
									})}
								>
									<UserSignupFormStepTermsAndSubmit />
								</UserSignupFormStep>
							</UserSignupFormStepper>
						</form>
					</FormProvider>
					<LoginPrompt>
						<FormattedMessage id="userSignup.loginPrompt.message" defaultMessage="Already have an account?" />
						<LoginPromptLink to="/v5/login">
							<FormattedMessage id="userSignup.loginPrompt.link" defaultMessage="Log in" />
						</LoginPromptLink>
					</LoginPrompt>
				</FormContainer>
			</Container>
		</AuthTemplate>
	);
};

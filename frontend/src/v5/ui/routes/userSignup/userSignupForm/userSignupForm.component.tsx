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
import { FormattedMessage } from 'react-intl';
import { registerNewUser } from '@/v5/services/api/signup';
import { formatMessage } from '@/v5/services/intl';
import {
	emailAlreadyExists,
	isInvalidArguments,
	usernameAlreadyExists,
} from '@/v5/validation/errors.helpers';
import { INewUser } from '@/v5/store/auth/auth.types';
import { omit } from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSignupSchemaAccount, UserSignupSchemaPersonal, UserSignupSchemaTermsAndSubmit } from '@/v5/validation/userSchemes/userSignupSchemes';
import { UserSignupFormStepAccount } from './userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.component';
import { UserSignupFormStepPersonal } from './userSignupFormStep/userSignupFormStepPersonal/userSignupFormStepPersonal.component';
import { UserSignupFormStepTermsAndSubmit } from './userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import {
	Container,
	Title,
	Underlined,
	LoginPrompt,
	LoginPromptLink,
} from './userSignupForm.styles';
import { UserSignupFormStep } from './userSignupFormStep/userSignupFormStep.component';
import { UserSignupWelcomeProps } from '../userSignupWelcome/userSignupWelcome.component';
import { UserSignupFormStepper, UserSignupFormStepperContextValue } from './userSignupFormStepper/userSignupFormStepper.component';

type UserSignupFormProps = {
	completeRegistration: (registrationCompleteData: UserSignupWelcomeProps) => void;
};

export const UserSignupForm = ({ completeRegistration }: UserSignupFormProps) => {
	const LAST_STEP = 2;
	const [alreadyExistingUsernames, setAlreadyExistingUsernames] = useState([]);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);

	const [contextValue, setContextValue] = useState<UserSignupFormStepperContextValue | null>();

	const DEFAULT_FIELDS = {
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
		company: '',
		countryCode: 'GB',
		termsAgreed: false,
		mailListAgreed: false,
	};

	let schema = null;

	switch (contextValue?.activeStep) {
		case 0:
			schema = UserSignupSchemaAccount;
			break;
		case 1:
			schema = UserSignupSchemaAccount.concat(UserSignupSchemaPersonal);
			break;
		default:
			schema = UserSignupSchemaAccount.concat(UserSignupSchemaPersonal).concat(UserSignupSchemaTermsAndSubmit);
			break;
	}

	const formData = useForm({
		resolver: yupResolver(schema),
		mode: 'all',
		defaultValues: DEFAULT_FIELDS,
		context: { alreadyExistingUsernames, alreadyExistingEmails },
	});

	const handleInvalidArgumentsError = (error) => {
		if (usernameAlreadyExists(error)) {
			setAlreadyExistingUsernames([...alreadyExistingUsernames, formData.getValues().username]);
			formData.trigger('username');
		} else if (emailAlreadyExists(error)) {
			setAlreadyExistingEmails([...alreadyExistingEmails, formData.getValues().email]);
			formData.trigger('email');
		} else return;

		contextValue.moveToStep(0);
		contextValue.setErroredStep(0);
	};

	const onSubmit = async (values) => {
		try {
			const newUser = omit(values, ['confirmPassword', 'termsAgreed']) as INewUser;
			newUser.email = newUser.email.trim();
			if (!values.company) delete newUser.company;
			await registerNewUser(newUser);
			const { email, firstName } = values;
			completeRegistration({ email, firstName });
		} catch (error) {
			if (isInvalidArguments(error)) {
				handleInvalidArgumentsError(error);
			}
		}
	};

	return (
		<Container>
			<Title>
				{contextValue?.activeStep < LAST_STEP ? (
					<FormattedMessage
						id="userSignup.title.middleStep"
						defaultMessage="Create your {free} account"
						values={{
							free: (
								<Underlined>
									<FormattedMessage id="userSignup.title.middleStep.free" defaultMessage="free" />
								</Underlined>
							),
						}}
					/>
				) : (
					<FormattedMessage id="userSignup.title.lastStep" defaultMessage="Almost there..." />
				)}
			</Title>
			<FormProvider {...formData}>
				<form onSubmit={formData.handleSubmit(onSubmit)}>
					<UserSignupFormStepper
						onContextUpdated={setContextValue}
					>
						<UserSignupFormStep
							stepIndex={0}
							label={formatMessage({ id: 'userSignup.step.account', defaultMessage: 'Account' })}
						>
							<UserSignupFormStepAccount />
						</UserSignupFormStep>
						<UserSignupFormStep
							stepIndex={1}
							label={formatMessage({ id: 'userSignup.step.personal', defaultMessage: 'Personal' })}
						>
							<UserSignupFormStepPersonal />
						</UserSignupFormStep>
						<UserSignupFormStep
							stepIndex={2}
							label={formatMessage({ id: 'userSignup.step.termsAndSubmit', defaultMessage: 'Terms and submit' })}
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
		</Container>
	);
};

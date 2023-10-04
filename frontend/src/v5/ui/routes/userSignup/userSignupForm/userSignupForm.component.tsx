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

import { useRef, useState } from 'react';
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
import { clientConfigService } from '@/v4/services/clientConfig';
import ReCAPTCHA from 'react-google-recaptcha';
import { UserSignupFormStepAccount } from './userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.component';
import { UserSignupFormStepPersonal } from './userSignupFormStep/userSignupFormStepPersonal/userSignupFormStepPersonal.component';
import { UserSignupFormStepTermsAndSubmit } from './userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import {
	Container,
} from './userSignupForm.styles';
import { UserSignupFormStep } from './userSignupFormStep/userSignupFormStep.component';
import { UserSignupWelcomeProps } from '../userSignupWelcome/userSignupWelcome.component';
import { UserSignupFormStepper, UserSignupFormStepperContextValue } from './userSignupFormStepper/userSignupFormStepper.component';

type UserSignupFormProps = {
	completeRegistration: (registrationCompleteData: UserSignupWelcomeProps) => void;
};

export const UserSignupForm = ({ completeRegistration }: UserSignupFormProps) => {
	const [alreadyExistingUsernames, setAlreadyExistingUsernames] = useState([]);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);
	const captchaRef = useRef<ReCAPTCHA>();
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { captcha_client_key } = clientConfigService;

	const [contextValue, setContextValue] = useState<UserSignupFormStepperContextValue | null>();

	const DEFAULT_FIELDS = {
		username: '',
		email: '',
		password: '',
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
			const newUser = omit(values, ['termsAgreed']) as INewUser;
			newUser.email = newUser.email.trim();
			captchaRef?.current?.reset();
			newUser.captcha = captcha_client_key ? await captchaRef.current.executeAsync() : 'CAPTCHA_IS_DISABLED';

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
					{captcha_client_key && (
						<ReCAPTCHA
							ref={captchaRef}
							size="invisible"
							sitekey={captcha_client_key}
						/>
					)}

				</form>
			</FormProvider>
		</Container>
	);
};

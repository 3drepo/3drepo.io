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
import { clientConfigService } from '@/v4/services/clientConfig';
import { formatMessage } from '@/v5/services/intl';
import { UserSignupSchemaSSO, UserSignupSchemaTermsAndSubmit } from '@/v5/validation/userSchemes/userSignupSchemes';
import { LogoContainer, BlueLogo } from '@components/authTemplate/authTemplate.styles';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { yupResolver } from '@hookform/resolvers/yup';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { pick } from 'lodash';
import { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { signup } from '@/v5/services/api/sso';
import { Background, Container, LogoHeightBalancer, UserSignupMain } from '../userSignup.styles';
import { Title, Container as FormContainer, LoginPrompt, LoginPromptLink } from '../userSignupForm/userSignupForm.styles';
import { UserSignupFormStep } from '../userSignupForm/userSignupFormStep/userSignupFormStep.component';
import { IconContainer } from '../userSignupForm/userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.styles';
import { UserSignupFormStepTermsAndSubmit } from '../userSignupForm/userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import { UserSignupFormStepper, UserSignupFormStepperContextValue } from '../userSignupForm/userSignupFormStepper/userSignupFormStepper.component';
import { NextStepButton } from '../userSignupForm/userSignupFormStep/userSignupFormNextButton/userSignupFormNextButton.component';

export interface IAccountFormInput {
	username: string;
	company: string;
	countryCode: string;
	termsAgreed: boolean;
	mailListAgreed: boolean;
}

export const UserSignupFormStepAccount = () => {
	const { formState: { errors } } = useFormContext();

	return (
		<>
			<FormTextField
				InputProps={{
					startAdornment: (
						<IconContainer>
							<UserIcon />
						</IconContainer>
					),
				}}
				name="username"
				label={formatMessage({
					id: 'userSignup.form.username',
					defaultMessage: 'Username',
				})}
				required
				formError={errors.username}
			/>

			<FormTextField
				name="company"
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				formError={errors.company}
			/>
			<FormSelect
				name="countryCode"
				label={formatMessage({
					id: 'userSignup.form.countryCode',
					defaultMessage: 'Country',
				})}
				required
			>
				{clientConfigService.countries.map((country) => (
					<MenuItem key={country.code} value={country.code}>
						{country.name}
					</MenuItem>
				))}
			</FormSelect>

			<NextStepButton>
				<FormattedMessage id="userSignup.form.button.next" defaultMessage="Next step" />
			</NextStepButton>
		</>
	);
};

export const UserSignupSSO = () => {
	const [contextValue, setContextValue] = useState<UserSignupFormStepperContextValue | null>();

	const DEFAULT_FIELDS: IAccountFormInput = {
		username: '',
		company: '',
		countryCode: 'GB',
		termsAgreed: false,
		mailListAgreed: false,
	};

	const onSubmit = async (values) => {
		try {
			const newUser = pick(values, ['username', 'company', 'countryCode', 'mailListAgreed']);
			if (!values.company) delete newUser.company;
			const res = await signup(newUser);
			return res;
		} catch (error) {
			// if (isInvalidArguments(error))
			// handleInvalidArgumentsError(error);
			// }
		}

		return null;
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

	return (
		<Container>
			<Background>
				<UserSignupMain>
					<LogoContainer>
						<BlueLogo />
					</LogoContainer>
					<LogoHeightBalancer />
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
										<UserSignupFormStepAccount />
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
				</UserSignupMain>
			</Background>
		</Container>
	);
};

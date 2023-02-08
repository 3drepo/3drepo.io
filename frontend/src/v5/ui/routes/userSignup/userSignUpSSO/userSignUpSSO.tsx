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
import { INewUser } from '@/v5/store/auth/auth.types';
import { usernameAlreadyExists, emailAlreadyExists, isInvalidArguments } from '@/v5/validation/errors.helpers';
import { UserSignupSchemaAccount } from '@/v5/validation/userSchemes/userSignupSchemes';
import { LogoContainer, BlueLogo } from '@components/authTemplate/authTemplate.styles';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { yupResolver } from '@hookform/resolvers/yup';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { defaults, isEqual, pick } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { Background, Container, LogoHeightBalancer, UserSignupMain } from '../userSignup.styles';
import { Title, Container as FormContainer, LoginPrompt, LoginPromptLink, Stepper } from '../userSignupForm/userSignupForm.styles';
import { UserSignupFormStep } from '../userSignupForm/userSignupFormStep/userSignupFormStep.component';
import { NextStepButton } from '../userSignupForm/userSignupFormStep/userSignupFormStep.styles';
import { IconContainer } from '../userSignupForm/userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.styles';
import { UserSignupFormStepTermsAndSubmit } from '../userSignupForm/userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import { signup } from '@/v5/services/api/sso';

export interface IAccountFormInput {
	username: string;
	company: string;
	countryCode: string;
}

type UserSignupFormStepAccountProps = {
	updateFields: (fields: any) => void;
	onSubmitStep: () => void;
	onComplete: () => void;
	onUncomplete: () => void;
	fields: IAccountFormInput;
	alreadyExistingUsernames: string[];
	alreadyExistingEmails: string[];
};

export const UserSignupFormStepAccount = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	fields,
	alreadyExistingUsernames,
	alreadyExistingEmails,
}: UserSignupFormStepAccountProps) => {
	const DEFAULT_FIELDS: IAccountFormInput = {
		username: '',
		company: '',
		countryCode: 'GB',
	};

	const getAccountFields = (): IAccountFormInput => defaults(
		pick(fields, ['username', 'company', 'countryCode']),
		DEFAULT_FIELDS,
	);

	const {
		getValues,
		trigger,
		control,
		formState,
		formState: { errors, isValid: formIsValid },
	} = useForm<IAccountFormInput>({
		mode: 'all',
		reValidateMode: 'onChange',
		resolver: yupResolver(UserSignupSchemaAccount),
		context: { alreadyExistingUsernames, alreadyExistingEmails },
		defaultValues: getAccountFields(),
	});

	useEffect(() => {
		if (formIsValid) {
			onComplete();
		} else {
			onUncomplete();
			if (alreadyExistingUsernames.length) trigger('username');
		}
	}, [formIsValid]);

	useEffect(() => {
		const newFields = getValues();
		if (!isEqual(newFields, getAccountFields())) {
			updateFields(newFields);
		}
	}, [formState]);

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
				control={control}
				label={formatMessage({
					id: 'userSignup.form.username',
					defaultMessage: 'Username',
				})}
				required
				formError={errors.username}
			/>

			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				formError={errors.company}
			/>
			<FormSelect
				name="countryCode"
				control={control}
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

			<NextStepButton disabled={!formIsValid} onClick={onSubmitStep}>
				<FormattedMessage id="userSignup.form.button.next" defaultMessage="Next step" />
			</NextStepButton>
		</>
	);
};

export const UserSignupSSO = () => {
	const LAST_STEP = 1;
	const [activeStep, setActiveStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState(new Set<number>());
	const [fields, setFields] = useState<any>({});
	const [alreadyExistingUsernames, setAlreadyExistingUsernames] = useState([]);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);
	const [erroredStep, setErroredStep] = useState<number>();
	const [formIsSubmitting, setFormIsSubmitting] = useState(false);

	const updateFields = (newFields) => setFields((prevFields) => ({ ...prevFields, ...newFields }));

	const addCompletedStep = (stepIndex: number) => {
		if (stepIndex === LAST_STEP) return;
		completedSteps.add(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const removeCompletedStep = (stepIndex: number) => {
		completedSteps.delete(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const canReachStep = (stepToReach: number): boolean => {
		// move to a previous step
		if (stepToReach <= activeStep) return true;
		// move to a next step iff the current step and the
		// ones up to the step to reach are completed
		for (let middleStep = activeStep; middleStep < stepToReach; middleStep++) {
			if (!completedSteps.has(middleStep)) {
				return false;
			}
		}
		return true;
	};

	const moveToStep = (stepToReach: number) => {
		if (canReachStep(stepToReach)) {
			setActiveStep(stepToReach);
			if (stepToReach > erroredStep) setErroredStep(null);
		}
	};

	const moveToNextStep = () => moveToStep(activeStep + 1);

	const handleInvalidArgumentsError = (error) => {
		if (usernameAlreadyExists(error)) {
			setAlreadyExistingUsernames([...alreadyExistingUsernames, fields.username]);
		} else if (emailAlreadyExists(error)) {
			setAlreadyExistingEmails([...alreadyExistingEmails, fields.email]);
		} else return;

		updateFields({ password: '', confirmPassword: '' });
		setActiveStep(0);
		setErroredStep(0);
		removeCompletedStep(LAST_STEP);
		updateFields({ termsAgreed: false, mailListAgreed: false });
	};

	const createAccount = async () => {
		try {
			setFormIsSubmitting(true);
			const newUser = pick(fields, ['username', 'company', 'countryCode', 'mailListAgreed']);
			if (!fields.company) delete newUser.company;
			const res = await signup(newUser);
			return res;
		} catch (error) {
			setFormIsSubmitting(false);
			if (isInvalidArguments(error)) {
				handleInvalidArgumentsError(error);
			} else {
				removeCompletedStep(LAST_STEP);
			}
		}

		return null;
	};

	const getStepProps = (stepIndex: number) => ({
		fields,
		updateFields,
		onSubmitStep: stepIndex < LAST_STEP ? moveToNextStep : createAccount,
		onComplete: () => addCompletedStep(stepIndex),
		onUncomplete: () => removeCompletedStep(stepIndex),
	});

	const getStepContainerProps = (stepIndex: number) => ({
		stepIndex,
		completedSteps,
		moveToStep,
		canReachStep,
		error: erroredStep === stepIndex,
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
						<form>
							<Stepper
								activeStep={activeStep}
								orientation="vertical"
							>
								<UserSignupFormStep
									{...getStepContainerProps(0)}
									label={formatMessage({
										id: 'userSignup.step.username',
										defaultMessage: 'Username',
									})}
								>
									<UserSignupFormStepAccount
										{...getStepProps(0)}
										alreadyExistingUsernames={alreadyExistingUsernames}
										alreadyExistingEmails={alreadyExistingEmails}
									/>
								</UserSignupFormStep>
								<UserSignupFormStep
									{...getStepContainerProps(1)}
									label={formatMessage({
										id: 'userSignup.step.termsAndSubmit',
										defaultMessage: 'Terms and submit',
									})}
								>
									<UserSignupFormStepTermsAndSubmit
										{...getStepProps(1)}
										formIsSubmitting={formIsSubmitting}
										isActiveStep={activeStep === LAST_STEP}
									/>
								</UserSignupFormStep>
							</Stepper>
						</form>
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

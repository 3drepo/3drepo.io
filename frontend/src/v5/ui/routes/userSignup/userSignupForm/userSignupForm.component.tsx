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

import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { registerNewUser } from '@/v5/services/api/signup';
import { formatMessage } from '@/v5/services/intl';
import {
	emailAlreadyExists,
	getRegistrationErrorMessage,
	isInvalidArguments,
	usernameAlreadyExists,
} from '@/v5/store/auth/auth.helpers';
import { INewUser } from '@/v5/store/auth/auth.types';
import { omit } from 'lodash';
import { UserSignupFormStepAccount } from './userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.component';
import { UserSignupFormStepPersonal } from './userSignupFormStep/userSignupFormStepPersonal/userSignupFormStepPersonal.component';
import { UserSignupFormStepTermsAndSubmit } from './userSignupFormStep/userSignupFormStepTermsAndSubmit/userSignupFormStepTermsAndSubmit.component';
import {
	Container,
	Title,
	Underlined,
	Stepper,
	LoginPrompt,
	LoginPromptLink,
} from './userSignupForm.styles';
import { UserSignupFormStep } from './userSignupFormStep/userSignupFormStep.component';
import { UserSignupWelcomeProps } from '../userSignupWelcome/userSignupWelcome.component';

type UserSignupFormProps = {
	completeRegistration: (registrationCompleteData: UserSignupWelcomeProps) => void;
};

export const UserSignupForm = ({ completeRegistration }: UserSignupFormProps) => {
	const LAST_STEP = 2;
	const [activeStep, setActiveStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState(new Set<number>());
	const [fields, setFields] = useState<any>({});
	const [alreadyExistingUsernames, setAlreadyExistingUsernames] = useState([]);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);
	const [hasUnexpectedError, setHasUnexpectedError] = useState(false);
	const [erroredStep, setErroredStep] = useState<number>();

	const updateFields = (newFields) => setFields((prevFields) => ({ ...prevFields, ...newFields }));

	const addCompletedStep = (stepIndex: number) => {
		if (stepIndex === LAST_STEP && hasUnexpectedError) return;
		completedSteps.add(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const removeCompletedStep = (stepIndex: number) => {
		completedSteps.delete(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const updateUnexpectedError = () => {
		setHasUnexpectedError(true);
		removeCompletedStep(LAST_STEP);
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

	const handleInvalidArgumentsError = (errorMessage: string) => {
		setHasUnexpectedError(false);
		if (usernameAlreadyExists(errorMessage)) {
			setAlreadyExistingUsernames([...alreadyExistingUsernames, fields.username]);
		} else if (emailAlreadyExists(errorMessage)) {
			setAlreadyExistingEmails([...alreadyExistingEmails, fields.email]);
		}
		updateFields({ password: '', confirmPassword: '' });
		setActiveStep(0);
		setErroredStep(0);
		removeCompletedStep(LAST_STEP);
		updateFields({ termsAgreed: false, mailListAgreed: false });
	};

	const createAccount = async () => {
		try {
			const newUser = omit(fields, ['confirmPassword', 'termsAgreed']) as INewUser;
			if (!fields.company) delete newUser.company;
			await registerNewUser(newUser);
			const { email, firstName } = fields;
			completeRegistration({ email, firstName });
		} catch (error) {
			const errorMessage = getRegistrationErrorMessage(error);
			if (isInvalidArguments(error)) {
				handleInvalidArgumentsError(errorMessage);
			} else {
				updateUnexpectedError();
			}
		}
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
			<Title>
				{activeStep < LAST_STEP ? (
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
			<form>
				<Stepper
					activeStep={activeStep}
					orientation="vertical"
				>
					<UserSignupFormStep
						{...getStepContainerProps(0)}
						label={formatMessage({
							id: 'userSignup.step.account',
							defaultMessage: 'Account',
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
							id: 'userSignup.step.personal',
							defaultMessage: 'Personal',
						})}
					>
						<UserSignupFormStepPersonal
							{...getStepProps(1)}
						/>
					</UserSignupFormStep>
					<UserSignupFormStep
						{...getStepContainerProps(2)}
						label={formatMessage({
							id: 'userSignup.step.termsAndSubmit',
							defaultMessage: 'Terms and submit',
						})}
					>
						<UserSignupFormStepTermsAndSubmit
							{...getStepProps(2)}
							hasUnexpectedError={hasUnexpectedError}
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
		</Container>
	);
};

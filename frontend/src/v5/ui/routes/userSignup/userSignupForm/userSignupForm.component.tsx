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
import { useHistory, useRouteMatch } from 'react-router-dom';
import { registerNewUser } from '@/v5/services/api/signup';
// import API from '@/v4/services/api';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { getRegistrationError, USER_ALREADY_EXISTS } from '@/v5/store/auth/auth.helpers';
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

export const UserSignupForm = () => {
	const LAST_STEP = 2;
	const [activeStep, setActiveStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState(new Set<number>());
	const [fields, setFields] = useState<any>({});
	const [alreadyExistingUsernames, setAlreadyExistingUsernames] = useState([]);
	const [unexpectedError, setUnexpectedError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const history = useHistory();
	const { path } = useRouteMatch();

	const addCompletedStep = (stepIndex: number) => {
		completedSteps.add(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const removeCompletedStep = (stepIndex: number) => {
		completedSteps.delete(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const canReachStep = (stepToReach: number): boolean => {
		return true;
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
		if (canReachStep(stepToReach)) setActiveStep(stepToReach);
	};

	const moveToNextStep = () => setActiveStep(activeStep + 1);

	const createAccount = async () => {
		try {
			setIsSubmitting(true);
			await registerNewUser(fields);
			const email = encodeURIComponent(fields.email);
			const firstname = encodeURIComponent(fields.firstname);
			history.push({
				pathname: `${path}/welcome`,
				search: `?email=${email}&firstname=${firstname}`,
			});
		} catch (error) {
			const errorMessage = getRegistrationError(error);
			if (errorMessage === USER_ALREADY_EXISTS) {
				setAlreadyExistingUsernames([...alreadyExistingUsernames, fields.username]);
				setFields(({ password, terms, ...prevFields }) => prevFields);
				setActiveStep(0);
			} else {
				setUnexpectedError(errorMessage);
			}
			setIsSubmitting(false);
		}
	};

	const updateFields = (newFields) => setFields((prevFields) => ({ ...prevFields, ...newFields }));

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
							isSubmitting={isSubmitting}
							unexpectedError={unexpectedError}
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

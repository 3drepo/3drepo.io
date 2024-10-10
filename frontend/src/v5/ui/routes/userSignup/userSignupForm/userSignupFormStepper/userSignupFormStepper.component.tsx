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

import { StepperProps } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Stepper } from '../userSignupForm.styles';

export interface UserSignupFormStepperContextValue {
	activeStep: number,
	erroredStep: number | null,
	completedSteps: Set<number>,
	moveToNextStep: () => void,
	setErroredStep: (stepIndex: number | null) => void,
	moveToStep: (stepIndex: number) => void,
	canReachStep: (stepIndex: number) => boolean,
}

const defaultValue: UserSignupFormStepperContextValue = {
	activeStep: 0,
	erroredStep: null,
	completedSteps: new Set(),
	moveToNextStep: () => {},
	setErroredStep: () => {},
	moveToStep: () => {},
	canReachStep: () => false,
};

export const UserSignupFormStepperContext = React.createContext(defaultValue);

export interface UserSignupFormStepperProps extends StepperProps {
	onContextUpdated?: (contextValue: UserSignupFormStepperContextValue) => void;
}

export const UserSignupFormStepper = ({ children, onSubmit, onContextUpdated, ...props }: UserSignupFormStepperProps) => {
	const [activeStep, setActiveStep] = useState(props.activeStep || 0);
	const [completedSteps, setCompletedSteps] = useState(new Set<number>());
	const [erroredStep, setErroredStep] = useState<number | null>();
	const LAST_STEP = (children as ReactNode[]).length - 1;

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

	const [contextValue, setContextValue] = useState<UserSignupFormStepperContextValue>({
		activeStep,
		completedSteps,
		erroredStep,
		moveToNextStep,
		moveToStep,
		setErroredStep,
		canReachStep,
	});

	const { formState: { isValid } } = useFormContext();

	const addCompletedStep = (stepIndex: number) => {
		if (stepIndex === LAST_STEP) return;
		completedSteps.add(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	const removeCompletedStep = (stepIndex: number) => {
		completedSteps.delete(stepIndex);
		setCompletedSteps(new Set(completedSteps));
	};

	useEffect(() => {
		if (isValid) {
			addCompletedStep(activeStep);
		} else {
			removeCompletedStep(activeStep);
		}
	}, [isValid]);

	useEffect(() => {
		const newContextValue = {
			activeStep,
			completedSteps,
			erroredStep,
			moveToNextStep,
			moveToStep,
			setErroredStep,
			canReachStep,
		};

		setContextValue(newContextValue);
		onContextUpdated?.(newContextValue);
	}, [activeStep, completedSteps, erroredStep]);

	return (
		<UserSignupFormStepperContext.Provider value={contextValue}>
			<Stepper orientation="vertical" {...props} activeStep={activeStep}>
				{children}
			</Stepper>
		</UserSignupFormStepperContext.Provider>
	);
};

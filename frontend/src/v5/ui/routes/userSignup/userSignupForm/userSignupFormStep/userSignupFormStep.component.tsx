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

import { StepContent, Step, StepProps } from '@mui/material';
import { StepLabel } from '../userSignupForm.styles';
import { UserSignupFormStepIcon } from './userSignupFormStepIcon/userSignupFormStepIcon.component';

type UserSignupFormStepProps = StepProps & {
	stepIndex: number;
	moveToStep: (stepIndex: number) => void;
	canReachStep: (stepIndex: number) => boolean;
	label: string;
	completedSteps: Set<number>;
	children: any;
	error?: boolean;
};

export const UserSignupFormStep = ({
	stepIndex,
	moveToStep,
	canReachStep,
	label,
	completedSteps,
	children,
	error,
	...props
}: UserSignupFormStepProps) => (
	<Step {...props}>
		<StepLabel
			error={error}
			onClick={() => moveToStep(stepIndex)}
			icon={(
				<UserSignupFormStepIcon
					stepIndex={stepIndex}
					completed={completedSteps.has(stepIndex)}
					error={error}
				/>
			)}
			$reachable={canReachStep(stepIndex)}
		>
			{label}
		</StepLabel>
		<StepContent>
			{children}
		</StepContent>
	</Step>
);

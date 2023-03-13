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

import { ButtonProps } from '@mui/material';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { UserSignupFormStepperContext } from '../../userSignupFormStepper/userSignupFormStepper.component';
import { NextStepButton as NextStepButtonBase } from '../userSignupFormStep.styles';

export const NextStepButton = (props: ButtonProps) => {
	const { moveToNextStep } = useContext(UserSignupFormStepperContext);
	const { formState: { isValid } } = useFormContext();

	return (<NextStepButtonBase onClick={moveToNextStep} disabled={!isValid} {...props} />);
};

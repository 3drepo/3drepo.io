/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useContext } from 'react';
import { Stepper, Container, ButtonsContainer, Button } from './calibrationHeader.styles';
import { Step, StepLabel } from '@mui/material';
import { Link, generatePath, useParams } from 'react-router-dom';
import { DRAWINGS_ROUTE, DashboardParams } from '@/v5/ui/routes/routes.constants';
import { CalibrationContext } from '../calibrationContext';

const STEPS = [
	'3D Calibration Points',
	'2D Calibration Points',
	'Vertical Spatial Boundaries',
	'Calibration Confirmation',
];

export const CalibrationHeader = () => {
	const { teamspace, project } = useParams<DashboardParams>();
	const { step, setStep, isStepValid } = useContext(CalibrationContext);
	const isLastStep = step === 3;

	const pathToDrawings = generatePath(DRAWINGS_ROUTE, { teamspace, project });

	return (
		<Container>
			<Stepper activeStep={step} alternativeLabel>
				{STEPS.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<ButtonsContainer>
				<Button onClick={() => setStep(step - 1)} disabled={step === 0}>
					Back
				</Button>
				<Button>
					<Link to={pathToDrawings}>
						Cancel
					</Link>
				</Button>
				{isLastStep ? (
					<Button disabled={!isStepValid}>
						<Link to={pathToDrawings}>
							Confirm
						</Link>
					</Button>
				) : (
					<Button onClick={() => setStep(step + 1)} disabled={!isStepValid}>
						Continue
					</Button>
				)}
			</ButtonsContainer>
		</Container>
	);
};

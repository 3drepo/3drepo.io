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
import { Stepper, Container, ButtonsContainer, ContrastButton, Connector, PrimaryButton, Link } from './calibrationHeader.styles';
import { Step, StepLabel } from '@mui/material';
import { CalibrationContext } from '../calibrationContext';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';

const STEPS = [
	formatMessage({ defaultMessage: '3D Calibration Points', id: 'calibration.step.3dCalibration' }),
	formatMessage({ defaultMessage: '2D Calibration Points', id: 'calibration.step.2dCalibration' }),
	formatMessage({ defaultMessage: 'Vertical Spatial Boundaries', id: 'calibration.step.verticalSpatialBoundaries' }),
];

export const CalibrationHeader = () => {
	const { step, setStep, isStepValid, origin } = useContext(CalibrationContext);
	const isLastStep = step === 2;

	return (
		<Container>
			<Stepper activeStep={step} alternativeLabel connector={<Connector />} >
				{STEPS.map((label) => (
					<Step key={label}>
						<StepLabel StepIconComponent={({ icon }) => icon}>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<ButtonsContainer>
				<ContrastButton onClick={() => setStep(step - 1)} disabled={step === 0}>
					<FormattedMessage defaultMessage="Back" id="calinration.button.back" />
				</ContrastButton>
				<ContrastButton>
					<Link to={origin}>
						<FormattedMessage defaultMessage="Cancel" id="calinration.button.cancel" />
					</Link>
				</ContrastButton>
				{isLastStep ? (
					<PrimaryButton disabled={!isStepValid}>
						<Link to={origin}>
							<FormattedMessage defaultMessage="Confirm" id="calinration.button.confirm" />
						</Link>
					</PrimaryButton>
				) : (
					<PrimaryButton onClick={() => setStep(step + 1)} disabled={!isStepValid}>
						<FormattedMessage defaultMessage="Continue" id="calinration.button.continue" />
					</PrimaryButton>
				)}
			</ButtonsContainer>
		</Container>
	);
};

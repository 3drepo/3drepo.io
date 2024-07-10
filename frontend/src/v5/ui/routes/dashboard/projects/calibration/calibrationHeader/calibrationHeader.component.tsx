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

import { useParams } from 'react-router-dom';
import { Stepper, Container, ButtonsContainer, ContrastButton, Connector, PrimaryButton, StepperWrapper } from './calibrationHeader.styles';
import { Step, StepLabel } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationState } from '@/v5/store/drawings/drawings.types';
import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { useContext } from 'react';
import { CalibrationContext } from '../calibrationContext';

const STEPS = [
	formatMessage({ defaultMessage: '3D Alignment', id: 'calibration.step.3dCalibration' }),
	formatMessage({ defaultMessage: '2D Alignment', id: 'calibration.step.2dCalibration' }),
	formatMessage({ defaultMessage: '2D Vertical Extents', id: 'calibration.step.verticalExtents' }),
];

export const CalibrationHeader = () => {
	const { teamspace, project, containerOrFederation } = useParams();
	const { step, setStep, isStepValid, endCalibration, vector3D, drawingId } = useContext(CalibrationContext);
	const selectedModel = FederationsHooksSelectors.selectFederationById(containerOrFederation)
		|| ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const isLastStep = step === 2;

	const getIsStepValid = () => {
		if (step === 0) return !!(vector3D[0] && vector3D[1]);
		return isStepValid;
	};

	const handleConfirm = () => {
		endCalibration();
		DrawingsActionsDispatchers.updateDrawing(teamspace, project, drawingId, {
			calibration: {
				state: CalibrationState.CALIBRATED,
				units: selectedModel.unit,
				horizontal: {
					model: vector3D,
					drawing: EMPTY_VECTOR,
				},
			},
		});
	};

	return (
		<Container>
			<StepperWrapper>
				<Stepper activeStep={step} alternativeLabel connector={<Connector />} >
					{STEPS.map((label) => (
						<Step key={label}>
							<StepLabel StepIconComponent={({ icon }) => icon}>{label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</StepperWrapper>
			<ButtonsContainer>
				{step > 0 && (
					<ContrastButton onClick={() => setStep(step - 1)}>
						<FormattedMessage defaultMessage="Back" id="calibration.button.back" />
					</ContrastButton>
				)}
				<ContrastButton onClick={endCalibration}>
					<FormattedMessage defaultMessage="Cancel" id="calibration.button.cancel" />
				</ContrastButton>
				{isLastStep ? (
					<PrimaryButton disabled={!getIsStepValid()} onClick={handleConfirm}>
						<FormattedMessage defaultMessage="Confirm" id="calibration.button.confirm" />
					</PrimaryButton>
				) : (
					<PrimaryButton onClick={() => setStep(step + 1)} disabled={!getIsStepValid()}>
						<FormattedMessage defaultMessage="Continue" id="calibration.button.continue" />
					</PrimaryButton>
				)}
			</ButtonsContainer>
		</Container>
	);
};

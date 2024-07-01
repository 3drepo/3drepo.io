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

import { useParams, generatePath } from 'react-router-dom';
import { Stepper, Container, ButtonsContainer, ContrastButton, Connector, PrimaryButton, Link } from './calibrationHeader.styles';
import { Step, StepLabel } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { CalibrationActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationState } from '@/v5/store/drawings/drawings.types';
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';
import { DRAWINGS_ROUTE } from '@/v5/ui/routes/routes.constants';

const STEPS = [
	formatMessage({ defaultMessage: '3D Calibration Points', id: 'calibration.step.3dCalibration' }),
	formatMessage({ defaultMessage: '2D Calibration Points', id: 'calibration.step.2dCalibration' }),
	formatMessage({ defaultMessage: 'Vertical Spatial Boundaries', id: 'calibration.step.verticalSpatialBoundaries' }),
];

export const CalibrationHeader = () => {
	const { teamspace, project } = useParams();
	const step = CalibrationHooksSelectors.selectStep();
	const isStepValid = CalibrationHooksSelectors.selectIsStepValid();
	const origin = CalibrationHooksSelectors.selectOrigin() || generatePath(DRAWINGS_ROUTE, { teamspace, project });
	const vector3D = CalibrationHooksSelectors.selectVector3D();
	const drawingId = CalibrationHooksSelectors.selectDrawingId();

	const isLastStep = step === 2;

	const getIsStepValid = () => {
		if (step === 0) return !!(vector3D.start && vector3D.end);
		return isStepValid;
	};

	const handleConfirm = () => DrawingsActionsDispatchers.updateDrawing(teamspace, project, drawingId, {
		calibration: CalibrationState.CALIBRATED,
		vector3D,
	});

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
				<ContrastButton onClick={() => CalibrationActionsDispatchers.setStep(step - 1)} disabled={step === 0}>
					<FormattedMessage defaultMessage="Back" id="calinration.button.back" />
				</ContrastButton>
				<ContrastButton>
					<Link to={origin}>
						<FormattedMessage defaultMessage="Cancel" id="calinration.button.cancel" />
					</Link>
				</ContrastButton>
				{isLastStep ? (
					<PrimaryButton disabled={!getIsStepValid()} onClick={handleConfirm}>
						<Link to={origin}>
							<FormattedMessage defaultMessage="Confirm" id="calinration.button.confirm" />
						</Link>
					</PrimaryButton>
				) : (
					<PrimaryButton onClick={() => CalibrationActionsDispatchers.setStep(step + 1)} disabled={!getIsStepValid()}>
						<FormattedMessage defaultMessage="Continue" id="calinration.button.continue" />
					</PrimaryButton>
				)}
			</ButtonsContainer>
		</Container>
	);
};

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

import { useContext, useEffect, useState } from 'react';
import { CalibrationContext } from '../calibrationContext';
import { SelectModelStep } from './steps/selectModelStep/selectModelStep.component';
import { generatePath, useHistory, useParams } from 'react-router';
import { CALIBRATION_ROUTE, CalibrationParams } from '@/v5/ui/routes/routes.constants';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { ContainerRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Calibration3DStep } from './steps/calibration3DStep/calibration3DStep.component';
import { Calibration2DStep } from './steps/calibration2DStep/calibration2DStep.component';
import { VerticalSpatialBoundariesStep } from './steps/verticalSpatialBoundariesStep/verticalSpatialBoundariesStep.component';
import { CalibrationConfirmationStep } from './steps/calibrationConfirmationStep/calibrationConfirmationStep.component';

export const CalibrationStep = () => {
	const { teamspace, project, drawing, containerOrFederation } = useParams<CalibrationParams>();
	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const history = useHistory();
	const { step } = useContext(CalibrationContext);
	const [modelId, setModelId] = useState('');

	useEffect(() => {
		if (step === 0) {
			history.replace(generatePath(CALIBRATION_ROUTE, { teamspace, project, drawing }));
		}

		if (step === 1 && !containerOrFederation) {
			if (selectedContainer) {
				ContainerRevisionsActionsDispatchers.fetch(teamspace, project, containerOrFederation);
			}
			history.replace(generatePath(CALIBRATION_ROUTE, {
				teamspace,
				project,
				drawing,
				containerOrFederation: modelId,
				revision: selectedContainer?.latestRevision,
			}));
		}
	}, [step]);

	return (
		<>
			{step === 0 && <SelectModelStep modelId={modelId} setModelId={setModelId} />}
			{step === 1 && <Calibration3DStep />}
			{step === 2 && <Calibration2DStep />}
			{step === 3 && <VerticalSpatialBoundariesStep />}
			{step === 4 && <CalibrationConfirmationStep />}
		</>
	);
};
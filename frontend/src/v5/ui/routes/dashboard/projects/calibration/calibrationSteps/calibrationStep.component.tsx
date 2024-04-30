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
import { SelectModelStep } from './selectModelStep/selectModelStep.component';
import { generatePath, useHistory, useParams } from 'react-router';
import { CALIBRATION_ROUTE, CalibrationParams } from '@/v5/ui/routes/routes.constants';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { MenuItem } from '@mui/material';
import { ContainerRevisionsHooksSelectors, ContainersHooksSelectors, DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormSelect } from '@controls/inputs/formInputs.component';
import { ContainerRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/store.helpers';

const AnyOtherSelectionStep = ({ text }) => {
	const { setIsStepValid, step } = useContext(CalibrationContext);

	useEffect(() => {
		setIsStepValid(false);
	}, [step]);

	return (
		<div>
			<button type='button' onClick={() => setIsStepValid(true)}>validate {text}</button>
		</div>
	);
};

const Calibration3DStep = () => {
	const { getValues } = useFormContext();
	const history = useHistory();
	const containerOrFederation = getValues('containerOrFederation');
	const { containerOrFederation: modelInUrl, teamspace, project } = useParams<CalibrationParams>();

	useEffect(() => {
		ContainerRevisionsActionsDispatchers.fetch(teamspace, project, containerOrFederation);
		if (!modelInUrl) {
			history.push(generatePath(CALIBRATION_ROUTE, { teamspace, project, containerOrFederation }));
		}
	}, []);

	return <AnyOtherSelectionStep text="3d calibration" />;
};

export const CalibrationStep = () => {
	const { teamspace, project, drawing, containerOrFederation } = useParams<CalibrationParams>();
	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const history = useHistory();
	const { step } = useContext(CalibrationContext);
	const [modelId, setModelId] = useState('');

	useEffect(() => {
		if (step === 0) {
			history.push(generatePath(CALIBRATION_ROUTE, { teamspace, project, drawing }));
		}

		if (step === 1 && !containerOrFederation) {
			if (selectedContainer) {
				ContainerRevisionsActionsDispatchers.fetch(teamspace, project, containerOrFederation);
			}
			history.push(generatePath(CALIBRATION_ROUTE, {
				teamspace,
				project,
				drawing,
				containerOrFederation: modelId,
				revision: selectedContainer?.latestRevision,
			}));
		}
	}, [step]);

	if (step === 0) return (<SelectModelStep modelId={modelId} setModelId={setModelId} />);

	if (step === 1) return (<Calibration3DStep />);
	if (step === 2) return (<AnyOtherSelectionStep text="2d calibration" />);
	if (step === 3) return (<AnyOtherSelectionStep text="vertical spatial boundaries" />);
	return (<AnyOtherSelectionStep text="calibration confirmation" />);
};
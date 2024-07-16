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

import { useContext, useEffect } from 'react';
import { CompareActionsDispatchers, ContainersActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams, generatePath } from 'react-router-dom';
import { ContainersHooksSelectors, DrawingsHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UnityUtil } from '@/globals/unity-util';
import { Calibration3DHandler } from './calibrationStep/calibration3DHandler/calibration3DHandler.component';
import { Calibration2DStep } from './calibrationStep/calibration2DStep/calibration2DStep.component';
import { ViewerCanvasesContext } from '../../../viewer/viewerCanvases.context';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { CalibrationContext } from './calibrationContext';
import { DRAWINGS_ROUTE } from '../../../routes.constants';
import { VerticalSpatialBoundariesHandler } from './calibrationStep/verticalSpatialBoundariesHandler/verticalSpatialBoundariesHandler.component';

export const CalibrationHandler = () => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const { setLeftPanelRatio, open2D } = useContext(ViewerCanvasesContext);
	const { step, drawingId, setVector3D, setVector2D, setOrigin, setStep, setIsCalibrating3D, origin, setVerticalPlanes } = useContext(CalibrationContext);
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const { horizontal, verticalRange } = DrawingsHooksSelectors.selectCalibration(drawingId, containerOrFederation);

	const isFed = modelIsFederation(containerOrFederation);
	const selectedModel = isFed
		? FederationsHooksSelectors.selectFederationById(containerOrFederation)
		: ContainersHooksSelectors.selectContainerById(containerOrFederation);

	useEffect(() => {
		setStep(0);
		setIsCalibrating3D(false);
	}, [selectedModel, revision, drawing]);

	useEffect(() => {
		setVector3D(horizontal.model);
		setVector2D(horizontal.drawing);
		setVerticalPlanes(verticalRange);
	}, [horizontal, verticalRange]);

	useEffect(() => {
		CompareActionsDispatchers.resetComponentState();
		if (isFed) {
			FederationsActionsDispatchers.fetchFederationSettings(teamspace, project, containerOrFederation);
		} else {
			ContainersActionsDispatchers.fetchContainerSettings(teamspace, project, containerOrFederation);
		}

		if (!origin) {
			setOrigin(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
		}

		return () => {
			UnityUtil.setCalibrationToolVector(null, null);
			UnityUtil.setCalibrationToolMode('None');
			setLeftPanelRatio(0.5);
			setOrigin('');
		};
	}, []);

	useEffect(() => {
		if (step < 2) {
			open2D(drawingId);
		} else {
			setLeftPanelRatio(1);
		}
	}, [step, drawingId]);

	return (
		<>
			{step === 0 && <Calibration3DHandler />}
			{step === 1 && <Calibration2DStep />}
			{step === 2 && <VerticalSpatialBoundariesHandler />}
		</>
	);
};

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
import { CompareActionsDispatchers, ContainersActionsDispatchers, DrawingsActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { ContainersHooksSelectors, DrawingsHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UnityUtil } from '@/globals/unity-util';
import { Calibration3DHandler } from './calibrationStep/calibration3DHandler/calibration3DHandler.component';
import { Calibration2DHandler } from './calibrationStep/calibration2DHandler/calibration2DHandler.component';
import { ViewerCanvasesContext } from '../../../viewer/viewerCanvases.context';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { CalibrationContext } from './calibrationContext';
import { VerticalSpatialBoundariesHandler } from './calibrationStep/verticalSpatialBoundariesHandler/verticalSpatialBoundariesHandler.component';
import { ViewerParams } from '../../../routes.constants';
import { viewerRoute } from '@/v5/services/routing/routing';
import { isNull } from 'lodash';

export const CalibrationHandler = () => {
	const { teamspace, project, revision, containerOrFederation } = useParams<ViewerParams>();
	const { setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const { step, drawingId, setVector3D, setVector2D, setOrigin, setStep, origin, setVerticalPlanes } = useContext(CalibrationContext);
	const { horizontal, verticalRange } = DrawingsHooksSelectors.selectCalibration(drawingId, containerOrFederation);

	const isFed = modelIsFederation(containerOrFederation);
	const selectedModel = isFed
		? FederationsHooksSelectors.selectFederationById(containerOrFederation)
		: ContainersHooksSelectors.selectContainerById(containerOrFederation);

	useEffect(() => {
		setStep(0);
	}, [selectedModel, revision, drawingId]);

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
			setOrigin(viewerRoute(teamspace, project, containerOrFederation, revision, { drawingId }, false));
		}

		if (verticalRange.some(isNull)) {
			DrawingsActionsDispatchers.fetchDrawingSettings(teamspace, project, drawingId);
		}

		return () => {
			UnityUtil.setCalibrationToolVector(null, null);
			UnityUtil.setCalibrationToolMode('None');
			setLeftPanelRatio(0.5);
			setOrigin('');
		};
	}, []);

	useEffect(() => {
		if (step === 2) {
			setLeftPanelRatio(1);
			return () => setLeftPanelRatio(.5);
		}
	}, [step]);

	return (
		<>
			{step === 0 && <Calibration3DHandler />}
			{step === 1 && <Calibration2DHandler />}
			{step === 2 && <VerticalSpatialBoundariesHandler />}
		</>
	);
};

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
import { useSearchParam } from '../../../useSearchParam';
import { CalibrationActionsDispatchers, CompareActionsDispatchers, ContainersActionsDispatchers, FederationsActionsDispatchers, TicketsCardActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { CalibrationHooksSelectors, ContainersHooksSelectors, DrawingsHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UnityUtil } from '@/globals/unity-util';
import { EMPTY_CALIBRATION } from '@/v5/store/calibration/calibration.constants';
import { Calibration3DHandler } from './calibrationStep/calibration3DHandler/calibration3DHandler.component';
import { Calibration2DStep } from './calibrationStep/calibration2DStep/calibration2DStep.component';
import { VerticalSpatialBoundariesStep } from './calibrationStep/verticalSpatialBoundariesStep/verticalSpatialBoundariesStep.component';
import { ViewerCanvasesContext } from '../../../viewer/viewerCanvases.context';
import { convertVectorUnits, getUnitsConvertionFactor } from '@/v5/store/calibration/calibration.helpers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';

export const CalibrationHandler = () => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [drawingId] = useSearchParam('drawingId');
	const { setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const step = CalibrationHooksSelectors.selectStep();

	const isFed = modelIsFederation(containerOrFederation);
	const selectedModel = isFed
		? FederationsHooksSelectors.selectFederationById(containerOrFederation)
		: ContainersHooksSelectors.selectContainerById(containerOrFederation);

	useEffect(() => {
		CalibrationActionsDispatchers.setStep(0);
		CalibrationActionsDispatchers.setIsCalibratingModel(false);
	}, [containerOrFederation, revision]);

	useEffect(() => {
		CalibrationActionsDispatchers.setStep(0);
		CalibrationActionsDispatchers.setIsCalibrating(true);
		ViewerGuiActionsDispatchers.resetPanels();
		TicketsCardActionsDispatchers.resetState();
		CompareActionsDispatchers.resetComponentState();

		return () => {
			CalibrationActionsDispatchers.setIsCalibrating(false);
			UnityUtil.setCalibrationToolVector(null, null);
			UnityUtil.setCalibrationToolMode('None');
			setLeftPanelRatio(0.5);
		};
	}, []);

	useEffect(() => {
		if (!drawing || !selectedModel) return;
		const convertionFactor = getUnitsConvertionFactor(drawing?.calibration.units, selectedModel.unit);
		const horizontalCalibration = drawing?.calibration?.horizontal || EMPTY_CALIBRATION.horizontal;
		CalibrationActionsDispatchers.setModelCalibration(convertVectorUnits(horizontalCalibration.model, convertionFactor));
		CalibrationActionsDispatchers.setDrawingCalibration(convertVectorUnits(horizontalCalibration.drawing, convertionFactor));
	}, [drawing, selectedModel]);

	useEffect(() => {
		if (isFed) {
			FederationsActionsDispatchers.fetchFederationSettings(teamspace, project, containerOrFederation);
		} else {
			ContainersActionsDispatchers.fetchContainerSettings(teamspace, project, containerOrFederation);
		}
	}, [drawingId]);

	return (
		<>
			{step === 0 && <Calibration3DHandler />}
			{step === 1 && <Calibration2DStep />}
			{step === 2 && <VerticalSpatialBoundariesStep />}
		</>
	);
};

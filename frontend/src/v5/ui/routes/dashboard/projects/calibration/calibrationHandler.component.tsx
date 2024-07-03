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
import { Transformers, useSearchParam } from '../../../useSearchParam';
import { CalibrationActionsDispatchers, CompareActionsDispatchers, TicketsCardActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { CalibrationHooksSelectors, DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UnityUtil } from '@/globals/unity-util';
import { EMPTY_CALIBRATION } from '@/v5/store/calibration/calibration.constants';
import { Calibration3DHandler } from './calibrationStep/calibration3DHandler/calibration3DHandler.component';
import { Calibration2DStep } from './calibrationStep/calibration2DStep/calibration2DStep.component';
import { VerticalSpatialBoundariesStep } from './calibrationStep/verticalSpatialBoundariesStep/verticalSpatialBoundariesStep.component';
import { ViewerCanvasesContext } from '../../../viewer/viewerCanvases.context';

export const CalibrationHandler = () => {
	const { revision, containerOrFederation } = useParams();
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [drawingId] = useSearchParam('drawingId');
	const { setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const step = CalibrationHooksSelectors.selectStep();

	useEffect(() => {
		CalibrationActionsDispatchers.setIsStepValid(false);
		CalibrationActionsDispatchers.setStep(0);
		CalibrationActionsDispatchers.setIsCalibratingModel(false);
		UnityUtil.setCalibrationToolMode('Vector');
	}, [containerOrFederation, revision, isCalibrating]);

	useEffect(() => {
		CalibrationActionsDispatchers.setIsCalibrating(isCalibrating);
		if (isCalibrating) {
			ViewerGuiActionsDispatchers.resetPanels();
			TicketsCardActionsDispatchers.resetState();
			CompareActionsDispatchers.resetComponentState();
		} else {
			UnityUtil.setCalibrationToolMode('None');
			UnityUtil.setCalibrationToolVector(null, null);
		}
	}, [isCalibrating]);

	useEffect(() => {
		const horizontalCalibration = drawing?.calibration?.horizontal || EMPTY_CALIBRATION.horizontal;
		CalibrationActionsDispatchers.setModelCalibration(horizontalCalibration.model);
		CalibrationActionsDispatchers.setDrawingCalibration(horizontalCalibration.drawing);
		CalibrationActionsDispatchers.setDrawingId(drawingId);
	}, [drawing]);

	useEffect(() => {
		if (step < 2) {
			UnityUtil.setCalibrationToolMode('Vector');
			setLeftPanelRatio(.5);
		} else {
			UnityUtil.setCalibrationToolMode('None');
			setLeftPanelRatio(1);
		}
	}, [step]);

	return (
		<>
			{step === 0 && <Calibration3DHandler />}
			{step === 1 && <Calibration2DStep />}
			{step === 2 && <VerticalSpatialBoundariesStep />}
		</>
	);
};

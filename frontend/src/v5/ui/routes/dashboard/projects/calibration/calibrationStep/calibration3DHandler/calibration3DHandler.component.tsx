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
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { UnityUtil } from '@/globals/unity-util';
import { CalibrationActionsDispatchers, TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEqual } from 'lodash';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';

export const Calibration3DHandler = () => {
	const isCalibratingModel = CalibrationHooksSelectors.selectIsCalibratingModel();
	const modelCalibration = CalibrationHooksSelectors.selectModelCalibration();
	const { setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const [lastPickedPoint, setLastPickedPoint] = useState(null);

	useEffect(() => {
		if (isCalibratingModel) {
			const onPickPoint = ({ position }) => setLastPickedPoint(position);
			TreeActionsDispatchers.stopListenOnSelections();
			UnityUtil.enableSnapping();
			Viewer.on(VIEWER_EVENTS.PICK_POINT, onPickPoint);

			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				UnityUtil.disableSnapping();
				Viewer.off(VIEWER_EVENTS.PICK_POINT, onPickPoint);
			};
		}
	}, [isCalibratingModel]);

	useEffect(() => {
		if (!lastPickedPoint) return;

		const [start, end] = modelCalibration;

		if (end || !start) {
			CalibrationActionsDispatchers.setModelCalibration([lastPickedPoint, null]);
		} else if (!isEqual(start, lastPickedPoint)) {
			CalibrationActionsDispatchers.setModelCalibration([start, lastPickedPoint]);
		}
	}, [lastPickedPoint]);

	useEffect(() => {
		Viewer.isModelReady().then(() => UnityUtil.setCalibrationToolVector(...modelCalibration));
	}, [modelCalibration]);

	useEffect(() => {
		UnityUtil.setCalibrationToolMode('Vector');
		setLeftPanelRatio(.5);

		return () => {
			CalibrationActionsDispatchers.setIsCalibratingModel(false);
		};
	}, []);

	return null;
};
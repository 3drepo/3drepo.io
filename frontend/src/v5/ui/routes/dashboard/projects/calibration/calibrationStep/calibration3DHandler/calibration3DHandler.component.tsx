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

import { useEffect, useState } from 'react';
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { UnityUtil } from '@/globals/unity-util';
import { CalibrationActionsDispatchers, TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationHooksSelectors, DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEqual } from 'lodash';
import { EMPTY_VECTOR } from '@/v5/store/calibration/calibration.constants';

export const Calibration3DHandler = () => {
	const step = CalibrationHooksSelectors.selectStep();
	const isCalibrating3D = CalibrationHooksSelectors.selectIsCalibrating3D();
	const vector3D = CalibrationHooksSelectors.selectVector3D();
	const drawingId = CalibrationHooksSelectors.selectDrawingId(); 
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const [lastPickedPoint, setLastPickedPoint] = useState(null);

	const resetVector3D = () => CalibrationActionsDispatchers.setVector3D(drawing?.vector3D || EMPTY_VECTOR);

	useEffect(() => {
		if (isCalibrating3D) {
			const onPickPoint = ({ position }) => setLastPickedPoint(position);
			TreeActionsDispatchers.stopListenOnSelections();
			UnityUtil.enableSnapping();
			Viewer.on(VIEWER_EVENTS.PICK_POINT, onPickPoint);

			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				UnityUtil.disableSnapping();
				Viewer.off(VIEWER_EVENTS.PICK_POINT, onPickPoint);
			};
		} else if (!vector3D.end) {
			resetVector3D();
		}
	}, [isCalibrating3D]);

	useEffect(() => {
		const { start, end } = vector3D;

		if (end || !start) {
			CalibrationActionsDispatchers.setVector3D({ start: lastPickedPoint, end: null });
		} else if (!isEqual(start, lastPickedPoint)) {
			CalibrationActionsDispatchers.setVector3D({ start, end: lastPickedPoint });
		}
	}, [lastPickedPoint]);

	useEffect(() => {
		UnityUtil.setCalibrationToolVector(vector3D.start, vector3D.end);
	}, [vector3D]);

	useEffect(() => {
		UnityUtil.setCalibrationToolMode('Vector');
		return () => {
			UnityUtil.setCalibrationToolMode('None');
			CalibrationActionsDispatchers.setIsCalibrating3D(false);
		};
	}, []);

	useEffect(() => {
		if (step !== 0) {
			CalibrationActionsDispatchers.setIsCalibrating3D(false);
		}
	}, [step]);

	useEffect(() => { resetVector3D(); }, []);

	return null;
};
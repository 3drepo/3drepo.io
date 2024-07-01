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
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { UnityUtil } from '@/globals/unity-util';
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationContext } from '../../calibrationContext';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEqual } from 'lodash';

export const Calibration3DHandler = () => {
	const { step, drawingId, isCalibrating3D, setIsCalibrating3D, vector3D, setVector3D, resetVector3D } = useContext(CalibrationContext);
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);

	const onPickPoint = ({ position }) => setVector3D(({ start, end }) => {
		if (!start || (start && end)) {
			return { start: position, end: null };
		}
		if (!isEqual(start, position)) {
			return { start, end: position };
		}
		return { start, end };
	});


	useEffect(() => {
		UnityUtil.setCalibrationToolVector(vector3D.start, vector3D.end);
	}, [vector3D]);

	useEffect(() => {
		if (isCalibrating3D) {
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
		UnityUtil.setCalibrationToolMode('Vector');
		return () => {
			UnityUtil.setCalibrationToolMode('None');
			setIsCalibrating3D(false);
		};
	}, []);

	useEffect(() => {
		if (step !== 0) {
			setIsCalibrating3D(false);
		}
	}, [step]);

	useEffect(() => { resetVector3D(); }, [drawing]);

	return null;
};
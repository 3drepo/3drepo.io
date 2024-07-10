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
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { isEqual } from 'lodash';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { CalibrationContext } from '../../calibrationContext';

export const Calibration3DHandler = () => {
	const { isCalibrating3D, setIsCalibrating3D, vector3D, setVector3D } = useContext(CalibrationContext);
	const { setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const [lastPickedPoint, setLastPickedPoint] = useState(null);

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
		}
	}, [isCalibrating3D]);

	useEffect(() => {
		if (!lastPickedPoint) return;

		const [start, end] = vector3D;

		if (end || !start) {
			setVector3D([lastPickedPoint, null]);
		} else if (!isEqual(start, lastPickedPoint)) {
			setVector3D([start, lastPickedPoint]);
		}
	}, [lastPickedPoint]);

	useEffect(() => {
		Viewer.isModelReady().then(() => UnityUtil.setCalibrationToolVector(...vector3D));
	}, [vector3D]);

	useEffect(() => {
		UnityUtil.setCalibrationToolMode('Vector');
		setLeftPanelRatio(.5);

		return () => {
			setIsCalibrating3D(false);
		};
	}, []);

	return null;
};
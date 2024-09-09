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

import { useContext, useEffect, useRef } from 'react';
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getDrawingImageSrc } from '@/v5/store/drawings/revisions/drawingRevisions.helpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType, Vector1D } from '../../calibration.types';
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getTransformationMatrix } from '../../calibration.helpers';
import { Vector2 } from 'three';
import { isNull } from 'lodash';
import { COLOR, hexToOpacity } from '@/v5/ui/themes/theme';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';

export const VerticalSpatialBoundariesHandler = () => {
	const { verticalPlanes, setVerticalPlanes, vector3D, vector2D, isCalibratingPlanes, setIsCalibratingPlanes, drawingId,
		setSelectedPlane, selectedPlane, isAlignPlaneActive } = useContext(CalibrationContext);
	const { teamspace, project } = useParams<ViewerParams>();
	const latestActiveRevision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawingId);
	const planesRef = useRef(verticalPlanes); // ref needed to get plane values in useEffect without causing excessive retriggers
	const planesAreSet = !verticalPlanes.some(isNull);
	
	const applyImageToPlane = () => {
		const i = new Image();
		i.crossOrigin = 'anonymous';
		i.src = getDrawingImageSrc(teamspace, project, drawingId, latestActiveRevision._id);
		const tMatrix = getTransformationMatrix(vector2D, vector3D);
		i.onload = () => {
			const topLeft = new Vector2(0, 0);
			const bottomRight = new Vector2(i.naturalWidth, i.naturalHeight); // coord origin for drawing is at the top left
			const bottomLeft = new Vector2(0, bottomRight.y);
			// transform points with transformation matrix
			[bottomLeft, bottomRight, topLeft].map((corner) => corner.applyMatrix3(tMatrix));
	
			Viewer.setCalibrationToolDrawing(i, [...bottomLeft, ...bottomRight, ...topLeft]);
			Viewer.setCalibrationToolSelectedColors(hexToOpacity(COLOR.PRIMARY_MAIN_CONTRAST, 40), COLOR.PRIMARY_MAIN);
			Viewer.setCalibrationToolUnselectedColors(hexToOpacity(COLOR.PRIMARY_MAIN_CONTRAST, 10), COLOR.PRIMARY_MAIN_CONTRAST);
			Viewer.setCalibrationToolOcclusionOpacity(0.5);
		};
	};

	useEffect(() => {
		planesRef.current = verticalPlanes;
	}, [verticalPlanes]);
	
	useEffect(() => {
		if (isCalibratingPlanes) {
			Viewer.setCalibrationToolMode(planesAreSet ? 'Vertical' : 'None');
			Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			return () => {
				Viewer.setCalibrationToolMode('None');
				Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
				Viewer.clipToolDelete();
			};
		}
	}, [isCalibratingPlanes, planesAreSet]);

	useEffect(() => {
		if (!planesAreSet) {
			const onClickFloorToObject = ({ account, model, id }) => {
				Viewer.setCalibrationToolFloorToObject(account, model, id);
				setSelectedPlane(PlaneType.UPPER);
			};
			TreeActionsDispatchers.stopListenOnSelections();
			Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, onClickFloorToObject);
			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED, onClickFloorToObject);
			};
		}
	}, [planesAreSet]);

	useEffect(() => {
		if (isAlignPlaneActive && planesAreSet) {
			const onClickPlaneToPoint = ({ position }) => {
				const zCoord = position[1];
				const newValues = planesRef.current.map((oldValue, idx) => {
					if ((selectedPlane === PlaneType.LOWER && idx === 0) ||
						(selectedPlane === PlaneType.UPPER && idx === 1)) return zCoord;
					return oldValue;
				}) as Vector1D;
				if (newValues[0] > newValues[1]) return; // lower plane cannot exceed upper plane
				Viewer.setCalibrationToolVerticalPlanes(newValues[0], newValues[1]);
				setVerticalPlanes(newValues);
			};
			TreeActionsDispatchers.stopListenOnSelections();
			Viewer.on(VIEWER_EVENTS.PICK_POINT, onClickPlaneToPoint);
			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				Viewer.off(VIEWER_EVENTS.PICK_POINT, onClickPlaneToPoint);
			};
		}
	}, [isAlignPlaneActive, selectedPlane, planesAreSet]);

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER) {
			Viewer.selectCalibrationToolLowerPlane();
		} else if (selectedPlane === PlaneType.UPPER) {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);
	
	useEffect(() => {
		applyImageToPlane();
		setIsCalibratingPlanes(true);
		Viewer.setCalibrationToolVerticalPlanes(...verticalPlanes);

		return () => {
			Viewer.setCalibrationToolDrawing(null, [0, 0, 1, 0, 0, 1]);
			setIsCalibratingPlanes(false);
		};
	}, []);

	return null;
};

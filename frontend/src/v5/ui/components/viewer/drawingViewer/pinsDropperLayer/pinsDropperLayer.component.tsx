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
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { useContext, useRef } from 'react';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { Coord2D, ViewBoxType } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { addZ } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';
import { DrawingViewerService } from '../drawingViewer.service';
import { Container } from './pinsDropperLayer.styles';
import { isEqual } from 'lodash';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

type PinsDropperLayerProps = { getCursorOffset: (e) => Coord2D, viewBox: ViewBoxType };
export const PinsDropperLayer = ({ getCursorOffset, viewBox }: PinsDropperLayerProps) => {
	const previousViewBox = useRef<ViewBoxType>(null);
	const [drawingId] = useSearchParam('drawingId');
	const { isCalibrating } = useContext(CalibrationContext);
	const { containerOrFederation } = useParams<ViewerParams>();
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2Dto3D(drawingId, containerOrFederation);
	const { verticalRange } = DrawingsHooksSelectors.selectCalibration(drawingId, containerOrFederation);

	if (isCalibrating || !transform2DTo3D) return null;

	const handleMouseDown = () => previousViewBox.current = viewBox;

	const handleMouseUp = (e) => {
		// check mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;

		e.stopPropagation();
		const { x, y } = transform2DTo3D(getCursorOffset(e));
		const pin3D = addZ([x, y], verticalRange[0]);
		DrawingViewerService.emitPickPointEvent(pin3D);
	};

	return (<Container onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />);
};
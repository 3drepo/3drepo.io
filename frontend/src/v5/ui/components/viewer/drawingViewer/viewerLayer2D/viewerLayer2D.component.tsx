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

import { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { Container, LayerLevel, Viewport } from './viewerLayer2D.styles';
import { isEqual } from 'lodash';
import { SnapCursor } from './snapCursor/snapCursor.component';
import { Coord2D, ViewBoxType } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { SVGSnapHelper } from '../snapping/svgSnapHelper';
import { Vector2 } from 'three';
import { SnapType, ISnapHelper } from '../snapping/types';
import { DrawingViewerService } from '../drawingViewer.service';
import { CalibrationArrow } from './calibrationArrow/calibrationArrow.component';
import { useSnapping } from '../drawingViewer.service.hooks';
import { PinsLayer } from '../pinsLayer/pinsLayer.component';
import { CameraOffSight } from './camera/cameraOffSight.component';
import { Camera } from './camera/camera.component';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { addZ } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';

type ViewerLayer2DProps = {
	viewBox: ViewBoxType,
	viewport: any, 
	snapHandler: ISnapHelper,
	snapping?: boolean,
};

const snap = (mousePos:Coord2D, snapHandler: ISnapHelper, radius) => {
	const results = snapHandler?.snap(new Vector2(...mousePos), radius) || { closestNode: undefined, closestIntersection: undefined, closestEdge: undefined };
	let snapType = SnapType.NONE;

	if (!!results.closestNode) {
		snapType = SnapType.NODE;
		mousePos = [results.closestNode.x, results.closestNode.y];
	} else if (!!results.closestIntersection) {
		snapType = SnapType.INTERSECTION;
		mousePos = [results.closestIntersection.x, results.closestIntersection.y];
	} else if (!!results.closestEdge) {
		snapType = SnapType.EDGE;
		mousePos = [results.closestEdge.x, results.closestEdge.y];
	} 
	return {
		mousePos,
		snapType,
	};
};

export const ViewerLayer2D = ({ viewBox, snapHandler, viewport }: ViewerLayer2DProps) => {
	const { isCalibrating } = useContext(CalibrationContext);
	const previousViewBox = useRef<ViewBoxType>(null);

	const [cameraOnSight, setCameraOnSight] = useState(false);
	const [snapType, setSnapType] = useState<SnapType>(SnapType.NONE);
	const snapping = useSnapping();

	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams<ViewerParams>();
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2DTo3D(drawingId, containerOrFederation);
	const verticalRange = DrawingsHooksSelectors.selectCalibrationVertical(drawingId, containerOrFederation);

	const offsetRef = useRef<{ x, y }>({ x: viewBox.x, y: viewBox.y });
	const containerStyle: CSSProperties = {
		transformOrigin: '0 0',
		transform: `matrix(${viewBox.scale}, 0, 0, ${viewBox.scale}, ${viewBox.x}, ${viewBox.y})`,
		width: `${viewBox.width}px`,
		height: `${viewBox.height}px`,
	};

	const handleMouseDown = () => previousViewBox.current = viewBox;

	const getCursorOffset = (e) => {
		const rect = e.target.getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;
		let mousePosition = [offsetX, offsetY].map((point) => point / viewBox.scale) as Coord2D;

		if (snapping) {
			const radius = 10 / viewBox.scale;
			const res = snap(mousePosition, snapHandler, radius);
			mousePosition = res.mousePos;

			if (snapType !== res.snapType) {
				setSnapType(res.snapType);
			}
		}

		return mousePosition;
	};

	const handleMouseUp = (e) => {
		// check if mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;
		let mousePosition = getCursorOffset(e);
		DrawingViewerService.emitMouseClickEvent(mousePosition);

		if (transform2DTo3D) {
			const { x, y } = transform2DTo3D(getCursorOffset(e));
			const pin3D = addZ([x, y], verticalRange[0]);
			DrawingViewerService.emitClickPointEvent(pin3D);
		}

	};

	const handleMouseMove = (e) => {
		let mousePos = getCursorOffset(e);
		DrawingViewerService.setMousePosition(mousePos);
	};

	const handleMouseLeave = () => DrawingViewerService.setMousePosition(undefined);

	useEffect(() => {
		DrawingViewerService.setScale(viewBox.scale);
		offsetRef.current = { x: viewBox.x, y: viewBox.y };
	}, [viewBox]);

	return (
		<Viewport>
			<Container style={containerStyle} id="viewerLayer2d" >
				<LayerLevel>
					{snapping && <SnapCursor snapType={snapType} />}
					{isCalibrating && <CalibrationArrow />}

					{!isCalibrating && (<>
						{cameraOnSight && <Camera scale={viewBox.scale} offsetRef={offsetRef} />}
						<PinsLayer scale={viewBox.scale} height={viewBox.height} width={viewBox.width} />
					</>)}
				</LayerLevel>
				{snapping && <LayerLevel
					onMouseUp={handleMouseUp}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				/>}
			</Container>
			{!isCalibrating && <CameraOffSight onCameraSightChanged={setCameraOnSight} viewbox={viewBox} viewport={viewport}/>}
		</Viewport>
	);
};
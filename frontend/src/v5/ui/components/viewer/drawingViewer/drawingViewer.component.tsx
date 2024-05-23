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

import { formatMessage } from '@/v5/services/intl';
import { ToolbarButton } from '@/v5/ui/routes/viewer/toolbar/buttons/toolbarButton.component';
import { ToolbarContainer, MainToolbar } from '@/v5/ui/routes/viewer/toolbar/toolbar.styles';
import { useEffect, useRef, useState } from 'react';
import ZoomOutIcon from '@assets/icons/viewer/zoom_out.svg';
import ZoomInIcon from '@assets/icons/viewer/zoom_in.svg';

import { PanZoomHandler, centredPanZoom } from './panzoom/centredPanZoom';
import { DrawingViewerContainer } from './drawingViewer.styles';
import { Events } from './panzoom/panzoom';
import { DrawingViewerImage } from './drawingViewerImage/drawingViewerImage.component';
import CalibrationIcon from '@assets/icons/filled/calibration-filled.svg';
import { ViewBoxType } from './viewerLayer2D/viewerLayer2D.component';

const DEFAULT_VIEWBOX = { scale: 1, x: 0, y: 0, width: 0, height: 0 };
export const DrawingViewer = () => {
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [viewBox, setViewBox] = useState<ViewBoxType>(DEFAULT_VIEWBOX);
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);
	const [isDrawingVector, setIsDrawingVector] = useState(true);

	const imgRef = useRef<HTMLImageElement>();

	const onClickZoomIn = () => {
		zoomHandler.zoomIn();
	};

	const onClickZoomOut = () => {
		zoomHandler.zoomOut();
	};

	const onImageLoad = () => {
		if (zoomHandler) {
			zoomHandler.dispose();
		}

		const pz = centredPanZoom(imgRef.current, 20, 20);
		setZoomHandler(pz);
	};

	const onCalibrationClick = () => setIsDrawingVector(!isDrawingVector);

	// eslint-disable-next-line
	const onDrawArrow = (arrow) => {
		
	};

	useEffect(() => {
		if (!zoomHandler) return;
		zoomHandler.on(Events.transform, () => {
			const transform = zoomHandler.getTransform();
			const { scale } = transform;
			const cantZoomOut = zoomHandler.getMinZoom() >= scale;
			const cantZoomIn = zoomHandler.getMaxZoom() <= scale;
			setIsMinZoom(cantZoomOut);
			setIsMaxZoom(cantZoomIn);
			setViewBox({ ...transform, ...zoomHandler.getOriginalSize() });
		});
	}, [zoomHandler]);

	return (
		<DrawingViewerContainer id="viewer">
			<DrawingViewerImage
				ref={imgRef}
				onLoad={onImageLoad}
				onDrawArrow={onDrawArrow}
				isDrawing={isDrawingVector}
				viewBox={viewBox}
			/>
			<ToolbarContainer>
				<MainToolbar>
					<ToolbarButton
						Icon={CalibrationIcon}
						onClick={onCalibrationClick}
						title={formatMessage({ id: 'drawingViewer.toolbar.calibrate', defaultMessage: 'Calibrate' })}
						selected={isDrawingVector}
					/>
					<ToolbarButton
						Icon={ZoomOutIcon}
						onClick={onClickZoomOut}
						disabled={isMinZoom}
						title={formatMessage({ id: 'drawingViewer.toolbar.zoomOut', defaultMessage: 'Zoom out' })}
					/>
					<ToolbarButton
						Icon={ZoomInIcon}
						onClick={onClickZoomIn}
						disabled={isMaxZoom}
						title={formatMessage({ id: 'drawingViewer.toolbar.zoomIn', defaultMessage: 'Zoom in' })}
					/>
				</MainToolbar>
			</ToolbarContainer>
		</DrawingViewerContainer>
	);
};
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
import { useContext, useRef, useState } from 'react';
import ZoomOutIcon from '@assets/icons/viewer/zoom_out.svg';
import ZoomInIcon from '@assets/icons/viewer/zoom_in.svg';

import { PanZoomHandler, centredPanZoom } from './panzoom/centredPanZoom';
import { ViewerContainer } from '@/v4/routes/viewer3D/viewer3D.styles';
import { ImageContainer } from './viewer2D.styles';
import { Events } from './panzoom/panzoom';
import { DrawingViewerImage } from './drawingViewerImage/drawingViewerImage.component';
import { CloseButton } from '@controls/button/closeButton/closeButton.component';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { DrawingViewerService } from './drawingViewer.service';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';

export const Viewer2D = () => {
	const { close2D } = useContext(ViewerCanvasesContext);
	const { isCalibrating } = useContext(CalibrationContext);
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);

	const imgRef = useRef<HTMLImageElement | SVGSVGElement>();
	const imgContainerRef = useRef();

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

		DrawingViewerService.setImgContainer(imgContainerRef.current);

		const pz = centredPanZoom(imgRef.current, 20, 20);
		setZoomHandler(pz);
		pz.on(Events.transform, () => {
			const cantZoomOut = pz.getMinZoom() >= pz.getTransform().scale;
			const cantZoomIn = pz.getMaxZoom() <= pz.getTransform().scale;
			setIsMinZoom(cantZoomOut);
			setIsMaxZoom(cantZoomIn);
		});
	};

	return (
		<ViewerContainer visible>
			{!isCalibrating && <CloseButton variant="secondary" onClick={close2D} />}
			<ImageContainer ref={imgContainerRef}>
				<DrawingViewerImage ref={imgRef} onLoad={onImageLoad} />
			</ImageContainer>
			<ToolbarContainer>
				<MainToolbar>
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
		</ViewerContainer>
	);
};
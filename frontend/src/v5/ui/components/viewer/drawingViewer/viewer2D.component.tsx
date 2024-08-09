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
import { useContext, useEffect, useRef, useState } from 'react';
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
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { SVGImage } from './svgImage/svgImage.component';
import { CentredContainer } from '@controls/centredContainer/centredContainer.component';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { isFirefox } from '@/v5/helpers/browser.helper';
import { ZoomableImage } from './zoomableImage.types';
import { SVGSnap } from './snapping/svg/svgSnap';
import { Vector2 } from './snapping/svg/types';

export const Viewer2D = () => {
	const [drawingId] = useSearchParam('drawingId');
	const src = getDrawingImageSrc(drawingId);

	const { close2D } = useContext(ViewerCanvasesContext);
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);
	const [isLoading, setIsLoading] = useState(false);


	const imgRef = useRef<ZoomableImage>();
	const imgContainerRef = useRef();



	const onClickZoomIn = () => {
		zoomHandler.zoomIn();
	};

	const onClickZoomOut = () => {
		zoomHandler.zoomOut();
	};

	const onImageLoad = () => {
		setIsLoading(false);

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

		const snapHandler = new SVGSnap();
		snapHandler.load(src);
		snapHandler.showDebugCanvas(document.querySelector('#app'));

		// temporary cursor to show snap location
		const cursor = document.createElement('img');
		cursor.setAttribute('style', 'position: absolute; width: 20px; height: 20px; border-radius: 50%; display: block; z-index: 1;');
		cursor.src = '/assets/drawings/snap.svg';
		imgRef.current.getEventsEmitter().appendChild(cursor);

		const getComputedStyleAsFloat = (element, style) => {
			return parseFloat(window.getComputedStyle(element).getPropertyValue(style)) || 0;
		};

		const getElementContentOffset = (element) => {
			return {
				x: getComputedStyleAsFloat(element, 'margin-left-width') + getComputedStyleAsFloat(element, 'border-left-width'),
				y: getComputedStyleAsFloat(element, 'margin-top-width') + getComputedStyleAsFloat(element, 'border-top-width'),
			};
		};

		imgRef.current.getEventsEmitter().addEventListener('mousemove', (ev)=>{

			// Make the event coordinates relative to the client rect of the
			// event emitter regardless of any child transforms and margins.

			const currentTargetRect = ev.currentTarget.getBoundingClientRect();
			const content = getElementContentOffset(ev.currentTarget);
			const coord = {
				x: ev.pageX - currentTargetRect.left - content.x,
				y: ev.pageY - currentTargetRect.top - content.y - window.pageYOffset,
			 };

			// Get the snap coordinates and radius in image space
			const imagePosition = imgRef.current.getImagePosition(coord);
			const p = new Vector2(imagePosition.x, imagePosition.y);

			// Get the radius in SVG units by getting another point in image space,
			// offset by the pixel radius, and taking the distance beteen them

			const snapRadius = 10;

			const imagePosition1 = imgRef.current.getImagePosition({
				x: coord.x + snapRadius,
				y: coord.y + snapRadius,
			});
			const p1 = new Vector2(imagePosition1.x, imagePosition1.y);

			const radius = Vector2.subtract(p, p1).norm;


			// Then invoke the snap
			const results = snapHandler.snap(p, radius);
			const r = results.closestNode;

			if (r != null) {
				const r2 = imgRef.current.getClientPosition(r);

				cursor.style.setProperty('left', (r2.x - 10) + 'px', '');
				cursor.style.setProperty('top', (r2.y - 10) + 'px', '');
			}
		});
	};

	useEffect(() => {
		setIsLoading(true);
	}, [drawingId]);

	const showSVGImage = !isFirefox() && src.toLowerCase().endsWith('.svg');

	return (
		<ViewerContainer visible>
			<CloseButton variant="secondary" onClick={close2D} />
			<ImageContainer ref={imgContainerRef}>
				{
					isLoading &&
					<CentredContainer>
						<Loader />
					</CentredContainer>
				}
				{showSVGImage && <SVGImage ref={imgRef} src={src} onLoad={onImageLoad} />}
				{!showSVGImage && <DrawingViewerImage ref={imgRef} src={src} onLoad={onImageLoad} />}
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
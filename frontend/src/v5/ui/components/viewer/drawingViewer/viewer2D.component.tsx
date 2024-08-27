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
import { SVGSnapHelper } from './snapping/svgSnapHelper';
import { Vector2 } from './snapping/types';
import { SVGSnapDiagnosticsHelper } from './snapping/debug';
import { setupIntersectionTest } from './snapping/bezierFunctions';


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

	const onImageLoad = ({ src }) => {
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

		// The svg snap helper should only ever have load called once (create a
		// new instance for new images). The helper will download the svg and
		// instantiate it as a DOM element, then parse it for everything it
		// requires. While downloading is asynchronous, building the structure can
		// take up to a second for the largest images.

		// NOTE THAT THIS IMPLEMENTATION DOES NOT SUPPORT LOADING NEW IMAGES AT ALL
		// BECAUSE THE ONMOUSEMOVE HANDLER IS NOT DEREGISTERED ANYWHERE.

		const snapHandler = new SVGSnapHelper();
		snapHandler.load(src);

		// Sets up a secondary canvas to render things, such as the primitives
		// into, in order to visualise the behaviour of the snapping algorithms.
		// The canvas and everything on it is in svg space, making it particularly
		// useful to diagnose transform issues when going between the client and
		// the svg coordinate systems.

		// snapHandler.showDebugCanvas(document.querySelector('#app'));

		// const diag = new SVGSnapDiagnosticsHelper(document.querySelector('#app'));
		// setupIntersectionTest(diag);

		// Set up a cursor to show the state of the snap.

		const cursor = document.createElement('div');
		cursor.setAttribute('style', 'position: absolute; width: 20px; height: 20px; border-radius: 50%; display: block; z-index: 1;');

		const node = document.createElement('img');
		node.src = '/assets/drawings/cursor-node.svg';
		cursor.appendChild(node);
		node.toggleAttribute('hidden');

		const edge = document.createElement('img');
		edge.src = '/assets/drawings/cursor-edge.svg';
		cursor.appendChild(edge);
		edge.toggleAttribute('hidden');

		const intersect = document.createElement('img');
		intersect.src = '/assets/drawings/cursor-intersect.svg';
		cursor.appendChild(intersect);
		intersect.toggleAttribute('hidden');

		// Normally we'd resolve the cursor position from svg space to client
		// space immediatley. However below we keep it in svg space, so that
		// if the user pans or zooms the ZoomableImage, we can update the cursor
		// and verify the precision of the snap.

		let cursorSvgPosition = { x:0, y:0 };
		const updateCursorPosition = () => {
			const clientPosition = imgRef.current.getClientPosition(cursorSvgPosition);
			cursor.style.setProperty('left', (clientPosition.x - 10) + 'px', '');
			cursor.style.setProperty('top', (clientPosition.y - 10) + 'px', '');
		};
		pz.on(Events.transform, updateCursorPosition);

		const setCursor = (clientPosition, type) => {
			cursorSvgPosition = clientPosition;
			updateCursorPosition();
			switch (type) {
				case 'node':
					node.toggleAttribute('hidden', false);
					edge.toggleAttribute('hidden', true);
					intersect.toggleAttribute('hidden', true);
					break;
				case 'edge':
					node.toggleAttribute('hidden', true);
					edge.toggleAttribute('hidden', false);
					intersect.toggleAttribute('hidden', true);
					break;
				case 'intersect':
					node.toggleAttribute('hidden', true);
					edge.toggleAttribute('hidden', true);
					intersect.toggleAttribute('hidden', false);
					break;
				case 'none':
					node.toggleAttribute('hidden', true);
					edge.toggleAttribute('hidden', true);
					intersect.toggleAttribute('hidden', true);
					break;
			}
		};

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

		imgRef.current.getEventsEmitter().addEventListener('mousemove', (ev) => {

			// This callback serves as an example of how to implement snapping.

			// Snapping to SVGs is handled by an instance of SVGSnap. A new instance
			// should be created for each SVG (i.e. do not load a new svg into an
			// existing instance). The SVGSnap takes the DOM of an SVG.

			// SVGSnap operates in the local coordinate system of the SVG primitives.
			// First, make the event coordinates relative to the client rect of the
			// event emitter regardless of any child transforms and margins.

			const currentTargetRect = ev.currentTarget.getBoundingClientRect();
			const content = getElementContentOffset(ev.currentTarget);
			const coord = {
				x: ev.pageX - currentTargetRect.left - content.x,
				y: ev.pageY - currentTargetRect.top - content.y - window.pageYOffset,
			 };

			// Then get the coordinates and radius in SVG image space using the
			// SvgImage Component's getImagePosition method.

			const imagePosition = imgRef.current.getImagePosition(coord);
			const p = new Vector2(imagePosition.x, imagePosition.y);

			// (We get the radius in SVG units simply by getting another point in
			// image space, offset by the pixel radius, and taking the distance
			// beteen them)

			const snapRadius = 10;
			const imagePosition1 = imgRef.current.getImagePosition({
				x: coord.x + snapRadius,
				y: coord.y + snapRadius,
			});
			const p1 = new Vector2(imagePosition1.x, imagePosition1.y);
			const radius = Vector2.subtract(p, p1).norm;

			// With the query point and radius in SVG coordinates, we can now
			// invoke the snap.

			const results = snapHandler.snap(p, radius);

			// The snapResults object returns three types of snap point. This
			// snippet snaps preferentially to nodes, then intersections, and
			// finally edges.

			// Note that the positions are in SVG space - these are the coordinates
			// that should be passed to the calibration system, and will need to be
			// converted to the client rect in order to find out where to draw the
			// cursor.

			if (results.closestNode != null) {
				setCursor(results.closestNode, 'node');
			} else if (results.closestIntersection != null) {
				setCursor(results.closestIntersection, 'intersect');
			} else if (results.closestEdge != null) {
				setCursor(results.closestEdge, 'edge');
			} else {
				setCursor({ x:0, y:0 }, 'none');
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
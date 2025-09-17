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
import { CalibrationInfoBox } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationInfoBox/calibrationInfoBox.component';
import CalibrationIcon from '@assets/icons/filled/calibration-filled.svg';
import { ViewerLayer2D } from './viewerLayer2D/viewerLayer2D.component';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { ViewBoxType } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { getDrawingImageSrc } from '@/v5/store/drawings/revisions/drawingRevisions.helpers';
import { DrawingViewerSvg } from './drawingViewerSvg/drawingViewerSvg.component';
import { CentredContainer } from '@controls/centredContainer/centredContainer.component';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { isFirefox } from '@/v5/helpers/browser.helper';
import { ZoomableImage } from './zoomableImage.types';
import { SVGSnapHelper } from './snapping/svgSnapHelper';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useAuthenticatedImage } from '@components/authenticatedResource/authenticatedResource.hooks';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { selectViewerBackgroundColor } from '@/v4/modules/viewer/viewer.selectors';
import { useSelector } from 'react-redux';
import { CalibrationStatus } from '@/v5/store/drawings/drawings.types';
import HomeIcon from '@assets/icons/viewer/home.svg';
import { DrawingViewerApryse } from './drawingViewerApryse/drawingViewerApryse.component';
import { ISnapHelper } from './snapping/types';


const DEFAULT_VIEWBOX = { scale: 1, x: 0, y: 0, width: 0, height: 0 };
export const Viewer2D = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const [drawingId] = useSearchParam('drawingId');

	const revision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawingId);
	const plainSrc = revision ? getDrawingImageSrc(teamspace, project, drawingId, revision._id) : '';
	const src = useAuthenticatedImage(plainSrc);
	const latestActiveRevision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawingId);
	const revisionId = latestActiveRevision?._id;
	const hasCalibration = [CalibrationStatus.UNCONFIRMED, CalibrationStatus.CALIBRATED].includes(latestActiveRevision?.calibration);
	const backgroundColor = useSelector(selectViewerBackgroundColor);

	const { close2D } = useContext(ViewerCanvasesContext);
	const { isCalibrating, step, isCalibrating2D, setIsCalibrating2D } = useContext(CalibrationContext);
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [snapHandler, setSnapHandler] =  useState<ISnapHelper>();
	const [viewBox, setViewBox] = useState<ViewBoxType>(DEFAULT_VIEWBOX);
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);
	const [viewport, setViewport] = useState({ left:0, right: 0, top: 0, bottom:0 });
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef();
	const imgViewerRef = useRef<ZoomableImage>();
	const imgContainerRef = useRef();

	// The ImageReference state is updated based on the src property. The two
	// members are held in the same object to ensure they are always updated
	// together in the same frame.

	enum ViewerType {
		None = 0,
		Img = 1,
		Svg = 2,
		Pdf = 3,
	};

	type ViewerAttributes = {
		type: ViewerType,
		src: string
	};

	const [viewer, setViewerAttributes] = useState<ViewerAttributes>({
		type: ViewerType.None,
		src: ''
	});

	useEffect(() => {
		if (src){
			// We are only interested in the headers for the blob, but the HEAD method
			// is not supported for object URLs...
			fetch(src).then((response) => {
				const mimeType = response.headers.get('content-type');
				const viewerSettings = {
					type: ViewerType.None,
					src: src
				}
				if (mimeType == 'application/pdf') {
					viewerSettings.type = ViewerType.Pdf;
				} else if (mimeType == 'image/svg+xml' && !isFirefox()) {
					viewerSettings.type = ViewerType.Svg;
				} else {
					viewerSettings.type = ViewerType.Img;
				}
				setViewerAttributes(viewerSettings);
			});
		}
	}, [src]);

	console.log(`Render: ${drawingId} ${src} ${viewer.src} ${viewer.type} ${revision?.format}`);

	const canCalibrate2D = isCalibrating && step === 1;

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

		switch(viewer.type) {
			case ViewerType.Img:
			case ViewerType.Svg:
				DrawingViewerService.getDrawingSrc = () => Promise.resolve(plainSrc);
				break;
			case ViewerType.Pdf:
				DrawingViewerService.getDrawingSrc = () => (imgViewerRef.current as any).getImageBlob().then((blob) => URL.createObjectURL(blob));
				break;
		}

		switch(viewer.type) {
			case ViewerType.Img:
				setSnapHandler(undefined);
				break;
			case ViewerType.Svg:
				const snap = new SVGSnapHelper();
				snap.load(src);
				setSnapHandler(snap);
				break;
			case ViewerType.Pdf:
				// The Apryse viewer implements snapping itself. It exposes ISnapHelper in
				// its returned object, though this is not expressed in ZoomableImage.
				setSnapHandler(imgViewerRef.current as unknown as ISnapHelper);
				break;
		}

		// The Svg and Img viewers use external pan-zoom handlers, including for
		// re-centering (below). The Apryse viewer handles navigation internally.

		switch(viewer.type) {
			case ViewerType.Img:
			case ViewerType.Svg:
				const pz = centredPanZoom(imgViewerRef.current, 20, 20);
				setZoomHandler(pz);
				break;
			case ViewerType.Pdf:
				setZoomHandler(imgViewerRef.current as unknown as PanZoomHandler);
				break;
		};
	};

	const onCalibrationClick = () => setIsCalibrating2D(!isCalibrating2D);

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

		return () => {
			zoomHandler.off(Events.transform);
		};
	}, [zoomHandler]);

	useEffect(()=> {
		const observer = new ResizeObserver((entry) =>  {
			const rect = entry[0].contentRect;
			const { scale, x, y } = viewBox;

			setViewport({ left: -x / scale, right: (-x + rect.width) / scale, top: -y / scale, bottom: (-y + rect.height) / scale });
		});
		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [viewBox]);
	

	useEffect(() => {
		setIsLoading(true);
	}, [plainSrc]);

	useEffect(() => {
		if (hasCalibration) {
			DrawingsActionsDispatchers.fetchCalibration(teamspace, project, drawingId);
		}
	}, [hasCalibration, revisionId]);

	useEffect(() => {
		if (revisionId) return;
		DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId);
	}, [revisionId]);

	// For now, we hide the ViewerLayer2D in expectation of the Apryse viewer handling
	// all the annotations in its own coordinate space, but we may want to reintroduce
	// this (with the pointer events turned off...)

	return (
		<ViewerContainer visible ref={containerRef}>
			{step === 1 && (
				<CalibrationInfoBox
					title={formatMessage({ defaultMessage: '2D Alignment', id: 'infoBox.2dAlignment.title' })}
					description={formatMessage({
						id: 'infoBox.2dAlignment.description',
						defaultMessage: `
							Click on the {icon} on your navigation bar and then please select your two points in the
							2D Viewer that are the same points in your 3D Viewer.
						`,
					}, { icon: <CalibrationIcon /> })}
				/>
			)}
			{!isCalibrating && <CloseButton variant="secondary" onClick={close2D} />}
			<ImageContainer backgroundColor={backgroundColor} ref={imgContainerRef}>
				{
					isLoading &&
					<CentredContainer>
						<Loader />
					</CentredContainer>
				}
				{viewer.type == ViewerType.Pdf && <DrawingViewerApryse ref={imgViewerRef} src={viewer.src} onLoad={onImageLoad} setViewBox={setViewBox} />}
				{viewer.type == ViewerType.Svg && <DrawingViewerSvg ref={imgViewerRef} src={viewer.src} onLoad={onImageLoad} />}
				{viewer.type == ViewerType.Img && <DrawingViewerImage ref={imgViewerRef} src={viewer.src} onLoad={onImageLoad} />}
				{!isLoading && (<ViewerLayer2D
					viewBox={viewBox}
					snapHandler={snapHandler}
					viewport={viewport}
					key={String(isCalibrating) + drawingId}
				/>)}
			</ImageContainer>
			<ToolbarContainer>
				<MainToolbar>
					<ToolbarButton
						Icon={HomeIcon}
						onClick={() => zoomHandler.centreView()}
						title={formatMessage({ id: 'viewer.toolbar.icon.home', defaultMessage: 'Home' })}
					/>
					{step === 1 && <ToolbarButton
						Icon={CalibrationIcon}
						onClick={onCalibrationClick}
						title={formatMessage({ id: 'drawingViewer.toolbar.calibrate', defaultMessage: 'Calibrate' })}
						selected={isCalibrating2D}
						hidden={!canCalibrate2D}
					/>}
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
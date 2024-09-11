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
import { getDrawingImageSrc } from '@/v5/store/drawings/revisions/drawingRevisions.helpers';
import { SVGImage } from './svgImage/svgImage.component';
import { CentredContainer } from '@controls/centredContainer/centredContainer.component';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { isFirefox } from '@/v5/helpers/browser.helper';
import { ZoomableImage } from './zoomableImage.types';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useAuthenticatedImage } from '@components/authenticatedResource/authenticatedResource.hooks';
import { DrawingRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { selectViewerBackgroundColor } from '@/v4/modules/viewer/viewer.selectors';
import { useSelector } from 'react-redux';

export const Viewer2D = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const [drawingId] = useSearchParam('drawingId');
	const revision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawingId);
	const src = revision ? getDrawingImageSrc(teamspace, project, drawingId, revision._id) : '';
	const authSrc = useAuthenticatedImage(src);
	const backgroundColor = useSelector(selectViewerBackgroundColor);

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
	};

	useEffect(() => {
		setIsLoading(true);
	}, [drawingId]);

	const showSVGImage = !isFirefox() && !src.toLowerCase().endsWith('.png');

	useEffect(() => {
		if (revision) return;
		DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId);
	}, [revision]);

	return (
		<ViewerContainer visible>
			<CloseButton variant="secondary" onClick={close2D} />
			<ImageContainer backgroundColor={backgroundColor} ref={imgContainerRef}>
				{
					isLoading && 
					<CentredContainer>
						<Loader />
					</CentredContainer>
				}
				{showSVGImage && <SVGImage ref={imgRef} src={authSrc} onLoad={onImageLoad} />}
				{!showSVGImage && <DrawingViewerImage ref={imgRef} src={authSrc} onLoad={onImageLoad} />}
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
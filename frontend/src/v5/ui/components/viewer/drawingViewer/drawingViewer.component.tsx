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

import { SvgViewer } from './svgViewer.component';
import { PanZoomHandler, centredPanZoom } from './panzoom/centredPanZoom';
import { DrawingViewerContainer } from './drawingViewer.styles';
import { Events } from './panzoom/panzoom';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

import BluePrint from '@assets/drawings/blueprint.svg';
import BluePrint2 from '@assets/drawings/blueprint2.svg';
import Map from '@assets/drawings/map.svg';
import Fly from '@assets/drawings/fly.svg';
import PngBluePrint from '@assets/drawings/blueprint.png';
import PngBluePrint2 from '@assets/drawings/blueprint2.png';
import PngBluePrint3 from '@assets/drawings/blueprint3.png';
import PngBluePrint4 from '@assets/drawings/blueprint4.png';
import { sample } from 'lodash';

const SVGs = [BluePrint, BluePrint2, Map, Fly];
const PNGs = [PngBluePrint, PngBluePrint2, PngBluePrint3, PngBluePrint4];

export const DrawingViewer = () => {
	const [svgContent, setSvgContent] = useState('');
	const [imgContent, setImgContent] = useState('');
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);
	const [drawingId] = useSearchParam('drawingId');

	const imgRef = useRef<HTMLImageElement | SVGSVGElement>();

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
		pz.on(Events.transform, () => {
			const cantZoomOut = pz.getMinZoom() >= pz.getTransform().scale;
			const cantZoomIn = pz.getMaxZoom() <= pz.getTransform().scale;
			setIsMinZoom(cantZoomOut);
			setIsMaxZoom(cantZoomIn);
		});
	};

	useEffect(() => {
		if (!drawingId) return;
		const isSVG = Math.random() > 0.5;
		
		if (isSVG) {
			const base64Svg = sample(SVGs);
			const stringifiedSvg = atob(base64Svg.replace(/data:image\/svg\+xml;base64,/, ''));
			setSvgContent(stringifiedSvg);
			setImgContent('');
		} else {
			setImgContent(sample(PNGs));
			setSvgContent('');
		}
	}, [drawingId]);

	return (
		<DrawingViewerContainer id="viewer">
			{svgContent && <SvgViewer svgContent={svgContent} ref={imgRef} onLoad={onImageLoad}/>}
			{imgContent && <img src={imgContent} ref={imgRef as any} onLoad={onImageLoad} />}
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
		</DrawingViewerContainer>
	);
};
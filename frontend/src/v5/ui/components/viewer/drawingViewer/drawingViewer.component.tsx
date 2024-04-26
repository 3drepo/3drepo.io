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
import { useRef, useState } from 'react';
import ZoomOutIcon from '@assets/icons/viewer/zoom_out.svg';
import ZoomInIcon from '@assets/icons/viewer/zoom_in.svg';

import { FileInputField } from '@controls/fileInputField/fileInputField.component';
import { Button } from '@controls/button/button.component';
import { FormattedMessage } from 'react-intl';
import { SvgViewer } from './svgViewer.component';
import { PanZoomHandler, centredPanZoom } from './panzoom/centredPanZoom';
import { DrawingViewerContainer } from './drawingViewer.styles';



export const DrawingViewer = () => {
	const [svgContent, setSvgContent] = useState('');
	const [imgContent, setImgContent] = useState('');
	const [zoomHandler, setZoomHandler] = useState<PanZoomHandler>();
	const [isMinZoom, setIsMinZoom] = useState(false);
	const [isMaxZoom, setIsMaxZoom] = useState(false);

	const imgRef = useRef<HTMLImageElement | SVGSVGElement>();

	const onClickButton = async ([file]: File[]) => {
		if (file.type.includes('svg')) { 
			setSvgContent(await file.text());
			setImgContent('');
		}

		if (file.type.includes('png')) { 
			var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(await file.arrayBuffer())));
			setImgContent('data:image/png;base64,' + base64String);
			setSvgContent('');
		}
	};

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
		pz.on('transform', () => {
			const cantZoomOut = pz.getMinZoom() >= pz.getTransform().scale;
			const cantZoomIn = pz.getMaxZoom() <= pz.getTransform().scale;
			setIsMinZoom(cantZoomOut);
			setIsMaxZoom(cantZoomIn);
		});
	};

	return (
		<DrawingViewerContainer>
			<FileInputField
				accept=".svg,.png"
				onChange={onClickButton as any}
				multiple
			>
				<Button component="span" variant="contained" color="primary" style={{ position: 'absolute', zIndex: 10 }}>
					<FormattedMessage
						id="uploads.fileInput.browse"
						defaultMessage="Browse"
					/>
				</Button>
			</FileInputField>
			{svgContent && <SvgViewer svgContent={svgContent} ref={imgRef} onLoad={onImageLoad}/>}
			{imgContent && <img src={imgContent} ref={imgRef as any} onLoad={onImageLoad} />}
			<ToolbarContainer>
				<MainToolbar>
					<ToolbarButton
						Icon={ZoomOutIcon}
						onClick={onClickZoomOut}
						disabled={isMinZoom}
						title={formatMessage({ id: 'drawingViewer.toolbar.zoomIn', defaultMessage: 'Zoom out' })}
					/>
					<ToolbarButton
						Icon={ZoomInIcon}
						onClick={onClickZoomIn}
						disabled={isMaxZoom}
						title={formatMessage({ id: 'drawingViewer.toolbar.zoomOut', defaultMessage: 'Zoom in' })}
					/>
				</MainToolbar>
			</ToolbarContainer>
		</DrawingViewerContainer>
	);
};
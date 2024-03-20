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

import { FileInputField } from '@controls/fileInputField/fileInputField.component';
import { Button } from '@controls/button/button.component';
import { FormattedMessage } from 'react-intl';
import { sanitizeSvg } from '@svgedit/svgcanvas/core/sanitize';
import { SvgContainer } from './drawingViewer.styles';
// import panzoom from 'panzoom';

const SvgViewer = ({ svgContent }) => {
	const svgContainerRef = useRef<HTMLElement>(null);
	const svgRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!svgContainerRef.current || !svgContent) return;

		const svgContainer = document.createElement('div');
		svgContainer.innerHTML = svgContent;

		const svg = svgContainer.querySelector('svg') as SVGSVGElement;
		sanitizeSvg(svg);

		if (svgContainerRef.current.children.length > 1) {
			svgContainerRef.current.removeChild(svgContainerRef.current.children[0]);
		}

		svgContainerRef.current.insertBefore(svg, svgContainerRef.current.children[0]);

		svg.removeAttribute('height');
		svg.removeAttribute('width');
		

		// const pz = panzoom(svg, {
		// 	maxZoom: 10,
		// 	minZoom: 1,
		// });

		// const editorRect = svgContainerRef.current.getBoundingClientRect();
		
		// pz.on('transform', () => {
		// 	const t = pz.getTransform();
		// 	const svgRect = svg.getBoundingClientRect();
		// 	const minX =  -(svgRect.width - editorRect.width) ;
		// 	const minY =  -(svgRect.height - editorRect.height) ;

		// 	if (t.x > 0 || t.y > 0 || t.x < minX || t.y < minY) {
		// 		pz.moveTo(Math.max(Math.min(t.x, 0), minX), Math.max(Math.min(t.y, 0), minY));
		// 	}
		// });

	}, [svgContent]);

	return (
		<div style={{ width: '100%', height:'100%', overflow: 'auto' }}> 
			<SvgContainer ref={svgContainerRef as any} />
		</div>
	);
};


const DrawingToolbar = () => {
	const onClickZoomIn = () => {
		// console.log('zoom in');
	};

	const onClickZoomOut = () => {
		// console.log('zoom out');
	};


	return (

		<ToolbarContainer>
			<MainToolbar>
				<ToolbarButton
					Icon={ZoomOutIcon}
					onClick={onClickZoomOut}
					title={formatMessage({ id: 'drawingWiewer.toolbar.zoomIn', defaultMessage: 'Zoom out' })}
				/>
				<ToolbarButton
					Icon={ZoomInIcon}
					onClick={onClickZoomIn}
					title={formatMessage({ id: 'drawingWiewer.toolbar.zoomOut', defaultMessage: 'Zoom in' })}
				/>
			</MainToolbar>
		</ToolbarContainer>
	);
};

export const DrawingViewer = () => {
	const [svgContent, setSvgContent] = useState('');

	const onClickButton = async (files: File[]) => {
		setSvgContent(await files[0].text());
	};

	return (
		<>
			<FileInputField
				accept=".svg"
				onChange={onClickButton as any}
				multiple
			>
				<Button component="span" variant="contained" color="primary" style={{ position:'absolute' }}>
					<FormattedMessage
						id="uploads.fileInput.browse"
						defaultMessage="Browse"
					/>
				</Button>
			</FileInputField>
			<SvgViewer svgContent={svgContent} />
			<DrawingToolbar />
		</>
	);
};
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
import { Zoomer, SvgViewer } from './svgViewer.component';


export const DrawingViewer = () => {
	const [svgContent, setSvgContent] = useState('');

	const zoomer = useRef<Zoomer>();

	const onClickButton = async (files: File[]) => {
		setSvgContent(await files[0].text());
	};

	const onClickZoomIn = () => {
		zoomer.current?.zoomIn();
	};

	const onClickZoomOut = () => {
		zoomer.current?.zoomOut();
	};

	return (
		<>
			<FileInputField
				accept=".svg,.png"
				onChange={onClickButton as any}
				multiple
			>
				<Button component="span" variant="contained" color="primary" style={{ position:'absolute', zIndex: 10 }}>
					<FormattedMessage
						id="uploads.fileInput.browse"
						defaultMessage="Browse"
					/>
				</Button>
			</FileInputField>
			<SvgViewer svgContent={svgContent} zRef={zoomer}/>
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
		</>
	);
};
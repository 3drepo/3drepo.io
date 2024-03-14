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
import { SectionToolbar } from '@/v5/ui/routes/viewer/toolbar/selectionToolbar/selectionToolbar.component';
import { ToolbarContainer, MainToolbar } from '@/v5/ui/routes/viewer/toolbar/toolbar.styles';
import { useState } from 'react';
import HomeIcon from '@assets/icons/viewer/home.svg';
import CoordinatesIcon from '@assets/icons/viewer/coordinates.svg';
import { CentredContainer } from '@controls/centredContainer/centredContainer.component';


const SvgViewer = ({ svgContent }) => {
	return (
		<CentredContainer horizontal vertical>
			hello
		</CentredContainer>
	);
};


const DrawingToolbar = () => {
	const onClickZoomIn = () => {
		console.log('zoom in');
	};

	const onClickZoomOut = () => {
		console.log('zoom out');
	};


	return (
		<ToolbarContainer>
			<MainToolbar>
				<ToolbarButton
					Icon={HomeIcon}
					onClick={onClickZoomIn}
					title={formatMessage({ id: 'drawingWiewer.toolbar.zoomIn', defaultMessage: 'Zoom in' })}
				/>
				<ToolbarButton
					Icon={CoordinatesIcon}
					onClick={onClickZoomOut}
					title={formatMessage({ id: 'drawingWiewer.toolbar.zoomOut', defaultMessage: 'Zoom out' })}
				/>
			</MainToolbar>
			<SectionToolbar />
		</ToolbarContainer>
	);
};

export const DrawingViewer = () => {
	const [svgContent, setSvgContent] = useState('');

	const onClickButton = () => {
		// alert('click!');
	};

	return (
		<>
			<button onClick={onClickButton}> Load svg </button>
			<SvgViewer svgContent={svgContent} />
			<DrawingToolbar />
		</>
	);
};
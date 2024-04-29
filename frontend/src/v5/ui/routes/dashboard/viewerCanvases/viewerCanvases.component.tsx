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

import { ViewerCanvas as Canvas3D } from '@/v4/routes/viewerCanvas';
import { DrawingViewer as Canvas2D } from '@components/viewer/drawingViewer/drawingViewer.component';
import { useLocation } from 'react-router-dom';
import { SplitPane } from './viewerCanvases.styles';
import { ViewerCanvasesContext } from '../../viewer/viewerCanvases.context';
import { useContext, useState } from 'react';

const MIN_PANEL_SIZE = 68;

export const ViewerCanvases = () => {
	const { pathname } = useLocation();
	const windowWidth = window.innerWidth;
	const { is2DOpen, leftPanelRatio, setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const [manualSize, setManualSize] = useState(windowWidth / 2);

	const handleResize = () => {
		const windowWidth2 = window.innerWidth;
		setManualSize(leftPanelRatio * windowWidth2);
	};
	window.addEventListener('resize', handleResize);

	const onDragResize = (size) => setLeftPanelRatio(size / windowWidth);
	return (
		<SplitPane
			split="vertical"
			size={is2DOpen ? manualSize : '100%'} // This is for manually resizing the panels when the viewport width changes
			minSize={MIN_PANEL_SIZE}
			maxSize={windowWidth - MIN_PANEL_SIZE}
			defaultSize="50%"
			onChange={onDragResize}
		>
			<Canvas3D location={{ pathname }} />
			{is2DOpen && <Canvas2D />}
		</SplitPane>
	);
};

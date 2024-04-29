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
import { clamp } from 'lodash';

const MIN_PANEL_SIZE = 68;
const windowWidth = window.innerWidth;
const MAX_PANEL_SIZE = windowWidth - MIN_PANEL_SIZE;

export const ViewerCanvases = () => {
	const { pathname } = useLocation();
	const { is2DOpen, leftPanelRatio, setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const [size, setSize] = useState(windowWidth / 2);

	const handleWindowResize = () => {
		const windowWidth2 = window.innerWidth;
		setSize(clamp(leftPanelRatio * windowWidth2, MIN_PANEL_SIZE, MAX_PANEL_SIZE));
	};
	window.addEventListener('resize', handleWindowResize);

	const onDragResize = (s: number) => {
		setSize(s);
		setLeftPanelRatio(s / windowWidth);
	};

	return (
		<SplitPane
			split="vertical"
			size={is2DOpen ? size : '100%'}
			minSize={MIN_PANEL_SIZE}
			maxSize={MAX_PANEL_SIZE}
			onChange={onDragResize}
		>
			<Canvas3D location={{ pathname }} />
			{is2DOpen && <Canvas2D />}
		</SplitPane>
	);
};

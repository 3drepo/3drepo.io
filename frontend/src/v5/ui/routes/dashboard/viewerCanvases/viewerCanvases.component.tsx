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

import { Viewer3D } from '@/v4/routes/viewer3D';
import { Viewer2D } from '@components/viewer/drawingViewer/viewer2D.component';
import { useLocation } from 'react-router-dom';
import { SplitPane } from './viewerCanvases.styles';
import { ViewerCanvasesContext } from '../../viewer/viewerCanvases.context';
import { useCallback, useContext, useEffect, useState } from 'react';
import { clamp } from 'lodash';

export const ViewerCanvases = () => {
	const MIN_PANEL_SIZE = 68;
	const windowWidth = window.innerWidth;
	const { pathname } = useLocation();
	const { is2DOpen, leftPanelRatio, setLeftPanelRatio } = useContext(ViewerCanvasesContext);
	const [size, setSize] = useState(windowWidth * leftPanelRatio);
	const [mouseY, setMouseY] = useState(windowWidth * leftPanelRatio);

	const handleWindowResize = useCallback(({ currentTarget: { innerWidth } }) => {
		const newSize = clamp(leftPanelRatio * innerWidth, MIN_PANEL_SIZE, innerWidth - MIN_PANEL_SIZE);
		setSize(newSize);
	}, [leftPanelRatio]);

	const onDragResize = (s: number) => {
		setSize(s);
		setLeftPanelRatio(s / window.innerWidth);
	};

	useEffect(() => {
		if (!is2DOpen) return;
		window.addEventListener('resize', handleWindowResize);
		window.addEventListener('pointermove', ({ clientY }) => setMouseY(clientY));
		return () => {
			window.removeEventListener('resize', handleWindowResize);
			window.removeEventListener('pointermove', () => setMouseY(null));
		};
	}, [is2DOpen]);

	return (
		<SplitPane
			split="vertical"
			size={is2DOpen ? size : '100%'}
			minSize={MIN_PANEL_SIZE}
			maxSize={windowWidth - MIN_PANEL_SIZE}
			onChange={onDragResize}
			yPos={mouseY}
		>
			<Viewer3D location={{ pathname }} />
			{is2DOpen && <Viewer2D />}
		</SplitPane>
	);
};

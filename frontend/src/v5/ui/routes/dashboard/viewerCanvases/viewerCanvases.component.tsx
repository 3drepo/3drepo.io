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
import { useContext, useState } from 'react';

export const ViewerCanvases = () => {
	const { pathname } = useLocation();
	const { is2DOpen } = useContext(ViewerCanvasesContext);
	const [leftPanelRatio, setLeftPanelRatio] = useState(0.5);

	const dragFinish = (newSize) => setLeftPanelRatio(newSize / window.innerWidth);

	return (
		<SplitPane
			split="vertical"
			size={is2DOpen ? leftPanelRatio * 100 + '%' : '100%'}
			onDragFinished={dragFinish}
		>
			<Viewer3D location={{ pathname }} />
			{is2DOpen && <Viewer2D />}
		</SplitPane>
	);
};

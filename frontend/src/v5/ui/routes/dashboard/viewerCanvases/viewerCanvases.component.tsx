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
import { ViewerCanvasesContext, ViewerCanvasesContextType } from '../../viewer/viewerCanvases.context';

export const ViewerCanvases = () => {
	const { pathname } = useLocation();
	return (
		<ViewerCanvasesContext.Consumer>
			{({ is2DOpen, setPanelWidth }: ViewerCanvasesContextType) => (
				<SplitPane
					split="vertical"
					minSize={68}
					defaultSize="50%"
					is2DOpen={is2DOpen}
					onChange={setPanelWidth}
				>
					<Canvas3D location={{ pathname }} />
					<Canvas2D />
				</SplitPane>
			)}
		</ ViewerCanvasesContext.Consumer>
	);
};

/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import HomeIcon from '@assets/icons/viewer/home.svg';
import CoordinatesIcon from '@assets/icons/viewer/coordinates.svg';
import FocusIcon from '@assets/icons/viewer/focus.svg';
import InfoIcon from '@assets/icons/viewer/info.svg';
import { formatMessage } from '@/v5/services/intl';
import { BimActionsDispatchers, MeasurementsActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, ModelHooksSelectors, ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { MainToolbar, ToolbarContainer } from './toolbar.styles';
import { NavigationButtons } from './buttons/buttonOptionsContainer/navigationButtons.component';
import { ProjectionButtons } from './buttons/buttonOptionsContainer/projectionButtons.component';
import { ToolbarButton } from './buttons/toolbarButton.component';
import { ClipButtons } from './buttons/buttonOptionsContainer/clipButtons.component';
import { SectionToolbar } from './selectionToolbar/selectionToolbar.component';
import { useContext } from 'react';
import { ViewerCanvasesContext } from '../viewerCanvases.context';

export const Toolbar = () => {
	const { leftPanelRatio, is2DOpen } = useContext(ViewerCanvasesContext);
	const hasMetaData = ModelHooksSelectors.selectMetaKeysExist();
	const showBIMPanel = BimHooksSelectors.selectIsActive();
	const showCoords = ViewerGuiHooksSelectors.selectIsCoordViewActive();
	const xPosition = is2DOpen ? (leftPanelRatio * 50) : 50;

	const setBIMPanelVisibililty = (visible) => {
		BimActionsDispatchers.setIsActive(visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.BIM, visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);

		if (visible) {
			MeasurementsActionsDispatchers.setMeasureMode('');
		}
	};

	return (
		<ToolbarContainer xPosition={xPosition}>
			<MainToolbar>
				<ToolbarButton
					Icon={HomeIcon}
					onClick={ViewerGuiActionsDispatchers.goToHomeView}
					title={formatMessage({ id: 'viewer.toolbar.icon.home', defaultMessage: 'Home' })}
				/>
				<ProjectionButtons />
				<NavigationButtons />
				<ToolbarButton
					Icon={FocusIcon}
					onClick={() => ViewerGuiActionsDispatchers.setIsFocusMode(true)}
					title={formatMessage({ id: 'viewer.toolbar.icon.focus', defaultMessage: 'Focus' })}
				/>
				<ClipButtons />
				<ToolbarButton
					Icon={CoordinatesIcon}
					selected={showCoords}
					onClick={() => ViewerGuiActionsDispatchers.setCoordView(!showCoords)}
					title={formatMessage({ id: 'viewer.toolbar.icon.coordinates', defaultMessage: 'Show Coordinates' })}
				/>
				<ToolbarButton
					Icon={InfoIcon}
					hidden={!hasMetaData}
					selected={showBIMPanel}
					onClick={() => setBIMPanelVisibililty(!showBIMPanel)}
					title={formatMessage({ id: 'viewer.toolbar.icon.attributeData', defaultMessage: 'Attribute Data' })}
				/>
			</MainToolbar>
			<SectionToolbar />
		</ToolbarContainer>
	);
};

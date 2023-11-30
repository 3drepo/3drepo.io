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
import { MainToolbar, Container } from './toolbar.styles';
import { NavigationButtons } from './buttons/buttonOptionsContainer/navigationButtons.component';
import { ProjectionButtons } from './buttons/buttonOptionsContainer/projectionButtons.component';
import { ToolbarButton } from './buttons/toolbarButton.component';
import { ClipButtons } from './buttons/buttonOptionsContainer/clipButtons.component';
import { SectionToolbar } from './selectionToolbar/selectionToolbar.component';

export const Toolbar = () => {
	const hasMetaData = ModelHooksSelectors.selectMetaKeysExist();
	const showBIMPanel = BimHooksSelectors.selectIsActive();
	const showCoords = ViewerGuiHooksSelectors.selectIsCoordViewActive();

	const setBIMPanelVisibililty = (visible) => {
		BimActionsDispatchers.setIsActive(visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.BIM, visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);

		if (visible) {
			MeasurementsActionsDispatchers.setMeasureMode('');
		}
	};

	return (
		<Container>
			<MainToolbar>
				<ToolbarButton
					onClick={ViewerGuiActionsDispatchers.goToHomeView}
					title={formatMessage({ id: 'viewer.toolbar.icon.home', defaultMessage: 'Home' })}
				>
					<HomeIcon />
				</ToolbarButton>
				<ProjectionButtons />
				<NavigationButtons />
				<ToolbarButton
					onClick={() => ViewerGuiActionsDispatchers.setIsFocusMode(true)}
					title={formatMessage({ id: 'viewer.toolbar.icon.focus', defaultMessage: 'Focus' })}
				>
					<FocusIcon />
				</ToolbarButton>
				<ClipButtons />
				<ToolbarButton
					selected={showCoords}
					onClick={() => ViewerGuiActionsDispatchers.setCoordView(!showCoords)}
					title={formatMessage({ id: 'viewer.toolbar.icon.coordinates', defaultMessage: 'Show Coordinates' })}
				>
					<CoordinatesIcon />
				</ToolbarButton>
				<ToolbarButton
					hidden={!hasMetaData}
					selected={showBIMPanel}
					onClick={() => setBIMPanelVisibililty(!showBIMPanel)}
					title={formatMessage({ id: 'viewer.toolbar.icon.bim', defaultMessage: 'BIM' })}
				>
					<InfoIcon />
				</ToolbarButton>
			</MainToolbar>
			<SectionToolbar />
		</Container>
	);
};

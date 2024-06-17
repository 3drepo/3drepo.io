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
import InfoIcon from '@assets/icons/viewer/info.svg';
import { formatMessage } from '@/v5/services/intl';
import { BimActionsDispatchers, MeasurementsActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, ModelHooksSelectors } from '@/v5/services/selectorsHooks';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { MainToolbar, ToolbarContainer } from './toolbar.styles';
import { NavigationButtons } from './buttons/buttonOptionsContainer/navigationButtons.component';
import { ProjectionButtons } from './buttons/buttonOptionsContainer/projectionButtons.component';
import { ToolbarButton } from './buttons/toolbarButton.component';
import { ClipButtons } from './buttons/buttonOptionsContainer/clipButtons.component';
import { SectionToolbar } from './selectionToolbar/selectionToolbar.component';
import { HomeButton } from './buttons/homeButton/homeButton.component';
import { FocusButton } from './buttons/focusButton/focusButton.component';
import { CoordinatesButton } from './buttons/coordinatesButton/coordinatesButton.component';

export const Toolbar = () => {
	const hasMetaData = ModelHooksSelectors.selectMetaKeysExist();
	const showBIMPanel = BimHooksSelectors.selectIsActive();

	const setBIMPanelVisibililty = (visible) => {
		BimActionsDispatchers.setIsActive(visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.BIM, visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);

		if (visible) {
			MeasurementsActionsDispatchers.setMeasureMode('');
		}
	};

	return (
		<ToolbarContainer>
			<MainToolbar>
				<HomeButton />
				<ProjectionButtons />
				<NavigationButtons />
				<FocusButton />
				<ClipButtons />
				<CoordinatesButton />
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

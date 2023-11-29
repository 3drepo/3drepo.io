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
import ClearOverridesIcon from '@assets/icons/viewer/clear_overrides.svg';
import EyeHideIcon from '@assets/icons/viewer/eye_hide.svg';
import EyeShowIcon from '@assets/icons/viewer/eye_show.svg';
import EyeIsolateIcon from '@assets/icons/viewer/eye_isolate.svg';
import { formatMessage } from '@/v5/services/intl';
import { BimActionsDispatchers, GroupsActionsDispatchers, MeasurementsActionsDispatchers, TreeActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, GroupsHooksSelectors, ModelHooksSelectors, TreeHooksSelectors, ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { AlwaysOnContainer, ExpansionBlock, ExpansionContainer, MainContainer } from './toolbar.styles';
import { NavigationIcons } from './icons/multioptionIcons/navigationIcons.component';
import { ProjectionIcons } from './icons/multioptionIcons/projectionIcons.component';
import { BaseIcon } from './icons/baseIcon.component';
import { ClipIcons } from './icons/multioptionIcons/clipIcons.component';

export const Toolbar = () => {
	const hasOverrides = GroupsHooksSelectors.selectGroupsColourOverrides()?.length > 0;
	const hasHighlightedObjects = !!TreeHooksSelectors.selectFullySelectedNodesIds().length;
	const hasHiddenObjects = TreeHooksSelectors.selectHasHiddenNodes();
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
		<MainContainer>
			<AlwaysOnContainer>
				<BaseIcon
					onClick={ViewerGuiActionsDispatchers.goToHomeView}
					title={formatMessage({ id: 'viewer.toolbar.icon.home', defaultMessage: 'Home' })}
				>
					<HomeIcon />
				</BaseIcon>
				<ProjectionIcons />
				<NavigationIcons />
				<BaseIcon
					onClick={() => ViewerGuiActionsDispatchers.setIsFocusMode(true)}
					title={formatMessage({ id: 'viewer.toolbar.icon.focus', defaultMessage: 'Focus' })}
				>
					<FocusIcon />
				</BaseIcon>
				<ClipIcons />
				<BaseIcon
					selected={showCoords}
					onClick={() => ViewerGuiActionsDispatchers.setCoordView(!showCoords)}
					title={formatMessage({ id: 'viewer.toolbar.icon.coordinates', defaultMessage: 'Show Coordinates' })}
				>
					<CoordinatesIcon />
				</BaseIcon>
				<BaseIcon
					hidden={!hasMetaData}
					selected={showBIMPanel}
					onClick={() => setBIMPanelVisibililty(!showBIMPanel)}
					title={formatMessage({ id: 'viewer.toolbar.icon.bim', defaultMessage: 'BIM' })}
				>
					<InfoIcon />
				</BaseIcon>
			</AlwaysOnContainer>
			<ExpansionContainer>
				<ExpansionBlock hidden={!hasOverrides}>
					<BaseIcon
						hidden={!hasOverrides}
						onClick={GroupsActionsDispatchers.clearColorOverrides}
						title={formatMessage({ id: 'viewer.toolbar.icon.clearOverrides', defaultMessage: 'Clear Overrides' })}
					>
						<ClearOverridesIcon />
					</BaseIcon>
				</ExpansionBlock>
				<ExpansionBlock hidden={!hasHighlightedObjects && !hasHiddenObjects}>
					<BaseIcon
						hidden={!hasHiddenObjects}
						onClick={TreeActionsDispatchers.showAllNodes}
						title={formatMessage({ id: 'viewer.toolbar.icon.showAll', defaultMessage: 'Show All' })}
					>
						<EyeShowIcon />
					</BaseIcon>
					<BaseIcon
						hidden={!hasHighlightedObjects}
						onClick={TreeActionsDispatchers.hideSelectedNodes}
						title={formatMessage({ id: 'viewer.toolbar.icon.hide', defaultMessage: 'Hide' })}
					>
						<EyeHideIcon />
					</BaseIcon>
					<BaseIcon
						hidden={!hasHighlightedObjects}
						onClick={() => TreeActionsDispatchers.isolateSelectedNodes(undefined)}
						title={formatMessage({ id: 'viewer.toolbar.icon.isolate', defaultMessage: 'Isolate' })}
					>
						<EyeIsolateIcon />
					</BaseIcon>
				</ExpansionBlock>
			</ExpansionContainer>
		</MainContainer>
	);
};

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
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, ModelHooksSelectors, ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container } from './toolbar.styles';
import { NavigationIcons } from './icons/multioptionIcons/navigationIcons.component';
import { ProjectionIcons } from './icons/multioptionIcons/projectionIcons.component';
import { BaseIcon } from './icons/baseIcon.component';
import { ClipIcons } from './icons/multioptionIcons/clipIcons.component';

export const Toolbar = () => {
	const hasMetaData = ModelHooksSelectors.selectMetaKeysExist();
	const showBIMPanel = BimHooksSelectors.selectIsActive();
	const showCoords = ViewerGuiHooksSelectors.selectIsCoordViewActive();

	return (
		<Container>
			<BaseIcon
				onClick={() => ViewerGuiActionsDispatchers.goToHomeView()}
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
			{hasMetaData && (
				<BaseIcon
					selected={showBIMPanel}
					onClick={() => ViewerGuiActionsDispatchers.setPanelVisibility(!showBIMPanel)}
					title={formatMessage({ id: 'viewer.toolbar.icon.bim', defaultMessage: 'BIM' })}
				>
					<InfoIcon />
				</BaseIcon>
			)}
		</Container>
	);
};

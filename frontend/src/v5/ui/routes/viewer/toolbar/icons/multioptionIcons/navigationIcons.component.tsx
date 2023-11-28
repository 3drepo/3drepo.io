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

import RotateIcon from '@assets/icons/viewer/rotate.svg';
import ResetIcon from '@assets/icons/viewer/reset.svg';
import PlusIcon from '@assets/icons/viewer/plus.svg';
import MinusIcon from '@assets/icons/viewer/minus.svg';
import HelicopterIcon from '@assets/icons/viewer/helicopter.svg';
import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useState } from 'react';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { INITIAL_HELICOPTER_SPEED, MAX_HELICOPTER_SPEED, MIN_HELICOPTER_SPEED } from '@/v4/constants/viewer';
import { MultiOptionIconContainer, FloatingIconsContainer, FloatingIcon } from './multioptionIcons.styles';
import { NavigationMode } from '../../toolbar.types';
import { BaseIcon } from '../baseIcon.component';

const turntableTooltipText = formatMessage({ id: 'viewer.toolbar.icon.navigation.turntable', defaultMessage: 'Turntable' });
const helicopterTooltipText = formatMessage({ id: 'viewer.toolbar.icon.navigation.helicopter', defaultMessage: 'Helicopter View' });
export const NavigationIcons = () => {
	const { teamspace, containerOrFederation } = useParams<ViewerParams>();
	const [expanded, setExpanded] = useState(false);
	const navigationMode: NavigationMode = ViewerGuiHooksSelectors.selectNavigationMode();
	const helicopterSpeed = ViewerGuiHooksSelectors.selectHelicopterSpeed();

	const setMode = (mode: NavigationMode) => {
		setExpanded(false);
		ViewerGuiActionsDispatchers.setNavigationMode(mode);
	};

	if (navigationMode === 'TURNTABLE') {
		return (
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<MultiOptionIconContainer>
					{expanded && (
						<FloatingIconsContainer>
							<FloatingIcon onClick={() => setMode('HELICOPTER')} title={helicopterTooltipText}>
								<HelicopterIcon />
							</FloatingIcon>
						</FloatingIconsContainer>
					)}
					<BaseIcon onClick={() => setExpanded(!expanded)} title={turntableTooltipText}>
						<RotateIcon />
					</BaseIcon>
				</MultiOptionIconContainer>
			</ClickAwayListener>
		);
	}

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<MultiOptionIconContainer>
				{expanded && (
					<FloatingIconsContainer>
						<FloatingIcon
							onClick={() => ViewerGuiActionsDispatchers.resetHelicopterSpeed(teamspace, containerOrFederation)}
							title={formatMessage({ id: 'viewer.toolbar.icon.navigation.helicopter.resetSpeed', defaultMessage: 'Reset speed' })}
							disabled={helicopterSpeed === INITIAL_HELICOPTER_SPEED}
						>
							<ResetIcon />
						</FloatingIcon>
						<FloatingIcon
							onClick={() => ViewerGuiActionsDispatchers.increaseHelicopterSpeed(teamspace, containerOrFederation)}
							title={
								formatMessage({
									id: 'viewer.toolbar.icon.navigation.helicopter.increaseSpeed',
									defaultMessage: 'Increase speed to {speed}',
								}, { speed: helicopterSpeed + 1 })
							}
							disabled={helicopterSpeed === MAX_HELICOPTER_SPEED}
						>
							<PlusIcon />
						</FloatingIcon>
						<FloatingIcon
							onClick={() => ViewerGuiActionsDispatchers.decreaseHelicopterSpeed(teamspace, containerOrFederation)}
							title={
								formatMessage({
									id: 'viewer.toolbar.icon.navigation.helicopter.decreaseSpeed',
									defaultMessage: 'Decrease speed to {speed}',
								}, { speed: helicopterSpeed - 1 })
							}
							disabled={helicopterSpeed === MIN_HELICOPTER_SPEED}
						>
							<MinusIcon />
						</FloatingIcon>
						<FloatingIcon onClick={() => setMode('TURNTABLE')} title={turntableTooltipText}>
							<RotateIcon />
						</FloatingIcon>
					</FloatingIconsContainer>
				)}
				<BaseIcon onClick={() => setExpanded(!expanded)} title={helicopterTooltipText}>
					<HelicopterIcon />
				</BaseIcon>
			</MultiOptionIconContainer>
		</ClickAwayListener>
	);
};

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

import PerspectiveIcon from '@assets/icons/viewer/perspective_view.svg';
import OrthogonalIcon from '@assets/icons/viewer/orthogonal_view.svg';
import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useState } from 'react';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiOptionIconContainer, FloatingIconsContainer, FloatingIcon } from './multioptionIcons.styles';
import { ProjectionMode } from '../../toolbar.types';
import { BaseIcon } from '../baseIcon.component';

const orthographicTooltipText = formatMessage({ id: 'viewer.toolbar.icon.projection.orthographic', defaultMessage: 'Orthographic View' });
const perspectiveTooltipText = formatMessage({ id: 'viewer.toolbar.icon.projection.perspective', defaultMessage: 'Perspective View' });
export const ProjectionIcons = () => {
	const projectionMode = ViewerGuiHooksSelectors.selectProjectionMode();
	const [expanded, setExpanded] = useState(false);

	const setMode = (mode: ProjectionMode) => {
		setExpanded(false);
		ViewerGuiActionsDispatchers.setProjectionMode(mode);
	};

	if (projectionMode === 'orthographic') {
		return (
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<MultiOptionIconContainer>
					{expanded && (
						<FloatingIconsContainer>
							<FloatingIcon onClick={() => setMode('perspective')} title={perspectiveTooltipText}>
								<PerspectiveIcon />
							</FloatingIcon>
						</FloatingIconsContainer>
					)}
					<BaseIcon onClick={() => setExpanded(!expanded)} title={orthographicTooltipText}>
						<OrthogonalIcon />
					</BaseIcon>
				</MultiOptionIconContainer>
			</ClickAwayListener>
		);
	}

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<MultiOptionIconContainer>
				{expanded && (
					<FloatingIconsContainer hidden={!expanded}>
						<FloatingIcon onClick={() => setMode('orthographic')} title={orthographicTooltipText}>
							<OrthogonalIcon />
						</FloatingIcon>
					</FloatingIconsContainer>
				)}
				<BaseIcon onClick={() => setExpanded(!expanded)} title={perspectiveTooltipText}>
					<PerspectiveIcon />
				</BaseIcon>
			</MultiOptionIconContainer>
		</ClickAwayListener>
	);
};

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
import { ButtonOptionsContainer, FloatingButtonsContainer, FloatingButton } from './multioptionIcons.styles';
import { ProjectionMode } from '../../toolbar.types';
import { ToolbarButton } from '../toolbarButton.component';

const orthographicTooltipText = formatMessage({ id: 'viewer.toolbar.icon.projection.orthographic', defaultMessage: 'Orthographic View' });
const perspectiveTooltipText = formatMessage({ id: 'viewer.toolbar.icon.projection.perspective', defaultMessage: 'Perspective View' });
export const ProjectionButtons = () => {
	const projectionMode = ViewerGuiHooksSelectors.selectProjectionMode();
	const [expanded, setExpanded] = useState(false);

	const setMode = (mode: ProjectionMode) => {
		setExpanded(false);
		ViewerGuiActionsDispatchers.goToHomeView();
		ViewerGuiActionsDispatchers.setProjectionMode(mode);
	};

	if (projectionMode === 'orthographic') {
		return (
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<ButtonOptionsContainer $expanded={expanded}>
					{expanded && (
						<FloatingButtonsContainer>
							<FloatingButton Icon={PerspectiveIcon} onClick={() => setMode('perspective')} title={perspectiveTooltipText} />
						</FloatingButtonsContainer>
					)}
					<ToolbarButton Icon={OrthogonalIcon} selected={expanded} onClick={() => setExpanded(!expanded)} title={!expanded ? orthographicTooltipText : ''} />
				</ButtonOptionsContainer>
			</ClickAwayListener>
		);
	}

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer $expanded={expanded}>
				{expanded && (
					<FloatingButtonsContainer hidden={!expanded}>
						<FloatingButton Icon={OrthogonalIcon} onClick={() => setMode('orthographic')} title={orthographicTooltipText} />
					</FloatingButtonsContainer>
				)}
				<ToolbarButton Icon={PerspectiveIcon} selected={expanded} onClick={() => setExpanded(!expanded)} title={!expanded ? perspectiveTooltipText : ''} />
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};

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

import ClipPlaneIcon from '@assets/icons/viewer/clipping_plane.svg';
import ClipBoxIcon from '@assets/icons/viewer/clipping_box.svg';
import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useEffect, useState } from 'react';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { ButtonOptionsContainer, FloatingButtonsContainer, FloatingButton } from './multioptionIcons.styles';
import { ClipMode } from '../../toolbar.types';
import { ToolbarButton } from '../toolbarButton.component';

const clipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.clip', defaultMessage: 'Clip' });
const startBoxClipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.clip.startBox', defaultMessage: 'Start Box Clip' });
const startSingleClipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.clip.clip', defaultMessage: 'Start Single Clip' });
export const ClipButtons = () => {
	const [expanded, setExpanded] = useState(false);
	const clipMode: ClipMode = ViewerGuiHooksSelectors.selectClippingMode();

	const setMode = (mode: ClipMode) => {
		setExpanded(false);
		ViewerGuiActionsDispatchers.setClippingMode(mode);
	};

	useEffect(() => {
		Viewer.on(VIEWER_EVENTS.UPDATE_NUM_CLIP, ViewerGuiActionsDispatchers.updateClipState);
		return () => Viewer.off(VIEWER_EVENTS.UPDATE_NUM_CLIP, ViewerGuiActionsDispatchers.updateClipState);
	}, []);

	if (clipMode === null) {
		return (
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<ButtonOptionsContainer>
					{expanded && (
						<FloatingButtonsContainer>
							<FloatingButton onClick={() => setMode('BOX')} title={startBoxClipTooltipText}>
								<ClipBoxIcon />
							</FloatingButton>
							<FloatingButton onClick={() => setMode('SINGLE')} title={startSingleClipTooltipText}>
								<ClipPlaneIcon />
							</FloatingButton>
						</FloatingButtonsContainer>
					)}
					<ToolbarButton onClick={() => setExpanded(!expanded)} title={!expanded ? clipTooltipText : ''}>
						<ClipPlaneIcon />
					</ToolbarButton>
				</ButtonOptionsContainer>
			</ClickAwayListener>
		);
	}

	return (
		<ToolbarButton title={clipTooltipText} selected>
			{clipMode === 'SINGLE' ? <ClipPlaneIcon /> : <ClipBoxIcon />}
		</ToolbarButton>
	);
};

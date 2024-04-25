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
import { VIEWER_CLIP_MODES, VIEWER_EVENTS } from '@/v4/constants/viewer';
import { ButtonOptionsContainer, FloatingButtonsContainer, FloatingButton } from './multioptionIcons.styles';
import { ClipMode } from '../../toolbar.types';
import { ToolbarButton } from '../toolbarButton.component';

const clipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.sectioning', defaultMessage: 'Sectioning' });
const startBoxClipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.sectioning.boxSection', defaultMessage: 'Section By Box' });
const startSingleClipTooltipText = formatMessage({ id: 'viewer.toolbar.icon.sectioning.planeSection', defaultMessage: 'Section By Plane' });

export const ClipButtons = () => {
	const [expanded, setExpanded] = useState(false);
	const clipMode: ClipMode = ViewerGuiHooksSelectors.selectClippingMode();
	const isClipEdit = ViewerGuiHooksSelectors.selectIsClipEdit();

	const setMode = (mode: ClipMode) => {
		setExpanded(false);
		ViewerGuiActionsDispatchers.setClippingMode(mode);
		ViewerGuiActionsDispatchers.setClipEdit(true);
	};

	useEffect(() => {
		Viewer.on(VIEWER_EVENTS.UPDATE_CLIP_EDIT, ViewerGuiActionsDispatchers.setClipEdit);
		Viewer.on(VIEWER_EVENTS.UPDATE_CLIP_MODE, (mode: ClipMode) => ViewerGuiActionsDispatchers.setClippingMode(mode));
		return () => {
			Viewer.off(VIEWER_EVENTS.UPDATE_CLIP_EDIT, ViewerGuiActionsDispatchers.setClipEdit);
			Viewer.off(VIEWER_EVENTS.UPDATE_CLIP_MODE, () => ViewerGuiActionsDispatchers.setClippingMode(null));
		};
	}, []);

	if (clipMode === null) {
		return (
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<ButtonOptionsContainer $expanded={expanded}>
					{expanded && (
						<FloatingButtonsContainer>
							<FloatingButton Icon={ClipBoxIcon} onClick={() => setMode(VIEWER_CLIP_MODES.BOX)} title={startBoxClipTooltipText} />
							<FloatingButton Icon={ClipPlaneIcon} onClick={() => setMode(VIEWER_CLIP_MODES.SINGLE)} title={startSingleClipTooltipText} />
						</FloatingButtonsContainer>
					)}
					<ToolbarButton Icon={ClipPlaneIcon} selected={expanded} onClick={() => setExpanded(!expanded)} title={!expanded ? clipTooltipText : ''} />
				</ButtonOptionsContainer>
			</ClickAwayListener>
		);
	}

	return (
		<ToolbarButton
			Icon={clipMode === 'SINGLE' ? ClipPlaneIcon : ClipBoxIcon}
			title={clipTooltipText}
			selected={isClipEdit}
			onClick={() => ViewerGuiActionsDispatchers.setClipEdit(!isClipEdit)}
		/>
	);
};

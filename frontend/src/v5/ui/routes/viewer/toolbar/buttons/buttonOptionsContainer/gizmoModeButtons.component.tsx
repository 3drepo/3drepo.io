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

import GizmoRotateIcon from '@assets/icons/viewer/gizmo_rotate.svg';
import GizmoScaleIcon from '@assets/icons/viewer/gizmo_scale.svg';
import GizmoTranslateIcon from '@assets/icons/viewer/gizmo_translate.svg';
import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useState } from 'react';
import { VIEWER_CLIP_MODES, VIEWER_GIZMO_MODES } from '@/v4/constants/viewer';
import { ButtonOptionsContainer, FloatingButtonsContainer, FloatingButton } from './multioptionIcons.styles';
import { GizmoMode } from '../../toolbar.types';
import { ToolbarButton } from '../toolbarButton.component';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';

const GIZMO_OPTIONS = {
	[VIEWER_GIZMO_MODES.TRANSLATE]: {
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.move', defaultMessage: 'Move' }),
		Icon: GizmoTranslateIcon,
	},
	[VIEWER_GIZMO_MODES.SCALE]: {
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.resize', defaultMessage: 'Resize' }),
		Icon: GizmoScaleIcon,
	},
	[VIEWER_GIZMO_MODES.ROTATE]: {
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.rotate', defaultMessage: 'Rotate' }),
		Icon: GizmoRotateIcon,
	},
};

export const GizmoModeButtons = ({ disabled, ...props }) => {
	const [expanded, setExpanded] = useState(false);
	const isBoxClippingMode = ViewerGuiHooksSelectors.selectClippingMode() === VIEWER_CLIP_MODES.BOX;
	const gizmoMode = ViewerGuiHooksSelectors.selectGizmoMode();

	const setMode = (mode: GizmoMode) => {
		if (disabled) return;
		setExpanded(false);
		ViewerGuiActionsDispatchers.setGizmoMode(mode);
	};

	const FloatingGizmoButton = ({ mode }) => <FloatingButton {...GIZMO_OPTIONS[mode]} onClick={() => setMode(mode)} />;

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer disabled={disabled}>
				{expanded && (
					<FloatingButtonsContainer>
						{gizmoMode !== VIEWER_GIZMO_MODES.TRANSLATE && <FloatingGizmoButton mode={VIEWER_GIZMO_MODES.TRANSLATE} />}
						{gizmoMode !== VIEWER_GIZMO_MODES.SCALE && isBoxClippingMode && <FloatingGizmoButton mode={VIEWER_GIZMO_MODES.SCALE} />}
						{gizmoMode !== VIEWER_GIZMO_MODES.ROTATE && <FloatingGizmoButton mode={VIEWER_GIZMO_MODES.ROTATE} />}
					</FloatingButtonsContainer>
				)}
				<ToolbarButton Icon={GIZMO_OPTIONS[gizmoMode].Icon} onClick={() => setExpanded(!expanded)} title={!expanded ? GIZMO_OPTIONS[gizmoMode].title : ''} disabled={disabled} {...props} />
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};

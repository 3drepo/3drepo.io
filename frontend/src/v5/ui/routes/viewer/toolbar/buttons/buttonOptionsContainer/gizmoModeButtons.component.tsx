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
import { UnityUtil } from '@/globals/unity-util';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';

const OPTIONS = [
	{
		option: VIEWER_GIZMO_MODES.TRANSLATE,
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.translate', defaultMessage: 'Translate' }),
		icon: GizmoTranslateIcon,
		onClick: () => UnityUtil.clipToolTranslate(),
	},
	{
		option: VIEWER_GIZMO_MODES.SCALE,
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.scale', defaultMessage: 'Scale' }),
		icon: GizmoScaleIcon,
		onClick: () => UnityUtil.clipToolScale(),
	},
	{
		option: VIEWER_GIZMO_MODES.ROTATE,
		title: formatMessage({ id: 'viewer.toolbar.icon.gizmoModes.rotate', defaultMessage: 'Rotate' }),
		icon: GizmoRotateIcon,
		onClick: () => UnityUtil.clipToolRotate(),
	},
];

export const GizmoModeButtons = () => {
	const [expanded, setExpanded] = useState(false);
	
	const isBoxClippingMode = ViewerGuiHooksSelectors.selectClippingMode() === VIEWER_CLIP_MODES.BOX;
	const isClipEdit = ViewerGuiHooksSelectors.selectIsClipEdit();
	
	const [gizmoMode, setGizmoMode] = useState<GizmoMode>(VIEWER_GIZMO_MODES.TRANSLATE); // todo reduxify

	const currentMode = OPTIONS.find(({ option }) => option === gizmoMode);
	const otherModes = OPTIONS.filter(({ option }) => {
		if (!isBoxClippingMode && option === VIEWER_GIZMO_MODES.SCALE) return;
		return option !== gizmoMode;
	});

	const setMode = (mode: GizmoMode) => {
		setExpanded(false);
		OPTIONS.find(({ option }) => option === mode).onClick();
		// ViewerGuiActionsDispatchers.setGizmoMode(mode);
		setGizmoMode(mode); // todo reduxify
	};

	// useEffect(() => {
	// Viewer.on(VIEWER_EVENTS.UPDATE_NUM_CLIP, ViewerGuiActionsDispatchers.updateClipState);
	// return () => Viewer.off(VIEWER_EVENTS.UPDATE_NUM_CLIP, ViewerGuiActionsDispatchers.updateClipState);
	// }, []);

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer>
				{expanded && (
					<FloatingButtonsContainer>
						{otherModes.map(({ option, title, icon: Icon }) => <FloatingButton key={option} Icon={Icon} onClick={() => setMode(option)} title={title} />)}
					</FloatingButtonsContainer>
				)}
				<ToolbarButton Icon={currentMode.icon} onClick={() => setExpanded(!expanded)} title={!expanded ? currentMode.title : ''} hidden={!isClipEdit} />
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};

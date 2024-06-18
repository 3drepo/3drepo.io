/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import FlipPlaneIcon from '@assets/icons/viewer/flip_plane.svg';
import AlignIcon from '@assets/icons/viewer/align.svg';
import CancelIcon from '@assets/icons/viewer/delete.svg';
import { formatMessage } from '@/v5/services/intl';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { VIEWER_CLIP_MODES, VIEWER_EVENTS } from '@/v4/constants/viewer';
import { Viewer } from '@/v4/services/viewer/viewer';
import { useContext, useEffect, useState } from 'react';
import { Container } from '@controls/toolbarSelect/toolbarSelect.styles';
import { ClearIcon, Section } from '@/v5/ui/routes/viewer/toolbar/selectionToolbar/selectionToolbar.styles';
import { GizmoModeButtons } from '@/v5/ui/routes/viewer/toolbar/buttons/buttonOptionsContainer/gizmoModeButtons.component';
import { ToolbarButton } from '@/v5/ui/routes/viewer/toolbar/buttons/toolbarButton.component';
import { CalibrationContext } from '../../calibrationContext';
import { ClearCalibrationButton } from './calibrationSectionToolbar.styles';

export const CalibrationSectionToolbar = () => {
	const { arrow3D, setArrow3D } = useContext(CalibrationContext);
	const [alignActive, setAlignActive] = useState(false);

	const clippingMode = ViewerGuiHooksSelectors.selectClippingMode();
	const clippingSectionOpen = ViewerGuiHooksSelectors.selectIsClipEdit();
	const isBoxClippingMode = clippingMode === VIEWER_CLIP_MODES.BOX;

	const onClickAlign = () => {
		Viewer.clipToolRealign();
		setAlignActive(true);
	};

	useEffect(() => {
		if (alignActive) {
			Viewer.on(VIEWER_EVENTS.UPDATE_CLIP, () => setAlignActive(false));
			Viewer.on(VIEWER_EVENTS.BACKGROUND_SELECTED, () => setAlignActive(false));
		}
		return () => {
			Viewer.off(VIEWER_EVENTS.UPDATE_CLIP, () => setAlignActive(false));
			Viewer.off(VIEWER_EVENTS.BACKGROUND_SELECTED, () => setAlignActive(false));
		};
	}, [alignActive]);
	

	return (
		<Container>
			<Section hidden={!clippingSectionOpen}>
				<GizmoModeButtons hidden={!clippingSectionOpen} disabled={alignActive} />
				<ToolbarButton
					Icon={FlipPlaneIcon}
					hidden={!clippingSectionOpen || isBoxClippingMode}
					onClick={Viewer.clipToolFlip}
					title={formatMessage({ id: 'viewer.toolbar.icon.flipPlane', defaultMessage: 'Flip Plane' })}
				/>
				<ToolbarButton
					Icon={AlignIcon}
					hidden={!clippingSectionOpen}
					onClick={onClickAlign}
					selected={alignActive}
					title={formatMessage({ id: 'viewer.toolbar.icon.alignToSurface', defaultMessage: 'Align To Surface' })}
				/>
				<ToolbarButton
					Icon={CancelIcon}
					hidden={!clippingSectionOpen}
					onClick={() => ViewerGuiActionsDispatchers.setClippingMode(null)}
					title={formatMessage({ id: 'viewer.toolbar.icon.deleteClip', defaultMessage: 'Delete' })}
				/>
			</Section>
			<Section hidden={!arrow3D.start}>
				<ClearCalibrationButton
					hidden={!arrow3D.start}
					disabled={!arrow3D.start}
					onClick={() => setArrow3D({ start: null, end: null })}
				>
					<ClearIcon />
					<FormattedMessage id="viewer.toolbar.icon.clearCalibration.start" defaultMessage="Clear Start" />
				</ClearCalibrationButton>
				<ClearCalibrationButton
					hidden={!arrow3D.end}
					disabled={!arrow3D.end}
					onClick={() => setArrow3D({ ...arrow3D, end: null })}
				>
					<ClearIcon />
					<FormattedMessage id="viewer.toolbar.icon.clearCalibration.end" defaultMessage="Clear End" />
				</ClearCalibrationButton>
			</Section>
		</Container>
	);
};

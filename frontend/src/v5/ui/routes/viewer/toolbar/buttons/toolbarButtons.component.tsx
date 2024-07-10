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

import HomeIcon from '@assets/icons/viewer/home.svg';
import FocusIcon from '@assets/icons/viewer/focus.svg';
import CoordinatesIcon from '@assets/icons/viewer/coordinates.svg';
import InfoIcon from '@assets/icons/viewer/info.svg';
import VerticalCalibrationIcon from '@assets/icons/viewer/vertical_calibration.svg';
import CalibrationIcon from '@assets/icons/filled/calibration-filled.svg';
import { BimActionsDispatchers, CalibrationActionsDispatchers, MeasurementsActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, CalibrationHooksSelectors, ModelHooksSelectors, ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';
import { ToolbarButton } from './toolbarButton.component';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { VerticalHeightContainer, VerticalHeightValue } from '../selectionToolbar/selectionToolbar.styles';
import { PlaneType } from '@/v5/store/calibration/calibration.types';

export const HomeButton = () => (
	<ToolbarButton
		Icon={HomeIcon}
		onClick={ViewerGuiActionsDispatchers.goToHomeView}
		title={formatMessage({ id: 'viewer.toolbar.icon.home', defaultMessage: 'Home' })}
	/>
);

export const FocusButton = () => (
	<ToolbarButton
		Icon={FocusIcon}
		onClick={() => ViewerGuiActionsDispatchers.setIsFocusMode(true)}
		title={formatMessage({ id: 'viewer.toolbar.icon.focus', defaultMessage: 'Focus' })}
	/>
);

export const CoordinatesButton = () => {
	const showCoords = ViewerGuiHooksSelectors.selectIsCoordViewActive();

	return (
		<ToolbarButton
			Icon={CoordinatesIcon}
			selected={showCoords}
			onClick={() => ViewerGuiActionsDispatchers.setCoordView(!showCoords)}
			title={formatMessage({ id: 'viewer.toolbar.icon.coordinates', defaultMessage: 'Show Coordinates' })}
		/>
	);
};

export const BimButton = () => {
	const hasMetaData = ModelHooksSelectors.selectMetaKeysExist();
	const showBIMPanel = BimHooksSelectors.selectIsActive();

	const setBIMPanelVisibililty = (visible) => {
		BimActionsDispatchers.setIsActive(visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.BIM, visible);
		ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);

		if (visible) {
			MeasurementsActionsDispatchers.setMeasureMode('');
		}
	};

	return (
		<ToolbarButton
			Icon={InfoIcon}
			hidden={!hasMetaData}
			selected={showBIMPanel}
			onClick={() => setBIMPanelVisibililty(!showBIMPanel)}
			title={formatMessage({ id: 'viewer.toolbar.icon.attributeData', defaultMessage: 'Attribute Data' })}
		/>
	);
};
export const CalibrationButton = () => {
	const isCalibratingModel = CalibrationHooksSelectors.selectIsCalibratingModel();
	const step = CalibrationHooksSelectors.selectStep();

	return (
		<ToolbarButton
			Icon={CalibrationIcon}
			hidden={step !== 0}
			selected={isCalibratingModel}
			onClick={() => CalibrationActionsDispatchers.setIsCalibratingModel(!isCalibratingModel)}
			title={formatMessage({ id: 'viewer.toolbar.icon.calibrate', defaultMessage: 'Calibrate' })} />
	);
};

export const VerticalCalibrationButton = () => {
	const step = CalibrationHooksSelectors.selectStep();
	const isCalibratingPlanes = CalibrationHooksSelectors.selectIsCalibratingPlanes();
	return (
		<ToolbarButton
			Icon={VerticalCalibrationIcon}
			hidden={step !== 2}
			selected={isCalibratingPlanes}
			onClick={() => CalibrationActionsDispatchers.setIsCalibratingPlanes(!isCalibratingPlanes)}
			title={formatMessage({ id: 'viewer.toolbar.icon.verticalCalibration', defaultMessage: 'Vertical Calibration' })}
		/>
	);
};

// TODO hidden logic
export const PlaneSeparation = ({ hidden }) => {
	const planesValues = CalibrationHooksSelectors.selectPlanesValues();
	const planesHeight = (planesValues?.[PlaneType.UPPER] - planesValues?.[PlaneType.LOWER]).toFixed(2);
	const unit = ModelHooksSelectors.selectUnit();
	return (
		<VerticalHeightContainer hidden={hidden} disabled>
			<VerticalHeightValue>{planesHeight}</VerticalHeightValue>{unit}
		</VerticalHeightContainer>
	);
};
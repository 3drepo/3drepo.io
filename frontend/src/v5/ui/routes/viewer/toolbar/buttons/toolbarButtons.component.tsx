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
import { BimActionsDispatchers, MeasurementsActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { BimHooksSelectors, ModelHooksSelectors, ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';
import { ToolbarButton } from './toolbarButton.component';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { VerticalRangeContainer, VerticalRangeValue } from '../selectionToolbar/selectionToolbar.styles';
import { useContext } from 'react';
import { CalibrationContext } from '../../../dashboard/projects/calibration/calibrationContext';
import { UNITS_CONVERSION_FACTORS_TO_METRES } from '../../../dashboard/projects/calibration/calibration.helpers';
import { CONTAINER_UNITS } from '@/v5/store/containers/containers.types';

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
	const { isCalibrating3D, setIsCalibrating3D, step } = useContext(CalibrationContext);

	return (
		<ToolbarButton
			Icon={CalibrationIcon}
			hidden={step !== 0}
			selected={isCalibrating3D}
			onClick={() => setIsCalibrating3D(!isCalibrating3D)}
			title={formatMessage({ id: 'viewer.toolbar.icon.calibrate', defaultMessage: 'Calibrate' })} />
	);
};

export const VerticalCalibrationButton = () => {
	const { isCalibratingPlanes, setIsCalibratingPlanes, step } = useContext(CalibrationContext);
	return (
		<ToolbarButton
			Icon={VerticalCalibrationIcon}
			hidden={step !== 2}
			selected={isCalibratingPlanes}
			onClick={() => setIsCalibratingPlanes(!isCalibratingPlanes)}
			title={formatMessage({ id: 'viewer.toolbar.icon.verticalCalibration', defaultMessage: 'Vertical Calibration' })}
		/>
	);
};

export const VerticalRange = () => {
	const { verticalPlanes, isCalibratingPlanes } = useContext(CalibrationContext);
	const unit = ModelHooksSelectors.selectUnit();
	const isMetric = unit !== 'ft';
	const conversionFactor = isMetric ? UNITS_CONVERSION_FACTORS_TO_METRES[unit] : 1;
	const rangeValue = ((verticalPlanes?.[1] - verticalPlanes?.[0]) / conversionFactor).toFixed(2);
	const unitLabel = CONTAINER_UNITS.find(({ value }) => value === (isMetric ? 'm' : 'ft')).abbreviation;
	return (
		<VerticalRangeContainer hidden={!isCalibratingPlanes} disabled>
			<VerticalRangeValue>{rangeValue}</VerticalRangeValue>{unitLabel}
		</VerticalRangeContainer>
	);
};

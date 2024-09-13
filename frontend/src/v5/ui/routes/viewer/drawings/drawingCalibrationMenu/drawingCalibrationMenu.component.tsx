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

import { CalibrationState } from '@/v5/store/drawings/drawings.types';
import { ActionMenu } from '@controls/actionMenu';
import { FormattedMessage } from 'react-intl';
import { DrawingsCalibrationButton } from './drawingCalibrationMenu.styles';
import { DashboardListItemButtonProps } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemButton/dashboardListItemButton.component';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { MenuList } from '@mui/material';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { formatMessage } from '@/v5/services/intl';
import { DashboardParams } from '../../../routes.constants';

type DrawingsCalibrationMenuProps = DashboardListItemButtonProps & {
	calibrationState: CalibrationState;
	onCalibrateClick: () => void;
	drawingId: string;
};
export const DrawingsCalibrationMenu = ({ calibrationState, onCalibrateClick, drawingId, disabled, ...props }: DrawingsCalibrationMenuProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const disableButton = disabled || calibrationState === CalibrationState.EMPTY;

	const approveCalibration = () => DrawingsActionsDispatchers.approveCalibrationValues(teamspace, project, drawingId);

	return (
		<ActionMenu
			disabled={disableButton}
			TriggerButton={(
				<DrawingsCalibrationButton
					calibrationState={calibrationState}
					disabled={disableButton}
					tooltipTitle={!disableButton && <FormattedMessage id="calibration.menu.tooltip" defaultMessage="Calibrate" />}
					{...props}
				/>
			)}
		>
			<MenuList>
				{calibrationState === CalibrationState.UNCONFIRMED && (
					<EllipsisMenuItem
						onClick={approveCalibration}
						title={formatMessage({ defaultMessage: 'Approve Calibration', id: 'calibration.menu.approveCalibration' })}
					/>
				)}
				{[CalibrationState.CALIBRATED, CalibrationState.UNCONFIRMED].includes(calibrationState) && (
					<EllipsisMenuItem
						onClick={onCalibrateClick}
						title={formatMessage({ defaultMessage: 'Recalibrate', id: 'calibration.menu.recalibrate' })}
					/>
				)}
				{calibrationState === CalibrationState.UNCALIBRATED && (
					<EllipsisMenuItem
						onClick={onCalibrateClick}
						title={formatMessage({ defaultMessage: 'Calibrate', id: 'calibration.menu.calibrate' })}
					/>
				)}
			</MenuList>
		</ActionMenu>
	);
};

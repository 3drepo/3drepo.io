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
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { DrawingsCalibrationButton } from './drawingCalibrationMenu.styles';
import { DashboardListItemButtonProps } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemButton/dashboardListItemButton.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { MenuList } from '@mui/material';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { formatMessage } from '@/v5/services/intl';

type DrawingsCalibrationMenuProps = DashboardListItemButtonProps & {
	calibration: CalibrationState;
	onCalibrateClick: () => void;
	drawingId: string;
};
export const DrawingsCalibrationMenu = ({ calibration, onCalibrateClick, drawingId, ...props }: DrawingsCalibrationMenuProps) => {
	const { teamspace, project } = useParams();
	const disabled = props.disabled || calibration === CalibrationState.EMPTY;

	const handleCalibrateClick = (close) => {
		onCalibrateClick();
		close();
	};

	const approveCalibration = (close) => {
		DrawingsActionsDispatchers.updateDrawing(teamspace, project, drawingId, { calibration: CalibrationState.CALIBRATED });
		close();
	};

	return (
		<ActionMenu
			disabled={disabled}
			TriggerButton={(
				<DrawingsCalibrationButton
					calibration={calibration}
					disabled={disabled}
					tooltipTitle={!disabled && <FormattedMessage id="calibration.menu.tooltip" defaultMessage="Calibrate" />}
					{...props}
				/>
			)}
		>
			<MenuList>
				{calibration === CalibrationState.OUT_OF_SYNC && (
					<EllipsisMenuItem
						onClick={approveCalibration}
						title={formatMessage({ defaultMessage: 'Approve Calibration', id: 'calibration.menu.approveCalibration' })}
					/>
				)}
				{[CalibrationState.CALIBRATED, CalibrationState.OUT_OF_SYNC].includes(calibration) && (
					<EllipsisMenuItem
						onClick={handleCalibrateClick}
						title={formatMessage({ defaultMessage: 'Recalibrate', id: 'calibration.menu.recalibrate' })}
					/>
				)}
				{calibration === CalibrationState.UNCALIBRATED && (
					<EllipsisMenuItem
						onClick={handleCalibrateClick}
						title={formatMessage({ defaultMessage: 'Calibrate', id: 'calibration.menu.calibrate' })}
					/>
				)}
			</MenuList>
		</ActionMenu>
	);
};

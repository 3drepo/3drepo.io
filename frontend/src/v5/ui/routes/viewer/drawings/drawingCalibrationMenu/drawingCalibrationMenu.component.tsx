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

import { CalibrationStatus } from '@/v5/store/drawings/drawings.types';
import { ActionMenu } from '@controls/actionMenu';
import { FormattedMessage } from 'react-intl';
import { DrawingsCalibrationButton } from './drawingCalibrationMenu.styles';
import { DashboardListItemButtonProps } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemButton/dashboardListItemButton.component';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { MenuList } from '@mui/material';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { formatMessage } from '@/v5/services/intl';
import { DashboardParams } from '../../../routes.constants';
import { DrawingRevisionsHooksSelectors, DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';

type DrawingsCalibrationMenuProps = Omit<DashboardListItemButtonProps, 'disabled'> & {
	calibrationStatus: CalibrationStatus;
	onCalibrateClick: () => void;
	drawingId: string;
};
export const DrawingsCalibrationMenu = ({ calibrationStatus, onCalibrateClick, drawingId, ...props }: DrawingsCalibrationMenuProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const hasCollaboratorAccess = DrawingsHooksSelectors.selectHasCollaboratorAccess(drawingId);
	const disableButton = !hasCollaboratorAccess || calibrationStatus === CalibrationStatus.EMPTY;
	const latestRevision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawingId);

	const onApproveCalibration = () => {
		const approveCalibration = () => DrawingsActionsDispatchers.approveCalibration(teamspace, project, drawingId);
		if (latestRevision?._id) {
			approveCalibration();
		} else {
			DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId, approveCalibration);
		}
	};

	return (
		<ActionMenu
			disabled={disableButton}
			TriggerButton={(
				<DrawingsCalibrationButton
					calibrationStatus={calibrationStatus}
					disabled={disableButton}
					tooltipTitle={!disableButton && <FormattedMessage id="calibration.menu.tooltip" defaultMessage="Calibrate" />}
					{...props}
				/>
			)}
		>
			<MenuList>
				{calibrationStatus === CalibrationStatus.UNCONFIRMED && (
					<EllipsisMenuItem
						onClick={onApproveCalibration}
						title={formatMessage({ defaultMessage: 'Approve Calibration', id: 'calibration.menu.approveCalibration' })}
					/>
				)}
				{[CalibrationStatus.CALIBRATED, CalibrationStatus.UNCONFIRMED].includes(calibrationStatus) && (
					<EllipsisMenuItem
						onClick={onCalibrateClick}
						title={formatMessage({ defaultMessage: 'Recalibrate', id: 'calibration.menu.recalibrate' })}
					/>
				)}
				{calibrationStatus === CalibrationStatus.UNCALIBRATED && (
					<EllipsisMenuItem
						onClick={onCalibrateClick}
						title={formatMessage({ defaultMessage: 'Calibrate', id: 'calibration.menu.calibrate' })}
					/>
				)}
			</MenuList>
		</ActionMenu>
	);
};

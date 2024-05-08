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
import { useParams } from 'react-router-dom';
import { DrawingsCalibrationButton } from './drawingCalibrationMenu.styles';
import { DialogsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { SelectModelForCalibration } from '../../../dashboard/projects/drawings/drawingsList/drawingsListItem/selectModelForCalibration/selectModelForCalibration.component';
import { DashboardListItemButtonProps } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemButton/dashboardListItemButton.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';

type DrawingsCalibrationMenuProps = DashboardListItemButtonProps & {
	calibration: CalibrationState,
	drawingId: string,
};
export const DrawingsCalibrationMenu = ({ drawingId, calibration, ...props }: DrawingsCalibrationMenuProps) => {
	const { teamspace, project } = useParams();
	const disabled = props.disabled || calibration === CalibrationState.EMPTY;

	const openCalibrationModelSelect = (close) => {
		DialogsActionsDispatchers.open(SelectModelForCalibration, { drawingId });
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
			<ActionMenuContext.Consumer>
				{({ close }) => (
					<>
						{calibration === CalibrationState.OUT_OF_SYNC && (
							<Button onClick={() => approveCalibration(close)}>
								<FormattedMessage defaultMessage="Approve Calibration" id="calibration.menu.approveCalibration" />
							</Button>
						)}
						{[CalibrationState.CALIBRATED, CalibrationState.OUT_OF_SYNC].includes(calibration) && (
							<Button onClick={() => openCalibrationModelSelect(close)}>
								<FormattedMessage defaultMessage="Recalibrate" id="calibration.menu.recalibrate" />
							</Button>
						)}
						{calibration === CalibrationState.UNCALIBRATED && (
							<Button onClick={() => openCalibrationModelSelect(close)}>
								<FormattedMessage defaultMessage="Calibrate" id="calibration.menu.calibrate" />
							</Button>
						)}
					</>
				)}
			</ActionMenuContext.Consumer>
		</ActionMenu>
	);
};

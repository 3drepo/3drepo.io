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

import { CALIBRATION_MAP } from '@/v5/store/drawings/drawings.helpers';
import { CalibrationStates } from '@/v5/store/drawings/drawings.types';
import { DashboardListItemButton } from '@components/dashboard/dashboardList/dashboardListItem/components';
import styled, { css } from 'styled-components';

const calibratedStyles = css`
	color: ${({ theme }) => theme.palette.success.main};
	background-color: ${({ theme }) => theme.palette.success.lightest};
`;

const outOfSyncStyles = css`
	color: ${({ theme }) => theme.palette.warning.dark};
	background-color: ${({ theme }) => theme.palette.warning.lightest};
`;

const uncalibratedStyles = css`
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.lightest};
`;

const emptyStyles = css`
	color: ${({ theme }) => theme.palette.base.mid};
	background-color: ${({ theme }) => theme.palette.secondary.lightest};
	pointer-events: none;
	cursor: initial;
`;

export const CALIBRATION_STYLE = {
	[CalibrationStates.CALIBRATED]: calibratedStyles,
	[CalibrationStates.OUT_OF_SYNC]: outOfSyncStyles,
	[CalibrationStates.UNCALIBRATED]: uncalibratedStyles,
	[CalibrationStates.EMPTY]: emptyStyles,
};
export const DrawingsCalibrationButton = styled(DashboardListItemButton).attrs<{ calibration: CalibrationStates }>(({ calibration }) => ({
	children: CALIBRATION_MAP[calibration]?.label,
	startIcon: CALIBRATION_MAP[calibration]?.icon,
}))<{ calibration: string }>`
	.MuiButtonBase-root {
		${({ calibration }) => CALIBRATION_STYLE[calibration]}
	}
	/* Need to set visibility to visible to fix weird bug where icons in bottom list disappear when top list is collapsed */
	svg {
		visibility: visible;
	}
`;

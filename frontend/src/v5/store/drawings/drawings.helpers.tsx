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

import { formatMessage } from '@/v5/services/intl';
import WarningIcon from '@assets/icons/outlined/warning-outlined.svg';
import CalibratedIcon from '@assets/icons/filled/calibration-filled.svg';
import NotCalibrated from '@assets/icons/filled/no_calibration-filled.svg';

export const DRAWING_LIST_COLUMN_WIDTHS = {
	name: 90,
	revisionsCount: 165,
	calibration: 165,
	code: 190,
	type: 120,
	lastUpdated: 135,
	actions: 72,
};

export const DRAWINGS_SEARCH_FIELDS = ['name', 'latestRevision', 'type', 'code', 'status'];

export const CALIBRATION_MAP = {
	calibrated: {
		label: formatMessage({ id: 'drawings.calibration.calibrated', defaultMessage: 'Calibrated' }),
		icon: <CalibratedIcon />,
	},
	outOfSync: {
		label: formatMessage({ id: 'drawings.calibration.outOfSync', defaultMessage: 'Calibrated' }),
		icon: <WarningIcon />,
	},
	uncalibrated: {
		label: formatMessage({ id: 'drawings.calibration.uncalibrated', defaultMessage: 'Uncalibrated' }),
		icon: <NotCalibrated />,
	},
	empty: {
		label: formatMessage({ id: 'drawings.calibration.empty', defaultMessage: 'Empty' }),
		icon: <NotCalibrated />,
	},
};
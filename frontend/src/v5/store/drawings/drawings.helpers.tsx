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
import { Display } from '@/v5/ui/themes/media';
import { CalibrationStates, DrawingStats, IDrawing, MinimumDrawing } from './drawings.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';

export const DRAWING_LIST_COLUMN_WIDTHS = {
	name: {
		minWidth: 90,
	},
	total: {
		width: 165,
		hideWhenSmallerThan: Display.Desktop,
	},
	calibration: {
		width: 165,
		hideWhenSmallerThan: Display.Tablet,
	},
	drawingNumber: {
		width: 190,
	},
	category: {
		width: 120,
		hideWhenSmallerThan: Display.Desktop,
	},
	lastUpdated: {
		width: 135,
	},
	actions: {
		width: 72,
	},
};

export const DRAWINGS_SEARCH_FIELDS = ['name', 'latestRevision', 'category', 'drawingNumber', 'status'];

export const CALIBRATION_MAP = {
	[CalibrationStates.CALIBRATED]: {
		label: formatMessage({ id: 'drawings.calibration.calibrated', defaultMessage: 'Calibrated' }),
		icon: <CalibratedIcon />,
	},
	[CalibrationStates.OUT_OF_SYNC]: {
		label: formatMessage({ id: 'drawings.calibration.outOfSync', defaultMessage: 'Calibrated' }),
		icon: <WarningIcon />,
	},
	[CalibrationStates.UNCALIBRATED]: {
		label: formatMessage({ id: 'drawings.calibration.uncalibrated', defaultMessage: 'Uncalibrated' }),
		icon: <NotCalibrated />,
	},
	[CalibrationStates.EMPTY]: {
		label: formatMessage({ id: 'drawings.calibration.empty', defaultMessage: 'Empty' }),
		icon: <NotCalibrated />,
	},
};

export const prepareSingleDrawingData = (
	Drawing: MinimumDrawing,
	stats?: DrawingStats,
): IDrawing => ({
	...Drawing,
	total: stats?.revisions.total ?? 0,
	lastUpdated: getNullableDate(stats?.revisions.lastUpdated),
	latestRevision: stats?.revisions.latestRevision ?? '',
	category: stats?.revisions.category ?? '',
	drawingNumber: stats?.revisions.drawingNumber ?? '',
	status: stats?.revisions.status ?? '',
	hasStatsPending: !stats,
	errorReason: stats?.revisions.errorReason && {
		message: stats.revisions.errorReason.message,
		timestamp: getNullableDate(stats?.revisions.errorReason.timestamp),
	},
});

export const prepareDrawingsData = (
	drawings: Array<MinimumDrawing>,
	stats?: DrawingStats[],
) => drawings.map<IDrawing>((Drawing, index) => {
	const drawingStats = stats?.[index];
	return prepareSingleDrawingData(Drawing, drawingStats);
});

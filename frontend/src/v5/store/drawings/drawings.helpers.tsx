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
import WarningIcon from '@assets/icons/outlined/stepper_error-outlined.svg';
import CalibratedIcon from '@assets/icons/filled/calibration-filled.svg';
import NotCalibrated from '@assets/icons/filled/no_calibration-filled.svg';
import { Display } from '@/v5/ui/themes/media';
import { CalibrationStatus, DrawingStats, IDrawing, MinimumDrawing } from './drawings.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { getUrl } from '@/v5/services/api/default';
import { selectActiveRevisions, selectLatestRevisionName, selectRevisionsPending } from './revisions/drawingRevisions.selectors';
import { Role } from '../currentUser/currentUser.types';
import { getState } from '@/v5/helpers/redux.helpers';
import { UploadStatus } from '../containers/containers.types';
import { EMPTY_CALIBRATION } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';

export const DRAWING_LIST_COLUMN_WIDTHS = {
	name: {
		// width: 234,
		minWidth: 90,
	},
	revisionsCount: {
		width: 155,
		hideWhenSmallerThan: Display.Desktop,
	},
	calibrationStatus: {
		width: 155,
		hideWhenSmallerThan: Display.Tablet,
	},
	number: {
		width: 260,
	},
	type: {
		width: 120,
		hideWhenSmallerThan: Display.Desktop,
	},
	lastUpdated: {
		width: 120,
	},
	actions: {
		width: 84,
	},
};

export const DRAWINGS_SEARCH_FIELDS = ['name', 'latestRevision', 'type', 'number', 'status'];

export const CALIBRATION_MAP = {
	[CalibrationStatus.CALIBRATED]: {
		label: formatMessage({ id: 'drawings.calibration.calibrated', defaultMessage: 'Calibrated' }),
		icon: <CalibratedIcon />,
	},
	[CalibrationStatus.UNCONFIRMED]: {
		label: formatMessage({ id: 'drawings.calibration.outOfSync', defaultMessage: 'Calibrated' }),
		icon: <WarningIcon />,
	},
	[CalibrationStatus.UNCALIBRATED]: {
		label: formatMessage({ id: 'drawings.calibration.uncalibrated', defaultMessage: 'Uncalibrated' }),
		icon: <NotCalibrated />,
	},
	[CalibrationStatus.EMPTY]: {
		label: formatMessage({ id: 'drawings.calibration.empty', defaultMessage: 'Empty' }),
		icon: <NotCalibrated />,
	},
};

export const canUploadToBackend = (status?: UploadStatus): boolean => {
	const statusesForUpload = [
		UploadStatus.OK,
		UploadStatus.FAILED,
	];

	return statusesForUpload.includes(status);
};

export const statsToDrawing = (
	stats?: DrawingStats,
): Partial<IDrawing> => ({
	...stats,
	revisionsCount: stats?.revisions?.total ?? 0,
	lastUpdated: getNullableDate(stats?.revisions.lastUpdated),
	latestRevision: stats?.revisions.latestRevision ?? '',
	number: stats?.number ?? '',
	type: stats?.type ?? '',
	desc: stats?.desc ?? '',
	calibrationStatus: stats?.calibrationStatus ?? CalibrationStatus.EMPTY,
	status: stats?.status ?? UploadStatus.OK,
	hasStatsPending: !stats,
	errorReason: stats?.errorReason && {
		message: stats.errorReason.message,
		timestamp: getNullableDate(+stats?.errorReason.timestamp),
	},
});

export const getDrawingThumbnailSrc = (teamspace, projectId, drawingId) => getUrl(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/thumbnail`);

export const fullDrawing = (
	drawing: Partial<IDrawing> &  MinimumDrawing,
): IDrawing => {
	const state = getState();
	const isPendingRevisions = selectRevisionsPending(state, drawing._id);
	const activeRevisions = selectActiveRevisions(state, drawing._id);
	const latestRevision = isPendingRevisions ? drawing.latestRevision : selectLatestRevisionName(state, drawing._id);
	const revisionsCount = (isPendingRevisions ? drawing.revisionsCount : activeRevisions.length) ?? 0;
	const calibrationStatus = revisionsCount > 0 ? drawing.calibrationStatus : CalibrationStatus.EMPTY;
	const lastUpdated = isPendingRevisions ? drawing.lastUpdated :  (activeRevisions[0] || {}).timestamp;
	const status = drawing.status ?? UploadStatus.OK;
	const isFavourite = drawing.isFavourite ?? false;
	const role = drawing.role ?? Role.ADMIN;
	const calibration = { ...EMPTY_CALIBRATION, ...drawing.calibration };

	return {
		...drawing,
		status,
		isFavourite,
		role,
		latestRevision,
		revisionsCount,
		calibrationStatus,
		calibration,
		lastUpdated: getNullableDate(lastUpdated), 
	};
};

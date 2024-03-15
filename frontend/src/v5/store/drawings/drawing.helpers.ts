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

import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { DrawingStats, DrawingUploadStatus, IDrawing, MinimumDrawing } from './drawings.types';

export const DRAWINGS_SEARCH_FIELDS = ['code', 'type', 'name', 'desc', 'latestRevision'];

export const canUploadToBackend = (status?: DrawingUploadStatus): boolean => {
	const statusesForUpload = [
		DrawingUploadStatus.OK,
		DrawingUploadStatus.FAILED,
	];

	return statusesForUpload.includes(status);
};

export const prepareSingleDrawingData = (
	drawing: MinimumDrawing,
	stats?: DrawingStats,
): IDrawing => ({
	...drawing,
	revisionsCount: stats?.revisions.total ?? 0,
	lastUpdated: getNullableDate(stats?.revisions.lastUpdated),
	latestRevision: stats?.revisions.latestRevision ?? '',
	status: stats?.status ?? DrawingUploadStatus.OK,
	hasStatsPending: !stats,
	errorReason: stats?.errorReason && {
		message: stats.errorReason.message,
		timestamp: getNullableDate(stats?.errorReason.timestamp),
	},
});

export const prepareDrawingsData = (
	drawings: Array<MinimumDrawing>,
	stats?: DrawingStats[],
) => drawings.map<IDrawing>((drawing, index) => {
	const drawingStats = stats?.[index];
	return prepareSingleDrawingData(drawing, drawingStats);
});

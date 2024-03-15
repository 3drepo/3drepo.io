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

// TODO: Unfinished interface
export interface IDrawing {
	_id: string;
	name: string;
	desc?: string;
	drawingNumber: string;
	category: string;
	status: DrawingUploadStatus;
	revisionsCount: number;
	role: any;
	latestRevision: string;
	lastUpdated: Date;
	isFavourite: boolean;
	hasStatsPending: boolean;
	errorReason?: {
		message: string;
		timestamp: Date | null;
	};
}

export type MinimumDrawing = Pick<IDrawing, '_id' | 'name' | 'drawingNumber' | 'category' | 'role' | 'isFavourite'>;

// TODO: Unfinished interface
export interface DrawingStats {
	_id: string;
	revisions : {
		total: number;
		lastUpdated?: number;
		latestRevision?: string;
	};
	type: string;
	errorReason?: {
		message: string;
		timestamp: number;
	};
	status: DrawingUploadStatus;
}

export enum DrawingUploadStatus {
	OK = 'ok',
	FAILED = 'failed',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded',
	QUEUED = 'queued',
	PROCESSING = 'processing',
}

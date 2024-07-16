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

export interface StatusCode {
	code: string,
	description: string,
}

export interface IDrawingRevision {
	_id: string;
	name: string;
	timestamp: Date;
	author: string;
	desc?: string;
	format: string;
	statusCode?: string;
	revisionCode: string;
	void?: boolean;
}

export interface IDrawingRevisionUploadStatus {
	isComplete: boolean;
	errorMessage?: string;
	progress: number;
}

export type CreateDrawingRevisionBody = {
	name: string;
	description?: string;
	file: File;
	statusCode: string;
	revisionCode: string;

	drawingId?: string;
	drawingName: string;
	drawingNumber: string;
	drawingType: string;
	drawingDesc?: string;
};

export type CreateDrawingRevisionPayload = {
	teamspace: string;
	projectId: string;
	uploadId: string;
	body: CreateDrawingRevisionBody;
};

export type IRevisionUpdate = Partial<IDrawingRevision> & {
	_id: string;
};

export type UploadItemFields = CreateDrawingRevisionBody & {
	file: File,
	uploadId: string;
	progress: number;
	extension: string;
};

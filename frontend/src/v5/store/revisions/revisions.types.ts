/**
 *  Copyright (C) 2021 3D Repo Ltd
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

export interface IRevision {
	_id: string;
	timestamp: Date;
	tag: string;
	author: string;
	desc: string;
	void?: boolean;
}

export interface IUploadStatus {
	isComplete: boolean;
	errorMessage: string;
	progress: number;
}

export type FetchRevisionsPayload = {
	teamspace: string;
	projectId: string;
	containerId: string;
};

export type RevisionVoidStatusPayload = {
	teamspace?: string;
	projectId: string;
	containerId: string;
	revisionId: string;
	isVoid: boolean;
};

export type CreateRevisionBody = {
	revisionTag: string;
	revisionDesc?: string;
	file: File;
	importAnimations?: boolean;
	timezone?: string;

	containerId?: string;
	containerName: string;
	containerType: string;
	containerUnit: string;
	containerDesc?: string;
	containerCode?: string;
};

export type CreateRevisionPayload = {
	teamspace: string;
	projectId: string;
	uploadId: string;
	body: CreateRevisionBody;
};

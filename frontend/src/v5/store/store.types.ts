/**
 *  Copyright (C) 2022 3D Repo Ltd
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

export type TeamspaceId = { teamspace: string };
export type ProjectId = { projectId: string };
export type ContainerId = { containerId: string };
export type FederationId = { federationId: string };
export type ModelId = { modelId: string };
export type TicketId = { ticketId: string };
export type DrawingId = { drawingId: string };


export type OnSuccess = { onSuccess: () => void };
export type OnError = { onError: (error) => void };

export type TeamspaceAndProjectId = TeamspaceId & ProjectId;

export type TeamspaceProjectAndContainerId = TeamspaceId & ProjectId & ContainerId;

export type TeamspaceProjectAndFederationId = TeamspaceId & ProjectId & FederationId;

export type ProjectAndContainerId = ProjectId & ContainerId;

export type ProjectAndFederationId = ProjectId & FederationId;

export type SuccessAndErrorCallbacks = OnSuccess & OnError;

export type TeamspaceProjectAndModel = TeamspaceId & ProjectId & ModelId;

export type ProjectAndDrawingId = ProjectId & DrawingId;

export type TeamspaceProjectAndDrawingId  = TeamspaceId & ProjectAndDrawingId;

export type SurveyPoint = {
	latLong: [number, number];
	position: [number, number, number];
};

export type View = {
	_id: string;
	name: string;
	hasThumbnail: boolean;
};

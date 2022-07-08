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

import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '@/v5/helpers/actions.helper';
import { Action } from 'redux';
import { TeamspaceProjectAndContainerId, ContainerId } from '../store.types';
import { IRevision, IRevisionUpdate, IUploadStatus } from './revisions.types';

export const { Types: RevisionsTypes, Creators: RevisionsActions } = createActions({
	setVoidStatus: ['teamspace', 'projectId', 'containerId', 'revisionId', 'isVoid'],
	setVoidStatusSuccess: ['containerId', 'revisionId', 'isVoid'],
	fetch: ['teamspace', 'projectId', 'containerId'],
	fetchSuccess: ['containerId', 'revisions'],
	setIsPending: ['containerId', 'isPending'],
	createRevision: ['teamspace', 'projectId', 'uploadId', 'body'],
	setUploadComplete: ['uploadId', 'isComplete', 'errorMessage'],
	setUploadProgress: ['uploadId', 'progress'],
	fetchRevisionStatsSuccess: ['containerId', 'data'],
}, { prefix: 'REVISIONS/' }) as { Types: Constants<IRevisionsActionCreators>; Creators: IRevisionsActionCreators };

export const INITIAL_STATE: IRevisionsState = {
	revisionsByContainer: {},
	isPending: {},
	revisionsUploadStatus: {},
};

export const setVoidStatusSuccess = (state = INITIAL_STATE, {
	containerId,
	revisionId,
	isVoid,
}): IRevisionsState => ({
	...state,
	revisionsByContainer: {
		...state.revisionsByContainer,
		[containerId]: state.revisionsByContainer[containerId].map((revision) => ({
			...revision,
			void: [revision.tag, revision._id].includes(revisionId) ? isVoid : revision.void,
		})),
	},
});

export const fetchSuccess = (state = INITIAL_STATE, {
	containerId,
	revisions,
}): IRevisionsState => ({
	...state,
	revisionsByContainer: {
		...state.revisionsByContainer,
		[containerId]: revisions,
	},
});

export const fetchRevisionStatsSuccess = (state = INITIAL_STATE, {
	containerId,
	data,
}): IRevisionsState => ({
	...state,
	revisionsByContainer: {
		...state.revisionsByContainer,
		[containerId]: [
			...state.revisionsByContainer[containerId].map((revision) => {
				if (revision._id === data._id) return { ...revision, ...data };
				return revision;
			}),
		],
	},
});

export const setIsPending = (state = INITIAL_STATE, { isPending, containerId }): IRevisionsState => ({
	...state,
	isPending: {
		...state.isPending,
		[containerId]: isPending,
	},
});

export const setUploadComplete = (state = INITIAL_STATE, {
	uploadId,
	isComplete,
	errorMessage,
}): IRevisionsState => ({
	...state,
	revisionsUploadStatus: {
		...state.revisionsUploadStatus,
		[uploadId]: {
			...state.revisionsUploadStatus[uploadId],
			isComplete,
			errorMessage,
		},
	},
});

export const setUploadProgress = (state = INITIAL_STATE, { uploadId, progress }): IRevisionsState => ({
	...state,
	revisionsUploadStatus: {
		...state.revisionsUploadStatus,
		[uploadId]: {
			...state.revisionsUploadStatus[uploadId],
			progress,
		},
	},
});

export const revisionsReducer = createReducer<IRevisionsState>(INITIAL_STATE, {
	[RevisionsTypes.FETCH_SUCCESS]: fetchSuccess,
	[RevisionsTypes.SET_IS_PENDING]: setIsPending,
	[RevisionsTypes.SET_VOID_STATUS_SUCCESS]: setVoidStatusSuccess,
	[RevisionsTypes.SET_UPLOAD_COMPLETE]: setUploadComplete,
	[RevisionsTypes.SET_UPLOAD_PROGRESS]: setUploadProgress,
	[RevisionsTypes.FETCH_REVISION_STATS_SUCCESS]: fetchRevisionStatsSuccess,
});

/**
 * Types
 */
export interface IRevisionsState {
	revisionsByContainer: Record<string, IRevision[]>;
	isPending: Record<string, boolean>;
	revisionsUploadStatus: Record<string, IUploadStatus>;
}

type VoidParams = TeamspaceProjectAndContainerId & {revisionId: string, isVoid: boolean};

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

export type SetRevisionVoidStatusAction = Action<'SET_REVISION_VOID_STATUS'> & VoidParams;
export type SetRevisionVoidStatusSuccessAction = Action<'SET_REVISION_VOID_STATUS_SUCCESS'> & VoidParams;
export type FetchAction = Action<'FETCH'> & TeamspaceProjectAndContainerId;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & ContainerId & { revisions: IRevision[] };
export type SetIsPendingAction = Action<'SET_IS_PENDING'> & ContainerId & { isPending: boolean };
export type CreateRevisionAction = Action<'CREATE_REVISION'> & CreateRevisionPayload;
export type SetUploadCompleteAction = Action<'SET_UPLOAD_COMPLETE'> & { containerId: string, isComplete: boolean, errorMessage?: string };
export type SetUploadProgressAction = Action<'SET_UPLOAD_PROGRESS'> & { containerId: string, progress: number };
export type FetchRevisionStatsSuccessAction = Action<'FETCH_REVISION_STATS_SUCCESS'> & { containerId: string, data: IRevisionUpdate };
export interface IRevisionsActionCreators {
	setVoidStatus: (teamspace: string, projectId: string, containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusAction;
	setVoidStatusSuccess: (containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusSuccessAction;
	fetch: (teamspace: string, projectId: string, containerId: string) => FetchAction;
	fetchSuccess: (containerId: string, revisions: IRevision[]) => FetchSuccessAction;
	setIsPending: (containerId: string, isPending: boolean) => SetIsPendingAction;
	createRevision: (teamspace: string,
		projectId: string,
		uploadId: string,
		body: CreateRevisionBody,
	) => CreateRevisionAction;
	setUploadComplete: (containerId: string, isComplete: boolean, errorMessage?: string) => SetUploadCompleteAction;
	setUploadProgress: (containerId: string, progress: number) => SetUploadProgressAction;
	fetchRevisionStatsSuccess: (containerId: string, data: IRevisionUpdate) => FetchRevisionStatsSuccessAction;
}

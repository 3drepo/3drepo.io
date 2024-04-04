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
import { Action } from 'redux';
import { Constants } from '@/v5/helpers/actions.helper';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { TeamspaceProjectAndContainerId, ContainerId, OnSuccess } from '../../store.types';
import { CreateContainerRevisionBody, CreateContainerRevisionPayload, IContainerRevision, IContainerRevisionUpdate, IUploadStatus } from './containerRevisions.types';

export const { Types: ContainerRevisionsTypes, Creators: ContainerRevisionsActions } = createActions({
	setVoidStatus: ['teamspace', 'projectId', 'containerId', 'revisionId', 'isVoid'],
	setVoidStatusSuccess: ['containerId', 'revisionId', 'isVoid'],
	fetch: ['teamspace', 'projectId', 'containerId', 'onSuccess'],
	fetchSuccess: ['containerId', 'revisions'],
	setIsPending: ['containerId', 'isPending'],
	createRevision: ['teamspace', 'projectId', 'uploadId', 'body'],
	setUploadComplete: ['uploadId', 'isComplete', 'errorMessage'],
	setUploadProgress: ['uploadId', 'progress'],
	updateRevisionSuccess: ['containerId', 'data'],
	revisionProcessingSuccess: ['containerId', 'revision'],
}, { prefix: 'CONTAINER_REVISIONS/' }) as { Types: Constants<IContainerRevisionsActionCreators>; Creators: IContainerRevisionsActionCreators };

export const INITIAL_STATE: IContainerRevisionsState = {
	revisionsByContainer: {},
	isPending: {},
	revisionsUploadStatus: {},
};

export const setVoidStatusSuccess = (state, {
	containerId,
	revisionId,
	isVoid,
}: SetRevisionVoidStatusSuccessAction) => {
	const revisions = state.revisionsByContainer[containerId];
	revisions.find(
		(revision) => [revision.tag, revision._id].includes(revisionId),
	).void = isVoid;
};

export const fetchSuccess = (state, {
	containerId,
	revisions,
}: FetchSuccessAction) => {
	state.revisionsByContainer[containerId] = revisions;
};

export const updateRevisionSuccess = (state, {
	containerId,
	data,
}: UpdateRevisionSuccessAction) => {
	const revisions = state.revisionsByContainer[containerId];
	const index = revisions.findIndex(({ _id }) => _id === data._id);
	revisions[index] = { ...revisions[index], ...data };
};

export const setIsPending = (state, { isPending, containerId }: SetIsPendingAction) => {
	state.isPending[containerId] = isPending;
};

export const setUploadComplete = (state, {
	uploadId,
	isComplete,
	errorMessage,
}: SetUploadCompleteAction) => {
	const uploads = state.revisionsUploadStatus;
	uploads[uploadId] = { ...uploads[uploadId], isComplete, errorMessage };
};

export const setUploadProgress = (state, { uploadId, progress }: SetUploadProgressAction) => {
	state.revisionsUploadStatus[uploadId].progress = progress;
};

export const revisionProcessingSuccess = (state, {
	containerId,
	revision,
}: RevisionProcessingSuccessAction) => {
	const revisions = state.revisionsByContainer;
	revisions[containerId] ||= [];
	revisions[containerId].push(revision);
};

export const containerRevisionsReducer = createReducer<IContainerRevisionsState>(INITIAL_STATE, produceAll({
	[ContainerRevisionsTypes.FETCH_SUCCESS]: fetchSuccess,
	[ContainerRevisionsTypes.SET_IS_PENDING]: setIsPending,
	[ContainerRevisionsTypes.SET_VOID_STATUS_SUCCESS]: setVoidStatusSuccess,
	[ContainerRevisionsTypes.SET_UPLOAD_COMPLETE]: setUploadComplete,
	[ContainerRevisionsTypes.SET_UPLOAD_PROGRESS]: setUploadProgress,
	[ContainerRevisionsTypes.UPDATE_REVISION_SUCCESS]: updateRevisionSuccess,
	[ContainerRevisionsTypes.REVISION_PROCESSING_SUCCESS]: revisionProcessingSuccess,
}));

/**
 * Types
 */
export interface IContainerRevisionsState {
	revisionsByContainer: Record<string, IContainerRevision[]>;
	isPending: Record<string, boolean>;
	revisionsUploadStatus: Record<string, IUploadStatus>;
}

type VoidParams = TeamspaceProjectAndContainerId & { revisionId: string, isVoid: boolean };

export type SetRevisionVoidStatusAction = Action<'SET_REVISION_VOID_STATUS'> & VoidParams;
export type SetRevisionVoidStatusSuccessAction = Action<'SET_REVISION_VOID_STATUS_SUCCESS'> & VoidParams;
export type FetchAction = Action<'FETCH'> & TeamspaceProjectAndContainerId & OnSuccess;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & ContainerId & { revisions: IContainerRevision[] };
export type SetIsPendingAction = Action<'SET_IS_PENDING'> & ContainerId & { isPending: boolean };
export type CreateRevisionAction = Action<'CREATE_REVISION'> & CreateContainerRevisionPayload;
export type SetUploadCompleteAction = Action<'SET_UPLOAD_COMPLETE'> & { uploadId: string, isComplete: boolean, errorMessage?: string };
export type SetUploadProgressAction = Action<'SET_UPLOAD_PROGRESS'> & { uploadId: string, progress: number };
export type UpdateRevisionSuccessAction = Action<'FETCH_REVISION_STATS_SUCCESS'> & ContainerId & { data: IContainerRevisionUpdate };
export type RevisionProcessingSuccessAction = Action<'REVISION_PROCESSING_SUCCESS'> & ContainerId & { revision: IContainerRevision };

export interface IContainerRevisionsActionCreators {
	setVoidStatus: (teamspace: string, projectId: string, containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusAction;
	setVoidStatusSuccess: (containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusSuccessAction;
	fetch: (teamspace: string, projectId: string, containerId: string, onSuccess?: OnSuccess ) => FetchAction;
	fetchSuccess: (containerId: string, revisions: IContainerRevision[]) => FetchSuccessAction;
	setIsPending: (containerId: string, isPending: boolean) => SetIsPendingAction;
	createRevision: (teamspace: string,
		projectId: string,
		uploadId: string,
		body: CreateContainerRevisionBody,
	) => CreateRevisionAction;
	setUploadComplete: (uploadId: string, isComplete: boolean, errorMessage?: string) => SetUploadCompleteAction;
	setUploadProgress: (uploadId: string, progress: number) => SetUploadProgressAction;
	updateRevisionSuccess: (containerId: string, data: IContainerRevisionUpdate) => UpdateRevisionSuccessAction;
	revisionProcessingSuccess: (containerId: string, revision: IContainerRevision) => RevisionProcessingSuccessAction;
}

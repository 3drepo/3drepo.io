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

import { createActions, createReducer } from 'reduxsauce';
import { Action } from 'redux';
import { Constants } from '@/v5/helpers/actions.helper';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { TeamspaceProjectAndDrawingId, DrawingId, OnSuccess } from '../store.types';
import { CreateDrawingRevisionBody, CreateDrawingRevisionPayload, IDrawingRevision, IRevisionUpdate, IDrawingRevisionUploadStatus } from './drawingRevisions.types';

export const { Types: DrawingRevisionsTypes, Creators: DrawingRevisionsActions } = createActions({
	setVoidStatus: ['teamspace', 'projectId', 'drawingId', 'revisionId', 'isVoid'],
	setVoidStatusSuccess: ['drawingId', 'revisionId', 'isVoid'],
	fetch: ['teamspace', 'projectId', 'drawingId', 'onSuccess'],
	fetchSuccess: ['drawingId', 'revisions'],
	setIsPending: ['drawingId', 'isPending'],
	createRevision: ['teamspace', 'projectId', 'uploadId', 'body'],
	setUploadComplete: ['uploadId', 'isComplete', 'errorMessage'],
	setUploadProgress: ['uploadId', 'progress'],
	updateRevisionSuccess: ['drawingId', 'data'],
	revisionProcessingSuccess: ['drawingId', 'revision'],
}, { prefix: 'DRAWING_REVISIONS/' }) as { Types: Constants<IDrawingRevisionsActionCreators>; Creators: IDrawingRevisionsActionCreators };

export interface IDrawingRevisionsState {
	revisionsByDrawing: Record<string, IDrawingRevision[]>;
	isPending: Record<string, boolean>;
	revisionsUploadStatus: Record<string, IDrawingRevisionUploadStatus>;
}

export const INITIAL_STATE: IDrawingRevisionsState = {
	revisionsByDrawing: {},
	isPending: {},
	revisionsUploadStatus: {},
};

export const setVoidStatusSuccess = (state, {
	drawingId,
	revisionId,
	isVoid,
}: SetRevisionVoidStatusSuccessAction) => {
	const revisions = state.revisionsByDrawing[drawingId];
	revisions.find(
		(revision) => [revision.tag, revision._id].includes(revisionId),
	).void = isVoid;
};

export const fetchSuccess = (state, {
	drawingId,
	revisions,
}: FetchSuccessAction) => {
	state.revisionsByDrawing[drawingId] = revisions;
};

export const updateRevisionSuccess = (state, {
	drawingId,
	data,
}: UpdateRevisionSuccessAction) => {
	const revisions = state.revisionsByDrawing[drawingId];
	const index = revisions.findIndex(({ _id }) => _id === data._id);
	revisions[index] = { ...revisions[index], ...data };
};

export const setIsPending = (state, { isPending, drawingId }: SetIsPendingAction) => {
	state.isPending[drawingId] = isPending;
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
	drawingId,
	revision,
}: RevisionProcessingSuccessAction) => {
	const revisions = state.revisionsByDrawing;
	revisions[drawingId] ||= [];
	revisions[drawingId].push(revision);
};

export const drawingRevisionsReducer = createReducer<IDrawingRevisionsState>(INITIAL_STATE, produceAll({
	[DrawingRevisionsTypes.FETCH_SUCCESS]: fetchSuccess,
	[DrawingRevisionsTypes.SET_IS_PENDING]: setIsPending,
	[DrawingRevisionsTypes.SET_VOID_STATUS_SUCCESS]: setVoidStatusSuccess,
	[DrawingRevisionsTypes.SET_UPLOAD_COMPLETE]: setUploadComplete,
	[DrawingRevisionsTypes.SET_UPLOAD_PROGRESS]: setUploadProgress,
	[DrawingRevisionsTypes.UPDATE_REVISION_SUCCESS]: updateRevisionSuccess,
	[DrawingRevisionsTypes.REVISION_PROCESSING_SUCCESS]: revisionProcessingSuccess,
}));

type VoidParams = TeamspaceProjectAndDrawingId & { revisionId: string, isVoid: boolean };

export type SetRevisionVoidStatusAction = Action<'SET_REVISION_VOID_STATUS'> & VoidParams;
export type SetRevisionVoidStatusSuccessAction = Action<'SET_REVISION_VOID_STATUS_SUCCESS'> & VoidParams;
export type FetchAction = Action<'FETCH'> & TeamspaceProjectAndDrawingId & OnSuccess;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & DrawingId & { revisions: IDrawingRevision[] };
export type SetIsPendingAction = Action<'SET_IS_PENDING'> & DrawingId & { isPending: boolean };
export type CreateRevisionAction = Action<'CREATE_REVISION'> & CreateDrawingRevisionPayload;
export type SetUploadCompleteAction = Action<'SET_UPLOAD_COMPLETE'> & { uploadId: string, isComplete: boolean, errorMessage?: string };
export type SetUploadProgressAction = Action<'SET_UPLOAD_PROGRESS'> & { uploadId: string, progress: number };
export type UpdateRevisionSuccessAction = Action<'FETCH_REVISION_STATS_SUCCESS'> & DrawingId & { data: IRevisionUpdate };
export type RevisionProcessingSuccessAction = Action<'REVISION_PROCESSING_SUCCESS'> & DrawingId & { revision: IDrawingRevision };

export interface IDrawingRevisionsActionCreators {
	setVoidStatus: (teamspace: string, projectId: string, drawingId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusAction;
	setVoidStatusSuccess: (drawingId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusSuccessAction;
	fetch: (teamspace: string, projectId: string, drawingId: string, onSuccess?: () => void ) => FetchAction;
	fetchSuccess: (drawingId: string, revisions: IDrawingRevision[]) => FetchSuccessAction;
	setIsPending: (drawingId: string, isPending: boolean) => SetIsPendingAction;
	createRevision: (teamspace: string,
		projectId: string,
		uploadId: string,
		body: CreateDrawingRevisionBody,
	) => CreateRevisionAction;
	setUploadComplete: (uploadId: string, isComplete: boolean, errorMessage?: string) => SetUploadCompleteAction;
	setUploadProgress: (uploadId: string, progress: number) => SetUploadProgressAction;
	updateRevisionSuccess: (drawingId: string, data: IRevisionUpdate) => UpdateRevisionSuccessAction;
	revisionProcessingSuccess: (drawingId: string, revision: IDrawingRevision) => RevisionProcessingSuccessAction;
}

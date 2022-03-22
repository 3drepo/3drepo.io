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
import { IRevisionsActionCreators, IRevisionsState } from '@/v5/store/revisions/revisions.types';

export const { Types: RevisionsTypes, Creators: RevisionsActions } = createActions({
	setVoidStatus: ['teamspace', 'projectId', 'containerId', 'revisionId', 'isVoid'],
	setVoidStatusSuccess: ['containerId', 'revisionId', 'isVoid'],
	fetch: ['teamspace', 'projectId', 'containerId'],
	fetchSuccess: ['containerId', 'revisions'],
	setIsPending: ['containerId', 'isPending'],
	createRevision: ['teamspace', 'projectId', 'body'],
	setUploadComplete: ['containerId', 'isComplete', 'errorMessage'],
	setUploadProgress: ['containerId', 'progress'],
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

export const setIsPending = (state = INITIAL_STATE, { isPending, containerId }): IRevisionsState => ({
	...state,
	isPending: {
		...state.isPending,
		[containerId]: isPending,
	},
});

export const setUploadComplete = (state = INITIAL_STATE, {
	containerId,
	isComplete,
	errorMessage,
}): IRevisionsState => ({
	...state,
	revisionsUploadStatus: {
		...state.revisionsUploadStatus,
		[containerId]: {
			...state.revisionsUploadStatus[containerId],
			isComplete,
			errorMessage,
		},
	},
});

export const setUploadProgress = (state = INITIAL_STATE, { containerId, progress }): IRevisionsState => ({
	...state,
	revisionsUploadStatus: {
		...state.revisionsUploadStatus,
		[containerId]: {
			...state.revisionsUploadStatus[containerId],
			progress,
		},
	},
});

export const reducer = createReducer<IRevisionsState>(INITIAL_STATE, {
	[RevisionsTypes.FETCH_SUCCESS]: fetchSuccess,
	[RevisionsTypes.SET_IS_PENDING]: setIsPending,
	[RevisionsTypes.SET_VOID_STATUS_SUCCESS]: setVoidStatusSuccess,
	[RevisionsTypes.SET_UPLOAD_COMPLETE]: setUploadComplete,
	[RevisionsTypes.SET_UPLOAD_PROGRESS]: setUploadProgress,
});

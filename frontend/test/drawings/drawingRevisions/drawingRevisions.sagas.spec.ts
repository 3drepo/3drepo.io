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

import { mockServer } from '../../../internals/testing/mockServer';
import { DrawingRevisionsActions } from '@/v5/store/drawings/revisions/drawingRevisions.redux';
import api from '@/v5/services/api/default';
import { DrawingsActions } from '@/v5/store/drawings/drawings.redux';
import { drawingRevisionsMockFactory, mockCreateRevisionBody } from './drawingRevisions.fixtures';
import { createTestStore, spyOnAxiosApiCallWithFile, WaitActionCallback, WaitForActions } from '../../test.helpers';
import { selectRevisions, selectUploads } from '@/v5/store/drawings/revisions/drawingRevisions.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { drawingMockFactory } from '../drawings.fixtures';
import { selectDrawingById } from '@/v5/store/drawings/drawings.selectors';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { UploadStatus } from '@/v5/store/containers/containers.types';

describe('Drawing Revisions: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const drawingId = 'drawingId';
	const revisionId = 'revisionId';
	// Nock.js serialises the data sent and so converts "timestamp" (which should be a Date) to a string.
	// This breaks the tests as a Date is being compared against a string. This is to fix it
	const mockRevision = drawingRevisionsMockFactory({ _id: revisionId, timestamp: null });
	const mockDrawing = drawingMockFactory({ _id: drawingId });
	let dispatch, getState, waitForActions: WaitForActions;
	let onSuccess, onError;

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
		onSuccess = jest.fn();
		onError = jest.fn();
	});

	const statusIs = (drawingId, status): WaitActionCallback =>
		(state) => selectDrawingById(state, drawingId).status === status;

	describe('fetch', () => {
		it('should fetch revisions', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions?showVoid=true`)
				.reply(200, { revisions: [mockRevision] });

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.fetch(teamspace, projectId, drawingId, onSuccess))
			}, [
				DrawingRevisionsActions.setIsPending(drawingId, true),
				DrawingRevisionsActions.fetchSuccess(drawingId, [mockRevision]),
				DrawingRevisionsActions.setIsPending(drawingId, false),
			]);

			expect(onSuccess).toHaveBeenCalled();
		});

		it('should handle revisions api error', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions?showVoid=true`)
				.reply(404);

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.fetch(teamspace, projectId, drawingId, onSuccess))
			}, [
				DrawingRevisionsActions.setIsPending(drawingId, true),
				DrawingRevisionsActions.setIsPending(drawingId, false),
			]);
			
			const revisionsInStore = selectRevisions(getState(), drawingId);
			expect(revisionsInStore).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
		});
	});

	describe('setVoidStatus', () => {
		const initialVoidStatus = false;
		const voidRevision = { ...mockRevision, void: initialVoidStatus };

		beforeEach(() => {
			dispatch(DrawingRevisionsActions.fetchSuccess(drawingId, [voidRevision]));
		});

		it('should set void status to true', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.setVoidStatus(teamspace, projectId, drawingId, revisionId, !initialVoidStatus));
			}, [DrawingRevisionsActions.setVoidStatusSuccess(drawingId, revisionId, !initialVoidStatus)]);
		});

		it('should handle api error', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.setVoidStatus(teamspace, projectId, drawingId, revisionId, !initialVoidStatus));
			}, [DialogsTypes.OPEN]);

			const [revisionInStore] = selectRevisions(getState(), drawingId);
			expect(revisionInStore.void).toBe(initialVoidStatus);
		});
	});

	describe('createRevision', () => {
		const uploadId = 'uploadId';
		const mockBody = mockCreateRevisionBody({ drawingId });
		const { drawingId: unusedId , ...newDrawingMockBody } = mockBody;
		const newDrawing = {
			_id: drawingId + "New",
			name: mockBody.drawingName,
			number: mockBody.drawingNumber,
			type: mockBody.drawingType,
			desc: mockBody.drawingDesc,
		};

		const spy = spyOnAxiosApiCallWithFile(api, 'post');
		beforeEach(() => {
			dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, [mockDrawing]));
		})

		it('should create a revision on an existing drawing', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions`)
				.reply(200, { body: mockBody });

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody));
			}, [
				statusIs(drawingId, UploadStatus.OK), 
				DrawingRevisionsActions.setUploadComplete(uploadId, false),
				statusIs(drawingId, UploadStatus.QUEUED), 
				DrawingRevisionsActions.setUploadComplete(uploadId, true),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			expect(uploadInStore.isComplete).toBeTruthy();
			expect(uploadInStore.errorMessage).toBeFalsy();

			spy.mockClear();
		})

		it('should create a revision on a new drawing', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings`)
				.reply(200, { _id: newDrawing._id })
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${newDrawing._id}/revisions`)
				.reply(200, {body: {}});

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.createRevision(teamspace, projectId, uploadId, newDrawingMockBody))
			}, [
				DrawingsActions.createDrawingSuccess(projectId, newDrawing),
				DrawingRevisionsActions.setUploadComplete(uploadId, false),
				statusIs(newDrawing._id, UploadStatus.QUEUED),
				DrawingRevisionsActions.setUploadComplete(uploadId, true),
			]);
			const uploadInStore = selectUploads(getState())[uploadId];
			const drawingInStore = selectDrawingById(getState(), newDrawing._id);
			expect(drawingInStore).toBeTruthy();
			expect(uploadInStore.isComplete).toBeTruthy();
			expect(uploadInStore.errorMessage).toBeFalsy();

			spy.mockClear();
		})

		it('should 400 on revision creation and prepare an error message', async () => {
			const status = 400;
			const code = 'ERROR_CODE';
			const message = 'Error Message'
			const errorMessage = `${status} - ${code} (${message})`;
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${mockBody.drawingId}/revisions`)
				.reply(400, { status, code, message});

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody))
			}, [
				DrawingRevisionsActions.setUploadComplete(uploadId, false),
				DrawingRevisionsActions.setUploadComplete(uploadId, true, errorMessage),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			expect(uploadInStore.errorMessage).toEqual(errorMessage);

			spy.mockClear();
		})

		it('should 400 on drawing creation and not create revision', async () => {
			const errorMessage = 'Failed to create Drawing';
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings`)
				.reply(400);

			await waitForActions(() => {
				dispatch(DrawingRevisionsActions.createRevision(teamspace, projectId, uploadId, newDrawingMockBody))
			}, [
				DialogsTypes.OPEN,
				DrawingRevisionsActions.setUploadComplete(uploadId, true, errorMessage),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			const drawingInStore = selectDrawingById(getState(), newDrawing._id);
			expect(drawingInStore).toBeFalsy();
			expect(uploadInStore.errorMessage).toEqual(errorMessage);

			spy.mockClear();
		})
	})
})

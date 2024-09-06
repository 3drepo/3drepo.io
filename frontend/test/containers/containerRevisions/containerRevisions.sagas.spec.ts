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

import { mockServer } from '../../../internals/testing/mockServer';
import { ContainerRevisionsActions } from '@/v5/store/containers/revisions/containerRevisions.redux';
import api from '@/v5/services/api/default';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { mockCreateRevisionBody, containerRevisionsMockFactory } from './containerRevisions.fixtures';
import { UploadStatus } from '@/v5/store/containers/containers.types';
import { createTestStore, spyOnAxiosApiCallWithFile } from '../../test.helpers';
import { selectRevisions, selectUploads } from '@/v5/store/containers/revisions/containerRevisions.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { containerMockFactory } from '../containers.fixtures';
import { selectContainerById } from '@/v5/store/containers/containers.selectors';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';

describe('Container Revisions: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';
	const revisionId = 'revisionId';
	// Nock.js serialises the data sent and so converts "timestamp" (which should be a Date) to a string.
	// This breaks the tests as a Date is being compared against a string. This is to fix it
	const mockRevision = containerRevisionsMockFactory({ _id: revisionId, timestamp: null });
	const mockContainer = containerMockFactory({ _id: containerId });
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	});

	describe('fetch', () => {
		it('should fetch revisions', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
				.reply(200, { revisions: [mockRevision] });

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.fetch(teamspace, projectId, containerId))
			}, [
				ContainerRevisionsActions.setIsPending(containerId, true),
				ContainerRevisionsActions.fetchSuccess(containerId, [mockRevision]),
				ContainerRevisionsActions.setIsPending(containerId, false),
			]);
		});

		it('should handle revisions api error', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
				.reply(404);

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.fetch(teamspace, projectId, containerId))
			}, [
				ContainerRevisionsActions.setIsPending(containerId, true),
				ContainerRevisionsActions.setIsPending(containerId, false),
			]);
			
			const revisionsInStore = selectRevisions(getState(), containerId);
			expect(revisionsInStore).toEqual([]);
		});
	});

	describe('setVoidStatus', () => {
		const initialVoidStatus = true;
		const voidRevision = { ...mockRevision, void: initialVoidStatus };

		beforeEach(() => {
			dispatch(ContainerRevisionsActions.fetchSuccess(containerId, [voidRevision]));
		});

		it('should set void status to true', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, !initialVoidStatus));
			}, [ContainerRevisionsActions.setVoidStatusSuccess(containerId, revisionId, !initialVoidStatus)]);
		});

		it('should handle api error', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, !initialVoidStatus));
			}, [DialogsTypes.OPEN]);

			const [revisionInStore] = selectRevisions(getState(), containerId);
			expect(revisionInStore.void).toBe(initialVoidStatus);
		});
	});

	describe('createRevision', () => {
		const uploadId = 'uploadId';
		const mockBody = mockCreateRevisionBody({ containerId });
		const { containerId: unusedId , ...newContainerMockBody } = mockBody;
		const newContainer = {
			_id: containerId + "New",
			name: mockBody.containerName,
			unit: mockBody.containerUnit,
			type: mockBody.containerType,
			code: mockBody.containerCode,
			desc: mockBody.containerDesc,
		};

		const spy = spyOnAxiosApiCallWithFile(api, 'post');
		beforeEach(() => {
			dispatch(ContainersActions.fetchContainersSuccess(projectId, [mockContainer]));
		})

		it('should create a revision on an existing container', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions`)
				.reply(200, { body: mockBody });

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody));
			}, [
				ContainerRevisionsActions.setUploadComplete(uploadId, false),
				ContainersActions.setContainerStatus(projectId, mockBody.containerId, UploadStatus.QUEUED),
				ContainerRevisionsActions.setUploadComplete(uploadId, true),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			expect(uploadInStore.isComplete).toBeTruthy();
			expect(uploadInStore.errorMessage).toBeFalsy();

			spy.mockClear();
		})

		it('should create a revision on a new container', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, { _id: newContainer._id })
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${newContainer._id}/revisions`)
				.reply(200, {body: {}});

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.createRevision(teamspace, projectId, uploadId, newContainerMockBody))
			}, [
				ContainersActions.createContainerSuccess(projectId, newContainer),
				ContainerRevisionsActions.setUploadComplete(uploadId, false),
				ContainersActions.setContainerStatus(projectId, newContainer._id, UploadStatus.QUEUED),
				ContainerRevisionsActions.setUploadComplete(uploadId, true),
			]);
			const uploadInStore = selectUploads(getState())[uploadId];
			const containerInStore = selectContainerById(getState(), newContainer._id);
			expect(containerInStore).toBeTruthy();
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
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${mockBody.containerId}/revisions`)
				.reply(400, { status, code, message});

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody))
			}, [
				ContainerRevisionsActions.setUploadComplete(uploadId, false),
				ContainerRevisionsActions.setUploadComplete(uploadId, true, errorMessage),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			expect(uploadInStore.errorMessage).toEqual(errorMessage);

			spy.mockClear();
		})

		it('should 400 on container creation and not create revision', async () => {
			const errorMessage = 'Failed to create Container';
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(400);

			await waitForActions(() => {
				dispatch(ContainerRevisionsActions.createRevision(teamspace, projectId, uploadId, newContainerMockBody))
			}, [
				DialogsTypes.OPEN,
				ContainerRevisionsActions.setUploadComplete(uploadId, true, errorMessage),
			]);

			const uploadInStore = selectUploads(getState())[uploadId];
			const containerInStore = selectContainerById(getState(), newContainer._id);
			expect(containerInStore).toBeFalsy();
			expect(uploadInStore.errorMessage).toEqual(errorMessage);

			spy.mockClear();
		})
	})
})
